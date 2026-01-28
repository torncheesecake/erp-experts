import { Link } from "react-router-dom";
import {
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  ArrowRight,
  ArrowUp,
  Phone,
  MapPin,
} from "lucide-react";
import TrackedLink from "../ui/TrackedLink";

const footerLinks = [
  {
    title: "Services",
    links: [
      { label: "Implementation", href: "/services#implementation" },
      { label: "Consultancy", href: "/services#consultancy" },
      { label: "Development", href: "/services#development" },
      { label: "Integrations", href: "/services#integrations" },
      { label: "Training", href: "/services#training" },
      { label: "Aftercare", href: "/support" },
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

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Main footer */}
      <div className="bg-(--color-text) text-white pt-(--space-3xl) md:pt-(--space-4xl) pb-(--space-2xl) md:pb-(--space-3xl) relative">
        {/* Decorative triangles */}
        <div
          className="absolute top-0 right-0 hidden lg:block"
          style={{
            width: "600px",
            height: "520px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(200px) translateY(-200px)",
            opacity: 0.2,
          }}
        />
        {/* Small triangle bottom left */}
        <div
          className="absolute bottom-0 left-0 opacity-5 hidden md:block"
          style={{
            width: "300px",
            height: "260px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(-100px) translateY(80px)",
          }}
        />
        {/* Medium triangle center-left */}
        <div
          className="absolute top-1/2 left-1/4 opacity-[0.03] hidden lg:block"
          style={{
            width: "400px",
            height: "350px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "white",
            transform: "translateY(-50%)",
          }}
        />

        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-xl md:gap-2xl mb-xl md:mb-3xl">
            {/* Brand & CTA */}
            <div className="md:col-span-2 lg:col-span-5">
              <span className="text-xl md:text-2xl lg:text-3xl font-heading font-bold mb-md md:mb-lg block">
                ERP Experts
              </span>
              <p className="text-base md:text-lg text-white/60 mb-lg md:mb-xl max-w-sm">
                NetSuite implementation partner helping UK businesses transform their operations.
              </p>
              <TrackedLink
                to="/contact"
                trackingName="footer_start_conversation"
                trackingPage="footer"
                className="inline-flex items-center gap-sm bg-(--color-primary) text-white py-3 px-6 text-sm md:text-base font-bold rounded-full hover:scale-105 transition-transform"
              >
                Start a conversation
                <ArrowRight className="w-4 h-4" />
              </TrackedLink>
            </div>

            {/* Links */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-lg md:gap-xl">
              {footerLinks.map((col, i) => (
                <div key={i}>
                  <h6 className="text-label text-white/40 mb-md md:mb-lg">{col.title}</h6>
                  <ul className="flex flex-col gap-sm md:gap-md">
                    {col.links.map((link, j) => (
                      <li key={j}>
                        <Link
                          to={link.href}
                          className="text-sm md:text-base text-white/80 hover:text-primary transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Contact info */}
            <div className="lg:col-span-3">
              <h6 className="text-label text-white/40 mb-md md:mb-lg">Get in touch</h6>
              <div className="flex flex-col gap-md md:gap-lg">
                <a
                  href="tel:+441785336253"
                  className="flex items-center gap-md text-sm md:text-base text-white/80 hover:text-primary transition-colors"
                >
                  <div
                    className="shrink-0 flex items-end justify-center"
                    style={{
                      width: "28px",
                      height: "24px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-primary)",
                    }}
                  >
                    <Phone className="w-3 h-3 text-white mb-1" />
                  </div>
                  01785 336 253
                </a>
                <a
                  href="mailto:hello@erpexperts.co.uk"
                  className="flex items-center gap-md text-sm md:text-base text-white/80 hover:text-primary transition-colors"
                >
                  <div
                    className="shrink-0 flex items-end justify-center"
                    style={{
                      width: "28px",
                      height: "24px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-primary)",
                    }}
                  >
                    <Mail className="w-3 h-3 text-white mb-1" />
                  </div>
                  hello@erpexperts.co.uk
                </a>
                <div className="flex items-start gap-md text-sm md:text-base text-white/60">
                  <div
                    className="shrink-0 flex items-end justify-center mt-1"
                    style={{
                      width: "28px",
                      height: "24px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-primary)",
                      opacity: 0.5,
                    }}
                  >
                    <MapPin className="w-3 h-3 text-white mb-1" />
                  </div>
                  <span>Stafford, UK</span>
                </div>
              </div>

              {/* Social */}
              <div className="flex gap-4 md:gap-6" style={{ marginTop: "40px" }}>
                {[
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
                ].map(({ Icon, href, label }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-11 h-11 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-(--color-primary) flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-md text-sm text-white/40 mt-xl"
            style={{ paddingTop: "30px" }}
          >
            <p>© {new Date().getFullYear()} ERP Experts. All rights reserved.</p>
            <div className="flex items-center gap-lg">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
