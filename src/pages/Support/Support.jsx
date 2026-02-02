/**
 * ERP Experts Support Page
 */

import { Link } from "react-router-dom";
import {
  ArrowRight,
  HeartHandshake,
  Headphones,
  GraduationCap,
  Settings,
  Puzzle,
  Check,
  X,
  MessageSquareQuote,
  Users,
  Clock,
  Shield,
  Zap,
} from "lucide-react";
import AnimatedStats from "../../components/ui/AnimatedStats";
import SEO from "../../components/ui/SEO";
import TrackedLink from "../../components/ui/TrackedLink";

const plans = [
  {
    name: "Bronze",
    tagline: "Everyday support",
    desc: "Help-desk support and technical assistance to keep your NetSuite system running smoothly. Essential maintenance and timely updates.",
    color: "bronze",
    features: {
      helpdesk: true,
      maintenance: true,
      consulting: false,
      training: false,
      apps: false,
    },
    highlights: [
      "Technical help-desk support",
      "System maintenance & updates",
      "Security patches applied",
      "Issue tracking & resolution",
    ],
  },
  {
    name: "Silver",
    tagline: "Learn as you grow",
    desc: "Perfect for teams looking to master NetSuite quickly. Ideal for onboarding new employees or refreshing your team's knowledge.",
    color: "silver",
    featured: false,
    features: {
      helpdesk: true,
      maintenance: true,
      consulting: false,
      training: true,
      apps: false,
    },
    highlights: [
      "Everything in Bronze",
      "Role-specific training sessions",
      "New starter onboarding",
      "Knowledge base access",
    ],
  },
  {
    name: "Gold",
    tagline: "Your extended team",
    desc: "More than just support - our business analysts and developers become an extension of your team, driving innovation and growth.",
    color: "gold",
    featured: true,
    features: {
      helpdesk: true,
      maintenance: true,
      consulting: true,
      training: true,
      apps: true,
    },
    highlights: [
      "Everything in Silver",
      "Ongoing consultancy",
      "Development resources",
      "Apps & enhancements",
    ],
  },
];

const featureLabels = [
  {
    key: "helpdesk",
    label: "NetSuite Helpdesk",
    icon: Headphones,
    desc: "Unused hours roll over",
    bronze: "10 hrs/month",
    silver: "20 hrs/month",
    gold: "50 hrs/month",
  },
  {
    key: "maintenance",
    label: "NetSuite Maintenance",
    icon: Settings,
    desc: "Updates, patches & security",
    bronze: "Included",
    silver: "Included",
    gold: "Priority",
  },
  {
    key: "consulting",
    label: "NetSuite Consulting",
    icon: Users,
    desc: "Strategic guidance & advice",
    bronze: null,
    silver: null,
    gold: "8 hrs/month",
  },
  {
    key: "training",
    label: "NetSuite Training",
    icon: GraduationCap,
    desc: "Upskill your team",
    bronze: null,
    silver: "4 sessions/year",
    gold: "8 sessions/year",
  },
  {
    key: "apps",
    label: "Apps & Enhancements",
    icon: Puzzle,
    desc: "Custom development & integrations",
    bronze: null,
    silver: null,
    gold: "16 hrs/month",
  },
];

const benefits = [
  {
    icon: Clock,
    title: "UK-based team",
    desc: "Same time zone. Quick turnaround. No offshore ticket queues.",
  },
  {
    icon: Users,
    title: "Single point of contact",
    desc: "Tell us the problem, and we'll figure out the rest. One head to pat, one ass to kick.",
  },
  {
    icon: Zap,
    title: "Hours roll over",
    desc: "Unused hours roll over. If you don't use them, you don't lose them.",
  },
  {
    icon: Shield,
    title: "Fixed rate",
    desc: "One hourly rate, whether you need an architect or consultant. No calculating blended rates or surprise invoices.",
  },
];

const stats = [
  { value: "33,000+", label: "Support tickets handled" },
  { value: "577", label: "Custom Solutions" },
  { value: "<30 min", label: "Average response time" },
];

const processSteps = [
  {
    num: "01",
    title: "Tell us what's wrong",
    desc: "Describe the problem in your own words. We figure out what's needed.",
  },
  {
    num: "02",
    title: "We assess it",
    desc: "We provide a clear explanation of what's needed and how long it'll take. You approve before we start. You're in control.",
  },
  {
    num: "03",
    title: "We fix it",
    desc: "Right specialist assigned, fixed properly, keeping you updated. No surprises.",
  },
  {
    num: "04",
    title: "You learn from it",
    desc: "We document what happened and why. Your team gets smarter, not more dependent on us.",
  },
];

