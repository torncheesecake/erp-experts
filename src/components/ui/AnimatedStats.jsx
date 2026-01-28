import { useEffect, useRef, useState } from "react";

/**
 * Animated stat that counts up when in view
 */
function AnimatedStat({ value, label, highlight = false, color = "primary" }) {
  const ref = useRef(null);
  const [displayValue, setDisplayValue] = useState("0");
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            // Parse the value to extract prefix, number, and suffix
            // Handles: "100+", "94%", "£2m+", "12wk", etc.
            const match = value.match(/^([^\d]*)([\d.]+)(.*)$/);
            if (!match) {
              setDisplayValue(value);
              return;
            }

            const prefix = match[1] || "";
            const endNum = parseFloat(match[2]);
            const suffix = match[3] || "";

            if (prefersReducedMotion || isNaN(endNum)) {
              setDisplayValue(value);
              return;
            }

            const duration = 1200;
            const startTime = performance.now();

            const animate = (currentTime) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeOut = 1 - Math.pow(1 - progress, 3);

              const current =
                endNum % 1 === 0 ? Math.floor(endNum * easeOut) : (endNum * easeOut).toFixed(1);

              setDisplayValue(prefix + current + suffix);

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setDisplayValue(value);
              }
            };

            requestAnimationFrame(animate);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  const colorClass = highlight ? `text-${color}` : "";

  return (
    <div ref={ref} className="text-center">
      <p className={`font-heading text-4xl md:text-stat leading-none mb-sm ${colorClass}`}>
        {displayValue}
      </p>
      <p className="text-base text-muted">{label}</p>
    </div>
  );
}

/**
 * Stats grid with animated counting
 */
export default function AnimatedStats({ stats, color = "primary", highlightAlternate = true }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg md:gap-xl">
      {stats.map((stat, i) => (
        <AnimatedStat
          key={i}
          value={stat.value}
          label={stat.label}
          highlight={highlightAlternate ? i % 2 === 1 : false}
          color={color}
        />
      ))}
    </div>
  );
}
