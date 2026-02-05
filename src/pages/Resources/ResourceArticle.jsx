/**
 * ERP Experts Resource Article Page
 * Dynamic, engaging article layout
 */

import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  BookOpen,
  Database,
  Search,
  Settings,
  Link2,
  Sliders,
  Wrench,
  GraduationCap,
  Lightbulb,
  HelpCircle,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Zap,
  BarChart3,
  Cloud,
  Target,
} from "lucide-react";
import SEO from "../../components/ui/SEO";
import TrackedLink from "../../components/ui/TrackedLink";
import erpWorkForYouHero from "../../assets/521dfd_8d98556467bd405188ecbb172caa3b1f~mv2.png.jpeg";
import erpImplementationHero from "../../assets/521dfd_d357dbfbc21d409792ca92d69250c49a~mv2.webp";
const erpImplementationSecondary = erpImplementationHero; // Use same image as fallback
import {
  Users,
  ClipboardCheck,
  Handshake,
  TestTube,
  HeadphonesIcon,
  Award,
  Eye,
  BarChart2,
  PiggyBank,
  Bot,
  FileSpreadsheet,
} from "lucide-react";

// Articles data
const articles = {
  "streamlining-your-netsuite-experience": {
    title: "Streamlining Your NetSuite Experience",
    subtitle: "Essential Tips for Growing Businesses",
    date: "Jul 4, 2025",
    readTime: "3 min read",
    type: "Guide",
    layoutVariant: 1,
    heroImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=80",
    intro:
      "Getting the most out of NetSuite requires regular attention and smart optimisation. Whether you're new to the platform or a seasoned user, these essential tips will help keep your system running smoothly and efficiently.",

    // Key takeaways for the sidebar
    takeaways: [
      "Clean data = faster system",
      "Optimise saved searches",
      "Simplify scripts & workflows",
      "Manage integrations carefully",
      "Use built-in performance settings",
    ],

    // Main tips
    tips: [
      {
        number: "01",
        icon: Database,
        title: "Clean Up and Organise Your Data",
        content:
          "Regularly cleaning up your data is crucial for keeping NetSuite running smoothly. By removing outdated records, merging duplicates, and adhering to standard naming conventions, you can significantly improve system performance and reduce errors.",
        actions: [
          "Merge duplicate records, particularly for customers and suppliers",
          "Use saved searches to identify and inactivate old records",
          "Always back up your data before making changes",
        ],
      },
      {
        number: "02",
        icon: Search,
        title: "Optimise Saved Searches and Reports",
        content:
          "Saved searches and reports are powerful tools, but if not set up correctly, they can slow down your system. Use 'starts with' or 'has keywords' instead of 'contains' - these are less demanding on the system.",
        actions: [
          "Schedule heavy searches to run in the background",
          "Limit the date range in your searches",
          "Avoid including system notes unless absolutely necessary",
        ],
      },
      {
        number: "03",
        icon: Settings,
        title: "Review and Simplify Scripts and Workflows",
        content:
          "Custom scripts and workflows can automate your business processes, but having too many or overly complicated ones can hinder NetSuite's performance. Regularly review your scripts and eliminate those that are no longer needed.",
        actions: [
          "Use automation for repetitive tasks like invoicing",
          "Streamline workflows to keep them simple and efficient",
          "Regularly audit and remove unused scripts",
        ],
      },
      {
        number: "04",
        icon: Link2,
        title: "Manage Integrations Carefully",
        content:
          "If you utilise integrations with other systems, it's essential to monitor how frequently they update NetSuite and what data they transfer. Excessive updates or unnecessary data transfers can slow down your system.",
        actions: [
          "Batch updates whenever possible",
          "Remove integrations you no longer use",
          "Validate and clean CSV data before importing",
        ],
      },
      {
        number: "05",
        icon: Sliders,
        title: "Adjust Built-in Performance Settings",
        content:
          "NetSuite includes settings that can help improve page load times. You can find these options under Home > Set Preferences in NetSuite.",
        actions: [
          "Set your landing page to your most-used page",
          "Delay the loading of sublists",
          "Reduce rows in list segments and dropdown entries",
        ],
      },
    ],

    // Bonus tips for the grid
    bonusTips: [
      {
        icon: Wrench,
        title: "Regular Maintenance",
        content:
          "Just like any system, NetSuite requires regular attention to keep it running at peak performance.",
      },
      {
        icon: GraduationCap,
        title: "Team Training",
        content:
          "Ensure your team understands how to use NetSuite effectively through regular training sessions.",
      },
      {
        icon: Lightbulb,
        title: "Stay Updated",
        content:
          "NetSuite frequently releases updates. Check the blog and community forums for the latest tips.",
      },
      {
        icon: HelpCircle,
        title: "Get Expert Help",
        content:
          "Don't hesitate to reach out to NetSuite specialists who can provide tailored solutions.",
      },
    ],

    // Section headings
    overviewHeading: 'Why NetSuite <span class="text-primary">Optimisation</span>&nbsp;Matters',
    overviewSubtext:
      "From data hygiene to performance settings, we'll cover the essential practices that separate a sluggish system from one that truly empowers your team.",
    tipsHeading: '5 Ways to Optimise <span class="text-primary">Your&nbsp;NetSuite</span>',

    conclusion:
      "A well-maintained system not only improves performance but also contributes to sustainable growth. Start with one tip and work your way through.",

    disclaimer:
      "Always test changes in a safe environment before applying them to your live system, and ensure you have proper backups.",
  },

  "your-erp-system-should-work-for-you": {
    title: "Your ERP System Should Work For You",
    subtitle: "Not Against You",
    date: "Nov 11, 2025",
    readTime: "2 min read",
    type: "Article",
    layoutVariant: 2,
    heroImage: erpWorkForYouHero,
    featureImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
    challengeLabel: "The Problem",
    challengeHeading: 'When Systems Become a&nbsp;<span class="text-primary">Burden</span>',
    challengeText:
      "Many businesses reach a point where spreadsheets, disconnected tools, and manual workarounds stop being helpful. Teams waste time searching for information, making decisions based on outdated data, and firefighting avoidable problems.",
    intro:
      "Growing a business is exciting, but outdated systems can quietly drain your energy and slow down your progress. You deserve technology that keeps up with your ambitions, not something that holds you back.",

    takeaways: [
      "Outdated systems drain energy",
      "89% report major efficiency gains",
      "30% ROI increase in 3 years",
      "70% reduction in manual errors",
      "Systems should scale with you",
    ],

    tips: [
      {
        number: "01",
        icon: AlertTriangle,
        title: "When Systems Become the Problem",
        content:
          "Many businesses reach a point where spreadsheets, disconnected tools, and manual workarounds stop being helpful. Teams waste time searching for information, making decisions based on outdated data, and firefighting avoidable problems.",
        actions: [
          "Real-time insights get lost in chaos",
          "Inventory becomes guesswork",
          "Growth feels like an uphill battle",
        ],
      },
      {
        number: "02",
        icon: Zap,
        title: "What Happens When You Get It Right",
        content:
          "Business transformation is not just about installing new software, it is about changing how your entire business operates. When you implement an ERP system properly, the benefits are tangible.",
        actions: [
          "89% of users report major efficiency improvements",
          "30% increase in ROI within three years",
          "70% drop in manual errors",
        ],
      },
      {
        number: "03",
        icon: BarChart3,
        title: "A Single Version of the Truth",
        content:
          "Everyone in your business works from the same real-time data, making collaboration smoother and decisions faster. Inventory becomes precise rather than guesswork. Financial reporting happens quickly instead of dragging on for days.",
        actions: [
          "Your team stops wrestling with systems",
          "Focus shifts to driving growth",
          "Decisions are based on real-time data",
        ],
      },
      {
        number: "04",
        icon: Cloud,
        title: "Built to Grow With You",
        content:
          "The right ERP solution scales as your business grows. Whether you are expanding into new markets, increasing product lines, or tripling your headcount, your system adapts without needing a complete overhaul.",
        actions: [
          "Cloud-based platforms offer flexibility and security",
          "Access your business data from anywhere",
          "Add modules as you need them - CRM, manufacturing, e-commerce",
        ],
      },
      {
        number: "05",
        icon: Target,
        title: "Make Growth Inevitable",
        content:
          "Stop believing that more effort will fix broken systems. The companies that thrive are the ones that invest in technology designed to eliminate bottlenecks, automate repetitive tasks, and provide clarity when it matters most.",
        actions: [
          "Systems should free up capacity, not consume it",
          "Eliminate bottlenecks and automate repetitive tasks",
          "When you get this right, growth becomes inevitable",
        ],
      },
    ],

    bonusTips: [
      {
        icon: TrendingUp,
        title: "Real Results",
        content:
          "Companies like Eco2Solar and Totalkare transformed their operations and unlocked new growth.",
      },
      {
        icon: Zap,
        title: "Efficiency Gains",
        content:
          "Modern ERP systems deliver measurable improvements in speed, accuracy, and team productivity.",
      },
      {
        icon: Cloud,
        title: "Cloud Flexibility",
        content:
          "Access your data anywhere, scale on demand, and stay secure with cloud-based platforms.",
      },
      {
        icon: Target,
        title: "Future-Proof",
        content:
          "Build a system that grows with you, adding capabilities as your business evolves.",
      },
    ],

    // Section headings
    overviewHeading: 'Technology Should <span class="text-primary">Empower&nbsp;You</span>',
    overviewSubtext:
      "This is exactly what companies like Eco2Solar and Totalkare experienced before their transformation. Their old systems created frustration, limited capacity, and made scaling feel impossible.",
    tipsHeading: 'From Problem to <span class="text-primary">Solution</span>',

    conclusion:
      "Your systems should free up capacity in your business, not consume it. When you get this right, growth stops being a struggle and becomes inevitable.",

    disclaimer:
      "Results vary based on implementation quality and business context. Speak to an expert to understand what's possible for your organisation.",
  },

  "stress-free-erp-implementation": {
    title: "The Ultimate Guide to a Stress-Free ERP Implementation",
    subtitle: "How to make your ERP project a success",
    date: "Jan 24, 2025",
    readTime: "4 min read",
    type: "Guide",
    layoutVariant: 2,
    heroImage: erpImplementationHero,
    featureImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    challengeLabel: "The Challenge",
    challengeHeading: 'Why Implementations <span class="text-primary">Fail</span>',
    challengeText:
      "Horror stories of blown budgets, endless delays, and frustrated teams can make ERP implementation feel more like a nightmare than an opportunity. But with the right partner and approach, it doesn't have to be that way.",
    intro:
      "ERP implementation often gets a bad reputation. Horror stories of blown budgets, endless delays, and frustrated teams can make the process feel more like a nightmare than an opportunity. But it doesn't have to be that way. With the right partner and approach, ERP implementation can be smooth, efficient, and - dare we say - even enjoyable.",

    takeaways: [
      "Start with a solid plan",
      "Choose the right partner",
      "Engage your team early",
      "Test thoroughly before go-live",
      "Prioritise post-go-live support",
    ],

    // Section headings
    overviewHeading: 'Taking the Stress Out of&nbsp;<span class="text-primary">ERP</span>',
    overviewSubtext:
      "Here's how to take the stress out of your ERP implementation and make it a success.",
    tipsHeading: '5 Steps to a Successful <span class="text-primary">Implementation</span>',

    tips: [
      {
        number: "01",
        icon: ClipboardCheck,
        title: "Start with a Solid Plan",
        content:
          "A successful ERP implementation begins long before the system goes live. It starts with careful planning and a clear understanding of your business goals. What do you want the ERP to achieve? What pain points are you solving? Identifying these from the outset helps ensure every step of the process is aligned with your objectives.",
        actions: [
          "Create a detailed timeline with realistic milestones",
          "Build a clear list of requirements for the ERP system",
          "Get buy-in from key stakeholders across departments",
        ],
      },
      {
        number: "02",
        icon: Handshake,
        title: "Choose the Right Partner",
        content:
          "Your ERP partner can make or break your implementation. The right partner will bring not just technical expertise but also industry experience and a deep understanding of your business needs. Look for a team that listens, communicates clearly, and has a proven track record of successful implementations.",
        actions: [
          "Look for industry experience and technical expertise",
          "Ensure they offer strong post-implementation support",
          "Choose a partner who becomes an extension of your team",
        ],
      },
      {
        number: "03",
        icon: Users,
        title: "Engage Your Team Early",
        content:
          "ERP systems touch almost every part of your business, so it's critical to involve your team from the start. Their input is invaluable during the configuration process - they're the ones who interact with existing systems daily, and their insights can highlight inefficiencies or opportunities you might overlook.",
        actions: [
          "Build enthusiasm and reduce resistance to change",
          "Identify potential challenges or roadblocks early",
          "Invest in training to empower confident adoption",
        ],
      },
      {
        number: "04",
        icon: TestTube,
        title: "Test, Test, and Test Again",
        content:
          "No ERP system is perfect out of the box. That's why thorough testing is essential. From user acceptance testing to real-world scenarios, every aspect of the system should be put through its paces before go-live. Involve end-users in testing - their feedback can highlight usability issues or gaps that need addressing.",
        actions: [
          "Identify and fix issues before they reach production",
          "Simulate critical business processes and edge cases",
          "Build confidence in the new system across the team",
        ],
      },
      {
        number: "05",
        icon: HeadphonesIcon,
        title: "Prioritise Post-Go-Live Support",
        content:
          "Go-live isn't the end - it's the beginning of your ERP journey. Having a solid post-implementation support plan is critical to addressing any teething issues and ensuring your system delivers long-term value. Monitor system performance and user adoption to catch problems early.",
        actions: [
          "Address teething issues quickly and effectively",
          "Regular health checks and ongoing optimisation",
          "Ensure your ERP grows and adapts with your business",
        ],
      },
    ],

    bonusTips: [
      {
        icon: Target,
        title: "A Clear Plan",
        content: "We start with your goals and map out every step of the process.",
      },
      {
        icon: Award,
        title: "Experienced Partners",
        content:
          "Our team brings the expertise and real-world insights needed for a smooth implementation.",
      },
      {
        icon: HeadphonesIcon,
        title: "Proactive Support",
        content: "From go-live to beyond, we're here to keep your system running at its best.",
      },
      {
        icon: TrendingUp,
        title: "Business Transformation",
        content: "We prioritise your goals, your team, and your long-term success.",
      },
    ],

    conclusion:
      "ERP implementation doesn't have to be stressful. We understand that ERP implementation is more than just a technical project - it's a business transformation. That's why we prioritise your goals, your team, and your long-term success.",

    disclaimer:
      "Every implementation is unique. Speak to our team to understand how we can tailor our approach to your specific needs.",
  },

  "spreadsheet-hidden-costs": {
    title: "The Hidden Costs of Spreadsheets",
    subtitle: "Why Your Spreadsheets Are Holding You Back",
    date: "2024",
    readTime: "3 min read",
    type: "Guide",
    layoutVariant: 3,
    heroImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&q=80",
    featureImage: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80",
    intro:
      "Spreadsheets have long served as the backbone for financial and operational reporting, scenario modeling, and data tracking. Yet, as ERP data requirements expand and business environments grow more complex, spreadsheets reveal their limitations, introducing hidden costs that can impact productivity, accuracy, and decision-making.",

    takeaways: [
      "Spreadsheets create data silos",
      "Manual data handling causes errors",
      "Limited ROI from data investments",
      "Can't leverage AI effectively",
      "ERP provides a single source of truth",
    ],

    // Section headings
    overviewHeading: 'Where Spreadsheets <span class="text-primary">Fall&nbsp;Short</span>',
    overviewSubtext:
      "Here are four critical areas where spreadsheets fall short as an ERP intelligence tool, and how an advanced ERP solution can transform these challenges into advantages.",
    tipsHeading: 'The Hidden Costs of <span class="text-primary">Spreadsheets</span>',

    tips: [
      {
        number: "01",
        icon: Eye,
        title: "Clear Business Visibility",
        content:
          "In today's data-driven world, business decisions require comprehensive, real-time visibility across all operations. Relying on spreadsheets often restricts this visibility, creating data silos and inconsistencies between departments. When sales, finance, and inventory management each maintain separate spreadsheets, these disparate data sources lead to fragmented reporting and decision-making based on outdated information.",
        actions: [
          "ERP provides centralised, real-time dashboards",
          "Automated data integration eliminates inconsistencies",
          "Cross-departmental alignment optimises processes",
        ],
      },
      {
        number: "02",
        icon: BarChart2,
        title: "High Data Utilisation",
        content:
          "Data is one of the most valuable assets a business has, yet relying solely on spreadsheets means this asset is often underutilised. Managing data with spreadsheets requires extensive manual effort (joining, cleaning, and consolidating data) that slows down decision-making and opens the door to costly errors.",
        actions: [
          "ERP automates data integration from all sources",
          "Efficient handling of large datasets without slowdown",
          "Enhanced data governance prevents version conflicts",
        ],
      },
      {
        number: "03",
        icon: PiggyBank,
        title: "Realising ROI from Data Investments",
        content:
          "Investments in data and analytics are on the rise, as companies understand the competitive edge that informed insights can offer. However, spreadsheets limit the potential of these investments, constraining complex analytics and real-time collaboration. When data handling consumes valuable employee hours, there's less time to extract actionable insights.",
        actions: [
          "ERP improves data accessibility for all users",
          "Unified customer insights across touchpoints",
          "Operational agility to respond to market shifts",
        ],
      },
      {
        number: "04",
        icon: Bot,
        title: "Gaining a Competitive Edge with AI",
        content:
          "Artificial Intelligence is transforming how businesses analyse data, make decisions, and stay competitive. While spreadsheets can support basic analyses, they cannot match the speed, scale, and accuracy required to leverage AI effectively. Spreadsheets lack the connectivity and built-in capabilities needed for predictive insights.",
        actions: [
          "AI-powered ERP automates data collection and analysis",
          "Enhanced forecasting with historical and real-time data",
          "Predictive insights to adjust strategies quickly",
        ],
      },
    ],

    bonusTips: [
      {
        icon: Cloud,
        title: "Real-Time Accessibility",
        content:
          "With cloud ERP, data is accessible from anywhere, allowing remote teams to stay informed and make timely decisions.",
      },
      {
        icon: Sliders,
        title: "Configurable Dashboards",
        content:
          "ERP solutions support customisable dashboards with drag-and-drop functionality, simplifying decision-making.",
      },
      {
        icon: TrendingUp,
        title: "Predictive Analytics",
        content:
          "Predictive tools within ERP simplify trend forecasting, helping businesses plan strategically for future growth.",
      },
      {
        icon: Target,
        title: "Self-Service Analytics",
        content:
          "Empower users to build real-time reports and make data-driven choices without extensive IT support.",
      },
    ],

    conclusion:
      "A comprehensive ERP system provides a single source of truth for business data, accessible anytime, anywhere. Moving data to an ERP system ensures that reporting is streamlined, data quality is improved, and insights are instantly available to support faster, smarter decisions.",

    disclaimer:
      "ERP Experts can help your organisation move beyond the limitations of spreadsheets to a scalable, intelligent ERP solution that supports sustainable growth.",
  },
};

