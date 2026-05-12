import fs from "node:fs";
import path from "node:path";

const REPORT_PATHS = {
  growth: path.resolve("reports/seo-growth-opportunities.json"),
  links: path.resolve("reports/seo-internal-link-opportunities.json"),
  freshness: path.resolve("reports/seo-freshness-report.json"),
  conversion: path.resolve("reports/seo-conversion-paths.json"),
  qa: path.resolve("reports/resource-qa-report.json"),
  pipeline: path.resolve("reports/seo-pipeline-summary.json"),
};

const OUTPUT_PATH = path.resolve("reports/seo-opportunity-centre.json");

const norm = (s) => String(s || "").toLowerCase();
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function effortFromType(type) {
  if (type === "internal_link") return "low";
  if (type === "freshness" || type === "conversion") return "medium";
  return "high";
}

function baseFromSignal(signal) {
  if (signal.kind === "growth") {
    return {
      key: `slug:${signal.targetSlug || "none"}|path:${signal.targetPath || "none"}|title:${norm(signal.title)}`,
      title: signal.title,
      targetSlug: signal.targetSlug || null,
      targetPath: signal.targetPath || null,
      primaryType: "growth",
      score: signal.score || 0,
      effortLabel: effortFromType("growth"),
      confidenceLabel: "medium",
      sourceOpportunityIds: [signal.id].filter(Boolean),
      combinedSignals: ["growth"],
      whyThisRanks: signal.reason || signal.whyItMatters || "Growth opportunity from demand/content-gap layer.",
      recommendedAction: signal.suggestedAction || "Create a planning brief first.",
      nextCommandOrPrompt: "npm run seo:growth",
      codexPrompt: signal.codexPrompt || null,
    };
  }
  if (signal.kind === "links") {
    return {
      key: `slug:${signal.sourceSlug}|path:${signal.targetPath || signal.targetSlug || "none"}`,
      title: `Strengthen internal path: ${signal.sourceTitle}`,
      targetSlug: signal.sourceSlug || null,
      targetPath: signal.targetPath || null,
      primaryType: "internal_link",
      score: clamp((signal.topicalRelevanceScore || 0) * 0.6 + (signal.commercialValueScore || 0) * 0.4),
      effortLabel: effortFromType("internal_link"),
      confidenceLabel: signal.riskLabel === "low" ? "high" : "medium",
      sourceOpportunityIds: [signal.id].filter(Boolean),
      combinedSignals: ["links"],
      whyThisRanks: signal.whyItMatters || "Internal link opportunity with conversion support potential.",
      recommendedAction: `Review link ${signal.sourceSlug} → ${signal.targetSlug || signal.targetPath} before applying.`,
      nextCommandOrPrompt: "npm run seo:links",
      codexPrompt: signal.codexPrompt || null,
    };
  }
  if (signal.kind === "freshness") {
    return {
      key: `slug:${signal.slug}|freshness`,
      title: signal.title,
      targetSlug: signal.slug || null,
      targetPath: null,
      primaryType: "freshness",
      score: signal.refreshPriority || clamp(100 - (signal.freshnessScore || 0)),
      effortLabel: "medium",
      confidenceLabel: signal.decayRisk === "high" ? "high" : "medium",
      sourceOpportunityIds: [signal.slug].filter(Boolean),
      combinedSignals: ["freshness"],
      whyThisRanks: signal.staleSignals?.[0] || "Freshness decay signal detected.",
      recommendedAction: `Prepare a ${signal.suggestedRefreshType} plan before editing.`,
      nextCommandOrPrompt: "npm run seo:freshness",
      codexPrompt: signal.codexPrompt || null,
    };
  }
  return {
    key: `slug:${signal.slug}|conversion`,
    title: signal.title,
    targetSlug: signal.slug || null,
    targetPath: signal.suggestedCTATarget || null,
    primaryType: "conversion",
    score: signal.conversionPriority || clamp(100 - (signal.conversionPathScore || 0)),
    effortLabel: "medium",
    confidenceLabel: signal.intentLevel === "high" ? "high" : "medium",
    sourceOpportunityIds: [signal.slug].filter(Boolean),
    combinedSignals: ["conversion"],
    whyThisRanks: signal.whyItMatters || "Conversion-path mismatch detected.",
    recommendedAction: signal.suggestedAction || "Prepare a CTA/conclusion improvement plan.",
    nextCommandOrPrompt: "npm run seo:conversion",
    codexPrompt: signal.codexPrompt || null,
  };
}

