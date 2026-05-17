import { useEffect, useMemo } from "react";

const DEFAULTS = {
  siteName: "ERP Experts",
  tagName: "UK's Trusted NetSuite Implementation Partner",
  baseUrl: "https://erpexperts.co.uk",
  image: "https://erpexperts.co.uk/og-image.jpg",
  description:
    "Transform your business with NetSuite. ERP Experts delivers expert implementation, training, and ongoing support for growing UK businesses. 230+ successful projects.",
  locale: "en_GB",
  twitterHandle: "@erpexperts",
};

function buildTitle(pageTitle) {
  const brand = `${DEFAULTS.siteName} | ${DEFAULTS.tagName}`;
  return pageTitle ? `${pageTitle} | ${DEFAULTS.siteName}` : brand;
}

export default function SEO({
  title,
  description = DEFAULTS.description,
  path = "",
  image = DEFAULTS.image,
  type = "website",
  keywords,
  noIndex = false,
  structuredData,
}) {
  const fullTitle = buildTitle(title);
  const url = `${DEFAULTS.baseUrl}${path || ""}`;
  const fullImage = image.startsWith("http") ? image : `${DEFAULTS.baseUrl}${image}`;
  const structuredDataItems = useMemo(
    () =>
      structuredData
        ? Array.isArray(structuredData)
          ? structuredData
          : [structuredData]
        : [],
    [structuredData],
  );

  useEffect(() => {
    const ensureMeta = (selector, attributes) => {
      const existing = document.head.querySelectorAll(selector);
      const target = existing[0] || document.createElement("meta");

      Object.entries(attributes).forEach(([key, value]) => {
        if (value === undefined || value === null || value === false) return;
        target.setAttribute(key, String(value));
      });

      if (existing.length === 0) {
        document.head.appendChild(target);
      }

      existing.forEach((node, index) => {
        if (index > 0) node.remove();
      });
    };

    const ensureLink = (selector, attributes) => {
      const existing = document.head.querySelectorAll(selector);
      const target = existing[0] || document.createElement("link");

      Object.entries(attributes).forEach(([key, value]) => {
        target.setAttribute(key, String(value));
      });

      if (existing.length === 0) {
        document.head.appendChild(target);
      }

      existing.forEach((node, index) => {
        if (index > 0) node.remove();
      });
    };

    document.title = fullTitle;
    ensureMeta('meta[name="title"]', { name: "title", content: fullTitle });
    ensureMeta('meta[name="description"]', { name: "description", content: description });
    if (keywords) ensureMeta('meta[name="keywords"]', { name: "keywords", content: keywords });
    ensureMeta('meta[name="robots"]', {
      name: "robots",
      content: noIndex ? "noindex, nofollow" : "index, follow",
    });
    ensureLink('link[rel="canonical"]', { rel: "canonical", href: url });
    ensureMeta('meta[property="og:type"]', { property: "og:type", content: type });
    ensureMeta('meta[property="og:url"]', { property: "og:url", content: url });
    ensureMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    ensureMeta('meta[property="og:description"]', { property: "og:description", content: description });
    ensureMeta('meta[property="og:image"]', { property: "og:image", content: fullImage });
    ensureMeta('meta[name="twitter:url"]', { name: "twitter:url", content: url });
    ensureMeta('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });
    ensureMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    ensureMeta('meta[name="twitter:image"]', { name: "twitter:image", content: fullImage });

    document.head
      .querySelectorAll('script[type="application/ld+json"][data-seo-managed="true"]')
      .forEach((node) => node.remove());

    structuredDataItems.forEach((item) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seoManaged = "true";
      script.textContent = JSON.stringify(item);
      document.head.appendChild(script);
    });
  }, [description, fullImage, fullTitle, keywords, noIndex, structuredDataItems, type, url]);

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={DEFAULTS.siteName} />
      <meta property="og:locale" content={DEFAULTS.locale} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      {DEFAULTS.twitterHandle && <meta name="twitter:site" content={DEFAULTS.twitterHandle} />}

      {/* Additional SEO Meta Tags */}
      <meta name="language" content="English" />
      <meta name="geo.region" content="GB-STS" />
      <meta name="geo.placename" content="Stafford" />
      <meta httpEquiv="content-language" content="en-GB" />

      {/* JSON-LD is managed in the effect above so it stays in document.head. */}
    </>
  );
}
