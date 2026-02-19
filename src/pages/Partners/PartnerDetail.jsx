/**
 * ERP Experts Partner Detail Page
 * Unique layout per partner — not a copy of case studies.
 */

import { useParams, Link } from "react-router-dom";
import { ArrowRight, ExternalLink, MapPin, Globe, CheckCircle } from "lucide-react";
import SEO from "../../components/ui/SEO";
import Breadcrumb from "../../components/ui/Breadcrumb";
import TrackedLink from "../../components/ui/TrackedLink";
import { partners } from "../../data/partners";

export default function PartnerDetail() {
  const { slug } = useParams();
  const partner = partners[slug];

  if (!partner) {
    return (
      <main id="main-content" className="section-padding-lg">
        <div className="container text-center">
          <h2 className="mb-lg">Partner not found</h2>
          <Link to="/partners" className="btn btn-primary">
            Back to partners
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content">
      <SEO
        title={`${partner.name} - Partner`}
        description={partner.description}
        path={`/partners/${slug}`}
        keywords={`${partner.name}, NetSuite partner, ${partner.industry}`}
      />

      {/* Hero — clean, partner-branded */}
      <section
        className="relative overflow-hidden"
        style={{
          paddingTop: "140px",
          paddingBottom: "var(--space-3xl)",
          background: `linear-gradient(135deg, ${partner.color}08 0%, ${partner.color}15 100%)`,
        }}
      >
        <div
          className="absolute top-0 right-0 hidden lg:block pointer-events-none"
          style={{
            width: "800px",
            height: "686px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: partner.color,
            opacity: 0.06,
            transform: "translateX(200px) translateY(-100px)",
          }}
        />
        <div className="container relative z-10">
          <Breadcrumb
            items={[
              { label: "Home", to: "/" },
              { label: "Partners", to: "/partners" },
              { label: partner.name },
            ]}
          />
          <div
            className="grid lg:grid-cols-2 gap-2xl items-center"
            style={{ marginTop: "var(--space-2xl)" }}
          >
            <div>
              <p className="text-label mb-md" style={{ color: partner.color }}>
                {partner.tagline}
              </p>
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.1]"
                style={{ marginBottom: "var(--space-xl)" }}
              >
                {partner.name}
              </h1>
              <p className="text-lg md:text-xl text-muted leading-relaxed mb-xl">{partner.intro}</p>
              <div className="flex flex-wrap gap-md">
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn border-2 hover:scale-105 transition-transform"
                  style={{ borderColor: partner.color, color: partner.color }}
                >
                  <Globe className="w-4 h-4" />
                  Visit {partner.name}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <TrackedLink
                  to="/contact"
                  trackingName={`partner_${slug}_hero_cta`}
                  trackingPage="partner_detail"
                  className="btn text-white hover:scale-105 transition-transform"
                  style={{ backgroundColor: partner.color }}
                >
                  Talk to us about {partner.name}
                  <ArrowRight className="w-4 h-4" />
                </TrackedLink>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl">
                <img
                  src={partner.heroImage}
                  alt={partner.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="absolute -bottom-4 -left-4 hidden md:block"
                style={{
                  width: "100px",
                  height: "86px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: partner.color,
                  opacity: 0.3,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {partner.stats && (
        <section className="section-padding-lg" style={{ backgroundColor: `${partner.color}08` }}>
          <div className="container">
            <div
              className="grid gap-lg text-center"
              style={{
                gridTemplateColumns: `repeat(${partner.stats.length}, 1fr)`,
              }}
            >
              {partner.stats.map((stat, i) => (
                <div key={i}>
                  <div
                    className="text-3xl md:text-4xl font-heading font-bold mb-sm"
                    style={{ color: partner.color }}
                  >
                    {stat.value}
                  </div>
                  <p className="text-muted text-sm md:text-base">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {partner.brands && (
        <section className="section-padding-lg border-t border-(--color-text)/10">
          <div className="container">
            <p className="text-label text-center mb-md" style={{ color: partner.color }}>
              Specialist Brands
            </p>
            <h2 className="text-center" style={{ marginBottom: "var(--space-2xl)" }}>
              Two Brands, One <span style={{ color: partner.color }}>Mission</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-xl">
              {partner.brands.map((brand, i) => (
                <div
                  key={i}
                  className="rounded-2xl md:rounded-3xl p-xl md:p-2xl relative overflow-hidden"
                  style={{
                    background:
                      i === 0
                        ? `linear-gradient(135deg, ${partner.color} 0%, ${partner.darkColor} 100%)`
                        : undefined,
                    border: i === 1 ? `2px solid ${partner.color}20` : undefined,
                  }}
                >
                  <h3 className="mb-lg" style={{ color: i === 0 ? "#fff" : partner.color }}>
                    {brand.name}
                  </h3>
                  <p
                    className="text-lg leading-relaxed"
                    style={{
                      color: i === 0 ? "rgba(255,255,255,0.85)" : "var(--color-text-muted)",
                    }}
                  >
                    {brand.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Industries */}
      {partner.industries && (
        <section
          className="border-t border-(--color-text)/10"
          style={{ padding: "var(--space-2xl) 0" }}
        >
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center gap-lg md:gap-2xl">
              <p className="font-bold shrink-0" style={{ color: partner.color }}>
                Industries served
              </p>
              <div className="flex flex-wrap gap-sm">
                {partner.industries.map((ind, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${partner.color}10`,
                      color: partner.color,
                    }}
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Locations (Levy Global) */}
      {partner.locations && (
        <section
          className="border-t border-(--color-text)/10"
          style={{ padding: "var(--space-2xl) 0" }}
        >
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center gap-lg md:gap-2xl">
              <p className="font-bold shrink-0" style={{ color: partner.color }}>
                Global offices
              </p>
              <div className="flex flex-wrap gap-xl">
                {partner.locations.map((loc, i) => (
                  <div key={i} className="flex items-center gap-sm">
                    <MapPin className="w-4 h-4" style={{ color: partner.color }} />
                    <span className="font-medium">{loc.city}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How we work together sections */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <p className="text-label text-center mb-md" style={{ color: partner.color }}>
            Partnership
          </p>
          <h2 className="text-center" style={{ marginBottom: "var(--space-3xl)" }}>
            Why <span style={{ color: partner.color }}>{partner.name}</span> + ERP Experts
          </h2>
          <div className="max-w-3xl mx-auto flex flex-col" style={{ gap: "var(--space-2xl)" }}>
            {partner.sections.map((section, i) => (
              <div key={i} className="flex gap-lg">
                <div className="shrink-0 pt-1">
                  <CheckCircle className="w-6 h-6" style={{ color: partner.color }} />
                </div>
                <div>
                  <h3 className="mb-md" style={{ fontSize: "1.25rem" }}>
                    {section.title}
                  </h3>
                  <p className="text-muted text-lg leading-relaxed">{section.content}</p>
                </div>
              </div>
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
                background: `linear-gradient(135deg, ${partner.color} 0%, ${partner.darkColor} 100%)`,
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
                  Interested in <span className="text-white/80">{partner.name}</span>?
                </h2>
                <p
                  className="text-white/80 text-lg max-w-2xl mx-auto"
                  style={{ marginBottom: "var(--space-2xl)" }}
                >
                  Get in touch to find out how {partner.name} and ERP Experts can work together for
                  your business.
                </p>

                <div className="flex flex-col sm:flex-row gap-md justify-center">
                  <TrackedLink
                    to="/contact"
                    trackingName={`partner_${slug}_footer_cta`}
                    trackingPage="partner_detail"
                    className="btn justify-center bg-white hover:scale-105 transition-transform"
                    style={{ color: partner.color }}
                  >
                    Start a conversation
                    <ArrowRight className="w-5 h-5" />
                  </TrackedLink>
                  <Link
                    to="/partners"
                    className="btn justify-center bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 transition-all"
                  >
                    View all partners
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
