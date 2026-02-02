/**
 * ERP Experts - What is NetSuite? Page
 * SEO-focused educational content for UK businesses
 */

import { Link } from "react-router-dom";
import {
  ArrowRight,
  Cloud,
  Building2,
  BarChart3,
  ShoppingCart,
  Users,
  Globe,
  Zap,
  Shield,
  TrendingUp,
  Package,
  Banknote,
  Layers,
  Check,
  MessageSquareQuote,
} from "lucide-react";
import SEO from "../../components/ui/SEO";
import TrackedLink from "../../components/ui/TrackedLink";

const modules = [
  {
    icon: Banknote,
    title: "Financial Management",
    desc: "General ledger, accounts payable/receivable, fixed assets, and multi-currency support for UK and international operations.",
  },
  {
    icon: Package,
    title: "Inventory & Supply Chain",
    desc: "Real-time inventory tracking, demand planning, and warehouse management across multiple locations.",
  },
  {
    icon: ShoppingCart,
    title: "Order Management",
    desc: "Quote-to-cash automation, pricing rules, and seamless order processing from any channel.",
  },
  {
    icon: Users,
    title: "CRM",
    desc: "360-degree customer view, sales force automation, and marketing campaign management built-in.",
  },
  {
    icon: Building2,
    title: "Manufacturing",
    desc: "Work orders, routing, BOM management, and shop floor control for UK manufacturers.",
  },
  {
    icon: Globe,
    title: "Ecommerce",
    desc: "SuiteCommerce platform for B2B and B2C, fully integrated with your back office.",
  },
];

const benefits = [
  {
    icon: Cloud,
    title: "True Cloud ERP",
    desc: "No servers to maintain, no software to install. Access from anywhere, automatic updates twice yearly.",
  },
  {
    icon: Layers,
    title: "Single Platform",
    desc: "Finance, CRM, inventory, ecommerce - all in one system. No integrations to break, no data silos.",
  },
  {
    icon: TrendingUp,
    title: "Scales With You",
    desc: "From 10 users to 10,000. Add modules, subsidiaries, and countries without changing systems.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "Oracle infrastructure, SOC 1 & 2 certified, GDPR compliant. Your data protected by enterprise-grade security.",
  },
];

const industries = [
  "Wholesale & Distribution",
  "Manufacturing",
  "Retail & Ecommerce",
  "Professional Services",
  "Software & Technology",
  "Food & Beverage",
];