export default function ResourceArticle() {
  const { slug } = useParams();
  const article = articles[slug];

  if (!article) {
    return (
      <main id="main-content" className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-hero" style={{ marginBottom: "var(--space-lg)" }}>
            Article not found
          </h1>
          <Link to="/resources" className="btn btn-primary">
            Back to Resources
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content">
      <SEO
        title={article.title}
        description={article.intro}
        path={`/resources/${slug}`}
        keywords="NetSuite tips, NetSuite optimisation, ERP best practices, NetSuite performance"
      />

      {/* Hero - Similar to case studies */}
      <section className="relative min-h-[45vh] md:min-h-[50vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={article.heroImage} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/40" />
        </div>

        {/* Decorative triangle */}
        <div
          className="absolute bottom-0 right-0 opacity-20 hidden lg:block pointer-events-none"
          style={{
            width: "700px",
            height: "600px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(20%)",
          }}
        />

        <div className="container relative z-20 pt-(--space-4xl)">
          <Link
            to="/resources"
            className="inline-flex items-center gap-sm px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors mb-xl font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </Link>

          <div style={{ maxWidth: "800px" }}>
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-md mb-lg">
              <span className="inline-flex items-center gap-sm px-4 py-2 rounded-full bg-primary text-white text-sm font-bold">
                <BookOpen className="w-4 h-4" />
                {article.type}
              </span>
              <span className="flex items-center gap-sm text-white/60 text-sm">
                <Calendar className="w-4 h-4" />
                {article.date}
              </span>
              <span className="flex items-center gap-sm text-white/60 text-sm">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading text-white"
              style={{ marginBottom: "var(--space-lg)" }}
            >
              {article.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/70 leading-relaxed max-w-2xl">
              {article.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* In This Guide Bar */}
      <section style={{ backgroundColor: "rgba(230, 48, 125, 0.03)", padding: "2rem 0" }}>
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-lg">
            <div className="flex items-center gap-md">
              <div
                style={{
                  width: "20px",
                  height: "17px",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  backgroundColor: "var(--color-primary)",
                }}
              />
              <span className="text-base font-bold text-primary">In This Guide</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-lg md:gap-xl">
              <div className="flex items-center gap-sm">
                <div className="icon-box icon-box-sm rounded-lg bg-primary/10">
                  <Lightbulb className="w-4 h-4 text-primary" />
                </div>
                <span className="text-base font-medium">{article.tips.length} Key Tips</span>
              </div>
              <div className="flex items-center gap-sm">
                <div className="icon-box icon-box-sm rounded-lg bg-primary/10">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <span className="text-base font-medium">
                  {article.bonusTips.length} Bonus Strategies
                </span>
              </div>
              <div className="flex items-center gap-sm">
                <div className="icon-box icon-box-sm rounded-lg bg-primary/10">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <span className="text-base font-medium">{article.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro + Key Takeaways */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_400px] gap-2xl items-center">
            {/* Intro text */}
            <div>
              <p className="text-label text-primary mb-md">Overview</p>
              <h2 className="mb-lg" dangerouslySetInnerHTML={{ __html: article.overviewHeading }} />
              <p className="text-lg text-muted leading-relaxed mb-lg">{article.intro}</p>
              <p className="text-lg text-muted leading-relaxed">{article.overviewSubtext}</p>
            </div>

            {/* Key takeaways box */}
            <div className="bg-primary/5 rounded-2xl p-xl border border-primary/10">
              <p className="text-label text-primary mb-lg">Quick Wins</p>
              <ul className="flex flex-col gap-md">
                {article.takeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-center gap-md">
                    <div
                      className="shrink-0"
                      style={{
                        width: "24px",
                        height: "21px",
                        clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                        backgroundColor: "var(--color-primary)",
                      }}
                    />
                    <span className="text-base font-medium">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Image - for layout variants 2 and 3 */}
      {article.featureImage && (
        <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-2xl items-center">
              {article.layoutVariant === 2 ? (
                <>
                  <div className="rounded-2xl overflow-hidden">
                    <img
                      src={article.featureImage}
                      alt=""
                      loading="lazy"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-label text-primary mb-md">
                      {article.challengeLabel || "The Challenge"}
                    </p>
                    <h3
                      className="mb-lg"
                      dangerouslySetInnerHTML={{
                        __html:
                          article.challengeHeading ||
                          'Why This <span class="text-primary">Matters</span>',
                      }}
                    />
                    <p className="text-lg text-muted leading-relaxed">
                      {article.challengeText || article.overviewSubtext}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-label text-primary mb-md">The Solution</p>
                    <h3 className="mb-lg">
                      There's a <span className="text-primary">Better Way</span>
                    </h3>
                    <p className="text-lg text-muted leading-relaxed">
                      A comprehensive ERP system provides a single source of truth for business
                      data, accessible anytime, anywhere. Moving data to an ERP system ensures that
                      reporting is streamlined, data quality is improved, and insights are instantly
                      available.
                    </p>
                  </div>
                  <div className="rounded-2xl overflow-hidden">
                    <img
                      src={article.featureImage}
                      alt=""
                      loading="lazy"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Tips */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">The Essentials</p>
            <h2 dangerouslySetInnerHTML={{ __html: article.tipsHeading }} />
          </div>

          <div className="grid gap-lg">
            {article.tips.map((tip, i) => (
              <div
                key={i}
                className="grid md:grid-cols-[100px_1fr_1fr] gap-lg md:gap-xl items-start p-lg md:p-xl rounded-2xl border border-(--color-text)/5 hover:border-primary/20 transition-colors"
              >
                {/* Number */}
                <div className="flex md:flex-col items-center gap-md">
                  <span className="text-4xl md:text-5xl font-heading font-bold text-primary/15">
                    {tip.number}
                  </span>
                  <div className="icon-box icon-box-lg rounded-xl bg-primary/10 md:mt-sm">
                    <tip.icon className="w-7 h-7 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h4 className="mb-md">{tip.title}</h4>
                  <p className="text-lg text-muted leading-relaxed">{tip.content}</p>
                </div>

                {/* Actions */}
                <div className="bg-(--color-text)/[0.02] rounded-xl p-lg">
                  <p className="text-base font-bold text-primary mb-md">Action Items</p>
                  <ul className="flex flex-col gap-md">
                    {tip.actions.map((action, j) => (
                      <li key={j} className="flex items-start gap-sm">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-base text-muted">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="section-padding-lg border-t border-(--color-text)/10 relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1400&q=80"
            alt=""
            loading="lazy"
            className="w-full h-full object-cover opacity-[0.12]"
          />
        </div>

        {/* Large decorative triangle on left - part of background overlay */}
        <div
          className="absolute left-0 bottom-0 -translate-x-1/4 hidden lg:block"
          style={{
            width: "700px",
            height: "606px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            opacity: 0.08,
          }}
        />
        {/* Smaller solid triangle overlapping */}
        <div
          className="absolute left-[120px] bottom-[80px] hidden lg:block"
          style={{
            width: "220px",
            height: "190px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            opacity: 0.9,
          }}
        />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            {/* Left side - spacer for visual balance on desktop */}
            <div className="hidden lg:block" />

            {/* Right side - content */}
            <div>
              <p className="text-label text-primary mb-md">The Bottom Line</p>
              <h3 className="mb-lg">
                Ready to <span className="text-primary">Take Action</span>?
              </h3>
              <p className="text-xl text-muted leading-relaxed mb-lg">{article.conclusion}</p>
              <p className="text-sm text-muted/50 italic">{article.disclaimer}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bonus Tips */}
      <section
        className="section-padding-lg"
        style={{ backgroundColor: "rgba(230, 48, 125, 0.03)" }}
      >
        <div className="container">
          <div className="text-center mb-2xl">
            <p className="text-label text-primary mb-md">Bonus Tips</p>
            <h3>
              Keep the Momentum <span className="text-primary">Going</span>
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {article.bonusTips.map((tip, i) => (
              <div key={i} className="bg-white rounded-xl p-lg">
                <div className="icon-box icon-box-md rounded-xl bg-primary/10 mb-md">
                  <tip.icon className="w-5 h-5 text-primary" />
                </div>
                <h5 style={{ marginBottom: "var(--space-sm)" }}>{tip.title}</h5>
                <p className="text-sm text-muted">{tip.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="rounded-2xl md:rounded-3xl overflow-hidden relative">
            {/* Background */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, #a01d5a 100%)",
              }}
            />
            {/* Decorative triangles */}
            <div
              className="absolute top-0 left-0 opacity-10 hidden md:block"
              style={{
                width: "250px",
                height: "215px",
                clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                backgroundColor: "white",
                transform: "translateX(-60px) translateY(-60px)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 opacity-10 hidden md:block"
              style={{
                width: "300px",
                height: "260px",
                clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                backgroundColor: "white",
                transform: "translateX(80px) translateY(80px)",
              }}
            />

            <div className="relative z-10 p-xl md:p-2xl">
              <div className="grid md:grid-cols-[1fr_auto] gap-xl items-center">
                <div>
                  <h3 className="text-white mb-sm">Need help optimising your NetSuite?</h3>
                  <p className="text-white/70 text-base">
                    Our team can help you implement these tips and more.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-md">
                  <TrackedLink
                    to="/contact"
                    trackingName="resource_article_contact"
                    trackingPage="resource-article"
                    className="btn btn-lg justify-center bg-white text-primary hover:scale-105 transition-transform"
                  >
                    Talk to an expert
                    <ArrowRight className="w-5 h-5" />
                  </TrackedLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
