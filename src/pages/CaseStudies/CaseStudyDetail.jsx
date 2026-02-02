/**
 * ERP Experts Case Study Detail Page
 * Green themed to match Case Studies listing
 */

import { useParams, Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  MessageSquareQuote,
  Users,
  Layers,
  Package,
  Building2,
} from "lucide-react";
import SEO from "../../components/ui/SEO";

// Import images - Carallon
import carallonLogo from "../../assets/carallon_logo_white.png.avif";
import carallonHero from "../../assets/maroon5carallon.jpg.avif";
import carallonSingle from "../../assets/carallon-single.jpg.avif";

// Import images - eco2solar
import eco2solarLogo from "../../assets/eco2solar-logo.png.avif";
import eco2solarHero from "../../assets/eco2solar-houses.avif";
import eco2solarFeature from "../../assets/eco2solar-feature.avif";

// Import images - Kynetec
import kynetecLogo from "../../assets/kynetec-logo-white.svg";
import kynetecHero from "../../assets/752bd0f50c694f1195be3b1771b703d5kynetec.jpg.avif";
import kynetecFeature from "../../assets/Image by Ant Rozetskykynetec.jpg.avif";

// Import images - Totalkare
import totalkareLogo from "../../assets/totalkare-logo.svg";
import totalkareHero from "../../assets/rs-recovery-ymech-2totalkare.webp.avif";
import totalkareFeature from "../../assets/totalkare-feature.avif";

