import fs from "node:fs";
import path from "node:path";
import { getArticleRecords } from "./lib/load_articles.mjs";

const OUTPUT_PATH = path.resolve("reports/seo-decision-engine.json");
const BRIEFS_DIR = path.resolve("reports/briefs");

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "best", "business", "businesses", "by", "for", "from",
  "guide", "how", "in", "is", "of", "on", "or", "should", "the", "to", "uk", "with", "your",
]);

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function readBriefs() {
  if (!fs.existsSync(BRIEFS_DIR)) return [];
  return fs.readdirSync(BRIEFS_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const fullPath = path.join(BRIEFS_DIR, file);
      const text = fs.readFileSync(fullPath, "utf8");
      return { file, path: path.relative(process.cwd(), fullPath), text };
    });
}

function normaliseText(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(value = "") {
  return normaliseText(value)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function slugify(value = "") {
  return normaliseText(value).replace(/\s+/g, "-");
}

function tokenSimilarity(left = "", right = "") {
  const a = new Set(tokens(left));
  const b = new Set(tokens(right));
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const token of a) {
    if (b.has(token)) shared += 1;
  }
  return shared / Math.min(a.size, b.size);
}

function commercialValueFor(item = {}) {
  const label = String(item.commercialIntentLabel || item.priorityLabel || "").toLowerCase();
  const score = Number(item.score || 0);
  if (label.includes("critical") || label.includes("high") || score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

function effortFor(item = {}) {
  return item.effortLabel || (Number(item.score || 0) >= 80 ? "medium" : "low");
}

function confidenceFor({ decisionType, overlap, briefSignals, item }) {
  if (briefSignals.revise || briefSignals.overlap || overlap.score >= 0.7) return "high";
  if (decisionType === "create_new" && Number(item.score || 0) >= 80) return "medium";
  if (overlap.score >= 0.45) return "medium";
  return "medium";
}

function findBestOverlap(item, articles) {
  const title = item.groupTitle || item.canonicalOpportunityTitle || item.title || "";
  const relatedIdeas = [
    ...(Array.isArray(item.relatedIdeas) ? item.relatedIdeas : []),
    ...(Array.isArray(item.mergedQueries) ? item.mergedQueries : []),
  ];
  const candidates = articles.map((article) => {
    const articleText = `${article.title || ""} ${article.slug || ""} ${article.subtitle || ""}`;
    const titleScore = tokenSimilarity(title, articleText);
    const relatedScore = relatedIdeas.length
      ? Math.max(...relatedIdeas.map((idea) => tokenSimilarity(idea, articleText)))
      : 0;
    const score = Math.max(titleScore, relatedScore);
    return { slug: article.slug, title: article.title || article.slug, score };
  });
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || { slug: "", title: "", score: 0 };
}

function findBriefSignals(item, briefs) {
  const title = item.groupTitle || item.title || "";
  const itemSlug = item.targetSlug || item.suggestedSlug || slugify(title);
  const matching = briefs.find((brief) => {
    const haystack = normaliseText(`${brief.file} ${brief.text.slice(0, 2000)}`);
    return haystack.includes(normaliseText(itemSlug).replaceAll("-", " "))
      || tokenSimilarity(title, brief.text.slice(0, 1200)) >= 0.45;
  });
  const text = matching?.text || "";
  const lower = text.toLowerCase();
  return {
    briefPath: matching?.path || "",
    revise: lower.includes("revise before proceeding") || lower.includes("recommendation\n\nrevise"),
    overlap: lower.includes("overlap") || lower.includes("cannibalisation") || lower.includes("duplicate"),
    expandExisting: lower.includes("expand") && lower.includes("existing"),
    createNarrower: lower.includes("narrower") || lower.includes("distinct search intent"),
  };
}

function decisionForOpportunity({ item, articles, plans, growthItems, briefs }) {
  const title = item.groupTitle || item.canonicalOpportunityTitle || item.title || "Untitled opportunity";
  const overlap = findBestOverlap(item, articles);
  const briefSignals = findBriefSignals(item, briefs);
  const relatedIdeas = [
    ...(Array.isArray(item.relatedIdeas) ? item.relatedIdeas : []),
    ...(Array.isArray(item.mergedQueries) ? item.mergedQueries : []),
  ];
  const relatedActions = Array.isArray(item.relatedActions) ? item.relatedActions : [];
  const plan = plans.find((entry) => entry.title === title || entry.id === `plan-${item.id}`) || null;
  const growth = growthItems.find((entry) => (entry.clusterTitle || entry.title) === title || entry.id === item.id) || null;
  const type = String(item.primaryType || item.type || growth?.type || "").toLowerCase();
  const actionTheme = String(item.actionTheme || "").toLowerCase();
  const score = Number(item.score || growth?.score || 0);
  const overlapStrong = overlap.score >= 0.55 || briefSignals.overlap;
  const clustered = relatedIdeas.length > 1 || Array.isArray(growth?.relatedIdeas) && growth.relatedIdeas.length > 1;
  const multiEngineRefresh = relatedActions.some((action) => action.type === "freshness")
    && relatedActions.some((action) => action.type === "conversion" || action.type === "internal_link");

  let decisionType = "monitor_only";
  let preferredPath = "Monitor the opportunity and revisit after stronger demand or commercial evidence.";
  let reasoning = "The opportunity has limited immediate evidence or does not currently justify content changes.";
  let nextRecommendedCommand = "npm run seo:monitor";
  let targetSlug = item.targetSlug || growth?.targetSlug || "";
  let cannibalisationRisk = "low";
  const alternativePaths = [];

  if (overlapStrong && (type.includes("growth") || type.includes("create") || actionTheme === "content_creation")) {
    decisionType = "expand_existing";
    targetSlug = overlap.slug;
    cannibalisationRisk = overlap.score >= 0.75 || briefSignals.overlap ? "high" : "medium";
    preferredPath = `Expand and differentiate the existing article "${overlap.title}" instead of creating a competing broad resource.`;
    reasoning = "Existing content already covers the core search intent. The lower-risk path is to add UK-specific selection criteria, internal links, and a clearer consultant-selection CTA to the current article.";
    nextRecommendedCommand = `Create expansion brief for existing article: ${overlap.slug}`;
    alternativePaths.push("Create a narrower specialist article later if Matthew confirms a distinct audience such as UK software companies or NetSuite buyers.");
  } else if (multiEngineRefresh || actionTheme === "mixed" || actionTheme === "refresh") {
    decisionType = "refresh_existing";
    targetSlug = item.targetSlug || overlap.slug || growth?.targetSlug || "";
    cannibalisationRisk = overlapStrong ? "medium" : "low";
    preferredPath = `Refresh the existing target ${targetSlug || title} before considering new content.`;
    reasoning = "Freshness, conversion, and internal-link signals point to improving an existing page rather than creating a new resource.";
    nextRecommendedCommand = item.nextCommandOrPrompt || "npm run seo:freshness";
    alternativePaths.push("Defer new content creation until the refreshed page has been validated.");
  } else if (clustered && !overlapStrong) {
    decisionType = "create_new";
    cannibalisationRisk = "medium";
    preferredPath = "Create one canonical primary article and treat clustered variants as supporting angles, not separate pages.";
    reasoning = "Multiple related variants point to one demand cluster. A single canonical resource is safer than publishing several near-duplicates.";
    nextRecommendedCommand = plan?.id ? `npm run seo:plan:run -- ${plan.id}` : "npm run seo:plans";
    alternativePaths.push("Split into supporting specialist articles only after the canonical article proves useful.");
  } else if ((type.includes("create") || actionTheme === "content_creation") && score >= 70) {
    decisionType = "create_new";
    cannibalisationRisk = "low";
    preferredPath = "Create a planning brief for a new resource before drafting.";
    reasoning = "The topic has commercial value and no strong existing-content overlap was detected.";
    nextRecommendedCommand = plan?.id ? `npm run seo:plan:run -- ${plan.id}` : "npm run seo:plans";
  } else if (score < 50 && effortFor(item) === "high") {
    decisionType = "monitor_only";
    preferredPath = "Do not act this week. Monitor until there is stronger commercial or demand evidence.";
    reasoning = "The effort is high relative to the detected opportunity value.";
    nextRecommendedCommand = "npm run seo:monitor";
  }

  if (briefSignals.revise && decisionType === "create_new") {
    decisionType = "merge_topics";
    cannibalisationRisk = "high";
    preferredPath = "Merge the topic into the existing related article or revise the angle before any drafting.";
    reasoning = "The planning brief already flagged overlap risk and recommended revision before proceeding.";
    nextRecommendedCommand = targetSlug ? `Create merge/expansion brief for existing article: ${targetSlug}` : "Review planning brief before drafting.";
  }

  const confidence = confidenceFor({ decisionType, overlap, briefSignals, item });
  const codexDecisionPrompt = `Create a strategic execution recommendation only.\n\nDecision: ${decisionType}\nTopic: ${title}\nPreferred path: ${preferredPath}\nTarget slug: ${targetSlug || "n/a"}\n\nTask:\n- Produce a short decision memo for Matthew\n- Include the safest next action and what should not happen yet\n- Do not edit articles, routes, components, or reports\n- Use UK English\n- Do not invent facts, statistics, customers, or case studies.`;

  return {
    id: `decision-${item.id || slugify(title)}`,
    title,
    targetSlug: targetSlug || null,
    decisionType,
    confidence,
    reasoning,
    cannibalisationRisk,
    preferredPath,
    alternativePaths: alternativePaths.length ? alternativePaths : ["Monitor and revisit after the next SEO autopilot run."],
    estimatedImpact: score >= 80 ? "high" : score >= 60 ? "medium" : "low",
    estimatedEffort: effortFor(item),
    commercialValue: commercialValueFor(item),
    reviewRequired: decisionType !== "monitor_only",
    nextRecommendedCommand,
    codexDecisionPrompt,
    sourceSignals: item.combinedSignals || item.sourceSignals || [],
    relatedBrief: briefSignals.briefPath || null,
    overlapArticle: overlap.slug ? { slug: overlap.slug, title: overlap.title, score: Number(overlap.score.toFixed(2)) } : null,
  };
}

function decisionRank(decision) {
  const typeWeight = {
    expand_existing: 100,
    create_new: 90,
    refresh_existing: 80,
    merge_topics: 75,
    split_cluster: 70,
    monitor_only: 20,
    reject: 0,
  }[decision.decisionType] ?? 30;
  const riskWeight = decision.cannibalisationRisk === "high" ? 15 : decision.cannibalisationRisk === "medium" ? 8 : 0;
  const impactWeight = decision.estimatedImpact === "high" ? 15 : decision.estimatedImpact === "medium" ? 8 : 0;
  return typeWeight + riskWeight + impactWeight;
}

function main() {
  const opportunitiesReport = readJson("reports/seo-opportunity-centre.json", {});
  const plansReport = readJson("reports/seo-execution-plans.json", {});
  const qaReport = readJson("reports/resource-qa-report.json", {});
  const growthReport = readJson("reports/seo-growth-opportunities.json", {});
  const articles = getArticleRecords();
  const briefs = readBriefs();
  const opportunities = Array.isArray(opportunitiesReport.topOpportunities)
    ? opportunitiesReport.topOpportunities
    : Array.isArray(opportunitiesReport.opportunities)
      ? opportunitiesReport.opportunities
      : [];
  const plans = Array.isArray(plansReport.plans) ? plansReport.plans : [];
  const growthItems = Array.isArray(growthReport.opportunities) ? growthReport.opportunities : [];

  const decisions = opportunities
    .map((item) => decisionForOpportunity({ item, articles, plans, growthItems, briefs }))
    .sort((a, b) => decisionRank(b) - decisionRank(a));

  const output = {
    generatedAt: new Date().toISOString(),
    gateSummary: qaReport.gateSummary || null,
    decisionCount: decisions.length,
    topDecisions: decisions.slice(0, 5),
    decisions,
    sourceReports: {
      opportunities: "reports/seo-opportunity-centre.json",
      plans: "reports/seo-execution-plans.json",
      qa: "reports/resource-qa-report.json",
      growth: "reports/seo-growth-opportunities.json",
      briefsDir: fs.existsSync(BRIEFS_DIR) ? "reports/briefs" : null,
      articles: "src/data/articles.js",
    },
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log("SEO Strategic Decisions");
  decisions.slice(0, 5).forEach((decision, index) => {
    console.log(`${index + 1}. ${decision.title}`);
    console.log(`   Decision: ${decision.decisionType}`);
    console.log(`   Confidence: ${decision.confidence} · Cannibalisation: ${decision.cannibalisationRisk}`);
    console.log(`   Reason: ${decision.reasoning}`);
    console.log(`   Next: ${decision.nextRecommendedCommand}`);
  });
  console.log(`Report written: ${OUTPUT_PATH}`);
}

main();
