/**
 * Homepage Hero Section
 */

import { ArrowRight } from "lucide-react";
import TrackedLink from "../../components/ui/TrackedLink";

export default function Hero() {
  return (
    <section
      className="min-h-[55vh] md:min-h-[75vh] flex items-center relative overflow-hidden"
      style={{ paddingTop: "var(--space-4xl)" }}
    >
      {/* Mobile triangle - positioned top right */}
      <div
        className="absolute lg:hidden"
        style={{
          top: "15%",
          right: "-10%",
          width: "320px",
          height: "275px",
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          backgroundColor: "var(--color-primary)",
          opacity: 0.15,
        }}
      />

      {/* Offset pink triangle - behind main (desktop) */}
      <div
        className="absolute top-1/2 hidden lg:block"
        style={{
          left: "75%",
          transform: "translateX(calc(-50% + 100px)) translateY(calc(-50% + 40px))",
          width: "1000px",
          height: "858px",
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          backgroundColor: "var(--color-primary)",
          opacity: 0.2,
        }}
      />

      {/* Main triangle with image (desktop) */}
      <div
        className="absolute top-1/2 hidden lg:block"
        style={{
          left: "75%",
          transform: "translateX(-50%) translateY(-50%)",
          width: "950px",
          height: "815px",
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          overflow: "hidden",
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80"
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity: 0.5 }}
        />
      </div>

      <div className="container relative z-10">
        <div className="max-w-2xl">
          <h1
            className="text-hero animate-hero-delay-1"
            style={{ marginBottom: "var(--space-2xl)" }}
          >
            We Make NetSuite <span className="text-primary">Work.</span>
          </h1>
          <p
            className="text-lg md:text-xl text-muted animate-hero-delay-2"
            style={{ marginBottom: "var(--space-2xl)" }}
          >
            UK's trusted NetSuite implementation partner for growing businesses.
          </p>
          <TrackedLink
            to="/contact"
            trackingName="hero_start_project"
            trackingPage="homepage"
            className="btn btn-primary btn-lg w-full sm:w-auto justify-center animate-hero-delay-3"
          >
            Start a project
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
