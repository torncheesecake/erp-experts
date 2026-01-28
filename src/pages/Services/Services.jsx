/**
 * ERP Experts Services Page
 */

import { Link } from "react-router-dom";
import {
  ArrowRight,
  Rocket,
  HeartHandshake,
  Lightbulb,
  Code2,
  Puzzle,
  GraduationCap,
  Check,
  MessageSquareQuote,
  ClipboardList,
  Settings,
  Users,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Headphones,
  Database,
  BarChart3,
  UserCog,
  Truck,
} from "lucide-react";
import SEO from "../../components/ui/SEO";

const coreServices = [
  {
    id: "implementation",
    icon: Rocket,
    title: "Implementation",
    tagline: "Start strong with NetSuite",
    desc: "End-to-end NetSuite deployment",
    color: "tertiary",
  },
  {
    id: "consultancy",
    icon: Lightbulb,
    title: "Consultancy",
    tagline: "Smarter systems start here",
    desc: "Strategic guidance and process optimisation",
    color: "primary",
  },
  {
    id: "development",
    icon: Code2,
    title: "Development",
    tagline: "NetSuite, built your way",
    desc: "Custom scripts, workflows and integrations",
    color: "primary",
  },
  {
    id: "integrations",
    icon: Puzzle,
    title: "Integrations",
    tagline: "Extend your capabilities",
    desc: "Connect NetSuite with your business tools",
    color: "primary",
  },
  {
    id: "training",
    icon: GraduationCap,
    title: "Training",
    tagline: "The right skills for results",
    desc: "Empower your team to use NetSuite confidently",
    color: "primary",
  },
  {
    id: "aftercare",
    icon: HeartHandshake,
    title: "Aftercare",
    tagline: "Success beyond go-live",
    desc: "Ongoing support and optimisation",
    color: "secondary",
  },
];

const oracleFusionServices = [
  {
    icon: Database,
    title: "Fusion ERP",
    desc: "Modern, cloud-based finance, procurement, and project management. Real-time control as your business grows.",
  },
  {
    icon: BarChart3,
    title: "Fusion EPM",
    desc: "Advanced planning, budgeting, forecasting, and analytics for smarter decisions.",
  },
  {
    icon: UserCog,
    title: "Fusion HCM",
    desc: "End-to-end HR and talent management. From payroll to workforce planning.",
  },
  {
    icon: Truck,
    title: "Fusion SCM",
    desc: "Complete supply chain visibility and automation. Optimise procurement, logistics, and inventory.",
  },
];

const processSteps = [
  {
    num: "01",
    title: "Consultancy",
    desc: "We understand your business, processes, and market. A comprehensive review ensures NetSuite integrates perfectly.",
    icon: Lightbulb,
  },
  {
    num: "02",
    title: "Configuration",
    desc: "Our analysts align NetSuite with your business map, including full data migration from your existing systems.",
    icon: Settings,
  },
  {
    num: "03",
    title: "Customisation",
    desc: "Where needed, our engineers build bespoke features using agile sprints to rapidly prototype and deliver.",
    icon: Code2,
  },
  {
    num: "04",
    title: "Coaching",
    desc: "Before go-live, we train key personnel in a sandbox environment as part of customer acceptance testing.",
    icon: GraduationCap,
  },
  {
    num: "05",
    title: "Care",
    desc: "Tailored aftercare plans with consultancy, development, coaching, and technical support as your business grows.",
    icon: HeartHandshake,
  },
];

