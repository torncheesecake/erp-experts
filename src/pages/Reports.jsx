/**
 * Weekly Reports Dashboard
 * Internal use only - not indexed by search engines
 *
 * Data lives in src/data/reports.json — update it weekly with numbers from
 * GA4, LinkedIn, and your email marketing tool, then rebuild & deploy.
 */

import { useEffect } from "react";
import {
  TrendingUp,
  Minus,
  Eye,
  Users,
  MousePointerClick,
  Timer,
  BarChart3,
  Linkedin,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Heart,
} from "lucide-react";
import reportData from "../data/reports.json";

/* ───────────────────────── helpers ───────────────────────── */

function fmt(n, type) {
  if (n == null || (n === 0 && type !== "number")) return "—";
  if (type === "percent") return `${n.toFixed(1)}%`;
  if (type === "duration") {
    const m = Math.floor(n / 60);
    const s = n % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }
  if (type === "number") return n.toLocaleString("en-GB");
  return String(n);
}

function delta(current, previous, invert = false) {
  if (current == null || previous == null || previous === 0)
    return { label: "—", color: "text-gray-400", icon: Minus };
  const diff = ((current - previous) / previous) * 100;
  const abs = Math.abs(diff).toFixed(1);
  if (Math.abs(diff) < 0.5) return { label: "No change", color: "text-gray-400", icon: Minus };
  const isUp = diff > 0;
  const isGood = invert ? !isUp : isUp;
  return {
    label: `${isUp ? "+" : ""}${abs}%`,
    color: isGood ? "text-green-600" : "text-red-500",
    icon: isUp ? ArrowUpRight : ArrowDownRight,
  };
}

/* ───────────────────────── metric card ───────────────────── */

function MetricCard({ label, value, prevValue, type = "number", invert = false, icon: Icon }) {
  const d = delta(value, prevValue, invert);
  const DeltaIcon = d.icon;
  const hasValue = value != null && (type === "number" ? true : value !== 0);

  return (
    <div className="p-lg rounded-2xl border border-(--color-text)/10 hover:border-primary/25 transition-colors">
      <div className="flex items-center justify-between mb-md">
        <span className="text-sm font-bold text-muted uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-primary/40" />}
      </div>
      <p className="text-3xl md:text-4xl font-heading font-bold mb-sm">
        {hasValue ? fmt(value, type) : "—"}
      </p>
      {hasValue && prevValue != null ? (
        <div className={`flex items-center gap-xs text-sm font-medium ${d.color}`}>
          <DeltaIcon className="w-4 h-4" />
          <span>{d.label}</span>
          <span className="text-gray-400 font-normal ml-xs">vs prev week</span>
        </div>
      ) : (
        <p className="text-sm text-gray-400">No comparison data</p>
      )}
    </div>
  );
}

/* ───────────────────────── section heading ───────────────── */

function SectionHeading({ icon: Icon, title, color = "primary" }) {
  return (
    <div className="flex items-center gap-md mb-xl">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `var(--color-${color})`, opacity: 0.15 }}
      >
        <Icon className="w-5 h-5" style={{ color: `var(--color-${color})` }} />
      </div>
      <h2 className="text-xl md:text-2xl font-heading">{title}</h2>
    </div>
  );
}

/* ───────────────────────── sparkline (pure CSS) ─────────── */