export default function Support() {
  return (
    <main id="main-content">
      <SEO
        title="Support Plans"
        description="NetSuite support that propels success. Bronze, Silver, and Gold plans with fast response times and dedicated teams. Choose your level of support."
        path="/support"
        keywords="NetSuite support plans, NetSuite helpdesk, ERP support UK, NetSuite maintenance"
      />

      {/* Hero */}
      <section className="min-h-[50vh] md:min-h-[60vh] flex items-center relative overflow-hidden pt-(--space-4xl)">
        {/* Offset purple triangle */}
        <div
          className="absolute top-1/2 hidden lg:block"
          style={{
            left: "75%",
            transform: "translateX(calc(-50% + 80px)) translateY(calc(-50% + 30px))",
            width: "900px",
            height: "772px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-secondary)",
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
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1000&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.5 }}
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-5xl">
            <p className="text-label text-secondary mb-md">Aftercare</p>
            <h1 className="text-hero" style={{ marginBottom: "var(--space-2xl)" }}>
              We make NetSuite
              <br />
              <span className="text-secondary">easier</span>.
            </h1>
            <TrackedLink
              to="#plans"
              trackingName="support_hero_view_plans"
              trackingPage="support"
              className="btn btn-lg w-full sm:w-auto justify-center"
              style={{ backgroundColor: "var(--color-secondary)", color: "white" }}
            >
              View plans
              <ArrowRight className="w-5 h-5" />
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-3xl" />

      {/* Stats */}
      <section className="section-padding" style={{ backgroundColor: "rgba(126, 34, 206, 0.05)" }}>
        <div className="container">
          <p className="text-label text-secondary text-center mb-xl">Our Track Record</p>
          <AnimatedStats stats={stats} color="secondary" columns={3} />
        </div>
      </section>

      {/* Intro */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div>
              <p className="text-label text-secondary mb-md">Why aftercare?</p>
              <h3>
                Support done the way{" "}
                <span className="text-secondary">we'd want it for ourselves.</span>
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-md md:gap-lg">
              {benefits.map((benefit, i) => (
                <div key={i} className="card border-2 border-(--color-text)/10 p-lg md:p-xl">
                  <div className="icon-box icon-box-md rounded-xl bg-(--color-secondary)/10 mb-md md:mb-lg">
                    <benefit.icon className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
                  </div>
                  <h6 className="mb-sm">{benefit.title}</h6>
                  <p className="text-base text-muted">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl md:mb-3xl">
            <p className="text-label text-secondary mb-md">How it works</p>
            <h3>
              Simple, transparent <span className="text-secondary">support.</span>
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-lg md:gap-xl">
            {processSteps.map((step, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < processSteps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-(--color-secondary)/20"
                    style={{ transform: "translateX(-50%)" }}
                  />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-(--color-secondary)/10 relative mb-lg">
                    <span className="font-heading text-2xl text-secondary">{step.num}</span>
                  </div>
                  <h6 className="mb-md">{step.title}</h6>
                  <p className="text-base text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section
        className="section-padding-lg border-t border-(--color-text)/10"
        style={{ backgroundColor: "rgba(42, 157, 99, 0.05)" }}
      >
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl lg:gap-3xl items-center">
            {/* Testimonial */}
            <div>
              <MessageSquareQuote className="w-12 h-12 md:w-16 md:h-16 text-quaternary mb-xl opacity-50" />
              <blockquote className="font-heading text-xl md:text-2xl lg:text-3xl leading-snug mb-xl">
                "We now have a stable system with reliable ongoing support. They quickly gave us
                <span className="text-quaternary">
                  {" "}
                  clear choices and explained the time and cost for each.
                </span>
                "
              </blockquote>
              <div className="flex items-center gap-lg">
                <div
                  className="relative flex items-end justify-center shrink-0"
                  style={{
                    width: "56px",
                    height: "48px",
                    clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                    backgroundColor: "var(--color-quaternary)",
                  }}
                >
                  <HeartHandshake className="w-5 h-5 text-white mb-2" />
                </div>
                <div>
                  <p className="text-lg font-bold">Tom Mayho</p>
                  <p className="text-base text-muted">FD, Kynetec</p>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="aspect-video rounded-2xl md:rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
                alt="Team collaboration"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center" style={{ marginBottom: "var(--space-3xl)" }}>
            <p className="text-label text-secondary mb-md">Our plans</p>
            <h3>
              Bronze, Silver, Gold. <span className="text-secondary">Find your fit.</span>
            </h3>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-lg md:gap-xl">
            {plans.map((plan, i) => {
              const colorVars = {
                bronze: "--color-bronze",
                silver: "--color-silver",
                gold: "--color-gold",
              };
              const colorVar = colorVars[plan.color];
              return (
                <div
                  key={i}
                  className={`card p-(--space-xl) md:p-(--space-2xl) relative ${
                    plan.featured ? "border-2" : ""
                  }`}
                  style={{
                    borderColor: plan.featured ? `var(${colorVar})` : undefined,
                  }}
                >
                  {plan.featured && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs md:text-sm font-bold px-3 md:px-4 py-1 rounded-full"
                      style={{ backgroundColor: `var(${colorVar})` }}
                    >
                      Most Popular
                    </div>
                  )}
                  <div
                    className="inline-block px-4 py-1.5 rounded-full mb-lg"
                    style={{ backgroundColor: `var(${colorVar})` }}
                  >
                    <span className="text-white font-bold text-sm">{plan.name}</span>
                  </div>
                  <p className="text-lg font-bold mb-sm">{plan.tagline}</p>
                  <p className="text-base text-muted mb-xl">{plan.desc}</p>
                  <div className="flex flex-col gap-md">
                    {plan.highlights.map((highlight, j) => (
                      <div key={j} className="flex items-center gap-md">
                        <Check className="w-5 h-5 shrink-0" style={{ color: `var(${colorVar})` }} />
                        <span className="text-base">{highlight}</span>
                      </div>
                    ))}
                  </div>
                  <TrackedLink
                    to="/contact"
                    trackingName={`support_plan_${plan.name.toLowerCase()}_get_started`}
                    trackingPage="support"
                    className="btn btn-lg w-full justify-center mt-xl text-white"
                    style={{ backgroundColor: `var(${colorVar})` }}
                  >
                    Get started
                    <ArrowRight className="w-5 h-5" />
                  </TrackedLink>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="text-muted text-sm text-center" style={{ paddingTop: "var(--space-xl)" }}>
            Unused hours roll over for up to 6 months.{" "}
            <Link to="/terms" className="underline hover:no-underline">
              Terms apply
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="rounded-3xl md:rounded-[3rem] overflow-hidden relative">
            {/* Background with gradient */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%)",
              }}
            />
            {/* Decorative triangles */}
            <div
              className="absolute top-0 left-0 opacity-10 hidden md:block"
              style={{
                width: "300px",
                height: "260px",
                clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                backgroundColor: "white",
                transform: "translateX(-80px) translateY(-80px)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 opacity-10 hidden md:block"
              style={{
                width: "400px",
                height: "350px",
                clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                backgroundColor: "white",
                transform: "translateX(100px) translateY(100px)",
              }}
            />

            <div className="relative z-10" style={{ padding: "var(--space-3xl) var(--space-xl)" }}>
              <div className="text-center">
                <h2 className="text-white" style={{ marginBottom: "var(--space-xl)" }}>
                  Ready to get <span className="text-white/90">started?</span>
                </h2>
                <p
                  className="text-white/80 text-lg max-w-2xl mx-auto"
                  style={{ marginBottom: "var(--space-2xl)" }}
                >
                  Let's find the right support plan for your business. Book a call with our team to
                  discuss your needs.
                </p>

                <div className="flex flex-col sm:flex-row gap-md justify-center">
                  <TrackedLink
                    to="/contact"
                    trackingName="support_footer_get_support"
                    trackingPage="support"
                    className="btn btn-lg justify-center bg-white text-(--color-secondary) hover:scale-105 transition-transform"
                  >
                    Get support
                    <ArrowRight className="w-5 h-5" />
                  </TrackedLink>
                  <TrackedLink
                    to="/contact"
                    trackingName="support_footer_book_call"
                    trackingPage="support"
                    className="btn btn-lg justify-center bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 transition-all"
                  >
                    Book a call
                  </TrackedLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
