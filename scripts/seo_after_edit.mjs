import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const QA_PATH = path.resolve("reports/resource-qa-report.json");
const PIPELINE_PATH = path.resolve("reports/seo-pipeline-summary.json");

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

function usageAndExit() {
  console.log("Usage: npm run seo:after-edit -- <slug>");
  console.log("Tip: npm run seo:needs-review");
  process.exit(1);
}

const slug = (process.argv[2] || "").trim();
if (!slug) usageAndExit();

execSync("npm run seo:pipeline", { stdio: "inherit" });

const qa = readJsonSafe(QA_PATH);
const pipeline = readJsonSafe(PIPELINE_PATH);

if (!qa || !pipeline) {
  console.log("Missing or invalid reports after pipeline run.");
  process.exit(1);
}

const article = (qa.articles || []).find((a) => a.slug === slug);
if (!article) {
  console.log(`Slug not found in QA report: ${slug}`);
  console.log("Tip: npm run seo:needs-review");
  process.exit(1);
}

const diff = pipeline.diff || {};
const newlyPassing = Array.isArray(diff.newlyPassing) && diff.newlyPassing.includes(slug);
const newlyFailing = Array.isArray(diff.newlyFailing) && diff.newlyFailing.includes(slug);
const repetitionWarnings = (qa.warnings || []).filter(
  (w) => typeof w === "string" && w.startsWith(`${slug}:`) && /repeat|repetition|phrase/i.test(w),
);

console.log("\nSEO After-Edit Summary");
console.log(`  Slug: ${slug}`);
console.log(`  Pipeline snapshot: ${pipeline.pipeline?.snapshotDir || "unknown"}`);
console.log(
  `  QA gate totals: pass=${qa.gateSummary?.pass || 0}, needs_review=${qa.gateSummary?.needs_review || 0}, blocked=${qa.gateSummary?.blocked || 0}`,
);
console.log(
  `  Diff summary: pass ${diff.passChange ?? 0}, needs_review ${diff.needsReviewChange ?? 0}, blocked ${diff.blockedChange ?? 0}, recommendations ${diff.recommendationCountChange ?? 0}`,
);
console.log(`  Article score: ${article.score}`);
console.log(`  Article gate: ${article.gate}`);
console.log(`  Newly passing: ${newlyPassing ? "yes" : "no"}`);
console.log(`  Newly failing: ${newlyFailing ? "yes" : "no"}`);
console.log(`  Warnings: ${(article.issues?.warnings || []).length}`);
console.log(`  Structural issues: ${(article.issues?.structural || []).length}`);
console.log(`  Repetition warnings: ${repetitionWarnings.length}`);
console.log(`  Human review recommended: ${pipeline.review?.humanReviewRecommended ? "yes" : "no"}`);

execSync(`npm run seo:verify -- ${slug}`, { stdio: "inherit" });
