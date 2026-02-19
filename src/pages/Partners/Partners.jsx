/**
 * ERP Experts Partners Listing Page
 * Data imported from src/data/partners.js — single source of truth.
 */

import { Link } from "react-router-dom";
import { ArrowRight, Globe, ExternalLink } from "lucide-react";
import SEO from "../../components/ui/SEO";
import TrackedLink from "../../components/ui/TrackedLink";
import { partnersList } from "../../data/partners";

export default function Partners() {
  return (
    <main id="main-content">
      <SEO
        title="Partners"
        description="We work with best-in-class technology partners to deliver complete solutions for your business. Meet our trusted partners."
        path="/partners"
        keywords="NetSuite partners, ERP partners, Phocas, Levy Global, business intelligence, technology consulting"
      />

      {/* Hero — matching detail page style */}
      <section
        className="relative overflow-hidden"
        style={{
          paddingTop: "140px",
          paddingBottom: "var(--space-3xl)",
          background: "linear-gradient(135deg, #1a1a2e08 0%, #1a1a2e15 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 hidden lg:block pointer-events-none"
          style={{
            width: "800px",
            height: "686px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "#1a1a2e",
            opacity: 0.06,
            transform: "translateX(200px) translateY(-100px)",
          }}
        />
        <div className="container relative z-10">
          <div style={{ marginTop: "var(--space-2xl)" }}>
            <p className="text-label mb-md" style={{ color: "#1a1a2e" }}>
              Partners
            </p>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.1]"
              style={{ marginBottom: "var(--space-xl)" }}
            >
              Better Together.
            </h1>
            <p className="text-lg md:text-xl text-muted leading-relaxed max-w-2xl">
              We work with best-in-class technology partners to deliver complete solutions for your
              business. Each partner brings specialist expertise that complements our NetSuite
              capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="flex flex-col" style={{ gap: "var(--space-3xl)" }}>
            {partnersList.map((partner, i) => (
              <Link
                key={partner.slug}
                to={`/partners/${partner.slug}`}
                className="group block overflow-hidden rounded-2xl md:rounded-3xl border-2 border-(--color-text)/10 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className={`grid md:grid-cols-2 ${i % 2 === 1 ? "md:direction-rtl" : ""}`}>
                  {/* Image */}
                  <div className="aspect-[16/10] md:aspect-auto relative overflow-hidden bg-gray-100">
                    <img
                      src={partner.image}
                      alt={partner.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div
                    className="flex flex-col justify-center"
                    style={{ padding: "var(--space-xl) var(--space-2xl)" }}
                  >
                    <p className="text-label mb-md" style={{ color: "#1a1a2e" }}>
                      {partner.tagline}
                    </p>
                    <h2
                      className="font-heading font-bold"
                      style={{ marginBottom: "var(--space-lg)" }}
                    >
                      {partner.name}
                    </h2>
                    <p
                      className="text-base md:text-lg text-muted leading-relaxed"
                      style={{ marginBottom: "var(--space-xl)" }}
                    >
                      {partner.description}
                    </p>
                    <div className="flex items-center gap-sm font-bold group-hover:gap-md transition-all">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
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
                background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)",
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
                <h2 className="text-white" style={{ marginBottom: "var(--space-xl)" }}>
                  Interested in <span className="text-white/80">partnering</span>?
                </h2>
                <p
                  className="text-white/80 text-lg max-w-2xl mx-auto"
                  style={{ marginBottom: "var(--space-2xl)" }}
                >
                  Whether you're looking for a technology partner or want to explore how our partner
                  network can benefit your business, we'd love to hear from you.
                </p>
                <div className="flex flex-col sm:flex-row gap-md justify-center">
                  <TrackedLink
                    to="/contact"
                    trackingName="partners_cta_contact"
                    trackingPage="partners"
                    className="btn justify-center bg-white hover:scale-105 transition-transform"
                    style={{ color: "#1a1a2e" }}
                  >
                    Start a conversation
                    <ArrowRight className="w-5 h-5" />
                  </TrackedLink>
                  <TrackedLink
                    to="/case-studies"
                    trackingName="partners_cta_case_studies"
                    trackingPage="partners"
                    className="btn justify-center bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 transition-all"
                  >
                    View case studies
                  </TrackedLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
