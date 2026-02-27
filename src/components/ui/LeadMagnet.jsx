/**
 * Lead Magnet Banner
 * Soft CTA for capturing email interest — "Download our free guide" style.
 * Stores dismissal in sessionStorage so it doesn't nag within the same visit.
 */

import { useState } from "react";
import { ArrowRight, FileText, X } from "lucide-react";
import { trackCTAClick } from "../Analytics";

export default function LeadMagnet({
  heading = "Get our free NetSuite buyer's guide",
  description = "A plain-English overview of what NetSuite costs, how long implementation takes, and what to look out for. No jargon, no sales pitch.",
  buttonText = "Send me the guide",
  trackingName = "lead_magnet",
  trackingPage,
}) {
  const storageKey = `lead_magnet_dismissed_${trackingName}`;
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(storageKey) === "1");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(storageKey, "1");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    trackCTAClick(trackingName, trackingPage || window.location.pathname);
    setSubmitted(true);
    // In a real implementation this would POST to your email service.
    // For now it tracks the CTA click and shows a confirmation.
  };

  if (submitted) {
    return (
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="rounded-2xl md:rounded-3xl border-2 border-green-200 bg-green-50 text-center" style={{ padding: "var(--space-2xl)" }}>
            <FileText className="w-10 h-10 text-green-600 mx-auto mb-md" />
            <h3 className="text-green-800" style={{ marginBottom: "var(--space-sm)" }}>Check your inbox</h3>
            <p className="text-base text-green-700">We'll send the guide to <strong>{email}</strong> shortly.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding border-t border-(--color-text)/10">
      <div className="container">
        <div className="rounded-2xl md:rounded-3xl border-2 border-(--color-primary)/15 relative overflow-hidden" style={{ padding: "var(--space-2xl)" }}>
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-(--color-text)/40 hover:text-(--color-text)/70 hover:bg-(--color-text)/5 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Decorative triangle */}
          <div
            className="absolute -bottom-8 -right-8 opacity-5 hidden md:block"
            style={{
              width: "200px",
              height: "172px",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              backgroundColor: "var(--color-primary)",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-xl">
            <div className="flex-1">
              <div className="flex items-center gap-sm mb-md">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Free guide</span>
              </div>
              <h3 style={{ marginBottom: "var(--space-sm)" }}>{heading}</h3>
              <p className="text-base text-muted">{description}</p>
            </div>
            <form onSubmit={handleSubmit} className="shrink-0 flex flex-col sm:flex-row gap-sm w-full md:w-auto">
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 px-lg rounded-xl border border-(--color-text)/10 bg-white text-base focus:outline-none focus:border-(--color-primary) w-full md:w-64"
              />
              <button type="submit" className="btn btn-primary h-12 justify-center whitespace-nowrap">
                {buttonText}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
