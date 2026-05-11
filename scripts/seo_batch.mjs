import { buildBatchQueue, readJson } from "./seo_batch_helpers.mjs";

const qaReport = readJson("reports/resource-qa-report.json");
const briefsReport = readJson("reports/seo-action-briefs.json");
const queue = buildBatchQueue({ qaReport, briefs: briefsReport.briefs || [] });

if (!queue.length) {
  console.log("No batch-ready article improvements found.");
  process.exit(0);
}

console.log("Top 3 batch queue (improve_existing, needs_review):");
queue.forEach((item, idx) => {
  console.log(`\n${idx + 1}. ${item.title}`);
  console.log(`   slug: ${item.slug}`);
  console.log(`   source: ${item.source}`);
  console.log(`   qaScore: ${item.qaScore}`);
  console.log(`   priorityScore: ${item.priorityScore}`);
  console.log(`   intent: ${item.conversionIntentLabel}`);
  console.log(`   topIssue: ${item.topIssue}`);
  console.log(`   command: ${item.command}`);
});
