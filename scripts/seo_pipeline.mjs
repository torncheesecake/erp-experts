import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { loadTenantConfig, printTenantError } from "./platform/tenant_config.mjs";

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

const tenantId = getArgValue("--tenant", "erp-experts");
const tenantResult = loadTenantConfig(tenantId);

if (!tenantResult.ok) {
  printTenantError(tenantResult);
  process.exit(1);
}

const tenant = tenantResult.config;
const REPORTS_DIR = path.resolve(tenant.reportOutputPath || "reports");
const HISTORY_DIR = path.join(REPORTS_DIR, "history");
const QA_REPORT = path.join(REPORTS_DIR, "resource-qa-report.json");
const BRIEFS_REPORT = path.join(REPORTS_DIR, "seo-action-briefs.json");
const WEEKLY_REPORT = path.join(REPORTS_DIR, "seo-weekly-summary.json");
const PIPELINE_SUMMARY_REPORT = path.join(REPORTS_DIR, "seo-pipeline-summary.json");

function runStep(label, cmd) {
  console.log(`\n[seo:pipeline] ${label}`);
  execSync(cmd, { stdio: "inherit" });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing expected output: ${filePath}`);
  }
}

function formatSnapshotTimestamp(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}-${hh}${mm}`;
}

function listSnapshotDirs() {
  if (!fs.existsSync(HISTORY_DIR)) return [];
  return fs.readdirSync(HISTORY_DIR)
    .filter((entry) => /^\d{4}-\d{2}-\d{2}-\d{4}$/.test(entry))
    .sort();
}

function gateForSlug(report, slug) {
  const item = (report.articles || []).find((a) => a.slug === slug);
  return item?.gate || null;
}

function scoreForSlug(report, slug) {
  const item = (report.articles || []).find((a) => a.slug === slug);
  return Number.isFinite(item?.score) ? item.score : null;
}

function structuralCount(report) {
  return Array.isArray(report.structuralErrors) ? report.structuralErrors.length : 0;
}

function getBriefCount(report) {
  if (Array.isArray(report.allBriefs)) return report.allBriefs.length;
  return Array.isArray(report.briefs) ? report.briefs.length : 0;
}

function findHighCommercialLowConfidence(briefsReport) {
  const all = Array.isArray(briefsReport.allBriefs) ? briefsReport.allBriefs : (briefsReport.briefs || []);
  return all.filter((b) => (b.estimatedBusinessValue || 0) >= 85 && (b.confidenceLevel || 100) < 60)
    .map((b) => ({
      title: b.preferredTitle || b.targetArticleTitle || b.targetTitle,
      slug: b.targetSlug || null,
      estimatedBusinessValue: b.estimatedBusinessValue,
      confidenceLevel: b.confidenceLevel,
    }));
}

function buildDiff(prevQa, currentQa, prevBriefs, currentBriefs) {
  const prevSummary = prevQa?.gateSummary || { pass: 0, needs_review: 0, blocked: 0 };
  const nowSummary = currentQa?.gateSummary || { pass: 0, needs_review: 0, blocked: 0 };

  const currentSlugs = new Set((currentQa?.articles || []).map((a) => a.slug));
  const prevSlugs = new Set((prevQa?.articles || []).map((a) => a.slug));
  const allSlugs = new Set([...currentSlugs, ...prevSlugs]);

  const newlyPassing = [];
  const newlyFailing = [];
  const largeScoreSwings = [];

  for (const slug of allSlugs) {
    const prevGate = gateForSlug(prevQa || { articles: [] }, slug);
    const nowGate = gateForSlug(currentQa || { articles: [] }, slug);

    if (prevGate && prevGate !== "pass" && nowGate === "pass") newlyPassing.push(slug);
    if (prevGate === "pass" && nowGate && nowGate !== "pass") newlyFailing.push(slug);

    const prevScore = scoreForSlug(prevQa || { articles: [] }, slug);
    const nowScore = scoreForSlug(currentQa || { articles: [] }, slug);
    if (prevScore !== null && nowScore !== null && Math.abs(nowScore - prevScore) >= 15) {
      largeScoreSwings.push({ slug, previousScore: prevScore, currentScore: nowScore, delta: nowScore - prevScore });
    }
  }

  return {
    passChange: (nowSummary.pass || 0) - (prevSummary.pass || 0),
    needsReviewChange: (nowSummary.needs_review || 0) - (prevSummary.needs_review || 0),
    blockedChange: (nowSummary.blocked || 0) - (prevSummary.blocked || 0),
    newlyPassing,
    newlyFailing,
    recommendationCountChange: getBriefCount(currentBriefs) - getBriefCount(prevBriefs),
    largeScoreSwings,
    structuralRegressionCount: Math.max(0, structuralCount(currentQa) - structuralCount(prevQa || { structuralErrors: [] })),
  };
}

function buildReviewFlag(currentQa, currentBriefs, diff) {
  const reasons = [];

  if ((currentQa?.gateSummary?.blocked || 0) > 0) reasons.push("Blocked articles present in current QA run.");
  if ((diff?.largeScoreSwings?.length || 0) >= 5) reasons.push("Large QA score swings detected across multiple articles.");
  if ((diff?.structuralRegressionCount || 0) > 0) reasons.push("Structural regressions increased versus previous snapshot.");

  const highCommercialLowConfidence = findHighCommercialLowConfidence(currentBriefs);
  if (highCommercialLowConfidence.length > 0) reasons.push("High commercial-value briefs found with low confidence scores.");

  return {
    humanReviewRecommended: reasons.length > 0,
    reason: reasons.length > 0 ? reasons.join(" ") : "No critical review triggers detected.",
    highCommercialLowConfidence,
  };
}

