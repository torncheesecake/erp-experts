/**
 * Layout Variant 8: Comparison Matrix
 * Side-by-side decision matrix with delivery checkpoints.
 * Best for: buyer guides, partner evaluations, and option trade-offs.
 */

import { CheckCircle } from "lucide-react";
import SharedHero from "./SharedHero";
import SharedCTA from "./SharedCTA";
import SharedGuideBar from "./SharedGuideBar";
import SharedBonusTips from "./SharedBonusTips";
import SharedFeatureIcon from "./SharedFeatureIcon";

const toneClasses = {
  positive: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  negative: "border-rose-200 bg-rose-50 text-rose-900",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
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

  return (
    <>
      <SharedHero article={article} slug={slug} />

      <SharedGuideBar
        tipsCount={rows.length || article.tips.length}
        tipsLabel="Comparison Criteria"
        bonusCount={article.tips.length}
        bonusLabel="Delivery Checkpoints"
        readTime={article.readTime}
      />

      {/* Overview + Key takeaways */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_420px] gap-2xl items-start">
            <div>
              <p className="text-label text-primary mb-md">Overview</p>
              <h2 className="mb-lg" dangerouslySetInnerHTML={{ __html: article.overviewHeading }} />
              <p className="resource-lead mb-lg">{article.intro}</p>
              <p className="resource-body">{article.overviewSubtext}</p>
            </div>

            <div className="bg-primary/5 rounded-2xl p-xl border border-primary/10">
              <p className="text-label text-primary mb-lg">What to Prioritise</p>
              <ul className="flex flex-col gap-md">
                {article.takeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-md">
                    <SharedFeatureIcon icon={CheckCircle} size="sm" className="shrink-0 mt-0.5" />
                    <span className="resource-body">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison matrix */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">Decision Matrix</p>
            <h2
              className="mb-md"
              dangerouslySetInnerHTML={{
                __html: comparison.heading || article.tipsHeading,
              }}
            />
            <p className="resource-body max-w-3xl mx-auto">
              {comparison.intro || "Compare your options against the criteria that affect delivery risk, cost, and long-term value."}
            </p>
          </div>

          <div className="rounded-2xl border border-(--color-text)/10 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse">
                <thead style={{ backgroundColor: "rgba(230, 48, 125, 0.04)" }}>
                  <tr>
                    <th className="text-left p-lg font-heading text-base border-b border-(--color-text)/10 w-[260px]">
                      Criteria
                    </th>
                    {columns.map((column, i) => (
                      <th
                        key={i}
                        className="text-left p-lg font-heading text-base border-b border-(--color-text)/10"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      <td className="align-top p-lg border-b border-(--color-text)/10">
                        <p className="font-semibold leading-relaxed">{row.criterion}</p>
                      </td>
                      {columns.map((_, colIndex) => {
                        const cell = normaliseCell(row.values?.[colIndex]);
                        return (
                          <td key={colIndex} className="align-top p-md border-b border-(--color-text)/10">
                            <div
                              className={`rounded-xl border p-md resource-fine ${
                                toneClasses[cell.tone] || toneClasses.neutral
                              }`}
                            >
                              {cell.text}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery checkpoints */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">Delivery Checklist</p>
            <h3>
              Use These <span className="text-primary">Checkpoints</span> to Stay on Track
            </h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-xl">
            {article.tips.map((tip, i) => (
              <article key={i} className="rounded-2xl border border-(--color-text)/10 p-lg md:p-xl bg-white shadow-[0_10px_28px_rgba(26,26,26,0.04)]">
                <div className="flex items-center gap-md mb-md">
                  <span className="text-3xl font-heading font-bold text-primary/20">{tip.number}</span>
                  <SharedFeatureIcon icon={tip.icon} size="lg" />
                </div>

                <h4 className="mb-md">{tip.title}</h4>
                <p className="resource-body mb-lg">{tip.content}</p>

                <ul className="flex flex-col gap-sm">
                  {tip.actions.map((action, actionIndex) => (
                    <li key={actionIndex} className="flex items-start gap-sm">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-heading font-bold text-sm flex items-center justify-center">
                        {actionIndex + 1}
                      </span>
                      <span className="resource-body">{action}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Recommendation + conclusion */}
      <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(230, 48, 125, 0.05) 0%, rgba(230, 48, 125, 0.01) 55%, transparent 100%)",
          }}
        />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-[420px_1fr] gap-2xl items-start">
            <aside className="rounded-2xl p-xl border border-primary/20 bg-primary/5">
              <p className="text-label text-primary mb-md">{recommendationTitle}</p>
              <p className="resource-body">{recommendationText}</p>
            </aside>

            <div>
              <p className="text-label text-primary mb-md">The Bottom Line</p>
              <h3 className="mb-lg">
                Bringing It All <span className="text-primary">Together</span>
              </h3>
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
