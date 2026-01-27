/**
 * ERP Experts Case Study Detail Page
 * Green themed to match Case Studies listing
 */

import { useParams, Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  MessageSquareQuote,
  Check,
  Factory,
  Clock,
  Users,
  Briefcase,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

// Case study data
const caseStudy = {
  id: 1,
  client: "Precision Manufacturing Ltd",
  logo: "https://placehold.co/200x80/1a1a1a/ffffff?text=PRECISION",
  industry: "Manufacturing",
  services: ["NetSuite Implementation", "Data Migration", "Training"],
  timeline: "12 weeks",
  teamSize: "4 consultants",
  title: "From chaos to clarity",
  subtitle:
    "How we helped a UK manufacturer cut order processing time by 40% with a fully integrated NetSuite solution.",
  heroImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80",
  challenge: {
    summary: "Legacy systems holding back growth",
    detail:
      "Precision Manufacturing had outgrown their legacy ERP. Orders took days to process through disconnected systems. Stock visibility was poor, leading to frequent stockouts and disappointed customers. The finance team spent weeks each month on manual reconciliation, and staff were fighting the system rather than doing their jobs.",
    painPoints: [
      "Orders taking 3+ days to process",
      "No real-time stock visibility",
      "Manual data entry across 4 separate systems",
      "Month-end close taking 2+ weeks",
    ],
  },
  solution: {
    summary: "A fully integrated NetSuite platform",
    detail:
      "We implemented NetSuite with automated order workflows, real-time inventory tracking, and custom dashboards for the leadership team. The implementation focused on their specific manufacturing processes, with bespoke workflows for bill of materials and production scheduling.",
    approach: [
      "Discovery workshops with all departments",
      "Process mapping and optimisation",
      "Phased data migration with validation",
      "Role-based training programme",
      "Go-live support with on-site consultants",
    ],
  },
  results: [
    {
      metric: "40%",
      label: "Faster processing",
      context: "From 3 days to same-day",
    },
    {
      metric: "3x",
      label: "Accuracy gain",
      context: "Real-time visibility",
    },
    {
      metric: "60%",
      label: "Less manual entry",
      context: "Automated workflows",
    },
    {
      metric: "3 days",
      label: "Month-end close",
      context: "Down from 2 weeks",
    },
  ],
  testimonial: {
    quote:
      "ERP Experts transformed our operations. We went live on time, on budget, and our team actually enjoys using NetSuite. Their training-first approach made all the difference.",
    name: "Sarah Mitchell",
    role: "Operations Director",
    company: "Precision Manufacturing Ltd",
  },
};

export default function CaseStudyDetail() {
  const { id } = useParams();

  if (parseInt(id) !== 1) {
    return (
      <div className="min-h-screen overflow-x-hidden">
        <Navbar />
        <section className="section-padding-lg">
          <div className="container text-center">
            <h2 className="mb-lg">Case study not found</h2>
            <Link to="/case-studies" className="btn btn-primary">
              Back to case studies
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

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
            src={caseStudy.heroImage}
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.5 }}
          />
        </div>
        <div className="container relative z-10">
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-sm text-base md:text-lg font-bold text-muted hover:text-quaternary transition-colors mb-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to case studies
          </Link>

          <div className="max-w-4xl">
            <p className="text-label text-quaternary mb-md">{caseStudy.industry}</p>
            <h1 className="text-hero mb-xl">{caseStudy.title}</h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-muted leading-relaxed max-w-3xl">
              {caseStudy.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Project Details Bar */}
      <section
        className="border-y border-(--color-text)/10"
        style={{ padding: "var(--space-2xl) 0", marginTop: "var(--space-xl)" }}
      >
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-xl md:gap-2xl">
            <div className="flex items-center gap-md">
              <div className="icon-box icon-box-md rounded-xl bg-(--color-quaternary)/10">
                <Factory className="w-6 h-6 md:w-7 md:h-7 text-quaternary" />
              </div>
              <div>
                <p className="text-base text-muted mb-xs">Client</p>
                <p className="text-lg md:text-xl font-bold">{caseStudy.client}</p>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <div className="icon-box icon-box-md rounded-xl bg-(--color-quaternary)/10">
                <Clock className="w-6 h-6 md:w-7 md:h-7 text-quaternary" />
              </div>
              <div>
                <p className="text-base text-muted mb-xs">Timeline</p>
                <p className="text-lg md:text-xl font-bold text-quaternary">{caseStudy.timeline}</p>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <div className="icon-box icon-box-md rounded-xl bg-(--color-quaternary)/10">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-quaternary" />
              </div>
              <div>
                <p className="text-base text-muted mb-xs">Team</p>
                <p className="text-lg md:text-xl font-bold">{caseStudy.teamSize}</p>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <div className="icon-box icon-box-md rounded-xl bg-(--color-quaternary)/10">
                <Briefcase className="w-6 h-6 md:w-7 md:h-7 text-quaternary" />
              </div>
              <div>
                <p className="text-base text-muted mb-xs">Services</p>
                <p className="text-lg md:text-xl font-bold text-quaternary">
                  {caseStudy.services.length} services
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="section-padding" style={{ backgroundColor: "rgba(42, 157, 99, 0.05)" }}>
        <div className="container">
          <p className="text-label text-quaternary text-center mb-xl">The Results</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg md:gap-xl">
            {caseStudy.results.map((result, i) => (
              <div key={i} className="text-center">
                <p
                  className={`font-heading text-4xl md:text-stat leading-none mb-sm ${i % 2 === 1 ? "text-quaternary" : ""}`}
                >
                  {result.metric}
                </p>
                <p className="text-base md:text-lg text-muted mb-xs">{result.label}</p>
                <p className="text-sm text-muted/70">{result.context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge */}
      <section className="section-padding">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-xl lg:gap-2xl items-start">
            <div>
              <p className="text-label text-quaternary mb-md">The Challenge</p>
              <h3 className="mb-lg">{caseStudy.challenge.summary}</h3>
              <p className="text-lg md:text-xl text-muted leading-relaxed">
                {caseStudy.challenge.detail}
              </p>
            </div>
            <div>
              <p className="text-base md:text-lg font-bold text-muted mb-lg">Pain points</p>
              <div className="flex flex-col gap-md">
                {caseStudy.challenge.painPoints.map((point, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-lg rounded-2xl border-2 border-(--color-text)/10 p-lg md:p-xl hover:border-(--color-quaternary)/30 transition-colors"
                  >
                    <span className="text-quaternary font-heading text-3xl md:text-4xl">
                      0{i + 1}
                    </span>
                    <p className="text-base md:text-lg font-medium">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-xl lg:gap-2xl items-start">
            <div>
              <p className="text-label text-quaternary mb-md">The Solution</p>
              <h3 className="mb-lg">{caseStudy.solution.summary}</h3>
              <p className="text-lg md:text-xl text-muted leading-relaxed">
                {caseStudy.solution.detail}
              </p>
            </div>
            <div>
              <p className="text-base md:text-lg font-bold text-muted mb-lg">Our approach</p>
              <div className="flex flex-col gap-md">
                {caseStudy.solution.approach.map((step, i) => (
                  <div key={i} className="flex items-center gap-lg">
                    <div
                      className="shrink-0 relative flex items-end justify-center"
                      style={{
                        width: "56px",
                        height: "48px",
                        clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                        backgroundColor: "var(--color-quaternary)",
                      }}
                    >
                      <Check className="w-5 h-5 md:w-6 md:h-6 text-white mb-2" />
                    </div>
                    <p className="text-base md:text-lg font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="section-padding" style={{ backgroundColor: "rgba(42, 157, 99, 0.03)" }}>
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <MessageSquareQuote className="w-14 h-14 md:w-16 md:h-16 text-quaternary mx-auto mb-lg" />
            <blockquote className="font-heading text-xl md:text-2xl lg:text-3xl leading-snug mb-xl">
              "{caseStudy.testimonial.quote}"
            </blockquote>
            <div className="flex items-center justify-center gap-md">
              <div
                className="shrink-0 relative flex items-end justify-center"
                style={{
                  width: "48px",
                  height: "42px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "var(--color-quaternary)",
                }}
              >
                <Factory className="w-5 h-5 text-white mb-1.5" />
              </div>
              <div className="text-left">
                <p className="text-base md:text-lg font-bold">{caseStudy.testimonial.name}</p>
                <p className="text-base text-muted">
                  {caseStudy.testimonial.role}, {caseStudy.testimonial.company}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container text-center">
          <h3 className="mb-md">
            Ready for <span className="text-quaternary">similar results</span>?
          </h3>
          <p className="text-lg text-muted mx-auto max-w-2xl mb-xl">
            Let's discuss how we can help transform your business with NetSuite.
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            <Link
              to="/contact"
              className="btn btn-lg w-full sm:w-auto justify-center text-white hover:scale-105 transition-transform"
              style={{ backgroundColor: "var(--color-quaternary)" }}
            >
              Start a conversation
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/case-studies"
              className="btn btn-lg border-2 w-full sm:w-auto justify-center"
              style={{ borderColor: "var(--color-quaternary)", color: "var(--color-quaternary)" }}
            >
              View more case studies
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
