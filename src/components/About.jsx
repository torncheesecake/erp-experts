/**
 * ERP Experts About Page
 */

import {
  ArrowRight,
  Zap,
  Heart,
  Target,
  Handshake,
  Briefcase,
  Settings,
  Code,
  HeadphonesIcon,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

const stats = [
  { value: "230+", label: "Projects Delivered" },
  { value: "20+", label: "Years Experience" },
  { value: "3*", label: "NetSuite Partner" },
  { value: "100%", label: "Client Focus" },
];

const values = [
  {
    icon: Target,
    title: "Tailored Solutions",
    desc: "No cookie-cutter implementations. We design ERP solutions as unique as your business.",
  },
  {
    icon: Handshake,
    title: "Long-term Partnership",
    desc: "We don't disappear after go-live. We become your trusted NetSuite partner for the long haul.",
  },
  {
    icon: Zap,
    title: "Innovation & Expertise",
    desc: "Cutting-edge software engineering paired with proven change management strategies.",
  },
  {
    icon: Heart,
    title: "Passion for Results",
    desc: "We're driven by a genuine passion for transforming businesses through ERP.",
  },
];

const teamRoles = [
  { icon: Briefcase, title: "Business Consultants", desc: "Strategic guidance" },
  { icon: Settings, title: "Process Analysts", desc: "Workflow optimisation" },
  { icon: Code, title: "Software Engineers", desc: "Technical excellence" },
  { icon: HeadphonesIcon, title: "Support Specialists", desc: "Ongoing care" },
];

const clients = ["TK Maxx", "Rebellion", "Stiltz", "Kynetec", "Carallon"];

export default function About() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="min-h-[50vh] md:min-h-[60vh] flex items-center relative overflow-hidden pt-(--space-4xl)">
        {/* Offset triangle */}
        <div
          className="absolute top-1/2 hidden md:block"
          style={{
            left: "75%",
            transform: "translateX(calc(-50% + 80px)) translateY(calc(-50% + 30px))",
            width: "900px",
            height: "772px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
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
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.5 }}
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <p className="text-label text-primary" style={{ marginBottom: "var(--space-md)" }}>
              About Us
            </p>
            <h1 className="text-hero" style={{ marginBottom: "var(--space-2xl)" }}>
              Empowering
              <br />
              <span className="text-primary">businesses</span>.
            </h1>
            <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Work with us
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-3xl" />

      {/* Stats */}
      <section
        style={{ padding: "var(--space-xl) 0" }}
        className="border-y border-(--color-text)/10"
      >
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-md md:gap-xl">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p
                  className={`font-heading text-3xl md:text-4xl lg:text-stat mb-xs ${i % 2 === 1 ? "text-primary" : ""}`}
                >
                  {stat.value}
                </p>
                <p className="text-label text-muted text-xs md:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions as Unique */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div>
              <p className="text-label text-primary" style={{ marginBottom: "var(--space-lg)" }}>
                Our Approach
              </p>
              <h3 style={{ marginBottom: "var(--space-xl)" }}>
                Solutions as unique as your business
              </h3>
              <p className="text-base text-muted leading-relaxed">
                We understand that no two businesses are alike. That's why we take the time to
                understand your specific challenges, workflows, and goals before designing a
                NetSuite solution that fits your needs perfectly. Our consultants work alongside
                your team to ensure every implementation delivers real, measurable results.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-(--color-text)/5 flex items-center justify-center">
                <div className="text-center">
                  <div className="icon-box icon-box-lg rounded-full bg-(--color-text)/5 mx-auto mb-md">
                    <Target className="w-12 md:w-16 h-12 md:h-16 text-(--color-text)/20" />
                  </div>
                  <p className="text-label text-muted">Illustration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div className="lg:order-2">
              <p className="text-label text-primary" style={{ marginBottom: "var(--space-lg)" }}>
                Our Process
              </p>
              <h3 style={{ marginBottom: "var(--space-xl)" }}>
                Driven by passion, backed by expertise
              </h3>
              <p className="text-base text-muted leading-relaxed">
                Our team brings together decades of ERP experience with a genuine enthusiasm for
                helping businesses succeed. From initial discovery through to go-live and beyond, we
                combine proven methodologies with innovative thinking to deliver implementations
                that transform the way you work.
              </p>
            </div>
            <div className="lg:order-1">
              <div className="aspect-[4/3] rounded-3xl bg-dark flex items-center justify-center relative overflow-hidden">
                <div className="text-center text-(--color-text-on-dark-muted)">
                  <div className="w-16 md:w-20 h-16 md:h-20 border-2 border-white/15 rounded-2xl mx-auto mb-md" />
                  <p className="text-label">Team Image</p>
                </div>
                <div
                  className="absolute bottom-0 left-0 w-full h-1/3"
                  style={{
                    background: "linear-gradient(to top, var(--color-primary)/30, transparent)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center" style={{ marginBottom: "var(--space-3xl)" }}>
            <p className="text-label text-primary" style={{ marginBottom: "var(--space-lg)" }}>
              Why Us
            </p>
            <h3>Why businesses choose ERP Experts</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-lg">
            {values.map((value, i) => (
              <div key={i} className="card" style={{ padding: "var(--space-2xl)" }}>
                <div
                  className="icon-box icon-box-md rounded-2xl bg-(--color-primary)/10"
                  style={{ marginBottom: "var(--space-xl)" }}
                >
                  <value.icon className="w-6 md:w-8 h-6 md:h-8 text-primary" />
                </div>
                <h5 style={{ marginBottom: "var(--space-lg)" }}>{value.title}</h5>
                <p className="text-base text-muted leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Expertise */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="text-center" style={{ marginBottom: "var(--space-3xl)" }}>
            <p className="text-label text-primary" style={{ marginBottom: "var(--space-lg)" }}>
              Our Team
            </p>
            <h3>NetSuite-certified specialists</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-md md:gap-lg">
            {teamRoles.map((role, i) => (
              <div
                key={i}
                className="bg-(--color-bg-light) rounded-xl md:rounded-2xl text-center"
                style={{ padding: "var(--space-lg)" }}
              >
                <div
                  className="icon-box icon-box-sm md:icon-box-md rounded-full bg-(--color-primary) mx-auto"
                  style={{ marginBottom: "var(--space-md)" }}
                >
                  <role.icon className="w-4 md:w-6 h-4 md:h-6 text-white" />
                </div>
                <p
                  className="text-sm md:text-base font-bold"
                  style={{ marginBottom: "var(--space-xs)" }}
                >
                  {role.title}
                </p>
                <p className="text-xs md:text-base text-muted">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center" style={{ marginBottom: "var(--space-3xl)" }}>
            <p className="text-label text-primary" style={{ marginBottom: "var(--space-lg)" }}>
              Our Clients
            </p>
            <h3>Join our satisfied clients</h3>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-lg">
            {clients.map((client, i) => (
              <div
                key={i}
                className="rounded-2xl flex items-center justify-center bg-(--color-bg-light)"
                style={{ height: "4rem", padding: "0 var(--space-2xl)" }}
              >
                <span className="text-base font-bold text-muted">{client}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-lg">
        <div className="container text-center">
          <h1 className="text-hero" style={{ marginBottom: "var(--space-3xl)" }}>
            Unlock your <span className="text-primary">business potential</span>.
          </h1>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Start a conversation
              <ArrowRight className="w-6 h-6" />
            </button>
            <button className="btn btn-lg border-2 border-(--color-text) text-(--color-text) w-full sm:w-auto justify-center">
              Get your free NETscore
            </button>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
