/**
 * Layout Variant 6: Editorial
 * Clean long-form layout with wider spacing and minimal card framing.
 */

import SharedHero from "./SharedHero";
import SharedCTA from "./SharedCTA";
import SharedOverview from "./SharedOverview";

export default function LayoutEditorial({ article, slug }) {
  return (
    <>
      <SharedHero article={article} slug={slug} />

      <SharedOverview article={article}>
        {article.challengeHeading && article.challengeText && (
          <div className="mt-2xl pt-2xl border-t border-(--color-text)/10">
            <p className="text-label text-primary mb-md">Risk Check</p>
            <h3 className="mb-lg" dangerouslySetInnerHTML={{ __html: article.challengeHeading }} />
            <p className="resource-body">{article.challengeText}</p>
          </div>
        )}
      </SharedOverview>

      {/* Core tips */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div>
            <p className="text-label text-primary mb-md">The Essentials</p>
            <h2 className="mb-lg" dangerouslySetInnerHTML={{ __html: article.tipsHeading }} />
            <p className="resource-body max-w-4xl">
              Use this sequence to shortlist partners, pressure-test delivery quality, and avoid
              expensive surprises after contract signature.
            </p>

            <div className="mt-xl space-y-lg md:space-y-xl">
              {article.tips.map((tip, i) => {
                const followUpQuestions = tip.actions.length > 1 ? tip.actions.slice(1) : tip.actions;
                return (
                <article
                  key={i}
                  className={`rounded-[1.35rem] border border-(--color-text)/10 p-lg md:p-xl lg:p-2xl ${
                    i % 2 === 0
                      ? "bg-[linear-gradient(160deg,rgba(255,255,255,0.98)_0%,rgba(250,250,250,0.9)_100%)]"
                      : "bg-[linear-gradient(160deg,rgba(255,250,253,0.96)_0%,rgba(250,250,250,0.9)_100%)]"
                  }`}
                >
                  <div className="grid gap-xl lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)] lg:gap-2xl">
                    <div className="min-w-0">
                      <div className="flex items-start gap-md md:gap-lg min-w-0">
                        <span className="shrink-0 inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full border border-primary/25 bg-primary/8 text-primary/85 font-heading font-bold tracking-[-0.02em] leading-none">
                          {tip.number}
                        </span>

                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-bold tracking-[0.09em] uppercase text-primary/65 mb-sm">
                            Core Check
                          </p>
                          <h5 className="mb-sm md:mb-md">{tip.title}</h5>
                        </div>
                      </div>

                      <p className="resource-body mt-lg">{tip.content}</p>

                      <div className="mt-lg pt-lg border-t border-(--color-text)/10">
                        <p className="text-sm font-bold tracking-[0.08em] uppercase text-primary/65 mb-sm">
                          What Good Looks Like
                        </p>
                        <p className="resource-fine">
                          Look for specific delivery behaviour, named owners, and proof from similar
                          projects rather than broad promises.
                        </p>
                      </div>

                      <div className="mt-lg rounded-[0.95rem] border border-(--color-text)/10 bg-white/75 p-md md:p-lg">
                        <p className="text-sm font-bold tracking-[0.08em] uppercase text-primary/70 mb-sm">
                          First Proof Point
                        </p>
                        <p className="resource-fine">{tip.actions[0]}</p>
                      </div>
                    </div>

                    <aside className="min-w-0 rounded-[1rem] border border-primary/20 bg-[linear-gradient(165deg,rgba(230,58,122,0.08)_0%,rgba(230,58,122,0.04)_100%)] p-lg md:p-xl">
                      <p className="text-sm font-bold tracking-[0.09em] uppercase text-primary/75 mb-md">
                        Follow-Up Questions
                      </p>
                      <p className="resource-fine mb-md">
                        Use these to pressure-test detail once the first answer lands.
                      </p>

                      <ul className="space-y-md">
                        {followUpQuestions.map((action, j) => (
                          <li
                            key={j}
                            className="grid grid-cols-[2.25ch_minmax(0,1fr)] items-start gap-md rounded-[0.85rem] border border-(--color-text)/10 bg-white/90 p-md min-w-0"
                          >
                            <span className="text-primary/70 font-heading font-bold leading-none mt-1">
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
            </div>
          </div>
        </div>
      </section>

      {/* Bonus tips */}
      {article.bonusTips?.length > 0 && (
        <section className="section-padding border-t border-(--color-text)/10">
          <div className="container">
            <div>
              <p className="text-label text-primary mb-md">Follow-On Focus</p>
              <h2 className="mb-xl">Keep the Momentum <span className="text-primary">Moving</span></h2>

              <div className="grid gap-xl lg:grid-cols-2 lg:gap-2xl">
                {article.bonusTips.map((tip, i) => (
                  <article key={i} className="pt-xl border-t border-(--color-text)/10">
                    <div className="min-w-0">
                      <h5 className="mb-md">{tip.title}</h5>
                      <p className="resource-body">{tip.content}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Conclusion */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div>
            <p className="text-label text-primary mb-md">The Bottom Line</p>
            <h2 className="mb-lg">Bringing It All <span className="text-primary">Together</span></h2>
            <p className="resource-lead mb-xl">{article.conclusion}</p>
            {article.disclaimer && <p className="resource-fine italic">{article.disclaimer}</p>}
          </div>
        </div>
      </section>

      <SharedCTA />
    </>
  );
}
