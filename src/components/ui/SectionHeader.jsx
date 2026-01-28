/**
 * Reusable Section Header Component
 * Label + Heading pattern used across the site
 */

export default function SectionHeader({
  label,
  heading,
  headingHighlight,
  description,
  centered = false,
  className = "",
}) {
  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      {label && (
        <p className="text-label text-primary mb-md">{label}</p>
      )}
      <h3>
        {heading}
        {headingHighlight && (
          <span className="text-primary"> {headingHighlight}</span>
        )}
      </h3>
      {description && (
        <p className="text-lg text-muted mt-lg max-w-2xl" style={centered ? { margin: "var(--space-lg) auto 0" } : {}}>
          {description}
        </p>
      )}
    </div>
  );
}
