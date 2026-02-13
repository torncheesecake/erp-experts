/**
 * ERP Readiness Assessment
 * Interactive 6-question quiz with instant results
 */

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Users,
  Award,
  Briefcase,
  Target,
  Database,
  CheckCircle,
  ClipboardCheck,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import SEO from "../../components/ui/SEO";
import TrackedLink from "../../components/ui/TrackedLink";
import Breadcrumb from "../../components/ui/Breadcrumb";

const questions = [
  {
    key: "leadership",
    label: "Leadership Alignment",
    icon: Users,
    question: "How aligned is your leadership team on the need for a new business system?",
    options: [
      { text: "We haven't discussed it yet", score: 1 },
      { text: "Some interest but no formal agreement", score: 2 },
      { text: "Leadership agrees it's needed but no budget yet", score: 3 },
      { text: "Fully aligned with budget approved", score: 4 },
    ],
    feedback: {
      1: "Leadership alignment is the single biggest predictor of ERP success. Before going further, get your decision-makers in the same room to discuss the business case.",
      2: "There's interest, which is a start. Consider putting together a brief business case showing the cost of inaction to help build consensus.",
      3: "You have agreement on the need — now it's about securing the budget. Quantifying the ROI and presenting a clear implementation timeline can help get sign-off.",
      4: "Excellent. With leadership fully aligned and budget approved, you've cleared the biggest hurdle. This is a strong foundation to build on.",
    },
  },
  {
    key: "experience",
    label: "Experience & Expectations",
    icon: Award,
    question: "What is your organisation's experience with major system changes?",
    options: [
      { text: "We've never done anything like this", score: 1 },
      { text: "We've tried before but it didn't go well", score: 2 },
      { text: "We've done similar projects with mixed results", score: 3 },
      { text: "We have a strong track record of successful projects", score: 4 },
    ],
    feedback: {
      1: "That's okay — every organisation starts somewhere. The key is finding an implementation partner who can guide you through the process and set realistic expectations from day one.",
      2: "Past difficulties often come from poor planning or the wrong partner rather than the technology itself. Learning from what went wrong last time will make your next project stronger.",
      3: "Mixed results suggest you know what works and what doesn't. Use those lessons to set clearer scope, timelines, and success criteria this time around.",
      4: "A strong track record means your team knows how to manage change. You're well-positioned to handle the demands of an ERP implementation.",
    },
  },
  {
    key: "resources",
    label: "Resource Capability",
    icon: Briefcase,
    question: "Can your team dedicate time to an ERP project alongside their daily roles?",
    options: [
      { text: "No, everyone is at full capacity", score: 1 },
      { text: "It would be very difficult to free anyone up", score: 2 },
      { text: "We could dedicate some people part-time", score: 3 },
      { text: "We have or can hire dedicated project resources", score: 4 },
    ],
    feedback: {
      1: "Resource availability is a common blocker. An ERP project needs internal champions — consider whether you can backfill roles or phase the project to reduce the burden.",
      2: "It'll be tight, but many organisations manage by staggering workloads. Identify your 2-3 key people and plan their involvement around business-critical periods.",
      3: "Part-time involvement can work well if it's structured. Make sure your key people have protected time each week and aren't just fitting it in around everything else.",
      4: "Having dedicated resources is a major advantage. Projects with full-time internal project leads are significantly more likely to stay on time and on budget.",
    },
  },
  {
    key: "priority",
    label: "Priority & Urgency",
    icon: Target,
    question: "How urgent is your need to replace or upgrade your current systems?",
    options: [
      { text: "It's not a priority right now", score: 1 },
      { text: "It's on our radar but not urgent", score: 2 },
      { text: "It's becoming a real pain point", score: 3 },
      { text: "It's critical — we're actively losing time or money", score: 4 },
    ],
    feedback: {
      1: "If it's not a priority yet, now is actually the best time to start planning. Organisations that plan ahead avoid the rush and make better decisions than those forced into it by a crisis.",
      2: "It's on the radar — good. Use this time to do proper due diligence. Research, evaluate partners, and build your business case while there's no pressure.",
      3: "When it's becoming painful, the cost of waiting starts to add up. Document those pain points — they'll form the foundation of your requirements and help justify the investment.",
      4: "The urgency is clear, but don't let it rush you into poor decisions. Even with time pressure, investing a few weeks in proper planning will save months down the line.",
    },
  },
  {
    key: "data",
    label: "Data & Process Foundation",
    icon: Database,
    question: "How would you describe your current business data and processes?",
    options: [
      { text: "Scattered across spreadsheets with no documentation", score: 1 },
      { text: "Mostly in one system but processes aren't documented", score: 2 },
      { text: "Reasonably organised with some documented processes", score: 3 },
      { text: "Well-structured data with clearly documented workflows", score: 4 },
    ],
    feedback: {
      1: "Data scattered across spreadsheets is one of the most common reasons organisations look at ERP. The good news is that migration planning can happen alongside the implementation — you don't need perfect data to start.",
      2: "Having data in one system is a good starting point. Before implementation, prioritise documenting your core business processes — it'll make configuration much smoother.",
      3: "You're in a solid position. Focus on cleaning up any data quality issues and filling in gaps in your process documentation before go-live.",
      4: "This is ideal. Clean, well-structured data and documented processes mean faster implementation, fewer surprises, and a smoother go-live.",
    },
  },
  {
    key: "success",
    label: "Success Definition",
    icon: CheckCircle,
    question: "How clearly have you defined what a successful implementation looks like?",
    options: [
      { text: "We haven't thought about it yet", score: 1 },
      { text: "We have a vague idea of what we want", score: 2 },
      { text: "We've identified key goals but not detailed metrics", score: 3 },
      { text: "We have clear objectives, KPIs, and a business case", score: 4 },
    ],
    feedback: {
      1: "Without a clear definition of success, it's impossible to know if your project delivered. Start by asking: what specific problems are we solving, and how will we measure the improvement?",
      2: "A vague idea is a starting point, but you need specifics. Try to translate 'we want better visibility' into measurable outcomes like 'month-end close in 3 days instead of 10'.",
      3: "You're close. The next step is attaching measurable KPIs to each goal so you can objectively assess whether the implementation delivered what was promised.",
      4: "Having clear objectives and KPIs puts you ahead of most organisations. This clarity will keep your project focused and give you a solid framework for measuring ROI.",
    },
  },
];

