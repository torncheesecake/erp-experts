/**
 * ERP Experts Case Studies Page
 * 4 Case Studies + 4 Testimonials
 */

import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Factory,
  ShoppingBag,
  Truck,
  Building2,
  MessageSquareQuote,
  Check,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

// Case Studies Data
const caseStudies = [
  {
    id: 1,
    client: "Precision Manufacturing Ltd",
    industry: "Manufacturing",
    icon: Factory,
    title: "40% faster order processing through NetSuite automation",
    challenge:
      "Precision Manufacturing was drowning in manual processes, with orders taking days to process through disconnected systems. Stock visibility was poor, leading to frequent stockouts and disappointed customers.",
    solution:
      "We implemented a fully integrated NetSuite solution with automated order workflows, real-time inventory tracking, and custom dashboards for the leadership team.",
    results: [
      { metric: "40%", label: "Faster processing" },
      { metric: "3x", label: "Inventory accuracy" },
      { metric: "60%", label: "Less manual entry" },
    ],
  },
  {
    id: 2,
    client: "StyleForward Retail",
    industry: "Retail",
    icon: ShoppingBag,
    title: "Omnichannel success: unifying online and in-store operations",
    challenge:
      "StyleForward operated separate systems for their ecommerce and physical stores, causing inventory mismatches, overselling, and a fragmented customer experience.",
    solution:
      "We deployed NetSuite with full omnichannel integration, connecting their Shopify stores with in-store POS, creating a single source of truth for inventory and customer data.",
    results: [
      { metric: "99.5%", label: "Inventory accuracy" },
      { metric: "25%", label: "Higher satisfaction" },
      { metric: "2 weeks", label: "Time saved" },
    ],
  },
  {
    id: 3,
    client: "Swift Distribution Co",
    industry: "Distribution",
    icon: Truck,
    title: "From chaos to clarity: transforming warehouse operations",
    challenge:
      "Swift Distribution's rapid growth had outpaced their legacy systems. Warehouse staff relied on spreadsheets and paper, leading to picking errors and delayed shipments.",
    solution:
      "We implemented NetSuite WMS with mobile scanning, automated pick/pack workflows, and integrated shipping carrier connections for real-time tracking.",
    results: [
      { metric: "85%", label: "Fewer picking errors" },
      { metric: "50%", label: "Faster fulfilment" },
      { metric: "£200k", label: "Annual savings" },
    ],
  },
  {
    id: 4,
    client: "BuildRight Construction",
    industry: "Construction",
    icon: Building2,
    title: "Project profitability visibility that transformed decision-making",
    challenge:
      "BuildRight couldn't see project profitability until months after completion. Job costing was done in spreadsheets, and the finance team spent weeks each month reconciling data.",
    solution:
      "We delivered a NetSuite implementation with real-time project accounting, automated timesheet integration, and custom profitability dashboards by project and client.",
    results: [
      { metric: "Real-time", label: "Visibility" },
      { metric: "70%", label: "Faster month-end" },
      { metric: "15%", label: "Better margins" },
    ],
  },
];

// Testimonials Data
const testimonials = [
  {
    quote:
      "ERP Experts transformed our operations. We went live on time, on budget, and our team actually enjoys using NetSuite. Their training-first approach made all the difference.",
    name: "Sarah Mitchell",
    role: "Operations Director",
    company: "Precision Manufacturing Ltd",
  },
  {
    quote:
      "No bait and switch. The senior consultants we met in the sales process were the same people who delivered our project. That continuity was invaluable.",
    name: "James Chen",
    role: "CFO",
    company: "StyleForward Retail",
  },
  {
    quote:
      "We'd been burned by a failed implementation before. ERP Experts came in, understood our business in days, and got us back on track. True rescue experts.",
    name: "David Thompson",
    role: "Managing Director",
    company: "Swift Distribution Co",
  },
  {
    quote:
      "The visibility we now have into project profitability has completely changed how we run the business. We can make decisions based on real data, not gut feel.",
    name: "Emma Roberts",
    role: "Finance Director",
    company: "BuildRight Construction",
  },
];

