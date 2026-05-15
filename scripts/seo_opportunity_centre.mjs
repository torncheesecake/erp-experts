import fs from "node:fs";
import path from "node:path";
import { loadTenantConfig, printTenantError } from "./platform/tenant_config.mjs";

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

const tenantId = getArgValue("--tenant", "erp-experts");
const tenantResult = loadTenantConfig(tenantId);

if (!tenantResult.ok) {
  printTenantError(tenantResult);
  process.exit(1);
}

const tenant = tenantResult.config;
const REPORTS_DIR = path.resolve(tenant.reportOutputPath || "reports");
const REPORT_PATHS = {
  growth: path.join(REPORTS_DIR, "seo-growth-opportunities.json"),
  links: path.join(REPORTS_DIR, "seo-internal-link-opportunities.json"),
  freshness: path.join(REPORTS_DIR, "seo-freshness-report.json"),
  conversion: path.join(REPORTS_DIR, "seo-conversion-paths.json"),
  qa: path.join(REPORTS_DIR, "resource-qa-report.json"),
  pipeline: path.join(REPORTS_DIR, "seo-pipeline-summary.json"),
};

const OUTPUT_PATH = path.join(REPORTS_DIR, "seo-opportunity-centre.json");
const typeWeights = { growth: 1.14, internal_link: 1.04, freshness: 0.97, conversion: 1.07, mixed: 1.12 };

const norm = (s) => String(s || "").toLowerCase().trim();
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

function toActionTheme(type) {
  if (type === "growth") return "content_creation";
  if (type === "internal_link") return "internal_linking";
  if (type === "freshness") return "refresh";
  if (type === "conversion") return "conversion_path";
  return "mixed";
}

function humanThemeLabel(theme) {
  if (theme === "content_creation") return "content creation";
  if (theme === "internal_linking") return "internal linking";
  if (theme === "refresh") return "refresh";
  if (theme === "conversion_path") return "conversion path";
  return "mixed";
}

function pickGroupTitle(item) {
  if (item.targetSlug) return item.title;
  if (item.targetPath) return `Path opportunity: ${item.targetPath}`;
  return item.canonicalOpportunityTitle || item.title;
}

function dedupeSignals(signals = []) {
  return [...new Set(signals.filter(Boolean))];
}

function buildGroupId(item) {
  if (item.targetSlug) return `slug:${item.targetSlug}`;
  if (item.targetPath) return `path:${item.targetPath}`;
  const canonical = norm(item.canonicalOpportunityTitle || item.title || "opportunity");
  return `title:${canonical}`;
}

function baseFromSignal(signal) {
  if (signal.kind === "growth") {
    return {
      sourceType: "growth",
      sourceId: signal.id || signal.title || "growth",
      title: signal.canonicalOpportunityTitle || signal.title,
      targetSlug: signal.targetSlug || null,
      targetPath: signal.targetPath || null,
      canonicalOpportunityTitle: signal.canonicalOpportunityTitle || signal.clusterTitle || signal.title,
      actionTheme: "content_creation",
      primaryType: "growth",
      score: signal.score || 0,
      effortLabel: effortFromType("growth"),
      confidenceLabel: "medium",
      whyThisRanks: signal.reason || signal.whyItMatters || "Demand-led growth opportunity.",
      recommendedAction: signal.suggestedAction || "Create a planning brief first.",
      nextCommandOrPrompt: "npm run seo:growth",
      codexPrompt: signal.codexPrompt || null,
      sourceSignals: ["growth"],
    };
  }

  if (signal.kind === "links") {
    return {
      sourceType: "internal_link",
      sourceId: signal.id || `${signal.sourceSlug}->${signal.targetSlug || signal.targetPath}`,
      title: `Strengthen internal path: ${signal.sourceTitle}`,
      targetSlug: signal.sourceSlug || null,
      targetPath: signal.targetPath || null,
      canonicalOpportunityTitle: signal.sourceTitle,
      actionTheme: "internal_linking",
      primaryType: "internal_link",
      score: clamp((signal.topicalRelevanceScore || 0) * 0.6 + (signal.commercialValueScore || 0) * 0.4),
      effortLabel: effortFromType("internal_link"),
      confidenceLabel: signal.riskLabel === "low" ? "high" : "medium",
      whyThisRanks: signal.whyItMatters || "Internal linking can improve journey and authority.",
      recommendedAction: `Review link ${signal.sourceSlug} → ${signal.targetSlug || signal.targetPath} before applying.`,
      nextCommandOrPrompt: "npm run seo:links",
      codexPrompt: signal.codexPrompt || null,
      sourceSignals: ["links"],
    };
  }

  if (signal.kind === "freshness") {
    return {
      sourceType: "freshness",
      sourceId: signal.slug || signal.title,
      title: signal.title,
      targetSlug: signal.slug || null,
      targetPath: null,
      canonicalOpportunityTitle: signal.title,
      actionTheme: "refresh",
      primaryType: "freshness",
      score: signal.refreshPriority || clamp(100 - (signal.freshnessScore || 0)),
      effortLabel: "medium",
      confidenceLabel: signal.decayRisk === "high" ? "high" : "medium",
      whyThisRanks: signal.staleSignals?.[0] || "Freshness decay signal detected.",
      recommendedAction: `Prepare a ${signal.suggestedRefreshType} plan before editing.`,
      nextCommandOrPrompt: "npm run seo:freshness",
      codexPrompt: signal.codexPrompt || null,
      sourceSignals: ["freshness"],
    };
  }

  return {
    sourceType: "conversion",
    sourceId: signal.slug || signal.title,
    title: signal.title,
    targetSlug: signal.slug || null,
    targetPath: signal.suggestedCTATarget || null,
    canonicalOpportunityTitle: signal.title,
    actionTheme: "conversion_path",
    primaryType: "conversion",
    score: signal.conversionPriority || clamp(100 - (signal.conversionPathScore || 0)),
    effortLabel: "medium",
    confidenceLabel: signal.intentLevel === "high" ? "high" : "medium",
    whyThisRanks: signal.whyItMatters || "Conversion path mismatch detected.",
    recommendedAction: signal.suggestedAction || "Prepare a CTA and journey improvement plan.",
    nextCommandOrPrompt: "npm run seo:conversion",
    codexPrompt: signal.codexPrompt || null,
    sourceSignals: ["conversion"],
  };
}

