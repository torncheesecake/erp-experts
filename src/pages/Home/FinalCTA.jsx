/**
 * Homepage Final CTA + Newsletter Section
 */

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import TrackedLink from "../../components/ui/TrackedLink";
import { trackEvent } from "../../components/Analytics";

export default function FinalCTA() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("idle");

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterStatus("submitting");

    try {
      const submitData = new FormData();
      submitData.append("access_key", "391757e6-186e-43f4-adac-d26415a290e8");
      submitData.append("subject", "Newsletter Subscription");
      submitData.append("from_name", "ERP Experts Website");
      submitData.append("email", newsletterEmail);
      submitData.append("message", "New newsletter subscription request");

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (result.success) {
        setNewsletterStatus("success");
        setNewsletterEmail("");
        trackEvent("newsletter_subscribe", "CTA", "homepage_newsletter", 1);
        setTimeout(() => setNewsletterStatus("idle"), 5000);
      } else {
        throw new Error("Subscription failed");
      }
    } catch {
      setNewsletterStatus("error");
      setTimeout(() => setNewsletterStatus("idle"), 5000);
    }
  };

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

          <div className="relative z-10" style={{ padding: "var(--space-3xl) var(--space-xl)" }}>
            <div className="text-center">
              <h2 className="text-white" style={{ marginBottom: "var(--space-xl)" }}>
                Let's build <span className="text-white/90">something great.</span>
              </h2>
              <p
                className="text-white text-lg max-w-2xl mx-auto"
                style={{ marginBottom: "var(--space-2xl)" }}
              >
                Ready to transform your business? Get in touch to start your NetSuite journey.
              </p>

              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <TrackedLink
                  to="/contact"
                  trackingName="footer_cta_start_project"
                  trackingPage="homepage"
                  className="btn sm:btn-lg justify-center bg-white text-(--color-primary) hover:scale-105 transition-transform whitespace-nowrap"
                >
                  Start a project
                  <ArrowRight className="w-5 h-5" />
                </TrackedLink>
                <TrackedLink
                  href="https://calendly.com/discovery-erpexperts/discovery"
                  trackingName="footer_cta_book_call"
                  trackingPage="homepage"
                  className="btn sm:btn-lg justify-center bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 transition-all"
                >
                  Book a call
                </TrackedLink>
              </div>

              {/* Spacer */}
              <div className="h-8 md:h-10" />

              {/* Newsletter */}
              <div
                style={{
                  paddingTop: "var(--space-2xl)",
                  marginTop: "var(--space-2xl)",
                  borderTop: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {newsletterStatus === "success" ? (
                  <p className="text-white text-base font-bold">
                    Thanks for subscribing! We'll be in touch.
                  </p>
                ) : newsletterStatus === "error" ? (
                  <p className="text-red-300 text-base">Something went wrong. Please try again.</p>
                ) : (
                  <>
                    <p
                      className="text-white/70 text-base"
                      style={{ marginBottom: "var(--space-lg)" }}
                    >
                      Or subscribe to our newsletter for NetSuite tips & insights
                    </p>
                    <form
                      onSubmit={handleNewsletterSubmit}
                      className="flex flex-col sm:flex-row gap-md max-w-md mx-auto"
                    >
                      <input
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        disabled={newsletterStatus === "submitting"}
                        className="flex-1 px-6 py-4 rounded-full border-2 border-white/40 bg-white/20 text-white placeholder-white/70 text-base font-medium focus:outline-none focus:border-white/70 focus:bg-white/30 transition-all disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={newsletterStatus === "submitting"}
                        className="btn sm:btn-lg justify-center bg-white text-(--color-primary) hover:scale-105 transition-transform rounded-full disabled:opacity-50 whitespace-nowrap"
                      >
                        {newsletterStatus === "submitting" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Subscribe
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
