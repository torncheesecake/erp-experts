/**
 * ERP Experts Implementation Page
 */

import { Link } from "react-router-dom";
import {
  ArrowRight,
  Rocket,
  Lightbulb,
  Settings,
  Code2,
  GraduationCap,
  HeartHandshake,
  Check,
  MessageSquareQuote,
  Users,
  Clock,
  Shield,
  TrendingUp,
  Database,
  Zap,
  Target,
  FileCheck,
} from "lucide-react";
import AnimatedStats from "../../components/ui/AnimatedStats";
import SEO from "../../components/ui/SEO";
import TrackedLink from "../../components/ui/TrackedLink";

const stats = [
  { value: "100%", label: "Success rate" },
  { value: "12wk", label: "Avg go-live" },
  { value: "94%", label: "On-time" },
  { value: "Fixed", label: "Pricing" },
];

const benefits = [
  {
    icon: Users,
    title: "Partner-led delivery",
    desc: "Senior consultants on every project. The people you meet are the people who deliver.",
  },
  {
    icon: Shield,
    title: "Fixed pricing",
    desc: "Transparent costs from day one. No surprises, no scope creep charges.",
  },
  {
    icon: Clock,
    title: "Fast go-live",
    desc: "Focused methodology gets you live faster without cutting corners.",
  },
  {
    icon: TrendingUp,
    title: "Training that sticks",
    desc: "Role-specific training designed around how your team actually works.",
  },
];

const processSteps = [
  {
    num: "01",
    title: "Consultancy",
    desc: "We understand your business, processes, and market. A comprehensive review ensures NetSuite integrates perfectly.",
    icon: Lightbulb,
  },
  {
    num: "02",
    title: "Configuration",
    desc: "Our analysts align NetSuite with your business map, including full data migration from your existing systems.",
    icon: Settings,
  },
  {
    num: "03",
    title: "Customisation",
    desc: "Where needed, our engineers build bespoke features using agile sprints to rapidly prototype and deliver.",
    icon: Code2,
  },
  {
    num: "04",
    title: "Coaching",
    desc: "Before go-live, we train key personnel in a sandbox environment as part of customer acceptance testing.",
    icon: GraduationCap,
  },
  {
    num: "05",
    title: "Care",
    desc: "Tailored aftercare plans with consultancy, development, coaching, and technical support as your business grows.",
    icon: HeartHandshake,
  },
];

const services = [
  {
    icon: Zap,
    title: "Customisation",
    desc: "Tailoring NetSuite to fit your unique business processes and workflows.",
  },
  {
    icon: Database,
    title: "Data Migration",
    desc: "Moving your data safely and accurately into NetSuite from any system.",
  },
  {
    icon: Target,
    title: "Discovery",
    desc: "Understanding your business needs and mapping the perfect solution.",
  },
  {
    icon: FileCheck,
    title: "Testing",
    desc: "Rigorous testing to ensure everything works perfectly before go-live.",
  },
];

