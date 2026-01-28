/**
 * Privacy Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "../components/ui/SEO";

export default function PrivacyPolicy() {
  return (
    <main id="main-content">
      <SEO
        title="Privacy Policy"
        description="ERP Experts privacy policy. Learn how we collect, use, and protect your personal information."
        path="/privacy"
      />

      {/* Hero */}
      <section className="pt-(--space-4xl) pb-(--space-2xl)">
        <div className="container">
          <div className="max-w-3xl">
            <Link
              to="/"
              className="inline-flex items-center gap-sm text-muted hover:text-primary transition-colors mb-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <h1 style={{ marginBottom: "var(--space-lg)" }}>
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-lg text-muted">Last updated: January 2025</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="max-w-3xl prose prose-lg">
            <h3>Introduction</h3>
            <p className="text-muted mb-xl">
              ERP Experts ("we", "our", or "us") is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you visit our website or use our services.
            </p>

            <h3>Information We Collect</h3>
            <p className="text-muted mb-lg">
              We may collect information about you in a variety of ways:
            </p>
            <h5>Personal Data</h5>
            <p className="text-muted mb-lg">
              When you contact us or request our services, we may collect personally identifiable
              information, such as your name, email address, telephone number, and company name.
            </p>
            <h5>Usage Data</h5>
            <p className="text-muted mb-xl">
              We may automatically collect certain information when you visit our website, including
              your IP address, browser type, operating system, access times, and the pages you have
              viewed.
            </p>

            <h3>How We Use Your Information</h3>
            <p className="text-muted mb-lg">We use the information we collect to:</p>
            <ul className="text-muted mb-xl space-y-sm">
              <li>Respond to your enquiries and provide customer support</li>
              <li>Send you information about our services</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h3>Data Sharing</h3>
            <p className="text-muted mb-xl">
              We do not sell, trade, or otherwise transfer your personal information to third
              parties without your consent, except as required by law or to trusted service
              providers who assist us in operating our website and conducting our business.
            </p>

            <h3>Data Security</h3>
            <p className="text-muted mb-xl">
              We implement appropriate technical and organisational measures to protect your
              personal information against unauthorised access, alteration, disclosure, or
              destruction.
            </p>

            <h3>Your Rights</h3>
            <p className="text-muted mb-lg">Under UK GDPR, you have the right to:</p>
            <ul className="text-muted mb-xl space-y-sm">
              <li>Access your personal data</li>
              <li>Rectify inaccurate personal data</li>
              <li>Request erasure of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
            </ul>

            <h3>Cookies</h3>
            <p className="text-muted mb-xl">
              Our website may use cookies to enhance your experience. You can choose to disable
              cookies through your browser settings, though this may affect some functionality of
              our website.
            </p>

            <h3>Contact Us</h3>
            <p className="text-muted mb-lg">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <p className="text-muted mb-xl">
              <strong>Email:</strong> info@erp-experts.co.uk
              <br />
              <strong>Phone:</strong> +44 (0) 123 456 7890
            </p>

            <h3>Changes to This Policy</h3>
            <p className="text-muted">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
