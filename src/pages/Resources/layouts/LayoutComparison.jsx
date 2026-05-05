/**
 * Layout Variant 8: Comparison Matrix
 * Side-by-side decision matrix with delivery checkpoints.
 * Best for: buyer guides, partner evaluations, and option trade-offs.
 */

import { CheckCircle } from "lucide-react";
import SharedHero from "./SharedHero";
import SharedCTA from "./SharedCTA";
import SharedBonusTips from "./SharedBonusTips";

const toneClasses = {
  positive: {
    card: "border-emerald-200 bg-emerald-50/90 text-emerald-950",
    badge: "bg-emerald-100 text-emerald-800",
    marker: "bg-emerald-500",
    label: "Strong fit",
  },
  warning: {
    card: "border-amber-200 bg-amber-50/90 text-amber-950",
    badge: "bg-amber-100 text-amber-800",
    marker: "bg-amber-500",
    label: "Partial fit",
  },
  negative: {
    card: "border-rose-200 bg-rose-50/90 text-rose-950",
    badge: "bg-rose-100 text-rose-800",
    marker: "bg-rose-500",
    label: "High risk",
  },
  neutral: {
    card: "border-slate-200 bg-slate-50 text-slate-800",
    badge: "bg-slate-200 text-slate-700",
    marker: "bg-slate-400",
    label: "Mixed",
  },
};

function normaliseCell(cell) {
  if (typeof cell === "string") {
    return { text: cell, tone: "neutral" };
  }

  return {
    text: cell?.text || "",
    tone: cell?.tone || "neutral",
  };
}

