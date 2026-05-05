/**
 * ERP Experts Resources Page
 * Data imported from src/data/articles.js — single source of truth.
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Clock, Search } from "lucide-react";
import SEO from "../../components/ui/SEO";
import TrackedLink from "../../components/ui/TrackedLink";
import { articlesList, typeIcons } from "../../data/articles";

export default function Resources() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const types = useMemo(() => {
    const unique = [...new Set(articlesList.map((a) => a.type))];
    return ["All", ...unique];
  }, []);

  const filtered = useMemo(() => {
    const matched = articlesList.filter((a) => {
      const matchesType = activeFilter === "All" || a.type === activeFilter;
      const matchesSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });

    // Keep featured resources pinned first while preserving the existing order for all others.
    return matched.sort((a, b) => Number(b.featured === true) - Number(a.featured === true));
  }, [activeFilter, searchQuery]);

  return (
    <main id="main-content">
      <SEO
        title="Resources"
        description="Learn from the experts. Guides and articles to help you get the most from NetSuite. Free educational content from ERP Experts."
        path="/resources"
        keywords="NetSuite guides, NetSuite articles, ERP resources, NetSuite tips, NetSuite best practices"
      />

      {/* Hero */}
      <section
        className="flex items-center relative overflow-hidden"
        style={{ paddingTop: "140px", paddingBottom: "var(--space-2xl)", minHeight: "50vh" }}
      >
        {/* Mobile background triangles */}
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
        <div
          className="absolute lg:hidden"
          style={{
            bottom: "10%",
            left: "-15%",
            width: "200px",
            height: "172px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            opacity: 0.08,
          }}
        />
        {/* Desktop triangles */}
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
            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1000&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.5 }}
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl lg:max-w-5xl">
            <p className="text-label text-primary mb-md hidden md:block">Resources</p>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl leading-[1.1] font-bold lg:!text-[7rem] xl:!text-[9rem]"
              style={{ marginBottom: "var(--space-lg)" }}
            >
              Learn from
              <br />
              <span className="text-primary">the experts</span>.
            </h1>
            <p className="text-xl md:text-2xl text-muted max-w-2xl">
              Guides, articles and insights to help you get the most from NetSuite.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="border-t border-(--color-text)/10" style={{ padding: "1.5rem 0" }}>
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-lg">
            {/* Left: filters + count */}
            <div className="flex flex-wrap items-center gap-md">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className="px-4 py-2 rounded-full text-sm font-bold transition-all"
                  style={{
                    backgroundColor: activeFilter === type ? "var(--color-primary)" : "transparent",
                    color: activeFilter === type ? "white" : "var(--color-text-muted)",
                    border: activeFilter === type ? "1px solid var(--color-primary)" : "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  {type}
                </button>
              ))}
              <span className="text-sm text-muted ml-sm">
                {filtered.length} {filtered.length === 1 ? "resource" : "resources"}
              </span>
            </div>

            {/* Right: search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full text-sm border border-(--color-text)/10 focus:border-primary focus:outline-none transition-colors"
                style={{ backgroundColor: "transparent" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-lg md:gap-xl">
            {filtered.map((resource, i) => {
              const featuredCard = resource.featured;

              return (
                <Link
                  key={resource.slug}
                  to={`/resources/${resource.slug}`}
                  className={`group block overflow-hidden rounded-2xl md:rounded-3xl border transition-all hover:-translate-y-2 hover:shadow-lg ${
                    featuredCard
                      ? "border-primary/70 shadow-[0_12px_28px_rgba(230,48,125,0.18)] ring-2 ring-primary/25 hover:border-primary"
                      : "border-(--color-text)/15 hover:border-(--color-primary)/30"
                  }`}
                >
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <img
                      src={resource.image}
                      alt={resource.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading={i < 2 ? undefined : "lazy"}
                    />
                    {/* Triangle accent */}
                    <div
                      className="absolute bottom-0 right-0 opacity-80"
                      style={{
                        width: "80px",
                        height: "69px",
                        clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                        backgroundColor: "var(--color-primary)",
                        transform: "translateX(20px) translateY(20px)",
                      }}
                    />
                    {/* Type badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm">
                      <div className="flex items-center gap-1.5">
                        {(() => {
                          const TypeIcon = typeIcons[resource.type] || FileText;
                          return <TypeIcon className="w-3.5 h-3.5 text-primary" />;
                        })()}
                        <span className="text-xs font-bold">{resource.type}</span>
                      </div>
                    </div>
                    {featuredCard && (
                      <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-primary text-white text-[11px] font-bold tracking-[0.08em] uppercase">
                        Featured
                      </div>
                    )}
                    {resource.isNew && (
                      <div
                        className={`absolute right-4 px-2.5 py-1 rounded-full bg-black/80 text-white text-[11px] font-bold tracking-[0.08em] uppercase ${
                          featuredCard ? "top-[3.25rem]" : "top-4"
                        }`}
                      >
                        New
                      </div>
                    )}
                  </div>
                  <div className="p-lg md:p-xl">
                    <div className="flex items-center gap-sm mb-md text-muted">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{resource.readTime}</span>
                    </div>
                    <h4
                      className="text-xl group-hover:text-primary transition-colors"
                      style={{ marginBottom: "var(--space-sm)" }}
                    >
                      {resource.title}
                    </h4>
                    <p className="text-base text-muted mb-md">{resource.desc}</p>
                    <span
                      className="inline-flex items-center gap-sm px-4 py-2 rounded-full text-sm font-bold transition-all group-hover:scale-105"
                      style={{ backgroundColor: "var(--color-primary)", color: "white" }}
                    >
                      Read more <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-2xl">
              <p className="text-lg text-muted">No resources match your search.</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveFilter("All"); }}
                className="text-primary font-bold mt-md hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="rounded-2xl md:rounded-3xl overflow-hidden relative">
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, #a01d5a 100%)",
              }}
            />
            <div
              className="absolute top-0 left-0 opacity-10 hidden md:block"
              style={{
                width: "250px",
                height: "215px",
                clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                backgroundColor: "white",
                transform: "translateX(-60px) translateY(-60px)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 opacity-10 hidden md:block"
              style={{
                width: "300px",
                height: "260px",
                clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                backgroundColor: "white",
                transform: "translateX(80px) translateY(80px)",
              }}
            />

            <div className="relative z-10 p-xl md:p-2xl text-center">
              <h2 className="text-white" style={{ marginBottom: "var(--space-lg)" }}>
                Ready to talk <span className="text-white/80">NetSuite</span>?
              </h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto mb-xl">
                Whether you need implementation, support, or just want to explore your options,
                we're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <TrackedLink
                  to="/contact"
                  trackingName="resources_cta_contact"
                  trackingPage="resources"
                  className="btn justify-center bg-white text-primary hover:scale-105 transition-transform"
                >
                  Start a conversation
                  <ArrowRight className="w-5 h-5" />
                </TrackedLink>
                <TrackedLink
                  to="/case-studies"
                  trackingName="resources_cta_case_studies"
                  trackingPage="resources"
                  className="btn justify-center bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 transition-all"
                >
                  View case studies
                </TrackedLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