function Sparkline({ values, color = "var(--color-primary)" }) {
  if (!values || values.length < 2) return null;
  const filtered = values.filter((v) => v != null);
  if (filtered.length < 2) return null;
  const max = Math.max(...filtered);
  const min = Math.min(...filtered);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-px h-8">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm min-w-[4px] transition-all"
          style={{
            height: v != null ? `${Math.max(8, ((v - min) / range) * 100)}%` : "4%",
            backgroundColor: v != null ? color : "#e5e7eb",
            opacity: i === values.length - 1 ? 1 : v != null ? 0.4 : 0.2,
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── traffic sources bar ───────────── */

const sourceColors = {
  organic: "#2a9d63",
  direct: "#2d6ad4",
  referral: "#e83a7a",
  social: "#7a32c4",
};

function TrafficBar({ sources }) {
  if (!sources) return null;
  const entries = Object.entries(sources).filter(([, pct]) => pct > 0);
  return (
    <div>
      <div className="flex h-8 rounded-full overflow-hidden mb-lg">
        {entries.map(([key, pct]) => (
          <div
            key={key}
            style={{ width: `${pct}%`, backgroundColor: sourceColors[key] }}
            className="transition-all"
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-lg">
        {Object.entries(sources).map(([key, pct]) => (
          <div key={key} className="flex items-center gap-sm">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: sourceColors[key] }}
            />
            <span className="text-sm capitalize">
              {key} <span className="font-bold">{pct}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── top pages table ───────────────── */

function TopPages({ pages }) {
  if (!pages || pages.length === 0) return null;
  const maxViews = pages[0].views;

  return (
    <div className="space-y-sm">
      {pages.map((page, i) => (
        <div key={i} className="flex items-center gap-md">
          <span className="text-sm text-muted w-40 md:w-56 shrink-0 truncate font-mono">
            {page.path}
          </span>
          <div className="flex-1 h-6 bg-(--color-text)/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(page.views / maxViews) * 100}%`,
                backgroundColor: "var(--color-primary)",
                opacity: 0.7,
              }}
            />
          </div>
          <span className="text-sm font-bold w-16 text-right shrink-0">
            {page.views.toLocaleString("en-GB")}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── main component ───────────────── */

export default function Reports() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
    document.title = "Weekly Reports - Internal Only";

    return () => {
      if (meta) meta.content = "index, follow";
    };
  }, []);

  const current = reportData.weeks[0];
  const previous = reportData.weeks[1];
  const hasGAData = current.ga.sessions != null;
  const hasEmailData = current.email && current.email.openRate > 0;
  const hasEnoughForTrends = reportData.weeks.length >= 3;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header
        className="relative overflow-hidden"
        style={{ padding: "var(--space-4xl) 0 var(--space-3xl)" }}
      >
        <div
          className="absolute top-1/2 right-0 opacity-8 hidden lg:block pointer-events-none"
          style={{
            width: "700px",
            height: "600px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(25%) translateY(-50%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 opacity-5 hidden md:block pointer-events-none"
          style={{
            width: "300px",
            height: "258px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(-40%) translateY(30%)",
          }}
        />

        <div className="container relative z-10">
          <p className="text-label text-primary mb-md">Internal Reference</p>
          <h1 className="text-hero mb-xl">
            Weekly <span className="text-primary">Reports</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted max-w-3xl leading-relaxed">
            Key marketing metrics across website, LinkedIn, and email. Week ending{" "}
            <span className="font-bold text-(--color-text)">{current.weekEnding}</span>.
          </p>
          <p className="text-sm text-muted mt-md">Last updated: {reportData.lastUpdated}</p>
        </div>
      </header>

      {/* GA4 Summary Cards */}
      <section
        className="border-y border-(--color-text)/10"
        style={{ padding: "var(--space-2xl) 0" }}
      >
        <div className="container">
          <SectionHeading icon={BarChart3} title="Website Performance" />
          {hasGAData ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-md md:gap-lg">
              <MetricCard
                label="Sessions"
                value={current.ga.sessions}
                prevValue={previous?.ga.sessions}
                icon={Eye}
              />
              <MetricCard
                label="Page Views"
                value={current.ga.pageViews}
                prevValue={previous?.ga.pageViews}
                icon={BarChart3}
              />
              <MetricCard
                label="Users"
                value={current.ga.users}
                prevValue={previous?.ga.users}
                icon={Users}
              />
              <MetricCard
                label="New Users"
                value={current.ga.newUsers}
                prevValue={previous?.ga.newUsers}
                icon={Users}
              />
              <MetricCard
                label="Avg Engagement"
                value={current.ga.avgSessionDuration}
                prevValue={previous?.ga.avgSessionDuration}
                type="duration"
                icon={Timer}
              />
              <MetricCard
                label="CTA Clicks"
                value={current.ga.ctaClicks}
                prevValue={previous?.ga.ctaClicks}
                icon={MousePointerClick}
              />
              <MetricCard
                label="Leads"
                value={current.ga.leads}
                prevValue={previous?.ga.leads}
                icon={Target}
              />
            </div>
          ) : (
            <p className="text-muted text-center py-xl">
              No GA4 data for this week. Export a snapshot from GA4 to populate.
            </p>
          )}
        </div>
      </section>

      {/* Top Pages + Traffic Sources */}
      {hasGAData && (
        <section style={{ padding: "var(--space-2xl) 0" }}>
          <div className="container">
            <div className="grid md:grid-cols-2 gap-2xl">
              <div>
                <h3 className="text-lg font-heading mb-lg">Top Pages</h3>
                <TopPages pages={current.ga.topPages} />
              </div>

              <div>
                <h3 className="text-lg font-heading mb-lg">Traffic Sources</h3>
                <TrafficBar sources={current.ga.trafficSources} />

                {previous?.ga.trafficSources && (
                  <div className="mt-xl">
                    <p className="text-xs text-muted uppercase tracking-wider mb-md font-bold">
                      Previous week
                    </p>
                    <TrafficBar sources={previous.ga.trafficSources} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* LinkedIn */}
      <section
        className="border-y border-(--color-text)/10"
        style={{ padding: "var(--space-2xl) 0" }}
      >
        <div className="container">
          <SectionHeading icon={Linkedin} title="LinkedIn Performance" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md md:gap-lg">
            <MetricCard
              label="Followers"
              value={current.linkedin.followers}
              prevValue={previous?.linkedin.followers}
              icon={Users}
            />
            <MetricCard
              label="New Followers"
              value={current.linkedin.newFollowers}
              prevValue={previous?.linkedin.newFollowers}
              icon={TrendingUp}
            />
            <MetricCard
              label="Impressions"
              value={current.linkedin.impressions}
              prevValue={previous?.linkedin.impressions}
              icon={Eye}
            />
            <MetricCard
              label="Engagements"
              value={current.linkedin.engagements}
              prevValue={previous?.linkedin.engagements}
              icon={Heart}
            />
            <MetricCard
              label="Engagement Rate"
              value={current.linkedin.engagementRate}
              prevValue={previous?.linkedin.engagementRate}
              type="percent"
              icon={MousePointerClick}
            />
          </div>
        </div>
      </section>

      {/* Email Marketing */}
      {hasEmailData && (
        <section style={{ padding: "var(--space-2xl) 0" }}>
          <div className="container">
            <SectionHeading icon={Mail} title="Email Marketing" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md md:gap-lg">
              <MetricCard
                label="Open Rate"
                value={current.email.openRate}
                prevValue={previous?.email.openRate}
                type="percent"
                icon={Mail}
              />
              <MetricCard
                label="Click Rate"
                value={current.email.clickRate}
                prevValue={previous?.email.clickRate}
                type="percent"
                icon={MousePointerClick}
              />
              <MetricCard
                label="Recipients"
                value={current.email.totalRecipients}
                prevValue={previous?.email.totalRecipients}
                icon={Users}
              />
              <MetricCard
                label="Unsubscribes"
                value={current.email.unsubscribes}
                prevValue={previous?.email.unsubscribes}
                invert
              />
            </div>
          </div>
        </section>
      )}

      {/* Trends */}
      {hasEnoughForTrends && (
        <section
          className="border-t border-(--color-text)/10"
          style={{ padding: "var(--space-2xl) 0" }}
        >
          <div className="container">
            <SectionHeading icon={TrendingUp} title="Trends" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
              {[
                {
                  label: "LinkedIn Followers",
                  values: reportData.weeks.map((w) => w.linkedin.followers).reverse(),
                  color: "#0a66c2",
                },
                {
                  label: "LI Impressions",
                  values: reportData.weeks.map((w) => w.linkedin.impressions).reverse(),
                  color: "#0a66c2",
                },
                {
                  label: "LI Engagements",
                  values: reportData.weeks.map((w) => w.linkedin.engagements).reverse(),
                  color: "var(--color-quaternary)",
                },
                {
                  label: "LI Engagement Rate",
                  values: reportData.weeks.map((w) => w.linkedin.engagementRate).reverse(),
                  color: "var(--color-primary)",
                },
              ].map((trend) => (
                <div key={trend.label} className="p-lg rounded-2xl border border-(--color-text)/10">
                  <p className="text-sm font-bold text-muted uppercase tracking-wider mb-md">
                    {trend.label}
                  </p>
                  <Sparkline values={trend.values} color={trend.color} />
                  <div className="flex justify-between mt-sm">
                    <span className="text-xs text-muted">
                      {reportData.weeks[reportData.weeks.length - 1].weekEnding}
                    </span>
                    <span className="text-xs text-muted">{current.weekEnding}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative overflow-hidden py-(--space-2xl) border-t border-(--color-text)/10">
        <div
          className="absolute top-0 right-0 opacity-5 pointer-events-none"
          style={{
            width: "200px",
            height: "172px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(30%) translateY(-40%)",
          }}
        />
        <div className="container text-center relative z-10">
          <p className="text-muted">ERP Experts Weekly Reports - Internal Use Only - Not Indexed</p>
          <p className="text-sm text-muted mt-sm">
            Update{" "}
            <code className="bg-(--color-text)/5 px-2 py-0.5 rounded text-xs">
              src/data/reports.json
            </code>{" "}
            weekly, then rebuild and deploy.
          </p>
        </div>
      </footer>
    </div>
  );
}
