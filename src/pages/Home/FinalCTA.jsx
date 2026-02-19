/**
 * Homepage Final CTA Section
 */

import { ArrowRight, Phone } from "lucide-react";
import TrackedLink from "../../components/ui/TrackedLink";

export default function FinalCTA() {
  return (
    <section style={{ padding: "var(--space-xl) var(--space-lg)" }}>
      <div className="container">
        <div className="rounded-3xl md:rounded-[3rem] overflow-hidden relative">
          {/* Background with gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
            }}
          />
          {/* Decorative triangles */}
          <div
            className="absolute top-0 left-0 opacity-10 hidden md:block"
            style={{
              width: "300px",
              height: "260px",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              backgroundColor: "white",
              transform: "translateX(-80px) translateY(-80px)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 opacity-10 hidden md:block"
            style={{
              width: "400px",
              height: "350px",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              backgroundColor: "white",
              transform: "translateX(100px) translateY(100px)",
            }}
          />

          <div className="relative z-10" style={{ padding: "var(--space-3xl) var(--space-2xl)" }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2xl">
              <div className="flex-1">
                <h2
                  className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight"
                  style={{ marginBottom: "var(--space-lg)" }}
                >
                  Ready to transform your business{" "}
                  <span className="text-white/80">with NetSuite?</span>
                </h2>
                <p className="text-white text-base md:text-lg leading-relaxed m-0">
                  New implementation, rescue project, or ongoing support — we'd love to hear from
                  you. No pressure, just an honest conversation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-md shrink-0">
                <TrackedLink
                  to="/contact"
                  trackingName="footer_cta_start_project"
                  trackingPage="homepage"
                  className="btn sm:btn-lg justify-center bg-white text-(--color-primary) hover:scale-105 transition-transform whitespace-nowrap"
                >
                  Start a conversation
                  <ArrowRight className="w-5 h-5" />
                </TrackedLink>
                <TrackedLink
                  href="https://calendly.com/discovery-erpexperts/discovery"
                  trackingName="footer_cta_book_call"
                  trackingPage="homepage"
                  className="btn sm:btn-lg justify-center bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 transition-all whitespace-nowrap"
                >
                  Book a call
                </TrackedLink>
              </div>
            </div>

            <div
              className="flex items-center gap-sm text-white/60"
              style={{ marginTop: "var(--space-xl)" }}
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">Prefer to talk?</span>
              <a
                href="tel:+441785336253"
                className="text-white font-bold text-sm hover:underline transition-colors"
              >
                01785 336 253
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
