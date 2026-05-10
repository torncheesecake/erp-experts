import fs from "node:fs";
import path from "node:path";

const QA_REPORT_PATH = path.resolve("reports/resource-qa-report.json");
const BRIEFS_PATH = path.resolve("reports/seo-action-briefs.json");
const REPORTS_DATA_PATH = path.resolve("src/data/reports.json");
const OUTPUT_PATH = path.resolve("reports/seo-weekly-summary.json");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Could not read ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

function titleForBrief(brief) {
  return brief?.preferredTitle || brief?.targetArticleTitle || brief?.targetTitle || brief?.rawQuery || "Untitled recommendation";
}

function actionTextForBrief(brief) {
  if (brief.recommendationType === "improve_existing") {
    return `Improve the existing article "${titleForBrief(brief)}" before creating more content.`;
  }
  if (brief.recommendationType === "create_new") {
    return `Create a new resource: "${titleForBrief(brief)}".`;
  }
  if (brief.recommendationType === "blocked_review") {
    return `Fix the blocked review item "${titleForBrief(brief)}" before promotion.`;
  }
  return `Monitor "${titleForBrief(brief)}" and refresh only if performance weakens.`;
}

function reasonForBrief(brief) {
  const commercial = brief.whyThisMattersCommercially || "Commercial value has not been estimated yet.";
  const nextStep = brief.suggestedCtaAngle || brief.recommendedCTA || "review next best action";
  return `${commercial} Suggested next step: ${nextStep}.`;
}

function splitCounts(briefs) {
  return briefs.reduce((acc, brief) => {
    const key = brief.recommendationType || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, { create_new: 0, improve_existing: 0, monitor: 0, blocked_review: 0 });
}

function pickHighestCommercialOpportunity(briefs) {
  return [...briefs].sort((a, b) => {
    const aScore = (a.estimatedBusinessValue || 0) + (a.estimatedLeadIntent || 0) + (a.assistedConversionPotential || 0);
    const bScore = (b.estimatedBusinessValue || 0) + (b.estimatedLeadIntent || 0) + (b.assistedConversionPotential || 0);
    return bScore - aScore;
  })[0] || null;
}

function pickBiggestQualityRisk(qaReport, briefs) {
  const blocked = (qaReport.articles || []).find((article) => article.gate === "blocked");
  if (blocked) return blocked;

  const improveSlugs = new Set(briefs.filter((brief) => brief.recommendationType === "improve_existing").map((brief) => brief.targetSlug).filter(Boolean));
  const candidates = (qaReport.articles || [])
    .filter((article) => article.gate !== "pass")
    .sort((a, b) => {
      const aBoost = improveSlugs.has(a.slug) ? -10 : 0;
      const bBoost = improveSlugs.has(b.slug) ? -10 : 0;
      return (a.score + aBoost) - (b.score + bBoost);
    });

  return candidates[0] || null;
}

function topReason(article) {
  return article?.issues?.structural?.[0] || article?.issues?.warnings?.[0] || "No specific QA warning recorded.";
}

function buildSummary({ qaReport, briefsReport, reportsData }) {
  const briefs = Array.isArray(briefsReport.briefs) ? briefsReport.briefs : [];
  const gateSummary = qaReport.gateSummary || {};
  const reviewCount = gateSummary.needs_review || 0;
  const blockedCount = gateSummary.blocked || 0;
  const split = splitCounts(briefs);
  const topActions = briefs.slice(0, 3).map((brief, index) => ({
    rank: index + 1,
    title: titleForBrief(brief),
    recommendationType: brief.recommendationType,
    priorityScore: brief.priorityScore,
    outcomeLabel: brief.outcomeLabel,
    action: actionTextForBrief(brief),
    reason: reasonForBrief(brief),
  }));

  const highest = pickHighestCommercialOpportunity(briefs);
  const risk = pickBiggestQualityRisk(qaReport, briefs);
  const createHeavy = split.create_new > split.improve_existing;
  const qualityHeavy = reviewCount > 10 || blockedCount > 0;

  const headlineSummary = briefs.length === 0
    ? "SEO automation has no action briefs yet. Generate Resource QA and SEO briefs before planning this week's content work."
    : `This week, SEO automation recommends ${createHeavy ? "creating new demand-led resources" : "improving existing resources"} while keeping quality control visible. ${reviewCount} pages need review and ${blockedCount} are blocked.`;

  const suggestedFocusForNextWeek = blockedCount > 0
    ? "Resolve blocked QA items first, then rerun the briefs before starting new content."
    : qualityHeavy
      ? "Improve one high-intent existing article and draft one high-value new resource, then rerun Resource QA to check progress."
      : "Prioritise the top commercial opportunity, monitor existing pages, and keep new content aligned to service-led intent.";

  return {
    generatedAt: new Date().toISOString(),
    sourceReports: {
      qaReport: path.relative(process.cwd(), QA_REPORT_PATH),
      seoActionBriefs: path.relative(process.cwd(), BRIEFS_PATH),
      reportsData: path.relative(process.cwd(), REPORTS_DATA_PATH),
    },
    reportContext: {
      reportsLastUpdated: reportsData.lastUpdated || null,
      qaGeneratedAt: qaReport.generatedAt || null,
      briefsGeneratedAt: briefsReport.generatedAt || null,
    },
    headlineSummary,
    topRecommendedActions: topActions,
    highestCommercialOpportunity: highest ? {
      title: titleForBrief(highest),
      recommendationType: highest.recommendationType,
      outcomeLabel: highest.outcomeLabel,
      estimatedBusinessValue: highest.estimatedBusinessValue,
      estimatedLeadIntent: highest.estimatedLeadIntent,
      assistedConversionPotential: highest.assistedConversionPotential,
      reason: highest.whyThisMattersCommercially || reasonForBrief(highest),
    } : null,
    biggestQualityRisk: risk ? {
      title: risk.title || risk.slug,
      slug: risk.slug,
      gate: risk.gate,
      score: risk.score,
      reason: topReason(risk),
    } : null,
    createVsImproveSplit: split,
    pagesNeedingReviewCount: reviewCount,
    blockedCount,
    suggestedFocusForNextWeek,
  };
}

const qaReport = readJson(QA_REPORT_PATH);
const briefsReport = readJson(BRIEFS_PATH);
const reportsData = readJson(REPORTS_DATA_PATH);
const summary = buildSummary({ qaReport, briefsReport, reportsData });

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

console.log("SEO Weekly Summary");
console.log(summary.headlineSummary);
console.log(`Top actions: ${summary.topRecommendedActions.length}`);
if (summary.highestCommercialOpportunity) {
  console.log(`Highest opportunity: ${summary.highestCommercialOpportunity.title}`);
}
if (summary.biggestQualityRisk) {
  console.log(`Biggest quality risk: ${summary.biggestQualityRisk.title}`);
}
console.log(`Report written: ${OUTPUT_PATH}`);
