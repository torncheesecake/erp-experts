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
      <section className="pt-(--space-4xl) pb-(--space-2xl) md:pb-(--space-3xl)">
        <div className="container">
          <div className="max-w-5xl">
            <p className="text-label text-primary mb-md md:mb-lg">About Us</p>
            <h1 className="text-hero mb-xl md:mb-2xl">
              Empowering
              <br />
              <span className="text-primary">businesses.</span>
            </h1>
            <p
              className="text-lg md:text-xl text-muted mb-xl md:mb-2xl"
              style={{ maxWidth: "800px" }}
            >
              At ERP Experts, we don't just implement ERP systems – we unlock your business's
              potential. As an accredited NetSuite 3* Solutions Provider, we've successfully
              delivered over 230 tailored ERP projects.
            </p>
            <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Work with us
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-(--space-xl) md:py-(--space-2xl) border-y border-(--color-text)/10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-md md:gap-xl">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className={`font-heading text-stat mb-xs ${i % 2 === 1 ? "text-primary" : ""}`}>
                  {stat.value}
                </p>
                <p className="text-label text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions as Unique */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-xl md:gap-2xl items-center">
            <div>
              <p className="text-label text-primary mb-sm md:mb-md">Our Approach</p>
              <h2 className="mb-lg md:mb-xl">Solutions as unique as your business</h2>
              <p className="text-base md:text-lg text-muted mb-md md:mb-lg">
                Your business is one of a kind, and so are its challenges. We understand that no two
                companies have the same needs.
              </p>
              <p className="text-base md:text-lg text-muted">
                That's why we design tailored NetSuite solutions, not cookie-cutter implementations.
                Whether it's addressing operational pain points, providing ongoing support, or
                helping your team with bespoke training, our focus is always on solutions that align
                with your goals.
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
          <div className="grid lg:grid-cols-2 gap-xl md:gap-2xl items-center">
            <div className="lg:order-2">
              <p className="text-label text-primary mb-sm md:mb-md">Our Process</p>
              <h2 className="mb-lg md:mb-xl">Driven by passion, backed by expertise</h2>
              <p className="text-base md:text-lg text-muted mb-md md:mb-lg">
                We've developed a proprietary implementation process that blends the latest software
                engineering techniques with proven change management strategies.
              </p>
              <p className="text-base md:text-lg text-muted mb-md md:mb-lg">
                Our NetSuite aftercare and advanced support plans ensure your system stays optimised
                as your business grows and evolves.
              </p>
              <p className="text-base md:text-lg text-muted">
                When you work with us, you're not just upgrading your systems – you're unlocking the
                full potential of your business.
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
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-xl md:mb-2xl">
            <p className="text-label text-primary mb-sm md:mb-md">Why Us</p>
            <h2>Why businesses choose ERP Experts</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-md md:gap-xl">
            {values.map((value, i) => (
              <div key={i} className="card p-(--space-xl) md:p-(--space-2xl)">
                <div className="icon-box icon-box-md rounded-2xl bg-(--color-primary)/10 mb-lg md:mb-xl">
                  <value.icon className="w-6 md:w-8 h-6 md:h-8 text-primary" />
                </div>
                <h5 className="mb-md md:mb-lg">{value.title}</h5>
                <p className="text-base text-muted leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Expertise */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-xl md:mb-2xl">
            <p className="text-label text-primary mb-sm md:mb-md">Our Team</p>
            <h3>NetSuite-certified specialists</h3>
          </div>
          <p className="text-base md:text-lg text-muted text-center mb-xl md:mb-2xl max-w-3xl mx-auto">
            From business consultants and process analysts to software engineers, we bring a deep
            understanding of technology and business operations to every project.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-md md:gap-xl">
            {teamRoles.map((role, i) => (
              <div
                key={i}
                className="bg-(--color-bg-light) rounded-2xl p-(--space-lg) md:p-(--space-xl) text-center"
              >
                <div className="icon-box icon-box-md rounded-full bg-(--color-primary) mx-auto mb-md md:mb-lg">
                  <role.icon className="w-5 md:w-6 h-5 md:h-6 text-white" />
                </div>
                <p className="text-base font-bold mb-xs md:mb-sm">{role.title}</p>
                <p className="text-base text-muted">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-xl md:mb-2xl">
            <p className="text-label text-primary mb-sm md:mb-md">Our Clients</p>
            <h3>Join our satisfied clients</h3>
          </div>
          <p className="text-base md:text-lg text-muted text-center mb-xl md:mb-2xl max-w-2xl mx-auto">
            We've supported businesses across various industries, helping them unlock the power of
            NetSuite to drive growth and efficiency.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-md md:gap-xl">
            {clients.map((client, i) => (
              <div
                key={i}
                className="h-12 md:h-16 px-lg md:px-2xl rounded-2xl flex items-center justify-center bg-(--color-bg-light)"
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
          <h3 className="mb-lg">
            Ready to unlock your <span className="text-primary">business potential?</span>
          </h3>
          <p className="text-lg text-muted mx-auto max-w-[500px] mb-2xl">
            Let's have a conversation about your NetSuite journey.
          </p>
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
