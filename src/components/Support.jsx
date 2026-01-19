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
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

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
    title: "Fast response times",
    desc: "UK-based support team with quick turnaround on all requests.",
  },
  {
    icon: Shield,
    title: "Regular updates",
    desc: "Always kept informed of status, actions taken, and resolution times.",
  },
  {
    icon: Users,
    title: "Dedicated support",
    desc: "Your case is managed with honesty, integrity, and clear communication.",
  },
  {
    icon: Zap,
    title: "Proactive approach",
    desc: "We help you take advantage of opportunities, not just fix problems.",
  },
];

const stats = [
  { value: "4hr", label: "Avg response" },
  { value: "98%", label: "Satisfaction" },
  { value: "500+", label: "Tickets/year" },
  { value: "24/5", label: "Availability" },
];

const processSteps = [
  {
    num: "01",
    title: "Raise a ticket",
    desc: "Submit your request via email, phone, or our client portal. We'll acknowledge it immediately.",
  },
  {
    num: "02",
    title: "We assess",
    desc: "Our team reviews the issue, assigns the right specialist, and provides an initial response.",
  },
  {
    num: "03",
    title: "We resolve",
    desc: "We work on your request, keeping you updated at every step until it's fully resolved.",
  },
  {
    num: "04",
    title: "We follow up",
    desc: "After resolution, we check in to ensure everything's working and document any learnings.",
  },
];

export default function Support() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="min-h-[50vh] md:min-h-[60vh] flex items-center relative overflow-hidden pt-(--space-4xl)">
        {/* Offset purple triangle */}
        <div
          className="absolute top-1/2 hidden md:block"
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
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1000&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.5 }}
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-5xl">
            <p className="text-label text-secondary mb-md">Aftercare Support</p>
            <h1 className="text-hero" style={{ marginBottom: "var(--space-4xl)" }}>
              Support that
              <br />
              <span className="text-secondary">propels success.</span>
            </h1>
            <Link
              to="#plans"
              className="btn btn-lg w-full sm:w-auto justify-center"
              style={{ backgroundColor: "var(--color-secondary)", color: "white" }}
            >
              View plans
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-3xl" />

      {/* Stats */}
      <section className="py-(--space-xl) md:py-(--space-2xl) border-y border-(--color-text)/10">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-md md:gap-xl">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p
                  className={`font-heading text-stat mb-xs ${i % 2 === 1 ? "text-secondary" : ""}`}
                >
                  {stat.value}
                </p>
                <p className="text-label text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div>
              <p className="text-label text-secondary mb-md">Why aftercare?</p>
              <h3>
                NetSuite support, <span className="text-secondary">turned on its head.</span>
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-lg">
              {benefits.map((benefit, i) => (
                <div key={i} className="card border-2 border-(--color-text)/10 p-xl">
                  <div className="icon-box icon-box-md rounded-xl bg-(--color-secondary)/10 mb-lg">
                    <benefit.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <h6 className="mb-sm">{benefit.title}</h6>
                  <p className="text-sm text-muted">{benefit.desc}</p>
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

      {/* Testimonial + Video */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl lg:gap-3xl items-center">
            {/* Testimonial */}
            <div>
              <MessageSquareQuote className="w-12 h-12 md:w-16 md:h-16 text-secondary mb-xl" />
              <blockquote className="font-heading text-xl md:text-2xl lg:text-3xl leading-snug mb-xl">
                "The support team feels like an extension of our own. They're proactive,
                knowledgeable, and always <span className="text-secondary">one step ahead</span>."
              </blockquote>
              <div className="flex items-center gap-lg">
                <div
                  className="relative flex items-end justify-center shrink-0"
                  style={{
                    width: "56px",
                    height: "48px",
                    clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                    backgroundColor: "var(--color-secondary)",
                  }}
                >
                  <HeartHandshake className="w-5 h-5 text-white mb-2" />
                </div>
                <div>
                  <p className="text-lg font-bold">James Crawford</p>
                  <p className="text-base text-muted">IT Director, Reynolds Distribution</p>
                </div>
              </div>
            </div>

            {/* Video */}
            <div className="aspect-video rounded-2xl md:rounded-3xl overflow-hidden bg-(--color-secondary)/10 flex items-center justify-center relative">
              <div className="text-center">
                <div className="icon-box icon-box-lg rounded-2xl border-2 border-(--color-secondary)/20 mx-auto mb-lg">
                  <HeartHandshake className="w-10 h-10 text-secondary/40" />
                </div>
                <p className="text-label text-muted">Support Plans Explainer Video</p>
              </div>
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="icon-box icon-box-lg rounded-full bg-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <ArrowRight className="w-6 h-6 text-(--color-secondary) ml-1" />
                </div>
              </div>
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

          {/* Comparison table */}
          <div>
            {/* Header row */}
            <div
              className="grid items-end"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                gap: "var(--space-sm)",
              }}
            >
              <div></div>
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
                    className="text-center rounded-lg"
                    style={{
                      padding: "var(--space-lg) var(--space-md)",
                      backgroundColor: `var(${colorVar})`,
                    }}
                  >
                    <h6 style={{ color: "#ffffff", marginBottom: 0 }}>{plan.name}</h6>
                  </div>
                );
              })}
            </div>

            {/* Feature rows */}
            {featureLabels.map((feature, i) => (
              <div
                key={i}
                className="grid items-center"
                style={{
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  borderBottom: "1px solid rgba(26,26,26,0.06)",
                }}
              >
                <div style={{ padding: "var(--space-lg) var(--space-lg) var(--space-lg) 0" }}>
                  <span className="font-medium">{feature.label}</span>
                </div>
                {plans.map((plan, j) => {
                  const value = feature[plan.color];
                  return (
                    <div key={j} className="text-center" style={{ padding: "var(--space-lg)" }}>
                      {value ? (
                        <span className="font-semibold">{value}</span>
                      ) : (
                        <span style={{ color: "rgba(26,26,26,0.25)" }}>—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p className="text-muted text-sm" style={{ paddingTop: "var(--space-xl)" }}>
            Unused hours roll over for up to 6 months.{" "}
            <Link to="/terms" className="underline hover:no-underline">
              Terms apply
            </Link>
            .
          </p>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
