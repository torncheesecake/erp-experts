import fs from "node:fs";
import path from "node:path";

const INPUT = path.resolve("reports/seo-execution-plans.json");
const OUTPUT = path.resolve("reports/seo-active-plan.md");
const APPROVALS = path.resolve("reports/seo-plan-approvals.json");

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

function buildMarkdown(plan, approval) {
  const target = plan.targetSlug ? `slug: \`${plan.targetSlug}\`` : plan.targetPath ? `path: \`${plan.targetPath}\`` : "n/a";
  const stopConditions = collectStopConditions(plan.executionStages || []);
  const validationCommands = (plan.validationCommands || []).map((cmd) => `- \`${cmd}\``).join("\n") || "- none";
  const rollbackNotes = (plan.rollbackNotes || []).map((item) => `- ${item}`).join("\n") || "- none";
  const stagesText = (plan.executionStages || []).map(renderStage).join("\n");
  const highReview = plan.safetyLevel === "high_review_required";
  const safePatch = plan.safetyLevel === "safe_patch_candidate";
  const hasPatchProposalApproval = approval && (approval.approvedFor === "patch_proposal" || approval.approvedFor === "apply_patch");
  const canShowPatchPrompt = !highReview || hasPatchProposalApproval;
  const approvalLines = approval
    ? [
      `- Status: approved`,
      `- Approved for: \`${approval.approvedFor}\``,
      `- Approved at: ${approval.approvedAt || "n/a"}`,
      `- Expires at: ${approval.expiresAt || "none"}`,
      `- Note: ${approval.approvalNote || "none"}`,
    ]
    : [
      "- Status: not approved",
      "- Approved for: none",
      "- Note: run `npm run seo:plan:approve -- <planId>` before patch workflows",
    ];

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
    "## Approval status",
    ...approvalLines,
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
    !canShowPatchPrompt
      ? "Patching disabled by default for this safety level. Approve for patch proposal first: npm run seo:plan:approve -- <planId>"
      : "```text",
    canShowPatchPrompt ? (plan.codexPatchPrompt || "No patch prompt available.") : "",
    canShowPatchPrompt ? "```" : "",
    canShowPatchPrompt && highReview
      ? "\nProposal only: even with approval, this remains review-first and not auto-apply."
      : "",
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

  const approvalsReport = readJson(APPROVALS);
  const approvals = Array.isArray(approvalsReport?.approvals) ? approvalsReport.approvals : [];
  const approval = approvals.find((item) => item.planId === plan.id) || null;

  const markdown = buildMarkdown(plan, approval);
  fs.writeFileSync(OUTPUT, markdown, "utf8");

  console.log("SEO Plan Runner");
  console.log(`Plan: ${plan.id} - ${plan.title}`);
  console.log(`Safety: ${plan.safetyLevel} · requiredHumanReview=${plan.requiredHumanReview ? "yes" : "no"}`);
  console.log(`Approval: ${approval ? `approved_for_${approval.approvedFor}` : "not_approved"}`);
  console.log(`Output: ${OUTPUT}`);
}

main();
