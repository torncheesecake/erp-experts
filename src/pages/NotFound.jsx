/**
 * 404 Not Found Page
 */

import { Link } from "react-router-dom";
import { ArrowRight, Home, FileText, Users, Briefcase, HeadphonesIcon } from "lucide-react";
import SEO from "../components/ui/SEO";

const suggestedPages = [
  {
    icon: Briefcase,
    title: "Our Services",
    desc: "NetSuite implementation, support & more",
    href: "/services",
  },
  {
    icon: FileText,
    title: "Case Studies",
    desc: "See our client success stories",
    href: "/case-studies",
  },
  {
    icon: Users,
    title: "About Us",
    desc: "Learn about ERP Experts",
    href: "/about",
  },
  {
    icon: HeadphonesIcon,
    title: "Support",
    desc: "Get help with NetSuite",
    href: "/support",
  },
];

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <SEO title="Page Not Found" noIndex />
      <div
        className="flex-1 flex items-center justify-center"
        style={{ padding: "var(--space-4xl) var(--space-lg)" }}
      >
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Main message */}
            <div className="text-center mb-3xl">
              <p className="text-label text-primary mb-md">404 Error</p>
              <h1 className="text-hero mb-xl">
                Page not <span className="text-primary">found</span>.
              </h1>
              <p className="text-lg md:text-xl text-muted mb-2xl max-w-xl mx-auto">
                Sorry, we couldn't find the page you're looking for. It may have been moved or no
                longer exists.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <Link to="/" className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
                  <Home className="w-5 h-5" />
                  Back to home
                </Link>
                <Link
                  to="/contact"
                  className="btn btn-lg border-2 border-(--color-text) w-full sm:w-auto justify-center"
                >
                  Contact us
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Suggested pages */}
            <div className="border-t border-(--color-text)/10 pt-2xl">
              <p className="text-center text-muted mb-xl">Or try one of these popular pages:</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-md">
                {suggestedPages.map((page, i) => (
                  <Link
                    key={i}
                    to={page.href}
                    className="group p-lg rounded-xl border border-(--color-text)/10 hover:border-primary/30 hover:shadow-lg transition-all"
                  >
                    <div className="icon-box icon-box-sm rounded-lg bg-primary/10 mb-md">
                      <page.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-bold mb-xs group-hover:text-primary transition-colors">
                      {page.title}
                    </p>
                    <p className="text-sm text-muted">{page.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
