/**
 * Layout Variant 3: Timeline + alternating sections (Kynetec)
 */

import { MessageSquareQuote } from "lucide-react";
import SharedHero from "./SharedHero";
import HighlightsBar from "./HighlightsBar";

export default function LayoutVariant3({ caseStudy }) {
  return (
    <>
      <SharedHero caseStudy={caseStudy} />
      <HighlightsBar highlights={caseStudy.highlights} />

      {/* Timeline Section */}
      {caseStudy.timeline && (
        <section
          className="relative overflow-hidden"
          style={{ padding: "var(--space-3xl) 0", backgroundColor: "rgba(42, 157, 99, 0.05)" }}
        >
          <div className="container">
            <p className="text-label text-quaternary text-center mb-md">Project Timeline</p>
            <h3 className="text-center mb-2xl">
              The <span className="text-quaternary">8/3 Method</span> in action
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
              {caseStudy.timeline.map((item, i) => (
                <div key={i} className="relative">
                  <div className="bg-white rounded-2xl p-lg border border-(--color-text)/10">
                    <div className="flex items-center gap-md mb-md">
                      <div
                        className="flex items-end justify-center text-white font-heading text-sm font-bold shrink-0"
                        style={{
                          width: "36px",
                          height: "31px",
                          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                          backgroundColor: "var(--color-quaternary)",
                          paddingBottom: "3px",
                        }}
                      >
                        {i + 1}
                      </div>
                      <span className="font-bold text-quaternary">{item.phase}</span>
                    </div>
                    <p className="font-heading text-2xl mb-sm">{item.duration}</p>
                    <p className="text-sm text-muted">{item.description}</p>
                  </div>
                  {i < caseStudy.timeline.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-(--color-quaternary)/30" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Intro + Quote */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-start">
            <div>
              <h3 className="text-quaternary mb-lg">{caseStudy.introHeading}</h3>
              <p className="text-lg md:text-xl text-muted leading-relaxed">{caseStudy.intro}</p>
            </div>
            <div
              className="p-xl md:p-2xl rounded-2xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, var(--color-quaternary) 0%, #1a5c3a 100%)",
              }}
            >
              <div
                className="absolute top-0 right-0 opacity-20"
                style={{
                  width: "150px",
                  height: "129px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "white",
                  transform: "translateX(30px) translateY(-30px)",
                }}
              />
              <MessageSquareQuote className="w-10 h-10 text-white/40 mb-lg" />
              <blockquote className="font-heading text-xl md:text-2xl leading-snug text-white mb-lg">
                "{caseStudy.quote}"
              </blockquote>
              {caseStudy.quoteAuthor && (
                <p className="text-white/70">
                  — {caseStudy.quoteAuthor}, {caseStudy.quoteRole?.split(", ")[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <p className="text-label text-quaternary text-center mb-md">The Rescue</p>
          <h2 className="text-center mb-2xl">
            How we <span className="text-quaternary">delivered</span>
          </h2>
          <div className="grid lg:grid-cols-2 gap-2xl items-start">
            <div>
              <div className="flex flex-col" style={{ gap: "var(--space-2xl)" }}>
                {caseStudy.sections.map((section, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-md mb-lg">
                      <div
                        className="flex items-end justify-center text-white font-heading text-lg font-bold"
                        style={{
                          width: "48px",
                          height: "42px",
                          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                          backgroundColor: "var(--color-quaternary)",
                          paddingBottom: "4px",
                        }}
                      >
                        {i + 1}
                      </div>
                      <h4 className="text-quaternary">{section.title}</h4>
                    </div>
                    <p className="text-muted leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden sticky top-32">
                <img
                  src={caseStudy.featureImage}
                  alt={`${caseStudy.client} project`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div
                className="absolute -bottom-6 -right-6"
                style={{
                  width: "120px",
                  height: "103px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "var(--color-quaternary)",
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
