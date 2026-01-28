/**
 * Reusable Page Hero Component
 * Consistent hero section pattern across all pages
 */

import TriangleDecor from "./TriangleDecor";

export default function PageHero({
  label,
  title,
  titleHighlight,
  description,
  children,
  image,
  minHeight = "50vh",
}) {
  return (
    <section
      className="flex items-center relative overflow-hidden pt-(--space-4xl)"
      style={{ minHeight }}
    >
      {/* Offset triangle */}
      <TriangleDecor size="large" position="right" offset opacity={0.2} />

      {/* Main triangle with optional image */}
      <TriangleDecor size="hero" position="right" image={image} opacity={0.25} />

      <div className="container relative z-10">
        <div className="max-w-3xl">
          {label && (
            <p className="text-label text-primary mb-md">{label}</p>
          )}
          <h1 className="text-hero" style={{ marginBottom: "var(--space-xl)" }}>
            {title}
            {titleHighlight && (
              <span className="text-primary"> {titleHighlight}</span>
            )}
          </h1>
          {description && (
            <p className="text-lg md:text-xl text-muted">{description}</p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
