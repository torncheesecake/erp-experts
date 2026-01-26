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
      <section
        className="min-h-[55vh] md:min-h-[75vh] flex items-center relative overflow-hidden"
        style={{ paddingTop: "var(--space-4xl)" }}
      >
        {/* Mobile triangle - positioned top right */}
        <div
          className="absolute md:hidden"
          style={{
            top: "15%",
            right: "-15%",
            width: "320px",
            height: "275px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            opacity: 0.2,
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
            <p className="text-label text-primary" style={{ marginBottom: "var(--space-md)" }}>
              NetSuite Partner
            </p>
            <h1 className="text-hero" style={{ marginBottom: "var(--space-lg)" }}>
              We make
              <br />
              <span className="text-primary">NetSuite</span>
              <br />
              work.
            </h1>
            <p
              className="text-lg text-muted max-w-sm md:hidden"
              style={{ marginBottom: "var(--space-xl)" }}
            >
              UK's trusted NetSuite implementation partner for growing businesses.
            </p>
            <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Start a project
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Logos + Partner Badge Combined */}
      <section className="mt-lg md:mt-xl pt-lg md:pt-xl pb-xl md:pb-2xl border-b border-(--color-text)/10">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-lg md:gap-xl">
            {/* Partner Badge Card */}
            <div
              className="flex items-center gap-md md:gap-lg p-md md:p-lg rounded-xl md:rounded-2xl"
              style={{ backgroundColor: "rgba(232, 58, 122, 0.05)" }}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-(--color-primary)/15 flex items-center justify-center">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <div>
                <span className="text-base md:text-lg font-bold block">
                  NetSuite Certified Partner
                </span>
                <span className="text-sm text-muted">Supporting businesses since 2013</span>
              </div>
            </div>

            {/* Logos */}
            <div className="flex flex-col items-center lg:items-start gap-sm">
              <span className="text-xs uppercase tracking-wider text-muted font-bold">
                Trusted by
              </span>
              <div className="flex flex-wrap items-center justify-center gap-md md:gap-lg">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-20 md:h-10 md:w-28 rounded-lg flex items-center justify-center bg-(--color-text)/5"
                  >
                    <span className="text-xs md:text-sm font-bold text-muted">Logo {i}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Big Statement + Why Us Combined */}
      <section className="section-padding relative overflow-hidden">
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
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-2xl lg:gap-3xl items-center">
            <div>
              <blockquote className="mb-xl">
                <h2 className="mb-lg">
                  "Together, we'll make your ERP feel like a{" "}
                  <span className="text-primary">superpower</span>."
                </h2>
                <p className="text-base md:text-lg font-bold">— Ric, Managing Director</p>
              </blockquote>
              <p className="text-base md:text-lg text-muted mb-xl md:mb-2xl">
                We're NetSuite specialists - it's all we do. That focus means deeper expertise,
                faster delivery, and teams that actually use the system.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-md md:gap-lg">
                {whyUsItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-sm md:gap-md">
                    <div
                      className="shrink-0 flex items-end justify-center"
                      style={{
                        width: "24px",
                        height: "20px",
                        clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                        backgroundColor: "var(--color-primary)",
                      }}
                    >
                      <Check className="w-2.5 h-2.5 text-white mb-0.5" />
                    </div>
                    <span className="text-sm font-bold">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center lg:justify-end mt-lg lg:mt-0">
              <div className="w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden">
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

      {/* Stats Section */}
      <section className="section-padding" style={{ backgroundColor: "rgba(232, 58, 122, 0.05)" }}>
        <div className="container">
          <p className="text-label text-primary text-center mb-xl">Our Track Record</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg md:gap-xl">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p
                  className={`font-heading text-4xl md:text-stat leading-none mb-sm ${i % 2 === 1 ? "text-primary" : ""}`}
                >
                  {stat.value}
                </p>
                <p className="text-base text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where Are You On Your Journey - Merged Services Section */}
      <section className="section-padding relative overflow-hidden">
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
          {/* Header section */}
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">Our Services</p>
            <h2>
              Where are you on your NetSuite <span className="text-primary">Journey?</span>
            </h2>
          </div>

          {/* Implementation Path */}
          <div className="mb-2xl md:mb-3xl">
            <Link
              to="/implementation"
              className="group block relative overflow-hidden rounded-2xl md:rounded-3xl transition-all duration-300 hover:-translate-y-1 mb-md md:mb-lg"
              style={{
                backgroundColor: "var(--color-tertiary)",
                padding: "var(--space-xl)",
              }}
            >
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-md">
                <div>
                  <p className="text-white text-sm uppercase tracking-wider mb-sm">
                    New to NetSuite?
                  </p>
                  <h4 className="text-white mb-sm md:mb-0">Let's get you started.</h4>
                </div>
                <div className="inline-flex items-center gap-sm text-base font-bold text-white bg-white/20 py-2 px-4 md:py-3 md:px-6 rounded-full group-hover:bg-white/30 transition-all">
                  Implementation{" "}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
              <Boxes
                className="absolute -right-6 -bottom-6 w-32 h-32 md:w-48 md:h-48 text-white opacity-10"
                strokeWidth={0.5}
              />
            </Link>

            {/* Implementation Services */}
            <div className="grid md:grid-cols-3 gap-md md:gap-lg">
              {[
                {
                  icon: Zap,
                  title: "Customisation",
                  desc: "Tailoring NetSuite to fit your unique business processes",
                },
                {
                  icon: Database,
                  title: "Data Migration",
                  desc: "Moving your data safely and accurately into NetSuite",
                },
                {
                  icon: Sparkles,
                  title: "And more...",
                  desc: "Discovery, testing, rescue, and go-live support",
                  isMore: true,
                },
              ].map((service, i) => (
                <Link
                  key={i}
                  to="/implementation"
                  className={`card group relative overflow-hidden hover:shadow-xl transition-all duration-300 p-lg md:p-xl border-2 ${service.isMore ? "border-dashed border-(--color-tertiary)/30 hover:border-(--color-tertiary)/50" : "border-(--color-tertiary)/20 hover:border-(--color-tertiary)/50"}`}
                >
                  <div className="relative z-10">
                    <div
                      className="icon-box icon-box-sm md:icon-box-md rounded-xl md:rounded-2xl mb-md md:mb-lg"
                      style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                    >
                      <service.icon
                        className="w-5 h-5 md:w-7 md:h-7"
                        style={{ color: "var(--color-tertiary)" }}
                      />
                    </div>
                    <h5 className="mb-sm">{service.title}</h5>
                    <p className="text-base text-muted mb-md">{service.desc}</p>
                    <div
                      className="flex items-center gap-xs text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--color-tertiary)" }}
                    >
                      Learn more <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Support Path */}
          <div>
            <Link
              to="/support"
              className="group block relative overflow-hidden rounded-2xl md:rounded-3xl transition-all duration-300 hover:-translate-y-1 mb-md md:mb-lg"
              style={{
                backgroundColor: "var(--color-secondary)",
                padding: "var(--space-xl)",
              }}
            >
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-md">
                <div>
                  <p className="text-white text-sm uppercase tracking-wider mb-sm">
                    Already on NetSuite?
                  </p>
                  <h4 className="text-white mb-sm md:mb-0">Let's make it better.</h4>
                </div>
                <div className="inline-flex items-center gap-sm text-base font-bold text-white bg-white/20 py-2 px-4 md:py-3 md:px-6 rounded-full group-hover:bg-white/30 transition-all">
                  Support{" "}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
              <Network
                className="absolute -right-6 -bottom-6 w-32 h-32 md:w-48 md:h-48 text-white opacity-10"
                strokeWidth={0.5}
              />
            </Link>

            {/* Support Services */}
            <div className="grid md:grid-cols-3 gap-md md:gap-lg">
              {[
                {
                  icon: Stethoscope,
                  title: "Health Audits",
                  desc: "System reviews to identify improvements and optimisations",
                },
                {
                  icon: Link2,
                  title: "Integrations",
                  desc: "Connect NetSuite with your other business tools seamlessly",
                },
                {
                  icon: Sparkles,
                  title: "And more...",
                  desc: "Training, reporting, enhancements, and ongoing support",
                  isMore: true,
                },
              ].map((service, i) => (
                <Link
                  key={i}
                  to="/support"
                  className={`card group relative overflow-hidden hover:shadow-xl transition-all duration-300 p-lg md:p-xl border-2 ${service.isMore ? "border-dashed border-(--color-secondary)/30 hover:border-(--color-secondary)/50" : "border-(--color-secondary)/20 hover:border-(--color-secondary)/50"}`}
                >
                  <div className="relative z-10">
                    <div
                      className="icon-box icon-box-sm md:icon-box-md rounded-xl md:rounded-2xl mb-md md:mb-lg"
                      style={{ backgroundColor: "rgba(126, 34, 206, 0.1)" }}
                    >
                      <service.icon
                        className="w-5 h-5 md:w-7 md:h-7"
                        style={{ color: "var(--color-secondary)" }}
                      />
                    </div>
                    <h5 className="mb-sm">{service.title}</h5>
                    <p className="text-base text-muted mb-md">{service.desc}</p>
                    <div
                      className="flex items-center gap-xs text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--color-secondary)" }}
                    >
                      Learn more <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="mb-2xl">
            <p className="text-label text-primary mb-md">Case study</p>
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
              <p className="text-label text-primary mb-sm md:mb-md">Precision Manufacturing Ltd</p>
              <h3 className="mb-md md:mb-lg">
                From chaos to <span className="text-primary">clarity</span>
              </h3>
              <p className="text-base md:text-lg text-muted mb-lg md:mb-xl">
                A UK manufacturer drowning in disconnected systems and manual processes. We
                implemented NetSuite to unify their operations and unlock real-time visibility
                across the business.
              </p>
              <div className="grid grid-cols-3 gap-md md:gap-xl mb-lg md:mb-xl">
                <div>
                  <p className="font-heading text-2xl md:text-4xl mb-xs">40%</p>
                  <p className="text-sm text-muted">Faster processing</p>
                </div>
                <div>
                  <p className="font-heading text-2xl md:text-4xl text-primary mb-xs">3x</p>
                  <p className="text-sm text-muted">Accuracy gain</p>
                </div>
                <div>
                  <p className="font-heading text-2xl md:text-4xl mb-xs">12wk</p>
                  <p className="text-sm text-muted">Go-live</p>
                </div>
              </div>
              <Link
                to="/case-studies/1"
                className="inline-flex items-center gap-sm bg-(--color-primary) text-white py-2 px-4 md:py-3 md:px-6 text-sm md:text-base font-bold rounded-full w-fit hover:scale-105 transition-transform"
              >
                Read case study
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-5xl mx-auto text-center">
            <MessageSquareQuote className="w-16 h-16 md:w-20 md:h-20 text-primary mx-auto mb-lg md:mb-xl" />
            <blockquote className="font-heading text-2xl md:text-4xl lg:text-5xl leading-snug mb-lg md:mb-xl">
              "Their team truly understands how to translate technology into
              <span className="text-primary"> real-world impact</span>."
            </blockquote>
            <div className="flex items-center justify-center gap-md md:gap-lg">
              <div
                className="relative flex items-end justify-center"
                style={{
                  width: "50px",
                  height: "43px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "var(--color-primary)",
                }}
              >
                <Shirt className="w-5 h-5 md:w-6 md:h-6 text-white mb-1.5" />
              </div>
              <div className="text-left">
                <p className="text-lg md:text-xl font-bold">Peter B</p>
                <p className="text-base md:text-lg text-muted">CEO, Coats4Kids</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-lg mb-2xl">
            <div>
              <p className="text-label text-primary mb-md">Resources</p>
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
          <div className="grid md:grid-cols-3 gap-lg md:gap-xl">
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
                <div className="p-lg md:p-xl">
                  <h5 className="mb-sm md:mb-md group-hover:text-primary transition-colors">
                    {resource.title}
                  </h5>
                  <p className="text-base text-muted mb-md md:mb-lg">{resource.desc}</p>
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
      <section className="section-padding">
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
            <div className="relative z-10 p-lg md:p-xl lg:p-2xl">
              <div className="text-center">
                <h2
                  className="text-white mb-lg md:mb-xl"
                  style={{ fontSize: "clamp(2rem, 6vw, 5rem)" }}
                >
                  Let's build
                  <br />
                  <span className="text-white/90">something great.</span>
                </h2>
                <p className="text-white/80 text-base md:text-xl mb-xl md:mb-2xl max-w-3xl mx-auto">
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
                <div className="pt-lg md:pt-xl mt-lg border-t border-white/20">
                  <p className="text-white/70 text-sm md:text-base mb-md md:mb-lg">
                    Or subscribe to our newsletter for NetSuite tips & insights
                  </p>
                  <div className="flex flex-col sm:flex-row gap-md max-w-2xl mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-lg py-md rounded-full border-2 border-white/20 bg-white/10 text-white placeholder-white/50 text-sm md:text-base focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
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
