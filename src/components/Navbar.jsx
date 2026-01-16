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
      <nav className="container py-(--space-lg) md:py-(--space-xl) flex items-center justify-between">
        <Link to="/" className="block shrink-0">
          <img src={logoImage} alt="ERP Experts" className="h-10 md:h-16" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-xl lg:gap-2xl">
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
        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-(--color-bg) border-t border-(--color-text)/10 py-(--space-xl)">
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
