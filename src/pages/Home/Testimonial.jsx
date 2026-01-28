/**
 * Homepage Testimonial Section
 */

import { MessageSquareQuote } from "lucide-react";

export default function Testimonial() {
  return (
    <section className="section-padding-lg border-t border-(--color-text)/10">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="mx-auto flex items-end justify-center mb-xl"
            style={{
              width: "64px",
              height: "55px",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              backgroundColor: "var(--color-primary)",
            }}
          >
            <MessageSquareQuote className="w-6 h-6 text-white mb-2" />
          </div>
          <blockquote
            className="text-2xl md:text-3xl font-heading font-medium leading-relaxed"
            style={{ marginBottom: "var(--space-xl)" }}
          >
            "The team at ERP Experts didn't just implement NetSuite — they
            transformed how we work. Our processes are streamlined, our data is
            reliable, and we finally have visibility across the entire
            business."
          </blockquote>
          <div>
            <p className="text-lg font-bold">Sarah Mitchell</p>
            <p className="text-base text-muted">CFO, Lounge Underwear</p>
          </div>
        </div>
      </div>
    </section>
  );
}
