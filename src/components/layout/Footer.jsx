import { Link } from "react-router-dom";
import { Linkedin, Instagram, Youtube, Mail, ArrowRight, Phone, MapPin } from "lucide-react";
import TrackedLink from "../ui/TrackedLink";
import erpIcon from "../../assets/ERP Experts Icon 500x500.jpg";

const footerLinks = [
  {
    title: "Services",
    links: [
      { label: "Implementation", href: "/implementation" },
      { label: "Support", href: "/support" },
      { label: "What is NetSuite?", href: "/what-is-netsuite" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const locations = [
  { name: "Stafford", label: "HQ" },
  { name: "Manchester", label: null },
  { name: "Dubai", label: "MENA" },
];

const socialLinks = [
  {
    Icon: Linkedin,
    href: "https://www.linkedin.com/company/erp-experts",
    label: "LinkedIn",
  },
  {
    Icon: Instagram,
    href: "https://www.instagram.com/erpexperts",
    label: "Instagram",
  },
  { Icon: Youtube, href: "https://www.youtube.com/@erpexperts", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Main footer */}
      <div className="bg-(--color-text) text-white pt-(--space-3xl) md:pt-(--space-4xl) pb-(--space-2xl) md:pb-(--space-3xl) relative">
        {/* Decorative triangle */}
        <div
          className="absolute top-0 right-0 hidden lg:block"
          style={{
            width: "600px",
            height: "520px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(200px) translateY(-200px)",
            opacity: 0.15,
          }}
        />

        <div className="container relative z-10">
          {/* Top section - Brand & CTA */}
          <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-xl mb-2xl pb-2xl border-b border-white/10 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-lg pb-md lg:pb-0">
              <img src={erpIcon} alt="ERP Experts" className="w-16 h-16 rounded-xl" />
              <div>
                <span className="text-2xl md:text-3xl font-heading font-bold block mb-sm">
                  ERP Experts
                </span>
                <p className="text-base text-white/50">
                  NetSuite implementation partner helping businesses transform their operations.
                </p>
              </div>
            </div>
            <TrackedLink
              to="/contact"
              trackingName="footer_start_conversation"
              trackingPage="footer"
              className="inline-flex items-center gap-sm bg-(--color-primary) text-white py-3 px-8 text-base font-bold rounded-full hover:scale-105 transition-transform w-fit mb-xl lg:mb-0"
            >
              Start a conversation
              <ArrowRight className="w-4 h-4" />
            </TrackedLink>
          </div>

          {/* Middle section - Links, Contact, Locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-lg sm:gap-xl mb-2xl">
            {/* Navigation Links */}
            {footerLinks.map((col, i) => (
              <div key={i}>
                <h6 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-lg">
                  {col.title}
                </h6>
                <ul className="flex flex-col gap-md">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        to={link.href}
                        className="text-base text-white/70 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact */}
            <div>
              <h6 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-lg">
                Contact
              </h6>
              <ul className="flex flex-col gap-md">
                <li>
                  <a
                    href="tel:+441785336253"
                    className="flex items-center gap-sm text-base text-white/70 hover:text-white transition-colors"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                    01785 336 253
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@erpexperts.co.uk"
                    className="flex items-center gap-sm text-base text-white/70 hover:text-white transition-colors break-all"
                  >
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <span className="break-all">hello@erpexperts.co.uk</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Locations */}
            <div>
              <h6 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-lg">
                Locations
              </h6>
              <ul className="flex flex-col gap-md">
                {locations.map((loc, i) => (
                  <li key={i} className="flex items-center gap-sm text-base text-white/70">
                    <MapPin className="w-4 h-4 text-primary/50" />
                    {loc.name}
                    {loc.label && <span className="text-xs text-white/40 ml-1">({loc.label})</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-xl flex flex-col md:flex-row items-center justify-between gap-lg">
            {/* Social icons */}
            <div className="flex gap-md order-2 md:order-1">
              {socialLinks.map(({ Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-(--color-primary) flex items-center justify-center transition-colors"
                >
                  <Icon className="w-5 h-5 text-white" />
                </a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-sm text-white/40 order-3 md:order-2">
              © {new Date().getFullYear()} ERP Experts. All rights reserved.
            </p>

            {/* Legal links */}
            <div className="flex items-center gap-lg text-sm order-1 md:order-3">
              <Link to="/privacy" className="text-white/40 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link to="/cookies" className="text-white/40 hover:text-white transition-colors">
                Cookies
              </Link>
              <Link to="/terms" className="text-white/40 hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
