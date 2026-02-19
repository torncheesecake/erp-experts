/**
 * Single source of truth for all resource article data.
 * Both the listing page and article detail pages import from here.
 */

import {
  Database,
  Search,
  Settings,
  Link2,
  Sliders,
  Wrench,
  GraduationCap,
  Lightbulb,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Zap,
  BarChart3,
  Cloud,
  Target,
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
  MessageSquare,
  Ear,
  LineChart,
  Presentation,
} from "lucide-react";

import erpWorkForYouHero from "../assets/521dfd_8d98556467bd405188ecbb172caa3b1f~mv2.png.jpeg";
import erpImplementationHero from "../assets/521dfd_d357dbfbc21d409792ca92d69250c49a~mv2.webp";

export const articles = {
  "is-netsuite-right-for-your-business": {
    title: "Is NetSuite Right for Your Business?",
    subtitle: "A Practical Evaluation Guide for Growing Organisations",
    cardDescription:
      "An honest look at whether NetSuite fits your organisation. No sales pitch, just practical questions, real trade-offs, and the evaluation steps that actually matter.",
    date: "Feb 2026",
    readTime: "5 min read",
    type: "Guide",
    layoutVariant: 2,
    heroImage: "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=1400&q=80",
    featureImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
    challengeLabel: "The Real Question",
    challengeHeading: 'Cutting Through the <span class="text-primary">Sales Pitch</span>',
    challengeText:
      "Every ERP vendor will tell you their platform is the perfect fit. The truth is more nuanced. NetSuite is a powerful platform, but it is not the right solution for every organisation. Making the wrong choice means wasted budget, frustrated teams, and a painful migration you did not need. This guide helps you evaluate honestly whether NetSuite aligns with your business needs, your budget, and your growth trajectory.",
    intro:
      "Choosing an ERP system is one of the most consequential technology decisions a growing business will make. It touches every department, reshapes your processes, and locks you into an ecosystem for years. Yet most of the information available is written by people trying to sell you something. This guide takes a different approach. We will walk you through the practical questions, honest trade-offs, and real-world considerations that should inform your decision. Think of it as the conversation you would have with a knowledgeable friend over a coffee, not a sales presentation.",

    takeaways: [
      "Know when you have outgrown spreadsheets",
      "Understand where NetSuite truly excels",
      "Ask the right questions during sales",
      "Set realistic implementation expectations",
      "Evaluate partners before you commit",
    ],

    overviewHeading: 'Making the Right <span class="text-primary">Decision</span>',
    overviewSubtext:
      "A poor ERP choice costs far more than money. It costs time, morale, and competitive advantage. The organisations that get this right are the ones that invest in honest evaluation before they sign anything. Here is what that evaluation should look like.",
    tipsHeading: '5 Steps to an Honest <span class="text-primary">Evaluation</span>',

    tips: [
      {
        number: "01",
        icon: AlertTriangle,
        title: "Signs You Have Outgrown Your Current Systems",
        content:
          "Before evaluating any new platform, be honest about whether you actually need one. If your team regularly works around your systems rather than with them, that is a strong signal. Common warning signs include maintaining critical business data across multiple disconnected spreadsheets, manually re-keying data between systems, and finding that month-end close takes days rather than hours. If your finance team spends more time gathering data than analysing it, or if you cannot get a reliable, real-time picture of inventory or cash flow, you have likely outgrown your current setup.",
        actions: [
          "List the workarounds your team uses daily",
          "Calculate time spent on manual data transfers each month",
          "Identify decisions delayed by lack of real-time data",
        ],
      },
      {
        number: "02",
        icon: Target,
        title: "Where NetSuite Excels and Where It Does Not",
        content:
          "NetSuite is genuinely strong for mid-market organisations that need unified financials, inventory, and CRM in a single cloud platform. It handles multi-entity, multi-currency, and multi-country operations well, and its SuiteCloud platform allows meaningful customisation. However, it is not the best fit for every scenario. Very small businesses may find it over-engineered and expensive for their needs. Organisations with highly specialised manufacturing or field service requirements may find that industry-specific platforms serve them better. And if your business runs almost entirely on project-based billing, dedicated PSA tools might be a more natural fit.",
        actions: [
          "Map your core requirements against NetSuite's native strengths",
          "Identify any niche needs that may require specialist software",
          "Consider whether your organisation's complexity justifies the investment",
        ],
      },
      {
        number: "03",
        icon: Search,
        title: "Questions to Ask During the Sales Process",
        content:
          "The sales process is your best opportunity to gather honest information, but only if you ask the right questions. Do not just ask for a demo of the features you want. Ask to see the features you are worried about. Request references from organisations of a similar size and industry, and actually call them. Ask your sales representative directly: where do customers most commonly struggle with NetSuite? A good salesperson will give you a straight answer. Also ask about the total cost of ownership, including licence fees, implementation costs, ongoing support, and any third-party integrations you will need. The licence fee is rarely the full picture.",
        actions: [
          "Request references from businesses similar to yours in size and sector",
          "Ask for a total cost of ownership breakdown, not just licence fees",
          "Ask the vendor where their platform is weakest for your use case",
        ],
      },
      {
        number: "04",
        icon: ClipboardCheck,
        title: "Setting Realistic Implementation Expectations",
        content:
          "Implementation timelines are one of the most common sources of frustration. A typical mid-market NetSuite implementation takes between three and six months, not the few weeks some vendors imply. The most common cause of delays is not the technology itself but unclear requirements, poor data quality, and insufficient involvement from your own team. Plan for your key people to spend a meaningful portion of their time on the project. Budget for data cleansing before migration. And be realistic about customisation: every custom workflow adds time, cost, and future maintenance overhead. Start with standard processes where you can.",
        actions: [
          "Plan for three to six months, with buffer for data migration",
          "Allocate dedicated time from key staff in each department",
          "Prioritise standard NetSuite processes over custom development",
        ],
      },
      {
        number: "05",
        icon: Handshake,
        title: "How to Evaluate Implementation Partners",
        content:
          "Your implementation partner matters as much as the software itself. Look beyond certifications and ask about their methodology. Do they take time to understand your business before proposing solutions, or do they jump straight to configuration? A good partner will challenge your assumptions and push back when your requests would create unnecessary complexity. Ask about their team structure: will you be working with the same people throughout, or will you be handed off after the sale? Check how they handle post-go-live support. And be wary of any partner who guarantees a fixed timeline before they have properly scoped your requirements.",
        actions: [
          "Ask whether the same team handles scoping, build, and support",
          "Request a detailed methodology document before committing",
          "Confirm their approach to post-go-live support and optimisation",
        ],
      },
    ],

    bonusTips: [
      {
        icon: FileSpreadsheet,
        title: "Document Your Processes",
        content:
          "Before speaking to any vendor, map out your current processes in detail. This gives you a clear baseline and prevents the sales team from defining your requirements for you.",
      },
      {
        icon: Users,
        title: "Involve End Users Early",
        content:
          "The people who will use the system daily often spot practical issues that leadership overlooks. Include them in demos and evaluation sessions from the start.",
      },
      {
        icon: PiggyBank,
        title: "Budget for the Full Journey",
        content:
          "Factor in training, data migration, third-party integrations, and at least twelve months of post-go-live optimisation. The licence cost is typically only a fraction of the total investment.",
      },
      {
        icon: TestTube,
        title: "Run a Proof of Concept",
        content:
          "If possible, ask your shortlisted vendors to demonstrate a specific workflow from your business. A generic demo tells you very little about real-world fit.",
      },
    ],

    conclusion:
      "Choosing an ERP system is a significant commitment, and it deserves more than a rushed decision based on a polished sales presentation. Take the time to evaluate honestly, ask difficult questions, and involve the people who will live with the system every day. If NetSuite is the right fit, that process will confirm it. And if it is not, you will have saved yourself a great deal of time and money. Either way, you will be making a decision grounded in reality rather than hope.",

    disclaimer:
      "This guide reflects our honest experience working with NetSuite implementations. Every organisation is different. Contact ERP Experts for a candid conversation about whether NetSuite is the right fit for your specific situation.",
  },

  "cfo-guide-ai-enhanced-finance": {
    title: "A CFO's Guide to AI-Enhanced Finance",
    subtitle: "Key Areas Where Finance Leaders Harness Artificial Intelligence",
    cardDescription:
      "Discover how NetSuite's AI capabilities can empower your financial leadership, improve operational efficiency, and drive competitive advantage.",
    date: "Feb 2026",
    readTime: "4 min read",
    type: "Guide",
    layoutVariant: 1,
    heroImage: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1400&q=80",
    featureImage: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80",
    challengeLabel: "The Challenge",
    challengeHeading: 'When Decision-Making <span class="text-primary">Can\'t Keep Pace</span>',
    challengeText:
      "Uncertainty demands rapid adjustments, be they tactical tweaks or large strategic shifts. But more than half (57%) of 678 US financial executives polled by PwC as part of its May 2025 Pulse Survey say they can't make decisions fast enough to keep pace with the current level of volatility. As a result, those respondents told PwC they believe they're missing opportunities due to inaction.",
    intro:
      "The technology is here, and finance leaders know AI can help them make faster and more-informed decisions. Will you use it to enhance your financial leadership, improve operational efficiency, and drive a competitive advantage? This guide shows how NetSuite's AI capabilities can empower your financial leadership and drive your organisation's success.",

    takeaways: [
      "AI enables faster decision-making",
      "57% of CFOs can't keep pace with volatility",
      "Revolutionise financial forecasting",
      "Automate time-consuming tasks",
      "Improve collaboration across teams",
    ],

    // Section headings
    overviewHeading: 'AI-Enhanced <span class="text-primary">Financial&nbsp;Leadership</span>',
    overviewSubtext:
      "One answer to today's volatile business environment is artificial intelligence. The CFO Alliance confirms that finance leaders know AI can help them make faster and more-informed decisions. The question is: will you use it to drive competitive advantage?",
    tipsHeading: 'How AI Transforms <span class="text-primary">Finance</span>',

    tips: [
      {
        number: "01",
        icon: TrendingUp,
        title: "Revolutionising Financial Forecasting",
        content:
          "AI is transforming how finance teams approach forecasting and planning. By analysing vast amounts of historical data alongside real-time market indicators, AI enables more accurate predictions and strategic responses to diverse economic scenarios. Finance leaders can model multiple futures simultaneously and prepare for volatility before it hits.",
        actions: [
          "Analyse historical patterns with real-time market data",
          "Model multiple scenarios to prepare for uncertainty",
          "Move from reactive to proactive financial planning",
        ],
      },
      {
        number: "02",
        icon: Users,
        title: "Enhancing Collaboration and Communication",
        content:
          "The finance function doesn't operate in isolation. AI tools help bring teams together by providing a single source of truth that everyone can access. From automated reporting dashboards to intelligent alerts, AI ensures that stakeholders across the organisation stay informed and aligned on financial performance and goals.",
        actions: [
          "Unified dashboards for cross-functional visibility",
          "Automated alerts keep stakeholders informed",
          "Break down silos between finance and operations",
        ],
      },
      {
        number: "03",
        icon: Settings,
        title: "Automating Time-Consuming Tasks",
        content:
          "AI plays a crucial role in business process automation, picking up repetitive, time-consuming tasks and improving accuracy. From invoice processing to expense categorisation, AI frees your finance team to focus on strategic analysis rather than manual data entry. The result is both efficiency gains and improved data quality.",
        actions: [
          "Automate invoice processing and reconciliation",
          "Intelligent expense categorisation and coding",
          "Reduce manual errors and improve data accuracy",
        ],
      },
      {
        number: "04",
        icon: BarChart3,
        title: "Real-Time Performance Insights",
        content:
          "Traditional financial reporting looks backwards. AI-powered analytics deliver real-time insights that enable proactive decision-making. Finance leaders can spot trends, identify anomalies, and surface opportunities as they happen rather than discovering them weeks later in monthly reports.",
        actions: [
          "Real-time KPI monitoring and trend analysis",
          "Anomaly detection surfaces issues early",
          "Shift from backward-looking to forward-thinking",
        ],
      },
      {
        number: "05",
        icon: Target,
        title: "Driving Competitive Advantage",
        content:
          "Organisations that embrace AI in finance gain a significant edge. They can respond faster to market changes, allocate resources more effectively, and make decisions with greater confidence. The competitive gap between AI-enabled finance teams and traditional approaches is widening every day.",
        actions: [
          "Respond faster to market shifts and opportunities",
          "Optimise resource allocation with data-driven insights",
          "Build confidence in strategic decision-making",
        ],
      },
    ],

    bonusTips: [
      {
        icon: Zap,
        title: "Speed Matters",
        content:
          "In volatile markets, the ability to make fast, informed decisions separates leaders from laggards.",
      },
      {
        icon: Cloud,
        title: "Cloud-Native AI",
        content:
          "NetSuite's cloud platform means AI capabilities are always up to date and accessible from anywhere.",
      },
      {
        icon: Eye,
        title: "Full Visibility",
        content:
          "AI aggregates data across your entire operation, providing the complete picture finance leaders need.",
      },
      {
        icon: TrendingUp,
        title: "Continuous Learning",
        content:
          "AI systems improve over time, learning from your data to deliver increasingly accurate insights.",
      },
    ],

    conclusion:
      "Discover how NetSuite's AI capabilities can empower your financial leadership and drive your organisation's success. The finance leaders who thrive in uncertain times are those who embrace technology that enables faster, smarter decisions.",

    disclaimer:
      "Contact ERP Experts to learn how AI-enhanced finance can transform your organisation's decision-making capabilities.",
  },

  "4-skills-cfos-need-now": {
    title: "4 Skills CFOs Need Now",
    subtitle: "Tips to Excel at Communication, Collaboration, Data Analysis and FP&A",
    cardDescription:
      "The CFO's job is no longer just about the numbers. Soft skills are more in demand than ever. Discover the top skills for modern finance leaders.",
    date: "2025",
    readTime: "3 min read",
    type: "Guide",
    layoutVariant: 3,
    heroImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&q=80",
    featureImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
    challengeLabel: "The Shift",
    challengeHeading: 'Beyond the <span class="text-primary">Numbers</span>',
    challengeText:
      "The CFO's job is no longer just about the numbers. As finance leaders take on broader strategic roles, soft skills are more in demand than ever. Today's CFOs need to be communicators, collaborators, and strategic thinkers, not just number crunchers.",
    intro:
      "Modern CFOs are expected to do far more than manage the books. They're strategic partners, data storytellers, and cross-functional leaders. This guide explores the top skills every finance leader needs to thrive in today's business environment.",

    takeaways: [
      "Active listening builds trust",
      "Data analysis drives decisions",
      "Scenario planning reduces risk",
      "Communication is a leadership skill",
      "Collaboration breaks down silos",
    ],

    overviewHeading: 'The Modern <span class="text-primary">CFO</span>',
    overviewSubtext:
      "Finance leaders who master these skills position themselves and their organisations for long-term success. It's no longer enough to be technically proficient; the best CFOs combine financial expertise with strong interpersonal and analytical capabilities.",
    tipsHeading: '4 Skills Every CFO <span class="text-primary">Needs</span>',

    tips: [
      {
        number: "01",
        icon: MessageSquare,
        title: "Communication",
        content:
          "Effective communication is the cornerstone of modern financial leadership. CFOs must translate complex financial data into clear, compelling narratives that resonate with boards, investors, and cross-functional teams. The ability to tell the story behind the numbers is what separates good CFOs from great ones.",
        actions: [
          "Translate financial complexity into clear narratives",
          "Tailor messaging for different stakeholders",
          "Present data visually to drive understanding",
        ],
      },
      {
        number: "02",
        icon: Ear,
        title: "Active Listening",
        content:
          "Active listening goes beyond hearing words. It's about understanding context, reading between the lines, and building trust. CFOs who listen effectively gain deeper insights from their teams, identify risks earlier, and foster a culture where people feel heard and valued.",
        actions: [
          "Build trust through genuine engagement",
          "Identify risks and opportunities others miss",
          "Foster a culture of open communication",
        ],
      },
      {
        number: "03",
        icon: BarChart3,
        title: "Data Analysis",
        content:
          "In an era of information abundance, the ability to cut through noise and extract meaningful insights is critical. CFOs need to go beyond traditional reporting, leveraging advanced analytics to uncover patterns, validate assumptions, and support strategic decisions with evidence rather than intuition.",
        actions: [
          "Move beyond traditional reporting to advanced analytics",
          "Uncover patterns and validate assumptions",
          "Support strategic decisions with data-driven evidence",
        ],
      },
      {
        number: "04",
        icon: LineChart,
        title: "Scenario Planning and Forecasting",
        content:
          "In volatile markets, the ability to model multiple futures is invaluable. CFOs skilled in scenario planning and FP&A can stress-test strategies, prepare contingency plans, and guide their organisations through uncertainty with confidence. This means moving from static annual budgets to dynamic, rolling forecasts.",
        actions: [
          "Model multiple scenarios to stress-test strategies",
          "Move from static budgets to rolling forecasts",
          "Build contingency plans for market volatility",
        ],
      },
    ],

    bonusTips: [
      {
        icon: Handshake,
        title: "Collaboration",
        content:
          "Break down silos by partnering closely with operations, sales, and technology teams to drive unified strategy.",
      },
      {
        icon: Presentation,
        title: "Storytelling",
        content:
          "The best CFOs don't just present numbers. They tell compelling stories that drive action and alignment.",
      },
      {
        icon: TrendingUp,
        title: "Strategic Vision",
        content:
          "Look beyond quarterly results to anticipate market shifts and position the organisation for long-term growth.",
      },
      {
        icon: Bot,
        title: "Tech Fluency",
        content:
          "Understanding AI, automation, and cloud technologies is essential for leading finance transformation.",
      },
    ],

    conclusion:
      "The most effective CFOs combine deep financial expertise with strong communication, analytical, and strategic skills. As the role continues to evolve, investing in these capabilities isn't optional. It's essential for driving organisational success.",

    disclaimer:
      "Based on insights from Oracle NetSuite. Contact ERP Experts to discuss how the right tools can support your finance leadership.",
  },

  "streamlining-your-netsuite-experience": {
    title: "Streamlining Your NetSuite Experience",
    subtitle: "Essential Tips for Growing Businesses",
    cardDescription:
      "Getting the most out of NetSuite requires regular attention and smart optimisation. These essential tips will help keep your system running smoothly.",
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
    cardDescription:
      "Growing a business is exciting, but outdated systems can quietly drain your energy. You deserve technology that keeps up with your ambitions.",
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
    cardDescription:
      "ERP implementation often gets a bad reputation. With the right partner and approach, it can be smooth, efficient, and even enjoyable.",
    date: "Jan 24, 2025",
    readTime: "4 min read",
    type: "Guide",
    layoutVariant: 3,
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

  "future-of-work-generative-ai": {
    title: "The Future of Work: Leveraging the Potential of Generative AI",
    subtitle: "How AI augments human capabilities rather than replacing them",
    cardDescription:
      "Discover how generative AI is shifting the focus from automation to augmentation, supporting and enhancing human cognitive capabilities rather than replacing them.",
    date: "2025",
    readTime: "3 min read",
    type: "Guide",
    layoutVariant: 2,
    heroImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1400&q=80",
    featureImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    challengeLabel: "The Challenge",
    challengeHeading: 'Task and Information <span class="text-primary">Overload</span>',
    challengeText:
      "In today's hyper-connected digital environment, workers are experiencing chronic task and information overload. A recent Microsoft survey found that 68 percent of employees feel they lack sufficient uninterrupted time to focus on their core tasks. Human brains are not designed to process and rapidly switch between high volumes of complex information without a decline in performance and accuracy.",
    intro:
      "The rapid advancements in generative AI are ushering in a transformative era of work, where the boundaries between human and machine capabilities are being continually redefined. The focus is shifting from mere automation to the augmentation of work, supporting and enhancing human cognitive capabilities rather than replacing them.",

    takeaways: [
      "AI augments, not replaces, human work",
      "68% of employees lack focus time",
      "Reduces task and information overload",
      "Enhances creativity and problem-solving",
      "Upskilling is essential for adoption",
    ],

    overviewHeading: 'Augmenting Human <span class="text-primary">Potential</span>',
    overviewSubtext:
      "In addition to driving automation and operational efficiency, AI has the potential to elevate human cognitive performance by enabling deeper creativity, more effective problem-solving, and strategic thinking. When implemented effectively, it can also contribute to greater employee satisfaction and well-being.",
    tipsHeading: 'How GenAI Transforms <span class="text-primary">Work</span>',

    tips: [
      {
        number: "01",
        icon: Zap,
        title: "Reducing Information Overload",
        content:
          "GenAI can dramatically reduce the time and mental effort required for information processing. It can automatically summarise long email threads, extract key insights from reports, generate meeting notes, and respond to context-specific queries by drawing from an organisation's internal knowledge base.",
        actions: [
          "Automate summaries of emails, reports, and meetings",
          "Free up uninterrupted time for core responsibilities",
          "Reduce stress and improve employee well-being",
        ],
      },
      {
        number: "02",
        icon: Lightbulb,
        title: "Enhancing Cognitive Performance",
        content:
          "By automating routine and structured tasks, GenAI expands cognitive bandwidth, allowing individuals to focus their mental energy on complex core tasks and innovative problem-solving. It provides access to expertise, assists with analysis, and facilitates the acquisition of new skills.",
        actions: [
          "Enable deeper creativity and strategic thinking",
          "Lower barriers to traditionally complex work",
          "Broaden participation in high-value problem-solving",
        ],
      },
      {
        number: "03",
        icon: Users,
        title: "Democratising Expertise",
        content:
          "GenAI helps enable a broader range of individuals to contribute more effectively. A junior analyst can leverage AI to analyse large datasets and identify trends. A product designer can synthesise customer feedback into actionable insights. Non-technical team members can articulate feature ideas that AI tools help transform into functional code.",
        actions: [
          "Junior staff can perform at a higher level",
          "Cross-functional collaboration becomes easier",
          "Technical barriers are significantly lowered",
        ],
      },
      {
        number: "04",
        icon: Target,
        title: "Catalysing Innovation",
        content:
          "GenAI reduces the time, cost, and effort required to experiment with new ideas, encouraging teams to iterate quickly, ask what-if questions, and develop creative options. A marketing team can generate and test multiple campaign concepts within a single day, enabling more agile and informed decision-making.",
        actions: [
          "Rapid prototyping and experimentation",
          "Test multiple creative options in parallel",
          "Enable more agile decision-making",
        ],
      },
      {
        number: "05",
        icon: GraduationCap,
        title: "Preparing the Workforce",
        content:
          "Organisations must invest in comprehensive upskilling and reskilling programs. A key component is developing GenAI fluency: equipping users with the understanding, technical proficiency, and confidence to effectively apply AI tools. Prompt engineering skills are essential for successfully augmenting human work.",
        actions: [
          "Develop GenAI fluency across the organisation",
          "Foster safe and guided experimentation",
          "Establish governance for responsible AI use",
        ],
      },
    ],

    bonusTips: [
      {
        icon: TrendingUp,
        title: "Force Multiplier",
        content:
          "GenAI expands the scope of what individuals can accomplish, raising the overall quality of work.",
      },
      {
        icon: Settings,
        title: "Process Reimagination",
        content:
          "Businesses must reimagine traditional work processes and rethink workflows to fully capture AI's advantages.",
      },
      {
        icon: Cloud,
        title: "AI Agents",
        content:
          "Looking ahead, AI agents will autonomously execute routine tasks with minimal human input.",
      },
      {
        icon: Eye,
        title: "Human-Centred Future",
        content:
          "The goal is a future where people flourish in collaboration with intelligent technologies.",
      },
    ],

    conclusion:
      "The future of work is not something to resist or fear. It is an opportunity to reimagine what work can be. By centering innovation around people and augmenting human potential with intelligent technologies, organisations can create a more adaptive and human-centred workplace for all.",

    disclaimer:
      "Based on research by Maryam Alavi, PhD, Georgia Institute of Technology, and published by Oracle NetSuite.",
  },

  "spreadsheet-hidden-costs": {
    title: "The Hidden Costs of Spreadsheets",
    subtitle: "Why Your Spreadsheets Are Holding You Back",
    cardDescription:
      "As ERP data requirements expand and business environments grow more complex, spreadsheets reveal their limitations and hidden costs.",
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

// Type icons for listing page badges
import { BookOpen, FileText, ClipboardCheck as AssessmentIcon } from "lucide-react";
export const typeIcons = { Guide: BookOpen, Article: FileText, Assessment: AssessmentIcon };

// Listing page card image mapping (some articles use different images for cards vs hero)
const cardImages = {
  "is-netsuite-right-for-your-business":
    "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=600&q=80",
  "future-of-work-generative-ai":
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
  "cfo-guide-ai-enhanced-finance":
    "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600&q=80",
  "4-skills-cfos-need-now": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80",
  "streamlining-your-netsuite-experience":
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
  "your-erp-system-should-work-for-you": erpWorkForYouHero,
  "stress-free-erp-implementation": erpImplementationHero,
  "spreadsheet-hidden-costs":
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
};

// Ordered list of article slugs for the listing page
const articleOrder = [
  "is-netsuite-right-for-your-business",
  "future-of-work-generative-ai",
  "cfo-guide-ai-enhanced-finance",
  "4-skills-cfos-need-now",
  "streamlining-your-netsuite-experience",
  "your-erp-system-should-work-for-you",
  "stress-free-erp-implementation",
  "spreadsheet-hidden-costs",
];

// Derived list for the listing page
export const articlesList = articleOrder.map((slug) => {
  const a = articles[slug];
  return {
    slug,
    type: a.type,
    title: a.title,
    subtitle: a.subtitle,
    desc: a.cardDescription || a.subtitle,
    readTime: a.readTime,
    image: cardImages[slug] || a.heroImage,
  };
});