function mergeType(primary, supporting) {
  if (primary === supporting) return primary;
  return "mixed";
}

function mergeEffort(primary, supporting) {
  const rank = { low: 1, medium: 2, high: 3 };
  return rank[supporting] > rank[primary] ? supporting : primary;
}

function mergeConfidence(primary, supporting) {
  const rank = { low: 1, medium: 2, high: 3 };
  return rank[supporting] > rank[primary] ? supporting : primary;
}

function toSupportingAction(item, groupId) {
  return {
    id: `${groupId}:${item.sourceType}:${norm(item.sourceId) || Math.random().toString(36).slice(2, 7)}`,
    title: item.title,
    type: item.sourceType,
    score: item.score,
    actionTheme: item.actionTheme,
    whyThisRanks: item.whyThisRanks,
    recommendedAction: item.recommendedAction,
    nextCommandOrPrompt: item.nextCommandOrPrompt,
    codexPrompt: item.codexPrompt || null,
    sourceSignals: dedupeSignals(item.sourceSignals),
    groupRole: "supporting",
  };
}

function buildGroupedOpportunities(items) {
  const grouped = new Map();

  for (const item of items) {
    const groupId = buildGroupId(item);
    const existing = grouped.get(groupId);
    if (!existing) {
      grouped.set(groupId, {
        ...item,
        groupId,
        groupTitle: pickGroupTitle(item),
        groupRole: "primary",
        relatedActions: [],
        sourceSignalCount: dedupeSignals(item.sourceSignals).length,
      });
      continue;
    }

    const supporting = toSupportingAction(item, groupId);
    existing.relatedActions.push(supporting);
    existing.primaryType = mergeType(existing.primaryType, item.primaryType);
    existing.actionTheme = mergeType(existing.actionTheme, item.actionTheme);
    existing.effortLabel = mergeEffort(existing.effortLabel, item.effortLabel);
    existing.confidenceLabel = mergeConfidence(existing.confidenceLabel, item.confidenceLabel);
    existing.sourceSignals = dedupeSignals([...(existing.sourceSignals || []), ...(item.sourceSignals || [])]);
    existing.sourceSignalCount = existing.sourceSignals.length;
    existing.whyThisRanks = `${existing.whyThisRanks} ${item.whyThisRanks}`.trim();
    if (!existing.codexPrompt && item.codexPrompt) existing.codexPrompt = item.codexPrompt;
    if (!existing.targetPath && item.targetPath) existing.targetPath = item.targetPath;
    if (!existing.targetSlug && item.targetSlug) existing.targetSlug = item.targetSlug;
    existing.score = clamp((existing.score + item.score) / 2);
  }

  const merged = [...grouped.values()].map((entry, index) => {
    const overlapBoost = entry.sourceSignalCount > 1 ? 9 + (entry.sourceSignalCount - 2) * 3 : 0;
    const linkBoost = entry.actionTheme === "internal_linking" ? 4 : 0;
    const confidenceBoost = entry.confidenceLabel === "high" ? 4 : entry.confidenceLabel === "medium" ? 2 : 0;
    const effortBoost = entry.effortLabel === "low" ? 5 : entry.effortLabel === "medium" ? 2 : -2;
    const weighted = (entry.score || 0) * (typeWeights[entry.primaryType] || 1);
    const groupedScore = clamp(weighted + overlapBoost + linkBoost + confidenceBoost + effortBoost);
    const priorityLabel = groupedScore >= 85 ? "critical" : groupedScore >= 72 ? "high" : groupedScore >= 58 ? "medium" : "low";

    const relatedActions = (entry.relatedActions || [])
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    const combinedSignals = dedupeSignals(entry.sourceSignals || []);
    const actionTheme = entry.actionTheme === "mixed" ? "mixed" : toActionTheme(entry.primaryType);
    const themeLabel = humanThemeLabel(actionTheme);
    const summary = combinedSignals.length > 1
      ? `Combined ${combinedSignals.join(" + ")} signals for one target.`
      : `Single ${combinedSignals[0] || themeLabel} signal with clear next step.`;

    return {
      ...entry,
      id: `op-centre-${index + 1}`,
      score: groupedScore,
      priorityLabel,
      actionTheme,
      combinedSignals,
      sourceSignalCount: combinedSignals.length,
      relatedActions,
      whyThisRanks: `${summary} ${entry.whyThisRanks}`.trim(),
      groupRole: "primary",
    };
  });

  merged.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if ((b.sourceSignalCount || 0) !== (a.sourceSignalCount || 0)) {
      return (b.sourceSignalCount || 0) - (a.sourceSignalCount || 0);
    }
    return (b.relatedActions?.length || 0) - (a.relatedActions?.length || 0);
  });

  return merged;
}

