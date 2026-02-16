/**
 * Layout Variant 4: Video + quote banner + checkmarks (Totalkare)
 */

import { Check } from "lucide-react";
import SharedHero from "./SharedHero";
import HighlightsBar from "./HighlightsBar";
import QuoteBanner from "./QuoteBanner";

export default function LayoutVariant4({ caseStudy }) {
  return (
    <>
      <SharedHero caseStudy={caseStudy} />
      <HighlightsBar highlights={caseStudy.highlights} />

      {/* Video Section */}
      {caseStudy.videoUrl && (
        <section className="section-padding-lg border-b border-(--color-text)/10">
          <div className="container">
            <div className="text-center mb-2xl">
              <p className="text-label text-quaternary mb-md">Watch the story</p>
              <h3>
                Hear it from <span className="text-quaternary">{caseStudy.client}</span>
              </h3>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video rounded-2xl md:rounded-3xl overflow-hidden shadow-xl relative">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${caseStudy.videoUrl.split("/").pop().split("?")[0]}`}
                  title={`${caseStudy.client} case study video`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
          {/* Scroll indicator */}
          <div className="flex flex-col items-center mt-xl text-muted">
            <p className="text-sm font-bold mb-sm">Read the full story below</p>
            <div className="w-6 h-10 rounded-full border-2 border-(--color-quaternary)/40 flex items-start justify-center pt-1.5">
              <div
                className="w-1.5 h-3 rounded-full bg-(--color-quaternary)/60"
                style={{ animation: "scrollBounce 1.5s ease-in-out infinite" }}
              />
            </div>
          </div>
        </section>
      )}

      <QuoteBanner caseStudy={caseStudy} />

      {/* Intro */}
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
          </div>
        </div>
      </section>

      {/* Content Sections - 2x2 grid */}
      <section
        className="section-padding-lg"
        style={{ backgroundColor: "rgba(42, 157, 99, 0.03)" }}
      >
        <div className="container">
          <p className="text-label text-quaternary text-center mb-md">The Transformation</p>
          <h2 className="text-center mb-2xl">
            From problem to <span className="text-quaternary">partnership</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-lg">
            {caseStudy.sections.map((section, i) => (
              <div key={i} className="bg-white rounded-2xl p-xl border border-(--color-text)/10">
                <div className="flex gap-lg">
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(42, 157, 99, 0.1)",
                    }}
                  >
                    <Check className="w-6 h-6 text-quaternary" />
                  </div>
                  <div>
                    <h4 className="text-quaternary mb-md">{section.title}</h4>
                    <p className="text-muted leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
