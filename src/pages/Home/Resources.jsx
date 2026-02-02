/**
 * Homepage Resources Section
 */

import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Video, FileSpreadsheet } from "lucide-react";
import TrackedLink from "../../components/ui/TrackedLink";

const resources = [
  {
    type: "Guide",
    icon: BookOpen,
    title: "The Complete NetSuite Implementation Guide",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
    desc: "Everything you need to know before starting your NetSuite journey.",
  },
  {
    type: "Webinar",
    icon: Video,
    title: "Maximising ROI from Your NetSuite Investment",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
    desc: "Learn how to get the most value from your ERP system.",
  },
  {
    type: "Case Study",
    icon: FileSpreadsheet,
    title: "How We Rescued a Failed Implementation",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80",
    desc: "A real story of turning ERP disaster into success.",
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
          <span className="inline-flex items-center gap-sm text-base font-bold text-muted/50 cursor-not-allowed">
            View all resources
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Coming soon
            </span>
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-lg md:gap-xl">
          {resources.map((resource, i) => (
            <Link
              key={i}
              to="/resources"
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