function printTop(top) {
  console.log("SEO Opportunity Command Centre");
  console.log(`Tenant: ${tenant.name} (${tenant.tenantId})`);
  console.log(`Reports: ${path.relative(process.cwd(), REPORTS_DIR)}`);
  console.log(`Dashboard: ${tenant.dashboardRoute || "/seo-roadmap"}`);
  if (!top.length) {
    console.log("No unified opportunities found.");
    return;
  }
  top.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.groupTitle}`);
    console.log(`   Score: ${item.score} · ${item.priorityLabel} · ${item.primaryType} · theme ${item.actionTheme} · effort ${item.effortLabel} · confidence ${item.confidenceLabel}`);
    console.log(`   Signals (${item.sourceSignalCount}): ${(item.combinedSignals || []).join(" + ")}`);
    console.log(`   Action: ${item.recommendedAction}`);
    if (item.relatedActions?.length) {
      const sample = item.relatedActions.slice(0, 2).map((r) => `${r.type}: ${r.recommendedAction}`).join(" | ");
      console.log(`   Related actions (${item.relatedActions.length}): ${sample}`);
    }
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

  const growthSignals = (reports.growth?.topOpportunities || reports.growth?.opportunities || []).slice(0, 40).map((item) => ({ ...item, kind: "growth" }));
  const linkSignals = (reports.links?.opportunities || []).slice(0, 40).map((item) => ({ ...item, kind: "links" }));
  const freshnessSignals = (reports.freshness?.entries || []).slice(0, 40).map((item) => ({ ...item, kind: "freshness" }));
  const conversionSignals = (reports.conversion?.entries || []).slice(0, 40).map((item) => ({ ...item, kind: "conversion" }));

  const grouped = buildGroupedOpportunities([
    ...growthSignals.map(baseFromSignal),
    ...linkSignals.map(baseFromSignal),
    ...freshnessSignals.map(baseFromSignal),
    ...conversionSignals.map(baseFromSignal),
  ]);

  const topOpportunities = grouped.slice(0, 5);
  const output = {
    generatedAt: new Date().toISOString(),
    tenant: {
      tenantId: tenant.tenantId,
      name: tenant.name,
      baseUrl: tenant.baseUrl,
      dashboardRoute: tenant.dashboardRoute || "/seo-roadmap",
      reportOutputPath: tenant.reportOutputPath || "reports",
    },
    sourceReports: Object.fromEntries(Object.entries(REPORT_PATHS).map(([k, v]) => [k, path.relative(process.cwd(), v)])),
    missingReports: missing,
    gateSummary: reports.qa?.gateSummary || {},
    humanReviewRecommended: Boolean(reports.pipeline?.review?.humanReviewRecommended),
    opportunityCount: grouped.length,
    topOpportunities,
    opportunities: grouped,
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  printTop(topOpportunities);
  console.log(`Report written: ${OUTPUT_PATH}`);
}

main();
