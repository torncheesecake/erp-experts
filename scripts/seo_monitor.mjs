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
  const summaryOnly = process.argv.includes("--summary");
  const qaReport = readJson("reports/resource-qa-report.json");
  const pipelineSummary = readJson("reports/seo-pipeline-summary.json");
  readJson("reports/seo-action-briefs.json");
  readJson("reports/seo-weekly-summary.json");

  const state = buildMonitorState({ qaReport, pipelineSummary });

  if (summaryOnly) {
    console.log(state.status);
    console.log(`${state.pass} pass`);
    console.log(`${state.needsReview} review`);
    console.log(`${state.blocked} blocked`);
    if (state.healthyStreak > 0) {
      console.log(`${state.healthyStreak} healthy snapshots`);
    } else if (state.regressionStreak > 0) {
      console.log(`${state.regressionStreak} regression snapshots`);
    } else {
      console.log("No snapshot streak yet");
    }
    console.log(state.status === "HEALTHY" ? "No action required" : "Run npm run seo:operator");
    return;
  }

  console.log("SEO Weekly Monitor");
  console.log("");
  console.log(`Status: ${state.status}`);
  console.log("");
  console.log("Current:");
  console.log(`pass=${state.pass}`);
  console.log(`needs_review=${state.needsReview}`);
  console.log(`blocked=${state.blocked}`);
  console.log(`humanReviewRecommended=${state.humanReviewRecommended ? "yes" : "no"}`);
  console.log("");
  console.log("Previous:");
  if (!state.previousSnapshot) {
    console.log("No previous snapshot available yet.");
  } else {
    console.log(`pass=${state.previousTotals.pass}`);
    console.log(`needs_review=${state.previousTotals.needsReview}`);
    console.log(`blocked=${state.previousTotals.blocked}`);
  }
  console.log("");
  console.log("Changes:");
  console.log(
    `pass ${state.passChange >= 0 ? "+" : ""}${state.passChange}, needs_review ${state.needsReviewChange >= 0 ? "+" : ""}${state.needsReviewChange}, blocked ${state.blockedChange >= 0 ? "+" : ""}${state.blockedChange}`,
  );
  if (!state.previousSnapshot) {
    console.log("Not enough history snapshots to compare trend yet.");
  } else if (!state.hasRegression) {
    console.log("No regressions detected.");
    console.log("No newly failing articles.");
    console.log("No newly blocked articles.");
  } else {
    printList("Newly failing articles:", state.newlyFailing);
    printList("Newly blocked articles:", state.newlyBlocked);
  }
  if (state.healthyStreak > 0) {
    console.log(`Healthy streak: ${state.healthyStreak} snapshot${state.healthyStreak === 1 ? "" : "s"}.`);
  } else if (state.regressionStreak > 0) {
    console.log(`Regression streak: ${state.regressionStreak} snapshot${state.regressionStreak === 1 ? "" : "s"}.`);
  }
  if (state.recoverySnapshotsAgo !== null) {
    console.log(`Recovered from regression ${state.recoverySnapshotsAgo} snapshot${state.recoverySnapshotsAgo === 1 ? "" : "s"} ago.`);
  }
  console.log("");
  console.log("Recommendation:");
  if (state.status === "HEALTHY") {
    console.log("No action required this week.");
    console.log("Continue weekly autopilot monitoring.");
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