export default function LayoutComparison({ article, slug }) {
  const comparison = article.comparison || {};
  const columns = comparison.columns || [];
  const rows = comparison.rows || [];
  const recommendationTitle = comparison.recommendationTitle || "Recommendation";
  const recommendationText = comparison.recommendationText || article.conclusion;
  const recommendedColumn = comparison.recommendedColumn ?? null;
  const desktopGridStyle = {
    gridTemplateColumns: `minmax(320px, 1.02fr) repeat(${Math.max(columns.length, 1)}, minmax(0, 1fr))`,
  };

  return (
    <>
      <SharedHero article={article} slug={slug} />

      {/* Overview + Key takeaways */}
      <section className="section-padding">
        <div className="container">
          <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] gap-2xl xl:gap-3xl items-start">
            <div className="min-w-0 xl:pr-xl">
              <p className="text-label text-primary mb-md">Overview</p>
              <h2 className="mb-xl" dangerouslySetInnerHTML={{ __html: article.overviewHeading }} />
              <p className="resource-lead mb-xl">{article.intro}</p>
              <p className="resource-body">{article.overviewSubtext}</p>
            </div>

            <aside className="min-w-0 pt-2xl mt-2xl border-t border-(--color-text)/10 xl:sticky xl:top-24 xl:pt-0 xl:mt-0 xl:border-t-0">
              <p className="text-label text-primary mb-lg">Core Priorities</p>
              <ul className="flex flex-col gap-lg">
                {article.takeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-lg md:gap-xl min-w-0">
                    <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-11 h-11 rounded-[0.95rem] border border-primary/18 bg-primary/8 text-primary">
                      <CheckCircle className="w-5 h-5" strokeWidth={2.65} aria-hidden="true" />
                    </span>
                    <span className="resource-body">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* Comparison matrix */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl md:mb-3xl">
            <p className="text-label text-primary mb-md">Decision Matrix</p>
            <h2
              className="mb-lg"
              dangerouslySetInnerHTML={{
                __html: comparison.heading || article.tipsHeading,
              }}
            />
            <p className="resource-body max-w-3xl mx-auto">
              {comparison.intro || "Compare your options against the criteria that affect delivery risk, cost, and long-term value."}
            </p>
          </div>

          <div className="grid gap-lg md:hidden">
            {rows.map((row, i) => (
              <article
                key={i}
                className="rounded-[1.35rem] border border-(--color-text)/10 bg-white p-lg md:p-xl shadow-[0_10px_28px_rgba(26,26,26,0.04)]"
              >
                <p className="text-label text-primary mb-sm">Criteria</p>
                <h4 className="mb-lg">{row.criterion}</h4>

                <div className="grid gap-md">
                  {columns.map((column, colIndex) => {
                    const cell = normaliseCell(row.values?.[colIndex]);
                    const isRecommended = recommendedColumn === colIndex;
                    const tone = toneClasses[cell.tone] || toneClasses.neutral;
                    return (
                      <div
                        key={colIndex}
                        className={`rounded-xl border p-md md:p-lg ${
                          isRecommended
                            ? "border-primary/20 bg-primary/[0.045]"
                            : "border-(--color-text)/10 bg-(--color-text)/[0.02]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-md mb-sm">
                          <p className="text-sm font-bold uppercase tracking-[0.08em] text-muted">
                            {column}
                          </p>
                          {isRecommended && (
                            <span className="shrink-0 rounded-full bg-primary/12 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-primary">
                              Best Fit
                            </span>
                          )}
                        </div>
                        <div className="mb-md flex items-center gap-sm">
                          <span className={`h-2.5 w-2.5 rounded-full ${tone.marker}`} />
                          <span className={`rounded-full px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] ${tone.badge}`}>
                            {tone.label}
                          </span>
                        </div>
                        <div
                          className={`rounded-xl border p-md resource-fine ${
                            tone.card
                          }`}
                        >
                          {cell.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <div className="hidden md:block">
            <div className="grid gap-md lg:gap-lg mb-lg" style={desktopGridStyle}>
              <div className="rounded-[1.35rem] border border-(--color-text)/10 bg-(--color-text)/[0.02] p-lg lg:p-xl min-h-[9.5rem] flex flex-col">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-primary/75 mb-sm">
                  Criteria
                </p>
                <p className="font-heading text-xl leading-tight my-auto">
                  What actually matters for your business
                </p>
              </div>
              {columns.map((column, i) => (
                <div
                  key={i}
                  className={`rounded-[1.35rem] border p-lg lg:p-xl min-h-[9.5rem] flex flex-col ${
                    recommendedColumn === i
                      ? "border-primary/18 bg-primary/[0.05] shadow-[0_16px_34px_rgba(230,48,125,0.08)]"
                      : "border-(--color-text)/10 bg-white shadow-[0_12px_28px_rgba(26,26,26,0.04)]"
                  }`}
                >
                  {recommendedColumn === i && (
                    <span className="inline-flex self-start rounded-full bg-primary/12 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-primary mb-md">
                      Best Fit
                    </span>
                  )}
                  <p className="font-heading text-xl leading-tight my-auto">{column}</p>
                </div>
              ))}
            </div>

            <div className="space-y-md lg:space-y-lg">
              {rows.map((row, i) => (
                <article
                  key={i}
                  className={`rounded-[1.5rem] border border-(--color-text)/10 p-lg lg:p-xl shadow-[0_14px_34px_rgba(26,26,26,0.04)] ${
                    i % 2 === 0 ? "bg-white" : "bg-[linear-gradient(160deg,rgba(255,250,253,0.65)_0%,rgba(255,255,255,0.98)_100%)]"
                  }`}
                >
                  <div className="grid gap-md lg:gap-lg items-stretch" style={desktopGridStyle}>
                    <div className="rounded-[1.15rem] border border-(--color-text)/10 bg-(--color-text)/[0.02] p-lg">
                      <p className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted mb-sm">
                        Decision Point
                      </p>
                      <h5 className="mb-md">{row.criterion}</h5>
                      <p className="resource-fine">
                        Compare how each option handles this in real operating conditions.
                      </p>
                    </div>

                    {columns.map((column, colIndex) => {
                      const cell = normaliseCell(row.values?.[colIndex]);
                      const isRecommended = recommendedColumn === colIndex;
                      const tone = toneClasses[cell.tone] || toneClasses.neutral;

                      return (
                        <div
                          key={colIndex}
                          className={`rounded-[1.15rem] border p-lg flex flex-col ${
                            isRecommended
                              ? "border-primary/16 bg-primary/[0.032]"
                              : "border-(--color-text)/10 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-md mb-md">
                            <span className={`shrink-0 rounded-full px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] ${tone.badge}`}>
                              {tone.label}
                            </span>
                            {isRecommended && (
                              <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-primary/70">
                                Best Fit
                              </span>
                            )}
                          </div>
                          <div
                            className={`rounded-[1rem] border p-md lg:p-lg resource-fine flex-1 ${
                              tone.card
                            }`}
                          >
                            {cell.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Delivery checkpoints */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl md:mb-3xl">
            <p className="text-label text-primary mb-md">Delivery Checklist</p>
            <h2 className="mb-lg">
              Use These <span className="text-primary">Checkpoints</span> to Stay on Track
            </h2>
            <p className="resource-body max-w-3xl mx-auto">
              Treat each checkpoint as a practical decision gate so you can pressure-test fit,
              surface delivery risk early, and keep procurement grounded in operational reality.
            </p>
          </div>

          <div className="space-y-lg md:space-y-xl">
            {article.tips.map((tip, i) => {
              const Icon = tip.icon;
              const leadAction = tip.actions?.[0];
              const followUpActions = tip.actions?.slice(1) || [];

              return (
                <article
                  key={i}
                  className={`rounded-[1.5rem] border border-(--color-text)/10 p-lg md:p-xl lg:p-2xl shadow-[0_14px_30px_rgba(26,26,26,0.035)] ${
                    i % 2 === 0
                      ? "bg-[linear-gradient(165deg,rgba(255,255,255,0.98)_0%,rgba(250,250,250,0.92)_100%)]"
                      : "bg-[linear-gradient(165deg,rgba(255,250,253,0.98)_0%,rgba(252,252,252,0.92)_100%)]"
                  }`}
                >
                  <div className="grid gap-xl lg:grid-cols-[minmax(0,1.16fr)_minmax(320px,0.84fr)] lg:gap-2xl items-start">
                    <div className="min-w-0">
                      <div className="flex items-start gap-lg min-w-0">
                        <span className="shrink-0 inline-flex flex-col items-center justify-center w-14 h-14 rounded-[1.05rem] border border-primary/20 bg-primary/8 text-primary">
                          <span className="text-[0.58rem] font-bold uppercase tracking-[0.16em] leading-none text-primary/70">
                            Step
                          </span>
                          <span className="mt-1 font-heading text-xl leading-none">{tip.number}</span>
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-md min-w-0 mb-sm">
                            <p className="text-sm font-bold tracking-[0.08em] uppercase text-primary/65 shrink-0">
                              Checkpoint
                            </p>
                            <span className="h-px flex-1 bg-(--color-text)/10" />
                          </div>
                          <h4 className="mb-sm">{tip.title}</h4>
                        </div>

                        <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-11 h-11 rounded-[0.95rem] border border-primary/18 bg-white/90 text-primary">
                          <Icon className="w-5 h-5" strokeWidth={2.35} aria-hidden="true" />
                        </span>
                      </div>

                      <p className="resource-body mt-lg">{tip.content}</p>
                    </div>

                    <aside className="min-w-0 rounded-[1.05rem] border border-primary/18 bg-[linear-gradient(165deg,rgba(230,58,122,0.08)_0%,rgba(230,58,122,0.03)_100%)] p-lg md:p-xl">
                      {leadAction && (
                        <div className="rounded-[0.95rem] border border-white/75 bg-white/92 p-md md:p-lg">
                          <p className="text-sm font-bold tracking-[0.08em] uppercase text-primary/72 mb-sm">
                            Start Here
                          </p>
                          <p className="resource-fine">{leadAction}</p>
                        </div>
                      )}

                      {followUpActions.length > 0 && (
                        <div className={leadAction ? "mt-lg pt-lg border-t border-primary/14" : ""}>
                          <p className="text-sm font-bold tracking-[0.08em] uppercase text-primary/75 mb-sm">
                            Then Verify
                          </p>
                          <p className="resource-fine mb-md">
                            Use these checks to confirm the platform fits how your production team
                            actually works.
                          </p>
                          <ul className="space-y-sm">
                            {followUpActions.map((action, actionIndex) => (
                              <li
                                key={actionIndex}
                                className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-md rounded-[0.85rem] border border-white/70 bg-white/92 p-md min-w-0"
                              >
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-heading font-bold text-sm">
                                  {String(actionIndex + 2).padStart(2, "0")}
                                </span>
                                <span className="resource-body">{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </aside>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recommendation + conclusion */}
      <section className="section-padding border-t border-(--color-text)/10 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(230, 48, 125, 0.05) 0%, rgba(230, 48, 125, 0.01) 55%, transparent 100%)",
          }}
        />
        <div className="container relative z-10">
          <div className="grid xl:grid-cols-[360px_minmax(0,1fr)] gap-2xl xl:gap-3xl items-start">
            <aside className="rounded-[1.5rem] p-xl md:p-2xl border border-primary/20 bg-primary/5">
              <p className="text-label text-primary mb-md">{recommendationTitle}</p>
              <p className="resource-body">{recommendationText}</p>
            </aside>

            <div className="min-w-0 xl:pl-sm">
              <p className="text-label text-primary mb-md">The Bottom Line</p>
              <h2 className="mb-lg">
                Bringing It All <span className="text-primary">Together</span>
              </h2>
              <p className="resource-lead mb-lg">{article.conclusion}</p>
              {article.disclaimer && (
                <p className="resource-fine italic">{article.disclaimer}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <SharedBonusTips article={article} />

      <SharedCTA />
    </>
  );
}
