/**
 * ERP Experts Resource Article Page
 * Data imported from src/data/articles.js — single source of truth.
 *
 * Layout variants 1–3: rendered inline (existing articles).
 * Layout variants 4–8: dispatched to dedicated layout components.
 */

import { useParams, Link } from "react-router-dom";
import { ArrowRight, Clock, Calendar, BookOpen, CheckCircle } from "lucide-react";
import SEO from "../../components/ui/SEO";
import TrackedLink from "../../components/ui/TrackedLink";
import Breadcrumb from "../../components/ui/Breadcrumb";
import { articles } from "../../data/articles";

import LayoutAlternating from "./layouts/LayoutAlternating";
import LayoutCards from "./layouts/LayoutCards";
import LayoutEditorial from "./layouts/LayoutEditorial";
import LayoutTimeline from "./layouts/LayoutTimeline";
import LayoutComparison from "./layouts/LayoutComparison";
import SharedGuideBar from "./layouts/SharedGuideBar";
import SharedBonusTips from "./layouts/SharedBonusTips";
import SharedFeatureIcon from "./layouts/SharedFeatureIcon";

const layoutComponents = {
  4: LayoutAlternating,
  5: LayoutCards,
  6: LayoutEditorial,
  7: LayoutTimeline,
  8: LayoutComparison,
};

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

  // Variants 4–8 use dedicated layout components
  const Layout = layoutComponents[article.layoutVariant];
  if (Layout) {
    return (
      <main id="main-content" className="resource-article">
        <SEO
          title={article.title}
          description={article.metaDescription || article.intro}
          path={`/resources/${slug}`}
          keywords={article.keywords || "NetSuite tips, NetSuite optimisation, ERP best practices, NetSuite performance"}
        />
        <Layout article={article} slug={slug} />
      </main>
    );
  }

  // Variants 1–3: legacy inline layout
  return (
    <main id="main-content" className="resource-article">
      <SEO
        title={article.title}
        description={article.metaDescription || article.intro}
        path={`/resources/${slug}`}
        keywords={article.keywords || "NetSuite tips, NetSuite optimisation, ERP best practices, NetSuite performance"}
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

        <div
          className="container relative z-20"
          style={{ paddingTop: "clamp(5.75rem, 15vw, 8.75rem)" }}
        >
          <div className="hidden sm:block">
            <Breadcrumb
              items={[
                { label: "Home", to: "/" },
                { label: "Resources", to: "/resources" },
                { label: article.title },
              ]}
              light
            />
          </div>

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
              className="resource-hero-title font-heading text-white"
              style={{ marginBottom: "var(--space-lg)" }}
            >
              {article.title}
            </h1>
            <p className="resource-hero-subtitle">
              {article.subtitle}
            </p>
          </div>
        </div>
      </section>

      <SharedGuideBar
        tipsCount={article.tips.length}
        tipsLabel="Key Tips"
        bonusCount={article.bonusTips.length}
        bonusLabel="Bonus Strategies"
        readTime={article.readTime}
      />

      {/* Intro + Key Takeaways */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_400px] gap-2xl items-center">
            {/* Intro text */}
            <div>
              <p className="text-label text-primary mb-md">Overview</p>
              <h2 className="mb-lg" dangerouslySetInnerHTML={{ __html: article.overviewHeading }} />
              <p className="resource-lead mb-lg">{article.intro}</p>
              <p className="resource-body">{article.overviewSubtext}</p>
            </div>

            {/* Key takeaways box */}
            <div className="bg-primary/5 rounded-2xl p-xl border border-primary/10">
              <p className="text-label text-primary mb-lg">Quick Wins</p>
              <ul className="flex flex-col gap-md">
                {article.takeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-md">
                    <SharedFeatureIcon icon={CheckCircle} size="sm" className="shrink-0 mt-0.5" />
                    <span className="resource-body">{takeaway}</span>
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
                    <p className="resource-body">
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
                    <p className="resource-body">
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
                  <SharedFeatureIcon icon={tip.icon} size="lg" className="md:mt-sm" />
                </div>

                {/* Content */}
                <div>
                  <h4 className="mb-md">{tip.title}</h4>
                  <p className="resource-body">{tip.content}</p>
                </div>

                {/* Actions */}
                <div className="bg-(--color-text)/[0.02] rounded-xl p-lg">
                  <p className="text-base font-bold text-primary mb-md">At a Glance</p>
                  <ul className="flex flex-col gap-md">
                    {tip.actions.map((action, j) => (
                      <li key={j} className="flex items-start gap-sm">
                        <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-heading font-bold text-sm flex items-center justify-center">
                          {j + 1}
                        </span>
                        <span className="resource-body">{action}</span>
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
                Bringing It All <span className="text-primary">Together</span>
              </h3>
              <p className="resource-lead mb-lg">{article.conclusion}</p>
              {article.disclaimer && <p className="resource-fine italic">{article.disclaimer}</p>}
            </div>
          </div>
        </div>
      </section>

      <SharedBonusTips article={article} />

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
