import fs from "node:fs";
import path from "node:path";

const INPUT = path.resolve("reports/seo-execution-plans.json");
const OUTPUT = path.resolve("reports/seo-active-plan.md");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function usage() {
  console.log("Usage:");
  console.log("npm run seo:plan:run -- <planId>");
}

function collectStopConditions(stages = []) {
  const all = [];
  for (const stage of stages) {
    for (const condition of stage.stopConditions || []) {
      if (condition && !all.includes(condition)) all.push(condition);
    }
  }
  return all;
}

function renderStage(stage) {
  const commands = (stage.commands || []).map((cmd) => `- \`${cmd}\``).join("\n") || "- none";
  const stops = (stage.stopConditions || []).map((item) => `- ${item}`).join("\n") || "- none";
  const checks = (stage.reviewCheckpoints || []).map((item) => `- ${item}`).join("\n") || "- none";

  return [
    `### ${stage.stage}`,
    `${stage.meaning || ""}`.trim(),
    "",
    "**Recommended commands**",
    commands,
    "",
    "**Stop conditions**",
    stops,
    "",
    "**Review checkpoints**",
    checks,
    "",
  ].join("\n");
}

function buildMarkdown(plan) {
  const target = plan.targetSlug ? `slug: \`${plan.targetSlug}\`` : plan.targetPath ? `path: \`${plan.targetPath}\`` : "n/a";
  const stopConditions = collectStopConditions(plan.executionStages || []);
  const validationCommands = (plan.validationCommands || []).map((cmd) => `- \`${cmd}\``).join("\n") || "- none";
  const rollbackNotes = (plan.rollbackNotes || []).map((item) => `- ${item}`).join("\n") || "- none";
  const stagesText = (plan.executionStages || []).map(renderStage).join("\n");
  const highReview = plan.safetyLevel === "high_review_required";
  const safePatch = plan.safetyLevel === "safe_patch_candidate";

  return [
    "# SEO Active Plan",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Plan overview",
    `- Plan ID: \`${plan.id}\``,
    `- Title: ${plan.title}`,
    `- Target: ${target}`,
    `- Plan type: \`${plan.planType}\``,
    `- Safety level: \`${plan.safetyLevel}\``,
    `- Required human review: ${plan.requiredHumanReview ? "yes" : "no"}`,
    `- Priority: ${plan.executionPriority}`,
    `- Impact/Effort/Confidence: ${plan.estimatedImpact} / ${plan.estimatedEffort} / ${plan.confidence}`,
    "",
    "## Safety guidance",
    highReview
      ? "- This plan is high review required. Only planning output is enabled by default."
      : safePatch
        ? "- This plan is a safe patch candidate, but review remains mandatory before commit."
        : "- This plan is review only. Produce planning output first.",
    highReview
      ? "- Patching requires explicit human approval after review checkpoints are passed."
      : "- Any patch output must remain narrow and reviewed before application.",
    "",
    "## Recommended workflow",
    `- Lifecycle: ${plan.recommendedWorkflow?.lifecycle || "Plan -> Review -> Apply -> Validate -> Commit"}`,
    `- Next command: ${plan.recommendedWorkflow?.nextCommand || "Review plan output"}`,
    `- Notes: ${plan.recommendedWorkflow?.notes || "Keep scope narrow and review-first."}`,
    "",
    "## Execution stages",
    stagesText,
    "## Planning prompt",
    "```text",
    plan.codexPlanningPrompt || "No planning prompt available.",
    "```",
    "",
    "## Patch prompt",
    highReview
      ? "Patching disabled by default for this safety level. Request explicit human approval first."
      : "```text",
    highReview ? "" : (plan.codexPatchPrompt || "No patch prompt available."),
    highReview ? "" : "```",
    "",
    "## Validation commands",
    validationCommands,
    "",
    "## Rollback notes",
    rollbackNotes,
    "",
    "## Explicit stop conditions",
    stopConditions.map((item) => `- ${item}`).join("\n") || "- none",
    "",
    "## Post-validation prompt",
    "```text",
    plan.postValidationPrompt || "Summarise validation state and regressions.",
    "```",
    "",
  ].filter(Boolean).join("\n");
}

function main() {
  const planId = process.argv[2];
  if (!planId) {
    usage();
    process.exit(1);
  }

  const report = readJson(INPUT);
  if (!report) {
    console.log("Missing execution plans report.");
    console.log("Run npm run seo:plans first.");
    process.exit(1);
  }

  const plans = Array.isArray(report.plans) ? report.plans : [];
  const plan = plans.find((entry) => entry.id === planId);
  if (!plan) {
    console.log(`Plan not found: ${planId}`);
    const examples = plans.slice(0, 5).map((entry) => entry.id);
    if (examples.length) {
      console.log("Available examples:");
      examples.forEach((id) => console.log(`- ${id}`));
    }
    process.exit(1);
  }

  const markdown = buildMarkdown(plan);
  fs.writeFileSync(OUTPUT, markdown, "utf8");

  console.log("SEO Plan Runner");
  console.log(`Plan: ${plan.id} - ${plan.title}`);
  console.log(`Safety: ${plan.safetyLevel} · requiredHumanReview=${plan.requiredHumanReview ? "yes" : "no"}`);
  console.log(`Output: ${OUTPUT}`);
}

main();
