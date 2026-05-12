import fs from "node:fs";
import path from "node:path";
import { getArticleRecords } from "./lib/load_articles.mjs";

const QA_REPORT_PATH = path.resolve("reports/resource-qa-report.json");
const GROWTH_REPORT_PATH = path.resolve("reports/seo-growth-opportunities.json");
const OUTPUT_PATH = path.resolve("reports/seo-freshness-report.json");

const norm = (s) => String(s || "").toLowerCase();
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function ageMonths(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const diff = Date.now() - parsed.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24 * 30.4375)));
}

function topicalArea(text) {
  const t = norm(text);
  if (/ai|future of work|generative/.test(t)) return "ai-transformation";
  if (/finance|accounting|accounts|cfo|reporting/.test(t)) return "finance-accounting";
  if (/manufactur|factory|warehouse|inventory/.test(t)) return "manufacturing";
  if (/support|aftercare|helpdesk|maintenance/.test(t)) return "support";
  if (/implementation|project|migration|rescue/.test(t)) return "implementation";
  if (/consultant|partner|advisory/.test(t)) return "consulting-partner";
  if (/netsuite/.test(t)) return "netsuite-general";
  return "general-erp";
}

function commercialIntentLabel(text) {
  const t = norm(text);
  let score = 35;
  if (/netsuite|implementation|support|partner|consultant|migration|rescue/.test(t)) score += 35;
  if (/finance|accounting|manufactur|cfo/.test(t)) score += 15;
  if (/what is erp|benefits of erp|future of work/.test(t)) score -= 10;
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function freshnessLabelForScore(score) {
  if (score >= 80) return "fresh";
  if (score >= 65) return "ageing";
  if (score >= 50) return "stale";
  return "refresh recommended";
}

function decayRiskForScore(score) {
  if (score < 50) return "high";
  if (score < 70) return "medium";
  return "low";
}

function suggestedRefreshType({ area, staleSignals, commercialLabel }) {
  const joined = staleSignals.join(" ").toLowerCase();
  if (area === "ai-transformation") return "refresh_ai_context";
  if (/weak cta|thin commercial path/.test(joined)) return commercialLabel === "high" ? "expand_service_alignment" : "strengthen_cta";
  if (/generic conclusion/.test(joined)) return "update_positioning";
  if (/older than|old publishedat|missing publishedat/.test(joined)) return "add_recent_context";
  if (area === "finance-accounting" || area === "manufacturing") return "refresh_examples";
  return "modernise_language";
}

function relatedGrowthClustersForArticle(article, growthReport) {
  const titleNorm = norm(article.title);
  const matches = (growthReport?.opportunities || [])
    .filter((op) => norm(op.title).includes(titleNorm) || titleNorm.includes(norm(op.title)))
    .map((op) => op.clusterTitle || op.canonicalOpportunityTitle || op.title)
    .filter(Boolean);
  return [...new Set(matches)].slice(0, 3);
}

function codexPrompt(entry) {
  return `Prepare a refresh plan only for this ERP Experts article.

Target:
- Slug: ${entry.slug}
- Title: ${entry.title}

Freshness signals:
${entry.staleSignals.map((s) => `- ${s}`).join("\n")}

Task:
- Propose a refresh plan with section-level recommendations
- Keep the article's current structure unless change is clearly necessary
- Suggest improved internal links and CTA alignment
- Include what should be updated now vs deferred

Constraints:
- Do not edit content yet; plan only
- Preserve existing article data shape
- Do not change routes/components
- Use natural UK English
- Do not invent facts, statistics, or customer stories.`;
}

function buildEntry(article, qaMap, growthReport) {
  const text = `${article.title} ${article.subtitle || ""} ${article.slug}`;
  const area = topicalArea(text);
  const monthsOld = ageMonths(article.publishedAt || article.datePublished || article.date);
  const commercialLabel = commercialIntentLabel(text);
  const qa = qaMap.get(article.slug);
  const staleSignals = [];

  let freshnessScore = 88;
  if (monthsOld === null) {
    freshnessScore -= 18;
    staleSignals.push("Missing publishedAt or invalid date.");
  } else if (monthsOld >= 30) {
    freshnessScore -= 28;
    staleSignals.push(`Older than ${monthsOld} months.`);
  } else if (monthsOld >= 18) {
    freshnessScore -= 18;
    staleSignals.push(`Ageing content at ${monthsOld} months old.`);
  } else if (monthsOld >= 12) {
    freshnessScore -= 10;
    staleSignals.push(`Over 12 months old (${monthsOld} months).`);
  }

  if (area === "ai-transformation") {
    freshnessScore -= 16;
    staleSignals.push("AI terminology and positioning may drift quickly.");
  }
  if (area === "finance-accounting") {
    freshnessScore -= 8;
    staleSignals.push("Finance/accounting guidance can age with reporting practice changes.");
  }
  if (area === "manufacturing") {
    freshnessScore -= 8;
    staleSignals.push("Manufacturing workflow context may evolve over time.");
  }

  const ctaText = `${article.ctaText || ""} ${article.ctaLabel || ""} ${article.ctaTo || ""}`.trim();
  if (!ctaText || !/support|implementation|netsuite|contact|partner|consult/i.test(norm(ctaText))) {
    freshnessScore -= 12;
    staleSignals.push("Weak CTA alignment for current commercial pathway.");
  }

  const conclusion = norm(article.conclusion || "");
  if (!conclusion || conclusion.length < 120 || /(in conclusion|to conclude|overall)/.test(conclusion)) {
    freshnessScore -= 8;
    staleSignals.push("Generic conclusion may feel stale.");
  }

  if (qa && Number(qa.categoryScores?.internalLinkReadiness || 0) < 80) {
    freshnessScore -= 6;
    staleSignals.push("Internal links could be strengthened for freshness and journey quality.");
  }

  const intentPenalty = commercialLabel === "high" ? 0 : commercialLabel === "medium" ? 4 : 8;
  freshnessScore -= intentPenalty;
  freshnessScore = clamp(freshnessScore);

  const freshnessLabel = freshnessLabelForScore(freshnessScore);
  const decayRisk = decayRiskForScore(freshnessScore);
  const commercialRisk = commercialLabel === "high" && freshnessScore < 70
    ? "high"
    : commercialLabel === "medium" && freshnessScore < 70
      ? "medium"
      : commercialLabel === "high"
        ? "medium"
        : "low";

  const refreshPriority = clamp((100 - freshnessScore) * 0.55 + (commercialLabel === "high" ? 30 : commercialLabel === "medium" ? 18 : 8));
  const suggestedType = suggestedRefreshType({ area, staleSignals, commercialLabel });
  const suggestedActions = [
    suggestedType,
    "improve_internal_links",
    commercialLabel === "high" ? "expand_service_alignment" : "strengthen_cta",
    area === "ai-transformation" ? "modernise_language" : "add_recent_context",
  ].filter((value, index, arr) => arr.indexOf(value) === index).slice(0, 3);

  const suggestedInternalLinks = ["/resources"];
  if (area === "implementation") suggestedInternalLinks.push("/implementation");
  if (area === "support") suggestedInternalLinks.push("/support");
  if (area === "finance-accounting" || area === "manufacturing") suggestedInternalLinks.push("/services/netsuite");
  if (area === "consulting-partner") suggestedInternalLinks.push("/partners");
  suggestedInternalLinks.push("/contact");

  const entry = {
    slug: article.slug,
    title: article.title,
    freshnessScore,
    decayRisk,
    freshnessLabel,
    publishedAtAge: monthsOld === null ? "unknown" : `${monthsOld} months`,
    estimatedMonthsOld: monthsOld,
    topicalArea: area,
    staleSignals,
    commercialRisk,
    refreshPriority,
    suggestedRefreshType: suggestedType,
    suggestedActions,
    suggestedInternalLinks: [...new Set(suggestedInternalLinks)],
    relatedGrowthClusters: relatedGrowthClustersForArticle(article, growthReport),
  };
  entry.codexPrompt = codexPrompt(entry);
  return entry;
}

function buildTrends(entries) {
  const byArea = new Map();
  entries.forEach((entry) => {
    const curr = byArea.get(entry.topicalArea) || { total: 0, ageingOrWorse: 0 };
    curr.total += 1;
    if (entry.freshnessLabel !== "fresh") curr.ageingOrWorse += 1;
    byArea.set(entry.topicalArea, curr);
  });

  const ageingInsights = [];
  for (const [area, stats] of byArea.entries()) {
    if (stats.ageingOrWorse >= 3) {
      ageingInsights.push(`${stats.ageingOrWorse} ageing ${area} articles detected.`);
    }
  }

  const aiEntries = entries.filter((entry) => entry.topicalArea === "ai-transformation");
  if (aiEntries.length > 0) {
    const avg = aiEntries.reduce((sum, item) => sum + item.freshnessScore, 0) / aiEntries.length;
    if (avg < 70) ageingInsights.push("AI content cluster ageing faster than average.");
  }

  return ageingInsights.slice(0, 3);
}

function printTop(entries) {
  const top = [...entries].sort((a, b) => b.refreshPriority - a.refreshPriority).slice(0, 10);
  console.log("SEO Freshness & Content Decay");
  console.log(`Analysed ${entries.length} articles.`);
  if (!top.length) {
    console.log("No freshness opportunities found.");
    return;
  }
  top.forEach((entry, idx) => {
    console.log(`${idx + 1}. ${entry.slug}`);
    console.log(`   Freshness: ${entry.freshnessScore}`);
    console.log(`   Risk: ${entry.decayRisk}`);
    console.log(`   Suggested: ${entry.suggestedRefreshType}`);
    console.log(`   Reason: ${entry.staleSignals[0] || "General refresh opportunity."}`);
  });
}

function main() {
  const qaReport = readJson(QA_REPORT_PATH, {});
  const growthReport = readJson(GROWTH_REPORT_PATH, null);
  const qaMap = new Map((qaReport?.articles || []).map((a) => [a.slug, a]));
  const articles = getArticleRecords();
  const entries = articles
    .filter((article) => qaMap.get(article.slug)?.gate === "pass")
    .map((article) => buildEntry(article, qaMap, growthReport))
    .sort((a, b) => b.refreshPriority - a.refreshPriority);

  const top = entries.slice(0, 10);
  const trends = buildTrends(entries);

  const report = {
    generatedAt: new Date().toISOString(),
    sourceReports: {
      articles: "src/data/articles.js",
      qaReport: path.relative(process.cwd(), QA_REPORT_PATH),
      growthReport: growthReport ? path.relative(process.cwd(), GROWTH_REPORT_PATH) : null,
    },
    gateSummary: qaReport?.gateSummary || {},
    articleCount: entries.length,
    trends,
    topRefreshCandidates: top,
    entries,
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  printTop(entries);
  console.log(`Report written: ${OUTPUT_PATH}`);
}

main();
