/**
 * ERP Experts Case Studies Page
 * Filterable list of case studies with green theme
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Lightbulb,
  Sun,
  BarChart3,
  Wrench,
  TrendingUp,
  Clock,
  Target,
  MessageSquareQuote,
} from "lucide-react";
import AnimatedStats from "../../components/ui/AnimatedStats";
import SEO from "../../components/ui/SEO";
import TrackedLink from "../../components/ui/TrackedLink";
import { trackCTAClick } from "../../components/Analytics";

// Case Studies Data
const caseStudies = [
  {
    id: 1,
    client: "Carallon",
    industry: "Technology",
    icon: Lightbulb,
    headline: "Entertainment technology leader",
    description:
      "Working at the cutting edge of entertainment technology with streamlined operations.",
  },
  {
    id: 2,
    client: "eco2solar",
    industry: "Renewable Energy",
    icon: Sun,
    headline: "Sustainable growth enabled",
    description: "Supporting the renewable energy sector with efficient business processes.",
  },
  {
    id: 3,
    client: "Kynetec",
    industry: "Market Research",
    icon: BarChart3,
    headline: "System replaced in 6 months",
    description:
      "Replaced a failing system in half the time of the original project, on schedule and within budget.",
  },
  {
    id: 4,
    client: "Totalkare",
    industry: "Manufacturing",
    icon: Wrench,
    headline: "Reliable, scalable system",
    description:
      "A NetSuite solution that improved every aspect of operations and supports continued growth.",
  },
];

// Get unique industries for filter
const industries = ["All", ...new Set(caseStudies.map((cs) => cs.industry))];

// Testimonials
const testimonials = [
  {
    quote:
      "Most consultants vanish after go-live. ERP Experts are still here three years later. That tells you everything you need to know.",
    name: "David Hall",
    role: "CEO",
    company: "Totalkare",
  },
  {
    quote:
      "Our NetSuite system wasn't working, so we brought in ERP Experts. They quickly gave us clear choices and explained the time and cost for each. With their help, we replaced the system in just six months - half the time of the original project - by using teams in different time zones for continuous progress. The project finished on schedule and within budget, and we now have a stable system with reliable ongoing support.",
    name: "Tom Mayho",
    role: "CFO",
    company: "Kynetec",
  },
  {
    quote:
      "ERP Experts didn't just fix our system. They gave us the tools to scale and make an even bigger impact. If you are using NetSuite without them, you are missing out.",
    name: "Peter Borner",
    role: "CEO",
    company: "Coats4Kids",
  },
];

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
      ? caseStudies
      : caseStudies.filter((cs) => cs.industry === selectedIndustry);

  return (
    <main id="main-content">
      <SEO
        title="Case Studies"
        description="Real results from real businesses. See how we've helped UK companies transform their operations with NetSuite. 50+ implementations, 100% success rate."
        path="/case-studies"
        keywords="NetSuite case studies, ERP success stories, NetSuite implementation examples"
      />

      {/* Hero */}
      <section className="min-h-[50vh] md:min-h-[60vh] flex items-center relative overflow-hidden pt-(--space-4xl)">
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
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.5 }}
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-4xl">
            <p className="text-label text-quaternary" style={{ marginBottom: "var(--space-md)" }}>
              Case Studies
            </p>
            <h1 className="text-hero" style={{ marginBottom: "var(--space-xl)" }}>
              Your industry. Your challenges.
              <br />
              <span className="text-quaternary">Our results.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted max-w-2xl leading-relaxed">
              We've delivered NetSuite across dozens of industries. Whatever your sector, we
              probably know it already.
            </p>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div style={{ height: "var(--space-3xl)" }} />

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
                className="group card border-2 border-(--color-text)/10 hover:border-(--color-quaternary) hover:shadow-xl hover:-translate-y-1 transition-all"
                style={{ padding: "var(--space-xl)" }}
              >
                {/* Header */}
                <div
                  className="flex items-start gap-lg"
                  style={{ marginBottom: "var(--space-lg)" }}
                >
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(42, 157, 99, 0.1)" }}
                  >
                    <study.icon className="w-6 h-6 md:w-7 md:h-7 text-quaternary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5
                      className="group-hover:text-quaternary transition-colors"
                      style={{ marginBottom: "var(--space-xs)" }}
                    >
                      {study.client}
                    </h5>
                    <span className="text-sm font-medium text-quaternary">{study.industry}</span>
                  </div>
                </div>

                {/* Result */}
                <p
                  className="font-heading text-xl md:text-2xl text-quaternary"
                  style={{ marginBottom: "var(--space-md)" }}
                >
                  {study.headline}
                </p>

                {/* Description */}
                <p className="text-base text-muted" style={{ marginBottom: "var(--space-xl)" }}>
                  {study.description}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-sm text-quaternary font-bold">
                  <span>Read case study</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
        {/* Decorative triangle */}
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
          <div className="grid md:grid-cols-3 gap-lg">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="card border-2 border-(--color-text)/10 p-xl">
                <MessageSquareQuote className="w-8 h-8 text-quaternary mb-lg" />
                <p className="text-base text-muted mb-xl leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-muted">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
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
              className="btn btn-lg justify-center text-white hover:scale-105 transition-transform"
              style={{ backgroundColor: "var(--color-quaternary)" }}
            >
              Start a project
              <ArrowRight className="w-5 h-5" />
            </TrackedLink>
            <a
              href="https://one-score-to-rule-them-all.scoreapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lg border-2 w-full sm:w-auto justify-center"
              style={{ borderColor: "var(--color-quaternary)", color: "var(--color-quaternary)" }}
              onClick={() => trackCTAClick("case_studies_netscore_cta", "case_studies")}
            >
              Get your free NETscore
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
