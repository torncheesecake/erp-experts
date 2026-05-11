import { buildBatchQueue, readJson } from "./seo_batch_helpers.mjs";
import { buildMonitorState } from "./seo_monitor_helpers.mjs";

function toYesNo(value) {
  return value ? "yes" : "no";
}

function printQueue(queue) {
  if (!queue.length) {
    console.log("Next queue:");
    console.log("No queue items available.");
    return;
  }

  console.log("Next queue:");
  queue.forEach((item) => {
    console.log(`${item.rank}. ${item.slug}`);
  });
}

function printNextCommands({ blocked, humanReviewRecommended, needsReview }) {
  console.log("Next commands:");

  if (humanReviewRecommended) {
    console.log("npm run seo:pipeline");
    console.log("npm run seo:stats");
    console.log("");
    console.log("Then review the latest human-review reason in reports/seo-pipeline-summary.json before editing.");
    return;
  }

  if (blocked > 0) {
    console.log("npm run seo:batch");
    console.log("");
    console.log("Then fix blocked pages first, one by one:");
    console.log("npm run seo:after-edit -- <blocked-slug>");
    console.log("Re-run npm run seo:pipeline after each fix.");
    return;
  }

  if (needsReview > 0) {
    console.log("npm run seo:batch:prompt");
    console.log("");
    console.log("Then give Codex:");
    console.log("Run the SEO batch from reports/seo-next-batch-prompt.md exactly as written.");
    console.log("Work sequentially.");
    console.log("Stop if any validation stop condition is triggered.");
    console.log("");
    console.log("After Codex finishes:");
    console.log("npm run seo:batch:complete");
    return;
  }

  console.log("npm run seo:monitor");
}

function modeFor({ blocked, humanReviewRecommended, needsReview }) {
  if (humanReviewRecommended) return "Human review required";
  if (blocked > 0) return "Blocked pages need fixing";
  if (needsReview === 0) return "Monitoring only";
  if (needsReview <= 3) return `Final mini-batch: ${needsReview} article${needsReview === 1 ? "" : "s"} remaining`;
  return "Ready for next batch";
}

function main() {
  const qaReport = readJson("reports/resource-qa-report.json");
  const pipelineSummary = readJson("reports/seo-pipeline-summary.json");
  const briefsReport = readJson("reports/seo-action-briefs.json");
  readJson("reports/seo-weekly-summary.json");

  const gate = qaReport?.gateSummary || {};
  const pass = Number(gate.pass || 0);
  const needsReview = Number(gate.needs_review || 0);
  const blocked = Number(gate.blocked || 0);
  const humanReviewRecommended = Boolean(pipelineSummary?.review?.humanReviewRecommended);
  const monitor = buildMonitorState({ qaReport, pipelineSummary });

  const queue = buildBatchQueue({
    qaReport,
    briefs: briefsReport?.briefs || [],
    maxItems: 3,
  });

  console.log("SEO Operator Status");
  console.log("");
  console.log("QA:");
  console.log(`pass=${pass}, needs_review=${needsReview}, blocked=${blocked}`);
  console.log(`humanReviewRecommended=${toYesNo(humanReviewRecommended)}`);
  if (needsReview === 0 && blocked === 0 && !humanReviewRecommended) {
    console.log(`status=${monitor.status}`);
  }
  console.log("");
  console.log("Mode:");
  console.log(modeFor({ blocked, humanReviewRecommended, needsReview }));
  console.log("");
  printQueue(queue);
  console.log("");
  printNextCommands({ blocked, humanReviewRecommended, needsReview });
  console.log("");
  console.log("Dashboard:");
  console.log("/seo-roadmap");
  console.log("");
  console.log("Git safety:");
  console.log("Run git status --short before switching tasks.");
}

main();
