/**
 * Cookie Consent Banner
 * GDPR compliant cookie consent with analytics integration
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { initGA } from "../Analytics";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay before showing banner
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
    initGA();
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed left-0 right-0 bottom-sm md:bottom-lg z-50 px-sm md:px-lg animate-slideUp">
      <div className="max-w-xl md:ml-auto">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl border border-(--color-text)/10 p-md md:p-lg">
          <div className="flex flex-col gap-md">
            <div>
              <p className="font-bold text-base mb-xs">We value your privacy</p>
              <p className="text-sm text-muted leading-relaxed">
                We use cookies to improve site performance and analytics.{" "}
                <Link to="/cookies" className="text-primary hover:underline">
                  Cookie Policy
                </Link>
                {" | "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-sm md:gap-md">
              <button
                onClick={handleDecline}
                className="btn btn-sm border border-(--color-text)/20 hover:bg-(--color-text)/5"
              >
                Decline
              </button>
              <button onClick={handleAccept} className="btn btn-sm btn-primary">
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
