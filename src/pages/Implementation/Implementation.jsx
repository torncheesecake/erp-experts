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
  { value: "0", label: "Projects abandoned halfway" },
  { value: "350+", label: "Projects completed" },
  { value: "100%", label: "Customer retention post go-live" },
];

const benefits = [
  {
    icon: Users,
    title: "Senior consultant delivery",
    desc: "The person who scopes it, delivers it. No handoffs, no reexplaining.",
  },
  {
    icon: Shield,
    title: "Fixed pricing",
    desc: "One price covers the project and the inevitable curveballs. No extras.",
  },
  {
    icon: Clock,
    title: "Proven methodology",
    desc: "Keeps budgets and timelines steady at every stage, so you know what's happening and why.",
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
    title: "Consult",
    desc: "We document how you actually work, not theory. Requirements agreed and signed before any technical work begins. No moving targets.",
    icon: Lightbulb,
  },
  {
    num: "02",
    title: "Configure",
    desc: "Data migration is where projects die. We design, cleanse, and test everything in a sandbox before it touches your live system.",
    icon: Settings,
  },
  {
    num: "03",
    title: "Customise",
    desc: "Custom features tested in the sandbox and signed off by your team. Built to survive NetSuite updates, not break with them.",
    icon: Code2,
  },
  {
    num: "04",
    title: "Coach",
    desc: "Your team learns in a safe environment with real scenarios. They go live confident, not guessing their way through month-end.",
    icon: GraduationCap,
  },
  {
    num: "05",
    title: "Care",
    desc: "Most consultants vanish after go-live. We stay, keeping NetSuite working as you grow, from helpdesk to full development.",
    icon: HeartHandshake,
  },
];

const services = [
  {
    icon: Users,
    title: "A system your team trusts",
    desc: "Not just configured but tested by the people who'll use it daily. Confidence from day one.",
  },
  {
    icon: Database,
    title: "Clean data you can rely on",
    desc: "Every record verified, every migration tested. One source of truth, not multiple versions.",
  },
  {
    icon: Settings,
    title: "Processes that work",
    desc: "Workflows built around how you operate now. No forcing your business into generic templates.",
  },
  {
    icon: GraduationCap,
    title: "Knowledge that stays",
    desc: "Documentation, training records, and a team that knows how to use it. Not dependent on one person.",
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
      <section
        className="flex items-center relative overflow-hidden"
        style={{ paddingTop: "160px", paddingBottom: "30px" }}
      >
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
            <h1 className="text-hero mb-xl md:mb-2xl">
              Implemented right.
              <br />
              <span className="text-tertiary">Works right.</span>
            </h1>
            <TrackedLink
              to="/what-is-netsuite"
              trackingName="implementation_hero_whats_netsuite"
              trackingPage="implementation"
              className="btn btn-lg w-full sm:w-auto justify-center"
              style={{ backgroundColor: "var(--color-tertiary)", color: "white" }}
            >
              What's NetSuite?
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
          <AnimatedStats stats={stats} color="tertiary" columns={3} />
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
      <section
        id="process"
        className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden"
      >
        {/* Decorative triangle */}
        <div
          className="absolute -right-64 top-1/2 -translate-y-1/2 opacity-[0.03] hidden lg:block pointer-events-none"
          style={{
            width: "800px",
            height: "686px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-tertiary)",
          }}
        />
        <div className="container relative z-10">
          <div className="text-center mb-2xl md:mb-3xl">
            <p className="text-label text-tertiary mb-md">Our methodology</p>
            <h3>
              The 5C <span className="text-tertiary">Process.</span>
            </h3>
            <p className="text-lg text-muted mt-lg max-w-2xl mx-auto">
              ERP implementations fail in predictable ways. This methodology exists to prevent them.
            </p>
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
      <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
        {/* Decorative triangle */}
        <div
          className="absolute bottom-0 right-0 opacity-10 hidden lg:block pointer-events-none"
          style={{
            width: "350px",
            height: "300px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-tertiary)",
            transform: "translateX(30%) translateY(40%)",
          }}
        />
        <div className="container relative z-10">
          <div className="text-center mb-2xl md:mb-3xl">
            <p className="text-label text-tertiary mb-md">What's included</p>
            <h3>
              Everything you'll have when you <span className="text-tertiary">go live.</span>
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
      <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
        {/* Decorative triangle */}
        <div
          className="absolute top-0 left-0 opacity-10 hidden lg:block pointer-events-none"
          style={{
            width: "280px",
            height: "240px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-quaternary)",
            transform: "translateX(-40%) translateY(-50%)",
          }}
        />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-2xl lg:gap-3xl items-center">
            {/* Testimonial */}
            <div>
              <MessageSquareQuote className="w-12 h-12 md:w-16 md:h-16 text-quaternary mb-xl" />
              <blockquote className="font-heading text-xl md:text-2xl lg:text-3xl leading-snug mb-xl">
                "You can have the best system in the world. If it's implemented poorly, it's
                worthless.
                <span className="text-quaternary"> ERP Experts came in as a saviour.</span>"
              </blockquote>
              <div className="flex items-center gap-lg mb-lg">
                <div
                  className="relative flex items-end justify-center shrink-0"
                  style={{
                    width: "56px",
                    height: "48px",
                    clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                    backgroundColor: "var(--color-quaternary)",
                  }}
                >
                  <Rocket className="w-5 h-5 text-white mb-2" />
                </div>
                <div>
                  <p className="text-lg font-bold">David Hall</p>
                  <p className="text-base text-muted">CEO, Totalkare</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-md">
                <TrackedLink
                  to="/case-studies/4"
                  trackingName="implementation_testimonial_totalkare"
                  trackingPage="implementation"
                  className="inline-flex items-center gap-sm text-quaternary font-bold hover:gap-md transition-all"
                >
                  Read Totalkare's story
                  <ArrowRight className="w-4 h-4" />
                </TrackedLink>
                <TrackedLink
                  to="/case-studies"
                  trackingName="implementation_testimonial_all_cases"
                  trackingPage="implementation"
                  className="inline-flex items-center gap-sm text-muted font-bold hover:gap-md hover:text-quaternary transition-all"
                >
                  View all case studies
                  <ArrowRight className="w-4 h-4" />
                </TrackedLink>
              </div>
            </div>

            {/* Video */}
            <div className="aspect-video rounded-2xl md:rounded-3xl overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/QMdmpFEyMN0"
                title="Totalkare NetSuite Implementation - David Hall"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
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
            Dare to discover your ERP readiness in just 3 minutes? Take this playful quiz to find
            out!
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
