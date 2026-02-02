/**
 * Homepage Why Us / Big Statement Section
 */

import { Check } from "lucide-react";

const whyUsItems = [
  {
    title: "Partners, not suppliers",
    desc: "We stay for the long haul, learning your business and becoming part of your team.",
  },
  {
    title: "Fixed pricing",
    desc: "One price covers the project and the inevitable curveballs. No extras.",
  },
  {
    title: "Your team independent, not dependent",
    desc: "We train your people to own the system, not rely on us forever.",
  },
];

export default function WhyUs() {
  return (
    <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
      {/* Decorative triangle */}
      <div
        className="absolute -left-64 top-1/2 -translate-y-1/2 opacity-[0.03] hidden lg:block pointer-events-none"
        style={{
          width: "700px",
          height: "600px",
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          backgroundColor: "var(--color-primary)",
        }}
      />
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-xl md:gap-3xl items-center">
          {/* Left: Quote + Triangles */}
          <div>
            <p
              className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight"
              style={{ marginBottom: "var(--space-2xl)" }}
            >
              <span className="text-primary">"We use NetSuite</span> to run our own business. Every
              system we build has to meet one standard: would we be willing to use this ourselves?"
            </p>

            {/* Why Us Points under the quote */}
            <div className="flex flex-col gap-lg">
              {whyUsItems.map((item, i) => (
                <div key={i} className="flex gap-md">
                  <div
                    className="shrink-0 flex items-end justify-center"
                    style={{
                      width: "36px",
                      height: "31px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-primary)",
                    }}
                  >
                    <Check className="w-4 h-4 text-white mb-1" />
                  </div>
                  <div>
                    <h6 style={{ marginBottom: "var(--space-sm)" }}>{item.title}</h6>
                    <p className="text-base text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Video */}
          <div className="aspect-video rounded-2xl md:rounded-3xl overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/ibCnN1PRpkc"
              title="ERP Experts Introduction"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
