/**
 * Cookie Policy Page
 */

import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Cookie,
  Settings,
  Shield,
  BarChart3,
  Users,
  Share2,
  Eye,
  ToggleRight,
  Scale,
  Clock,
} from "lucide-react";
import SEO from "../components/ui/SEO";

const highlights = [
  {
    icon: Cookie,
    title: "What Are Cookies",
    description: "Small files stored on your device to improve your experience.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "We're clear about what cookies we use and why.",
  },
  {
    icon: ToggleRight,
    title: "Your Control",
    description: "You can disable cookies in your browser settings.",
  },
  {
    icon: Shield,
    title: "Third Parties",
    description: "We use trusted services like Google Analytics.",
  },
];

const cookieSections = [
  {
    number: "1",
    title: "What Are Cookies",
    intro:
      "As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience.",
    clauses: [
      {
        id: "1.1",
        text: "Cookies are small text files that are placed on your computer by websites that you visit.",
      },
      {
        id: "1.2",
        text: "They are widely used to make websites work more efficiently and provide information to site owners.",
      },
      {
        id: "1.3",
        text: "This page describes what information cookies gather, how we use it, and why we sometimes need to store them.",
      },
    ],
  },
  {
    number: "2",
    title: "How We Use Cookies",
    clauses: [
      {
        id: "2.1",
        text: "We use cookies for a variety of reasons detailed below.",
      },
      {
        id: "2.2",
        text: "Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.",
      },
      {
        id: "2.3",
        text: "It is recommended that you leave on all cookies if you are not sure whether you need them or not, in case they are used to provide a service that you use.",
      },
    ],
  },
  {
    number: "3",
    title: "Disabling Cookies",
    clauses: [
      {
        id: "3.1",
        text: "You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this).",
      },
      {
        id: "3.2",
        text: "Be aware that disabling cookies will affect the functionality of this and many other websites that you visit.",
      },
      {
        id: "3.3",
        text: "Disabling cookies will usually result in also disabling certain functionality and features of this site.",
      },
      {
        id: "3.4",
        text: "Therefore it is recommended that you do not disable cookies.",
      },
    ],
  },
  {
    number: "4",
    title: "Cookies We Set",
    intro: "The following types of cookies may be set when you use our website:",
    clauses: [
      {
        id: "4.1",
        text: "Account related cookies - If you create an account with us, we will use cookies for the management of the signup process and general administration. These cookies will usually be deleted when you log out.",
      },
      {
        id: "4.2",
        text: "Login related cookies - We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.",
      },
      {
        id: "4.3",
        text: "Forms related cookies - When you submit data through a form such as those found on contact pages, cookies may be set to remember your user details for future correspondence.",
      },
    ],
  },
  {
    number: "5",
    title: "Third Party Cookies",
    intro:
      "In some special cases, we also use cookies provided by trusted third parties. The following section details which third-party cookies you might encounter through this site.",
    clauses: [
      {
        id: "5.1",
        text: "Google Analytics - This site uses Google Analytics, one of the most widespread and trusted analytics solutions on the web, to help us understand how you use the site and ways that we can improve your experience.",
      },
      {
        id: "5.2",
        text: "Google AdSense - The Google AdSense service we use to serve advertising uses a DoubleClick cookie to serve more relevant ads across the web and limit the number of times that a given ad is shown to you.",
      },
      {
        id: "5.3",
        text: "Social Media - We use social media buttons and plugins that allow you to connect with your social network. These sites including Facebook, Twitter and LinkedIn will set cookies through our site.",
      },
    ],
  },
  {
    number: "6",
    title: "Testing & Affiliate Cookies",
    clauses: [
      {
        id: "6.1",
        text: "From time to time we test new features and make subtle changes to the way that the site is delivered. When we are still testing new features, these cookies may be used to ensure that you receive a consistent experience.",
      },
      {
        id: "6.2",
        text: "Several partners advertise on our behalf and affiliate tracking cookies allow us to see if our customers have come to the site through one of our partner sites so that we can credit them appropriately.",
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
const CookieSection = ({ section }) => {
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

export default function Cookies() {
  return (
    <main id="main-content">
      <SEO
        title="Cookie Policy"
        description="ERP Experts cookie policy. Learn about the cookies we use and how to manage them."
        path="/cookies"
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
              Cookie <span className="text-primary">Policy</span>
            </h1>
            <p className="text-xl text-muted">
              How we use cookies to improve your experience on our website.
            </p>
            <p className="text-sm text-muted/50 mt-md flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Last updated: February 2026
            </p>
          </div>
        </div>
      </section>

      {/* Key Highlights */}
      <section
        className="section-padding relative overflow-hidden"
        style={{ backgroundColor: "rgba(236, 72, 153, 0.05)" }}
      >
        {/* Large cookie background icon */}
        <Cookie
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 text-primary opacity-[0.07] pointer-events-none hidden lg:block"
          style={{ width: "400px", height: "400px" }}
        />
        <div className="container relative z-10">
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
            {cookieSections.map((section) => (
              <CookieSection key={section.number} section={section} />
            ))}

            {/* Contact */}
            <div className="text-center p-2xl rounded-2xl bg-(--color-text)/5">
              <Cookie className="w-12 h-12 text-primary mx-auto mb-lg opacity-50" />
              <h4 className="mb-md">Need more information?</h4>
              <p className="text-muted mb-xl">
                If there is something that you aren't sure whether you need or not, it's usually
                safer to leave cookies enabled in case it does interact with one of the features you
                use on our site.
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
