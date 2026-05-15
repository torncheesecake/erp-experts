import { getOperationalSummary } from "../../platform/api/state_api.mjs";

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function printError(error) {
  if (error.code === "TENANT_CONFIG_ERROR") {
    console.error(`Tenant config error: ${error.message}`);
    error.details?.forEach((detail) => console.error(`  - ${detail}`));
    return;
  }

  console.error(error.message);
}

function main() {
  const tenantId = getArgValue("--tenant", "erp-experts");
  const jsonMode = hasFlag("--json");

  try {
    const state = getOperationalSummary(tenantId);

    if (jsonMode) {
      process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
      return;
    }

    console.log("Sentinel API Preview");
    console.log("");
    console.log(`Tenant: ${state.tenant.name}`);
    console.log(`Health: ${state.health.monitorStatus}`);
    console.log(`QA: ${state.health.pass}/${state.health.review}/${state.health.blocked}`);
    console.log(`Workflow: ${state.workflow.state}`);
    console.log("");
    console.log("Latest Opportunity:");
    console.log(state.opportunities.top?.title || "None persisted yet.");
    console.log("");
    console.log("Latest Plan:");
    if (state.plans.top) {
      console.log(`${state.plans.top.planId} - ${state.plans.top.title}`);
    } else {
      console.log("None persisted yet.");
    }
    console.log("");
    console.log("Latest Inbox Item:");
    console.log(state.inbox.latestActionable?.title || state.inboxRecommendation?.title || "No urgent action.");
    console.log("");
    console.log("Recommended Next Step:");
    console.log(state.recommendation.nextStep);
  } catch (error) {
    printError(error);
    process.exit(1);
  }
}

main();
