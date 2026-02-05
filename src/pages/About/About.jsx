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
import AnimatedStats from "../../components/ui/AnimatedStats";
import SEO from "../../components/ui/SEO";
import TrackedLink from "../../components/ui/TrackedLink";
import { trackCTAClick } from "../../components/Analytics";
import netSuiteLogo from "../../assets/NetSuite-logo-half-light.png";

const stats = [{ value: "Oracle Partner", label: "Since 2009 - Hard to get. Harder to keep." }];

const values = [
  {
    icon: Target,
    title: "No surprises",
    desc: "Fixed pricing, regular communication, and a clear plan from day one.",
  },
  {
    icon: Handshake,
    title: "Genuine partnership",
    desc: "We stick around for the long haul, becoming part of your team - not a supplier.",
  },
  {
    icon: Zap,
    title: "Your team gets stronger",
    desc: "We train your people to own the system, not rely on us forever.",
  },
  {
    icon: Heart,
    title: "Results that matter",
    desc: "We measure success by what changes for your business - not just what we deliver.",
  },
];

const teamRoles = [
  {
    icon: Briefcase,
    title: "Business Consultants",
    desc: "Your single point of contact - they own the project and see it through",
  },
  {
    icon: Settings,
    title: "Process Analysts",
    desc: "They map your workflows and make sure the system fits how you actually work",
  },
  {
    icon: Code,
    title: "Software Engineers",
    desc: "The people who build your customisations - and stick around to support them",
  },
  {
    icon: HeadphonesIcon,
    title: "Support Specialists",
    desc: "Fast, friendly help when you need it - from people who already know your system",
  },
];

const clients = ["Totalkare", "Rebellion", "Stiltz", "Kynetec", "Carallon", "eco2solar"];

export default function About() {
  return (
    <main id="main-content">
      <SEO
        title="About Us"
        description="We're NetSuite specialists helping UK businesses transform their operations since 2013. 230+ projects delivered with a 100% client focus."
        path="/about"
        keywords="NetSuite consultants UK, ERP experts, NetSuite partner, business transformation"
      />

      {/* Hero */}
      <section
        className="flex items-center relative overflow-hidden"
        style={{ paddingTop: "160px", paddingBottom: "30px" }}
      >
        {/* Offset triangle */}
        <div
          className="absolute top-1/2 hidden lg:block"
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
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.5 }}
          />
        </div>
        <div className="container relative z-10 overflow-hidden">
          <div className="max-w-3xl">
            <p className="text-label text-primary mb-md">About Us</p>
            <h1 className="text-hero mb-xl">
              We use NetSuite to run
              <br />
              <span className="text-primary">our own business.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted leading-relaxed max-w-2xl">
              Every system we build, we'd be proud to use ourselves. That's been the standard since
              2005, and it's why clients stay for years.
            </p>
          </div>
        </div>
      </section>

      {/* Oracle Partner Badge */}
      <section
        className="border-y border-(--color-text)/10"
        style={{ padding: "var(--space-2xl) 0", marginTop: "var(--space-xl)" }}
      >
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-center gap-lg md:gap-xl">
            <img src={netSuiteLogo} alt="NetSuite" className="h-10 md:h-12" />
            <div className="text-center md:text-left">
              <p className="font-heading text-2xl md:text-3xl font-bold text-primary">
                Oracle Partner since 2009
              </p>
              <p className="text-base md:text-lg text-muted">Hard to get. Harder to keep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What makes us different */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-xl lg:gap-2xl items-center">
            <div>
              <p className="text-label text-primary mb-md">What makes us different</p>
              <h3 className="mb-lg">We're practitioners, not just consultants</h3>
              <p className="text-lg md:text-xl text-muted leading-relaxed">
                We run our own business on NetSuite. We know what it's like to rely on it, wrestle
                with it, and make it work. That means we understand the real-world pressures you
                face - and we build systems that actually help.
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

      {/* What we believe */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-xl lg:gap-2xl items-center">
            <div className="lg:order-2">
              <p className="text-label text-primary mb-md">What we believe</p>
              <h3 className="mb-lg">ERP should make your life easier - not harder</h3>
              <p className="text-lg md:text-xl text-muted leading-relaxed">
                Too many implementations fail because they focus on the technology, not the people.
                We start with your team - how they work, what slows them down, and what would
                actually help - and build from there.
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

      {/* What to expect */}
      <section
        className="section-padding-lg relative overflow-hidden"
        style={{ backgroundColor: "rgba(232, 58, 122, 0.05)" }}
      >
        {/* Decorative triangle */}
        <div
          className="absolute top-1/2 left-0 opacity-15 hidden lg:block pointer-events-none"
          style={{
            width: "500px",
            height: "429px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(-40%) translateY(-50%)",
          }}
        />
        <div className="container relative z-10">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">What to expect</p>
            <h3>Working with us</h3>
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
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">Our Team</p>
            <h3>Senior consultants who stay the course</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md md:gap-lg">
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
      <section
        className="section-padding-lg relative overflow-hidden"
        style={{ backgroundColor: "rgba(230, 48, 125, 0.05)" }}
      >
        {/* Decorative triangle */}
        <div
          className="absolute top-1/2 right-0 opacity-20 hidden lg:block pointer-events-none"
          style={{
            width: "600px",
            height: "514px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(40%) translateY(-50%)",
          }}
        />

        <div className="container relative z-10">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">Our Clients</p>
            <h3>
              Trusted by <span className="text-primary">industry leaders</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md md:gap-lg">
            {clients.map((client, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl flex items-center justify-center px-xl py-2xl shadow-sm hover:-translate-y-1 transition-transform"
              >
                <span className="text-lg font-bold">{client}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-lg">
        <div className="container text-center">
          <h2 style={{ marginBottom: "var(--space-xl)" }}>
            Ready to <span className="text-primary">work together</span>?
          </h2>
          <p
            className="text-lg md:text-xl text-muted mx-auto max-w-2xl"
            style={{ marginBottom: "var(--space-2xl)" }}
          >
            If you're serious about getting NetSuite right, let's have a conversation about your
            business.
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            <TrackedLink
              to="/contact"
              trackingName="about_footer_start_conversation"
              trackingPage="about"
              className="btn btn-primary btn-lg w-full sm:w-auto justify-center"
            >
              Start a conversation
              <ArrowRight className="w-5 h-5" />
            </TrackedLink>
            <a
              href="https://ric-snwikqbv.scoreapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lg border-2 border-(--color-primary) text-primary w-full sm:w-auto justify-center"
              onClick={() => trackCTAClick("about_netscore_cta", "about")}
            >
              Get your free NETscore
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
