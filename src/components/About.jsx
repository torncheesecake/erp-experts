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
import { Link } from "react-router-dom";
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
            <p className="text-label text-primary mb-md">About Us</p>
            <h1 className="text-hero mb-xl">
              Empowering
              <br />
              <span className="text-primary">businesses</span>.
            </h1>
            <p className="text-xl md:text-2xl text-muted leading-relaxed max-w-2xl">
              We're NetSuite specialists helping UK businesses transform their operations since
              2013.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        className="border-y border-(--color-text)/10"
        style={{ padding: "var(--space-2xl) 0", marginTop: "var(--space-xl)" }}
      >
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-xl md:gap-2xl">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p
                  className={`font-heading text-4xl md:text-stat leading-none mb-sm ${i % 2 === 1 ? "text-primary" : ""}`}
                >
                  {stat.value}
                </p>
                <p className="text-base md:text-lg text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions as Unique */}
      <section className="section-padding">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-xl lg:gap-2xl items-center">
            <div>
              <p className="text-label text-primary mb-md">Our Approach</p>
              <h3 className="mb-lg">Solutions as unique as your business</h3>
              <p className="text-lg md:text-xl text-muted leading-relaxed">
                We understand that no two businesses are alike. That's why we take the time to
                understand your specific challenges, workflows, and goals before designing a
                NetSuite solution that fits your needs perfectly. Our consultants work alongside
                your team to ensure every implementation delivers real, measurable results.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
                  alt="Team collaboration"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-xl lg:gap-2xl items-center">
            <div className="lg:order-2">
              <p className="text-label text-primary mb-md">Our Process</p>
              <h3 className="mb-lg">Driven by passion, backed by expertise</h3>
              <p className="text-lg md:text-xl text-muted leading-relaxed">
                Our team brings together decades of ERP experience with a genuine enthusiasm for
                helping businesses succeed. From initial discovery through to go-live and beyond, we
                combine proven methodologies with innovative thinking to deliver implementations
                that transform the way you work.
              </p>
            </div>
            <div className="lg:order-1">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
                  alt="Team meeting"
                  className="w-full h-full object-cover"
                />
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
      <section className="section-padding" style={{ backgroundColor: "rgba(232, 58, 122, 0.05)" }}>
        <div className="container">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">Why Us</p>
            <h3>Why businesses choose ERP Experts</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-lg">
            {values.map((value, i) => (
              <div
                key={i}
                className="relative overflow-hidden p-xl md:p-2xl rounded-2xl bg-white border-2 border-(--color-primary)/10"
              >
                <div className="icon-box icon-box-md rounded-2xl bg-(--color-primary)/10 mb-lg">
                  <value.icon className="w-6 md:w-7 h-6 md:h-7 text-primary" />
                </div>
                <h5 className="mb-md">{value.title}</h5>
                <p className="text-base md:text-lg text-muted leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Expertise */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">Our Team</p>
            <h3>NetSuite-certified specialists</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-md md:gap-lg">
            {teamRoles.map((role, i) => (
              <div key={i} className="bg-(--color-bg-light) rounded-2xl text-center p-lg md:p-xl">
                <div className="icon-box icon-box-md rounded-full bg-(--color-primary) mx-auto mb-md">
                  <role.icon className="w-5 md:w-6 h-5 md:h-6 text-white" />
                </div>
                <p className="text-base md:text-lg font-bold mb-xs">{role.title}</p>
                <p className="text-base text-muted">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">Our Clients</p>
            <h3>Trusted by leading businesses</h3>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-lg">
            {clients.map((client, i) => (
              <div
                key={i}
                className="rounded-2xl flex items-center justify-center bg-(--color-bg-light) px-xl py-lg"
              >
                <span className="text-lg font-bold text-muted">{client}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container text-center">
          <h2 className="mb-md">
            Ready to <span className="text-primary">work together</span>?
          </h2>
          <p className="text-lg md:text-xl text-muted mx-auto max-w-2xl mb-xl">
            Let's discuss how we can help transform your business with NetSuite.
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            <Link to="/contact" className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Start a conversation
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://ric-snwikqbv.scoreapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lg border-2 border-(--color-primary) text-primary w-full sm:w-auto justify-center"
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
