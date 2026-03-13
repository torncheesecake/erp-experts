/**
 * Layout Variant 5: Cards
 * Tips rendered as a 2-column card grid. Compact, scannable layout.
 * Best for: Quick-reference articles, listicles, many short tips.
 */

import { CheckCircle } from "lucide-react";
import SharedHero from "./SharedHero";
import SharedCTA from "./SharedCTA";
import SharedGuideBar from "./SharedGuideBar";
import SharedBonusTips from "./SharedBonusTips";
import SharedFeatureIcon from "./SharedFeatureIcon";

export default function LayoutCards({ article, slug }) {
  return (
    <>
      <SharedHero article={article} slug={slug} />

      <SharedGuideBar
        tipsCount={article.tips.length}
        tipsLabel="Key Tips"
        bonusCount={article.bonusTips.length}
        bonusLabel="Bonus Strategies"
        readTime={article.readTime}
      />

      {/* Overview */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-xl lg:gap-2xl items-start">
            <div className="rounded-2xl p-lg md:p-xl border border-(--color-text)/10 bg-white shadow-[0_10px_30px_rgba(26,26,26,0.04)]">
              <p className="text-label text-primary mb-md">Overview</p>
              <h2 className="mb-lg" dangerouslySetInnerHTML={{ __html: article.overviewHeading }} />
              <p className="resource-lead mb-lg">
                <span
                  className="float-left font-heading font-bold mr-lg mt-[0.05em]"
                  style={{
                    fontSize: "4.5rem",
                    color: "var(--color-primary)",
                    lineHeight: 0.8,
                    paddingRight: "0.05em",
                  }}
                >
                  {article.intro.charAt(0)}
                </span>
                {article.intro.slice(1)}
              </p>
              <p className="resource-body">{article.overviewSubtext}</p>
            </div>

            <div className="rounded-2xl p-lg md:p-xl border border-primary/15 bg-primary/5">
              <p className="text-label text-primary mb-lg">Quick Wins</p>
              <ul className="flex flex-col gap-md">
                {article.takeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-sm">
                    <SharedFeatureIcon icon={CheckCircle} size="sm" className="shrink-0 mt-0.5" />
                    <span className="resource-body">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Challenge callout */}
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
        </div>
      </section>

      {/* Tips */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="mb-2xl">
            <p className="text-label text-primary mb-md">The Essentials</p>
            <h2 dangerouslySetInnerHTML={{ __html: article.tipsHeading }} />
          </div>

          <div className="grid lg:grid-cols-2 gap-lg">
            {article.tips.map((tip, i) => (
              <article
                key={i}
                className="rounded-2xl p-lg md:p-xl border border-(--color-text)/10 bg-white shadow-[0_10px_30px_rgba(26,26,26,0.04)]"
              >
                <div className="flex items-center gap-md mb-md">
                  <span className="text-3xl font-heading font-bold text-primary/25">{tip.number}</span>
                  <SharedFeatureIcon icon={tip.icon} size="lg" />
                </div>
                <div className="mb-lg">
                  <h4 className="mb-md">{tip.title}</h4>
                  <p className="resource-body">{tip.content}</p>
                </div>
                <div className="rounded-xl p-md border border-(--color-text)/10 bg-(--color-text)/[0.02]">
                  <p className="text-sm font-bold text-primary mb-md uppercase tracking-[0.08em]">
                    Action Items
                  </p>
                  <ul className="flex flex-col gap-md">
                    {tip.actions.map((action, j) => (
                      <li key={j} className="flex items-start gap-sm">
                        <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-heading font-bold text-sm flex items-center justify-center">
                          {j + 1}
                        </span>
                        <span className="resource-body">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SharedBonusTips article={article} label="Bonus Strategies" title="Apply These Insights" accent="This Quarter" />

      {/* Conclusion */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="max-w-5xl mx-auto rounded-3xl border border-(--color-text)/10 p-xl md:p-2xl bg-white shadow-[0_12px_32px_rgba(26,26,26,0.05)]">
            <p className="text-label text-primary mb-md">The Bottom Line</p>
            <h3 className="mb-lg">
              Bringing It All <span className="text-primary">Together</span>
            </h3>
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
