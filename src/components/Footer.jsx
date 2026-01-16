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
          <div className="grid lg:grid-cols-12 gap-2xl mb-2xl md:mb-3xl">
            {/* Brand & CTA */}
            <div className="lg:col-span-5">
              <span className="text-2xl md:text-3xl font-heading font-bold mb-lg block">
                ERP Experts
              </span>
              <p className="text-lg text-white/60 mb-xl max-w-sm">
                NetSuite implementation partner helping UK businesses transform their operations.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-sm bg-(--color-primary) text-white py-3 px-6 text-base font-bold rounded-full hover:scale-105 transition-transform"
              >
                Start a conversation
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Links */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-xl">
              {footerLinks.map((col, i) => (
                <div key={i}>
                  <h6 className="text-label text-white/40 mb-lg">{col.title}</h6>
                  <ul className="flex flex-col gap-md">
                    {col.links.map((link, j) => (
                      <li key={j}>
                        <Link
                          to={link.href}
                          className="text-base text-white/80 hover:text-primary transition-colors"
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
              <h6 className="text-label text-white/40 mb-lg">Get in touch</h6>
              <div className="flex flex-col gap-lg">
                <a
                  href="tel:+441onal234567890"
                  className="flex items-center gap-md text-base text-white/80 hover:text-primary transition-colors"
                >
                  <div
                    className="shrink-0 flex items-end justify-center"
                    style={{
                      width: "32px",
                      height: "28px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-primary)",
                    }}
                  >
                    <Phone className="w-3 h-3 text-white mb-1" />
                  </div>
                  +44 (0) 123 456 7890
                </a>
                <a
                  href="mailto:hello@erpexperts.co.uk"
                  className="flex items-center gap-md text-base text-white/80 hover:text-primary transition-colors"
                >
                  <div
                    className="shrink-0 flex items-end justify-center"
                    style={{
                      width: "32px",
                      height: "28px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-primary)",
                    }}
                  >
                    <Mail className="w-3 h-3 text-white mb-1" />
                  </div>
                  hello@erpexperts.co.uk
                </a>
                <div className="flex items-start gap-md text-base text-white/60">
                  <div
                    className="shrink-0 flex items-end justify-center mt-1"
                    style={{
                      width: "32px",
                      height: "28px",
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
              <div className="flex gap-6 mt-2xl">
                {[
                  { Icon: Linkedin, href: "#" },
                  { Icon: Instagram, href: "#" },
                  { Icon: Youtube, href: "#" },
                ].map(({ Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-(--color-primary) flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-md text-sm text-white/40 pt-xl mt-xl">
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
