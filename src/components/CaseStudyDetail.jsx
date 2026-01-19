/**
 * ERP Experts Case Study Detail Page
 */

import { useParams, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, MessageSquareQuote, Check } from "lucide-react";
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
      <section className="pt-(--space-4xl) pb-(--space-2xl) md:pb-(--space-3xl) relative overflow-hidden">
        {/* Large background triangle with image */}
        <div
          className="absolute top-1/2 hidden md:block pointer-events-none"
          style={{
            left: "55%",
            transform: "translateX(-50%) translateY(-50%)",
            width: "1200px",
            height: "1000px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            opacity: 0.55,
          }}
        >
          <img src={caseStudy.heroImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container relative z-10">
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-sm text-base font-bold text-muted hover:text-primary mb-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to case studies
          </Link>

          <div className="grid lg:grid-cols-5 gap-xl md:gap-2xl items-start">
            {/* Main content */}
            <div className="lg:col-span-3">
              {/* Logo placeholder */}
              <div className="h-16 md:h-20 w-48 md:w-56 rounded-xl bg-(--color-text)/5 flex items-center justify-center mb-xl">
                <img src={caseStudy.logo} alt={caseStudy.client} className="h-8 md:h-10 w-auto" />
              </div>
              <p className="text-label text-primary mb-md">{caseStudy.industry}</p>
              <h1 className="text-hero mb-lg md:mb-xl">{caseStudy.title}</h1>
              <p className="text-lg md:text-xl text-muted max-w-2xl">{caseStudy.subtitle}</p>
            </div>

            {/* Project details sidebar */}
            <div className="lg:col-span-2 p-(--space-xl) md:p-(--space-2xl) bg-white/[0.95] rounded-2xl md:rounded-3xl border border-(--color-text)/5">
              <h4 className="mb-xl md:mb-2xl">Project details</h4>
              <div className="space-y-xl md:space-y-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-base text-muted">Client</span>
                  <span className="text-base md:text-lg font-bold text-right">
                    {caseStudy.client}
                  </span>
                </div>
                <div className="border-t border-(--color-text)/10" />
                <div className="flex justify-between items-center">
                  <span className="text-base text-muted">Industry</span>
                  <span className="text-base md:text-lg font-bold">{caseStudy.industry}</span>
                </div>
                <div className="border-t border-(--color-text)/10" />
                <div className="flex justify-between items-center">
                  <span className="text-base text-muted">Timeline</span>
                  <span className="text-base md:text-lg font-bold">{caseStudy.timeline}</span>
                </div>
                <div className="border-t border-(--color-text)/10" />
                <div className="flex justify-between items-center">
                  <span className="text-base text-muted">Team</span>
                  <span className="text-base md:text-lg font-bold">{caseStudy.teamSize}</span>
                </div>
                <div className="border-t border-(--color-text)/10" />
                <div className="flex justify-between items-start">
                  <span className="text-base text-muted">Services</span>
                  <div className="flex flex-wrap gap-sm justify-end">
                    {caseStudy.services.map((service, i) => (
                      <span
                        key={i}
                        className="text-base font-bold px-lg py-sm bg-white rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-(--space-xl) md:py-(--space-2xl) border-y border-(--color-text)/10">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-md md:gap-xl">
            {caseStudy.results.map((result, i) => (
              <div key={i} className="text-center">
                <p className={`font-heading text-stat mb-xs ${i % 2 === 1 ? "text-primary" : ""}`}>
                  {result.metric}
                </p>
                <p className="text-base md:text-lg font-bold mb-xs">{result.label}</p>
                <p className="text-base text-muted">{result.context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl lg:gap-3xl items-start">
            <div>
              <p className="text-label text-primary mb-sm md:mb-md">The Challenge</p>
              <h2 className="mb-lg md:mb-xl">{caseStudy.challenge.summary}</h2>
              <p className="text-lg md:text-xl text-muted leading-relaxed">
                {caseStudy.challenge.detail}
              </p>
            </div>
            <div>
              <p className="text-label text-muted mb-lg md:mb-xl">Pain points</p>
              <div className="flex flex-col gap-8 md:gap-12">
                {caseStudy.challenge.painPoints.map((point, i) => (
                  <div
                    key={i}
                    className="p-(--space-xl) md:p-(--space-2xl) bg-(--color-text)/5 rounded-2xl md:rounded-3xl flex items-center gap-xl"
                  >
                    <span className="text-primary font-heading text-3xl md:text-4xl">0{i + 1}</span>
                    <p className="text-lg md:text-xl">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl lg:gap-3xl items-start">
            <div>
              <p className="text-label text-primary mb-sm md:mb-md">The Solution</p>
              <h2 className="mb-lg md:mb-xl">{caseStudy.solution.summary}</h2>
              <p className="text-lg md:text-xl text-muted leading-relaxed">
                {caseStudy.solution.detail}
              </p>
            </div>
            <div>
              <p className="text-label text-muted mb-lg md:mb-xl">Our approach</p>
              <div className="flex flex-col gap-8 md:gap-12">
                {caseStudy.solution.approach.map((step, i) => (
                  <div key={i} className="flex items-center gap-xl md:gap-2xl">
                    <div
                      className="shrink-0 relative flex items-end justify-center"
                      style={{
                        width: "80px",
                        height: "70px",
                        clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                        backgroundColor: "var(--color-primary)",
                      }}
                    >
                      <Check className="w-8 h-8 text-white mb-3" />
                    </div>
                    <p className="text-lg md:text-xl">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <MessageSquareQuote className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto mb-xl md:mb-2xl" />
            <blockquote className="font-heading text-2xl md:text-3xl lg:text-4xl leading-snug mb-xl md:mb-2xl">
              "{caseStudy.testimonial.quote}"
            </blockquote>
            <div className="flex items-center justify-center gap-md">
              <div className="w-14 h-14 rounded-full bg-(--color-text)/10" />
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
      <section className="section-padding-lg">
        <div className="container text-center">
          <h1 className="text-hero" style={{ marginBottom: "var(--space-xl)" }}>
            Ready for <span className="text-primary">similar results?</span>
          </h1>
          <p className="text-lg text-muted mx-auto max-w-[500px] mb-2xl">
            Let's discuss how we can help transform your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            <Link to="/contact" className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Start a conversation
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Link
              to="/case-studies"
              className="btn btn-lg border-2 border-(--color-text) text-(--color-text) w-full sm:w-auto justify-center"
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
