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
    slug: "is-netsuite-right-for-your-business",
    type: "Guide",
    icon: BookOpen,
    title: "Is NetSuite Right for Your Business?",
    image: "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=600&q=80",
    desc: "An honest evaluation guide. No sales pitch, just practical questions and real trade-offs.",
  },
  {
    slug: "future-of-work-generative-ai",
    type: "Guide",
    icon: BookOpen,
    title: "The Future of Work: Leveraging the Potential of Generative AI",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    desc: "How generative AI is shifting the focus from automation to augmentation of human capabilities.",
  },
  {
    slug: "4-skills-cfos-need-now",
    type: "Guide",
    icon: BookOpen,
    title: "4 Skills CFOs Need Now",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80",
    desc: "The CFO's job is no longer just about the numbers. Discover the top skills for modern finance leaders.",
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
