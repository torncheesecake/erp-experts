import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import logoImage from "../assets/ERP Experts Europe Transparent.png";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <nav className="container py-(--space-md) md:py-(--space-lg) lg:py-(--space-xl) flex items-center justify-between">
        <Link to="/" className="block shrink-0">
          <img src={logoImage} alt="ERP Experts" className="h-12 md:h-14 lg:h-16" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-xl xl:gap-2xl">
          <Link
            to="/services"
            className="text-base font-medium text-(--color-text) opacity-70 hover:opacity-100 transition-opacity"
          >
            Services
          </Link>
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
        <div className="lg:hidden bg-(--color-bg) border-t border-(--color-text)/10 py-(--space-xl)">
          <div className="container flex flex-col gap-lg">
            <Link
              to="/services"
              className="text-lg font-medium py-(--space-sm)"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/case-studies"
              className="text-lg font-medium py-(--space-sm)"
              onClick={() => setMobileMenuOpen(false)}
            >
              Case Studies
            </Link>
            <Link
              to="/about"
              className="text-lg font-medium py-(--space-sm)"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="btn btn-accent w-full justify-center mt-(--space-md)"
              onClick={() => setMobileMenuOpen(false)}
            >
              Let's Talk
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
