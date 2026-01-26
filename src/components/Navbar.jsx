import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X, ChevronDown } from "lucide-react";
import logoImage from "../assets/ERP Experts Europe Transparent.png";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-(--color-bg) ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <nav
        className="container flex items-center justify-between"
        style={{ paddingTop: "var(--space-lg)", paddingBottom: "var(--space-lg)" }}
      >
        <Link to="/" className="block shrink-0">
          <img src={logoImage} alt="ERP Experts" className="h-14 md:h-16 lg:h-18" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-xl xl:gap-2xl">
          {/* Services Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button className="flex items-center gap-1 text-base font-medium text-(--color-text) opacity-70 hover:opacity-100 transition-opacity">
              Services
              <ChevronDown
                className={`w-4 h-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
              />
            </button>
            {servicesOpen && (
              <div className="absolute top-full left-0 pt-2">
                <div className="bg-white rounded-xl shadow-lg border border-(--color-text)/10 overflow-hidden min-w-[220px]">
                  <Link
                    to="/implementation"
                    className="block px-5 py-3 text-base font-medium hover:bg-(--color-tertiary)/10 transition-colors border-l-3 border-transparent hover:border-(--color-tertiary)"
                    style={{ borderLeftWidth: "3px" }}
                  >
                    <span className="text-(--color-tertiary)">NetSuite Implementation</span>
                  </Link>
                  <Link
                    to="/support"
                    className="block px-5 py-3 text-base font-medium hover:bg-(--color-secondary)/10 transition-colors border-l-3 border-transparent hover:border-(--color-secondary)"
                    style={{ borderLeftWidth: "3px" }}
                  >
                    <span className="text-(--color-secondary)">NetSuite Support</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link
            to="/case-studies"
            className="text-base font-medium text-(--color-text) opacity-70 hover:opacity-100 transition-opacity"
          >
            Case Studies
          </Link>
          <Link
            to="/about"
            className="text-base font-medium text-(--color-text) opacity-70 hover:opacity-100 transition-opacity"
          >
            About
          </Link>
          <Link to="/contact" className="btn btn-accent">
            Let's Talk
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="lg:hidden p-3" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden bg-(--color-bg) border-t border-(--color-text)/10"
          style={{ padding: "var(--space-xl) 0" }}
        >
          <div className="container flex flex-col gap-md">
            <div style={{ padding: "var(--space-md) 0" }}>
              <p className="text-lg font-bold" style={{ marginBottom: "var(--space-md)" }}>
                Services
              </p>
              <div className="flex flex-col gap-md pl-md">
                <Link
                  to="/implementation"
                  className="text-lg font-medium text-(--color-tertiary)"
                  style={{
                    padding: "var(--space-sm) 0",
                    minHeight: "48px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  NetSuite Implementation
                </Link>
                <Link
                  to="/support"
                  className="text-lg font-medium text-(--color-secondary)"
                  style={{
                    padding: "var(--space-sm) 0",
                    minHeight: "48px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  NetSuite Support
                </Link>
              </div>
            </div>
            <Link
              to="/case-studies"
              className="text-lg font-bold"
              style={{
                padding: "var(--space-md) 0",
                minHeight: "48px",
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Case Studies
            </Link>
            <Link
              to="/about"
              className="text-lg font-bold"
              style={{
                padding: "var(--space-md) 0",
                minHeight: "48px",
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="btn btn-accent btn-lg w-full justify-center"
              style={{ marginTop: "var(--space-lg)", minHeight: "56px" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Let's Talk
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
