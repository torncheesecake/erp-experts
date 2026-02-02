/**
 * Privacy Policy Page
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Eye, Lock, UserCheck, Mail, Scale } from "lucide-react";
import SEO from "../components/ui/SEO";

const highlights = [
  {
    icon: Eye,
    title: "Transparency",
    description: "We're clear about what data we collect and why.",
  },
  {
    icon: Lock,
    title: "Security",
    description: "Your information is securely stored in NetSuite.",
  },
  {
    icon: UserCheck,
    title: "Your Rights",
    description: "Access, rectify, or delete your data at any time.",
  },
  {
    icon: Mail,
    title: "Contact Us",
    description: "Questions? Reach out and we'll respond within one month.",
  },
];

const privacySections = [
  {
    number: "1",
    title: "Our Contact Details",
    clauses: [
      {
        id: "1.1",
        text: "ERP Experts (Europe) Ltd",
      },
      {
        id: "1.2",
        text: "Dalton House, Lakhpur Court, Staffordshire Technology Park, Stafford, ST18 0FX",
      },
      {
        id: "1.3",
        text: "Phone: 01785 336 253",
      },
    ],
  },
  {
    number: "2",
    title: "Personal Information We Collect",
    intro: "We currently collect and process the following information:",
    clauses: [
      {
        id: "2.1",
        text: "Personal identifiers, contacts and characteristics (for example, name and contact details).",
      },
    ],
  },
  {
    number: "3",
    title: "How We Get Your Information",
    intro:
      "Most of the personal information we process is provided to us directly by you for one of the following reasons:",
    clauses: [
      {
        id: "3.1",
        text: "To create an account with us.",
      },
      {
        id: "3.2",
        text: "To contact you if you have submitted a form through our website.",
      },
    ],
  },
  {
    number: "4",
    title: "How We Use Your Information",
    clauses: [
      {
        id: "4.1",
        text: "We use the information that you have given us to communicate with you if you have asked us to.",
      },
      {
        id: "4.2",
        text: "We do not share this information with third parties.",
      },
      {
        id: "4.3",
        text: "Under the UK General Data Protection Regulation (UK GDPR), the lawful basis we rely on for processing this information is your consent by submitting a form.",
      },
      {
        id: "4.4",
        text: "You are able to remove your consent at any time. You can do this by contacting us.",
      },
    ],
  },
  {
    number: "5",
    title: "How We Store Your Information",
    clauses: [
      {
        id: "5.1",
        text: "Your information is securely stored in our systems.",
      },
      {
        id: "5.2",
        text: "We keep your personal information in NetSuite for the period necessary to fulfil the purpose for which you have provided it or until you request that it be deleted.",
      },
    ],
  },
  {
    number: "6",
    title: "Your Data Protection Rights",
    intro: "Under data protection law, you have rights including:",
    clauses: [
      {
        id: "6.1",
        text: "Right of access - You have the right to ask us for copies of your personal information.",
      },
      {
        id: "6.2",
        text: "Right to rectification - You have the right to ask us to rectify personal information you think is inaccurate. You also have the right to ask us to complete information you think is incomplete.",
      },
      {
        id: "6.3",
        text: "Right to erasure - You have the right to ask us to erase your personal information in certain circumstances.",
      },
      {
        id: "6.4",
        text: "Right to restriction of processing - You have the right to ask us to restrict the processing of your personal information in certain circumstances.",
      },
      {
        id: "6.5",
        text: "Right to object to processing - You have the right to object to the processing of your personal information in certain circumstances.",
      },
      {
        id: "6.6",
        text: "Right to data portability - You have the right to ask that we transfer the personal information you gave us to another organisation, or you, in certain circumstances.",
      },
    ],
  },
  {
    number: "7",
    title: "Making a Request",
    clauses: [
      {
        id: "7.1",
        text: "You are not required to pay any charge for exercising your rights.",
      },
      {
        id: "7.2",
        text: "If you make a request, we have one month to respond to you.",
      },
      {
        id: "7.3",
        text: "Please contact us if you wish to make a request regarding your personal data.",
      },
    ],
  },
];

// Helper to determine grid columns based on clause count
const getGridCols = (count) => {
  if (count === 1) return "grid grid-cols-1 gap-md";
  if (count === 2) return "grid md:grid-cols-2 gap-md";
  if (count === 3) return "grid md:grid-cols-3 gap-md";
  if (count <= 4) return "grid md:grid-cols-2 xl:grid-cols-4 gap-md";
  return "grid md:grid-cols-2 lg:grid-cols-3 gap-md";
};

// Clause card component
const ClauseCard = ({ clause }) => {
  return (
    <div className="flex flex-col gap-sm p-lg rounded-xl border border-(--color-text)/10 hover:border-primary/20 transition-colors">
      <span className="text-primary font-bold shrink-0">{clause.id}</span>
      <p className="text-muted">{clause.text}</p>
    </div>
  );
};

// Section component
const PrivacySection = ({ section }) => {
  const clauseCount = section.clauses?.length || 0;

  return (
    <div style={{ marginBottom: "var(--space-3xl)" }}>
      {/* Section header */}
      <div className="flex items-center gap-md mb-xl">
        <span
          className="flex items-end justify-center text-white font-heading text-lg font-bold shrink-0"
          style={{
            width: "56px",
            height: "48px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            paddingBottom: "6px",
          }}
        >
          {section.number}
        </span>
        <h2 className="text-2xl md:text-3xl">{section.title}</h2>
      </div>

      {/* Intro text if present */}
      {section.intro && (
        <div className="bg-(--color-text)/5 rounded-2xl p-xl mb-lg">
          <p className="text-muted">{section.intro}</p>
        </div>
      )}

      {/* Clauses */}
      {section.clauses && (
        <div className={getGridCols(clauseCount)}>
          {section.clauses.map((clause) => (
            <ClauseCard key={clause.id} clause={clause} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function PrivacyPolicy() {
  return (
    <main id="main-content">
      <SEO
        title="Privacy Policy"
        description="ERP Experts privacy policy. Learn how we collect, use, and protect your personal information."
        path="/privacy"
      />

      {/* Hero */}
      <section className="min-h-[50vh] flex items-center relative overflow-hidden pt-(--space-4xl) pb-(--space-2xl)">
        {/* Decorative triangle */}
        <div
          className="absolute top-1/2 right-0 opacity-10 hidden lg:block pointer-events-none"
          style={{
            width: "600px",
            height: "514px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(30%) translateY(-50%)",
          }}
        />

        <div className="container relative z-10">
          <div className="max-w-3xl">
            <Link
              to="/"
              className="inline-flex items-center gap-sm text-muted hover:text-primary transition-colors mb-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <p className="text-label text-primary mb-md">Legal</p>
            <h1 className="text-hero mb-lg">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-xl text-muted">
              How we collect, use, and protect your personal information at ERP Experts.
            </p>
          </div>
        </div>
      </section>

      {/* Key Highlights */}
      <section className="section-padding" style={{ backgroundColor: "rgba(236, 72, 153, 0.05)" }}>
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {highlights.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-xl shadow-sm">
                <div className="icon-box icon-box-md rounded-xl bg-primary/10 mb-lg">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h5 className="mb-sm">{item.title}</h5>
                <p className="text-base text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Policy */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div>
            {/* All sections rendered dynamically */}
            {privacySections.map((section) => (
              <PrivacySection key={section.number} section={section} />
            ))}

            {/* Contact */}
            <div className="text-center p-2xl rounded-2xl bg-(--color-text)/5">
              <Shield className="w-12 h-12 text-primary mx-auto mb-lg opacity-50" />
              <h4 className="mb-md">Questions about your data?</h4>
              <p className="text-muted mb-xl">
                If you have any questions about this Privacy Policy or wish to exercise your rights,
                please contact us.
              </p>
              <Link to="/contact" className="btn btn-primary inline-flex items-center gap-sm">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
