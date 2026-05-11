import fs from "fs";

export function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function warningPriority(qa) {
  const warnings = qa?.issues?.warnings || [];
  const joined = warnings.join(" ").toLowerCase();
  const missingCta = /missing or weak service-relevant cta/.test(joined);
  const thin = /intro looks thin|thin/.test(joined);
  if (missingCta) return 0;
  if (thin) return 1;
  return 2;
}

export function buildFallbackPrompt(qa) {
  const warnings = qa?.issues?.warnings || [];
  const warningList = warnings.length
    ? warnings.map((w) => `- ${w}`).join("\n")
    : "- No explicit warnings listed; improve clarity and service relevance.";

  return `Improve one existing ERP Experts resource article safely.

Target article:
- Slug: ${qa.slug}
- Title: ${qa.title || qa.slug}
- File: src/data/articles.js

Fix these QA warnings:
${warningList}

Required improvements:
- Improve only this article object in src/data/articles.js.
- Strengthen intro if thin.
- Add or improve topic-relevant service CTA if missing.
- Expand thin sections if present.
- Strengthen conclusion.
- Add or validate publishedAt if missing.

Constraints:
- Preserve article data shape.
- Do not edit components or routes.
- Do not invent fake stats, customers, or case studies.
- Use UK English.
- Avoid repetitive CTA or conclusion phrasing.

After editing:
- npm run seo:after-edit -- ${qa.slug}`;
}

export function buildBatchQueue({ qaReport, briefs, maxItems = 3 }) {
  const qaBySlug = new Map((qaReport?.articles || []).map((a) => [a.slug, a]));
  const selected = new Set();

  const fromBriefs = (briefs || [])
    .filter((brief) => brief.recommendationType === "improve_existing" && brief.targetSlug)
    .map((brief) => {
      const qa = qaBySlug.get(brief.targetSlug);
      if (!qa || qa.gate !== "needs_review") return null;
      if ((qa?.issues?.structural || []).length > 0) return null;

      selected.add(brief.targetSlug);
      return {
        source: "brief",
        slug: brief.targetSlug,
        title: brief.preferredTitle || brief.targetArticleTitle || brief.targetSlug,
        qaScore: qa.score,
        priorityScore: brief.priorityScore ?? 0,
        commercialScore: brief.estimatedBusinessValue ?? 0,
        conversionIntentLabel: brief.conversionIntentLabel || "medium",
        topIssue: qa?.issues?.warnings?.[0] || "Needs quality improvement.",
        why:
          brief.whyThisMattersCommercially ||
          brief.whyThisMatters ||
          "This article is still underperforming against QA expectations.",
        fixSummary: (brief.suggestedContentChanges || []).slice(0, 2),
        command: `npm run seo:after-edit -- ${brief.targetSlug}`,
        prompt: brief.codexPatchPrompt || null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.commercialScore !== a.commercialScore) return b.commercialScore - a.commercialScore;
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      return a.qaScore - b.qaScore;
    });

  const fromQaFallback = (qaReport?.articles || [])
    .filter((qa) => qa.gate === "needs_review")
    .filter((qa) => (qa?.issues?.structural || []).length === 0)
    .filter((qa) => !selected.has(qa.slug))
    .map((qa) => ({
      source: "qa_fallback",
      slug: qa.slug,
      title: qa.title || qa.slug,
      qaScore: qa.score,
      priorityScore: 0,
      commercialScore: 0,
      conversionIntentLabel: "needs_review",
      topIssue: qa?.issues?.warnings?.[0] || "Needs quality improvement.",
      why: "No improve_existing brief was available, so this item is queued directly from QA needs_review.",
      fixSummary: (qa?.issues?.warnings || []).slice(0, 2).length
        ? (qa?.issues?.warnings || []).slice(0, 2)
        : ["Improve overall article quality and rerun QA."],
      warningPriority: warningPriority(qa),
      command: `npm run seo:after-edit -- ${qa.slug}`,
      prompt: buildFallbackPrompt(qa),
    }))
    .sort((a, b) => {
      if (a.qaScore !== b.qaScore) return a.qaScore - b.qaScore;
      if (a.warningPriority !== b.warningPriority) return a.warningPriority - b.warningPriority;
      return a.slug.localeCompare(b.slug);
    });

  const merged = [...fromBriefs];
  for (const fallback of fromQaFallback) {
    if (merged.length >= maxItems) break;
    merged.push(fallback);
  }

  return merged.slice(0, maxItems).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}
