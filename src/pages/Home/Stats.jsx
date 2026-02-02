/**
 * Homepage Stats Section
 */

import AnimatedStats from "../../components/ui/AnimatedStats";

const stats = [
  { value: "21", label: "Years specialising in NetSuite" },
  { value: "350+", label: "Projects" },
  { value: "33,000+", label: "Support tickets resolved" },
];

export default function Stats() {
  return (
    <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
      {/* Decorative triangle */}
      <div
        className="absolute top-1/2 right-0 opacity-[0.03] hidden lg:block pointer-events-none"
        style={{
          width: "400px",
          height: "343px",
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          backgroundColor: "var(--color-primary)",
          transform: "translateX(50%) translateY(-50%)",
        }}
      />
      <div className="container relative z-10">
        <AnimatedStats stats={stats} columns={3} />
      </div>
    </section>
  );
}
