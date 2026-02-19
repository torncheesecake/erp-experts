/**
 * ERP Experts Case Studies Listing Page
 * Data imported from src/data/caseStudies.js — single source of truth.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageSquareQuote } from "lucide-react";
import AnimatedStats from "../../components/ui/AnimatedStats";
import SEO from "../../components/ui/SEO";
import TrackedLink from "../../components/ui/TrackedLink";
import { caseStudiesList, testimonials, caseStudiesHeroImage } from "../../data/caseStudies";

// Get unique industries for filter
const industries = ["All", ...new Set(caseStudiesList.map((cs) => cs.industry))];

// Stats for credibility
const stats = [
  { value: "20+", label: "Years specialising in NetSuite" },
  { value: "350+", label: "Projects completed" },
  { value: "33,000+", label: "Support tickets handled" },
];

export default function CaseStudies() {
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  const filteredStudies =
    selectedIndustry === "All"
      ? caseStudiesList
      : caseStudiesList.filter((cs) => cs.industry === selectedIndustry);

  return (
    <main id="main-content">
      <SEO
        title="Case Studies"
        description="Real results from real businesses. See how we've helped UK companies transform their operations with NetSuite. 50+ implementations, 100% success rate."
        path="/case-studies"
        keywords="NetSuite case studies, ERP success stories, NetSuite implementation examples"
      />

      {/* Hero */}
      <section
        className="flex items-center relative overflow-hidden"
        style={{ paddingTop: "140px", paddingBottom: "var(--space-2xl)", minHeight: "50vh" }}
      >
        {/* Mobile background triangle */}
        <div
          className="absolute lg:hidden"
          style={{
            top: "5%",
            right: "-10%",
            width: "320px",
            height: "280px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-quaternary)",
            opacity: 0.1,
          }}
        />
        {/* Offset green triangle */}
        <div
          className="absolute top-1/2 hidden lg:block"
          style={{
            left: "75%",
            transform: "translateX(calc(-50% + 80px)) translateY(calc(-50% + 30px))",
            width: "900px",
            height: "772px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-quaternary)",
            opacity: 0.2,
          }}
        />
        {/* Main triangle with image */}
        <div
          className="absolute top-1/2 hidden lg:block"
          style={{
            left: "75%",
            transform: "translateX(-50%) translateY(-50%)",
            width: "920px",
            height: "789px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            overflow: "hidden",
          }}
        >
          <img
            src={caseStudiesHeroImage}
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.5 }}
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl lg:max-w-5xl">
            <p className="text-label text-quaternary mb-md hidden md:block">Case Studies</p>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl leading-[1.1] font-bold lg:!text-[7rem] xl:!text-[9rem]"
              style={{ marginBottom: "var(--space-lg)" }}
            >
              Real Results, <span className="text-quaternary">Proven.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted max-w-2xl m-0">
              See how we've helped businesses like yours succeed with NetSuite.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section
        className="section-padding-lg relative overflow-hidden"
        style={{ backgroundColor: "rgba(42, 157, 99, 0.05)" }}
      >
        {/* Decorative triangles */}
        <div
          className="absolute top-1/2 left-0 opacity-10 hidden lg:block pointer-events-none"
          style={{
            width: "300px",
            height: "257px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-quaternary)",
            transform: "translateX(-50%) translateY(-50%)",
          }}
        />
        <div
          className="absolute top-1/2 right-0 opacity-10 hidden lg:block pointer-events-none"
          style={{
            width: "250px",
            height: "214px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-quaternary)",
            transform: "translateX(50%) translateY(-30%)",
          }}
        />
        <div className="container relative z-10">
          <p className="text-label text-quaternary text-center mb-xl">Our Track Record</p>
          <AnimatedStats stats={stats} color="quaternary" columns={3} />
        </div>
      </section>

      {/* Filter Bar */}
      <section
        className="border-b border-(--color-text)/10 sticky top-16 md:top-20 bg-white z-40"
        style={{ padding: "var(--space-xl) 0" }}
      >
        <div className="container">
          <div className="flex items-center gap-sm md:gap-md flex-wrap">
            <span className="text-sm font-medium text-muted shrink-0 mr-sm">Filter:</span>
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                aria-pressed={selectedIndustry === industry}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  selectedIndustry === industry
                    ? "bg-(--color-quaternary) text-white"
                    : "bg-(--color-text)/5 hover:bg-(--color-text)/10"
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section style={{ padding: "var(--space-3xl) 0" }}>
        <div className="container">
          <div className="grid md:grid-cols-2 gap-lg md:gap-xl">
            {filteredStudies.map((study) => (
              <Link
                key={study.id}
                to={`/case-studies/${study.id}`}
                className="group block overflow-hidden rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 hover:border-(--color-quaternary) hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                {/* Image */}
                <div className="aspect-[16/9] relative overflow-hidden">
                  {study.image ? (
                    <img
                      src={study.image}
                      alt={study.client}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500 flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--color-quaternary) 0%, #1a5c3a 100%)",
                      }}
                    >
                      {study.icon && <study.icon className="w-16 h-16 text-white/30" />}
                    </div>
                  )}
                  {/* Logo overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    {study.logo ? (
                      <img
                        src={study.logo}
                        alt={`${study.client} logo`}
                        className={`h-8 md:h-10 w-auto object-contain ${study.logoLight ? "" : "brightness-0 invert"}`}
                      />
                    ) : (
                      <span className="text-lg font-heading font-bold text-white">
                        {study.client}
                      </span>
                    )}
                    <span className="text-xs font-bold text-white/80 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      {study.industry}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "var(--space-xl)" }}>
                  <p
                    className="font-heading text-xl md:text-2xl text-quaternary"
                    style={{ marginBottom: "var(--space-md)" }}
                  >
                    {study.headline}
                  </p>
                  <p className="text-base text-muted" style={{ marginBottom: "var(--space-xl)" }}>
                    {study.description}
                  </p>
                  <div className="flex items-center gap-sm text-quaternary font-bold">
                    <span>Read case study</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredStudies.length === 0 && (
            <div className="text-center py-2xl">
              <p className="text-lg text-muted">No case studies found for this industry.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
        <div
          className="absolute bottom-0 left-0 opacity-[0.05] hidden lg:block pointer-events-none"
          style={{
            width: "400px",
            height: "343px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-quaternary)",
            transform: "translateX(-30%) translateY(40%)",
          }}
        />
        <div className="container relative z-10">
          <div className="text-center mb-2xl">
            <p className="text-label text-quaternary mb-md">What our clients say</p>
            <h3>
              Real feedback from <span className="text-quaternary">real businesses</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {testimonials.map((testimonial, i) =>
              i === 0 ? (
                <div
                  key={i}
                  className="rounded-2xl md:rounded-3xl p-lg md:p-xl relative overflow-hidden"
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
                  <div className="relative z-10">
                    <MessageSquareQuote className="w-8 h-8 text-white/40 mb-lg" />
                    <p className="text-base text-white font-heading leading-snug mb-xl">
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <p className="font-bold text-white">{testimonial.name}</p>
                      <p className="text-sm text-white/70">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={i} className="card border-2 border-(--color-text)/10 p-lg md:p-xl">
                  <MessageSquareQuote className="w-8 h-8 text-quaternary mb-lg" />
                  <p className="text-base text-muted mb-xl leading-snug">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-muted">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="border-t border-(--color-text)/10"
        style={{ padding: "var(--space-3xl) 0 var(--space-4xl)" }}
      >
        <div className="container text-center">
          <h2 style={{ marginBottom: "var(--space-lg)" }}>
            Be our next <span className="text-quaternary">success story</span>.
          </h2>
          <p
            className="text-lg text-muted max-w-2xl mx-auto"
            style={{ marginBottom: "var(--space-xl)" }}
          >
            Ready to transform your business? Let's discuss how we can help you achieve similar
            results.
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            <TrackedLink
              to="/contact"
              trackingName="case_studies_footer_start_project"
              trackingPage="case_studies"
              className="btn sm:btn-lg justify-center text-white hover:scale-105 transition-transform"
              style={{ backgroundColor: "var(--color-quaternary)" }}
            >
              Start a conversation
              <ArrowRight className="w-5 h-5" />
            </TrackedLink>
          </div>
        </div>
      </section>
    </main>
  );
}
