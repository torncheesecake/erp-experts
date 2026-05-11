import { execSync } from "child_process";
import fs from "fs";

const DRY_RUN = process.argv.includes("--dry-run");
const ALLOWLIST = new Set([
  "src/data/articles.js",
  "reports/resource-qa-report.json",
  "reports/seo-action-briefs.json",
  "reports/seo-pipeline-summary.json",
  "reports/seo-weekly-summary.json",
]);

function run(command, options = {}) {
  const { quiet = false } = options;
  if (!quiet) {
    console.log(`\n$ ${command}`);
  }
  try {
    const output = execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    if (!quiet && output.trim()) console.log(output.trimEnd());
    return output;
  } catch (error) {
    const stdout = error?.stdout?.toString?.() || "";
    const stderr = error?.stderr?.toString?.() || "";
    if (!quiet && stdout.trim()) console.log(stdout.trimEnd());
    if (!quiet && stderr.trim()) console.error(stderr.trimEnd());
    throw new Error(`Command failed: ${command}`);
  }
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function parseGitStatus() {
  const raw = run("git status --porcelain", { quiet: true });
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.replace(/\r$/, ""))
    .filter((line) => line.length > 0)
    .map((line) => {
      const status = line.slice(0, 2);
      const file = line.slice(3).trim();
      return { status, file };
    });
}

function unexpectedStatusEntries(entries) {
  return entries.filter(({ file }) => !ALLOWLIST.has(file));
}

function stagedAllowlistFiles(entries) {
  return entries
    .filter(({ file }) => ALLOWLIST.has(file))
    .map(({ file }) => file);
}

function printQueue(queueOutput) {
  const lines = queueOutput.split("\n");
  const start = lines.findIndex((line) => line.includes("Top 3 batch queue"));
  if (start === -1) return "Queue output unavailable.";
  return lines.slice(start).join("\n").trim();
}

function fail(message) {
  console.error(`\n${message}`);
  process.exit(1);
}

function main() {
  console.log(`SEO batch completion helper (${DRY_RUN ? "dry run" : "live mode"})`);

  run("npm run lint");
  run("npm run build");
  run("npm run seo:pipeline");
  const statsOutput = run("npm run seo:stats");
  const batchOutput = run("npm run seo:batch");

  if (!/Stats current:\s+yes/i.test(statsOutput)) {
    fail("Stats are not current. Resolve this manually before running seo:batch:complete.");
  }

  const qaReport = readJson("reports/resource-qa-report.json");
  const pipelineSummary = readJson("reports/seo-pipeline-summary.json");
  readJson("reports/seo-action-briefs.json");
  readJson("reports/seo-weekly-summary.json");

  const gate = qaReport?.gateSummary || {};
  const pass = Number(gate.pass || 0);
  const needsReview = Number(gate.needs_review || 0);
  const blocked = Number(gate.blocked || 0);
  const humanReviewRecommended = Boolean(pipelineSummary?.review?.humanReviewRecommended);

  if (blocked > 0) {
    fail(`Blocked count is ${blocked}. Resolve blocked items before completing batch.`);
  }
  if (humanReviewRecommended) {
    fail("Human review is recommended. Stop and review manually before completing batch.");
  }

  const statusEntries = parseGitStatus();
  const unexpected = unexpectedStatusEntries(statusEntries);
  if (unexpected.length > 0) {
    const unexpectedList = unexpected.map((entry) => `- ${entry.status} ${entry.file}`).join("\n");
    fail(`Unexpected files found. Resolve these manually before running seo:batch:complete.\n${unexpectedList}`);
  }

  const filesToStage = [...new Set(stagedAllowlistFiles(statusEntries))];
  if (filesToStage.length === 0) {
    fail("No article/report changes found to commit.");
  }

  console.log("\nAllowed files ready:");
  filesToStage.forEach((file) => console.log(`- ${file}`));

  const queueSummary = printQueue(batchOutput);

  if (DRY_RUN) {
    console.log("\nDry run summary");
    console.log(`- pass=${pass}, needs_review=${needsReview}, blocked=${blocked}`);
    console.log(`- humanReviewRecommended=${humanReviewRecommended ? "yes" : "no"}`);
    console.log("- would commit message: Improve SEO article batch");
    console.log("- would push: origin main");
    console.log("\nNext batch queue:");
    console.log(queueSummary);
    console.log("\nFinal git status:");
    const liveStatus = run("git status --short", { quiet: true }).trim();
    console.log(liveStatus || "(clean)");
    return;
  }

  run(`git add ${filesToStage.join(" ")}`);
  run('git commit -m "Improve SEO article batch"');
  const commitHash = run("git rev-parse --short HEAD", { quiet: true }).trim();
  const pushOutput = run("git push origin main");

  console.log("\nCompletion summary");
  console.log(`- commit hash: ${commitHash}`);
  console.log(`- push result: ${/->\s+main|Everything up-to-date/i.test(pushOutput) ? "success" : "check output"}`);
  console.log(`- pass=${pass}, needs_review=${needsReview}, blocked=${blocked}`);
  console.log(`- humanReviewRecommended=${humanReviewRecommended ? "yes" : "no"}`);
  console.log("\nNext batch queue:");
  console.log(queueSummary);
  console.log("\nFinal git status:");
  const finalStatus = run("git status --short", { quiet: true }).trim();
  console.log(finalStatus || "(clean)");
}

main();
