/**
 * ERP Experts Resource Article Page
 * Data imported from src/data/articles.js — single source of truth.
 *
 * Layout variants 1–3: rendered inline (existing articles).
 * Layout variants 4–9: dispatched to dedicated layout components.
 */

import { useParams, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "../../components/ui/SEO";
import TrackedLink from "../../components/ui/TrackedLink";
import { articles } from "../../data/articles";

import LayoutAlternating from "./layouts/LayoutAlternating";
import LayoutCards from "./layouts/LayoutCards";
import LayoutEditorial from "./layouts/LayoutEditorial";
import LayoutTimeline from "./layouts/LayoutTimeline";
import LayoutComparison from "./layouts/LayoutComparison";
import LayoutPoster from "./layouts/LayoutPoster";
import SharedBonusTips from "./layouts/SharedBonusTips";
import SharedFeatureIcon from "./layouts/SharedFeatureIcon";
import SharedHero from "./layouts/SharedHero";
import SharedOverview from "./layouts/SharedOverview";

const layoutComponents = {
  4: LayoutAlternating,
  5: LayoutCards,
  6: LayoutEditorial,
  7: LayoutTimeline,
  8: LayoutComparison,
  9: LayoutPoster,
};

const SITE_URL = "https://erpexperts.co.uk";

function absoluteUrl(value) {
  if (!value) return undefined;
  if (value.startsWith("http")) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function removeEmptyValues(value) {
  if (Array.isArray(value)) {
    return value.map(removeEmptyValues).filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, removeEmptyValues(item)])
        .filter(([, item]) => item !== undefined && item !== "" && !(Array.isArray(item) && item.length === 0))
    );
  }

  return value === undefined || value === null || value === "" ? undefined : value;
}

