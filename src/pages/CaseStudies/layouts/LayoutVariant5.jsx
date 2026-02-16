/**
 * Layout Variant 5: Wide layout with side-by-side sections (Coats4Kids)
 */

import SharedHero from "./SharedHero";
import HighlightsBar from "./HighlightsBar";
import QuoteBanner from "./QuoteBanner";

export default function LayoutVariant5({ caseStudy }) {
  return (
    <>
      <SharedHero caseStudy={caseStudy} />
      <HighlightsBar highlights={caseStudy.highlights} />

      {/* Intro + Feature Image — full width two-column */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div>
              <h3 className="text-quaternary mb-lg">{caseStudy.introHeading}</h3>
              <p className="text-lg md:text-xl text-muted leading-relaxed">{caseStudy.intro}</p>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden">
                <img
                  src={caseStudy.featureImage}
                  alt={`${caseStudy.client}`}
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

      <QuoteBanner caseStudy={caseStudy} />

      {/* Content Sections — 2x2 card grid */}
      <section
        className="section-padding-lg"
        style={{ backgroundColor: "rgba(42, 157, 99, 0.03)" }}
      >
        <div className="container">
          <p className="text-label text-quaternary text-center mb-md">The Journey</p>
          <h2 className="text-center mb-2xl">
            From challenge to <span className="text-quaternary">impact</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-lg">
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
