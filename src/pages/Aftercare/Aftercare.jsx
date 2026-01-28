/**
 * ERP Experts Aftercare Page
 * Covers: Ongoing support, optimisation, maintenance for existing NetSuite users
 */

import {
  ArrowRight,
  HeartHandshake,
  Clock,
  Wrench,
  TrendingUp,
  Phone,
  Users,
  Check,
  Shield,
  Zap,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedStats from "../../components/ui/AnimatedStats";
import SEO from "../../components/ui/SEO";

const supportPlans = [
  {
    name: "Bronze",
    desc: "For businesses needing occasional help",
    features: [
      "Email support",
      "48-hour response time",
      "Monthly health check",
      "Access to knowledge base",
    ],
  },
  {
    name: "Silver",
    desc: "For growing businesses needing regular support",
    features: [
      "Email & phone support",
      "24-hour response time",
      "Weekly health checks",
      "Dedicated account manager",
      "Quarterly reviews",
    ],
  },
  {
    name: "Gold",
    desc: "For businesses requiring priority support",
    features: [
      "Priority phone support",
      "4-hour response time",
      "Daily monitoring",
      "Dedicated team",
      "Monthly strategy sessions",
      "Unlimited support hours",
    ],
    popular: true,
  },
];

const services = [
  {
    icon: Phone,
    title: "Day-to-day Support",
    desc: "Quick answers to your questions. Help when things go wrong. Someone who knows your system inside out.",
  },
  {
    icon: Wrench,
    title: "System Maintenance",
    desc: "Regular updates, performance monitoring, and proactive fixes. We keep your NetSuite running smoothly.",
  },
  {
    icon: TrendingUp,
    title: "Continuous Improvement",
    desc: "Your business evolves, so should your system. We optimise workflows and add features as you grow.",
  },
  {
    icon: Users,
    title: "User Training",
    desc: "New starters, refresher courses, advanced features. We keep your team confident and capable.",
  },
];

const benefits = [
  { icon: Clock, title: "Fast response", desc: "Hours, not days" },
  { icon: Shield, title: "Proactive care", desc: "We spot issues first" },
  { icon: Zap, title: "Expert team", desc: "NetSuite specialists only" },
  { icon: Calendar, title: "Flexible plans", desc: "Scale up or down" },
];

const stats = [
  { value: "4hr", label: "Avg response time" },
  { value: "98%", label: "First-call resolution" },
  { value: "100+", label: "Clients supported" },
  { value: "24/7", label: "Monitoring available" },
];

export default function Aftercare() {
  return (
    <main id="main-content">
      <SEO
        title="Aftercare & Support"
        description="Ongoing NetSuite support and optimisation. 4hr average response time, 98% first-call resolution. We're here for the long haul."
        path="/services/aftercare"
        keywords="NetSuite support, NetSuite maintenance, ERP aftercare, ongoing support"
      />

      {/* Hero */}
      <section className="pt-(--space-4xl) pb-(--space-2xl) md:pb-(--space-3xl)">
        <div className="container">
          <p className="text-label text-secondary mb-md md:mb-lg">Aftercare & Support</p>
          <h1 className="text-hero" style={{ marginBottom: "var(--space-4xl)" }}>
            We're here
            <br />
            <span className="text-secondary">for the long haul</span>.
          </h1>
          <Link
            to="/contact"
            className="btn btn-lg text-white w-full sm:w-auto justify-center"
            style={{ backgroundColor: "var(--color-secondary)" }}
          >
            Get support
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding" style={{ backgroundColor: "rgba(126, 34, 206, 0.05)" }}>
        <div className="container">
          <p className="text-label text-secondary text-center mb-xl">Our Track Record</p>
          <AnimatedStats stats={stats} color="secondary" />
        </div>
      </section>

      {/* Services */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="text-center mb-xl md:mb-2xl">
            <p className="text-label text-secondary mb-sm md:mb-md">What's Included</p>
            <h3>Complete ongoing support</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-md md:gap-xl">
            {services.map((service, i) => (
              <div key={i} className="card p-(--space-xl) md:p-(--space-2xl)">
                <div className="icon-box icon-box-md rounded-2xl bg-(--color-secondary)/10 mb-lg md:mb-xl">
                  <service.icon className="w-6 md:w-8 h-6 md:h-8 text-secondary" />
                </div>
                <h5 className="mb-md md:mb-lg">{service.title}</h5>
                <p className="text-base text-muted leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Aftercare */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-xl md:gap-2xl items-center">
            <div>
              <p className="text-label text-secondary mb-sm md:mb-md">Why Aftercare?</p>
              <h3 style={{ marginBottom: "var(--space-3xl)" }}>Your system needs ongoing care</h3>
              <div className="flex flex-col gap-3 md:gap-5">
                {[
                  "Expert help when you need it",
                  "Proactive monitoring and maintenance",
                  "Continuous system improvements",
                  "Training for new and existing staff",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-md md:gap-lg">
                    <div className="icon-box icon-box-sm rounded-full bg-(--color-secondary)">
                      <Check className="w-3 md:w-4 h-3 md:h-4 text-white" />
                    </div>
                    <span className="text-base font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-light flex items-center justify-center">
                <HeartHandshake
                  className="w-24 md:w-32 h-24 md:h-32 text-secondary/20"
                  strokeWidth={1}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Plans */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="text-center mb-xl md:mb-2xl">
            <p className="text-label text-secondary mb-sm md:mb-md">Support Plans</p>
            <h3>Choose your level of support</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-md md:gap-xl">
            {supportPlans.map((plan, i) => (
              <div
                key={i}
                className={`card p-(--space-xl) md:p-(--space-2xl) relative ${
                  plan.popular ? "border-2 border-(--color-secondary)" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-(--color-secondary) text-white text-xs md:text-sm font-bold px-3 md:px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h5 className="text-xl md:text-2xl mb-xs md:mb-sm">{plan.name}</h5>
                <p className="text-base text-muted mb-lg md:mb-xl">{plan.desc}</p>
                <div className="flex flex-col gap-3 md:gap-4">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-sm md:gap-md">
                      <Check className="w-4 md:w-5 h-4 md:h-5 text-secondary shrink-0" />
                      <span className="text-base">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-xl md:mb-2xl">
            <p className="text-label text-secondary mb-sm md:mb-md">Why Us</p>
            <h3>The ERP Experts difference</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-md md:gap-xl">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-(--color-bg-light) rounded-2xl p-(--space-lg) md:p-(--space-xl) text-center"
              >
                <div className="icon-box icon-box-md rounded-full bg-(--color-secondary) mx-auto mb-md md:mb-lg">
                  <benefit.icon className="w-5 md:w-6 h-5 md:h-6 text-white" />
                </div>
                <p className="text-base font-bold mb-xs md:mb-sm">{benefit.title}</p>
                <p className="text-base text-muted">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-lg">
        <div className="container text-center">
          <h2 className="mb-xl md:mb-2xl">
            Ready for ongoing <span className="text-secondary">peace of mind</span>?
          </h2>
          <div className="flex flex-col sm:flex-row gap-md md:gap-lg justify-center">
            <Link
              to="/contact"
              className="btn btn-lg text-white w-full sm:w-auto justify-center"
              style={{ backgroundColor: "var(--color-secondary)" }}
            >
              Talk to us about support
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Link
              to="/support"
              className="btn btn-lg border-2 border-(--color-text) text-(--color-text) w-full sm:w-auto justify-center"
            >
              View support plans
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