function mergeSignals(items) {
  const grouped = new Map();
  for (const item of items) {
    const existing = grouped.get(item.key);
    if (!existing) {
      grouped.set(item.key, { ...item });
      continue;
    }
    existing.score = clamp((existing.score + item.score) / 2);
    existing.sourceOpportunityIds = [...new Set([...(existing.sourceOpportunityIds || []), ...(item.sourceOpportunityIds || [])])];
    existing.combinedSignals = [...new Set([...(existing.combinedSignals || []), ...(item.combinedSignals || [])])];
    existing.whyThisRanks = `${existing.whyThisRanks} ${item.whyThisRanks}`.trim();
    if (existing.primaryType !== item.primaryType) existing.primaryType = "mixed";
    if (existing.effortLabel === "high" || item.effortLabel === "high") existing.effortLabel = "high";
    else if (existing.effortLabel === "medium" || item.effortLabel === "medium") existing.effortLabel = "medium";
    else existing.effortLabel = "low";
    if (existing.confidenceLabel === "high" || item.confidenceLabel === "high") existing.confidenceLabel = "high";
    else if (existing.confidenceLabel === "medium" || item.confidenceLabel === "medium") existing.confidenceLabel = "medium";
    else existing.confidenceLabel = "low";
    if (!existing.codexPrompt && item.codexPrompt) existing.codexPrompt = item.codexPrompt;
  }

  const merged = [...grouped.values()].map((entry, index) => {
    let score = entry.score;
    const signalCount = (entry.combinedSignals || []).length;
    if (signalCount > 1) score += 8 + (signalCount - 2) * 3;
    if (entry.effortLabel === "low") score += 6;
    if (entry.confidenceLabel === "high") score += 5;
    score = clamp(score);

    const priorityLabel = score >= 85 ? "critical" : score >= 72 ? "high" : score >= 58 ? "medium" : "low";
    return {
      ...entry,
      id: `op-centre-${index + 1}`,
      score,
      priorityLabel,
    };
  });

  merged.sort((a, b) => b.score - a.score);
  return merged;
}

function printTop(top) {
  console.log("SEO Opportunity Command Centre");
  if (!top.length) {
    console.log("No unified opportunities found.");
    return;
  }
  top.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.title}`);
    console.log(`   Score: ${item.score} · ${item.priorityLabel} · ${item.primaryType} · effort ${item.effortLabel} · confidence ${item.confidenceLabel}`);
    console.log(`   Signals: ${(item.combinedSignals || []).join(" + ")}`);
    console.log(`   Why: ${item.whyThisRanks}`);
    console.log(`   Action: ${item.recommendedAction}`);
  });
}

function main() {
  const reports = Object.fromEntries(Object.entries(REPORT_PATHS).map(([k, v]) => [k, readJson(v)]));
  const missing = Object.entries(reports).filter(([, v]) => !v).map(([k]) => k);

  if (missing.length > 0) {
    console.log("Missing source reports:");
    missing.forEach((name) => console.log(`- ${name}`));
    console.log("");
    console.log("Suggested commands:");
    console.log("npm run seo:growth");
    console.log("npm run seo:links");
    console.log("npm run seo:freshness");
    console.log("npm run seo:conversion");
  }

  const growthSignals = (reports.growth?.topOpportunities || reports.growth?.opportunities || []).slice(0, 30).map((item) => ({ ...item, kind: "growth" }));
  const linkSignals = (reports.links?.opportunities || []).slice(0, 30).map((item) => ({ ...item, kind: "links" }));
  const freshnessSignals = (reports.freshness?.entries || []).slice(0, 30).map((item) => ({ ...item, kind: "freshness" }));
  const conversionSignals = (reports.conversion?.entries || []).slice(0, 30).map((item) => ({ ...item, kind: "conversion" }));

  const unified = mergeSignals([
    ...growthSignals.map(baseFromSignal),
    ...linkSignals.map(baseFromSignal),
    ...freshnessSignals.map(baseFromSignal),
    ...conversionSignals.map(baseFromSignal),
  ]);

  const topOpportunities = unified.slice(0, 5);
  const output = {
    generatedAt: new Date().toISOString(),
    sourceReports: Object.fromEntries(Object.entries(REPORT_PATHS).map(([k, v]) => [k, path.relative(process.cwd(), v)])),
    missingReports: missing,
    gateSummary: reports.qa?.gateSummary || {},
    humanReviewRecommended: Boolean(reports.pipeline?.review?.humanReviewRecommended),
    opportunityCount: unified.length,
    topOpportunities,
    opportunities: unified,
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  printTop(topOpportunities);
  console.log(`Report written: ${OUTPUT_PATH}`);
}

main();
