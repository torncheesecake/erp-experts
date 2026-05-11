import { readJson } from "./seo_batch_helpers.mjs";
import { buildMonitorState } from "./seo_monitor_helpers.mjs";

function printList(label, items) {
  console.log(label);
  if (!items.length) {
    console.log("None");
    return;
  }
  items.forEach((item) => console.log(`- ${item}`));
}

function main() {
  const qaReport = readJson("reports/resource-qa-report.json");
  const pipelineSummary = readJson("reports/seo-pipeline-summary.json");
  readJson("reports/seo-action-briefs.json");
  readJson("reports/seo-weekly-summary.json");

  const state = buildMonitorState({ qaReport, pipelineSummary });

  console.log("SEO Monitor Report");
  console.log("");
  console.log(`Status: ${state.status}`);
  console.log("");
  console.log("QA:");
  console.log(`pass=${state.pass}`);
  console.log(`needs_review=${state.needsReview}`);
  console.log(`blocked=${state.blocked}`);
  console.log(`humanReviewRecommended=${state.humanReviewRecommended ? "yes" : "no"}`);
  console.log("");
  console.log("Trend:");
  if (!state.previousSnapshot) {
    console.log("Not enough history snapshots to compare trend yet.");
  } else if (!state.hasRegression) {
    console.log("No regressions detected.");
    console.log("No newly failing articles.");
    console.log("No blocked articles.");
  } else {
    console.log(
      `Regression detected vs previous snapshot (${state.previousSnapshot} -> ${state.latestSnapshot}).`,
    );
    console.log(
      `Totals delta: pass ${state.passChange >= 0 ? "+" : ""}${state.passChange}, needs_review ${state.needsReviewChange >= 0 ? "+" : ""}${state.needsReviewChange}, blocked ${state.blockedChange >= 0 ? "+" : ""}${state.blockedChange}`,
    );
    printList("Newly failing articles:", state.newlyFailing);
    printList("Newly blocked articles:", state.newlyBlocked);
  }
  console.log("");
  console.log("Recommendation:");
  if (state.status === "HEALTHY") {
    console.log("No action required.");
    console.log("Continue weekly monitoring.");
  } else {
    console.log("Review latest changes and run:");
    console.log("npm run seo:operator");
  }
  console.log("");
  console.log("Dashboard:");
  console.log("/seo-roadmap");
  console.log("");
  console.log("Git safety:");
  console.log("Run git status --short before switching tasks.");
}

main();
