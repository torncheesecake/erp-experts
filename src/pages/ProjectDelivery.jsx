/**
 * ERP Experts - Project Delivery Page
 */

import {
  ArrowRight,
  Check,
  X,
  Shield,
  Eye,
  Wrench,
  Users,
  Lightbulb,
  Search,
  FileText,
  CreditCard,
  Award,
  Sparkles,
  Gift,
  Lock,
  CalendarCheck,
} from "lucide-react";
import SEO from "../components/ui/SEO";
import TrackedLink from "../components/ui/TrackedLink";

const GOLD = "var(--color-gold)";

/* ── comparison data ── */
const comparisonRows = [
  {
    area: "Pricing",
    e3: { headline: "Fixed price, agreed upfront", detail: "Scope locked before work begins. No bill shock." },
    contractor: { headline: "Day rate or hourly", detail: "The more complex it gets, the more you pay" },
  },
  {
    area: "Accountability",
    e3: { headline: "We own the outcome", detail: "If something goes wrong, it's on us to fix it" },
    contractor: { headline: "Best effort only", detail: "Accountable for turning up, not for results" },
  },
  {
    area: "Project management",
    e3: { headline: "Built in as standard", detail: "We run the project. You don't manage us" },
    contractor: { headline: "Falls on your team", detail: "You become the project manager by default" },
  },
  {
    area: "Tooling & process",
    e3: { headline: "Battle tested toolkit", detail: "We run NetSuite ourselves. Our tools are proven" },
    contractor: { headline: "Bring their own", detail: "Quality depends entirely on the individual" },
  },
  {
    area: "Visibility",
    e3: { headline: "Real time tracking", detail: "You see every task, every status, every week" },
    contractor: { headline: "Ad hoc at best", detail: "You chase for updates and hope for the best" },
  },
  {
    area: "Continuity",
    e3: { headline: "Backed by a team", detail: "Your project doesn't hinge on one person's diary" },
    contractor: { headline: "Single point of failure", detail: "They leave, get ill, or take a better gig" },
  },
  {
    area: "What you get",
    e3: { headline: "A working system", detail: "NetSuite configured, tested, and live. Guaranteed." },
    contractor: { headline: "Hours of effort", detail: "Time spent, but no guarantee of the result" },
  },
];

/* ── process steps ── */
const processSteps = [
  {
    num: "01",
    title: "Tell us what good looks like",
    desc: "Not a feature list. The actual business outcome you need. We'll work backwards from there.",
    tag: "Free",
    icon: Lightbulb,
  },
  {
    num: "02",
    title: "NetSuite MOT",
    desc: "A structured review of your current setup. We map what's working, what isn't, and what a project will genuinely involve.",
    tag: "Free",
    icon: Search,
  },
  {
    num: "03",
    title: "Project Requirements Document",
    desc: "The full plan, scope, and fixed price, all agreed before work starts. If you proceed, the PRD cost comes off your project fee.",
    tag: "Credited on project",
    icon: FileText,
  },
];

/* ── pillars ── */
const pillars = [
  {
    icon: Wrench,
    title: "We eat our own cooking",
    desc: "ERP Experts runs on NetSuite. Every tool and process we use on your project has been tested on ours first.",
  },
  {
    icon: Shield,
    title: "Our risk, not yours",
    desc: "If we underestimate the work, we absorb it. Your price is locked before a single task begins.",
  },
  {
    icon: Eye,
    title: "No chasing for updates",
    desc: "Real time project tracking gives you full visibility. You'll always know what's done, what's next, and where things stand.",
  },
  {
    icon: Users,
    title: "A team, not a person",
    desc: "Your project is backed by a business. If someone's off sick or on leave, work doesn't stop.",
  },
];

/* ── value stack (certainty project inclusions) ── */
const valueStack = [
  {
    tag: "Free",
    icon: Search,
    title: "Free NetSuite Audit",
    desc: "Before you spend a penny, we map your current setup, understand your business model, and identify exactly what needs fixing. You get a clear picture of your system, no commitment required.",
  },
  {
    tag: "Free",
    icon: Wrench,
    title: "8 Hours of Hands On Problem Solving",
    desc: "Not a PowerPoint. Actual work. We spend 8 hours digging into your specific issues before you commit to anything, so you know we understand the problem before we price the solution.",
  },
  {
    tag: "Credited on project",
    icon: FileText,
    title: "Project Requirements Document",
    desc: "A detailed scope and fixed price, agreed before a single task begins. If you proceed, the cost of the PRD comes off your project fee. If you don't, you only pay for a day's work.",
  },
  {
    tag: "Fixed price",
    icon: Lock,
    title: "Fixed Price Delivery",
    desc: "We absorb overruns. Your price is locked before work starts. No change request culture, no bill shock, no surprises.",
  },
  {
    tag: "Staged payments",
    icon: CalendarCheck,
    title: "Four Stage Payment Schedule",
    desc: "One payment to get started, two during delivery, and the final payment only when you sign the completion certificate. Your money stays with you until the work is done.",
  },
  {
    tag: "Your protection",
    icon: Award,
    title: "Completion Certificate Guarantee",
    desc: "You don't pay the final instalment until you sign off that the work is complete and correct. We call this the Done Right Guarantee. You hold the final invoice until you're satisfied.",
  },
];

