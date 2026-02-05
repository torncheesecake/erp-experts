/**
 * Homepage Journey / Services Section
 * Where are you on your journey?
 */

import {
  ArrowRight,
  Zap,
  Database,
  Sparkles,
  Stethoscope,
  Link2,
  Signpost,
  HeartHandshake,
} from "lucide-react";
import TrackedLink from "../../components/ui/TrackedLink";

const implementationServices = [
  {
    icon: Zap,
    title: "Customisation",
    desc: "Tailoring NetSuite to fit your unique business processes",
  },
  {
    icon: Link2,
    title: "Integration",
    desc: "Connect NetSuite with your other business tools seamlessly",
  },
  {
    icon: Sparkles,
    title: "And more...",
    desc: "Discovery, testing, rescue, and go-live support",
    isMore: true,
  },
];

const supportServices = [
  {
    icon: Stethoscope,
    title: "Health Audits",
    desc: "System reviews to identify improvements",
  },
  {
    icon: Database,
    title: "Training",
    desc: "Upskill your team to get the most from NetSuite",
  },
  {
    icon: Sparkles,
    title: "And more...",
    desc: "Reporting, enhancements, and ongoing support",
    isMore: true,
  },
];

export default function Journey() {
  return (
    <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
      {/* Decorative triangle */}
      <div
        className="absolute -right-64 top-1/2 -translate-y-1/2 opacity-[0.03] hidden lg:block pointer-events-none"
        style={{
          width: "800px",
          height: "690px",
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          backgroundColor: "var(--color-primary)",
        }}
      />
      <div className="container relative z-10">
        {/* Header section */}
        <div className="text-center mb-xl md:mb-3xl">
          <p className="text-label text-primary mb-md">Your NetSuite Journey</p>
          <h3>
            Where are you on your <span className="text-primary">journey</span>?
          </h3>
        </div>

        {/* Two Paths */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg md:gap-2xl max-w-5xl mx-auto lg:max-w-none">
          {/* Implementation Path */}
          <div className="p-(--space-md) sm:p-(--space-xl) md:p-(--space-2xl) rounded-2xl md:rounded-3xl bg-(--color-tertiary)/5 border border-(--color-tertiary)/20">
            <div className="flex items-center gap-md mb-lg">
              <div
                className="shrink-0 flex items-end justify-center"
                style={{
                  width: "48px",
                  height: "42px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "var(--color-tertiary)",
                }}
              >
                <Signpost className="w-5 h-5 text-white mb-1.5" />
              </div>
              <div>
                <p className="text-label text-tertiary">Starting fresh</p>
                <h5>Let's get you started</h5>
              </div>
            </div>
            <p className="text-base text-muted mb-xl">
              Built right the first time, ensuring no surprises or rework.
            </p>

            {/* Implementation Services */}
            <div className="flex flex-col gap-md">
              {implementationServices.map((service, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-md p-md sm:p-lg rounded-xl bg-white border ${service.isMore ? "border-dashed border-(--color-tertiary)/30" : "border-(--color-tertiary)/10"}`}
                >
                  <div
                    className="shrink-0 flex items-end justify-center"
                    style={{
                      width: "40px",
                      height: "35px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-tertiary)",
                    }}
                  >
                    <service.icon className="w-4 h-4 text-white mb-1" />
                  </div>
                  <div className="flex-1">
                    <h6 className="text-tertiary">{service.title}</h6>
                    <p className="text-sm text-muted">{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <TrackedLink
              to="/implementation"
              trackingName="journey_get_started"
              trackingPage="homepage"
              className="btn btn-lg w-full justify-center mt-xl text-white whitespace-nowrap"
              style={{ backgroundColor: "var(--color-tertiary)" }}
            >
              Get started
              <ArrowRight className="w-5 h-5" />
            </TrackedLink>
          </div>

          {/* Support Path */}
          <div className="p-(--space-md) sm:p-(--space-xl) md:p-(--space-2xl) rounded-2xl md:rounded-3xl bg-(--color-secondary)/5 border border-(--color-secondary)/20">
            <div className="flex items-center gap-md mb-lg">
              <div
                className="shrink-0 flex items-end justify-center"
                style={{
                  width: "48px",
                  height: "42px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "var(--color-secondary)",
                }}
              >
                <HeartHandshake className="w-5 h-5 text-white mb-1.5" />
              </div>
              <div>
                <p className="text-label text-secondary">Already live</p>
                <h5>Let's make it better</h5>
              </div>
            </div>
            <p className="text-base text-muted mb-xl">
              Without hidden cost, performance drift, or wasted capability.
            </p>

            {/* Support Services */}
            <div className="flex flex-col gap-md">
              {supportServices.map((service, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-md p-md sm:p-lg rounded-xl bg-white border ${service.isMore ? "border-dashed border-(--color-secondary)/30" : "border-(--color-secondary)/10"}`}
                >
                  <div
                    className="shrink-0 flex items-end justify-center"
                    style={{
                      width: "40px",
                      height: "35px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-secondary)",
                    }}
                  >
                    <service.icon className="w-4 h-4 text-white mb-1" />
                  </div>
                  <div className="flex-1">
                    <h6 className="text-secondary">{service.title}</h6>
                    <p className="text-sm text-muted">{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <TrackedLink
              to="/support"
              trackingName="journey_explore_support"
              trackingPage="homepage"
              className="btn btn-lg w-full justify-center mt-xl text-white whitespace-nowrap"
              style={{ backgroundColor: "var(--color-secondary)" }}
            >
              Explore support
              <ArrowRight className="w-5 h-5" />
            </TrackedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
