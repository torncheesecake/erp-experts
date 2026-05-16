import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const REVIEW_JSON_PATH = path.join(repoRoot, "reports/sentinel-work-package-review.json");
const STATUS_JSON_PATH = path.join(repoRoot, "reports/sentinel-implementation-status.json");
const ALLOWED_STATUSES = new Set(["ready", "in_progress", "blocked", "implemented", "validated", "abandoned"]);

function parseArgs(argv) {
  const args = { item: "", set: "", note: "", list: false, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--item") {
      args.item = argv[i + 1] || "";
      i += 1;
    } else if (arg === "--set") {
      args.set = argv[i + 1] || "";
      i += 1;
    } else if (arg === "--note") {
      args.note = argv[i + 1] || "";
      i += 1;
    } else if (arg === "--list") {
      args.list = true;
    } else if (arg === "--json") {
      args.json = true;
    }
  }
  return args;
}

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function fail(message, code) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function cleanText(value = "", max = 800) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function readReview(itemId = "") {
  if (!fs.existsSync(REVIEW_JSON_PATH)) {
    fail("Missing reports/sentinel-work-package-review.json. Run npm run platform:roadmap:review -- --item <id> first.", "REVIEW_MISSING");
  }

  const review = readJson(REVIEW_JSON_PATH, null);
  if (!review || !review.itemId) {
    fail("Work package review is invalid. Regenerate it with npm run platform:roadmap:review -- --item <id>.", "REVIEW_INVALID");
  }
  if (itemId && review.itemId !== itemId) {
    fail(`Work package review is for ${review.itemId}, not ${itemId}. Run npm run platform:roadmap:review -- --item ${itemId}.`, "REVIEW_ITEM_MISMATCH");
  }
  return review;
}

function readStatuses() {
  const statuses = readJson(STATUS_JSON_PATH, []);
  return Array.isArray(statuses) ? statuses : [];
}

function writeStatuses(statuses) {
  fs.mkdirSync(path.dirname(STATUS_JSON_PATH), { recursive: true });
  fs.writeFileSync(STATUS_JSON_PATH, `${JSON.stringify(statuses, null, 2)}\n`);
}

function findExisting(statuses, itemId) {
  return statuses.find((record) => record.roadmapItemId === itemId) || null;
}

function noteRequired(status, note) {
  return ["blocked", "abandoned"].includes(status) && !cleanText(note);
}

function validateTransition({ nextStatus, existing, review, note }) {
  if (!ALLOWED_STATUSES.has(nextStatus)) {
    fail(`Unsupported implementation status: ${nextStatus}. Allowed: ${[...ALLOWED_STATUSES].join(", ")}.`, "STATUS_INVALID");
  }

  if (noteRequired(nextStatus, note)) {
    fail(`Status ${nextStatus} requires --note.`, "STATUS_NOTE_REQUIRED");
  }

  const previousStatus = existing?.currentStatus || "none";
  if (nextStatus === "ready" && review.status !== "pass") {
    fail("Cannot set ready unless work package review status is pass.", "STATUS_READY_REVIEW_REQUIRED");
  }
  if (nextStatus === "in_progress" && !["ready", "in_progress"].includes(previousStatus)) {
    fail("Cannot set in_progress unless ready already exists.", "STATUS_IN_PROGRESS_REQUIRES_READY");
  }
  if (nextStatus === "implemented" && !["ready", "in_progress", "implemented"].includes(previousStatus)) {
    fail("Cannot set implemented unless ready or in_progress exists.", "STATUS_IMPLEMENTED_REQUIRES_START");
  }
  if (nextStatus === "validated" && !["implemented", "validated"].includes(previousStatus)) {
    fail("Cannot set validated unless implemented exists.", "STATUS_VALIDATED_REQUIRES_IMPLEMENTED");
  }
}

function buildStatusRecord({ existing, review, nextStatus, note }) {
  const now = new Date().toISOString();
  const previousStatus = existing?.currentStatus || "none";
  const statusNote = cleanText(note || defaultNote(nextStatus));
  const history = Array.isArray(existing?.history) ? existing.history : [];

  return {
    id: existing?.id || `impl-status-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`,
    roadmapItemId: review.itemId,
    title: review.title || "Untitled Sentinel work package",
    currentStatus: nextStatus,
    previousStatus,
    updatedAt: now,
    note: statusNote,
    sourceReviewPath: "reports/sentinel-work-package-review.json",
    history: [
      {
        status: nextStatus,
        previousStatus,
        updatedAt: now,
        note: statusNote,
      },
      ...history,
    ],
  };
}

function defaultNote(status) {
  if (status === "ready") return "Reviewed package ready for Codex handoff.";
  if (status === "in_progress") return "Implementation started.";
  if (status === "implemented") return "Implementation completed.";
  if (status === "validated") return "Implementation validated.";
  return "";
}

function upsertStatus(record) {
  const statuses = readStatuses();
  const next = statuses.filter((entry) => entry.roadmapItemId !== record.roadmapItemId);
  next.unshift(record);
  writeStatuses(next);
  return next;
}

function setStatus(args) {
  if (!args.item) fail("Missing --item <roadmapItemId>.", "STATUS_ITEM_REQUIRED");
  if (!args.set) fail("Missing --set <status>.", "STATUS_SET_REQUIRED");

  const nextStatus = String(args.set || "").trim().toLowerCase();
  const review = readReview(args.item);
  const statuses = readStatuses();
  const existing = findExisting(statuses, review.itemId);
  validateTransition({ nextStatus, existing, review, note: args.note });
  const record = buildStatusRecord({ existing, review, nextStatus, note: args.note });
  upsertStatus(record);
  return { action: "set", record, records: readStatuses() };
}

function listStatuses(args) {
  const records = readStatuses();
  if (args.item) {
    return { action: "show", records: records.filter((record) => record.roadmapItemId === args.item) };
  }
  return { action: "list", records };
}

function printRecord(record) {
  console.log(`Item: ${record.roadmapItemId}`);
  console.log(`Title: ${record.title}`);
  console.log(`Status: ${record.currentStatus}`);
  console.log(`Previous: ${record.previousStatus || "none"}`);
  console.log(`Updated: ${record.updatedAt}`);
  if (record.note) console.log(`Note: ${record.note}`);
}

function printResult(result) {
  console.log("Sentinel Implementation Status");
  console.log("");

  if (result.action === "set") {
    printRecord(result.record);
    console.log("");
    console.log("Generated:");
    console.log("- reports/sentinel-implementation-status.json");
    return;
  }

  if (!result.records.length) {
    console.log("No implementation status records found.");
    return;
  }

  for (const [index, record] of result.records.entries()) {
    if (index > 0) console.log("");
    printRecord(record);
  }
}

try {
  const args = parseArgs(process.argv.slice(2));
  const result = args.set ? setStatus(args) : listStatuses(args);

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printResult(result);
  }
} catch (error) {
  console.error(`Implementation status error: ${error.message}`);
  if (error.code?.startsWith("REVIEW")) {
    console.error("Run: npm run platform:roadmap:review -- --item <roadmapItemId>");
  }
  process.exit(1);
}
