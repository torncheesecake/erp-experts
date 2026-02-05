/**
 * Homepage Testimonial Section
 */

import { MessageSquareQuote } from "lucide-react";

export default function Testimonial() {
  return (
    <section
      className="section-padding-lg border-t border-(--color-text)/10"
      style={{ backgroundColor: "rgba(42, 157, 99, 0.05)" }}
    >
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="mx-auto flex items-end justify-center mb-xl"
            style={{
              width: "64px",
              height: "55px",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              backgroundColor: "var(--color-quaternary)",
            }}
          >
            <MessageSquareQuote className="w-6 h-6 text-white mb-2" />
          </div>
          <blockquote
            className="text-2xl md:text-3xl font-heading font-medium leading-snug"
            style={{ marginBottom: "var(--space-xl)" }}
          >
            "Would I recommend ERP Experts? <span className="text-quaternary">In a heartbeat.</span>
            "
          </blockquote>
          <div>
            <p className="text-lg font-bold">David Hall</p>
            <p className="text-base text-muted">CEO, Totalkare</p>
          </div>
        </div>
      </div>
    </section>
  );
}
