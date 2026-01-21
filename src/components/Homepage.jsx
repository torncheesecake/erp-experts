/**
 * ERP Experts Homepage
 */

import {
  ArrowRight,
  ArrowUpRight,
  ArrowDown,
  ChevronDown,
  Rocket,
  HeartHandshake,
  Stethoscope,
  LifeBuoy,
  Link2,
  GraduationCap,
  Check,
  Shield,
  Factory,
  ShoppingBag,
  Building2,
  Code2,
  Truck,
  UtensilsCrossed,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  TrendingDown,
  BookOpen,
  Video,
  MessageSquareQuote,
  Zap,
  Boxes,
  Network,
  X,
  ShoppingCart,
  Users,
  Frown,
  TrendingUp,
  Plug,
  Database,
  Globe,
  Sparkles,
  Shirt,
  Split,
  CornerDownRight,
  CornerDownLeft,
  Signpost,
  Mouse,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

// Data
const services = [
  { icon: Rocket, title: "Implementation", num: "01", desc: "End-to-end NetSuite deployment" },
  { icon: HeartHandshake, title: "Aftercare", num: "02", desc: "Ongoing support and optimisation" },
  { icon: Stethoscope, title: "Health Audits", num: "03", desc: "System reviews and improvements" },
  { icon: LifeBuoy, title: "Rescue", num: "04", desc: "Fix troubled implementations" },
  { icon: Link2, title: "Integrations", num: "05", desc: "Connect your business tools" },
  { icon: GraduationCap, title: "Training", num: "06", desc: "Empower your team" },
];

const industries = [
  { icon: Factory, name: "Manufacturing" },
  { icon: ShoppingBag, name: "Retail" },
  { icon: Building2, name: "Wholesale" },
  { icon: Code2, name: "Software" },
  { icon: Truck, name: "Distribution" },
  { icon: UtensilsCrossed, name: "Food & Bev" },
];

const painPoints = [
  { icon: FileSpreadsheet, text: "Drowning in spreadsheets" },
  { icon: AlertCircle, text: "Systems that don't talk" },
  { icon: Clock, text: "Hours lost to manual fixes" },
  { icon: TrendingDown, text: "Growth held back by software" },
];

const stats = [
  { value: "100+", label: "Projects" },
  { value: "94%", label: "On-time" },
  { value: "78%", label: "Adoption lift" },
  { value: "£2m+", label: "Min. turnover" },
];

const whyUsItems = [
  {
    title: "Partner-led delivery",
    desc: "Senior consultants on every project. The people you meet are the people who deliver.",
  },
  {
    title: "Fixed pricing",
    desc: "Transparent costs from day one. No surprises, no scope creep charges.",
  },
  {
    title: "Training that sticks",
    desc: "Role-specific training designed around how your team actually works.",
  },
];

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

export default function Homepage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="min-h-[55vh] md:min-h-[75vh] flex items-center relative overflow-hidden pt-(--space-2xl) md:pt-(--space-4xl)">
        {/* Mobile triangle - smaller, positioned top right */}
        <div
          className="absolute md:hidden"
          style={{
            top: "10%",
            right: "-20%",
            width: "280px",
            height: "240px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            opacity: 0.15,
          }}
        />
        {/* Offset pink triangle - behind main (desktop) */}
        <div
          className="absolute top-1/2 hidden md:block"
          style={{
            left: "70%",
            transform: "translateX(calc(-50% + 110px)) translateY(calc(-50% + 40px))",
            width: "1372px",
            height: "1176px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            opacity: 0.3,
          }}
        />
        {/* Main triangle with image (desktop) */}
        <div
          className="absolute top-1/2 hidden md:block"
          style={{
            left: "70%",
            transform: "translateX(-50%) translateY(-50%)",
            width: "1400px",
            height: "1200px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            overflow: "hidden",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.7 }}
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-5xl">
            <p className="text-label text-primary mb-md md:mb-lg">NetSuite Partner</p>
            <h1 className="text-hero mb-lg md:mb-2xl">
              We make
              <br />
              <span className="text-primary">NetSuite</span>
              <br />
              work.
            </h1>
            <p className="text-lg md:text-xl text-muted mb-xl md:mb-2xl max-w-md md:hidden">
              UK's trusted NetSuite implementation partner for growing businesses.
            </p>
            <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Start a project
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 md:bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-(--color-text)">Scroll</span>
          <div className="w-8 h-12 rounded-full border-2 border-(--color-primary) flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-(--color-primary) rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Logos + Partner Badge Combined */}
      <section className="mt-8 md:mt-12 py-8 md:py-12 border-b border-(--color-text)/10">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-lg">
            <div className="flex items-center gap-md">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-sm font-bold">NetSuite Certified Partner</span>
              <span className="text-muted">•</span>
              <span className="text-sm text-muted">Since 2013</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-md md:gap-lg">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-8 w-20 md:w-24 rounded flex items-center justify-center bg-(--color-text)/5"
                >
                  <span className="text-sm font-bold text-muted">Logo {i}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Big Statement + Why Us Combined */}
      <section className="section-padding-lg relative overflow-hidden">
        {/* Decorative triangle */}
        <div
          className="absolute -left-32 top-1/2 -translate-y-1/2 opacity-[0.04] hidden lg:block pointer-events-none"
          style={{
            width: "700px",
            height: "600px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
          }}
        />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-2xl md:mb-3xl">
            <div>
              <h2 style={{ marginBottom: "2.5rem" }}>
                Together, we'll make your ERP feel like a
                <span className="text-primary"> superpower</span>.
              </h2>
              <p className="text-lg text-muted mb-8 md:mb-10">
                We're NetSuite specialists - it's all we do. That focus means deeper expertise,
                faster delivery, and teams that actually use the system.
              </p>
              <div className="flex flex-wrap gap-lg">
                {whyUsItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-md">
                    <div
                      className="shrink-0 flex items-end justify-center"
                      style={{
                        width: "28px",
                        height: "24px",
                        clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                        backgroundColor: "var(--color-primary)",
                      }}
                    >
                      <Check className="w-3 h-3 text-white mb-0.5" />
                    </div>
                    <span className="text-sm font-bold">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-full aspect-video rounded-2xl overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/ibCnN1PRpkc"
                  title="Introduction"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started - Paths + Scorecards Combined */}
      <section
        className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden"
        style={{ backgroundColor: "#fafafa" }}
      >
        {/* Decorative triangle for whole section */}
        <div
          className="absolute -right-48 top-1/2 -translate-y-1/2 opacity-[0.04] hidden lg:block pointer-events-none"
          style={{
            width: "800px",
            height: "700px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
          }}
        />
        <div className="container relative z-10">
          <div className="text-center mb-xl md:mb-2xl">
            <p className="text-label text-primary mb-md">Get Started</p>
            <h3>Where are you on your journey?</h3>
          </div>

          {/* Two paths */}
          <div className="grid md:grid-cols-2 gap-md md:gap-lg mb-xl md:mb-2xl">
            <Link
              to="/services#implementation"
              className="group block relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: "var(--color-tertiary)",
                padding: "var(--space-xl)",
              }}
            >
              <div className="relative z-10">
                <p className="text-white/70 text-sm uppercase tracking-wider mb-sm">
                  New to NetSuite?
                </p>
                <h5 className="text-white mb-md">Let's get you started.</h5>
                <div className="flex items-center gap-sm text-sm font-bold text-white">
                  Implementation{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <Boxes
                className="absolute -right-6 -bottom-6 w-32 h-32 text-white opacity-10"
                strokeWidth={0.5}
              />
            </Link>

            <Link
              to="/support"
              className="group block relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: "var(--color-secondary)",
                padding: "var(--space-xl)",
              }}
            >
              <div className="relative z-10">
                <p className="text-white/70 text-sm uppercase tracking-wider mb-sm">
                  Already on NetSuite?
                </p>
                <h5 className="text-white mb-md">Let's make it better.</h5>
                <div className="flex items-center gap-sm text-sm font-bold text-white">
                  Aftercare{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <Network
                className="absolute -right-6 -bottom-6 w-32 h-32 text-white opacity-10"
                strokeWidth={0.5}
              />
            </Link>
          </div>

          {/* Assessments */}
          <div className="mt-12 md:mt-16 pt-12 md:pt-16">
            <div className="text-center mb-lg">
              <p className="text-label text-primary mb-sm">Free Assessments</p>
              <p className="text-lg">Not sure where to start? Take a quick scorecard</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-md">
              <a
                href="https://netscore-mini.scoreapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border-2 border-(--color-text)/10 hover:border-(--color-primary) hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-(--color-primary)/10 flex items-center justify-center mb-md">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold mb-xs">1-Min Quick Check</p>
                <p className="text-sm text-muted mb-md">Quick health snapshot</p>
                <span className="text-sm font-bold text-primary group-hover:underline">
                  Take assessment →
                </span>
              </a>
              <a
                href="https://ric-snwikqbv.scoreapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center text-center p-6 rounded-2xl bg-(--color-primary) text-white hover:scale-[1.02] hover:shadow-lg transition-all relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                  Popular
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-md">
                  <FileSpreadsheet className="w-6 h-6 text-white" />
                </div>
                <p className="font-bold mb-xs">10-Min NETscore</p>
                <p className="text-sm text-white/80 mb-md">Full analysis & recommendations</p>
                <span className="text-sm font-bold group-hover:underline">Get your score →</span>
              </a>
              <a
                href="https://one-score-to-rule-them-all.scoreapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border-2 border-(--color-text)/10 hover:border-(--color-secondary) hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-(--color-secondary)/10 flex items-center justify-center mb-md">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <p className="font-bold mb-xs">ERP Readiness</p>
                <p className="text-sm text-muted mb-md">Is your business ready?</p>
                <span className="text-sm font-bold text-secondary group-hover:underline">
                  Check readiness →
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="section-padding-lg border-b border-(--color-text)/10">
        <div className="container relative z-10">
          <div className="mb-2xl md:mb-3xl">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-md mb-lg">
              <p className="text-label text-primary">Industries</p>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading leading-tight mb-lg">
              Built for <span className="text-primary">your sector.</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md md:gap-lg">
            {industries.map((industry, i) => (
              <Link key={i} to="#" className="group text-center">
                <div className="aspect-square rounded-2xl md:rounded-3xl mb-md flex items-center justify-center border-2 border-(--color-text)/10 bg-white hover:border-(--color-primary)/50 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  <industry.icon
                    className="w-8 h-8 md:w-10 md:h-10 text-primary"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-base md:text-lg font-bold group-hover:text-primary transition-colors">
                  {industry.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services + Stats Combined */}
      <section className="section-padding-lg relative overflow-hidden">
        {/* Decorative triangle */}
        <div
          className="absolute top-1/2 left-0 opacity-[0.03] hidden lg:block pointer-events-none"
          style={{
            width: "70%",
            height: "100%",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateY(-50%) translateX(-20%)",
          }}
        />
        <div className="container relative z-10">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg md:gap-xl mb-xl md:mb-2xl pb-8 md:pb-12 border-b border-(--color-text)/10">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p
                  className={`font-heading text-4xl md:text-5xl leading-none mb-xs ${i % 2 === 1 ? "text-primary" : ""}`}
                >
                  {stat.value}
                </p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Header section */}
          <div className="mb-xl md:mb-2xl">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-md mb-lg">
              <p className="text-label text-primary">What we do</p>
              <Link
                to="/services"
                className="inline-flex items-center gap-sm bg-(--color-primary) text-white py-3 px-6 text-base font-bold rounded-full hover:scale-105 transition-transform w-fit"
              >
                View all services <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading leading-tight">
              Six services. <span className="text-primary">One focus.</span>
            </h2>
          </div>

          {/* Featured Services - Implementation & Aftercare */}
          <div className="grid md:grid-cols-2 gap-md md:gap-lg mb-md md:mb-lg">
            {services.slice(0, 2).map((service, i) => {
              const isTertiary = i === 0;
              const colorVar = isTertiary ? "--color-tertiary" : "--color-secondary";
              const textClass = isTertiary ? "text-tertiary" : "text-secondary";
              const linkTo = isTertiary ? "/services#implementation" : "/support";
              return (
                <Link
                  key={i}
                  to={linkTo}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1`}
                  style={{
                    backgroundColor: `var(${colorVar})`,
                    padding: "var(--space-2xl)",
                  }}
                >
                  <span
                    className="absolute -top-4 -right-2 font-heading text-[6rem] md:text-[10rem] leading-none pointer-events-none text-white"
                    style={{ opacity: 0.1 }}
                  >
                    {service.num}
                  </span>
                  <div className="relative z-10">
                    <div className="icon-box icon-box-md md:icon-box-lg rounded-2xl mb-lg bg-white/10">
                      <service.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h4 className="text-white mb-sm">{service.title}</h4>
                    <p className="text-white/70 text-lg mb-xl">{service.desc}</p>
                    <div className="flex items-center gap-sm text-base font-bold text-white">
                      Learn more{" "}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Other Services */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-md md:gap-lg">
            {services.slice(2).map((service, i) => {
              return (
                <Link
                  key={i}
                  to="#"
                  className="card group relative overflow-hidden border-2 border-(--color-text)/10 hover:border-(--color-primary)/50 hover:shadow-xl transition-all duration-300"
                >
                  <span
                    className="absolute -top-4 -right-2 font-heading text-[5rem] md:text-[6rem] leading-none pointer-events-none text-(--color-primary)"
                    style={{ opacity: 0.05 }}
                  >
                    {service.num}
                  </span>
                  <div className="relative z-10">
                    <div className="icon-box icon-box-md rounded-2xl mb-md md:mb-lg bg-(--color-primary)/10">
                      <service.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                    </div>
                    <h5 className="mb-xs md:mb-sm">{service.title}</h5>
                    <p className="text-base text-muted mb-md">{service.desc}</p>
                    <div className="flex items-center gap-sm text-base font-bold opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                      Learn more <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="mb-xl md:mb-2xl">
            <p className="text-label text-primary mb-sm md:mb-md">Case study</p>
            <h3>Real results</h3>
          </div>
          <div className="grid lg:grid-cols-2 gap-xl lg:gap-2xl items-stretch">
            <div className="aspect-[4/3] lg:aspect-auto rounded-2xl md:rounded-3xl bg-dark relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"
                alt="Manufacturing case study"
                className="w-full h-full object-cover"
              />
              {/* Triangle accent */}
              <div
                className="absolute bottom-0 right-0 opacity-50 hidden md:block z-10"
                style={{
                  width: "500px",
                  height: "430px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "white",
                  transform: "translateX(120px) translateY(120px)",
                }}
              />
              <div
                className="absolute bottom-0 left-0 w-full h-1/3 z-10"
                style={{
                  background: "linear-gradient(to top, var(--color-primary)/30, transparent)",
                }}
              />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-label text-primary mb-md">Precision Manufacturing Ltd</p>
              <h3 style={{ marginBottom: "var(--space-lg)" }}>
                From chaos to <span className="text-primary">clarity</span>
              </h3>
              <p className="text-lg text-muted mb-xl md:mb-2xl">
                A UK manufacturer drowning in disconnected systems and manual processes. We
                implemented NetSuite to unify their operations and unlock real-time visibility
                across the business.
              </p>
              <div className="grid grid-cols-3 gap-md md:gap-xl mb-xl md:mb-2xl">
                <div>
                  <p className="font-heading text-3xl md:text-4xl mb-xs">40%</p>
                  <p className="text-sm text-muted">Faster processing</p>
                </div>
                <div>
                  <p className="font-heading text-3xl md:text-4xl text-primary mb-xs">3x</p>
                  <p className="text-sm text-muted">Accuracy gain</p>
                </div>
                <div>
                  <p className="font-heading text-3xl md:text-4xl mb-xs">12wk</p>
                  <p className="text-sm text-muted">Go-live</p>
                </div>
              </div>
              <Link
                to="/case-studies/1"
                className="inline-flex items-center gap-sm bg-(--color-primary) text-white py-3 px-6 text-base font-bold rounded-full w-fit hover:scale-105 transition-transform"
              >
                Read case study
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="max-w-5xl mx-auto text-center">
            <MessageSquareQuote className="w-16 h-16 md:w-20 md:h-20 text-primary mx-auto mb-xl md:mb-2xl" />
            <blockquote className="font-heading text-3xl md:text-4xl lg:text-5xl leading-snug mb-xl md:mb-2xl">
              "Their team truly understands how to translate technology into
              <span className="text-primary"> real-world impact</span>."
            </blockquote>
            <div className="flex items-center justify-center gap-lg">
              <div
                className="relative flex items-end justify-center"
                style={{
                  width: "70px",
                  height: "60px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "var(--color-primary)",
                }}
              >
                <Shirt className="w-6 h-6 text-white mb-2" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold">Peter B</p>
                <p className="text-lg text-muted">CEO, Coats4Kids</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-md md:gap-lg mb-xl md:mb-2xl">
            <div>
              <p className="text-label text-primary mb-sm md:mb-md">Resources</p>
              <h3>Learn from the experts</h3>
            </div>
            <Link
              to="/resources"
              className="group text-base font-bold inline-flex items-center gap-sm"
            >
              View all resources
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-md md:gap-xl">
            {resources.map((resource, i) => (
              <Link
                key={i}
                to="#"
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
                    className="absolute bottom-0 right-0 opacity-40 z-10"
                    style={{
                      width: "120px",
                      height: "100px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "white",
                      transform: "translateX(30px) translateY(30px)",
                    }}
                  />
                  {/* Type badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-sm bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-primary">
                      <resource.icon className="w-4 h-4" />
                      {resource.type}
                    </span>
                  </div>
                </div>
                <div className="p-(--space-xl) md:p-(--space-2xl)">
                  <h5 className="mb-md group-hover:text-primary transition-colors">
                    {resource.title}
                  </h5>
                  <p className="text-base text-muted mb-lg">{resource.desc}</p>
                  <div className="flex items-center gap-sm text-base font-bold text-primary">
                    Read more{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA + Newsletter */}
      <section className="pt-8 md:pt-12 pb-16 md:pb-24 px-4 md:px-8">
        <div className="container">
          <div className="rounded-3xl md:rounded-[3rem] overflow-hidden relative">
            {/* Background with gradient */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
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

            {/* Content */}
            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <div className="text-center">
                <h2
                  className="text-white mb-lg md:mb-xl"
                  style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
                >
                  Let's build
                  <br />
                  <span className="text-white/90">something great.</span>
                </h2>
                <p className="text-white/80 text-lg md:text-xl mb-xl md:mb-2xl max-w-3xl mx-auto">
                  Ready to transform your business? Get in touch to start your NetSuite journey, or
                  subscribe for weekly insights.
                </p>

                <div className="flex flex-col sm:flex-row gap-md justify-center mb-xl md:mb-2xl">
                  <button className="btn btn-lg justify-center bg-white text-(--color-primary) hover:scale-105 transition-transform">
                    Start a project
                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <Link
                    to="/contact"
                    className="btn btn-lg justify-center bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 transition-all"
                  >
                    Book a call
                  </Link>
                </div>

                {/* Newsletter */}
                <div className="pt-10 md:pt-16 mt-8 border-t border-white/20">
                  <p className="text-white/70 text-base mb-lg">
                    Or subscribe to our newsletter for NetSuite tips & insights
                  </p>
                  <div className="flex flex-col sm:flex-row gap-md max-w-2xl mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-(--space-xl) py-(--space-md) rounded-full border-2 border-white/20 bg-white/10 text-white placeholder-white/50 text-base focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
                    />
                    <button className="btn justify-center shrink-0 bg-white text-(--color-primary) hover:scale-105 transition-transform">
                      Subscribe
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
