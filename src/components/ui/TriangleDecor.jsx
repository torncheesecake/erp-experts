/**
 * Decorative Triangle Component
 * Reusable triangle decoration used throughout the site
 */

export default function TriangleDecor({
  size = "medium", // "small" | "medium" | "large" | "hero"
  position = "right", // "left" | "right" | "center"
  opacity = 0.2,
  color = "var(--color-primary)",
  offset = false,
  className = "",
  image = null,
}) {
  const sizes = {
    small: { width: "300px", height: "260px" },
    medium: { width: "600px", height: "520px" },
    large: { width: "900px", height: "772px" },
    hero: { width: "920px", height: "789px" },
  };

  const positions = {
    left: { left: "25%", transform: "translateX(-50%) translateY(-50%)" },
    right: { left: "75%", transform: "translateX(-50%) translateY(-50%)" },
    center: { left: "50%", transform: "translateX(-50%) translateY(-50%)" },
  };

  const offsetTransform = offset
    ? "translateX(calc(-50% + 80px)) translateY(calc(-50% + 30px))"
    : positions[position].transform;

  return (
    <div
      className={`absolute top-1/2 hidden lg:block pointer-events-none ${className}`}
      style={{
        left: positions[position].left,
        transform: offsetTransform,
        width: sizes[size].width,
        height: sizes[size].height,
        clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
        backgroundColor: image ? undefined : color,
        opacity: image ? 1 : opacity,
        overflow: "hidden",
      }}
    >
      {image && (
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity: 0.5 }}
        />
      )}
    </div>
  );
}
