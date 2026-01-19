/**
 * ERP Experts Homepage
 */

import {
  ArrowRight,
  ArrowUpRight,
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
      <section className="min-h-[60vh] md:min-h-[75vh] flex items-center relative overflow-hidden pt-(--space-4xl)">
        {/* Offset pink triangle - behind main */}
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
        {/* Main triangle with image */}
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
        <div className="container section-padding-lg relative z-10">
          <div className="max-w-5xl">
            <p className="text-label text-primary mb-md md:mb-lg">NetSuite Partner</p>
            <h1 className="text-hero" style={{ marginBottom: "var(--space-4xl)" }}>
              We make
              <br />
              <span className="text-primary">NetSuite</span>
              <br />
              work.
            </h1>
            <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Start a project
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-sm text-(--color-text) animate-bounce hidden md:flex">
          <span className="text-sm font-medium">Scroll</span>
          <ArrowRight className="w-4 h-4 rotate-90" />
        </div>
      </section>

      {/* Logos */}
      <section className="py-(--space-xl) md:py-(--space-2xl) border-y border-(--color-text)/10">
        <div className="container">
          <div className="flex flex-col md:flex-row flex-wrap items-center justify-between gap-lg">
            <p className="text-label text-muted">Trusted by</p>
            <div className="flex flex-wrap items-center justify-center gap-md md:gap-xl">
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

      {/* Partner Badge */}
      <section className="section-padding">
        <div className="container">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-xl lg:gap-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-lg md:gap-xl">
              <div className="icon-box icon-box-md md:icon-box-lg rounded-2xl md:rounded-3xl bg-(--color-primary)/10 shrink-0">
                <Shield className="w-8 h-8 md:w-16 md:h-16 text-primary" />
              </div>
              <div>
                <p className="text-label text-primary mb-xs md:mb-sm">Certified Partner</p>
                <h4 className="mb-xs md:mb-sm">NetSuite Solution Provider</h4>
                <p className="text-base text-muted">Trusted by Oracle NetSuite since 2013</p>
              </div>
            </div>
            <div className="flex gap-xl md:gap-2xl">
              <div className="text-center">
                <p className="font-heading text-2xl md:text-3xl text-primary mb-xs">100%</p>
                <p className="text-label text-muted">Success Rate</p>
              </div>
              <div className="text-center">
                <p className="font-heading text-2xl md:text-3xl text-primary mb-xs">10+</p>
                <p className="text-label text-muted">Years Partner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Big Statement */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-xl lg:gap-2xl items-center">
            <h2 className="lg:col-span-2">
              Together, we'll make your ERP feel like a
              <span className="text-primary"> superpower</span>.
            </h2>
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

      {/* Where Are You? - Consolidated Path + Problem */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="text-center mb-xl md:mb-2xl">
            <h3>Which one are you?</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-md md:gap-lg relative">
            {/* Path 1: No ERP yet */}
            <Link
              to="/services#implementation"
              className="group block relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: "var(--color-tertiary)",
                padding: "var(--space-2xl)",
              }}
            >
              <div className="relative z-10">
                <p className="text-white/70 text-sm uppercase tracking-wider mb-md">
                  New to NetSuite?
                </p>
                <h4 className="text-white mb-lg">Let's get you started.</h4>
                <div className="flex items-center gap-md font-bold text-white">
                  Implementation
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
              {/* Decorative */}
              <Boxes
                className="absolute -right-8 -bottom-8 w-48 h-48 text-white opacity-10"
                strokeWidth={0.5}
              />
            </Link>

            {/* Path 2: Already have NetSuite */}
            <Link
              to="/services#aftercare"
              className="group block relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: "var(--color-secondary)",
                padding: "var(--space-2xl)",
              }}
            >
              <div className="relative z-10">
                <p className="text-white/70 text-sm uppercase tracking-wider mb-md">
                  Already on NetSuite?
                </p>
                <h4 className="text-white mb-lg">Let's make it better.</h4>
                <div className="flex items-center gap-md font-bold text-white">
                  Aftercare
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
              {/* Decorative */}
              <Network
                className="absolute -right-8 -bottom-8 w-48 h-48 text-white opacity-10"
                strokeWidth={0.5}
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats - Massive Numbers */}
      <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
        {/* Decorative triangles */}
        <div
          className="absolute top-8 left-8 opacity-10 hidden lg:block"
          style={{
            width: "60px",
            height: "52px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
          }}
        />
        <div
          className="absolute bottom-12 right-16 opacity-10 hidden lg:block"
          style={{
            width: "100px",
            height: "87px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
          }}
        />
        <div className="container relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-xl md:gap-2xl">
            {stats.map((stat, i) => (
              <div key={i} className="text-center lg:text-left">
                <p
                  className={`font-heading text-[clamp(3.5rem,10vw,7rem)] leading-none mb-sm ${i % 2 === 0 ? "" : "text-primary"}`}
                >
                  {stat.value}
                </p>
                <p className="text-label text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
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
          {/* Header section */}
          <div className="mb-2xl md:mb-3xl">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-md mb-lg">
              <p className="text-label text-primary">What we do</p>
              <Link
                to="/services"
                className="inline-flex items-center gap-sm bg-(--color-primary) text-white py-3 px-6 text-base font-bold rounded-full hover:scale-105 transition-transform w-fit"
              >
                View all services <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading leading-tight mb-lg">
              Six services. <span className="text-primary">One focus.</span>
            </h2>
          </div>

          {/* Cards - Option 5 style with enhancements */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-md md:gap-lg">
            {services.map((service, i) => {
              const isTertiary = i === 0; // Implementation (index 0) is navy blue
              const isSecondary = i === 1; // Aftercare (index 1) is purple
              const colorVar = isTertiary
                ? "--color-tertiary"
                : isSecondary
                  ? "--color-secondary"
                  : "--color-primary";
              const textClass = isTertiary
                ? "text-tertiary"
                : isSecondary
                  ? "text-secondary"
                  : "text-primary";
              return (
                <Link
                  key={i}
                  to="#"
                  className={`card group relative overflow-hidden border-2 border-(--color-text)/10 hover:border-(${colorVar})/50 hover:shadow-xl transition-all duration-300`}
                >
                  <span
                    className={`absolute -top-4 -right-2 font-heading text-[5rem] md:text-[8rem] leading-none pointer-events-none text-(${colorVar})`}
                    style={{ opacity: 0.05 }}
                  >
                    {service.num}
                  </span>
                  <div className="relative z-10">
                    <div
                      className={`icon-box icon-box-md rounded-2xl mb-md md:mb-lg bg-(${colorVar})/10`}
                    >
                      <service.icon className={`w-6 h-6 md:w-8 md:h-8 ${textClass}`} />
                    </div>
                    <h5 className="mb-xs md:mb-sm">{service.title}</h5>
                    <p className="text-base text-muted mb-md">{service.desc}</p>
                    <div
                      className={`flex items-center gap-sm text-base font-bold opacity-0 group-hover:opacity-100 transition-opacity ${textClass}`}
                    >
                      Learn more <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              );
            })}
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
              <h3 style={{ marginBottom: "var(--space-3xl)" }}>
                From chaos to <span className="text-primary">clarity</span>
              </h3>
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

      {/* Why Us */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-xl md:mb-2xl">
            <p className="text-label text-primary mb-md">Why us</p>
            <h3>
              NetSuite. <span className="text-muted">That's it.</span>
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-md md:gap-lg">
            {whyUsItems.map((item, i) => (
              <div key={i} className="card relative overflow-hidden">
                <div className="relative z-10">
                  <div
                    className="mb-md md:mb-lg relative flex items-end justify-center"
                    style={{
                      width: "40px",
                      height: "35px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-primary)",
                    }}
                  >
                    <Check className="w-4 h-4 text-white mb-1" />
                  </div>
                  <h5 className="mb-sm md:mb-md">{item.title}</h5>
                  <p className="text-base text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
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

      {/* Final CTA */}
      <section className="section-padding-lg">
        <div className="container text-center">
          <h1 className="text-hero mb-2xl md:mb-3xl">
            Let's build
            <span className="block text-primary">something great.</span>
          </h1>
          <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
            Start a project
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
