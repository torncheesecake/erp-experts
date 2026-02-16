/**
 * Layout Variant 2: Highlights bar + card sections (eco2solar)
 */

import { MessageSquareQuote } from "lucide-react";
import SharedHero from "./SharedHero";
import HighlightsBar from "./HighlightsBar";

export default function LayoutVariant2({ caseStudy }) {
  return (
    <>
      <SharedHero caseStudy={caseStudy} />
      <HighlightsBar highlights={caseStudy.highlights} />

      {/* Intro + Feature Image */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-start">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden">
                <img
                  src={caseStudy.featureImage}
                  alt={`${caseStudy.client} project`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div
                className="absolute -top-4 -left-4 hidden md:block"
                style={{
                  width: "80px",
                  height: "69px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "var(--color-quaternary)",
                  opacity: 0.5,
                }}
              />
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-quaternary mb-lg">{caseStudy.introHeading}</h3>
              <p className="text-lg md:text-xl text-muted leading-relaxed mb-xl">
                {caseStudy.intro}
              </p>
              <div
                className="p-xl rounded-2xl border-l-4"
                style={{
                  backgroundColor: "rgba(42, 157, 99, 0.05)",
                  borderColor: "var(--color-quaternary)",
                }}
              >
                <MessageSquareQuote className="w-8 h-8 text-quaternary mb-lg" />
                <blockquote className="font-heading text-lg md:text-xl leading-snug text-quaternary mb-lg">
                  "{caseStudy.quote}"
                </blockquote>
                {caseStudy.quoteAuthor && (
                  <p className="text-sm text-muted font-bold">— {caseStudy.quoteAuthor}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections - Card style */}
      <section
        className="section-padding-lg"
        style={{ backgroundColor: "rgba(42, 157, 99, 0.03)" }}
      >
        <div className="container">
          <p className="text-label text-quaternary text-center mb-md">The Journey</p>
          <h2 className="text-center mb-2xl">
            How we <span className="text-quaternary">transformed</span> their business
          </h2>
          <div className="grid md:grid-cols-3 gap-lg">
            {caseStudy.sections.map((section, i) => (
              <div key={i} className="bg-white rounded-2xl p-xl border border-(--color-text)/10">
                <div
                  className="flex items-end justify-center text-white font-heading text-lg font-bold mb-lg"
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
                <h4 className="text-quaternary mb-md">{section.title}</h4>
                <p className="text-muted leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
