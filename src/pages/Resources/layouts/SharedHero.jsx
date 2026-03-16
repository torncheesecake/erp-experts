/**
 * Shared Hero for Resource Article layouts
 * Extracted from ResourceArticle.jsx — identical hero across all variants.
 */

import {
  Clock,
  Calendar,
  BookOpen,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Breadcrumb from "../../../components/ui/Breadcrumb";

export default function SharedHero({ article, slug }) {
  if (article.heroMode === "import-workflow") {
    return <ImportWorkflowHero article={article} slug={slug} />;
  }

  const isCentered = article.heroAlignment !== "left";
  const heroShellClass = isCentered ? "mx-auto text-center" : "";
  const metaRowClass = isCentered
    ? "flex flex-wrap items-center justify-center gap-sm md:gap-md mb-xl"
    : "flex flex-wrap items-center gap-md mb-lg";
  const detailPillClass = isCentered
    ? "inline-flex items-center gap-sm rounded-full border border-white/22 bg-black/44 px-4 py-2 text-sm font-semibold text-white/96 backdrop-blur-[8px] shadow-[0_12px_28px_rgba(0,0,0,0.24)]"
    : "flex items-center gap-sm text-white/60 text-sm";
  const iconClass = isCentered ? "w-4 h-4 text-white/92" : "w-4 h-4";

  return (
    <section className="relative min-h-[45vh] md:min-h-[50vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={article.heroImage} alt={article.title} className="w-full h-full object-cover" />
        <div
          className={`absolute inset-0 ${
            isCentered
              ? "bg-[linear-gradient(180deg,rgba(0,0,0,0.68)_0%,rgba(0,0,0,0.42)_38%,rgba(0,0,0,0.58)_100%)]"
              : "bg-gradient-to-r from-black/85 via-black/70 to-black/40"
          }`}
        />
      </div>

      {/* Decorative triangle */}
      {!isCentered && (
        <div
          className="absolute bottom-0 right-0 opacity-20 hidden lg:block pointer-events-none"
          style={{
            width: "700px",
            height: "600px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(20%)",
          }}
        />
      )}

      <div
        className="container relative z-20"
        style={{ paddingTop: "clamp(5.75rem, 15vw, 8.75rem)" }}
      >
        <div
          className={heroShellClass}
          style={{ maxWidth: isCentered ? "1040px" : "960px" }}
        >
          <div className={`hidden sm:block ${isCentered ? "mb-xl" : ""}`.trim()}>
            <Breadcrumb
              items={[
                { label: "Home", to: "/" },
                { label: "Resources", to: "/resources" },
                { label: article.title },
              ]}
              light
              align={isCentered ? "center" : "left"}
              variant={isCentered ? "hero-pills" : "default"}
            />
          </div>

          {/* Meta badges */}
          <div className={metaRowClass}>
            <span className={`inline-flex items-center gap-sm px-4 py-2 rounded-full text-sm font-bold text-white ${isCentered ? "border border-white/14 bg-primary shadow-[0_14px_28px_rgba(230,58,122,0.34)]" : "bg-primary"}`.trim()}>
              <BookOpen className="w-4 h-4" />
              {article.type}
            </span>
            <span className={detailPillClass}>
              <Calendar className={iconClass} />
              {article.date}
            </span>
            <span className={detailPillClass}>
              <Clock className={iconClass} />
              {article.readTime}
            </span>
          </div>

          <h1
            className="resource-hero-title font-heading text-white"
            style={{ marginBottom: "var(--space-lg)" }}
          >
            {article.title}
          </h1>
          <p
            className={`resource-hero-subtitle ${isCentered ? "mx-auto" : ""}`.trim()}
            style={isCentered ? { color: "rgba(255,255,255,0.92)", maxWidth: "38ch" } : undefined}
          >
            {article.subtitle}
          </p>

          {isCentered && article.heroAccent === "brand-marker" && (
            <div className="flex justify-center mt-lg" aria-hidden="true">
              <div className="relative h-4 w-24 sm:w-28">
                <span
                  className="absolute inset-0 translate-x-2 translate-y-1 bg-primary/24 blur-[1px]"
                  style={{ clipPath: "polygon(0 0, 90% 0, 100% 100%, 0 100%)" }}
                />
                <span
                  className="absolute inset-x-0 top-0 h-3 bg-primary shadow-[0_0_20px_rgba(230,58,122,0.24)]"
                  style={{ clipPath: "polygon(0 0, 88% 0, 100% 100%, 0 100%)" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ImportWorkflowHero({ article }) {
  return (
    <section className="relative overflow-hidden bg-[#08131c] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,58,122,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(91,192,190,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div className="container relative z-10" style={{ paddingTop: "clamp(5.75rem, 15vw, 8.75rem)", paddingBottom: "clamp(3rem, 9vw, 5rem)" }}>
        <div className="hidden sm:block mb-lg">
          <Breadcrumb
            items={[
              { label: "Home", to: "/" },
              { label: "Resources", to: "/resources" },
              { label: article.title },
            ]}
            light
          />
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.42fr)_minmax(320px,0.68fr)] gap-xl lg:gap-[3.5rem] items-end">
          <div style={{ maxWidth: "none" }}>
            <div className="flex flex-wrap items-center gap-md mb-lg">
              <span className="inline-flex items-center gap-sm px-4 py-2 rounded-full bg-primary text-white text-sm font-bold">
                <BookOpen className="w-4 h-4" />
                {article.type}
              </span>
              <span className="flex items-center gap-sm text-white/65 text-sm">
                <Calendar className="w-4 h-4" />
                {article.date}
              </span>
              <span className="flex items-center gap-sm text-white/65 text-sm">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </span>
            </div>

            <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#8fd0cb] mb-md">
              NetSuite Import Troubleshooting
            </p>
            <h1
              className="resource-hero-title font-heading text-white"
              style={{
                marginBottom: "var(--space-lg)",
                maxWidth: "760px",
                fontSize: "clamp(2.5rem, 3.45vw + 0.95rem, 5.15rem)",
                lineHeight: 0.96,
              }}
            >
              {article.title}
            </h1>
            <p className="resource-hero-subtitle text-white/76 max-w-[48ch]">
              {article.subtitle}
            </p>
          </div>

          <div className="lg:justify-self-end w-full max-w-[430px]">
            <div className="rounded-[2rem] border border-white/12 bg-white/[0.06] backdrop-blur-sm shadow-[0_24px_80px_rgba(0,0,0,0.34)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 px-lg py-md">
                <div className="flex items-center gap-sm">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-[#8fd0cb]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">customer-import.csv</p>
                    <p className="text-xs text-white/55">184 rows ready for validation</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-400/18 px-3 py-1 text-xs font-bold text-emerald-200">
                  UTF-8
                </span>
              </div>

              <div className="px-lg py-lg space-y-md">
                <div className="rounded-2xl bg-[#0f1f2d] border border-white/6 p-md">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/45 mb-sm">
                    Field Mapping
                  </p>
                  <div className="space-y-sm">
                    <MappingRow left="Customer Name" right="Company Name" tone="good" />
                    <MappingRow left="Invoice Date" right="trandate" tone="good" />
                    <MappingRow left="Subsidiary" right="Subsidiary" tone="warn" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-sm">
                  <StatusCard
                    icon={CheckCircle2}
                    tone="good"
                    title="181 rows clean"
                    copy="Headers matched and formatting accepted."
                  />
                  <StatusCard
                    icon={AlertTriangle}
                    tone="warn"
                    title="3 rows flagged"
                    copy="Reference values need checking before import."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MappingRow({ left, right, tone }) {
  const isWarn = tone === "warn";
  return (
    <div className="flex items-center gap-sm rounded-xl bg-white/[0.03] px-md py-sm">
      <span className="min-w-0 flex-1 text-sm text-white/82">{left}</span>
      <ArrowRight className="w-4 h-4 shrink-0 text-white/28" />
      <span className={`min-w-0 flex-1 text-sm font-semibold ${isWarn ? "text-amber-200" : "text-[#9fe4dc]"}`}>
        {right}
      </span>
    </div>
  );
}

function StatusCard({ icon: Icon, tone, title, copy }) {
  const isWarn = tone === "warn";
  return (
    <div className={`rounded-2xl border px-md py-md ${isWarn ? "border-amber-300/18 bg-amber-300/8" : "border-emerald-300/14 bg-emerald-300/8"}`}>
      <div className="flex items-start gap-sm">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isWarn ? "bg-amber-300/12 text-amber-200" : "bg-emerald-300/12 text-emerald-200"}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-sm text-white/58 leading-relaxed">{copy}</p>
        </div>
      </div>
    </div>
  );
}
