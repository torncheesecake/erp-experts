/**
 * Layout Variant 9: Poster / Infographic
 * Visual ecosystem-style layout for app stacks, extensions, and linked resources.
 */

import { ArrowRight, ExternalLink } from "lucide-react";
import SharedHero from "./SharedHero";
import SharedCTA from "./SharedCTA";
import SharedBonusTips from "./SharedBonusTips";
import TrackedLink from "../../../components/ui/TrackedLink";

const compactBodyStyle = {
  fontSize: "clamp(0.96rem, 0.28vw + 0.9rem, 1.05rem)",
  lineHeight: 1.62,
};

const flowTitleStyle = {
  fontSize: "clamp(1.35rem, 0.75vw + 1rem, 1.65rem)",
  lineHeight: 1.08,
  letterSpacing: "-0.035em",
};

const appTitleStyle = {
  fontSize: "clamp(1.55rem, 0.9vw + 1rem, 2rem)",
  lineHeight: 1.06,
  letterSpacing: "-0.035em",
};

export default function LayoutPoster({ article, slug }) {
  return (
    <>
      <SharedHero article={article} slug={slug} />

      {/* Snapshot */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="max-w-5xl">
            <p className="text-label text-primary mb-md">Ecosystem Snapshot</p>
            <h2 className="mb-lg" dangerouslySetInnerHTML={{ __html: article.overviewHeading }} />
            <p className="resource-body">{article.intro}</p>
            {article.overviewSubtext && <p className="resource-body mt-md">{article.overviewSubtext}</p>}
          </div>

          {article.posterStats?.length > 0 && (
            <div className="mt-xl grid sm:grid-cols-2 xl:grid-cols-4 gap-md md:gap-lg">
              {article.posterStats.map((stat, i) => (
                <article
                  key={i}
                  className="rounded-2xl border border-(--color-text)/10 bg-[linear-gradient(165deg,rgba(255,255,255,0.98)_0%,rgba(251,251,251,0.92)_100%)] p-lg md:p-xl"
                >
                  <p className="text-[clamp(2.75rem,4vw,4rem)] leading-[0.9] font-heading font-bold tracking-[-0.04em] text-primary mb-sm">
                    {stat.value}
                  </p>
                  <p className="resource-body">{stat.label}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Flow */}
      {article.ecosystemFlow?.length > 0 && (
        <section
          className="section-padding border-t border-(--color-text)/10"
          style={{
            background:
              "linear-gradient(180deg, rgba(230, 48, 125, 0.05) 0%, rgba(230, 48, 125, 0.015) 100%)",
          }}
        >
          <div className="container">
            <p className="text-label text-primary mb-md">How the Stack Connects</p>
            <h2 className="mb-xl">
              One <span className="text-primary">Flow</span>, Multiple Apps
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-sm md:gap-md">
              {article.ecosystemFlow.map((step, i) => {
                const Icon = step.icon;
                return (
                  <article
                    key={i}
                    className="rounded-2xl border border-(--color-text)/10 bg-white p-md md:p-lg"
                  >
                    <div className="flex items-center justify-between mb-md">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-[0.85rem] border border-primary/18 bg-primary/8 text-primary">
                        <Icon className="w-5 h-5" strokeWidth={2.3} />
                      </span>
                      <span className="font-heading font-bold text-primary/55 text-sm">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h4 className="mb-sm" style={flowTitleStyle}>
                      {step.title}
                    </h4>
                    <p className="resource-body" style={compactBodyStyle}>
                      {step.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* App cards */}
      {article.appCards?.length > 0 && (
        <section className="section-padding border-t border-(--color-text)/10">
          <div className="container">
            <p className="text-label text-primary mb-md">NetSuite Apps & Extensions</p>
            <h2 className="mb-lg">
              Visual <span className="text-primary">Ecosystem Map</span>
            </h2>
            <p className="resource-body max-w-4xl">
              Use this as a quick-reference poster when you are planning which extensions to deploy
              first.
            </p>

            <div className="mt-xl grid md:grid-cols-2 xl:grid-cols-3 gap-md md:gap-lg">
              {article.appCards.map((app, i) => (
                <article
                  key={i}
                  className="rounded-2xl overflow-hidden border border-(--color-text)/12 shadow-[0_10px_24px_rgba(26,26,26,0.05)] bg-white"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={app.image}
                      alt={app.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 p-md"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(26,26,26,0) 0%, rgba(26,26,26,0.76) 100%)",
                      }}
                    >
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white bg-white/20 backdrop-blur-sm">
                        {app.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-md md:p-lg">
                    <div className="flex items-start gap-sm mb-md">
                      {app.logo && (
                        <div className="h-9 px-sm rounded-lg bg-(--color-text)/[0.03] border border-(--color-text)/10 inline-flex items-center">
                          <img src={app.logo} alt={`${app.name} logo`} className="h-5 w-auto object-contain" />
                        </div>
                      )}
                      <h4 style={appTitleStyle}>
                        {app.name}
                      </h4>
                    </div>

                    <p className="resource-body mb-md" style={compactBodyStyle}>
                      {app.summary}
                    </p>

                    <ul className="space-y-sm mb-md">
                      {app.highlights.map((point, j) => (
                        <li key={j} className="grid grid-cols-[1.2rem_minmax(0,1fr)] gap-sm items-start">
                          <span className="text-primary font-bold mt-[0.1rem]">•</span>
                          <span className="resource-body" style={compactBodyStyle}>
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-sm">
                      {app.internalTo && (
                        <TrackedLink
                          to={app.internalTo}
                          trackingName={app.internalTrackingName || "resource_poster_internal_link"}
                          trackingPage="resource-article"
                          className="inline-flex items-center gap-sm px-4 py-2 rounded-full text-sm font-bold bg-primary text-white hover:scale-105 transition-transform"
                        >
                          {app.internalLabel || "View details"}
                          <ArrowRight className="w-4 h-4" />
                        </TrackedLink>
                      )}

                      {app.externalHref && (
                        <TrackedLink
                          href={app.externalHref}
                          trackingName={app.externalTrackingName || "resource_poster_external_link"}
                          trackingPage="resource-article"
                          className="inline-flex items-center gap-sm px-4 py-2 rounded-full text-sm font-bold border border-(--color-text)/20 hover:border-primary/40"
                        >
                          {app.externalLabel || "Visit app"}
                          <ExternalLink className="w-4 h-4" />
                        </TrackedLink>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Resource links */}
      {article.resourceLinks?.length > 0 && (
        <section className="section-padding border-t border-(--color-text)/10">
          <div className="container">
            <p className="text-label text-primary mb-md">Resource Library</p>
            <h2 className="mb-xl">
              Useful <span className="text-primary">Links</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-lg">
              {article.resourceLinks.map((link, i) => (
                <article key={i} className="rounded-2xl border border-(--color-text)/10 bg-white p-lg md:p-xl">
                  <h5 className="mb-sm">{link.label}</h5>
                  <p className="resource-body mb-md">{link.description}</p>
                  <TrackedLink
                    to={link.to}
                    href={link.href}
                    trackingName={link.trackingName || "resource_poster_resource_link"}
                    trackingPage="resource-article"
                    className="inline-flex items-center gap-sm text-primary font-bold hover:underline"
                  >
                    {link.ctaLabel || "Open resource"}
                    <ArrowRight className="w-4 h-4" />
                  </TrackedLink>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Conclusion */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="max-w-5xl mx-auto rounded-3xl border border-(--color-text)/10 p-xl md:p-2xl bg-white shadow-[0_12px_32px_rgba(26,26,26,0.05)]">
            <p className="text-label text-primary mb-md">The Bottom Line</p>
            <h2 className="mb-lg">
              Building the Right <span className="text-primary">NetSuite Stack</span>
            </h2>
            <p className="resource-lead mb-lg">{article.conclusion}</p>
            {article.disclaimer && (
              <p className="resource-fine italic pt-lg mt-lg border-t border-(--color-text)/10">
                {article.disclaimer}
              </p>
            )}
          </div>
        </div>
      </section>

      {article.bonusTips?.length > 0 && (
        <SharedBonusTips
          article={article}
          label="Build Plan"
          title="Next Actions"
          accent="This Quarter"
        />
      )}

      <SharedCTA article={article} />
    </>
  );
}