export default function WhatIsNetSuite() {
  return (
    <main id="main-content">
      <SEO
        title="What is NetSuite? | Cloud ERP for UK Businesses"
        description="NetSuite is the world's leading cloud ERP system. Learn how UK businesses use NetSuite to manage finance, inventory, CRM, and operations in one platform."
        path="/what-is-netsuite"
        keywords="what is NetSuite, NetSuite ERP, NetSuite UK, cloud ERP, Oracle NetSuite, NetSuite for UK businesses, ERP software UK"
      />

      {/* Hero */}
      <section className="min-h-[50vh] md:min-h-[60vh] flex items-center relative overflow-hidden pt-(--space-4xl)">
        {/* Decorative triangle */}
        <div
          className="absolute top-1/2 right-0 opacity-20 hidden lg:block pointer-events-none"
          style={{
            width: "800px",
            height: "686px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-tertiary)",
            transform: "translateX(30%) translateY(-50%)",
          }}
        />

        <div className="container relative z-10">
          <div className="max-w-4xl">
            <p className="text-label text-tertiary mb-md">NetSuite Explained</p>
            <h1 className="text-hero mb-xl">
              What is <span className="text-tertiary">NetSuite</span>?
            </h1>
            <p className="text-xl md:text-2xl text-muted leading-relaxed max-w-3xl mb-2xl">
              NetSuite is the world's most deployed cloud ERP system. Over 38,000 organisations use
              it to run their entire business - finance, inventory, CRM, ecommerce - from a single
              platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-md">
              <TrackedLink
                to="/contact"
                trackingName="whatisnetsuite_hero_talk_to_us"
                trackingPage="what-is-netsuite"
                className="btn btn-lg w-full sm:w-auto justify-center"
                style={{ backgroundColor: "var(--color-tertiary)", color: "white" }}
              >
                Talk to us about NetSuite
                <ArrowRight className="w-5 h-5" />
              </TrackedLink>
              <TrackedLink
                to="/implementation"
                trackingName="whatisnetsuite_hero_implementation"
                trackingPage="what-is-netsuite"
                className="btn btn-lg border-2 border-(--color-tertiary) text-tertiary w-full sm:w-auto justify-center"
              >
                How we implement it
              </TrackedLink>
            </div>
          </div>
        </div>
      </section>

      {/* What is NetSuite - detailed */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div>
              <p className="text-label text-tertiary mb-md">The Basics</p>
              <h2 className="mb-lg">
                Cloud ERP built for <span className="text-tertiary">growing businesses</span>
              </h2>
              <div
                className="text-lg text-muted leading-relaxed"
                style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
              >
                <p>
                  NetSuite is an Enterprise Resource Planning (ERP) system that runs entirely in the
                  cloud. Unlike traditional software you install on servers, NetSuite is accessed
                  through your browser - meaning your team can work from anywhere, on any device.
                </p>
                <p>
                  Originally founded in 1998 as NetLedger, it was acquired by Oracle in 2016 for
                  $9.3 billion. Today it's the backbone of operations for businesses ranging from
                  10-person startups to multinational corporations.
                </p>
                <p>
                  For UK businesses, NetSuite handles VAT, multi-currency, and HMRC compliance out
                  of the box - no bolt-ons required.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-3xl overflow-hidden">
                <img
                  src="https://images.ctfassets.net/lzny33ho1g45/3JsIFRYJN5NHhw7dYxsCMg/76e9aaa255565c359b29e2844b392674/thmb-1100-reporting-dashboard.png?w=1400"
                  alt="NetSuite dashboard interface"
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
                  backgroundColor: "var(--color-tertiary)",
                  opacity: 0.2,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Cloud ERP */}
      <section
        className="section-padding-lg"
        style={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
      >
        <div className="container">
          <div className="text-center mb-2xl">
            <p className="text-label text-tertiary mb-md">Why NetSuite?</p>
            <h2>
              The benefits of <span className="text-tertiary">cloud ERP</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-xl shadow-sm hover:-translate-y-1 transition-transform"
              >
                <div className="icon-box icon-box-md rounded-2xl bg-(--color-tertiary)/10 mb-lg">
                  <benefit.icon className="w-6 h-6 text-tertiary" />
                </div>
                <h5 className="mb-md">{benefit.title}</h5>
                <p className="text-base text-muted">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
        {/* Decorative triangle */}
        <div
          className="absolute -right-32 top-1/2 -translate-y-1/2 opacity-[0.08] hidden lg:block pointer-events-none"
          style={{
            width: "800px",
            height: "686px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-tertiary)",
          }}
        />
        <div className="container relative z-10">
          <div className="text-center mb-2xl">
            <p className="text-label text-tertiary mb-md">What's Included</p>
            <h2>
              NetSuite <span className="text-tertiary">modules</span>
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto mt-lg">
              NetSuite is modular - you start with what you need and add capabilities as you grow.
              Here are the core modules UK businesses typically use.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {modules.map((module, i) => (
              <div
                key={i}
                className="rounded-2xl border-2 border-(--color-text)/10 p-xl hover:-translate-y-1 transition-transform backdrop-blur-sm"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.4)" }}
              >
                <div className="icon-box icon-box-md rounded-2xl bg-(--color-tertiary)/10 mb-lg">
                  <module.icon className="w-6 h-6 text-tertiary" />
                </div>
                <h5 className="mb-md">{module.title}</h5>
                <p className="text-base text-muted">{module.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: "var(--space-3xl)" }}>
            <TrackedLink
              to="/implementation"
              trackingName="whatisnetsuite_modules_see_implementation"
              trackingPage="what-is-netsuite"
              className="btn btn-lg justify-center"
              style={{ backgroundColor: "var(--color-tertiary)", color: "white" }}
            >
              See how we implement these modules
              <ArrowRight className="w-5 h-5" />
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* Who uses NetSuite */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div>
              <p className="text-label text-tertiary mb-md">Who Uses NetSuite?</p>
              <h2 className="mb-lg">
                Built for the <span className="text-tertiary">mid-market</span>
              </h2>
              <p className="text-lg text-muted leading-relaxed mb-lg">
                NetSuite sits between basic accounting software like Xero or Sage, and heavyweight
                enterprise systems like SAP. It's designed for businesses that have outgrown
                spreadsheets and entry-level tools, but don't need (or want) the complexity and cost
                of traditional ERP.
              </p>
              <p className="text-lg text-muted leading-relaxed mb-2xl">
                Typical NetSuite customers in the UK have 20-500 employees and turnover between 5
                million and 200 million. But the platform scales - some customers have thousands of
                users.
              </p>
              <div className="grid grid-cols-2 gap-md">
                {industries.map((industry, i) => (
                  <div key={i} className="flex items-center gap-sm">
                    <Check className="w-5 h-5 text-tertiary shrink-0" />
                    <span className="text-base">{industry}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="bg-(--color-quaternary)/5 rounded-3xl p-2xl">
                <MessageSquareQuote className="w-12 h-12 text-quaternary mb-lg opacity-50" />
                <blockquote className="font-heading text-xl md:text-2xl leading-snug mb-lg">
                  "There's no way we could have grown to the size we are today with the old system.
                  It would have been impossible. NetSuite has massively enabled us to grow."
                </blockquote>
                <div>
                  <p className="font-bold">David Hall</p>
                  <p className="text-muted">CEO, Totalkare</p>
                </div>
              </div>
              <div className="mt-xl text-center">
                <TrackedLink
                  to="/case-studies/4"
                  trackingName="whatisnetsuite_read_totalkare"
                  trackingPage="what-is-netsuite"
                  className="btn btn-lg justify-center"
                  style={{ backgroundColor: "var(--color-quaternary)", color: "white" }}
                >
                  Read the full case study
                  <ArrowRight className="w-5 h-5" />
                </TrackedLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NetSuite vs alternatives */}
      <section
        className="section-padding-lg relative overflow-hidden"
        style={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
      >
        {/* Decorative triangle */}
        <div
          className="absolute -left-64 top-1/2 -translate-y-1/2 opacity-[0.05] hidden lg:block pointer-events-none"
          style={{
            width: "700px",
            height: "600px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-tertiary)",
          }}
        />
        <div className="container relative z-10">
          <div className="text-center mb-2xl">
            <p className="text-label text-tertiary mb-md">Sound Familiar?</p>
            <h2>
              Time to <span className="text-tertiary">move on</span>?
            </h2>
          </div>

          {/* Pain point cards with NetSuite solutions */}
          <div className="grid md:grid-cols-3 gap-lg mb-3xl">
            <div className="bg-white rounded-2xl p-xl">
              <p className="text-label text-tertiary mb-md">Stuck on Sage or Xero?</p>
              <ul className="space-y-sm text-base text-muted mb-lg">
                <li>"We've outgrown it but migration feels risky"</li>
                <li>"Finance is fine but inventory is a nightmare"</li>
                <li>"We're running 5 different systems that don't talk"</li>
              </ul>
              <div className="border-t border-(--color-text)/10 pt-lg">
                <p className="font-bold text-tertiary mb-sm">With NetSuite:</p>
                <p className="text-base">
                  One system for finance, inventory, CRM, and ecommerce. No more spreadsheets
                  bridging the gaps. Real-time data, not month-end surprises.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-xl">
              <p className="text-label text-tertiary mb-md">Trapped on SAP or Dynamics?</p>
              <ul className="space-y-sm text-base text-muted mb-lg">
                <li>"Every change costs a fortune and takes months"</li>
                <li>"Our consultants know it better than we do"</li>
                <li>"We're paying for features we'll never use"</li>
              </ul>
              <div className="border-t border-(--color-text)/10 pt-lg">
                <p className="font-bold text-tertiary mb-sm">With NetSuite:</p>
                <p className="text-base">
                  Your team owns the system, not consultants. Changes in days, not months. Pay for
                  what you use, add modules as you grow.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-xl">
              <p className="text-label text-tertiary mb-md">On legacy or homegrown?</p>
              <ul className="space-y-sm text-base text-muted mb-lg">
                <li>"Only one person knows how it works"</li>
                <li>"We can't get reports without IT"</li>
                <li>"It's held together with prayers and macros"</li>
              </ul>
              <div className="border-t border-(--color-text)/10 pt-lg">
                <p className="font-bold text-tertiary mb-sm">With NetSuite:</p>
                <p className="text-base">
                  Supported platform with a future. Self-service reporting anyone can use. Automatic
                  updates, no more technical debt.
                </p>
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-4 gap-0 rounded-2xl overflow-hidden bg-white shadow-sm">
              {/* Header row */}
              <div className="p-lg bg-(--color-text)/5 border-b border-(--color-text)/10">
                <p className="font-bold text-muted">&nbsp;</p>
              </div>
              <div className="p-lg bg-(--color-text)/5 border-b border-(--color-text)/10 text-center">
                <p className="font-bold text-muted">Sage / Xero</p>
              </div>
              <div className="p-lg bg-(--color-tertiary) border-b border-(--color-tertiary) text-center">
                <p className="font-bold text-white">NetSuite</p>
              </div>
              <div className="p-lg bg-(--color-text)/5 border-b border-(--color-text)/10 text-center">
                <p className="font-bold text-muted">SAP / Oracle</p>
              </div>

              {/* Row 1 - All-in-one */}
              <div className="p-lg border-b border-(--color-text)/10">
                <p className="font-medium">All-in-one platform</p>
              </div>
              <div className="p-lg border-b border-(--color-text)/10 text-center">
                <span className="text-muted">Accounting only</span>
              </div>
              <div className="p-lg border-b border-(--color-text)/10 text-center bg-(--color-tertiary)/5">
                <Check className="w-5 h-5 text-tertiary mx-auto" />
              </div>
              <div className="p-lg border-b border-(--color-text)/10 text-center">
                <Check className="w-5 h-5 text-muted mx-auto" />
              </div>

              {/* Row 2 - Cloud native */}
              <div className="p-lg border-b border-(--color-text)/10">
                <p className="font-medium">True cloud</p>
              </div>
              <div className="p-lg border-b border-(--color-text)/10 text-center">
                <Check className="w-5 h-5 text-muted mx-auto" />
              </div>
              <div className="p-lg border-b border-(--color-text)/10 text-center bg-(--color-tertiary)/5">
                <Check className="w-5 h-5 text-tertiary mx-auto" />
              </div>
              <div className="p-lg border-b border-(--color-text)/10 text-center">
                <span className="text-muted">Often on-premise</span>
              </div>

              {/* Row 3 - Implementation time */}
              <div className="p-lg border-b border-(--color-text)/10">
                <p className="font-medium">Go-live speed</p>
              </div>
              <div className="p-lg border-b border-(--color-text)/10 text-center">
                <span className="text-muted">Days</span>
              </div>
              <div className="p-lg border-b border-(--color-text)/10 text-center bg-(--color-tertiary)/5">
                <span className="text-tertiary font-bold">Weeks</span>
              </div>
              <div className="p-lg border-b border-(--color-text)/10 text-center">
                <span className="text-muted">12-24 months</span>
              </div>

              {/* Row 4 - Scalability */}
              <div className="p-lg border-b border-(--color-text)/10">
                <p className="font-medium">Scales with growth</p>
              </div>
              <div className="p-lg border-b border-(--color-text)/10 text-center">
                <span className="text-muted">Limited</span>
              </div>
              <div className="p-lg border-b border-(--color-text)/10 text-center bg-(--color-tertiary)/5">
                <Check className="w-5 h-5 text-tertiary mx-auto" />
              </div>
              <div className="p-lg border-b border-(--color-text)/10 text-center">
                <Check className="w-5 h-5 text-muted mx-auto" />
              </div>

              {/* Row 5 - Cost */}
              <div className="p-lg border-b border-(--color-text)/10">
                <p className="font-medium">Mid-market pricing</p>
              </div>
              <div className="p-lg border-b border-(--color-text)/10 text-center">
                <Check className="w-5 h-5 text-muted mx-auto" />
              </div>
              <div className="p-lg border-b border-(--color-text)/10 text-center bg-(--color-tertiary)/5">
                <Check className="w-5 h-5 text-tertiary mx-auto" />
              </div>
              <div className="p-lg border-b border-(--color-text)/10 text-center">
                <span className="text-muted">Enterprise budget</span>
              </div>

              {/* Row 6 - UK ready */}
              <div className="p-lg">
                <p className="font-medium">UK VAT & MTD ready</p>
              </div>
              <div className="p-lg text-center">
                <Check className="w-5 h-5 text-muted mx-auto" />
              </div>
              <div className="p-lg text-center bg-(--color-tertiary)/5">
                <Check className="w-5 h-5 text-tertiary mx-auto" />
              </div>
              <div className="p-lg text-center">
                <span className="text-muted">Add-ons required</span>
              </div>
            </div>

            <p className="text-center text-muted mt-lg">
              NetSuite sits in the sweet spot - enterprise features without enterprise complexity.
            </p>
          </div>
        </div>
      </section>

      {/* UK specific */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div>
              <p className="text-label text-tertiary mb-md">NetSuite in the UK</p>
              <h2 className="mb-lg">
                Built for <span className="text-tertiary">British business</span>
              </h2>
              <p className="text-lg text-muted leading-relaxed">
                NetSuite handles UK requirements out of the box - VAT returns, Making Tax Digital,
                multi-currency with GBP as base, UK bank feeds, and HMRC-compliant reporting. No
                workarounds, no third-party add-ons.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-lg">
              <div className="bg-(--color-tertiary)/5 rounded-2xl p-lg">
                <div className="icon-box icon-box-md rounded-xl bg-(--color-tertiary)/10 mb-md">
                  <Check className="w-5 h-5 text-tertiary" />
                </div>
                <p className="font-bold mb-xs">VAT & MTD Ready</p>
                <p className="text-base text-muted">
                  Automated VAT calculations and HMRC submissions built-in
                </p>
              </div>
              <div className="bg-(--color-tertiary)/5 rounded-2xl p-lg">
                <div className="icon-box icon-box-md rounded-xl bg-(--color-tertiary)/10 mb-md">
                  <Globe className="w-5 h-5 text-tertiary" />
                </div>
                <p className="font-bold mb-xs">Multi-Currency</p>
                <p className="text-base text-muted">GBP, EUR, USD with automatic revaluation</p>
              </div>
              <div className="bg-(--color-tertiary)/5 rounded-2xl p-lg">
                <div className="icon-box icon-box-md rounded-xl bg-(--color-tertiary)/10 mb-md">
                  <Users className="w-5 h-5 text-tertiary" />
                </div>
                <p className="font-bold mb-xs">UK Support</p>
                <p className="text-base text-muted">Same timezone, no offshore ticket queues</p>
              </div>
              <div className="bg-(--color-tertiary)/5 rounded-2xl p-lg">
                <div className="icon-box icon-box-md rounded-xl bg-(--color-tertiary)/10 mb-md">
                  <Shield className="w-5 h-5 text-tertiary" />
                </div>
                <p className="font-bold mb-xs">GDPR Compliant</p>
                <p className="text-base text-muted">Enterprise-grade data protection and privacy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl">
            <p className="text-label text-tertiary mb-md">Next Steps</p>
            <h2>
              Ready to <span className="text-tertiary">learn more</span>?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-xl">
            <TrackedLink
              to="/implementation"
              trackingName="whatisnetsuite_next_implementation"
              trackingPage="what-is-netsuite"
              className="card p-2xl text-center hover:-translate-y-2 transition-transform group"
            >
              <div className="icon-box icon-box-lg rounded-2xl bg-(--color-tertiary)/10 mx-auto mb-xl group-hover:bg-(--color-tertiary)/20 transition-colors">
                <Zap className="w-8 h-8 text-tertiary" />
              </div>
              <h4 className="mb-md">Implementation</h4>
              <p className="text-lg text-muted mb-xl">
                See our 5C methodology and what's included in a NetSuite project.
              </p>
              <span className="inline-flex items-center gap-sm text-tertiary font-bold text-lg">
                Learn more <ArrowRight className="w-5 h-5" />
              </span>
            </TrackedLink>
            <TrackedLink
              to="/support"
              trackingName="whatisnetsuite_next_support"
              trackingPage="what-is-netsuite"
              className="card p-2xl text-center hover:-translate-y-2 transition-transform group"
            >
              <div className="icon-box icon-box-lg rounded-2xl bg-(--color-secondary)/10 mx-auto mb-xl group-hover:bg-(--color-secondary)/20 transition-colors">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h4 className="mb-md">Support Plans</h4>
              <p className="text-lg text-muted mb-xl">
                Already on NetSuite? See our Bronze, Silver, and Gold support options.
              </p>
              <span className="inline-flex items-center gap-sm text-secondary font-bold text-lg">
                View plans <ArrowRight className="w-5 h-5" />
              </span>
            </TrackedLink>
            <TrackedLink
              to="/case-studies"
              trackingName="whatisnetsuite_next_casestudies"
              trackingPage="what-is-netsuite"
              className="card p-2xl text-center hover:-translate-y-2 transition-transform group"
            >
              <div className="icon-box icon-box-lg rounded-2xl bg-(--color-quaternary)/10 mx-auto mb-xl group-hover:bg-(--color-quaternary)/20 transition-colors">
                <BarChart3 className="w-8 h-8 text-quaternary" />
              </div>
              <h4 className="mb-md">Case Studies</h4>
              <p className="text-lg text-muted mb-xl">
                See how UK businesses have transformed with NetSuite.
              </p>
              <span className="inline-flex items-center gap-sm text-quaternary font-bold text-lg">
                Read stories <ArrowRight className="w-5 h-5" />
              </span>
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="rounded-3xl md:rounded-[3rem] overflow-hidden relative">
            {/* Background with gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, var(--color-tertiary) 0%, #1e40af 100%)",
              }}
            />
            {/* Decorative triangles */}
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
                <h2 className="text-white" style={{ marginBottom: "var(--space-xl)" }}>
                  Is NetSuite <span className="text-white/90">right for you</span>?
                </h2>
                <p
                  className="text-white/80 text-lg max-w-2xl mx-auto"
                  style={{ marginBottom: "var(--space-2xl)" }}
                >
                  Let's have a conversation about your business. We'll give you an honest assessment
                  - even if NetSuite isn't the answer.
                </p>

                <div className="flex flex-col sm:flex-row gap-md justify-center">
                  <TrackedLink
                    to="/contact"
                    trackingName="whatisnetsuite_footer_talk"
                    trackingPage="what-is-netsuite"
                    className="btn btn-lg justify-center bg-white text-(--color-tertiary) hover:scale-105 transition-transform"
                  >
                    Talk to an expert
                    <ArrowRight className="w-5 h-5" />
                  </TrackedLink>
                  <a
                    href="https://ric-snwikqbv.scoreapp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-lg justify-center bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 transition-all"
                  >
                    Take the ERP readiness quiz
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
