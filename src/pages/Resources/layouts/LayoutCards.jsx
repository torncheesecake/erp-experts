/**
 * Layout Variant 5: Strategic list
 * Tips rendered as flatter editorial rows with a dedicated action panel.
 * Best for: listicles and quick-reference guides that need more room.
 */

import SharedHero from "./SharedHero";
import SharedCTA from "./SharedCTA";
import SharedBonusTips from "./SharedBonusTips";
import SharedOverview from "./SharedOverview";

export default function LayoutCards({ article, slug }) {
  const sectionLabel = article.tipsSectionLabel || "The Essentials";
  const sectionIntro =
    article.tipsIntro ||
    "Treat each move as a lever. Some protect margin, some unlock growth, and the best ones do both at the same time.";
  const tipEyebrowLabel = article.tipEyebrowLabel || "Profit Lever";
  const panelLabel = article.tipPanelLabel || "What to Do";
  const panelIntro =
    article.tipPanelIntro ||
    "Start with the move that protects margin fastest, then build discipline around it.";
  const primaryActionLabel = article.primaryActionLabel || "Priority Move";
  const secondaryActionLabel = article.secondaryActionLabel || "Then Tighten It";
  const usePanelIcon = article.usePanelIcon !== false;

  return (
    <>
      <SharedHero article={article} slug={slug} />

      <SharedOverview article={article}>
        {article.challengeHeading && (
          <div
            className="mt-2xl rounded-2xl p-lg md:p-xl border border-primary/20"
            style={{
              background:
                "linear-gradient(135deg, rgba(230, 48, 125, 0.08) 0%, rgba(230, 48, 125, 0.02) 100%)",
            }}
          >
            <h4 dangerouslySetInnerHTML={{ __html: article.challengeHeading }} />
            {article.challengeText && (
              <p className="resource-body mt-md max-w-4xl">{article.challengeText}</p>
            )}
          </div>
        )}
      </SharedOverview>

      {/* Tips */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="max-w-4xl mb-2xl">
            <p className="text-label text-primary mb-md">{sectionLabel}</p>
            <h2 className="mb-lg" dangerouslySetInnerHTML={{ __html: article.tipsHeading }} />
            <p className="resource-body">{sectionIntro}</p>
          </div>

          <div className="space-y-xl md:space-y-2xl">
            {article.tips.map((tip, i) => {
              const Icon = tip.icon;
              const [primaryAction, ...secondaryActions] = tip.actions || [];

              return (
                <article
                  key={i}
                  className={`${i === 0 ? "pt-0 border-t-0" : "pt-xl md:pt-2xl border-t border-(--color-text)/10"}`}
                >
                  <div className="grid gap-xl lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.85fr)] lg:gap-2xl items-start">
                    <div className="min-w-0">
                      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-lg md:gap-xl items-start min-w-0">
                        <div className="shrink-0 pt-0.5">
                          <span className="block text-[4.8rem] md:text-[5.8rem] font-heading font-bold tracking-[-0.05em] text-primary/18 leading-[0.88]">
                            {tip.number}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-bold tracking-[0.09em] uppercase text-primary/65 mb-sm">
                            {tipEyebrowLabel}
                          </p>
                          <h4 className="mb-md">{tip.title}</h4>
                          <p className="resource-body">{tip.content}</p>
                        </div>
                      </div>
                    </div>

                    <aside
                      className="min-w-0 rounded-[1.1rem] p-lg md:p-xl"
                      style={{
                        background:
                          i % 2 === 0
                            ? "linear-gradient(165deg, rgba(230, 48, 125, 0.07) 0%, rgba(230, 48, 125, 0.02) 100%)"
                            : "linear-gradient(165deg, rgba(26, 26, 26, 0.04) 0%, rgba(26, 26, 26, 0.015) 100%)",
                      }}
                    >
                      <div className="flex items-center gap-md mb-sm">
                        {usePanelIcon && (
                          <span className="inline-flex items-center justify-center w-11 h-11 rounded-[0.95rem] bg-white/80 text-primary">
                            <Icon className="w-5 h-5 stroke-[2.35]" />
                          </span>
                        )}
                        <p className="text-sm font-bold tracking-[0.09em] uppercase text-primary/75">
                          {panelLabel}
                        </p>
                      </div>
                      <p className="resource-fine mb-lg">{panelIntro}</p>

                      {primaryAction && (
                        <div className="pb-lg border-b border-(--color-text)/10">
                          <p className="text-sm font-bold tracking-[0.08em] uppercase text-primary/70 mb-sm">
                            {primaryActionLabel}
                          </p>
                          <p className="resource-body">{primaryAction}</p>
                        </div>
                      )}

                      {secondaryActions.length > 0 && (
                        <div className="pt-lg">
                          <p className="text-sm font-bold tracking-[0.08em] uppercase text-primary/70 mb-md">
                            {secondaryActionLabel}
                          </p>
                          <ul className="space-y-md">
                            {secondaryActions.map((action, j) => (
                              <li
                                key={j}
                                className="grid grid-cols-[2.25ch_minmax(0,1fr)] gap-md items-start"
                              >
                                <span className="text-primary/75 font-heading font-bold leading-none mt-1">
                                  {String(j + 1).padStart(2, "0")}
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

      <SharedBonusTips article={article} label="Bonus Strategies" title="Apply These Insights" accent="This Quarter" />

      {/* Conclusion */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="max-w-5xl mx-auto rounded-3xl border border-(--color-text)/10 p-xl md:p-2xl bg-white shadow-[0_12px_32px_rgba(26,26,26,0.05)]">
            <p className="text-label text-primary mb-md">The Bottom Line</p>
            <h2 className="mb-lg">
              Bringing It All <span className="text-primary">Together</span>
            </h2>
            <p className="resource-lead mb-lg">
              <span
                className="float-left font-heading font-bold mr-lg mt-[0.05em]"
                style={{
                  fontSize: "4rem",
                  color: "var(--color-primary)",
                  lineHeight: 0.8,
                  paddingRight: "0.05em",
                }}
              >
                {article.conclusion.charAt(0)}
              </span>
              {article.conclusion.slice(1)}
            </p>
            {article.disclaimer && (
              <p className="resource-fine italic pt-lg mt-lg border-t border-(--color-text)/10">
                {article.disclaimer}
              </p>
            )}
          </div>
        </div>
      </section>

      <SharedCTA />
    </>
  );
}
