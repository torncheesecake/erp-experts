/**
 * SEO Content Roadmap — Internal page (noindex)
 * Living document for tracking SEO content priorities
 *
 * Security note:
 * Client bundles must not include hardcoded secrets/passwords.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Layers,
  ChevronDown,
  Lock,
  ArrowRight,
  Wrench,
  Eye,
  BarChart3,
} from "lucide-react";
import reportData from "../data/reports.json";
import sentinelCommandRegistry from "../../platform/commands/commands.json";
import sentinelActionRegistry from "../../platform/actions/actions.json";
import sentinelTenantRegistry from "../../platform/tenants/tenant-registry.json";
import sentinelControlCentreHelp from "../../platform/help/control-centre-help.json";
import sentinelActivityTaxonomy from "../../platform/activity/activity-taxonomy.json";
import sentinelFeedbackOptions from "../../platform/feedback/feedback-categories.json";
import sentinelContentWorkflowActions from "../../platform/workflows/content-workflow-actions.json";
const historyQaModules = import.meta.glob("../../reports/history/*/resource-qa-report.json", { eager: true });
const sentinelStateModules = import.meta.glob("../../reports/sentinel-state.json", { eager: true });
const sentinelCadenceModules = import.meta.glob("../../reports/sentinel-cadence-summary.json", { eager: true });
const sentinelDoctorModules = import.meta.glob("../../reports/sentinel-doctor.json", { eager: true });
const sentinelReadinessModules = import.meta.glob("../../reports/sentinel-deploy-readiness.json", { eager: true });
const sentinelRoadmapModules = import.meta.glob("../../reports/sentinel-roadmap.json", { eager: true });
const sentinelRoadmapPlanModules = import.meta.glob("../../reports/sentinel-roadmap-plan.json", { eager: true });
const sentinelRoadmapApprovalModules = import.meta.glob("../../reports/sentinel-roadmap-approvals.json", { eager: true });
const sentinelImplementationBriefModules = import.meta.glob("../../reports/sentinel-implementation-brief.json", { eager: true });
const sentinelWorkPackageModules = import.meta.glob("../../reports/sentinel-work-package.json", { eager: true });
const sentinelWorkPackageReviewModules = import.meta.glob("../../reports/sentinel-work-package-review.json", { eager: true });
const sentinelImplementationStatusModules = import.meta.glob("../../reports/sentinel-implementation-status.json", { eager: true });
const sentinelApiBaseUrl = String(import.meta.env.VITE_SENTINEL_API_BASE_URL || "").replace(/\/+$/, "");
const sentinelActionApiBaseUrl = sentinelApiBaseUrl || "http://127.0.0.1:4317";
const sentinelAuthorityMode = String(import.meta.env.VITE_SENTINEL_AUTHORITY_MODE || "disabled").trim().toLowerCase();
const SENTINEL_OPERATOR_SESSION_KEY = "sentinel.operatorSession.v1";
const SENTINEL_STANDALONE_OPERATOR_SESSION_KEY = "sentinel.operatorSession.standalone.v1";
const SENTINEL_OPERATOR_WORKSPACES_KEY = "sentinel.operatorWorkspaces.v1";
const SENTINEL_CONTENT_WORKBENCH_KEY = "sentinel.contentWorkbench.v1";
const SENTINEL_DEFAULT_WORKSPACE_ID = "monitoring";
const SENTINEL_WORKSPACE_PANEL_KEYS = ["supportingIntelligence", "articleWorkbench", "advancedDiagnostics"];
const SENTINEL_TERMINAL_EXECUTION_STATES = new Set(["success", "failed", "failure", "cancelled"]);
const CONTENT_LIFECYCLE_STATUSES = [
  "discovered",
  "approved",
  "researching",
  "drafting",
  "review",
  "ready",
  "published",
  "monitoring",
];
const CONTENT_STATUS_META = {
  discovered: { label: "Discovered", tone: "bg-slate-50 text-slate-700 ring-slate-200" },
  approved: { label: "Approved", tone: "bg-blue-50 text-blue-700 ring-blue-100" },
  researching: { label: "Researching", tone: "bg-cyan-50 text-cyan-700 ring-cyan-100" },
  drafting: { label: "Drafting", tone: "bg-indigo-50 text-indigo-700 ring-indigo-100" },
  review: { label: "Review", tone: "bg-amber-50 text-amber-800 ring-amber-100" },
  ready: { label: "Ready", tone: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  published: { label: "Published", tone: "bg-green-50 text-green-700 ring-green-100" },
  monitoring: { label: "Monitoring", tone: "bg-purple-50 text-purple-700 ring-purple-100" },
};
const CONTENT_STATUS_GROUPS = [
  { id: "intake", label: "Intake", statuses: ["discovered", "approved"] },
  { id: "making", label: "Making", statuses: ["researching", "drafting"] },
  { id: "review", label: "Review", statuses: ["review", "ready"] },
  { id: "live", label: "Live", statuses: ["published", "monitoring"] },
];
const CONTENT_PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3, monitor: 4 };
const SENTINEL_WORKFLOW_ACTION_HISTORY_KEY = "sentinel.workflowActions.v1";
const SENTINEL_CONTENT_WORKFLOW_ACTION_LIST = Array.isArray(sentinelContentWorkflowActions?.actions)
  ? sentinelContentWorkflowActions.actions
  : [];
const SENTINEL_OPERATOR_SESSION_DEFAULTS = {
  activeWorkspaceId: SENTINEL_DEFAULT_WORKSPACE_ID,
  activeSection: "overview",
  commandQuery: "",
  commandCategory: "All",
  sidebarCollapsed: false,
  compactView: false,
  helpOpen: true,
  firstRunHintDismissed: false,
  panels: {
    supportingIntelligence: false,
    articleWorkbench: false,
    advancedDiagnostics: false,
  },
};
const SENTINEL_STANDALONE_OPERATOR_SESSION_DEFAULTS = {
  ...SENTINEL_OPERATOR_SESSION_DEFAULTS,
  activeWorkspaceId: "development",
  activeSection: "content",
};
const SENTINEL_BUILT_IN_WORKSPACES = [
  {
    id: "monitoring",
    name: "Monitoring",
    createdAt: "built-in",
    builtIn: true,
    selectedSection: "overview",
    commandFilter: "All",
    commandSearch: "",
    sidebarCollapsed: false,
    collapsedPanels: {
      supportingIntelligence: true,
      articleWorkbench: true,
      advancedDiagnostics: true,
    },
    compactMode: false,
    visiblePanels: ["Overview", "Content Workbench", "Activity", "Cadence"],
    preferredFocus: "monitoring",
    notes: "Daily operating view focused on health, activity and cadence.",
  },
  {
    id: "development",
    name: "Development",
    createdAt: "built-in",
    builtIn: true,
    selectedSection: "content",
    commandFilter: "All",
    commandSearch: "",
    sidebarCollapsed: false,
    collapsedPanels: {
      supportingIntelligence: false,
      articleWorkbench: true,
      advancedDiagnostics: true,
    },
    compactMode: false,
    visiblePanels: ["Content Workbench", "Actions", "Roadmap", "Feedback"],
    preferredFocus: "content_workflow",
    notes: "Content operations view for editorial work, safe actions, roadmap and feedback.",
  },
  {
    id: "deployment",
    name: "Deployment",
    createdAt: "built-in",
    builtIn: true,
    selectedSection: "diagnostics",
    commandFilter: "Deployment",
    commandSearch: "",
    sidebarCollapsed: true,
    collapsedPanels: {
      supportingIntelligence: true,
      articleWorkbench: true,
      advancedDiagnostics: false,
    },
    compactMode: true,
    visiblePanels: ["Diagnostics", "Readiness", "Activity"],
    preferredFocus: "deployment",
    notes: "Pre-deployment view focused on readiness, diagnostics and recent activity.",
  },
  {
    id: "roadmap-review",
    name: "Roadmap Review",
    createdAt: "built-in",
    builtIn: true,
    selectedSection: "overview",
    commandFilter: "State",
    commandSearch: "roadmap",
    sidebarCollapsed: false,
    collapsedPanels: {
      supportingIntelligence: false,
      articleWorkbench: true,
      advancedDiagnostics: true,
    },
    compactMode: false,
    visiblePanels: ["Content Workbench", "Feedback", "Roadmap", "Packages"],
    preferredFocus: "roadmap_review",
    notes: "Planning view for feedback triage, roadmap intelligence and handoff packages.",
  },
];

const seoSnapshotDate =
  reportData?.ga4Period?.seoInsights?.period?.split(" to ").at(-1) || reportData?.lastUpdated;
const demandSignals = reportData?.ga4Period?.seoInsights?.demandSignals || {};

function parseSnapshotLabel(snapshotDir = "") {
  const key = String(snapshotDir).split("/").at(-1) || "";
  const m = key.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})$/);
  if (!m) return { key, label: key };
  const [, y, mo, d, h, mi] = m;
  return { key, label: `${d}/${mo} ${h}:${mi}`, iso: `${y}-${mo}-${d}T${h}:${mi}:00Z` };
}

async function copyText(text, label = "copy payload") {
  const value = String(text || "");
  if (!value) return false;

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn(`Clipboard API failed for ${label}:`, err);
    }
  }

  try {
    if (typeof document === "undefined") return false;
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return Boolean(success);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn(`execCommand copy failed for ${label}:`, err);
    }
    return false;
  }
}

function readHistorySnapshots() {
  const points = Object.entries(historyQaModules).map(([path, mod]) => {
    const data = mod?.default || mod;
    const snapshot = path.match(/history\/([^/]+)\/resource-qa-report\.json$/)?.[1] || "";
    const gate = data?.gateSummary || {};
    const info = parseSnapshotLabel(snapshot);
    return {
      snapshot,
      label: info.label,
      orderKey: info.iso || snapshot,
      pass: Number(gate.pass || 0),
      needsReview: Number(gate.needs_review || 0),
      blocked: Number(gate.blocked || 0),
    };
  });
  points.sort((a, b) => String(a.orderKey).localeCompare(String(b.orderKey)));
  return points;
}

function readSentinelState() {
  const stateModule = Object.values(sentinelStateModules)[0];
  return stateModule?.default || stateModule || null;
}

function readCadenceSummary() {
  const cadenceModule = Object.values(sentinelCadenceModules)[0];
  return cadenceModule?.default || cadenceModule || null;
}

function readDoctorSummary() {
  const doctorModule = Object.values(sentinelDoctorModules)[0];
  return doctorModule?.default || doctorModule || null;
}

function readReadinessSummary() {
  const readinessModule = Object.values(sentinelReadinessModules)[0];
  return readinessModule?.default || readinessModule || null;
}

function readRoadmapSummary() {
  const roadmapModule = Object.values(sentinelRoadmapModules)[0];
  return roadmapModule?.default || roadmapModule || null;
}

function readRoadmapApprovals() {
  const approvalModule = Object.values(sentinelRoadmapApprovalModules)[0];
  const approvals = approvalModule?.default || approvalModule || [];
  return Array.isArray(approvals) ? approvals : [];
}

function readImplementationBrief() {
  const briefModule = Object.values(sentinelImplementationBriefModules)[0];
  return briefModule?.default || briefModule || null;
}

function readWorkPackage() {
  const workPackageModule = Object.values(sentinelWorkPackageModules)[0];
  return workPackageModule?.default || workPackageModule || null;
}

function readWorkPackageReview() {
  const reviewModule = Object.values(sentinelWorkPackageReviewModules)[0];
  return reviewModule?.default || reviewModule || null;
}

function readImplementationStatuses() {
  const statusModule = Object.values(sentinelImplementationStatusModules)[0];
  const statuses = statusModule?.default || statusModule || [];
  return Array.isArray(statuses) ? statuses : [];
}

function getInitialSentinelState() {
  const reportState = readSentinelState();
  return {
    state: reportState,
    source: reportState ? "report" : "fallback",
  };
}

function getInitialTenantRegistry() {
  return {
    registry: sentinelTenantRegistry,
    source: "registry",
  };
}

function getOperatorSessionKey(standaloneMode = false) {
  return standaloneMode ? SENTINEL_STANDALONE_OPERATOR_SESSION_KEY : SENTINEL_OPERATOR_SESSION_KEY;
}

function getOperatorSessionDefaults(standaloneMode = false) {
  return standaloneMode ? SENTINEL_STANDALONE_OPERATOR_SESSION_DEFAULTS : SENTINEL_OPERATOR_SESSION_DEFAULTS;
}

function mergeOperatorSessionState(savedState = {}, standaloneMode = false) {
  const defaults = getOperatorSessionDefaults(standaloneMode);
  return {
    ...defaults,
    ...savedState,
    panels: {
      ...defaults.panels,
      ...(savedState?.panels || {}),
    },
  };
}

function normaliseWorkspacePanels(collapsedPanels = {}) {
  return SENTINEL_WORKSPACE_PANEL_KEYS.reduce((acc, key) => ({
    ...acc,
    [key]: collapsedPanels?.[key] !== false,
  }), {});
}

function normaliseOperatorWorkspace(workspace = {}) {
  const builtInMatch = SENTINEL_BUILT_IN_WORKSPACES.find((item) => item.id === workspace.id);
  const fallback = builtInMatch || SENTINEL_BUILT_IN_WORKSPACES[0];
  const id = String(workspace.id || fallback.id || `workspace-${Date.now()}`).trim();

  return {
    id,
    name: String(workspace.name || fallback.name || "Workspace").trim(),
    createdAt: workspace.createdAt || new Date().toISOString(),
    builtIn: Boolean(workspace.builtIn && builtInMatch),
    selectedSection: workspace.selectedSection || fallback.selectedSection || "overview",
    commandFilter: workspace.commandFilter || fallback.commandFilter || "All",
    commandSearch: workspace.commandSearch || fallback.commandSearch || "",
    sidebarCollapsed: Boolean(workspace.sidebarCollapsed ?? fallback.sidebarCollapsed),
    collapsedPanels: normaliseWorkspacePanels(workspace.collapsedPanels || fallback.collapsedPanels),
    compactMode: Boolean(workspace.compactMode ?? fallback.compactMode),
    visiblePanels: Array.isArray(workspace.visiblePanels) && workspace.visiblePanels.length
      ? workspace.visiblePanels.map((item) => String(item)).filter(Boolean)
      : [...(fallback.visiblePanels || [])],
    preferredFocus: workspace.preferredFocus || fallback.preferredFocus || "monitoring",
    notes: workspace.notes || fallback.notes || "",
    updatedAt: workspace.updatedAt || workspace.createdAt || null,
  };
}

function readOperatorWorkspaces() {
  if (typeof window === "undefined") return SENTINEL_BUILT_IN_WORKSPACES.map(normaliseOperatorWorkspace);

  try {
    const raw = window.localStorage.getItem(SENTINEL_OPERATOR_WORKSPACES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const storedWorkspaces = Array.isArray(parsed) ? parsed : parsed?.workspaces;
    const customWorkspaces = Array.isArray(storedWorkspaces) ? storedWorkspaces : [];
    const builtInIds = new Set(SENTINEL_BUILT_IN_WORKSPACES.map((workspace) => workspace.id));
    const normalisedCustom = customWorkspaces
      .map((workspace) => normaliseOperatorWorkspace({ ...workspace, builtIn: false }))
      .filter((workspace) => workspace.id && !builtInIds.has(workspace.id));

    return [
      ...SENTINEL_BUILT_IN_WORKSPACES.map(normaliseOperatorWorkspace),
      ...normalisedCustom,
    ];
  } catch {
    return SENTINEL_BUILT_IN_WORKSPACES.map(normaliseOperatorWorkspace);
  }
}

function writeOperatorWorkspaces(workspaces = []) {
  if (typeof window === "undefined") return;

  try {
    const builtInIds = new Set(SENTINEL_BUILT_IN_WORKSPACES.map((workspace) => workspace.id));
    const customWorkspaces = workspaces
      .filter((workspace) => workspace?.id && !workspace.builtIn && !builtInIds.has(workspace.id))
      .map((workspace) => normaliseOperatorWorkspace({ ...workspace, builtIn: false }));

    if (!customWorkspaces.length) {
      window.localStorage.removeItem(SENTINEL_OPERATOR_WORKSPACES_KEY);
      return;
    }

    window.localStorage.setItem(SENTINEL_OPERATOR_WORKSPACES_KEY, JSON.stringify({
      version: 1,
      workspaces: customWorkspaces,
    }));
  } catch {
    // Local workspace persistence is optional.
  }
}

function buildWorkspaceSlug(name = "") {
  const slug = String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "workspace";
}

function openPanelsFromWorkspace(workspace = {}) {
  const collapsedPanels = normaliseWorkspacePanels(workspace.collapsedPanels);
  return SENTINEL_WORKSPACE_PANEL_KEYS.reduce((acc, key) => ({
    ...acc,
    [key]: !collapsedPanels[key],
  }), {});
}

function collapsedPanelsFromOpenState(panels = {}) {
  return SENTINEL_WORKSPACE_PANEL_KEYS.reduce((acc, key) => ({
    ...acc,
    [key]: panels[key] !== true,
  }), {});
}

function buildVisiblePanelsFromState({ activeSection, panels }) {
  const visiblePanels = [formatStateLabel(activeSection || "overview")];
  if (panels.supportingIntelligence) visiblePanels.push("Supporting intelligence");
  if (panels.articleWorkbench) visiblePanels.push("Article workbench");
  if (panels.advancedDiagnostics) visiblePanels.push("Diagnostics");
  return [...new Set(visiblePanels)];
}

function readOperatorSessionState(standaloneMode = false) {
  if (typeof window === "undefined") return getOperatorSessionDefaults(standaloneMode);

  try {
    const raw = window.localStorage.getItem(getOperatorSessionKey(standaloneMode));
    if (!raw) return getOperatorSessionDefaults(standaloneMode);
    return mergeOperatorSessionState(JSON.parse(raw), standaloneMode);
  } catch {
    return getOperatorSessionDefaults(standaloneMode);
  }
}

function hasStoredOperatorSessionState(standaloneMode = false) {
  if (typeof window === "undefined") return false;

  try {
    return Boolean(window.localStorage.getItem(getOperatorSessionKey(standaloneMode)));
  } catch {
    return false;
  }
}

function isDefaultOperatorSessionState(state, standaloneMode = false) {
  const merged = mergeOperatorSessionState(state, standaloneMode);
  return JSON.stringify(merged) === JSON.stringify(getOperatorSessionDefaults(standaloneMode));
}

function writeOperatorSessionState(state, standaloneMode = false) {
  if (typeof window === "undefined") return;

  try {
    const storageKey = getOperatorSessionKey(standaloneMode);
    if (isDefaultOperatorSessionState(state, standaloneMode)) {
      window.localStorage.removeItem(storageKey);
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(mergeOperatorSessionState(state, standaloneMode)));
  } catch {
    // Local browser preference persistence is optional.
  }
}

function clearOperatorSessionState(standaloneMode = false) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(getOperatorSessionKey(standaloneMode));
  } catch {
    // Local browser preference persistence is optional.
  }
}

function normaliseContentWorkbenchState(state = {}) {
  const sourceItems = state?.items && typeof state.items === "object" ? state.items : {};
  const items = Object.entries(sourceItems).reduce((acc, [id, item]) => {
    const status = CONTENT_LIFECYCLE_STATUSES.includes(item?.status) ? item.status : "";
    if (!id || !status) return acc;
    acc[id] = {
      status,
      updatedAt: item.updatedAt || null,
      note: item.note || "",
    };
    return acc;
  }, {});

  return {
    version: 1,
    items,
  };
}

function readContentWorkbenchState() {
  if (typeof window === "undefined") return normaliseContentWorkbenchState();

  try {
    const raw = window.localStorage.getItem(SENTINEL_CONTENT_WORKBENCH_KEY);
    return normaliseContentWorkbenchState(raw ? JSON.parse(raw) : {});
  } catch {
    return normaliseContentWorkbenchState();
  }
}

function writeContentWorkbenchState(state) {
  if (typeof window === "undefined") return;

  try {
    const normalised = normaliseContentWorkbenchState(state);
    if (!Object.keys(normalised.items).length) {
      window.localStorage.removeItem(SENTINEL_CONTENT_WORKBENCH_KEY);
      return;
    }
    window.localStorage.setItem(SENTINEL_CONTENT_WORKBENCH_KEY, JSON.stringify(normalised));
  } catch {
    // Local content workflow persistence is optional.
  }
}

function normaliseWorkflowActionHistory(state = {}) {
  const entries = Array.isArray(state?.entries) ? state.entries : [];
  return {
    version: 1,
    entries: entries
      .filter((entry) => entry?.id && entry?.actionId && entry?.itemId)
      .slice(0, 20)
      .map((entry) => ({
        id: String(entry.id),
        itemId: String(entry.itemId),
        itemTitle: entry.itemTitle || "Untitled content item",
        actionId: String(entry.actionId),
        actionLabel: entry.actionLabel || formatStateLabel(entry.actionId),
        executionMode: entry.executionMode || "local_transition",
        status: normaliseExecutionStatus(entry.status || "success"),
        fromStatus: entry.fromStatus || "",
        toStatus: entry.toStatus || "",
        message: entry.message || "",
        recovery: entry.recovery || "",
        createdAt: entry.createdAt || new Date().toISOString(),
      })),
  };
}

function readWorkflowActionHistory() {
  if (typeof window === "undefined") return normaliseWorkflowActionHistory();

  try {
    const raw = window.localStorage.getItem(SENTINEL_WORKFLOW_ACTION_HISTORY_KEY);
    return normaliseWorkflowActionHistory(raw ? JSON.parse(raw) : {});
  } catch {
    return normaliseWorkflowActionHistory();
  }
}

function writeWorkflowActionHistory(state) {
  if (typeof window === "undefined") return;

  try {
    const normalised = normaliseWorkflowActionHistory(state);
    if (!normalised.entries.length) {
      window.localStorage.removeItem(SENTINEL_WORKFLOW_ACTION_HISTORY_KEY);
      return;
    }
    window.localStorage.setItem(SENTINEL_WORKFLOW_ACTION_HISTORY_KEY, JSON.stringify(normalised));
  } catch {
    // Local workflow action history is optional.
  }
}

function hydrateWorkflowTemplate(template = "", item = {}) {
  const values = {
    itemId: item.id || "",
    title: item.title || "",
    slug: item.targetSlug || "",
    planId: item.relatedPlanId || "",
    opportunityId: item.relatedOpportunityId || "",
  };

  return String(template).replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => values[key] || "");
}

function getWorkflowManualCopyValue(action = {}, item = {}) {
  if (!action || !item) return "";
  if (action.manualSource === "briefCommand") {
    return item.briefCommand || hydrateWorkflowTemplate(action.fallbackTemplate, item);
  }
  if (action.manualSource === "briefPrompt") {
    return item.briefPrompt || item.briefCommand || hydrateWorkflowTemplate(action.fallbackTemplate, item);
  }
  if (action.manualTemplate) return hydrateWorkflowTemplate(action.manualTemplate, item);
  if (action.fallbackTemplate) return hydrateWorkflowTemplate(action.fallbackTemplate, item);
  return "";
}

function isWorkflowActionAvailable(action = {}, item = {}) {
  if (!action?.id || !item?.id) return false;
  const validStatuses = Array.isArray(action.validStatuses) ? action.validStatuses : [];
  if (validStatuses.length && !validStatuses.includes(item.status)) return false;
  if (action.requiresPlan && !item.relatedPlanId) return false;
  if (action.executionMode === "manual_copy" && !getWorkflowManualCopyValue(action, item)) return false;
  return true;
}

function getWorkflowActionsForItem(item) {
  if (!item) return [];
  return SENTINEL_CONTENT_WORKFLOW_ACTION_LIST.filter((action) => isWorkflowActionAvailable(action, item));
}

function getWorkflowActionGroupsForItem(item) {
  const available = getWorkflowActionsForItem(item);
  const primary = available.filter((action) => (
    Array.isArray(action.primaryStatuses) && action.primaryStatuses.includes(item.status)
  ));
  const primaryIds = new Set(primary.map((action) => action.id));
  const manual = available.filter((action) => action.executionMode === "manual_copy" && !primaryIds.has(action.id));
  const manualIds = new Set(manual.map((action) => action.id));
  const secondary = available.filter((action) => !primaryIds.has(action.id) && !manualIds.has(action.id));

  return { primary, secondary, manual };
}

function getPrimaryWorkflowActionForItem(item) {
  const { primary, secondary, manual } = getWorkflowActionGroupsForItem(item);
  return primary[0] || secondary[0] || manual[0] || null;
}

function workflowActionSafetyLabel(action = {}) {
  if (action.safety === "safe_allowlisted") return "Allowlisted";
  if (action.safety === "manual_review") return "Manual review";
  return "Local state";
}

function workflowActionModeLabel(action = {}) {
  if (action.executionMode === "allowlisted_action") return "Runs safe action";
  if (action.executionMode === "allowlisted_pipeline") return "Runs safe workflow";
  if (action.executionMode === "manual_copy") return "Copies next step";
  return "Updates workflow";
}

function workflowActionButtonClass(action = {}, active = false) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50";
  if (active) return `${base} bg-white text-slate-950 shadow-lg shadow-cyan-950/20 hover:bg-cyan-100`;
  if (action.executionMode === "manual_copy") return `${base} bg-white/10 text-white hover:bg-white/15`;
  if (action.executionMode === "allowlisted_action" || action.executionMode === "allowlisted_pipeline") {
    return `${base} bg-blue-300/15 text-blue-100 ring-1 ring-blue-200/20 hover:bg-blue-300/25`;
  }
  return `${base} bg-white text-slate-950 hover:bg-cyan-100`;
}

function resolveTenantRegistrySnapshot(tenantRegistrySnapshot) {
  const registry = tenantRegistrySnapshot?.registry || sentinelTenantRegistry;
  const tenants = Array.isArray(registry?.tenants) ? registry.tenants : [];
  const defaultTenantId = registry?.defaultTenantId || "erp-experts";
  const activeTenant = tenants.find((tenant) => tenant.status === "active")
    || tenants.find((tenant) => tenant.tenantId === defaultTenantId)
    || tenants[0]
    || {};

  return {
    registry,
    tenants,
    defaultTenantId,
    activeTenant,
    source: tenantRegistrySnapshot?.source || "registry",
  };
}

function formatStateLabel(value = "") {
  return String(value || "unknown").replaceAll("_", " ");
}

function initialAuthoritySnapshot() {
  const mode = sentinelAuthorityMode === "enabled" ? "enabled" : "disabled";
  return {
    mode,
    authorityName: "Matthew-controlled Sentinel API",
    localBypass: mode === "disabled",
    authorityVerified: false,
    state: mode === "enabled" ? "authority_required" : "local_bypass",
    source: "frontend_config",
  };
}

function canUseOperatorAuthority(authoritySnapshot) {
  const state = authoritySnapshot?.state || "local_bypass";
  return state === "local_bypass" || state === "authority_verified";
}

function authorityStateBadgeClass(state = "") {
  if (state === "authority_verified" || state === "local_bypass") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }
  if (state === "authority_required") {
    return "bg-amber-50 text-amber-800 ring-amber-100";
  }
  return "bg-rose-50 text-rose-700 ring-rose-100";
}

function authorityDisabledMessage(authoritySnapshot) {
  if (canUseOperatorAuthority(authoritySnapshot)) return "";
  if (authoritySnapshot?.state === "authority_required") {
    return "Operator authority is required before controlled actions can run.";
  }
  return "Operator authority could not be verified. Controlled actions are locked.";
}

function formatDateTime(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDurationMs(value) {
  const duration = Number(value || 0);
  if (!Number.isFinite(duration) || duration <= 0) return "Not recorded";
  if (duration < 1000) return `${Math.round(duration)}ms`;
  if (duration < 60_000) return `${Math.round(duration / 1000)}s`;
  const minutes = Math.floor(duration / 60_000);
  const seconds = Math.round((duration % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function formatExecutionDuration(execution) {
  if (!execution) return "Not recorded";
  return execution.durationLabel || formatDurationMs(execution.durationMs);
}

function normaliseExecutionStatus(status = "") {
  if (status === "failure") return "failed";
  return status || "queued";
}

function workflowBadgeClass(state = "") {
  if (state === "blocked" || state === "human_review_required") {
    return "bg-rose-50 text-rose-700 ring-rose-100";
  }
  if (state === "planning_required" || state === "approval_required" || state === "execution_ready") {
    return "bg-amber-50 text-amber-800 ring-amber-100";
  }
  if (state === "healthy_monitoring") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }
  return "bg-blue-50 text-blue-700 ring-blue-100";
}

function actionStatusBadgeClass(status = "") {
  const normalisedStatus = normaliseExecutionStatus(status);
  if (normalisedStatus === "success") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (normalisedStatus === "running") return "bg-blue-50 text-blue-700 ring-blue-100";
  if (normalisedStatus === "queued") return "bg-slate-50 text-slate-700 ring-slate-100";
  if (normalisedStatus === "cancelled") return "bg-amber-50 text-amber-800 ring-amber-100";
  return "bg-rose-50 text-rose-700 ring-rose-100";
}

function waitForConsolePoll(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function pollSentinelActionExecution(executionId, { onUpdate, pollIntervalMs = 900, maxPolls = 160 } = {}) {
  let latest = null;
  for (let attempt = 0; attempt < maxPolls; attempt += 1) {
    const response = await fetch(`${sentinelActionApiBaseUrl}/actions/execution/${encodeURIComponent(executionId)}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Execution polling returned ${response.status}`);
    latest = await response.json();
    if (typeof onUpdate === "function") onUpdate(latest);
    if (SENTINEL_TERMINAL_EXECUTION_STATES.has(normaliseExecutionStatus(latest.status))) return latest;
    await waitForConsolePoll(pollIntervalMs);
  }
  return latest;
}

async function pollSentinelPipelineExecution(executionId, { onUpdate, pollIntervalMs = 1000, maxPolls = 240 } = {}) {
  let latest = null;
  for (let attempt = 0; attempt < maxPolls; attempt += 1) {
    const response = await fetch(`${sentinelActionApiBaseUrl}/pipeline/execution/${encodeURIComponent(executionId)}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Pipeline polling returned ${response.status}`);
    latest = await response.json();
    if (typeof onUpdate === "function") onUpdate(latest);
    if (SENTINEL_TERMINAL_EXECUTION_STATES.has(normaliseExecutionStatus(latest.status))) return latest;
    await waitForConsolePoll(pollIntervalMs);
  }
  return latest;
}

function activitySeverityBadgeClass(severity = "") {
  if (severity === "success") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (severity === "warning") return "bg-amber-50 text-amber-800 ring-amber-100";
  if (severity === "error") return "bg-rose-50 text-rose-700 ring-rose-100";
  return "bg-blue-50 text-blue-700 ring-blue-100";
}

function activityVisualHintBadgeClass(visualHint = "") {
  if (visualHint === "pink") return "bg-pink-50 text-pink-700 ring-pink-100";
  if (visualHint === "violet") return "bg-violet-50 text-violet-700 ring-violet-100";
  if (visualHint === "amber") return "bg-amber-50 text-amber-800 ring-amber-100";
  if (visualHint === "emerald") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (visualHint === "indigo") return "bg-indigo-50 text-indigo-700 ring-indigo-100";
  if (visualHint === "cyan") return "bg-cyan-50 text-cyan-700 ring-cyan-100";
  if (visualHint === "blue") return "bg-blue-50 text-blue-700 ring-blue-100";
  return "bg-slate-50 text-slate-700 ring-slate-100";
}

function activitySeverityDotClass(severity = "") {
  if (severity === "success") return "bg-emerald-500";
  if (severity === "warning") return "bg-amber-500";
  if (severity === "error") return "bg-rose-500";
  return "bg-blue-500";
}

function buildMonitorInsights({ points, modeKey }) {
  const list = Array.isArray(points) ? points : [];
  const latest = list[list.length - 1] || null;
  const previous = list.length > 1 ? list[list.length - 2] : null;
  const isHealthy = (point) => Number(point?.needsReview || 0) === 0 && Number(point?.blocked || 0) === 0;

  let healthyStreak = 0;
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (!isHealthy(list[i])) break;
    healthyStreak += 1;
  }

  let regressionStreak = 0;
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (isHealthy(list[i])) break;
    regressionStreak += 1;
  }

  let recoveredAgo = null;
  if (latest && isHealthy(latest)) {
    for (let i = list.length - 2; i >= 0; i -= 1) {
      if (!isHealthy(list[i])) {
        recoveredAgo = list.length - 1 - i;
        break;
      }
    }
  }

  return {
    latest,
    previous,
    healthyStreak,
    regressionStreak,
    recoveredAgo,
    trendState: modeKey === "monitor" ? "Stable" : modeKey === "blocked" ? "Escalated" : "Watchlist",
  };
}

function pickNextBestAction({ pipelineSummary, qaReport, weeklySummary, briefs }) {
  const gate = qaReport?.gateSummary || {};
  const blocked = Number(gate.blocked || 0);
  const needsReview = Number(gate.needs_review || 0);
  const humanReviewRecommended = Boolean(pipelineSummary?.review?.humanReviewRecommended);
  const reviewReason = pipelineSummary?.review?.reason || "Pipeline flagged review risk.";
  const actions = Array.isArray(weeklySummary?.topRecommendedActions) ? weeklySummary.topRecommendedActions : [];
  const topWeekly = actions[0];
  const list = Array.isArray(briefs) ? briefs : [];
  const improveBriefs = list
    .filter((b) => b.recommendationType === "improve_existing")
    .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
  const createBriefs = list
    .filter((b) => b.recommendationType === "create_new")
    .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
  const blockedArticle = Array.isArray(qaReport?.articles)
    ? qaReport.articles.find((a) => a.gate === "blocked")
    : null;

  if (humanReviewRecommended) {
    return {
      title: "Run a human review on the latest pipeline snapshot",
      why: reviewReason,
      targetTitle: topWeekly?.title || pipelineSummary?.pipeline?.snapshotDir?.split("/").at(-1) || "Current snapshot",
      priority: "Risk control",
      command: "npm run seo:pipeline",
      actionPath: "/seo-roadmap",
      buttonLabel: "Open diagnostics",
      codexPrompt: null,
    };
  }
  if (blocked > 0 && blockedArticle) {
    return {
      title: `Fix blocked article: ${blockedArticle.title}`,
      why: "Blocked pages halt quality progression and should be cleared before new publishing work.",
      targetTitle: blockedArticle.slug,
      priority: "Critical",
      command: `npm run seo:after-edit -- ${blockedArticle.slug}`,
      actionPath: `/resources/${blockedArticle.slug}`,
      buttonLabel: "Open article",
      codexPrompt: null,
    };
  }
  if (needsReview === 0 && blocked === 0) {
    return {
      title: "No maintenance action required. Growth opportunities available.",
      why: "QA health is stable. Keep weekly monitoring active, then review growth opportunities below.",
      targetTitle: pipelineSummary?.pipeline?.snapshotDir?.split("/").at(-1) || "latest snapshot",
      priority: "Monitoring",
      command: "npm run seo:monitor",
      actionPath: "/seo-roadmap",
      buttonLabel: "Open monitor view",
      codexPrompt: null,
    };
  }
  if (improveBriefs.length > 0) {
    const brief = improveBriefs[0];
    return {
      title: `Improve "${brief.preferredTitle || brief.targetArticleTitle}"`,
      why: brief.whyThisMattersCommercially || brief.whyThisMatters || "This article is still underperforming against QA expectations.",
      targetTitle: brief.targetSlug || brief.targetArticleTitle,
      priority: `${brief.conversionIntentLabel || "medium"} intent · priority ${brief.priorityScore ?? "n/a"}`,
      command: brief.targetSlug ? `npm run seo:after-edit -- ${brief.targetSlug}` : "npm run seo:pipeline",
      actionPath: brief.targetSlug ? `/resources/${brief.targetSlug}` : "/seo-roadmap",
      buttonLabel: brief.targetSlug ? "Open article" : "Open dashboard",
      codexPrompt: brief.codexPatchPrompt || null,
    };
  }
  if (createBriefs.length > 0) {
    const brief = createBriefs[0];
    return {
      title: `Create "${brief.preferredTitle || brief.targetArticleTitle}"`,
      why: brief.whyThisMattersCommercially || brief.whyThisMatters || "This demand-led topic is currently uncovered.",
      targetTitle: brief.rawQuery || brief.targetArticleTitle,
      priority: `${brief.conversionIntentLabel || "medium"} intent · priority ${brief.priorityScore ?? "n/a"}`,
      command: "npm run seo:pipeline",
      actionPath: "/seo-roadmap",
      buttonLabel: "Open planning view",
      codexPrompt: brief.codexPatchPrompt || null,
    };
  }
  if (needsReview > 0) {
    return {
      title: "Continue reducing needs_review articles",
      why: `${needsReview} articles still need improvements before the quality baseline is stable.`,
      targetTitle: "needs_review queue",
      priority: "Operational",
      command: "npm run seo:pipeline",
      actionPath: "/seo-roadmap",
      buttonLabel: "Open queue",
      codexPrompt: null,
    };
  }
  return {
    title: "Monitor and rerun the weekly pipeline",
    why: "QA is stable. Keep momentum by checking trend drift and demand changes weekly.",
    targetTitle: pipelineSummary?.pipeline?.snapshotDir?.split("/").at(-1) || "latest snapshot",
    priority: "Monitor",
    command: "npm run seo:pipeline && npm run seo:stats",
    actionPath: "/seo-roadmap",
    buttonLabel: "Open dashboard",
    codexPrompt: null,
  };
}

function buildBatchQueueItems({ qaReport, briefs }) {
  if (!qaReport || !Array.isArray(qaReport.articles)) return [];
  const qaBySlug = new Map(qaReport.articles.map((a) => [a.slug, a]));
  const selected = new Set();

  const buildFallbackPrompt = (qa) => {
    const warnings = qa?.issues?.warnings || [];
    const warningList = warnings.length ? warnings.map((w) => `- ${w}`).join("\n") : "- No explicit warnings listed; improve clarity and service relevance.";
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
  };

  const warningPriority = (qa) => {
    const warnings = qa?.issues?.warnings || [];
    const joined = warnings.join(" ").toLowerCase();
    const missingCta = /missing or weak service-relevant cta/.test(joined);
    const thin = /intro looks thin|thin/.test(joined);
    if (missingCta) return 0;
    if (thin) return 1;
    return 2;
  };

  const fromBriefs = (Array.isArray(briefs) ? briefs : [])
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
        why: brief.whyThisMattersCommercially || brief.whyThisMatters || "Needs quality improvement.",
        fixSummary: (brief.suggestedContentChanges || []).slice(0, 2),
        command: `npm run seo:after-edit -- ${brief.targetSlug}`,
        route: `/resources/${brief.targetSlug}`,
        prompt: brief.codexPatchPrompt || null,
        topIssue: qa?.issues?.warnings?.[0] || "Needs quality improvement.",
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.commercialScore !== a.commercialScore) return b.commercialScore - a.commercialScore;
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      return a.qaScore - b.qaScore;
    });

  const fromQaFallback = qaReport.articles
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
      why: "No improve_existing brief was available, so this item is queued directly from QA needs_review.",
      fixSummary: (qa?.issues?.warnings || []).slice(0, 2).length
        ? (qa?.issues?.warnings || []).slice(0, 2)
        : ["Improve overall article quality and rerun QA."],
      command: `npm run seo:after-edit -- ${qa.slug}`,
      route: `/resources/${qa.slug}`,
      prompt: buildFallbackPrompt(qa),
      topIssue: qa?.issues?.warnings?.[0] || "Needs quality improvement.",
      warningPriority: warningPriority(qa),
    }))
    .sort((a, b) => {
      if (a.qaScore !== b.qaScore) return a.qaScore - b.qaScore;
      if (a.warningPriority !== b.warningPriority) return a.warningPriority - b.warningPriority;
      return a.slug.localeCompare(b.slug);
    });

  const merged = [...fromBriefs];
  for (const fallback of fromQaFallback) {
    if (merged.length >= 3) break;
    merged.push(fallback);
  }

  return merged.slice(0, 3).map((item, idx) => ({ ...item, rank: idx + 1 }));
}

function buildBatchCombinedPrompt(items) {
  if (!items.length) return "";
  const articleBlocks = items.map((item) => {
    return `Article ${item.rank}
- Title: ${item.title}
- Slug: ${item.slug}
- QA score: ${item.qaScore}
- Priority: ${item.priorityScore}
- Command after edit: ${item.command}
${item.prompt ? `\nPrompt to apply:\n${item.prompt}` : ""}`;
  }).join("\n\n");

  const perArticleValidation = items.map((item) => `- ${item.command}`).join("\n");

  return `You are improving a batch of 3 SEO resource articles.

Work sequentially, not all at once.
Do not move to the next article until the current one passes checks.

${articleBlocks}

Safety constraints:
- Only edit the specified article objects in src/data/articles.js.
- Preserve article data shape.
- Do not edit routes or components.
- Do not invent fake statistics, customers, or case studies.
- Use UK English.
- Avoid repetitive CTA and conclusion phrasing.

Validation after each article:
${perArticleValidation}

Stop immediately if any of these occur:
- lint fails
- build fails
- an article remains needs_review after editing
- humanReviewRecommended becomes true
- blocked count becomes greater than 0

After all three articles:
- npm run lint
- npm run build
- npm run seo:pipeline
- npm run seo:stats

Delivery summary format:
- Article slug
- What changed
- QA result after edit
- Any warnings still present
- Final pass/needs_review/blocked totals`;
}

function computeDashboardMode({ summaryGate, humanReviewRecommended, queueLength }) {
  const pass = Number(summaryGate?.pass || 0);
  const needsReview = Number(summaryGate?.needs_review || 0);
  const blocked = Number(summaryGate?.blocked || 0);
  const healthy = !humanReviewRecommended && blocked === 0 && needsReview === 0;
  if (healthy) {
    return {
      key: "monitor",
      stateLabel: "HEALTHY",
      flowLabel: "MONITORING",
      outcomeLabel: "NO ACTION REQUIRED",
      actionLabel: "Maintenance status",
      modeLabel: "Monitoring only",
      tone: "emerald",
      pass,
      needsReview,
      blocked,
    };
  }
  if (humanReviewRecommended || blocked > 0) {
    return {
      key: "blocked",
      stateLabel: "BLOCKED",
      flowLabel: humanReviewRecommended ? "HUMAN REVIEW REQUIRED" : "BLOCKED ARTICLES PRESENT",
      outcomeLabel: "IMMEDIATE ATTENTION REQUIRED",
      actionLabel: "Immediate Attention Required",
      modeLabel: humanReviewRecommended ? "Human review required" : "Blocked pages need fixing",
      tone: "rose",
      pass,
      needsReview,
      blocked,
    };
  }
  return {
    key: "operator",
    stateLabel: "WARNING",
    flowLabel: `${needsReview} ARTICLES NEED REVIEW`,
    outcomeLabel: "RUN BATCH",
    actionLabel: "Next Required Action",
    modeLabel: queueLength <= 2 ? `Final mini-batch: ${needsReview} article${needsReview === 1 ? "" : "s"} remaining` : "Ready for next batch",
    tone: "amber",
    pass,
    needsReview,
    blocked,
  };
}

function SystemStateRail({ mode }) {
  const toneClass = mode.tone === "emerald"
    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
    : mode.tone === "rose"
    ? "bg-rose-50 text-rose-800 border-rose-200"
    : "bg-amber-50 text-amber-800 border-amber-200";
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm" style={{ padding: "var(--space-sm) var(--space-md)" }}>
      <div className="flex items-center gap-2 flex-wrap text-xs font-bold tracking-wide">
        <span className={`inline-flex rounded-full border px-2.5 py-1 ${toneClass}`}>{mode.stateLabel}</span>
        <span className="text-slate-400">→</span>
        <span className={`inline-flex rounded-full border px-2.5 py-1 ${toneClass}`}>{mode.flowLabel}</span>
        <span className="text-slate-400">→</span>
        <span className={`inline-flex rounded-full border px-2.5 py-1 ${toneClass}`}>{mode.outcomeLabel}</span>
      </div>
    </div>
  );
}

function AutopilotStatusPanel({ mode, pipelineSummary, monitorInsights }) {
  const generatedAt = pipelineSummary?.generatedAt
    ? new Date(pipelineSummary.generatedAt).toLocaleString("en-GB")
    : "Unavailable";
  const cadence = "Weekly via GitHub Actions";
  const healthyLine = monitorInsights.healthyStreak > 0
    ? `Healthy for ${monitorInsights.healthyStreak} consecutive snapshot${monitorInsights.healthyStreak === 1 ? "" : "s"}.`
    : "Healthy streak not established yet.";
  const recoveryLine = monitorInsights.recoveredAgo !== null
    ? `Recovered from regression ${monitorInsights.recoveredAgo} snapshot${monitorInsights.recoveredAgo === 1 ? "" : "s"} ago.`
    : null;
  const warningLine = monitorInsights.regressionStreak > 0
    ? `Regression streak: ${monitorInsights.regressionStreak} snapshot${monitorInsights.regressionStreak === 1 ? "" : "s"}.`
    : "No active regression streak.";
  const blockedTone = mode.key === "blocked";
  const warningTone = mode.key === "operator";

  return (
    <div className={`rounded-2xl border ${blockedTone ? "border-rose-200 bg-rose-50" : warningTone ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`} style={{ padding: "var(--space-lg)" }}>
      <div className="flex items-start justify-between gap-md flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {mode.key === "monitor" ? "Weekly Autopilot Active" : mode.key === "blocked" ? "Autopilot Escalated" : "Autopilot Watch"}
          </p>
          <p className="text-sm font-semibold text-slate-900" style={{ marginTop: "4px" }}>
            {mode.key === "monitor" ? "No action required" : mode.key === "blocked" ? "Immediate intervention required" : "Operator follow-up recommended"}
          </p>
        </div>
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${blockedTone ? "border-rose-200 bg-white text-rose-700" : warningTone ? "border-amber-200 bg-white text-amber-700" : "border-emerald-200 bg-white text-emerald-700"}`}>
          {monitorInsights.trendState}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-sm text-xs text-slate-700" style={{ marginTop: "var(--space-sm)" }}>
        <p>Last successful monitor check: <strong>{generatedAt}</strong></p>
        <p>Monitoring cadence: <strong>{cadence}</strong></p>
      </div>

      <p className="text-xs text-slate-700" style={{ marginTop: "var(--space-xs)" }}>
        {mode.key === "monitor" ? healthyLine : warningLine}
      </p>
      {mode.key === "monitor" && recoveryLine ? (
        <p className="text-xs text-slate-600" style={{ marginTop: "4px" }}>{recoveryLine}</p>
      ) : null}
    </div>
  );
}

function SentinelStatePanel({ sentinelState, source = "fallback" }) {
  const sourceLabel = source === "api" ? "API" : source === "report" ? "report" : "fallback";

  if (!sentinelState) {
    return (
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
        <div className="flex items-start justify-between gap-md flex-wrap">
          <div>
            <p className="text-sm font-semibold text-slate-900">Current Sentinel State</p>
            <p className="text-xs text-slate-600">Persisted operational summary is not available yet.</p>
          </div>
          <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
            state missing
          </span>
        </div>
        <p className="text-[11px] font-medium text-slate-400" style={{ marginTop: "6px" }}>
          Source: {sourceLabel}
        </p>
        <p className="text-sm text-slate-600" style={{ marginTop: "10px" }}>
          Generate the Sentinel state summary to populate this panel. The dashboard will continue to work without it.
        </p>
      </section>
    );
  }

  const tenantName = sentinelState?.tenant?.name || "Current tenant";
  const workflowState = sentinelState?.workflow?.state || "unknown";
  const healthState = sentinelState?.health?.monitorStatus || "Unknown";
  const latestOpportunity = sentinelState?.opportunities?.top;
  const latestPlan = sentinelState?.plans?.top;
  const recommendedNextStep = sentinelState?.workflow?.recommendedNextStep || "No maintenance action required.";
  const humanInputRequired = Boolean(sentinelState?.workflow?.humanInputRequired);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
      <div className="flex items-start justify-between gap-md flex-wrap">
        <div>
          <p className="text-sm font-semibold text-slate-900">Current Sentinel State</p>
          <p className="text-xs text-slate-600">{tenantName} · Health {healthState}</p>
          <p className="text-[11px] font-medium text-slate-400" style={{ marginTop: "3px" }}>
            Source: {sourceLabel}
          </p>
        </div>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${workflowBadgeClass(workflowState)}`}>
          {formatStateLabel(workflowState)}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3" style={{ marginTop: "14px" }}>
        <div>
          <p className="text-xs text-slate-500">Latest opportunity</p>
          <p className="text-sm font-semibold text-slate-900">{latestOpportunity?.title || "No strategic opportunity recorded"}</p>
          {latestOpportunity?.priorityLabel ? (
            <p className="text-xs text-slate-500" style={{ marginTop: "3px" }}>
              {latestOpportunity.priorityLabel} priority{latestOpportunity.score ? ` · score ${latestOpportunity.score}` : ""}
            </p>
          ) : null}
        </div>
        <div>
          <p className="text-xs text-slate-500">Latest plan</p>
          <p className="text-sm font-semibold text-slate-900">{latestPlan?.planId || "No plan recorded"}</p>
          {latestPlan?.title ? (
            <p className="text-xs text-slate-500" style={{ marginTop: "3px" }}>{latestPlan.title}</p>
          ) : null}
        </div>
        <div>
          <p className="text-xs text-slate-500">Recommended next step</p>
          <p className="text-sm font-semibold text-slate-900">{recommendedNextStep}</p>
          <p className="text-xs text-slate-500" style={{ marginTop: "3px" }}>
            Human input: {humanInputRequired ? "required" : "not required"}
          </p>
        </div>
      </div>
    </section>
  );
}

function CadenceSummaryPanel({ cadenceSummary }) {
  if (!cadenceSummary) {
    return (
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
        <div className="flex items-start justify-between gap-md flex-wrap">
          <div>
            <p className="text-sm font-semibold text-slate-900">Cadence Summary</p>
            <p className="text-xs text-slate-600">No cadence run recorded yet.</p>
          </div>
          <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
            waiting
          </span>
        </div>
        <p className="text-sm text-slate-600" style={{ marginTop: "10px" }}>
          Run <code className="rounded bg-slate-50 px-1.5 py-0.5 text-xs text-slate-700">npm run platform:cadence</code> to generate the latest cadence summary.
        </p>
      </section>
    );
  }

  const generatedReports = Array.isArray(cadenceSummary.generatedReports) ? cadenceSummary.generatedReports : [];
  const notificationsGenerated = Boolean(cadenceSummary.notificationsGenerated);
  const stakeholderSafety = cadenceSummary.stakeholderSafetyStatus || "not recorded";
  const modeLabel = formatStateLabel(cadenceSummary.mode || "unknown");
  const healthStatus = cadenceSummary.health?.status || "Unknown";
  const workflow = cadenceSummary.workflow || "unknown";

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
      <div className="flex items-start justify-between gap-md flex-wrap">
        <div>
          <p className="text-sm font-semibold text-slate-900">Cadence Summary</p>
          <p className="text-xs text-slate-600">Last run {formatDateTime(cadenceSummary.ranAt)}</p>
        </div>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${workflowBadgeClass(workflow)}`}>
          {modeLabel}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2" style={{ marginTop: "14px" }}>
        <div>
          <p className="text-xs text-slate-500">Health</p>
          <p className="text-sm font-semibold text-slate-900">{healthStatus}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Workflow</p>
          <p className="text-sm font-semibold text-slate-900">{formatStateLabel(workflow)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Reports generated</p>
          <p className="text-sm font-semibold text-slate-900">{generatedReports.length}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Notifications</p>
          <p className="text-sm font-semibold text-slate-900">{notificationsGenerated ? "prepared" : "not prepared"}</p>
          <p className="text-xs text-slate-500" style={{ marginTop: "3px" }}>
            Stakeholder safety: {formatStateLabel(stakeholderSafety)}
          </p>
        </div>
      </div>

      <div style={{ marginTop: "14px" }}>
        <p className="text-xs text-slate-500">Next step</p>
        <p className="text-sm font-semibold text-slate-900">{cadenceSummary.nextStep || "No cadence next step recorded."}</p>
      </div>

      {generatedReports.length ? (
        <details className="text-xs text-slate-500" style={{ marginTop: "12px" }}>
          <summary className="cursor-pointer font-semibold text-slate-600">View generated artefacts</summary>
          <ul className="grid gap-1" style={{ marginTop: "8px" }}>
            {generatedReports.map((report) => (
              <li key={report}>{report}</li>
            ))}
            {cadenceSummary.operatorNotificationPath ? <li>{cadenceSummary.operatorNotificationPath}</li> : null}
            {cadenceSummary.stakeholderNotificationPath ? <li>{cadenceSummary.stakeholderNotificationPath}</li> : null}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

function statusToneClasses(value = "") {
  const normalised = String(value || "").toLowerCase();
  if (/blocked|fail|not ready|action|required|critical/.test(normalised)) {
    return "bg-rose-50 text-rose-700 ring-rose-100";
  }
  if (/warning|review|planning|approval|ready with warnings/.test(normalised)) {
    return "bg-amber-50 text-amber-800 ring-amber-100";
  }
  if (/healthy|ready|pass|success|active/.test(normalised)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }
  return "bg-slate-50 text-slate-700 ring-slate-100";
}

function MiniStatusItem({ label, value, detail, tone = "neutral" }) {
  return (
    <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-100">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="flex items-center gap-2" style={{ marginTop: "6px" }}>
        <span className={`inline-flex h-2.5 w-2.5 rounded-full ${tone === "healthy" ? "bg-emerald-500" : tone === "warning" ? "bg-amber-500" : tone === "danger" ? "bg-rose-500" : "bg-slate-300"}`} />
        <p className="text-sm font-semibold text-slate-950">{value}</p>
      </div>
      {detail ? <p className="text-xs text-slate-500" style={{ marginTop: "5px" }}>{detail}</p> : null}
    </div>
  );
}

function SentinelLogoMark({ className = "h-12 w-12", compact = false }) {
  return (
    <svg
      className={className}
      viewBox="0 0 96 96"
      role="img"
      aria-label="Sentinel"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sentinel-mark-core" x1="20" y1="10" x2="82" y2="86" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8FF7FF" />
          <stop offset="0.52" stopColor="#27D6E8" />
          <stop offset="1" stopColor="#7C6CFF" />
        </linearGradient>
        <radialGradient id="sentinel-mark-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(32 22) rotate(52) scale(74)">
          <stop stopColor="#9CF7FF" stopOpacity="0.7" />
          <stop offset="0.58" stopColor="#143C62" stopOpacity="0.55" />
          <stop offset="1" stopColor="#030713" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <rect x="3" y="3" width="90" height="90" rx="26" fill="#07111F" />
      <rect x="3" y="3" width="90" height="90" rx="26" fill="url(#sentinel-mark-glow)" />
      <rect x="4.5" y="4.5" width="87" height="87" rx="24.5" stroke="url(#sentinel-mark-core)" strokeOpacity="0.55" strokeWidth="3" />
      <path d="M48 18L71 29.5V48.5C71 63.6 61.1 76.2 48 80C34.9 76.2 25 63.6 25 48.5V29.5L48 18Z" stroke="url(#sentinel-mark-core)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M55.2 29.5L39.4 48.5H52.2L40.8 67.5L60.1 43.9H47.2L55.2 29.5Z" fill="url(#sentinel-mark-core)" />
      {compact ? null : (
        <>
          <circle cx="48" cy="48" r="30" stroke="#B7FBFF" strokeOpacity="0.12" strokeWidth="2" />
          <circle cx="48" cy="48" r="7" stroke="#B7FBFF" strokeOpacity="0.22" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}

function SentinelAppHeader({
  activeTenant,
  dashboardMode,
  summaryGate,
  sentinelState,
  sentinelStateSource,
  cadenceSummary,
  readinessSummary,
  dashboardLoadedAt,
  onPreview,
  compactView,
  onCompactViewChange,
  onResetWorkspace,
  standaloneMode = false,
}) {
  const workflowState = sentinelState?.workflow?.state || "unknown";
  const cadenceLabel = cadenceSummary?.ranAt ? formatDateTime(cadenceSummary.ranAt) : "Not recorded";
  const readinessStatus = readinessSummary?.overallStatus || "Not checked";
  const headerClass = standaloneMode
    ? "relative z-10 border-b border-cyan-100/10 bg-[#030611]/92 text-white shadow-2xl shadow-slate-950/30 backdrop-blur"
    : "border-b border-slate-200 bg-white/90 backdrop-blur";
  const eyebrowClass = standaloneMode
    ? "text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/80"
    : "text-xs font-semibold uppercase tracking-[0.18em] text-pink-600";
  const titleClass = standaloneMode ? "font-heading text-white" : "font-heading text-slate-950";
  const descriptionClass = standaloneMode ? "text-sm text-slate-400" : "text-sm text-slate-600";
  const metaClass = standaloneMode ? "text-xs text-slate-300" : "text-xs text-slate-500";
  const pillClass = standaloneMode
    ? "rounded-full bg-white/[0.045] px-2.5 py-1 ring-1 ring-white/10"
    : "rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-100";
  const strongClass = standaloneMode ? "text-white" : "text-slate-800";
  const statusCardClass = standaloneMode
    ? "rounded-xl bg-white/8 px-3 py-2 ring-1 ring-white/10"
    : "rounded-xl bg-slate-50/70 px-3 py-2 ring-1 ring-slate-100";
  const statusGridClass = standaloneMode
    ? "grid gap-2 sm:grid-cols-2 2xl:grid-cols-4"
    : "grid gap-2 sm:grid-cols-2 xl:grid-cols-4";
  const statusLabelClass = standaloneMode
    ? "text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400"
    : "text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500";
  const statusValueClass = standaloneMode ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-950";
  const statusDetailClass = standaloneMode ? "text-[11px] text-slate-400" : "text-[11px] text-slate-500";
  const buttonClass = standaloneMode
    ? "inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.045] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-200/30 hover:bg-white/[0.09] transition-colors cursor-pointer"
    : "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer";
  const containerClass = standaloneMode
    ? "mx-auto box-border w-full max-w-[1540px] px-[var(--space-lg)] md:px-[var(--space-xl)] 2xl:px-[var(--space-2xl)]"
    : "container";
  const headerStyle = standaloneMode
    ? {
      background:
        "radial-gradient(circle at 10% 0%, rgba(34, 211, 238, 0.18), transparent 28%), radial-gradient(circle at 84% 12%, rgba(59, 130, 246, 0.12), transparent 32%), #050914",
    }
    : undefined;
  const statusChips = [
    {
      label: "Health",
      value: dashboardMode.stateLabel,
      detail: `${summaryGate.pass} pass`,
      tone: "bg-emerald-300",
    },
    {
      label: "Authority",
      value: sentinelAuthorityMode === "enabled" ? "required" : "local bypass",
      detail: "operator gate",
      tone: sentinelAuthorityMode === "enabled" ? "bg-amber-300" : "bg-cyan-300",
    },
    {
      label: "Runtime",
      value: sentinelStateSource === "api" ? "Pi node" : "local fallback",
      detail: sentinelStateSource || "state",
      tone: sentinelStateSource === "api" ? "bg-cyan-300" : "bg-slate-400",
    },
    {
      label: "Cadence",
      value: cadenceSummary?.mode ? formatStateLabel(cadenceSummary.mode) : "not recorded",
      detail: cadenceSummary?.ranAt ? "latest run" : "pending",
      tone: cadenceSummary?.mode ? "bg-blue-300" : "bg-slate-400",
    },
  ];

  return (
    <header className={headerClass} style={headerStyle}>
      <div className={containerClass} style={{ paddingTop: "var(--space-md)", paddingBottom: "var(--space-md)" }}>
        <div className={standaloneMode ? "grid gap-4" : "flex items-center justify-between gap-lg flex-wrap"}>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              {standaloneMode ? (
                <SentinelLogoMark className="h-14 w-14 shrink-0" />
              ) : (
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 ring-1 ring-pink-100">
                  <Zap size={17} />
                </span>
              )}
              <div>
                <p className={eyebrowClass}>{standaloneMode ? "Sentinel by Artifexa" : "Sentinel"}</p>
                <h1 className={titleClass} style={{ fontSize: standaloneMode ? "clamp(1.35rem, 2.4vw, 1.9rem)" : "clamp(1.65rem, 3vw, 2.2rem)", lineHeight: 1.02 }}>
                  {standaloneMode ? "Sentinel" : "Control Centre"}
                </h1>
              </div>
            </div>
            <p className={descriptionClass} style={{ marginTop: "8px" }}>
              {standaloneMode
                ? "Private content operations workspace. ERP Experts is the active tenant, not the app brand."
                : "Private operator app shell for state, cadence, actions, tenants and diagnostics."}
            </p>
            <div className={`flex flex-wrap items-center gap-2 ${metaClass}`} style={{ marginTop: "8px" }}>
              <span className={pillClass}>
                Tenant: <strong className={strongClass}>{activeTenant?.name || "ERP Experts"}</strong>
              </span>
              {standaloneMode ? (
                <span className={pillClass}>
                  Operator space: <strong className={strongClass}>Artifexa-owned</strong>
                </span>
              ) : null}
              {standaloneMode ? (
                <span className={pillClass}>
                  Authority: <strong className={strongClass}>{sentinelAuthorityMode === "enabled" ? "required" : "local bypass"}</strong>
                </span>
              ) : null}
              <span className={pillClass}>
                Loaded {dashboardLoadedAt.toLocaleTimeString("en-GB")}
              </span>
            </div>
          </div>

          {standaloneMode ? (
            <div className="min-w-0 flex flex-1 flex-col items-start gap-3">
              <div className="flex w-full flex-wrap items-center justify-start gap-2" aria-label="Sentinel operational status">
                {statusChips.map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-slate-300 shadow-sm shadow-slate-950/10">
                    <span className={`h-1.5 w-1.5 rounded-full ${item.tone}`} />
                    <span className="font-semibold text-slate-100">{item.label}</span>
                    <span>{item.value}</span>
                    <span className="hidden text-slate-500 sm:inline">{item.detail}</span>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-start gap-2">
                <button
                  onClick={() => onCompactViewChange(!compactView)}
                  className={buttonClass}
                >
                  {compactView ? "Expanded view" : "Compact view"}
                </button>
                <button
                  onClick={onResetWorkspace}
                  className={buttonClass}
                >
                  Reset workspace
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className={buttonClass}
                >
                  <CheckCircle2 size={14} />
                  Refresh
                </button>
                <button
                  onClick={onPreview}
                  className={buttonClass}
                >
                  <Eye size={14} />
                  Preview
                </button>
              </div>
            </div>
          ) : (
          <div className="grid gap-2 sm:min-w-[420px]">
            <div className={statusGridClass}>
              <div className={statusCardClass}>
                <p className={statusLabelClass}>Health</p>
                <p className={statusValueClass}>{dashboardMode.stateLabel}</p>
                <p className={statusDetailClass}>{summaryGate.pass} pass · {summaryGate.blocked} blocked</p>
              </div>
              <div className={statusCardClass}>
                <p className={statusLabelClass}>Workflow</p>
                <p className={statusValueClass}>{formatStateLabel(workflowState)}</p>
                <p className={statusDetailClass}>{sentinelState?.workflow?.humanInputRequired ? "Review needed" : "No urgent review"}</p>
              </div>
              <div className={statusCardClass}>
                <p className={statusLabelClass}>Cadence</p>
                <p className={statusValueClass}>{cadenceSummary?.mode ? formatStateLabel(cadenceSummary.mode) : "Not recorded"}</p>
                <p className={statusDetailClass}>{cadenceLabel}</p>
              </div>
              <div className={statusCardClass}>
                <p className={statusLabelClass}>Readiness</p>
                <p className={statusValueClass}>{formatStateLabel(readinessStatus)}</p>
                <p className={statusDetailClass}>Local gate</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
              <button
                onClick={() => onCompactViewChange(!compactView)}
                className={buttonClass}
              >
                {compactView ? "Expanded view" : "Compact view"}
              </button>
              <button
                onClick={onResetWorkspace}
                className={buttonClass}
              >
                Reset workspace
              </button>
              <button
                onClick={() => window.location.reload()}
                className={buttonClass}
              >
                <CheckCircle2 size={14} />
                Refresh
              </button>
              <button
                onClick={onPreview}
                className={buttonClass}
              >
                <Eye size={14} />
                Preview
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
    </header>
  );
}

function SentinelNavigationRail({
  navItems,
  activeNav,
  onNavigate,
  activeTenant,
  dashboardMode,
  summaryGate,
  collapsed,
  onCollapsedChange,
  standaloneMode = false,
}) {
  const navIconMap = {
    overview: BarChart3,
    state: Layers,
    inbox: Circle,
    content: Target,
    opportunities: TrendingUp,
    actions: Zap,
    cadence: Clock,
    tenants: Lock,
    diagnostics: Wrench,
  };
  const asideClass = standaloneMode
    ? "h-fit border-l border-white/10 pl-3 lg:sticky lg:top-24"
    : "rounded-[28px] bg-white/85 p-4 shadow-sm ring-1 ring-slate-100/80 h-fit lg:sticky lg:top-24";
  const introClass = standaloneMode
    ? "px-2 py-1"
    : "rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100";
  const eyebrowClass = standaloneMode
    ? "text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200"
    : "text-xs font-semibold uppercase tracking-[0.16em] text-pink-600";
  const titleClass = standaloneMode ? "text-sm font-semibold text-white" : "text-lg font-semibold text-slate-950";
  const mutedClass = standaloneMode ? "text-xs text-slate-400" : "text-xs text-slate-500";
  const foldButtonClass = standaloneMode
    ? "rounded-full bg-white/[0.055] px-2.5 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10 hover:bg-white/[0.11]"
    : "rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-100 hover:bg-slate-50";
  return (
    <aside className={asideClass}>
      <div className={introClass}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={eyebrowClass}>{standaloneMode ? "Workspace" : "App Shell"}</p>
            <p className={titleClass}>Sentinel</p>
            {collapsed ? null : <p className={mutedClass}>{activeTenant?.name || "ERP Experts"}</p>}
          </div>
          <button
            type="button"
            onClick={() => onCollapsedChange(!collapsed)}
            className={foldButtonClass}
          >
            {collapsed ? "Open" : "Fold"}
          </button>
        </div>
      </div>

      <nav className="grid gap-1.5" style={{ marginTop: "14px" }} aria-label="Sentinel operator sections">
        {navItems.map((item) => {
          const Icon = navIconMap[item.key] || Circle;
          const active = activeNav === item.key;
          const standaloneButtonClass = active
            ? "text-cyan-50"
            : "text-slate-500 hover:text-slate-200";
          const standardButtonClass = active
            ? "bg-pink-50 text-pink-700 ring-1 ring-pink-100"
            : "text-slate-700 hover:bg-slate-50";
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item)}
              className={`group relative flex items-center gap-3 text-left transition-colors cursor-pointer ${standaloneMode ? `rounded-none px-2 py-2.5 ${standaloneButtonClass}` : `rounded-2xl px-3 py-3 ${standardButtonClass}`} ${collapsed ? "justify-center" : ""}`}
            >
              {standaloneMode ? (
                <span className={`absolute -left-3 top-2 bottom-2 w-px rounded-full ${active ? "bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.75)]" : "bg-transparent"}`} aria-hidden="true" />
              ) : null}
              <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center ${standaloneMode ? (active ? "text-cyan-100" : "text-slate-500 group-hover:text-slate-200") : "rounded-xl bg-white/70 text-current ring-1 ring-slate-100"}`}>
                <Icon size={15} />
              </span>
              {collapsed ? null : (
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${standaloneMode ? "tracking-[-0.01em]" : ""}`}>{item.label}</span>
                  <span className={`block text-xs ${standaloneMode ? "text-slate-600 group-hover:text-slate-400" : "text-slate-500"}`} style={{ marginTop: "2px" }}>{item.description}</span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className={standaloneMode ? "border-t border-white/10 px-2 py-4" : "rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100"} style={{ marginTop: "16px" }}>
        <p className={standaloneMode ? "text-xs text-slate-500" : "text-xs text-slate-500"}>Health</p>
        <p className={standaloneMode ? "text-sm font-semibold text-emerald-300" : "text-sm font-semibold text-emerald-600"}>{dashboardMode.stateLabel}</p>
        {collapsed ? null : <p className={standaloneMode ? "text-xs text-slate-500" : "text-xs text-slate-600"}>pass {summaryGate.pass} · blocked {summaryGate.blocked}</p>}
      </div>
    </aside>
  );
}

function SectionIntro({ eyebrow, title, description, standaloneMode = false }) {
  return (
    <div>
      <p className={standaloneMode ? "text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200" : "text-xs font-semibold uppercase tracking-[0.16em] text-pink-600"}>{eyebrow}</p>
      <h2 className={standaloneMode ? "text-2xl font-semibold tracking-[-0.02em] text-white" : "text-xl font-semibold text-slate-950"}>{title}</h2>
      {description ? <p className={standaloneMode ? "max-w-3xl text-sm text-slate-400" : "text-sm text-slate-600"}>{description}</p> : null}
    </div>
  );
}

function SentinelStandaloneFocusSurface({
  activeTenant,
  nextBestAction,
  contentWorkbenchItems,
  standaloneRuntimeLabel,
  onOpenContent,
}) {
  const stageCounts = CONTENT_STATUS_GROUPS.map((group) => ({
    ...group,
    count: contentWorkbenchItems.filter((item) => group.statuses.includes(item.status)).length,
  }));
  const priorityQueue = [...contentWorkbenchItems]
    .filter((item) => !["published", "monitoring"].includes(item.status))
    .sort((a, b) => {
      const priorityDelta = (CONTENT_PRIORITY_ORDER[a.priority] ?? 9) - (CONTENT_PRIORITY_ORDER[b.priority] ?? 9);
      if (priorityDelta !== 0) return priorityDelta;
      return CONTENT_LIFECYCLE_STATUSES.indexOf(a.status) - CONTENT_LIFECYCLE_STATUSES.indexOf(b.status);
    })
    .slice(0, 4);
  const liveQueue = priorityQueue.length ? priorityQueue : contentWorkbenchItems.slice(0, 4);
  const leadItem = liveQueue[0] || null;
  const leadWorkflowAction = getPrimaryWorkflowActionForItem(leadItem);
  const leadActionLabel = leadWorkflowAction?.label || "Open Workbench";

  return (
    <section
      className="relative isolate overflow-hidden border-b border-white/10 py-3 md:py-4"
      style={{ marginBottom: "var(--space-md)" }}
      aria-label="Sentinel standalone command surface"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 8% 0%, rgba(45, 212, 191, 0.16), transparent 28%), linear-gradient(100deg, rgba(255,255,255,0.04), transparent 48%)",
        }}
        aria-hidden="true"
      />
      <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)] xl:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <SentinelLogoMark className="h-10 w-10 shrink-0" />
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200/85">Work next</p>
            <h2 className="truncate text-xl font-semibold tracking-[-0.035em] text-white md:text-2xl">
              {leadItem?.title || nextBestAction.title}
            </h2>
            <p className="max-w-3xl truncate text-sm text-slate-400" style={{ marginTop: "4px" }}>
              {leadWorkflowAction
                ? `${leadWorkflowAction.label}: ${leadWorkflowAction.description}`
                : leadItem?.nextAction || nextBestAction.why}
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="grid grid-cols-4 gap-2">
            {stageCounts.map((stage) => (
              <div key={stage.id} className="border-l border-white/10 pl-3">
                <p className="text-xs font-semibold text-slate-300">{stage.label}</p>
                <p className="font-mono text-[11px] text-slate-600">{stage.count} items</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onOpenContent}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-cyan-200 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/20 transition-colors hover:bg-white"
          >
            {leadActionLabel}
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-slate-500 xl:col-span-2">
          <span>Tenant: <strong className="text-slate-300">{activeTenant?.name || "ERP Experts"}</strong></span>
          <span>Runtime: <strong className="text-slate-300">{standaloneRuntimeLabel}</strong></span>
          <span>Access: <strong className="text-slate-300">private workspace</strong></span>
        </div>
      </div>
    </section>
  );
}

function ControlCentreHelpPanel({
  activeNav,
  helpRegistry,
  helpOpen,
  firstRunHintVisible,
  onToggleHelp,
  onDismissFirstRun,
}) {
  const sectionHelp = helpRegistry?.sections?.[activeNav] || helpRegistry?.sections?.overview || {};
  const keyActions = Array.isArray(sectionHelp.keyActions) ? sectionHelp.keyActions : [];
  const safeNotes = Array.isArray(sectionHelp.safeNotes) ? sectionHelp.safeNotes : [];

  return (
    <section className="rounded-[24px] bg-white/85 p-4 shadow-sm ring-1 ring-slate-100/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">Operator Help</p>
          <h2 className="text-lg font-semibold text-slate-950">{sectionHelp.title || "Control Centre"}</h2>
          <p className="text-sm text-slate-600">{sectionHelp.shortDescription || "Contextual guidance for the selected Sentinel section."}</p>
        </div>
        <button
          type="button"
          onClick={() => onToggleHelp(!helpOpen)}
          className="shrink-0 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-100 hover:bg-slate-100"
        >
          {helpOpen ? "Hide help" : "Show help"}
        </button>
      </div>

      {firstRunHintVisible ? (
        <div className="rounded-2xl bg-pink-50 px-4 py-3 text-sm text-pink-900 ring-1 ring-pink-100" style={{ marginTop: "14px" }}>
          <div className="flex items-start justify-between gap-4">
            <p>
              Start with Overview. Run <code className="rounded bg-white/70 px-1.5 py-0.5">npm run platform:start</code> when you begin the day.
            </p>
            <button
              type="button"
              onClick={onDismissFirstRun}
              className="shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-pink-700 ring-1 ring-pink-100 hover:bg-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {helpOpen ? (
        <div className="grid gap-3 md:grid-cols-[1fr_1fr]" style={{ marginTop: "14px" }}>
          <div className="rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">When to use</p>
            <p className="text-sm text-slate-700" style={{ marginTop: "6px" }}>{sectionHelp.whenToUse || "Use this section for operator context."}</p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Safe notes</p>
            <ul className="grid gap-1 text-sm text-slate-700" style={{ marginTop: "6px" }}>
              {safeNotes.slice(0, 2).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          {keyActions.length ? (
            <div className="rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Key actions</p>
              <ul className="grid gap-1 text-sm text-slate-700 lg:grid-cols-3" style={{ marginTop: "6px" }}>
                {keyActions.slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function OperatorWorkspaceSwitcher({
  workspaces,
  activeWorkspace,
  activeWorkspaceId,
  newWorkspaceName,
  workspaceNotice,
  onWorkspaceChange,
  onNewWorkspaceNameChange,
  onCreateWorkspace,
  onSaveWorkspace,
  onResetSelectedWorkspace,
  onDeleteWorkspace,
}) {
  const visiblePanels = Array.isArray(activeWorkspace?.visiblePanels) ? activeWorkspace.visiblePanels : [];
  const canDelete = activeWorkspace && !activeWorkspace.builtIn;
  const saveLabel = activeWorkspace?.builtIn ? "Save as custom" : "Overwrite current";

  return (
    <section className="rounded-[24px] bg-white/85 p-4 shadow-sm ring-1 ring-slate-100/80">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">Workspace</p>
          <h2 className="text-lg font-semibold text-slate-950">{activeWorkspace?.name || "Monitoring"}</h2>
          <p className="text-sm text-slate-600">
            {activeWorkspace?.notes || "Browser-local layout preset for this operator session."}
          </p>
          <div className="flex flex-wrap gap-2 text-xs" style={{ marginTop: "8px" }}>
            <span className={`rounded-full px-2.5 py-1 font-semibold ring-1 ${activeWorkspace?.builtIn ? "bg-slate-50 text-slate-600 ring-slate-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>
              {activeWorkspace?.builtIn ? "Built-in" : "Custom"}
            </span>
            <span className="rounded-full bg-slate-50 px-2.5 py-1 font-semibold text-slate-600 ring-1 ring-slate-100">
              Focus: {formatStateLabel(activeWorkspace?.preferredFocus || "monitoring")}
            </span>
            <span className="rounded-full bg-slate-50 px-2.5 py-1 font-semibold text-slate-600 ring-1 ring-slate-100">
              Section: {formatStateLabel(activeWorkspace?.selectedSection || "overview")}
            </span>
          </div>
        </div>

        <div className="grid w-full max-w-sm gap-2">
          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            Switch workspace
            <select
              value={activeWorkspaceId}
              onChange={(event) => onWorkspaceChange(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800"
            >
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}{workspace.builtIn ? " (built-in)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-3" style={{ marginTop: "14px" }}>
        <div className="rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Workspace restores</p>
          <div className="flex flex-wrap gap-2" style={{ marginTop: "8px" }}>
            {visiblePanels.length ? visiblePanels.map((panel) => (
              <span key={panel} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
                {panel}
              </span>
            )) : (
              <span className="text-sm text-slate-600">Default Control Centre panels.</span>
            )}
          </div>
          <p className="text-xs text-slate-500" style={{ marginTop: "10px" }}>
            Saves section, command filter, search, compact mode, sidebar state and panel collapse state locally.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            New workspace name
            <input
              value={newWorkspaceName}
              onChange={(event) => onNewWorkspaceNameChange(event.target.value)}
              placeholder={`${activeWorkspace?.name || "Monitoring"} Custom`}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800"
            />
          </label>
          <div className="flex flex-wrap gap-2" style={{ marginTop: "10px" }}>
            <button
              type="button"
              onClick={onCreateWorkspace}
              className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Create new
            </button>
            <button
              type="button"
              onClick={onSaveWorkspace}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {saveLabel}
            </button>
            <button
              type="button"
              onClick={onResetSelectedWorkspace}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset selected
            </button>
            <button
              type="button"
              onClick={onDeleteWorkspace}
              disabled={!canDelete}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                canDelete
                  ? "border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                  : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              Delete custom
            </button>
          </div>
          <p className="text-xs text-slate-500" style={{ marginTop: "8px" }}>
            Built-in workspaces stay available and cannot be deleted.
          </p>
        </div>
      </div>

      {workspaceNotice ? (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100" style={{ marginTop: "12px" }}>
          {workspaceNotice}
        </div>
      ) : null}
    </section>
  );
}

function AppShellStatusBar({ readinessSummary, cadenceSummary, sentinelStateSource }) {
  const readinessStatus = readinessSummary?.overallStatus || "Not checked";
  const cadenceLabel = cadenceSummary?.ranAt ? formatDateTime(cadenceSummary.ranAt) : "No cadence recorded";

  return (
    <div className="rounded-[24px] bg-white/75 px-4 py-3 text-xs text-slate-600 ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>Readiness: <strong className="text-slate-900">{formatStateLabel(readinessStatus)}</strong></span>
        <span>Last cadence: <strong className="text-slate-900">{cadenceLabel}</strong></span>
        <span>State source: <strong className="text-slate-900">{sentinelStateSource}</strong></span>
      </div>
    </div>
  );
}

function SystemStatusZone({ dashboardMode, summaryGate, sentinelState, cadenceSummary, readinessSummary, doctorSummary }) {
  const workflowState = sentinelState?.workflow?.state || "unknown";
  const readinessStatus = readinessSummary?.overallStatus || "Not checked";
  const doctorStatus = doctorSummary?.overallStatus || "Not checked";
  const cadenceLabel = cadenceSummary?.ranAt ? formatDateTime(cadenceSummary.ranAt) : "Not recorded";
  const doctorWarnings = Array.isArray(doctorSummary?.warnings) ? doctorSummary.warnings.length : 0;
  const readinessWarnings = Array.isArray(readinessSummary?.warnings) ? readinessSummary.warnings.length : 0;

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100/80 md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">System Status</p>
          <h2 className="text-xl font-semibold text-slate-950">Sentinel operating picture</h2>
          <p className="text-sm text-slate-600">Health, workflow, cadence, readiness and diagnostics in one place.</p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusToneClasses(dashboardMode.stateLabel)}`}>
          {dashboardMode.stateLabel}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" style={{ marginTop: "18px" }}>
        <MiniStatusItem
          label="Health"
          value={dashboardMode.stateLabel}
          detail={`${summaryGate.pass} pass · ${summaryGate.needs_review} review · ${summaryGate.blocked} blocked`}
          tone={summaryGate.blocked > 0 ? "danger" : summaryGate.needs_review > 0 ? "warning" : "healthy"}
        />
        <MiniStatusItem
          label="Workflow"
          value={formatStateLabel(workflowState)}
          detail={sentinelState?.workflow?.humanInputRequired ? "Human review required" : "No urgent review"}
          tone={workflowState === "blocked" || workflowState === "human_review_required" ? "danger" : workflowState === "healthy_monitoring" ? "healthy" : "warning"}
        />
        <MiniStatusItem
          label="Cadence"
          value={cadenceSummary?.mode ? formatStateLabel(cadenceSummary.mode) : "Not recorded"}
          detail={cadenceLabel}
          tone={cadenceSummary ? "healthy" : "warning"}
        />
        <MiniStatusItem
          label="Readiness"
          value={readinessStatus}
          detail={readinessWarnings ? `${readinessWarnings} warning${readinessWarnings === 1 ? "" : "s"}` : "No readiness warnings recorded"}
          tone={readinessStatus === "READY" ? "healthy" : readinessStatus === "NOT READY" ? "danger" : "warning"}
        />
        <MiniStatusItem
          label="Doctor"
          value={doctorStatus}
          detail={doctorSummary ? `${doctorWarnings} warning${doctorWarnings === 1 ? "" : "s"}` : "Run platform:doctor"}
          tone={doctorStatus === "HEALTHY" ? "healthy" : doctorStatus === "NEEDS FIXING" ? "danger" : "warning"}
        />
      </div>
    </section>
  );
}

function CurrentFocusPanel({ sentinelState, inboxReport }) {
  const [copyTarget, setCopyTarget] = useState("");
  const latestOpportunity = sentinelState?.opportunities?.top;
  const latestPlan = sentinelState?.plans?.top;
  const inboxRecommendation = sentinelState?.inboxRecommendation || sentinelState?.inbox?.latestActionable;
  const recommendedNextStep = sentinelState?.recommendation?.nextStep || sentinelState?.workflow?.recommendedNextStep || "No maintenance action required.";
  const inboxItems = Array.isArray(inboxReport?.items) ? inboxReport.items : [];
  const stateInboxItem = inboxItems.find((item) => item.source === "sentinel_state") || inboxItems[0];
  const primaryActions = [
    { label: "Start day", command: "npm run platform:start" },
    { label: "Refresh state", command: "npm run platform:state" },
    { label: "Run autopilot", command: "npm run seo:autopilot" },
  ];

  const copyPrimaryAction = async (command) => {
    await copyText(command, `primary action ${command}`);
    setCopyTarget(command);
    setTimeout(() => setCopyTarget(""), 1300);
  };

  return (
    <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-white via-pink-50/40 to-slate-50 p-5 shadow-sm ring-1 ring-pink-100/70 md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">Current Focus</p>
          <h2 className="text-2xl font-semibold text-slate-950">What needs attention now</h2>
          <p className="text-sm text-slate-600">The active recommendation, supporting context and safe next commands.</p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${workflowBadgeClass(sentinelState?.workflow?.state)}`}>
          {formatStateLabel(sentinelState?.workflow?.state || "unknown")}
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.8fr)]" style={{ marginTop: "18px" }}>
        <div className="rounded-[24px] bg-white/85 p-5 ring-1 ring-white/80">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Recommended next step</p>
          <p className="text-xl font-semibold leading-snug text-slate-950 md:text-2xl" style={{ marginTop: "8px" }}>{recommendedNextStep}</p>
          <p className="text-sm text-slate-600" style={{ marginTop: "10px" }}>
            Human input: {sentinelState?.workflow?.humanInputRequired ? "required before moving forward" : "not required for monitoring"}
          </p>

          <div className="flex flex-wrap gap-2" style={{ marginTop: "18px" }}>
            {primaryActions.map((action, index) => (
              <button
                key={action.command}
                type="button"
                onClick={() => copyPrimaryAction(action.command)}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold ring-1 transition-colors ${
                  index === 0
                    ? "bg-pink-600 text-white ring-pink-600 hover:bg-pink-700"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {copyTarget === action.command ? "Copied" : `${action.label}: copy`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 content-start">
          <div className="rounded-2xl bg-white/75 p-3 ring-1 ring-white/80">
            <p className="text-xs font-medium text-slate-500">Latest opportunity</p>
            <p className="text-sm font-semibold text-slate-950">{latestOpportunity?.title || "No opportunity recorded"}</p>
          </div>
          <div className="rounded-2xl bg-white/75 p-3 ring-1 ring-white/80">
            <p className="text-xs font-medium text-slate-500">Latest plan</p>
            <p className="text-sm font-semibold text-slate-950">{latestPlan ? `${latestPlan.planId} · ${latestPlan.title}` : "No plan recorded"}</p>
          </div>
          <div className="rounded-2xl bg-white/75 p-3 ring-1 ring-white/80">
            <p className="text-xs font-medium text-slate-500">Inbox item</p>
            <p className="text-sm font-semibold text-slate-950">{inboxRecommendation?.title || stateInboxItem?.title || "No active inbox item"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TenantContextPanel({ tenantRegistrySnapshot }) {
  const { defaultTenantId, activeTenant } = resolveTenantRegistrySnapshot(tenantRegistrySnapshot);
  const notes = Array.isArray(activeTenant.notes) ? activeTenant.notes : [];
  const note = notes.find((item) => /multi-tenant/i.test(item))
    || "Single active tenant. Multi-tenant switching planned.";

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100/80 md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">Tenant</p>
          <h2 className="text-xl font-semibold text-slate-950">{activeTenant.name || "ERP Experts"}</h2>
          <p className="text-sm text-slate-600">{note}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            {activeTenant.status || "active"}
          </span>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
            Source: {tenantRegistrySnapshot?.source || "registry"}
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" style={{ marginTop: "18px" }}>
        <MiniStatusItem
          label="Base URL"
          value={activeTenant.baseUrl || "Not set"}
          detail="Current tenant site"
          tone="neutral"
        />
        <MiniStatusItem
          label="Operator route"
          value={activeTenant.dashboardRoute || "/seo-roadmap"}
          detail="Private Control Centre"
          tone="warning"
        />
        <MiniStatusItem
          label="Stakeholder route"
          value={activeTenant.stakeholderRoute || "/seo-progress"}
          detail="Business-safe view"
          tone="healthy"
        />
        <MiniStatusItem
          label="Default tenant"
          value={defaultTenantId}
          detail="No live switching yet"
          tone="neutral"
        />
      </div>
    </section>
  );
}

function AuthorityStatePanel({ authoritySnapshot }) {
  const state = authoritySnapshot?.state || "local_bypass";
  const mode = authoritySnapshot?.mode || "disabled";
  const protectedEndpoints = Array.isArray(authoritySnapshot?.protectedEndpoints)
    ? authoritySnapshot.protectedEndpoints
    : ["/action", "/pipeline/run", "/feedback", "/feedback/triage"];
  const controlsUnlocked = canUseOperatorAuthority(authoritySnapshot);

  return (
    <section className="rounded-[28px] bg-slate-950 p-5 text-white shadow-sm ring-1 ring-slate-900/80 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-200">Authority State</p>
          <h2 className="text-xl font-semibold text-white">{authoritySnapshot?.authorityName || "Matthew-controlled Sentinel API"}</h2>
          <p className="max-w-3xl text-sm text-slate-300">
            First authority gate layer for controlled operator actions. Local development remains available by default, and no public API exposure exists.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${authorityStateBadgeClass(state)}`}>
          {formatStateLabel(state)}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-3" style={{ marginTop: "16px" }}>
        <div className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Mode</p>
          <p className="text-sm font-semibold text-white">{formatStateLabel(mode)}</p>
        </div>
        <div className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Controls</p>
          <p className="text-sm font-semibold text-white">{controlsUnlocked ? "Unlocked for current mode" : "Locked until verified"}</p>
        </div>
        <div className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Local bypass</p>
          <p className="text-sm font-semibold text-white">{authoritySnapshot?.localBypass ? "Allowed" : "Disabled"}</p>
        </div>
      </div>
      <p className="text-xs text-slate-400" style={{ marginTop: "14px" }}>
        Protected endpoints: {protectedEndpoints.join(", ")}. Stakeholder pages are unaffected. No token values are returned or stored in the browser.
      </p>
    </section>
  );
}

function tenantStatusLabel(status = "") {
  if (status === "active") return "Active";
  if (status === "example_disabled") return "Disabled fixture";
  if (status === "draft") return "Draft";
  if (status === "archived") return "Archived";
  return formatStateLabel(status || "unknown");
}

function tenantStatusBadgeClass(status = "") {
  if (status === "active") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (status === "draft") return "bg-amber-50 text-amber-800 ring-amber-100";
  if (status === "archived" || status === "example_disabled") return "bg-slate-100 text-slate-600 ring-slate-200";
  return "bg-slate-50 text-slate-700 ring-slate-100";
}

function TenantRegistryPanel({ tenantRegistrySnapshot }) {
  const { tenants, source } = resolveTenantRegistrySnapshot(tenantRegistrySnapshot);
  const activeCount = tenants.filter((tenant) => tenant.status === "active").length;
  const disabledCount = tenants.filter((tenant) => tenant.status === "example_disabled").length;

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100/80 md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">Tenant Registry</p>
          <h2 className="text-xl font-semibold text-slate-950">Registered Sentinel tenants</h2>
          <p className="text-sm text-slate-600">
            Read-only preview. Tenant switching and disabled tenant actions are intentionally unavailable.
          </p>
          {source === "api" ? null : (
            <p className="text-xs text-slate-500" style={{ marginTop: "6px" }}>
              Showing bundled registry. Start the local Sentinel API for the live registry view.
            </p>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            {activeCount} active
          </span>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
            {disabledCount} disabled fixture
          </span>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
            Source: {source}
          </span>
        </div>
      </div>

      {tenants.length ? (
        <div className="grid gap-3 lg:grid-cols-2" style={{ marginTop: "18px" }}>
          {tenants.map((tenant) => {
            const isDisabledFixture = tenant.status === "example_disabled";
            return (
              <article key={tenant.tenantId} className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">{tenant.name || tenant.tenantId}</h3>
                    <p className="text-xs text-slate-500" style={{ marginTop: "3px" }}>{tenant.tenantId}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tenantStatusBadgeClass(tenant.status)}`}>
                    {tenantStatusLabel(tenant.status)}
                  </span>
                </div>

                <div className="grid gap-3 text-xs text-slate-600 sm:grid-cols-2" style={{ marginTop: "14px" }}>
                  <div>
                    <p className="font-medium text-slate-500">Base URL</p>
                    <p className="font-semibold text-slate-900">{tenant.baseUrl || "Not set"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Operator route</p>
                    <p className="font-semibold text-slate-900">{tenant.dashboardRoute || "/seo-roadmap"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Stakeholder route</p>
                    <p className="font-semibold text-slate-900">{tenant.stakeholderRoute || "/seo-progress"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Actions</p>
                    <p className="font-semibold text-slate-900">{isDisabledFixture ? "Unavailable" : "Default tenant only"}</p>
                  </div>
                </div>

                {isDisabledFixture ? (
                  <p className="rounded-2xl bg-white/80 px-3 py-2 text-xs text-slate-500 ring-1 ring-slate-100" style={{ marginTop: "14px" }}>
                    Disabled fixture only. No pipelines, actions or switching are available for this tenant.
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-100" style={{ marginTop: "18px" }}>
          Tenant registry available when the local Sentinel API is running.
        </p>
      )}
    </section>
  );
}

function OperationsPanel({ cadenceSummary, weeklyDigestText }) {
  const reportCount = Array.isArray(cadenceSummary?.generatedReports) ? cadenceSummary.generatedReports.length : 0;
  const notificationsReady = Boolean(cadenceSummary?.notificationsGenerated);
  const digestReady = Boolean(weeklyDigestText);

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100/80 md:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">Operations</p>
        <h2 className="text-xl font-semibold text-slate-950">Local operating rhythm</h2>
        <p className="text-sm text-slate-600">Cadence remains terminal-first. Low-risk state and report actions can run through the local allowlist.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4" style={{ marginTop: "18px" }}>
        <MiniStatusItem label="Cadence" value={cadenceSummary ? "Recorded" : "Waiting"} detail={cadenceSummary?.ranAt ? formatDateTime(cadenceSummary.ranAt) : "Run platform:cadence"} tone={cadenceSummary ? "healthy" : "warning"} />
        <MiniStatusItem label="Notifications" value={notificationsReady ? "Prepared" : "Not prepared"} detail={notificationsReady ? "Payloads only, no sending" : "Run platform:notify"} tone={notificationsReady ? "healthy" : "warning"} />
        <MiniStatusItem label="Reports" value={`${reportCount} generated`} detail={digestReady ? "Digest available" : "Digest not loaded"} tone={reportCount ? "healthy" : "warning"} />
        <MiniStatusItem label="State refresh" value="Allowlisted" detail="Run platform:state" tone="neutral" />
      </div>
    </section>
  );
}

function CommandCategoryButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? "bg-pink-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function SentinelCommandsPanel({
  commandRegistry,
  actionRegistry,
  authoritySnapshot,
  query,
  category,
  onQueryChange,
  onCategoryChange,
  onActionComplete,
}) {
  const [copyTarget, setCopyTarget] = useState("");
  const [copyState, setCopyState] = useState("idle");
  const [runningAction, setRunningAction] = useState("");
  const [actionResult, setActionResult] = useState(null);
  const authorityAllowsExecution = canUseOperatorAuthority(authoritySnapshot);
  const authorityMessage = authorityDisabledMessage(authoritySnapshot);
  const commands = Array.isArray(commandRegistry?.commands) ? commandRegistry.commands : [];
  const actions = useMemo(() => (
    Array.isArray(actionRegistry?.actions) ? actionRegistry.actions : []
  ), [actionRegistry]);
  const defaultTenant = commandRegistry?.defaultTenant || "erp-experts";
  const tenantScopeNote = commandRegistry?.tenantScopeNote || "Commands currently use the default tenant.";
  const actionByCommand = new Map(actions.filter((action) => action.allowFromUI).map((action) => [action.command, action]));
  const categories = ["All", ...Array.from(new Set(commands.map((item) => item.category).filter(Boolean)))];
  const activeCategory = categories.includes(category) ? category : "All";
  const normalisedQuery = query.trim().toLowerCase();
  const visibleCommands = commands.filter((item) => {
    const categoryMatches = activeCategory === "All" || item.category === activeCategory;
    const queryMatches = !normalisedQuery
      || `${item.command} ${item.description} ${item.recommendedUsage} ${item.category}`.toLowerCase().includes(normalisedQuery);
    return categoryMatches && queryMatches;
  });
  const grouped = visibleCommands.reduce((acc, item) => {
    const key = item.category || "Other";
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
  const primaryActions = actions
    .filter((action) => action.allowFromUI)
    .slice(0, 4);

  const copyCommand = async (command) => {
    const ok = await copyText(command, `sentinel command ${command}`);
    setCopyTarget(command);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => {
      setCopyTarget("");
      setCopyState("idle");
    }, 1400);
  };

  const copyLabel = (command) => {
    if (copyTarget !== command) return "Copy";
    if (copyState === "copied") return "Copied";
    if (copyState === "failed") return "Copy failed";
    return "Copy";
  };

  const runAction = async (action) => {
    if (!authorityAllowsExecution) {
      setActionResult({
        action: action.id,
        status: "failed",
        ok: false,
        message: authorityMessage,
      });
      return;
    }

    setRunningAction(action.id);
    setActionResult(null);
    try {
      const response = await fetch(`${sentinelActionApiBaseUrl}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: action.id }),
      });
      const payload = await response.json().catch(() => ({
        status: "failure",
        error: "invalid_response",
          message: "Action API returned a non-JSON response.",
      }));
      const initialResult = {
        ...payload,
        action: payload.action || action.id,
        ok: response.ok && payload.status === "success",
      };
      setActionResult(initialResult);

      if (response.ok && payload.executionId) {
        const finalResult = await pollSentinelActionExecution(payload.executionId, {
          onUpdate: (nextExecution) => {
            setActionResult({
              ...nextExecution,
              action: nextExecution.action || action.id,
              ok: nextExecution.status === "success",
            });
          },
        });
        setActionResult({
          ...finalResult,
          action: finalResult?.action || action.id,
          ok: finalResult?.status === "success",
        });
      }
    } catch (error) {
      setActionResult({
        action: action.id,
        status: "failed",
        ok: false,
        message: `Could not reach local Sentinel API at ${sentinelActionApiBaseUrl}. Start npm run platform:api:serve first.`,
        stderr: error.message,
      });
    } finally {
      if (typeof onActionComplete === "function") {
        await onActionComplete();
      }
      setRunningAction("");
    }
  };

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100/80 md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">Tools & Commands</p>
          <h2 className="text-xl font-semibold text-slate-950">Sentinel Commands</h2>
          <p className="text-sm text-slate-600">Discover commands and run only low-risk allowlisted actions through the local API.</p>
          <p className="text-xs text-emerald-700" style={{ marginTop: "6px" }}>
            Commands are allowlisted. Run buttons only appear for safe local actions.
          </p>
          <p className="text-xs text-slate-500" style={{ marginTop: "6px" }}>
            Default tenant: <span className="font-semibold text-slate-700">{defaultTenant}</span>. {tenantScopeNote}
          </p>
          {!authorityAllowsExecution ? (
            <p className="text-xs font-semibold text-amber-700" style={{ marginTop: "6px" }}>
              {authorityMessage}
            </p>
          ) : null}
        </div>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
          {commands.length} registered
        </span>
      </div>

      {primaryActions.length ? (
        <div className="rounded-[24px] bg-slate-50/80 p-4 ring-1 ring-slate-100" style={{ marginTop: "18px" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Primary safe actions</p>
              <p className="text-sm text-slate-600">Low-risk local actions only. These are fixed allowlisted commands, not shell input.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              UI safe
            </span>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4" style={{ marginTop: "12px" }}>
            {primaryActions.map((action) => {
              const isRunning = runningAction === action.id;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => runAction(action)}
                  disabled={Boolean(isRunning) || !authorityAllowsExecution}
                  className="rounded-2xl bg-white p-3 text-left ring-1 ring-slate-100 transition hover:bg-pink-50 hover:ring-pink-100 disabled:cursor-wait disabled:opacity-70"
                >
                  <span className="block text-sm font-semibold text-slate-950">{isRunning ? "Running…" : action.label}</span>
                  <span className="block text-xs text-slate-500" style={{ marginTop: "4px" }}>{action.description}</span>
                </button>
              );
            })}
          </div>
          {actionResult ? (
            <div className={`rounded-2xl p-3 text-xs ring-1 ${actionStatusBadgeClass(actionResult.status)}`} style={{ marginTop: "12px" }}>
              <p className="font-semibold">Latest action: {formatStateLabel(normaliseExecutionStatus(actionResult.status))}</p>
              <p style={{ marginTop: "4px" }}>{actionResult.summary || actionResult.message || "No summary returned."}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-[1fr_auto]" style={{ marginTop: "18px" }}>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search health, cadence, deploy, API or reports"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-pink-200 focus:bg-white focus:ring-4 focus:ring-pink-50"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <CommandCategoryButton
              key={item}
              label={item}
              active={activeCategory === item}
              onClick={() => onCategoryChange(item)}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-3" style={{ marginTop: "20px" }}>
        {Object.entries(grouped).map(([group, items]) => (
          <details
            key={group}
            open={activeCategory !== "All" || Boolean(normalisedQuery) || group === "Health"}
            className="rounded-[22px] bg-slate-50/70 p-3 ring-1 ring-slate-100"
          >
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {group} · {items.length}
            </summary>
            <div className="grid gap-2" style={{ marginTop: "10px" }}>
              {items.map((item) => (
                <div key={item.command} className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
                  {(() => {
                    const safeAction = actionByCommand.get(item.command);
                    const currentResult = safeAction && actionResult?.action === safeAction.id ? actionResult : null;
                    const isRunning = safeAction && runningAction === safeAction.id;
                    return (
                      <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <code className="break-all text-sm font-semibold text-slate-950">{item.command}</code>
                      <p className="text-xs text-slate-600" style={{ marginTop: "4px" }}>{item.description}</p>
                      <p className="text-[11px] text-slate-500" style={{ marginTop: "4px" }}>{item.recommendedUsage}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 self-start">
                      {safeAction ? (
                        <button
                          type="button"
                          onClick={() => runAction(safeAction)}
                          disabled={Boolean(isRunning) || !authorityAllowsExecution}
                          className="rounded-full bg-pink-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-pink-700 disabled:cursor-wait disabled:bg-pink-300"
                        >
                          {isRunning ? "Running" : "Run"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => copyCommand(item.command)}
                        className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                      >
                        {copyLabel(item.command)}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5" style={{ marginTop: "9px" }}>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${item.riskLevel === "medium" ? "bg-amber-50 text-amber-800 ring-amber-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>
                      {item.riskLevel} risk
                    </span>
                    {item.localOnly ? <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">local only</span> : null}
                    {safeAction ? <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-semibold text-pink-700 ring-1 ring-pink-100">UI allowlisted</span> : null}
                    {item.requiresApi ? <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-100">requires API</span> : null}
                    {item.requiresDeployment ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">deployment</span> : null}
                  </div>
                  {currentResult ? (
                    <div className={`rounded-xl p-3 text-xs ring-1 ${actionStatusBadgeClass(currentResult.status)}`} style={{ marginTop: "10px" }}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">Action {formatStateLabel(normaliseExecutionStatus(currentResult.status))}</p>
                        <span>{currentResult.exitCode !== undefined && currentResult.exitCode !== null ? `exit ${currentResult.exitCode}` : currentResult.executionId || currentResult.error || "local API"}</span>
                      </div>
                      {currentResult.summary ? (
                        <p style={{ marginTop: "6px" }}>{currentResult.summary}</p>
                      ) : null}
                      <details style={{ marginTop: "8px" }}>
                        <summary className="cursor-pointer font-semibold">Output preview</summary>
                        <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-white/70 p-2 text-[11px] text-slate-800" style={{ marginTop: "6px" }}>
                          {(currentResult.outputExcerpt || currentResult.stdout || currentResult.stderr || currentResult.message || "No output returned.").slice(0, 1800)}
                          {currentResult.outputTruncated ? "\n\n[Output truncated by Sentinel API]" : ""}
                        </pre>
                      </details>
                    </div>
                  ) : null}
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          </details>
        ))}
        {!visibleCommands.length ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-100">
            No registered command matches that filter.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function RecentOperatorActionsPanel({ history, actionRegistry, onRefresh }) {
  const actions = Array.isArray(history?.actions) ? history.actions.slice(0, 5) : [];
  const registry = Array.isArray(actionRegistry?.actions) ? actionRegistry.actions : [];
  const labelById = new Map(registry.map((action) => [action.id, action.label || action.id]));
  const loading = history?.loading;
  const unavailable = history?.status === "unavailable";

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100/80 md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">Operator Actions</p>
          <h2 className="text-xl font-semibold text-slate-950">Recent Operator Actions</h2>
          <p className="text-sm text-slate-600">Latest controlled UI actions logged through the local allowlist.</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-2" style={{ marginTop: "16px" }}>
        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-100">
            Loading action history…
          </div>
        ) : null}

        {!loading && unavailable ? (
          <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-900 ring-1 ring-blue-100">
            Action history is available when the local Sentinel API is running.
          </div>
        ) : null}

        {!loading && !unavailable && !actions.length ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-100">
            No controlled operator actions have been recorded yet.
          </div>
        ) : null}

        {!loading && !unavailable && actions.map((item) => (
          <div key={item.id} className="rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950">{labelById.get(item.action) || formatStateLabel(item.action)}</p>
                <p className="text-xs text-slate-500">
                  {formatDateTime(item.finishedAt || item.startedAt)} · {formatExecutionDuration(item)}
                </p>
              </div>
              <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${actionStatusBadgeClass(item.status)}`}>
                {item.status || "unknown"}
              </span>
            </div>
            {item.summary ? (
              <p className="text-xs text-slate-700" style={{ marginTop: "8px" }}>{item.summary}</p>
            ) : null}
            {normaliseExecutionStatus(item.status) === "failed" ? (
              <p className="text-xs text-rose-700" style={{ marginTop: "6px" }}>
                {item.failureSuggestion || "Check platform:doctor, then review the output excerpt."}
              </p>
            ) : null}
            {item.outputExcerpt ? (
              <details style={{ marginTop: "8px" }}>
                <summary className="cursor-pointer text-xs font-semibold text-slate-600">Output excerpt</summary>
                <pre className="max-h-36 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-2 text-[11px] text-slate-700 ring-1 ring-slate-100" style={{ marginTop: "6px" }}>
                  {item.outputExcerpt}
                </pre>
              </details>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function OperatorWorkflowPanel() {
  const steps = [
    {
      label: "Morning",
      title: "Start and review the daily report",
      commands: ["npm run platform:start", "npm run platform:daily"],
      note: "Use this to confirm health and see the current focus before work starts.",
    },
    {
      label: "During work",
      title: "Refresh operating state and strategic context",
      commands: ["npm run platform:state", "npm run seo:autopilot"],
      note: "Keep recommendations aligned with the latest persisted state and SEO reports.",
    },
    {
      label: "Before deploy",
      title: "Diagnose and check readiness",
      commands: ["npm run platform:doctor", "npm run platform:deploy:ready"],
      note: "Both are read-only gates. They do not deploy, upload or start services.",
    },
  ];

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100/80 md:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">Operator Workflow</p>
        <h2 className="text-xl font-semibold text-slate-950">How to use Sentinel safely</h2>
        <p className="text-sm text-slate-600">A simple operating rhythm for current and future operators.</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-3" style={{ marginTop: "18px" }}>
        {steps.map((step, index) => (
          <div key={step.label} className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pink-50 text-xs font-bold text-pink-600 ring-1 ring-pink-100">{index + 1}</span>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{step.label}</p>
            </div>
            <p className="text-sm font-semibold text-slate-950" style={{ marginTop: "10px" }}>{step.title}</p>
            <div className="grid gap-1" style={{ marginTop: "10px" }}>
              {step.commands.map((command) => (
                <code key={command} className="break-all rounded-lg bg-white px-2 py-1 text-xs text-slate-700 ring-1 ring-slate-100">{command}</code>
              ))}
            </div>
            <p className="text-xs text-slate-500" style={{ marginTop: "10px" }}>{step.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActivityFeedPanel({ activityFeed, onRefresh }) {
  const [activeType, setActiveType] = useState("all");
  const activities = Array.isArray(activityFeed?.activities) ? activityFeed.activities : [];
  const loading = activityFeed?.loading;
  const unavailable = activityFeed?.status === "unavailable";
  const taxonomyTypes = sentinelActivityTaxonomy?.types || {};
  const filters = [
    { key: "all", label: "All" },
    ...Object.entries(taxonomyTypes)
      .filter(([, meta]) => meta.showInDashboard)
      .map(([key, meta]) => ({ key, label: meta.label || formatStateLabel(key) })),
  ];
  const visibleActivities = activities
    .filter((entry) => activeType === "all" || entry.type === activeType)
    .slice(0, 8);

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100/80 md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">Activity Feed</p>
          <h2 className="text-xl font-semibold text-slate-950">Recent Activity</h2>
          <p className="text-sm text-slate-600">A concise narrative of recent system and operator activity.</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5" style={{ marginTop: "14px" }}>
        {filters.map((filter) => (
          <button
            type="button"
            key={filter.key}
            onClick={() => setActiveType(filter.key)}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
              activeType === filter.key
                ? "bg-pink-50 text-pink-700 ring-pink-100"
                : "bg-slate-50 text-slate-600 ring-slate-100 hover:bg-slate-100"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid gap-1.5" style={{ marginTop: "16px" }}>
        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-100">
            Loading activity feed…
          </div>
        ) : null}

        {!loading && unavailable ? (
          <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-900 ring-1 ring-blue-100">
            Activity feed available when local Sentinel API is running.
          </div>
        ) : null}

        {!loading && !unavailable && !visibleActivities.length ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-100">
            No activity entries match this filter yet.
          </div>
        ) : null}

        {!loading && !unavailable && visibleActivities.map((entry) => (
          <article key={entry.id} className="rounded-2xl bg-slate-50/70 p-3 ring-1 ring-slate-100">
            <div className="flex items-start gap-3">
              <span className={`mt-1.5 inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${activitySeverityDotClass(entry.severity)}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-950">{entry.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${activityVisualHintBadgeClass(entry.visualHint)}`}>
                    {entry.displayLabel || taxonomyTypes?.[entry.type]?.label || formatStateLabel(entry.type)}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${activitySeverityBadgeClass(entry.severity)}`}>
                    {entry.severity || "info"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500" style={{ marginTop: "3px" }}>
                  {formatDateTime(entry.timestamp)}
                </p>
                {entry.summary ? (
                  <p className="text-xs text-slate-700" style={{ marginTop: "6px" }}>{entry.summary}</p>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function OperatorFeedbackPanel({ activeSection, feedbackSnapshot, onFeedbackAdded, onRefresh }) {
  const categories = Array.isArray(sentinelFeedbackOptions?.categories) ? sentinelFeedbackOptions.categories : [];
  const sections = Array.isArray(sentinelFeedbackOptions?.sections) ? sentinelFeedbackOptions.sections : [];
  const priorities = Array.isArray(sentinelFeedbackOptions?.priorities) ? sentinelFeedbackOptions.priorities : ["low", "medium", "high", "critical"];
  const efforts = Array.isArray(sentinelFeedbackOptions?.efforts) ? sentinelFeedbackOptions.efforts : ["low", "medium", "high"];
  const triageStatuses = Array.isArray(sentinelFeedbackOptions?.triageStatuses) ? sentinelFeedbackOptions.triageStatuses : ["new", "accepted", "deferred", "rejected", "done"];
  const activeSectionValue = sections.includes(activeSection) ? activeSection : "general";
  const [category, setCategory] = useState(categories[0]?.id || "ux");
  const [section, setSection] = useState(activeSectionValue);
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [triagingId, setTriagingId] = useState("");
  const [message, setMessage] = useState("");
  const items = Array.isArray(feedbackSnapshot?.items) ? feedbackSnapshot.items.slice(0, 4) : [];
  const unavailable = feedbackSnapshot?.status === "unavailable";
  const loading = feedbackSnapshot?.loading;

  useEffect(() => {
    setSection(activeSectionValue);
  }, [activeSectionValue]);

  const submitFeedback = async (event) => {
    event.preventDefault();
    const cleanSummary = summary.trim();
    if (!cleanSummary) {
      setMessage("Add a short summary first.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(`${sentinelActionApiBaseUrl}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, section, summary: cleanSummary, priority: "medium", effort: "medium", triageStatus: "new" }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || `Feedback API returned ${response.status}`);
      setSummary("");
      setMessage("Feedback captured locally.");
      if (typeof onFeedbackAdded === "function") await onFeedbackAdded();
    } catch (error) {
      setMessage(`Could not save via local API. Use: npm run platform:feedback -- --add --category ${category} --section ${section} --summary "${cleanSummary.replaceAll('"', "'")}"`);
      if (import.meta.env.DEV) {
        console.warn("Sentinel feedback capture failed:", error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateTriage = async (item, updates) => {
    if (!item?.id) return;
    setTriagingId(item.id);
    setMessage("");
    try {
      const response = await fetch(`${sentinelActionApiBaseUrl}/feedback/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, ...updates }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || `Feedback triage returned ${response.status}`);
      setMessage("Feedback triage updated locally.");
      if (typeof onFeedbackAdded === "function") await onFeedbackAdded();
    } catch (error) {
      setMessage(`Could not update triage via local API. Use: npm run platform:feedback -- --triage ${item.id} --priority ${updates.priority || item.priority || "medium"} --effort ${updates.effort || item.effort || "medium"} --triage-status ${updates.triageStatus || item.triageStatus || "new"}`);
      if (import.meta.env.DEV) {
        console.warn("Sentinel feedback triage failed:", error);
      }
    } finally {
      setTriagingId("");
    }
  };

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100/80 md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">Operator Feedback</p>
          <h2 className="text-xl font-semibold text-slate-950">Capture friction while it is fresh</h2>
          <p className="text-sm text-slate-600">Local-only notes for UX pain points, missing workflows, bugs and product ideas.</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>

      {unavailable ? (
        <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-900 ring-1 ring-blue-100" style={{ marginTop: "16px" }}>
          Feedback capture is available when the local Sentinel API is running. You can still use <code className="rounded bg-white/70 px-1.5 py-0.5">npm run platform:feedback</code> from the terminal.
        </div>
      ) : null}

      <form onSubmit={submitFeedback} className="grid gap-3 lg:grid-cols-[140px_150px_minmax(0,1fr)_auto]" style={{ marginTop: "16px" }}>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-pink-200 focus:bg-white focus:ring-4 focus:ring-pink-50"
          >
            {categories.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          Section
          <select
            value={section}
            onChange={(event) => setSection(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-pink-200 focus:bg-white focus:ring-4 focus:ring-pink-50"
          >
            {sections.map((item) => (
              <option key={item} value={item}>{formatStateLabel(item)}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          Summary
          <input
            type="text"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            maxLength={280}
            placeholder="What felt slow, unclear or missing?"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-pink-200 focus:bg-white focus:ring-4 focus:ring-pink-50"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="self-end rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 disabled:cursor-wait disabled:bg-pink-300"
        >
          {submitting ? "Saving" : "Save note"}
        </button>
      </form>

      {message ? (
        <p className="text-xs text-slate-600" style={{ marginTop: "10px" }}>{message}</p>
      ) : null}

      <div className="grid gap-2" style={{ marginTop: "16px" }}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Latest feedback</p>
          {loading ? <span className="text-xs text-slate-500">Loading…</span> : null}
        </div>
        {!loading && !items.length ? (
          <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600 ring-1 ring-slate-100">
            No feedback captured yet.
          </div>
        ) : null}
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{item.summary}</p>
                <p className="text-xs text-slate-500" style={{ marginTop: "3px" }}>
                  {formatDateTime(item.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-semibold text-pink-700 ring-1 ring-pink-100">{item.category}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">{formatStateLabel(item.section)}</span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100">{item.priority || "medium"}</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">{item.triageStatus || item.status || "new"}</span>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3" style={{ marginTop: "10px" }}>
              <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Priority
                <select
                  value={item.priority || "medium"}
                  disabled={unavailable || triagingId === item.id}
                  onChange={(event) => updateTriage(item, { priority: event.target.value })}
                  className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-slate-800 outline-none disabled:opacity-60"
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>{formatStateLabel(priority)}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Effort
                <select
                  value={item.effort || "medium"}
                  disabled={unavailable || triagingId === item.id}
                  onChange={(event) => updateTriage(item, { effort: event.target.value })}
                  className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-slate-800 outline-none disabled:opacity-60"
                >
                  {efforts.map((effort) => (
                    <option key={effort} value={effort}>{formatStateLabel(effort)}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Triage
                <select
                  value={item.triageStatus || "new"}
                  disabled={unavailable || triagingId === item.id}
                  onChange={(event) => updateTriage(item, { triageStatus: event.target.value })}
                  className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-slate-800 outline-none disabled:opacity-60"
                >
                  {triageStatuses.map((status) => (
                    <option key={status} value={status}>{formatStateLabel(status)}</option>
                  ))}
                </select>
              </label>
            </div>
            {item.notes?.length ? (
              <p className="text-xs text-slate-500" style={{ marginTop: "8px" }}>
                Latest note: {item.notes[item.notes.length - 1].note}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function roadmapToneClass(value = "") {
  const normalised = String(value || "").toLowerCase();
  if (normalised === "high" || normalised === "critical") return "bg-rose-50 text-rose-700 ring-rose-100";
  if (normalised === "medium") return "bg-amber-50 text-amber-800 ring-amber-100";
  if (normalised === "low") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  return "bg-slate-50 text-slate-700 ring-slate-100";
}

function latestRoadmapApproval(approvals = [], itemId = "") {
  const matches = approvals
    .filter((approval) => approval.roadmapItemId === itemId)
    .sort((a, b) => String(b.approvedAt || "").localeCompare(String(a.approvedAt || "")));
  const approval = matches[0] || null;
  if (!approval) return { state: "not_approved", approval: null };
  const expiresAt = new Date(approval.expiresAt || "");
  const expired = Number.isNaN(expiresAt.getTime()) ? false : expiresAt.getTime() < Date.now();
  return {
    state: expired ? "expired" : approval.status || "approved",
    approval,
  };
}

function implementationBriefState(brief, itemId = "") {
  if (!brief || brief.approvedItemId !== itemId) return { state: "not_generated", brief: null };
  return { state: "generated", brief };
}

function workPackageState(workPackage, itemId = "") {
  if (!workPackage || workPackage.approvedRoadmapItem?.id !== itemId) return { state: "not_generated", workPackage: null };
  return { state: "generated", workPackage };
}

function workPackageReviewState(review, itemId = "") {
  if (!review || review.itemId !== itemId) return { state: "not_reviewed", review: null };
  return { state: review.status || "reviewed", review };
}

function implementationStatusState(statuses = [], itemId = "") {
  const status = statuses.find((record) => record.roadmapItemId === itemId) || null;
  if (!status) return { state: "not_started", status: null };
  return { state: status.currentStatus || "unknown", status };
}

function RoadmapIntelligencePanel({ roadmap, approvals = [], implementationBrief = null, workPackage = null, workPackageReview = null, implementationStatuses = [] }) {
  const items = Array.isArray(roadmap?.items) ? roadmap.items : [];
  const categories = ["all", ...new Set(items.map((item) => item.category).filter(Boolean))];
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [copiedItemId, setCopiedItemId] = useState("");
  const [copiedApprovalId, setCopiedApprovalId] = useState("");
  const [copiedBriefId, setCopiedBriefId] = useState("");
  const [copiedPackageId, setCopiedPackageId] = useState("");
  const [copiedReviewId, setCopiedReviewId] = useState("");
  const [copiedStatusId, setCopiedStatusId] = useState("");
  const visibleItems = items
    .filter((item) => categoryFilter === "all" || item.category === categoryFilter)
    .slice(0, 3);
  const recommended = roadmap?.recommendedNextImprovement || items[0] || null;
  const planExists = Boolean(Object.values(sentinelRoadmapPlanModules).length);

  const copyPlanCommand = async (item) => {
    const ok = await copyText(`npm run platform:roadmap:plan -- --item ${item.id}`, "roadmap plan command");
    if (ok) {
      setCopiedItemId(item.id);
      window.setTimeout(() => setCopiedItemId(""), 1800);
    }
  };

  const copyApprovalCommand = async (item) => {
    const command = `npm run platform:roadmap:approve -- --item ${item.id} --note "Approved for implementation planning"`;
    const ok = await copyText(command, "roadmap approval command");
    if (ok) {
      setCopiedApprovalId(item.id);
      window.setTimeout(() => setCopiedApprovalId(""), 1800);
    }
  };

  const copyBriefCommand = async (item) => {
    const command = `npm run platform:roadmap:brief -- --item ${item.id}`;
    const ok = await copyText(command, "roadmap brief command");
    if (ok) {
      setCopiedBriefId(item.id);
      window.setTimeout(() => setCopiedBriefId(""), 1800);
    }
  };

  const copyPackageCommand = async (item) => {
    const command = `npm run platform:roadmap:package -- --item ${item.id}`;
    const ok = await copyText(command, "roadmap work package command");
    if (ok) {
      setCopiedPackageId(item.id);
      window.setTimeout(() => setCopiedPackageId(""), 1800);
    }
  };

  const copyReviewCommand = async (item) => {
    const command = `npm run platform:roadmap:review -- --item ${item.id}`;
    const ok = await copyText(command, "roadmap work package review command");
    if (ok) {
      setCopiedReviewId(item.id);
      window.setTimeout(() => setCopiedReviewId(""), 1800);
    }
  };

  const copyStatusCommand = async (item, status, note) => {
    const command = `npm run platform:roadmap:status -- --item ${item.id} --set ${status} --note "${note}"`;
    const ok = await copyText(command, "roadmap implementation status command");
    if (ok) {
      setCopiedStatusId(`${item.id}:${status}`);
      window.setTimeout(() => setCopiedStatusId(""), 1800);
    }
  };

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100/80 md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">Roadmap Intelligence</p>
          <h2 className="text-xl font-semibold text-slate-950">Prioritised Sentinel improvements</h2>
          <p className="text-sm text-slate-600">Heuristic, operator-guided planning from feedback, activity and platform state. No autonomous implementation.</p>
        </div>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
          {planExists ? "Plan report present" : roadmap?.generatedAt ? formatDateTime(roadmap.generatedAt) : "No roadmap yet"}
        </span>
      </div>

      {!items.length ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-100" style={{ marginTop: "16px" }}>
          Run <code className="rounded bg-white px-1.5 py-0.5">npm run platform:roadmap</code> to generate the latest local improvement roadmap.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" style={{ marginTop: "16px" }}>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setCategoryFilter(category)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${categoryFilter === category ? "bg-slate-950 text-white ring-slate-950" : "bg-slate-50 text-slate-700 ring-slate-100 hover:bg-slate-100"}`}
              >
                {category === "all" ? "All" : formatStateLabel(category)}
              </button>
            ))}
          </div>

          {recommended ? (
            <div className="rounded-2xl bg-pink-50 p-4 ring-1 ring-pink-100" style={{ marginTop: "16px" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-700">Recommended next improvement</p>
              <p className="text-sm font-semibold text-slate-950" style={{ marginTop: "4px" }}>{recommended.title}</p>
              <p className="text-xs text-slate-600" style={{ marginTop: "4px" }}>{recommended.suggestedNextStep}</p>
            </div>
          ) : null}

          <div className="grid gap-3" style={{ marginTop: "16px" }}>
            {visibleItems.map((item) => {
              const approvalState = latestRoadmapApproval(approvals, item.id);
              const briefState = implementationBriefState(implementationBrief, item.id);
              const packageState = workPackageState(workPackage, item.id);
              const reviewState = workPackageReviewState(workPackageReview, item.id);
              const implementationState = implementationStatusState(implementationStatuses, item.id);

              return (
                <article key={item.id} className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-950">{item.title}</h3>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                          {formatStateLabel(item.category)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600" style={{ marginTop: "6px" }}>{item.rationale}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${roadmapToneClass(item.impact)}`}>
                        Impact {item.impact}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${roadmapToneClass(item.effort === "low" ? "low" : item.effort === "high" ? "high" : "medium")}`}>
                        Effort {item.effort}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${roadmapToneClass(item.suggestedPriority)}`}>
                        {formatStateLabel(item.suggestedPriority)} priority
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500" style={{ marginTop: "10px" }}>
                    <span>{item.linkedFeedbackIds?.length || 0} linked feedback item{(item.linkedFeedbackIds?.length || 0) === 1 ? "" : "s"}</span>
                    <span>Source: {formatStateLabel(item.source)}</span>
                    <span>Confidence: {item.confidence}</span>
                    <span>Approval: {formatStateLabel(approvalState.state)}</span>
                    {approvalState.approval?.expiresAt ? <span>Expires: {formatDateTime(approvalState.approval.expiresAt)}</span> : null}
                    <span>Brief: {formatStateLabel(briefState.state)}</span>
                    <span>Work package: {formatStateLabel(packageState.state)}</span>
                    <span>Review: {formatStateLabel(reviewState.state)}</span>
                    <span>Implementation: {formatStateLabel(implementationState.state)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2" style={{ marginTop: "12px" }}>
                    <button
                      type="button"
                      onClick={() => copyPlanCommand(item)}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                    >
                      {copiedItemId === item.id ? "Copied plan command" : "Copy plan command"}
                    </button>
                    <code className="max-w-full break-all rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-500 ring-1 ring-slate-100">
                      npm run platform:roadmap:plan -- --item {item.id}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyApprovalCommand(item)}
                      className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-slate-950 hover:bg-slate-800"
                    >
                      {copiedApprovalId === item.id ? "Copied approval command" : "Copy approval command"}
                    </button>
                    <code className="max-w-full break-all rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-500 ring-1 ring-slate-100">
                      npm run platform:roadmap:approve -- --item {item.id}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyBriefCommand(item)}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                    >
                      {copiedBriefId === item.id ? "Copied brief command" : "Copy brief command"}
                    </button>
                    <code className="max-w-full break-all rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-500 ring-1 ring-slate-100">
                      npm run platform:roadmap:brief -- --item {item.id}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyPackageCommand(item)}
                      className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-slate-950 hover:bg-slate-800"
                    >
                      {copiedPackageId === item.id ? "Copied package command" : "Copy package command"}
                    </button>
                    <code className="max-w-full break-all rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-500 ring-1 ring-slate-100">
                      npm run platform:roadmap:package -- --item {item.id}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyReviewCommand(item)}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                    >
                      {copiedReviewId === item.id ? "Copied review command" : "Copy review command"}
                    </button>
                    <code className="max-w-full break-all rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-500 ring-1 ring-slate-100">
                      npm run platform:roadmap:review -- --item {item.id}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyStatusCommand(item, "ready", "Reviewed package ready")}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                    >
                      {copiedStatusId === `${item.id}:ready` ? "Copied ready status" : "Copy ready status"}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyStatusCommand(item, "in_progress", "Implementation started")}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                    >
                      {copiedStatusId === `${item.id}:in_progress` ? "Copied in progress status" : "Copy in progress status"}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyStatusCommand(item, "implemented", "Implementation completed")}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                    >
                      {copiedStatusId === `${item.id}:implemented` ? "Copied implemented status" : "Copy implemented status"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

function OperatorConsolePanel({ actionRegistry, history, authoritySnapshot, onActionComplete }) {
  const actions = useMemo(() => (
    Array.isArray(actionRegistry?.actions)
      ? actionRegistry.actions.filter((action) => action.allowFromUI)
      : []
  ), [actionRegistry]);
  const authorityAllowsExecution = canUseOperatorAuthority(authoritySnapshot);
  const authorityMessage = authorityDisabledMessage(authoritySnapshot);
  const actionById = useMemo(() => new Map(actions.map((action) => [action.id, action])), [actions]);
  const localExecutionCounterRef = useRef(0);
  const [selectedActionId, setSelectedActionId] = useState(actions[0]?.id || "");
  const [executions, setExecutions] = useState([]);
  const [activeExecutionId, setActiveExecutionId] = useState("");
  const [consoleMessage, setConsoleMessage] = useState("");
  const selectedAction = actions.find((action) => action.id === selectedActionId) || actions[0] || null;
  const activeExecution = executions.find((execution) => execution.executionId === activeExecutionId) || null;
  const activeAction = activeExecution?.action ? actionById.get(activeExecution.action) : selectedAction;
  const activeStatus = normaliseExecutionStatus(activeExecution?.status || "");
  const activeFailed = activeStatus === "failed";
  const isRunning = Boolean(activeExecution) && ["queued", "running"].includes(normaliseExecutionStatus(activeExecution.status));
  const persistedHistory = Array.isArray(history?.actions) ? history.actions.slice(0, 5) : [];
  const historyUnavailable = history?.status === "unavailable";
  const historyLoading = history?.loading;
  const enrichExecution = (execution) => {
    const actionMeta = actionById.get(execution.action);
    return {
      ...execution,
      label: execution.label || actionMeta?.label || formatStateLabel(execution.action),
      command: execution.command || actionMeta?.command || `ui_action:${execution.action}`,
      description: actionMeta?.description || "",
      durationLabel: execution.durationLabel || formatDurationMs(execution.durationMs),
      timestamp: execution.finishedAt || execution.startedAt || execution.queuedAt,
    };
  };
  const persistedExecutions = persistedHistory.map((item) => enrichExecution({
    executionId: `history-${item.id}`,
    runId: item.id,
    action: item.action,
    status: item.status,
    summary: item.summary,
    outputExcerpt: item.outputExcerpt,
    startedAt: item.startedAt,
    finishedAt: item.finishedAt,
    durationMs: item.durationMs,
    durationLabel: item.durationLabel,
    failureSuggestion: item.failureSuggestion,
  }));
  const latestExecutions = [...executions.map(enrichExecution), ...persistedExecutions]
    .reduce((items, execution) => {
      const key = execution.runId ? `run-${execution.runId}` : execution.executionId;
      if (items.some((item) => (item.runId ? `run-${item.runId}` : item.executionId) === key)) return items;
      return [...items, execution];
    }, [])
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
    .slice(0, 5);

  const upsertExecution = (execution) => {
    setExecutions((current) => {
      const withoutCurrent = current.filter((item) => item.executionId !== execution.executionId);
      return [execution, ...withoutCurrent].slice(0, 8);
    });
    setActiveExecutionId(execution.executionId);
  };

  const nextLocalExecutionId = () => {
    localExecutionCounterRef.current += 1;
    return `failed-local-${localExecutionCounterRef.current}`;
  };

  const runSelectedAction = async () => {
    if (!selectedAction) return;
    if (!authorityAllowsExecution) {
      setConsoleMessage(authorityMessage);
      return;
    }

    setConsoleMessage("");
    try {
      const response = await fetch(`${sentinelActionApiBaseUrl}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: selectedAction.id }),
      });
      const payload = await response.json().catch(() => ({
        status: "failed",
        message: "Action API returned a non-JSON response.",
      }));

      if (!response.ok || !payload.executionId) {
        upsertExecution({
          executionId: nextLocalExecutionId(),
          action: selectedAction.id,
          label: selectedAction.label,
          command: selectedAction.command,
          status: "failed",
          summary: payload.message || "Action could not be started.",
          outputExcerpt: payload.message || "",
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          durationMs: 0,
        });
        return;
      }

      upsertExecution(payload);
      const finalExecution = await pollSentinelActionExecution(payload.executionId, {
        onUpdate: upsertExecution,
      });
      if (finalExecution) upsertExecution(finalExecution);
      if (typeof onActionComplete === "function") await onActionComplete();
    } catch (error) {
      upsertExecution({
        executionId: nextLocalExecutionId(),
        action: selectedAction.id,
        label: selectedAction.label,
        command: selectedAction.command,
        status: "failed",
        summary: `Could not reach local Sentinel API at ${sentinelActionApiBaseUrl}.`,
        outputExcerpt: error.message,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 0,
      });
    }
  };

  return (
    <section aria-label="Sentinel Operator Console" className="rounded-[28px] bg-slate-950 p-5 text-white shadow-sm md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-300">Operator Console</p>
          <h2 className="text-xl font-semibold">Controlled allowlisted execution</h2>
          <p className="max-w-2xl text-sm text-slate-300">
            Select one safe local action, run it through the Sentinel API, then poll the execution state. There is no raw command box,
            no custom arguments and no unrestricted shell.
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
          {formatStateLabel(authoritySnapshot?.state || "local_bypass")}
        </span>
      </div>
      {!authorityAllowsExecution ? (
        <div className="rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-100 ring-1 ring-amber-300/20" style={{ marginTop: "14px" }}>
          {authorityMessage}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" style={{ marginTop: "18px" }}>
        <div className="rounded-[24px] bg-white/8 p-4 ring-1 ring-white/10">
          <label className="grid gap-2 text-sm font-semibold text-slate-100">
            Selected action
            <select
              value={selectedAction?.id || ""}
              onChange={(event) => setSelectedActionId(event.target.value)}
              className="min-h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-400/10"
            >
              {actions.map((action) => (
                <option key={action.id} value={action.id}>
                  {action.label}
                </option>
              ))}
            </select>
          </label>

          {selectedAction ? (
            <div className="rounded-2xl bg-slate-900/80 p-3 text-sm ring-1 ring-white/10" style={{ marginTop: "12px" }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Fixed command</p>
                  <p className="break-all font-semibold text-white">{selectedAction.command}</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-300/20">
                  UI safe
                </span>
              </div>
              <p className="text-slate-300" style={{ marginTop: "8px" }}>{selectedAction.description}</p>
              <div className="flex flex-wrap gap-2" style={{ marginTop: "10px" }}>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-300/20">
                  {selectedAction.riskLevel} risk
                </span>
                <span className="rounded-full bg-blue-400/10 px-2.5 py-1 text-xs font-semibold text-blue-200 ring-1 ring-blue-300/20">
                  {selectedAction.executionMode}
                </span>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2" style={{ marginTop: "14px" }}>
            <button
              type="button"
              onClick={runSelectedAction}
              disabled={!selectedAction || isRunning || !authorityAllowsExecution}
              className="rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-400 disabled:cursor-wait disabled:bg-pink-300/50"
            >
              {isRunning ? "Execution running" : "Run selected action"}
            </button>
            <button
              type="button"
              disabled
              title="Cancellation is planned later. Current executions rely on strict timeouts."
              className="rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-slate-400 ring-1 ring-white/10"
            >
              Cancel placeholder
            </button>
          </div>
          {consoleMessage ? (
            <p className="text-xs text-slate-300" style={{ marginTop: "10px" }}>{consoleMessage}</p>
          ) : null}
        </div>

        <div className="rounded-[24px] bg-white p-4 text-slate-950 ring-1 ring-white/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Execution state</p>
              <h3 className="text-lg font-semibold">{activeExecution?.label || selectedAction?.label || "No execution yet"}</h3>
              <p className="text-xs text-slate-500">
                {activeAction?.description || "Run an allowlisted action to capture a structured result."}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${actionStatusBadgeClass(activeExecution?.status || "queued")}`}>
              {activeExecution ? formatStateLabel(normaliseExecutionStatus(activeExecution.status)) : "waiting"}
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-3" style={{ marginTop: "12px" }}>
            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Started</p>
              <p className="text-xs text-slate-700">{formatDateTime(activeExecution?.startedAt)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Finished</p>
              <p className="text-xs text-slate-700">{formatDateTime(activeExecution?.finishedAt)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Duration</p>
              <p className="text-xs text-slate-700">{formatExecutionDuration(activeExecution)}</p>
            </div>
          </div>

          <div className={`rounded-2xl p-4 ring-1 ${activeFailed ? "bg-rose-50 text-rose-950 ring-rose-100" : "bg-emerald-50 text-emerald-950 ring-emerald-100"}`} style={{ marginTop: "12px" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-70">{activeFailed ? "Failure summary" : "Summary"}</p>
            <p className="text-sm font-semibold" style={{ marginTop: "4px" }}>
              {activeExecution?.summary || "Choose an allowlisted action and run it from the console."}
            </p>
            {activeFailed ? (
              <p className="text-xs text-rose-800" style={{ marginTop: "8px" }}>
                {activeExecution?.failureSuggestion || "Check platform:doctor, then review the output excerpt."}
              </p>
            ) : null}
          </div>

          <details style={{ marginTop: "12px" }}>
            <summary className="cursor-pointer text-xs font-semibold text-slate-600">
              {activeFailed ? "View failure output" : "View output excerpt"}
            </summary>
            <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-3 text-[11px] leading-5 text-slate-100" style={{ marginTop: "8px" }}>
              {activeFailed ? activeExecution?.stderrExcerpt || activeExecution?.outputExcerpt || "No failure output captured." : activeExecution?.outputExcerpt || "No output captured yet."}
            </pre>
          </details>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]" style={{ marginTop: "18px" }}>
        <div className="rounded-[24px] bg-white/8 p-4 ring-1 ring-white/10">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-200">Console history</p>
              <p className="text-xs text-slate-400">Last five local console executions from API history, with in-session runs first.</p>
            </div>
            {historyLoading ? (
              <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">loading</span>
            ) : null}
          </div>
          <div className="grid gap-2" style={{ marginTop: "12px" }}>
            {!executions.length && historyUnavailable ? (
              <div className="rounded-2xl bg-blue-400/10 p-3 text-sm text-blue-100 ring-1 ring-blue-300/20">
                API history is available when the local Sentinel API is running.
              </div>
            ) : null}
            {latestExecutions.length ? latestExecutions.map((execution) => (
              <div key={execution.executionId} className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-all text-sm font-semibold text-white">{execution.label || execution.action}</p>
                    <p className="text-xs text-slate-400">
                      {formatDateTime(execution.timestamp)} · {formatExecutionDuration(execution)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${actionStatusBadgeClass(execution.status)}`}>
                    {formatStateLabel(normaliseExecutionStatus(execution.status))}
                  </span>
                </div>
                {execution.summary ? (
                  <p className="text-xs text-slate-300" style={{ marginTop: "8px" }}>{execution.summary}</p>
                ) : null}
                {normaliseExecutionStatus(execution.status) === "failed" ? (
                  <p className="text-xs text-rose-200" style={{ marginTop: "6px" }}>
                    {execution.failureSuggestion || "Check platform:doctor, then review the output excerpt."}
                  </p>
                ) : null}
                {execution.outputExcerpt ? (
                  <details style={{ marginTop: "8px" }}>
                    <summary className="cursor-pointer text-xs font-semibold text-slate-300">View output</summary>
                    <pre className="max-h-36 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-2 text-[11px] leading-5 text-slate-100 ring-1 ring-white/10" style={{ marginTop: "6px" }}>
                      {normaliseExecutionStatus(execution.status) === "failed" ? execution.stderrExcerpt || execution.outputExcerpt : execution.outputExcerpt}
                    </pre>
                  </details>
                ) : null}
              </div>
            )) : (
              <div className="rounded-2xl bg-white/8 p-3 text-sm text-slate-300 ring-1 ring-white/10">
                No console executions recorded in this browser session yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] bg-amber-300/10 p-4 text-amber-50 ring-1 ring-amber-200/20">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-100">Intentionally excluded</p>
          <ul className="grid gap-2 text-sm text-amber-50" style={{ marginTop: "10px" }}>
            <li>Deployment, FTP and service commands are not available here.</li>
            <li>Cleanup, restore and backup mutation commands are excluded.</li>
            <li>There is no arbitrary shell input or command chaining.</li>
            <li>Future expansion should be approval-gated before execution.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function ExecutionPipelinesPanel({ pipelineSnapshot, authoritySnapshot, onRefresh, onPipelineComplete }) {
  const pipelines = Array.isArray(pipelineSnapshot?.pipelines) ? pipelineSnapshot.pipelines : [];
  const history = Array.isArray(pipelineSnapshot?.history) ? pipelineSnapshot.history.slice(0, 5) : [];
  const loading = pipelineSnapshot?.loading;
  const unavailable = pipelineSnapshot?.status === "unavailable";
  const authorityAllowsExecution = canUseOperatorAuthority(authoritySnapshot);
  const authorityMessage = authorityDisabledMessage(authoritySnapshot);
  const [executions, setExecutions] = useState([]);
  const [runningPipelineId, setRunningPipelineId] = useState("");

  const upsertExecution = (execution) => {
    setExecutions((current) => {
      const withoutCurrent = current.filter((item) => item.executionId !== execution.executionId);
      return [execution, ...withoutCurrent].slice(0, 5);
    });
  };

  const runPipeline = async (pipeline) => {
    if (!pipeline?.id || runningPipelineId) return;
    if (!authorityAllowsExecution) {
      upsertExecution({
        executionId: `pipeline-authority-${Date.now()}`,
        pipeline: pipeline.id,
        label: pipeline.label,
        status: "failed",
        summary: authorityMessage,
        steps: [],
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 0,
      });
      return;
    }

    setRunningPipelineId(pipeline.id);

    try {
      const response = await fetch(`${sentinelActionApiBaseUrl}/pipeline/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipelineId: pipeline.id }),
      });
      const payload = await response.json().catch(() => ({
        status: "failed",
        message: "Pipeline API returned a non-JSON response.",
      }));

      if (!response.ok || !payload.executionId) {
        upsertExecution({
          executionId: `pipeline-failed-${Date.now()}`,
          pipeline: pipeline.id,
          label: pipeline.label,
          status: "failed",
          summary: payload.message || "Pipeline could not be started.",
          steps: [],
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          durationMs: 0,
        });
        return;
      }

      upsertExecution(payload);
      const finalExecution = await pollSentinelPipelineExecution(payload.executionId, {
        onUpdate: upsertExecution,
      });
      if (finalExecution) upsertExecution(finalExecution);
      if (typeof onPipelineComplete === "function") await onPipelineComplete();
    } catch (error) {
      upsertExecution({
        executionId: `pipeline-failed-${Date.now()}`,
        pipeline: pipeline.id,
        label: pipeline.label,
        status: "failed",
        summary: `Could not reach local Sentinel API at ${sentinelActionApiBaseUrl}.`,
        outputExcerpt: error.message,
        steps: [],
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 0,
      });
    } finally {
      setRunningPipelineId("");
    }
  };

  const combinedHistory = [
    ...executions.map((execution) => ({
      ...execution,
      timestamp: execution.finishedAt || execution.startedAt || execution.queuedAt,
    })),
    ...history.map((item) => ({
      executionId: `pipeline-history-${item.id}`,
      pipeline: item.pipeline,
      label: pipelines.find((pipeline) => pipeline.id === item.pipeline)?.label || formatStateLabel(item.pipeline),
      status: item.status,
      summary: item.summary,
      startedAt: item.startedAt,
      finishedAt: item.finishedAt,
      durationMs: item.durationMs,
      durationLabel: item.durationLabel,
      completedStepCount: item.completedStepCount,
      stepCount: item.stepCount,
      failedStep: item.failedStep,
      timestamp: item.finishedAt || item.startedAt,
    })),
  ]
    .reduce((items, execution) => {
      const key = execution.runId ? `run-${execution.runId}` : execution.executionId;
      if (items.some((item) => (item.runId ? `run-${item.runId}` : item.executionId) === key)) return items;
      return [...items, execution];
    }, [])
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
    .slice(0, 5);

  return (
    <section aria-label="Sentinel Execution Pipelines" className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100/80 md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">Execution Pipelines</p>
          <h2 className="text-xl font-semibold text-slate-950">Structured safe workflows</h2>
          <p className="max-w-2xl text-sm text-slate-600">
            Run registered multi-step workflows only. Steps are fixed allowlisted actions, executed sequentially with no custom editing.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-100" style={{ marginTop: "16px" }}>
          Loading pipeline registry…
        </div>
      ) : null}

      {!loading && unavailable ? (
        <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-900 ring-1 ring-blue-100" style={{ marginTop: "16px" }}>
          Pipeline registry is available when the local Sentinel API is running.
        </div>
      ) : null}

      {!authorityAllowsExecution ? (
        <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900 ring-1 ring-amber-100" style={{ marginTop: "16px" }}>
          {authorityMessage}
        </div>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-2" style={{ marginTop: "16px" }}>
        {!unavailable && pipelines.map((pipeline) => {
          const running = runningPipelineId === pipeline.id;
          const latestExecution = executions.find((execution) => execution.pipeline === pipeline.id);
          return (
            <article key={pipeline.id} className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950">{pipeline.label}</p>
                  <p className="text-xs text-slate-600">{pipeline.description}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${actionStatusBadgeClass(latestExecution?.status || "queued")}`}>
                  {latestExecution ? formatStateLabel(normaliseExecutionStatus(latestExecution.status)) : `${pipeline.riskLevel || "low"} risk`}
                </span>
              </div>

              <div className="flex flex-wrap gap-2" style={{ marginTop: "10px" }}>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-100">
                  {pipeline.stepCount} steps
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-100">
                  {pipeline.estimatedDuration}
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-100">
                  {formatStateLabel(pipeline.approvalMode || "operator_required")}
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-100">
                  {formatStateLabel(pipeline.executionMode || "manual")}
                </span>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
                  schedule: {formatStateLabel(pipeline.scheduleMode || "disabled")}
                </span>
                {pipeline.allowScheduling ? (
                  <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 ring-1 ring-cyan-100">
                    schedulable
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                    manual only
                  </span>
                )}
                {pipeline.requiresReview ? (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100">
                    review required
                  </span>
                ) : null}
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  allowlisted only
                </span>
              </div>

              {pipeline.safetyNotes ? (
                <p className="text-xs text-slate-500" style={{ marginTop: "10px" }}>
                  {pipeline.safetyNotes}
                </p>
              ) : null}

              <ol className="grid gap-1.5 text-xs text-slate-600" style={{ marginTop: "12px" }}>
                {pipeline.steps.map((step, index) => {
                  const executionStep = latestExecution?.steps?.find((item) => item.actionId === step.actionId);
                  return (
                    <li key={step.actionId} className="flex items-start justify-between gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-100">
                      <span>{index + 1}. {step.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${actionStatusBadgeClass(executionStep?.status || "queued")}`}>
                        {executionStep ? formatStateLabel(normaliseExecutionStatus(executionStep.status)) : "queued"}
                      </span>
                    </li>
                  );
                })}
              </ol>

              {latestExecution?.summary ? (
                <p className="text-xs font-semibold text-slate-700" style={{ marginTop: "10px" }}>{latestExecution.summary}</p>
              ) : null}
              {latestExecution?.failedStep ? (
                <p className="text-xs text-rose-700" style={{ marginTop: "6px" }}>
                  Failed step: {latestExecution.failedStep.label}
                </p>
              ) : null}

              <button
                type="button"
                onClick={() => runPipeline(pipeline)}
                disabled={Boolean(runningPipelineId) || !pipeline.valid || !authorityAllowsExecution}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-400"
                style={{ marginTop: "12px" }}
              >
                {running ? "Pipeline running" : "Run pipeline"}
              </button>
            </article>
          );
        })}
      </div>

      <div className="rounded-[24px] bg-slate-950 p-4 text-white" style={{ marginTop: "16px" }}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-200">Pipeline history</p>
        <div className="grid gap-2" style={{ marginTop: "12px" }}>
          {combinedHistory.length ? combinedHistory.map((execution) => (
            <div key={execution.executionId} className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{execution.label || formatStateLabel(execution.pipeline)}</p>
                  <p className="text-xs text-slate-400">
                    {formatDateTime(execution.timestamp)} · {formatExecutionDuration(execution)}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${actionStatusBadgeClass(execution.status)}`}>
                  {formatStateLabel(normaliseExecutionStatus(execution.status))}
                </span>
              </div>
              <p className="text-xs text-slate-300" style={{ marginTop: "8px" }}>
                {execution.summary || `${execution.completedStepCount ?? "Recorded"}${execution.stepCount ? `/${execution.stepCount}` : ""} steps completed.`}
              </p>
              {execution.failedStep ? (
                <p className="text-xs text-rose-200" style={{ marginTop: "6px" }}>
                  Failed step: {execution.failedStep.label || execution.failedStep.actionId}
                </p>
              ) : null}
            </div>
          )) : (
            <div className="rounded-2xl bg-white/8 p-3 text-sm text-slate-300 ring-1 ring-white/10">
              No pipeline executions recorded yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function AutopilotOrchestratorPanel({ autopilotReport, loading }) {
  const [copyState, setCopyState] = useState("idle");
  const [copyTarget, setCopyTarget] = useState("");
  const state = autopilotReport?.state || "healthy_monitoring";
  const isHealthy = autopilotReport?.health === "HEALTHY" || state === "healthy_monitoring" || state === "growth_ready";
  const topGap = autopilotReport?.topGap?.title || "Strategic growth opportunity available.";
  const nextCommand = autopilotReport?.recommendedNextStep || "npm run seo:autopilot";
  const prompt = autopilotReport?.codexPrompt || "Run npm run seo:autopilot, then review the generated report before making changes.";

  const copyItem = async (text, target) => {
    const ok = await copyText(text, `autopilot ${target}`);
    setCopyTarget(target);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => {
      setCopyState("idle");
      setCopyTarget("");
    }, 1400);
  };

  const buttonLabel = (target, fallback) => {
    if (copyTarget !== target) return fallback;
    if (copyState === "copied") return "Copied";
    if (copyState === "failed") return "Copy failed";
    return fallback;
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-md flex-wrap">
        <div>
          <p className="text-sm font-semibold text-slate-900">Autopilot</p>
          <p className="text-xs text-slate-600">
            {isHealthy ? "Autopilot is monitoring. No maintenance work required." : "Autopilot has found work that needs operator attention."}
          </p>
        </div>
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${isHealthy ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
          {loading ? "loading" : state}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500" style={{ marginTop: "var(--space-sm)" }}>Loading autopilot report...</p>
      ) : !autopilotReport ? (
        <div className="flex items-center justify-between gap-sm flex-wrap" style={{ marginTop: "var(--space-sm)" }}>
          <p className="text-sm text-slate-600">Autopilot report missing. Run the orchestrator to generate the latest decision.</p>
          <code className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">npm run seo:autopilot</code>
        </div>
      ) : (
        <div className="grid gap-sm md:grid-cols-[1fr_auto]" style={{ marginTop: "var(--space-sm)" }}>
          <div>
            <p className="text-sm font-semibold text-slate-900">{topGap}</p>
            <p className="text-xs text-slate-600" style={{ marginTop: "4px" }}>
              Next: <code className="rounded bg-slate-100 px-1.5 py-0.5">{nextCommand}</code>
            </p>
            <p className="text-xs text-slate-600" style={{ marginTop: "4px" }}>
              Human input required: {autopilotReport.humanInputRequired ? "yes" : "no"} · Report: reports/seo-autopilot-report.md
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap md:justify-end">
            <button
              type="button"
              onClick={() => copyItem(nextCommand, "command")}
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {buttonLabel("command", "Copy command")}
            </button>
            <button
              type="button"
              onClick={() => copyItem(prompt, "prompt")}
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {buttonLabel("prompt", "Copy prompt")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function StrategicDecisionsPanel({ decisionReport, loading }) {
  const [copyState, setCopyState] = useState("idle");
  const [copyTarget, setCopyTarget] = useState("");
  const top = Array.isArray(decisionReport?.topDecisions)
    ? decisionReport.topDecisions.slice(0, 3)
    : Array.isArray(decisionReport?.decisions)
      ? decisionReport.decisions.slice(0, 3)
      : [];

  const copyItem = async (text, target) => {
    const ok = await copyText(text, `strategic-decision ${target}`);
    setCopyTarget(target);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => {
      setCopyState("idle");
      setCopyTarget("");
    }, 1400);
  };

  const buttonLabel = (target, fallback) => {
    if (copyTarget !== target) return fallback;
    if (copyState === "copied") return "Copied";
    if (copyState === "failed") return "Copy failed";
    return fallback;
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-md flex-wrap">
        <div>
          <p className="text-sm font-semibold text-slate-900">Strategic Decisions</p>
          <p className="text-xs text-slate-600">Recommended strategic direction before execution.</p>
        </div>
        <code className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">npm run seo:decisions</code>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500" style={{ marginTop: "var(--space-sm)" }}>Loading strategic decisions...</p>
      ) : !decisionReport ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>
          Decision report missing. Run <code>npm run seo:decisions</code>.
        </p>
      ) : top.length === 0 ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>No strategic decisions available.</p>
      ) : (
        <div className="grid gap-sm" style={{ marginTop: "var(--space-sm)" }}>
          {top.map((decision) => (
            <div key={decision.id} className="rounded-xl border border-slate-100 bg-slate-50/60" style={{ padding: "var(--space-sm)" }}>
              <div className="flex items-start justify-between gap-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{decision.title}</p>
                  <p className="text-xs text-slate-600">{decision.preferredPath}</p>
                </div>
                <span className="inline-flex shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {decision.decisionType}
                </span>
              </div>
              <p className="text-xs text-slate-600" style={{ marginTop: "6px" }}>
                Confidence: {decision.confidence} · Cannibalisation: {decision.cannibalisationRisk}
              </p>
              <p className="text-xs text-slate-700" style={{ marginTop: "4px" }}>{decision.reasoning}</p>
              <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => copyItem(decision.nextRecommendedCommand || "", `${decision.id}-command`)}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {buttonLabel(`${decision.id}-command`, "Copy next")}
                </button>
                <button
                  type="button"
                  onClick={() => copyItem(decision.codexDecisionPrompt || "", `${decision.id}-prompt`)}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  disabled={!decision.codexDecisionPrompt}
                >
                  {buttonLabel(`${decision.id}-prompt`, "Copy prompt")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── client edit mode (temporary control, not auth) ── */
const EDITS_ENABLED = import.meta.env.VITE_SEO_ROADMAP_EDITS === "true";

/* ── status helpers ── */
const STATUS = {
  done: { label: "Published", icon: CheckCircle2, bg: "bg-green-100", text: "text-green-700", ring: "ring-green-200" },
  in_progress: { label: "In Progress", icon: Clock, bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200" },
  todo: { label: "To Do", icon: Circle, bg: "bg-slate-100", text: "text-slate-500", ring: "ring-slate-200" },
};

const STATUS_ORDER = ["todo", "in_progress", "done"];

function Badge({ status }) {
  const s = STATUS[status] || STATUS.todo;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${s.bg} ${s.text} ring-1 ${s.ring}`}>
      <Icon size={14} />
      {s.label}
    </span>
  );
}

function StatusButtons({ status, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      {STATUS_ORDER.map((s) => {
        const conf = STATUS[s];
        const Icon = conf.icon;
        const isActive = status === s;
        return (
          <button
            key={s}
            onClick={(e) => { e.stopPropagation(); onChange(s); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? `${conf.bg} ${conf.text} ring-2 ${conf.ring} shadow-sm`
                : "bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Icon size={13} />
            {conf.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── initial phase data ── */
const initialPhases = [
  {
    id: 1,
    label: "Phase 1",
    title: "Quick Wins",
    subtitle: "Already ranking well — rewrites can drive clicks within weeks",
    icon: Zap,
    colour: "from-green-500 to-emerald-600",
    accent: "border-green-500",
    bg: "rgba(16, 185, 129, 0.04)",
    items: [
      {
        priority: "1a",
        title: "6 Essential Accounts Receivable Reports",
        impressions: 4953,
        position: 19.7,
        clicks: 9,
        status: "done",
        why: "Closest to page 1, already getting 9 clicks/month. A strong rewrite could break top 10 fast. Niche topic = less competition.",
        keywords: ["accounts receivable reports", "accounts receivable reporting", "AR reports", "accounts receivable report example"],
      },
      {
        priority: "1b",
        title: "CSV Imports: Why They Fail and How to Fix It",
        impressions: 695,
        position: 6.2,
        clicks: 5,
        status: "done",
        why: "Already on page 1 with 5 clicks. Technical credibility piece — shows E3 knows NetSuite inside out.",
        keywords: ["netsuite csv import errors", "csv import failure", "netsuite data import"],
      },
      {
        priority: "1c",
        title: "10 Tips to Maximise Profits",
        impressions: 534,
        position: 11.8,
        clicks: 1,
        status: "done",
        why: "Position 11.8 = just off page 1. Light refresh could push it over.",
        keywords: ["maximise profits", "how to increase profits", "maximising profits"],
      },
    ],
  },
  {
    id: 2,
    label: "Phase 2",
    title: "High-Volume Content",
    subtitle: "Massive impression volumes — biggest long-term traffic opportunity",
    icon: TrendingUp,
    colour: "from-primary to-violet-600",
    accent: "border-primary",
    bg: "rgba(232, 58, 122, 0.04)",
    items: [
      {
        priority: "2a",
        title: "What is an ERP System? A Beginner's Guide",
        impressions: 12679,
        position: 50.7,
        clicks: 6,
        status: "done",
        why: "Biggest single opportunity. The existing 'What is NetSuite' page is product-specific — this needs to be a broader educational piece.",
        keywords: ["what is an ERP system", "ERP systems UK", "understanding ERP systems", "what is an ERP system and how does it work", "ERP system"],
      },
      {
        priority: "2b",
        title: "Best ERP for Manufacturers",
        impressions: 6180,
        position: 48.1,
        clicks: 3,
        status: "done",
        why: "Manufacturing is E3's core vertical. Definitive comparison piece, leading with NetSuite's strengths.",
        keywords: ["best ERP for manufacturers", "best ERP for manufacturing", "ERP for manufacturers", "manufacturing ERP", "NetSuite for manufacturing"],
      },
      {
        priority: "2c",
        title: "Top Benefits of ERP Systems",
        impressions: 1497,
        position: 52.0,
        clicks: 0,
        status: "done",
        why: "Classic top-of-funnel SEO content. Existing 'Your ERP Should Work For You' is close but doesn't target these keywords directly.",
        keywords: ["benefits of ERP systems", "top benefits of ERP", "advantages of ERP", "ERP system benefits"],
      },
    ],
  },
  {
    id: 3,
    label: "Phase 3",
    title: "Strategic Content — Sells E3",
    subtitle: "Lower volume but captures high-intent visitors actively looking for help",
    icon: Target,
    colour: "from-amber-500 to-orange-600",
    accent: "border-amber-500",
    bg: "rgba(245, 158, 11, 0.04)",
    items: [
      {
        priority: "3a",
        title: "The Value of Investing in a NetSuite Partner",
        impressions: 443,
        position: 57.8,
        clicks: 0,
        status: "done",
        why: "Directly sells E3's service. Explain what a good partner looks like (and make it clear E3 ticks every box).",
        keywords: ["NetSuite partner", "value of NetSuite partner", "why work with a NetSuite partner"],
      },
      {
        priority: "3b",
        title: "10 Signs of a Poor NetSuite Implementation",
        impressions: 194,
        position: 30.1,
        clicks: 1,
        status: "in_progress",
        why: "Problem-aware content. People searching this are frustrated — perfect lead-in to E3's support services.",
        keywords: ["poor NetSuite implementation", "failed NetSuite implementation", "NetSuite implementation problems"],
      },
      {
        priority: "3c",
        title: "How to Choose the Right ERP Consultant",
        impressions: 270,
        position: 61.5,
        clicks: 0,
        status: "done",
        why: "Position E3 as the benchmark for what a good consultant looks like.",
        keywords: ["how to choose an ERP consultant", "ERP consultant", "ERP consulting"],
      },
      {
        priority: "3d",
        title: "Why NetSuite Is the Best Choice of Accounting Software",
        impressions: 462,
        position: 42.7,
        clicks: 1,
        status: "done",
        why: "Targets finance decision-makers specifically.",
        keywords: ["NetSuite accounting software", "best accounting software", "NetSuite vs accounting software"],
      },
    ],
  },
  {
    id: 4,
    label: "Phase 4",
    title: "Fill the Gaps",
    subtitle: "Write over time as earlier content starts ranking",
    icon: Layers,
    colour: "from-slate-500 to-slate-600",
    accent: "border-slate-400",
    bg: "rgba(100, 116, 139, 0.04)",
    items: [
      { priority: "4a", title: "Understanding the Role of ERP Systems", impressions: 1843, position: 56.8, clicks: 0, status: "todo", why: "Could merge into the 'What is ERP' piece or standalone.", keywords: [] },
      { priority: "4b", title: "NetSuite Project Management & Financials", impressions: 694, position: 47.3, clicks: 0, status: "todo", why: "Niche but relevant.", keywords: [] },
      { priority: "4c", title: "NetSuite Apps & Extensions", impressions: 548, position: 33.2, clicks: 0, status: "todo", why: "Showcase the NetSuite ecosystem.", keywords: [] },
      { priority: "4d", title: "7 Warning Signs Your ERP is Holding You Back", impressions: 109, position: 8.2, clicks: 1, status: "todo", why: "Overlaps with existing article — strengthen that one.", keywords: [] },
      { priority: "4e", title: "Why NetSuite Aftercare is Essential", impressions: 149, position: 28.0, clicks: 0, status: "todo", why: "Feeds into the Support page.", keywords: [] },
      { priority: "4f", title: "Optimise End-of-Year Accounting with NetSuite", impressions: 186, position: 36.0, clicks: 0, status: "todo", why: "Seasonal — publish before year-end.", keywords: [] },
    ],
  },
];

const alreadyCovered = [
  { title: "NetSuite for Small Businesses", impressions: 3098, note: "Already have this article + specific redirect. Check it's optimised for the target keywords." },
  { title: "Stress-Free ERP Implementation", impressions: 85, note: "Already have this article on the new site." },
];

const phasePresentation = {
  1: { icon: Zap, colour: "from-green-500 to-emerald-600", accent: "border-green-500", bg: "rgba(16, 185, 129, 0.04)" },
  2: { icon: TrendingUp, colour: "from-primary to-violet-600", accent: "border-primary", bg: "rgba(232, 58, 122, 0.04)" },
  3: { icon: Target, colour: "from-amber-500 to-orange-600", accent: "border-amber-500", bg: "rgba(245, 158, 11, 0.04)" },
  4: { icon: Layers, colour: "from-slate-500 to-slate-600", accent: "border-slate-400", bg: "rgba(100, 116, 139, 0.04)" },
  5: { icon: BarChart3, colour: "from-fuchsia-500 to-pink-600", accent: "border-fuchsia-400", bg: "rgba(217, 70, 239, 0.05)" },
};

function getRoadmapPhases() {
  const dynamicPhases = reportData?.ga4Period?.seoInsights?.roadmapPhases;
  const sourcePhases = Array.isArray(dynamicPhases) && dynamicPhases.length ? dynamicPhases : initialPhases;
  const phases = sourcePhases.map((phase, index) => ({
    ...phase,
    ...phasePresentation[phase.id || index + 1],
  }));
  const topicBacklog = demandSignals.topicBacklogV2 || [];
  const hasPhaseFive = phases.some((p) => p.id === 5);
  if (topicBacklog.length > 0 && !hasPhaseFive) {
    const dynamicPhaseFive = {
      id: 5,
      label: "Phase 5",
      title: "Demand-Led Pipeline",
      subtitle: "Live query opportunities generated from Search Console demand signals",
      items: topicBacklog.slice(0, 8).map((topic, idx) => ({
        priority: `5${String.fromCharCode(97 + idx)}`,
        title: topic.suggestedTitle || topic.query,
        impressions: topic.impressions || 0,
        position: topic.position || 0,
        clicks: topic.clicks || 0,
        status: "todo",
        why: topic.whyNow || "Live demand signal suggests this topic is worth covering next.",
        keywords: [topic.query].filter(Boolean),
      })),
      ...phasePresentation[5],
    };
    phases.push(dynamicPhaseFive);
  }
  return phases;
}

/* ── helpers ── */
const fmt = (n) => n.toLocaleString("en-GB");
const britDate = (s) => (s ? s.replace(/(\d{4})-(\d{2})-(\d{2})/g, (_, y, m, d) => `${d}/${m}/${y}`) : s);
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const smallTitleWords = new Set(["a", "an", "and", "as", "at", "for", "from", "in", "of", "on", "or", "the", "to", "with"]);

function titleToSlug(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function smartTitleCase(input) {
  return String(input || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (lower === "erp") return "ERP";
      if (lower === "netsuite") return "NetSuite";
      if (lower === "uk") return "UK";
      if (lower === "it") return "IT";
      if (index > 0 && smallTitleWords.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function normaliseGeneratedTitle(rawTitle, rawQuery = rawTitle) {
  let title = String(rawTitle || rawQuery || "").trim();
  const lower = title.toLowerCase();

  title = title
    .replace(/:\s*how to choose and deliver$/i, "")
    .replace(/\bhow to choose and deliver\b/gi, "")
    .replace(/\bgreat britain\b/gi, "UK")
    .replace(/\bunited kingdom\b/gi, "UK")
    .replace(/\berp\b/gi, "ERP")
    .replace(/\bnetsuite\b/gi, "NetSuite")
    .replace(/\bit\b/gi, "IT")
    .replace(/\s+/g, " ")
    .trim();

  const whichMatch = lower.match(/^which\s+(.+?)\s+are\s+best\s+for\s+(.+?)(?:\s+in\s+great\s+britain|\s+in\s+the\s+uk|\s+in\s+uk)?$/i);
  if (whichMatch) {
    const subject = whichMatch[1];
    const audience = whichMatch[2];
    if (/erp consultants?/.test(subject) && /software|development|it/.test(audience)) {
      return "How UK Software Companies Should Choose an ERP Consultant";
    }
    return `How to Choose ${smartTitleCase(subject.replace(/s$/, ""))} for ${smartTitleCase(audience)}`;
  }

  if (/^erp consultants? uk$/i.test(title)) return "How to Choose an ERP Consultant in the UK";
  if (/^independent erp consultants?$/i.test(title)) return "How to Choose an Independent ERP Consultant";
  if (/^erp development company(?:: practical guide)?$/i.test(title)) return "How to Choose an ERP Development Company";
  if (/^erp software development company(?:: practical guide)?$/i.test(title)) return "What to Look For in an ERP Software Development Company";

  return smartTitleCase(title);
}

function titleQualityChecks(title, rawQuery = "") {
  const checks = [];
  const titleNorm = norm(title);
  const words = titleNorm.split(" ").filter(Boolean);
  const repeated = words.filter((word, index) => words.indexOf(word) !== index && word.length > 3);

  if (title.length > 75) checks.push("overly_long_title");
  if (new Set(repeated).size > 0) checks.push("possible_keyword_stuffing");
  if (/\bwhich\b.+\bare best for\b/i.test(title) || /how to choose and deliver/i.test(title)) checks.push("awkward_phrase");
  if (/\bErp\b|\bNetsuite\b/.test(title)) checks.push("title_case_mistake");
  if (/great britain/i.test(title) && !/great britain/i.test(rawQuery)) checks.push("unnecessary_great_britain");

  return checks;
}

function conversionIntentForText(input) {
  const text = norm(input);
  let score = 35;
  let recommendedCTA = "audit/readiness check";

  const add = (amount, cta = recommendedCTA) => {
    score = Math.max(score, amount);
    recommendedCTA = cta;
  };

  if (/failed implementation|rescue|recovery|implementation problem|poor implementation|implementation/i.test(text)) {
    add(92, "implementation consultation");
  }
  if (/aftercare|support|helpdesk|maintenance|ongoing support/i.test(text)) {
    add(88, "support review");
  }
  if (/erp consultant|erp partner|netsuite partner|consultant|partner/i.test(text)) {
    add(84, "audit/readiness check");
  }
  if (/manufacturing|manufacturer|factory|production|inventory|warehouse/i.test(text)) {
    add(82, "manufacturing ERP discussion");
  }
  if (/finance|accounting|accounts receivable|cash flow|cfo|financial/i.test(text)) {
    add(78, "finance systems review");
  }
  if (/migration|migrate|replace|upgrade|implementation/i.test(text)) {
    add(80, "implementation consultation");
  }
  if (/what is erp|what is an erp|benefits of erp|role of erp|understanding erp/i.test(text)) {
    score = Math.min(score, /netsuite|consultant|implementation|support|finance|manufacturing/.test(text) ? 55 : 35);
  }

  return {
    conversionIntentScore: Math.min(100, score),
    conversionIntentLabel: score >= 75 ? "high" : score >= 50 ? "medium" : "low",
    recommendedCTA,
  };
}

function demandScoreForText(text, demandGaps, topicBacklog) {
  const t = norm(text);
  if (!t) return 0;
  let score = 0;
  for (const g of demandGaps || []) {
    const q = norm(g.query);
    if (q && (t.includes(q) || q.includes(t) || t.includes(q.split(" ").slice(0, 3).join(" ")))) {
      score += Math.min(40, Math.round((g.impressions || 0) / 120));
      score += g.clicks === 0 ? 10 : 0;
    }
  }
  for (const b of topicBacklog || []) {
    const q = norm(b.query || b.suggestedTitle);
    if (q && (t.includes(q) || q.includes(t) || t.includes(q.split(" ").slice(0, 3).join(" ")))) {
      score += Math.min(50, b.score || 0);
      score += Math.min(20, Math.round((b.impressions || 0) / 150));
    }
  }
  return Math.min(100, score);
}

function buildFixCreateRecommendations({ qaReport, allItems, demandGaps, topicBacklog }) {
  if (!qaReport || !Array.isArray(qaReport.articles)) return [];

  const roadmapByTitle = new Map((allItems || []).map((i) => [norm(i.title), i]));
  const qaBySlug = new Map(qaReport.articles.map((a) => [a.slug, a]));
  const recs = [];

  for (const qa of qaReport.articles) {
    const roadmapItem = roadmapByTitle.get(norm(qa.title));
    const status = roadmapItem?.status || null;
    const blocked = qa.gate === "blocked";
    const demand = demandScoreForText(qa.title || qa.slug, demandGaps, topicBacklog);
    const topIssue = qa?.issues?.structural?.[0] || qa?.issues?.warnings?.[0] || "No issues recorded";

    if (blocked) {
      const intent = conversionIntentForText(`${qa.title} ${qa.slug}`);
      recs.push({
        type: "blocked_review",
        title: qa.title || qa.slug,
        slug: qa.slug,
        reason: `QA gate is blocked (${topIssue}).`,
        conversionIntentScore: intent.conversionIntentScore,
        conversionIntentLabel: intent.conversionIntentLabel,
        recommendedCTA: intent.recommendedCTA,
        priorityScore: Math.min(100, Math.round(45 + demand * 0.35 + intent.conversionIntentScore * 0.35)),
        sourceSignals: ["blocked_structural_issue", demand > 0 ? "search_demand" : "poor_qa_score"].filter(Boolean),
        suggestedNextAction: "Fix structural QA issues before any SEO update or promotion.",
      });
      continue;
    }

    if (qa.gate === "needs_review") {
      const intent = conversionIntentForText(`${qa.title} ${qa.slug}`);
      recs.push({
        type: "improve_existing",
        title: qa.title || qa.slug,
        slug: qa.slug,
        qa,
        reason: `Low QA score (${qa.score}) and/or quality warnings (${topIssue}).`,
        conversionIntentScore: intent.conversionIntentScore,
        conversionIntentLabel: intent.conversionIntentLabel,
        recommendedCTA: intent.recommendedCTA,
        priorityScore: Math.min(100, Math.round((100 - qa.score) * 0.4 + demand * 0.35 + intent.conversionIntentScore * 0.45 + (status === "in_progress" ? 8 : 0))),
        sourceSignals: ["poor_qa_score", demand > 0 ? "search_demand" : null].filter(Boolean),
        suggestedNextAction: status === "in_progress"
          ? "Complete current draft, then improve intro depth, CTA relevance, and flagged sections."
          : "Revise this existing article first, then re-run resource QA before new content creation.",
      });
      continue;
    }

    if (qa.gate === "pass" && demand > 45) {
      const intent = conversionIntentForText(`${qa.title} ${qa.slug}`);
      recs.push({
        type: "monitor",
        title: qa.title || qa.slug,
        slug: qa.slug,
        reason: "QA is strong, but demand signals are high enough to monitor ranking and CTR closely.",
        conversionIntentScore: intent.conversionIntentScore,
        conversionIntentLabel: intent.conversionIntentLabel,
        recommendedCTA: intent.recommendedCTA,
        priorityScore: Math.min(100, Math.round(demand * 0.55 + intent.conversionIntentScore * 0.45)),
        sourceSignals: ["search_demand"],
        suggestedNextAction: "Track performance weekly and only refresh if impressions rise without CTR improvement.",
      });
    }
  }

  for (const topic of (topicBacklog || []).slice(0, 12)) {
    const suggested = topic.suggestedTitle || topic.query;
    const suggestedSlug = titleToSlug(suggested);
    const exists = qaBySlug.has(suggestedSlug);
    if (exists) continue;
    const rawQuery = topic.query || suggested;
    const preferredTitle = normaliseGeneratedTitle(suggested, rawQuery);
    const intent = conversionIntentForText(`${preferredTitle} ${rawQuery}`);

    recs.push({
      type: "create_new",
      title: preferredTitle,
      preferredTitle,
      rawQuery,
      slug: null,
      reason: "Demand-led topic backlog indicates uncovered search intent.",
      conversionIntentScore: intent.conversionIntentScore,
      conversionIntentLabel: intent.conversionIntentLabel,
      recommendedCTA: intent.recommendedCTA,
      priorityScore: Math.min(100, Math.round((topic.score || 0) * 0.45 + Math.min(20, (topic.impressions || 0) / 160) + intent.conversionIntentScore * 0.45)),
      sourceSignals: ["search_demand", "content_gap"],
      suggestedNextAction: "Draft a new resource targeting the exact query intent, then add internal links and CTA.",
    });
  }

  const sorted = recs.sort((a, b) => b.priorityScore - a.priorityScore);
  return sorted.map((rec, idx) => {
    const rank = idx + 1;
    const articleTypeBucket = topicCategoryForBrief({
      preferredTitle: rec.preferredTitle || rec.title,
      targetTitle: rec.title,
      rawQuery: rec.rawQuery || "",
      recommendedCTA: rec.recommendedCTA || "",
    });
    const sprintCandidate = rank > 5 && rank <= 15 && rec.type !== "monitor";
    let sprintReason = "";
    if (sprintCandidate && rec.type === "improve_existing") sprintReason = "Needs QA improvement and is outside dashboard top 5.";
    else if (sprintCandidate && rec.type === "create_new") sprintReason = "Demand-led content gap suitable for sprint backlog planning.";
    else if (sprintCandidate && rec.type === "blocked_review") sprintReason = "Blocked issue that should be cleared before promotion work.";

    return {
      ...rec,
      displayRank: rank,
      sprintCandidate,
      sprintReason,
      articleTypeBucket,
    };
  });
}

function contentPriorityFromScore(score, fallback = "medium") {
  const value = Number(score || 0);
  if (value >= 85) return "critical";
  if (value >= 70) return "high";
  if (value >= 45) return "medium";
  return fallback || "low";
}

function contentCategoryLabel(value = "") {
  const label = formatStateLabel(value || "content");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function defaultContentStatus({ opportunity, recommendation, plan, inboxItem }) {
  if (inboxItem?.status === "awaiting_review") return "review";
  if (recommendation?.type === "blocked_review") return "review";
  if (recommendation?.type === "improve_existing") return "review";
  if (recommendation?.type === "monitor") return "monitoring";
  if (plan?.targetSlug && plan?.recommendedWorkflow?.nextCommand) return "review";
  if (plan && !plan.targetSlug) return "approved";
  if (opportunity?.targetSlug && opportunity?.actionTheme === "content_creation") return "published";
  if (opportunity?.targetSlug) return "review";
  if (recommendation?.type === "create_new") return "discovered";
  return "discovered";
}

function contentGoalForItem({ opportunity, recommendation, plan }) {
  if (recommendation?.type === "create_new" || opportunity?.actionTheme === "content_creation" || plan?.planType === "content_brief") {
    return "Create a focused resource brief before any drafting.";
  }
  if (opportunity?.actionTheme === "internal_linking") return "Improve internal paths around an existing article.";
  if (opportunity?.actionTheme === "conversion_path") return "Strengthen the article's next-step and CTA alignment.";
  if (opportunity?.actionTheme === "refresh") return "Refresh the existing article without broad rewrites.";
  if (opportunity?.targetSlug || recommendation?.type === "improve_existing") return "Improve an existing resource while preserving QA health.";
  return "Clarify the content opportunity and decide whether it should enter production.";
}

function buildContentWorkbenchItems({
  articleRows,
  recommendations,
  opportunityReport,
  plansReport,
  inboxReport,
  workflowState,
}) {
  const opportunities = Array.isArray(opportunityReport?.opportunities)
    ? opportunityReport.opportunities
    : Array.isArray(opportunityReport?.topOpportunities)
      ? opportunityReport.topOpportunities
      : [];
  const plans = Array.isArray(plansReport?.plans)
    ? plansReport.plans
    : Array.isArray(plansReport?.topPlans)
      ? plansReport.topPlans
      : [];
  const inboxItems = Array.isArray(inboxReport?.items) ? inboxReport.items : [];

  const planByOpportunityId = new Map();
  const planBySlug = new Map();
  const planByTitle = new Map();
  plans.forEach((plan) => {
    if (plan?.targetSlug) planBySlug.set(plan.targetSlug, plan);
    if (plan?.title) planByTitle.set(norm(plan.title), plan);
    (Array.isArray(plan?.sourceOpportunityIds) ? plan.sourceOpportunityIds : []).forEach((id) => {
      if (id) planByOpportunityId.set(id, plan);
    });
  });

  const inboxByOpportunityId = new Map();
  const inboxByPlanId = new Map();
  const inboxBySlug = new Map();
  inboxItems.forEach((item) => {
    if (item?.relatedOpportunityId) inboxByOpportunityId.set(item.relatedOpportunityId, item);
    if (item?.relatedPlanId) inboxByPlanId.set(item.relatedPlanId, item);
    if (item?.targetSlug) inboxBySlug.set(item.targetSlug, item);
  });

  const recBySlug = new Map();
  const recByTitle = new Map();
  recommendations.forEach((rec) => {
    if (rec?.slug) recBySlug.set(rec.slug, rec);
    if (rec?.title) recByTitle.set(norm(rec.title), rec);
  });

  const articleBySlug = new Map((articleRows || []).map((row) => [row.slug, row]));
  const items = [];
  const seen = new Set();

  const pushItem = ({ id, title, targetSlug, targetPath, opportunity, recommendation, plan, inboxItem, article }) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    const published = Boolean(targetSlug || targetPath || article?.slug);
    const priority = opportunity?.priorityLabel
      || plan?.executionPriority
      || contentPriorityFromScore(recommendation?.priorityScore || opportunity?.score || plan?.opportunityScore, "medium");
    const category = opportunity?.actionTheme || plan?.planType || recommendation?.type || "content_work";
    const nextAction = inboxItem?.recommendedNextStep
      || plan?.recommendedWorkflow?.nextCommand
      || opportunity?.recommendedAction
      || recommendation?.suggestedNextAction
      || "Review the content item and choose the next workflow stage.";

    items.push({
      id,
      title: title || targetSlug || "Untitled content item",
      priority,
      category,
      categoryLabel: contentCategoryLabel(category),
      defaultStatus: defaultContentStatus({ opportunity, recommendation, plan, inboxItem }),
      targetSlug: targetSlug || article?.slug || "",
      targetPath: targetPath || opportunity?.targetPath || plan?.targetPath || (targetSlug ? `/resources/${targetSlug}` : ""),
      targetTopic: opportunity?.canonicalOpportunityTitle || opportunity?.groupTitle || recommendation?.rawQuery || recommendation?.title || title || "",
      summary: opportunity?.whyThisRanks || recommendation?.reason || plan?.recommendedWorkflow?.notes || "Content work item from Sentinel reports.",
      nextAction,
      relatedOpportunityId: opportunity?.id || inboxItem?.relatedOpportunityId || "",
      relatedPlanId: plan?.id || inboxItem?.relatedPlanId || "",
      relatedInboxId: inboxItem?.id || "",
      sourceSignals: opportunity?.combinedSignals || opportunity?.sourceSignals || recommendation?.sourceSignals || [],
      score: opportunity?.score || recommendation?.priorityScore || plan?.opportunityScore || article?.score || 0,
      effort: opportunity?.effortLabel || plan?.estimatedEffort || "unknown",
      confidence: opportunity?.confidenceLabel || plan?.confidence || "unknown",
      contentGoal: contentGoalForItem({ opportunity, recommendation, plan }),
      suggestedAngle: opportunity?.recommendedAction || recommendation?.suggestedNextAction || plan?.recommendedWorkflow?.notes || "",
      briefCommand: plan?.id ? `npm run seo:plan:run -- ${plan.id}` : opportunity?.nextCommandOrPrompt || "",
      briefPrompt: opportunity?.codexPrompt || plan?.codexPlanningPrompt || recommendation?.brief?.codexPatchPrompt || "",
      owner: "",
      published,
      workflowState: workflowState || "unknown",
      articleGate: article?.gate || "",
      articleScore: article?.score ?? null,
    });
  };

  opportunities.slice(0, 16).forEach((opportunity) => {
    const targetSlug = opportunity?.targetSlug || "";
    const plan = planByOpportunityId.get(opportunity?.id) || (targetSlug ? planBySlug.get(targetSlug) : null) || planByTitle.get(norm(opportunity?.title));
    const inboxItem = inboxByOpportunityId.get(opportunity?.id) || (plan?.id ? inboxByPlanId.get(plan.id) : null) || (targetSlug ? inboxBySlug.get(targetSlug) : null);
    const recommendation = (targetSlug ? recBySlug.get(targetSlug) : null) || recByTitle.get(norm(opportunity?.title));
    pushItem({
      id: targetSlug ? `content-${targetSlug}` : `content-${opportunity?.id || titleToSlug(opportunity?.title)}`,
      title: opportunity?.title,
      targetSlug,
      targetPath: opportunity?.targetPath,
      opportunity,
      recommendation,
      plan,
      inboxItem,
      article: targetSlug ? articleBySlug.get(targetSlug) : null,
    });
  });

  recommendations.slice(0, 12).forEach((recommendation) => {
    const targetSlug = recommendation?.slug || "";
    const id = targetSlug ? `content-${targetSlug}` : `content-rec-${titleToSlug(recommendation?.title)}`;
    if (seen.has(id)) return;
    const plan = (targetSlug ? planBySlug.get(targetSlug) : null) || planByTitle.get(norm(recommendation?.title));
    const inboxItem = (plan?.id ? inboxByPlanId.get(plan.id) : null) || (targetSlug ? inboxBySlug.get(targetSlug) : null);
    pushItem({
      id,
      title: recommendation?.preferredTitle || recommendation?.title,
      targetSlug,
      targetPath: targetSlug ? `/resources/${targetSlug}` : "",
      recommendation,
      plan,
      inboxItem,
      article: targetSlug ? articleBySlug.get(targetSlug) : null,
    });
  });

  if (!items.length) {
    (articleRows || []).slice(0, 12).forEach((article) => {
      pushItem({
        id: `content-${article.slug}`,
        title: article.title,
        targetSlug: article.slug,
        targetPath: `/resources/${article.slug}`,
        article,
        recommendation: article.rec,
        plan: null,
        inboxItem: null,
      });
    });
  }

  return items.sort((a, b) => {
    const priorityDelta = (CONTENT_PRIORITY_ORDER[a.priority] ?? 5) - (CONTENT_PRIORITY_ORDER[b.priority] ?? 5);
    if (priorityDelta !== 0) return priorityDelta;
    return Number(b.score || 0) - Number(a.score || 0);
  });
}

function suggestedLinksForRecommendation(rec) {
  const text = norm(`${rec.title} ${rec.reason}`);
  const links = ["/resources"];

  if (text.includes("implementation") || text.includes("project")) links.push("/implementation");
  if (text.includes("support") || text.includes("aftercare") || text.includes("poor")) links.push("/support");
  if (text.includes("partner") || text.includes("consultant")) links.push("/partners");
  if (text.includes("manufactur") || text.includes("case")) links.push("/case-studies");
  if (text.includes("netsuite") || text.includes("erp")) links.push("/services/netsuite");
  links.push("/contact");

  return [...new Set(links)].slice(0, 4);
}

function ctaAngleForRecommendation(rec) {
  if (rec.recommendedCTA) return rec.recommendedCTA;
  if (rec.type === "create_new") return "Offer a practical consultation or readiness check tied to the search intent.";
  if (rec.type === "blocked_review") return "Avoid lead-generation emphasis until structural QA issues are fixed.";
  if (norm(rec.title).includes("support") || norm(rec.title).includes("aftercare")) return "Position ERP Experts as the support partner for resolving ongoing NetSuite friction.";
  if (norm(rec.title).includes("implementation") || norm(rec.title).includes("poor")) return "Invite readers to discuss implementation recovery or risk reduction.";
  return "Use a soft consultation CTA that connects the article topic to NetSuite advisory help.";
}

function metaDescriptionForTitle(title, cta) {
  const base = `Practical guidance for ${title.toLowerCase()} from ERP Experts.`;
  const suffix = cta === "support review"
    ? " Understand the support issues to fix before they slow the business down."
    : cta === "implementation consultation"
    ? " Learn what to check before your next ERP decision or recovery project."
    : cta === "manufacturing ERP discussion"
    ? " See what manufacturers should review before choosing or improving ERP."
    : cta === "finance systems review"
    ? " Review the finance system signals that affect control, reporting, and scale."
    : " Use it to plan a clearer next step before committing budget.";
  return `${base}${suffix}`.slice(0, 155);
}

function channelTopicForTitle(title) {
  const lower = title.toLowerCase();
  if (/software companies.*erp consultant|erp consultant.*software companies/i.test(title)) {
    return "choosing an ERP consultant for a UK software company";
  }
  if (/choose an erp consultant|independent erp consultant|erp consultants uk/i.test(lower)) {
    return "choosing an ERP consultant";
  }
  if (/poor netsuite implementation|failed implementation/i.test(lower)) {
    return "spotting and recovering a poor NetSuite implementation";
  }
  if (/erp development company/i.test(lower)) {
    return "choosing an ERP development company";
  }
  return lower;
}

function buildChannelOutputs(brief) {
  const title = brief.preferredTitle || brief.targetTitle;
  const cta = brief.recommendedCTA;
  const highIntent = brief.conversionIntentLabel === "high";
  const topic = channelTopicForTitle(title);
  const ctaArticle = /^[aeiou]/i.test(cta) ? "an" : "a";

  return {
    linkedInPostAngle: highIntent
      ? `Frame ${title} around a board-level decision: where poor ERP choices create cost, delay, or operational drag.`
      : `Use ${title} to clarify a common ERP question and point readers towards a practical next step.`,
    emailNurtureAngle: cta === "support review"
      ? "Send to existing NetSuite users showing symptoms of recurring support issues, with a prompt to review unresolved friction."
      : cta === "implementation consultation"
      ? "Send to prospects evaluating ERP change, focused on avoiding implementation risk before scope is locked."
      : cta === "manufacturing ERP discussion"
      ? "Send to manufacturing contacts with inventory, production, or reporting pain, positioned as a decision checklist."
      : cta === "finance systems review"
      ? "Send to finance leaders who are outgrowing accounting tools or struggling with reporting control."
      : "Send as an educational follow-up for early-stage ERP conversations that need a clearer evaluation path.",
    salesFollowUpAngle: `Use after discovery calls where the prospect mentions ${brief.primaryIssue.toLowerCase()}; offer ${ctaArticle} ${cta}.`,
    suggestedFaqQuestions: [
      `When should a business review ${topic}?`,
      `What are the warning signs that ${topic} needs specialist advice?`,
      `How can ERP Experts help with ${topic}?`,
    ],
    suggestedMetaTitle: `${title} | ERP Experts`,
    suggestedMetaDescription: metaDescriptionForTitle(topic, cta),
  };
}

function hasIssue(qa, pattern) {
  return [...(qa?.issues?.structural || []), ...(qa?.issues?.warnings || [])].some((issue) => pattern.test(issue));
}

function buildImplementationPlan(rec, brief) {
  if (rec.type !== "improve_existing") return null;

  const qa = rec.qa || {};
  const metrics = qa.metrics || {};
  const scores = qa.categoryScores || {};
  const cta = brief.recommendedCTA;
  const ctaArticle = /^[aeiou]/i.test(cta) ? "an" : "a";
  const sectionsToImprove = [];
  const missingElements = [];
  const suggestedNewSectionHeadings = [];
  const riskNotes = [];

  if (metrics.introWords < 60 || hasIssue(qa, /intro/i)) {
    sectionsToImprove.push("Opening section: expand the problem statement and make the reader's risk clear within the first 60-90 words.");
  }

  if (metrics.thinTipsCount > 0 || metrics.bodyDepthWords < 450 || scores.contentDepth < 70) {
    sectionsToImprove.push(`Main body: expand thin sections with concrete examples, decision criteria, or recovery steps. Current thin section count: ${metrics.thinTipsCount || 0}.`);
  }

  if (hasIssue(qa, /conclusion/i)) {
    sectionsToImprove.push("Conclusion: add a practical summary that tells the reader what to check next.");
    missingElements.push("Clear conclusion that reinforces the commercial next step.");
  }

  if (hasIssue(qa, /disclaimer/i)) {
    missingElements.push("Short disclaimer where the topic could be read as financial, operational, or implementation advice.");
  }

  if (!metrics.hasServiceRelevantCTA || scores.ctaServiceRelevance < 70) {
    sectionsToImprove.push(`CTA area: replace the weak or missing CTA with a specific ${cta}.`);
    missingElements.push(`Service-relevant CTA linked to ${cta}.`);
  }

  if (!metrics.internalPathCTA || scores.internalLinkReadiness < 70) {
    missingElements.push("Internal links from the article to relevant service or contact pages.");
  }

  if (!metrics.hasPublishedAt || scores.freshnessPublishedAtValidity < 70) {
    missingElements.push("Valid publishedAt value so freshness checks and reporting stay reliable.");
  }

  if (cta === "implementation consultation") {
    suggestedNewSectionHeadings.push("Implementation risks to check before the project continues");
    suggestedNewSectionHeadings.push("What to do if the warning signs are already visible");
  } else if (cta === "support review") {
    suggestedNewSectionHeadings.push("Support issues that should not become business as usual");
    suggestedNewSectionHeadings.push("When to bring in a NetSuite support partner");
  } else if (cta === "manufacturing ERP discussion") {
    suggestedNewSectionHeadings.push("Manufacturing signals that the ERP setup needs review");
    suggestedNewSectionHeadings.push("Questions to ask before changing systems or processes");
  } else if (cta === "finance systems review") {
    suggestedNewSectionHeadings.push("Finance control issues to check first");
    suggestedNewSectionHeadings.push("Reporting questions to resolve before the next close");
  } else {
    suggestedNewSectionHeadings.push("Decision criteria to use before choosing the next step");
    suggestedNewSectionHeadings.push("When to ask an ERP specialist for a second view");
  }

  if (rec.sourceSignals.includes("search_demand")) {
    riskNotes.push("Search demand is present, so avoid changing the URL or diluting the core topic while improving quality.");
  }
  if (metrics.nearDuplicateMatches > 0 || scores.duplicateCannibalisationRisk < 80) {
    riskNotes.push("Check neighbouring resources before editing so the article does not overlap with similar ERP topics.");
  }
  if (brief.conversionIntentLabel === "high") {
    riskNotes.push("High commercial intent: keep advice useful, but make the service next step visible and specific.");
  }

  return {
    sectionsToImprove: sectionsToImprove.length ? sectionsToImprove : ["Review the main body for article-specific examples and decision criteria tied to the title."],
    missingElements: missingElements.length ? missingElements : ["No major missing elements from QA, but the article still needs quality improvement before promotion."],
    suggestedNewSectionHeadings,
    strongerCTARecommendation: `Add a concise CTA offering ${ctaArticle} ${cta}, linked from the conclusion and any relevant decision section.`,
    internalLinksToAdd: brief.suggestedInternalLinks.filter((link) => link !== "/resources"),
    riskNotes: riskNotes.length ? riskNotes : ["Keep the current route, slug, and article intent stable; only improve depth, clarity, links, and CTA relevance."],
    reviewQuestions: [
      `Does the revised article answer the problem promised by "${brief.preferredTitle}" without drifting into a new topic?`,
      "Can a reader see the next commercial step without feeling pushed into a generic sales message?",
      "Do the added sections reduce the QA warnings that triggered this brief?",
      "Do internal links point to genuinely relevant ERP Experts service pages?",
    ],
  };
}

function listForPrompt(items) {
  return (items || []).map((item) => `- ${item}`).join("\n");
}

function buildCodexPatchPrompt(brief) {
  if (brief.recommendationType !== "improve_existing" || !brief.implementationPlan) return null;

  const plan = brief.implementationPlan;

  return `Improve one existing ERP Experts resource article safely.

Target article:
- Slug: ${brief.targetSlug}
- Title: ${brief.preferredTitle || brief.targetTitle}
- File: src/data/articles.js

Implementation plan:

Sections to improve:
${listForPrompt(plan.sectionsToImprove)}

Missing elements to add or strengthen:
${listForPrompt(plan.missingElements)}

Suggested new section headings:
${listForPrompt(plan.suggestedNewSectionHeadings)}

CTA angle:
- ${brief.recommendedCTA}
- ${plan.strongerCTARecommendation}

Internal links to add where relevant:
${listForPrompt(plan.internalLinksToAdd)}

Risk notes:
${listForPrompt(plan.riskNotes)}

Review questions:
${listForPrompt(plan.reviewQuestions)}

Constraints:
- Only edit the target article object with slug "${brief.targetSlug}" in src/data/articles.js.
- Preserve the existing article data shape.
- Do not redesign components.
- Do not change routes.
- Do not invent fake customer stories, named customers, statistics, certifications, or unsupported claims.
- Use UK English.
- Keep the article commercially useful but factual and reviewable.
- Avoid reusing the same CTA wording used in other recent article updates; keep the CTA specific to this article's topic.
- Vary the conclusion structure rather than repeating a fixed template.
- Avoid repeating stock phrases such as "clear ownership", "practical next step", or "commercially meaningful".
- Do not auto-publish anything.
- After editing, run npm run lint, npm run build, npm run qa:resources, and npm run seo:briefs.`;
}

function topicCategoryForBrief(brief) {
  const text = norm(`${brief.preferredTitle} ${brief.targetTitle} ${brief.rawQuery || ""} ${brief.recommendedCTA}`);
  if (/failed implementation|poor netsuite implementation|implementation|migration|rescue|recovery/.test(text)) return "implementation";
  if (/support|aftercare|helpdesk|maintenance/.test(text)) return "support";
  if (/manufactur|factory|production|inventory|warehouse/.test(text)) return "manufacturing";
  if (/finance|accounting|accounts receivable|cfo|reporting|financial/.test(text)) return "finance_accounting";
  if (/erp consultant|consultant|partner/.test(text)) return "consulting_partner";
  if (/what is erp|benefits of erp|role of erp|understanding erp|beginner/.test(text)) return "generic_informational";
  return "general_erp";
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildOutcomeScoring(brief) {
  const category = topicCategoryForBrief(brief);
  const text = norm(`${brief.preferredTitle} ${brief.targetTitle} ${brief.rawQuery || ""}`);
  const serviceRelevant = /netsuite|implementation|support|consultant|partner|manufactur|finance|accounting|migration|rescue|aftercare|erp/.test(text);
  const genericInfo = category === "generic_informational";

  const categoryWeight = {
    implementation: 24,
    support: 22,
    manufacturing: 20,
    finance_accounting: 18,
    consulting_partner: 21,
    general_erp: 10,
    generic_informational: -12,
  }[category];

  const ctaWeight = {
    "implementation consultation": 18,
    "support review": 17,
    "manufacturing ERP discussion": 16,
    "finance systems review": 15,
    "audit/readiness check": 14,
  }[brief.recommendedCTA] || 8;

  const estimatedBusinessValue = clampScore(brief.conversionIntentScore * 0.45 + brief.priorityScore * 0.25 + categoryWeight + ctaWeight + (serviceRelevant ? 8 : 0) - (genericInfo ? 14 : 0));
  const estimatedLeadIntent = clampScore(brief.conversionIntentScore * 0.7 + ctaWeight + (serviceRelevant ? 6 : 0) - (genericInfo ? 22 : 0));
  const assistedConversionPotential = clampScore(brief.priorityScore * 0.35 + brief.conversionIntentScore * 0.35 + categoryWeight + (brief.suggestedInternalLinks.length * 3) - (genericInfo ? 10 : 0));
  const strategicImportance = clampScore(brief.priorityScore * 0.3 + categoryWeight + (brief.sourceSignals?.includes("content_gap") ? 14 : 0) + (brief.sourceSignals?.includes("search_demand") ? 10 : 0) + (serviceRelevant ? 8 : 0));
  const confidenceLevel = clampScore(55 + (brief.sourceSignals?.length || 0) * 8 + (brief.conversionIntentLabel === "high" ? 12 : 0) + (brief.recommendationType === "improve_existing" ? 6 : 0) - (genericInfo ? 12 : 0));

  const average = (estimatedBusinessValue + estimatedLeadIntent + assistedConversionPotential + strategicImportance) / 4;
  const outcomeLabel = genericInfo && average < 65
    ? "awareness_only"
    : average >= 72 && confidenceLevel >= 65
    ? "high_value"
    : average >= 48
    ? "medium_value"
    : "awareness_only";

  const whyThisMattersCommercially = outcomeLabel === "high_value"
    ? `${brief.preferredTitle} is likely to support commercially meaningful conversations because it combines ${brief.conversionIntentLabel} conversion intent with ${category.replace("_", "/")} service relevance.`
    : outcomeLabel === "medium_value"
    ? `${brief.preferredTitle} has useful commercial potential, but should be treated as nurture or assisted-conversion content until real lead outcomes are recorded.`
    : `${brief.preferredTitle} is mainly awareness content for now; keep the CTA light and use outcome data before giving it more commercial priority.`;

  return {
    estimatedBusinessValue,
    estimatedLeadIntent,
    assistedConversionPotential,
    strategicImportance,
    confidenceLevel,
    outcomeLabel,
    whyThisMattersCommercially,
    leadsGenerated: null,
    assistedConversions: null,
    rankingMovement: null,
    manualOutcomeNotes: "",
  };
}

function buildActionBriefs(recommendations) {
  return recommendations.map((rec) => {
    const primaryIssue = rec.sourceSignals.includes("blocked_structural_issue")
      ? "Blocked structural QA issue"
      : rec.sourceSignals.includes("poor_qa_score")
      ? "Weak QA score or content quality warning"
      : rec.sourceSignals.includes("content_gap")
      ? "Uncovered search intent"
      : "Search demand needs monitoring";

    const suggestedContentChanges = rec.type === "create_new"
      ? [
        "Draft a focused resource around the exact search intent.",
        "Add a clear intro, practical sections, conclusion, disclaimer, and metadata.",
        "Include examples that connect the topic back to NetSuite decision-making.",
      ]
      : [
        "Strengthen the intro so the target problem is clear within the first 60 words.",
        "Expand thin sections with practical detail, examples, or decision criteria.",
        "Tighten the conclusion and make the next step explicit.",
      ];

    const brief = {
      recommendationType: rec.type,
      targetTitle: rec.title,
      preferredTitle: rec.preferredTitle || rec.title,
      rawQuery: rec.rawQuery || null,
      targetSlug: rec.slug,
      displayRank: rec.displayRank || null,
      sprintCandidate: Boolean(rec.sprintCandidate),
      sprintReason: rec.sprintReason || "",
      articleTypeBucket: rec.articleTypeBucket || "commercial",
      priorityScore: rec.priorityScore,
      conversionIntentScore: rec.conversionIntentScore,
      conversionIntentLabel: rec.conversionIntentLabel,
      whyThisMatters: rec.reason,
      primaryIssue,
      suggestedContentChanges,
      suggestedInternalLinks: suggestedLinksForRecommendation(rec),
      suggestedCtaAngle: ctaAngleForRecommendation(rec),
      recommendedCTA: rec.recommendedCTA || ctaAngleForRecommendation(rec),
      reviewChecklist: [
        "Metadata is complete and matches the search intent.",
        "Intro, section depth, conclusion, and disclaimer pass Resource QA.",
        "Internal links support the commercial next step.",
        "CTA is relevant to the reader's likely problem.",
        "Run npm run qa:resources after changes.",
      ],
      sourceSignals: rec.sourceSignals,
      titleQualityChecks: titleQualityChecks(rec.preferredTitle || rec.title, rec.rawQuery || rec.title),
    };
    const briefWithPlans = {
      ...brief,
      ...buildOutcomeScoring(brief),
      channelOutputs: buildChannelOutputs(brief),
      implementationPlan: buildImplementationPlan(rec, brief),
    };
    return {
      ...briefWithPlans,
      codexPatchPrompt: buildCodexPatchPrompt(briefWithPlans),
    };
  });
}
// Canonical source of truth:
// 1) /api/seo-statuses.php (read/write, server-backed)
// 2) /api/seo-statuses.json (read-only fallback when PHP is unavailable)
const API_URL = "/api/seo-statuses.php";
const FALLBACK_URL = "/api/seo-statuses.json";

async function loadStatuses() {
  try {
    const res = await fetch(API_URL);
    if (res.ok) return { statuses: await res.json(), source: "php" };
  } catch {
    // Fall through to JSON fallback.
  }

  try {
    const fallback = await fetch(FALLBACK_URL);
    if (fallback.ok) return { statuses: await fallback.json(), source: "json-fallback" };
  } catch {
    // Ignore and return empty below.
  }

  return { statuses: {}, source: "unavailable" };
}

async function saveStatuses(map) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statuses: map }),
    });
    return res.ok;
  } catch { /* silent fail */ }
  return false;
}

/* ── password gate ── */

/* ── main component ── */
export default function SeoRoadmap({ standaloneMode = false }) {
  useEffect(() => {
    document.title = standaloneMode
      ? "Sentinel Operator Workbench - Artifexa"
      : "Sentinel SEO Overview - ERP Experts (Internal)";
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
    return () => (meta.content = "index, follow");
  }, [standaloneMode]);

  return <RoadmapContent canEdit={EDITS_ENABLED} standaloneMode={standaloneMode} />;
}

function useRoadmapState() {
  const roadmapPhases = getRoadmapPhases();
  const [statusMap, setStatusMap] = useState(() => {
    const map = {};
    for (const phase of roadmapPhases) {
      for (const item of phase.items) {
        map[item.priority] = item.status;
      }
    }
    return map;
  });
  const [loaded, setLoaded] = useState(false);
  const [statusSource, setStatusSource] = useState("loading");
  const [saveBlocked, setSaveBlocked] = useState(false);

  useEffect(() => {
    loadStatuses().then(({ statuses, source }) => {
      setStatusMap((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(statuses)) {
          next[key] = statuses[key];
        }
        return next;
      });
      setStatusSource(source);
      setLoaded(true);
    });
  }, []);

  const updateStatus = (priority, newStatus) => {
    setStatusMap((prev) => {
      const next = { ...prev, [priority]: newStatus };
      saveStatuses(next).then((ok) => {
        if (!ok) setSaveBlocked(true);
      });
      return next;
    });
  };

  const phases = roadmapPhases.map((phase) => ({
    ...phase,
    items: phase.items.map((item) => ({
      ...item,
      status: statusMap[item.priority] || item.status,
    })),
  }));

  const allItems = phases.flatMap((p) => p.items);
  const doneItems = allItems.filter((item) => item.status === "done");
  const openItems = allItems.filter((item) => item.status !== "done");
  const openPhases = phases
    .map((phase) => ({
      ...phase,
      totalItems: phase.items.length,
      doneItems: phase.items.filter((item) => item.status === "done").length,
      items: phase.items.filter((item) => item.status !== "done"),
    }))
    .filter((phase) => phase.items.length > 0);

  return { phases: openPhases, allItems, openItems, doneItems, updateStatus, loaded, statusSource, saveBlocked };
}

function RoadmapContent({ canEdit, standaloneMode = false }) {
  const isAdmin = canEdit;
  const [previewing, setPreviewing] = useState(false);

  if (isAdmin && !previewing) {
    return <AdminView onPreview={() => setPreviewing(true)} standaloneMode={standaloneMode} />;
  }

  return <ViewerView showBackToAdmin={isAdmin && previewing} onBackToAdmin={() => setPreviewing(false)} />;
}

/* ════════════════════════════════════════════════════════════
   ADMIN VIEW — simple checklist, focused on action
   ════════════════════════════════════════════════════════════ */

function AdminView({ onPreview, standaloneMode = false }) {
  const { allItems, loaded, statusSource, saveBlocked } = useRoadmapState();
  const [qaReport, setQaReport] = useState(null);
  const [qaLoading, setQaLoading] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [pipelineSummary, setPipelineSummary] = useState(null);
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const [briefsReport, setBriefsReport] = useState(null);
  const [briefsLoading, setBriefsLoading] = useState(true);
  const [growthReport, setGrowthReport] = useState(null);
  const [growthLoading, setGrowthLoading] = useState(true);
  const [linksReport, setLinksReport] = useState(null);
  const [linksLoading, setLinksLoading] = useState(true);
  const [freshnessReport, setFreshnessReport] = useState(null);
  const [freshnessLoading, setFreshnessLoading] = useState(true);
  const [conversionReport, setConversionReport] = useState(null);
  const [conversionLoading, setConversionLoading] = useState(true);
  const [opportunityReport, setOpportunityReport] = useState(null);
  const [opportunityLoading, setOpportunityLoading] = useState(true);
  const [plansReport, setPlansReport] = useState(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const [planApprovalsReport, setPlanApprovalsReport] = useState(null);
  const [planApprovalsLoading, setPlanApprovalsLoading] = useState(true);
  const [planStatusReport, setPlanStatusReport] = useState(null);
  const [planStatusLoading, setPlanStatusLoading] = useState(true);
  const [weeklyDigestText, setWeeklyDigestText] = useState("");
  const [weeklyDigestLoading, setWeeklyDigestLoading] = useState(true);
  const [actionInboxReport, setActionInboxReport] = useState(null);
  const [actionInboxLoading, setActionInboxLoading] = useState(true);
  const [autopilotReport, setAutopilotReport] = useState(null);
  const [autopilotLoading, setAutopilotLoading] = useState(true);
  const [decisionReport, setDecisionReport] = useState(null);
  const [decisionLoading, setDecisionLoading] = useState(true);
  const [articleFilter, setArticleFilter] = useState("needs_review");
  const [sortBy, setSortBy] = useState("score");
  const [selectedSlug, setSelectedSlug] = useState("");
  const [plannerToggles, setPlannerToggles] = useState({
    intro: true,
    thinSections: true,
    serviceCta: true,
    conclusion: true,
    internalLinks: true,
    repetitionRisk: true,
    publishedAt: true,
  });
  const [copyState, setCopyState] = useState("idle");
  const [dashboardLoadedAt] = useState(() => new Date());
  const operatorSessionInitialRef = useRef(null);
  if (!operatorSessionInitialRef.current) {
    operatorSessionInitialRef.current = {
      state: readOperatorSessionState(standaloneMode),
      exists: hasStoredOperatorSessionState(standaloneMode),
    };
  }
  const operatorWorkspacesInitialRef = useRef(null);
  if (!operatorWorkspacesInitialRef.current) {
    operatorWorkspacesInitialRef.current = readOperatorWorkspaces();
  }
  const initialOperatorSession = operatorSessionInitialRef.current.state;
  const initialOperatorWorkspaces = operatorWorkspacesInitialRef.current;
  const [activeNav, setActiveNav] = useState(() => initialOperatorSession.activeSection || "overview");
  const [commandQuery, setCommandQuery] = useState(() => initialOperatorSession.commandQuery || "");
  const [commandCategory, setCommandCategory] = useState(() => initialOperatorSession.commandCategory || "All");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => Boolean(initialOperatorSession.sidebarCollapsed));
  const [compactView, setCompactView] = useState(() => Boolean(initialOperatorSession.compactView));
  const [helpOpen, setHelpOpen] = useState(() => initialOperatorSession.helpOpen !== false);
  const [firstRunHintDismissed, setFirstRunHintDismissed] = useState(() => Boolean(initialOperatorSession.firstRunHintDismissed));
  const [isFirstRunSession, setIsFirstRunSession] = useState(() => !operatorSessionInitialRef.current.exists);
  const [supportingIntelligenceOpen, setSupportingIntelligenceOpen] = useState(() => Boolean(initialOperatorSession.panels?.supportingIntelligence));
  const [articleWorkbenchOpen, setArticleWorkbenchOpen] = useState(() => Boolean(initialOperatorSession.panels?.articleWorkbench));
  const [advancedDiagnosticsOpen, setAdvancedDiagnosticsOpen] = useState(() => Boolean(initialOperatorSession.panels?.advancedDiagnostics));
  const [sessionResetNotice, setSessionResetNotice] = useState("");
  const [operatorWorkspaces, setOperatorWorkspaces] = useState(() => initialOperatorWorkspaces);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    const preferredWorkspaceId = initialOperatorSession.activeWorkspaceId || SENTINEL_DEFAULT_WORKSPACE_ID;
    return initialOperatorWorkspaces.some((workspace) => workspace.id === preferredWorkspaceId)
      ? preferredWorkspaceId
      : SENTINEL_DEFAULT_WORKSPACE_ID;
  });
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [workspaceNotice, setWorkspaceNotice] = useState("");
  const [sentinelStateSnapshot, setSentinelStateSnapshot] = useState(getInitialSentinelState);
  const [tenantRegistrySnapshot, setTenantRegistrySnapshot] = useState(getInitialTenantRegistry);
  const [cadenceSummary, setCadenceSummary] = useState(readCadenceSummary);
  const [actionHistorySnapshot, setActionHistorySnapshot] = useState({
    actions: [],
    loading: true,
    status: "loading",
  });
  const [pipelineSnapshot, setPipelineSnapshot] = useState({
    pipelines: [],
    history: [],
    loading: true,
    status: "loading",
  });
  const [authoritySnapshot, setAuthoritySnapshot] = useState(initialAuthoritySnapshot);
  const [activityFeedSnapshot, setActivityFeedSnapshot] = useState({
    activities: [],
    loading: true,
    status: "loading",
  });
  const [feedbackSnapshot, setFeedbackSnapshot] = useState({
    items: [],
    loading: true,
    status: "loading",
  });
  const [contentWorkbenchState, setContentWorkbenchState] = useState(readContentWorkbenchState);
  const [doctorSummary] = useState(readDoctorSummary);
  const [readinessSummary] = useState(readReadinessSummary);
  const [roadmapSummary] = useState(readRoadmapSummary);
  const [roadmapApprovals] = useState(readRoadmapApprovals);
  const [implementationBrief] = useState(readImplementationBrief);
  const [workPackage] = useState(readWorkPackage);
  const [workPackageReview] = useState(readWorkPackageReview);
  const [implementationStatuses] = useState(readImplementationStatuses);
  const overviewRef = useRef(null);
  const stateRef = useRef(null);
  const inboxRef = useRef(null);
  const contentWorkbenchRef = useRef(null);
  const opportunitiesRef = useRef(null);
  const actionsRef = useRef(null);
  const cadenceRef = useRef(null);
  const tenantsRef = useRef(null);
  const diagnosticsRef = useRef(null);

  useEffect(() => {
    writeOperatorSessionState({
      activeWorkspaceId,
      activeSection: activeNav,
      commandQuery,
      commandCategory,
      sidebarCollapsed,
      compactView,
      helpOpen,
      firstRunHintDismissed,
      panels: {
        supportingIntelligence: supportingIntelligenceOpen,
        articleWorkbench: articleWorkbenchOpen,
        advancedDiagnostics: advancedDiagnosticsOpen,
      },
    }, standaloneMode);
  }, [
    activeWorkspaceId,
    activeNav,
    commandQuery,
    commandCategory,
    sidebarCollapsed,
    compactView,
    helpOpen,
    firstRunHintDismissed,
    supportingIntelligenceOpen,
    articleWorkbenchOpen,
    advancedDiagnosticsOpen,
    standaloneMode,
  ]);

  const loadActionHistory = async () => {
    setActionHistorySnapshot((current) => ({
      ...current,
      loading: true,
    }));

    try {
      const res = await fetch(`${sentinelActionApiBaseUrl}/actions/history?limit=10`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Sentinel action history returned ${res.status}`);
      const data = await res.json();
      setActionHistorySnapshot({
        actions: Array.isArray(data?.actions) ? data.actions : [],
        loading: false,
        status: "ready",
      });
    } catch {
      setActionHistorySnapshot({
        actions: [],
        loading: false,
        status: "unavailable",
      });
    }
  };

  const loadPipelines = async () => {
    setPipelineSnapshot((current) => ({
      ...current,
      loading: true,
    }));

    try {
      const res = await fetch(`${sentinelActionApiBaseUrl}/pipelines?limit=10`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Sentinel pipelines returned ${res.status}`);
      const data = await res.json();
      setPipelineSnapshot({
        pipelines: Array.isArray(data?.pipelines) ? data.pipelines : [],
        history: Array.isArray(data?.history) ? data.history : [],
        loading: false,
        status: "ready",
      });
    } catch {
      setPipelineSnapshot({
        pipelines: [],
        history: [],
        loading: false,
        status: "unavailable",
      });
    }
  };

  const loadAuthorityStatus = async () => {
    try {
      const res = await fetch(`${sentinelActionApiBaseUrl}/authority/status`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Sentinel authority returned ${res.status}`);
      const data = await res.json();
      setAuthoritySnapshot({
        mode: data?.mode || "disabled",
        authorityName: data?.authorityName || "Matthew-controlled Sentinel API",
        localBypass: Boolean(data?.localBypass),
        authorityVerified: Boolean(data?.authorityVerified),
        state: data?.state || (data?.mode === "enabled" ? "authority_required" : "local_bypass"),
        protectedEndpoints: Array.isArray(data?.protectedEndpoints) ? data.protectedEndpoints : [],
        source: "api",
      });
    } catch {
      setAuthoritySnapshot({
        ...initialAuthoritySnapshot(),
        source: sentinelAuthorityMode === "enabled" ? "unavailable" : "frontend_config",
        state: sentinelAuthorityMode === "enabled" ? "authority_failed" : "local_bypass",
      });
    }
  };

  const loadActivityFeed = async () => {
    setActivityFeedSnapshot((current) => ({
      ...current,
      loading: true,
    }));

    try {
      const res = await fetch(`${sentinelActionApiBaseUrl}/activity?limit=20`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Sentinel activity feed returned ${res.status}`);
      const data = await res.json();
      setActivityFeedSnapshot({
        activities: Array.isArray(data?.activities) ? data.activities : [],
        loading: false,
        status: "ready",
      });
    } catch {
      setActivityFeedSnapshot({
        activities: [],
        loading: false,
        status: "unavailable",
      });
    }
  };

  const loadOperatorFeedback = async () => {
    setFeedbackSnapshot((current) => ({
      ...current,
      loading: true,
    }));

    try {
      const res = await fetch(`${sentinelActionApiBaseUrl}/feedback?limit=8`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Sentinel feedback returned ${res.status}`);
      const data = await res.json();
      setFeedbackSnapshot({
        items: Array.isArray(data?.items) ? data.items : [],
        options: data?.options || sentinelFeedbackOptions,
        loading: false,
        status: "ready",
      });
    } catch {
      setFeedbackSnapshot({
        items: [],
        options: sentinelFeedbackOptions,
        loading: false,
        status: "unavailable",
      });
    }
  };

  useEffect(() => {
    loadAuthorityStatus();
    loadActionHistory();
    loadPipelines();
    loadActivityFeed();
    loadOperatorFeedback();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTenantRegistryFromApi() {
      try {
        const res = await fetch(`${sentinelActionApiBaseUrl}/tenants`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Sentinel tenants API returned ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data?.tenants)) throw new Error("Sentinel tenants API returned an invalid registry payload");
        if (!controller.signal.aborted) {
          setTenantRegistrySnapshot({ registry: data, source: "api" });
        }
      } catch (error) {
        if (error?.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setTenantRegistrySnapshot(getInitialTenantRegistry());
        }
      }
    }

    loadTenantRegistryFromApi();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!sentinelApiBaseUrl) return undefined;

    const controller = new AbortController();

    async function loadSentinelStateFromApi() {
      try {
        const res = await fetch(`${sentinelApiBaseUrl}/state`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Sentinel API returned ${res.status}`);
        const data = await res.json();
        if (!data?.tenant || !data?.health) throw new Error("Sentinel API returned an invalid state payload");
        if (!controller.signal.aborted) {
          setSentinelStateSnapshot({ state: data, source: "api" });
        }
      } catch (error) {
        if (error?.name === "AbortError") return;
        const reportState = readSentinelState();
        if (!controller.signal.aborted) {
          setSentinelStateSnapshot({
            state: reportState,
            source: "fallback",
          });
        }
      }
    }

    loadSentinelStateFromApi();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadCadenceSummary() {
      const paths = ["/reports/sentinel-cadence-summary.json", "/sentinel-cadence-summary.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setCadenceSummary(data);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setCadenceSummary(readCadenceSummary());
      }
    }

    loadCadenceSummary();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadDecisionReport() {
      const paths = ["/reports/seo-decision-engine.json", "/seo-decision-engine.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setDecisionReport(data);
            setDecisionLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setDecisionReport(null);
        setDecisionLoading(false);
      }
    }

    loadDecisionReport();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadAutopilotReport() {
      const paths = ["/reports/seo-autopilot-report.json", "/seo-autopilot-report.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setAutopilotReport(data);
            setAutopilotLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setAutopilotReport(null);
        setAutopilotLoading(false);
      }
    }

    loadAutopilotReport();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadQaReport() {
      const paths = ["/reports/resource-qa-report.json", "/resource-qa-report.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setQaReport(data);
            setQaLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setQaReport(null);
        setQaLoading(false);
      }
    }

    loadQaReport();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadActionInboxReport() {
      const paths = ["/reports/seo-action-inbox.json", "/seo-action-inbox.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setActionInboxReport(data);
            setActionInboxLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setActionInboxReport(null);
        setActionInboxLoading(false);
      }
    }

    loadActionInboxReport();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadWeeklyDigest() {
      const paths = ["/reports/seo-weekly-digest.md", "/seo-weekly-digest.md"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const text = await res.text();
          if (alive) {
            setWeeklyDigestText(text);
            setWeeklyDigestLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setWeeklyDigestText("");
        setWeeklyDigestLoading(false);
      }
    }

    loadWeeklyDigest();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadPlanStatusReport() {
      const paths = ["/reports/seo-plan-status.json", "/seo-plan-status.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setPlanStatusReport(data);
            setPlanStatusLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setPlanStatusReport(null);
        setPlanStatusLoading(false);
      }
    }

    loadPlanStatusReport();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadPlanApprovalsReport() {
      const paths = ["/reports/seo-plan-approvals.json", "/seo-plan-approvals.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setPlanApprovalsReport(data);
            setPlanApprovalsLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setPlanApprovalsReport(null);
        setPlanApprovalsLoading(false);
      }
    }

    loadPlanApprovalsReport();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadPlansReport() {
      const paths = ["/reports/seo-execution-plans.json", "/seo-execution-plans.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setPlansReport(data);
            setPlansLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setPlansReport(null);
        setPlansLoading(false);
      }
    }

    loadPlansReport();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadOpportunityReport() {
      const paths = ["/reports/seo-opportunity-centre.json", "/seo-opportunity-centre.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setOpportunityReport(data);
            setOpportunityLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setOpportunityReport(null);
        setOpportunityLoading(false);
      }
    }

    loadOpportunityReport();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadConversionReport() {
      const paths = ["/reports/seo-conversion-paths.json", "/seo-conversion-paths.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setConversionReport(data);
            setConversionLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setConversionReport(null);
        setConversionLoading(false);
      }
    }

    loadConversionReport();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadFreshnessReport() {
      const paths = ["/reports/seo-freshness-report.json", "/seo-freshness-report.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setFreshnessReport(data);
            setFreshnessLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setFreshnessReport(null);
        setFreshnessLoading(false);
      }
    }

    loadFreshnessReport();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadLinksReport() {
      const paths = ["/reports/seo-internal-link-opportunities.json", "/seo-internal-link-opportunities.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setLinksReport(data);
            setLinksLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setLinksReport(null);
        setLinksLoading(false);
      }
    }

    loadLinksReport();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadGrowthReport() {
      const paths = ["/reports/seo-growth-opportunities.json", "/seo-growth-opportunities.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setGrowthReport(data);
            setGrowthLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setGrowthReport(null);
        setGrowthLoading(false);
      }
    }

    loadGrowthReport();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadActionBriefs() {
      const paths = ["/reports/seo-action-briefs.json", "/seo-action-briefs.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setBriefsReport(data);
            setBriefsLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setBriefsReport(null);
        setBriefsLoading(false);
      }
    }

    loadActionBriefs();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadPipelineSummary() {
      const paths = ["/reports/seo-pipeline-summary.json", "/seo-pipeline-summary.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setPipelineSummary(data);
            setPipelineLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setPipelineSummary(null);
        setPipelineLoading(false);
      }
    }

    loadPipelineSummary();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadWeeklySummary() {
      const paths = ["/reports/seo-weekly-summary.json", "/seo-weekly-summary.json"];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (alive) {
            setWeeklySummary(data);
            setSummaryLoading(false);
          }
          return;
        } catch {
          // Try next path.
        }
      }
      if (alive) {
        setWeeklySummary(null);
        setSummaryLoading(false);
      }
    }

    loadWeeklySummary();
    return () => {
      alive = false;
    };
  }, []);

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg text-(--color-text)/50">Loading roadmap…</p>
    </div>
  );

  const demandGaps = demandSignals.contentGaps || [];
  const topicBacklog = demandSignals.topicBacklogV2 || [];
  const recommendations = buildFixCreateRecommendations({
    qaReport,
    allItems,
    demandGaps,
    topicBacklog,
  });
  const topRecommendations = recommendations.slice(0, 5);
  const sprintCandidates = recommendations.filter((r) => r.sprintCandidate).slice(0, 10);
  const allBriefs = buildActionBriefs(recommendations);
  const briefBySlug = new Map(allBriefs.filter((b) => b.targetSlug).map((b) => [b.targetSlug, b]));
  const recBySlug = new Map(recommendations.filter((r) => r.slug).map((r) => [r.slug, r]));
  const qaArticles = Array.isArray(qaReport?.articles) ? qaReport.articles : [];

  const articleRows = qaArticles.map((article) => {
    const brief = briefBySlug.get(article.slug);
    const rec = recBySlug.get(article.slug);
    const warnings = article?.issues?.warnings || [];
    return {
      ...article,
      brief,
      rec,
      commercialPriority: brief?.estimatedBusinessValue ?? 0,
      displayRank: rec?.displayRank ?? brief?.displayRank ?? 999,
      hasCodexPrompt: Boolean(brief?.codexPatchPrompt),
      isSprintCandidate: Boolean(rec?.sprintCandidate ?? brief?.sprintCandidate),
      isHighCommercialIntent: brief?.conversionIntentLabel === "high",
      hasMissingCTA: warnings.some((w) => /missing or weak service-relevant cta/i.test(w)),
      hasThinContent: warnings.some((w) => /thin/i.test(w)),
    };
  });
  const contentWorkbenchItems = buildContentWorkbenchItems({
    articleRows,
    recommendations,
    opportunityReport,
    plansReport,
    inboxReport: actionInboxReport,
    workflowState: sentinelStateSnapshot.state?.workflow?.state || "unknown",
  }).map((item) => {
    const persisted = contentWorkbenchState.items[item.id];
    const status = persisted?.status || item.defaultStatus;
    return {
      ...item,
      status,
      statusUpdatedAt: persisted?.updatedAt || null,
    };
  });
  const filteredRows = articleRows
    .filter((row) => {
      if (articleFilter === "needs_review") return row.gate === "needs_review";
      if (articleFilter === "pass") return row.gate === "pass";
      if (articleFilter === "sprint_candidates") return row.isSprintCandidate;
      if (articleFilter === "high_commercial_intent") return row.isHighCommercialIntent;
      if (articleFilter === "has_codex_prompt") return row.hasCodexPrompt;
      if (articleFilter === "missing_cta") return row.hasMissingCTA;
      if (articleFilter === "thin_content") return row.hasThinContent;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "score") return a.score - b.score;
      if (sortBy === "commercial_priority") return (b.commercialPriority || 0) - (a.commercialPriority || 0);
      if (sortBy === "display_rank") return (a.displayRank || 999) - (b.displayRank || 999);
      if (sortBy === "gate") {
        const order = { blocked: 0, needs_review: 1, pass: 2 };
        return (order[a.gate] ?? 9) - (order[b.gate] ?? 9);
      }
      return 0;
    });

  const selectedRow = filteredRows.find((r) => r.slug === selectedSlug)
    || articleRows.find((r) => r.slug === selectedSlug)
    || filteredRows[0]
    || articleRows[0]
    || null;

  const summaryGate = qaReport?.gateSummary || { pass: 0, needs_review: 0, blocked: 0 };
  const humanReviewRecommended = Boolean(pipelineSummary?.review?.humanReviewRecommended);
  const historyPoints = readHistorySnapshots();
  const progressPoints = historyPoints.slice(-8);
  const nextBestAction = pickNextBestAction({
    pipelineSummary,
    qaReport,
    weeklySummary,
    briefs: briefsReport?.briefs || [],
  });
  const batchQueue = buildBatchQueueItems({
    qaReport,
    briefs: briefsReport?.briefs || [],
  });
  const dashboardMode = computeDashboardMode({
    summaryGate,
    humanReviewRecommended,
    queueLength: batchQueue.length,
  });
  const isMonitorMode = dashboardMode.key === "monitor";
  const monitorInsights = buildMonitorInsights({ points: historyPoints, modeKey: dashboardMode.key });
  const sentinelState = sentinelStateSnapshot.state;
  const sentinelStateSource = sentinelStateSnapshot.source;
  const { activeTenant } = resolveTenantRegistrySnapshot(tenantRegistrySnapshot);
  const standaloneRuntimeLabel = sentinelStateSource === "api" ? "Pi-backed Sentinel node" : "local report fallback";
  const activeRow = selectedSlug ? selectedRow : (filteredRows[0] || articleRows[0] || null);

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg text-(--color-text)/50">Loading roadmap…</p>
    </div>
  );
  const displayRow = activeRow;
  const promptText = displayRow
    ? buildPlannerPrompt(displayRow, plannerToggles)
    : "Select an article to generate a prompt preview.";
  const showOverviewTab = activeNav === "overview";
  const showStateTab = activeNav === "state";
  const showInboxTab = activeNav === "inbox";
  const showContentWorkbenchTab = activeNav === "content";
  const showOpportunitiesTab = activeNav === "opportunities";
  const showActionsTab = activeNav === "actions";
  const showCadenceTab = activeNav === "cadence";
  const showTenantsTab = activeNav === "tenants";
  const showDiagnosticsTab = activeNav === "diagnostics";
  const baseNavItems = [
    { key: "overview", label: "Overview", description: "Focus and next action", ref: overviewRef },
    { key: "state", label: "State", description: "Health and state reports", ref: stateRef },
    { key: "inbox", label: "Inbox", description: "Attention queue", ref: inboxRef },
    { key: "content", label: "Content Workbench", description: "Article workflow", ref: contentWorkbenchRef },
    { key: "opportunities", label: "Opportunities", description: "Priorities and plans", ref: opportunitiesRef },
    { key: "actions", label: "Actions", description: "Commands and history", ref: actionsRef },
    { key: "cadence", label: "Cadence", description: "Automation rhythm", ref: cadenceRef },
    { key: "tenants", label: "Tenants", description: "Registry preview", ref: tenantsRef },
    { key: "diagnostics", label: "Diagnostics", description: "Checks and QA tools", ref: diagnosticsRef },
  ];
  const navItems = standaloneMode
    ? ["content", "inbox", "opportunities", "overview", "actions", "cadence", "state", "tenants", "diagnostics"]
      .map((key) => baseNavItems.find((item) => item.key === key))
      .filter(Boolean)
    : baseNavItems;
  const activeWorkspace = operatorWorkspaces.find((workspace) => workspace.id === activeWorkspaceId)
    || operatorWorkspaces.find((workspace) => workspace.id === SENTINEL_DEFAULT_WORKSPACE_ID)
    || operatorWorkspaces[0];
  const currentWorkspacePanels = {
    supportingIntelligence: supportingIntelligenceOpen,
    articleWorkbench: articleWorkbenchOpen,
    advancedDiagnostics: advancedDiagnosticsOpen,
  };

  const handleSidebarNav = (item) => {
    setActiveNav(item.key);
    window.requestAnimationFrame(() => {
      item.ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const refreshOperatorActivity = async () => {
    await Promise.all([
      loadActionHistory(),
      loadPipelines(),
      loadActivityFeed(),
    ]);
  };

  const showWorkspaceNotice = (message) => {
    setWorkspaceNotice(message);
    window.setTimeout(() => setWorkspaceNotice(""), 2200);
  };

  const applyOperatorWorkspace = (workspace) => {
    const normalisedWorkspace = normaliseOperatorWorkspace(workspace);
    const panelState = openPanelsFromWorkspace(normalisedWorkspace);

    setActiveWorkspaceId(normalisedWorkspace.id);
    setActiveNav(normalisedWorkspace.selectedSection || "overview");
    setCommandQuery(normalisedWorkspace.commandSearch || "");
    setCommandCategory(normalisedWorkspace.commandFilter || "All");
    setSidebarCollapsed(Boolean(normalisedWorkspace.sidebarCollapsed));
    setCompactView(Boolean(normalisedWorkspace.compactMode));
    setSupportingIntelligenceOpen(Boolean(panelState.supportingIntelligence));
    setArticleWorkbenchOpen(Boolean(panelState.articleWorkbench));
    setAdvancedDiagnosticsOpen(Boolean(panelState.advancedDiagnostics));
    setIsFirstRunSession(false);
    showWorkspaceNotice(`${normalisedWorkspace.name} workspace loaded locally.`);
  };

  const persistWorkspaceList = (nextWorkspaces) => {
    const builtInIds = new Set(SENTINEL_BUILT_IN_WORKSPACES.map((workspace) => workspace.id));
    const nextCustomWorkspaces = nextWorkspaces.filter((workspace) => !workspace.builtIn && !builtInIds.has(workspace.id));
    const mergedWorkspaces = [
      ...SENTINEL_BUILT_IN_WORKSPACES.map(normaliseOperatorWorkspace),
      ...nextCustomWorkspaces.map((workspace) => normaliseOperatorWorkspace({ ...workspace, builtIn: false })),
    ];

    setOperatorWorkspaces(mergedWorkspaces);
    writeOperatorWorkspaces(mergedWorkspaces);
    return mergedWorkspaces;
  };

  const buildWorkspaceFromCurrentState = ({ id, name, createdAt, notes, preferredFocus }) => normaliseOperatorWorkspace({
    id,
    name,
    createdAt: createdAt || new Date().toISOString(),
    builtIn: false,
    selectedSection: activeNav,
    commandFilter: commandCategory,
    commandSearch: commandQuery,
    sidebarCollapsed,
    collapsedPanels: collapsedPanelsFromOpenState(currentWorkspacePanels),
    compactMode: compactView,
    visiblePanels: buildVisiblePanelsFromState({
      activeSection: activeNav,
      panels: currentWorkspacePanels,
    }),
    preferredFocus: preferredFocus || activeWorkspace?.preferredFocus || activeNav,
    notes: notes || "Custom workspace saved from the current Control Centre layout.",
    updatedAt: new Date().toISOString(),
  });

  const createWorkspaceFromCurrentState = () => {
    const name = newWorkspaceName.trim();
    if (!name) {
      showWorkspaceNotice("Add a workspace name before creating a custom workspace.");
      return;
    }

    const builtInIds = new Set(SENTINEL_BUILT_IN_WORKSPACES.map((workspace) => workspace.id));
    const existingIds = new Set(operatorWorkspaces.map((workspace) => workspace.id));
    let id = `custom-${buildWorkspaceSlug(name)}`;
    let suffix = 2;
    while (existingIds.has(id) || builtInIds.has(id)) {
      id = `custom-${buildWorkspaceSlug(name)}-${suffix}`;
      suffix += 1;
    }

    const workspace = buildWorkspaceFromCurrentState({
      id,
      name,
      preferredFocus: activeWorkspace?.preferredFocus || activeNav,
    });
    const nextWorkspaces = persistWorkspaceList([...operatorWorkspaces, workspace]);
    setActiveWorkspaceId(workspace.id);
    setNewWorkspaceName("");
    showWorkspaceNotice(`${workspace.name} workspace created locally.`);

    if (!nextWorkspaces.some((item) => item.id === workspace.id)) {
      showWorkspaceNotice("Workspace could not be saved in this browser.");
    }
  };

  const saveActiveWorkspace = () => {
    if (!activeWorkspace) return;

    if (activeWorkspace.builtIn) {
      const customName = newWorkspaceName.trim() || `${activeWorkspace.name} Custom`;
      const builtInIds = new Set(SENTINEL_BUILT_IN_WORKSPACES.map((workspace) => workspace.id));
      const existingIds = new Set(operatorWorkspaces.map((workspace) => workspace.id));
      let id = `custom-${buildWorkspaceSlug(customName)}`;
      let suffix = 2;
      while (existingIds.has(id) || builtInIds.has(id)) {
        id = `custom-${buildWorkspaceSlug(customName)}-${suffix}`;
        suffix += 1;
      }

      const workspace = buildWorkspaceFromCurrentState({
        id,
        name: customName,
        preferredFocus: activeWorkspace.preferredFocus,
        notes: `Custom copy of ${activeWorkspace.name}.`,
      });
      persistWorkspaceList([...operatorWorkspaces, workspace]);
      setActiveWorkspaceId(workspace.id);
      setNewWorkspaceName("");
      showWorkspaceNotice(`${workspace.name} workspace saved locally.`);
      return;
    }

    const updatedWorkspace = buildWorkspaceFromCurrentState({
      id: activeWorkspace.id,
      name: activeWorkspace.name,
      createdAt: activeWorkspace.createdAt,
      preferredFocus: activeWorkspace.preferredFocus,
      notes: activeWorkspace.notes,
    });
    persistWorkspaceList(operatorWorkspaces.map((workspace) => (
      workspace.id === activeWorkspace.id ? updatedWorkspace : workspace
    )));
    showWorkspaceNotice(`${updatedWorkspace.name} workspace overwritten locally.`);
  };

  const resetSelectedWorkspace = () => {
    if (!activeWorkspace) return;
    applyOperatorWorkspace(activeWorkspace);
  };

  const deleteActiveWorkspace = () => {
    if (!activeWorkspace || activeWorkspace.builtIn) {
      showWorkspaceNotice("Built-in workspaces cannot be deleted.");
      return;
    }

    const nextWorkspaces = persistWorkspaceList(operatorWorkspaces.filter((workspace) => workspace.id !== activeWorkspace.id));
    const defaultWorkspace = nextWorkspaces.find((workspace) => workspace.id === SENTINEL_DEFAULT_WORKSPACE_ID) || nextWorkspaces[0];
    if (defaultWorkspace) applyOperatorWorkspace(defaultWorkspace);
    showWorkspaceNotice(`${activeWorkspace.name} workspace deleted locally.`);
  };

  const resetControlCentreState = () => {
    const sessionDefaults = getOperatorSessionDefaults(standaloneMode);
    clearOperatorSessionState(standaloneMode);
    setActiveNav(sessionDefaults.activeSection);
    setCommandQuery(sessionDefaults.commandQuery);
    setCommandCategory(sessionDefaults.commandCategory);
    setActiveWorkspaceId(sessionDefaults.activeWorkspaceId);
    setSidebarCollapsed(sessionDefaults.sidebarCollapsed);
    setCompactView(sessionDefaults.compactView);
    setHelpOpen(sessionDefaults.helpOpen);
    setFirstRunHintDismissed(sessionDefaults.firstRunHintDismissed);
    setIsFirstRunSession(true);
    setSupportingIntelligenceOpen(sessionDefaults.panels.supportingIntelligence);
    setArticleWorkbenchOpen(sessionDefaults.panels.articleWorkbench);
    setAdvancedDiagnosticsOpen(sessionDefaults.panels.advancedDiagnostics);
    setSessionResetNotice(standaloneMode ? "Sentinel workspace state reset locally." : "Control Centre state reset locally.");
    window.setTimeout(() => setSessionResetNotice(""), 1800);
  };

  const updateContentWorkbenchStatus = (itemId, status) => {
    if (!itemId || !CONTENT_LIFECYCLE_STATUSES.includes(status)) return;
    setContentWorkbenchState((current) => {
      const next = normaliseContentWorkbenchState({
        ...current,
        items: {
          ...(current?.items || {}),
          [itemId]: {
            status,
            updatedAt: new Date().toISOString(),
          },
        },
      });
      writeContentWorkbenchState(next);
      return next;
    });
  };

  return (
    <div className={standaloneMode ? "relative min-h-screen overflow-x-hidden bg-[#050914] text-slate-100" : "min-h-screen bg-slate-50"}>
      {standaloneMode ? (
        <div
          className="pointer-events-none fixed inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(circle at 18% 8%, rgba(34, 211, 238, 0.18), transparent 28%), radial-gradient(circle at 82% 6%, rgba(37, 99, 235, 0.14), transparent 30%), linear-gradient(180deg, #050914 0%, #08111f 52%, #050914 100%)",
          }}
          aria-hidden="true"
        />
      ) : null}
      <SentinelAppHeader
        activeTenant={activeTenant}
        dashboardMode={dashboardMode}
        summaryGate={summaryGate}
        sentinelState={sentinelState}
        sentinelStateSource={sentinelStateSource}
        cadenceSummary={cadenceSummary}
        readinessSummary={readinessSummary}
        dashboardLoadedAt={dashboardLoadedAt}
        onPreview={onPreview}
        compactView={compactView}
        onCompactViewChange={setCompactView}
        onResetWorkspace={resetControlCentreState}
        standaloneMode={standaloneMode}
      />

      <main
        className={standaloneMode
          ? "relative z-10 mx-auto box-border w-full max-w-[1540px] px-[var(--space-lg)] md:px-[var(--space-xl)] 2xl:px-[var(--space-2xl)]"
          : "container"}
        style={{ paddingTop: standaloneMode ? "var(--space-lg)" : "var(--space-xl)", paddingBottom: "var(--space-2xl)" }}
      >
        {standaloneMode ? (
          <SentinelStandaloneFocusSurface
            activeTenant={activeTenant}
            nextBestAction={nextBestAction}
            contentWorkbenchItems={contentWorkbenchItems}
            standaloneRuntimeLabel={standaloneRuntimeLabel}
            onOpenContent={() => {
              const contentItem = navItems.find((item) => item.key === "content");
              if (contentItem) handleSidebarNav(contentItem);
            }}
          />
        ) : null}
        <div className={`grid min-w-0 ${standaloneMode ? (compactView ? "gap-5" : "gap-7") : (compactView ? "gap-lg" : "gap-xl")} ${standaloneMode ? (sidebarCollapsed ? "lg:grid-cols-[86px_minmax(0,1fr)]" : "lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[236px_minmax(0,1fr)]") : (sidebarCollapsed ? "lg:grid-cols-[150px_minmax(0,1fr)] xl:grid-cols-[170px_minmax(0,1fr)]" : "lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]")}`}>
          <SentinelNavigationRail
            navItems={navItems}
            activeNav={activeNav}
            onNavigate={handleSidebarNav}
            activeTenant={activeTenant}
            dashboardMode={dashboardMode}
            summaryGate={summaryGate}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
            standaloneMode={standaloneMode}
          />

          <div className={`grid min-w-0 ${compactView ? "gap-md" : "gap-lg"}`}>
            {sessionResetNotice ? (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
                {sessionResetNotice}
              </div>
            ) : null}
            {!standaloneMode ? (
              <>
                <ControlCentreHelpPanel
                  activeNav={activeNav}
                  helpRegistry={sentinelControlCentreHelp}
                  helpOpen={helpOpen}
                  firstRunHintVisible={isFirstRunSession && !firstRunHintDismissed}
                  onToggleHelp={setHelpOpen}
                  onDismissFirstRun={() => {
                    setFirstRunHintDismissed(true);
                    setIsFirstRunSession(false);
                  }}
                />
                <OperatorWorkspaceSwitcher
                  workspaces={operatorWorkspaces}
                  activeWorkspace={activeWorkspace}
                  activeWorkspaceId={activeWorkspaceId}
                  newWorkspaceName={newWorkspaceName}
                  workspaceNotice={workspaceNotice}
                  onWorkspaceChange={(workspaceId) => {
                    const workspace = operatorWorkspaces.find((item) => item.id === workspaceId);
                    if (workspace) applyOperatorWorkspace(workspace);
                  }}
                  onNewWorkspaceNameChange={setNewWorkspaceName}
                  onCreateWorkspace={createWorkspaceFromCurrentState}
                  onSaveWorkspace={saveActiveWorkspace}
                  onResetSelectedWorkspace={resetSelectedWorkspace}
                  onDeleteWorkspace={deleteActiveWorkspace}
                />
              </>
            ) : null}
            {isMonitorMode && showOverviewTab ? (
              <section ref={overviewRef} className="grid gap-lg">
                <SectionIntro
                  eyebrow="Overview"
                  title="Current operating picture"
                  description="The shortest path to what matters now: health, workflow, focus, inbox and active priorities."
                  standaloneMode={standaloneMode}
                />
                <CurrentFocusPanel sentinelState={sentinelState} inboxReport={actionInboxReport} />
                <SystemStatusZone
                  dashboardMode={dashboardMode}
                  summaryGate={summaryGate}
                  sentinelState={sentinelState}
                  cadenceSummary={cadenceSummary}
                  readinessSummary={readinessSummary}
                  doctorSummary={doctorSummary}
                />
                <AuthorityStatePanel authoritySnapshot={authoritySnapshot} />
                <ActivityFeedPanel activityFeed={activityFeedSnapshot} onRefresh={loadActivityFeed} />
                <OperatorFeedbackPanel
                  activeSection={activeNav}
                  feedbackSnapshot={feedbackSnapshot}
                  onFeedbackAdded={loadOperatorFeedback}
                  onRefresh={loadOperatorFeedback}
                />
                <RoadmapIntelligencePanel
                  roadmap={roadmapSummary}
                  approvals={roadmapApprovals}
                  implementationBrief={implementationBrief}
                  workPackage={workPackage}
                  workPackageReview={workPackageReview}
                  implementationStatuses={implementationStatuses}
                />

                <section className="grid gap-lg xl:grid-cols-2">
                  <div>
                    <h2 className={standaloneMode ? "text-lg font-semibold text-white" : "text-lg font-semibold text-slate-900"} style={{ marginBottom: "12px" }}>Action inbox</h2>
                    <ActionInboxPanel inboxReport={actionInboxReport} loading={actionInboxLoading} />
                  </div>
                  <div>
                    <h2 className={standaloneMode ? "text-lg font-semibold text-white" : "text-lg font-semibold text-slate-900"} style={{ marginBottom: "12px" }}>Weekly digest</h2>
                    <WeeklyDigestPanel digestText={weeklyDigestText} loading={weeklyDigestLoading} />
                  </div>
                </section>

                <section className="grid gap-lg xl:grid-cols-2">
                  <div>
                    <h2 className={standaloneMode ? "text-xl font-semibold text-white" : "text-xl font-semibold text-slate-900"} style={{ marginBottom: "12px" }}>Top opportunities</h2>
                    <OpportunityCommandCentrePanel opportunityReport={opportunityReport} loading={opportunityLoading} />
                  </div>
                  <div>
                    <h2 className={standaloneMode ? "text-xl font-semibold text-white" : "text-xl font-semibold text-slate-900"} style={{ marginBottom: "12px" }}>Execution plans</h2>
                    <ExecutionPlansPanel
                      plansReport={plansReport}
                      loading={plansLoading || planApprovalsLoading || planStatusLoading}
                      planApprovalsReport={planApprovalsReport}
                      planStatusReport={planStatusReport}
                    />
                  </div>
                </section>
              </section>
            ) : null}

            {isMonitorMode && showStateTab ? (
              <section ref={stateRef} className="grid gap-lg">
                <SectionIntro
                  eyebrow="State"
                  title="Persisted Sentinel state"
                  description="Operational state reports, cadence output and monitoring history without switching into diagnostics."
                  standaloneMode={standaloneMode}
                />
                <section className="grid gap-lg xl:grid-cols-2">
                  <SentinelStatePanel sentinelState={sentinelState} source={sentinelStateSource} />
                  <CadenceSummaryPanel cadenceSummary={cadenceSummary} />
                </section>
                <AutopilotOrchestratorPanel autopilotReport={autopilotReport} loading={autopilotLoading} />
                <AutopilotStatusPanel
                  mode={dashboardMode}
                  pipelineSummary={pipelineSummary}
                  monitorInsights={monitorInsights}
                />
                <ProgressHistoryCard points={progressPoints} />
              </section>
            ) : null}

            {isMonitorMode && showInboxTab ? (
              <section ref={inboxRef} className="grid gap-lg">
                <SectionIntro
                  eyebrow="Inbox"
                  title="Attention queue"
                  description="The practical operator queue: review items, next best action and state-derived work."
                  standaloneMode={standaloneMode}
                />
                <NextBestActionPanel
                  action={nextBestAction}
                  loading={summaryLoading || pipelineLoading || briefsLoading}
                  headingLabel={dashboardMode.actionLabel}
                />
                <ActionInboxPanel inboxReport={actionInboxReport} loading={actionInboxLoading} />
              </section>
            ) : null}

            {isMonitorMode && showContentWorkbenchTab ? (
              <section ref={contentWorkbenchRef} className="grid gap-lg">
                <SectionIntro
                  eyebrow="Content Workbench"
                  title="Article workflow"
                  description="Editorial operating view for discovered topics, active briefs, article reviews and live monitoring."
                  standaloneMode={standaloneMode}
                />
                <ContentWorkbenchPanel
                  items={contentWorkbenchItems}
                  loading={qaLoading || opportunityLoading || plansLoading || actionInboxLoading}
                  onStatusChange={updateContentWorkbenchStatus}
                  onOpenArticle={(slug) => {
                    if (slug) setSelectedSlug(slug);
                  }}
                  standaloneMode={standaloneMode}
                  actionRegistry={sentinelActionRegistry}
                  authoritySnapshot={authoritySnapshot}
                  onWorkflowActionComplete={refreshOperatorActivity}
                />
              </section>
            ) : null}

            {isMonitorMode && showOpportunitiesTab ? (
              <section ref={opportunitiesRef} className="grid gap-lg">
                <SectionIntro
                  eyebrow="Opportunities"
                  title="Strategic priorities and plans"
                  description="Decision layer, opportunity command centre and execution plans grouped together."
                  standaloneMode={standaloneMode}
                />
                <StrategicDecisionsPanel decisionReport={decisionReport} loading={decisionLoading} />
                <section className="grid gap-lg xl:grid-cols-2">
                  <OpportunityCommandCentrePanel opportunityReport={opportunityReport} loading={opportunityLoading} />
                  <ExecutionPlansPanel
                    plansReport={plansReport}
                    loading={plansLoading || planApprovalsLoading || planStatusLoading}
                    planApprovalsReport={planApprovalsReport}
                    planStatusReport={planStatusReport}
                  />
                </section>
                <details
                  open={supportingIntelligenceOpen}
                  onToggle={(event) => setSupportingIntelligenceOpen(event.currentTarget.open)}
                  className="rounded-xl border border-slate-200 bg-white/80"
                  style={{ padding: "var(--space-md)" }}
                >
                  <summary className="cursor-pointer text-sm font-semibold text-slate-700">View supporting opportunity intelligence</summary>
                  <div style={{ marginTop: "var(--space-sm)", display: "grid", gap: "var(--space-sm)" }}>
                    <GrowthOpportunitiesPanel growthReport={growthReport} loading={growthLoading} />
                    <InternalLinkOpportunitiesPanel linksReport={linksReport} loading={linksLoading} />
                    <FreshnessDecayPanel freshnessReport={freshnessReport} loading={freshnessLoading} />
                    <ConversionPathPanel conversionReport={conversionReport} loading={conversionLoading} />
                  </div>
                </details>
              </section>
            ) : null}

            {isMonitorMode && showActionsTab ? (
              <section ref={actionsRef} className="grid gap-lg">
                <SectionIntro
                  eyebrow="Actions"
                  title="Safe operator console"
                  description="Controlled allowlisted execution, command discovery and recent action history. No arbitrary shell access."
                  standaloneMode={standaloneMode}
                />
                <OperatorConsolePanel
                  actionRegistry={sentinelActionRegistry}
                  history={actionHistorySnapshot}
                  authoritySnapshot={authoritySnapshot}
                  onActionComplete={refreshOperatorActivity}
                />
                <ExecutionPipelinesPanel
                  pipelineSnapshot={pipelineSnapshot}
                  authoritySnapshot={authoritySnapshot}
                  onRefresh={loadPipelines}
                  onPipelineComplete={refreshOperatorActivity}
                />
                <RecentOperatorActionsPanel
                  history={actionHistorySnapshot}
                  actionRegistry={sentinelActionRegistry}
                  onRefresh={refreshOperatorActivity}
                />
                <SentinelCommandsPanel
                  commandRegistry={sentinelCommandRegistry}
                  actionRegistry={sentinelActionRegistry}
                  authoritySnapshot={authoritySnapshot}
                  query={commandQuery}
                  category={commandCategory}
                  onQueryChange={setCommandQuery}
                  onCategoryChange={setCommandCategory}
                  onActionComplete={refreshOperatorActivity}
                />
              </section>
            ) : null}

            {isMonitorMode && showCadenceTab ? (
              <section ref={cadenceRef} className="grid gap-lg">
                <SectionIntro
                  eyebrow="Cadence"
                  title="Automation rhythm"
                  description="Cadence status, notification payloads, report generation and the recommended operator flow."
                  standaloneMode={standaloneMode}
                />
                <OperationsPanel cadenceSummary={cadenceSummary} weeklyDigestText={weeklyDigestText} />
                <OperatorWorkflowPanel />
                <WeeklyDigestPanel digestText={weeklyDigestText} loading={weeklyDigestLoading} />
              </section>
            ) : null}

            {isMonitorMode && showTenantsTab ? (
              <section ref={tenantsRef} className="grid gap-lg">
                <SectionIntro
                  eyebrow="Tenants"
                  title="Tenant context and registry"
                  description="Read-only tenant awareness for ERP Experts and disabled fixtures. Switching is intentionally not enabled."
                  standaloneMode={standaloneMode}
                />
                <TenantContextPanel tenantRegistrySnapshot={tenantRegistrySnapshot} />
                <AuthorityStatePanel authoritySnapshot={authoritySnapshot} />
                <TenantRegistryPanel tenantRegistrySnapshot={tenantRegistrySnapshot} />
              </section>
            ) : null}

            {isMonitorMode && showDiagnosticsTab ? (
              <section ref={diagnosticsRef} className="grid gap-lg">
                <SectionIntro
                  eyebrow="Diagnostics"
                  title="Checks and advanced tools"
                  description="Readiness, doctor state, monitoring details and the collapsed article QA planner."
                  standaloneMode={standaloneMode}
                />
                <SystemStatusZone
                  dashboardMode={dashboardMode}
                  summaryGate={summaryGate}
                  sentinelState={sentinelState}
                  cadenceSummary={cadenceSummary}
                  readinessSummary={readinessSummary}
                  doctorSummary={doctorSummary}
                />
                <SystemStateRail mode={dashboardMode} />
                <AutopilotStatusPanel
                  mode={dashboardMode}
                  pipelineSummary={pipelineSummary}
                  monitorInsights={monitorInsights}
                />
                <NextBestActionPanel
                  action={nextBestAction}
                  loading={summaryLoading || pipelineLoading || briefsLoading}
                  headingLabel={dashboardMode.actionLabel}
                />
                <OperatorConsolePanel
                  actionRegistry={sentinelActionRegistry}
                  history={actionHistorySnapshot}
                  authoritySnapshot={authoritySnapshot}
                  onActionComplete={refreshOperatorActivity}
                />
              </section>
            ) : null}

            {!isMonitorMode ? (
              <>
                <section ref={overviewRef}>
                  <h2 className="text-xl font-semibold text-slate-900" style={{ marginBottom: "12px" }}>Operator queue</h2>
                  <OperatorModePanel
                    summaryGate={summaryGate}
                    humanReviewRecommended={humanReviewRecommended}
                    queue={batchQueue}
                    pipelineSummary={pipelineSummary}
                    loading={qaLoading || briefsLoading || pipelineLoading || summaryLoading}
                    mode={dashboardMode}
                  />
                </section>
                <NextBestActionPanel
                  action={nextBestAction}
                  loading={summaryLoading || pipelineLoading || briefsLoading}
                  headingLabel={dashboardMode.actionLabel}
                />
                <BatchImprovementQueue
                  loading={qaLoading || briefsLoading || pipelineLoading || summaryLoading}
                  queue={batchQueue}
                  reportsReady={Boolean(qaReport && pipelineSummary && weeklySummary && briefsReport)}
                />
              </>
            ) : null}

            {isMonitorMode ? (
              <AppShellStatusBar
                readinessSummary={readinessSummary}
                cadenceSummary={cadenceSummary}
                sentinelStateSource={sentinelStateSource}
              />
            ) : null}
            {standaloneMode ? (
              <section className="grid gap-4 xl:grid-cols-2">
                <OperatorWorkspaceSwitcher
                  workspaces={operatorWorkspaces}
                  activeWorkspace={activeWorkspace}
                  activeWorkspaceId={activeWorkspaceId}
                  newWorkspaceName={newWorkspaceName}
                  workspaceNotice={workspaceNotice}
                  onWorkspaceChange={(workspaceId) => {
                    const workspace = operatorWorkspaces.find((item) => item.id === workspaceId);
                    if (workspace) applyOperatorWorkspace(workspace);
                  }}
                  onNewWorkspaceNameChange={setNewWorkspaceName}
                  onCreateWorkspace={createWorkspaceFromCurrentState}
                  onSaveWorkspace={saveActiveWorkspace}
                  onResetSelectedWorkspace={resetSelectedWorkspace}
                  onDeleteWorkspace={deleteActiveWorkspace}
                />
                <ControlCentreHelpPanel
                  activeNav={activeNav}
                  helpRegistry={sentinelControlCentreHelp}
                  helpOpen={helpOpen}
                  firstRunHintVisible={isFirstRunSession && !firstRunHintDismissed}
                  onToggleHelp={setHelpOpen}
                  onDismissFirstRun={() => {
                    setFirstRunHintDismissed(true);
                    setIsFirstRunSession(false);
                  }}
                />
              </section>
            ) : null}
          </div>
        </div>
      </main>

      {(!isMonitorMode || showDiagnosticsTab) ? (
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="container" style={{ paddingTop: "var(--space-xl)", paddingBottom: "var(--space-xl)" }}>
          {isMonitorMode ? (
            <details
              open={articleWorkbenchOpen}
              onToggle={(event) => setArticleWorkbenchOpen(event.currentTarget.open)}
              className="rounded-xl border border-slate-200 bg-white/85"
              style={{ padding: "var(--space-md)" }}
            >
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">Article QA planner and operator tools</summary>
              <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)", marginBottom: "var(--space-lg)" }}>
                Expand when you need manual article-level QA prompts.
              </p>
              {!qaReport ? (
                <div className="rounded-2xl border border-slate-200 bg-white text-sm text-slate-600" style={{ padding: "var(--space-lg)" }}>
                  Resource QA report missing. Run <code>npm run seo:pipeline</code> to populate the workbench.
                </div>
              ) : (
                <WorkbenchContent
                  articleFilter={articleFilter}
                  setArticleFilter={setArticleFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  filteredRows={filteredRows}
                  articleRows={articleRows}
                  selectedRow={selectedRow}
                  setSelectedSlug={setSelectedSlug}
                  displayRow={displayRow}
                  plannerToggles={plannerToggles}
                  setPlannerToggles={setPlannerToggles}
                  promptText={promptText}
                  copyState={copyState}
                  setCopyState={setCopyState}
                />
              )}
            </details>
          ) : !qaReport ? (
            <div className="rounded-2xl border border-slate-200 bg-white text-sm text-slate-600" style={{ padding: "var(--space-lg)" }}>
              Resource QA report missing. Run <code>npm run seo:pipeline</code> to populate the workbench.
            </div>
          ) : (
            <WorkbenchContent
              articleFilter={articleFilter}
              setArticleFilter={setArticleFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              filteredRows={filteredRows}
              articleRows={articleRows}
              selectedRow={selectedRow}
              setSelectedSlug={setSelectedSlug}
              displayRow={displayRow}
              plannerToggles={plannerToggles}
              setPlannerToggles={setPlannerToggles}
              promptText={promptText}
              copyState={copyState}
              setCopyState={setCopyState}
            />
          )}
        </div>
      </section>
      ) : null}

      {(!isMonitorMode || showDiagnosticsTab) ? (
      <section className="bg-white border-b border-slate-200">
        <div className="container" style={{ paddingTop: "var(--space-xl)", paddingBottom: "var(--space-xl)" }}>
          <details
            open={advancedDiagnosticsOpen}
            onToggle={(event) => setAdvancedDiagnosticsOpen(event.currentTarget.open)}
            className="rounded-xl border border-slate-200 bg-slate-50"
            style={{ padding: "var(--space-md)" }}
          >
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">Advanced diagnostics</summary>
            <div style={{ marginTop: "var(--space-md)" }}>
              <WeeklySummarySection summary={weeklySummary} loading={summaryLoading} />
              <PipelineSummarySection summary={pipelineSummary} loading={pipelineLoading} />
              {(statusSource !== "php" || saveBlocked) ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600" style={{ padding: "var(--space-sm)", marginTop: "var(--space-md)" }}>
                  Admin persistence note: status writes are currently <strong>{statusSource}</strong>{saveBlocked ? " and save attempts are failing." : "."} Edits may not persist server-side.
                </div>
              ) : null}
              <ResourceQaSection qaReport={qaReport} qaLoading={qaLoading} />
              <RecommendationSection recommendations={topRecommendations} sprintCandidates={sprintCandidates} qaLoading={qaLoading} />
              <ActionBriefSection briefs={buildActionBriefs(topRecommendations)} qaLoading={qaLoading} />
            </div>
          </details>
        </div>
      </section>
      ) : null}

      {/* ── Footer ── */}
      <div className={standaloneMode ? "relative z-10 mx-auto box-border w-full max-w-[1480px] px-[var(--space-lg)] text-center md:px-[var(--space-xl)] 2xl:px-[var(--space-2xl)]" : "container text-center"} style={{ paddingTop: "var(--space-lg)", paddingBottom: "var(--space-2xl)" }}>
        <p className={standaloneMode ? "text-xs text-slate-500" : "text-xs text-slate-500"}>
          {standaloneMode ? "Private Sentinel workspace. Content workflow stays primary; infrastructure systems remain controlled support layers." : "Front-end planner only. Copy prompt for Codex, then run seo:after-edit to validate."}
        </p>
      </div>
    </div>
  );
}

function buildPlannerPrompt(row, toggles) {
  const fixLines = [];
  if (toggles.intro) fixLines.push("Improve intro clarity and depth for the target audience.");
  if (toggles.thinSections) fixLines.push("Expand thin sections with practical, topic-specific detail.");
  if (toggles.serviceCta) fixLines.push("Add or strengthen service-relevant CTA fields.");
  if (toggles.conclusion) fixLines.push("Strengthen the conclusion so it leads naturally to the CTA.");
  if (toggles.internalLinks) fixLines.push("Add or improve internal links relevant to the topic.");
  if (toggles.repetitionRisk) fixLines.push("Reduce repetition risk by varying CTA and conclusion phrasing.");
  if (toggles.publishedAt) fixLines.push("Add or validate publishedAt.");

  return `Improve one existing ERP Experts resource article safely.

Target:
- Slug: ${row.slug}
- File: src/data/articles.js

Selected fixes:
${fixLines.map((line) => `- ${line}`).join("\n")}

Constraints:
- Only edit the target article object in src/data/articles.js.
- Preserve the existing article data shape.
- Do not redesign components.
- Do not change routes.
- Do not invent fake statistics, fake customer stories, named clients, or unsupported claims.
- Use UK English.
- Avoid repeated CTA/conclusion phrasing used in recent article improvements.

After editing:
- Run npm run seo:after-edit -- ${row.slug}`;
}

function NextBestActionPanel({ action, loading, headingLabel = "Next best action" }) {
  const [copyState, setCopyState] = useState("idle");
  const [promptCopyState, setPromptCopyState] = useState("idle");
  const copyCommand = async () => {
    const ok = await copyText(action.command || "", "next-best-action command");
    if (ok) {
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1200);
    } else {
      setCopyState("failed");
      setTimeout(() => setCopyState("idle"), 1600);
    } 
  };
  const copyPrompt = async () => {
    if (!action.codexPrompt) return;
    const ok = await copyText(action.codexPrompt, "next-best-action prompt");
    if (ok) {
      setPromptCopyState("copied");
      setTimeout(() => setPromptCopyState("idle"), 1200);
    } else {
      setPromptCopyState("failed");
      setTimeout(() => setPromptCopyState("idle"), 1400);
    } 
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80" style={{ padding: "var(--space-lg)" }}>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500" style={{ marginBottom: "var(--space-xs)" }}>{headingLabel}</p>
      {loading ? (
        <p className="text-sm text-slate-500">Building recommendation...</p>
      ) : (
        <>
          <p className="font-heading text-slate-900" style={{ fontSize: "1.05rem" }}>{action.title}</p>
          <p className="text-sm text-slate-700" style={{ marginTop: "var(--space-xs)" }}>{action.why}</p>
          <div className="grid md:grid-cols-3 gap-md" style={{ marginTop: "var(--space-md)" }}>
            <BriefBlock label="Target" value={action.targetTitle || "Not specified"} />
            <BriefBlock label="Priority" value={action.priority || "Operational"} />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Run command</p>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <code className="inline-flex max-w-full overflow-x-auto whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100">
                  {action.command}
                </code>
                <button
                  type="button"
                  onClick={copyCommand}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy"}
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-sm" style={{ marginTop: "var(--space-md)" }}>
            <a href={action.actionPath || "/seo-roadmap"} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
              {action.buttonLabel || "Open target"}
              <ArrowRight size={14} />
            </a>
            {action.codexPrompt ? (
              <button
                type="button"
                onClick={copyPrompt}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {promptCopyState === "copied" ? "Copied prompt" : promptCopyState === "failed" ? "Copy failed" : "Copy prompt"}
              </button>
            ) : null}
          </div>
          {action.codexPrompt ? (
            <details className="rounded-xl border border-slate-200 bg-slate-50" style={{ marginTop: "var(--space-md)", padding: "var(--space-sm)" }}>
              <summary className="cursor-pointer text-xs font-semibold text-slate-600">Preview Codex prompt</summary>
              <pre className="text-xs text-slate-700 whitespace-pre-wrap" style={{ marginTop: "8px" }}>{action.codexPrompt}</pre>
            </details>
          ) : null}
        </>
      )}
    </div>
  );
}

function OpportunityCommandCentrePanel({ opportunityReport, loading }) {
  const [copyState, setCopyState] = useState("idle");
  const [copyTarget, setCopyTarget] = useState("");
  const top = Array.isArray(opportunityReport?.topOpportunities)
    ? opportunityReport.topOpportunities.slice(0, 5)
    : Array.isArray(opportunityReport?.opportunities)
      ? opportunityReport.opportunities.slice(0, 5)
      : [];

  const copyItem = async (text, target) => {
    const ok = await copyText(text, `opportunity-centre ${target}`);
    setCopyTarget(target);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => {
      setCopyState("idle");
      setCopyTarget("");
    }, 1400);
  };

  const buttonLabel = (target, fallback) => {
    if (copyTarget !== target) return fallback;
    if (copyState === "copied") return "Copied";
    if (copyState === "failed") return "Copy failed";
    return fallback;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-md flex-wrap">
        <p className="text-sm text-slate-700">Top ranked opportunities for this week.</p>
        <span className="text-xs text-slate-500">Top 5</span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500" style={{ marginTop: "var(--space-sm)" }}>Loading unified opportunities…</p>
      ) : !opportunityReport ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>
          Opportunity report missing. Run <code>npm run seo:opportunities</code> after growth/link/freshness/conversion reports are generated.
        </p>
      ) : top.length === 0 ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>No prioritised opportunities found.</p>
      ) : (
        <div className="grid gap-sm" style={{ marginTop: "var(--space-sm)" }}>
          {top.map((item, index) => (
            <div key={item.id || index} className="rounded-xl border border-slate-100 bg-slate-50/60" style={{ padding: "var(--space-sm)" }}>
              <div className="flex items-start justify-between gap-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{index + 1}. {item.groupTitle || item.title}</p>
                  <p className="text-xs text-slate-600">{item.recommendedAction}</p>
                </div>
                <span className="inline-flex shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  {item.priorityLabel} · {item.score}
                </span>
              </div>
              {Array.isArray(item.relatedActions) && item.relatedActions.length > 0 ? (
                <details style={{ marginTop: "8px" }}>
                  <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                    Related actions ({item.relatedActions.length})
                  </summary>
                  <div className="grid gap-2" style={{ marginTop: "8px" }}>
                    {item.relatedActions.slice(0, 4).map((action) => (
                      <div key={action.id} className="rounded-md border border-slate-200 bg-white px-2 py-2">
                        <p className="text-xs font-semibold text-slate-800">{action.title}</p>
                        <p className="text-xs text-slate-600">{action.type} · {action.actionTheme} · score {action.score}</p>
                        <p className="text-xs text-slate-700" style={{ marginTop: "4px" }}>{action.recommendedAction}</p>
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}
              <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => copyItem(`${item.groupTitle || item.title}\nTheme: ${item.actionTheme || "mixed"}\nSignals: ${(item.combinedSignals || []).join(", ")}\nAction: ${item.recommendedAction}\nNext: ${item.nextCommandOrPrompt || "n/a"}`, `${item.id}-action`)}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {buttonLabel(`${item.id}-action`, "Action")}
                </button>
                <button
                  type="button"
                  onClick={() => copyItem(item.codexPrompt || "", `${item.id}-prompt`)}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  disabled={!item.codexPrompt}
                >
                  {buttonLabel(`${item.id}-prompt`, "Details")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeeklyDigestPanel({ digestText, loading }) {
  const previewLines = digestText
    ? digestText
      .split("\n")
      .filter((line) => line.trim().startsWith("- "))
      .slice(0, 4)
    : [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-md flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={15} /></span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Weekly Digest</p>
            <p className="text-xs text-slate-600">Plain-English summary of what matters this week.</p>
          </div>
        </div>
        <button className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">View digest</button>
      </div>
      {loading ? (
        <p className="text-sm text-slate-500" style={{ marginTop: "var(--space-sm)" }}>Loading digest preview…</p>
      ) : !digestText ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>
          Digest not found. Run <code>npm run seo:digest</code>.
        </p>
      ) : (
        <details className="rounded-lg border border-slate-100 bg-slate-50" style={{ marginTop: "var(--space-sm)", padding: "var(--space-sm)" }}>
          <summary className="cursor-pointer text-xs font-semibold text-slate-700">Digest preview</summary>
          <div style={{ marginTop: "8px" }}>
            {previewLines.map((line, idx) => (
              <p key={idx} className="text-xs text-slate-700">{line}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function ActionInboxPanel({ inboxReport, loading }) {
  const topItems = Array.isArray(inboxReport?.items) ? inboxReport.items.slice(0, 2) : [];
  const restItems = Array.isArray(inboxReport?.items) ? inboxReport.items.slice(2, 8) : [];
  const summary = inboxReport?.summary || {};
  const stateItem = topItems.find((item) => item.source === "sentinel_state");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-md flex-wrap">
        <div>
          <p className="text-sm font-semibold text-slate-900">Action Inbox</p>
          <p className="text-xs text-slate-600">What needs attention and what can wait.</p>
        </div>
        <button className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">View inbox</button>
      </div>
      {loading ? (
        <p className="text-sm text-slate-500" style={{ marginTop: "var(--space-sm)" }}>Loading inbox…</p>
      ) : !inboxReport ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>
          Inbox missing. Run <code>npm run seo:inbox</code>.
        </p>
      ) : (
        <>
          <p className="text-xs text-slate-600" style={{ marginTop: "var(--space-sm)" }}>
            High priority: {summary.highPriority || 0} · Awaiting review: {summary.awaitingReview || 0} · Suggested: {summary.suggested || 0}
          </p>
          {stateItem ? (
            <p className="text-sm text-slate-700" style={{ marginTop: "6px" }}>
              Current queue: <span className="font-semibold text-slate-900">{stateItem.title}</span>
            </p>
          ) : null}
          {summary.noUrgentAction ? (
            <p className="text-sm text-emerald-700" style={{ marginTop: "6px" }}>No urgent action. Strategic opportunities available.</p>
          ) : null}
          <div className="grid gap-2" style={{ marginTop: "8px" }}>
            {topItems.map((item) => (
              <div key={item.id} className="rounded-md border border-slate-100 bg-slate-50 px-2 py-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    item.status === "awaiting_review"
                      ? "bg-amber-50 text-amber-800"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {formatStateLabel(item.status)}
                  </span>
                </div>
                <p className="text-xs text-slate-600" style={{ marginTop: "3px" }}>
                  {formatStateLabel(item.source)} · {item.priority}
                  {item.relatedPlanId ? ` · ${item.relatedPlanId}` : ""}
                </p>
                {item.recommendedNextStep ? (
                  <p className="text-xs text-slate-700" style={{ marginTop: "5px" }}>{item.recommendedNextStep}</p>
                ) : null}
              </div>
            ))}
          </div>
          {restItems.length > 0 ? (
            <details style={{ marginTop: "8px" }}>
              <summary className="cursor-pointer text-xs font-medium text-slate-600">Show all</summary>
              <div className="grid gap-1" style={{ marginTop: "6px" }}>
                {restItems.map((item) => (
                  <p key={item.id} className="text-xs text-slate-600">{item.title}</p>
                ))}
              </div>
            </details>
          ) : null}
        </>
      )}
    </div>
  );
}

function ContentWorkbenchPanel({
  items,
  loading,
  onStatusChange,
  onOpenArticle,
  standaloneMode = false,
  actionRegistry = sentinelActionRegistry,
  authoritySnapshot,
  onWorkflowActionComplete,
}) {
  const [selectedId, setSelectedId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const [copyTarget, setCopyTarget] = useState("");
  const [copyState, setCopyState] = useState("idle");
  const [workflowActionStates, setWorkflowActionStates] = useState({});
  const [workflowHistory, setWorkflowHistory] = useState(() => readWorkflowActionHistory());
  const actions = useMemo(() => (
    Array.isArray(actionRegistry?.actions) ? actionRegistry.actions : []
  ), [actionRegistry]);
  const actionById = useMemo(() => new Map(actions.map((action) => [action.id, action])), [actions]);
  const authorityAllowsExecution = canUseOperatorAuthority(authoritySnapshot);
  const authorityMessage = authorityDisabledMessage(authoritySnapshot);

  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))];
  const priorities = [...new Set(items.map((item) => item.priority).filter(Boolean))]
    .sort((a, b) => (CONTENT_PRIORITY_ORDER[a] ?? 9) - (CONTENT_PRIORITY_ORDER[b] ?? 9));
  const filteredItems = items.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (priorityFilter !== "all" && item.priority !== priorityFilter) return false;
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (publishedFilter === "published" && !item.published) return false;
    if (publishedFilter === "unpublished" && item.published) return false;
    if (ownershipFilter === "assigned" && !item.owner) return false;
    if (ownershipFilter === "unassigned" && item.owner) return false;
    return true;
  });
  const selectedItem = filteredItems.find((item) => item.id === selectedId)
    || items.find((item) => item.id === selectedId)
    || filteredItems[0]
    || items[0]
    || null;

  const statusCounts = CONTENT_LIFECYCLE_STATUSES.reduce((acc, status) => ({
    ...acc,
    [status]: items.filter((item) => item.status === status).length,
  }), {});
  const topNextItem = items.find((item) => ["review", "drafting", "researching", "approved", "discovered"].includes(item.status)) || items[0];
  const topWorkflowAction = getPrimaryWorkflowActionForItem(topNextItem);

  const copyValue = async (value, target) => {
    const ok = await copyText(value, `content workbench ${target}`);
    setCopyTarget(target);
    setCopyState(ok ? "copied" : "failed");
    window.setTimeout(() => {
      setCopyTarget("");
      setCopyState("idle");
    }, 1400);
  };

  const copyLabel = (target, fallback) => {
    if (copyTarget !== target) return fallback;
    if (copyState === "copied") return "Copied";
    if (copyState === "failed") return "Copy failed";
    return fallback;
  };

  const moveStatus = (item, direction) => {
    const currentIndex = CONTENT_LIFECYCLE_STATUSES.indexOf(item.status);
    if (currentIndex < 0) return;
    const nextStatus = CONTENT_LIFECYCLE_STATUSES[currentIndex + direction];
    if (nextStatus) onStatusChange(item.id, nextStatus);
  };

  const workflowActionKey = (item, action) => `${item?.id || "item"}:${action?.id || "action"}`;

  const setWorkflowActionState = (item, action, state) => {
    setWorkflowActionStates((current) => ({
      ...current,
      [workflowActionKey(item, action)]: {
        ...current[workflowActionKey(item, action)],
        ...state,
      },
    }));
  };

  const recordWorkflowAction = (entry) => {
    const nextEntry = {
      id: `workflow-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    };
    setWorkflowHistory((current) => {
      const next = normaliseWorkflowActionHistory({
        entries: [nextEntry, ...(current?.entries || [])],
      });
      writeWorkflowActionHistory(next);
      return next;
    });
  };

  const executeWorkflowAction = async (action, item) => {
    if (!action?.id || !item?.id) return;
    const startedAt = new Date().toISOString();
    setWorkflowActionState(item, action, {
      status: "running",
      message: `${action.label} started.`,
      startedAt,
    });

    const finishAction = async ({ status, message, outputExcerpt = "", toStatus = "", recovery = action.recovery || "" }) => {
      setWorkflowActionState(item, action, {
        status,
        message,
        outputExcerpt,
        recovery,
        finishedAt: new Date().toISOString(),
      });
      recordWorkflowAction({
        itemId: item.id,
        itemTitle: item.title,
        actionId: action.id,
        actionLabel: action.label,
        executionMode: action.executionMode,
        status,
        fromStatus: item.status,
        toStatus,
        message,
        recovery,
      });
      if (typeof onWorkflowActionComplete === "function") {
        await onWorkflowActionComplete();
      }
    };

    if (action.executionMode === "local_transition") {
      if (action.nextStatus && action.nextStatus !== item.status) {
        onStatusChange(item.id, action.nextStatus);
      }
      await finishAction({
        status: "success",
        message: action.expectedResult || `${action.label} completed.`,
        toStatus: action.nextStatus || "",
      });
      return;
    }

    if (action.executionMode === "manual_copy") {
      const copyValueForAction = getWorkflowManualCopyValue(action, item);
      const ok = await copyText(copyValueForAction, `workflow action ${action.id}`);
      await finishAction({
        status: ok ? "success" : "failed",
        message: ok
          ? action.expectedResult || `${action.label} copied.`
          : "Could not copy the workflow step.",
        outputExcerpt: copyValueForAction,
      });
      return;
    }

    if (!authorityAllowsExecution) {
      await finishAction({
        status: "failed",
        message: authorityMessage,
      });
      return;
    }

    if (action.executionMode === "allowlisted_action") {
      const allowlistedAction = actionById.get(action.actionId);
      if (!allowlistedAction?.allowFromUI) {
        await finishAction({
          status: "failed",
          message: "Workflow action is not backed by an allowlisted operator action.",
        });
        return;
      }

      try {
        const response = await fetch(`${sentinelActionApiBaseUrl}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionId: allowlistedAction.id }),
        });
        const payload = await response.json().catch(() => ({
          status: "failed",
          message: "Action API returned a non-JSON response.",
        }));

        if (!response.ok || !payload.executionId) {
          await finishAction({
            status: "failed",
            message: payload.message || "Workflow action could not be started.",
            outputExcerpt: payload.outputExcerpt || payload.error || "",
          });
          return;
        }

        setWorkflowActionState(item, action, {
          status: normaliseExecutionStatus(payload.status),
          message: payload.summary || `${action.label} is running.`,
          executionId: payload.executionId,
          outputExcerpt: payload.outputExcerpt || "",
        });

        const finalExecution = await pollSentinelActionExecution(payload.executionId, {
          onUpdate: (nextExecution) => {
            setWorkflowActionState(item, action, {
              status: normaliseExecutionStatus(nextExecution.status),
              message: nextExecution.summary || `${action.label} is running.`,
              executionId: nextExecution.executionId || payload.executionId,
              outputExcerpt: nextExecution.outputExcerpt || "",
            });
          },
        });
        const finalStatus = normaliseExecutionStatus(finalExecution?.status);
        const succeeded = finalStatus === "success";
        if (succeeded && action.nextStatus && action.nextStatus !== item.status) {
          onStatusChange(item.id, action.nextStatus);
        }
        await finishAction({
          status: succeeded ? "success" : "failed",
          message: finalExecution?.summary || (succeeded ? action.expectedResult : `${action.label} failed.`),
          outputExcerpt: finalExecution?.outputExcerpt || "",
          toStatus: succeeded ? action.nextStatus || "" : "",
        });
      } catch (error) {
        await finishAction({
          status: "failed",
          message: `Could not reach local Sentinel API at ${sentinelActionApiBaseUrl}.`,
          outputExcerpt: error.message,
        });
      }
      return;
    }

    await finishAction({
      status: "failed",
      message: "Workflow action mode is not supported yet.",
    });
  };

  const stageForItem = (item) => CONTENT_STATUS_GROUPS.find((group) => group.statuses.includes(item?.status))
    || CONTENT_STATUS_GROUPS[0];
  const stageCounts = CONTENT_STATUS_GROUPS.map((group) => ({
    ...group,
    count: filteredItems.filter((item) => group.statuses.includes(item.status)).length,
  }));
  const standaloneQueue = [...filteredItems].sort((a, b) => {
    const selectedDelta = (selectedItem?.id === b.id ? 1 : 0) - (selectedItem?.id === a.id ? 1 : 0);
    if (selectedDelta !== 0) return selectedDelta;
    const statusDelta = CONTENT_LIFECYCLE_STATUSES.indexOf(a.status) - CONTENT_LIFECYCLE_STATUSES.indexOf(b.status);
    if (statusDelta !== 0) return statusDelta;
    return (CONTENT_PRIORITY_ORDER[a.priority] ?? 9) - (CONTENT_PRIORITY_ORDER[b.priority] ?? 9);
  });
  const selectedWorkflowGroups = getWorkflowActionGroupsForItem(selectedItem);
  const selectedWorkflowHistory = (workflowHistory?.entries || [])
    .filter((entry) => entry.itemId === selectedItem?.id)
    .slice(0, 4);
  const latestWorkflowAction = selectedItem ? getPrimaryWorkflowActionForItem(selectedItem) : null;
  const latestWorkflowActionState = selectedItem && latestWorkflowAction
    ? workflowActionStates[workflowActionKey(selectedItem, latestWorkflowAction)]
    : null;

  const renderWorkflowActionButton = (action, item, primary = false) => {
    const state = workflowActionStates[workflowActionKey(item, action)] || {};
    const actionStatus = state.status ? normaliseExecutionStatus(state.status) : "";
    const running = actionStatus === "running" || actionStatus === "queued";
    const locked = (action.executionMode === "allowlisted_action" || action.executionMode === "allowlisted_pipeline") && !authorityAllowsExecution;
    const disabled = running || locked;

    return (
      <button
        key={action.id}
        type="button"
        onClick={() => executeWorkflowAction(action, item)}
        disabled={disabled}
        title={locked ? authorityMessage : `${workflowActionSafetyLabel(action)}. ${action.description || ""}`}
        className={workflowActionButtonClass(action, primary)}
      >
        {running ? "Running" : action.label}
        <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-semibold">
          {workflowActionModeLabel(action)}
        </span>
      </button>
    );
  };

  if (standaloneMode) {
    const selectedStage = selectedItem ? stageForItem(selectedItem) : null;

    return (
      <section className="relative overflow-hidden rounded-[30px] bg-[#eef4f4] p-4 text-slate-950 shadow-2xl shadow-slate-950/25 ring-1 ring-white/20 md:p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_18%_0%,rgba(20,184,166,0.2),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.08),transparent)]" aria-hidden="true" />
        <div className="relative">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-800/70">Editorial workspace</p>
              <h2 className="font-heading text-3xl font-semibold tracking-[-0.045em] text-slate-950 md:text-4xl">Content Workbench</h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-600" style={{ marginTop: "6px" }}>
                Pick one article, move the status, then use the detail panel to keep the next step clear.
              </p>
            </div>
            <div className="grid min-w-[240px] grid-cols-3 gap-3 border-l border-slate-200 pl-4 text-sm">
              <div>
                <p className="text-slate-500">Total</p>
                <p className="text-xl font-semibold tracking-[-0.04em] text-slate-950">{items.length}</p>
              </div>
              <div>
                <p className="text-slate-500">Review</p>
                <p className="text-xl font-semibold tracking-[-0.04em] text-amber-700">{(statusCounts.review || 0) + (statusCounts.ready || 0)}</p>
              </div>
              <div>
                <p className="text-slate-500">Live</p>
                <p className="text-xl font-semibold tracking-[-0.04em] text-emerald-700">{(statusCounts.published || 0) + (statusCounts.monitoring || 0)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4" style={{ marginTop: "20px" }} aria-label="Content workflow stages">
            {stageCounts.map((stage) => {
              const active = selectedStage?.id === stage.id;
              return (
                <div
                  key={stage.id}
                  className={`rounded-2xl border px-4 py-3 transition-colors ${
                    active
                      ? "border-cyan-300 bg-white shadow-lg shadow-cyan-900/5"
                      : "border-slate-200/80 bg-white/55"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">{stage.label}</p>
                    <span className={active ? "text-sm font-semibold text-cyan-700" : "text-sm font-semibold text-slate-500"}>{stage.count}</span>
                  </div>
                  <div className="h-1 rounded-full bg-slate-200" style={{ marginTop: "10px" }}>
                    <div
                      className={`h-1 rounded-full ${active ? "bg-cyan-500" : "bg-slate-400"}`}
                      style={{ width: `${Math.min(100, Math.max(9, stage.count * 16))}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500" style={{ marginTop: "8px" }}>
                    {stage.statuses.map((status) => CONTENT_STATUS_META[status]?.label || formatStateLabel(status)).join(" / ")}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/60 p-2" style={{ marginTop: "16px" }}>
            {[
              ["Status", statusFilter, setStatusFilter, ["all", ...CONTENT_LIFECYCLE_STATUSES]],
              ["Priority", priorityFilter, setPriorityFilter, ["all", ...priorities]],
              ["Category", categoryFilter, setCategoryFilter, ["all", ...categories]],
            ].map(([label, value, setter, options]) => (
              <label key={label} className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-slate-500 ring-1 ring-slate-100">
                {label}
                <select
                  value={value}
                  onChange={(event) => setter(event.target.value)}
                  className="bg-transparent text-sm font-semibold text-slate-800 outline-none"
                >
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option === "all"
                        ? "All"
                        : CONTENT_STATUS_META[option]?.label || contentCategoryLabel(option)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-slate-500 ring-1 ring-slate-100">
              Publication
              <select value={publishedFilter} onChange={(event) => setPublishedFilter(event.target.value)} className="bg-transparent text-sm font-semibold text-slate-800 outline-none">
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="unpublished">Not published</option>
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-slate-500 ring-1 ring-slate-100">
              Owner
              <select value={ownershipFilter} onChange={(event) => setOwnershipFilter(event.target.value)} className="bg-transparent text-sm font-semibold text-slate-800 outline-none">
                <option value="all">All</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </label>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500" style={{ marginTop: "18px" }}>Loading content workflow signals...</p>
          ) : !items.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-600" style={{ marginTop: "18px" }}>
              Content workflow data is not available yet. Run the SEO reports to populate opportunities, plans and QA signals.
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.42fr)]" style={{ marginTop: "18px" }}>
              <div className="grid gap-5">
                {CONTENT_STATUS_GROUPS.map((stage) => {
                  const stageItems = standaloneQueue.filter((item) => stage.statuses.includes(item.status));
                  if (!stageItems.length) return null;
                  return (
                    <section key={stage.id} className="grid gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="h-px w-8 bg-slate-300" />
                          <h3 className="text-sm font-semibold text-slate-700">{stage.label}</h3>
                        </div>
                        <span className="text-xs text-slate-500">{stageItems.length} active</span>
                      </div>
                      <div className="grid gap-3 lg:grid-cols-2">
                        {stageItems.map((item) => {
                          const active = selectedItem?.id === item.id;
                          const itemStage = stageForItem(item);
                          const cardWorkflowAction = getPrimaryWorkflowActionForItem(item);
                          const cardActionState = cardWorkflowAction ? workflowActionStates[workflowActionKey(item, cardWorkflowAction)] : null;
                          const cardActionStatus = cardActionState?.status ? normaliseExecutionStatus(cardActionState.status) : "";
                          const cardActionRunning = ["queued", "running"].includes(cardActionStatus);
                          const cardActionLocked = cardWorkflowAction
                            && (cardWorkflowAction.executionMode === "allowlisted_action" || cardWorkflowAction.executionMode === "allowlisted_pipeline")
                            && !authorityAllowsExecution;
                          return (
                            <article
                              key={item.id}
                              tabIndex={0}
                              role="button"
                              aria-pressed={active}
                              onClick={() => setSelectedId(item.id)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  setSelectedId(item.id);
                                }
                              }}
                              className={`group cursor-pointer rounded-[24px] border bg-white p-4 text-left shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                                active
                                  ? "border-cyan-300 shadow-xl shadow-cyan-900/10 ring-1 ring-cyan-200"
                                  : "border-slate-200/80 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className={`h-2 w-2 rounded-full ${active ? "bg-cyan-500" : "bg-slate-300"}`} />
                                    <span>{itemStage.label}</span>
                                    <span>{CONTENT_STATUS_META[item.status]?.label || formatStateLabel(item.status)}</span>
                                  </div>
                                  <h4 className="text-lg font-semibold leading-snug tracking-[-0.025em] text-slate-950" style={{ marginTop: "8px" }}>
                                    {item.title}
                                  </h4>
                                </div>
                                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                  {formatStateLabel(item.priority)}
                                </span>
                              </div>
                              <p className="line-clamp-2 text-sm leading-6 text-slate-600" style={{ marginTop: "10px" }}>
                                {item.nextAction || item.summary}
                              </p>
                              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3" style={{ marginTop: "14px" }}>
                                <p className="text-xs text-slate-500">
                                  {item.categoryLabel || contentCategoryLabel(item.category)}
                                  {item.targetSlug ? ` · ${item.targetSlug}` : ""}
                                </p>
                                {cardWorkflowAction ? (
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      executeWorkflowAction(cardWorkflowAction, item);
                                    }}
                                    disabled={cardActionRunning || cardActionLocked}
                                    className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    title={cardActionLocked ? authorityMessage : cardWorkflowAction.description}
                                  >
                                    {cardActionRunning ? "Running" : cardWorkflowAction.label}
                                  </button>
                                ) : (
                                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">No action</span>
                                )}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>

              <aside className="h-fit rounded-[28px] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/25 xl:sticky xl:top-24">
                {selectedItem ? (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-cyan-200">Working on</p>
                        <h3 className="text-2xl font-semibold leading-tight tracking-[-0.035em]" style={{ marginTop: "6px" }}>{selectedItem.title}</h3>
                        <p className="text-sm text-slate-400" style={{ marginTop: "8px" }}>{selectedItem.targetTopic || selectedItem.categoryLabel}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200">
                        {formatStateLabel(selectedItem.priority)}
                      </span>
                    </div>

                    <div className="rounded-2xl bg-cyan-200 p-4 text-slate-950" style={{ marginTop: "18px" }}>
                      <p className="text-xs font-semibold text-cyan-950/70">Next workflow action</p>
                      <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginTop: "5px" }}>
                        <p className="text-base font-semibold leading-6">
                          {latestWorkflowAction?.label || selectedItem.nextAction}
                        </p>
                        {latestWorkflowAction ? renderWorkflowActionButton(latestWorkflowAction, selectedItem, true) : null}
                      </div>
                      <p className="text-sm leading-6 text-cyan-950/75" style={{ marginTop: "6px" }}>
                        {latestWorkflowAction?.description || selectedItem.nextAction}
                      </p>
                      {latestWorkflowActionState?.message ? (
                        <p className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                          normaliseExecutionStatus(latestWorkflowActionState.status) === "failed"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-white/65 text-cyan-950"
                        }`} style={{ marginTop: "10px" }}>
                          {latestWorkflowActionState.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-3" style={{ marginTop: "16px" }}>
                      {selectedWorkflowGroups.primary.length ? (
                        <section className="grid gap-2">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-sm font-semibold text-white">Primary actions</h4>
                            <span className="text-xs text-slate-500">Task first</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedWorkflowGroups.primary.map((action) => renderWorkflowActionButton(action, selectedItem, true))}
                          </div>
                        </section>
                      ) : null}

                      {selectedWorkflowGroups.secondary.length ? (
                        <section className="grid gap-2">
                          <h4 className="text-sm font-semibold text-slate-200">Secondary actions</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedWorkflowGroups.secondary.map((action) => renderWorkflowActionButton(action, selectedItem))}
                          </div>
                        </section>
                      ) : null}

                      {selectedWorkflowGroups.manual.length ? (
                        <section className="grid gap-2">
                          <h4 className="text-sm font-semibold text-slate-200">Manual handoff</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedWorkflowGroups.manual.map((action) => renderWorkflowActionButton(action, selectedItem))}
                          </div>
                        </section>
                      ) : null}
                    </div>

                    <div className="grid gap-4" style={{ marginTop: "18px" }}>
                      <section>
                        <h4 className="text-sm font-semibold text-white">Why this matters</h4>
                        <p className="text-sm leading-6 text-slate-300" style={{ marginTop: "6px" }}>{selectedItem.summary}</p>
                      </section>
                      <section>
                        <h4 className="text-sm font-semibold text-white">Content goal</h4>
                        <p className="text-sm leading-6 text-slate-300" style={{ marginTop: "6px" }}>{selectedItem.contentGoal}</p>
                      </section>
                      {selectedItem.suggestedAngle ? (
                        <section>
                          <h4 className="text-sm font-semibold text-white">Suggested angle</h4>
                          <p className="text-sm leading-6 text-slate-300" style={{ marginTop: "6px" }}>{selectedItem.suggestedAngle}</p>
                        </section>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs" style={{ marginTop: "18px" }}>
                      <div className="rounded-2xl bg-white/8 p-3">
                        <p className="text-slate-500">Opportunity</p>
                        <p className="font-semibold text-slate-100">{selectedItem.relatedOpportunityId || "none"}</p>
                      </div>
                      <div className="rounded-2xl bg-white/8 p-3">
                        <p className="text-slate-500">Plan</p>
                        <p className="font-semibold text-slate-100">{selectedItem.relatedPlanId || "none"}</p>
                      </div>
                      <div className="rounded-2xl bg-white/8 p-3">
                        <p className="text-slate-500">Article QA</p>
                        <p className="font-semibold text-slate-100">{selectedItem.articleGate || "not checked"}{selectedItem.articleScore !== null ? ` · ${selectedItem.articleScore}` : ""}</p>
                      </div>
                      <div className="rounded-2xl bg-white/8 p-3">
                        <p className="text-slate-500">Owner</p>
                        <p className="font-semibold text-slate-100">{selectedItem.owner || "unassigned"}</p>
                      </div>
                    </div>

                    <details className="rounded-2xl bg-white/8 p-3 text-sm text-slate-300" style={{ marginTop: "18px" }}>
                      <summary className="cursor-pointer font-semibold text-slate-100">Advanced manual controls</summary>
                      <div className="grid gap-3" style={{ marginTop: "12px" }}>
                        <label className="grid gap-2 text-sm text-slate-300">
                          Workflow status
                          <select
                            value={selectedItem.status}
                            onChange={(event) => onStatusChange(selectedItem.id, event.target.value)}
                            className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white"
                          >
                            {CONTENT_LIFECYCLE_STATUSES.map((status) => (
                              <option key={status} value={status}>{CONTENT_STATUS_META[status]?.label || formatStateLabel(status)}</option>
                            ))}
                          </select>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => moveStatus(selectedItem, -1)}
                            disabled={CONTENT_LIFECYCLE_STATUSES.indexOf(selectedItem.status) <= 0}
                            className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Move back
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStatus(selectedItem, 1)}
                            disabled={CONTENT_LIFECYCLE_STATUSES.indexOf(selectedItem.status) >= CONTENT_LIFECYCLE_STATUSES.length - 1}
                            className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Move forward
                          </button>
                          {selectedItem.briefCommand ? (
                            <button
                              type="button"
                              onClick={() => copyValue(selectedItem.briefCommand, `${selectedItem.id}-command`)}
                              className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                            >
                              {copyLabel(`${selectedItem.id}-command`, "Copy raw command")}
                            </button>
                          ) : null}
                          {selectedItem.briefPrompt ? (
                            <button
                              type="button"
                              onClick={() => copyValue(selectedItem.briefPrompt, `${selectedItem.id}-brief`)}
                              className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                            >
                              {copyLabel(`${selectedItem.id}-brief`, "Copy brief prompt")}
                            </button>
                          ) : null}
                          {selectedItem.targetSlug ? (
                            <button
                              type="button"
                              onClick={() => onOpenArticle(selectedItem.targetSlug)}
                              className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                            >
                              Open QA planner
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </details>

                    <div className="border-t border-white/10 pt-4 text-xs text-slate-400" style={{ marginTop: "18px" }}>
                      <p className="font-semibold text-slate-200">Workflow notes</p>
                      <p style={{ marginTop: "5px" }}>
                        Current status is {CONTENT_STATUS_META[selectedItem.status]?.label || formatStateLabel(selectedItem.status)}.
                        {selectedItem.statusUpdatedAt ? ` Last changed ${formatDateTime(selectedItem.statusUpdatedAt)}.` : " No local status change recorded yet."}
                      </p>
                      {selectedWorkflowHistory.length ? (
                        <div className="grid gap-2" style={{ marginTop: "10px" }}>
                          {selectedWorkflowHistory.map((entry) => (
                            <div key={entry.id} className="rounded-xl bg-white/8 p-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-slate-200">{entry.actionLabel}</span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${actionStatusBadgeClass(entry.status)}`}>
                                  {formatStateLabel(entry.status)}
                                </span>
                              </div>
                              <p style={{ marginTop: "3px" }}>{entry.message || "Workflow action recorded."}</p>
                              <p className="text-slate-500" style={{ marginTop: "3px" }}>{formatDateTime(entry.createdAt)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ marginTop: "8px" }}>No workflow action history recorded for this item yet.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-300">Select a content item to start working.</p>
                )}
              </aside>
            </div>
          )}
        </div>
      </section>
    );
  }

  const shellClass = standaloneMode
    ? "overflow-hidden rounded-[34px] bg-slate-100/95 p-5 text-slate-950 shadow-2xl shadow-slate-950/20 ring-1 ring-white/20 md:p-6"
    : "rounded-[28px] bg-white/90 p-5 shadow-sm ring-1 ring-slate-100/80";
  const summaryClass = standaloneMode
    ? "grid gap-2 border-l border-slate-200 pl-4 text-sm sm:min-w-[300px]"
    : "grid gap-2 rounded-2xl bg-slate-50/80 p-3 text-sm ring-1 ring-slate-100 sm:min-w-[260px]";
  const focusClass = standaloneMode
    ? "rounded-[24px] bg-slate-950 p-5 text-white shadow-xl shadow-slate-950/10"
    : "rounded-2xl bg-pink-50/70 p-4 ring-1 ring-pink-100";
  const filterSelectClass = standaloneMode
    ? "rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm"
    : "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800";
  const laneClass = standaloneMode
    ? "rounded-[24px] bg-white/75 p-3 ring-1 ring-slate-200/70"
    : "rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100";
  const itemClass = (item) => `rounded-[20px] border bg-white p-3 shadow-sm transition-colors ${
    selectedItem?.id === item.id
      ? standaloneMode
        ? "border-cyan-300 ring-2 ring-cyan-100"
        : "border-pink-200 ring-2 ring-pink-100"
      : "border-slate-100 hover:border-slate-200"
  }`;

  return (
    <section className={shellClass}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className={standaloneMode ? "text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700" : "text-xs font-semibold uppercase tracking-[0.16em] text-pink-600"}>Editorial Operations</p>
          <h2 className={standaloneMode ? "text-3xl font-semibold tracking-[-0.03em] text-slate-950" : "text-2xl font-semibold text-slate-950"}>Content Workbench</h2>
          <p className={standaloneMode ? "max-w-2xl text-sm leading-6 text-slate-600" : "text-sm text-slate-600"}>
            Article-level workflow built from opportunities, execution plans, action inbox items and QA signals.
            Infrastructure controls remain in Actions and Diagnostics.
          </p>
        </div>
        <div className={summaryClass}>
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-slate-600">Items</span>
            <span className="font-semibold text-slate-950">{items.length}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-slate-600">Review/ready</span>
            <span className="font-semibold text-amber-700">{(statusCounts.review || 0) + (statusCounts.ready || 0)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-slate-600">Live/monitoring</span>
            <span className="font-semibold text-emerald-700">{(statusCounts.published || 0) + (statusCounts.monitoring || 0)}</span>
          </div>
        </div>
      </div>

      {topNextItem ? (
        <div className={focusClass} style={{ marginTop: "18px" }}>
          <p className={standaloneMode ? "text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200" : "text-xs font-semibold uppercase tracking-[0.12em] text-pink-700"}>Recommended content focus</p>
          <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginTop: "4px" }}>
            <p className={standaloneMode ? "text-lg font-semibold tracking-[-0.02em] text-white" : "text-sm font-semibold text-slate-950"}>{topNextItem.title}</p>
            {topWorkflowAction ? renderWorkflowActionButton(topWorkflowAction, topNextItem, true) : null}
          </div>
          <p className={standaloneMode ? "text-sm leading-6 text-slate-300" : "text-sm text-slate-700"} style={{ marginTop: "4px" }}>
            {topWorkflowAction ? `${topWorkflowAction.label}: ${topWorkflowAction.description}` : topNextItem.nextAction}
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-5" style={{ marginTop: "16px" }}>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={filterSelectClass}>
            <option value="all">All statuses</option>
            {CONTENT_LIFECYCLE_STATUSES.map((status) => (
              <option key={status} value={status}>{CONTENT_STATUS_META[status]?.label || formatStateLabel(status)}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          Priority
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className={filterSelectClass}>
            <option value="all">All priorities</option>
            {priorities.map((priority) => <option key={priority} value={priority}>{formatStateLabel(priority)}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          Category
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={filterSelectClass}>
            <option value="all">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{contentCategoryLabel(category)}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          Publication
          <select value={publishedFilter} onChange={(event) => setPublishedFilter(event.target.value)} className={filterSelectClass}>
            <option value="all">Published and planned</option>
            <option value="published">Published only</option>
            <option value="unpublished">Not published</option>
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          Owner
          <select value={ownershipFilter} onChange={(event) => setOwnershipFilter(event.target.value)} className={filterSelectClass}>
            <option value="all">Assigned and unassigned</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500" style={{ marginTop: "16px" }}>Loading content workflow signals…</p>
      ) : !items.length ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-100" style={{ marginTop: "16px" }}>
          Content workflow data is not available yet. Run the SEO reports to populate opportunities, plans and QA signals.
        </div>
      ) : (
        <div className={standaloneMode ? "grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.45fr)]" : "grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]"} style={{ marginTop: "18px" }}>
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
            {CONTENT_STATUS_GROUPS.map((group) => {
              const groupItems = filteredItems.filter((item) => group.statuses.includes(item.status));
              return (
                <div key={group.id} className={laneClass}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{group.label}</p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-100">{groupItems.length}</span>
                  </div>
                  <div className="grid gap-2" style={{ marginTop: "10px" }}>
                    {groupItems.length ? groupItems.map((item) => (
                      <article
                        key={item.id}
                        className={itemClass(item)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold leading-snug text-slate-950">{item.title}</p>
                            <p className="text-xs text-slate-500" style={{ marginTop: "4px" }}>
                              {item.targetSlug || "New resource"} · {item.categoryLabel}
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${CONTENT_STATUS_META[item.status]?.tone || "bg-slate-50 text-slate-700 ring-slate-100"}`}>
                            {CONTENT_STATUS_META[item.status]?.label || formatStateLabel(item.status)}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-xs text-slate-600" style={{ marginTop: "8px" }}>{item.summary}</p>
                        <div className="flex flex-wrap gap-1.5" style={{ marginTop: "8px" }}>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{formatStateLabel(item.priority)}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{item.published ? "published" : "not published"}</span>
                          {item.relatedPlanId ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">plan linked</span> : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2" style={{ marginTop: "10px" }}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Open details
                          </button>
                          <select
                            value={item.status}
                            onChange={(event) => onStatusChange(item.id, event.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                            aria-label={`Set workflow status for ${item.title}`}
                          >
                            {CONTENT_LIFECYCLE_STATUSES.map((status) => (
                              <option key={status} value={status}>{CONTENT_STATUS_META[status]?.label || formatStateLabel(status)}</option>
                            ))}
                          </select>
                        </div>
                      </article>
                    )) : (
                      <p className="rounded-xl bg-white p-3 text-xs text-slate-500 ring-1 ring-slate-100">No matching items in this lane.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <aside className={standaloneMode ? "rounded-[28px] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20" : "rounded-2xl bg-slate-950 p-4 text-white shadow-sm"}>
            {selectedItem ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-200">Selected content item</p>
                    <h3 className="text-xl font-semibold" style={{ marginTop: "4px" }}>{selectedItem.title}</h3>
                    <p className="text-sm text-slate-300" style={{ marginTop: "6px" }}>{selectedItem.targetTopic || selectedItem.categoryLabel}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200">
                    {formatStateLabel(selectedItem.priority)}
                  </span>
                </div>

                <div className="grid gap-3" style={{ marginTop: "16px" }}>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Content goal</p>
                    <p className="text-sm text-slate-100" style={{ marginTop: "6px" }}>{selectedItem.contentGoal}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Opportunity rationale</p>
                    <p className="text-sm text-slate-100" style={{ marginTop: "6px" }}>{selectedItem.summary}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Recommended next step</p>
                    <p className="text-sm text-slate-100" style={{ marginTop: "6px" }}>{selectedItem.nextAction}</p>
                  </div>
                  {selectedItem.suggestedAngle ? (
                    <div className="rounded-2xl bg-white/10 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Suggested angle</p>
                      <p className="text-sm text-slate-100" style={{ marginTop: "6px" }}>{selectedItem.suggestedAngle}</p>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-3" style={{ marginTop: "14px" }}>
                  {selectedWorkflowGroups.primary.length ? (
                    <section className="grid gap-2">
                      <h4 className="text-sm font-semibold text-white">Workflow actions</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorkflowGroups.primary.map((action) => renderWorkflowActionButton(action, selectedItem, true))}
                      </div>
                    </section>
                  ) : null}
                  {selectedWorkflowGroups.secondary.length ? (
                    <section className="grid gap-2">
                      <h4 className="text-sm font-semibold text-slate-200">Support actions</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorkflowGroups.secondary.slice(0, 3).map((action) => renderWorkflowActionButton(action, selectedItem))}
                      </div>
                    </section>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs" style={{ marginTop: "14px" }}>
                  <div className="rounded-xl bg-white/10 p-2">
                    <p className="text-slate-400">Opportunity</p>
                    <p className="font-semibold text-slate-100">{selectedItem.relatedOpportunityId || "none"}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-2">
                    <p className="text-slate-400">Plan</p>
                    <p className="font-semibold text-slate-100">{selectedItem.relatedPlanId || "none"}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-2">
                    <p className="text-slate-400">Article QA</p>
                    <p className="font-semibold text-slate-100">{selectedItem.articleGate || "not checked"}{selectedItem.articleScore !== null ? ` · ${selectedItem.articleScore}` : ""}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-2">
                    <p className="text-slate-400">Owner</p>
                    <p className="font-semibold text-slate-100">{selectedItem.owner || "unassigned"}</p>
                  </div>
                </div>

                <details className="rounded-2xl bg-white/10 p-3 text-sm text-slate-300" style={{ marginTop: "14px" }}>
                  <summary className="cursor-pointer font-semibold text-slate-100">Manual controls and commands</summary>
                  <div className="grid gap-3" style={{ marginTop: "12px" }}>
                    <label className="grid gap-2 text-sm text-slate-300">
                      Workflow status
                      <select
                        value={selectedItem.status}
                        onChange={(event) => onStatusChange(selectedItem.id, event.target.value)}
                        className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white"
                      >
                        {CONTENT_LIFECYCLE_STATUSES.map((status) => (
                          <option key={status} value={status}>{CONTENT_STATUS_META[status]?.label || formatStateLabel(status)}</option>
                        ))}
                      </select>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => moveStatus(selectedItem, -1)}
                        disabled={CONTENT_LIFECYCLE_STATUSES.indexOf(selectedItem.status) <= 0}
                        className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Move back
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStatus(selectedItem, 1)}
                        disabled={CONTENT_LIFECYCLE_STATUSES.indexOf(selectedItem.status) >= CONTENT_LIFECYCLE_STATUSES.length - 1}
                        className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Move forward
                      </button>
                      {selectedItem.briefCommand ? (
                        <button
                          type="button"
                          onClick={() => copyValue(selectedItem.briefCommand, `${selectedItem.id}-command`)}
                          className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
                        >
                          {copyLabel(`${selectedItem.id}-command`, "Copy raw command")}
                        </button>
                      ) : null}
                      {selectedItem.briefPrompt ? (
                        <button
                          type="button"
                          onClick={() => copyValue(selectedItem.briefPrompt, `${selectedItem.id}-brief`)}
                          className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
                        >
                          {copyLabel(`${selectedItem.id}-brief`, "Copy brief prompt")}
                        </button>
                      ) : null}
                      {selectedItem.targetSlug ? (
                        <button
                          type="button"
                          onClick={() => onOpenArticle(selectedItem.targetSlug)}
                          className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
                        >
                          Open QA planner
                        </button>
                      ) : null}
                    </div>
                  </div>
                </details>

                <div className="rounded-2xl bg-white/10 p-3 text-xs text-slate-300" style={{ marginTop: "14px" }}>
                  <p className="font-semibold text-slate-100">Workflow history</p>
                  <p style={{ marginTop: "4px" }}>
                    Current status: {CONTENT_STATUS_META[selectedItem.status]?.label || formatStateLabel(selectedItem.status)}.
                    {selectedItem.statusUpdatedAt ? ` Last changed ${formatDateTime(selectedItem.statusUpdatedAt)}.` : " No local status change recorded yet."}
                  </p>
                  {selectedWorkflowHistory.length ? (
                    <div className="grid gap-2" style={{ marginTop: "10px" }}>
                      {selectedWorkflowHistory.map((entry) => (
                        <div key={entry.id} className="rounded-xl bg-white/10 p-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-100">{entry.actionLabel}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${actionStatusBadgeClass(entry.status)}`}>
                              {formatStateLabel(entry.status)}
                            </span>
                          </div>
                          <p style={{ marginTop: "3px" }}>{entry.message || "Workflow action recorded."}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-300">Select a content item to see details.</p>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}

function ExecutionPlansPanel({ plansReport, loading, planApprovalsReport, planStatusReport }) {
  const [copyState, setCopyState] = useState("idle");
  const [copyTarget, setCopyTarget] = useState("");
  const top = Array.isArray(plansReport?.topPlans)
    ? plansReport.topPlans.slice(0, 5)
    : Array.isArray(plansReport?.plans)
      ? plansReport.plans.slice(0, 5)
      : [];
  const approvalByPlanId = new Map(
    (Array.isArray(planApprovalsReport?.approvals) ? planApprovalsReport.approvals : [])
      .map((entry) => [entry.planId, entry]),
  );
  const statusByPlanId = new Map(
    (Array.isArray(planStatusReport?.statuses) ? planStatusReport.statuses : [])
      .map((entry) => [entry.planId, entry]),
  );

  const copyItem = async (text, target) => {
    const ok = await copyText(text, `execution-plan ${target}`);
    setCopyTarget(target);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => {
      setCopyState("idle");
      setCopyTarget("");
    }, 1400);
  };

  const buttonLabel = (target, fallback) => {
    if (copyTarget !== target) return fallback;
    if (copyState === "copied") return "Copied";
    if (copyState === "failed") return "Copy failed";
    return fallback;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" style={{ padding: "var(--space-lg)" }}>
      <div className="flex items-start justify-between gap-md flex-wrap">
        <p className="text-sm text-slate-700">Top plan queue for safe execution.</p>
        <span className="text-xs text-slate-500">Top 5</span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500" style={{ marginTop: "var(--space-sm)" }}>Loading execution plans…</p>
      ) : !plansReport ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>
          Execution plans report missing. Run <code>npm run seo:plans</code>.
        </p>
      ) : top.length === 0 ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>No execution plans available.</p>
      ) : (
        <div className="grid gap-sm" style={{ marginTop: "var(--space-sm)" }}>
          {top.map((plan, index) => (
            <div key={plan.id || index} className="rounded-xl border border-slate-100 bg-slate-50/60" style={{ padding: "var(--space-sm)" }}>
              {(() => {
                const approval = approvalByPlanId.get(plan.id);
                const status = statusByPlanId.get(plan.id);
                return (
                  <>
              <div className="flex items-start justify-between gap-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{index + 1}. {plan.title}</p>
                  <p className="text-xs text-slate-600">{plan.planType} · next: {plan.recommendedWorkflow?.nextCommand || "Review plan output"}</p>
                  <p className="text-xs text-slate-600" style={{ marginTop: "4px" }}>
                    Approval: {approval ? `approved (${approval.approvedFor})` : "not approved"}
                  </p>
                  <p className="text-xs text-slate-600" style={{ marginTop: "4px" }}>
                    Status: {status?.currentStatus || "discovered"}
                  </p>
                </div>
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${plan.requiredHumanReview ? "border-amber-300 bg-amber-50 text-amber-800" : "border-emerald-300 bg-emerald-50 text-emerald-700"}`}>
                  {plan.safetyLevel}
                </span>
              </div>
              <p className="text-sm text-slate-700" style={{ marginTop: "6px" }}>
                Next step: {plan.recommendedWorkflow?.nextCommand || "Review plan output"}
              </p>
              <p className="text-xs text-slate-600" style={{ marginTop: "4px" }}>
                {plan.requiredHumanReview ? "Human review required before patching." : "Safe patch candidate with standard review."}
              </p>
              {status?.nextRecommendedStep ? (
                <p className="text-xs text-slate-600" style={{ marginTop: "4px" }}>
                  Next recommended step: {status.nextRecommendedStep}
                </p>
              ) : null}
              <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => copyItem(plan.codexPlanningPrompt || "", `${plan.id}-planning`)}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  disabled={!plan.codexPlanningPrompt}
                >
                  {buttonLabel(`${plan.id}-planning`, "Planning")}
                </button>
                <button
                  type="button"
                  onClick={() => copyItem(plan.codexPatchPrompt || "", `${plan.id}-patch`)}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  disabled={!plan.codexPatchPrompt}
                >
                  {buttonLabel(`${plan.id}-patch`, "Patch")}
                </button>
                <button
                  type="button"
                  onClick={() => copyItem((plan.validationCommands || []).join("\n"), `${plan.id}-validate`)}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {buttonLabel(`${plan.id}-validate`, "Validate")}
                </button>
                <button
                  type="button"
                  onClick={() => copyItem(`npm run seo:plan:run -- ${plan.id}`, `${plan.id}-run-command`)}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {buttonLabel(`${plan.id}-run-command`, "Run cmd")}
                </button>
                <button
                  type="button"
                  onClick={() => copyItem(`npm run seo:plan:approve -- ${plan.id}`, `${plan.id}-approve-command`)}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {buttonLabel(`${plan.id}-approve-command`, "Approve cmd")}
                </button>
                <button
                  type="button"
                  onClick={() => copyItem(`Run npm run seo:plan:run -- ${plan.id} to generate reports/seo-active-plan.md, review the stages, then apply only after explicit approval.`, `${plan.id}-run-instruction`)}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {buttonLabel(`${plan.id}-run-instruction`, "Details")}
                </button>
              </div>
                </>
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GrowthOpportunitiesPanel({ growthReport, loading }) {
  const [copyState, setCopyState] = useState("idle");
  const [copyTarget, setCopyTarget] = useState("");
  const fromTop = Array.isArray(growthReport?.topOpportunities) ? growthReport.topOpportunities : [];
  const fromAllPrimary = Array.isArray(growthReport?.opportunities)
    ? growthReport.opportunities.filter((op) => op.clusterRole === "primary")
    : [];
  const top = (fromTop.length ? fromTop : fromAllPrimary).slice(0, 3);

  const copyItem = async (text, target) => {
    const ok = await copyText(text, `growth ${target}`);
    setCopyTarget(target);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => {
      setCopyState("idle");
      setCopyTarget("");
    }, 1400);
  };

  const buttonLabel = (target, fallback) => {
    if (copyTarget !== target) return fallback;
    if (copyState === "copied") return "Copied";
    if (copyState === "failed") return "Copy failed";
    return fallback;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80" style={{ padding: "var(--space-lg)" }}>
      <div className="flex items-start justify-between gap-md flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Growth opportunities</p>
          <p className="text-sm text-slate-700">No maintenance action required. Growth opportunities available.</p>
        </div>
        <code className="inline-flex max-w-full overflow-x-auto whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-slate-100">npm run seo:growth</code>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500" style={{ marginTop: "var(--space-sm)" }}>Loading growth opportunities…</p>
      ) : !growthReport ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>
          Growth report missing. Run <code>npm run seo:growth</code> to generate <code>reports/seo-growth-opportunities.json</code>.
        </p>
      ) : top.length === 0 ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>No growth opportunities found in the latest run.</p>
      ) : (
        <div className="grid gap-sm" style={{ marginTop: "var(--space-sm)" }}>
          {top.map((op, index) => (
            <div key={op.id || `${op.type}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50" style={{ padding: "var(--space-sm)" }}>
              <div className="flex items-start justify-between gap-sm flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{index + 1}. {op.title}</p>
                  <p className="text-xs text-slate-600">
                    {op.clusterTitle ? `${op.clusterTitle} · ` : ""}
                    {op.type} · score {op.score} · {op.commercialIntentLabel} intent
                  </p>
                </div>
                <span className="inline-flex rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700">
                  {op.targetSlug ? "Improve/link existing" : "Create brief"}
                </span>
              </div>
              <p className="text-sm text-slate-700" style={{ marginTop: "6px" }}>{op.suggestedAction}</p>
              {(Array.isArray(op.relatedIdeas) && op.relatedIdeas.length > 0) || (Array.isArray(op.mergedQueries) && op.mergedQueries.length > 0) ? (
                <details className="rounded-lg border border-slate-200 bg-white" style={{ marginTop: "8px", padding: "6px 10px" }}>
                  <summary className="cursor-pointer text-xs font-semibold text-slate-600">Related ideas</summary>
                  {Array.isArray(op.relatedIdeas) && op.relatedIdeas.length > 0 ? (
                    <p className="text-xs text-slate-700" style={{ marginTop: "6px" }}>
                      Variants: {op.relatedIdeas.join(" | ")}
                    </p>
                  ) : null}
                  {Array.isArray(op.mergedQueries) && op.mergedQueries.length > 0 ? (
                    <p className="text-xs text-slate-600" style={{ marginTop: "4px" }}>
                      Merged query intents: {op.mergedQueries.join(" | ")}
                    </p>
                  ) : null}
                </details>
              ) : null}
              <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => copyItem(op.suggestedAction, `${op.id}-action`)}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {buttonLabel(`${op.id}-action`, "Copy suggested action")}
                </button>
                <button
                  type="button"
                  onClick={() => copyItem(op.codexPrompt || "", `${op.id}-prompt`)}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  disabled={!op.codexPrompt}
                >
                  {buttonLabel(`${op.id}-prompt`, "Copy Codex prompt")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InternalLinkOpportunitiesPanel({ linksReport, loading }) {
  const [copyState, setCopyState] = useState("idle");
  const [copyTarget, setCopyTarget] = useState("");
  const top = Array.isArray(linksReport?.topOpportunities)
    ? linksReport.topOpportunities.slice(0, 5)
    : Array.isArray(linksReport?.opportunities)
      ? linksReport.opportunities.slice(0, 5)
      : [];

  const copyItem = async (text, target) => {
    const ok = await copyText(text, `links ${target}`);
    setCopyTarget(target);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => {
      setCopyState("idle");
      setCopyTarget("");
    }, 1400);
  };

  const buttonLabel = (target, fallback) => {
    if (copyTarget !== target) return fallback;
    if (copyState === "copied") return "Copied";
    if (copyState === "failed") return "Copy failed";
    return fallback;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80" style={{ padding: "var(--space-lg)" }}>
      <div className="flex items-start justify-between gap-md flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Internal link opportunities</p>
          <p className="text-sm text-slate-700">Safe link suggestions to strengthen topic pathways and service discovery.</p>
        </div>
        <code className="inline-flex max-w-full overflow-x-auto whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-slate-100">npm run seo:links</code>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500" style={{ marginTop: "var(--space-sm)" }}>Loading internal link opportunities…</p>
      ) : !linksReport ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>
          Internal link report missing. Run <code>npm run seo:links</code> to generate <code>reports/seo-internal-link-opportunities.json</code>.
        </p>
      ) : top.length === 0 ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>No internal link opportunities found in the latest run.</p>
      ) : (
        <div className="grid gap-sm" style={{ marginTop: "var(--space-sm)" }}>
          {top.map((op, index) => (
            <div key={op.id || `${op.sourceSlug}-${op.targetSlug || op.targetPath}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50" style={{ padding: "var(--space-sm)" }}>
              <div className="flex items-start justify-between gap-sm flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{index + 1}. {op.sourceTitle}</p>
                  <p className="text-xs text-slate-600">{op.sourceSlug} → {op.targetSlug || op.targetPath}</p>
                </div>
                <span className="inline-flex rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700">
                  {op.riskLabel} risk
                </span>
              </div>
              <p className="text-sm text-slate-700" style={{ marginTop: "6px" }}>
                Anchor: <strong>{op.suggestedAnchorText}</strong> · Placement: {op.suggestedPlacement}
              </p>
              <p className="text-xs text-slate-600" style={{ marginTop: "4px" }}>
                Relevance {op.topicalRelevanceScore} · Commercial {op.commercialValueScore} · Intent {op.commercialIntentLabel}
              </p>
              <p className="text-sm text-slate-700" style={{ marginTop: "6px" }}>{op.whyItMatters}</p>
              <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => copyItem(`${op.sourceSlug} → ${op.targetSlug || op.targetPath}\nAnchor: ${op.suggestedAnchorText}\nPlacement: ${op.suggestedPlacement}\nReason: ${op.contextReason}`, `${op.id}-action`)}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {buttonLabel(`${op.id}-action`, "Copy suggested link action")}
                </button>
                <button
                  type="button"
                  onClick={() => copyItem(op.codexPrompt || "", `${op.id}-prompt`)}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  disabled={!op.codexPrompt}
                >
                  {buttonLabel(`${op.id}-prompt`, "Copy Codex prompt")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FreshnessDecayPanel({ freshnessReport, loading }) {
  const [copyState, setCopyState] = useState("idle");
  const [copyTarget, setCopyTarget] = useState("");
  const top = Array.isArray(freshnessReport?.topRefreshCandidates)
    ? freshnessReport.topRefreshCandidates.slice(0, 5)
    : Array.isArray(freshnessReport?.entries)
      ? freshnessReport.entries.slice(0, 5)
      : [];

  const copyItem = async (text, target) => {
    const ok = await copyText(text, `freshness ${target}`);
    setCopyTarget(target);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => {
      setCopyState("idle");
      setCopyTarget("");
    }, 1400);
  };

  const buttonLabel = (target, fallback) => {
    if (copyTarget !== target) return fallback;
    if (copyState === "copied") return "Copied";
    if (copyState === "failed") return "Copy failed";
    return fallback;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80" style={{ padding: "var(--space-lg)" }}>
      <div className="flex items-start justify-between gap-md flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Content refresh opportunities</p>
          <p className="text-sm text-slate-700">Freshness and positioning checks to keep high-value content commercially relevant.</p>
        </div>
        <code className="inline-flex max-w-full overflow-x-auto whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-slate-100">npm run seo:freshness</code>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500" style={{ marginTop: "var(--space-sm)" }}>Loading freshness opportunities…</p>
      ) : !freshnessReport ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>
          Freshness report missing. Run <code>npm run seo:freshness</code> to generate <code>reports/seo-freshness-report.json</code>.
        </p>
      ) : (
        <>
          {Array.isArray(freshnessReport.trends) && freshnessReport.trends.length > 0 ? (
            <p className="text-xs text-slate-600" style={{ marginTop: "var(--space-sm)" }}>
              Trend: {freshnessReport.trends.join(" ")}
            </p>
          ) : null}

          {top.length === 0 ? (
            <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>No refresh candidates found in the latest run.</p>
          ) : (
            <div className="grid gap-sm" style={{ marginTop: "var(--space-sm)" }}>
              {top.map((entry, index) => (
                <div key={entry.slug || index} className="rounded-xl border border-slate-200 bg-slate-50" style={{ padding: "var(--space-sm)" }}>
                  <div className="flex items-start justify-between gap-sm flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{index + 1}. {entry.title}</p>
                      <p className="text-xs text-slate-600">{entry.slug} · {entry.topicalArea}</p>
                    </div>
                    <span className="inline-flex rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700">
                      {entry.decayRisk} decay risk
                    </span>
                  </div>
                  <p className="text-sm text-slate-700" style={{ marginTop: "6px" }}>
                    Freshness {entry.freshnessScore} · Suggested {entry.suggestedRefreshType}
                  </p>
                  <p className="text-xs text-slate-600" style={{ marginTop: "4px" }}>
                    Why: {(entry.staleSignals || []).slice(0, 2).join(" ")}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: "8px" }}>
                    <button
                      type="button"
                      onClick={() => copyItem(`${entry.slug}\nRefresh type: ${entry.suggestedRefreshType}\nSignals: ${(entry.staleSignals || []).join(" | ")}\nActions: ${(entry.suggestedActions || []).join(", ")}`, `${entry.slug}-action`)}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {buttonLabel(`${entry.slug}-action`, "Copy refresh suggestion")}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyItem(entry.codexPrompt || "", `${entry.slug}-prompt`)}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      disabled={!entry.codexPrompt}
                    >
                      {buttonLabel(`${entry.slug}-prompt`, "Copy Codex refresh prompt")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ConversionPathPanel({ conversionReport, loading }) {
  const [copyState, setCopyState] = useState("idle");
  const [copyTarget, setCopyTarget] = useState("");
  const top = Array.isArray(conversionReport?.topConversionPathRisks)
    ? conversionReport.topConversionPathRisks.slice(0, 5)
    : Array.isArray(conversionReport?.entries)
      ? conversionReport.entries.slice(0, 5)
      : [];

  const copyItem = async (text, target) => {
    const ok = await copyText(text, `conversion ${target}`);
    setCopyTarget(target);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => {
      setCopyState("idle");
      setCopyTarget("");
    }, 1400);
  };

  const buttonLabel = (target, fallback) => {
    if (copyTarget !== target) return fallback;
    if (copyState === "copied") return "Copied";
    if (copyState === "failed") return "Copy failed";
    return fallback;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80" style={{ padding: "var(--space-lg)" }}>
      <div className="flex items-start justify-between gap-md flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Conversion path intelligence</p>
          <p className="text-sm text-slate-700">Commercial path suggestions to improve reader-to-enquiry clarity.</p>
        </div>
        <code className="inline-flex max-w-full overflow-x-auto whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-slate-100">npm run seo:conversion</code>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500" style={{ marginTop: "var(--space-sm)" }}>Loading conversion path opportunities…</p>
      ) : !conversionReport ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>
          Conversion report missing. Run <code>npm run seo:conversion</code> to generate <code>reports/seo-conversion-paths.json</code>.
        </p>
      ) : top.length === 0 ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>No conversion path opportunities found in the latest run.</p>
      ) : (
        <div className="grid gap-sm" style={{ marginTop: "var(--space-sm)" }}>
          {top.map((entry, index) => (
            <div key={entry.slug || index} className="rounded-xl border border-slate-200 bg-slate-50" style={{ padding: "var(--space-sm)" }}>
              <div className="flex items-start justify-between gap-sm flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{index + 1}. {entry.title}</p>
                  <p className="text-xs text-slate-600">{entry.slug} · {entry.funnelStage} stage · {entry.intentLevel} intent</p>
                </div>
                <span className="inline-flex rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700">
                  {entry.conversionRisk} risk
                </span>
              </div>
              <p className="text-sm text-slate-700" style={{ marginTop: "6px" }}>
                Score {entry.conversionPathScore} · Current {entry.currentCTATarget || "none"} → Suggested {entry.suggestedCTATarget}
              </p>
              <p className="text-xs text-slate-600" style={{ marginTop: "4px" }}>{entry.whyItMatters}</p>
              <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => copyItem(`${entry.slug}\nCurrent CTA: ${entry.currentCTA || "none"} (${entry.currentCTATarget || "none"})\nSuggested CTA: ${entry.suggestedCTA} (${entry.suggestedCTATarget})\nAction: ${entry.suggestedAction}`, `${entry.slug}-action`)}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {buttonLabel(`${entry.slug}-action`, "Copy conversion suggestion")}
                </button>
                <button
                  type="button"
                  onClick={() => copyItem(entry.codexPrompt || "", `${entry.slug}-prompt`)}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  disabled={!entry.codexPrompt}
                >
                  {buttonLabel(`${entry.slug}-prompt`, "Copy Codex prompt")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressHistoryCard({ points }) {
  if (!points || points.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white" style={{ padding: "var(--space-lg)" }}>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500" style={{ marginBottom: "var(--space-xs)" }}>QA progress history</p>
        <p className="text-sm text-slate-600">Run <code>npm run seo:pipeline</code> a few times to build progress history.</p>
      </div>
    );
  }

  const maxY = Math.max(1, ...points.map((p) => Math.max(p.pass, p.needsReview, p.blocked)));
  const chartWidth = 520;
  const chartHeight = 160;
  const padX = 16;
  const padY = 14;
  const plotW = chartWidth - padX * 2;
  const plotH = chartHeight - padY * 2;
  const xFor = (i) => (points.length === 1 ? chartWidth / 2 : padX + (i * plotW) / (points.length - 1));
  const yFor = (v) => padY + plotH - (v / maxY) * plotH;
  const linePath = (key) => points.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i)} ${yFor(p[key])}`).join(" ");

  const latest = points[points.length - 1];
  const first = points[0];
  const passDelta = latest.pass - first.pass;
  const reviewDelta = latest.needsReview - first.needsReview;
  const blockedDelta = latest.blocked - first.blocked;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80" style={{ padding: "var(--space-lg)" }}>
      <div className="flex items-center justify-between gap-md">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">QA progress history</p>
          <p className="text-sm text-slate-700">Trend across recent pipeline snapshots.</p>
        </div>
        <div className="flex items-center gap-sm text-xs">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Pass</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Needs review</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Blocked</span>
        </div>
      </div>
      <div className="overflow-x-auto" style={{ marginTop: "var(--space-sm)" }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[520px]" role="img" aria-label="QA progress line chart">
          <rect x="0" y="0" width={chartWidth} height={chartHeight} fill="white" />
          {[0.25, 0.5, 0.75, 1].map((step) => (
            <line key={step} x1={padX} y1={padY + plotH * (1 - step)} x2={padX + plotW} y2={padY + plotH * (1 - step)} stroke="#e2e8f0" strokeWidth="1" />
          ))}
          <path d={linePath("pass")} fill="none" stroke="#10b981" strokeWidth="2.5" />
          <path d={linePath("needsReview")} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <path d={linePath("blocked")} fill="none" stroke="#f43f5e" strokeWidth="2.5" />
          {points.map((p, i) => (
            <g key={p.snapshot}>
              <circle cx={xFor(i)} cy={yFor(p.pass)} r="2.5" fill="#10b981" />
              <circle cx={xFor(i)} cy={yFor(p.needsReview)} r="2.5" fill="#f59e0b" />
              <circle cx={xFor(i)} cy={yFor(p.blocked)} r="2.5" fill="#f43f5e" />
              <text x={xFor(i)} y={chartHeight - 3} textAnchor="middle" fontSize="10" fill="#64748b">{p.label}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="grid md:grid-cols-3 gap-md" style={{ marginTop: "var(--space-sm)" }}>
        <BriefBlock label="Pass trend" value={`${first.pass} → ${latest.pass} (${passDelta >= 0 ? "+" : ""}${passDelta})`} />
        <BriefBlock label="Needs review trend" value={`${first.needsReview} → ${latest.needsReview} (${reviewDelta >= 0 ? "+" : ""}${reviewDelta})`} />
        <BriefBlock label="Blocked trend" value={`${first.blocked} → ${latest.blocked} (${blockedDelta >= 0 ? "+" : ""}${blockedDelta})`} />
      </div>
      <p className="text-xs text-slate-500" style={{ marginTop: "var(--space-xs)" }}>
        Milestones: all-pass achieved when needs review and blocked both reach zero. Regressions are flagged in Operator and Monitor modes.
      </p>
    </div>
  );
}

function BatchImprovementQueue({ loading, queue, reportsReady }) {
  const [copiedSlug, setCopiedSlug] = useState("");
  const [copiedAllState, setCopiedAllState] = useState("idle");

  const copyOne = async (item) => {
    if (!item.prompt) return;
    const ok = await copyText(item.prompt, `batch prompt ${item.slug}`);
    if (ok) {
      setCopiedSlug(item.slug);
      setTimeout(() => setCopiedSlug(""), 1200);
    } else {
      setCopiedSlug(`${item.slug}-failed`);
      setTimeout(() => setCopiedSlug(""), 1400);
    } 
  };

  const copyAll = async () => {
    const combined = buildBatchCombinedPrompt(queue);
    if (!combined) return;
    const ok = await copyText(combined, "combined batch prompt");
    setCopiedAllState(ok ? "copied" : "failed");
    setTimeout(() => setCopiedAllState("idle"), 1400);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80" style={{ padding: "var(--space-lg)" }}>
      <div className="flex items-center justify-between gap-sm flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Batch improvement queue</p>
          <p className="text-sm text-slate-700">Top 3 needs_review articles for sequential improvement.</p>
          <p className="text-xs text-slate-500" style={{ marginTop: "4px" }}>
            Generate prompt file: <code>npm run seo:batch:prompt</code>
          </p>
        </div>
        <button
          type="button"
          onClick={copyAll}
          disabled={queue.length === 0}
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {copiedAllState === "copied" ? "Copied all prompts" : copiedAllState === "failed" ? "Copy failed" : "Copy all prompts"}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500" style={{ marginTop: "var(--space-sm)" }}>Preparing batch queue...</p>
      ) : !reportsReady ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>Run <code>npm run seo:pipeline</code> to generate batch recommendations.</p>
      ) : queue.length === 0 ? (
        <p className="text-sm text-slate-600" style={{ marginTop: "var(--space-sm)" }}>No batch-ready article improvements found.</p>
      ) : (
        <div className="grid gap-md" style={{ marginTop: "var(--space-sm)" }}>
          {queue.map((item) => (
            <div key={item.slug} className="rounded-xl border border-slate-200 bg-slate-50" style={{ padding: "var(--space-md)" }}>
              <div className="flex items-start justify-between gap-md flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.rank}. {item.title}</p>
                  <p className="text-xs text-slate-600">{item.slug}</p>
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-white px-2 py-1 border border-slate-200">QA {item.qaScore}</span>
                  <span className="rounded-full bg-white px-2 py-1 border border-slate-200">Priority {item.priorityScore}</span>
                  <span className="rounded-full bg-white px-2 py-1 border border-slate-200">{item.conversionIntentLabel} intent</span>
                </div>
              </div>
              <p className="text-sm text-slate-700" style={{ marginTop: "var(--space-xs)" }}>{item.why}</p>
              <ul className="text-sm text-slate-700 list-disc ml-5" style={{ marginTop: "var(--space-xs)" }}>
                {item.fixSummary.map((line) => <li key={line}>{line}</li>)}
              </ul>
              <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: "var(--space-sm)" }}>
                <code className="inline-flex max-w-full overflow-x-auto whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100">
                  {item.command}
                </code>
                <a href={item.route} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Open article
                </a>
                <button
                  type="button"
                  onClick={() => copyOne(item)}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copiedSlug === item.slug ? "Copied prompt" : copiedSlug === `${item.slug}-failed` ? "Copy failed" : "Copy prompt"}
                </button>
              </div>
              <details className="rounded-lg border border-slate-200 bg-white" style={{ marginTop: "var(--space-sm)", padding: "var(--space-xs) var(--space-sm)" }}>
                <summary className="cursor-pointer text-xs font-semibold text-slate-600">Preview prompt</summary>
                <pre className="text-xs text-slate-700 whitespace-pre-wrap" style={{ marginTop: "8px" }}>{item.prompt}</pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OperatorModePanel({ summaryGate, humanReviewRecommended, queue, pipelineSummary, loading, mode }) {
  const [copyState, setCopyState] = useState("idle");
  const [copyTarget, setCopyTarget] = useState("");
  const pass = Number(summaryGate?.pass || 0);
  const needsReview = Number(summaryGate?.needs_review || 0);
  const blocked = Number(summaryGate?.blocked || 0);
  const snapshot = pipelineSummary?.pipeline?.snapshotDir?.split("/").at(-1) || "Unavailable";
  const diff = pipelineSummary?.diff || {};
  const regressionsDetected =
    Number(diff.passChange || 0) < 0
    || Number(diff.needsReviewChange || 0) > 0
    || Number(diff.blockedChange || 0) > 0
    || (Array.isArray(diff.newlyFailing) && diff.newlyFailing.length > 0);
  const isHealthy = !humanReviewRecommended && blocked === 0 && needsReview === 0;

  const modeLabel = mode?.modeLabel || "Ready for next batch";

  const generateCommand = "npm run seo:batch:prompt";
  const codexInstruction = "Run the SEO batch from reports/seo-next-batch-prompt.md exactly as written. Work sequentially. Stop if any validation stop condition is triggered.";
  const completeCommand = "npm run seo:batch:complete";
  const fullSequence = `${generateCommand}\n\nThen give Codex:\n${codexInstruction}\n\nAfter Codex finishes:\n${completeCommand}`;

  const copyItem = async (text, target) => {
    const ok = await copyText(text, `operator ${target}`);
    setCopyTarget(target);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => {
      setCopyState("idle");
      setCopyTarget("");
    }, 1400);
  };

  const buttonLabel = (target, fallback) => {
    if (copyTarget !== target) return fallback;
    if (copyState === "copied") return "Copied";
    if (copyState === "failed") return "Copy failed";
    return fallback;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80" style={{ padding: "var(--space-lg)" }}>
      <div className="flex items-start justify-between gap-md flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{isHealthy ? "Monitor state" : "Operator mode"}</p>
          <p className="text-sm font-semibold text-slate-900" style={{ marginTop: "4px" }}>
            {isHealthy ? "System healthy" : modeLabel}
          </p>
          <p className="text-xs text-slate-600" style={{ marginTop: "4px" }}>QA: pass={pass}, needs_review={needsReview}, blocked={blocked} · humanReviewRecommended={humanReviewRecommended ? "yes" : "no"}</p>
        </div>
        {!isHealthy ? (
          <button
            type="button"
            onClick={() => copyItem(fullSequence, "full")}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {buttonLabel("full", "Copy full operator sequence")}
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500" style={{ marginTop: "var(--space-sm)" }}>Preparing operator guidance…</p>
      ) : (
        <>
          {isHealthy ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50" style={{ marginTop: "var(--space-sm)", padding: "var(--space-sm)" }}>
              <p className="text-sm font-semibold text-emerald-900">All articles currently pass QA. No action required.</p>
              <p className="text-xs text-emerald-800" style={{ marginTop: "4px" }}>
                Snapshot: {snapshot} · Trend: {regressionsDetected ? "Regression detected in latest diff" : "No regressions detected"} · Recommended mode: Weekly monitoring only
              </p>
              <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: "8px" }}>
                <code className="inline-flex max-w-full overflow-x-auto whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100">npm run seo:monitor</code>
                <button
                  type="button"
                  onClick={() => copyItem("npm run seo:monitor", "monitor")}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {buttonLabel("monitor", "Copy monitor command")}
                </button>
                <code className="inline-flex max-w-full overflow-x-auto whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100">npm run seo:monitor:summary</code>
              </div>
            </div>
          ) : null}

          {!isHealthy ? (
          <div style={{ marginTop: "var(--space-sm)" }}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500" style={{ marginBottom: "6px" }}>Current queue</p>
            {queue.length === 0 ? (
              <p className="text-sm text-slate-600">No queue items available.</p>
            ) : (
              <ul className="text-sm text-slate-700 list-disc ml-5">
                {queue.map((item) => (
                  <li key={item.slug}>{item.slug}</li>
                ))}
              </ul>
            )}
          </div>
          ) : null}

          {!isHealthy ? (
          <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: "var(--space-sm)" }}>
            <code className="inline-flex max-w-full overflow-x-auto whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100">
              {generateCommand}
            </code>
            <button
              type="button"
              onClick={() => copyItem(generateCommand, "generate")}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {buttonLabel("generate", "Copy generate command")}
            </button>
          </div>
          ) : null}

          {!isHealthy ? (
          <details className="rounded-lg border border-slate-200 bg-slate-50" style={{ marginTop: "var(--space-sm)", padding: "var(--space-xs) var(--space-sm)" }}>
            <summary className="cursor-pointer text-xs font-semibold text-slate-600">Codex instruction</summary>
            <p className="text-xs text-slate-700" style={{ marginTop: "8px" }}>{codexInstruction}</p>
            <button
              type="button"
              onClick={() => copyItem(codexInstruction, "instruction")}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              style={{ marginTop: "8px" }}
            >
              {buttonLabel("instruction", "Copy Codex instruction")}
            </button>
          </details>
          ) : null}

          {!isHealthy ? (
          <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: "var(--space-sm)" }}>
            <code className="inline-flex max-w-full overflow-x-auto whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100">
              {completeCommand}
            </code>
            <button
              type="button"
              onClick={() => copyItem(completeCommand, "complete")}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {buttonLabel("complete", "Copy complete command")}
            </button>
          </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function PlannerToggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-sm text-sm text-slate-700">
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

function ArticleDetailPanel({ row, plannerToggles, onToggle, promptPreview, copyState, onCopy }) {
  if (!row) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white" style={{ padding: "var(--space-lg)" }}>
        <p className="text-sm text-slate-600">No article selected.</p>
      </div>
    );
  }

  const warnings = row?.issues?.warnings || [];
  const structural = row?.issues?.structural || [];
  const related = row.rec || row.brief;
  const isPass = row.gate === "pass";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      <div
        className={`rounded-2xl border bg-white transition-colors ${isPass ? "border-green-300 bg-green-50/40" : "border-slate-200"}`}
        style={{ padding: "var(--space-lg)" }}
      >
        <p className="font-heading text-slate-800" style={{ fontSize: "1.05rem" }}>{row.title}</p>
        <p className="text-xs text-slate-500" style={{ marginBottom: "var(--space-sm)" }}>{row.slug}</p>
        {isPass && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold px-2 py-1" style={{ marginBottom: "var(--space-sm)" }}>
            <CheckCircle2 size={13} />
            This article now passes QA
          </div>
        )}
        <div className="grid grid-cols-2 gap-md text-sm">
          <BriefBlock label="Score" value={String(row.score)} />
          <BriefBlock label="Gate" value={row.gate} />
        </div>
        <div style={{ marginTop: "var(--space-md)" }}>
          <IssueList label="Warnings" items={warnings.length ? warnings : ["No current warnings"]} tone="amber" />
        </div>
        <div style={{ marginTop: "var(--space-md)" }}>
          <IssueList label="Structural issues" items={structural.length ? structural : ["None"]} tone="red" />
        </div>
        {related && (
          <div className="rounded-lg border border-slate-200 bg-slate-50" style={{ marginTop: "var(--space-md)", padding: "var(--space-sm)" }}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Suggested fix</p>
            <p className="text-sm text-slate-700">{related.reason || related.whyThisMatters || "Related recommendation available."}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white" style={{ padding: "var(--space-lg)" }}>
        <p className="font-heading text-slate-800" style={{ fontSize: "1.05rem", marginBottom: "var(--space-sm)" }}>Fix planner</p>
        <p className="text-sm text-slate-600" style={{ marginBottom: "var(--space-sm)" }}>Select fixes to tailor the prompt preview. This does not edit files.</p>
        <div className="grid grid-cols-1 gap-1">
          <PlannerToggle checked={plannerToggles.intro} onChange={() => onToggle("intro")} label="Improve intro" />
          <PlannerToggle checked={plannerToggles.thinSections} onChange={() => onToggle("thinSections")} label="Expand thin sections" />
          <PlannerToggle checked={plannerToggles.serviceCta} onChange={() => onToggle("serviceCta")} label="Add service CTA" />
          <PlannerToggle checked={plannerToggles.conclusion} onChange={() => onToggle("conclusion")} label="Strengthen conclusion" />
          <PlannerToggle checked={plannerToggles.internalLinks} onChange={() => onToggle("internalLinks")} label="Add internal links" />
          <PlannerToggle checked={plannerToggles.repetitionRisk} onChange={() => onToggle("repetitionRisk")} label="Reduce repetition risk" />
          <PlannerToggle checked={plannerToggles.publishedAt} onChange={() => onToggle("publishedAt")} label="Add or validate publishedAt" />
        </div>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50" style={{ padding: "var(--space-lg)" }}>
        <p className="font-heading text-blue-900" style={{ fontSize: "1.05rem", marginBottom: "var(--space-sm)" }}>Copy prompt for Codex</p>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 cursor-pointer"
          style={{ marginBottom: "var(--space-sm)" }}
        >
          {copyState === "copied" ? "Prompt copied" : copyState === "failed" ? "Copy failed" : "Copy prompt"}
        </button>
        <pre className="whitespace-pre-wrap rounded-lg bg-white text-xs text-slate-700 border border-blue-100 overflow-x-auto" style={{ padding: "var(--space-md)" }}>
          {promptPreview}
        </pre>
        <p className="text-xs text-blue-900" style={{ marginTop: "var(--space-sm)" }}>
          After editing in Codex, validate with: <code>npm run seo:after-edit -- {row.slug}</code>
        </p>
        <p className="text-xs text-blue-900/80" style={{ marginTop: "4px" }}>
          After Codex finishes and seo:after-edit passes, refresh this dashboard to see the latest score.
        </p>
      </div>
    </div>
  );
}

function IssueList({ label, items, tone = "amber" }) {
  const toneClass = tone === "red"
    ? "bg-red-100 text-red-700"
    : "bg-amber-100 text-amber-800";
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500" style={{ marginBottom: "var(--space-xs)" }}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${toneClass}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function WorkbenchContent({
  articleFilter,
  setArticleFilter,
  sortBy,
  setSortBy,
  filteredRows,
  articleRows,
  selectedRow,
  setSelectedSlug,
  displayRow,
  plannerToggles,
  setPlannerToggles,
  promptText,
  copyState,
  setCopyState,
}) {
  return (
    <>
      <div className="grid md:grid-cols-3 gap-md" style={{ marginBottom: "var(--space-md)" }}>
        <label className="text-sm font-semibold text-slate-700">
          Filter articles
          <select
            value={articleFilter}
            onChange={(e) => setArticleFilter(e.target.value)}
            className="w-full mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="needs_review">Needs review</option>
            <option value="pass">Pass</option>
            <option value="sprint_candidates">Sprint candidates</option>
            <option value="high_commercial_intent">High commercial intent</option>
            <option value="has_codex_prompt">Has Codex prompt</option>
            <option value="missing_cta">Missing CTA</option>
            <option value="thin_content">Thin content</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Sort results
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="score">Score (lowest first)</option>
            <option value="commercial_priority">Commercial priority (highest first)</option>
            <option value="display_rank">Display rank (lowest first)</option>
            <option value="gate">Gate</option>
          </select>
        </label>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 flex items-center">
          Showing {filteredRows.length} of {articleRows.length} articles
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-lg">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {filteredRows.length === 0 ? (
            <div className="text-sm text-slate-600" style={{ padding: "var(--space-lg)" }}>
              No articles match this filter yet. Try a different filter, or run <code>npm run seo:pipeline</code> to refresh reports.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-xs uppercase tracking-wide text-slate-600" style={{ padding: "10px 12px" }}>What needs attention</th>
                  <th className="text-xs uppercase tracking-wide text-slate-600" style={{ padding: "10px 12px" }}>Score</th>
                  <th className="text-xs uppercase tracking-wide text-slate-600" style={{ padding: "10px 12px" }}>Gate</th>
                  <th className="text-xs uppercase tracking-wide text-slate-600" style={{ padding: "10px 12px" }}>Priority</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const active = selectedRow?.slug === row.slug;
                  return (
                    <tr
                      key={row.slug}
                      className={`border-t cursor-pointer ${active ? "bg-primary/5" : "bg-white hover:bg-slate-50"}`}
                      onClick={() => setSelectedSlug(row.slug)}
                    >
                      <td style={{ padding: "10px 12px" }}>
                        <p className="font-semibold text-slate-800">{row.title}</p>
                        <p className="text-xs text-slate-500">{row.slug}</p>
                        {active && <p className="text-[11px] font-semibold text-primary">Selected</p>}
                      </td>
                      <td className="font-mono text-sm text-slate-700" style={{ padding: "10px 12px" }}>{row.score}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          row.gate === "pass" ? "bg-green-100 text-green-700" : row.gate === "blocked" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {row.gate}
                        </span>
                      </td>
                      <td className="text-xs text-slate-600" style={{ padding: "10px 12px" }}>
                        {row.commercialPriority ? `Value ${row.commercialPriority}` : "—"}
                        {Number.isFinite(row.displayRank) && row.displayRank < 999 ? ` · #${row.displayRank}` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <ArticleDetailPanel
          row={displayRow}
          plannerToggles={plannerToggles}
          onToggle={(key) => setPlannerToggles((prev) => ({ ...prev, [key]: !prev[key] }))}
          promptPreview={promptText}
          copyState={copyState}
          onCopy={async () => {
            const ok = await copyText(promptText, "article planner prompt");
            if (ok) {
              setCopyState("copied");
              setTimeout(() => setCopyState("idle"), 1500);
            } else {
              setCopyState("failed");
              setTimeout(() => setCopyState("idle"), 2000);
            }
          }}
        />
      </div>
    </>
  );
}

function ResourceQaSection({ qaReport, qaLoading }) {
  const gateSummary = qaReport?.gateSummary || { pass: 0, needs_review: 0, blocked: 0 };
  const articleCount = qaReport?.articleCount || 0;
  const lowest = Array.isArray(qaReport?.articles) ? qaReport.articles.slice(0, 5) : [];

  const topReason = (article) => {
    if (article?.issues?.structural?.length) return article.issues.structural[0];
    if (article?.issues?.warnings?.length) return article.issues.warnings[0];
    return "No issues recorded";
  };

  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className="container" style={{ paddingTop: "var(--space-xl)", paddingBottom: "var(--space-xl)" }}>
        <h2 className="font-heading" style={{ fontSize: "1.2rem", marginBottom: "var(--space-sm)" }}>
          Resource QA
        </h2>
        <p className="text-sm text-slate-600" style={{ marginBottom: "var(--space-lg)" }}>
          Quality snapshot from the latest resource QA run.
        </p>

        {qaLoading ? (
          <p className="text-sm text-slate-500">Loading QA report…</p>
        ) : !qaReport ? (
          <div className="rounded-2xl border border-slate-200 bg-white text-sm text-slate-600" style={{ padding: "var(--space-lg)" }}>
            Resource QA report not found yet. Run <code>npm run qa:resources</code> to generate <code>reports/resource-qa-report.json</code>.
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-md" style={{ marginBottom: "var(--space-lg)" }}>
              <StatMini label="Articles" value={articleCount} tone="slate" />
              <StatMini label="Pass" value={gateSummary.pass} tone="green" />
              <StatMini label="Needs Review" value={gateSummary.needs_review} tone="amber" />
              <StatMini label="Blocked" value={gateSummary.blocked} tone="red" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-xs uppercase tracking-wide text-slate-600" style={{ padding: "12px 14px" }}>Article</th>
                    <th className="text-xs uppercase tracking-wide text-slate-600" style={{ padding: "12px 14px" }}>Score</th>
                    <th className="text-xs uppercase tracking-wide text-slate-600" style={{ padding: "12px 14px" }}>Gate</th>
                    <th className="text-xs uppercase tracking-wide text-slate-600" style={{ padding: "12px 14px" }}>Top Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {lowest.map((row) => {
                    const blocked = row.gate === "blocked";
                    const gateClass = blocked
                      ? "bg-red-100 text-red-700"
                      : row.gate === "needs_review"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700";
                    return (
                      <tr key={row.slug} className={`border-t ${blocked ? "bg-red-50/50" : "bg-white"}`}>
                        <td style={{ padding: "12px 14px" }}>
                          <a href={`/resources/${row.slug}`} className="font-semibold text-slate-800 hover:text-primary transition-colors">
                            {row.title || row.slug}
                          </a>
                          <p className="text-xs text-slate-500">{row.slug}</p>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span className="font-mono font-semibold text-slate-800">{row.score}</span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${gateClass}`}>
                            {row.gate}
                          </span>
                        </td>
                        <td className="text-sm text-slate-600" style={{ padding: "12px 14px" }}>
                          {topReason(row)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function StatMini({ label, value, tone }) {
  const toneClass =
    tone === "green"
      ? "border-green-200 bg-green-50 text-green-800"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : tone === "red"
      ? "border-red-300 bg-red-100 text-red-800"
      : "border-slate-200 bg-white text-slate-800";
  return (
    <div className={`rounded-xl border ${toneClass}`} style={{ padding: "var(--space-md)" }}>
      <p className="text-xs uppercase tracking-wide opacity-80">{label}</p>
      <p className="font-heading" style={{ fontSize: "1.5rem" }}>{value}</p>
    </div>
  );
}

function WeeklySummarySection({ summary, loading }) {
  return (
    <section className="bg-white border-b border-slate-200">
      <div className="container" style={{ paddingTop: "var(--space-xl)", paddingBottom: "var(--space-xl)" }}>
        <h2 className="font-heading" style={{ fontSize: "1.2rem", marginBottom: "var(--space-sm)" }}>
          Weekly SEO Executive Summary
        </h2>
        <p className="text-sm text-slate-600" style={{ marginBottom: "var(--space-lg)" }}>
          Plain-English summary of what the automation recommends this week.
        </p>

        {loading ? (
          <p className="text-sm text-slate-500">Loading weekly summary...</p>
        ) : !summary ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-600" style={{ padding: "var(--space-lg)" }}>
            Weekly summary not found yet. Run <code>npm run seo:summary</code> after Resource QA and action briefs.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50" style={{ padding: "var(--space-lg)" }}>
            <p className="text-base text-slate-800 leading-relaxed" style={{ marginBottom: "var(--space-lg)" }}>
              {summary.headlineSummary}
            </p>

            <div className="grid md:grid-cols-4 gap-md" style={{ marginBottom: "var(--space-lg)" }}>
              <StatMini label="Needs review" value={summary.pagesNeedingReviewCount ?? 0} tone="amber" />
              <StatMini label="Blocked" value={summary.blockedCount ?? 0} tone={(summary.blockedCount ?? 0) > 0 ? "red" : "green"} />
              <StatMini label="Create new" value={summary.createVsImproveSplit?.create_new ?? 0} />
              <StatMini label="Improve existing" value={summary.createVsImproveSplit?.improve_existing ?? 0} />
            </div>

            <div className="grid md:grid-cols-2 gap-lg">
              <BriefBlock
                label="Highest commercial opportunity"
                value={summary.highestCommercialOpportunity
                  ? `${summary.highestCommercialOpportunity.title} (${summary.highestCommercialOpportunity.outcomeLabel})`
                  : "No commercial opportunity identified yet."}
              />
              <BriefBlock
                label="Biggest quality risk"
                value={summary.biggestQualityRisk
                  ? `${summary.biggestQualityRisk.title}: ${summary.biggestQualityRisk.reason}`
                  : "No quality risk identified yet."}
              />
              <BriefBlock label="Suggested focus next week" value={summary.suggestedFocusForNextWeek} />
              <BriefList
                label="Top 3 recommended actions"
                items={(summary.topRecommendedActions || []).map((action) => `${action.rank}. ${action.action}`)}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PipelineSummarySection({ summary, loading }) {
  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className="container" style={{ paddingTop: "var(--space-xl)", paddingBottom: "var(--space-xl)" }}>
        <h2 className="font-heading" style={{ fontSize: "1.2rem", marginBottom: "var(--space-sm)" }}>
          SEO Pipeline Status
        </h2>
        <p className="text-sm text-slate-600" style={{ marginBottom: "var(--space-lg)" }}>
          One-command pipeline snapshot with run-to-run change visibility.
        </p>

        {loading ? (
          <p className="text-sm text-slate-500">Loading pipeline summary...</p>
        ) : !summary ? (
          <div className="rounded-2xl border border-slate-200 bg-white text-sm text-slate-600" style={{ padding: "var(--space-lg)" }}>
            Pipeline summary not found yet. Run <code>npm run seo:pipeline</code>.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white" style={{ padding: "var(--space-lg)" }}>
            <div className="grid md:grid-cols-4 gap-md" style={{ marginBottom: "var(--space-lg)" }}>
              <StatMini label="Pass delta" value={summary.diff?.passChange ?? 0} tone={(summary.diff?.passChange || 0) >= 0 ? "green" : "amber"} />
              <StatMini label="Needs review delta" value={summary.diff?.needsReviewChange ?? 0} tone={(summary.diff?.needsReviewChange || 0) <= 0 ? "green" : "amber"} />
              <StatMini label="Blocked delta" value={summary.diff?.blockedChange ?? 0} tone={(summary.diff?.blockedChange || 0) > 0 ? "red" : "green"} />
              <StatMini label="Recommendation delta" value={summary.diff?.recommendationCountChange ?? 0} />
            </div>

            <div className="grid md:grid-cols-2 gap-lg">
              <BriefBlock label="Snapshot folder" value={summary.pipeline?.snapshotDir || "Unavailable"} />
              <BriefBlock label="Previous snapshot" value={summary.pipeline?.previousSnapshot || "None"} />
              <BriefBlock
                label="Human review recommended"
                value={summary.review?.humanReviewRecommended ? "Yes" : "No"}
              />
              <BriefBlock label="Reason" value={summary.review?.reason || "No reason provided"} />
              <BriefList label="Newly passing articles" items={summary.diff?.newlyPassing?.length ? summary.diff.newlyPassing : ["None"]} />
              <BriefList label="Newly failing articles" items={summary.diff?.newlyFailing?.length ? summary.diff.newlyFailing : ["None"]} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function RecommendationSection({ recommendations, sprintCandidates, qaLoading }) {
  const signalLabel = {
    poor_qa_score: "Poor QA score",
    search_demand: "Search demand",
    content_gap: "Content gap",
    blocked_structural_issue: "Blocked structural issue",
  };

  const typeClass = {
    improve_existing: "bg-amber-100 text-amber-800",
    create_new: "bg-fuchsia-100 text-fuchsia-800",
    monitor: "bg-blue-100 text-blue-800",
    blocked_review: "bg-red-100 text-red-800",
  };

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="container" style={{ paddingTop: "var(--space-xl)", paddingBottom: "var(--space-xl)" }}>
        <h2 className="font-heading" style={{ fontSize: "1.2rem", marginBottom: "var(--space-sm)" }}>
          Fix vs Create Recommendations
        </h2>
        <p className="text-sm text-slate-600" style={{ marginBottom: "var(--space-lg)" }}>
          Read-only recommendations from Resource QA + Search Console demand signals.
        </p>

        {qaLoading ? (
          <p className="text-sm text-slate-500">Preparing recommendations…</p>
        ) : recommendations.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-600" style={{ padding: "var(--space-lg)" }}>
            No recommendations available. Ensure resource QA report exists and demand signals are present.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            {recommendations.map((rec, idx) => (
              <div key={`${rec.title}-${idx}`} className={`rounded-xl border ${rec.type === "blocked_review" ? "border-red-300 bg-red-50/50" : "border-slate-200 bg-white"}`} style={{ padding: "var(--space-lg)" }}>
                <div className="flex items-start justify-between gap-md">
                  <div>
                    <p className="font-heading text-slate-800" style={{ fontSize: "1.05rem" }}>{rec.preferredTitle || rec.title}</p>
                    {rec.slug ? (
                      <a href={`/resources/${rec.slug}`} className="text-xs text-primary hover:underline">
                        /resources/{rec.slug}
                      </a>
                    ) : (
                      <p className="text-xs text-slate-500">
                        New content recommendation{rec.rawQuery ? ` from query: ${rec.rawQuery}` : " (no existing slug)"}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Priority</p>
                    <p className="font-mono font-semibold text-slate-800">{rec.priorityScore}</p>
                  </div>
                </div>

                <div className="flex items-center gap-sm flex-wrap" style={{ marginTop: "var(--space-sm)" }}>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${typeClass[rec.type] || "bg-slate-100 text-slate-700"}`}>
                    {rec.type}
                  </span>
                  {rec.sourceSignals.map((s) => (
                    <span key={`${rec.title}-${s}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {signalLabel[s] || s}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-slate-700" style={{ marginTop: "var(--space-sm)" }}>
                  <strong>Reason:</strong> {rec.reason}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Next action:</strong> {rec.suggestedNextAction}
                </p>
              </div>
            ))}
          </div>
        )}

        {!qaLoading && sprintCandidates?.length > 0 && (
          <details className="rounded-xl border border-slate-200 bg-slate-50" style={{ marginTop: "var(--space-lg)", padding: "var(--space-md)" }}>
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">Sprint candidates (next backlog items)</summary>
            <div style={{ marginTop: "var(--space-md)", display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
              {sprintCandidates.map((rec, idx) => (
                <div key={`${rec.title}-sprint-${idx}`} className="rounded-lg border border-slate-200 bg-white" style={{ padding: "var(--space-md)" }}>
                  <p className="text-sm font-semibold text-slate-800">
                    #{rec.displayRank} {rec.preferredTitle || rec.title}
                  </p>
                  <p className="text-xs text-slate-600">
                    {rec.type} · priority {rec.priorityScore} · bucket {rec.articleTypeBucket}
                  </p>
                  <p className="text-xs text-slate-600">{rec.sprintReason || "Backlog candidate for structured sprint planning."}</p>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </section>
  );
}

function ActionBriefSection({ briefs, qaLoading }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className="container" style={{ paddingTop: "var(--space-xl)", paddingBottom: "var(--space-xl)" }}>
        <h2 className="font-heading" style={{ fontSize: "1.2rem", marginBottom: "var(--space-sm)" }}>
          Action Briefs
        </h2>
        <p className="text-sm text-slate-600" style={{ marginBottom: "var(--space-lg)" }}>
          Compact briefs for the current fix vs create recommendations.
        </p>

        {qaLoading ? (
          <p className="text-sm text-slate-500">Preparing briefs...</p>
        ) : briefs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white text-sm text-slate-600" style={{ padding: "var(--space-lg)" }}>
            No action briefs available yet. Generate Resource QA first, then refresh the roadmap.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            {briefs.map((brief, idx) => {
              const open = idx === openIndex;
              return (
                <div key={`${brief.targetTitle}-${idx}`} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? -1 : idx)}
                    className="w-full text-left flex items-center justify-between gap-md cursor-pointer"
                    style={{ padding: "var(--space-md) var(--space-lg)" }}
                  >
                    <div>
                      <p className="font-heading text-slate-800" style={{ fontSize: "1rem" }}>{brief.preferredTitle || brief.targetTitle}</p>
                      <p className="text-xs text-slate-500">
                        {brief.recommendationType} · priority {brief.priorityScore}
                      </p>
                      <p className="text-xs text-slate-500">
                        Conversion intent: {brief.conversionIntentLabel} ({brief.conversionIntentScore})
                      </p>
                      {brief.rawQuery && <p className="text-xs text-slate-500">Raw query: {brief.rawQuery}</p>}
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>

                  {open && (
                    <div className="border-t border-slate-100" style={{ padding: "var(--space-lg)" }}>
                      <div className="grid md:grid-cols-2 gap-lg">
                        <BriefBlock label="Why this matters" value={brief.whyThisMatters} />
                        <BriefBlock label="Primary issue" value={brief.primaryIssue} />
                        <BriefBlock label="Why this matters commercially" value={brief.whyThisMattersCommercially} />
                        <BriefBlock label="Recommended CTA" value={brief.recommendedCTA} />
                        {brief.titleQualityChecks.length > 0 && (
                          <BriefList label="Title quality flags" items={brief.titleQualityChecks} />
                        )}
                        <BriefList label="Suggested content changes" items={brief.suggestedContentChanges} />
                        <BriefList label="Review checklist" items={brief.reviewChecklist} />
                      </div>
                      <div className="grid md:grid-cols-2 gap-lg" style={{ marginTop: "var(--space-lg)" }}>
                        <BriefList label="Suggested internal links" items={brief.suggestedInternalLinks} />
                        <BriefBlock label="CTA angle" value={brief.suggestedCtaAngle} />
                      </div>
                      <details className="rounded-xl border border-emerald-200 bg-emerald-50" style={{ marginTop: "var(--space-lg)", padding: "var(--space-md)" }}>
                        <summary className="cursor-pointer text-sm font-semibold text-emerald-900">Outcome feedback scoring</summary>
                        <div className="grid md:grid-cols-2 gap-lg" style={{ marginTop: "var(--space-md)" }}>
                          <BriefBlock label="Outcome label" value={brief.outcomeLabel} />
                          <BriefBlock label="Estimated business value" value={`${brief.estimatedBusinessValue}/100`} />
                          <BriefBlock label="Estimated lead intent" value={`${brief.estimatedLeadIntent}/100`} />
                          <BriefBlock label="Assisted conversion potential" value={`${brief.assistedConversionPotential}/100`} />
                          <BriefBlock label="Strategic importance" value={`${brief.strategicImportance}/100`} />
                          <BriefBlock label="Confidence level" value={`${brief.confidenceLevel}/100`} />
                          <BriefBlock label="Leads generated" value={brief.leadsGenerated ?? "Not connected yet"} />
                          <BriefBlock label="Assisted conversions" value={brief.assistedConversions ?? "Not connected yet"} />
                          <BriefBlock label="Ranking movement" value={brief.rankingMovement ?? "Not tracked yet"} />
                          <BriefBlock label="Manual outcome notes" value={brief.manualOutcomeNotes || "None recorded yet"} />
                        </div>
                      </details>
                      {brief.implementationPlan && (
                        <details className="rounded-xl border border-amber-200 bg-amber-50" style={{ marginTop: "var(--space-lg)", padding: "var(--space-md)" }}>
                          <summary className="cursor-pointer text-sm font-semibold text-amber-900">Article implementation plan</summary>
                          <div className="grid md:grid-cols-2 gap-lg" style={{ marginTop: "var(--space-md)" }}>
                            <BriefList label="Sections to improve" items={brief.implementationPlan.sectionsToImprove} />
                            <BriefList label="Missing elements" items={brief.implementationPlan.missingElements} />
                            <BriefList label="Suggested new headings" items={brief.implementationPlan.suggestedNewSectionHeadings} />
                            <BriefBlock label="Stronger CTA" value={brief.implementationPlan.strongerCTARecommendation} />
                            <BriefList label="Internal links to add" items={brief.implementationPlan.internalLinksToAdd} />
                            <BriefList label="Risk notes" items={brief.implementationPlan.riskNotes} />
                            <BriefList label="Review questions" items={brief.implementationPlan.reviewQuestions} />
                          </div>
                        </details>
                      )}
                      {brief.codexPatchPrompt && (
                        <details className="rounded-xl border border-blue-200 bg-blue-50" style={{ marginTop: "var(--space-lg)", padding: "var(--space-md)" }}>
                          <summary className="cursor-pointer text-sm font-semibold text-blue-900">Codex patch prompt</summary>
                          <pre className="whitespace-pre-wrap rounded-lg bg-white text-xs text-slate-700 overflow-x-auto border border-blue-100" style={{ marginTop: "var(--space-md)", padding: "var(--space-md)" }}>
                            {brief.codexPatchPrompt}
                          </pre>
                        </details>
                      )}
                      <details className="rounded-xl border border-slate-200 bg-slate-50" style={{ marginTop: "var(--space-lg)", padding: "var(--space-md)" }}>
                        <summary className="cursor-pointer text-sm font-semibold text-slate-700">Marketing channel outputs</summary>
                        <div className="grid md:grid-cols-2 gap-lg" style={{ marginTop: "var(--space-md)" }}>
                          <BriefBlock label="LinkedIn angle" value={brief.channelOutputs.linkedInPostAngle} />
                          <BriefBlock label="Email nurture angle" value={brief.channelOutputs.emailNurtureAngle} />
                          <BriefBlock label="Sales follow-up angle" value={brief.channelOutputs.salesFollowUpAngle} />
                          <BriefList label="FAQ questions" items={brief.channelOutputs.suggestedFaqQuestions} />
                          <BriefBlock label="Meta title" value={brief.channelOutputs.suggestedMetaTitle} />
                          <BriefBlock label="Meta description" value={brief.channelOutputs.suggestedMetaDescription} />
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function BriefBlock({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500" style={{ marginBottom: "var(--space-xs)" }}>{label}</p>
      <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
    </div>
  );
}

function BriefList({ label, items }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500" style={{ marginBottom: "var(--space-xs)" }}>{label}</p>
      <ul className="space-y-1 text-sm text-slate-700">
        {items.map((item) => <li key={item}>- {item}</li>)}
      </ul>
    </div>
  );
}

function AdminRow({ item, onStatusChange }) {
  const isDone = item.status === "done";
  const isActive = item.status === "in_progress";

  return (
    <div
      className={`rounded-xl border transition-all ${
        isDone
          ? "border-green-200 bg-green-50/60"
          : isActive
          ? "border-amber-300 bg-amber-50/60 shadow-md ring-1 ring-amber-200"
          : "border-slate-200 bg-white hover:shadow-sm"
      }`}
      style={{ padding: "var(--space-lg) var(--space-xl)" }}
    >
      {/* Top: priority + title + status buttons */}
      <div className="flex items-start justify-between gap-lg">
        <div className="flex items-start gap-md flex-1 min-w-0">
          <span className={`text-sm font-bold rounded-lg px-2.5 py-1 flex-shrink-0 font-mono mt-0.5 ${
            isDone ? "bg-green-100 text-green-700" : isActive ? "bg-amber-100 text-amber-700" : "text-primary bg-primary/10"
          }`}>
            {item.priority.toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <p className={`font-heading leading-snug ${isDone ? "line-through text-slate-500" : "text-slate-800"}`} style={{ fontSize: "1.05rem" }}>{item.title}</p>
            {!isDone && (
              <>
                <p className="text-sm text-slate-600 leading-relaxed" style={{ marginTop: "var(--space-xs)" }}>{item.why}</p>
                <div className="flex items-center gap-md text-xs text-slate-500" style={{ marginTop: "var(--space-xs)" }}>
                  <span>Impressions: <strong>{fmt(item.impressions || 0)}</strong></span>
                  <span>Position: <strong>{Number(item.position || 0).toFixed(1)}</strong></span>
                  <span>Clicks/mo: <strong>{item.clicks || 0}</strong></span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex-shrink-0" style={{ marginTop: "2px" }}>
          <StatusButtons status={item.status} onChange={(s) => onStatusChange(item.priority, s)} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   VIEWER VIEW — full detailed presentation for Tim
   ════════════════════════════════════════════════════════════ */

function ViewerView({ showBackToAdmin = false, onBackToAdmin }) {
  const { phases, allItems, doneItems, loaded } = useRoadmapState();

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg text-(--color-text)/50">Loading roadmap…</p>
    </div>
  );

  const totalImpressions = allItems.reduce((sum, i) => sum + i.impressions, 0);
  const seoImpressions = reportData?.ga4Period?.seoInsights?.totalImpressions || totalImpressions;
  const countByStatus = (s) => allItems.filter((i) => i.status === s).length;
  const demandQueries = demandSignals.erpNetsuiteQueries || [];
  const erpPatterns = demandSignals.erpInPatterns || [];
  const demandGaps = demandSignals.contentGaps || [];
  const topicBacklog = demandSignals.topicBacklogV2 || [];

  return (
    <div className="min-h-screen">
      {/* ════════ HERO ════════ */}
      <section className="text-white relative overflow-hidden">
        {/* Road background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1694971486788-351a56db4e7a?w=1920&q=80&fit=crop')" }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/85 to-slate-800/90" />
        {/* Bottom fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        <div className="container relative z-10" style={{ paddingTop: "var(--space-5xl)", paddingBottom: "var(--space-4xl)" }}>
          {/* Top bar */}
          <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-2xl)" }}>
            <p className="text-label text-primary">Internal — Not Indexed</p>
            <div className="flex items-center gap-lg">
              {showBackToAdmin && (
                <button onClick={onBackToAdmin} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer">
                  <Lock size={13} />
                  Back to admin
                </button>
              )}
            </div>
          </div>

          <h1 className="font-heading text-white" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "var(--space-lg)" }}>SEO Content Roadmap</h1>
          <p className="text-lg text-white/80 max-w-4xl leading-relaxed" style={{ marginBottom: "var(--space-2xl)" }}>
            Prioritised list of articles to write, based on Google Search Console data. Old blog posts are still generating <span className="text-white font-semibold">{fmt(seoImpressions)}+ impressions/month</span> — this plan captures that demand.
          </p>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <SummaryCard label="Total Articles" value={allItems.length} />
            <SummaryCard label="Published" value={countByStatus("done")} colour="text-green-400" />
            <SummaryCard label="In Progress" value={countByStatus("in_progress")} colour="text-amber-400" />
            <SummaryCard label="To Do" value={countByStatus("todo")} colour="text-slate-400" />
          </div>
        </div>
      </section>

      {/* ════════ OPPORTUNITY CALLOUT ════════ */}
      <section className="bg-white border-b border-slate-200">
        <div className="container" style={{ paddingTop: "var(--space-2xl)", paddingBottom: "var(--space-2xl)" }}>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl" style={{ padding: "var(--space-xl) var(--space-2xl)" }}>
            <h2 className="font-heading text-amber-900" style={{ fontSize: "1.25rem", marginBottom: "var(--space-sm)" }}>The Opportunity</h2>
            <p className="text-amber-800 text-base leading-relaxed">
              Legacy blog URLs still generate <strong>~{fmt(seoImpressions)} Google impressions per month</strong> across 40+ pages, but click-through remains weak because many queries still rank outside the top positions and some traffic pathways are broad redirects rather than tightly matched landing pages. We now have several targeted replacement resources live, but there are still clear keyword gaps in the roadmap queue. Closing those remaining gaps is the biggest lever for sustained organic growth.
            </p>
          </div>
        </div>
      </section>

      {/* ════════ QUERY DEMAND ════════ */}
      <section className="bg-white border-b border-slate-200">
        <div className="container" style={{ paddingTop: "var(--space-2xl)", paddingBottom: "var(--space-2xl)" }}>
          <h2 className="font-heading" style={{ fontSize: "1.4rem", marginBottom: "var(--space-sm)" }}>
            Live Search Demand Snapshot (ERP and NetSuite)
          </h2>
          <p className="text-sm text-slate-600" style={{ marginBottom: "var(--space-lg)" }}>
            This section shows what people are actively searching now so we can capture missing intent with new or refreshed content.
          </p>

          <div className="grid md:grid-cols-3 gap-lg">
            <div className="rounded-2xl border border-slate-200 bg-slate-50" style={{ padding: "var(--space-lg)" }}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500" style={{ marginBottom: "var(--space-sm)" }}>
                Top ERP and NetSuite queries
              </p>
              {demandQueries.length > 0 ? (
                <ul className="space-y-2 text-sm text-slate-700">
                  {demandQueries.slice(0, 5).map((q, idx) => (
                    <li key={`${q.query}-${idx}`}>
                      <strong>{q.query}</strong> ({fmt(q.impressions)} imp, {q.clicks} clicks, pos {Number(q.position || 0).toFixed(1)})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No query-level demand data available in the current dataset.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50" style={{ padding: "var(--space-lg)" }}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500" style={{ marginBottom: "var(--space-sm)" }}>
                ERP in/for X patterns
              </p>
              {erpPatterns.length > 0 ? (
                <ul className="space-y-2 text-sm text-slate-700">
                  {erpPatterns.slice(0, 5).map((p, idx) => (
                    <li key={`${p.term}-${idx}`}>
                      <strong>ERP for {p.term}</strong> ({fmt(p.impressions)} imp across {p.queryCount} queries)
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No strong ERP-in/for pattern demand detected yet.</p>
              )}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50" style={{ padding: "var(--space-lg)" }}>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700" style={{ marginBottom: "var(--space-sm)" }}>
                Gap candidates (high demand, low traction)
              </p>
              {demandGaps.length > 0 ? (
                <ul className="space-y-2 text-sm text-amber-900">
                  {demandGaps.slice(0, 5).map((g, idx) => (
                    <li key={`${g.query}-${idx}`}>
                      <strong>{g.query}</strong> ({fmt(g.impressions)} imp, {g.clicks} clicks, CTR {g.ctr}%)
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-amber-800">No obvious gap candidates in the current signal window.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50" style={{ padding: "var(--space-lg)", marginTop: "var(--space-lg)" }}>
            <p className="text-xs font-bold uppercase tracking-wide text-fuchsia-700" style={{ marginBottom: "var(--space-sm)" }}>
              Topic Backlog v2 (scored)
            </p>
            {topicBacklog.length > 0 ? (
              <ul className="space-y-2 text-sm text-fuchsia-900">
                {topicBacklog.slice(0, 6).map((t, idx) => (
                  <li key={`${t.query}-${idx}`}>
                    <strong>{t.suggestedTitle}</strong> (score {t.score}, intent {t.intent}, {fmt(t.impressions)} imp)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-fuchsia-800">No scored topic candidates available yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* ════════ PHASE SECTIONS ════════ */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        {phases.map((phase, idx) => (
          <PhaseSection
            key={phase.id}
            phase={phase}
            isEven={idx % 2 === 1}
          />
        ))}

      {/* ════════ ALREADY COVERED ════════ */}
      <section style={{ backgroundColor: "rgba(16, 185, 129, 0.04)" }}>
        <div className="container relative overflow-hidden" style={{ paddingTop: "var(--space-3xl)", paddingBottom: "var(--space-3xl)" }}>
          <div
            className="absolute -left-32 top-1/2 -translate-y-1/2 opacity-[0.04] hidden lg:block pointer-events-none"
            style={{
              width: "500px",
              height: "429px",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              backgroundColor: "#10b981",
            }}
          />
          <div className="relative z-10">
            <p className="text-label text-green-600" style={{ marginBottom: "var(--space-md)" }}>Already Done</p>
            <h2 className="font-heading" style={{ fontSize: "1.75rem", marginBottom: "var(--space-xl)" }}>Already Covered ({alreadyCovered.length + doneItems.length})</h2>
            <div className="bg-white border border-green-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-green-50">
                    <th className="text-sm font-semibold text-green-800" style={{ padding: "var(--space-lg) var(--space-xl)" }}>Topic</th>
                    <th className="text-sm font-semibold text-green-800 text-right" style={{ padding: "var(--space-lg) var(--space-xl)" }}>Impressions</th>
                    <th className="text-sm font-semibold text-green-800" style={{ padding: "var(--space-lg) var(--space-xl)" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Hardcoded pre-existing articles */}
                  {alreadyCovered.map((item) => (
                    <tr key={item.title} className="border-t border-green-100">
                      <td style={{ padding: "var(--space-lg) var(--space-xl)" }}>
                        <p className="font-semibold text-slate-800">{item.title}</p>
                        <p className="text-sm text-slate-500" style={{ marginTop: "var(--space-xs)" }}>{item.note}</p>
                      </td>
                      <td className="text-right font-mono font-semibold text-slate-700" style={{ padding: "var(--space-lg) var(--space-xl)" }}>{fmt(item.impressions)}</td>
                      <td style={{ padding: "var(--space-lg) var(--space-xl)" }}><Badge status="done" /></td>
                    </tr>
                  ))}
                  {/* Roadmap articles marked as published */}
                  {doneItems.map((item) => (
                    <tr key={item.priority} className="border-t border-green-100">
                      <td style={{ padding: "var(--space-lg) var(--space-xl)" }}>
                        <p className="font-semibold text-slate-800">{item.title}</p>
                        <p className="text-sm text-slate-500" style={{ marginTop: "var(--space-xs)" }}>{item.why}</p>
                      </td>
                      <td className="text-right font-mono font-semibold text-slate-700" style={{ padding: "var(--space-lg) var(--space-xl)" }}>{fmt(item.impressions)}</td>
                      <td style={{ padding: "var(--space-lg) var(--space-xl)" }}><Badge status="done" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ TECHNICAL ACTIONS ════════ */}
      <section className="bg-white">
        <div className="container" style={{ paddingTop: "var(--space-3xl)", paddingBottom: "var(--space-3xl)" }}>
          <div className="flex items-center gap-lg" style={{ marginBottom: "var(--space-xl)" }}>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Wrench size={22} className="text-slate-600" />
            </div>
            <div>
              <p className="text-label text-slate-500" style={{ marginBottom: "var(--space-xs)" }}>Checklist</p>
              <h2 className="font-heading" style={{ fontSize: "1.75rem" }}>Technical Actions Alongside Content</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-lg">
            <TechCard number="01" title="Update Redirects" text="Every new article should get a specific redirect from its old /post/ URL instead of the catch-all to /resources. Preserves link equity." />
            <TechCard number="02" title="Internal Linking" text="Each article should link to relevant site pages (Implementation, Support, Case Studies, Contact) and vice versa." />
            <TechCard number="03" title="CTAs in Every Article" text="NETscore quiz, Calendly booking, guide download. Multiple conversion paths for different intent levels." />
            <TechCard number="04" title="Meta Titles & Descriptions" text="Target the exact keyword phrases from Search Console. E.g. 'What is an ERP System' should target all the high-impression keyword variants." />
          </div>
        </div>
      </section>

      {/* ════════ EXPECTED IMPACT ════════ */}
      <section style={{ backgroundColor: "rgba(232, 58, 122, 0.03)" }}>
        <div className="container relative overflow-hidden" style={{ paddingTop: "var(--space-3xl)", paddingBottom: "var(--space-3xl)" }}>
          <div
            className="absolute -right-48 bottom-0 opacity-[0.04] hidden lg:block pointer-events-none"
            style={{
              width: "600px",
              height: "514px",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              backgroundColor: "var(--color-primary)",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-lg" style={{ marginBottom: "var(--space-xl)" }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center flex-shrink-0">
                <BarChart3 size={22} className="text-white" />
              </div>
              <div>
                <p className="text-label text-primary" style={{ marginBottom: "var(--space-xs)" }}>Projections</p>
                <h2 className="font-heading" style={{ fontSize: "1.75rem" }}>Expected Impact</h2>
              </div>
            </div>
            <div className="bg-white border border-primary/15 rounded-2xl shadow-sm" style={{ padding: "var(--space-2xl)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
                <ImpactRow label="Phase 1" text="Could start generating clicks within 2–4 weeks (already near page 1)" accent="bg-green-500" />
                <ImpactRow label="Phase 2" text="Will take 2–3 months to climb but represents ~20,000+ monthly impressions in potential traffic" accent="bg-primary" />
                <ImpactRow label="Phase 3" text="May not drive huge volume but captures high-intent visitors actively looking for ERP help" accent="bg-amber-500" />
                <div style={{ paddingTop: "var(--space-xl)", borderTop: "2px solid rgba(232, 58, 122, 0.12)" }}>
                  <p className="text-lg font-bold text-slate-800">
                    Combined, this targets <span className="text-primary">~35,000 monthly impressions</span> that are currently going to waste.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ BOTTOM LINE ════════ */}
      <section className="bg-slate-900 text-white">
        <div className="container relative overflow-hidden" style={{ paddingTop: "var(--space-3xl)", paddingBottom: "var(--space-3xl)" }}>
          <div
            className="absolute -left-24 top-1/2 -translate-y-1/2 opacity-[0.06] hidden lg:block pointer-events-none"
            style={{
              width: "400px",
              height: "343px",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              backgroundColor: "#ffffff",
            }}
          />
          <div className="relative z-10 max-w-4xl">
            <p className="text-label text-primary" style={{ marginBottom: "var(--space-md)" }}>Summary</p>
            <h2 className="font-heading text-white" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", marginBottom: "var(--space-xl)" }}>Bottom Line</h2>
            <p className="text-lg text-slate-300 leading-relaxed" style={{ marginBottom: "var(--space-2xl)" }}>
              The demand is already there — Google is showing ERP Experts for these searches thousands of times a month. The old content was good enough to get impressions but too weak to rank well.
            </p>
            <p className="text-lg text-white font-semibold leading-relaxed">
              Better content on the new site, with proper redirects and CTAs, is the clearest path to turning those impressions into <span className="text-primary">traffic</span> and traffic into <span className="text-primary">leads</span>.
            </p>
          </div>
        </div>
      </section>
      </div>

      {/* ════════ FOOTER ════════ */}
      <section className="bg-white border-t border-slate-200">
        <div className="container text-center" style={{ padding: "var(--space-xl) 0" }}>
          <p className="text-sm text-slate-400">
            Data source: Google Search Console (from reports snapshot) &bull; Last updated: {britDate(seoSnapshotDate)}
          </p>
        </div>
      </section>
    </div>
  );
}

/* ── sub-components ── */

function SummaryCard({ label, value, colour = "text-white" }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl" style={{ padding: "var(--space-lg) var(--space-xl)" }}>
      <p className="text-sm text-white/60" style={{ marginBottom: "var(--space-xs)" }}>{label}</p>
      <p className={`font-heading ${colour}`} style={{ fontSize: "2rem" }}>{value}</p>
    </div>
  );
}

function PhaseSection({ phase, isEven }) {
  const Icon = phase.icon;
  const phaseImpressions = phase.items.reduce((sum, i) => sum + i.impressions, 0);

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: isEven ? phase.bg : "#fafafa" }}
    >
      {/* Decorative triangle — alternating sides */}
      <div
        className={`absolute ${isEven ? "-left-32" : "-right-32"} top-1/2 -translate-y-1/2 opacity-[0.03] hidden lg:block pointer-events-none`}
        style={{
          width: "500px",
          height: "429px",
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          backgroundColor: "var(--color-primary)",
        }}
      />
      <div className="container relative z-10" style={{ paddingTop: "var(--space-3xl)", paddingBottom: "var(--space-3xl)" }}>
        {/* Phase header */}
        <div className="flex items-start gap-lg" style={{ marginBottom: "var(--space-2xl)" }}>
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${phase.colour} flex items-center justify-center flex-shrink-0`}>
            <Icon size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-label text-primary" style={{ marginBottom: "var(--space-xs)" }}>{phase.label}</p>
            <h2 className="font-heading" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>{phase.title}</h2>
            <p className="text-base text-slate-500" style={{ marginTop: "var(--space-sm)" }}>{phase.subtitle}</p>
          </div>
          <div className="ml-auto text-right hidden md:block" style={{ paddingTop: "var(--space-sm)" }}>
            <p className="font-heading text-slate-700" style={{ fontSize: "1.75rem" }}>{fmt(phaseImpressions)}</p>
            <p className="text-sm text-slate-400">impressions/mo</p>
          </div>
        </div>

        {/* Article cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          {phase.items.map((item) => (
            <ArticleCard key={item.priority} item={item} accent={phase.accent} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ArticleCard({ item, accent }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow border-l-4 ${accent}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left cursor-pointer"
        style={{ padding: "var(--space-xl) var(--space-2xl)" }}
      >
        {/* Top row */}
        <div className="flex items-start gap-md" style={{ marginBottom: "var(--space-md)" }}>
          <span className="text-sm font-bold text-primary bg-primary/10 rounded-lg px-3 py-1 flex-shrink-0">
            {(item.queuePriority || item.priority).toUpperCase()}
          </span>
          <h3 className="font-heading flex-1" style={{ fontSize: "1.15rem" }}>{item.title}</h3>
          <div className="flex items-center gap-md flex-shrink-0">
            <Badge status={item.status} />
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-500 text-base leading-relaxed ml-0 md:ml-14">{item.why}</p>

        {/* Stats row */}
        <div className="flex items-center gap-2xl ml-0 md:ml-14" style={{ marginTop: "var(--space-lg)" }}>
          <StatInline label="Impressions" value={fmt(item.impressions)} />
          <StatInline label="Position" value={item.position.toFixed(1)} />
          <StatInline label="Clicks/mo" value={item.clicks} />
        </div>
      </button>

      {open && item.keywords.length > 0 && (
        <div className="border-t border-slate-100" style={{ padding: "var(--space-lg) var(--space-2xl) var(--space-xl)" }}>
          <div className="ml-0 md:ml-14">
            <p className="text-sm font-semibold text-slate-600" style={{ marginBottom: "var(--space-sm)" }}>Target Keywords</p>
            <div className="flex flex-wrap gap-sm">
              {item.keywords.map((kw) => (
                <span key={kw} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatInline({ label, value }) {
  return (
    <div className="flex items-baseline gap-xs">
      <span className="text-base font-bold text-slate-800">{value}</span>
      <span className="text-sm text-slate-400">{label}</span>
    </div>
  );
}

function TechCard({ number, title, text }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden" style={{ padding: "var(--space-xl) var(--space-2xl)" }}>
      <span
        className="absolute -top-3 -right-1 font-heading text-[4rem] leading-none pointer-events-none text-slate-900"
        style={{ opacity: 0.04 }}
      >
        {number}
      </span>
      <div className="relative z-10">
        <h3 className="font-heading text-slate-800" style={{ fontSize: "1.1rem", marginBottom: "var(--space-sm)" }}>{title}</h3>
        <p className="text-slate-500 text-base leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function ImpactRow({ label, text, accent = "bg-primary" }) {
  return (
    <div className="flex items-start gap-lg">
      <div className={`w-2 rounded-full ${accent} flex-shrink-0`} style={{ marginTop: "6px", height: "calc(100% - 6px)", minHeight: "20px" }} />
      <div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide" style={{ marginBottom: "var(--space-xs)" }}>{label}</p>
        <p className="text-slate-700 text-base leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
