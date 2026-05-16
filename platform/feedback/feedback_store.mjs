import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import feedbackOptions from "./feedback-categories.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
export const FEEDBACK_PATH = path.join(repoRoot, "reports/operator-feedback.json");
export const FEEDBACK_BACKLOG_PATH = path.join(repoRoot, "reports/sentinel-feedback-backlog.md");

export function getFeedbackOptions() {
  return feedbackOptions;
}

function normaliseCategory(category = "idea") {
  const allowed = new Set(feedbackOptions.categories.map((item) => item.id));
  const value = String(category || "idea").trim().toLowerCase();
  return allowed.has(value) ? value : "idea";
}

function normaliseSection(section = "general") {
  const allowed = new Set(feedbackOptions.sections);
  const value = String(section || "general").trim().toLowerCase();
  return allowed.has(value) ? value : "general";
}

function normaliseStatus(status = "new") {
  const allowed = new Set(feedbackOptions.statuses);
  const value = String(status || "new").trim().toLowerCase();
  return allowed.has(value) ? value : "new";
}

function normalisePriority(priority = "medium") {
  const allowed = new Set(feedbackOptions.priorities);
  const value = String(priority || "medium").trim().toLowerCase();
  return allowed.has(value) ? value : "medium";
}

function normaliseEffort(effort = "medium") {
  const allowed = new Set(feedbackOptions.efforts);
  const value = String(effort || "medium").trim().toLowerCase();
  return allowed.has(value) ? value : "medium";
}

function triageStatusFromLegacyStatus(status = "new") {
  if (status === "done") return "done";
  if (status === "dismissed") return "rejected";
  if (["reviewed", "planned"].includes(status)) return "accepted";
  return "new";
}

function normaliseTriageStatus(triageStatus, fallbackStatus = "new") {
  const allowed = new Set(feedbackOptions.triageStatuses);
  const fallback = triageStatusFromLegacyStatus(normaliseStatus(fallbackStatus));
  const value = String(triageStatus || fallback).trim().toLowerCase();
  return allowed.has(value) ? value : fallback;
}

function sanitiseSummary(summary = "") {
  return String(summary || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

function sanitiseShortText(value = "", maxLength = 120) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normaliseLinkedSection(section = "") {
  const value = String(section || "").trim().toLowerCase();
  return value ? normaliseSection(value) : "";
}

function normaliseFeedbackItem(item = {}) {
  const status = normaliseStatus(item.status);
  return {
    id: String(item.id || `fb-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`),
    createdAt: item.createdAt || new Date().toISOString(),
    category: normaliseCategory(item.category),
    section: normaliseSection(item.section),
    summary: sanitiseSummary(item.summary),
    status,
    priority: normalisePriority(item.priority),
    effort: normaliseEffort(item.effort),
    triageStatus: normaliseTriageStatus(item.triageStatus, status),
    owner: sanitiseShortText(item.owner || "", 80),
    linkedCommand: sanitiseShortText(item.linkedCommand || "", 100),
    linkedSection: normaliseLinkedSection(item.linkedSection || item.section || ""),
    triagedAt: item.triagedAt || "",
    notes: Array.isArray(item.notes)
      ? item.notes
        .map((note) => ({
          createdAt: note.createdAt || new Date().toISOString(),
          note: sanitiseShortText(note.note || "", 280),
        }))
        .filter((note) => note.note)
      : [],
  };
}

export function readFeedbackItems(filePath = FEEDBACK_PATH) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(parsed) ? parsed.map(normaliseFeedbackItem).filter((item) => item.summary) : [];
  } catch {
    return [];
  }
}

