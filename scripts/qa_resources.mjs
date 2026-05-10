import fs from "node:fs";
import path from "node:path";
import { getArticleRecords } from "./lib/load_articles.mjs";

const REPORT_PATH = path.resolve("reports/resource-qa-report.json");

const articles = getArticleRecords();
const structuralErrors = [];
const globalWarnings = [];
const articleReports = [];

const words = (text) => String(text || "").trim().split(/\s+/).filter(Boolean).length;
const normalise = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const slugMap = new Map();
const titleMap = new Map();

const nearDuplicatePairs = new Map();
for (let i = 0; i < articles.length; i += 1) {
  for (let j = i + 1; j < articles.length; j += 1) {
    const a = articles[i];
    const b = articles[j];
    const aSlug = normalise(a.slug);
    const bSlug = normalise(b.slug);
    const aTitle = normalise(a.title);
    const bTitle = normalise(b.title);

    const nearDuplicate =
      (aSlug && bSlug && (aSlug.includes(bSlug) || bSlug.includes(aSlug))) ||
      (aTitle && bTitle && (aTitle.includes(bTitle) || bTitle.includes(aTitle)));

    if (nearDuplicate) {
      nearDuplicatePairs.set(`${a.slug}::${b.slug}`, true);
    }
  }
}

function collectRepeatedPhraseWarnings(allArticles) {
  const warningList = [];
  const trackedPatterns = [
    { key: "clear ownership", pattern: /\bclear ownership\b/i, area: "conclusion/disclaimer/cta" },
    { key: "practical next step", pattern: /\bpractical next step\b/i, area: "conclusion/disclaimer/cta" },
    { key: "commercially meaningful", pattern: /\bcommercially meaningful\b/i, area: "conclusion/disclaimer/cta" },
    { key: "implementation consultation", pattern: /\bimplementation consultation\b/i, area: "cta" },
    { key: "support review", pattern: /\bsupport review\b/i, area: "cta" },
    { key: "audit/readiness check", pattern: /\baudit\/readiness check\b/i, area: "cta" },
  ];

  for (const tracked of trackedPatterns) {
    const matches = allArticles.filter((article) => {
      const text = [
        article.ctaText,
        article.ctaLabel,
        article.intro,
        article.conclusion,
        article.disclaimer,
      ].join(" ");
      return tracked.pattern.test(text);
    });

    if (matches.length >= 4) {
      warningList.push(
        `cross-article repeated phrase "${tracked.key}" in ${matches.length} articles (${tracked.area})`,
      );
    }
  }

  return warningList;
}

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function hasInternalLinkSignals(article) {
  const candidateFields = [
    article.ctaTo,
    article.ctaText,
    article.ctaLabel,
    article.intro,
    article.conclusion,
    article.disclaimer,
  ].filter(Boolean);

  const directInternalPath = String(article.ctaTo || "").startsWith("/");
  const routeMentions = candidateFields.some((v) =>
    /\/contact|\/support|\/implementation|\/case-studies|\/resources|\/partners|\/services/i.test(String(v)),
  );

  return {
    directInternalPath,
    routeMentions,
    hasSignal: directInternalPath || routeMentions,
  };
}

