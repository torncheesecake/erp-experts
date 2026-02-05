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
  MessageSquareQuote,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedStats from "../../components/ui/AnimatedStats";
import SEO from "../../components/ui/SEO";
import TrackedLink from "../../components/ui/TrackedLink";
import { trackCTAClick } from "../../components/Analytics";
import netSuiteLogo from "../../assets/NetSuite-logo-half-light.png";

const stats = [
  { value: "20+", label: "Years in business" },
  { value: "350+", label: "Projects delivered" },
  { value: "100%", label: "Client retention" },
];

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

const differentiators = [
  "We run our own business on NetSuite",
  "The person who scopes it, delivers it",
  "Fixed pricing - no surprises",
  "Oracle Partner since 2009",
  "100% client retention post go-live",
];

export default function About() {
  return (
    <main id="main-content">
      <SEO
        title="About Us"
        description="We're NetSuite specialists helping UK businesses transform their operations since 2005. 350+ projects delivered with a 100% client focus."
        path="/about"
        keywords="NetSuite consultants UK, ERP experts, NetSuite partner, business transformation"
      />

      {/* Hero */}
      <section
        className="flex items-center relative overflow-hidden"
        style={{ paddingTop: "140px", paddingBottom: "var(--space-2xl)", minHeight: "50vh" }}
      >
        {/* Mobile triangle */}
        <div
          className="absolute lg:hidden"
          style={{
            top: "20%",
            right: "-20%",
            width: "300px",
            height: "260px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            opacity: 0.15,
          }}
        />
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
          <div className="max-w-3xl lg:max-w-5xl">
            <p className="text-label text-primary mb-md hidden md:block">About Us</p>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl leading-[1.1] font-bold lg:!text-[7rem] xl:!text-[9rem]"
              style={{ marginBottom: "var(--space-lg)" }}
            >
              We use NetSuite to run
              <br />
              <span className="text-primary">our own business.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted max-w-2xl m-0">
              Every system we build, we'd be proud to use ourselves. That's been the standard since
              2005, and it's why clients stay for years.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section
        className="section-padding relative overflow-hidden"
        style={{ backgroundColor: "rgba(232, 58, 122, 0.05)" }}
      >
        <div
          className="absolute top-1/2 right-0 opacity-10 hidden lg:block pointer-events-none"
          style={{
            width: "400px",
            height: "343px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(50%) translateY(-50%)",
          }}
        />
        <div className="container relative z-10">
          <p className="text-label text-primary text-center mb-xl">Our Track Record</p>
          <AnimatedStats stats={stats} color="primary" columns={3} />
        </div>
      </section>

      {/* What makes us different - Full width impact section */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div>
              <p className="text-label text-primary mb-md">What makes us different</p>
              <h2 className="mb-xl">
                Practitioners, <span className="text-primary">not just consultants.</span>
              </h2>
              <p className="text-lg md:text-xl text-muted leading-relaxed mb-xl">
                We run our own business on NetSuite. We know what it's like to rely on it, wrestle
                with it, and make it work. That means we understand the real-world pressures you
                face - and we build systems that actually help.
              </p>
              <ul className="flex flex-col gap-md">
                {differentiators.map((item, i) => (
                  <li key={i} className="flex items-center gap-md">
                    <div
                      className="shrink-0 flex items-center justify-center"
                      style={{
                        width: "28px",
                        height: "24px",
                        clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                        backgroundColor: "var(--color-primary)",
                      }}
                    >
                      <Check className="w-3 h-3 text-white mt-2" />
                    </div>
                    <span className="text-lg font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop"
                  alt="Team collaboration"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative triangle */}
              <div
                className="absolute -bottom-6 -right-6 hidden md:block"
                style={{
                  width: "120px",
                  height: "103px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "var(--color-primary)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quote Banner */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, #a01d5a 100%)",
          padding: "var(--space-3xl) 0",
        }}
      >
        <div
          className="absolute top-0 left-0 opacity-10 hidden md:block"
          style={{
            width: "300px",
            height: "258px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "white",
            transform: "translateX(-100px) translateY(-80px)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 opacity-10 hidden md:block"
          style={{
            width: "250px",
            height: "215px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "white",
            transform: "translateX(80px) translateY(60px)",
          }}
        />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <MessageSquareQuote className="w-12 h-12 text-white/30 mx-auto mb-lg" />
            <blockquote className="font-heading text-2xl md:text-3xl lg:text-4xl leading-snug text-white mb-xl">
              "ERP should make your life easier - not harder. Too many implementations fail because
              they focus on the technology, not the people."
            </blockquote>
            <p className="text-white/60 text-lg">Our founding principle since 2005</p>
          </div>
        </div>
      </section>

      {/* What to expect */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">What to expect</p>
            <h2>
              Working with <span className="text-primary">us.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-lg">
            {values.map((value, i) => (
              <div
                key={i}
                className="relative overflow-hidden p-xl md:p-2xl rounded-2xl border-2 border-(--color-text)/5 hover:border-(--color-primary)/20 transition-colors"
              >
                <div
                  className="flex items-end justify-center mb-lg"
                  style={{
                    width: "56px",
                    height: "48px",
                    clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                    backgroundColor: "var(--color-primary)",
                  }}
                >
                  <value.icon className="w-5 h-5 text-white mb-2" />
                </div>
                <h4 className="mb-md">{value.title}</h4>
                <p className="text-lg text-muted leading-relaxed m-0">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Expertise */}
      <section
        className="section-padding-lg relative overflow-hidden"
        style={{ backgroundColor: "rgba(232, 58, 122, 0.03)" }}
      >
        {/* Decorative triangle */}
        <div
          className="absolute top-1/2 right-0 opacity-10 hidden lg:block pointer-events-none"
          style={{
            width: "500px",
            height: "429px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(40%) translateY(-50%)",
          }}
        />
        <div className="container relative z-10">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">Our Team</p>
            <h2>
              Senior consultants who <span className="text-primary">stay the course.</span>
            </h2>
            <p className="text-lg text-muted mt-lg max-w-2xl mx-auto">
              No junior handoffs. The person who scopes your project is the person who delivers it.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {teamRoles.map((role, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl text-center p-xl hover:-translate-y-1 transition-transform"
              >
                <div
                  className="flex items-end justify-center mx-auto mb-lg"
                  style={{
                    width: "64px",
                    height: "55px",
                    clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                    backgroundColor: "var(--color-primary)",
                  }}
                >
                  <role.icon className="w-6 h-6 text-white mb-2" />
                </div>
                <h5 className="mb-sm">{role.title}</h5>
                <p className="text-base text-muted m-0">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Oracle Partner */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div className="text-center lg:text-left">
              <img
                src={netSuiteLogo}
                alt="NetSuite"
                className="h-16 md:h-20 mx-auto lg:mx-0 mb-lg"
              />
              <h3 className="mb-lg">
                Oracle Partner <span className="text-primary">since 2009.</span>
              </h3>
              <p className="text-lg text-muted leading-relaxed">
                Hard to get. Harder to keep. We've maintained our Oracle partnership for over 15
                years - proof of consistent delivery and ongoing expertise.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-md">
              <div className="bg-(--color-primary)/5 rounded-2xl p-lg text-center">
                <p className="font-heading text-4xl md:text-5xl text-primary mb-sm">15+</p>
                <p className="text-muted">Years as Oracle Partner</p>
              </div>
              <div className="bg-(--color-primary)/5 rounded-2xl p-lg text-center">
                <p className="font-heading text-4xl md:text-5xl text-primary mb-sm">350+</p>
                <p className="text-muted">Projects Delivered</p>
              </div>
              <div className="bg-(--color-primary)/5 rounded-2xl p-lg text-center">
                <p className="font-heading text-4xl md:text-5xl text-primary mb-sm">100%</p>
                <p className="text-muted">Client Retention</p>
              </div>
              <div className="bg-(--color-primary)/5 rounded-2xl p-lg text-center">
                <p className="font-heading text-4xl md:text-5xl text-primary mb-sm">0</p>
                <p className="text-muted">Projects Abandoned</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="rounded-3xl md:rounded-[3rem] overflow-hidden relative">
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, #a01d5a 100%)",
              }}
            />
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
                <h2 className="text-white" style={{ marginBottom: "var(--space-lg)" }}>
                  Ready to <span className="text-white/80">work together</span>?
                </h2>
                <p
                  className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto"
                  style={{ marginBottom: "var(--space-xl)" }}
                >
                  If you're serious about getting NetSuite right, let's have a conversation about
                  your business.
                </p>

                <div className="flex flex-col sm:flex-row gap-md justify-center">
                  <TrackedLink
                    to="/contact"
                    trackingName="about_footer_start_conversation"
                    trackingPage="about"
                    className="btn btn-lg justify-center bg-white text-primary hover:scale-105 transition-transform text-lg px-8 py-4"
                  >
                    Start a conversation
                    <ArrowRight className="w-6 h-6" />
                  </TrackedLink>
                  <a
                    href="https://ric-snwikqbv.scoreapp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-lg justify-center bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 transition-all"
                    onClick={() => trackCTAClick("about_netscore_cta", "about")}
                  >
                    Get your free NETscore
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
