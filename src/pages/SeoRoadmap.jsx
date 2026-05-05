/**
 * SEO Content Roadmap — Internal page (noindex)
 * Living document for tracking SEO content priorities
 *
 * Two access levels:
 *   Admin  → can update article statuses (todo / in_progress / done)
 *   Viewer → read-only view
 */

import { useEffect, useState } from "react";
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
  LogOut,
  Search,
  ArrowRight,
  Wrench,
  Eye,
  BarChart3,
} from "lucide-react";
import reportData from "../data/reports.json";

const seoSnapshotDate =
  reportData?.ga4Period?.seoInsights?.period?.split(" to ").at(-1) || reportData?.lastUpdated;
const demandSignals = reportData?.ga4Period?.seoInsights?.demandSignals || {};

/* ── passwords ── */
const ADMIN_PIN = "seo2026admin";
const VIEWER_PIN = "seo2026";

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
};

function getRoadmapPhases() {
  const dynamicPhases = reportData?.ga4Period?.seoInsights?.roadmapPhases;
  const sourcePhases = Array.isArray(dynamicPhases) && dynamicPhases.length ? dynamicPhases : initialPhases;
  return sourcePhases.map((phase, index) => ({
    ...phase,
    ...phasePresentation[phase.id || index + 1],
  }));
}

/* ── helpers ── */
const fmt = (n) => n.toLocaleString("en-GB");
const britDate = (s) => (s ? s.replace(/(\d{4})-(\d{2})-(\d{2})/g, (_, y, m, d) => `${d}/${m}/${y}`) : s);
const API_URL = "/api/seo-statuses.php";

async function loadStatuses() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) return {};
    return await res.json();
  } catch { return {}; }
}

async function saveStatuses(map) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statuses: map }),
    });
  } catch { /* silent fail */ }
}

/* ── password gate ── */

function RoadmapGate({ children }) {
  const [role, setRole] = useState(() => sessionStorage.getItem("seo_roadmap_role"));
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  if (role) return children({ role, logout: () => { sessionStorage.removeItem("seo_roadmap_role"); setRole(null); } });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem("seo_roadmap_role", "admin");
      setRole("admin");
    } else if (pin === VIEWER_PIN) {
      sessionStorage.setItem("seo_roadmap_role", "viewer");
      setRole("viewer");
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: "120px", background: "linear-gradient(135deg, #1a1a2e08 0%, #1a1a2e15 100%)" }}>
      <form onSubmit={handleSubmit} className="rounded-3xl border-2 border-(--color-text)/10 bg-white shadow-xl text-center" style={{ padding: "var(--space-2xl)", maxWidth: "380px", width: "100%" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-lg bg-primary/10">
          <Search className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-heading font-bold mb-sm">SEO Roadmap</h1>
        <p className="text-sm text-(--color-text)/70 mb-xl">Enter the access code to continue.</p>
        <input
          type="password"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(false); }}
          placeholder="Access code"
          autoFocus
          className={`w-full rounded-xl border-2 text-center text-lg font-mono tracking-widest outline-none transition-colors ${error ? "border-red-400 bg-red-50" : "border-(--color-text)/15 focus:border-primary"}`}
          style={{ padding: "12px 16px" }}
        />
        {error && <p className="text-sm text-red-500 mt-sm">Incorrect code. Try again.</p>}
        <button type="submit" className="btn btn-primary w-full mt-lg">
          View Roadmap
        </button>
      </form>
    </div>
  );
}

