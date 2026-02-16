import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import TrackedLink from "../../../components/ui/TrackedLink";

export default function SharedCTA({ caseStudy }) {
  return (
    <section className="section-padding-lg">
      <div className="container">
        <div className="rounded-3xl md:rounded-[3rem] overflow-hidden relative">
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, var(--color-quaternary) 0%, #1a5c3a 100%)",
            }}
          />
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

          <div className="relative z-10" style={{ padding: "var(--space-3xl) var(--space-xl)" }}>
            <div className="text-center">
              <h2 className="text-white" style={{ marginBottom: "var(--space-xl)" }}>
                Ready for <span className="text-white/90">similar results</span>?
              </h2>
              <p
                className="text-white/80 text-lg max-w-2xl mx-auto"
                style={{ marginBottom: "var(--space-2xl)" }}
              >
                Let's discuss how we can help transform your business with NetSuite.
              </p>

              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <TrackedLink
                  to="/contact"
                  trackingName={`case_study_${caseStudy?.client?.toLowerCase().replace(/\s+/g, "_") || "detail"}_cta`}
                  trackingPage="case_study_detail"
                  className="btn justify-center bg-white text-(--color-quaternary) hover:scale-105 transition-transform"
                >
                  Start a conversation
                  <ArrowRight className="w-5 h-5" />
                </TrackedLink>
                <Link
                  to="/case-studies"
                  className="btn justify-center bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 transition-all"
                >
                  View more case studies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
