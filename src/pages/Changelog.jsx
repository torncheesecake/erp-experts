/**
 * Changelog Page
 * Internal use only - not indexed by search engines
 */

import { useEffect } from "react";
import { Plus, Wrench, Zap, FileText } from "lucide-react";

const changelog = [
  {
    date: "19 February 2026",
    entries: [
      {
        type: "improved",
        title: "Homepage CTA redesign",
        description:
          "Removed the newsletter signup form from the homepage final CTA. Replaced with a clean horizontal layout: heading and copy on the left, stacked action buttons on the right. New copy focuses on starting a conversation. Phone number displayed as subtle inline text rather than a competing button.",
      },
      {
        type: "added",
        title: "Partners page",
        description:
          "New Partners section at /partners with listing page and individual detail pages for Phocas and Levy Global. Clean light gradient hero, horizontal card layout on the listing page. Detail pages feature side-by-side intro, brand cards, stats, and industry information pulled from partner websites. Black colour scheme throughout. Link added to footer.",
      },
    ],
  },
  {
    date: "17 February 2026",
    entries: [
      {
        type: "improved",
        title: "Data separation and page restructuring",
        description:
          "Separated data from presentation across major pages. Split monolithic components into smaller, focused modules. Case studies data moved to caseStudies.js, articles data to articles.js. Improved maintainability and code organisation.",
      },
      {
        type: "improved",
        title: "Case study visual enhancements",
        description:
          "Added scroll indicator below Totalkare video to hint at content below. Fixed Coats4Kids logo rendering — removed brightness-0 invert filter for coloured logos. Updated Coats4Kids with separate feature image for intro section. Implemented wider layout with side-by-side intro and 2x2 card grid.",
      },
      {
        type: "added",
        title: "FTP deployment configuration",
        description:
          "Added .ftpconfig file with FTP credentials and deployment instructions for future uploads. File excluded from git via .gitignore for security.",
      },
    ],
  },
  {
    date: "13 February 2026",
    entries: [
      {
        type: "added",
        title: "FAQ page",
        description:
          "New FAQ page with collapsible accordion, 4 categories (Getting Started, Implementation, Support, General). Route at /faq, linked from footer.",
      },
      {
        type: "added",
        title: "Breadcrumb navigation",
        description:
          "Reusable Breadcrumb component added to all resource articles (Home > Resources > Title) and case study pages (Home > Case Studies > Client). Replaces previous back buttons.",
      },
      {
        type: "improved",
        title: "Collapsible Terms and Conditions",
        description:
          "All sections on the Terms page are now collapsible with smooth CSS grid-rows animations. First 3 sections open by default. Includes an Expand all / Collapse all toggle.",
      },
      {
        type: "improved",
        title: "Clean URLs",
        description:
          "Switched from HashRouter to BrowserRouter for clean URLs. Pages now accessible at /about instead of /#/about. Server-side .htaccess rewrites ensure direct links and page refreshes work correctly.",
      },
    ],
  },
  {
    date: "12 February 2026",
    entries: [
      {
        type: "added",
        title: "New guide: The Future of Work - Generative AI",
        description:
          "Resource guide exploring how AI augments human capabilities rather than replacing them. Covers reducing information overload, enhancing cognitive performance, democratising expertise, and practical applications for business. Based on Oracle NetSuite business guide by Dr. Maryam Alavi.",
      },
      {
        type: "added",
        title: "New guide: 4 Skills CFOs Need Now",
        description:
          "Resource guide covering communication, active listening, data analysis, and scenario planning. Practical tips and frameworks for modern finance leaders navigating complexity.",
      },
      {
        type: "added",
        title: "Resources link in navbar",
        description:
          "Resources now appears in the main navigation bar on both desktop and mobile menus, between About and the CTA button.",
      },
      {
        type: "added",
        title: "Phone number in navbar",
        description:
          "Phone number (01785 336 253) displayed in desktop navigation with phone icon. Subtle styling that doesn't compete with the main CTA. Hidden on mobile where it's already in the footer.",
      },
    ],
  },
  {
    date: "11 February 2026",
    entries: [
      {
        type: "added",
        title: "New guide: Is NetSuite Right for Your Business?",
        description:
          "Practical evaluation guide helping businesses honestly assess whether NetSuite is the right fit. Covers signs you've outgrown your current system, where NetSuite excels and where it doesn't, questions to ask during the sales process, and how to evaluate implementation partners.",
      },
      {
        type: "added",
        title: "Calendly booking integration",
        description:
          "All 'Book a call' buttons across the site now link directly to the Calendly discovery call page instead of the contact form. TrackedLink component updated to support external URLs.",
      },
      {
        type: "improved",
        title: "Resource article layout balancing",
        description:
          "Varied layout variants across articles (was 6/8 on layout 2, now balanced 2/3/3 across layouts 1/2/3). Added text-wrap balance to hero headings. Removed em dashes from all content.",
      },
    ],
  },
  {
    date: "10 February 2026",
    entries: [
      {
        type: "added",
        title: "Last updated dates on legal pages",
        description:
          "Terms, Privacy Policy, and Cookies pages now show 'Last updated: February 2026' with a calendar icon below the hero subtitle. Consistent placement across all three legal pages.",
      },
      {
        type: "improved",
        title: "CTA text standardised",
        description:
          "All page-level call-to-action buttons now consistently use 'Start a conversation' instead of mixed phrases like 'Start a project', 'Get started', 'Talk to an expert'. Updated across 7 pages. Navbar retains 'Let's Talk'.",
      },
      {
        type: "improved",
        title: "Homepage Resources section updated",
        description:
          "Featured resources updated to show the 3 newest guides: Is NetSuite Right for Your Business?, The Future of Work: Generative AI, and 4 Skills CFOs Need Now.",
      },
    ],
  },
  {
    date: "9 February 2026",
    entries: [
      {
        type: "improved",
        title: "Accessibility audit and fixes",
        description:
          "Added aria-label and aria-expanded attributes across all interactive navigation elements. Improved screen reader experience for mobile menu toggle, dropdowns, and collapsible sections.",
      },
      {
        type: "improved",
        title: "Form validation improvements",
        description:
          "Added phone number input validation with pattern matching, message field maxLength (2000 chars), and clearer error states on the contact form.",
      },
      {
        type: "improved",
        title: "Security hardening",
        description:
          "Moved NetSuite endpoint URL and Google Analytics measurement ID to environment variables (.env file, not tracked in git). Prevents sensitive configuration from appearing in source code.",
      },
    ],
  },
  {
    date: "6 February 2026",
    entries: [
      {
        type: "improved",
        title: "SEO: structured data and meta tags",
        description:
          "Added JSON-LD structured data for Organisation and LocalBusiness schemas. Open Graph tags, Twitter cards, geo tags for local SEO, and theme-color meta tags for brand consistency.",
      },
      {
        type: "added",
        title: "Favicon and PWA manifest",
        description:
          "Added SVG favicon, PNG fallbacks (16x16, 32x32), Apple touch icon (180x180), and web app manifest with theme colours for PWA support.",
      },
      {
        type: "added",
        title: "Robots.txt and sitemap",
        description:
          "Added robots.txt with sitemap reference and XML sitemap covering all public pages for search engine crawling.",
      },
      {
        type: "added",
        title: ".htaccess configuration",
        description:
          "Server-side configuration for clean URLs, GZIP compression, browser caching headers, and security headers (X-Frame-Options, X-Content-Type-Options).",
      },
    ],
  },
  {
    date: "5 February 2026",
    entries: [
      {
        type: "fixed",
        title: "Mobile responsiveness: homepage",
        description:
          "Fixed Journey service boxes to stack properly on mobile with reduced padding. Made all homepage buttons consistent with btn sm:btn-lg pattern. Fixed CaseStudy feature section and newsletter layout for small screens.",
      },
      {
        type: "fixed",
        title: "Mobile responsiveness: case studies",
        description:
          "Testimonials grid now stacks on mobile with consistent line height (leading-snug). Featured testimonial card same width as others. Stats layout stacks vertically on mobile, expands on larger screens.",
      },
      {
        type: "fixed",
        title: "Mobile responsiveness: Implementation and Support",
        description:
          "Implementation page hero spacing, smaller buttons on mobile, readable text sizes. Support page benefits grid stacks properly. All grid layouts across both pages now collapse to single column on mobile.",
      },
      {
        type: "fixed",
        title: "Mobile responsiveness: footer and global",
        description:
          "Footer columns stack on mobile, email address prevented from causing horizontal overflow. Fixed zoom/overflow issues in base CSS. All page grids verified to stack properly on small screens.",
      },
    ],
  },
  {
    date: "4 February 2026",
    entries: [
      {
        type: "added",
        title: "Unique case study page layouts",
        description:
          "Each case study now has its own distinct layout variant: numbered sections (Carallon), highlights bar with metric cards (eco2solar), timeline with sidebar (Kynetec), and video-focused with checkmark lists (Totalkare).",
      },
      {
        type: "improved",
        title: "Unified case study heroes",
        description:
          "Standardised hero section across all case study pages with consistent gradient overlays, back button placement, and typography. Added top padding for navbar clearance and stronger gradient on mobile for text readability.",
      },
      {
        type: "fixed",
        title: "Hero text sizing across all pages",
        description:
          "Used !important declarations for Tailwind v4 compatibility to ensure consistent hero text sizing. Fixed across About, Case Studies, Contact, Home, Implementation, Resources, and Support pages.",
      },
    ],
  },
  {
    date: "3 February 2026",
    entries: [
      {
        type: "improved",
        title: "Footer content update",
        description:
          "Updated footer with refined company information, navigation links, and contact details. Improved layout and spacing across all breakpoints.",
      },
      {
        type: "improved",
        title: "What Is NetSuite page fixes",
        description:
          "Fixed CTA buttons and paragraph spacing (set to 1.5rem for readability). Updated case studies quote section with better formatting.",
      },
      {
        type: "improved",
        title: "Image optimisation",
        description:
          "Converted all case study and hero images to AVIF format for smaller file sizes. Added responsive image variants and lazy loading for below-fold images.",
      },
    ],
  },
  {
    date: "2 February 2026",
    entries: [
      {
        type: "improved",
        title: "Homepage hero redesign",
        description:
          "Updated hero headline to 'We Make NetSuite Work'. New hero image (building/skyscraper). Repositioned and resized decorative triangles to avoid text overlap, reduced hero height to prevent content clipping.",
      },
      {
        type: "added",
        title: "Deploy script",
        description:
          "Added npm deploy script for streamlined production builds and deployment to StackCDN hosting.",
      },
    ],
  },
  {
    date: "30 January 2026",
    entries: [
      {
        type: "added",
        title: "Google Analytics event tracking",
        description:
          "Added GA4 event tracking across all CTA buttons site-wide. Tracks button clicks with custom event names, page context, and button labels for conversion analysis.",
      },
      {
        type: "added",
        title: "YouTube video embed",
        description:
          "Embedded YouTube video in the WhyUs section on the homepage. Responsive iframe with proper aspect ratio and lazy loading.",
      },
      {
        type: "improved",
        title: "Homepage case study section redesign",
        description:
          "Redesigned the case study showcase section with a cleaner light theme. Improved card layouts, hover states, and visual hierarchy.",
      },
      {
        type: "fixed",
        title: "Homepage CTA section",
        description:
          "Fixed spacing, input field styling, and full-width layout issues in the bottom CTA/newsletter section.",
      },
    ],
  },
  {
    date: "28 January 2026",
    entries: [
      {
        type: "added",
        title: "Implementation page",
        description:
          "New dedicated Implementation page explaining the full NetSuite implementation process: discovery, configuration, data migration, testing, training, and go-live. Includes timeline overview and methodology breakdown.",
      },
      {
        type: "improved",
        title: "Homepage section reordering",
        description:
          "Reordered homepage sections for better narrative flow. Adjusted spacing between sections, refined styling across Journey, Stats, and CaseStudy components.",
      },
      {
        type: "improved",
        title: "Navigation updates",
        description:
          "Updated navbar with Implementation page link. Refined active state styling and hover transitions across all nav items.",
      },
    ],
  },
  {
    date: "26 January 2026",
    entries: [
      {
        type: "improved",
        title: "Design system documentation",
        description:
          "Created internal design language reference documenting the golden ratio spacing scale, colour palette, typography system, component patterns, and responsive breakpoint strategy.",
      },
      {
        type: "improved",
        title: "About page refinements",
        description:
          "Updated About page content with refined copy, improved section layouts, and better visual hierarchy for team and company information.",
      },
      {
        type: "improved",
        title: "Services and case study page updates",
        description:
          "Refined Services page layout and copy. Updated case study detail pages with improved content presentation and metric displays.",
      },
    ],
  },
  {
    date: "23 January 2026",
    entries: [
      {
        type: "improved",
        title: "Stakeholder feedback: colour and copy",
        description:
          "Implemented Tim's feedback round: refined colour scheme with adjusted primary/secondary tones, simplified marketing copy across all pages, and added the two-paths section to the homepage.",
      },
      {
        type: "fixed",
        title: "About page content and headings",
        description:
          "Fixed missing text on About page. Corrected heading hierarchy (h1 > h2 > h3) across all pages for proper document outline and SEO.",
      },
      {
        type: "fixed",
        title: "Zoom and overflow issues",
        description:
          "Fixed base CSS to prevent horizontal overflow when users zoom in. Added overflow-x: hidden where needed and ensured all layouts remain contained at high zoom levels.",
      },
      {
        type: "improved",
        title: "Partner Badge stats sizing",
        description:
          "Made the Oracle NetSuite Partner Badge statistics section larger and more prominent on the homepage. Adjusted font sizes and spacing for better visual impact.",
      },
    ],
  },
  {
    date: "21 January 2026",
    entries: [
      {
        type: "improved",
        title: "Homepage spacing and layout pass",
        description:
          "Comprehensive spacing adjustments across the homepage. Reordered content sections, refined padding and margins, and improved visual flow between hero, services, stats, and case study sections.",
      },
      {
        type: "improved",
        title: "Component styling refinements",
        description:
          "Updated styling across About, Aftercare, Case Studies, Contact, Support, and Services components. Refined typography, card styles, and section transitions for consistency.",
      },
    ],
  },
  {
    date: "16 January 2026",
    label: "Initial release",
    entries: [
      {
        type: "added",
        title: "Site launch",
        description:
          "Full site build from scratch: Homepage, About, NetSuite Services, Case Studies (4 clients), Resources (articles), Contact, Support, and What Is NetSuite pages. 50+ React components.",
      },
      {
        type: "added",
        title: "Design system",
        description:
          "Custom design system built with golden ratio spacing scale (1.618x), Manrope/Inter typography pairing, pink/purple brand palette, and consistent component patterns across all pages.",
      },
      {
        type: "added",
        title: "Core infrastructure",
        description:
          "React 18 with React Router (HashRouter), Vite 7 build system, Tailwind CSS 4, lazy-loaded routes with code splitting, SEO component with per-page meta tags, cookie consent banner, back-to-top button, and animated statistics counters.",
      },
    ],
  },
];