function scoreArticle(article) {
  const issues = { structural: [], warnings: [] };
  const slug = article.slug;

  const metadataFields = ["title", "subtitle", "cardDescription"];
  const missingMetadata = metadataFields.filter((field) => !String(article[field] || "").trim());
  if (missingMetadata.length > 0) {
    for (const f of missingMetadata) issues.structural.push(`missing ${f}`);
  }

  if (!String(article.conclusion || "").trim()) issues.structural.push("missing conclusion");
  if (!String(article.disclaimer || "").trim()) issues.structural.push("missing disclaimer");

  if (article.publishedAt) {
    const timestamp = new Date(article.publishedAt).getTime();
    if (Number.isNaN(timestamp)) issues.structural.push(`invalid publishedAt (${article.publishedAt})`);
  }

  const slugNorm = normalise(slug);
  const titleNorm = normalise(article.title);
  if (slugMap.has(slugNorm)) {
    issues.structural.push(`duplicate slug normalisation matches ${slugMap.get(slugNorm)}`);
  } else {
    slugMap.set(slugNorm, slug);
  }

  if (titleNorm && titleMap.has(titleNorm)) {
    issues.structural.push(`duplicate title matches ${titleMap.get(titleNorm)}`);
  } else if (titleNorm) {
    titleMap.set(titleNorm, slug);
  }

  const tips = Array.isArray(article.tips) ? article.tips : [];
  const thinTips = tips.filter((tip) => words(tip?.content) < 25);
  if (tips.length > 0 && thinTips.length > 0) {
    issues.warnings.push(`${thinTips.length} thin tip section(s) under 25 words`);
  }

  const introWords = words(article.intro);
  if (introWords < 60) issues.warnings.push("intro looks thin (<60 words)");

  const ctaText = [article.ctaText, article.ctaLabel].filter(Boolean).join(" ");
  const ctaTo = String(article.ctaTo || "");
  const serviceRelevantCTA = /contact|support|implementation|partners|case-studies|services|netsuite/i.test(
    `${ctaText} ${ctaTo}`,
  );
  if (!ctaTo || !serviceRelevantCTA) {
    issues.warnings.push("missing or weak service-relevant CTA");
  }

  const nearDupCount = articles.reduce((count, other) => {
    if (other.slug === slug) return count;
    const k1 = `${slug}::${other.slug}`;
    const k2 = `${other.slug}::${slug}`;
    return count + (nearDuplicatePairs.has(k1) || nearDuplicatePairs.has(k2) ? 1 : 0);
  }, 0);

  if (nearDupCount > 0) issues.warnings.push(`possible near-duplicate slug/title (${nearDupCount} match${nearDupCount > 1 ? "es" : ""})`);

  const totalTipWords = tips.reduce((sum, tip) => sum + words(tip?.content), 0);
  const bodyDepthWords = words(article.intro) + words(article.overviewSubtext) + totalTipWords + words(article.conclusion);

  const linkSignals = hasInternalLinkSignals(article);

  // Category scores (0-100)
  const metadataCompleteness = clamp(100 - missingMetadata.length * 34 - (article.conclusion ? 0 : 16) - (article.disclaimer ? 0 : 16));
  const contentDepth = clamp(
    (introWords >= 60 ? 35 : Math.round((introWords / 60) * 35)) +
    (bodyDepthWords >= 600 ? 45 : Math.round((bodyDepthWords / 600) * 45)) +
    (tips.length >= 4 ? 20 : tips.length * 5),
  );
  const duplicateRisk = clamp(100 - nearDupCount * 35);
  const ctaServiceRelevance = clamp((ctaTo ? 40 : 0) + (serviceRelevantCTA ? 60 : 20));

  let freshnessValidity = 65;
  if (article.publishedAt) {
    const publishedTs = new Date(article.publishedAt).getTime();
    if (Number.isNaN(publishedTs)) freshnessValidity = 0;
    else freshnessValidity = 100;
  }

  const internalLinkReadiness = clamp((linkSignals.directInternalPath ? 60 : 10) + (linkSignals.routeMentions ? 40 : 10));

  const weightedScore = clamp(
    Math.round(
      metadataCompleteness * 0.22 +
      contentDepth * 0.28 +
      duplicateRisk * 0.15 +
      ctaServiceRelevance * 0.15 +
      freshnessValidity * 0.10 +
      internalLinkReadiness * 0.10,
    ),
  );

  let gate = "pass";
  if (issues.structural.length > 0 || metadataCompleteness < 55 || freshnessValidity === 0) {
    gate = "blocked";
  } else if (weightedScore < 75 || issues.warnings.length >= 2 || duplicateRisk < 70 || ctaServiceRelevance < 60) {
    gate = "needs_review";
  }

  return {
    slug,
    title: article.title || "",
    gate,
    score: weightedScore,
    categoryScores: {
      metadataCompleteness,
      contentDepth,
      duplicateCannibalisationRisk: duplicateRisk,
      ctaServiceRelevance,
      freshnessPublishedAtValidity: freshnessValidity,
      internalLinkReadiness,
    },
    metrics: {
      introWords,
      bodyDepthWords,
      tipsCount: tips.length,
      thinTipsCount: thinTips.length,
      nearDuplicateMatches: nearDupCount,
      hasCTAPath: Boolean(ctaTo),
      hasServiceRelevantCTA: serviceRelevantCTA,
      hasPublishedAt: Boolean(article.publishedAt),
      internalPathCTA: linkSignals.directInternalPath,
      routeMentionSignals: linkSignals.routeMentions,
    },
    issues,
  };
}

for (const article of articles) {
  const report = scoreArticle(article);
  articleReports.push(report);

  for (const issue of report.issues.structural) structuralErrors.push(`${report.slug}: ${issue}`);
  for (const issue of report.issues.warnings) globalWarnings.push(`${report.slug}: ${issue}`);
}

for (const repeatedWarning of collectRepeatedPhraseWarnings(articles)) {
  globalWarnings.push(repeatedWarning);
}

const gateSummary = articleReports.reduce(
  (acc, a) => {
    acc[a.gate] += 1;
    return acc;
  },
  { pass: 0, needs_review: 0, blocked: 0 },
);

const reportPayload = {
  generatedAt: new Date().toISOString(),
  articleCount: articleReports.length,
  gateSummary,
  scoringModel: {
    categories: [
      "metadataCompleteness",
      "contentDepth",
      "duplicateCannibalisationRisk",
      "ctaServiceRelevance",
      "freshnessPublishedAtValidity",
      "internalLinkReadiness",
    ],
    weights: {
      metadataCompleteness: 0.22,
      contentDepth: 0.28,
      duplicateCannibalisationRisk: 0.15,
      ctaServiceRelevance: 0.15,
      freshnessPublishedAtValidity: 0.10,
      internalLinkReadiness: 0.10,
    },
    gateRules: {
      pass: "score >= 75 and no structural issues",
      needs_review: "score < 75 or multiple warnings or elevated duplicate/CTA risk",
      blocked: "any structural issue or critical metadata/freshness failure",
    },
  },
  articles: articleReports.sort((a, b) => a.score - b.score),
  structuralErrors,
  warnings: globalWarnings,
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(reportPayload, null, 2)}\n`, "utf8");

console.log("Resource QA Report");
console.log(`Checked ${articles.length} articles.`);
console.log(`Gate summary: pass=${gateSummary.pass}, needs_review=${gateSummary.needs_review}, blocked=${gateSummary.blocked}`);
console.log(`Report written: ${REPORT_PATH}`);

const preview = reportPayload.articles.slice(0, 5);
if (preview.length > 0) {
  console.log("Lowest scoring articles:");
  for (const row of preview) {
    console.log(`  - ${row.slug}: score ${row.score}, gate ${row.gate}`);
  }
}

if (structuralErrors.length > 0) {
  console.log(`FAIL: ${structuralErrors.length} structural error(s)`);
  for (const issue of structuralErrors) console.log(`  - ${issue}`);
}

if (globalWarnings.length > 0) {
  console.log(`WARN: ${globalWarnings.length} warning(s)`);
  for (const issue of globalWarnings) console.log(`  - ${issue}`);
}

process.exit(structuralErrors.length > 0 ? 1 : 0);
