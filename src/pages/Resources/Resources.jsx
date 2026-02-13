/**
 * ERP Experts Resources Page
 * Links to the actual resource articles
 */

import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, FileText, ClipboardCheck, Clock } from "lucide-react";

const typeIcons = { Guide: BookOpen, Article: FileText, Assessment: ClipboardCheck };
import SEO from "../../components/ui/SEO";
import TrackedLink from "../../components/ui/TrackedLink";

// Import hero images
import erpWorkForYouHero from "../../assets/521dfd_8d98556467bd405188ecbb172caa3b1f~mv2.png.jpeg";
import erpImplementationHero from "../../assets/521dfd_d357dbfbc21d409792ca92d69250c49a~mv2.webp";

const resources = [
  {
    slug: "erp-readiness-assessment",
    type: "Assessment",
    title: "ERP Readiness Assessment",
    subtitle: "Find out if your business is ready for NetSuite",
    desc: "Answer 6 quick questions to get an instant readiness score. See where you stand across leadership, resources, data, and more.",
    readTime: "2 min",
    image: "https://images.unsplash.com/photo-1553484771-047a44eee27a?w=800&q=80",
  },
  {
    slug: "is-netsuite-right-for-your-business",
    type: "Guide",
    title: "Is NetSuite Right for Your Business?",
    subtitle: "A Practical Evaluation Guide",
    desc: "An honest look at whether NetSuite fits your organisation. No sales pitch, just practical questions, real trade-offs, and the evaluation steps that actually matter.",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=600&q=80",
  },
  {
    slug: "future-of-work-generative-ai",
    type: "Guide",
    title: "The Future of Work: Leveraging the Potential of Generative AI",
    subtitle: "How AI augments human capabilities",
    desc: "Discover how generative AI is shifting the focus from automation to augmentation, supporting and enhancing human cognitive capabilities rather than replacing them.",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
  },
  {
    slug: "cfo-guide-ai-enhanced-finance",
    type: "Guide",
    title: "A CFO's Guide to AI-Enhanced Finance",
    subtitle: "Key Areas Where Finance Leaders Harness AI",
    desc: "Discover how NetSuite's AI capabilities can empower your financial leadership, improve operational efficiency, and drive competitive advantage.",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600&q=80",
  },
  {
    slug: "4-skills-cfos-need-now",
    type: "Guide",
    title: "4 Skills CFOs Need Now",
    subtitle: "Communication, Collaboration, Data Analysis & FP&A",
    desc: "The CFO's job is no longer just about the numbers. Soft skills are more in demand than ever. Discover the top skills for modern finance leaders.",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80",
  },
  {
    slug: "streamlining-your-netsuite-experience",
    type: "Guide",
    title: "Streamlining Your NetSuite Experience",
    subtitle: "Essential Tips for Growing Businesses",
    desc: "Getting the most out of NetSuite requires regular attention and smart optimisation. These essential tips will help keep your system running smoothly.",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
  },
  {
    slug: "your-erp-system-should-work-for-you",
    type: "Article",
    title: "Your ERP System Should Work For You",
    subtitle: "Not Against You",
    desc: "Growing a business is exciting, but outdated systems can quietly drain your energy. You deserve technology that keeps up with your ambitions.",
    readTime: "2 min read",
    image: erpWorkForYouHero,
  },
  {
    slug: "stress-free-erp-implementation",
    type: "Guide",
    title: "The Ultimate Guide to a Stress-Free ERP Implementation",
    subtitle: "How to make your ERP project a success",
    desc: "ERP implementation often gets a bad reputation. With the right partner and approach, it can be smooth, efficient, and even enjoyable.",
    readTime: "4 min read",
    image: erpImplementationHero,
  },
  {
    slug: "spreadsheet-hidden-costs",
    type: "Guide",
    title: "The Hidden Costs of Spreadsheets",
    subtitle: "Why Your Spreadsheets Are Holding You Back",
    desc: "As ERP data requirements expand and business environments grow more complex, spreadsheets reveal their limitations and hidden costs.",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
  },
];

