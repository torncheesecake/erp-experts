/**
 * Reusable Card Component
 * Consistent card styling with optional hover effects
 */

export default function Card({
  children,
  className = "",
  hover = true,
  padding = "default", // "default" | "large" | "none"
}) {
  const paddingClasses = {
    default: "p-(--space-xl)",
    large: "p-(--space-xl) md:p-(--space-2xl)",
    none: "",
  };

  return (
    <div
      className={`
        card
        ${paddingClasses[padding]}
        border border-(--color-text)/5
        ${hover ? "hover:border-(--color-primary)/20 transition-all hover:-translate-y-2" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