const typeConfig = {
  added: {
    label: "New",
    icon: Plus,
    color: "text-green-600",
    bg: "bg-green-600/10",
    border: "border-green-600/20",
  },
  improved: {
    label: "Improved",
    icon: Zap,
    color: "text-blue-600",
    bg: "bg-blue-600/10",
    border: "border-blue-600/20",
  },
  fixed: {
    label: "Fix",
    icon: Wrench,
    color: "text-amber-600",
    bg: "bg-amber-600/10",
    border: "border-amber-600/20",
  },
  removed: {
    label: "Removed",
    icon: FileText,
    color: "text-red-600",
    bg: "bg-red-600/10",
    border: "border-red-600/20",
  },
};

export default function Changelog() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
    document.title = "Changelog - Internal Only";

    return () => {
      if (meta) meta.content = "index, follow";
    };
  }, []);

  // Count totals for the stats bar
  const allEntries = changelog.flatMap((r) => r.entries);
  const addedCount = allEntries.filter((e) => e.type === "added").length;
  const improvedCount = allEntries.filter((e) => e.type === "improved").length;
  const fixedCount = allEntries.filter((e) => e.type === "fixed").length;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header
        className="relative overflow-hidden"
        style={{ padding: "var(--space-4xl) 0 var(--space-3xl)" }}
      >
        {/* Decorative triangles */}
        <div
          className="absolute top-1/2 right-0 opacity-8 hidden lg:block pointer-events-none"
          style={{
            width: "700px",
            height: "600px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(25%) translateY(-50%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 opacity-5 hidden md:block pointer-events-none"
          style={{
            width: "300px",
            height: "258px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(-40%) translateY(30%)",
          }}
        />

        <div className="container relative z-10">
          <p className="text-label text-primary mb-md">Internal Reference</p>
          <h1 className="text-hero mb-xl">
            Change<span className="text-primary">log</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted max-w-3xl leading-relaxed">
            A record of every notable change to the ERP Experts website. What was shipped, when it
            landed, and what it does.
          </p>
        </div>
      </header>

      {/* Stats bar */}
      <section
        className="border-y border-(--color-text)/10"
        style={{ padding: "var(--space-xl) 0" }}
      >
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg text-center">
            <div>
              <p className="text-3xl md:text-4xl font-heading font-bold text-primary">
                {allEntries.length}
              </p>
              <p className="text-base text-muted">Total changes</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-heading font-bold text-green-600">
                {addedCount}
              </p>
              <p className="text-base text-muted">Features added</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-heading font-bold text-blue-600">
                {improvedCount}
              </p>
              <p className="text-base text-muted">Improvements</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-heading font-bold text-amber-600">
                {fixedCount}
              </p>
              <p className="text-base text-muted">Bug fixes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="relative pl-12">
            {/* Continuous timeline line */}
            <div
              className="absolute"
              style={{
                left: "13px",
                top: 0,
                bottom: 0,
                width: "2px",
                backgroundColor: "var(--color-primary)",
                opacity: 0.2,
              }}
            />

            {changelog.map((release, i) => (
              <div key={i}>
                {/* Date header bar */}
                <div
                  className="relative"
                  style={{
                    marginBottom: "var(--space-2xl)",
                    ...(i > 0 && { marginTop: "var(--space-3xl)" }),
                  }}
                >
                  {/* Triangle marker on the line */}
                  <div
                    className="absolute"
                    style={{
                      left: "-48px",
                      top: "4px",
                      width: "28px",
                      height: "24px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-primary)",
                    }}
                  />

                  <div className="flex items-center gap-lg">
                    <div className="flex items-baseline gap-md flex-wrap">
                      <h2 className="text-2xl md:text-3xl font-heading">{release.date}</h2>
                      {release.label && (
                        <span className="text-sm text-primary font-medium">{release.label}</span>
                      )}
                    </div>
                    {/* Entry count pill */}
                    <span className="text-xs font-bold text-muted bg-(--color-text)/5 px-3 py-1 rounded-full ml-auto shrink-0">
                      {release.entries.length} {release.entries.length === 1 ? "change" : "changes"}
                    </span>
                  </div>
                </div>

                {/* Entries grid */}
                <div className="grid md:grid-cols-2 gap-lg">
                  {release.entries.map((entry, j) => {
                    const config = typeConfig[entry.type];
                    const Icon = config.icon;
                    return (
                      <div
                        key={j}
                        className="p-lg md:p-xl rounded-2xl border border-(--color-text)/10 hover:border-primary/25 transition-colors"
                      >
                        <div className="flex items-center gap-md mb-lg">
                          <div
                            className={`shrink-0 w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}
                          >
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        <h4 className="mb-md text-base md:text-lg">{entry.title}</h4>
                        <p className="text-base text-muted leading-relaxed">{entry.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden py-(--space-2xl) border-t border-(--color-text)/10">
        <div
          className="absolute top-0 right-0 opacity-5 pointer-events-none"
          style={{
            width: "200px",
            height: "172px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(30%) translateY(-40%)",
          }}
        />
        <div className="container text-center relative z-10">
          <p className="text-muted">ERP Experts Changelog - Internal Use Only - Not Indexed</p>
        </div>
      </footer>
    </div>
  );
}
