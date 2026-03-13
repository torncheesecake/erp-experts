/**
 * Prominent icon treatment used across resource layouts.
 * Keeps icon usage intentional and visually consistent.
 */

const sizeMap = {
  sm: "resource-feature-icon-sm",
  md: "resource-feature-icon-md",
  lg: "resource-feature-icon-lg",
};

export default function SharedFeatureIcon({ icon: Icon, size = "md", className = "" }) {
  return (
    <div className={`resource-feature-icon ${sizeMap[size] || sizeMap.md} ${className}`.trim()}>
      <Icon />
    </div>
  );
}
