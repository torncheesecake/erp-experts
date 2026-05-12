import fs from "node:fs";
import path from "node:path";
import { getArticleRecords } from "./lib/load_articles.mjs";

const QA_REPORT_PATH = path.resolve("reports/resource-qa-report.json");
const GROWTH_REPORT_PATH = path.resolve("reports/seo-growth-opportunities.json");
const REPORTS_DATA_PATH = path.resolve("src/data/reports.json");
const OUTPUT_PATH = path.resolve("reports/seo-internal-link-opportunities.json");

const SERVICE_TARGETS = [
  { targetType: "service", targetPath: "/services/netsuite", targetTitle: "NetSuite Services", tags: ["netsuite", "erp", "integration"] },
  { targetType: "support", targetPath: "/support", targetTitle: "NetSuite Support", tags: ["support", "aftercare", "helpdesk", "maintenance"] },
  { targetType: "implementation", targetPath: "/implementation", targetTitle: "ERP Implementation", tags: ["implementation", "project", "deployment", "migration"] },
  { targetType: "partner", targetPath: "/partners", targetTitle: "ERP and NetSuite Partners", tags: ["partner", "consultant", "advisory"] },
  { targetType: "contact", targetPath: "/contact", targetTitle: "Contact ERP Experts", tags: ["contact", "review", "discussion"] },
];

const STOP_WORDS = new Set(["the", "and", "for", "with", "your", "from", "that", "this", "into", "about", "guide", "best", "should", "what", "how"]);

