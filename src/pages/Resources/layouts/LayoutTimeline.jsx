/**
 * Layout Variant 7: Timeline
 * Vertical timeline/process style with connecting line.
 * Best for: Step-by-step guides, implementation processes, how-tos.
 */

import { CheckCircle } from "lucide-react";
import SharedHero from "./SharedHero";
import SharedCTA from "./SharedCTA";
import SharedBonusTips from "./SharedBonusTips";
export default function LayoutTimeline({ article, slug }) {
  const prioritiesLabel = article.prioritiesLabel || "Core Priorities";
  const stepsLabel = article.tipsSectionLabel || "Step by Step";
  const stepsIntro =
    article.tipsIntro ||
    "Use these chapters to connect each ERP benefit to a measurable operational outcome, not just a feature list in a sales deck.";
  const stepMarkerLabel = article.stepLabel || "Step";
  const tipContentLabel = article.tipContentLabel || "Business Benefit";
  const tipAsideLabel = article.tipAsideLabel || "How to Validate It";
  const tipAsideIntro =
    article.tipAsideIntro ||
    "These checks help you turn a broad ERP promise into something concrete and measurable.";
  const showSummaryCard = article.timelineSummary !== false;
  const summaryLabel = article.summaryLabel || "Next";
  const summaryNumber = article.summaryNumber || "09";
  const summaryTitle = article.summaryTitle || "Ready to Build the Case";
  const summaryText =
    article.summaryText ||
    "These are the ERP benefits worth measuring first when you compare platforms, build internal support, and define what success should look like after go-live.";
  const bottomLineAsideLabel = article.bottomLineAsideLabel || "What to Measure First";
  const bottomLineAsideItems = article.bottomLineAsideItems || article.takeaways.slice(0, 3);

  return (
    <>
      <SharedHero article={article} slug={slug} />

      {/* Intro + Key Takeaways */}
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
              <p className="text-label text-primary mb-lg">{prioritiesLabel}</p>
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

          {article.challengeHeading && article.challengeText && (
            <div className="mt-2xl pt-2xl border-t border-(--color-text)/10">
              <p className="text-label text-primary mb-md">
                {article.challengeLabel || "Why This Matters"}
              </p>
              <h3 className="mb-lg" dangerouslySetInnerHTML={{ __html: article.challengeHeading }} />
              <p className="resource-body max-w-5xl">{article.challengeText}</p>
            </div>
          )}
        </div>
      </section>

      {/* Tips as Timeline */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl md:mb-3xl">
            <p className="text-label text-primary mb-md">{stepsLabel}</p>
            <h2 className="mb-lg" dangerouslySetInnerHTML={{ __html: article.tipsHeading }} />
            <p className="resource-body max-w-3xl mx-auto">{stepsIntro}</p>
          </div>

          <div>
            <div className="flex flex-col gap-lg md:gap-xl">
              {article.tips.map((tip, i) => {
                return (
                <article
                  key={i}
                  className={`rounded-[1.5rem] p-lg md:p-xl lg:p-2xl ${
                    i % 2 === 0
                      ? "bg-[linear-gradient(165deg,rgba(255,255,255,0.98)_0%,rgba(251,251,251,0.92)_100%)]"
                      : "bg-[linear-gradient(165deg,rgba(255,250,253,0.98)_0%,rgba(252,252,252,0.92)_100%)]"
                  }`}
                >
                  <div className="grid gap-xl lg:grid-cols-[72px_minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:gap-2xl items-start">
                    <div className="flex items-start gap-md lg:block">
                      <div className="shrink-0">
                        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-primary/58 mb-1">
                          {stepMarkerLabel}
                        </p>
                        <span className="font-heading font-bold text-[2.7rem] leading-none tracking-[-0.05em] text-primary/78">
                          {tip.number}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold uppercase tracking-[0.08em] text-primary/65 mb-sm">
                        {tipContentLabel}
                      </p>
                      <h4 className="mb-md">{tip.title}</h4>
                      <p className="resource-body">{tip.content}</p>
                    </div>

                    <aside className="min-w-0 rounded-[1.05rem] bg-[linear-gradient(165deg,rgba(230,58,122,0.08)_0%,rgba(230,58,122,0.03)_100%)] p-lg md:p-xl">
                      <p className="text-sm font-bold uppercase tracking-[0.08em] text-primary/75 mb-sm">
                        {tipAsideLabel}
                      </p>
                      <p className="resource-fine mb-md">{tipAsideIntro}</p>
                      <ul className="space-y-sm">
                        {tip.actions.map((action, j) => (
                          <li
                            key={j}
                            className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-md rounded-[0.85rem] bg-white/92 p-md min-w-0"
                          >
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-heading font-bold text-sm">
                              {String(j + 1).padStart(2, "0")}
                            </span>
                            <span className="resource-body">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </aside>
                  </div>
                </article>
                );
              })}

              {showSummaryCard && (
                <div className="rounded-[1.45rem] bg-[linear-gradient(160deg,rgba(255,245,250,0.9)_0%,rgba(255,255,255,0.96)_100%)] p-lg md:p-xl lg:p-2xl">
                  <div className="grid gap-lg lg:grid-cols-[72px_minmax(0,1fr)] items-center">
                    <div className="flex items-start">
                      <div>
                        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-primary/58 mb-1">
                          {summaryLabel}
                        </p>
                        <span className="font-heading font-bold text-[2.7rem] leading-none tracking-[-0.05em] text-primary/78">
                          {summaryNumber}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold uppercase tracking-[0.08em] text-primary/72 mb-sm">
                        {summaryTitle}
                      </p>
                      <p className="resource-body">{summaryText}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="section-padding border-t border-(--color-text)/10 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(230, 58, 122, 0.05) 0%, rgba(230, 58, 122, 0.015) 55%, transparent 100%)",
          }}
        />
        <div className="container relative z-10">
          <div className="grid xl:grid-cols-[320px_minmax(0,1fr)] gap-2xl xl:gap-3xl items-start">
            <aside className="min-w-0 xl:pt-sm">
              <p className="text-label text-primary mb-lg">{bottomLineAsideLabel}</p>
              <ul className="space-y-lg">
                {bottomLineAsideItems.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-md min-w-0">
                    <span className="shrink-0 mt-3 h-1.5 w-8 rounded-full bg-primary/75" />
                    <span className="resource-body">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="min-w-0">
              <p className="text-label text-primary mb-md">The Bottom Line</p>
              <h2 className="mb-lg">
                Bringing It All <span className="text-primary">Together</span>
              </h2>
              <p className="resource-lead mb-lg">{article.conclusion}</p>
              {article.disclaimer && (
                <p className="resource-fine italic pt-lg mt-lg border-t border-(--color-text)/10 max-w-3xl">
                  {article.disclaimer}
                </p>
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