function copySnapshotFile(src, destDir) {
  const name = path.basename(src);
  fs.copyFileSync(src, path.join(destDir, name));
}

function main() {
  console.log("SEO Pipeline");
  console.log(`Tenant: ${tenant.name} (${tenant.tenantId})`);
  console.log(`Reports: ${path.relative(process.cwd(), REPORTS_DIR)}`);
  console.log(`Dashboard: ${tenant.dashboardRoute || "/seo-roadmap"}`);

  runStep("Run resource QA", "node scripts/qa_resources.mjs");
  runStep("Generate action briefs", "node scripts/seo_action_briefs.mjs");
  runStep("Generate weekly summary", "node scripts/seo_weekly_summary.mjs");

  ensureFile(QA_REPORT);
  ensureFile(BRIEFS_REPORT);
  ensureFile(WEEKLY_REPORT);

  fs.mkdirSync(HISTORY_DIR, { recursive: true });
  const existingSnapshots = listSnapshotDirs();
  const previousSnapshot = existingSnapshots.length > 0 ? existingSnapshots[existingSnapshots.length - 1] : null;

  const currentQa = readJson(QA_REPORT);
  const currentBriefs = readJson(BRIEFS_REPORT);
  const currentWeekly = readJson(WEEKLY_REPORT);

  let previousQa = null;
  let previousBriefs = null;
  if (previousSnapshot) {
    const prevDir = path.join(HISTORY_DIR, previousSnapshot);
    const prevQaPath = path.join(prevDir, "resource-qa-report.json");
    const prevBriefsPath = path.join(prevDir, "seo-action-briefs.json");
    if (fs.existsSync(prevQaPath) && fs.existsSync(prevBriefsPath)) {
      previousQa = readJson(prevQaPath);
      previousBriefs = readJson(prevBriefsPath);
    }
  }

  const diff = previousQa && previousBriefs
    ? buildDiff(previousQa, currentQa, previousBriefs, currentBriefs)
    : {
      passChange: 0,
      needsReviewChange: 0,
      blockedChange: 0,
      newlyPassing: [],
      newlyFailing: [],
      recommendationCountChange: 0,
      largeScoreSwings: [],
      structuralRegressionCount: 0,
    };

  const reviewFlag = buildReviewFlag(currentQa, currentBriefs, diff);

  const snapshotName = formatSnapshotTimestamp(new Date());
  const snapshotDir = path.join(HISTORY_DIR, snapshotName);
  fs.mkdirSync(snapshotDir, { recursive: true });
  copySnapshotFile(QA_REPORT, snapshotDir);
  copySnapshotFile(BRIEFS_REPORT, snapshotDir);
  copySnapshotFile(WEEKLY_REPORT, snapshotDir);

  const summary = {
    generatedAt: new Date().toISOString(),
    pipeline: {
      steps: ["qa:resources", "seo:briefs", "seo:summary"],
      snapshotDir: path.relative(process.cwd(), snapshotDir),
      previousSnapshot: previousSnapshot ? path.relative(process.cwd(), path.join(HISTORY_DIR, previousSnapshot)) : null,
    },
    outputs: {
      qaReport: path.relative(process.cwd(), QA_REPORT),
      briefsReport: path.relative(process.cwd(), BRIEFS_REPORT),
      weeklySummary: path.relative(process.cwd(), WEEKLY_REPORT),
    },
    current: {
      gateSummary: currentQa.gateSummary,
      recommendationCount: getBriefCount(currentBriefs),
      dashboardBriefCount: currentBriefs.dashboardBriefCount || (currentBriefs.briefs || []).length,
      sprintBacklogCount: currentBriefs.sprintBacklogCount || (currentBriefs.sprintBacklogBriefs || []).length,
      weeklyHeadline: currentWeekly.headlineSummary,
    },
    diff,
    review: reviewFlag,
  };

  fs.writeFileSync(PIPELINE_SUMMARY_REPORT, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("\nSEO Pipeline Result");
  console.log(`Tenant: ${tenant.name} (${tenant.tenantId})`);
  console.log(`Snapshot: ${summary.pipeline.snapshotDir}`);
  console.log(`QA gates: pass=${summary.current.gateSummary?.pass || 0}, needs_review=${summary.current.gateSummary?.needs_review || 0}, blocked=${summary.current.gateSummary?.blocked || 0}`);
  console.log(`Diff vs previous snapshot: pass ${diff.passChange >= 0 ? "+" : ""}${diff.passChange}, needs_review ${diff.needsReviewChange >= 0 ? "+" : ""}${diff.needsReviewChange}, blocked ${diff.blockedChange >= 0 ? "+" : ""}${diff.blockedChange}`);
  console.log(`Newly passing: ${diff.newlyPassing.length}; newly failing: ${diff.newlyFailing.length}; recommendations delta: ${diff.recommendationCountChange >= 0 ? "+" : ""}${diff.recommendationCountChange}`);
  console.log(`Human review recommended: ${reviewFlag.humanReviewRecommended ? "yes" : "no"}`);
  console.log(`Pipeline summary report: ${PIPELINE_SUMMARY_REPORT}`);
}

main();