function buildResourceStructuredData(article, slug) {
  const pageUrl = `${SITE_URL}/resources/${slug}`;
  const imageUrl = absoluteUrl(article.schemaImage || article.heroImage);
  const publishedAt = article.publishedAt || article.datePublished;
  const modifiedAt = article.modifiedAt || article.dateModified || publishedAt;

  return [
    removeEmptyValues({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.metaDescription || article.intro || article.subtitle,
      image: imageUrl ? [imageUrl] : undefined,
      datePublished: publishedAt,
      dateModified: modifiedAt,
      author: {
        "@type": "Organization",
        name: "ERP Experts",
        url: `${SITE_URL}/about`,
      },
      publisher: {
        "@type": "Organization",
        name: "ERP Experts",
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/og-image.jpg`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": pageUrl,
      },
    }),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Resources",
          item: `${SITE_URL}/resources`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: article.title,
          item: pageUrl,
        },
      ],
    },
  ];
}

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

  const structuredData = buildResourceStructuredData(article, slug);

  // Variants 4–9 use dedicated layout components
  const Layout = layoutComponents[article.layoutVariant];
  if (Layout) {
    return (
      <main id="main-content" className="resource-article">
        <SEO
          title={article.title}
          description={article.metaDescription || article.intro}
          path={`/resources/${slug}`}
          type="article"
          keywords={article.keywords || "NetSuite tips, NetSuite optimisation, ERP best practices, NetSuite performance"}
          structuredData={structuredData}
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
        type="article"
        keywords={article.keywords || "NetSuite tips, NetSuite optimisation, ERP best practices, NetSuite performance"}
        structuredData={structuredData}
      />

      <SharedHero article={article} slug={slug} />

      <SharedOverview article={article} />

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
          <div className={article.tipsStyle === "decision-panels" ? "max-w-4xl mb-2xl" : "text-center mb-2xl"}>
            <p className="text-label text-primary mb-md">The Essentials</p>
            <h2 dangerouslySetInnerHTML={{ __html: article.tipsHeading }} />
            {article.tipsStyle === "decision-panels" && article.tipsIntro && (
              <p className="resource-body mt-lg">{article.tipsIntro}</p>
            )}
          </div>

          {article.tipsStyle === "decision-panels" ? (
            <div className="space-y-xl md:space-y-2xl">
              {article.tips.map((tip, i) => (
                <article
                  key={i}
                  className={`${i === 0 ? "pt-0 border-t-0" : "pt-xl md:pt-2xl border-t border-(--color-text)/10"}`}
                >
                  <div className="grid gap-xl lg:grid-cols-[minmax(16rem,0.82fr)_minmax(0,1.18fr)] lg:gap-2xl items-start">
                    <div
                      className="rounded-[1.2rem] p-lg md:p-xl"
                      style={{
                        background:
                          i % 2 === 0
                            ? "linear-gradient(165deg, rgba(230, 48, 125, 0.08) 0%, rgba(230, 48, 125, 0.03) 100%)"
                            : "linear-gradient(165deg, rgba(26, 26, 26, 0.05) 0%, rgba(26, 26, 26, 0.02) 100%)",
                      }}
                    >
                      <span className="block text-5xl md:text-6xl font-heading font-bold tracking-[-0.05em] text-primary/20 leading-[0.9]">
                        {tip.number}
                      </span>
                      <p className="text-xs md:text-sm font-bold tracking-[0.09em] uppercase text-primary/65 mt-md mb-sm">
                        Decision Point
                      </p>
                      <h4>{tip.title}</h4>
                    </div>

                    <div className="min-w-0">
                      <p className="resource-body">{tip.content}</p>

                      <div className="mt-lg pt-lg border-t border-(--color-text)/10">
                        <p className="text-sm font-bold tracking-[0.08em] uppercase text-primary/70 mb-md">
                          What to Check
                        </p>

                        <div className="grid gap-sm md:grid-cols-3">
                          {tip.actions.map((action, j) => (
                            <div
                              key={j}
                              className="rounded-[1rem] bg-(--color-text)/[0.03] p-md md:p-lg min-w-0"
                            >
                              <span className="text-primary/75 font-heading font-bold leading-none">
                                {String(j + 1).padStart(2, "0")}
                              </span>
                              <p className="resource-body mt-sm">{action}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
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
          )}
        </div>
      </section>

      {/* Conclusion */}
      {article.bottomLineStyle === "editorial-summary" ? (
        <section className="section-padding border-t border-(--color-text)/10">
          <div className="container">
            <div className="grid xl:grid-cols-[320px_minmax(0,1fr)] gap-2xl xl:gap-3xl items-start">
              <aside className="min-w-0 xl:pt-sm">
                <p className="text-label text-primary mb-lg">
                  {article.bottomLineAsideLabel || "What to Confirm First"}
                </p>
                <ul className="space-y-lg">
                  {(article.bottomLineAsideItems || article.takeaways?.slice(0, 3) || []).map(
                    (item, i) => (
                      <li key={i} className="flex items-start gap-md min-w-0">
                        <span className="shrink-0 mt-3 h-1.5 w-8 rounded-full bg-primary/75" />
                        <span className="resource-body">{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </aside>

              <div className="min-w-0">
                <p className="text-label text-primary mb-md">The Bottom Line</p>
                <h2 className="mb-lg">
                  Bringing It All <span className="text-primary">Together</span>
                </h2>
                <p className="resource-lead mb-lg">{article.conclusion}</p>
                {article.disclaimer && (
                  <p className="resource-fine italic pt-lg mt-lg border-t border-(--color-text)/10 max-w-3xl">
                    {article.disclaimer}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
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
                <h2 className="mb-lg">
                  Bringing It All <span className="text-primary">Together</span>
                </h2>
                <p className="resource-lead mb-lg">{article.conclusion}</p>
                {article.disclaimer && <p className="resource-fine italic">{article.disclaimer}</p>}
              </div>
            </div>
          </div>
        </section>
      )}

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
                  <h2 className="text-white mb-sm">Need help optimising your NetSuite?</h2>
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
