import fs from "node:fs";
import path from "node:path";
import { getArticleRecords } from "./lib/load_articles.mjs";

const QA_REPORT_PATH = path.resolve("reports/resource-qa-report.json");
const BRIEFS_REPORT_PATH = path.resolve("reports/seo-action-briefs.json");
const WEEKLY_REPORT_PATH = path.resolve("reports/seo-weekly-summary.json");
const PIPELINE_REPORT_PATH = path.resolve("reports/seo-pipeline-summary.json");
const REPORTS_DATA_PATH = path.resolve("src/data/reports.json");
const OUTPUT_PATH = path.resolve("reports/seo-growth-opportunities.json");

const norm = (s) => String(s || "").toLowerCase();
const slugify = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function dateAgeDays(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const ms = Date.now() - parsed.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function commercialIntentForText(text) {
  const t = norm(text);
  let score = 35;
  if (/netsuite|implementation|support|aftercare|rescue|failed implementation|partner|consultant|migration/.test(t)) score += 30;
  if (/manufactur|factory|production|warehouse|inventory/.test(t)) score += 14;
  if (/finance|accounting|accounts|cfo|reporting|cash flow/.test(t)) score += 12;
  if (/what is erp|benefits of erp|future of work|generative ai/.test(t)) score -= 15;
  score = clamp(score);
  return {
    score,
    label: score >= 75 ? "high" : score >= 50 ? "medium" : "low",
  };
}

function effortLabelForType(type) {
  if (type === "improve_internal_links" || type === "refresh_existing") return "low";
  if (type === "strengthen_commercial_path") return "medium";
  if (type === "expand_cluster") return "medium";
  return "high";
}

function codexPromptForOpportunity(op) {
  if (op.type === "create_new_resource") {
    return `Create a planning brief only for a potential ERP Experts resource topic.

Target:
- Proposed title: ${op.title}
- Suggested slug: ${op.suggestedSlug}

Task:
- Propose a draft outline with section headings
- Propose a service-relevant CTA angle
- Propose suggested internal links from existing resources/services
- Keep it as a planning brief only

Constraints:
- Do not write or publish a full article
- Do not invent facts, statistics, customer stories, or named clients
- Use UK English
- Keep recommendations commercially useful for ERP/NetSuite decision makers.`;
  }

  if (op.type === "improve_internal_links") {
    return `Suggest internal linking improvements only for ERP Experts resources.

Target article:
- Slug: ${op.targetSlug}
- Title: ${op.title}

Task:
- Suggest contextual internal links to add and where they should appear
- Prioritise links that improve user journey towards relevant ERP/NetSuite services
- Keep this as link recommendations only

Constraints:
- Do not edit article content automatically
- Do not change routes/components
- Use UK English
- Keep suggestions specific and commercially relevant.`;
  }

  return `Review this SEO growth opportunity and produce a concise implementation brief:
- Opportunity: ${op.type}
- Target: ${op.title}${op.targetSlug ? ` (${op.targetSlug})` : ""}
- Suggested action: ${op.suggestedAction}

Constraints:
- Do not auto-edit or auto-publish content
- Use UK English
- Do not invent unsupported claims.`;
}

function inferredClusterForText(text) {
  const t = norm(text);
  if (/erp consultant|erp consultants|independent erp consultant|erp consultant uk|consultant in the uk/.test(t)) {
    return {
      clusterId: "cluster-erp-consultant-uk",
      clusterTitle: "ERP Consultant Selection Guide for UK Businesses",
      canonicalOpportunityTitle: "ERP Consultant Selection Guide for UK Businesses",
    };
  }
  if (/netsuite support|netsuite aftercare|netsuite maintenance|netsuite helpdesk/.test(t)) {
    return {
      clusterId: "cluster-netsuite-support",
      clusterTitle: "NetSuite Support and Aftercare Guidance",
      canonicalOpportunityTitle: "NetSuite Support and Aftercare Guidance",
    };
  }
  if (/manufacturing erp|erp for manufacturers|factory erp|warehouse erp/.test(t)) {
    return {
      clusterId: "cluster-manufacturing-erp",
      clusterTitle: "Manufacturing ERP Selection and Improvement",
      canonicalOpportunityTitle: "Manufacturing ERP Selection and Improvement",
    };
  }
  if (/finance erp|accounting erp|finance systems|accounts receivable|cfo/.test(t)) {
    return {
      clusterId: "cluster-finance-erp",
      clusterTitle: "Finance and Accounting ERP Improvement",
      canonicalOpportunityTitle: "Finance and Accounting ERP Improvement",
    };
  }
  return null;
}

function applyOpportunityClustering(opportunities) {
  const seeded = opportunities.map((op) => {
    const inferred = inferredClusterForText(`${op.title} ${op.suggestedAction || ""} ${(op.evidence || []).join(" ")}`);
    if (!inferred) {
      return {
        ...op,
        clusterId: null,
        clusterTitle: null,
        clusterRole: "primary",
        mergedQueries: [],
        relatedIdeas: [],
        canonicalOpportunityTitle: op.title,
      };
    }
    return {
      ...op,
      ...inferred,
      clusterRole: "primary",
      mergedQueries: [],
      relatedIdeas: [],
    };
  });

  const grouped = new Map();
  for (const op of seeded) {
    const key = op.clusterId || `single-${op.id}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(op);
  }

  const finalList = [];
  for (const [key, items] of grouped.entries()) {
    if (!key.startsWith("cluster-") || items.length === 1) {
      finalList.push(...items);
      continue;
    }

    const sorted = [...items].sort((a, b) => b.score - a.score);
    const primary = sorted[0];
    const supporting = sorted.slice(1);
    const mergedQueries = [...new Set(supporting.map((item) => item.rawQuery || item.title).filter(Boolean))];
    const relatedIdeas = [...new Set(supporting.map((item) => item.title).filter(Boolean))];

    finalList.push({
      ...primary,
      title: primary.canonicalOpportunityTitle || primary.title,
      clusterRole: "primary",
      mergedQueries,
      relatedIdeas,
      whyItMatters: `${primary.whyItMatters} Similar intent variants are grouped to avoid duplicate roadmap noise.`,
    });

    supporting.forEach((item, idx) => {
      finalList.push({
        ...item,
        clusterRole: idx === 0 ? "supporting" : "variant",
        mergedQueries: [],
        relatedIdeas: [],
      });
    });
  }

  finalList.sort((a, b) => b.score - a.score);
  return finalList;
}

function buildTopOpportunities(opportunities, limit = 5) {
  const primaries = opportunities.filter((op) => op.clusterRole === "primary");
  const sortedPrimaries = [...primaries].sort((a, b) => b.score - a.score);
  return sortedPrimaries.slice(0, limit);
}

function buildCreateNewOpportunities({ briefs, demandSignals, existingSlugs }) {
  const createBriefs = (briefs?.allBriefs || briefs?.briefs || []).filter((b) => b.recommendationType === "create_new");
  return createBriefs.slice(0, 8).map((brief, index) => {
    const title = brief.preferredTitle || brief.targetArticleTitle || brief.targetTitle || `Demand opportunity ${index + 1}`;
    const suggestedSlug = slugify(title);
    const demandScore = Math.min(35, Math.round((brief.priorityScore || 0) * 0.35));
    const intent = commercialIntentForText(`${title} ${brief.rawQuery || ""}`);
    const exists = existingSlugs.has(suggestedSlug);
    const score = clamp((brief.priorityScore || 0) * 0.45 + demandScore + intent.score * 0.35 + (exists ? -30 : 0));
    const evidence = [
      `Demand-led brief priority ${brief.priorityScore || 0}`,
      brief.rawQuery ? `Raw query: ${brief.rawQuery}` : null,
      `Commercial intent ${intent.label}`,
      exists ? "Similar slug already exists and should be reviewed before creation." : "No matching slug found in current resources.",
    ].filter(Boolean);

    const op = {
      id: `growth-create-${index + 1}`,
      type: "create_new_resource",
      title,
      rawQuery: brief.rawQuery || null,
      targetSlug: null,
      suggestedSlug,
      score,
      commercialIntentLabel: intent.label,
      effortLabel: effortLabelForType("create_new_resource"),
      whyItMatters: "This topic appears commercially relevant and currently under-covered in the resource library.",
      evidence,
      suggestedAction: exists
        ? "Review overlap first, then decide whether to create a new page or expand an existing resource."
        : "Create a brief for a new demand-led resource, then review internally before any drafting.",
      suggestedInternalLinks: ["/resources", "/services/netsuite", "/contact"],
      suggestedCTA: brief.recommendedCTA || "implementation consultation",
      sourceSignals: ["search_demand", "content_gap"],
    };
    op.codexPrompt = codexPromptForOpportunity(op);
    return op;
  });
}

function buildInternalLinkOpportunities({ qaReport, articles }) {
  const bySlug = new Map((qaReport?.articles || []).map((a) => [a.slug, a]));
  const candidates = articles
    .map((article) => {
      const qa = bySlug.get(article.slug);
      const linkScore = Number(qa?.categoryScores?.internalLinkReadiness || 0);
      const intent = commercialIntentForText(`${article.title} ${article.slug}`);
      const score = clamp(55 + (intent.score * 0.3) + ((80 - linkScore) * 0.35));
      return { article, qa, linkScore, intent, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return candidates.map((entry, idx) => {
    const op = {
      id: `growth-links-${idx + 1}`,
      type: "improve_internal_links",
      title: entry.article.title,
      targetSlug: entry.article.slug,
      suggestedSlug: null,
      score: entry.score,
      commercialIntentLabel: entry.intent.label,
      effortLabel: effortLabelForType("improve_internal_links"),
      whyItMatters: "Improving internal links can increase discoverability and strengthen paths from education to service pages.",
      evidence: [
        `Internal link readiness score ${entry.linkScore || "n/a"}`,
        `QA gate ${entry.qa?.gate || "unknown"}`,
      ],
      suggestedAction: "Add contextual links to relevant services and related resources, then re-check internal link readiness.",
      suggestedInternalLinks: ["/services/netsuite", "/implementation", "/support", "/contact"],
      suggestedCTA: null,
      sourceSignals: ["internal_link_leverage", "commercial_path"],
    };
    op.codexPrompt = codexPromptForOpportunity(op);
    return op;
  });
}

function buildCommercialPathOpportunities({ articles, qaReport }) {
  const qaBySlug = new Map((qaReport?.articles || []).map((a) => [a.slug, a]));
  const rows = articles
    .map((article) => {
      const qa = qaBySlug.get(article.slug);
      const cta = `${article.ctaText || ""} ${article.ctaLabel || ""} ${article.ctaTo || ""}`;
      const hasServicePath = /support|implementation|contact|netsuite|partner|consult/i.test(norm(cta));
      const intent = commercialIntentForText(`${article.title} ${article.slug}`);
      const freshness = Number(qa?.categoryScores?.freshnessPublishedAtValidity || 100);
      let score = intent.score * 0.6 + (hasServicePath ? 20 : 38) + (100 - freshness) * 0.1;
      if (hasServicePath) score -= 10;
      return { article, qa, intent, hasServicePath, score: clamp(score) };
    })
    .filter((row) => row.intent.label !== "low")
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return rows.map((row, idx) => {
    const op = {
      id: `growth-path-${idx + 1}`,
      type: "strengthen_commercial_path",
      title: row.article.title,
      targetSlug: row.article.slug,
      suggestedSlug: null,
      score: row.score,
      commercialIntentLabel: row.intent.label,
      effortLabel: effortLabelForType("strengthen_commercial_path"),
      whyItMatters: "High-intent educational pages can drive stronger qualified enquiries when the service path is clearer.",
      evidence: [
        `Commercial intent ${row.intent.label}`,
        row.hasServicePath ? "Service CTA exists but may be strengthened." : "Service CTA path appears weak or missing.",
      ],
      suggestedAction: "Tighten CTA alignment with the article topic and ensure a clear next step to relevant service pages.",
      suggestedInternalLinks: ["/implementation", "/support", "/services/netsuite", "/contact"],
      suggestedCTA: row.intent.label === "high" ? "implementation consultation" : "audit/readiness check",
      sourceSignals: ["commercial_usefulness", "cta_alignment"],
    };
    op.codexPrompt = codexPromptForOpportunity(op);
    return op;
  });
}

function buildRefreshOpportunities({ articles }) {
  const rows = articles
    .map((article) => {
      const age = dateAgeDays(article.publishedAt || article.datePublished || article.date);
      const intent = commercialIntentForText(`${article.title} ${article.slug}`);
      if (age === null) return { article, age: null, intent, score: clamp(intent.score * 0.35 + 45) };
      const ageFactor = age > 365 ? 30 : age > 240 ? 22 : age > 180 ? 14 : 0;
      return { article, age, intent, score: clamp(intent.score * 0.35 + ageFactor + 28) };
    })
    .filter((row) => row.age === null || row.age > 180)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return rows.map((row, idx) => {
    const op = {
      id: `growth-refresh-${idx + 1}`,
      type: "refresh_existing",
      title: row.article.title,
      targetSlug: row.article.slug,
      suggestedSlug: null,
      score: row.score,
      commercialIntentLabel: row.intent.label,
      effortLabel: effortLabelForType("refresh_existing"),
      whyItMatters: "Refreshing older resources helps keep recommendations and service pathways current for decision-makers.",
      evidence: [
        row.age === null ? "Published date missing or invalid." : `Published approximately ${row.age} days ago.`,
      ],
      suggestedAction: "Review freshness, update examples or references where needed, and validate publishedAt format.",
      suggestedInternalLinks: ["/resources", "/contact"],
      suggestedCTA: "audit/readiness check",
      sourceSignals: ["freshness_signal"],
    };
    op.codexPrompt = codexPromptForOpportunity(op);
    return op;
  });
}

function buildClusterOpportunities({ articles, demandSignals }) {
  const buckets = [
    { key: "implementation", pattern: /implementation|project|rescue|migration/ },
    { key: "support", pattern: /support|aftercare|helpdesk|maintenance/ },
    { key: "manufacturing", pattern: /manufactur|factory|warehouse|inventory/ },
    { key: "finance", pattern: /finance|accounting|accounts|cfo|cash flow/ },
    { key: "consulting", pattern: /consultant|partner|advisory/ },
  ];
  const demandText = JSON.stringify(demandSignals || {});
  const ops = [];

  for (const bucket of buckets) {
    const matches = articles.filter((article) => bucket.pattern.test(norm(`${article.title} ${article.slug}`)));
    if (matches.length === 0 || matches.length > 2) continue;
    const demandBoost = bucket.pattern.test(norm(demandText)) ? 16 : 8;
    const score = clamp(54 + demandBoost + (2 - matches.length) * 8);
    const title = `${bucket.key.charAt(0).toUpperCase() + bucket.key.slice(1)} content cluster expansion`;
    const op = {
      id: `growth-cluster-${bucket.key}`,
      type: "expand_cluster",
      title,
      targetSlug: null,
      suggestedSlug: `${bucket.key}-erp-guide-uk`,
      score,
      commercialIntentLabel: bucket.key === "consulting" || bucket.key === "implementation" ? "high" : "medium",
      effortLabel: effortLabelForType("expand_cluster"),
      whyItMatters: "A light cluster can limit topical authority and internal-link depth for commercially relevant queries.",
      evidence: [
        `${matches.length} current resource article${matches.length === 1 ? "" : "s"} in this cluster.`,
        bucket.pattern.test(norm(demandText)) ? "Demand signals reference this topic area." : "Cluster is commercially relevant even with lower visible demand.",
      ],
      suggestedAction: `Create a supporting brief for one additional ${bucket.key} guide and plan links from existing related resources.`,
      suggestedInternalLinks: matches.slice(0, 3).map((m) => `/resources/${m.slug}`),
      suggestedCTA: bucket.key === "implementation" ? "implementation consultation" : "audit/readiness check",
      sourceSignals: ["cluster_gap", "content_gap"],
    };
    op.codexPrompt = codexPromptForOpportunity(op);
    ops.push(op);
  }
  return ops;
}

function printTop(opportunities) {
  const top = buildTopOpportunities(opportunities, 5);
  console.log("SEO Growth Opportunities");
  console.log(`Generated ${opportunities.length} opportunities (${top.length} primary top opportunities shown).`);
  if (!top.length) {
    console.log("No growth opportunities found.");
    return;
  }
  top.forEach((op, index) => {
    const scope = op.targetSlug ? "existing article improvement/linking" : "new article planning brief";
    console.log(`${index + 1}. ${op.title}`);
    console.log(`   - type: ${op.type}`);
    console.log(`   - score: ${op.score}`);
    console.log(`   - commercial intent: ${op.commercialIntentLabel}`);
    if (op.clusterTitle) {
      console.log(`   - cluster: ${op.clusterTitle}`);
    }
    if (Array.isArray(op.relatedIdeas) && op.relatedIdeas.length > 0) {
      console.log(`   - related ideas: ${op.relatedIdeas.join(" | ")}`);
    }
    console.log(`   - suggested action: ${op.suggestedAction}`);
    console.log(`   - scope: ${scope}`);
  });
}

function main() {
  const qaReport = readJson(QA_REPORT_PATH, {});
  const briefsReport = readJson(BRIEFS_REPORT_PATH, {});
  const weeklySummary = readJson(WEEKLY_REPORT_PATH, {});
  const pipelineSummary = readJson(PIPELINE_REPORT_PATH, {});
  const reportsData = readJson(REPORTS_DATA_PATH, {});
  const articles = getArticleRecords();
  const existingSlugs = new Set(articles.map((a) => a.slug));
  const demandSignals = reportsData?.ga4Period?.seoInsights?.demandSignals || {};

  const rawOpportunities = [
    ...buildCreateNewOpportunities({ briefs: briefsReport, demandSignals, existingSlugs }),
    ...buildInternalLinkOpportunities({ qaReport, articles }),
    ...buildCommercialPathOpportunities({ articles, qaReport }),
    ...buildRefreshOpportunities({ articles }),
    ...buildClusterOpportunities({ articles, demandSignals }),
  ];
  const opportunities = applyOpportunityClustering(rawOpportunities);
  const topOpportunities = buildTopOpportunities(opportunities, 5);

  const output = {
    generatedAt: new Date().toISOString(),
    sourceReports: {
      qaReport: path.relative(process.cwd(), QA_REPORT_PATH),
      briefsReport: path.relative(process.cwd(), BRIEFS_REPORT_PATH),
      weeklySummary: path.relative(process.cwd(), WEEKLY_REPORT_PATH),
      pipelineSummary: path.relative(process.cwd(), PIPELINE_REPORT_PATH),
      reportsData: path.relative(process.cwd(), REPORTS_DATA_PATH),
      articles: "src/data/articles.js",
    },
    context: {
      gateSummary: qaReport?.gateSummary || {},
      humanReviewRecommended: Boolean(pipelineSummary?.review?.humanReviewRecommended),
      weeklyHeadline: weeklySummary?.headlineSummary || "",
      demandSignalCount: Array.isArray(demandSignals?.topDemandGaps) ? demandSignals.topDemandGaps.length : 0,
    },
    opportunityCount: opportunities.length,
    topOpportunityCount: topOpportunities.length,
    topOpportunities,
    opportunities,
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  printTop(opportunities);
  console.log(`Report written: ${OUTPUT_PATH}`);
}

main();
