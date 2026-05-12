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

function snapshotGate(snapshotQa) {
  const gate = snapshotQa?.gateSummary || {};
  return {
    pass: toNum(gate.pass),
    needsReview: toNum(gate.needs_review),
    blocked: toNum(gate.blocked),
  };
}

function isHealthyGate(gate) {
  return toNum(gate?.needsReview) === 0 && toNum(gate?.blocked) === 0;
}

function countConsecutiveHealthy(snapshots) {
  let count = 0;
  for (let i = snapshots.length - 1; i >= 0; i -= 1) {
    if (!isHealthyGate(snapshots[i]?.gate)) break;
    count += 1;
  }
  return count;
}

function countConsecutiveRegressions(snapshots) {
  let count = 0;
  for (let i = snapshots.length - 1; i >= 0; i -= 1) {
    if (isHealthyGate(snapshots[i]?.gate)) break;
    count += 1;
  }
  return count;
}

function recoverySnapshotsAgo(snapshots) {
  if (snapshots.length < 2) return null;
  const latest = snapshots[snapshots.length - 1];
  if (!isHealthyGate(latest?.gate)) return null;
  for (let i = snapshots.length - 2; i >= 0; i -= 1) {
    if (!isHealthyGate(snapshots[i]?.gate)) {
      return snapshots.length - 1 - i;
    }
  }
  return null;
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
  const snapshotSeries = snapshotDirs
    .map((snapshot) => ({ snapshot, qa: readSnapshotQa(snapshot) }))
    .filter((entry) => Boolean(entry.qa))
    .map((entry) => ({
      snapshot: entry.snapshot,
      gate: snapshotGate(entry.qa),
    }));

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

  const currentTotals = {
    pass: toNum(currentGate.pass),
    needsReview: toNum(currentGate.needs_review),
    blocked: toNum(currentGate.blocked),
  };
  const previousTotals = {
    pass: toNum(previousGate.pass),
    needsReview: toNum(previousGate.needs_review),
    blocked: toNum(previousGate.blocked),
  };

  return {
    status,
    regressionSeverity: status,
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
    currentTotals,
    previousTotals,
    newlyFailing,
    newlyBlocked,
    healthyStreak: countConsecutiveHealthy(snapshotSeries),
    regressionStreak: countConsecutiveRegressions(snapshotSeries),
    recoverySnapshotsAgo: recoverySnapshotsAgo(snapshotSeries),
    monitoringCadence: "Weekly (GitHub Actions)",
  };
}
