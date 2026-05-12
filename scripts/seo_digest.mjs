import fs from "node:fs";
import path from "node:path";

const INPUTS = {
  qa: path.resolve("reports/resource-qa-report.json"),
  monitorSummary: path.resolve("reports/seo-pipeline-summary.json"),
  opportunities: path.resolve("reports/seo-opportunity-centre.json"),
  links: path.resolve("reports/seo-internal-link-opportunities.json"),
  freshness: path.resolve("reports/seo-freshness-report.json"),
  conversion: path.resolve("reports/seo-conversion-paths.json"),
};

const OUTPUT = path.resolve("reports/seo-weekly-digest.md");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function joinList(items) {
  return items.map((item, idx) => `${idx + 1}. ${item}`).join("\n");
}

function main() {
  const qa = readJson(INPUTS.qa);
  const pipeline = readJson(INPUTS.monitorSummary);
  const opportunities = readJson(INPUTS.opportunities);
  const links = readJson(INPUTS.links);
  const freshness = readJson(INPUTS.freshness);
  const conversion = readJson(INPUTS.conversion);

  const gate = qa?.gateSummary || {};
  const pass = Number(gate.pass || 0);
  const needsReview = Number(gate.needs_review || 0);
  const blocked = Number(gate.blocked || 0);
  const humanReview = Boolean(pipeline?.review?.humanReviewRecommended);
  const health = blocked > 0 ? "ACTION REQUIRED" : needsReview > 0 || humanReview ? "WARNING" : "HEALTHY";
  const maintenanceLine = health === "HEALTHY"
    ? "No maintenance required."
    : humanReview
      ? "Human review required."
      : "Maintenance work is required.";

  const topOps = Array.isArray(opportunities?.topOpportunities) ? opportunities.topOpportunities.slice(0, 3) : [];
  const topLinks = Array.isArray(links?.opportunities) ? links.opportunities[0] : null;
  const topFreshness = Array.isArray(freshness?.entries) ? freshness.entries[0] : null;
  const topConversion = Array.isArray(conversion?.entries) ? conversion.entries[0] : null;

  const focusThisWeek = health !== "HEALTHY"
    ? "Stabilise quality and resolve review flags before growth work."
    : topOps.length
      ? `Pick one strategic opportunity first: ${topOps[0].groupTitle || topOps[0].title}.`
      : "Keep monitoring and refresh opportunities as needed.";

  const lines = [
    "# SEO Weekly Digest",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Health snapshot",
    `- Status: ${health}`,
    `- QA totals: pass=${pass}, needs_review=${needsReview}, blocked=${blocked}`,
    `- humanReviewRecommended: ${humanReview ? "yes" : "no"}`,
    `- Monitoring result: ${health}`,
    `- ${maintenanceLine}`,
    "",
    "## Top unified opportunities",
    topOps.length
      ? joinList(topOps.map((op) => `${op.groupTitle || op.title} (${op.priorityLabel || "n/a"}, score ${op.score || 0})`))
      : "No unified opportunities available.",
    "",
    "## Top internal link opportunity",
    topLinks
      ? `- ${topLinks.sourceSlug} -> ${topLinks.targetSlug || topLinks.targetPath} (${topLinks.suggestedAnchorText})`
      : "- No internal link opportunities found.",
    "",
    "## Top freshness candidate",
    topFreshness
      ? `- ${topFreshness.slug}: freshness ${topFreshness.freshnessScore}, risk ${topFreshness.decayRisk}, suggested ${topFreshness.suggestedRefreshType}`
      : "- No freshness candidates found.",
    "",
    "## Top conversion path issue",
    topConversion
      ? `- ${topConversion.slug}: score ${topConversion.conversionPathScore}, suggested path ${topConversion.suggestedCTATarget}`
      : "- No conversion issues found.",
    "",
    "## Recommended focus this week",
    `- ${focusThisWeek}`,
    "",
    "## Next commands",
    "- `npm run seo:monitor`",
    "- `npm run seo:opportunities`",
    "- `npm run seo:plans`",
    "",
  ];

  fs.writeFileSync(OUTPUT, `${lines.join("\n")}\n`, "utf8");

  console.log("SEO Weekly Digest");
  console.log(`Status: ${health}`);
  console.log(`QA: pass=${pass}, needs_review=${needsReview}, blocked=${blocked}`);
  console.log(maintenanceLine);
  console.log(`Report written: ${OUTPUT}`);
}

main();
