/**
 * Layout Variant 4: Alternating
 * Tips alternate between left-aligned and right-aligned rows.
 * Best for: Guides with 4–6 tips, visual/process-heavy content.
 */

import { CheckCircle } from "lucide-react";
import SharedHero from "./SharedHero";
import SharedCTA from "./SharedCTA";
import SharedGuideBar from "./SharedGuideBar";
import SharedBonusTips from "./SharedBonusTips";
import SharedFeatureIcon from "./SharedFeatureIcon";

export default function LayoutAlternating({ article, slug }) {
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

      {/* Intro + Key Takeaways */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_420px] gap-2xl items-start">
            <div>
              <p className="text-label text-primary mb-md">Overview</p>
              <h2 className="mb-lg" dangerouslySetInnerHTML={{ __html: article.overviewHeading }} />
              <p className="resource-lead mb-lg">{article.intro}</p>
              <p className="resource-body">{article.overviewSubtext}</p>
            </div>
            <div className="rounded-2xl p-xl border border-primary/15 bg-primary/5">
              <p className="text-label text-primary mb-lg">Priorities This Week</p>
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
        </div>
      </section>

      {/* Tips — Alternating Rows */}
      <section className="border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center" style={{ padding: "var(--space-2xl) 0" }}>
            <p className="text-label text-primary mb-md">The Essentials</p>
            <h2 dangerouslySetInnerHTML={{ __html: article.tipsHeading }} />
          </div>
        </div>

        {article.tips.map((tip, i) => {
          const isEven = i % 2 === 0;

          const mediaBlock = (
            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-lg md:p-xl">
              <div className="flex items-center gap-md mb-md">
                <span className="text-4xl md:text-5xl font-heading font-bold text-primary/25">
                  {tip.number}
                </span>
                <SharedFeatureIcon icon={tip.icon} size="lg" />
              </div>
              <h3 className="text-xl md:text-2xl">{tip.title}</h3>
            </div>
          );

          const contentBlock = (
            <div className="rounded-2xl border border-(--color-text)/10 bg-white p-lg md:p-xl shadow-[0_10px_28px_rgba(26,26,26,0.04)]">
              <p className="resource-body mb-xl">{tip.content}</p>
              <div className="bg-(--color-text)/[0.02] rounded-xl p-lg border border-(--color-text)/10">
                <p className="text-base font-bold text-primary mb-md">At a Glance</p>
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
            </div>
          );

          return (
            <div
              key={i}
              className="border-t border-(--color-text)/5"
              style={isEven ? {} : { backgroundColor: "rgba(230, 48, 125, 0.02)" }}
            >
              <div className="container">
                <div
                  className="grid lg:grid-cols-2 gap-xl md:gap-2xl items-start"
                  style={{ padding: "var(--space-2xl) 0" }}
                >
                  {isEven ? (
                    <>
                      {mediaBlock}
                      {contentBlock}
                    </>
                  ) : (
                    <>
                      {contentBlock}
                      {mediaBlock}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Conclusion */}
      <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(230, 48, 125, 0.06) 0%, rgba(230, 48, 125, 0.01) 65%, transparent 100%)",
          }}
        />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-2xl items-start">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-xl">
              <p className="text-label text-primary mb-md">Why This Layout Works</p>
              <p className="resource-body">
                Alternating the framing and action detail keeps long guides scannable without losing
                depth. Teams can move through each tip in order and still pick out practical next
                actions quickly.
              </p>
            </div>
            <div className="rounded-2xl border border-(--color-text)/10 bg-white p-xl md:p-2xl shadow-[0_12px_32px_rgba(26,26,26,0.05)]">
              <p className="text-label text-primary mb-md">The Bottom Line</p>
              <h3 className="mb-lg">
                Bringing It All <span className="text-primary">Together</span>
              </h3>
              <p className="resource-lead mb-lg">{article.conclusion}</p>
              {article.disclaimer && <p className="resource-fine italic">{article.disclaimer}</p>}
            </div>
          </div>
        </div>
      </section>

      <SharedBonusTips article={article} />

      <SharedCTA />
    </>
  );
}