// Case studies data
const caseStudies = {
  1: {
    id: 1,
    client: "Carallon",
    industry: "Entertainment Technology",
    users: "50+",
    systemReplaced: "Sage, Salesforce, Excel",
    product: "NetSuite OneWorld",
    title: "Rapid ERP Implementation Fuels International Expansion",
    subtitle:
      "How we helped an entertainment technology leader achieve a single version of the truth across their entire business in just two months.",
    logo: carallonLogo,
    heroImage: carallonHero,
    featureImage: carallonSingle,
    introHeading: "Lighting up the world's most iconic stages",
    intro:
      "From the Las Vegas strip to West End theatres, Carallon's technology powers the lighting and visual effects behind some of the world's most spectacular events. Their Pharos Controllers illuminate iconic buildings globally, while their LED video processing, motion control systems, and lighting solutions are trusted across retail, architecture, broadcast studios, and live entertainment. A true global leader in entertainment technology.",
    quote:
      "We wanted a powerful system to bring everything together in one place and put us in control of our business.",
    sections: [
      {
        title: "Single Version of the Truth",
        content:
          "After a focused consulting phase with ERP Experts, Carallon recognised the transformative potential of NetSuite OneWorld. The new system now provides a single version of the truth across the entire business - from marketing to manufacturing, sales to support - empowering the team to make better business decisions, faster.",
      },
      {
        title: "An Enhanced Customer Experience",
        content:
          "Leveraging NetSuite's powerful CRM capability, Carallon works more closely with customers, delivering enhanced, tailored, real-time support for live installations around the globe.",
      },
      {
        title: "The Future's Bright",
        content:
          "With a rapid, two-month NetSuite implementation, Carallon has streamlined critical business processes and achieved real-time visibility across the organisation. This enables informed strategic decisions and delivers extra value to existing customers, ensuring a bright future for the business.",
      },
    ],
  },
  2: {
    id: 2,
    client: "eco2solar",
    industry: "Renewable Energy",
    users: "50",
    systemReplaced: "Excel, Access DB, Gmail, Sage",
    product: "NetSuite Manufacturing Cloud, NetSuite OneWorld, Field Aware",
    title:
      "NetSuite's Single Version Of The Truth Freed Up Capacity In The Business Allowing It To Grow",
    subtitle:
      "How we helped a solar energy pioneer replace fragmented systems with a unified platform, unlocking over 300% more field service capacity.",
    logo: eco2solarLogo,
    heroImage: eco2solarHero,
    featureImage: eco2solarFeature,
    introHeading: "Making solar standard across the UK",
    intro:
      "Eco2Solar saw the solar boom coming, but their old systems - Excel, Access, Sage, Gmail - were holding them back. Manual workarounds, scattered data, and no real-time insight meant growth was a struggle, not a strategy. CEO Paul Hutchens knew that to stay ahead, Eco2Solar needed more than another software bolt-on. He chose NetSuite, delivered by ERP Experts, to build processes for a new era and outpace the competition.",
    quote:
      "As well as their clear technical excellence and consultancy skills which enabled a smooth specification and implementation, the team at ERP Experts provided exemplary training in the use of the system and its capabilities, allowing staff to utilise the software to its fullest potential from day one.",
    sections: [
      {
        title: "Optimised Inventory Management Improves Liquidity",
        content:
          "Eco2Solar needed to manage complex, international supply chains and track stock in transit. The old way? Guesswork and delays. With NetSuite, demand planning became precise, inventory was visible in real time, and stock arrived where it was needed - when it was needed.",
      },
      {
        title: "Field Aware Optimised Field Service Scheduling, Unlocking Extra Capacity",
        content:
          "Coordinating dozens of employees and sub-contractors across multiple sites was chaos with manual systems. NetSuite's Field Aware extension, implemented by E3, automated scheduling and resource allocation - unlocking over 300% more field service capacity. That's not just improvement - it's transformation.",
      },
      {
        title: "NetSuite's Scalable Systems Unlock Growth Potential",
        content:
          "Eco2Solar's ambition: to dominate the UK and European new build solar market. NetSuite, driven by E3's process expertise, solved demand management, supply chain headaches, and field service bottlenecks. Now, every system scales with the business - freeing up capacity and making growth inevitable.",
      },
    ],
  },
  3: {
    id: 3,
    client: "Kynetec",
    industry: "Agricultural Market Research",
    users: "50",
    systemReplaced: "NetSuite (re-implementation)",
    product: "NetSuite",
    title: "E3 Eight by Three Delivery Method",
    subtitle:
      "How we rescued a failing NetSuite implementation and delivered a complete system replacement in half the original time using our innovative 24-hour delivery method.",
    logo: kynetecLogo,
    heroImage: kynetecHero,
    featureImage: kynetecFeature,
    introHeading: "A NetSuite rescue mission",
    intro:
      "In 2020, Kynetec had just gone live with a new NetSuite system. Unfortunately, the implementation was not fit for purpose, the system was plagued by multiple issues and simply did not function as required. Kynetec urgently needed expert intervention to diagnose the problems and determine a viable path forward.",
    quote:
      "ERP Experts quickly assessed our failing NetSuite system and gave us clear options. They replaced the system in half the original time by working across three time zones. The project was delivered on time and on budget, and we now have a reliable system with ongoing support.",
    sections: [
      {
        title: "Rapid Assessment",
        content:
          "Within 48 hours of engagement, ERP Experts identified three critical factors: whether the system should be repaired or replaced, the estimated time required for repair or replacement, and the projected cost for each option.",
      },
      {
        title: "Strategic Decision",
        content:
          "After a thorough review, it was clear that repairing the existing system was not commercially viable. Replacement was the only sensible option, but time was of the essence. The original implementation had taken 12 months; the replacement needed to be completed in just 6 months.",
      },
      {
        title: "Innovative Delivery: The 8/3 Method",
        content:
          "To meet this demanding timeline, ERP Experts pioneered the 'Eight by Three' delivery method: 24 hours of professional services per day by leveraging three global teams - 8 hours in the UK, 8 hours in a time zone 8 hours behind, and 8 hours in a further zone. This continuous workflow enabled seamless handovers and round-the-clock progress.",
      },
      {
        title: "Results",
        content:
          "Project delivered on time and on budget. Kynetec gained renewed confidence in its systems and processes. The client signed a 5-year aftercare contract with ERP Experts. Kynetec's business is now supported by a robust, scalable NetSuite platform, with continuous improvements and expert aftercare ensuring their systems evolve alongside their commercial ambitions.",
      },
    ],
  },
  4: {
    id: 4,
    client: "Totalkare",
    industry: "Workshop Equipment",
    users: "3x headcount",
    systemReplaced: "Legacy server-based system",
    product: "NetSuite",
    title: "ERP Implementation & Partnership with Totalkare",
    subtitle:
      "How we rescued a failed NetSuite implementation and helped a workshop equipment supplier triple their headcount with real-time visibility across the business.",
    logo: totalkareLogo,
    heroImage: totalkareHero,
    featureImage: totalkareFeature,
    introHeading: "From broken system to growth platform",
    intro:
      "When David Hall joined Totalkare in 2018, the business was turning over around 7 million and had been growing very slowly for the previous 10 years. After extensive market research, David believed passionately that Totalkare could grow quickly - but they needed a scalable IT system to enable that growth. The old system had very little real-time information. Nearly everything had to be exported, manipulated and analysed. Third-party software was needed just to surface basic information, and you couldn't drill down into the detail.",
    quote:
      "Would I recommend ERP Experts? In a heartbeat. The quality of the implementation is equally, if not more important than the system. You can have the best system in the world - if it's implemented poorly, it's worthless. ERP Experts went from being a saviour, someone to really save us from the situation we were in, into a real long-term partner.",
    quoteAuthor: "David Hall",
    quoteRole: "CEO, Totalkare",
    videoUrl: "https://youtu.be/QMdmpFEyMN0",
    sections: [
      {
        title: "The Initial Problem",
        content:
          "After a long search, Totalkare chose NetSuite - but the initial implementation became a big problem. It quickly became apparent that they hadn't actually solved the problems that had driven them to move to NetSuite in the first place. They tried to work with NetSuite directly to fix the system, but the consultants would do what was asked without giving the guidance needed to make the system actually function.",
      },
      {
        title: "Finding the Right Partner",
        content:
          "That's when Totalkare found ERP Experts. From the first conversation, David felt like he was actually being listened to and understood. ERP Experts got the problem and had a way of solving it. Not only could they fix the existing issues, but they could accelerate getting the system to the level Totalkare needed it to be.",
      },
      {
        title: "Real-Time Dashboards",
        content:
          "David wanted real-time dashboards so the right information could be surfaced to the right people in each part of the business. No more exporting data, no more third-party tools, no more going backwards and forwards to find things out. The new system delivered exactly that - real-time visibility across the entire organisation.",
      },
      {
        title: "Transformational Growth",
        content:
          "Totalkare has tripled the number of people in the business. Onboarding new staff and getting them up to speed with NetSuite compared to the previous system is chalk and cheese. There's no way they could have grown to the size they are today with the old system - it would have been impossible. The partnership continues with ERP Experts, with a full project list that keeps making the system better and better.",
      },
    ],
  },
};