/* ── main component ── */
export default function SeoRoadmap() {
  useEffect(() => {
    document.title = "SEO Content Roadmap — ERP Experts (Internal)";
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
    return () => (meta.content = "index, follow");
  }, []);

  return (
    <RoadmapGate>
      {({ role, logout }) => <RoadmapContent role={role} logout={logout} />}
    </RoadmapGate>
  );
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

  useEffect(() => {
    loadStatuses().then((saved) => {
      setStatusMap((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(saved)) {
          next[key] = saved[key];
        }
        return next;
      });
      setLoaded(true);
    });
  }, []);

  const updateStatus = (priority, newStatus) => {
    setStatusMap((prev) => {
      const next = { ...prev, [priority]: newStatus };
      saveStatuses(next);
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

  return { phases: openPhases, allItems, openItems, doneItems, updateStatus, loaded };
}

function RoadmapContent({ role, logout }) {
  const isAdmin = role === "admin";
  const [previewing, setPreviewing] = useState(false);

  if (isAdmin && !previewing) {
    return <AdminView logout={logout} onPreview={() => setPreviewing(true)} />;
  }

  return <ViewerView logout={logout} showBackToAdmin={isAdmin && previewing} onBackToAdmin={() => setPreviewing(false)} />;
}

/* ════════════════════════════════════════════════════════════
   ADMIN VIEW — simple checklist, focused on action
   ════════════════════════════════════════════════════════════ */

function AdminView({ logout, onPreview }) {
  const { phases, allItems, openItems, doneItems, updateStatus, loaded } = useRoadmapState();

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg text-(--color-text)/50">Loading roadmap…</p>
    </div>
  );

  const countByStatus = (s) => allItems.filter((i) => i.status === s).length;
  const doneCount = doneItems.length;
  const progressCount = countByStatus("in_progress");
  const todoCount = countByStatus("todo");
  const pct = Math.round((doneCount / allItems.length) * 100);
  const demandQueries = demandSignals.erpNetsuiteQueries || [];
  const erpPatterns = demandSignals.erpInPatterns || [];
  const demandGaps = demandSignals.contentGaps || [];

  // Find current + next up
  const inProgress = openItems.find((i) => i.status === "in_progress");
  const firstTodo = openItems.find((i) => i.status === "todo");

  // "Next up" should always be the top actionable todo item.
  const nextUp = firstTodo;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="bg-slate-900 text-white" style={{ paddingTop: "160px", paddingBottom: "var(--space-2xl)" }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-xl)" }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-primary/20 text-primary ring-1 ring-primary/30">
              <Lock size={13} />
              Admin
            </span>
            <div className="flex items-center gap-lg">
              <button onClick={onPreview} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer">
                <Eye size={15} />
                View as Tim
              </button>
              <button onClick={logout} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors cursor-pointer">
                <LogOut size={15} />
                Log out
              </button>
            </div>
          </div>
          <h1 className="font-heading text-white" style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", marginBottom: "var(--space-sm)" }}>SEO Content Checklist</h1>
          <p className="text-white/50 text-sm">{allItems.length} articles across {phases.length} phases</p>
        </div>
      </header>

      {/* ── Stats strip ── */}
      <div className="bg-slate-800 border-t border-white/5">
        <div className="container" style={{ padding: "var(--space-lg) var(--space-xl)" }}>
          <div className="flex items-center gap-xl flex-wrap">
            {/* Progress bar */}
            <div className="flex-1 min-w-[200px]">
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            {/* Counts */}
            <div className="flex items-center gap-lg text-sm">
              <span className="flex items-center gap-1.5 text-green-400 font-semibold"><span className="w-2 h-2 rounded-full bg-green-400" />{doneCount} done</span>
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold"><span className="w-2 h-2 rounded-full bg-amber-400" />{progressCount} active</span>
              <span className="flex items-center gap-1.5 text-slate-400 font-semibold"><span className="w-2 h-2 rounded-full bg-slate-500" />{todoCount} to do</span>
              <span className="text-white/40 font-mono text-xs">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white border-b border-slate-200">
        <div className="container" style={{ paddingTop: "var(--space-xl)", paddingBottom: "var(--space-xl)" }}>
          <h2 className="font-heading" style={{ fontSize: "1.2rem", marginBottom: "var(--space-sm)" }}>
            Live Search Demand Snapshot (ERP and NetSuite)
          </h2>
          <p className="text-sm text-slate-600" style={{ marginBottom: "var(--space-lg)" }}>
            What people are currently searching, used by automation to pick the next guide.
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
        </div>
      </section>

      {/* ── Now / Next up ── */}
      <div className="container" style={{ paddingTop: "var(--space-2xl)", paddingBottom: "var(--space-xl)" }}>
        <div className="grid md:grid-cols-2" style={{ gap: "var(--space-lg)" }}>
          {/* Current */}
          <div className="rounded-2xl border-2 border-amber-300 bg-white shadow-sm" style={{ padding: "var(--space-xl) var(--space-2xl)" }}>
            <div className="flex items-center gap-sm" style={{ marginBottom: "var(--space-md)" }}>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Now working on</p>
            </div>
            {inProgress ? (
              <>
                <div className="flex items-center gap-md" style={{ marginBottom: "var(--space-sm)" }}>
                  <span className="text-sm font-bold text-white bg-amber-500 rounded-lg px-2.5 py-0.5 font-mono">{(inProgress.queuePriority || inProgress.priority).toUpperCase()}</span>
                  <p className="font-heading text-slate-800" style={{ fontSize: "1.15rem" }}>{inProgress.title}</p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{inProgress.why}</p>
              </>
            ) : (
              <p className="text-slate-500 text-sm">Nothing in progress — pick one below</p>
            )}
          </div>

          {/* Next up */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-sm" style={{ padding: "var(--space-xl) var(--space-2xl)" }}>
            <div className="flex items-center gap-sm" style={{ marginBottom: "var(--space-md)" }}>
              <ArrowRight size={13} className="text-slate-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Next up</p>
            </div>
            {nextUp || firstTodo ? (
              <>
                <div className="flex items-center gap-md" style={{ marginBottom: "var(--space-sm)" }}>
                  <span className="text-sm font-bold text-primary bg-primary/10 rounded-lg px-2.5 py-0.5 font-mono">{((nextUp || firstTodo).queuePriority || (nextUp || firstTodo).priority).toUpperCase()}</span>
                  <p className="font-heading text-slate-800" style={{ fontSize: "1.15rem" }}>{(nextUp || firstTodo).title}</p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{(nextUp || firstTodo).why}</p>
              </>
            ) : (
              <p className="text-green-600 text-sm font-semibold">All done!</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Phase checklists ── */}
      {phases.map((phase) => {
        const Icon = phase.icon;
        const phaseDone = phase.doneItems ?? 0;
        const phaseAll = phase.totalItems ?? phase.items.length;
        const phasePct = Math.round((phaseDone / phaseAll) * 100);
        return (
          <section key={phase.id}>
            <div className="container" style={{ paddingTop: "var(--space-xl)", paddingBottom: "var(--space-2xl)" }}>
              {/* Phase header */}
              <div className="flex items-center gap-lg" style={{ marginBottom: "var(--space-md)" }}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${phase.colour} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="font-heading text-slate-800" style={{ fontSize: "1.2rem" }}>{phase.label}: {phase.title}</h2>
                  <p className="text-sm text-slate-600">{phase.subtitle}</p>
                </div>
                <span className="text-sm font-semibold text-slate-600 font-mono bg-slate-100 rounded-lg px-2.5 py-1">{phaseDone}/{phaseAll}</span>
              </div>

              {/* Phase progress mini-bar */}
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden" style={{ marginBottom: "var(--space-lg)" }}>
                <div className={`h-full bg-gradient-to-r ${phase.colour} rounded-full transition-all duration-500`} style={{ width: `${phasePct}%` }} />
              </div>

              {/* Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                {phase.items.map((item) => (
                  <AdminRow key={item.priority} item={item} accent={phase.accent} colour={phase.colour} onStatusChange={updateStatus} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* ── Footer ── */}
      <div className="container text-center" style={{ padding: "var(--space-lg) 0 var(--space-2xl)" }}>
        <p className="text-xs text-slate-500">Changes save automatically to this browser</p>
      </div>
    </div>
  );
}

function AdminRow({ item, accent, colour, onStatusChange }) {
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

function ViewerView({ logout, showBackToAdmin = false, onBackToAdmin }) {
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
              <button onClick={logout} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors cursor-pointer">
                <LogOut size={15} />
                Log out
              </button>
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
