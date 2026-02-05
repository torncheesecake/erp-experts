/**
 * Homepage Hero Section
 */

import { ArrowRight } from "lucide-react";
import TrackedLink from "../../components/ui/TrackedLink";

export default function Hero() {
  return (
    <section
      className="flex items-center relative overflow-hidden"
      style={{ paddingTop: "140px", paddingBottom: "var(--space-2xl)", minHeight: "50vh" }}
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
        <div className="max-w-3xl lg:max-w-5xl">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl animate-hero-delay-1 leading-[1.1] font-bold lg:!text-[7rem] xl:!text-[9rem]"
            style={{ marginBottom: "var(--space-lg)" }}
          >
            We Make NetSuite
            <br />
            <span className="text-primary">Work.</span>
          </h1>
          <p
            className="text-xl md:text-2xl text-muted animate-hero-delay-2"
            style={{ marginBottom: "var(--space-xl)" }}
          >
            and have done so for over two decades.
          </p>
          <TrackedLink
            to="/contact"
            trackingName="hero_start_project"
            trackingPage="homepage"
            className="btn btn-primary btn-lg w-full sm:w-auto justify-center animate-hero-delay-3 text-lg px-8 py-4"
          >
            Start a project
            <ArrowRight className="w-6 h-6" />
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
