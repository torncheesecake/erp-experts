import fs from "node:fs";
import path from "node:path";

const QA_PATH = path.resolve("reports/resource-qa-report.json");
const BRIEFS_PATH = path.resolve("reports/seo-action-briefs.json");
const PIPELINE_PATH = path.resolve("reports/seo-pipeline-summary.json");
const CURRENT_WINDOW_MS = 5 * 60 * 1000;

function readJsonSafe(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const trimmed = raw.trim();
    const cleaned = trimmed.endsWith("\\n") ? trimmed.slice(0, -2).trim() : trimmed;
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function statSafe(filePath) {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}

function toIsoOrUnknown(value) {
  if (!value) return "unknown";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "unknown";
  return d.toISOString();
}

function getPipelineGateSummary(pipeline) {
  return pipeline?.current?.gateSummary || { pass: 0, needs_review: 0, blocked: 0 };
}

function getSlugArg() {
  return (process.argv[3] || "").trim();
}

function findBriefForSlug(briefsReport, slug) {
  const all = Array.isArray(briefsReport.allBriefs) ? briefsReport.allBriefs : (briefsReport.briefs || []);
  return all.find((b) => b.targetSlug === slug || b.slug === slug) || null;
}

function getRepetitionWarningsForSlug(qaReport, slug) {
  const warnings = Array.isArray(qaReport.warnings) ? qaReport.warnings : [];
  return warnings.filter((w) => typeof w === "string" && w.startsWith(`${slug}:`) && /repeat|repetition|phrase/i.test(w));
}

function printArticleList(title, rows) {
  console.log(title);
  if (!rows || rows.length === 0) {
    console.log("  None");
    return;
  }
  for (const row of rows) {
    console.log(`  - ${row.title} | ${row.slug} | score ${row.score} | ${row.gate}`);
  }
}

function printBriefList(title, rows, includeRank = false) {
  console.log(title);
  if (!rows || rows.length === 0) {
    console.log("  None");
    return;
  }
  for (const row of rows) {
    const rank = includeRank ? `#${row.displayRank} ` : "";
    console.log(`  - ${rank}${row.preferredTitle || row.targetArticleTitle || row.targetTitle} | ${row.targetSlug || "(new)"} | ${row.recommendationType} | priority ${row.priorityScore}`);
  }
}

function ensureReports(...reports) {
  const missing = reports.filter((r) => !r);
  if (missing.length > 0) {
    console.log("Missing report data. Run npm run seo:pipeline first.");
    process.exit(1);
  }
}

const mode = process.argv[2] || "stats";
const qa = readJsonSafe(QA_PATH);
const briefs = readJsonSafe(BRIEFS_PATH);
const pipeline = readJsonSafe(PIPELINE_PATH);

if (["needs-review", "passes", "blocked", "stats", "verify"].includes(mode)) ensureReports(qa);
if (["sprint", "top", "stats", "verify"].includes(mode)) ensureReports(briefs);
if (["stats", "verify"].includes(mode)) ensureReports(pipeline);

if (mode === "needs-review") {
  printArticleList("Needs Review Articles", (qa.articles || []).filter((a) => a.gate === "needs_review"));
  process.exit(0);
}

if (mode === "passes") {
  printArticleList("Pass Articles", (qa.articles || []).filter((a) => a.gate === "pass"));
  process.exit(0);
}

if (mode === "blocked") {
  printArticleList("Blocked Articles", (qa.articles || []).filter((a) => a.gate === "blocked"));
  process.exit(0);
}

if (mode === "sprint") {
  const sprint = Array.isArray(briefs.sprintBacklogBriefs)
    ? briefs.sprintBacklogBriefs
    : (briefs.allBriefs || []).filter((b) => b.sprintCandidate).slice(0, 10);
  printBriefList("Sprint Backlog Candidates", sprint, true);
  process.exit(0);
}

if (mode === "top") {
  const top = Array.isArray(briefs.briefs) ? briefs.briefs.slice(0, 5) : [];
  printBriefList("Top Dashboard Briefs", top, true);
  process.exit(0);
}

if (mode === "stats") {
  const qaStat = statSafe(QA_PATH);
  const briefsStat = statSafe(BRIEFS_PATH);
  const pipelineStat = statSafe(PIPELINE_PATH);
  const latestSourceMtime = Math.max(
    qaStat?.mtimeMs || 0,
    briefsStat?.mtimeMs || 0,
    pipelineStat?.mtimeMs || 0,
  );
  const isCurrent = latestSourceMtime > 0 && (Date.now() - latestSourceMtime) <= CURRENT_WINDOW_MS;
  const pipelineGate = getPipelineGateSummary(pipeline);
  const qaGate = qa.gateSummary || { pass: 0, needs_review: 0, blocked: 0 };
  const isConsistent = (qaGate.pass || 0) === (pipelineGate.pass || 0)
    && (qaGate.needs_review || 0) === (pipelineGate.needs_review || 0)
    && (qaGate.blocked || 0) === (pipelineGate.blocked || 0);

  console.log("SEO Stats");
  console.log(`  Source QA report: ${path.relative(process.cwd(), QA_PATH)} (updated ${toIsoOrUnknown(qaStat?.mtime)})`);
  console.log(`  Source briefs report: ${path.relative(process.cwd(), BRIEFS_PATH)} (updated ${toIsoOrUnknown(briefsStat?.mtime)})`);
  console.log(`  Source pipeline summary: ${path.relative(process.cwd(), PIPELINE_PATH)} (updated ${toIsoOrUnknown(pipelineStat?.mtime)})`);
  console.log(`  Pipeline snapshot: ${pipeline.pipeline?.snapshotDir || "unknown"}`);
  console.log(`  Stats current: ${isCurrent ? "yes" : "no"}`);
  if (pipeline.generatedAt) {
    console.log(`  Pipeline generatedAt: ${pipeline.generatedAt}`);
  }
  if (qa.generatedAt) {
    console.log(`  QA generatedAt: ${qa.generatedAt}`);
  }
  console.log(`  QA: pass=${qa.gateSummary?.pass || 0}, needs_review=${qa.gateSummary?.needs_review || 0}, blocked=${qa.gateSummary?.blocked || 0}`);
  console.log(`  Pipeline QA gates: pass=${pipelineGate.pass || 0}, needs_review=${pipelineGate.needs_review || 0}, blocked=${pipelineGate.blocked || 0}`);
  if (!isConsistent) {
    console.log("  WARNING: QA totals do not match pipeline summary gates. Re-run npm run seo:pipeline to resynchronise reports.");
  }
  console.log(`  Briefs: total=${briefs.recommendationCount || 0}, dashboard=${briefs.dashboardBriefCount || (briefs.briefs || []).length}, sprint_backlog=${briefs.sprintBacklogCount || (briefs.sprintBacklogBriefs || []).length}`);
  console.log(`  Pipeline diff: pass ${pipeline.diff?.passChange ?? 0}, needs_review ${pipeline.diff?.needsReviewChange ?? 0}, blocked ${pipeline.diff?.blockedChange ?? 0}, recommendations ${pipeline.diff?.recommendationCountChange ?? 0}`);
  console.log(`  Human review recommended: ${pipeline.review?.humanReviewRecommended ? "yes" : "no"}`);
  if (pipeline.review?.reason) console.log(`  Reason: ${pipeline.review.reason}`);
  process.exit(0);
}

if (mode === "verify") {
  const slug = getSlugArg();
  if (!slug) {
    console.log("Missing slug. Usage: npm run seo:verify -- <slug>");
    console.log("Tip: run npm run seo:needs-review");
    process.exit(1);
  }

  const article = (qa.articles || []).find((a) => a.slug === slug);
  if (!article) {
    console.log(`Slug not found in QA report: ${slug}`);
    console.log("Tip: run npm run seo:needs-review");
    process.exit(1);
  }

  const newlyPassing = Array.isArray(pipeline.diff?.newlyPassing) && pipeline.diff.newlyPassing.includes(slug);
  const newlyFailing = Array.isArray(pipeline.diff?.newlyFailing) && pipeline.diff.newlyFailing.includes(slug);
  const brief = findBriefForSlug(briefs, slug);
  const repetitionWarnings = getRepetitionWarningsForSlug(qa, slug);

  console.log("SEO Verify");
  console.log(`  Slug: ${slug}`);
  console.log(`  Title: ${article.title}`);
  console.log(`  Score: ${article.score}`);
  console.log(`  Gate: ${article.gate}`);
  console.log(`  Newly passing: ${newlyPassing ? "yes" : "no"}`);
  console.log(`  Newly failing: ${newlyFailing ? "yes" : "no"}`);
  console.log(`  Human review recommended: ${pipeline.review?.humanReviewRecommended ? "yes" : "no"}`);

  const warnings = article.issues?.warnings || [];
  const structural = article.issues?.structural || [];
  console.log(`  Warnings (${warnings.length}):`);
  if (warnings.length === 0) console.log("    None");
  for (const warning of warnings) console.log(`    - ${warning}`);

  console.log(`  Structural issues (${structural.length}):`);
  if (structural.length === 0) console.log("    None");
  for (const item of structural) console.log(`    - ${item}`);

  console.log(`  Repetition warnings (${repetitionWarnings.length}):`);
  if (repetitionWarnings.length === 0) console.log("    None");
  for (const item of repetitionWarnings) console.log(`    - ${item}`);

  if (brief) {
    console.log("  Related brief:");
    console.log(`    - ${brief.preferredTitle || brief.targetArticleTitle || brief.targetTitle}`);
    console.log(`    - type: ${brief.recommendationType}`);
    console.log(`    - priority: ${brief.priorityScore}`);
    if (Number.isFinite(brief.displayRank)) {
      console.log(`    - displayRank: ${brief.displayRank}`);
    }
    if (brief.sprintCandidate) {
      console.log(`    - sprintCandidate: yes${brief.sprintReason ? ` (${brief.sprintReason})` : ""}`);
    }
  } else {
    console.log("  Related brief: none (not currently in active recommendations)");
  }

  process.exit(0);
}

console.log("Unknown helper mode. Use: needs-review | passes | blocked | sprint | top | stats | verify");
process.exit(1);
