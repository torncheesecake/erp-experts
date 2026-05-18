import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  CircleDot,
  FileText,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import SEO from "../components/ui/SEO";
import reportData from "../data/reports.json";
import seoProgressSnapshot from "../data/seoProgressSnapshot";

function formatDate(value) {
  if (!value) return "Latest update";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).replace(/(\d{4})-(\d{2})-(\d{2})/g, "$3/$2/$1");
  }
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function plainText(text = "") {
  return String(text)
    .replace(/\s+/g, " ")
    .trim();
}

function statusLabel(status) {
  if (status === "done") return "Completed";
  if (status === "todo") return "Planned";
  if (status === "in_progress") return "In progress";
  return "Tracked";
}

const roadmapItems = (reportData?.ga4Period?.seoInsights?.roadmapPhases || [])
  .flatMap((phase) => (phase.items || []).map((item) => ({ ...item, phase: phase.title })));

const allCompletedItems = roadmapItems.filter((item) => item.status === "done");
const completedItems = allCompletedItems.slice(0, 6);

const allPlannedItems = roadmapItems.filter((item) => item.status !== "done");
const plannedItems = allPlannedItems.slice(0, 5);

const stakeholderBriefs = (seoProgressSnapshot?.activePlans || []).slice(0, 4);

const topOpportunities = (seoProgressSnapshot?.strategicOpportunities || [])
  .slice(0, 4);

function StatCard({ icon: Icon, label, value, note, tone = "slate" }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    pink: "bg-pink-50 text-pink-700 ring-pink-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-100",
  };

  return (
    <div className="flex h-full flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${tones[tone]}`}>
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{note}</p>
    </div>
  );
}

function SimpleList({ title, description, items, renderItem, emptyText }) {
  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-7">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
        {description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
      </div>
      {items.length ? (
        <div className="space-y-4">
          {items.map(renderItem)}
        </div>
      ) : (
        <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{emptyText}</p>
      )}
    </section>
  );
}

