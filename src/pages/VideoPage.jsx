/**
 * Private Video Page
 * Standalone branded page for sharing videos via email links.
 * Not indexed by search engines.
 */

import { useEffect } from "react";
import logoImage from "../assets/ERP Experts Europe Transparent.png";
import { Download, ArrowRight } from "lucide-react";

export default function VideoPage() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
    document.title = "AI-Powered Reporting — ERP Experts";

    return () => {
      if (meta) meta.content = "index, follow";
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Decorative triangles — all 4 brand colours, no overlaps */}
      {/* 1. Top-right corner — large pink, tucked into corner */}
      <div className="absolute pointer-events-none hidden md:block" style={{ top: "-180px", right: "-100px", width: "620px", height: "537px", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", backgroundColor: "var(--color-primary)", opacity: 0.1 }} />
      {/* 2. Top-left area — medium purple */}
      <div className="absolute pointer-events-none hidden md:block" style={{ top: "2%", left: "-120px", width: "340px", height: "294px", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", backgroundColor: "var(--color-secondary)", opacity: 0.08, transform: "rotate(10deg)" }} />
      {/* 3. Top centre-left — tiny green */}
      <div className="absolute pointer-events-none hidden lg:block" style={{ top: "6%", left: "18%", width: "75px", height: "65px", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", backgroundColor: "var(--color-quaternary)", opacity: 0.12, transform: "rotate(-15deg)" }} />
      {/* 4. Top centre-right — small blue */}
      <div className="absolute pointer-events-none hidden lg:block" style={{ top: "4%", right: "22%", width: "95px", height: "82px", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", backgroundColor: "var(--color-tertiary)", opacity: 0.09, transform: "rotate(22deg)" }} />
      {/* 5. Left edge mid-upper — small pink */}
      <div className="absolute pointer-events-none hidden lg:block" style={{ top: "28%", left: "1%", width: "145px", height: "126px", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", backgroundColor: "var(--color-primary)", opacity: 0.1, transform: "rotate(-8deg)" }} />
      {/* 6. Right edge upper — medium green */}
      <div className="absolute pointer-events-none hidden lg:block" style={{ top: "22%", right: "-40px", width: "190px", height: "165px", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", backgroundColor: "var(--color-quaternary)", opacity: 0.08, transform: "rotate(14deg)" }} />
      {/* 7. Left edge mid — tiny blue */}
      <div className="absolute pointer-events-none hidden xl:block" style={{ top: "45%", left: "4%", width: "68px", height: "59px", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", backgroundColor: "var(--color-tertiary)", opacity: 0.1, transform: "rotate(30deg)" }} />
      {/* 8. Right edge mid — small purple */}
      <div className="absolute pointer-events-none hidden xl:block" style={{ top: "48%", right: "2%", width: "115px", height: "100px", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", backgroundColor: "var(--color-secondary)", opacity: 0.07, transform: "rotate(-20deg)" }} />
      {/* 9. Left lower — medium green */}
      <div className="absolute pointer-events-none hidden lg:block" style={{ top: "62%", left: "-60px", width: "220px", height: "190px", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", backgroundColor: "var(--color-quaternary)", opacity: 0.07, transform: "rotate(5deg)" }} />
      {/* 10. Right lower — tiny pink */}
      <div className="absolute pointer-events-none hidden xl:block" style={{ top: "68%", right: "8%", width: "82px", height: "71px", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", backgroundColor: "var(--color-primary)", opacity: 0.11, transform: "rotate(-25deg)" }} />
      {/* 11. Bottom-left corner — large blue */}
      <div className="absolute pointer-events-none hidden md:block" style={{ bottom: "-100px", left: "-80px", width: "450px", height: "390px", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", backgroundColor: "var(--color-tertiary)", opacity: 0.07, transform: "rotate(12deg)" }} />
      {/* 12. Bottom-right area — medium purple */}
      <div className="absolute pointer-events-none hidden md:block" style={{ bottom: "3%", right: "-50px", width: "280px", height: "242px", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", backgroundColor: "var(--color-secondary)", opacity: 0.08, transform: "rotate(-6deg)" }} />
      {/* 13. Bottom centre-left — tiny pink */}
      <div className="absolute pointer-events-none hidden lg:block" style={{ bottom: "12%", left: "25%", width: "60px", height: "52px", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", backgroundColor: "var(--color-primary)", opacity: 0.12, transform: "rotate(35deg)" }} />
      {/* 14. Bottom centre-right — small green */}
      <div className="absolute pointer-events-none hidden lg:block" style={{ bottom: "8%", right: "28%", width: "100px", height: "87px", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", backgroundColor: "var(--color-quaternary)", opacity: 0.09, transform: "rotate(-12deg)" }} />

      {/* Header */}
      <header className="relative z-10" style={{ padding: "var(--space-xl) 0" }}>
        <div className="container flex items-center justify-between">
          <img src={logoImage} alt="ERP Experts" className="h-14 md:h-16" />
          <a
            href="/videos/ai-powered-reporting.mp4"
            download
            className="flex items-center gap-2 text-sm font-medium text-(--color-text)/50 hover:text-(--color-text) transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download video</span>
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="container relative z-10" style={{ paddingBottom: "var(--space-4xl)" }}>
        {/* Title area */}
        <div className="text-center" style={{ marginBottom: "var(--space-2xl)", paddingTop: "var(--space-lg)" }}>
          <p
            className="text-xs font-bold uppercase tracking-wider mb-md"
            style={{ color: "var(--color-primary)" }}
          >
            Exclusive Preview
          </p>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold leading-[1.1]"
            style={{ marginBottom: "var(--space-md)" }}
          >
            AI-Powered <span style={{ color: "var(--color-primary)" }}>Reporting</span>
          </h1>
          <p className="text-base md:text-lg text-muted max-w-xl mx-auto leading-relaxed">
            See how intelligent analytics transform raw data into actionable insights for your business.
          </p>
        </div>

        {/* Video player */}
        <div
          className="rounded-2xl md:rounded-3xl overflow-hidden shadow-xl"
          style={{ marginBottom: "var(--space-3xl)" }}
        >
          <video
            controls
            playsInline
            preload="metadata"
            poster="/videos/ai-powered-reporting-poster.jpg"
            className="w-full block"
            style={{ aspectRatio: "16/9", backgroundColor: "#000" }}
          >
            <source src="/videos/ai-powered-reporting.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* CTA area */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-lg">
          <a
            href="https://calendly.com/discovery-erpexperts/discovery"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-lg justify-center w-full sm:w-auto text-white hover:scale-105 transition-transform"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Book a discovery call
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="mailto:info@erpexperts.co.uk"
            className="text-base font-medium text-muted hover:text-(--color-text) transition-colors"
          >
            or email info@erpexperts.co.uk
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 border-t border-(--color-text)/10"
        style={{ padding: "var(--space-xl) 0" }}
      >
        <div className="container text-center">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} ERP Experts Europe Ltd. This video is for intended recipients only.
          </p>
        </div>
      </footer>
    </div>
  );
}
