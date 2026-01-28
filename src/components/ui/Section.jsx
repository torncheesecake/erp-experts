/**
 * Reusable Section Component
 * Provides consistent section spacing and optional decorative elements
 */

export default function Section({
  children,
  className = "",
  padding = "default", // "default" | "large" | "none"
  border = false,
  dark = false,
  id,
}) {
  const paddingClasses = {
    default: "section-padding",
    large: "section-padding-lg",
    none: "",
  };

  return (
    <section
      id={id}
      className={`
        ${paddingClasses[padding]}
        ${border ? "border-t border-(--color-text)/10" : ""}
        ${dark ? "bg-(--color-bg-dark)" : ""}
        ${className}
      `}
    >
      {children}
    </section>
  );
}
