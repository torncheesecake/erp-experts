/**
 * Terms of Service Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "../components/ui/SEO";

export default function Terms() {
  return (
    <main id="main-content">
      <SEO
        title="Terms of Service"
        description="ERP Experts terms of service. Read our terms and conditions for using our website and services."
        path="/terms"
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
              Terms of <span className="text-primary">Service</span>
            </h1>
            <p className="text-lg text-muted">Last updated: January 2025</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="max-w-3xl prose prose-lg">
            <h3>Agreement to Terms</h3>
            <p className="text-muted mb-xl">
              By accessing or using our website and services, you agree to be bound by these Terms
              of Service. If you disagree with any part of these terms, you may not access our
              services.
            </p>

            <h3>Services</h3>
            <p className="text-muted mb-xl">
              ERP Experts provides NetSuite implementation, support, and consulting services. The
              specific terms of any engagement will be outlined in a separate Statement of Work or
              service agreement.
            </p>

            <h3>Intellectual Property</h3>
            <p className="text-muted mb-xl">
              The content on this website, including text, graphics, logos, and images, is the
              property of ERP Experts and is protected by copyright and other intellectual property
              laws. You may not reproduce, distribute, or create derivative works without our prior
              written consent.
            </p>

            <h3>User Responsibilities</h3>
            <p className="text-muted mb-lg">When using our services, you agree to:</p>
            <ul className="text-muted mb-xl space-y-sm">
              <li>Provide accurate and complete information</li>
              <li>Maintain the confidentiality of any account credentials</li>
              <li>Notify us immediately of any unauthorised use</li>
              <li>Use our services only for lawful purposes</li>
            </ul>

            <h3>Limitation of Liability</h3>
            <p className="text-muted mb-xl">
              To the fullest extent permitted by law, ERP Experts shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, or any loss of
              profits or revenues, whether incurred directly or indirectly.
            </p>

            <h3>Disclaimer</h3>
            <p className="text-muted mb-xl">
              Our services are provided "as is" without warranty of any kind, express or implied. We
              do not warrant that our services will be uninterrupted, timely, secure, or error-free.
            </p>

            <h3>Confidentiality</h3>
            <p className="text-muted mb-xl">
              Both parties agree to maintain the confidentiality of any proprietary or confidential
              information shared during the course of our engagement. This obligation survives the
              termination of any agreement.
            </p>

            <h3>Governing Law</h3>
            <p className="text-muted mb-xl">
              These Terms shall be governed by and construed in accordance with the laws of England
              and Wales. Any disputes arising from these terms shall be subject to the exclusive
              jurisdiction of the courts of England and Wales.
            </p>

            <h3>Changes to Terms</h3>
            <p className="text-muted mb-xl">
              We reserve the right to modify these Terms at any time. We will notify users of any
              material changes by updating the "Last updated" date. Your continued use of our
              services after such modifications constitutes acceptance of the updated terms.
            </p>

            <h3>Contact Us</h3>
            <p className="text-muted mb-lg">
              If you have any questions about these Terms, please contact us:
            </p>
            <p className="text-muted">
              <strong>Email:</strong> info@erp-experts.co.uk
              <br />
              <strong>Phone:</strong> +44 (0) 123 456 7890
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
