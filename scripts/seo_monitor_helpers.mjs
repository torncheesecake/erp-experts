import fs from "fs";
import path from "path";

function toNum(value) {
  return Number(value || 0);
}

export function listSnapshotDirs(historyRoot = "reports/history") {
  try {
    const entries = fs.readdirSync(historyRoot, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

export function readSnapshotQa(snapshotDir, historyRoot = "reports/history") {
  const fullPath = path.join(historyRoot, snapshotDir, "resource-qa-report.json");
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch {
    return null;
  }
}

export function buildMonitorState({ qaReport, pipelineSummary }) {
  const gate = qaReport?.gateSummary || {};
  const pass = toNum(gate.pass);
  const needsReview = toNum(gate.needs_review);
  const blocked = toNum(gate.blocked);
  const humanReviewRecommended = Boolean(pipelineSummary?.review?.humanReviewRecommended);

  const snapshotDirs = listSnapshotDirs();
  const latestSnapshot = snapshotDirs.at(-1) || null;
  const previousSnapshot = snapshotDirs.length > 1 ? snapshotDirs.at(-2) : null;
  const latestQa = latestSnapshot ? readSnapshotQa(latestSnapshot) : null;
  const previousQa = previousSnapshot ? readSnapshotQa(previousSnapshot) : null;

  const currentGate = latestQa?.gateSummary || qaReport?.gateSummary || {};
  const previousGate = previousQa?.gateSummary || {};
  const passChange = toNum(currentGate.pass) - toNum(previousGate.pass);
  const needsReviewChange = toNum(currentGate.needs_review) - toNum(previousGate.needs_review);
  const blockedChange = toNum(currentGate.blocked) - toNum(previousGate.blocked);

  const currentArticles = new Map((latestQa?.articles || qaReport?.articles || []).map((a) => [a.slug, a]));
  const previousArticles = new Map((previousQa?.articles || []).map((a) => [a.slug, a]));

  const newlyFailing = [];
  const newlyBlocked = [];
  for (const [slug, article] of currentArticles.entries()) {
    const prevGate = previousArticles.get(slug)?.gate || null;
    if (!prevGate) continue;
    if (prevGate === "pass" && article.gate !== "pass") newlyFailing.push(slug);
    if (prevGate !== "blocked" && article.gate === "blocked") newlyBlocked.push(slug);
  }

  const hasRegression =
    passChange < 0 ||
    needsReviewChange > 0 ||
    blockedChange > 0 ||
    newlyFailing.length > 0 ||
    newlyBlocked.length > 0;

  let status = "HEALTHY";
  if (humanReviewRecommended || blocked > 0) status = "ACTION REQUIRED";
  else if (needsReview > 0 || hasRegression) status = "WARNING";

  return {
    status,
    pass,
    needsReview,
    blocked,
    humanReviewRecommended,
    hasRegression,
    latestSnapshot,
    previousSnapshot,
    passChange,
    needsReviewChange,
    blockedChange,
    newlyFailing,
    newlyBlocked,
  };
}
