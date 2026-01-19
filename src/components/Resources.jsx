/**
 * ERP Experts Resources Page
 * Guides, Webinars, Videos - educational content hub
 */

import { ArrowRight, BookOpen, Video, Play, Download, Clock } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

const categories = [
  { label: "All", value: "all" },
  { label: "Guides", value: "guides" },
  { label: "Webinars", value: "webinars" },
  { label: "Videos", value: "videos" },
];

const featuredResource = {
  type: "Guide",
  title: "The Complete NetSuite Implementation Guide",
  desc: "Everything you need to know before, during, and after your NetSuite implementation. 40+ pages of insights from 230+ projects.",
  readTime: "45 min read",
  image: null,
};

const resources = [
  {
    type: "Guide",
    icon: BookOpen,
    title: "NetSuite vs Sage: Which ERP is Right for You?",
    desc: "A detailed comparison to help you make the right choice for your business.",
    meta: "15 min read",
  },
  {
    type: "Webinar",
    icon: Video,
    title: "Maximising ROI from Your NetSuite Investment",
    desc: "Learn how to get more value from your existing NetSuite setup.",
    meta: "45 min",
  },
  {
    type: "Video",
    icon: Play,
    title: "NetSuite Demo: Order to Cash Walkthrough",
    desc: "See how a typical order flows through NetSuite from quote to payment.",
    meta: "12 min",
  },
  {
    type: "Guide",
    icon: BookOpen,
    title: "5 Signs You've Outgrown Spreadsheets",
    desc: "How to know when it's time to move from Excel to a proper ERP system.",
    meta: "8 min read",
  },
  {
    type: "Webinar",
    icon: Video,
    title: "NetSuite for Manufacturing: Deep Dive",
    desc: "Production planning, work orders, and shop floor control in NetSuite.",
    meta: "60 min",
  },
  {
    type: "Video",
    icon: Play,
    title: "Setting Up Saved Searches in NetSuite",
    desc: "A practical tutorial on creating powerful saved searches.",
    meta: "18 min",
  },
  {
    type: "Guide",
    icon: BookOpen,
    title: "Data Migration Best Practices",
    desc: "How to prepare your data for a smooth transition to NetSuite.",
    meta: "20 min read",
  },
  {
    type: "Webinar",
    icon: Video,
    title: "NetSuite Integrations: What's Possible?",
    desc: "Connecting NetSuite to Shopify, Salesforce, Amazon, and more.",
    meta: "50 min",
  },
  {
    type: "Video",
    icon: Play,
    title: "Dashboard Customisation Tips",
    desc: "Make NetSuite work for you with personalised dashboards.",
    meta: "10 min",
  },
];

const topics = [
  "Implementation",
  "Manufacturing",
  "Retail",
  "Integrations",
  "Training",
  "Best Practices",
];

