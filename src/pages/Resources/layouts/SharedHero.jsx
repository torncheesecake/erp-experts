/**
 * Shared Hero for Resource Article layouts
 * Extracted from ResourceArticle.jsx — identical hero across all variants.
 */

import { Clock, Calendar, BookOpen } from "lucide-react";
import Breadcrumb from "../../../components/ui/Breadcrumb";

export default function SharedHero({ article, slug }) {
  return (
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

        <div style={{ maxWidth: "960px" }}>
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
  );
}