export default function SeoProgress() {
  const health = seoProgressSnapshot?.health || {};
  const passCount = Number(health.pass || 0);
  const reviewCount = Number(health.needsReview || 0);
  const blockedCount = Number(health.blocked || 0);
  const lastUpdated = seoProgressSnapshot?.lastUpdated || reportData?.lastUpdated;
  const currentSummary = seoProgressSnapshot?.headlineSummary
    || "SEO and content work is healthy. Current focus is strategic growth rather than maintenance.";
  const plannedCount = allPlannedItems.length || topOpportunities.length;

  return (
    <>
      <SEO
        title="SEO & Content Progress"
        description="Internal progress view for ERP Experts SEO review, content planning and current priorities."
        path="/seo-progress"
        noIndex
      />

      <main id="main-content" className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-gradient-to-br from-white via-white to-slate-100">
          <div
            className="container"
            style={{
              paddingTop: "clamp(8rem, 12vw, 10rem)",
              paddingBottom: "clamp(3rem, 6vw, 4rem)",
            }}
          >
            <div className="grid gap-8">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-600">
                  Internal visibility
                </p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl xl:text-6xl">
                  SEO & Content Progress
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                  This internal progress view summarises SEO review, content planning and current priorities. It is designed for business review and planning discussions.
                </p>
              </div>
              <div className="w-full max-w-xl rounded-3xl bg-slate-950 p-6 text-white shadow-sm ring-1 ring-slate-800/40 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                    <ShieldCheck size={20} />
                  </span>
                  <div>
                    <p className="text-sm text-white/60">Content health</p>
                    <p className="text-xl font-semibold">{blockedCount === 0 && reviewCount === 0 ? "Healthy" : "Needs review"}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-white/70">
                  Last updated {formatDate(lastUpdated)}. Current SEO review shows {passCount} healthy articles, {reviewCount} needing review and {blockedCount} blocked.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="container"
          style={{
            paddingTop: "clamp(2.5rem, 6vw, 4rem)",
            paddingBottom: "clamp(2.75rem, 6vw, 4rem)",
          }}
        >
          <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={CheckCircle2}
              label="Content health"
              value={passCount}
              note={`${reviewCount} needing review · ${blockedCount} blocked`}
              tone="green"
            />
            <StatCard
              icon={FileText}
              label="Completed work"
              value={allCompletedItems.length}
              note="Content planning items currently marked as complete."
              tone="blue"
            />
            <StatCard
              icon={CircleDot}
              label="Current work"
              value={stakeholderBriefs.length}
              note="Topics currently being scoped or prepared for review."
              tone="pink"
            />
            <StatCard
              icon={Lightbulb}
              label="Planned next"
              value={plannedCount}
              note="Near-term content and growth opportunities being evaluated."
              tone="amber"
            />
          </div>

          <div className="mt-8 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-7 md:mt-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Internal visibility</h2>
                <p className="mt-3 max-w-4xl text-base leading-8 text-slate-600">{currentSummary}</p>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-500">
                  Completed work, current work and planned next work are grouped here for simple internal progress tracking.
                </p>
              </div>
              <div className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 md:w-auto md:shrink-0">
                <Calendar className="mr-2 inline h-4 w-4 text-slate-400" />
                Data through {formatDate(reportData?.dataThrough || reportData?.lastUpdated)}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
            <SimpleList
              title="Completed work"
              description="Published or improved resources currently marked as complete in content planning."
              items={completedItems}
              emptyText="No completed content planning items are available in the current view."
              renderItem={(item) => (
                <div key={`${item.phase}-${item.priority}-${item.title}`} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.phase}</p>
                    </div>
                    <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {statusLabel(item.status)}
                    </span>
                  </div>
                </div>
              )}
            />

            <SimpleList
              title="Current work"
              description="Content ideas being shaped into SEO review notes before drafting or publication."
              items={stakeholderBriefs}
              emptyText="No active content plans are listed in the current view."
              renderItem={(brief) => (
                <div key={`${brief.displayRank || brief.targetArticleTitle}-${brief.preferredTitle || brief.targetArticleTitle}`} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950">{brief.preferredTitle || brief.targetArticleTitle}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {brief.recommendationType === "improve_existing"
                          ? "Improving an existing resource."
                          : "Scoping a new demand-led resource."}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700">
                      {brief.conversionIntentLabel || "review"}
                    </span>
                  </div>
                </div>
              )}
            />

            <SimpleList
              title="Planned next"
              description="Known content planning items queued for future SEO review."
              items={plannedItems}
              emptyText="No planned content work is currently listed."
              renderItem={(item) => (
                <div key={`${item.phase}-${item.priority}-${item.title}`} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.why}</p>
                    </div>
                    <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Planned
                    </span>
                  </div>
                </div>
              )}
            />

            <SimpleList
              title="Strategic focus"
              description="High-level content opportunities that may become new resources, refreshes, or internal-link improvements."
              items={topOpportunities}
              emptyText="No strategic focus items are available in the current view."
              renderItem={(opportunity) => (
                <div key={opportunity.id || opportunity.groupTitle || opportunity.title} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950">{opportunity.groupTitle || opportunity.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {plainText(opportunity.recommendedAction || opportunity.whyThisRanks)}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {opportunity.priorityLabel || "tracked"}
                    </span>
                  </div>
                </div>
              )}
            />
          </div>

          <div className="mt-8 rounded-[2rem] bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white shadow-sm sm:p-7 md:mt-10">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-pink-200">
                    <TrendingUp size={20} />
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight">Strategic focus</h2>
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
                  The resource library is currently healthy. The priority is measured growth: choosing the right topics, strengthening relevant paths to services, and keeping completed content visible to the wider business.
                </p>
              </div>
              <Link
                to="/reports"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-pink-50"
              >
                Back to reports
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
