/**
 * Layout Variant 7: Timeline
 * Vertical timeline/process style with connecting line.
 * Best for: Step-by-step guides, implementation processes, how-tos.
 */

import { CheckCircle } from "lucide-react";
import SharedHero from "./SharedHero";
import SharedCTA from "./SharedCTA";
import SharedGuideBar from "./SharedGuideBar";
import SharedBonusTips from "./SharedBonusTips";
import SharedFeatureIcon from "./SharedFeatureIcon";

export default function LayoutTimeline({ article, slug }) {
  return (
    <>
      <SharedHero article={article} slug={slug} />

      <SharedGuideBar
        tipsCount={article.tips.length}
        tipsLabel="Key Steps"
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
              <p className="text-label text-primary mb-lg">Execution Priorities</p>
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

      {/* Tips as Timeline */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">Step by Step</p>
            <h2 dangerouslySetInnerHTML={{ __html: article.tipsHeading }} />
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div
              className="absolute top-0 bottom-0"
              style={{
                left: "25px",
                width: "2px",
                backgroundColor: "var(--color-primary)",
                opacity: 0.2,
              }}
            />

            <div className="flex flex-col gap-xl md:gap-2xl">
              {article.tips.map((tip, i) => (
                <article key={i} className="relative pl-[62px] md:pl-[88px]">
                  <div
                    className="absolute left-0 top-0 w-[52px] h-[52px] rounded-full border-4 border-white shadow-[0_8px_18px_rgba(26,26,26,0.15)] flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    <span className="text-white font-heading font-bold text-sm">{tip.number}</span>
                  </div>

                  <div className="rounded-2xl border border-(--color-text)/10 bg-white p-lg md:p-xl shadow-[0_10px_28px_rgba(26,26,26,0.04)]">
                    <div className="flex items-center gap-md mb-md">
                      <SharedFeatureIcon icon={tip.icon} size="lg" />
                      <h4>{tip.title}</h4>
                    </div>

                    <p className="resource-body mb-lg">{tip.content}</p>

                    <div className="rounded-xl p-md border border-(--color-text)/10 bg-(--color-text)/[0.02]">
                      <p className="text-sm font-bold text-primary mb-md uppercase tracking-[0.08em]">
                        At a Glance
                      </p>
                      <ul className="grid md:grid-cols-2 gap-sm md:gap-md">
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
                </article>
              ))}

              <div className="relative pl-[62px] md:pl-[88px]">
                <div
                  className="absolute left-0 top-0 w-[52px] h-[52px] rounded-full border-4 border-white shadow-[0_8px_18px_rgba(26,26,26,0.15)] flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-lg md:p-xl">
                  <p className="font-heading font-bold text-primary text-xl">All key steps complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="section-padding-lg relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-dark)" }}>
        <div
          className="absolute right-0 top-0 opacity-10 hidden lg:block"
          style={{
            width: "500px",
            height: "430px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(30%) translateY(-20%)",
          }}
        />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-sm p-xl md:p-2xl text-center">
            <p className="text-label text-primary mb-md">The Bottom Line</p>
            <h3 className="text-(--color-text-on-dark) mb-lg">
              Bringing It All <span className="text-primary">Together</span>
            </h3>
            <p className="resource-lead text-(--color-text-on-dark)/75 mb-lg">
              {article.conclusion}
            </p>
            {article.disclaimer && (
              <p className="resource-fine text-(--color-text-on-dark)/45 italic">{article.disclaimer}</p>
            )}
          </div>
        </div>
      </section>

      <SharedBonusTips article={article} />

      <SharedCTA />
    </>
  );
}