const norm = (s) => String(s || "").toLowerCase();
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function keywordTokens(input) {
  return norm(input)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function topicBucket(text) {
  const t = norm(text);
  if (/support|aftercare|helpdesk|maintenance/.test(t)) return "support";
  if (/implementation|project|migration|rescue|recovery/.test(t)) return "implementation";
  if (/manufactur|factory|warehouse|inventory/.test(t)) return "manufacturing";
  if (/finance|accounting|accounts|cfo|cash flow|reporting/.test(t)) return "finance";
  if (/partner|consultant|advisory/.test(t)) return "partner";
  if (/netsuite/.test(t)) return "netsuite";
  return "general";
}

function commercialLabel(text) {
  const t = norm(text);
  let score = 30;
  if (/netsuite|implementation|support|aftercare|consultant|partner|migration/.test(t)) score += 35;
  if (/manufactur|finance|accounting|reporting/.test(t)) score += 18;
  if (/what is erp|benefits of erp|future of work/.test(t)) score -= 10;
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function overlapScore(source, target) {
  const s = new Set(keywordTokens(source));
  const t = new Set(keywordTokens(target));
  if (s.size === 0 || t.size === 0) return 0;
  let common = 0;
  s.forEach((token) => {
    if (t.has(token)) common += 1;
  });
  return clamp((common / Math.max(2, Math.min(s.size, t.size))) * 100);
}

function anchorForTarget(targetTitle) {
  const t = norm(targetTitle);
  if (/benefits of erp/.test(t)) return "benefits of ERP systems";
  if (/support/.test(t)) return "NetSuite support options";
  if (/implementation/.test(t)) return "ERP implementation approach";
  if (/partner|consultant/.test(t)) return "ERP consultant guidance";
  if (/finance|accounting/.test(t)) return "finance and accounting ERP considerations";
  if (/manufactur/.test(t)) return "manufacturing ERP requirements";
  return targetTitle.replace(/^the\s+/i, "").replace(/\s+/g, " ").trim();
}

function placementForPair(sourceBucket, targetType) {
  if (targetType === "contact") return "CTA support";
  if (sourceBucket === "general") return "relevant section";
  if (sourceBucket === "support" || sourceBucket === "implementation") return "conclusion";
  if (targetType === "article") return "relevant section";
  return "CTA support";
}

function riskForOpportunity({ relevance, commercial, anchorText, sourceBucket, targetType }) {
  let risk = 20;
  if (relevance < 55) risk += 30;
  if (commercial > 75 && sourceBucket === "general" && targetType !== "article") risk += 20;
  if (/click here|learn more|read more/i.test(anchorText)) risk += 30;
  if (anchorText.split(" ").length < 2) risk += 20;
  if (risk >= 70) return "high";
  if (risk >= 45) return "medium";
  return "low";
}

function codexPrompt(op) {
  return `Prepare a proposed patch for this single internal link only.

Target:
- Source article slug: ${op.sourceSlug}
- Source title: ${op.sourceTitle}
- Suggested target: ${op.targetPath || op.targetSlug}
- Suggested anchor text: "${op.suggestedAnchorText}"
- Suggested placement: ${op.suggestedPlacement}

Task:
- Propose the exact edit in src/data/articles.js for the source article only
- Keep link text natural for UK English readers
- Include one contextual sentence if needed to support the link

Constraints:
- Do not apply the edit yet; propose patch only for review
- Do not add multiple links
- Preserve existing article data shape
- Do not change routes/components
- Do not invent facts, statistics, or customer stories.`;
}

function buildArticleTargets(articles, qaMap) {
  return articles
    .filter((article) => {
      const qa = qaMap.get(article.slug);
      return qa && qa.gate === "pass" && Number(qa.score || 0) >= 75;
    })
    .map((article) => ({
      targetType: "article",
      targetSlug: article.slug,
      targetPath: `/resources/${article.slug}`,
      targetTitle: article.title,
      tags: keywordTokens(`${article.title} ${article.subtitle || ""}`),
      bucket: topicBucket(`${article.title} ${article.slug}`),
    }));
}

function buildOpportunities({ articles, qaReport, growthReport, reportsData }) {
  const qaMap = new Map((qaReport?.articles || []).map((a) => [a.slug, a]));
  const sourceArticles = articles.filter((article) => {
    const qa = qaMap.get(article.slug);
    return qa && qa.gate === "pass";
  });
  const articleTargets = buildArticleTargets(articles, qaMap);
  const demandText = JSON.stringify(reportsData?.ga4Period?.seoInsights?.demandSignals || {}).toLowerCase();
  const growthTitles = new Set((growthReport?.topOpportunities || growthReport?.opportunities || []).map((o) => norm(o.title)));
  const seenPairs = new Set();
  const opportunities = [];
  let idCounter = 1;

  for (const source of sourceArticles) {
    const sourceText = `${source.title} ${source.subtitle || ""} ${source.slug}`;
    const sourceBucket = topicBucket(sourceText);
    const sourceIntent = commercialLabel(sourceText);

    const candidateTargets = [
      ...articleTargets.filter((target) => target.targetSlug !== source.slug),
      ...SERVICE_TARGETS.map((service) => ({ ...service, bucket: topicBucket(service.targetTitle) })),
    ];

    for (const target of candidateTargets) {
      const pairKey = `${source.slug}->${target.targetPath || target.targetSlug}`;
      if (seenPairs.has(pairKey)) continue;

      const relevance = target.targetType === "article"
        ? overlapScore(sourceText, `${target.targetTitle} ${target.bucket}`)
        : overlapScore(sourceText, `${target.targetTitle} ${target.tags.join(" ")}`);
      if (relevance < 50) continue;

      const demandBoost = demandText.includes(source.slug) || demandText.includes(norm(source.title)) ? 8 : 0;
      const growthBoost = growthTitles.has(norm(source.title)) ? 10 : 0;
      const commercialBase = sourceIntent === "high" ? 78 : sourceIntent === "medium" ? 62 : 45;
      const serviceBoost = target.targetType === "article" ? 0 : 10;
      const commercial = clamp(commercialBase + demandBoost + growthBoost + serviceBoost + Math.max(0, relevance - 60) * 0.35);

      const anchorText = anchorForTarget(target.targetTitle);
      const risk = riskForOpportunity({
        relevance,
        commercial,
        anchorText,
        sourceBucket,
        targetType: target.targetType,
      });
      if (risk === "high" && relevance < 65) continue;

      const placement = placementForPair(sourceBucket, target.targetType);
      const opportunity = {
        id: `link-op-${idCounter++}`,
        sourceSlug: source.slug,
        sourceTitle: source.title,
        targetType: target.targetType,
        targetSlug: target.targetSlug || null,
        targetPath: target.targetPath || null,
        targetTitle: target.targetTitle,
        suggestedAnchorText: anchorText,
        contextReason: `Source topic (${sourceBucket}) and target topic (${target.bucket || target.targetType}) are closely aligned.`,
        commercialIntentLabel: sourceIntent,
        topicalRelevanceScore: relevance,
        commercialValueScore: commercial,
        riskLabel: risk,
        suggestedPlacement: placement,
        whyItMatters: target.targetType === "article"
          ? "This link can deepen topical coverage and help users find the next relevant guide."
          : "This link can provide a clear path from educational content to an appropriate service next step.",
        sourceSignals: [
          "topic_overlap",
          demandBoost ? "demand_signal" : null,
          growthBoost ? "growth_priority_source" : null,
          target.targetType !== "article" ? "service_path_opportunity" : "article_path_opportunity",
        ].filter(Boolean),
      };
      opportunity.codexPrompt = codexPrompt(opportunity);
      opportunities.push(opportunity);
      seenPairs.add(pairKey);
    }
  }

  return opportunities
    .sort((a, b) => {
      if (b.topicalRelevanceScore !== a.topicalRelevanceScore) return b.topicalRelevanceScore - a.topicalRelevanceScore;
      if (b.commercialValueScore !== a.commercialValueScore) return b.commercialValueScore - a.commercialValueScore;
      const riskOrder = { low: 0, medium: 1, high: 2 };
      return riskOrder[a.riskLabel] - riskOrder[b.riskLabel];
    })
    .slice(0, 120);
}

function printTop(opportunities) {
  const top = opportunities.slice(0, 10);
  console.log("SEO Internal Link Opportunities");
  console.log(`Generated ${opportunities.length} opportunities.`);
  if (!top.length) {
    console.log("No opportunities found.");
    return;
  }
  top.forEach((op, index) => {
    console.log(`${index + 1}. ${op.sourceSlug} → ${op.targetSlug || op.targetPath}`);
    console.log(`   Anchor: "${op.suggestedAnchorText}"`);
    console.log(`   Placement: ${op.suggestedPlacement}`);
    console.log(`   Relevance: ${op.topicalRelevanceScore} · Commercial: ${op.commercialValueScore} · Risk: ${op.riskLabel}`);
  });
}

function main() {
  const qaReport = readJson(QA_REPORT_PATH, {});
  const growthReport = readJson(GROWTH_REPORT_PATH, null);
  const reportsData = readJson(REPORTS_DATA_PATH, {});
  const articles = getArticleRecords();
  const opportunities = buildOpportunities({ articles, qaReport, growthReport, reportsData });

  const output = {
    generatedAt: new Date().toISOString(),
    sourceReports: {
      articles: "src/data/articles.js",
      qaReport: path.relative(process.cwd(), QA_REPORT_PATH),
      growthReport: growthReport ? path.relative(process.cwd(), GROWTH_REPORT_PATH) : null,
      reportsData: path.relative(process.cwd(), REPORTS_DATA_PATH),
    },
    context: {
      gateSummary: qaReport?.gateSummary || {},
      growthAvailable: Boolean(growthReport),
    },
    opportunityCount: opportunities.length,
    topOpportunities: opportunities.slice(0, 10),
    opportunities,
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  printTop(opportunities);
  console.log(`Report written: ${OUTPUT_PATH}`);
}

main();
