import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import feedbackOptions from "./feedback-categories.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
export const FEEDBACK_PATH = path.join(repoRoot, "reports/operator-feedback.json");

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

function sanitiseSummary(summary = "") {
  return String(summary || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

export function readFeedbackItems(filePath = FEEDBACK_PATH) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeFeedbackItems(items, filePath = FEEDBACK_PATH) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(items, null, 2)}\n`);
}

export function createFeedbackItem({ category, section, summary, status = "new" } = {}) {
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
  };
}

export function addFeedbackItem(input, filePath = FEEDBACK_PATH) {
  const item = createFeedbackItem(input);
  const items = readFeedbackItems(filePath);
  items.unshift(item);
  writeFeedbackItems(items, filePath);
  return item;
}

export function listFeedbackItems({ category = "", section = "", status = "", limit = 20 } = {}, filePath = FEEDBACK_PATH) {
  const max = Math.min(Math.max(Number(limit) || 20, 1), 100);
  return readFeedbackItems(filePath)
    .filter((item) => !category || item.category === normaliseCategory(category))
    .filter((item) => !section || item.section === normaliseSection(section))
    .filter((item) => !status || item.status === normaliseStatus(status))
    .slice(0, max);
}

export function feedbackStatusSummary(filePath = FEEDBACK_PATH) {
  const items = readFeedbackItems(filePath);
  const byStatus = Object.fromEntries(feedbackOptions.statuses.map((status) => [status, 0]));
  const byCategory = Object.fromEntries(feedbackOptions.categories.map((category) => [category.id, 0]));

  for (const item of items) {
    byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
  }

  return {
    total: items.length,
    byStatus,
    byCategory,
    latest: items[0] || null,
  };
}
