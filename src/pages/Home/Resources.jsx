/**
 * Homepage Resources Section
 */

import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, FileText } from "lucide-react";
import TrackedLink from "../../components/ui/TrackedLink";

// Import hero images
import erpWorkForYouHero from "../../assets/521dfd_8d98556467bd405188ecbb172caa3b1f~mv2.png.jpeg";
import erpImplementationHero from "../../assets/521dfd_d357dbfbc21d409792ca92d69250c49a~mv2.webp";

const resources = [
  {
    slug: "cfo-guide-ai-enhanced-finance",
    type: "Guide",
    icon: BookOpen,
    title: "A CFO's Guide to AI-Enhanced Finance",
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600&q=80",
    desc: "Discover how AI capabilities can empower your financial leadership and drive competitive advantage.",
  },
  {
    slug: "stress-free-erp-implementation",
    type: "Guide",
    icon: BookOpen,
    title: "The Ultimate Guide to a Stress-Free ERP Implementation",
    image: erpImplementationHero,
    desc: "How to make your ERP project a success with the right partner and approach.",
  },
  {
    slug: "your-erp-system-should-work-for-you",
    type: "Article",
    icon: FileText,
    title: "Your ERP System Should Work For You",
    image: erpWorkForYouHero,
    desc: "You deserve technology that keeps up with your ambitions, not something that holds you back.",
  },
];

export default function Resources() {
  return (
    <section className="section-padding-lg border-t border-(--color-text)/10">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-lg mb-xl md:mb-2xl">
          <div>
            <p className="text-label text-primary mb-md">Learn</p>
            <h3>
              Resources & <span className="text-primary">insights</span>
            </h3>
          </div>
          <TrackedLink
            to="/resources"
            trackingName="home_resources_view_all"
            trackingPage="home"
            className="inline-flex items-center gap-sm text-base font-bold text-primary hover:gap-md transition-all"
          >
            View all resources
            <ArrowRight className="w-4 h-4" />
          </TrackedLink>
        </div>

        <div className="grid md:grid-cols-3 gap-lg md:gap-xl">
          {resources.map((resource, i) => (
            <Link
              key={i}
              to={`/resources/${resource.slug}`}
              className="group block overflow-hidden rounded-2xl md:rounded-3xl border border-(--color-text)/5 hover:border-(--color-primary)/20 transition-all hover:-translate-y-2"
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
                    <resource.icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-bold">{resource.type}</span>
                  </div>
                </div>
              </div>
              <div className="p-lg md:p-xl">
                <h6
                  className="group-hover:text-primary transition-colors"
                  style={{ marginBottom: "var(--space-sm)" }}
                >
                  {resource.title}
                </h6>
                <p className="text-base text-muted">{resource.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
