import Breadcrumb from "../../../components/ui/Breadcrumb";

export default function SharedHero({ caseStudy }) {
  return (
    <>
      {/* Hero with full-width image */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{ paddingTop: "120px", paddingBottom: "var(--space-2xl)", minHeight: "55vh" }}
      >
        <div className="absolute inset-0">
          <img
            src={caseStudy.heroImage}
            alt={caseStudy.client}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/40 md:from-black/80 md:via-black/60 md:to-transparent" />
        </div>

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

        <div className="container relative z-10">
          <Breadcrumb
            items={[
              { label: "Home", to: "/" },
              { label: "Case Studies", to: "/case-studies" },
              { label: caseStudy.client },
            ]}
            light
          />

          <div className="max-w-3xl">
            {caseStudy.logo && (
              <img
                src={caseStudy.logo}
                alt={`${caseStudy.client} logo`}
                className={`mb-lg md:mb-xl ${caseStudy.logoHeight || "h-10 md:h-16"}`}
              />
            )}
            <p className="text-label text-quaternary mb-md">{caseStudy.industry}</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-white mb-lg md:mb-xl leading-[1.1]">
              {caseStudy.title}
            </h1>
            <p className="text-lg md:text-2xl text-white/90 leading-relaxed">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg md:gap-2xl text-center">
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
    </>
  );
}
