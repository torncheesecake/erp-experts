/**
 * ERP Experts Resource Article Page
 * Data imported from src/data/articles.js — single source of truth.
 */

import { useParams, Link } from "react-router-dom";
import { ArrowRight, Clock, Calendar, BookOpen, Lightbulb, CheckCircle } from "lucide-react";
import SEO from "../../components/ui/SEO";
import TrackedLink from "../../components/ui/TrackedLink";
import Breadcrumb from "../../components/ui/Breadcrumb";
import { articles } from "../../data/articles";

export default function ResourceArticle() {
  const { slug } = useParams();
  const article = articles[slug];

  if (!article) {
    return (
      <main id="main-content" className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-hero" style={{ marginBottom: "var(--space-lg)" }}>
            Article not found
          </h1>
          <Link to="/resources" className="btn btn-primary">
            Back to Resources
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content">
      <SEO
        title={article.title}
        description={article.intro}
        path={`/resources/${slug}`}
        keywords="NetSuite tips, NetSuite optimisation, ERP best practices, NetSuite performance"
      />

      {/* Hero - Similar to case studies */}
      <section className="relative min-h-[45vh] md:min-h-[50vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={article.heroImage} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/40" />
        </div>

        {/* Decorative triangle */}
        <div
          className="absolute bottom-0 right-0 opacity-20 hidden lg:block pointer-events-none"
          style={{
            width: "700px",
            height: "600px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(20%)",
          }}
        />

        <div className="container relative z-20 pt-(--space-4xl)">
          <Breadcrumb
            items={[
              { label: "Home", to: "/" },
              { label: "Resources", to: "/resources" },
              { label: article.title },
            ]}
            light
          />

          <div style={{ maxWidth: "800px" }}>
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-md mb-lg">
              <span className="inline-flex items-center gap-sm px-4 py-2 rounded-full bg-primary text-white text-sm font-bold">
                <BookOpen className="w-4 h-4" />
                {article.type}
              </span>
              <span className="flex items-center gap-sm text-white/60 text-sm">
                <Calendar className="w-4 h-4" />
                {article.date}
              </span>
              <span className="flex items-center gap-sm text-white/60 text-sm">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading text-white"
              style={{ marginBottom: "var(--space-lg)", textWrap: "balance" }}
            >
              {article.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/70 leading-relaxed max-w-2xl">
              {article.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* In This Guide Bar */}
      <section style={{ backgroundColor: "rgba(230, 48, 125, 0.03)", padding: "2rem 0" }}>
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-lg">
            <div className="flex items-center gap-md">
              <div
                style={{
                  width: "20px",
                  height: "17px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "var(--color-primary)",
                }}
              />
              <span className="text-base font-bold text-primary">In This Guide</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-lg md:gap-xl">
              <div className="flex items-center gap-sm">
                <div className="icon-box icon-box-sm rounded-lg bg-primary/10">
                  <Lightbulb className="w-4 h-4 text-primary" />
                </div>
                <span className="text-base font-medium">{article.tips.length} Key Tips</span>
              </div>
              <div className="flex items-center gap-sm">
                <div className="icon-box icon-box-sm rounded-lg bg-primary/10">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <span className="text-base font-medium">
                  {article.bonusTips.length} Bonus Strategies
                </span>
              </div>
              <div className="flex items-center gap-sm">
                <div className="icon-box icon-box-sm rounded-lg bg-primary/10">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <span className="text-base font-medium">{article.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro + Key Takeaways */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_400px] gap-2xl items-center">
            {/* Intro text */}
            <div>
              <p className="text-label text-primary mb-md">Overview</p>
              <h2 className="mb-lg" dangerouslySetInnerHTML={{ __html: article.overviewHeading }} />
              <p className="text-lg text-muted leading-relaxed mb-lg">{article.intro}</p>
              <p className="text-lg text-muted leading-relaxed">{article.overviewSubtext}</p>
            </div>

            {/* Key takeaways box */}
            <div className="bg-primary/5 rounded-2xl p-xl border border-primary/10">
              <p className="text-label text-primary mb-lg">Quick Wins</p>
              <ul className="flex flex-col gap-md">
                {article.takeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-center gap-md">
                    <div
                      className="shrink-0"
                      style={{
                        width: "24px",
                        height: "21px",
                        clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                        backgroundColor: "var(--color-primary)",
                      }}
                    />
                    <span className="text-base font-medium">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Image - for layout variants 2 and 3 */}
      {article.featureImage && (
        <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-2xl items-center">
              {article.layoutVariant === 2 ? (
                <>
                  <div className="rounded-2xl overflow-hidden">
                    <img
                      src={article.featureImage}
                      alt=""
                      loading="lazy"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-label text-primary mb-md">
                      {article.challengeLabel || "The Challenge"}
                    </p>
                    <h3
                      className="mb-lg"
                      dangerouslySetInnerHTML={{
                        __html:
                          article.challengeHeading ||
                          'Why This <span class="text-primary">Matters</span>',
                      }}
                    />
                    <p className="text-lg text-muted leading-relaxed">
                      {article.challengeText || article.overviewSubtext}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-label text-primary mb-md">The Solution</p>
                    <h3 className="mb-lg">
                      There's a <span className="text-primary">Better Way</span>
                    </h3>
                    <p className="text-lg text-muted leading-relaxed">
                      A comprehensive ERP system provides a single source of truth for business
                      data, accessible anytime, anywhere. Moving data to an ERP system ensures that
                      reporting is streamlined, data quality is improved, and insights are instantly
                      available.
                    </p>
                  </div>
                  <div className="rounded-2xl overflow-hidden">
                    <img
                      src={article.featureImage}
                      alt=""
                      loading="lazy"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Tips */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">The Essentials</p>
            <h2 dangerouslySetInnerHTML={{ __html: article.tipsHeading }} />
          </div>

          <div className="grid gap-lg">
            {article.tips.map((tip, i) => (
              <div
                key={i}
                className="grid md:grid-cols-[100px_1fr_1fr] gap-lg md:gap-xl items-start p-lg md:p-xl rounded-2xl border border-(--color-text)/5 hover:border-primary/20 transition-colors"
              >
                {/* Number */}
                <div className="flex md:flex-col items-center gap-md">
                  <span className="text-4xl md:text-5xl font-heading font-bold text-primary/15">
                    {tip.number}
                  </span>
                  <div className="icon-box icon-box-lg rounded-xl bg-primary/10 md:mt-sm">
                    <tip.icon className="w-7 h-7 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h4 className="mb-md">{tip.title}</h4>
                  <p className="text-lg text-muted leading-relaxed">{tip.content}</p>
                </div>

                {/* Actions */}
                <div className="bg-(--color-text)/[0.02] rounded-xl p-lg">
                  <p className="text-base font-bold text-primary mb-md">Action Items</p>
                  <ul className="flex flex-col gap-md">
                    {tip.actions.map((action, j) => (
                      <li key={j} className="flex items-start gap-sm">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-base text-muted">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1400&q=80"
            alt=""
            loading="lazy"
            className="w-full h-full object-cover opacity-[0.12]"
          />
        </div>

        {/* Large decorative triangle on left - part of background overlay */}
        <div
          className="absolute left-0 bottom-0 -translate-x-1/4 hidden lg:block"
          style={{
            width: "700px",
            height: "606px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            opacity: 0.08,
          }}
        />
        {/* Smaller solid triangle overlapping */}
        <div
          className="absolute left-[120px] bottom-[80px] hidden lg:block"
          style={{
            width: "220px",
            height: "190px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            opacity: 0.9,
          }}
        />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            {/* Left side - spacer for visual balance on desktop */}
            <div className="hidden lg:block" />

            {/* Right side - content */}
            <div>
              <p className="text-label text-primary mb-md">The Bottom Line</p>
              <h3 className="mb-lg">
                Ready to <span className="text-primary">Take Action</span>?
              </h3>
              <p className="text-xl text-muted leading-relaxed mb-lg">{article.conclusion}</p>
              <p className="text-sm text-muted/50 italic">{article.disclaimer}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bonus Tips */}
      <section
        className="section-padding-lg"
        style={{ backgroundColor: "rgba(230, 48, 125, 0.03)" }}
      >
        <div className="container">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">Bonus Tips</p>
            <h3>
              Keep the Momentum <span className="text-primary">Going</span>
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {article.bonusTips.map((tip, i) => (
              <div key={i} className="bg-white rounded-xl p-lg">
                <div className="icon-box icon-box-md rounded-xl bg-primary/10 mb-md">
                  <tip.icon className="w-5 h-5 text-primary" />
                </div>
                <h5 style={{ marginBottom: "var(--space-sm)" }}>{tip.title}</h5>
                <p className="text-sm text-muted">{tip.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="rounded-2xl md:rounded-3xl overflow-hidden relative">
            {/* Background */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, #a01d5a 100%)",
              }}
            />
            {/* Decorative triangles */}
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

            <div className="relative z-10 p-xl md:p-2xl">
              <div className="grid md:grid-cols-[1fr_auto] gap-xl items-center">
                <div>
                  <h3 className="text-white mb-sm">Need help optimising your NetSuite?</h3>
                  <p className="text-white/70 text-base">
                    Our team can help you implement these tips and more.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-md">
                  <TrackedLink
                    to="/contact"
                    trackingName="resource_article_contact"
                    trackingPage="resource-article"
                    className="btn btn-lg justify-center bg-white text-primary hover:scale-105 transition-transform"
                  >
                    Start a conversation
                    <ArrowRight className="w-5 h-5" />
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
