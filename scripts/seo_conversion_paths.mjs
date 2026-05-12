import fs from "node:fs";
import path from "node:path";
import { getArticleRecords } from "./lib/load_articles.mjs";

const QA_REPORT_PATH = path.resolve("reports/resource-qa-report.json");
const GROWTH_REPORT_PATH = path.resolve("reports/seo-growth-opportunities.json");
const LINKS_REPORT_PATH = path.resolve("reports/seo-internal-link-opportunities.json");
const FRESHNESS_REPORT_PATH = path.resolve("reports/seo-freshness-report.json");
const OUTPUT_PATH = path.resolve("reports/seo-conversion-paths.json");

const norm = (s) => String(s || "").toLowerCase();
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function intentLevelForText(text) {
  const t = norm(text);
  let score = 30;
  if (/support|aftercare|implementation|rescue|failed|partner|consultant|netsuite/.test(t)) score += 38;
  if (/manufactur|finance|accounting|cfo|reporting/.test(t)) score += 16;
  if (/what is erp|benefits of erp|future of work|understanding/.test(t)) score -= 10;
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function serviceFitForText(text) {
  const t = norm(text);
  if (/support|aftercare|helpdesk|maintenance/.test(t)) return "support";
  if (/implementation|project|migration|rescue|failed/.test(t)) return "implementation";
  if (/consultant|partner|advisory/.test(t)) return "partners";
  if (/netsuite/.test(t)) return "NetSuite services";
  if (/finance|manufactur|erp/.test(t)) return "advisory";
  return "contact";
}

function funnelStageForIntent(intent) {
  if (intent === "high") return "decision";
  if (intent === "medium") return "consideration";
  return "awareness";
}

function recommendedPathForFit(serviceFit, funnelStage) {
  if (serviceFit === "support") return "/support";
  if (serviceFit === "implementation") return "/implementation";
  if (serviceFit === "partners") return "/partners";
  if (serviceFit === "NetSuite services") return "/services/netsuite";
  if (funnelStage === "awareness") return "/resources";
  return "/contact";
}

function recommendedCtaForFit(serviceFit, funnelStage) {
  if (serviceFit === "support") return "Book a NetSuite support review";
  if (serviceFit === "implementation") return "Discuss your implementation roadmap";
  if (serviceFit === "partners") return "Talk to an ERP consultant";
  if (serviceFit === "NetSuite services") return "Explore NetSuite service options";
  if (funnelStage === "awareness") return "Read related practical ERP guides";
  return "Speak with ERP Experts";
}

function parseCurrentCta(article) {
  const currentCTA = article.ctaText || article.ctaLabel || "";
  const currentCTATarget = article.ctaTo || "";
  return { currentCTA, currentCTATarget };
}

function codexPrompt(entry) {
  return `Prepare a proposed conversion-path improvement plan for this single article.

Target:
- Slug: ${entry.slug}
- Title: ${entry.title}
- Current CTA: ${entry.currentCTA || "none"}
- Current CTA target: ${entry.currentCTATarget || "none"}
- Suggested CTA: ${entry.suggestedCTA}
- Suggested CTA target: ${entry.suggestedCTATarget}

Task:
- Propose precise CTA and conclusion improvements first
- Explain placement and phrasing options in UK English
- Include one optional secondary CTA/internal path

Constraints:
- Do not auto-edit content
- Preserve article data shape
- Do not change routes/components
- Do not invent claims or statistics
- Keep recommendations commercially sensible and non-aggressive for funnel stage ${entry.funnelStage}.`;
}

function buildEntry(article, context) {
  const text = `${article.title} ${article.subtitle || ""} ${article.slug}`;
  const intentLevel = intentLevelForText(text);
  const serviceFit = serviceFitForText(text);
  const funnelStage = funnelStageForIntent(intentLevel);
  const { currentCTA, currentCTATarget } = parseCurrentCta(article);

  const suggestedCTATarget = recommendedPathForFit(serviceFit, funnelStage);
  const suggestedCTA = recommendedCtaForFit(serviceFit, funnelStage);
  const suggestedSecondaryCTA = funnelStage === "awareness" ? "View ERP implementation and support pathways" : "Read a related practical resource first";

  const mismatchSignals = [];
  const missingPathSignals = [];

  if (!currentCTA) mismatchSignals.push("CTA text is missing.");
  if (!currentCTATarget) mismatchSignals.push("CTA target path is missing.");
  if (currentCTATarget && suggestedCTATarget && currentCTATarget !== suggestedCTATarget) {
    mismatchSignals.push(`Current CTA target (${currentCTATarget}) does not match likely service fit (${suggestedCTATarget}).`);
  }
  if (funnelStage === "awareness" && /contact|implementation|support/.test(norm(currentCTATarget)) && intentLevel === "low") {
    mismatchSignals.push("Awareness-stage article may have an overly aggressive direct CTA path.");
  }
  if (funnelStage === "decision" && (!currentCTATarget || currentCTATarget === "/resources")) {
    missingPathSignals.push("High-intent article lacks a clear conversion path to a service/contact page.");
  }
  if (!/support|implementation|partners|services|contact/.test(norm(currentCTATarget))) {
    missingPathSignals.push("No clear secondary service path detected.");
  }

  let score = 85;
  score -= mismatchSignals.length * 11;
  score -= missingPathSignals.length * 13;
  if (intentLevel === "high" && (!currentCTATarget || currentCTATarget === "/resources")) score -= 18;
  if (intentLevel === "low" && /contact|implementation/.test(norm(currentCTATarget))) score -= 8;

  const growthHit = context.growthTitles.has(norm(article.title));
  const freshnessHit = context.freshnessRiskBySlug.get(article.slug);
  const linkHit = context.linkOpportunitySources.has(article.slug);
  if (growthHit) score -= 8;
  if (freshnessHit === "high") score -= 8;
  if (freshnessHit === "medium") score -= 4;
  if (!linkHit) score -= 3;
  score = clamp(score);

  const conversionRisk = score < 55 ? "high" : score < 72 ? "medium" : "low";
  const conversionPriority = clamp((100 - score) * 0.6 + (intentLevel === "high" ? 30 : intentLevel === "medium" ? 18 : 8));

  const whyItMatters = conversionRisk === "high"
    ? "This article likely attracts commercially relevant readers but the current conversion path is underpowered."
    : conversionRisk === "medium"
      ? "This article could convert better with clearer next-step guidance and CTA alignment."
      : "Conversion pathway is generally healthy, with minor optimisation potential.";

  const suggestedAction = intentLevel === "high"
    ? `Strengthen ${serviceFit.toLowerCase()} CTA path and reinforce it in the conclusion.`
    : intentLevel === "medium"
      ? "Tighten CTA wording and add one clearer service-adjacent next step."
      : "Keep the CTA soft and educational, with a clear optional advisory path.";

  const entry = {
    slug: article.slug,
    title: article.title,
    conversionPathScore: score,
    conversionRisk,
    intentLevel,
    currentCTA: currentCTA || null,
    currentCTATarget: currentCTATarget || null,
    suggestedCTA,
    suggestedCTATarget,
    suggestedSecondaryCTA,
    serviceFit,
    funnelStage,
    mismatchSignals,
    missingPathSignals,
    whyItMatters,
    suggestedAction,
    sourceSignals: [
      growthHit ? "growth_opportunity" : null,
      linkHit ? "internal_link_opportunity" : null,
      freshnessHit ? `freshness_${freshnessHit}` : null,
      context.qaPassBySlug.get(article.slug) ? "qa_pass" : null,
    ].filter(Boolean),
    conversionPriority,
  };
  entry.codexPrompt = codexPrompt(entry);
  return entry;
}

function printTop(entries) {
  const top = [...entries].sort((a, b) => b.conversionPriority - a.conversionPriority).slice(0, 10);
  console.log("SEO Conversion Path Intelligence");
  console.log(`Analysed ${entries.length} articles.`);
  if (!top.length) {
    console.log("No conversion path opportunities found.");
    return;
  }
  top.forEach((entry, idx) => {
    console.log(`${idx + 1}. ${entry.slug}`);
    console.log(`   Score: ${entry.conversionPathScore}`);
    console.log(`   Intent: ${entry.intentLevel}`);
    console.log(`   Current path: ${entry.currentCTATarget || "none"}`);
    console.log(`   Suggested path: ${entry.suggestedCTATarget}`);
    console.log(`   Action: ${entry.suggestedAction}`);
  });
}

function main() {
  const qaReport = readJson(QA_REPORT_PATH, {});
  const growthReport = readJson(GROWTH_REPORT_PATH, null);
  const linksReport = readJson(LINKS_REPORT_PATH, null);
  const freshnessReport = readJson(FRESHNESS_REPORT_PATH, null);
  const articles = getArticleRecords();

  const context = {
    qaPassBySlug: new Map((qaReport?.articles || []).map((a) => [a.slug, a.gate === "pass"])),
    growthTitles: new Set((growthReport?.topOpportunities || growthReport?.opportunities || []).map((o) => norm(o.title))),
    linkOpportunitySources: new Set((linksReport?.opportunities || []).map((o) => o.sourceSlug)),
    freshnessRiskBySlug: new Map((freshnessReport?.entries || []).map((e) => [e.slug, e.decayRisk])),
  };

  const entries = articles
    .filter((article) => context.qaPassBySlug.get(article.slug))
    .map((article) => buildEntry(article, context))
    .sort((a, b) => b.conversionPriority - a.conversionPriority);

  const report = {
    generatedAt: new Date().toISOString(),
    sourceReports: {
      articles: "src/data/articles.js",
      qaReport: path.relative(process.cwd(), QA_REPORT_PATH),
      growthReport: growthReport ? path.relative(process.cwd(), GROWTH_REPORT_PATH) : null,
      linksReport: linksReport ? path.relative(process.cwd(), LINKS_REPORT_PATH) : null,
      freshnessReport: freshnessReport ? path.relative(process.cwd(), FRESHNESS_REPORT_PATH) : null,
    },
    gateSummary: qaReport?.gateSummary || {},
    articleCount: entries.length,
    topConversionPathRisks: entries.slice(0, 10),
    entries,
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  printTop(entries);
  console.log(`Report written: ${OUTPUT_PATH}`);
}

main();
