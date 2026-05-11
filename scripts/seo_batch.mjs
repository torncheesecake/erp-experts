import fs from "fs";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function buildQueue({ qaReport, briefs }) {
  const qaBySlug = new Map((qaReport?.articles || []).map((a) => [a.slug, a]));
  const selected = new Set();
  const warningPriority = (qa) => {
    const warnings = qa?.issues?.warnings || [];
    const joined = warnings.join(" ").toLowerCase();
    const missingCta = /missing or weak service-relevant cta/.test(joined);
    const thin = /intro looks thin|thin/.test(joined);
    if (missingCta) return 0;
    if (thin) return 1;
    return 2;
  };

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
        intent: brief.conversionIntentLabel || "medium",
        topIssue: qa?.issues?.warnings?.[0] || "Needs quality improvement.",
        command: `npm run seo:after-edit -- ${brief.targetSlug}`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.commercialScore !== a.commercialScore) return b.commercialScore - a.commercialScore;
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      return a.qaScore - b.qaScore;
    });

  const fromQa = (qaReport?.articles || [])
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
      intent: "needs_review",
      topIssue: qa?.issues?.warnings?.[0] || "Needs quality improvement.",
      warningPriority: warningPriority(qa),
      command: `npm run seo:after-edit -- ${qa.slug}`,
    }))
    .sort((a, b) => {
      if (a.qaScore !== b.qaScore) return a.qaScore - b.qaScore;
      if (a.warningPriority !== b.warningPriority) return a.warningPriority - b.warningPriority;
      return a.slug.localeCompare(b.slug);
    });

  const merged = [...fromBriefs];
  for (const item of fromQa) {
    if (merged.length >= 3) break;
    merged.push(item);
  }
  return merged.slice(0, 3);
}

const qaReport = readJson("reports/resource-qa-report.json");
const briefsReport = readJson("reports/seo-action-briefs.json");
const queue = buildQueue({ qaReport, briefs: briefsReport.briefs || [] });

if (!queue.length) {
  console.log("No batch-ready article improvements found.");
  process.exit(0);
}

console.log("Top 3 batch queue (improve_existing, needs_review):");
queue.forEach((item, idx) => {
  console.log(`\n${idx + 1}. ${item.title}`);
  console.log(`   slug: ${item.slug}`);
  console.log(`   source: ${item.source}`);
  console.log(`   qaScore: ${item.qaScore}`);
  console.log(`   priorityScore: ${item.priorityScore}`);
  console.log(`   intent: ${item.intent}`);
  console.log(`   topIssue: ${item.topIssue}`);
  console.log(`   command: ${item.command}`);
});
