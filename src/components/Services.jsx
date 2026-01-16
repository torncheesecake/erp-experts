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
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

const coreServices = [
  {
    id: "implementation",
    icon: Rocket,
    title: "Implementation",
    tagline: "Start strong with NetSuite",
    desc: "Launch your NetSuite system smoothly, without downtime or chaos. Every step - from migrating your data to setting up custom features - is handled for you, so your workflow stays on track.",
    benefits: [
      "Full system setup & configuration",
      "Data migration from any system",
      "Custom workflows built in",
      "Team trained and confident",
    ],
    color: "tertiary",
  },
  {
    id: "consultancy",
    icon: Lightbulb,
    title: "Consultancy",
    tagline: "Smarter systems start here",
    desc: "Every business has unique challenges. We get to the heart of your operations, uncovering inefficiencies and aligning NetSuite with your goals. Clarity, optimised workflows, and long-term success.",
    benefits: [
      "Business process analysis",
      "System architecture design",
      "Roadmap & strategy planning",
      "ROI-focused recommendations",
    ],
    color: "primary",
  },
  {
    id: "development",
    icon: Code2,
    title: "Development",
    tagline: "NetSuite, built your way",
    desc: "No two businesses are the same. We create custom workflows, automate repetitive tasks, and build bespoke solutions that make NetSuite work perfectly for you.",
    benefits: [
      "Custom SuiteScripts & workflows",
      "Bespoke reports & dashboards",
      "Process automation",
      "Third-party integrations",
    ],
    color: "primary",
  },
  {
    id: "integrations",
    icon: Puzzle,
    title: "Integrations",
    tagline: "Extend your capabilities",
    desc: "Connect NetSuite with your essential business applications. From Salesforce to Stripe to Zendesk, we create a unified system that enhances efficiency and data accuracy.",
    benefits: [
      "eCommerce platforms",
      "CRM & sales tools",
      "Payment gateways",
      "Warehouse & logistics",
    ],
    color: "primary",
  },
  {
    id: "training",
    icon: GraduationCap,
    title: "Training",
    tagline: "The right skills for results",
    desc: "NetSuite is powerful, but the right training makes all the difference. Tailored programmes designed to fit your team's needs, from one-on-one sessions to group workshops.",
    benefits: [
      "Role-specific training",
      "One-on-one & group sessions",
      "Documentation & guides",
      "Ongoing refresher courses",
    ],
    color: "primary",
  },
  {
    id: "aftercare",
    icon: HeartHandshake,
    title: "Aftercare",
    tagline: "Success beyond go-live",
    desc: "Your ERP journey doesn't stop at go-live. Flexible support plans covering troubleshooting, proactive reviews, and performance optimisation as your business evolves.",
    benefits: [
      "Fast, expert support",
      "Proactive system reviews",
      "Performance optimisation",
      "Continuous improvements",
    ],
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
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="min-h-[50vh] md:min-h-[60vh] flex items-center relative overflow-hidden pt-(--space-4xl)">
        {/* Offset pink triangle */}
        <div
          className="absolute top-1/2 hidden md:block"
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
            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1000&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.6 }}
          />
        </div>
        <div className="container relative z-10">
          <div>
            <p className="text-label text-primary mb-md">Our Services</p>
            <h1 className="text-hero max-w-[1000px] mb-xl md:mb-2xl">
              Tailored services for
              <br />
              <span className="text-primary">smarter growth.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted leading-relaxed max-w-[800px] mb-2xl">
              From first steps to full mastery. Implementation, consultancy, development, and beyond
              - everything you need to make NetSuite work for you.
            </p>
            <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Start a conversation
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
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
            <h2 className="mb-lg">
              Six services. <span className="text-primary">One focus.</span>
            </h2>
            <p className="text-lg text-muted">
              Whether you're new to NetSuite or refining your current setup, we have the expertise
              to help you unlock its full potential.
            </p>
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
          <div className="text-center mb-3xl">
            <p className="text-label text-primary mb-md">Our methodology</p>
            <h2 className="mb-xl">
              The <span className="text-primary">5C</span>
              <br />
              Implementation Process
            </h2>
            <p className="text-lg text-muted mx-auto max-w-[1100px]">
              Developed from 230+ successful implementations, our proprietary process combines
              software engineering with change management best practice and agile methodologies.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-lg md:gap-xl">
            {processSteps.map((step, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < processSteps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-(--color-primary)/20"
                    style={{ transform: "translateX(-50%)" }}
                  />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-(--color-primary)/10 mb-xl relative mt-xl">
                    <step.icon className="w-8 h-8 text-primary" />
                    <span className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-(--color-primary) text-white text-sm font-bold flex items-center justify-center">
                      {step.num.replace("0", "")}
                    </span>
                  </div>
                  <h5 className="mb-md">{step.title}</h5>
                  <p className="text-base text-muted">{step.desc}</p>
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
              <h2 className="mb-xl">
                Start strong with <span className="text-tertiary">NetSuite.</span>
              </h2>
              <p className="text-lg text-muted leading-relaxed mb-lg">
                Launch your NetSuite system smoothly, without downtime or chaos. Every step - from
                migrating your data to setting up custom features - is handled for you, so your
                workflow stays on track.
              </p>
              <p className="text-lg text-muted leading-relaxed mb-2xl">
                Your team starts working confidently from day one, with a solution built for real
                results. Senior consultants, fixed pricing, and a proven process that's delivered
                230+ successful go-lives.
              </p>
              <Link
                to="/contact"
                className="btn btn-lg w-full sm:w-auto justify-center bg-(--color-tertiary) text-white hover:opacity-90"
              >
                Book your setup call
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-lg">
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
                <div key={i} className="card border-2 border-(--color-text)/10 text-center p-xl">
                  <div className="icon-box icon-box-md rounded-xl bg-(--color-tertiary)/10 mx-auto mb-lg">
                    <stat.icon className="w-5 h-5 text-tertiary" />
                  </div>
                  <p className="font-heading text-3xl md:text-4xl text-tertiary mb-sm">
                    {stat.value}
                  </p>
                  <p className="font-bold text-base mb-xs">{stat.label}</p>
                  <p className="text-sm text-muted">{stat.desc}</p>
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
        <Puzzle
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[25rem] h-[25rem] text-primary opacity-[0.04] pointer-events-none hidden lg:block"
          strokeWidth={0.5}
          style={{ transform: "translateX(-30%) translateY(-50%)" }}
        />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-2xl lg:gap-3xl items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-md">
                {[
                  "Shopify",
                  "Salesforce",
                  "Stripe",
                  "Zendesk",
                  "Magento",
                  "HubSpot",
                  "Celigo",
                  "Cyclr",
                ].map((platform, i) => (
                  <div
                    key={i}
                    className="card border-2 border-(--color-text)/10 text-center hover:border-(--color-primary)/30 hover:-translate-y-1 transition-all p-lg"
                  >
                    <p className="font-bold text-base">{platform}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-label text-primary mb-md">Integrations</p>
              <h2 className="mb-xl">
                Extend your <span className="text-primary">capabilities.</span>
              </h2>
              <p className="text-lg text-muted leading-relaxed mb-lg">
                To maximise your NetSuite investment, integrating it with other essential business
                applications is key. We connect NetSuite with platforms like Salesforce, Stripe, and
                Zendesk, ensuring a unified system.
              </p>
              <p className="text-lg text-muted leading-relaxed mb-2xl">
                By leveraging leading integration platforms such as Celigo and Cyclr, we provide
                tailored solutions that streamline your operations and support your business growth.
              </p>
              <Link
                to="/integrations"
                className="btn btn-primary btn-lg w-full sm:w-auto justify-center"
              >
                Explore integrations
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
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
              <h2 className="mb-xl">
                The right skills for <span className="text-primary">the right results.</span>
              </h2>
              <p className="text-lg text-muted leading-relaxed mb-lg">
                NetSuite is powerful, but the right training makes all the difference. Our tailored
                programmes are designed to fit your team's needs, whether through one-on-one
                sessions or group workshops.
              </p>
              <p className="text-lg text-muted leading-relaxed">
                We'll equip your people with the skills to work confidently, improve productivity,
                and deliver results. Training that actually sticks.
              </p>
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
      >
        <HeartHandshake
          className="absolute left-0 top-1/2 w-[28rem] h-[28rem] text-secondary opacity-[0.06] pointer-events-none hidden lg:block"
          strokeWidth={0.5}
          style={{ transform: "translateX(-30%) translateY(-50%)" }}
        />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-2xl lg:gap-3xl items-center">
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-lg">
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
                <div key={i} className="card border-2 border-(--color-text)/10 text-center p-xl">
                  <div className="icon-box icon-box-md rounded-xl bg-(--color-secondary)/10 mx-auto mb-lg">
                    <stat.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <p className="font-heading text-3xl md:text-4xl text-secondary mb-sm">
                    {stat.value}
                  </p>
                  <p className="font-bold text-base mb-xs">{stat.label}</p>
                  <p className="text-sm text-muted">{stat.desc}</p>
                </div>
              ))}
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-label text-secondary mb-md">Aftercare</p>
              <h2 className="mb-xl">
                Success beyond <span className="text-secondary whitespace-nowrap">go-live.</span>
              </h2>
              <p className="text-lg text-muted leading-relaxed mb-lg">
                Your ERP journey doesn't stop at go-live, and neither does our support. Flexible
                plans covering everything from troubleshooting and proactive system reviews to
                performance optimisation.
              </p>
              <p className="text-lg text-muted leading-relaxed mb-2xl">
                Whatever your needs, we're here to help every step of the way. Your system grows and
                evolves alongside your business.
              </p>
              <Link
                to="/support"
                className="btn btn-lg w-full sm:w-auto justify-center bg-(--color-secondary) text-white hover:opacity-90"
              >
                Find your support plan
                <ArrowRight className="w-5 h-5" />
              </Link>
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
            <h2 className="mb-lg">
              Oracle Fusion <span className="text-primary">Consulting</span>
            </h2>
            <p className="text-lg text-muted max-w-[800px]">
              Take your business further with Oracle Fusion. Expert consulting across the full
              suite, helping you streamline operations, empower your people, and unlock deeper
              insights.
            </p>
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
          <h3 className="mb-lg">
            Not sure where to <span className="text-primary">start?</span>
          </h3>
          <p className="text-lg text-muted mx-auto max-w-[500px] mb-2xl">
            Let's have a conversation. We'll help you figure out the best path forward.
          </p>
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

      <Footer />
      <BackToTop />
    </div>
  );
}
