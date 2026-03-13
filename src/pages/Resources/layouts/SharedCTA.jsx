/**
 * Shared CTA for Resource Article layouts
 * Extracted from ResourceArticle.jsx — identical CTA across all variants.
 */

import { ArrowRight } from "lucide-react";
import TrackedLink from "../../../components/ui/TrackedLink";

export default function SharedCTA() {
  return (
    <section className="section-padding-lg">
      <div className="container">
        <div className="rounded-2xl md:rounded-3xl overflow-hidden relative">
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, var(--color-primary) 0%, #a01d5a 100%)",
            }}
          />
          {/* Decorative triangles */}
          <div
            className="absolute top-0 left-0 opacity-10 hidden md:block"
            style={{
              width: "250px",
              height: "215px",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              backgroundColor: "white",
              transform: "translateX(-60px) translateY(-60px)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 opacity-10 hidden md:block"
            style={{
              width: "300px",
              height: "260px",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              backgroundColor: "white",
              transform: "translateX(80px) translateY(80px)",
            }}
          />

          <div className="relative z-10 p-xl md:p-2xl">
            <div className="grid md:grid-cols-[1fr_auto] gap-xl items-center">
              <div>
                <h3 className="text-white mb-sm">Need help optimising your NetSuite?</h3>
                <p className="text-white/70 text-base">
                  Our team can help you implement these tips and more.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-md">
                <TrackedLink
                  to="/contact"
                  trackingName="resource_article_contact"
                  trackingPage="resource-article"
                  className="btn btn-lg justify-center bg-white text-primary hover:scale-105 transition-transform"
                >
                  Start a conversation
                  <ArrowRight className="w-5 h-5" />
                </TrackedLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
