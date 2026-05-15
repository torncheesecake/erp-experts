import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getOperationalSummary } from "../../platform/api/state_api.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const outputPath = path.join(repoRoot, "reports/sentinel-stakeholder-weekly-report.md");
const tenantId = getArgValue("--tenant", process.env.PLATFORM_TENANT || "erp-experts");

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function readJson(relativePath, fallback = {}) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) return fallback;

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function rel(filePath) {
  return path.relative(repoRoot, filePath);
}

function cleanText(value = "") {
  return String(value)
    .replace(/SEO automation/gi, "SEO review")
    .replace(/[a-z0-9]+(?:-[a-z0-9]+){2,}\s*→\s*\/[^\s.]+/gi, "a relevant service link")
    .replace(/\/services\/netsuite/gi, "the NetSuite services page")
    .replace(/\bpublishedAt\b/gi, "published date")
    .replace(/validate published date format/gi, "check the article date is clear")
    .replace(/Review link a relevant service link before applying/gi, "Review a relevant service link before adding it to the content plan")
    .replace(/\bbrief\b/gi, "content plan")
    .replace(/npm run [^\s.]+(?: -- [^\n.]+)?/gi, "the next internal review")
    .replace(/\bCodex\b/gi, "the content team")
    .replace(/\bSentinel\b/gi, "the content programme")
    .replace(/\bSQLite\b|\bDB\b|\bdatabase\b|\bAPI\b/gi, "internal system")
    .replace(/\bapproval gate\b|\bapprovals?\b/gi, "review")
    .replace(/\boperator\b|\bdiagnostics?\b/gi, "internal")
    .replace(/\/seo-roadmap/gi, "the internal dashboard")
    .replace(/reports\/[^\s)]+/gi, "the internal report")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(value) {
  if (!value) return "Latest update";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function listItems(items, formatter, emptyText) {
  if (!items?.length) return `- ${emptyText}`;
  return items.map((item) => `- ${formatter(item)}`).join("\n");
}

function uniqueByTitle(items) {
  const seen = new Set();
  return items.filter((item) => {
    const title = itemTitle(item).toLowerCase();
    if (seen.has(title)) return false;
    seen.add(title);
    return true;
  });
}

function roadmapItems(reportData) {
  return (reportData?.ga4Period?.seoInsights?.roadmapPhases || [])
    .flatMap((phase) => (phase.items || []).map((item) => ({ ...item, phase: phase.title })));
}

function itemTitle(item) {
  return cleanText(item?.title || item?.preferredTitle || item?.targetArticleTitle || item?.groupTitle || "Untitled item");
}

function itemReason(item) {
  return cleanText(
    item?.detail
      || item?.why
      || item?.reason
      || item?.recommendedAction
      || item?.whyThisRanks
      || item?.whyThisMatters
      || "Planned content and SEO improvement.",
  );
}

function inProgressItems({ roadmap, actionBriefs, state }) {
  const activeRoadmap = roadmap
    .filter((item) => item.status === "in_progress")
    .map((item) => ({
      title: item.title,
      detail: item.why || item.phase,
    }));

  const activeBriefs = [
    ...(actionBriefs?.briefs || []),
    ...(actionBriefs?.sprintBacklogBriefs || []),
  ].slice(0, 4).map((brief) => ({
    title: brief.preferredTitle || brief.targetArticleTitle,
    detail: brief.recommendationType === "improve_existing"
      ? "Improving an existing resource."
      : "Scoping a demand-led content opportunity.",
  }));

  if (activeRoadmap.length || activeBriefs.length) {
    return uniqueByTitle([...activeRoadmap, ...activeBriefs]).slice(0, 5);
  }

  if (state.plans.top?.title) {
    return [{
      title: state.plans.top.title,
      detail: "Content planning is ready for business review.",
    }];
  }

  return [];
}

function plannedItems({ roadmap, weeklySummary, opportunityReport, state }) {
  const plannedRoadmap = roadmap
    .filter((item) => item.status !== "done" && item.status !== "in_progress")
    .slice(0, 4)
    .map((item) => ({
      title: item.title,
      detail: item.why || item.phase,
    }));

  const weeklyFocus = weeklySummary?.suggestedFocusForNextWeek
    ? [{
        title: "Next weekly focus",
        detail: weeklySummary.suggestedFocusForNextWeek,
      }]
    : [];

  const opportunities = (opportunityReport?.topOpportunities || opportunityReport?.opportunities || state.opportunities.latest || [])
    .slice(0, 3)
    .map((opportunity) => ({
      title: opportunity.groupTitle || opportunity.title,
      detail: opportunity.recommendedAction || opportunity.whyThisRanks || "Strategic content opportunity.",
    }));

  return uniqueByTitle([...plannedRoadmap, ...weeklyFocus, ...opportunities]).slice(0, 6);
}

function strategicOpportunityItems(state, opportunityReport) {
  const opportunities = (opportunityReport?.topOpportunities || opportunityReport?.opportunities || state.opportunities.latest || [])
    .slice(0, 5);

  return opportunities.map((opportunity) => ({
    title: opportunity.groupTitle || opportunity.title,
    detail: opportunity.recommendedAction || opportunity.whyThisRanks || "Strategic opportunity being evaluated.",
    priority: opportunity.priorityLabel || opportunity.priority || "tracked",
  }));
}

function safeNextFocus({ state, weeklySummary, progressItems, planned }) {
  if (state.health.blocked > 0 || state.health.review > 0) {
    return "Review content quality items before starting new growth work.";
  }

  if (progressItems.length) {
    return `Review the current content plan for ${itemTitle(progressItems[0])}.`;
  }

  if (weeklySummary?.suggestedFocusForNextWeek) {
    return cleanText(weeklySummary.suggestedFocusForNextWeek);
  }

  if (planned.length) {
    return `Review the planned opportunity: ${itemTitle(planned[0])}.`;
  }

  return "Keep monitoring content health and choose the next strategic content opportunity.";
}

function renderReport({ state, qaReport, weeklySummary, reportData, completed, progress, planned, opportunities, nextFocus }) {
  const generatedAt = new Date().toISOString();
  const gate = qaReport?.gateSummary || {};
  const pass = Number(gate.pass ?? state.health.pass ?? 0);
  const review = Number(gate.needs_review ?? state.health.review ?? 0);
  const blocked = Number(gate.blocked ?? state.health.blocked ?? 0);
  const healthLabel = blocked === 0 && review === 0 ? "Healthy" : "Needs review";
  const headline = cleanText(
    weeklySummary?.headlineSummary
      || "SEO and content work is healthy. Current focus is strategic growth rather than maintenance.",
  );

  return `# SEO & Content Progress Update

Generated: ${generatedAt}

This report summarises SEO and content progress for internal visibility.

## Content Health Summary

- Current health: ${healthLabel}
- Articles passing QA: ${pass}
- Items needing review: ${review}
- Blocked items: ${blocked}
- Latest content update: ${formatDate(weeklySummary?.generatedAt || qaReport?.generatedAt || reportData?.lastUpdated)}

${headline}

## Completed Recently

${listItems(completed, (item) => `${itemTitle(item)}${item.phase ? ` - ${cleanText(item.phase)}` : ""}`, "No completed roadmap items are listed in the current report.")}

## Currently In Progress

${listItems(progress, (item) => `${itemTitle(item)} - ${itemReason(item)}`, "No active content work is listed in the current report.")}

## Planned Next

${listItems(planned, (item) => `${itemTitle(item)} - ${itemReason(item)}`, "No planned work is listed in the current report.")}

## Strategic Opportunities

${listItems(opportunities, (item) => `${itemTitle(item)} - ${itemReason(item)} (${cleanText(item.priority)})`, "No strategic opportunities are listed in the current report.")}

## Recommended Focus

${cleanText(nextFocus)}
`;
}

function main() {
  const state = getOperationalSummary(tenantId);
  const qaReport = readJson("reports/resource-qa-report.json");
  const weeklySummary = readJson("reports/seo-weekly-summary.json");
  const actionBriefs = readJson("reports/seo-action-briefs.json");
  const opportunityReport = readJson("reports/seo-opportunity-centre.json");
  const reportData = readJson("src/data/reports.json");
  const roadmap = roadmapItems(reportData);
  const completed = roadmap.filter((item) => item.status === "done").slice(0, 6);
  const progress = inProgressItems({ roadmap, actionBriefs, state });
  const planned = plannedItems({ roadmap, weeklySummary, opportunityReport, state });
  const opportunities = strategicOpportunityItems(state, opportunityReport);
  const nextFocus = safeNextFocus({ state, weeklySummary, progressItems: progress, planned });
  const report = renderReport({
    state,
    qaReport,
    weeklySummary,
    reportData,
    completed,
    progress,
    planned,
    opportunities,
    nextFocus,
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, report, "utf8");

  console.log("SEO & Content Progress Update");
  console.log("");
  console.log(`Report: ${rel(outputPath)}`);
  console.log(`Health: ${state.health.monitorStatus}`);
  console.log(`QA: ${state.health.pass}/${state.health.review}/${state.health.blocked}`);
  console.log(`Completed: ${completed.length}`);
  console.log(`Planned: ${planned.length}`);
  console.log("");
  console.log("Safe Next Focus:");
  console.log(cleanText(nextFocus));
}

main();
