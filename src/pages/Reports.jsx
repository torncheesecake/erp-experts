/**
 * Marketing Reports Dashboard
 * Internal use only — not indexed by search engines
 *
 * Data lives in src/data/reports.json — update it weekly with numbers from
 * GA4, LinkedIn, and your email marketing tool, then rebuild & deploy.
 */

import { useEffect, useState, useRef } from "react";
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
  MessageSquare,
  ThumbsUp,
  Repeat2,
  Award,
  HelpCircle,
  Calendar,
  Globe,
  Briefcase,
  MapPin,
  Building2,
  Rocket,
  Search,
  ArrowRight,
  AlertTriangle,
  Filter,
  LogOut,
  Clock,
  ChevronRight,
} from "lucide-react";
import reportData from "../data/reports.json";

/* ───────────────────────── animation hooks ───────────────── */

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, isVisible];
}

function useCountUp(target, isVisible, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isVisible || target == null) return;
    const num = typeof target === "number" ? target : parseFloat(target);
    if (isNaN(num) || num === 0) { setValue(target); return; }
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(num * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else setValue(num);
    }
    requestAnimationFrame(tick);
  }, [target, isVisible, duration]);
  return value;
}

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, isVisible] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ───────────────────────── helpers ───────────────────────── */

function fmt(n, type) {
  if (n == null) return "N/A";
  if (type === "percent") return `${n.toFixed(1)}%`;
  if (type === "duration") {
    const rounded = Math.round(n);
    const m = Math.floor(rounded / 60);
    const s = rounded % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }
  if (type === "number") return n.toLocaleString("en-GB");
  return String(n);
}

function delta(current, previous, invert = false) {
  if (current == null || previous == null || previous === 0)
    return { label: "N/A", color: "text-gray-400", icon: Minus, sentiment: "neutral" };
  const diff = ((current - previous) / previous) * 100;
  const abs = Math.abs(diff).toFixed(1);
  if (Math.abs(diff) < 0.5) return { label: "No change", color: "text-gray-400", icon: Minus, sentiment: "neutral" };
  const isUp = diff > 0;
  const isGood = invert ? !isUp : isUp;
  return {
    label: `${isUp ? "+" : "-"}${abs}%`,
    color: isGood ? "text-green-600" : "text-red-500",
    icon: isUp ? ArrowUpRight : ArrowDownRight,
    sentiment: isGood ? "good" : "bad",
  };
}

function sumWeeks(weeks, getter) {
  return weeks.reduce((total, w) => {
    const v = getter(w);
    return v != null ? total + v : total;
  }, 0);
}

function avgWeeks(weeks, getter) {
  let sum = 0;
  let count = 0;
  for (const w of weeks) {
    const v = getter(w);
    if (v != null) {
      sum += v;
      count++;
    }
  }
  return count > 0 ? sum / count : null;
}

/* ───────────────────────── jargon glossary ───────────────── */

const glossary = {
  sessions:
    "A session is one visit to the website. If someone visits twice in a day, that's 2 sessions.",
  pageViews: "Total number of pages viewed. One person viewing 3 pages = 3 page views.",
  users: "Unique people who visited the site (based on browser cookies).",
  newUsers: "People visiting the site for the first time ever.",
  avgEngagement: "Average time a visitor actively spent on the site before leaving.",
  ctaClicks: "Clicks on call-to-action buttons like 'Get in touch' or 'Book a call'.",
  leads: "Form submissions or direct enquiries generated through the website.",
  followers: "Total people following the ERP Experts LinkedIn company page.",
  newFollowers: "New people who followed the page this period.",
  impressions:
    "Number of times posts appeared in someone's LinkedIn feed. Doesn't mean they read it, just that it was shown.",
  engagements: "Any interaction with a post: likes, comments, shares, or clicks. More = better.",
  engagementRate:
    "Engagements divided by impressions. Tells you what % of people who saw the post actually interacted. Above 2% is good for LinkedIn.",
  organic: "People who found the site via Google search (not ads).",
  direct: "People who typed the URL directly or used a bookmark.",
  referral: "People who clicked a link from another website.",
  social: "People who came from social media (LinkedIn, etc).",
  openRate: "Percentage of email recipients who opened the email.",
  clickRate: "Percentage of email recipients who clicked a link inside the email.",
};

/* ───────────────────────── tooltip ───────────────────────── */

function Tooltip({ term }) {
  const text = glossary[term];
  if (!text) return null;
  return (
    <span className="group relative inline-flex cursor-help" style={{ marginLeft: "10px" }}>
      <span className="w-5 h-5 rounded-full border-2 border-gray-400 group-hover:border-primary group-hover:bg-primary/10 flex items-center justify-center transition-colors">
        <span className="text-xs font-bold text-gray-400 group-hover:text-primary transition-colors">
          ?
        </span>
      </span>
      <span
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-md rounded-xl bg-gray-900 text-white text-sm leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-xl"
        style={{ width: "300px" }}
      >
        {text}
      </span>
    </span>
  );
}

/* ───────────────────────── metric card ───────────────────── */

