/**
 * Cookie Consent Banner
 * GDPR compliant cookie consent with analytics integration
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-md md:p-lg animate-slideUp">
      <div className="container">
        <div className="bg-white rounded-2xl shadow-2xl border border-(--color-text)/10 p-lg md:p-xl max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center gap-lg">
            <div className="flex-1">
              <p className="font-bold mb-sm">We value your privacy</p>
              <p className="text-sm text-muted">
                We use cookies to enhance your browsing experience and analyse site traffic. By
                clicking "Accept", you consent to our use of cookies.{" "}
                <Link to="/cookies" className="text-primary hover:underline">
                  Cookie Policy
                </Link>
                {" | "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-md shrink-0">
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
