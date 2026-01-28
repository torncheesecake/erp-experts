/**
 * Homepage Stats Section
 */

import AnimatedStats from "../../components/ui/AnimatedStats";

const stats = [
  { value: "100+", label: "Projects" },
  { value: "94%", label: "On-time" },
  { value: "78%", label: "Adoption lift" },
  { value: "£2m+", label: "Min. turnover" },
];

export default function Stats() {
  return (
    <section className="section-padding border-t border-(--color-text)/10">
      <div className="container">
        <AnimatedStats stats={stats} />
      </div>
    </section>
  );
}