export function writeFeedbackItems(items, filePath = FEEDBACK_PATH) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(items.map(normaliseFeedbackItem), null, 2)}\n`);
}

export function createFeedbackItem({
  category,
  section,
  summary,
  status = "new",
  priority = "medium",
  effort = "medium",
  triageStatus = "new",
  owner = "",
  linkedCommand = "",
  linkedSection = "",
} = {}) {
  const cleanSummary = sanitiseSummary(summary);
  if (!cleanSummary) {
    const error = new Error("Feedback summary is required.");
    error.code = "FEEDBACK_VALIDATION_ERROR";
    throw error;
  }

  return {
    id: `fb-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`,
    createdAt: new Date().toISOString(),
    category: normaliseCategory(category),
    section: normaliseSection(section),
    summary: cleanSummary,
    status: normaliseStatus(status),
    priority: normalisePriority(priority),
    effort: normaliseEffort(effort),
    triageStatus: normaliseTriageStatus(triageStatus, status),
    owner: sanitiseShortText(owner, 80),
    linkedCommand: sanitiseShortText(linkedCommand, 100),
    linkedSection: normaliseLinkedSection(linkedSection || section || ""),
    triagedAt: "",
    notes: [],
  };
}

export function addFeedbackItem(input, filePath = FEEDBACK_PATH) {
  const item = createFeedbackItem(input);
  const items = readFeedbackItems(filePath);
  items.unshift(item);
  writeFeedbackItems(items, filePath);
  return item;
}

export function listFeedbackItems({
  category = "",
  section = "",
  status = "",
  priority = "",
  effort = "",
  triageStatus = "",
  limit = 20,
} = {}, filePath = FEEDBACK_PATH) {
  const max = Math.min(Math.max(Number(limit) || 20, 1), 100);
  return readFeedbackItems(filePath)
    .filter((item) => !category || item.category === normaliseCategory(category))
    .filter((item) => !section || item.section === normaliseSection(section))
    .filter((item) => !status || item.status === normaliseStatus(status))
    .filter((item) => !priority || item.priority === normalisePriority(priority))
    .filter((item) => !effort || item.effort === normaliseEffort(effort))
    .filter((item) => !triageStatus || item.triageStatus === normaliseTriageStatus(triageStatus, status))
    .slice(0, max);
}

export function triageFeedbackItem({
  id,
  priority,
  effort,
  triageStatus,
  owner,
  linkedCommand,
  linkedSection,
  note,
} = {}, filePath = FEEDBACK_PATH) {
  const targetId = sanitiseShortText(id, 120);
  if (!targetId) {
    const error = new Error("Feedback ID is required for triage.");
    error.code = "FEEDBACK_VALIDATION_ERROR";
    throw error;
  }

  const items = readFeedbackItems(filePath);
  const index = items.findIndex((item) => item.id === targetId);
  if (index === -1) {
    const error = new Error(`Feedback item not found: ${targetId}`);
    error.code = "FEEDBACK_NOT_FOUND";
    throw error;
  }

  const item = { ...items[index] };
  if (priority) item.priority = normalisePriority(priority);
  if (effort) item.effort = normaliseEffort(effort);
  if (triageStatus) item.triageStatus = normaliseTriageStatus(triageStatus, item.status);
  if (owner !== undefined) item.owner = sanitiseShortText(owner, 80);
  if (linkedCommand !== undefined) item.linkedCommand = sanitiseShortText(linkedCommand, 100);
  if (linkedSection !== undefined) item.linkedSection = normaliseLinkedSection(linkedSection);

  const cleanNote = sanitiseShortText(note, 280);
  if (cleanNote) {
    item.notes = [
      ...(Array.isArray(item.notes) ? item.notes : []),
      {
        createdAt: new Date().toISOString(),
        note: cleanNote,
      },
    ];
  }

  item.triagedAt = new Date().toISOString();
  items[index] = normaliseFeedbackItem(item);
  writeFeedbackItems(items, filePath);
  return items[index];
}

function priorityRank(priority) {
  return {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  }[normalisePriority(priority)] || 2;
}

function effortRank(effort) {
  return {
    low: 1,
    medium: 2,
    high: 3,
  }[normaliseEffort(effort)] || 2;
}

export function sortFeedbackBacklog(items) {
  return [...items].sort((a, b) => {
    const priorityDelta = priorityRank(b.priority) - priorityRank(a.priority);
    if (priorityDelta) return priorityDelta;
    const effortDelta = effortRank(a.effort) - effortRank(b.effort);
    if (effortDelta) return effortDelta;
    return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
  });
}

export function getFeedbackBacklogGroups(filePath = FEEDBACK_PATH) {
  const items = sortFeedbackBacklog(readFeedbackItems(filePath));
  const actionable = items.filter((item) => !["rejected", "done"].includes(item.triageStatus));
  const active = actionable.filter((item) => item.triageStatus !== "deferred");
  return {
    all: items,
    high: active.filter((item) => ["critical", "high"].includes(item.priority)),
    medium: active.filter((item) => item.priority === "medium"),
    lowDeferred: actionable.filter((item) => item.priority === "low" || item.triageStatus === "deferred"),
    accepted: items.filter((item) => item.triageStatus === "accepted"),
    newItems: items.filter((item) => item.triageStatus === "new"),
    deferred: items.filter((item) => item.triageStatus === "deferred"),
    suggestedNext: actionable.find((item) => ["accepted", "new"].includes(item.triageStatus)) || actionable[0] || null,
  };
}

function feedbackLine(item) {
  const meta = `${item.priority} priority, ${item.effort} effort, ${item.triageStatus}`;
  return `- ${item.summary} (${meta}, ${item.category}/${item.section}, ${item.id})`;
}

export function buildFeedbackBacklogMarkdown(filePath = FEEDBACK_PATH) {
  const groups = getFeedbackBacklogGroups(filePath);
  const lines = [
    "# Sentinel Feedback Backlog",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Local operator-only backlog generated from ignored feedback storage.",
    "",
    "## Suggested Next Improvement",
    "",
    groups.suggestedNext
      ? feedbackLine(groups.suggestedNext)
      : "- No actionable feedback captured yet.",
    "",
    "## Accepted Items",
    "",
    ...(groups.accepted.length ? groups.accepted.map(feedbackLine) : ["- None."]),
    "",
    "## New Untriaged Items",
    "",
    ...(groups.newItems.length ? groups.newItems.map(feedbackLine) : ["- None."]),
    "",
    "## Deferred Items",
    "",
    ...(groups.deferred.length ? groups.deferred.map(feedbackLine) : ["- None."]),
    "",
    "## Prioritised Backlog",
    "",
    "### Critical and High",
    "",
    ...(groups.high.length ? groups.high.map(feedbackLine) : ["- None."]),
    "",
    "### Medium",
    "",
    ...(groups.medium.length ? groups.medium.map(feedbackLine) : ["- None."]),
    "",
    "### Low or Deferred",
    "",
    ...(groups.lowDeferred.length ? groups.lowDeferred.map(feedbackLine) : ["- None."]),
    "",
  ];
  return `${lines.join("\n")}\n`;
}

export function writeFeedbackBacklogReport({
  filePath = FEEDBACK_PATH,
  outputPath = FEEDBACK_BACKLOG_PATH,
} = {}) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const markdown = buildFeedbackBacklogMarkdown(filePath);
  fs.writeFileSync(outputPath, markdown);
  return outputPath;
}

export function feedbackStatusSummary(filePath = FEEDBACK_PATH) {
  const items = readFeedbackItems(filePath);
  const byStatus = Object.fromEntries(feedbackOptions.statuses.map((status) => [status, 0]));
  const byCategory = Object.fromEntries(feedbackOptions.categories.map((category) => [category.id, 0]));
  const byTriageStatus = Object.fromEntries(feedbackOptions.triageStatuses.map((status) => [status, 0]));
  const byPriority = Object.fromEntries(feedbackOptions.priorities.map((priority) => [priority, 0]));

  for (const item of items) {
    byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    byTriageStatus[item.triageStatus] = (byTriageStatus[item.triageStatus] || 0) + 1;
    byPriority[item.priority] = (byPriority[item.priority] || 0) + 1;
  }

  return {
    total: items.length,
    byStatus,
    byCategory,
    byTriageStatus,
    byPriority,
    latest: items[0] || null,
  };
}
