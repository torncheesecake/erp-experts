import fs from "fs";
import { buildBatchQueue, readJson } from "./seo_batch_helpers.mjs";

const OUTPUT_PATH = "reports/seo-next-batch-prompt.md";

function nowIso() {
  return new Date().toISOString();
}

function formatFixes(item) {
  const fixes = Array.isArray(item.fixSummary) ? item.fixSummary.filter(Boolean) : [];
  if (fixes.length === 0) return "- Improve quality and rerun QA checks.";
  return fixes.map((line) => `- ${line}`).join("\n");
}

function buildPrompt(queue) {
  const header = `# SEO Next Batch Prompt

Generated: ${nowIso()}

You are improving a batch of ${queue.length} SEO resource articles.

Work sequentially, not all at once.
Do not move to the next article until the current one passes checks.
`;

  if (queue.length === 0) {
    return `${header}
No batch-ready article improvements found.

Run \`npm run seo:pipeline\` to refresh reports, then run \`npm run seo:batch\` and \`npm run seo:batch:prompt\` again.
`;
  }

  const selectedList = queue
    .map((item) => `- ${item.rank}. ${item.title} (\`${item.slug}\`)`)
    .join("\n");

  const articleSections = queue
    .map((item) => {
      return `## Article ${item.rank}

- Title: ${item.title}
- Slug: ${item.slug}
- QA score: ${item.qaScore}
- Priority: ${item.priorityScore}
- Top issue: ${item.topIssue || "Needs quality improvement."}
- Source: ${item.source}
- Command after edit: \`${item.command}\`

Why this matters:
- ${item.why || "Needs quality improvement before publishing confidence increases."}

Suggested fixes:
${formatFixes(item)}
`;
    })
    .join("\n");

  const afterEach = queue.map((item) => `- ${item.command}`).join("\n");

  return `${header}
Selected articles:
${selectedList}

${articleSections}
## Global constraints

- Only edit the specified article objects in \`src/data/articles.js\`.
- Preserve article data shape.
- Do not edit routes or components.
- Do not invent fake statistics, customers, or case studies.
- Use UK English.
- Avoid repetitive CTA and conclusion phrasing.

## Validation after each article

${afterEach}

Stop immediately if any of these occur:
- lint fails
- build fails
- an article remains needs_review after editing
- blocked count becomes greater than 0
- humanReviewRecommended becomes true

## Final validation after all articles

- npm run lint
- npm run build
- npm run seo:pipeline
- npm run seo:stats
- npm run seo:batch

## Delivery summary format

- Article slug
- What changed
- QA result after edit
- Any warnings still present
- Final pass/needs_review/blocked totals
`;
}

function main() {
  const qaReport = readJson("reports/resource-qa-report.json");
  const briefsReport = readJson("reports/seo-action-briefs.json");
  const queue = buildBatchQueue({ qaReport, briefs: briefsReport.briefs || [] });
  const prompt = buildPrompt(queue);
  fs.writeFileSync(OUTPUT_PATH, prompt, "utf8");

  console.log(`Wrote batch prompt: ${OUTPUT_PATH}`);
  if (queue.length === 0) {
    console.log("No batch-ready article improvements found.");
    return;
  }
  console.log("Selected queue:");
  queue.forEach((item) => {
    console.log(`- ${item.rank}. ${item.slug} (QA ${item.qaScore}, priority ${item.priorityScore})`);
  });
}

main();
