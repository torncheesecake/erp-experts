import phocasLogo from "../assets/phocas-logo.svg";
import shiptheoryLogoBlue from "../assets/shiptheory-logo-blue.png";

/**
 * Single source of truth for all partner data.
 * Both the listing page and detail pages import from here.
 */

export const partners = {
  shiptheory: {
    slug: "shiptheory",
    name: "Shiptheory",
    tagline: "Shipping Automation for NetSuite",
    industry: "Shipping & Fulfilment Automation",
    color: "#0C8CE9",
    darkColor: "#0A4D8C",
    description:
      "5* rated SuiteApp with 100+ global carrier integrations to help you ship faster and save hours every day.",
    cardImage: "https://shiptheory.com/wp-content/uploads/2023/12/label_printer_st.png",
    heroImage:
      "https://shiptheory.com/wp-content/uploads/2025/02/Miami_Sunset_45863661094-2048x1152.jpg",
    logoUrl: shiptheoryLogoBlue,
    logoStyle: "light",
    website:
      "https://shiptheory.com/?utm_source=landingpage&utm_medium=partnersend&utm_campaign=erp_expert_launch&utm_content=erp_expert_siteclick",
    ctaUrl:
      "https://helm.shiptheory.com/register?utm_source=landingpage&utm_medium=partnersend&utm_campaign=erp_expert_launch&utm_content=erp_expert_signup",
    ctaLabel: "Get started with Shiptheory",
    intro:
      "What if you could remove the limitations in your current shipping setup? Shiptheory gives you native, direct NetSuite integration as an SDN partner, with automation rules that support different logic per carrier. With 100+ global carrier integrations, a 5* rated SuiteApp, and extensive customer support backed by dedicated consultants, teams can ship faster while reducing manual fulfilment work.",
    stats: [
      { value: "5*", label: "Rated SuiteApp" },
      { value: "100+", label: "Global carrier integrations" },
      { value: "SDN", label: "Native NetSuite partner integration" },
      { value: "Dedicated", label: "Consultants and customer support" },
    ],
    brands: [
      {
        name: "Automation & Integration",
        description:
          "Automate shipment booking, label generation, and fulfilment updates from NetSuite and connected commerce channels with rules-based workflows.",
      },
      {
        name: "Returns & Shipping Metrics",
        description:
          "Manage returns and monitor shipping performance in one platform, helping teams improve delivery experience while reducing operational friction.",
      },
    ],
    industries: [
      "E-commerce",
      "Wholesale Distribution",
      "Retail",
      "Consumer Goods",
      "Subscription Commerce",
      "Multi-channel Fulfilment",
    ],
    locations: [{ city: "Bristol, UK" }, { city: "Miami, US" }],
    sections: [
      {
        title: "Native NetSuite Integration as an SDN Partner",
        content:
          "Shiptheory integrates directly with NetSuite and operates as an SDN partner, so shipping workflows stay close to your core ERP process. Automatic shipment booking, label printing, and fulfilment updates reduce manual handoffs and keep dispatch reliable.",
      },
      {
        title: "100+ Global Carrier Integrations",
        content:
          "Shiptheory supports a broad carrier ecosystem, helping teams standardise shipping across regions while still applying custom logic per carrier. Routing by service, destination, and order profile keeps operations consistent even in mixed delivery environments.",
      },
      {
        title: "5* SuiteApp with Dedicated Support",
        content:
          "The platform is backed by extensive customer support and dedicated consultants, giving teams practical help from setup through optimisation. Combined with ERP Experts, clients get a delivery model that aligns NetSuite design and shipping automation from day one.",
      },
    ],
  },
  phocas: {
    slug: "phocas",
    name: "Phocas",
    tagline: "Business Planning & Analytics",
    industry: "Business Intelligence",
    color: "#1a1a2e",
    darkColor: "#0f0f1a",
    description:
      "Data analytics and business planning platform that turns complex NetSuite data into clear, actionable insights. 2,900+ businesses trust Phocas worldwide.",
    cardImage:
      "https://www.phocassoftware.com/hs-fs/hubfs/phocas-velocity/images/home/how-we-help-performance-insights.png?width=720&name=how-we-help-performance-insights.png",
    heroImage:
      "https://www.phocassoftware.com/hs-fs/hubfs/phocas-velocity/images/about/team-hero.png?width=616&height=449&name=team-hero.png",
    logoUrl: phocasLogo,
    logoStyle: "light",
    website: "https://www.phocassoftware.com",
    intro:
      "Phocas is a business planning and analytics platform purpose-built for companies running ERP systems. Unlike generic BI tools, Phocas understands the data structures and reporting needs of mid-market manufacturers, distributors, and retailers. It connects directly to NetSuite, consolidating financial, sales, inventory, and operational data into one intuitive platform where teams can explore data, build dashboards, and uncover insights without relying on spreadsheets or IT support.",
    stats: [
      { value: "2,900+", label: "Businesses worldwide" },
      { value: "97%", label: "Year-over-year retention" },
      { value: "10+", label: "Years as Built for NetSuite partner" },
      { value: "4.8/5", label: "Rating on Capterra" },
    ],
    brands: [
      {
        name: "Analytics & Insights",
        description:
          "Consolidate data from multiple sources into one platform. Drill into the numbers, spot trends, and surface sales opportunities and risks with AI-powered analysis — no SQL or technical expertise required.",
      },
      {
        name: "Financial Planning",
        description:
          "Automate P&L, balance sheet, and cash flow reporting. Build rolling forecasts, model scenarios, and track rebate profitability — all with instant drill-through to transaction-level detail.",
      },
    ],
    industries: [
      "Wholesale Distribution",
      "Manufacturing",
      "Retail",
      "Building & Industrial",
      "Automotive",
      "Food & Beverage",
    ],
    sections: [
      {
        title: "Purpose-Built for ERP Users",
        content:
          "Phocas is designed specifically for businesses running ERP systems like NetSuite. It understands the data structures, the reporting needs, and the challenges that finance and operations teams face every day. That means faster setup, more relevant insights, and a tool your team will actually use. Implementation takes weeks, not the 1-2 years typical of enterprise BI platforms.",
      },
      {
        title: "Self-Service, No SQL Required",
        content:
          "Your finance, sales, and operations teams can explore data their way — drilling through levels, building custom views, and creating reports without waiting for IT or writing a single line of code. Phocas makes complex data simple and accessible to everyone who needs it.",
      },
      {
        title: "Better Together with ERP Experts",
        content:
          "As a Phocas partner, ERP Experts helps you get the most from both NetSuite and Phocas. From initial configuration to advanced dashboard design, we ensure the two platforms work together to deliver the visibility and insight your business needs to grow. If your NetSuite data is good but your reporting isn't keeping up, Phocas bridges that gap.",
      },
    ],
  },
  "levy-global": {
    slug: "levy-global",
    name: "Levy Global",
    tagline: "Consulting & Staffing",
    industry: "Technology Consulting",
    color: "#1a1a2e",
    darkColor: "#0f0f1a",
    description:
      "Global consulting and staffing firm delivering expert project professionals and permanent talent across technology and business sectors since 2000.",
    cardImage: "https://levy-global.com/wp-content/uploads/levy-global.jpg",
    heroImage: "https://levy-global.com/wp-content/uploads/Levy-Images16.png",
    logoUrl: "https://levy-global.com/wp-content/uploads/Levy-Logo-02.png",
    logoStyle: "dark",
    brandLogos: {
      professionals: "https://levy-global.com/wp-content/uploads/levy-professionals-dark.png",
      search: "https://levy-global.com/wp-content/uploads/levy-search-dark.png",
    },
    website: "https://levy-global.com",
    intro:
      "Established in 2000, Levy Global is a premier consulting and staffing firm with offices in London, Amsterdam, and the USA. Through their two specialist brands - Levy Professionals and Levy Search - they deliver expert consulting, project management, technical staffing, and permanent recruitment across technology-focused sectors. Their focus on the intersection of business and technology makes them an ideal partner for organisations undertaking ERP transformation projects.",
    stats: [
      { value: "25+", label: "Years in business" },
      { value: "3", label: "Global offices" },
      { value: "2", label: "Specialist brands" },
    ],
    brands: [
      {
        name: "Levy Professionals",
        description:
          "Expert consulting, project management, and technical staffing. Full project delivery under Statement of Work, freelance services, and secondments. When you need a team to deliver, not just fill seats.",
      },
      {
        name: "Levy Search",
        description:
          "Permanent recruitment specialising in technology and sales sectors. Expanding operations across Europe, Germany, and the US. Finding the right people for the long term.",
      },
    ],
    industries: [
      "Finance",
      "MedTech",
      "Consumer Goods",
      "Energy",
      "Travel & Aviation",
      "Telecommunications",
    ],
    locations: [
      { city: "London", phone: "+44 20 8157 9444" },
      { city: "Amsterdam", phone: "+31 20 3630 025" },
      { city: "USA", phone: "+1 212 456 7890" },
    ],
    sections: [
      {
        title: "Technology Meets Business",
        content:
          "Levy Global operates at the intersection of business and technology. Their consultants and project professionals bring deep domain expertise alongside technical capability, which is exactly what complex ERP and digital transformation projects demand. They do not just provide people, they provide the right people who understand both the technology and the business context.",
      },
      {
        title: "Flexible Engagement Models",
        content:
          "Whether you need a single specialist consultant, a full project team under a Statement of Work, or permanent hires to build your internal capability, Levy Global has a delivery model that fits. Their freelance, secondment, and SOW services give organisations the flexibility to scale expertise up or down as projects evolve.",
      },
      {
        title: "Partnering with ERP Experts",
        content:
          "ERP Experts partners with Levy Global to ensure our clients have access to the specialist talent needed for successful NetSuite implementations and transformations. When projects need additional resource, whether that is project managers, business analysts, or technical consultants, Levy Global delivers the calibre of professional that complex ERP work demands.",
      },
    ],
  },
};

// Ordered list of partner slugs for the listing page
export const partnerOrder = ["shiptheory", "phocas", "levy-global"];

// Derived list for the listing page
export const partnersList = partnerOrder.map((slug) => {
  const p = partners[slug];
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    industry: p.industry,
    description: p.description,
    image: p.cardImage,
    logoUrl: p.logoUrl || null,
    logoStyle: p.logoStyle || "light",
    color: p.color,
  };
});