export default function Resources() {
  return (
    <main id="main-content">
      <SEO
        title="Resources"
        description="Learn from the experts. Guides and articles to help you get the most from NetSuite. Free educational content from ERP Experts."
        path="/resources"
        keywords="NetSuite guides, NetSuite articles, ERP resources, NetSuite tips, NetSuite best practices"
      />

      {/* Hero */}
      <section
        className="flex items-center relative overflow-hidden"
        style={{ paddingTop: "140px", paddingBottom: "var(--space-2xl)", minHeight: "50vh" }}
      >
        {/* Mobile background triangles */}
        <div
          className="absolute lg:hidden"
          style={{
            top: "20%",
            right: "-20%",
            width: "300px",
            height: "260px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            opacity: 0.15,
          }}
        />
        <div
          className="absolute lg:hidden"
          style={{
            bottom: "10%",
            left: "-15%",
            width: "200px",
            height: "172px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            opacity: 0.08,
          }}
        />
        {/* Desktop triangles */}
        <div
          className="absolute top-1/2 hidden lg:block"
          style={{
            left: "75%",
            transform: "translateX(calc(-50% + 80px)) translateY(calc(-50% + 30px))",
            width: "900px",
            height: "772px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            opacity: 0.2,
          }}
        />
        <div
          className="absolute top-1/2 hidden lg:block"
          style={{
            left: "75%",
            transform: "translateX(-50%) translateY(-50%)",
            width: "920px",
            height: "789px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            overflow: "hidden",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1000&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.5 }}
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl lg:max-w-5xl">
            <p className="text-label text-primary mb-md hidden md:block">Resources</p>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl leading-[1.1] font-bold lg:!text-[7rem] xl:!text-[9rem]"
              style={{ marginBottom: "var(--space-lg)" }}
            >
              Learn from
              <br />
              <span className="text-primary">the experts</span>.
            </h1>
            <p className="text-xl md:text-2xl text-muted max-w-2xl">
              Guides, articles and insights to help you get the most from NetSuite.
            </p>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-lg md:gap-xl">
            {resources.map((resource, i) => (
              <Link
                key={i}
                to={`/resources/${resource.slug}`}
                className="group block overflow-hidden rounded-2xl md:rounded-3xl border border-(--color-text)/15 hover:border-(--color-primary)/30 transition-all hover:-translate-y-2 hover:shadow-lg"
              >
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img
                    src={resource.image}
                    alt={resource.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Triangle accent */}
                  <div
                    className="absolute bottom-0 right-0 opacity-80"
                    style={{
                      width: "80px",
                      height: "69px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-primary)",
                      transform: "translateX(20px) translateY(20px)",
                    }}
                  />
                  {/* Type badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5">
                      {(() => {
                        const TypeIcon = typeIcons[resource.type] || FileText;
                        return <TypeIcon className="w-3.5 h-3.5 text-primary" />;
                      })()}
                      <span className="text-xs font-bold">{resource.type}</span>
                    </div>
                  </div>
                </div>
                <div className="p-lg md:p-xl">
                  <div className="flex items-center gap-sm mb-md text-muted">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{resource.readTime}</span>
                  </div>
                  <h4
                    className="text-xl group-hover:text-primary transition-colors"
                    style={{ marginBottom: "var(--space-sm)" }}
                  >
                    {resource.title}
                  </h4>
                  <p className="text-base text-muted mb-md">{resource.desc}</p>
                  <span className="inline-flex items-center gap-sm text-primary font-bold group-hover:gap-md transition-all">
                    Read more
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="rounded-2xl md:rounded-3xl overflow-hidden relative">
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, #a01d5a 100%)",
              }}
            />
            <div
              className="absolute top-0 left-0 opacity-10 hidden md:block"
              style={{
                width: "250px",
                height: "215px",
                clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                backgroundColor: "white",
                transform: "translateX(-60px) translateY(-60px)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 opacity-10 hidden md:block"
              style={{
                width: "300px",
                height: "260px",
                clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                backgroundColor: "white",
                transform: "translateX(80px) translateY(80px)",
              }}
            />

            <div className="relative z-10 p-xl md:p-2xl text-center">
              <h2 className="text-white" style={{ marginBottom: "var(--space-lg)" }}>
                Ready to talk <span className="text-white/80">NetSuite</span>?
              </h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto mb-xl">
                Whether you need implementation, support, or just want to explore your options,
                we're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <TrackedLink
                  to="/contact"
                  trackingName="resources_cta_contact"
                  trackingPage="resources"
                  className="btn justify-center bg-white text-primary hover:scale-105 transition-transform"
                >
                  Start a conversation
                  <ArrowRight className="w-5 h-5" />
                </TrackedLink>
                <TrackedLink
                  to="/case-studies"
                  trackingName="resources_cta_case_studies"
                  trackingPage="resources"
                  className="btn justify-center bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 transition-all"
                >
                  View case studies
                </TrackedLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
