/**
 * ERP Experts Case Studies Page
 * Filterable list of case studies with green theme
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Factory,
  ShoppingBag,
  Truck,
  Building2,
  Code2,
  UtensilsCrossed,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

// Case Studies Data
const caseStudies = [
  {
    id: 1,
    client: "Precision Manufacturing Ltd",
    industry: "Manufacturing",
    icon: Factory,
    size: "£5m - £10m turnover",
    headline: "40% faster order processing",
    description:
      "From chaos to clarity with automated order workflows and real-time inventory tracking.",
  },
  {
    id: 2,
    client: "StyleForward Retail",
    industry: "Retail",
    icon: ShoppingBag,
    size: "£10m - £25m turnover",
    headline: "99.5% inventory accuracy",
    description: "Unified online and in-store operations for true omnichannel success.",
  },
  {
    id: 3,
    client: "Swift Distribution Co",
    industry: "Distribution",
    icon: Truck,
    size: "£25m+ turnover",
    headline: "£200k annual savings",
    description: "Transformed warehouse operations with mobile scanning and automated workflows.",
  },
  {
    id: 4,
    client: "BuildRight Construction",
    industry: "Construction",
    icon: Building2,
    size: "£10m - £25m turnover",
    headline: "Real-time project visibility",
    description: "Project profitability insights that transformed decision-making.",
  },
  {
    id: 5,
    client: "TechScale Software",
    industry: "Software",
    icon: Code2,
    size: "£2m - £5m turnover",
    headline: "70% faster month-end",
    description: "Automated revenue recognition and subscription billing at scale.",
  },
  {
    id: 6,
    client: "FreshMeals Co",
    industry: "Food & Beverage",
    icon: UtensilsCrossed,
    size: "£5m - £10m turnover",
    headline: "Full lot traceability",
    description: "Complete supply chain visibility from farm to fork.",
  },
];

// Get unique industries for filter
const industries = ["All", ...new Set(caseStudies.map((cs) => cs.industry))];

// Stats for credibility
const stats = [
  { value: "50+", label: "Implementations", icon: Target },
  { value: "100%", label: "Success rate", icon: TrendingUp },
  { value: "12wk", label: "Avg go-live", icon: Clock },
];

export default function CaseStudies() {
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  const filteredStudies =
    selectedIndustry === "All"
      ? caseStudies
      : caseStudies.filter((cs) => cs.industry === selectedIndustry);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="min-h-[50vh] md:min-h-[60vh] flex items-center relative overflow-hidden pt-(--space-4xl)">
        {/* Offset green triangle */}
        <div
          className="absolute top-1/2 hidden md:block"
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
          className="absolute top-1/2 hidden md:block"
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
              Real results.
              <br />
              <span className="text-quaternary">Real businesses.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted max-w-2xl leading-relaxed">
              See how we've helped businesses like yours transform their operations with NetSuite.
            </p>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-3xl" />

      {/* Stats Bar */}
      <section className="section-padding" style={{ backgroundColor: "rgba(42, 157, 99, 0.05)" }}>
        <div className="container">
          <p className="text-label text-quaternary text-center mb-xl">Our Track Record</p>
          <div className="grid grid-cols-3 gap-lg md:gap-xl">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p
                  className={`font-heading text-4xl md:text-stat leading-none mb-sm ${i === 1 ? "text-quaternary" : ""}`}
                >
                  {stat.value}
                </p>
                <p className="text-base text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section
        className="border-b border-(--color-text)/10 sticky top-16 md:top-20 bg-white z-40"
        style={{ padding: "var(--space-xl) 0" }}
      >
        <div className="container">
          <div className="flex items-center gap-sm md:gap-md overflow-x-auto pb-2 -mb-2">
            <span className="text-sm font-medium text-muted shrink-0 mr-sm">Filter:</span>
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
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
                    <div className="flex flex-wrap items-center gap-sm">
                      <span className="text-sm font-medium text-quaternary">{study.industry}</span>
                      <span className="text-sm text-muted">•</span>
                      <span className="text-sm text-muted">{study.size}</span>
                    </div>
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
            <Link
              to="/contact"
              className="btn btn-lg justify-center text-white hover:scale-105 transition-transform"
              style={{ backgroundColor: "var(--color-quaternary)" }}
            >
              Start a project
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://ric-snwikqbv.scoreapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lg border-2 w-full sm:w-auto justify-center"
              style={{ borderColor: "var(--color-quaternary)", color: "var(--color-quaternary)" }}
            >
              Get your free NETscore
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