const stats = [
  { value: "100+", label: "Projects" },
  { value: "94%", label: "On-time" },
  { value: "78%", label: "Adoption lift" },
  { value: "100%", label: "Satisfaction" },
];

export default function CaseStudies() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="pt-(--space-4xl) pb-(--space-2xl) md:pb-(--space-3xl)">
        <div className="container">
          <p className="text-label text-primary mb-md md:mb-lg">Case Studies</p>
          <h1 className="text-hero mb-xl md:mb-2xl">
            Real results.
            <br />
            <span className="text-primary">Real businesses.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-xl mb-xl md:mb-2xl">
            See how we've helped UK businesses transform their operations with expert NetSuite
            implementation.
          </p>
          <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
            Start a project
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
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

      {/* Featured Case Study */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-xl md:gap-2xl items-center">
            {/* Image */}
            <div className="aspect-[4/3] rounded-2xl bg-(--color-text)/5 flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <div className="icon-box icon-box-lg rounded-2xl bg-(--color-text)/10 mx-auto mb-md">
                  <Factory className="w-10 h-10 text-(--color-text)/30" />
                </div>
                <p className="text-label text-muted">Case Study Image</p>
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-label text-primary mb-sm md:mb-md">{caseStudies[0].industry}</p>
              <h3 className="mb-md md:mb-lg">{caseStudies[0].title}</h3>
              <p className="text-lg text-muted mb-xl md:mb-2xl">{caseStudies[0].challenge}</p>

              {/* Results */}
              <div className="grid grid-cols-3 gap-md md:gap-lg mb-xl md:mb-2xl p-(--space-lg) md:p-(--space-xl) border border-(--color-text)/10 rounded-xl">
                {caseStudies[0].results.map((result, i) => (
                  <div key={i} className="text-center">
                    <p className="font-heading text-2xl md:text-3xl text-primary mb-xs">
                      {result.metric}
                    </p>
                    <p className="text-sm text-muted">{result.label}</p>
                  </div>
                ))}
              </div>

              <Link
                to={`/case-studies/${caseStudies[0].id}`}
                className="group inline-flex items-center gap-sm text-base font-bold hover:text-primary transition-colors"
              >
                Read full case study
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* More Case Studies Grid */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-md mb-xl md:mb-2xl">
            <div>
              <p className="text-label text-primary mb-sm md:mb-md">More Success Stories</p>
              <h4>See how we've helped others</h4>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-md md:gap-lg">
            {caseStudies.slice(1).map((study) => (
              <Link key={study.id} to={`/case-studies/${study.id}`} className="card group">
                {/* Thumbnail */}
                <div className="aspect-video rounded-xl bg-(--color-text)/5 mb-lg flex items-center justify-center">
                  <study.icon className="w-10 h-10 text-(--color-text)/20" />
                </div>

                {/* Content */}
                <p className="text-label text-primary mb-sm">{study.industry}</p>
                <h6 className="mb-md group-hover:text-primary transition-colors">{study.title}</h6>

                {/* Key Result */}
                <div className="flex items-center gap-lg pt-md border-t border-(--color-text)/10">
                  <div>
                    <p className="font-heading text-xl text-primary">{study.results[0].metric}</p>
                    <p className="text-sm text-muted">{study.results[0].label}</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted ml-auto group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="text-center mb-xl md:mb-2xl">
            <p className="text-label text-primary mb-sm md:mb-md">Testimonials</p>
            <h4>What our clients say</h4>
          </div>

          <div className="grid md:grid-cols-2 gap-md md:gap-xl">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="p-(--space-xl) md:p-(--space-2xl) border border-(--color-text)/10 rounded-2xl"
              >
                <MessageSquareQuote className="w-8 h-8 text-primary mb-lg" />
                <blockquote className="text-lg md:text-xl font-medium leading-relaxed mb-xl">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full bg-(--color-text)/10" />
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-muted">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container text-center">
          <h3 className="mb-lg">
            Ready to be our next <span className="text-primary">success story?</span>
          </h3>
          <p className="text-lg text-muted mx-auto max-w-[500px] mb-2xl">
            Let's talk about how we can transform your operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Start a project
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
