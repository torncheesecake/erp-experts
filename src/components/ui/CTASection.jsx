/**
 * Reusable CTA Section Component
 * Dark contained CTA box used at bottom of pages
 */

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CTASection({
  label = "Free Assessment",
  heading = "Not sure where to start?",
  primaryText = "Start a conversation",
  primaryLink = "/contact",
  secondaryText = "Get your free NETscore",
  secondaryLink = "https://ric-snwikqbv.scoreapp.com",
  accentColor = "primary", // "primary" | "secondary" | "tertiary" | "quaternary"
}) {
  const colors = {
    primary: "var(--color-primary)",
    secondary: "var(--color-secondary)",
    tertiary: "var(--color-tertiary)",
    quaternary: "var(--color-quaternary)",
  };

  return (
    <section className="section-padding-lg">
      <div className="container">
        <div className="rounded-2xl md:rounded-3xl p-(--space-xl) md:p-(--space-3xl) bg-(--color-bg-dark) text-center relative overflow-hidden">
          {/* Decorative triangle */}
          <div
            className="absolute top-0 right-0 opacity-10 hidden md:block"
            style={{
              width: "300px",
              height: "260px",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              backgroundColor: colors[accentColor],
              transform: "translateX(80px) translateY(-80px)",
            }}
          />
          <div className="relative z-10">
            <p className="text-label mb-md" style={{ color: colors[accentColor] }}>
              {label}
            </p>
            <h3
              className="text-(--color-text-on-dark)"
              style={{ marginBottom: "var(--space-2xl)" }}
            >
              {heading}
            </h3>
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link
                to={primaryLink}
                className="btn btn-lg w-full sm:w-auto justify-center text-white hover:scale-105 transition-transform"
                style={{ backgroundColor: colors[accentColor] }}
              >
                {primaryText}
                <ArrowRight className="w-5 h-5" />
              </Link>
              {secondaryText && (
                <a
                  href={secondaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-lg border-2 w-full sm:w-auto justify-center"
                  style={{ borderColor: colors[accentColor], color: colors[accentColor] }}
                >
                  {secondaryText}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