/* ── bonuses ── */
const bonuses = [
  {
    icon: Lightbulb,
    title: "NetSuite & Business Gap Analysis",
    desc: "Once the project is underway, we look beyond the brief. We'll identify improvements, relevant SuiteApps, and configuration changes that could unlock more value from your system, at no extra cost.",
  },
  {
    icon: Sparkles,
    title: "AI Integration Setup + Training",
    desc: "We'll configure an LLM of your choice (ChatGPT, Copilot, or similar) and run a training session with your team on how to use it in your day to day. Practical, not theoretical.",
  },
];

export default function ProjectDelivery() {
  return (
    <main id="main-content">
      <SEO
        title="NetSuite Certainty Projects"
        description="Fixed price NetSuite projects with the Done Right Guarantee. Free audit, fixed scope, staged payments. You don't pay the final invoice until you sign the completion certificate."
        path="/project-delivery"
        keywords="NetSuite certainty projects, fixed price NetSuite, NetSuite implementation partner, Done Right Guarantee, ERP project management"
      />

      {/* ═══════ HERO ═══════ */}
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
            backgroundColor: GOLD,
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
            backgroundColor: GOLD,
            opacity: 0.08,
          }}
        />
        {/* Offset triangle */}
        <div
          className="absolute top-1/2 hidden lg:block"
          style={{
            left: "75%",
            transform: "translateX(calc(-50% + 80px)) translateY(calc(-50% + 30px))",
            width: "900px",
            height: "772px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: GOLD,
            opacity: 0.2,
          }}
        />
        {/* Main triangle with image */}
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
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.7 }}
          />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl lg:max-w-5xl px-md sm:px-0">
            <p className="text-label mb-md hidden md:block" style={{ color: GOLD }}>
              NetSuite Certainty Projects
            </p>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl leading-[1.1] font-bold lg:!text-[7rem] xl:!text-[9rem]"
              style={{ marginBottom: "var(--space-lg)" }}
            >
              Buy the outcome,
              <br />
              <span style={{ color: GOLD }}>not the hours.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted max-w-3xl" style={{ marginTop: "var(--space-2xl)", marginBottom: "var(--space-2xl)" }}>
              Fixed price NetSuite projects, delivered by a team, backed by a guarantee. No day rates, no scope creep, no surprises.
            </p>
            <div className="flex flex-col sm:flex-row gap-md">
              <TrackedLink
                to="/contact"
                trackingName="project_delivery_hero_cta"
                trackingPage="project-delivery"
                className="btn btn-lg w-full sm:w-auto justify-center text-lg px-8 py-4"
                style={{ backgroundColor: GOLD, color: "white" }}
              >
                Start a conversation
                <ArrowRight className="w-6 h-6" />
              </TrackedLink>
              <TrackedLink
                to="/contact?subject=netsuite-audit"
                trackingName="project_delivery_hero_audit_cta"
                trackingPage="project-delivery"
                className="btn btn-lg w-full sm:w-auto justify-center text-lg px-8 py-4"
                style={{ backgroundColor: "transparent", color: "var(--color-text)", border: "2px solid var(--color-text)", opacity: 0.8 }}
              >
                Book a free NetSuite audit
              </TrackedLink>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SOCIAL PROOF STATS ═══════ */}
      <section className="border-t border-(--color-text)/10" style={{ padding: "var(--space-2xl) 0" }}>
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md md:gap-0">
            {[
              { stat: "350+", label: "Projects delivered" },
              { stat: "£0", label: "Surprise invoices sent" },
              { stat: "100%", label: "Fixed price track record" },
              { stat: "20+", label: "Years of NetSuite expertise" },
            ].map((item, i) => (
              <div
                key={i}
                className={`text-center py-lg md:py-0${i < 3 ? " md:border-r md:border-(--color-text)/10" : ""}`}
              >
                <p className="text-4xl md:text-5xl font-bold" style={{ color: GOLD }}>{item.stat}</p>
                <p className="text-sm text-muted mt-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PROBLEM → PRIZE ═══════ */}
      <section className="section-padding-lg" style={{ backgroundColor: "var(--color-text)" }}>
        <div className="container">
          <p className="text-label text-center mb-lg px-md sm:px-0" style={{ color: GOLD }}>Sound familiar?</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg md:gap-xl items-stretch">
            {/* Problem */}
            <div
              className="rounded-2xl md:rounded-3xl border border-white/10 relative overflow-hidden p-lg md:p-xl lg:p-2xl"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              <h5 className="text-white" style={{ marginBottom: "var(--space-lg)" }}>
                The <span style={{ color: GOLD }}>typical</span> contractors experience
              </h5>
              <div className="flex flex-col gap-md">
                {[
                  "Costs that creep up with every change request",
                  "Timelines that slip and nobody owns the delay",
                  "You become the project manager by default",
                  "No structured process. Just someone winging it",
                  "They take a better gig and your project stalls",
                  "When it goes wrong, there's nobody to hold accountable",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-md">
                    <X className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }} strokeWidth={2.5} />
                    <p className="text-base text-white/75">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prize */}
            <div
              className="rounded-2xl md:rounded-3xl border relative overflow-hidden p-lg md:p-xl lg:p-2xl"
              style={{ borderColor: "rgba(212, 160, 18, 0.3)", backgroundColor: "rgba(212, 160, 18, 0.06)" }}
            >
              <h5 className="text-white" style={{ marginBottom: "var(--space-lg)" }}>
                What you get with <span style={{ color: GOLD }}>ERP Experts</span>
              </h5>
              <div className="flex flex-col gap-md">
                {[
                  "One fixed price, agreed before a single task begins",
                  "Dedicated project management built into every engagement",
                  "The person who scopes it is the person who delivers it",
                  "Real time tracking so you always know where things stand",
                  "A whole team behind your project, not a single freelancer",
                  "A working NetSuite system on go live day. Guaranteed.",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-md">
                    <Check className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GOLD }} strokeWidth={2.5} />
                    <p className="text-base text-white/80">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ WHY US / PILLARS ═══════ */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div className="px-md sm:px-0">
              <p className="text-label mb-md" style={{ color: GOLD }}>Why choose a partner?</p>
              <h3>
                You're paying for an <span style={{ color: GOLD }}>outcome</span>, not someone's time.
              </h3>
              <p className="text-lg text-muted mt-lg">
                Freelance contractors sell hours. We sell a result. A working NetSuite system, delivered on time, at a price you agreed to before we started.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md md:gap-lg">
              {pillars.map((pillar, i) => (
                <div key={i} className="card border-2 border-(--color-text)/10 p-lg md:p-xl">
                  <div
                    className="icon-box icon-box-md rounded-xl mb-md md:mb-lg"
                    style={{ backgroundColor: "rgba(212, 160, 18, 0.1)" }}
                  >
                    <pillar.icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: GOLD }} />
                  </div>
                  <h6 className="mb-sm">{pillar.title}</h6>
                  <p className="text-base text-muted">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ COMPARISON TABLE ═══════ */}
      <section className="section-padding-lg relative overflow-hidden" style={{ backgroundColor: "var(--color-text)" }}>
        {/* Decorative triangle */}
        <div
          className="absolute -right-64 top-1/2 -translate-y-1/2 opacity-[0.08] hidden lg:block pointer-events-none"
          style={{
            width: "800px",
            height: "686px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: GOLD,
          }}
        />
        <div className="container relative z-10">
          <div className="text-center mb-2xl md:mb-3xl px-md sm:px-0">
            <p className="text-label mb-md" style={{ color: GOLD }}>Head to head</p>
            <h3 className="text-white">
              ERP Experts vs <span style={{ color: GOLD }}>freelance contractors</span>
            </h3>
          </div>

          {/* Desktop table */}
          <div className="max-w-5xl mx-auto hidden md:block">
            {/* Gold top accent bar */}
            <div className="h-1 rounded-t-2xl" style={{ backgroundColor: GOLD }} />
            <div
              className="grid grid-cols-3 gap-0 rounded-b-2xl overflow-hidden border-x border-b border-white/15"
              style={{ boxShadow: "0 0 40px rgba(212, 160, 18, 0.06)" }}
            >
              {/* Header row */}
              <div className="p-lg md:p-xl border-b border-white/10">
                <p className="font-bold text-white/50">&nbsp;</p>
              </div>
              <div className="p-lg md:p-xl border-b text-center" style={{ backgroundColor: GOLD, borderColor: GOLD }}>
                <p className="font-bold text-white text-lg">ERP Experts</p>
              </div>
              <div className="p-lg md:p-xl border-b border-white/10 text-center">
                <p className="font-bold text-white/70 text-lg">Freelance Contractors</p>
              </div>

              {/* Data rows */}
              {comparisonRows.map((row, i) => (
                <div key={i} className="contents">
                  <div className={`p-lg md:p-xl flex items-center${i < comparisonRows.length - 1 ? " border-b border-white/10" : ""}`}>
                    <p className="font-semibold text-white text-base">{row.area}</p>
                  </div>
                  <div
                    className={`p-lg md:p-xl text-center border-l border-r${i < comparisonRows.length - 1 ? " border-b" : ""}`}
                    style={{ borderColor: "rgba(212, 160, 18, 0.2)", backgroundColor: "rgba(212, 160, 18, 0.04)" }}
                  >
                    <p className="font-bold text-white text-base">{row.e3.headline}</p>
                    <p className="text-sm text-white/80 mt-xs">{row.e3.detail}</p>
                  </div>
                  <div className={`p-lg md:p-xl text-center${i < comparisonRows.length - 1 ? " border-b border-white/10" : ""}`}>
                    <p className="font-bold text-white/90 text-base">{row.contractor.headline}</p>
                    <p className="text-sm text-white/70 mt-xs">{row.contractor.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-lg md:hidden">
            {comparisonRows.map((row, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-white/10">
                <div className="px-lg py-md border-b border-white/10">
                  <p className="font-bold text-white text-lg">{row.area}</p>
                </div>
                <div className="p-lg border-b" style={{ borderColor: "rgba(212, 160, 18, 0.2)", borderLeft: "3px solid", borderLeftColor: GOLD }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-xs" style={{ color: GOLD }}>ERP Experts</p>
                  <p className="text-base font-bold text-white">{row.e3.headline}</p>
                  <p className="text-sm text-white/80 mt-xs">{row.e3.detail}</p>
                </div>
                <div className="p-lg">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-xs">Contractors</p>
                  <p className="text-base font-bold text-white/90">{row.contractor.headline}</p>
                  <p className="text-sm text-white/70 mt-xs">{row.contractor.detail}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════ HOW WE FIX THE PRICE ═══════ */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl md:mb-3xl px-md sm:px-0">
            <p className="text-label mb-md" style={{ color: GOLD }}>How we guarantee a fixed price</p>
            <h3>
              We do the work upfront<br /><span style={{ color: GOLD }}>so the risk sits with us.</span>
            </h3>
            <p className="text-lg text-muted mt-lg max-w-4xl mx-auto">
              Anyone can quote a number. We back ours with a proper discovery process so the price is real and the scope is nailed down before work begins.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg md:gap-xl">
            {processSteps.map((step, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < processSteps.length - 1 && (
                  <div
                    className="hidden sm:block absolute top-8 left-full w-full h-0.5"
                    style={{ transform: "translateX(-50%)", backgroundColor: "rgba(212, 160, 18, 0.2)" }}
                  />
                )}
                <div className="text-center">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full relative mb-lg"
                    style={{ backgroundColor: "rgba(212, 160, 18, 0.1)" }}
                  >
                    <step.icon className="w-6 h-6" style={{ color: GOLD }} />
                    <span
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                      style={{ backgroundColor: GOLD }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <h6 className="mb-sm">{step.title}</h6>
                  <span
                    className="inline-block text-[10px] font-bold uppercase tracking-wider rounded-full border mb-md"
                    style={{
                      padding: "2px 10px",
                      borderColor: "rgba(212, 160, 18, 0.3)",
                      backgroundColor: "rgba(212, 160, 18, 0.1)",
                      color: GOLD,
                    }}
                  >
                    {step.tag}
                  </span>
                  <p className="text-base text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ WHAT'S INCLUDED - VALUE STACK ═══════ */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl md:mb-3xl px-md sm:px-0">
            <p className="text-label mb-md" style={{ color: GOLD }}>What's included</p>
            <h3>
              Everything you need. <span style={{ color: GOLD }}>Nothing you don't.</span>
            </h3>
            <p className="text-lg text-muted mt-lg max-w-4xl mx-auto">
              NetSuite Certainty Projects come with a full stack of protection built in, from first conversation to final sign off. Here's exactly what you get.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md md:gap-lg">
            {valueStack.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-lg p-lg md:p-xl rounded-2xl border-2 border-(--color-text)/10"
              >
                <div className="shrink-0">
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(212, 160, 18, 0.1)" }}
                  >
                    <item.icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: GOLD }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className="inline-block text-[10px] font-bold uppercase tracking-wider rounded-full border mb-sm"
                    style={{
                      padding: "2px 10px",
                      borderColor: "rgba(212, 160, 18, 0.3)",
                      backgroundColor: "rgba(212, 160, 18, 0.1)",
                      color: GOLD,
                    }}
                  >
                    {item.tag}
                  </span>
                  <h6 className="mb-xs">{item.title}</h6>
                  <p className="text-base text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bonuses */}
          <div className="mt-2xl md:mt-3xl">
            <div className="flex items-center gap-sm justify-center mb-lg">
              <Gift className="w-5 h-5" style={{ color: GOLD }} />
              <p className="text-label m-0" style={{ color: GOLD }}>Also included with every project</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md md:gap-lg">
              {bonuses.map((bonus, i) => (
                <div
                  key={i}
                  className="flex items-start gap-lg p-lg md:p-xl rounded-2xl"
                  style={{
                    backgroundColor: "rgba(212, 160, 18, 0.05)",
                    borderLeft: "3px solid",
                    borderLeftColor: GOLD,
                  }}
                >
                  <div className="shrink-0">
                    <div
                      className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "rgba(212, 160, 18, 0.1)" }}
                    >
                      <bonus.icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: GOLD }} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-wider rounded-full border mb-sm"
                      style={{
                        padding: "2px 10px",
                        borderColor: "rgba(212, 160, 18, 0.3)",
                        backgroundColor: "rgba(212, 160, 18, 0.15)",
                        color: GOLD,
                      }}
                    >
                      Bonus
                    </span>
                    <h6 className="mb-xs">{bonus.title}</h6>
                    <p className="text-base text-muted">{bonus.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ DONE RIGHT GUARANTEE ═══════ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "var(--color-text)", paddingTop: "var(--space-3xl)", paddingBottom: "var(--space-3xl)" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(212, 160, 18, 0.08) 0%, transparent 70%)" }}
        />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center border-t border-b border-white/10" style={{ paddingTop: "var(--space-3xl)", paddingBottom: "var(--space-3xl)" }}>
            <Award className="w-12 h-12 mx-auto mb-lg" style={{ color: GOLD }} />
            <h2 className="text-white" style={{ marginBottom: "var(--space-lg)" }}>
              The <span style={{ color: GOLD }}>Done Right</span> Guarantee
            </h2>
            <p className="text-xl text-white/80 mb-lg font-medium">
              One fixed price. No surprise invoices. Final payment only when you sign the completion certificate.
            </p>
            <p className="text-base text-white/60 max-w-4xl mx-auto">
              Most consultants get paid regardless of the outcome. We don't. The final instalment of every NetSuite Certainty Project is only released when you sign a completion certificate confirming the work is done and done correctly. If you're not satisfied, we keep working. You keep the invoice.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="section-padding-lg relative overflow-hidden" style={{ backgroundColor: "var(--color-text)" }}>
        {/* Decorative triangle */}
        <div
          className="absolute -left-32 top-1/2 -translate-y-1/2 opacity-[0.08] hidden lg:block pointer-events-none"
          style={{
            width: "600px",
            height: "514px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: GOLD,
          }}
        />
        <div className="container text-center relative z-10 px-xl sm:px-0">
          <p className="text-label mb-md" style={{ color: GOLD }}>Ready to talk?</p>
          <h2 className="text-white" style={{ marginBottom: "var(--space-lg)" }}>
            Let's map out <span style={{ color: GOLD }}>your project.</span>
          </h2>
          <p className="text-lg text-white/80 mb-lg max-w-4xl mx-auto">
            Tell us what you need. We'll scope it, price it, and show you exactly how we'll deliver before you commit to anything.
          </p>
          <p className="text-sm text-white/50 mb-2xl">
            The first conversation and NetSuite MOT are completely free. No obligation.
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            <TrackedLink
              to="/contact"
              trackingName="project_delivery_footer_contact"
              trackingPage="project-delivery"
              className="btn justify-center"
              style={{ backgroundColor: GOLD, color: "white" }}
            >
              Start a conversation
              <ArrowRight className="w-5 h-5" />
            </TrackedLink>
            <TrackedLink
              to="/contact?subject=netsuite-audit"
              trackingName="project_delivery_footer_audit"
              trackingPage="project-delivery"
              className="btn justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              Book a free NetSuite audit
            </TrackedLink>
          </div>
        </div>
      </section>
    </main>
  );
}
