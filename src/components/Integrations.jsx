/**
 * ERP Experts Integrations Page
 */

import { Link } from "react-router-dom";
import {
  ArrowRight,
  Puzzle,
  ShoppingCart,
  CreditCard,
  Users,
  Headphones,
  BarChart3,
  Mail,
  Warehouse,
  Zap,
  Check,
  MessageSquareQuote,
  RefreshCw,
  Shield,
  Clock,
  Settings,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

const integrationCategories = [
  {
    id: "ecommerce",
    icon: ShoppingCart,
    title: "eCommerce",
    desc: "Sync orders, inventory, and customer data between your online store and NetSuite. Real-time visibility across all channels.",
    platforms: [
      { name: "Shopify", desc: "Orders, inventory, customers" },
      { name: "Magento", desc: "Full catalog sync" },
      { name: "WooCommerce", desc: "WordPress integration" },
      { name: "BigCommerce", desc: "Multi-channel support" },
    ],
  },
  {
    id: "crm",
    icon: Users,
    title: "CRM & Sales",
    desc: "Keep your sales team in sync with finance. Opportunities, quotes, and customer records flow seamlessly between systems.",
    platforms: [
      { name: "Salesforce", desc: "Bi-directional sync" },
      { name: "HubSpot", desc: "Marketing & sales" },
      { name: "Pipedrive", desc: "Deal management" },
      { name: "Microsoft Dynamics", desc: "Enterprise CRM" },
    ],
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Payment Gateways",
    desc: "Automate payment processing and reconciliation. Reduce manual entry and eliminate errors in your financial records.",
    platforms: [
      { name: "Stripe", desc: "Cards & subscriptions" },
      { name: "PayPal", desc: "Global payments" },
      { name: "GoCardless", desc: "Direct debit" },
      { name: "Adyen", desc: "Enterprise payments" },
    ],
  },
  {
    id: "support",
    icon: Headphones,
    title: "Customer Support",
    desc: "Give support teams full visibility into customer orders and history. Resolve issues faster with complete context.",
    platforms: [
      { name: "Zendesk", desc: "Ticketing & support" },
      { name: "Freshdesk", desc: "Help desk" },
      { name: "Intercom", desc: "Messaging & chat" },
      { name: "ServiceNow", desc: "Enterprise ITSM" },
    ],
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics & BI",
    desc: "Unlock deeper insights by combining NetSuite data with your analytics tools. Build dashboards that drive decisions.",
    platforms: [
      { name: "Tableau", desc: "Visual analytics" },
      { name: "Power BI", desc: "Microsoft BI" },
      { name: "Looker", desc: "Data exploration" },
      { name: "Domo", desc: "Business intelligence" },
    ],
  },
  {
    id: "logistics",
    icon: Warehouse,
    title: "Warehouse & Logistics",
    desc: "Streamline fulfilment with real-time inventory and shipping updates. From pick to delivery, stay in control.",
    platforms: [
      { name: "ShipStation", desc: "Shipping automation" },
      { name: "3PL Central", desc: "Warehouse management" },
      { name: "DHL", desc: "Global logistics" },
      { name: "Royal Mail", desc: "UK delivery" },
    ],
  },
];

const integrationPlatforms = [
  {
    name: "Celigo",
    desc: "Enterprise-grade iPaaS with pre-built NetSuite connectors. Ideal for complex, high-volume integrations.",
    features: ["Pre-built flows", "Error handling", "Monitoring dashboard"],
  },
  {
    name: "Cyclr",
    desc: "Embedded integration platform perfect for scaling. Build once, deploy across multiple customers.",
    features: ["Visual builder", "White-label ready", "API management"],
  },
  {
    name: "Dell Boomi",
    desc: "Cloud-native integration platform for enterprise needs. Connect any application, anywhere.",
    features: ["Low-code design", "Master data hub", "API governance"],
  },
  {
    name: "Custom Development",
    desc: "When off-the-shelf won't cut it, we build bespoke integrations using SuiteScript and RESTlets.",
    features: ["Tailored logic", "Full control", "Deep customisation"],
  },
];

const benefits = [
  {
    icon: RefreshCw,
    title: "Real-time sync",
    desc: "Data flows automatically between systems - no manual exports or uploads.",
  },
  {
    icon: Shield,
    title: "Error handling",
    desc: "Built-in validation and alerts catch issues before they become problems.",
  },
  {
    icon: Clock,
    title: "Time savings",
    desc: "Eliminate hours of manual data entry and reconciliation every week.",
  },
  {
    icon: Settings,
    title: "Scalability",
    desc: "Integrations that grow with your business, handling increased volume effortlessly.",
  },
];

export default function Integrations() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="min-h-[50vh] md:min-h-[60vh] flex items-center relative overflow-hidden pt-(--space-4xl)">
        {/* Offset pink triangle */}
        <div
          className="absolute top-1/2 hidden md:block"
          style={{
            left: "75%",
            transform: "translateX(calc(-50% + 80px)) translateY(calc(-50% + 30px))",
            width: "900px",
            height: "772px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            opacity: 0.25,
          }}
        />
        {/* Main triangle */}
        <div
          className="absolute top-1/2 hidden md:block"
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
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.6 }}
          />
        </div>
        <div className="container relative z-10">
          <div>
            <p className="text-label text-primary mb-md">Integrations</p>
            <h1 className="text-hero max-w-[1000px] mb-xl md:mb-2xl">
              Connect NetSuite to
              <br />
              <span className="text-primary">everything.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted leading-relaxed max-w-[800px] mb-2xl">
              Your business runs on more than one system. We connect NetSuite to your eCommerce,
              CRM, payments, and more - creating a unified platform that just works.
            </p>
            <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Discuss your integration
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-3xl md:h-4xl" />

      {/* Benefits */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {benefits.map((benefit, i) => (
              <div key={i} className="text-center">
                <div className="icon-box icon-box-md rounded-2xl bg-(--color-primary)/10 mx-auto mb-lg">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h5 className="mb-sm">{benefit.title}</h5>
                <p className="text-base text-muted">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Categories */}
      <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
        {/* Decorative triangle */}
        <div
          className="absolute bottom-0 right-0 opacity-[0.03] hidden lg:block pointer-events-none"
          style={{
            width: "70%",
            height: "140%",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(25%) translateY(15%)",
          }}
        />
        <div className="container relative z-10">
          <div className="mb-2xl md:mb-3xl">
            <p className="text-label text-primary mb-md">What we connect</p>
            <h2 className="mb-lg">
              Integrations for every <span className="text-primary">need.</span>
            </h2>
            <p className="text-lg text-muted max-w-[800px]">
              From eCommerce to accounting, we've built integrations across every category.
              Here's what we can connect to your NetSuite instance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-lg md:gap-xl">
            {integrationCategories.map((category, i) => (
              <div
                key={i}
                className="card p-(--space-xl) md:p-(--space-2xl) border-2 border-(--color-text)/10 hover:border-(--color-primary)/40 transition-all"
              >
                <div className="icon-box icon-box-md rounded-2xl bg-(--color-primary)/10 mb-lg">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="mb-sm">{category.title}</h4>
                <p className="text-base text-muted mb-xl">{category.desc}</p>
                <div className="space-y-sm">
                  {category.platforms.map((platform, j) => (
                    <div
                      key={j}
                      className="flex items-center justify-between py-sm border-b border-(--color-text)/5 last:border-0"
                    >
                      <span className="font-bold text-base">{platform.name}</span>
                      <span className="text-sm text-muted">{platform.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Platforms */}
      <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
        <Puzzle
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[30rem] h-[30rem] text-primary opacity-[0.04] pointer-events-none hidden lg:block"
          strokeWidth={0.5}
        />
        <div className="container relative z-10">
          <div className="mb-2xl md:mb-3xl">
            <p className="text-label text-primary mb-md">How we build</p>
            <h2 className="mb-lg">
              Integration <span className="text-primary">platforms.</span>
            </h2>
            <p className="text-lg text-muted max-w-[800px]">
              We use industry-leading platforms to build reliable, maintainable integrations.
              The right tool for each job.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-lg md:gap-xl">
            {integrationPlatforms.map((platform, i) => (
              <div
                key={i}
                className="card p-(--space-xl) md:p-(--space-2xl) border-2 border-(--color-text)/10 hover:border-(--color-primary)/40 transition-all"
              >
                <h4 className="mb-md text-primary">{platform.name}</h4>
                <p className="text-base text-muted mb-lg">{platform.desc}</p>
                <div className="flex flex-wrap gap-sm">
                  {platform.features.map((feature, j) => (
                    <span
                      key={j}
                      className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-(--color-primary)/10 text-sm font-medium"
                    >
                      <Check className="w-3 h-3 text-primary" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="mb-2xl md:mb-3xl text-center">
            <p className="text-label text-primary mb-md">Our approach</p>
            <h2 className="mb-lg">
              How we <span className="text-primary">deliver.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-lg md:gap-xl">
            {[
              {
                num: "01",
                title: "Discovery",
                desc: "We map your systems, data flows, and requirements to design the right solution.",
              },
              {
                num: "02",
                title: "Design",
                desc: "Detailed specifications covering data mapping, error handling, and sync logic.",
              },
              {
                num: "03",
                title: "Build",
                desc: "Development in a sandbox environment with thorough testing at each stage.",
              },
              {
                num: "04",
                title: "Support",
                desc: "Go-live assistance and ongoing monitoring to keep everything running smoothly.",
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-(--color-primary)/10 mb-lg">
                  <span className="font-heading text-2xl text-primary">{step.num}</span>
                </div>
                <h5 className="mb-md">{step.title}</h5>
                <p className="text-base text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <MessageSquareQuote className="w-16 h-16 md:w-20 md:h-20 text-primary mx-auto mb-2xl" />
            <blockquote className="font-heading text-2xl md:text-3xl lg:text-4xl leading-snug mb-2xl">
              "Our Shopify and NetSuite integration has
              <span className="text-primary"> eliminated hours of manual work</span> every day.
              Orders flow through automatically and inventory is always accurate."
            </blockquote>
            <div className="flex items-center justify-center gap-lg">
              <div
                className="relative flex items-end justify-center"
                style={{
                  width: "64px",
                  height: "56px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "var(--color-primary)",
                }}
              >
                <Users className="w-6 h-6 text-white mb-2" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold">James Cooper</p>
                <p className="text-base text-muted">eCommerce Director, HomeStyle UK</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container text-center">
          <h3 className="mb-lg">
            Ready to <span className="text-primary">connect?</span>
          </h3>
          <p className="text-lg text-muted mx-auto max-w-[500px] mb-2xl">
            Let's discuss your integration needs and design a solution that works.
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            <Link to="/contact" className="btn btn-primary justify-center">
              Start a conversation
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/services" className="btn btn-outline justify-center">
              View all services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
