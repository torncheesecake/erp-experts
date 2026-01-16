/**
 * ERP Experts NetSuite Services Page
 * Covers: Implementation, Configuration, Integrations, Training, Health Audits, Rescue
 */

import {
  ArrowRight,
  Rocket,
  Settings,
  Link2,
  GraduationCap,
  Stethoscope,
  LifeBuoy,
  Check,
  Users,
  Target,
  Zap,
  Shield,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

const services = [
  {
    icon: Rocket,
    title: "Implementation",
    desc: "End-to-end NetSuite deployment tailored to your business. We handle everything from scoping and configuration to data migration and go-live.",
  },
  {
    icon: Settings,
    title: "Configuration",
    desc: "Custom workflows, saved searches, dashboards, and forms. We configure NetSuite to match exactly how your business operates.",
  },
  {
    icon: Link2,
    title: "Integrations",
    desc: "Connect NetSuite with your existing tools. eCommerce platforms, CRMs, warehouses, payment gateways - we make your systems talk.",
  },
  {
    icon: GraduationCap,
    title: "Training",
    desc: "Role-specific training that sticks. We teach your team how to use NetSuite in the context of their actual daily work.",
  },
  {
    icon: Stethoscope,
    title: "Health Audits",
    desc: "Comprehensive system reviews to identify issues, inefficiencies, and opportunities. Get a clear roadmap for improvement.",
  },
  {
    icon: LifeBuoy,
    title: "Rescue Projects",
    desc: "Troubled implementation? We've rescued dozens of failed projects. We'll get you back on track quickly and properly.",
  },
];

const processSteps = [
  {
    num: "01",
    title: "Discovery",
    desc: "We learn your business inside out. Processes, pain points, goals - everything that shapes your NetSuite solution.",
  },
  {
    num: "02",
    title: "Design",
    desc: "We map out your ideal system. Workflows, integrations, customisations - all documented before we build.",
  },
  {
    num: "03",
    title: "Build",
    desc: "We configure NetSuite to your specifications. Iterative development with regular demos and feedback loops.",
  },
  {
    num: "04",
    title: "Test",
    desc: "Rigorous testing across all scenarios. User acceptance testing ensures everything works as expected.",
  },
  {
    num: "05",
    title: "Go-Live",
    desc: "Smooth transition with data migration, training, and hyper-care support. We're with you every step.",
  },
];

const benefits = [
  { icon: Users, title: "Partner-led delivery", desc: "Senior consultants on every project" },
  { icon: Target, title: "Fixed pricing", desc: "No surprises, no scope creep" },
  { icon: Zap, title: "Faster go-live", desc: "Proven methodology, predictable timelines" },
  { icon: Shield, title: "Risk-free", desc: "We guarantee our work" },
];

const stats = [
  { value: "230+", label: "Implementations" },
  { value: "94%", label: "On-time delivery" },
  { value: "100%", label: "Success rate" },
  { value: "20+", label: "Years experience" },
];

export default function NetSuiteServices() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="pt-(--space-4xl) pb-(--space-2xl) md:pb-(--space-3xl)">
        <div className="container">
          <div className="max-w-5xl">
            <p className="text-label text-primary mb-md md:mb-lg">NetSuite Services</p>
            <h1 className="text-hero mb-xl md:mb-2xl">
              NetSuite
              <br />
              <span className="text-primary">done right.</span>
            </h1>
            <p
              className="text-lg md:text-xl text-muted mb-xl md:mb-2xl"
              style={{ maxWidth: "800px" }}
            >
              From first implementation to rescue projects, we deliver NetSuite solutions that
              actually work. Partner-led, fixed-price, guaranteed.
            </p>
            <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Get started
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

      {/* Services Grid */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="text-center mb-xl md:mb-2xl">
            <p className="text-label text-primary mb-sm md:mb-md">What We Do</p>
            <h2>Complete NetSuite expertise</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-md md:gap-xl">
            {services.map((service, i) => (
              <div key={i} className="card p-(--space-xl) md:p-(--space-2xl)">
                <div className="icon-box icon-box-md rounded-2xl bg-(--color-primary)/10 mb-lg md:mb-xl">
                  <service.icon className="w-6 md:w-8 h-6 md:h-8 text-primary" />
                </div>
                <h5 className="mb-md md:mb-lg">{service.title}</h5>
                <p className="text-base text-muted leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-xl md:mb-2xl">
            <p className="text-label text-primary mb-sm md:mb-md">Our Process</p>
            <h2>How we deliver</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-md md:gap-lg">
            {processSteps.map((step, i) => (
              <div key={i} className="text-center">
                <p className="font-heading text-3xl md:text-4xl text-primary/30 mb-sm md:mb-md">
                  {step.num}
                </p>
                <h5 className="mb-xs md:mb-sm">{step.title}</h5>
                <p className="text-base text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Deep Dive */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-xl md:gap-2xl items-center">
            <div>
              <p className="text-label text-primary mb-sm md:mb-md">Implementation</p>
              <h2 className="mb-lg md:mb-xl">Your first NetSuite project</h2>
              <p className="text-base md:text-lg text-muted mb-md md:mb-lg">
                Starting with NetSuite is a big decision. We make it straightforward. Our proven
                methodology has delivered 230+ successful implementations across every industry.
              </p>
              <p className="text-base md:text-lg text-muted mb-lg md:mb-xl">
                You get senior consultants from day one - not juniors learning on your project.
                Fixed pricing means you know exactly what you're paying. And our guarantee means
                you're protected if anything goes wrong.
              </p>
              <div className="flex flex-col gap-3 md:gap-5">
                {[
                  "Scoping & requirements",
                  "Data migration",
                  "Custom configuration",
                  "User training",
                  "Go-live support",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-md md:gap-lg">
                    <div className="icon-box icon-box-sm rounded-full bg-(--color-primary)">
                      <Check className="w-3 md:w-4 h-3 md:h-4 text-white" />
                    </div>
                    <span className="text-base font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-(--color-text)/5 flex items-center justify-center">
                <Rocket className="w-24 md:w-32 h-24 md:h-32 text-primary/20" strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-xl md:gap-2xl items-center">
            <div className="lg:order-2">
              <p className="text-label text-primary mb-sm md:mb-md">Integrations</p>
              <h2 className="mb-lg md:mb-xl">Connect everything</h2>
              <p className="text-base md:text-lg text-muted mb-md md:mb-lg">
                NetSuite becomes even more powerful when it talks to your other systems. We build
                robust integrations that sync data automatically and eliminate manual work.
              </p>
              <p className="text-base md:text-lg text-muted">
                Whether it's Shopify, Salesforce, Amazon, your warehouse system, or a custom API -
                we've connected them all. Real-time or scheduled syncs, error handling, monitoring -
                all built to enterprise standards.
              </p>
            </div>
            <div className="lg:order-1">
              <div className="aspect-square rounded-3xl bg-light flex items-center justify-center">
                <Link2 className="w-24 md:w-32 h-24 md:h-32 text-primary/20" strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rescue Projects */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-xl md:gap-2xl items-center">
            <div>
              <p className="text-label text-primary mb-sm md:mb-md">Rescue Projects</p>
              <h2 className="mb-lg md:mb-xl">We fix broken implementations</h2>
              <p className="text-base md:text-lg text-muted mb-md md:mb-lg">
                Not every NetSuite project goes to plan. Maybe your original partner disappeared.
                Maybe the system doesn't work as promised. Maybe you've been stuck in "phase 2" for
                years.
              </p>
              <p className="text-base md:text-lg text-muted mb-lg md:mb-xl">
                We've rescued dozens of troubled implementations. We'll assess what's wrong, create
                a clear plan to fix it, and get you to where you should have been from the start.
              </p>
              <button className="btn btn-accent w-full sm:w-auto justify-center">
                Get rescue assessment
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-dark flex items-center justify-center">
                <LifeBuoy className="w-24 md:w-32 h-24 md:h-32 text-white/20" strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-xl md:mb-2xl">
            <p className="text-label text-primary mb-sm md:mb-md">Why Us</p>
            <h2>The ERP Experts difference</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-md md:gap-xl">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-(--color-bg-light) rounded-2xl p-(--space-lg) md:p-(--space-xl) text-center"
              >
                <div className="icon-box icon-box-md rounded-full bg-(--color-primary) mx-auto mb-md md:mb-lg">
                  <benefit.icon className="w-5 md:w-6 h-5 md:h-6 text-white" />
                </div>
                <p className="text-base font-bold mb-sm">{benefit.title}</p>
                <p className="text-base text-muted">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-lg">
        <div className="container text-center">
          <h1 className="text-hero mb-xl md:mb-2xl">
            Ready to start your
            <span className="block text-primary">NetSuite journey?</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-md md:gap-lg justify-center">
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