export default function Resources() {
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
            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1000&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.6 }}
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-5xl">
            <p className="text-label text-primary mb-md">Resources</p>
            <h1 className="text-hero" style={{ marginBottom: "var(--space-4xl)" }}>
              Learn from
              <br />
              <span className="text-primary">the experts.</span>
            </h1>
            <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Browse resources
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Resource */}
      <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
        {/* Decorative triangle */}
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
          <div className="grid lg:grid-cols-2 gap-xl md:gap-2xl items-center">
            <div className="aspect-[4/3] rounded-2xl md:rounded-3xl bg-dark flex items-center justify-center relative overflow-hidden">
              <div className="text-center text-(--color-text-on-dark-muted)">
                <div className="icon-box icon-box-lg rounded-2xl border-2 border-white/15 mx-auto mb-lg">
                  <BookOpen className="w-10 h-10 text-white/40" />
                </div>
                <p className="text-label">Featured Guide Cover</p>
              </div>
              {/* Triangle accent */}
              <div
                className="absolute bottom-0 right-0 opacity-50 hidden md:block z-10"
                style={{
                  width: "200px",
                  height: "172px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "white",
                  transform: "translateX(50px) translateY(50px)",
                }}
              />
              <div
                className="absolute bottom-0 left-0 w-full h-1/3 z-10"
                style={{
                  background: "linear-gradient(to top, var(--color-primary)/30, transparent)",
                }}
              />
            </div>
            <div>
              <p className="text-label text-primary mb-md">Featured Guide</p>
              <h3 style={{ marginBottom: "var(--space-2xl)" }}>{featuredResource.title}</h3>
              <div className="flex items-center gap-md mb-2xl">
                <div className="flex items-center gap-sm text-muted">
                  <Clock className="w-5 h-5" />
                  <span className="text-base">{featuredResource.readTime}</span>
                </div>
              </div>
              <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
                Download guide
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-lg mb-xl md:mb-2xl">
            <div>
              <p className="text-label text-primary mb-md">Browse Resources</p>
              <h4>
                Find what you <span className="text-primary">need.</span>
              </h4>
            </div>
            <p className="text-base text-muted">{resources.length} resources available</p>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap items-center gap-md mb-xl">
            {categories.map((cat, i) => (
              <button
                key={i}
                className={`px-xl py-md rounded-full text-base font-bold whitespace-nowrap transition-all ${
                  i === 0
                    ? "bg-(--color-primary) text-white"
                    : "border-2 border-(--color-text)/10 hover:border-(--color-primary) hover:text-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Topic tags */}
          <div className="flex flex-wrap items-center gap-sm">
            <span className="text-sm text-muted mr-sm">Topics:</span>
            {topics.map((topic, i) => (
              <a
                key={i}
                href="#"
                className="px-lg py-xs rounded-full text-sm font-medium bg-(--color-text)/5 hover:bg-(--color-primary)/10 hover:text-primary transition-all"
              >
                {topic}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
        {/* Decorative triangle */}
        <div
          className="absolute bottom-0 right-0 opacity-[0.03] hidden lg:block pointer-events-none"
          style={{
            width: "60%",
            height: "100%",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(20%) translateY(20%)",
          }}
        />
        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-md md:gap-xl">
            {resources.map((resource, i) => (
              <a
                key={i}
                href="#"
                className="card group border border-(--color-text)/5 hover:border-(--color-primary)/20 transition-all hover:-translate-y-2"
              >
                {/* Thumbnail */}
                <div className="aspect-video rounded-xl bg-(--color-text)/5 mb-lg flex items-center justify-center relative overflow-hidden">
                  <resource.icon className="w-10 h-10 text-(--color-text)/20" />
                  {resource.type === "Video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="icon-box icon-box-md rounded-full bg-white shadow-lg">
                        <Play className="w-5 h-5 text-(--color-text) ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}
                  {/* Triangle accent on thumbnails */}
                  <div
                    className="absolute bottom-0 right-0 opacity-30"
                    style={{
                      width: "60px",
                      height: "52px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-primary)",
                      transform: "translateX(15px) translateY(15px)",
                    }}
                  />
                </div>
                {/* Content */}
                <div className="flex items-center gap-sm mb-md">
                  <span className="text-label text-primary">{resource.type}</span>
                  <span className="text-muted">•</span>
                  <span className="text-sm text-muted">{resource.meta}</span>
                </div>
                <h6 className="mb-md group-hover:text-primary transition-colors">
                  {resource.title}
                </h6>
                <p className="text-base text-muted">{resource.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="rounded-2xl md:rounded-[2rem] p-(--space-xl) md:p-12 lg:p-16 bg-(--color-bg-dark) relative overflow-hidden">
            <div
              className="absolute top-1/2 w-0 h-0 opacity-20 hidden md:block"
              style={{
                right: "-50px",
                transform: "translateY(-50%)",
                borderLeft: "150px solid transparent",
                borderRight: "150px solid transparent",
                borderBottom: "250px solid white",
              }}
            />
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-xl md:gap-2xl">
                <div className="flex-1">
                  <h4 className="text-(--color-text-on-dark)">
                    Get NetSuite insights delivered weekly
                  </h4>
                </div>
                <div className="flex flex-col sm:flex-row gap-md flex-1">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-(--space-xl) py-(--space-md) rounded-full border border-(--color-text)/15 bg-white text-base focus:outline-none focus:border-(--color-primary)"
                  />
                  <button className="btn btn-lg justify-center shrink-0 bg-white text-(--color-text)">
                    Subscribe
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container text-center">
          <h1 className="text-hero" style={{ marginBottom: "var(--space-3xl)" }}>
            Let's talk <span className="text-primary">NetSuite.</span>
          </h1>
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
