/**
 * Google Analytics Component
 * Only loads if user has consented to cookies
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Replace with your actual GA4 Measurement ID
const GA_MEASUREMENT_ID = "G-6ECXD07RMB";

export function initGA() {
  if (typeof window === "undefined") return;

  // Check if already loaded
  if (window.gtag) return;

  // Load gtag script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll track page views manually
  });
}

export function trackPageView(path) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_title: document.title,
  });
}

export function trackEvent(action, category, label, value) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

// Track CTA button clicks with source identifier
export function trackCTAClick(buttonName, pageName) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "cta_click", {
    event_category: "CTA",
    event_label: buttonName,
    page_name: pageName,
    site_version: "new_site_2025",
  });
}

export default function Analytics() {
  const location = useLocation();

  useEffect(() => {
    // Check if user has consented
    const consent = localStorage.getItem("cookie-consent");
    if (consent === "accepted") {
      initGA();
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (consent === "accepted" && window.gtag) {
      trackPageView(location.pathname);
    }
  }, [location]);

  return null;
}