const bands = [
  {
    min: 0,
    max: 33,
    label: "Early Stage",
    color: "text-amber-600",
    bg: "bg-amber-600",
    ring: "#d97706",
    summary:
      "You're at the beginning of your ERP journey. That's completely normal — most organisations start here. The key areas to focus on are building leadership alignment, documenting your current processes, and defining what success looks like before committing to a platform.",
  },
  {
    min: 34,
    max: 66,
    label: "Getting Ready",
    color: "text-blue-600",
    bg: "bg-blue-600",
    ring: "#2563eb",
    summary:
      "You've made good progress on your ERP readiness. Some foundations are in place, but there are areas that need strengthening before you'll get the most from an implementation. A detailed scorecard will help you pinpoint exactly where to focus your preparation.",
  },
  {
    min: 67,
    max: 100,
    label: "Well Prepared",
    color: "text-green-600",
    bg: "bg-green-600",
    ring: "#16a34a",
    summary:
      "Your organisation is in a strong position to move forward with an ERP implementation. You have leadership buy-in, realistic expectations, and a solid foundation to build on. The next step is finding the right implementation partner to bring it all together.",
  },
];

function ScoreRing({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const gradientId = "scoreGradient";
  const size = 280;
  const center = size / 2;
  const radius = 120;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const prefersReduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (prefersReduced.current) {
      setAnimatedScore(score);
      return;
    }
    let start = null;
    const duration = 1200;
    function animate(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e83a7a" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          style={{ stroke: "var(--color-text)", opacity: 0.05 }}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: prefersReduced.current ? "none" : "stroke-dashoffset 1.2s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl md:text-5xl font-heading font-bold"
          style={{ color: "var(--color-primary)" }}
        >
          {animatedScore}%
        </span>
        <span className="text-sm text-muted mt-1">readiness score</span>
      </div>
    </div>
  );
}

export default function ResourceAssessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const contentRef = useRef(null);

  const totalScore = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const percentage = Math.round(((totalScore - 6) / 18) * 100);
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const band =
    bands.find((b) => clampedPercentage >= b.min && clampedPercentage <= b.max) || bands[0];

  const handleAnswer = (questionKey, score) => {
    setSelected(score);
    setAnswers((prev) => ({ ...prev, [questionKey]: score }));
    setTimeout(() => {
      setSelected(null);
      setCurrentStep((prev) => prev + 1);
      if (contentRef.current) {
        contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
  };

  const restart = () => {
    setCurrentStep(0);
    setAnswers({});
    setSelected(null);
  };

  const progressPercent = currentStep === 0 ? 0 : Math.round((Math.min(currentStep, 6) / 6) * 100);

  return (
    <main id="main-content">
      <SEO
        title="ERP Readiness Assessment | ERP Experts"
        description="Answer 6 quick questions to find out if your business is ready for NetSuite. Get an instant readiness score across leadership, resources, data, and more."
        path="/resources/erp-readiness-assessment"
        keywords="ERP readiness, NetSuite assessment, ERP quiz, business readiness, NetSuite evaluation"
      />

      {/* Hero */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        style={{ padding: "var(--space-4xl) 0 var(--space-3xl)" }}
      >
        {/* Decorative triangles */}
        <div
          className="absolute top-1/2 right-0 opacity-10 hidden lg:block pointer-events-none"
          style={{
            width: "500px",
            height: "430px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(25%) translateY(-50%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 opacity-5 hidden md:block pointer-events-none"
          style={{
            width: "250px",
            height: "215px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            transform: "translateX(-40%) translateY(30%)",
          }}
        />

        <div className="container relative z-10">
          <Breadcrumb
            items={[
              { label: "Home", to: "/" },
              { label: "Resources", to: "/resources" },
              { label: "ERP Readiness Assessment" },
            ]}
            light
          />
          <div style={{ marginTop: "var(--space-xl)" }}>
            <div className="flex items-center gap-sm" style={{ marginBottom: "var(--space-md)" }}>
              <ClipboardCheck className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-primary uppercase tracking-wider">
                Assessment
              </span>
            </div>
            <h1
              className="text-white"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                lineHeight: 1.1,
                marginBottom: "var(--space-lg)",
              }}
            >
              ERP Readiness <span className="text-primary">Assessment</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
              Answer 6 quick questions to find out how ready your business is for a NetSuite
              implementation. It only takes 2 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Assessment Body */}
      <section className="section-padding-lg" ref={contentRef}>
        <div className="container">
          <div className={`mx-auto ${currentStep === 7 ? "max-w-6xl" : "max-w-4xl"}`}>
            {/* Progress bar */}
            {currentStep > 0 && currentStep <= 6 && (
              <div style={{ marginBottom: "var(--space-3xl)" }}>
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: "var(--space-sm)" }}
                >
                  <span className="text-sm text-muted">Question {currentStep} of 6</span>
                  <span className="text-sm font-bold text-primary">{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-(--color-text)/5">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: "var(--color-primary)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 0: Intro */}
            {currentStep === 0 && (
              <div
                className="text-center rounded-2xl border border-(--color-text)/15 relative overflow-hidden"
                style={{ padding: "var(--space-4xl) var(--space-3xl)" }}
              >
                {/* Decorative triangle */}
                <div
                  className="absolute top-0 right-0 opacity-5 pointer-events-none"
                  style={{
                    width: "250px",
                    height: "215px",
                    clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                    backgroundColor: "var(--color-primary)",
                    transform: "translateX(30%) translateY(-30%)",
                  }}
                />
                <div
                  className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    marginBottom: "var(--space-xl)",
                  }}
                >
                  <ClipboardCheck className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl" style={{ marginBottom: "var(--space-lg)" }}>
                  Are you ready for ERP?
                </h2>
                <p
                  className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed"
                  style={{ marginBottom: "var(--space-xl)" }}
                >
                  This quick assessment evaluates 6 key areas of ERP readiness: leadership
                  alignment, experience, resources, priority, data foundation, and success
                  definition. You'll get an instant score at the end.
                </p>
                <p className="text-sm text-muted" style={{ marginBottom: "var(--space-3xl)" }}>
                  6 questions &middot; 2 minutes &middot; No email required
                </p>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn btn-lg inline-flex items-center gap-sm"
                >
                  Start assessment
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Steps 1-6: Questions */}
            {currentStep >= 1 &&
              currentStep <= 6 &&
              (() => {
                const q = questions[currentStep - 1];
                const Icon = q.icon;
                return (
                  <div
                    className="rounded-2xl border border-(--color-text)/15 relative overflow-hidden"
                    style={{ padding: "var(--space-3xl)" }}
                  >
                    {/* Decorative triangle */}
                    <div
                      className="absolute top-0 right-0 opacity-5 pointer-events-none"
                      style={{
                        width: "180px",
                        height: "155px",
                        clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                        backgroundColor: "var(--color-primary)",
                        transform: "translateX(30%) translateY(-30%)",
                      }}
                    />
                    <div
                      className="flex items-center gap-md"
                      style={{ marginBottom: "var(--space-xl)" }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "rgba(232, 58, 122, 0.1)" }}
                      >
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-sm font-bold text-primary uppercase tracking-wider">
                        {q.label}
                      </span>
                    </div>
                    <h3
                      className="text-2xl md:text-3xl"
                      style={{ marginBottom: "var(--space-2xl)" }}
                    >
                      {q.question}
                    </h3>
                    <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>
                      {q.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(q.key, opt.score)}
                          className={`w-full text-left rounded-xl border transition-all ${
                            selected === opt.score
                              ? "border-primary bg-primary/5 scale-[0.98]"
                              : "border-(--color-text)/10 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-sm"
                          }`}
                          style={{ padding: "var(--space-lg) var(--space-xl)" }}
                        >
                          <span className="text-base md:text-lg">{opt.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

            {/* Step 7: Results */}
            {currentStep === 7 && (
              <div>
                {/* Top actions row */}
                <div
                  className="flex flex-col sm:flex-row items-center justify-between gap-md"
                  style={{ marginBottom: "var(--space-2xl)" }}
                >
                  <button
                    onClick={restart}
                    className="inline-flex items-center gap-sm text-sm font-medium text-muted hover:text-primary transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retake assessment
                  </button>
                  <TrackedLink
                    href="https://one-score-to-rule-them-all.scoreapp.com"
                    trackingName="assessment_full_scorecard_top"
                    trackingPage="/resources/erp-readiness-assessment"
                    className="inline-flex items-center gap-sm text-sm font-bold hover:opacity-80 transition-opacity"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Take the full 20-question assessment
                    <ExternalLink className="w-4 h-4" />
                  </TrackedLink>
                </div>

                {/* Score card */}
                <div
                  className="text-center rounded-2xl border border-(--color-text)/15 relative overflow-hidden"
                  style={{ padding: "var(--space-3xl) var(--space-2xl)" }}
                >
                  {/* Decorative triangle */}
                  <div
                    className="absolute top-0 right-0 opacity-5 pointer-events-none"
                    style={{
                      width: "250px",
                      height: "215px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-primary)",
                      transform: "translateX(30%) translateY(-30%)",
                    }}
                  />
                  <h3 style={{ marginBottom: "var(--space-xl)" }}>Your Readiness Score</h3>
                  <div style={{ marginBottom: "var(--space-lg)" }}>
                    <ScoreRing score={clampedPercentage} />
                  </div>
                  <span
                    className={`inline-block text-base font-bold uppercase tracking-wider px-4 py-1.5 rounded-full ${band.color} ${band.bg}/10`}
                  >
                    {band.label}
                  </span>
                  <p
                    className="text-base text-muted max-w-2xl mx-auto leading-relaxed"
                    style={{ marginTop: "var(--space-lg)" }}
                  >
                    {band.summary}
                  </p>
                </div>

                {/* Category breakdown */}
                <div style={{ marginTop: "var(--space-2xl)" }}>
                  <h4 style={{ marginBottom: "var(--space-lg)" }}>Category Breakdown</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-lg">
                    {questions.map((q) => {
                      const score = answers[q.key] || 0;
                      const Icon = q.icon;
                      return (
                        <div
                          key={q.key}
                          className="rounded-xl border border-(--color-text)/15 flex flex-col"
                          style={{ padding: "var(--space-xl)" }}
                        >
                          <div
                            className="flex items-center gap-md"
                            style={{ marginBottom: "var(--space-md)" }}
                          >
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: "rgba(232, 58, 122, 0.1)" }}
                            >
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-base font-bold leading-tight">{q.label}</span>
                            <span className="ml-auto text-base font-bold text-muted shrink-0">
                              {score}/4
                            </span>
                          </div>
                          <div className="flex gap-1.5" style={{ marginBottom: "var(--space-md)" }}>
                            {[1, 2, 3, 4].map((n) => (
                              <div
                                key={n}
                                className="h-2.5 flex-1 rounded-full"
                                style={{
                                  backgroundColor:
                                    n <= score ? "var(--color-primary)" : "var(--color-text)",
                                  opacity: n <= score ? 1 : 0.08,
                                }}
                              />
                            ))}
                          </div>
                          {q.feedback && q.feedback[score] && (
                            <p className="text-base text-muted leading-relaxed mt-auto">
                              {q.feedback[score]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom CTA */}
                <div
                  className="rounded-2xl text-center relative overflow-hidden"
                  style={{
                    marginTop: "var(--space-2xl)",
                    padding: "var(--space-2xl) var(--space-xl)",
                    background:
                      "linear-gradient(135deg, rgba(232,58,122,0.06) 0%, rgba(124,58,237,0.06) 50%, rgba(37,99,235,0.06) 100%)",
                  }}
                >
                  <h4 style={{ marginBottom: "var(--space-md)" }}>Want the full picture?</h4>
                  <p
                    className="text-base text-muted max-w-lg mx-auto"
                    style={{ marginBottom: "var(--space-xl)" }}
                  >
                    Our detailed scorecard dives deeper with 20 questions and gives you a
                    comprehensive breakdown with personalised recommendations.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-sm">
                    <TrackedLink
                      href="https://one-score-to-rule-them-all.scoreapp.com"
                      trackingName="assessment_full_scorecard"
                      trackingPage="/resources/erp-readiness-assessment"
                      className="btn inline-flex items-center gap-sm"
                    >
                      Get your full scorecard
                      <ExternalLink className="w-4 h-4" />
                    </TrackedLink>
                    <TrackedLink
                      to="/contact"
                      trackingName="assessment_contact"
                      trackingPage="/resources/erp-readiness-assessment"
                      className="inline-flex items-center gap-sm text-base font-bold hover:opacity-80 transition-opacity"
                      style={{
                        color: "var(--color-primary)",
                        padding: "var(--space-sm) var(--space-md)",
                      }}
                    >
                      Start a conversation
                      <ArrowRight className="w-4 h-4" />
                    </TrackedLink>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
