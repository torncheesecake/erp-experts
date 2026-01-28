/**
 * Homepage Featured Case Study Section
 */

import { Link } from "react-router-dom";
import { ArrowRight, MessageSquareQuote, Factory } from "lucide-react";
import TrackedLink from "../../components/ui/TrackedLink";

export default function CaseStudyFeature() {
  return (
    <section className="section-padding border-t border-(--color-text)/10 relative overflow-hidden">
      {/* Background decorative triangle */}
      <div
        className="absolute -right-64 top-1/2 -translate-y-1/2 opacity-[0.03] hidden lg:block pointer-events-none"
        style={{
          width: "900px",
          height: "770px",
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          backgroundColor: "var(--color-quaternary)",
        }}
      />
      <div className="container relative z-10">
        {/* Header with link */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-md mb-xl md:mb-2xl">
          <div>
            <p className="text-label text-quaternary mb-md">Case Study</p>
            <h2>
              Real results for <span className="text-quaternary">real businesses</span>
            </h2>
          </div>
          <TrackedLink
            to="/case-studies"
            trackingName="case_study_see_all"
            trackingPage="homepage"
            className="group text-base font-bold inline-flex items-center gap-sm text-quaternary whitespace-nowrap"
          >
            See how we've helped businesses like yours
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </TrackedLink>
        </div>

        {/* Featured Case Study Card */}
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border-2 border-(--color-text)/10 hover:border-(--color-quaternary)/30 transition-colors">
          {/* Triangle Accents */}
          <div
            className="absolute -bottom-20 -right-20 opacity-[0.06] hidden md:block pointer-events-none"
            style={{
              width: "450px",
              height: "386px",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              backgroundColor: "var(--color-quaternary)",
            }}
          />
          <div
            className="absolute -top-16 -left-16 opacity-[0.04] hidden lg:block pointer-events-none"
            style={{
              width: "280px",
              height: "240px",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              backgroundColor: "var(--color-quaternary)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 p-lg md:p-xl lg:p-2xl">
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-xl lg:gap-2xl items-center">
              {/* Left: Story */}
              <div>
                <div className="inline-flex items-center gap-sm bg-(--color-quaternary)/10 px-4 py-2 rounded-full mb-lg">
                  <Factory className="w-4 h-4 text-quaternary" />
                  <span className="text-sm font-bold">Manufacturing</span>
                </div>
                <h3 className="mb-md md:mb-lg" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}>
                  From chaos to <span className="text-quaternary">clarity</span>
                </h3>
                <p className="text-base md:text-lg text-muted mb-lg md:mb-xl leading-relaxed">
                  Precision Manufacturing was drowning in disconnected systems and manual processes.
                  We implemented NetSuite to unify their operations and unlock real-time visibility
                  across the entire business.
                </p>

                {/* Testimonial Quote */}
                <div
                  className="flex items-start gap-md mb-lg md:mb-xl p-lg rounded-xl"
                  style={{ backgroundColor: "rgba(42, 157, 99, 0.05)" }}
                >
                  <MessageSquareQuote className="w-8 h-8 text-quaternary shrink-0 mt-1" />
                  <div>
                    <p className="text-base md:text-lg italic mb-sm">
                      "ERP Experts transformed our operations. We went live on time, on budget."
                    </p>
                    <p className="text-muted text-sm font-bold">
                      — Sarah Mitchell, Operations Director
                    </p>
                  </div>
                </div>

                <TrackedLink
                  to="/case-studies/1"
                  trackingName="case_study_read_full_story"
                  trackingPage="homepage"
                  className="inline-flex items-center gap-sm bg-(--color-quaternary) text-white py-3 px-6 md:py-4 md:px-8 text-base font-bold rounded-full hover:scale-105 hover:shadow-lg hover:shadow-quaternary/30 transition-all"
                >
                  Read the full story
                  <ArrowRight className="w-5 h-5" />
                </TrackedLink>
              </div>

              {/* Right: Stats */}
              <div className="grid grid-cols-2 gap-md md:gap-lg">
                {[
                  { value: "40%", label: "Faster order processing", highlight: false },
                  { value: "3x", label: "Inventory accuracy", highlight: true },
                  { value: "60%", label: "Less manual data entry", highlight: true },
                  { value: "12wk", label: "Implementation time", highlight: false },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="relative p-lg md:p-xl rounded-2xl overflow-hidden text-center border-2 transition-colors"
                    style={{
                      backgroundColor: stat.highlight
                        ? "rgba(42, 157, 99, 0.08)"
                        : "rgba(0,0,0,0.02)",
                      borderColor: stat.highlight ? "rgba(42, 157, 99, 0.2)" : "rgba(0,0,0,0.05)",
                    }}
                  >
                    <p
                      className={`font-heading text-3xl md:text-5xl leading-none mb-sm ${stat.highlight ? "text-quaternary" : ""}`}
                    >
                      {stat.value}
                    </p>
                    <p className="text-sm md:text-base text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