export default function CaseStudyDetail() {
  const { id } = useParams();
  const caseStudy = caseStudies[id];

  if (!caseStudy) {
    return (
      <main id="main-content" className="section-padding-lg">
        <div className="container text-center">
          <h2 className="mb-lg">Case study not found</h2>
          <Link to="/case-studies" className="btn btn-primary">
            Back to case studies
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content">
      <SEO
        title={`${caseStudy.client} - Case Study`}
        description={caseStudy.subtitle}
        path={`/case-studies/${id}`}
        keywords="NetSuite case study, ERP implementation success, NetSuite results"
      />

      {/* Hero with full-width image */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={caseStudy.heroImage}
            alt={caseStudy.client}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>

        {/* Decorative triangle */}
        <div
          className="absolute top-1/2 right-0 opacity-25 hidden lg:block pointer-events-none"
          style={{
            width: "1000px",
            height: "858px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-quaternary)",
            transform: "translateX(20%) translateY(-50%)",
          }}
        />

        <div className="container relative z-10 pt-(--space-4xl)">
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-sm text-base font-bold text-white/70 hover:text-white transition-colors mb-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to case studies
          </Link>

          <div className="max-w-3xl">
            {caseStudy.logo && (
              <img
                src={caseStudy.logo}
                alt={`${caseStudy.client} logo`}
                className={`mb-xl ${caseStudy.client === "Totalkare" ? "h-16 md:h-20" : "h-12 md:h-16"}`}
              />
            )}
            <p className="text-label text-quaternary mb-md">{caseStudy.industry}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-xl leading-tight">
              {caseStudy.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed">
              {caseStudy.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Project Details Bar */}
      <section
        className="border-b border-(--color-text)/10"
        style={{ padding: "var(--space-2xl) 0" }}
      >
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-xl md:gap-2xl text-center">
            <div>
              <p className="text-base text-muted mb-sm">Company</p>
              <p className="text-xl md:text-2xl font-bold">{caseStudy.client}</p>
            </div>
            <div>
              <p className="text-base text-muted mb-sm">Users</p>
              <p className="text-xl md:text-2xl font-bold text-quaternary">{caseStudy.users}</p>
            </div>
            <div>
              <p className="text-base text-muted mb-sm">System Replaced</p>
              <p className="text-xl md:text-2xl font-bold">{caseStudy.systemReplaced}</p>
            </div>
            <div>
              <p className="text-base text-muted mb-sm">Product</p>
              <p className="text-xl md:text-2xl font-bold text-quaternary">{caseStudy.product}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Intro + Quote */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div>
              <h3 className="text-quaternary mb-lg">{caseStudy.introHeading}</h3>
              <p className="text-lg md:text-xl text-muted leading-relaxed mb-xl">
                {caseStudy.intro}
              </p>
              <div
                className="p-xl rounded-2xl"
                style={{ backgroundColor: "rgba(42, 157, 99, 0.05)" }}
              >
                <MessageSquareQuote className="w-10 h-10 text-quaternary mb-lg" />
                <blockquote className="font-heading text-xl md:text-2xl leading-snug text-quaternary">
                  "{caseStudy.quote}"
                </blockquote>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden">
                <img
                  src={caseStudy.featureImage}
                  alt={`${caseStudy.client} project`}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative triangle */}
              <div
                className="absolute -bottom-6 -right-6 hidden md:block"
                style={{
                  width: "120px",
                  height: "103px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "var(--color-quaternary)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div>
            <div className="flex flex-col" style={{ gap: "var(--space-4xl)" }}>
              {caseStudy.sections.map((section, i) => (
                <div
                  key={i}
                  className="grid md:grid-cols-[250px_1fr] gap-xl md:gap-3xl items-start"
                >
                  <div>
                    <span className="text-quaternary font-heading text-5xl md:text-6xl opacity-20">
                      0{i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-quaternary mb-lg">{section.title}</h3>
                    <p className="text-lg md:text-xl text-muted leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Section (if available) */}
      {caseStudy.videoUrl && (
        <section className="section-padding-lg border-t border-(--color-text)/10">
          <div className="container">
            <div className="text-center mb-2xl">
              <p className="text-label text-quaternary mb-md">Watch the story</p>
              <h3>
                Hear it from <span className="text-quaternary">{caseStudy.client}</span>
              </h3>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video rounded-2xl md:rounded-3xl overflow-hidden shadow-xl">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${caseStudy.videoUrl.split("/").pop().split("?")[0]}`}
                  title={`${caseStudy.client} case study video`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="rounded-3xl md:rounded-[3rem] overflow-hidden relative">
            {/* Background with gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, var(--color-quaternary) 0%, #1a5c3a 100%)",
              }}
            />
            {/* Decorative triangles */}
            <div
              className="absolute top-0 left-0 opacity-10 hidden md:block"
              style={{
                width: "300px",
                height: "260px",
                clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                backgroundColor: "white",
                transform: "translateX(-80px) translateY(-80px)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 opacity-10 hidden md:block"
              style={{
                width: "400px",
                height: "350px",
                clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                backgroundColor: "white",
                transform: "translateX(100px) translateY(100px)",
              }}
            />

            <div className="relative z-10" style={{ padding: "var(--space-3xl) var(--space-xl)" }}>
              <div className="text-center">
                <h2 className="text-white" style={{ marginBottom: "var(--space-xl)" }}>
                  Ready for <span className="text-white/90">similar results</span>?
                </h2>
                <p
                  className="text-white/80 text-lg max-w-2xl mx-auto"
                  style={{ marginBottom: "var(--space-2xl)" }}
                >
                  Let's discuss how we can help transform your business with NetSuite.
                </p>

                <div className="flex flex-col sm:flex-row gap-md justify-center">
                  <Link
                    to="/contact"
                    className="btn btn-lg justify-center bg-white text-(--color-quaternary) hover:scale-105 transition-transform"
                  >
                    Start a conversation
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/case-studies"
                    className="btn btn-lg justify-center bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 transition-all"
                  >
                    View more case studies
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
