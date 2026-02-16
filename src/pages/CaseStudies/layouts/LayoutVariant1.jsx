/**
 * Layout Variant 1: Numbered sections (Carallon)
 */

import { MessageSquareQuote } from "lucide-react";
import SharedHero from "./SharedHero";
import HighlightsBar from "./HighlightsBar";

export default function LayoutVariant1({ caseStudy }) {
  return (
    <>
      <SharedHero caseStudy={caseStudy} />
      <HighlightsBar highlights={caseStudy.highlights} />

      {/* Intro + Quote */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div>
              <h3 className="text-quaternary mb-lg">{caseStudy.introHeading}</h3>
              <p className="text-lg md:text-xl text-muted leading-relaxed mb-xl">
                {caseStudy.intro}
              </p>
              <div
                className="p-xl rounded-2xl"
                style={{ backgroundColor: "rgba(42, 157, 99, 0.05)" }}
              >
                <MessageSquareQuote className="w-10 h-10 text-quaternary mb-lg" />
                <blockquote className="font-heading text-xl md:text-2xl leading-snug text-quaternary mb-lg">
                  "{caseStudy.quote}"
                </blockquote>
                {caseStudy.quoteAuthor && (
                  <p className="text-sm text-muted font-bold">— {caseStudy.quoteAuthor}</p>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden">
                <img
                  src={caseStudy.featureImage}
                  alt={`${caseStudy.client} project`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div
                className="absolute -bottom-6 -right-6 hidden md:block"
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

      {/* Content Sections */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <p className="text-label text-quaternary text-center mb-md">The Implementation</p>
          <h2 className="text-center mb-2xl">
            How we <span className="text-quaternary">delivered</span>
          </h2>
          <div className="flex flex-col" style={{ gap: "var(--space-4xl)" }}>
            {caseStudy.sections.map((section, i) => (
              <div key={i} className="grid md:grid-cols-[150px_1fr] gap-xl md:gap-2xl items-start">
                <div>
                  <span className="text-quaternary font-heading text-5xl md:text-6xl opacity-20">
                    0{i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-quaternary mb-lg">{section.title}</h3>
                  <p className="text-lg md:text-xl text-muted leading-relaxed">{section.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