export default function Implementation() {
  return (
    <main id="main-content">
      <SEO
        title="NetSuite Implementation"
        description="Start strong with NetSuite. 100% success rate, 12-week average go-live. Fixed pricing, senior consultants, guaranteed results."
        path="/implementation"
        keywords="NetSuite implementation UK, ERP implementation, NetSuite deployment, NetSuite go-live"
      />

      {/* Hero */}
      <section className="min-h-[50vh] md:min-h-[60vh] flex items-center relative overflow-hidden pt-(--space-4xl)">
        {/* Offset blue triangle */}
        <div
          className="absolute top-1/2 hidden lg:block"
          style={{
            left: "75%",
            transform: "translateX(calc(-50% + 80px)) translateY(calc(-50% + 30px))",
            width: "900px",
            height: "772px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-tertiary)",
            opacity: 0.2,
          }}
        />
        {/* Main triangle */}
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
            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1000&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.5 }}
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-5xl">
            <p className="text-label text-tertiary mb-md">NetSuite Implementation</p>
            <h1 className="text-hero" style={{ marginBottom: "var(--space-2xl)" }}>
              Start strong with
              <br />
              <span className="text-tertiary">NetSuite</span>.
            </h1>
            <TrackedLink
              to="#process"
              trackingName="implementation_hero_see_process"
              trackingPage="implementation"
              className="btn btn-lg w-full sm:w-auto justify-center"
              style={{ backgroundColor: "var(--color-tertiary)", color: "white" }}
            >
              See our process
              <ArrowRight className="w-5 h-5" />
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-3xl" />

      {/* Stats */}
      <section className="section-padding" style={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}>
        <div className="container">
          <p className="text-label text-tertiary text-center mb-xl">Our Track Record</p>
          <AnimatedStats stats={stats} color="tertiary" />
        </div>
      </section>

      {/* Intro */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div>
              <p className="text-label text-tertiary mb-md">Why us?</p>
              <h3>
                Implementation done <span className="text-tertiary">right.</span>
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-md md:gap-lg">
              {benefits.map((benefit, i) => (
                <div key={i} className="card border-2 border-(--color-text)/10 p-lg md:p-xl">
                  <div className="icon-box icon-box-md rounded-xl bg-(--color-tertiary)/10 mb-md md:mb-lg">
                    <benefit.icon className="w-5 h-5 md:w-6 md:h-6 text-tertiary" />
                  </div>
                  <h6 className="mb-sm">{benefit.title}</h6>
                  <p className="text-base text-muted">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl md:mb-3xl">
            <p className="text-label text-tertiary mb-md">Our methodology</p>
            <h3>
              The 5C <span className="text-tertiary">Process.</span>
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-lg md:gap-xl">
            {processSteps.map((step, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < processSteps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-(--color-tertiary)/20"
                    style={{ transform: "translateX(-50%)" }}
                  />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-(--color-tertiary)/10 relative mb-lg">
                    <step.icon className="w-6 h-6 text-tertiary" />
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-(--color-tertiary) text-white text-xs font-bold flex items-center justify-center">
                      {step.num.replace("0", "")}
                    </span>
                  </div>
                  <h6 className="mb-md">{step.title}</h6>
                  <p className="text-base text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl md:mb-3xl">
            <p className="text-label text-tertiary mb-md">What's included</p>
            <h3>
              Everything you need to <span className="text-tertiary">go live.</span>
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {services.map((service, i) => (
              <div
                key={i}
                className="card border-2 border-(--color-tertiary)/20 hover:border-(--color-tertiary)/50 hover:-translate-y-1 transition-all p-xl"
              >
                <div className="icon-box icon-box-md rounded-xl bg-(--color-tertiary)/10 mb-lg">
                  <service.icon className="w-6 h-6 text-tertiary" />
                </div>
                <h5 className="mb-md">{service.title}</h5>
                <p className="text-base text-muted leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial + Video */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl lg:gap-3xl items-center">
            {/* Testimonial */}
            <div>
              <MessageSquareQuote className="w-12 h-12 md:w-16 md:h-16 text-tertiary mb-xl" />
              <blockquote className="font-heading text-xl md:text-2xl lg:text-3xl leading-snug mb-xl">
                "From day one, the team was hands-on and genuinely invested. The implementation was
                <span className="text-tertiary"> smooth, on-time, and on-budget</span>."
              </blockquote>
              <div className="flex items-center gap-lg">
                <div
                  className="relative flex items-end justify-center shrink-0"
                  style={{
                    width: "56px",
                    height: "48px",
                    clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                    backgroundColor: "var(--color-tertiary)",
                  }}
                >
                  <Rocket className="w-5 h-5 text-white mb-2" />
                </div>
                <div>
                  <p className="text-lg font-bold">Sarah Mitchell</p>
                  <p className="text-base text-muted">Operations Director, TechParts UK</p>
                </div>
              </div>
            </div>

            {/* Video */}
            <div className="aspect-video rounded-2xl md:rounded-3xl overflow-hidden bg-(--color-tertiary)/10 flex items-center justify-center relative">
              <div className="text-center">
                <div className="icon-box icon-box-lg rounded-2xl border-2 border-(--color-tertiary)/20 mx-auto mb-lg">
                  <Rocket className="w-10 h-10 text-tertiary/40" />
                </div>
                <p className="text-label text-muted">Implementation Explainer Video</p>
              </div>
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="icon-box icon-box-lg rounded-full bg-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <ArrowRight className="w-6 h-6 text-(--color-tertiary) ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container text-center">
          <h2 style={{ marginBottom: "var(--space-xl)" }}>
            Ready to <span className="text-tertiary">get started</span>?
          </h2>
          <p className="text-lg text-muted mb-2xl max-w-2xl mx-auto">
            Book a call with our team to discuss your NetSuite implementation. We'll scope your
            project and provide a fixed-price quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            <TrackedLink
              to="/contact"
              trackingName="implementation_footer_book_call"
              trackingPage="implementation"
              className="btn btn-lg justify-center"
              style={{ backgroundColor: "var(--color-tertiary)", color: "white" }}
            >
              Book a call
              <ArrowRight className="w-5 h-5" />
            </TrackedLink>
            <TrackedLink
              to="/case-studies"
              trackingName="implementation_footer_see_work"
              trackingPage="implementation"
              className="btn btn-lg btn-outline justify-center"
            >
              See our work
            </TrackedLink>
          </div>
        </div>
      </section>
    </main>
  );
}