export default function Services() {
  return (
    <main id="main-content">
      <SEO
        title="Our Services"
        description="Tailored NetSuite services for smarter growth. Implementation, consultancy, development, integrations, training, and aftercare support."
        path="/services"
        keywords="NetSuite services, ERP implementation, NetSuite consultancy, NetSuite development, NetSuite training"
      />

      {/* Hero */}
      <section className="min-h-[50vh] md:min-h-[60vh] flex items-center relative overflow-hidden pt-(--space-4xl)">
        {/* Offset pink triangle */}
        <div
          className="absolute top-1/2 hidden lg:block"
          style={{
            left: "75%",
            transform: "translateX(calc(-50% + 80px)) translateY(calc(-50% + 30px))",
            width: "900px",
            height: "772px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            opacity: 0.25,
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
            style={{ opacity: 0.6 }}
          />
        </div>
        <div className="container relative z-10">
          <div>
            <p className="text-label text-primary mb-md">Our Services</p>
            <h1 className="text-hero max-w-[1000px]" style={{ marginBottom: "var(--space-2xl)" }}>
              Tailored services for
              <br />
              <span className="text-primary">smarter growth</span>.
            </h1>
            <Link to="/contact" className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Start a conversation
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-3xl md:h-4xl" />

      {/* Core Services Grid */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="mb-2xl md:mb-3xl">
            <p className="text-label text-primary mb-sm md:mb-md">What we do</p>
            <h3>
              Six services. <span className="text-primary">One focus.</span>
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-lg md:gap-xl">
            {coreServices.map((service, i) => {
              const colorVar =
                service.color === "secondary"
                  ? "--color-secondary"
                  : service.color === "tertiary"
                    ? "--color-tertiary"
                    : "--color-primary";
              const textClass =
                service.color === "secondary"
                  ? "text-secondary"
                  : service.color === "tertiary"
                    ? "text-tertiary"
                    : "text-primary";
              return (
                <Link
                  key={i}
                  to={`#${service.id}`}
                  className={`group block card p-(--space-xl) md:p-(--space-2xl) relative overflow-hidden border-2 border-(--color-text)/10 hover:border-(${colorVar})/40 transition-all duration-300`}
                >
                  {/* Background number */}
                  <span
                    className={`absolute -top-4 -right-2 font-heading text-[6rem] md:text-[8rem] leading-none pointer-events-none text-(${colorVar})`}
                    style={{ opacity: 0.05 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative z-10">
                    <div
                      className={`icon-box icon-box-md rounded-2xl mb-md md:mb-lg bg-(${colorVar})/10`}
                    >
                      <service.icon className={`w-6 h-6 md:w-7 md:h-7 ${textClass}`} />
                    </div>
                    <h4 className="mb-sm">{service.title}</h4>
                    <p className={`text-sm font-medium mb-md ${textClass}`}>{service.tagline}</p>
                    <p className="text-base text-muted leading-relaxed">{service.desc}</p>
                    {(service.color === "secondary" || service.color === "tertiary") && (
                      <div className={`flex items-center gap-sm font-bold ${textClass} mt-lg`}>
                        Learn more
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
        {/* Decorative triangle */}
        <div
          className="absolute bottom-0 right-0 opacity-[0.03] hidden lg:block pointer-events-none"
          style={{
            width: "70%",
            height: "140%",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(25%) translateY(15%)",
          }}
        />
        <div className="container relative z-10">
          <div className="text-center" style={{ marginBottom: "var(--space-4xl)" }}>
            <p className="text-label text-primary mb-md">Our methodology</p>
            <h3>
              The <span className="text-primary">5C</span>
              <br />
              Implementation Process
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-md md:gap-xl">
            {processSteps.map((step, i) => (
              <div key={i} className={`relative ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}>
                {/* Connector line */}
                {i < processSteps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-(--color-tertiary)/20"
                    style={{ transform: "translateX(-50%)" }}
                  />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full bg-(--color-tertiary)/10 mb-md md:mb-xl relative">
                    <step.icon className="w-6 h-6 md:w-8 md:h-8 text-tertiary" />
                    <span className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-7 h-7 md:w-9 md:h-9 rounded-full bg-(--color-primary) text-white text-xs md:text-sm font-bold flex items-center justify-center">
                      {step.num.replace("0", "")}
                    </span>
                  </div>
                  <h4 className="mb-sm md:mb-md text-lg md:text-xl">{step.title}</h4>
                  <p className="text-base md:text-lg text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Detail */}
      <section
        id="implementation"
        className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden"
      >
        {/* Large decorative icon */}
        <Rocket
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[30rem] h-[30rem] text-tertiary opacity-[0.04] pointer-events-none hidden lg:block"
          strokeWidth={0.5}
        />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-2xl lg:gap-3xl items-center">
            <div>
              <p className="text-label text-tertiary mb-md">Implementation</p>
              <h3 style={{ marginBottom: "var(--space-3xl)" }}>
                Start strong with <span className="text-tertiary">NetSuite.</span>
              </h3>
              <Link
                to="/contact"
                className="btn btn-lg w-full sm:w-auto justify-center bg-(--color-tertiary) text-white hover:opacity-90"
              >
                Book your setup call
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-md md:gap-lg">
              {[
                {
                  icon: Shield,
                  value: "100%",
                  label: "Success rate",
                  desc: "Every project delivered",
                },
                {
                  icon: Clock,
                  value: "12wk",
                  label: "Avg go-live",
                  desc: "Fast, focused delivery",
                },
                {
                  icon: Users,
                  value: "Senior",
                  label: "Consultants",
                  desc: "The team you meet delivers",
                },
                {
                  icon: TrendingUp,
                  value: "Fixed",
                  label: "Pricing",
                  desc: "No scope creep charges",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="card border-2 border-(--color-text)/10 text-center p-md md:p-xl"
                >
                  <div className="icon-box icon-box-sm md:icon-box-md rounded-xl bg-(--color-tertiary)/10 mx-auto mb-md md:mb-lg">
                    <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-tertiary" />
                  </div>
                  <p className="font-heading text-2xl md:text-4xl text-tertiary mb-xs md:mb-sm">
                    {stat.value}
                  </p>
                  <p className="font-bold text-base md:text-lg mb-xs">{stat.label}</p>
                  <p className="text-sm md:text-base text-muted">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section
        id="integrations"
        className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden"
      >
        <div className="container relative z-10">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">Integrations</p>
            <h3>
              Connect NetSuite to <span className="text-primary">everything.</span>
            </h3>
          </div>
        </div>

        {/* Marquee banner */}
        <div className="relative overflow-hidden py-2xl">
          <div
            className="flex gap-xl animate-marquee"
            style={{
              animation: "marquee 30s linear infinite",
            }}
          >
            {[
              "Shopify",
              "Salesforce",
              "Stripe",
              "Zendesk",
              "Magento",
              "HubSpot",
              "Celigo",
              "Cyclr",
              "PayPal",
              "WooCommerce",
              "BigCommerce",
              "Xero",
              "Shopify",
              "Salesforce",
              "Stripe",
              "Zendesk",
              "Magento",
              "HubSpot",
              "Celigo",
              "Cyclr",
              "PayPal",
              "WooCommerce",
              "BigCommerce",
              "Xero",
            ].map((platform, i) => (
              <div
                key={i}
                className="shrink-0 rounded-xl bg-(--color-primary)/5 border border-(--color-primary)/10"
                style={{ padding: "var(--space-lg) var(--space-2xl)" }}
              >
                <p className="font-bold text-lg whitespace-nowrap">{platform}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training */}
      <section
        id="training"
        className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden"
      >
        <GraduationCap
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[28rem] h-[28rem] text-primary opacity-[0.04] pointer-events-none hidden lg:block"
          strokeWidth={0.5}
        />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-2xl lg:gap-3xl items-center">
            <div>
              <p className="text-label text-primary mb-md">Training</p>
              <h3 style={{ marginBottom: "var(--space-xl)" }}>
                The right skills for <span className="text-primary">the right results.</span>
              </h3>
              <Link
                to="/contact"
                className="btn btn-lg w-full sm:w-auto justify-center bg-(--color-primary) text-white hover:opacity-90"
              >
                Book a training session
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-lg">
              {[
                {
                  title: "Role-specific",
                  desc: "Tailored to each user's daily tasks and responsibilities",
                },
                {
                  title: "Flexible format",
                  desc: "One-on-one sessions or group workshops - your choice",
                },
                {
                  title: "Documentation",
                  desc: "Comprehensive guides and materials to reference anytime",
                },
                {
                  title: "Ongoing support",
                  desc: "Refresher courses and new starter training as you grow",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="card border-2 border-(--color-text)/10 hover:border-(--color-primary)/30 transition-colors p-xl"
                >
                  <h5 className="text-primary mb-md">{item.title}</h5>
                  <p className="text-base text-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Aftercare */}
      <section
        id="aftercare"
        className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden"
        style={{ backgroundColor: "rgba(109, 40, 217, 0.06)" }}
      >
        {/* Decorative hands icon */}
        <HeartHandshake
          className="absolute -right-16 top-1/2 -translate-y-1/2 w-[32rem] h-[32rem] text-secondary opacity-[0.08] pointer-events-none hidden lg:block"
          strokeWidth={0.5}
        />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-2xl lg:gap-4xl items-center">
            <div>
              <p className="text-label text-secondary mb-md">Aftercare</p>
              <h3 style={{ marginBottom: "var(--space-xl)" }}>
                Success beyond
                <br />
                <span className="text-secondary">go-live.</span>
              </h3>
              <p className="text-lg text-muted mb-xl max-w-lg">
                Your NetSuite journey doesn't end at launch. Our aftercare team ensures your system
                evolves with your business.
              </p>
              <Link
                to="/support"
                className="btn btn-lg w-full sm:w-auto justify-center bg-(--color-secondary) text-white hover:opacity-90"
              >
                Find your support plan
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-md md:gap-lg">
              {[
                {
                  icon: Headphones,
                  value: "4hr",
                  label: "Response time",
                  desc: "For critical issues",
                },
                {
                  icon: Users,
                  value: "Dedicated",
                  label: "Team",
                  desc: "People who know your system",
                },
                {
                  icon: TrendingUp,
                  value: "Proactive",
                  label: "Reviews",
                  desc: "We suggest improvements",
                },
                {
                  icon: Zap,
                  value: "Continuous",
                  label: "Improvements",
                  desc: "Your system keeps evolving",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="card text-center p-lg md:p-xl bg-white border-2 border-(--color-text)/10"
                >
                  <div className="icon-box icon-box-sm md:icon-box-md rounded-xl mx-auto mb-md md:mb-lg bg-(--color-secondary)/10">
                    <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                  </div>
                  <p className="font-heading text-2xl md:text-4xl text-secondary mb-xs md:mb-sm">
                    {stat.value}
                  </p>
                  <p className="font-bold text-base md:text-lg mb-xs">{stat.label}</p>
                  <p className="text-sm md:text-base text-muted">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Oracle Fusion */}
      <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 opacity-[0.03] hidden lg:block pointer-events-none"
          style={{
            width: "50%",
            height: "120%",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(-25%) translateY(-15%)",
          }}
        />
        <div className="container relative z-10">
          <div className="mb-2xl md:mb-3xl">
            <p className="text-label text-primary mb-md">Beyond NetSuite</p>
            <h3>
              Oracle Fusion <span className="text-primary">Consulting</span>
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {oracleFusionServices.map((service, i) => (
              <div
                key={i}
                className="card border-2 border-(--color-text)/10 hover:border-(--color-primary)/30 hover:-translate-y-1 transition-all p-xl"
              >
                <div className="icon-box icon-box-lg rounded-xl bg-(--color-primary)/10 mb-lg">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>
                <h5 className="mb-md">{service.title}</h5>
                <p className="text-base text-muted leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <MessageSquareQuote className="w-16 h-16 md:w-20 md:h-20 text-primary mx-auto mb-2xl" />
            <blockquote className="font-heading text-2xl md:text-3xl lg:text-4xl leading-snug mb-2xl">
              "From day one, the team was hands-on and genuinely invested. The implementation was
              <span className="text-primary"> smooth, on-time, and on-budget</span>. They've become
              an extension of our team."
            </blockquote>
            <div className="flex items-center justify-center gap-lg">
              <div
                className="relative flex items-end justify-center"
                style={{
                  width: "64px",
                  height: "56px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "var(--color-primary)",
                }}
              >
                <Users className="w-6 h-6 text-white mb-2" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold">Sarah Mitchell</p>
                <p className="text-base text-muted">Operations Director, TechParts UK</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container text-center">
          <h1 className="text-hero" style={{ marginBottom: "var(--space-3xl)" }}>
            Ready to<span className="text-primary"> get started</span>?
          </h1>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            <Link to="/contact" className="btn btn-primary justify-center">
              Book a call
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/case-studies" className="btn btn-outline justify-center">
              See our work
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