function MetricCard({
  label,
  value,
  prevValue,
  type = "number",
  invert = false,
  icon: Icon,
  tooltip,
  compLabel = "vs last week",
  highlight = false,
  delay = 0,
  children,
}) {
  const d = delta(value, prevValue, invert);
  const DeltaIcon = d.icon;
  const hasValue = value != null;
  const [ref, isVisible] = useInView(0.1);
  const animatedValue = useCountUp(
    hasValue && type === "number" ? value : null,
    isVisible
  );

  const sentimentBg = d.sentiment === "good"
    ? "rgba(34, 197, 94, 0.04)"
    : d.sentiment === "bad"
      ? "rgba(239, 68, 68, 0.04)"
      : undefined;

  const displayValue = hasValue
    ? type === "number" ? fmt(animatedValue, type) : fmt(value, type)
    : "N/A";

  return (
    <div
      ref={ref}
      className={`rounded-2xl md:rounded-3xl border-2 transition-all ${
        highlight
          ? "border-primary/20"
          : "border-(--color-text)/10 hover:border-primary/25"
      }`}
      style={{
        padding: "var(--space-lg)",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms, border-color 0.2s ease`,
        ...(highlight ? { borderLeftWidth: "4px", borderLeftColor: "var(--color-primary)" } : {}),
        ...(sentimentBg ? { backgroundColor: sentimentBg } : {}),
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
        <span className="text-sm font-bold text-(--color-text) tracking-wide flex items-center">
          {label}
          {tooltip && <Tooltip term={tooltip} />}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
            <Icon className="w-3.5 h-3.5 text-primary" />
          </div>
        )}
      </div>
      <p className="text-3xl md:text-4xl font-heading font-bold" style={{ marginBottom: "8px" }}>
        {displayValue}
      </p>
      {hasValue && value === 0 && prevValue != null && prevValue > 0 ? (
        <p className="text-sm text-amber-600 font-medium">
          None this period — was {fmt(prevValue, type)} previously
        </p>
      ) : hasValue && prevValue != null ? (
        <div className={`flex items-center flex-wrap gap-xs text-sm font-medium ${d.color}`}>
          <DeltaIcon className="w-4 h-4" />
          <span>{d.label}</span>
          <span className="text-(--color-text)/70 font-normal" style={{ marginLeft: "4px" }}>
            {compLabel}
          </span>
          <span className="text-(--color-text)/60 font-normal">
            ({fmt(prevValue, type)})
          </span>
        </div>
      ) : (
        <p className="text-sm text-(--color-text)/70">No comparison data</p>
      )}
      {children && (
        <div className="mt-md pt-md border-t border-(--color-text)/8">
          {children}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── section heading ───────────────── */

function SectionHeading({ icon: Icon, title, subtitle }) {
  const [ref, isVisible] = useInView(0.1);
  return (
    <div
      ref={ref}
      className="mb-xl"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <div className="flex items-center gap-md mb-sm">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/12">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl md:text-2xl font-heading">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-(--color-text)/70 text-base md:text-lg ml-[52px]">{subtitle}</p>
      )}
    </div>
  );
}

/* ───────────────────────── trend chart (SVG line) ───────── */

function TrendChart({ values, labels, color = "var(--color-primary)", type = "number", tooltip }) {
  if (!values || values.length < 2) return null;
  const filtered = values.map((v, i) => (v != null ? { v, i } : null)).filter(Boolean);
  if (filtered.length < 2) return null;
  const [chartRef, chartVisible] = useInView(0.2);

  const max = Math.max(...filtered.map((d) => d.v));
  const min = Math.min(...filtered.map((d) => d.v));
  const range = max - min || 1;
  const padding = range * 0.15;
  const yMin = min - padding;
  const yMax = max + padding;
  const yRange = yMax - yMin || 1;

  const w = 320;
  const h = 200;
  const px = 8;
  const py = 18;
  const plotW = w - px * 2;
  const plotH = h - py * 2;

  const toX = (i) => px + (i / (values.length - 1)) * plotW;
  const toY = (v) => py + plotH - ((v - yMin) / yRange) * plotH;

  const points = filtered.map((d) => ({ x: toX(d.i), y: toY(d.v), v: d.v, i: d.i }));
  const linePath = points.map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${h - py} L${points[0].x},${h - py} Z`;

  const latest = filtered[filtered.length - 1].v;
  const first = filtered[0].v;
  const totalChange = first !== 0 ? (((latest - first) / first) * 100).toFixed(1) : null;

  // Calculate high/low for context
  const highVal = max;
  const lowVal = min;

  const lineLength = points.reduce((sum, p, idx) => {
    if (idx === 0) return 0;
    const dx = p.x - points[idx - 1].x;
    const dy = p.y - points[idx - 1].y;
    return sum + Math.sqrt(dx * dx + dy * dy);
  }, 0);

  return (
    <div ref={chartRef}>
      <div className="flex items-baseline justify-between" style={{ marginBottom: "10px" }}>
        <div className="flex items-baseline gap-sm">
          <span className="text-2xl font-heading font-bold">{fmt(latest, type)}</span>
          <span className="text-sm text-(--color-text)/60">current</span>
        </div>
        {totalChange !== null && (
          <span
            className={`text-sm font-bold ${Number(totalChange) >= 0 ? "text-green-600" : "text-red-500"}`}
          >
            {Number(totalChange) >= 0 ? "+" : ""}
            {totalChange}%
          </span>
        )}
      </div>
      {/* High / Low context */}
      <div className="flex gap-lg text-sm text-(--color-text)/60" style={{ marginBottom: "10px" }}>
        <span>
          High: <span className="font-bold text-(--color-text)">{fmt(highVal, type)}</span>
        </span>
        <span>
          Low: <span className="font-bold text-(--color-text)">{fmt(lowVal, type)}</span>
        </span>
        <span>
          Start: <span className="font-bold text-(--color-text)">{fmt(first, type)}</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: "200px" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = py + plotH * (1 - frac);
          return (
            <line key={frac} x1={px} x2={w - px} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
          );
        })}
        {/* Y-axis labels */}
        <text x={px} y={py - 4} textAnchor="start" fill="#6b7280" fontSize="11">
          {fmt(Math.round(max + padding), type)}
        </text>
        <text x={px} y={h - py + 12} textAnchor="start" fill="#6b7280" fontSize="11">
          {fmt(Math.round(min - padding > 0 ? min - padding : 0), type)}
        </text>
        <path
          d={areaPath}
          fill={color}
          opacity={chartVisible ? 0.08 : 0}
          style={{ transition: "opacity 0.6s ease 0.5s" }}
        />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={lineLength}
          strokeDashoffset={chartVisible ? 0 : lineLength}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={idx === points.length - 1 ? 5 : 3}
            fill={idx === points.length - 1 ? color : "white"}
            stroke={color}
            strokeWidth="2"
            opacity={chartVisible ? 1 : 0}
            style={{ transition: `opacity 0.3s ease ${0.8 + idx * 0.05}s` }}
          />
        ))}
        {/* Value labels on all points if <= 8, otherwise first/last only */}
        {points.length <= 8 ? (
          points.map((p, idx) => (
            <text
              key={`lbl-${idx}`}
              x={p.x}
              y={p.y - 12}
              textAnchor={idx === 0 ? "start" : idx === points.length - 1 ? "end" : "middle"}
              fill={idx === points.length - 1 ? color : "#6b7280"}
              fontSize={idx === points.length - 1 ? "12" : "11"}
              fontWeight={idx === points.length - 1 ? "700" : "500"}
            >
              {fmt(p.v, type)}
            </text>
          ))
        ) : (
          <>
            <text
              x={points[0].x}
              y={points[0].y - 10}
              textAnchor="start"
              fill="#6b7280"
              fontSize="11"
              fontWeight="500"
            >
              {fmt(points[0].v, type)}
            </text>
            <text
              x={points[points.length - 1].x}
              y={points[points.length - 1].y - 10}
              textAnchor="end"
              fill={color}
              fontSize="12"
              fontWeight="700"
            >
              {fmt(points[points.length - 1].v, type)}
            </text>
          </>
        )}
      </svg>
      {labels && labels.length > 0 && (
        <div className="flex justify-between" style={{ marginTop: "10px" }}>
          <span className="text-sm text-(--color-text)/60">{labels[0]}</span>
          {labels.length > 2 && (
            <span className="text-sm text-(--color-text)/60">{labels[Math.floor(labels.length / 2)]}</span>
          )}
          <span className="text-sm text-(--color-text)/60">{labels[labels.length - 1]}</span>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── traffic sources bar ───────────── */

const sourceColors = {
  organic: "#2a9d63",
  direct: "#2d6ad4",
  referral: "#e83a7a",
  social: "#7a32c4",
  unassigned: "#94a3b8",
};
const sourceExplain = {
  organic: "Google search",
  direct: "Typed URL / bookmark",
  referral: "Link from another site",
  social: "Social media",
  unassigned: "Unassigned / other",
};

function TrafficDonut({ sources }) {
  if (!sources) return null;
  const entries = Object.entries(sources).filter(([, pct]) => pct > 0);
  const radius = 60;
  const stroke = 20;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-xl flex-wrap">
      <div className="shrink-0" style={{ width: "160px", height: "160px" }}>
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full"
          style={{ transform: "rotate(-90deg)" }}
        >
          {entries.map(([key, pct]) => {
            const dashLength = (pct / 100) * circumference;
            const dashOffset = -offset;
            offset += dashLength;
            return (
              <circle
                key={key}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={sourceColors[key] || "#94a3b8"}
                strokeWidth={stroke}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex flex-col gap-md">
        {entries.map(([key, pct]) => (
          <div key={key} className="flex items-center gap-sm">
            <div
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: sourceColors[key] || "#94a3b8" }}
            />
            <span className="text-sm text-(--color-text)/80">
              <span className="capitalize font-medium">{sourceExplain[key] || key}</span>{" "}
              <span className="font-bold text-(--color-text)">{pct}%</span>
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
    <div className="space-y-md">
      {pages.map((page, i) => (
        <div key={i} className="flex items-center gap-md">
          <span className="text-sm font-bold text-primary/40 w-5 shrink-0 text-right">{i + 1}</span>
          <span className="text-sm text-muted w-36 md:w-48 shrink-0 truncate font-mono">
            {page.path}
          </span>
          <div className="flex-1 h-6 bg-(--color-text)/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(page.views / maxViews) * 100}%`,
                backgroundColor: "var(--color-primary)",
                opacity: 1 - (i * 0.06),
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
  const [period, setPeriod] = useState("golive");

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
    document.title = "Marketing Reports — Internal Only";
    return () => {
      if (meta) meta.content = "index, follow";
    };
  }, []);

  const weeks = reportData.weeks;
  const current = weeks[0];
  const previous = weeks[1];

  const hasMonthly = weeks.length >= 8;
  const thisMonth = weeks.slice(0, 4);
  const lastMonth = hasMonthly ? weeks.slice(4, 8) : [];

  // Go-live: site launched Feb 4 2026 — split weeks at that boundary
  const GO_LIVE_DATE = "2026-02-04";
  const goLiveWeeks = weeks.filter((w) => w.weekEnding >= GO_LIVE_DATE);
  const preGoLiveWeeks = weeks.filter((w) => w.weekEnding < GO_LIVE_DATE);
  // Compare against the same number of weeks before go-live
  const preGoLiveComp = preGoLiveWeeks.slice(0, goLiveWeeks.length);
  const hasGoLive = goLiveWeeks.length >= 1 && preGoLiveComp.length >= 1;

  // Fall back to weekly if go-live data isn't available
  const activePeriod = period === "golive" && !hasGoLive ? "weekly" : period;
  const isMonthly = activePeriod === "monthly" && hasMonthly;
  const isGoLive = activePeriod === "golive" && hasGoLive;
  const compLabel = isGoLive ? "vs before launch" : isMonthly ? "vs prev 4 weeks" : "vs last week";

  function getGA(field) {
    if (isGoLive) {
      const after = goLiveWeeks.filter((w) => w.ga[field] != null);
      const before = preGoLiveComp.filter((w) => w.ga[field] != null);
      const isRate = field === "avgSessionDuration";
      return {
        current: isRate ? avgWeeks(after, (w) => w.ga[field]) : sumWeeks(after, (w) => w.ga[field]),
        previous: isRate
          ? avgWeeks(before, (w) => w.ga[field])
          : before.length > 0
            ? sumWeeks(before, (w) => w.ga[field])
            : null,
      };
    }
    if (!isMonthly) {
      return { current: current.ga[field], previous: previous?.ga[field] };
    }
    const thisWeeks = thisMonth.filter((w) => w.ga[field] != null);
    const lastWeeks = lastMonth.filter((w) => w.ga[field] != null);
    const isRate = field === "avgSessionDuration";
    return {
      current: isRate
        ? avgWeeks(thisWeeks, (w) => w.ga[field])
        : sumWeeks(thisWeeks, (w) => w.ga[field]),
      previous: isRate
        ? avgWeeks(lastWeeks, (w) => w.ga[field])
        : lastWeeks.length > 0
          ? sumWeeks(lastWeeks, (w) => w.ga[field])
          : null,
    };
  }

  function getLI(field) {
    if (isGoLive) {
      const isRate = field === "engagementRate";
      const isCumulative = field === "followers";
      if (isCumulative) {
        return {
          current: goLiveWeeks[0].linkedin[field],
          previous: preGoLiveComp[0]?.linkedin[field],
        };
      }
      return {
        current: isRate
          ? avgWeeks(goLiveWeeks, (w) => w.linkedin[field])
          : sumWeeks(goLiveWeeks, (w) => w.linkedin[field]),
        previous: isRate
          ? avgWeeks(preGoLiveComp, (w) => w.linkedin[field])
          : sumWeeks(preGoLiveComp, (w) => w.linkedin[field]),
      };
    }
    if (!isMonthly) {
      return { current: current.linkedin[field], previous: previous?.linkedin[field] };
    }
    const isRate = field === "engagementRate";
    const isCumulative = field === "followers";
    if (isCumulative) {
      return { current: thisMonth[0].linkedin[field], previous: lastMonth[0]?.linkedin[field] };
    }
    return {
      current: isRate
        ? avgWeeks(thisMonth, (w) => w.linkedin[field])
        : sumWeeks(thisMonth, (w) => w.linkedin[field]),
      previous: isRate
        ? avgWeeks(lastMonth, (w) => w.linkedin[field])
        : sumWeeks(lastMonth, (w) => w.linkedin[field]),
    };
  }

  const ga = {
    sessions: getGA("sessions"),
    pageViews: getGA("pageViews"),
    users: getGA("users"),
    newUsers: getGA("newUsers"),
    avgSessionDuration: getGA("avgSessionDuration"),
    ctaClicks: getGA("ctaClicks"),
    leads: getGA("leads"),
  };

  const li = {
    followers: getLI("followers"),
    newFollowers: getLI("newFollowers"),
    impressions: getLI("impressions"),
    engagements: getLI("engagements"),
    engagementRate: getLI("engagementRate"),
  };

  const hasGAData = ga.sessions.current != null && ga.sessions.current !== 0;
  const hasEmailData = current.email && current.email.openRate > 0;
  const hasEnoughForTrends = weeks.length >= 3;

  const periodLabel = isGoLive
    ? `Since go-live: ${GO_LIVE_DATE} to ${goLiveWeeks[0].weekEnding} (${goLiveWeeks.length} wks) vs ${preGoLiveComp.length} wks before`
    : isMonthly
      ? `${thisMonth[thisMonth.length - 1].weekEnding} to ${thisMonth[0].weekEnding}`
      : `Week ending ${current.weekEnding}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          paddingTop: "140px",
          paddingBottom: "var(--space-3xl)",
          background: "linear-gradient(135deg, #1a1a2e08 0%, #1a1a2e15 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 hidden lg:block pointer-events-none"
          style={{
            width: "800px",
            height: "686px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "#1a1a2e",
            opacity: 0.06,
            transform: "translateX(200px) translateY(-100px)",
          }}
        />
        <div className="container relative z-10">
          <FadeIn>
            <div style={{ marginTop: "var(--space-2xl)" }}>
              <p className="text-label mb-md" style={{ color: "#1a1a2e" }}>
                Internal Use Only
              </p>
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.1]"
                style={{ marginBottom: "var(--space-xl)" }}
              >
                Marketing <span style={{ color: "var(--color-primary)" }}>Reports</span>
              </h1>
              <p
                className="text-lg md:text-xl text-muted leading-relaxed max-w-2xl"
                style={{ marginBottom: "var(--space-lg)" }}
              >
                How our website, LinkedIn, and email marketing are performing. Look for the{" "}
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-gray-400 text-xs font-bold text-gray-400 mx-1">
                  ?
                </span>{" "}
                icons for plain-English explanations.
              </p>
              <p className="text-sm text-(--color-text)/70" style={{ marginTop: "var(--space-lg)" }}>
                Last updated: {reportData.lastUpdated}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Sticky period bar */}
      <div
        className="sticky z-40 border-b-2 border-(--color-text)/10 bg-white/90 backdrop-blur-sm"
        style={{ top: "0", padding: "12px 0" }}
      >
        <div className="container flex items-center justify-between gap-md flex-wrap">
          <div className="flex items-center gap-sm">
            {[
              ...(hasGoLive ? [{ key: "golive", label: "Since Go-Live" }] : []),
              { key: "weekly", label: "This Week" },
              { key: "monthly", label: "This Month" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPeriod(tab.key)}
                disabled={tab.key === "monthly" && !hasMonthly}
                className={`rounded-lg text-sm font-bold transition-all ${
                  tab.key === "monthly" && !hasMonthly
                    ? "text-(--color-text)/25 cursor-not-allowed"
                    : activePeriod === tab.key
                      ? "bg-(--color-text) text-white shadow-md"
                      : "text-(--color-text)/70 hover:bg-(--color-text)/5"
                }`}
                style={{ padding: "8px 16px" }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-sm text-sm text-(--color-text)/70">
            <Calendar className="w-4 h-4" />
            <span>{periodLabel}</span>
          </div>
        </div>
      </div>

      {/* Plain-English Summary */}
      {hasGAData && (
        <section
          style={{
            padding: "var(--space-lg) 0",
            borderBottom: "2px solid rgba(0,0,0,0.05)",
            backgroundColor: "rgba(26,26,46,0.03)",
          }}
        >
          <div className="container">
            <p className="text-base md:text-lg text-(--color-text)/80 leading-relaxed">
              {isGoLive ? (
                <>
                  <span className="font-bold">Since the new site launched:</span>{" "}
                  {fmt(ga.sessions.current, "number")} visits from{" "}
                  {fmt(ga.users.current, "number")} people,{" "}
                  {ga.ctaClicks.current > 0
                    ? <>{fmt(ga.ctaClicks.current, "number")} button clicks</>
                    : "no button clicks yet"},{" "}
                  and{" "}
                  {ga.leads.current > 0
                    ? <><span className="font-bold text-green-600">{fmt(ga.leads.current, "number")} {ga.leads.current === 1 ? "lead" : "leads"}</span> generated</>
                    : "no leads yet"}.{" "}
                  {ga.sessions.previous != null && ga.sessions.previous > 0 && (
                    <>
                      That&apos;s{" "}
                      <span className={`font-bold ${ga.sessions.current > ga.sessions.previous ? "text-green-600" : "text-red-500"}`}>
                        {ga.sessions.current > ga.sessions.previous ? "up" : "down"}{" "}
                        {Math.abs(((ga.sessions.current - ga.sessions.previous) / ga.sessions.previous) * 100).toFixed(0)}%
                      </span>{" "}
                      on visits compared to the same period before launch.
                    </>
                  )}
                </>
              ) : isMonthly ? (
                <>
                  <span className="font-bold">This month so far:</span>{" "}
                  {fmt(ga.sessions.current, "number")} visits,{" "}
                  {ga.ctaClicks.current > 0
                    ? <>{fmt(ga.ctaClicks.current, "number")} button clicks</>
                    : "no button clicks"},{" "}
                  and{" "}
                  {ga.leads.current > 0
                    ? <><span className="font-bold text-green-600">{fmt(ga.leads.current, "number")} {ga.leads.current === 1 ? "lead" : "leads"}</span></>
                    : "no leads"}.
                </>
              ) : (
                <>
                  <span className="font-bold">This week:</span>{" "}
                  {fmt(ga.sessions.current, "number")} visits from{" "}
                  {fmt(ga.users.current, "number")} people,{" "}
                  {ga.ctaClicks.current > 0
                    ? <>{fmt(ga.ctaClicks.current, "number")} button clicks</>
                    : "no button clicks"},{" "}
                  and{" "}
                  {ga.leads.current > 0
                    ? <><span className="font-bold text-green-600">{fmt(ga.leads.current, "number")} {ga.leads.current === 1 ? "lead" : "leads"}</span></>
                    : "no leads"}.{" "}
                  {ga.sessions.previous != null && ga.sessions.previous > 0 && (
                    <>
                      Last week had {fmt(ga.sessions.previous, "number")} visits
                      {ga.ctaClicks.previous > 0 && <> and {fmt(ga.ctaClicks.previous, "number")} button clicks</>}.
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        </section>
      )}

      {/* Go-Live Summary Banner */}
      {isGoLive && (
        <section
          className="border-t-2 border-primary/20"
          style={{
            padding: "var(--space-xl) 0",
            background:
              "linear-gradient(135deg, var(--color-primary)05 0%, var(--color-primary)12 100%)",
          }}
        >
          <div className="container">
            <div className="flex items-center gap-md mb-lg">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/15">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold">New Site Impact</h2>
                <p className="text-sm text-(--color-text)/70">
                  {goLiveWeeks.length} weeks since launch vs {preGoLiveComp.length} weeks before
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
              {[
                { label: "Sessions", ...ga.sessions, type: "number" },
                { label: "CTA Clicks", ...ga.ctaClicks, type: "number" },
                { label: "Leads", ...ga.leads, type: "number" },
                {
                  label: "Conversion Rate",
                  current: ga.sessions.current > 0 ? (ga.leads.current / ga.sessions.current) * 100 : 0,
                  previous: ga.sessions.previous > 0 ? (ga.leads.previous / ga.sessions.previous) * 100 : null,
                  type: "percent",
                },
              ].map((item, idx) => {
                const d = delta(item.current, item.previous);
                const DIcon = d.icon;
                return (
                  <FadeIn key={item.label} delay={idx * 80}>
                    <div
                      className="rounded-2xl md:rounded-3xl bg-white border-2 border-primary/15 text-center h-full"
                      style={{ padding: "var(--space-lg)" }}
                    >
                      <p className="text-2xl md:text-3xl font-heading font-bold mb-sm">
                        {fmt(item.current, item.type)}
                      </p>
                      <p className="text-sm font-bold text-(--color-text)/80 mb-sm">{item.label}</p>
                      <div
                        className={`flex items-center justify-center gap-xs text-sm font-bold ${d.color}`}
                      >
                        <DIcon className="w-4 h-4" />
                        <span>{d.label}</span>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Visitor Journey */}
      {reportData.ga4Period?.funnel && reportData.ga4Period.funnel.length > 0 && (
        <section
          className="border-t-2 border-(--color-text)/10"
          style={{ padding: "var(--space-2xl) 0" }}
        >
          <div className="container">
            <SectionHeading
              icon={Filter}
              title="Visitor Journey"
              subtitle="Where people go, what they click, and where they leave. Use this to spot problems in the path to contact."
            />
            {(() => {
              const funnel = reportData.ga4Period.funnel;
              const maxUsers = funnel[0].users;
              const landedUsers = funnel[0]?.users || 0;
              const leadUsers = funnel[funnel.length - 1]?.users || 0;
              const leadPct = landedUsers > 0 ? ((leadUsers / landedUsers) * 100).toFixed(1) : 0;
              const contactStep = funnel.find(s => s.step.toLowerCase().includes("contact"));
              const ctaStep = funnel.find(s => s.step.toLowerCase().includes("cta"));
              const leadStep = funnel[funnel.length - 1];

              // Pre-calculate biggest drop-off
              let biggestDrop = { from: "", to: "", pct: 0, lost: 0 };
              for (let fi = 1; fi < funnel.length; fi++) {
                const prev = funnel[fi - 1].users;
                const curr = funnel[fi].users;
                const dropPct = prev > 0 ? ((prev - curr) / prev) * 100 : 0;
                if (dropPct > biggestDrop.pct) {
                  biggestDrop = { from: funnel[fi - 1].step, to: funnel[fi].step, pct: Math.round(dropPct), lost: prev - curr };
                }
              }

              const navFlow = reportData.ga4Period.navigationFlow;
              const pageEng = reportData.ga4Period.pageEngagement;
              const exitPages = reportData.ga4Period.exitPages;

              return (
                <>
                  {/* ── Row 1: Funnel overview + Conversion breakdown ── */}
                  <div className="grid lg:grid-cols-3 gap-lg">
                    {/* Funnel — spans 2 cols */}
                    <FadeIn className="lg:col-span-2">
                      <div className="rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 h-full" style={{ padding: "var(--space-xl)" }}>
                        <div className="flex items-center gap-sm mb-lg">
                          <Filter className="w-5 h-5 text-primary" />
                          <p className="text-base font-bold">The Funnel</p>
                          <span className="text-sm text-(--color-text)/70 ml-auto">{landedUsers} visitors → {leadUsers} leads</span>
                        </div>
                        <div className="space-y-md">
                          {funnel.map((step, i) => {
                            const pct = maxUsers > 0 ? (step.users / maxUsers) * 100 : 0;
                            const prevUsers = i > 0 ? funnel[i - 1].users : null;
                            const dropoff = prevUsers != null && prevUsers > 0
                              ? Math.round(((prevUsers - step.users) / prevUsers) * 100)
                              : null;
                            const isLast = i === funnel.length - 1;
                            const barColor = "var(--color-primary)";
                            const barOpacity = 1 - (i * 0.12);

                            const showLabelOutside = pct < 40;
                            return (
                              <div key={i}>
                                {i > 0 && dropoff != null && dropoff > 0 && (
                                  <div
                                    className="flex items-center rounded-lg"
                                    style={{ padding: "8px 14px", margin: "8px 0", backgroundColor: "rgba(239, 68, 68, 0.06)" }}
                                  >
                                    <ArrowDownRight className="w-4 h-4 text-red-500 shrink-0" style={{ marginRight: "10px" }} />
                                    <span className="text-sm text-red-600 font-bold" style={{ marginRight: "8px" }}>
                                      -{dropoff}% dropped off
                                    </span>
                                    <span className="text-sm text-red-500">
                                      — {prevUsers - step.users} {prevUsers - step.users === 1 ? "person" : "people"} didn&apos;t continue
                                    </span>
                                  </div>
                                )}
                                <div>
                                  {showLabelOutside && (
                                    <div className="flex items-center justify-between" style={{ marginBottom: "6px" }}>
                                      <span className="text-sm font-bold text-(--color-text)">{step.step}</span>
                                      <span className="text-sm font-bold text-(--color-text)/70">{step.users} people</span>
                                    </div>
                                  )}
                                  <div className="h-12 bg-(--color-text)/4 rounded-xl overflow-hidden">
                                    <div
                                      className="h-full rounded-xl flex items-center transition-all"
                                      style={{ width: `${Math.max(pct, 6)}%`, backgroundColor: barColor, opacity: barOpacity }}
                                    >
                                      {!showLabelOutside && (
                                        <div className="flex items-center justify-between w-full" style={{ padding: "0 18px" }}>
                                          <span className="text-sm font-bold text-white whitespace-nowrap">{step.step}</span>
                                          <span className="text-sm font-bold text-white whitespace-nowrap" style={{ marginLeft: "12px" }}>{step.users}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between mt-xl pt-lg border-t border-(--color-text)/10">
                          <span className="text-base text-(--color-text)/70 font-medium">Out of every 100 visitors, {leadPct} become a lead</span>
                          <span className="text-lg font-heading font-bold">{leadPct}%</span>
                        </div>
                      </div>
                    </FadeIn>

                    {/* Conversion breakdown — right column */}
                    <FadeIn delay={60}>
                      <div className="rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 h-full" style={{ padding: "var(--space-xl)" }}>
                        <p className="text-base font-bold mb-xl">Conversion Breakdown</p>
                        <div className="space-y-xl">
                          {[
                            { label: "Reached contact page", value: contactStep?.users || 0, pct: landedUsers > 0 ? ((contactStep?.users || 0) / landedUsers * 100).toFixed(0) : 0, color: "var(--color-primary)" },
                            { label: "Clicked a CTA", value: ctaStep?.users || 0, pct: landedUsers > 0 ? ((ctaStep?.users || 0) / landedUsers * 100).toFixed(0) : 0, color: "var(--color-primary)" },
                            { label: "Became a lead", value: leadStep?.users || 0, pct: landedUsers > 0 ? ((leadStep?.users || 0) / landedUsers * 100).toFixed(1) : 0, color: "var(--color-primary)" },
                          ].map((s) => (
                            <div key={s.label}>
                              <div className="flex items-center justify-between mb-sm">
                                <span className="text-base text-(--color-text)/70">{s.label}</span>
                                <span className="text-lg font-heading font-bold">{s.value} <span className="text-sm text-(--color-text)/60 font-normal">of {landedUsers}</span></span>
                              </div>
                              <div className="h-3 bg-(--color-text)/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(Number(s.pct), 1)}%`, backgroundColor: s.color }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Where we lose the most people */}
                        {biggestDrop.pct > 0 && (
                          <div className="mt-lg pt-lg border-t border-(--color-text)/10">
                            <div className="flex items-center gap-sm mb-sm">
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                              <span className="text-base font-bold text-red-600">Where we lose the most people</span>
                            </div>
                            <p className="text-sm text-(--color-text)/70 leading-relaxed" style={{ paddingLeft: "28px" }}>
                              {biggestDrop.lost} out of every {biggestDrop.lost + (funnel.find(s => s.step === biggestDrop.to)?.users || 0)} people who <span className="font-bold">{biggestDrop.from.toLowerCase()}</span> never went on to <span className="font-bold">{biggestDrop.to.toLowerCase()}</span>. That&apos;s {biggestDrop.pct}% lost at this step.
                            </p>
                          </div>
                        )}
                      </div>
                    </FadeIn>
                  </div>

                  {/* ── Row 2: Where do visitors go from the homepage? ── */}
                  {navFlow && (
                    <FadeIn delay={120}>
                      <div className="rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 mt-xl" style={{ padding: "var(--space-xl)" }}>
                        <div className="flex items-center gap-sm mb-lg">
                          <ArrowRight className="w-5 h-5 text-primary" />
                          <p className="text-base font-bold">Where Do Visitors Go From the Homepage?</p>
                        </div>
                        <p className="text-sm text-(--color-text)/70 mb-xl">
                          {navFlow.totalSessions} sessions tracked. Of {navFlow.paths[0]?.visitors || 0} homepage visitors, here&apos;s where they went next.
                        </p>

                        {/* Flow visualisation */}
                        <div className="flex flex-col md:flex-row gap-lg items-stretch">
                          {/* Source: Homepage */}
                          <div className="flex flex-col items-center justify-center shrink-0" style={{ minWidth: "140px" }}>
                            <div className="w-full rounded-xl flex items-center justify-center" style={{ padding: "var(--space-lg)", backgroundColor: "var(--color-primary)", color: "white" }}>
                              <div className="text-center">
                                <p className="text-3xl font-heading font-bold">{navFlow.paths[0]?.visitors || 0}</p>
                                <p className="text-base font-medium text-white/90">Homepage</p>
                              </div>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="hidden md:flex items-center">
                            <ChevronRight className="w-6 h-6 text-(--color-text)/30" />
                          </div>

                          {/* Destinations */}
                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-md">
                            {(navFlow.paths[0]?.nextPages || []).map((dest, di) => {
                              const maxVis = navFlow.paths[0].nextPages[0]?.visitors || 1;
                              const pct = navFlow.paths[0].visitors > 0 ? ((dest.visitors / navFlow.paths[0].visitors) * 100).toFixed(0) : 0;
                              const isContact = dest.page.toLowerCase().includes("contact");
                              return (
                                <div
                                  key={dest.page}
                                  className={`rounded-xl border-2 transition-all ${isContact ? "border-green-300 bg-green-50/50" : "border-(--color-text)/10"}`}
                                  style={{ padding: "var(--space-lg)" }}
                                >
                                  <div className="flex items-baseline gap-sm" style={{ marginBottom: "var(--space-md)" }}>
                                    <p className="text-xl font-heading font-bold">{dest.visitors}</p>
                                    <p className="text-sm font-medium text-(--color-text)/80">{dest.page}</p>
                                  </div>
                                  <div className="h-2.5 bg-(--color-text)/5 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${(dest.visitors / maxVis) * 100}%`,
                                        backgroundColor: isContact ? "#22c55e" : "var(--color-primary)",
                                        opacity: 1 - (di * 0.08),
                                      }}
                                    />
                                  </div>
                                  <p className="text-sm text-(--color-text)/70" style={{ marginTop: "var(--space-md)" }}>{pct}% of homepage visitors</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Other entry points */}
                        {navFlow.paths.length > 1 && (
                          <div className="mt-lg pt-lg border-t border-(--color-text)/10">
                            <p className="text-sm font-bold text-(--color-text)/80 mb-md">Not everyone starts on the homepage</p>
                            <div className="flex flex-wrap gap-sm">
                              {navFlow.paths.slice(1).map((path) => (
                                <div key={path.from} className="rounded-lg border border-(--color-text)/10 flex items-center gap-sm" style={{ padding: "10px 16px" }}>
                                  <span className="text-sm font-bold">{path.visitors}</span>
                                  <span className="text-sm text-(--color-text)/70">started on {path.from}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Step 3: what do people visit third? */}
                        {navFlow.step3 && navFlow.step3.length > 0 && (
                          <div className="mt-lg pt-lg border-t border-(--color-text)/10">
                            <p className="text-sm font-bold text-(--color-text)/80 mb-md">Third page visited (after homepage → second page)</p>
                            <div className="flex flex-wrap gap-sm">
                              {navFlow.step3.map((s) => (
                                <div key={s.page} className="rounded-lg border border-(--color-text)/10 flex items-center gap-sm" style={{ padding: "10px 16px" }}>
                                  <span className="text-sm font-bold">{s.visitors}</span>
                                  <span className="text-sm text-(--color-text)/70">{s.page}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </FadeIn>
                  )}

                  {/* ── Row 3: Page Engagement + Exit Points + CTAs ── */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-lg mt-xl">
                    {/* Page Engagement: time on page */}
                    {pageEng && pageEng.length > 0 && (
                      <FadeIn delay={180}>
                        <div className="rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 h-full" style={{ padding: "var(--space-xl)" }}>
                          <div className="flex items-center gap-sm mb-md">
                            <Clock className="w-5 h-5 text-primary" />
                            <p className="text-base font-bold">Time on Page</p>
                          </div>
                          <p className="text-sm text-(--color-text)/70 mb-xl">Are people reading or bouncing? Higher = more engaged.</p>
                          <div className="space-y-xl">
                            {[...pageEng]
                              .sort((a, b) => b.avgTimeOnPage - a.avgTimeOnPage)
                              .slice(0, 7)
                              .map((p) => {
                                const maxTime = Math.max(...pageEng.map(x => x.avgTimeOnPage));
                                const mins = Math.floor(p.avgTimeOnPage / 60);
                                const secs = p.avgTimeOnPage % 60;
                                const timeLabel = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                                const isLow = p.avgTimeOnPage < 30;
                                return (
                                  <div key={p.page}>
                                    <div className="flex items-baseline justify-between" style={{ marginBottom: "var(--space-sm)" }}>
                                      <span className="text-sm text-(--color-text)/80 font-medium">{p.page}</span>
                                      <span className={`text-sm font-bold shrink-0 ${isLow ? "text-amber-600" : "text-(--color-text)"}`} style={{ marginLeft: "12px" }}>
                                        {timeLabel}
                                      </span>
                                    </div>
                                    <div className="h-2.5 bg-(--color-text)/5 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full"
                                        style={{
                                          width: `${(p.avgTimeOnPage / maxTime) * 100}%`,
                                          backgroundColor: isLow ? "#f59e0b" : "#2d6ad4",
                                        }}
                                      />
                                    </div>
                                    {isLow && (
                                      <p className="text-xs text-amber-600" style={{ marginTop: "var(--space-sm)" }}>Very short — people may not be reading</p>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </FadeIn>
                    )}

                    {/* Exit Points: where people leave */}
                    {exitPages && exitPages.length > 0 && (
                      <FadeIn delay={240}>
                        <div className="rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 h-full" style={{ padding: "var(--space-xl)" }}>
                          <div className="flex items-center gap-sm mb-md">
                            <LogOut className="w-5 h-5 text-red-500" />
                            <p className="text-base font-bold">Where People Leave</p>
                          </div>
                          <p className="text-sm text-(--color-text)/70 mb-xl">Pages with the highest exit rate — potential problem areas.</p>
                          <div className="space-y-xl">
                            {[...exitPages]
                              .sort((a, b) => b.exitRate - a.exitRate)
                              .slice(0, 7)
                              .map((p) => {
                                const barColor = p.exitRate > 20 ? "#ef4444" : p.exitRate > 5 ? "#f59e0b" : "#22c55e";
                                return (
                                  <div key={p.page}>
                                    <div className="flex items-baseline justify-between" style={{ marginBottom: "var(--space-sm)" }}>
                                      <span className="text-sm text-(--color-text)/80 font-medium">{p.page}</span>
                                      <span className={`text-sm font-bold shrink-0 ${p.exitRate > 20 ? "text-red-500" : p.exitRate > 5 ? "text-amber-600" : "text-green-600"}`} style={{ marginLeft: "12px" }}>
                                        {p.exitRate}%
                                      </span>
                                    </div>
                                    <div className="h-2.5 bg-(--color-text)/5 rounded-full overflow-hidden">
                                      <div className="h-full rounded-full" style={{ width: `${Math.max(p.exitRate, 2)}%`, backgroundColor: barColor }} />
                                    </div>
                                    {p.exitRate > 20 && (
                                      <p className="text-xs text-red-500" style={{ marginTop: "var(--space-sm)" }}>{p.exits} people left from this page</p>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </FadeIn>
                    )}

                    {/* Which Buttons Get Clicked */}
                    {reportData.ga4Period.ctaBreakdown && reportData.ga4Period.ctaBreakdown.length > 0 && (
                      <FadeIn delay={300}>
                        <div className="rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 h-full" style={{ padding: "var(--space-xl)" }}>
                          <div className="flex items-center gap-sm mb-md">
                            <MousePointerClick className="w-5 h-5 text-primary" />
                            <p className="text-base font-bold">Which Buttons Get Clicked</p>
                          </div>
                          <p className="text-sm text-(--color-text)/70 mb-xl">Every CTA on the site is tracked. These are the most clicked.</p>
                          <div className="space-y-xl">
                            {reportData.ga4Period.ctaBreakdown.slice(0, 7).map((cta, ci) => {
                              const maxClicks = reportData.ga4Period.ctaBreakdown[0].clicks;
                              return (
                                <div key={cta.button}>
                                  <div className="flex items-baseline justify-between" style={{ marginBottom: "var(--space-sm)" }}>
                                    <span className="text-sm text-(--color-text)/80 font-medium">{cta.button}</span>
                                    <span className="text-sm font-bold shrink-0" style={{ marginLeft: "12px" }}>{cta.clicks}</span>
                                  </div>
                                  <div className="h-2.5 bg-(--color-text)/5 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${(cta.clicks / maxClicks) * 100}%`,
                                        backgroundColor: "var(--color-primary)",
                                        opacity: 1 - (ci * 0.08),
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </FadeIn>
                    )}
                  </div>

                  {/* ── Row 4: Diagnostic summary ── */}
                  <FadeIn delay={360}>
                    <div className="rounded-2xl md:rounded-3xl border-2 border-primary/15 bg-primary/3 mt-xl" style={{ padding: "var(--space-xl)" }}>
                      <div className="flex items-center gap-sm mb-lg">
                        <Target className="w-5 h-5 text-primary" />
                        <p className="text-lg font-heading font-bold">Things Worth Looking Into</p>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-lg">
                        {/* Dynamic diagnostic cards based on the data */}
                        {(() => {
                          const diagnostics = [];

                          // Homepage bounce rate check
                          const homeBounce = pageEng?.find(p => p.page === "Homepage");
                          if (homeBounce && homeBounce.bounceRate > 25) {
                            diagnostics.push({
                              title: "Too many people leave from the homepage",
                              detail: `${homeBounce.bounceRate}% of homepage visitors leave without clicking anything else. They land, look, and go. The homepage copy or layout might not be convincing enough.`,
                              severity: "high",
                            });
                          }

                          // Contact page drop-off
                          if (contactStep && ctaStep && contactStep.users > 0) {
                            const contactToCtaPct = ((ctaStep.users / contactStep.users) * 100).toFixed(0);
                            if (Number(contactToCtaPct) < 90) {
                              diagnostics.push({
                                title: `People visit the contact page but don't take action`,
                                detail: `${contactStep.users} people made it to the contact page, but only ${ctaStep.users} clicked a button. ${contactStep.users - ctaStep.users} people looked at the contact page and left. Is the form too long? Is it clear what to do?`,
                                severity: "medium",
                              });
                            }
                          }

                          // CTA to lead drop
                          if (ctaStep && leadStep && ctaStep.users > 0) {
                            const ctaToLeadPct = ((leadStep.users / ctaStep.users) * 100).toFixed(0);
                            if (Number(ctaToLeadPct) < 50) {
                              diagnostics.push({
                                title: `People click buttons but don't follow through`,
                                detail: `${ctaStep.users} people clicked a CTA button but only ${leadStep.users} actually submitted a form. That means ${ctaStep.users - leadStep.users} people started but gave up. The form might be too long, or the button takes them somewhere they didn't expect.`,
                                severity: "medium",
                              });
                            }
                          }

                          // Low engagement pages
                          const lowEngPages = pageEng?.filter(p => p.avgTimeOnPage < 20 && p.views > 10);
                          if (lowEngPages && lowEngPages.length > 0) {
                            diagnostics.push({
                              title: `People barely spend any time on ${lowEngPages.map(p => p.page).join(", ")}`,
                              detail: `Average time on ${lowEngPages.length === 1 ? "this page" : "these pages"} is under 20 seconds. People are either leaving straight away or not finding what they expected.`,
                              severity: "low",
                            });
                          }

                          // Browsed → Contact drop (the big one)
                          const browsedStep = funnel.find(s => s.step.toLowerCase().includes("second"));
                          if (browsedStep && contactStep && browsedStep.users > 0) {
                            const browseToContactPct = ((contactStep.users / browsedStep.users) * 100).toFixed(0);
                            if (Number(browseToContactPct) < 40) {
                              diagnostics.push({
                                title: `Most people browse the site but never visit the contact page`,
                                detail: `${browsedStep.users} people looked at multiple pages, but only ${contactStep.users} went to the contact page. That's ${browseToContactPct}%. Are there enough "get in touch" buttons on the other pages?`,
                                severity: "high",
                              });
                            }
                          }

                          // 404 exits
                          const notFound = exitPages?.find(p => p.page.includes("404"));
                          if (notFound && notFound.exits > 0) {
                            diagnostics.push({
                              title: `${notFound.exits} people ended up on a "page not found" error`,
                              detail: `They clicked a link or used a bookmark that leads to a page that doesn't exist anymore. These need to be redirected to the right pages.`,
                              severity: "medium",
                            });
                          }

                          if (diagnostics.length === 0) {
                            diagnostics.push({
                              title: "No major red flags yet",
                              detail: "The data looks healthy so far. Keep monitoring as traffic grows — patterns will become clearer with more volume.",
                              severity: "low",
                            });
                          }

                          const severityColors = {
                            high: { bg: "rgba(239, 68, 68, 0.06)", border: "border-red-200", dot: "#ef4444" },
                            medium: { bg: "rgba(245, 158, 11, 0.06)", border: "border-amber-200", dot: "#f59e0b" },
                            low: { bg: "rgba(34, 197, 94, 0.06)", border: "border-green-200", dot: "#22c55e" },
                          };

                          return diagnostics.map((d, di) => {
                            const colors = severityColors[d.severity];
                            return (
                              <div
                                key={di}
                                className={`rounded-xl border-2 ${colors.border}`}
                                style={{ padding: "var(--space-lg)", backgroundColor: colors.bg }}
                              >
                                <div className="flex items-start gap-sm mb-md">
                                  <div className="w-3 h-3 rounded-full shrink-0 mt-1" style={{ backgroundColor: colors.dot }} />
                                  <p className="text-base font-bold text-(--color-text)">{d.title}</p>
                                </div>
                                <p className="text-sm text-(--color-text)/70 leading-relaxed" style={{ paddingLeft: "20px" }}>{d.detail}</p>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </FadeIn>
                </>
              );
            })()}
          </div>
        </section>
      )}

      {/* Website Performance */}
      <section
        className="border-t-2 border-(--color-text)/10"
        style={{ padding: "var(--space-2xl) 0" }}
      >
        <div className="container">
          <SectionHeading
            icon={BarChart3}
            title="Website Performance"
            subtitle="Data from Google Analytics. How many people visited the site and what they did."
          />
          {hasGAData ? (
            <>
            {/* Row 1: Traffic overview — 5 even cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-md">
              <MetricCard
                label="Sessions"
                value={ga.sessions.current}
                prevValue={ga.sessions.previous}
                icon={Eye}
                tooltip="sessions"
                compLabel={compLabel}
                delay={0}
              />
              <MetricCard
                label="Page Views"
                value={ga.pageViews.current}
                prevValue={ga.pageViews.previous}
                icon={BarChart3}
                tooltip="pageViews"
                compLabel={compLabel}
                delay={60}
              />
              <MetricCard
                label="Users"
                value={ga.users.current}
                prevValue={ga.users.previous}
                icon={Users}
                tooltip="users"
                compLabel={compLabel}
                delay={120}
              />
              <MetricCard
                label="New Users"
                value={ga.newUsers.current}
                prevValue={ga.newUsers.previous}
                icon={Users}
                tooltip="newUsers"
                compLabel={compLabel}
                delay={180}
              />
              <MetricCard
                label="Avg Engagement"
                value={ga.avgSessionDuration.current}
                prevValue={ga.avgSessionDuration.previous}
                type="duration"
                icon={Timer}
                tooltip="avgEngagement"
                compLabel={compLabel}
                delay={240}
              />
            </div>

            {/* Row 2: The ones that matter — CTA Clicks + Leads side by side */}
            <div className="grid sm:grid-cols-2 gap-lg mt-lg">
              <MetricCard
                label="CTA Clicks"
                value={ga.ctaClicks.current}
                prevValue={ga.ctaClicks.previous}
                icon={MousePointerClick}
                tooltip="ctaClicks"
                compLabel={compLabel}
                highlight
                delay={300}
              >
                {reportData.ga4Period?.ctaBreakdown && reportData.ga4Period.ctaBreakdown.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-(--color-text)/60 uppercase tracking-wider mb-md">Top buttons clicked</p>
                    <div className="space-y-sm">
                      {reportData.ga4Period.ctaBreakdown.slice(0, 3).map((cta) => (
                        <div key={cta.button} className="flex items-center justify-between">
                          <span className="text-sm text-(--color-text)/70 truncate" style={{ marginRight: "12px" }}>{cta.button}</span>
                          <span className="text-sm font-bold shrink-0">{cta.clicks}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-(--color-text)/50 mt-sm">Full breakdown in Visitor Journey above</p>
                  </div>
                )}
              </MetricCard>
              <MetricCard
                label="Leads"
                value={ga.leads.current}
                prevValue={ga.leads.previous}
                icon={Target}
                tooltip="leads"
                compLabel={compLabel}
                highlight
                delay={360}
              >
                {reportData.ga4Period?.funnel && reportData.ga4Period.funnel.length > 0 && (() => {
                  const funnel = reportData.ga4Period.funnel;
                  const landed = funnel[0]?.users || 0;
                  const leads = funnel[funnel.length - 1]?.users || 0;
                  const contactStep = funnel.find(s => s.step.toLowerCase().includes("contact"));
                  const ctaStep = funnel.find(s => s.step.toLowerCase().includes("cta"));
                  if (landed === 0) return null;
                  return (
                    <div>
                      <p className="text-xs font-bold text-(--color-text)/60 uppercase tracking-wider mb-md">How visitors become leads</p>
                      <div className="space-y-sm">
                        {[
                          { label: "Visited site", count: landed },
                          ...(contactStep ? [{ label: "Reached contact", count: contactStep.users }] : []),
                          ...(ctaStep ? [{ label: "Clicked a CTA", count: ctaStep.users }] : []),
                          { label: "Became a lead", count: leads },
                        ].map((step) => (
                          <div key={step.label} className="flex items-center justify-between">
                            <span className="text-sm text-(--color-text)/70">{step.label}</span>
                            <span className="text-sm font-bold shrink-0">{step.count}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-(--color-text)/50 mt-sm">Full funnel in Visitor Journey above</p>
                    </div>
                  );
                })()}
              </MetricCard>
            </div>
            </>
          ) : (
            <p className="text-muted text-center py-xl">No GA4 data for this period.</p>
          )}
        </div>
      </section>

      {/* Top Pages + Traffic Sources */}
      {hasGAData &&
        (() => {
          // Aggregate top pages across the relevant weeks
          const relevantWeeks = isGoLive ? goLiveWeeks : isMonthly ? thisMonth : [current];
          const pageMap = {};
          for (const w of relevantWeeks) {
            if (w.ga.topPages) {
              for (const p of w.ga.topPages) {
                pageMap[p.path] = (pageMap[p.path] || 0) + p.views;
              }
            }
          }
          const aggregatedPages = Object.entries(pageMap)
            .map(([path, views]) => ({ path, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

          // Aggregate traffic sources across the relevant weeks
          const sourceMap = {};
          for (const w of relevantWeeks) {
            if (w.ga.trafficSources) {
              for (const [key, pct] of Object.entries(w.ga.trafficSources)) {
                sourceMap[key] = (sourceMap[key] || 0) + pct;
              }
            }
          }
          const sourceCount = relevantWeeks.filter((w) => w.ga.trafficSources).length;
          const aggregatedSources = {};
          for (const [key, total] of Object.entries(sourceMap)) {
            aggregatedSources[key] = Math.round(total / sourceCount);
          }

          // Comparison sources
          const compWeeks = isGoLive
            ? preGoLiveComp
            : isMonthly
              ? lastMonth
              : previous
                ? [previous]
                : [];
          const compSourceMap = {};
          for (const w of compWeeks) {
            if (w.ga.trafficSources) {
              for (const [key, pct] of Object.entries(w.ga.trafficSources)) {
                compSourceMap[key] = (compSourceMap[key] || 0) + pct;
              }
            }
          }
          const compSourceCount = compWeeks.filter((w) => w.ga.trafficSources).length;
          const compSources = compSourceCount > 0 ? {} : null;
          if (compSources) {
            for (const [key, total] of Object.entries(compSourceMap)) {
              compSources[key] = Math.round(total / compSourceCount);
            }
          }

          const periodText = isGoLive ? "since go-live" : isMonthly ? "this month" : "this week";
          const compPeriodText = isGoLive
            ? "Before launch"
            : isMonthly
              ? "Previous month"
              : "Previous week";

          return aggregatedPages.length > 0 ? (
            <section
              className="border-t-2 border-(--color-text)/10"
              style={{ padding: "var(--space-2xl) 0", backgroundColor: "rgba(26,26,46,0.02)" }}
            >
              <div className="container">
                <div className="grid md:grid-cols-2 gap-2xl">
                  <FadeIn>
                    <div>
                      <h3 className="text-xl font-heading mb-sm">Top Pages</h3>
                      <p className="text-base text-(--color-text)/70 mb-lg">
                        Which pages people visited most {periodText}.
                      </p>
                      <TopPages pages={aggregatedPages} />
                    </div>
                  </FadeIn>
                  <FadeIn delay={120}>
                    <div>
                      <h3 className="text-xl font-heading mb-sm">Where Visitors Came From</h3>
                      <p className="text-base text-(--color-text)/70 mb-lg">
                        How people found the website {periodText}.
                      </p>
                      <TrafficDonut sources={aggregatedSources} />
                      {compSources && (
                        <div className="mt-xl">
                          <p className="text-sm text-(--color-text)/70 uppercase tracking-wider mb-md font-bold">
                            {compPeriodText}
                          </p>
                          <TrafficDonut sources={compSources} />
                        </div>
                      )}
                    </div>
                  </FadeIn>
                </div>
              </div>
            </section>
          ) : null;
        })()}

      {/* SEO Insights */}
      {reportData.ga4Period?.seoInsights && (
        <section
          className="border-t-2 border-(--color-text)/10"
          style={{ padding: "var(--space-2xl) 0", backgroundColor: "rgba(26,26,46,0.02)" }}
        >
          <div className="container">
            <SectionHeading
              icon={Search}
              title="Google Search Performance"
              subtitle={`How the site appears in Google search results (${reportData.ga4Period.seoInsights.period}). Impressions = how often Google showed us. Clicks = how often people clicked.`}
            />

            {/* Top stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-md mb-xl">
              {[
                { value: reportData.ga4Period.seoInsights.totalImpressions.toLocaleString("en-GB"), label: "Google Impressions", sub: "Times shown in search" },
                { value: reportData.ga4Period.seoInsights.totalClicks.toLocaleString("en-GB"), label: "Search Clicks", sub: "People who clicked through" },
                { value: `${reportData.ga4Period.seoInsights.avgCTR}%`, label: "Click-Through Rate", sub: "% of impressions that clicked" },
                { value: reportData.ga4Period.seoInsights.topLandingPages[0]?.avgPosition?.toFixed(0) || "N/A", label: "Avg Position (Homepage)", sub: "Where we rank in Google" },
              ].map((card, idx) => (
                <FadeIn key={card.label} delay={idx * 60}>
                  <div className="rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 hover:border-primary/25 text-center h-full transition-all" style={{ padding: "var(--space-xl)" }}>
                    <p className="text-2xl md:text-3xl font-heading font-bold mb-sm">{card.value}</p>
                    <p className="text-sm font-bold text-(--color-text)/80">{card.label}</p>
                    <p className="text-sm text-(--color-text)/60 mt-sm">{card.sub}</p>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Top pages */}
            <h3 className="text-lg font-heading mb-md">Top Pages in Google Search</h3>
            <FadeIn>
              <div className="space-y-md">
                {reportData.ga4Period.seoInsights.topLandingPages.map((page, i) => {
                  const isOldSite = page.path.startsWith("/post/") || page.path.startsWith("/netsuite-") || page.path.startsWith("/about-erp") || page.path.startsWith("/manufacturing") || page.path.startsWith("/what-is-erp") || page.path.startsWith("/why-netsuite") || page.path.startsWith("/business-transformation");
                  return (
                    <div key={i} className="flex items-center gap-md rounded-2xl border-2 border-(--color-text)/10" style={{ padding: "14px 20px" }}>
                      <div className="flex-1 min-w-0 flex items-center gap-sm">
                        <span className="text-sm font-mono text-(--color-text)/70 truncate">{page.path}</span>
                        <span className={`shrink-0 text-xs font-bold rounded-full ${isOldSite ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`} style={{ padding: "4px 10px" }}>
                          {isOldSite ? "Old site" : "New"}
                        </span>
                      </div>
                      <div className="flex items-center gap-lg shrink-0 flex-wrap">
                        <div className="text-center">
                          <p className="text-sm font-bold">{page.impressions.toLocaleString("en-GB")}</p>
                          <p className="text-sm text-(--color-text)/60">impressions</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold">{page.clicks}</p>
                          <p className="text-sm text-(--color-text)/60">clicks</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold">{page.ctr}%</p>
                          <p className="text-sm text-(--color-text)/60">CTR</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold">#{page.avgPosition.toFixed(0)}</p>
                          <p className="text-sm text-(--color-text)/60">position</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </FadeIn>

          </div>
        </section>
      )}

      {/* Visitor Geography */}
      {reportData.ga4Period?.countries && (
        <section
          className="border-t-2 border-(--color-text)/10"
          style={{ padding: "var(--space-2xl) 0" }}
        >
          <div className="container">
            <SectionHeading
              icon={Globe}
              title="Where Are Visitors Located?"
              subtitle={`Country breakdown of website visitors from ${reportData.ga4Period.start} to ${reportData.ga4Period.end}.`}
            />
            <FadeIn>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-md">
                {(() => {
                  const total = reportData.ga4Period.countries.reduce((s, x) => s + x.users, 0);
                  const maxUsers = reportData.ga4Period.countries[0]?.users || 1;
                  return reportData.ga4Period.countries.map((c, idx) => {
                    const pct = ((c.users / total) * 100).toFixed(1);
                    return (
                      <div
                        key={c.country}
                        className="rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 hover:border-primary/25 transition-all"
                        style={{ padding: "var(--space-lg)" }}
                      >
                        <div className="flex items-center justify-between mb-sm">
                          <span className="text-base font-bold text-(--color-text)/80">{c.country}</span>
                          <span className="text-sm font-bold text-(--color-text)/80">
                            {c.users} <span className="text-(--color-text)/60 font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-3 bg-(--color-text)/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(c.users / maxUsers) * 100}%`,
                              backgroundColor: "var(--color-primary)",
                              opacity: 1 - (idx * 0.08),
                            }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* Email Marketing */}
      {hasEmailData && (
        <section
          className="border-t-2 border-(--color-text)/10"
          style={{ padding: "var(--space-2xl) 0", backgroundColor: "rgba(26,26,46,0.02)" }}
        >
          <div className="container">
            <SectionHeading
              icon={Mail}
              title="Email Marketing"
              subtitle="How email campaigns are performing."
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
              <MetricCard
                label="Open Rate"
                value={current.email.openRate}
                prevValue={previous?.email.openRate}
                type="percent"
                icon={Mail}
                tooltip="openRate"
                compLabel={compLabel}
              />
              <MetricCard
                label="Click Rate"
                value={current.email.clickRate}
                prevValue={previous?.email.clickRate}
                type="percent"
                icon={MousePointerClick}
                tooltip="clickRate"
                compLabel={compLabel}
              />
              <MetricCard
                label="Recipients"
                value={current.email.totalRecipients}
                prevValue={previous?.email.totalRecipients}
                icon={Users}
                compLabel={compLabel}
              />
              <MetricCard
                label="Unsubscribes"
                value={current.email.unsubscribes}
                prevValue={previous?.email.unsubscribes}
                invert
                compLabel={compLabel}
              />
            </div>
          </div>
        </section>
      )}

      {/* Period Summary */}
      {weeks.length >= 4 &&
        (() => {
          const gaWeeks = weeks.filter((w) => w.ga.sessions != null);
          const totalSessions = sumWeeks(gaWeeks, (w) => w.ga.sessions);
          const totalPageViews = sumWeeks(gaWeeks, (w) => w.ga.pageViews);
          const totalLeads = sumWeeks(gaWeeks, (w) => w.ga.leads || 0);
          const totalCTAClicks = sumWeeks(gaWeeks, (w) => w.ga.ctaClicks || 0);
          const totalLIImpressions = sumWeeks(weeks, (w) => w.linkedin.impressions);
          const totalLIEngagements = sumWeeks(weeks, (w) => w.linkedin.engagements);
          const followerGrowth =
            weeks[0].linkedin.followers - weeks[weeks.length - 1].linkedin.followers;
          const avgEngRate = avgWeeks(weeks, (w) => w.linkedin.engagementRate);

          const items = [
            {
              label: "Total Sessions",
              value: totalSessions.toLocaleString("en-GB"),
              sub: `${gaWeeks.length} weeks of data`,
            },
            {
              label: "Total Page Views",
              value: totalPageViews.toLocaleString("en-GB"),
              sub: `${gaWeeks.length} weeks of data`,
            },
            {
              label: "Total Leads",
              value: totalLeads.toLocaleString("en-GB"),
              sub: `${gaWeeks.length} weeks of data`,
            },
            {
              label: "Total CTA Clicks",
              value: totalCTAClicks.toLocaleString("en-GB"),
              sub: `${gaWeeks.length} weeks of data`,
            },
            {
              label: "Follower Growth",
              value: `+${followerGrowth}`,
              sub: `over ${weeks.length} weeks`,
            },
            {
              label: "LinkedIn Impressions",
              value: totalLIImpressions.toLocaleString("en-GB"),
              sub: `over ${weeks.length} weeks`,
            },
            {
              label: "LinkedIn Engagements",
              value: totalLIEngagements.toLocaleString("en-GB"),
              sub: `over ${weeks.length} weeks`,
            },
            {
              label: "Avg Engagement Rate",
              value: avgEngRate != null ? `${avgEngRate.toFixed(1)}%` : "N/A",
              sub: `over ${weeks.length} weeks`,
            },
          ];

          return (
            <section
              className="border-t-2 border-(--color-text)/10"
              style={{ padding: "var(--space-2xl) 0", backgroundColor: "rgba(26,26,46,0.02)" }}
            >
              <div className="container">
                <SectionHeading
                  icon={Target}
                  title="All-Time Summary"
                  subtitle="Totals across all the data we have. A high-level view of overall performance."
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
                  {items.map((item, idx) => (
                    <FadeIn key={item.label} delay={idx * 60}>
                      <div
                        className="rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 hover:border-primary/25 text-center h-full transition-all"
                        style={{ padding: "var(--space-xl)" }}
                      >
                        <p className="text-2xl md:text-3xl font-heading font-bold mb-sm">
                          {item.value}
                        </p>
                        <p className="text-sm font-bold text-(--color-text)/80 tracking-wide">
                          {item.label}
                        </p>
                        <p className="text-sm text-(--color-text)/70 mt-sm">{item.sub}</p>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

      {/* Website Trends */}
      {hasEnoughForTrends &&
        (() => {
          const gaWeeksWithData = weeks.filter((w) => w.ga.sessions != null);
          const gaLabels = gaWeeksWithData.map((w) => w.weekEnding.slice(5)).reverse();

          if (gaWeeksWithData.length < 2) return null;

          const websiteTrends = [
            {
              label: "Sessions",
              tooltip: "sessions",
              values: gaWeeksWithData.map((w) => w.ga.sessions).reverse(),
              color: "#2d6ad4",
              labels: gaLabels,
            },
            {
              label: "Users",
              tooltip: "users",
              values: gaWeeksWithData.map((w) => w.ga.users).reverse(),
              color: "#2a9d63",
              labels: gaLabels,
            },
            {
              label: "Page Views",
              tooltip: "pageViews",
              values: gaWeeksWithData.map((w) => w.ga.pageViews).reverse(),
              color: "#e83a7a",
              labels: gaLabels,
            },
            {
              label: "CTA Clicks",
              tooltip: "ctaClicks",
              values: gaWeeksWithData.map((w) => w.ga.ctaClicks).reverse(),
              color: "#7a32c4",
              labels: gaLabels,
            },
          ];

          return (
            <section
              className="border-t-2 border-(--color-text)/10"
              style={{ padding: "var(--space-2xl) 0" }}
            >
              <div className="container">
                <SectionHeading
                  icon={BarChart3}
                  title="Website Trends"
                  subtitle="How website traffic has changed week by week."
                />
                <div className="grid md:grid-cols-2 gap-md">
                  {websiteTrends.map((trend, tIdx) => (
                    <FadeIn key={trend.label} delay={tIdx * 80}>
                      <div
                        className="rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 hover:border-primary/25 h-full transition-all"
                        style={{ padding: "var(--space-xl)" }}
                      >
                        <div className="flex items-center gap-sm" style={{ marginBottom: "16px" }}>
                          <p className="text-base font-bold text-(--color-text)/80 tracking-wide">
                            {trend.label}
                          </p>
                          {trend.tooltip && <Tooltip term={trend.tooltip} />}
                        </div>
                        <TrendChart
                          values={trend.values}
                          labels={trend.labels}
                          color={trend.color}
                          type={trend.type}
                        />
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

      {/* ═══════════════════ LINKEDIN SECTION ═══════════════════ */}
      <section
        className="border-t-4 border-[#0a66c2]/30"
        style={{ padding: "var(--space-2xl) 0", background: "linear-gradient(180deg, #0a66c208 0%, transparent 100%)" }}
      >
        <div className="container">
          {/* LinkedIn banner header */}
          <FadeIn>
            <div
              className="rounded-2xl md:rounded-3xl flex items-center gap-lg mb-2xl"
              style={{ padding: "var(--space-lg) var(--space-xl)", backgroundColor: "#0a66c2" }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white/20">
                <Linkedin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-heading text-white">LinkedIn</h2>
                <p className="text-sm text-white/75">Data from the ERP Experts LinkedIn company page — separate from website analytics above.</p>
              </div>
            </div>
          </FadeIn>

          {/* LinkedIn Performance metrics */}
          <div className="mb-2xl">
            <SectionHeading
              icon={Linkedin}
              title="LinkedIn Performance"
              subtitle="How the ERP Experts company page is performing on LinkedIn."
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-md">
              <MetricCard
                label="Followers"
                value={li.followers.current}
                prevValue={li.followers.previous}
                icon={Users}
                tooltip="followers"
                compLabel={compLabel}
                delay={0}
              />
              <MetricCard
                label="New Followers"
                value={li.newFollowers.current}
                prevValue={li.newFollowers.previous}
                icon={TrendingUp}
                tooltip="newFollowers"
                compLabel={compLabel}
                delay={60}
              />
              <MetricCard
                label="Impressions"
                value={li.impressions.current}
                prevValue={li.impressions.previous}
                icon={Eye}
                tooltip="impressions"
                compLabel={compLabel}
                delay={120}
              />
              <MetricCard
                label="Engagements"
                value={li.engagements.current}
                prevValue={li.engagements.previous}
                icon={Heart}
                tooltip="engagements"
                compLabel={compLabel}
                delay={180}
              />
              <MetricCard
                label="Engagement Rate"
                value={li.engagementRate.current}
                prevValue={li.engagementRate.previous}
                type="percent"
                icon={MousePointerClick}
                tooltip="engagementRate"
                compLabel={compLabel}
                delay={240}
              />
            </div>
          </div>

          {/* LinkedIn Audience Demographics */}
          {reportData.linkedinYear?.demographics && (
          <div className="mb-2xl">
            <SectionHeading
              icon={Users}
              title="Who's Following Us on LinkedIn?"
              subtitle={`Audience demographics from the last 12 months (${reportData.linkedinYear.start} to ${reportData.linkedinYear.end}). Total impressions: ${reportData.linkedinYear.totalImpressions.toLocaleString("en-GB")}. Unique members reached: ${reportData.linkedinYear.membersReached.toLocaleString("en-GB")}.`}
            />
            {(() => {
              const d = reportData.linkedinYear.demographics;
              const demoColors = ["#2d6ad4", "#2a9d63", "#e83a7a", "#7a32c4", "#0a66c2"];
              const sections = [
                {
                  title: "Job Titles",
                  icon: Briefcase,
                  items: d.jobTitles.map((x) => ({ label: x.title, pct: x.pct })),
                },
                {
                  title: "Locations",
                  icon: MapPin,
                  items: d.locations.map((x) => ({ label: x.location, pct: x.pct })),
                },
                {
                  title: "Industries",
                  icon: Building2,
                  items: d.industries.map((x) => ({ label: x.industry, pct: x.pct })),
                },
                {
                  title: "Seniority",
                  icon: TrendingUp,
                  items: d.seniority.map((x) => ({ label: x.level, pct: x.pct })),
                },
                {
                  title: "Company Size",
                  icon: Users,
                  items: d.companySize.map((x) => ({ label: `${x.size} employees`, pct: x.pct })),
                },
              ];
              return (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-md">
                  {sections.map((sec, idx) => {
                    const color = demoColors[idx % demoColors.length];
                    const maxPct = Math.max(...sec.items.map((x) => x.pct));
                    return (
                      <FadeIn key={sec.title} delay={idx * 80}>
                        <div
                          className="rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 hover:border-primary/25 h-full transition-all"
                          style={{ padding: "var(--space-xl)" }}
                        >
                          <div className="flex items-center gap-sm" style={{ marginBottom: "20px" }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                              <sec.icon className="w-4 h-4" style={{ color }} />
                            </div>
                            <h4 className="text-base font-bold tracking-wide text-(--color-text)/80">
                              {sec.title}
                            </h4>
                          </div>
                          <div className="space-y-lg">
                            {sec.items.map((item, itemIdx) => (
                              <div key={item.label}>
                                <div className="flex items-center justify-between mb-sm">
                                  <span className="text-sm text-(--color-text)/70">
                                    {item.label}
                                  </span>
                                  <span className="text-sm font-bold text-(--color-text)/90 shrink-0" style={{ marginLeft: "8px" }}>
                                    {item.pct}%
                                  </span>
                                </div>
                                <div className="h-3 bg-(--color-text)/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${(item.pct / maxPct) * 100}%`,
                                      backgroundColor: color,
                                      opacity: 1 - (itemIdx * 0.12),
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </FadeIn>
                    );
                  })}
                </div>
              );
            })()}
          </div>
          )}

          {/* Top LinkedIn Posts */}
          {reportData.topLinkedInPosts && reportData.topLinkedInPosts.length > 0 && (
          <div>
            <SectionHeading
              icon={Award}
              title="Top LinkedIn Posts"
              subtitle="Best performing posts ranked by engagement rate. This is the percentage of people who saw the post and actually interacted with it."
            />
            <div className="space-y-lg">
              {[...reportData.topLinkedInPosts]
                .sort((a, b) => b.engagementRate - a.engagementRate)
                .map((post, i) => (
                  <FadeIn key={i} delay={i * 80}>
                  <div
                    className="rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 hover:border-primary/25 flex flex-col md:flex-row md:items-center gap-lg transition-all"
                    style={{ padding: "var(--space-xl)" }}
                  >
                    <div className="flex items-center shrink-0" style={{ marginRight: "16px" }}>
                      <span
                        className="text-2xl font-heading font-bold text-primary/50"
                        style={{ minWidth: "44px" }}
                      >
                        #{i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-(--color-text)/70 mb-xs">{post.date}</p>
                      <p className="text-base font-medium text-(--color-text)/80">
                        &ldquo;{post.excerpt}&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center gap-lg shrink-0 flex-wrap">
                      <div
                        className="flex items-center gap-xs text-sm"
                        title="Impressions: times shown in feeds"
                      >
                        <Eye className="w-4 h-4 text-(--color-text)/70" />
                        <span className="font-bold text-(--color-text)/80">
                          {post.impressions.toLocaleString("en-GB")}
                        </span>
                      </div>
                      <div className="flex items-center gap-xs text-sm" title="Likes">
                        <ThumbsUp className="w-4 h-4 text-(--color-text)/70" />
                        <span className="font-bold text-(--color-text)/80">{post.votes}</span>
                      </div>
                      <div className="flex items-center gap-xs text-sm" title="Comments">
                        <MessageSquare className="w-4 h-4 text-(--color-text)/70" />
                        <span className="font-bold text-(--color-text)/80">{post.comments}</span>
                      </div>
                      {post.reposts > 0 && (
                        <div className="flex items-center gap-xs text-sm" title="Reposts / shares">
                          <Repeat2 className="w-4 h-4 text-(--color-text)/70" />
                          <span className="font-bold text-(--color-text)/80">{post.reposts}</span>
                        </div>
                      )}
                      <span
                        className="inline-flex items-center rounded-full bg-primary/10 text-primary font-bold text-sm"
                        style={{ padding: "6px 14px" }}
                        title="Engagement rate"
                      >
                        {post.engagementRate}% eng.
                      </span>
                    </div>
                  </div>
                  </FadeIn>
                ))}
            </div>
          </div>
          )}

          {/* LinkedIn Trends */}
          {hasEnoughForTrends && (() => {
            const dateLabels = weeks.map((w) => w.weekEnding.slice(5)).reverse();
            const linkedinTrends = [
              {
                label: "Followers",
                tooltip: "followers",
                values: weeks.map((w) => w.linkedin.followers).reverse(),
                color: "#0a66c2",
                labels: dateLabels,
              },
              {
                label: "Impressions",
                tooltip: "impressions",
                values: weeks.map((w) => w.linkedin.impressions).reverse(),
                color: "#0a66c2",
                labels: dateLabels,
              },
              {
                label: "Engagements",
                tooltip: "engagements",
                values: weeks.map((w) => w.linkedin.engagements).reverse(),
                color: "#7a32c4",
                labels: dateLabels,
              },
              {
                label: "Engagement Rate",
                tooltip: "engagementRate",
                values: weeks.map((w) => w.linkedin.engagementRate).reverse(),
                color: "#e83a7a",
                type: "percent",
                labels: dateLabels,
              },
            ];

            return (
              <div className="mt-2xl pt-2xl border-t-2 border-(--color-text)/10">
                <SectionHeading
                  icon={Linkedin}
                  title="LinkedIn Trends"
                  subtitle="How the LinkedIn company page has grown week by week."
                />
                <div className="grid md:grid-cols-2 gap-md">
                  {linkedinTrends.map((trend, tIdx) => (
                    <FadeIn key={trend.label} delay={tIdx * 80}>
                      <div
                        className="rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 hover:border-primary/25 h-full transition-all"
                        style={{ padding: "var(--space-xl)" }}
                      >
                        <div className="flex items-center gap-sm" style={{ marginBottom: "16px" }}>
                          <p className="text-base font-bold text-(--color-text)/80 tracking-wide">
                            {trend.label}
                          </p>
                          {trend.tooltip && <Tooltip term={trend.tooltip} />}
                        </div>
                        <TrendChart
                          values={trend.values}
                          labels={trend.labels}
                          color={trend.color}
                          type={trend.type}
                        />
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Glossary (collapsible) */}
      <section
        className="border-t-2 border-(--color-text)/10"
        style={{ padding: "var(--space-2xl) 0" }}
      >
        <div className="container">
          <details>
            <summary className="cursor-pointer list-none">
              <div className="flex items-center gap-md mb-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/12">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-sm">
                  <h2 className="text-xl md:text-2xl font-heading">What Do These Numbers Mean?</h2>
                  <span className="text-sm text-(--color-text)/60 font-medium">click to expand</span>
                </div>
              </div>
              <p className="text-(--color-text)/70 text-base md:text-lg ml-[52px]">
                Quick reference for anyone unfamiliar with marketing metrics.
              </p>
            </summary>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-md" style={{ marginTop: "var(--space-lg)" }}>
              {Object.entries(glossary).map(([key, text]) => (
                <div
                  key={key}
                  className="rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 hover:border-primary/25 transition-all"
                  style={{ padding: "var(--space-lg)" }}
                >
                  <p className="text-base font-bold capitalize mb-sm text-(--color-text)/80">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p className="text-sm text-(--color-text)/70 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </details>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden py-(--space-2xl) border-t-2 border-(--color-text)/10">
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
          <p className="text-muted">ERP Experts — Marketing Reports — Internal Use Only</p>
          <p className="text-sm text-muted mt-sm">
            Update{" "}
            <code className="bg-(--color-text)/5 px-2 py-0.5 rounded text-sm">
              src/data/reports.json
            </code>{" "}
            weekly, then rebuild and deploy.
          </p>
        </div>
      </footer>
    </div>
  );
}
