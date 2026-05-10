import fs from "node:fs";
import path from "node:path";

const QA_REPORT_PATH = path.resolve("reports/resource-qa-report.json");
const REPORTS_DATA_PATH = path.resolve("src/data/reports.json");
const STATUS_PATH = path.resolve("public/api/seo-statuses.json");
const OUTPUT_PATH = path.resolve("reports/seo-action-briefs.json");
const DASHBOARD_BRIEF_LIMIT = 5;
const SPRINT_BACKLOG_LIMIT = 15;

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const smallWords = new Set(["a", "an", "and", "as", "at", "for", "from", "in", "of", "on", "or", "the", "to", "with"]);

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function titleToSlug(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function smartTitleCase(input) {
  return String(input || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (lower === "erp") return "ERP";
      if (lower === "netsuite") return "NetSuite";
      if (lower === "uk") return "UK";
      if (lower === "it") return "IT";
      if (index > 0 && smallWords.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function normaliseGeneratedTitle(rawTitle, rawQuery = rawTitle) {
  let title = String(rawTitle || rawQuery || "").trim();
  const raw = String(rawQuery || rawTitle || "").trim();
  const lower = title.toLowerCase();

  title = title
    .replace(/:\s*how to choose and deliver$/i, "")
    .replace(/\bhow to choose and deliver\b/gi, "")
    .replace(/\bgreat britain\b/gi, "UK")
    .replace(/\bunited kingdom\b/gi, "UK")
    .replace(/\berp\b/gi, "ERP")
    .replace(/\bnetsuite\b/gi, "NetSuite")
    .replace(/\bit\b/gi, "IT")
    .replace(/\s+/g, " ")
    .trim();

  const whichMatch = lower.match(/^which\s+(.+?)\s+are\s+best\s+for\s+(.+?)(?:\s+in\s+great\s+britain|\s+in\s+the\s+uk|\s+in\s+uk)?$/i);
  if (whichMatch) {
    const subject = whichMatch[1];
    const audience = whichMatch[2];
    if (/erp consultants?/.test(subject) && /software|development|it/.test(audience)) {
      return "How UK Software Companies Should Choose an ERP Consultant";
    }
    return `How to Choose ${smartTitleCase(subject.replace(/s$/, ""))} for ${smartTitleCase(audience)}`;
  }

  if (/^erp consultants? uk$/i.test(title)) return "How to Choose an ERP Consultant in the UK";
  if (/^independent erp consultants?$/i.test(title)) return "How to Choose an Independent ERP Consultant";
  if (/^erp development company(?:: practical guide)?$/i.test(title)) return "How to Choose an ERP Development Company";
  if (/^erp software development company(?:: practical guide)?$/i.test(title)) return "What to Look For in an ERP Software Development Company";

  if (raw && title.length > 85 && /consultants?|company|software|development/i.test(title)) {
    return smartTitleCase(title.replace(/\bwhich\b|\bare best for\b/gi, "").replace(/\s+/g, " "));
  }

  return smartTitleCase(title);
}

function titleQualityChecks(title, rawQuery = "") {
  const checks = [];
  const titleNorm = norm(title);
  const words = titleNorm.split(" ").filter(Boolean);
  const repeated = words.filter((word, index) => words.indexOf(word) !== index && word.length > 3);

  if (title.length > 75) checks.push("overly_long_title");
  if (new Set(repeated).size > 0) checks.push("possible_keyword_stuffing");
  if (/\bwhich\b.+\bare best for\b/i.test(title) || /how to choose and deliver/i.test(title)) checks.push("awkward_phrase");
  if (/\bErp\b|\bNetsuite\b/.test(title)) checks.push("title_case_mistake");
  if (/great britain/i.test(title) && !/great britain/i.test(rawQuery)) checks.push("unnecessary_great_britain");

  return checks;
}

function conversionIntentForText(input) {
  const text = norm(input);
  let score = 35;
  let recommendedCTA = "audit/readiness check";

  const add = (amount, cta = recommendedCTA) => {
    score = Math.max(score, amount);
    recommendedCTA = cta;
  };

  if (/failed implementation|rescue|recovery|implementation problem|poor implementation|implementation/i.test(text)) {
    add(92, "implementation consultation");
  }
  if (/aftercare|support|helpdesk|maintenance|ongoing support/i.test(text)) {
    add(88, "support review");
  }
  if (/erp consultant|erp partner|netsuite partner|consultant|partner/i.test(text)) {
    add(84, "audit/readiness check");
  }
  if (/manufacturing|manufacturer|factory|production|inventory|warehouse/i.test(text)) {
    add(82, "manufacturing ERP discussion");
  }
  if (/finance|accounting|accounts receivable|cash flow|cfo|financial/i.test(text)) {
    add(78, "finance systems review");
  }
  if (/migration|migrate|replace|upgrade|implementation/i.test(text)) {
    add(80, "implementation consultation");
  }
  if (/what is erp|what is an erp|benefits of erp|role of erp|understanding erp/i.test(text)) {
    score = Math.min(score, /netsuite|consultant|implementation|support|finance|manufacturing/.test(text) ? 55 : 35);
  }

  const label = score >= 75 ? "high" : score >= 50 ? "medium" : "low";
  return { conversionIntentScore: Math.min(100, score), conversionIntentLabel: label, recommendedCTA };
}

function demandScoreForText(text, demandGaps, topicBacklog) {
  const t = norm(text);
  if (!t) return 0;
  let score = 0;

  for (const gap of demandGaps || []) {
    const query = norm(gap.query);
    if (query && (t.includes(query) || query.includes(t) || t.includes(query.split(" ").slice(0, 3).join(" ")))) {
      score += Math.min(40, Math.round((gap.impressions || 0) / 120));
      score += gap.clicks === 0 ? 10 : 0;
    }
  }

  for (const topic of topicBacklog || []) {
    const query = norm(topic.query || topic.suggestedTitle);
    if (query && (t.includes(query) || query.includes(t) || t.includes(query.split(" ").slice(0, 3).join(" ")))) {
      score += Math.min(50, topic.score || 0);
      score += Math.min(20, Math.round((topic.impressions || 0) / 150));
    }
  }

  return Math.min(100, score);
}

function roadmapItemsFromReports(reports, statuses) {
  const phases = reports?.ga4Period?.seoInsights?.roadmapPhases || [];
  return phases.flatMap((phase) =>
    (phase.items || []).map((item) => ({
      ...item,
      status: statuses?.[item.priority] || item.status,
    })),
  );
}

function baseCategoryForText(input) {
  const text = norm(input);
  if (/failed implementation|rescue|recovery|implementation problem|poor implementation|implementation|migration|migrate|upgrade/.test(text)) return "implementation";
  if (/aftercare|support|helpdesk|maintenance|ongoing support/.test(text)) return "support";
  if (/manufacturing|manufacturer|factory|production|inventory|warehouse/.test(text)) return "manufacturing";
  if (/finance|accounting|accounts receivable|cash flow|cfo|financial/.test(text)) return "finance";
  if (/erp consultant|erp partner|netsuite partner|consultant|partner/.test(text)) return "partner";
  if (/what is erp|benefits of erp|role of erp|understanding erp|beginner/.test(text)) return "informational";
  return "commercial";
}

function buildRecommendations({ qaReport, allItems, demandGaps, topicBacklog }) {
  if (!qaReport || !Array.isArray(qaReport.articles)) return [];

  const roadmapByTitle = new Map((allItems || []).map((item) => [norm(item.title), item]));
  const qaBySlug = new Map(qaReport.articles.map((article) => [article.slug, article]));
  const recommendations = [];

  for (const qa of qaReport.articles) {
    const roadmapItem = roadmapByTitle.get(norm(qa.title));
    const status = roadmapItem?.status || null;
    const demand = demandScoreForText(qa.title || qa.slug, demandGaps, topicBacklog);
    const topIssue = qa?.issues?.structural?.[0] || qa?.issues?.warnings?.[0] || "No issues recorded";

    if (qa.gate === "blocked") {
      const intent = conversionIntentForText(`${qa.title} ${qa.slug}`);
      recommendations.push({
        type: "blocked_review",
        title: qa.title || qa.slug,
        slug: qa.slug,
        reason: `QA gate is blocked (${topIssue}).`,
        conversionIntentScore: intent.conversionIntentScore,
        conversionIntentLabel: intent.conversionIntentLabel,
        recommendedCTA: intent.recommendedCTA,
        priorityScore: Math.min(100, Math.round(45 + demand * 0.35 + intent.conversionIntentScore * 0.35)),
        sourceSignals: ["blocked_structural_issue", demand > 0 ? "search_demand" : "poor_qa_score"].filter(Boolean),
        suggestedNextAction: "Fix structural QA issues before any SEO update or promotion.",
      });
      continue;
    }

    if (qa.gate === "needs_review") {
      const intent = conversionIntentForText(`${qa.title} ${qa.slug}`);
      recommendations.push({
        type: "improve_existing",
        title: qa.title || qa.slug,
        slug: qa.slug,
        qa,
        reason: `Low QA score (${qa.score}) and/or quality warnings (${topIssue}).`,
        conversionIntentScore: intent.conversionIntentScore,
        conversionIntentLabel: intent.conversionIntentLabel,
        recommendedCTA: intent.recommendedCTA,
        priorityScore: Math.min(100, Math.round((100 - qa.score) * 0.4 + demand * 0.35 + intent.conversionIntentScore * 0.45 + (status === "in_progress" ? 8 : 0))),
        sourceSignals: ["poor_qa_score", demand > 0 ? "search_demand" : null].filter(Boolean),
        suggestedNextAction: status === "in_progress"
          ? "Complete current draft, then improve intro depth, CTA relevance, and flagged sections."
          : "Revise this existing article first, then re-run resource QA before new content creation.",
      });
      continue;
    }

    if (qa.gate === "pass" && demand > 45) {
      const intent = conversionIntentForText(`${qa.title} ${qa.slug}`);
      recommendations.push({
        type: "monitor",
        title: qa.title || qa.slug,
        slug: qa.slug,
        reason: "QA is strong, but demand signals are high enough to monitor ranking and CTR closely.",
        conversionIntentScore: intent.conversionIntentScore,
        conversionIntentLabel: intent.conversionIntentLabel,
        recommendedCTA: intent.recommendedCTA,
        priorityScore: Math.min(100, Math.round(demand * 0.55 + intent.conversionIntentScore * 0.45)),
        sourceSignals: ["search_demand"],
        suggestedNextAction: "Track performance weekly and only refresh if impressions rise without CTR improvement.",
      });
    }
  }

  for (const topic of (topicBacklog || []).slice(0, 12)) {
    const suggested = topic.suggestedTitle || topic.query;
    if (!suggested || qaBySlug.has(titleToSlug(suggested))) continue;
    const rawQuery = topic.query || suggested;
    const preferredTitle = normaliseGeneratedTitle(suggested, rawQuery);
    const intent = conversionIntentForText(`${preferredTitle} ${rawQuery}`);

    recommendations.push({
      type: "create_new",
      title: preferredTitle,
      preferredTitle,
      rawQuery,
      slug: null,
      reason: "Demand-led topic backlog indicates uncovered search intent.",
      conversionIntentScore: intent.conversionIntentScore,
      conversionIntentLabel: intent.conversionIntentLabel,
      recommendedCTA: intent.recommendedCTA,
      priorityScore: Math.min(100, Math.round((topic.score || 0) * 0.45 + Math.min(20, (topic.impressions || 0) / 160) + intent.conversionIntentScore * 0.45)),
      sourceSignals: ["search_demand", "content_gap"],
      suggestedNextAction: "Draft a new resource targeting the exact query intent, then add internal links and CTA.",
    });
  }

  const sorted = recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
  return sorted.map((rec, idx) => {
    const rank = idx + 1;
    const articleTypeBucket = baseCategoryForText(`${rec.title} ${rec.rawQuery || ""} ${rec.recommendedCTA || ""}`);
    const sprintCandidate = rank > DASHBOARD_BRIEF_LIMIT && rank <= SPRINT_BACKLOG_LIMIT && rec.type !== "monitor";
    let sprintReason = "";
    if (sprintCandidate && rec.type === "improve_existing") sprintReason = "Needs QA improvement and is outside dashboard top 5.";
    else if (sprintCandidate && rec.type === "create_new") sprintReason = "Demand-led content gap suitable for sprint backlog planning.";
    else if (sprintCandidate && rec.type === "blocked_review") sprintReason = "Blocked issue that should be cleared before promotion work.";

    return {
      ...rec,
      displayRank: rank,
      sprintCandidate,
      sprintReason,
      articleTypeBucket,
    };
  });
}

function suggestedLinksForRecommendation(rec) {
  const text = norm(`${rec.title} ${rec.reason}`);
  const links = ["/resources"];

  if (text.includes("implementation") || text.includes("project")) links.push("/implementation");
  if (text.includes("support") || text.includes("aftercare") || text.includes("poor")) links.push("/support");
  if (text.includes("partner") || text.includes("consultant")) links.push("/partners");
  if (text.includes("manufactur") || text.includes("case")) links.push("/case-studies");
  if (text.includes("netsuite") || text.includes("erp")) links.push("/services/netsuite");
  links.push("/contact");

  return [...new Set(links)].slice(0, 4);
}

function ctaAngleForRecommendation(rec) {
  const title = norm(rec.title);
  if (rec.recommendedCTA) return rec.recommendedCTA;
  if (rec.type === "create_new") return "Offer a practical consultation or readiness check tied to the search intent.";
  if (rec.type === "blocked_review") return "Avoid lead-generation emphasis until structural QA issues are fixed.";
  if (title.includes("support") || title.includes("aftercare")) return "Position ERP Experts as the support partner for resolving ongoing NetSuite friction.";
  if (title.includes("implementation") || title.includes("poor")) return "Invite readers to discuss implementation recovery or risk reduction.";
  return "Use a soft consultation CTA that connects the article topic to NetSuite advisory help.";
}

function metaDescriptionForTitle(title, cta) {
  const base = `Practical guidance for ${title.toLowerCase()} from ERP Experts.`;
  const suffix = cta === "support review"
    ? " Understand the support issues to fix before they slow the business down."
    : cta === "implementation consultation"
      ? " Learn what to check before your next ERP decision or recovery project."
      : cta === "manufacturing ERP discussion"
        ? " See what manufacturers should review before choosing or improving ERP."
        : cta === "finance systems review"
          ? " Review the finance system signals that affect control, reporting, and scale."
          : " Use it to plan a clearer next step before committing budget.";
  return `${base}${suffix}`.slice(0, 155);
}

function channelTopicForTitle(title) {
  const lower = title.toLowerCase();
  if (/software companies.*erp consultant|erp consultant.*software companies/i.test(title)) {
    return "choosing an ERP consultant for a UK software company";
  }
  if (/choose an erp consultant|independent erp consultant|erp consultants uk/i.test(lower)) {
    return "choosing an ERP consultant";
  }
  if (/poor netsuite implementation|failed implementation/i.test(lower)) {
    return "spotting and recovering a poor NetSuite implementation";
  }
  if (/erp development company/i.test(lower)) {
    return "choosing an ERP development company";
  }
  return lower;
}

function buildChannelOutputs(brief) {
  const title = brief.preferredTitle || brief.targetArticleTitle;
  const cta = brief.recommendedCTA;
  const highIntent = brief.conversionIntentLabel === "high";
  const topic = channelTopicForTitle(title);
  const ctaArticle = /^[aeiou]/i.test(cta) ? "an" : "a";

  return {
    linkedInPostAngle: highIntent
      ? `Frame ${title} around a board-level decision: where poor ERP choices create cost, delay, or operational drag.`
      : `Use ${title} to clarify a common ERP question and point readers towards a practical next step.`,
    emailNurtureAngle: cta === "support review"
      ? "Send to existing NetSuite users showing symptoms of recurring support issues, with a prompt to review unresolved friction."
      : cta === "implementation consultation"
        ? "Send to prospects evaluating ERP change, focused on avoiding implementation risk before scope is locked."
        : cta === "manufacturing ERP discussion"
          ? "Send to manufacturing contacts with inventory, production, or reporting pain, positioned as a decision checklist."
          : cta === "finance systems review"
        ? "Send to finance leaders who are outgrowing accounting tools or struggling with reporting control."
        : "Send as an educational follow-up for early-stage ERP conversations that need a clearer evaluation path.",
    salesFollowUpAngle: `Use after discovery calls where the prospect mentions ${brief.primaryIssue.toLowerCase()}; offer ${ctaArticle} ${cta}.`,
    suggestedFaqQuestions: [
      `When should a business review ${topic}?`,
      `What are the warning signs that ${topic} needs specialist advice?`,
      `How can ERP Experts help with ${topic}?`,
    ],
    suggestedMetaTitle: `${title} | ERP Experts`,
    suggestedMetaDescription: metaDescriptionForTitle(topic, cta),
  };
}

function hasIssue(qa, pattern) {
  return [...(qa?.issues?.structural || []), ...(qa?.issues?.warnings || [])].some((issue) => pattern.test(issue));
}

function buildImplementationPlan(rec, brief) {
  if (rec.type !== "improve_existing") return null;

  const qa = rec.qa || {};
  const metrics = qa.metrics || {};
  const scores = qa.categoryScores || {};
  const cta = brief.recommendedCTA;
  const ctaArticle = /^[aeiou]/i.test(cta) ? "an" : "a";
  const sectionsToImprove = [];
  const missingElements = [];
  const suggestedNewSectionHeadings = [];
  const riskNotes = [];

  if (metrics.introWords < 60 || hasIssue(qa, /intro/i)) {
    sectionsToImprove.push("Opening section: expand the problem statement and make the reader's risk clear within the first 60-90 words.");
  }

  if (metrics.thinTipsCount > 0 || metrics.bodyDepthWords < 450 || scores.contentDepth < 70) {
    sectionsToImprove.push(`Main body: expand thin sections with concrete examples, decision criteria, or recovery steps. Current thin section count: ${metrics.thinTipsCount || 0}.`);
  }

  if (hasIssue(qa, /conclusion/i)) {
    sectionsToImprove.push("Conclusion: add a practical summary that tells the reader what to check next.");
    missingElements.push("Clear conclusion that reinforces the commercial next step.");
  }

  if (hasIssue(qa, /disclaimer/i)) {
    missingElements.push("Short disclaimer where the topic could be read as financial, operational, or implementation advice.");
  }

  if (!metrics.hasServiceRelevantCTA || scores.ctaServiceRelevance < 70) {
    sectionsToImprove.push(`CTA area: replace the weak or missing CTA with a specific ${cta}.`);
    missingElements.push(`Service-relevant CTA linked to ${cta}.`);
  }

  if (!metrics.internalPathCTA || scores.internalLinkReadiness < 70) {
    missingElements.push("Internal links from the article to relevant service or contact pages.");
  }

  if (!metrics.hasPublishedAt || scores.freshnessPublishedAtValidity < 70) {
    missingElements.push("Valid publishedAt value so freshness checks and reporting stay reliable.");
  }

  if (cta === "implementation consultation") {
    suggestedNewSectionHeadings.push("Implementation risks to check before the project continues");
    suggestedNewSectionHeadings.push("What to do if the warning signs are already visible");
  } else if (cta === "support review") {
    suggestedNewSectionHeadings.push("Support issues that should not become business as usual");
    suggestedNewSectionHeadings.push("When to bring in a NetSuite support partner");
  } else if (cta === "manufacturing ERP discussion") {
    suggestedNewSectionHeadings.push("Manufacturing signals that the ERP setup needs review");
    suggestedNewSectionHeadings.push("Questions to ask before changing systems or processes");
  } else if (cta === "finance systems review") {
    suggestedNewSectionHeadings.push("Finance control issues to check first");
    suggestedNewSectionHeadings.push("Reporting questions to resolve before the next close");
  } else {
    suggestedNewSectionHeadings.push("Decision criteria to use before choosing the next step");
    suggestedNewSectionHeadings.push("When to ask an ERP specialist for a second view");
  }

  if (rec.sourceSignals.includes("search_demand")) {
    riskNotes.push("Search demand is present, so avoid changing the URL or diluting the core topic while improving quality.");
  }
  if (metrics.nearDuplicateMatches > 0 || scores.duplicateCannibalisationRisk < 80) {
    riskNotes.push("Check neighbouring resources before editing so the article does not overlap with similar ERP topics.");
  }
  if (brief.conversionIntentLabel === "high") {
    riskNotes.push("High commercial intent: keep advice useful, but make the service next step visible and specific.");
  }

  return {
    sectionsToImprove: sectionsToImprove.length ? sectionsToImprove : ["Review the main body for article-specific examples and decision criteria tied to the title."],
    missingElements: missingElements.length ? missingElements : ["No major missing elements from QA, but the article still needs quality improvement before promotion."],
    suggestedNewSectionHeadings,
    strongerCTARecommendation: `Add a concise CTA offering ${ctaArticle} ${cta}, linked from the conclusion and any relevant decision section.`,
    internalLinksToAdd: brief.suggestedInternalLinks.filter((link) => link !== "/resources"),
    riskNotes: riskNotes.length ? riskNotes : ["Keep the current route, slug, and article intent stable; only improve depth, clarity, links, and CTA relevance."],
    reviewQuestions: [
      `Does the revised article answer the problem promised by "${brief.preferredTitle}" without drifting into a new topic?`,
      "Can a reader see the next commercial step without feeling pushed into a generic sales message?",
      "Do the added sections reduce the QA warnings that triggered this brief?",
      "Do internal links point to genuinely relevant ERP Experts service pages?",
    ],
  };
}

function listForPrompt(items) {
  return (items || []).map((item) => `- ${item}`).join("\n");
}

function buildCodexPatchPrompt(brief) {
  if (brief.recommendationType !== "improve_existing" || !brief.implementationPlan) return null;

  const plan = brief.implementationPlan;

  return `Improve one existing ERP Experts resource article safely.

Target article:
- Slug: ${brief.targetSlug}
- Title: ${brief.preferredTitle || brief.targetArticleTitle || brief.targetTitle}
- File: src/data/articles.js

Implementation plan:

Sections to improve:
${listForPrompt(plan.sectionsToImprove)}

Missing elements to add or strengthen:
${listForPrompt(plan.missingElements)}

Suggested new section headings:
${listForPrompt(plan.suggestedNewSectionHeadings)}

CTA angle:
- ${brief.recommendedCTA}
- ${plan.strongerCTARecommendation}

Internal links to add where relevant:
${listForPrompt(plan.internalLinksToAdd)}

Risk notes:
${listForPrompt(plan.riskNotes)}

Review questions:
${listForPrompt(plan.reviewQuestions)}

Constraints:
- Only edit the target article object with slug "${brief.targetSlug}" in src/data/articles.js.
- Preserve the existing article data shape.
- Do not redesign components.
- Do not change routes.
- Do not invent fake customer stories, named customers, statistics, certifications, or unsupported claims.
- Use UK English.
- Keep the article commercially useful but factual and reviewable.
- Avoid reusing the same CTA wording used in other recent article updates; keep the CTA specific to this article's topic.
- Vary the conclusion structure rather than repeating a fixed template.
- Avoid repeating stock phrases such as "clear ownership", "practical next step", or "commercially meaningful".
- Do not auto-publish anything.
- After editing, run npm run lint, npm run build, npm run qa:resources, and npm run seo:briefs.`;
}

function topicCategoryForBrief(brief) {
  const text = norm(`${brief.preferredTitle} ${brief.targetArticleTitle} ${brief.rawQuery || ""} ${brief.recommendedCTA}`);
  if (/failed implementation|poor netsuite implementation|implementation|migration|rescue|recovery/.test(text)) return "implementation";
  if (/support|aftercare|helpdesk|maintenance/.test(text)) return "support";
  if (/manufactur|factory|production|inventory|warehouse/.test(text)) return "manufacturing";
  if (/finance|accounting|accounts receivable|cfo|reporting|financial/.test(text)) return "finance_accounting";
  if (/erp consultant|consultant|partner/.test(text)) return "consulting_partner";
  if (/what is erp|benefits of erp|role of erp|understanding erp|beginner/.test(text)) return "generic_informational";
  return "general_erp";
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildOutcomeScoring(brief) {
  const category = topicCategoryForBrief(brief);
  const text = norm(`${brief.preferredTitle} ${brief.targetArticleTitle} ${brief.rawQuery || ""}`);
  const serviceRelevant = /netsuite|implementation|support|consultant|partner|manufactur|finance|accounting|migration|rescue|aftercare|erp/.test(text);
  const genericInfo = category === "generic_informational";

  const categoryWeight = {
    implementation: 24,
    support: 22,
    manufacturing: 20,
    finance_accounting: 18,
    consulting_partner: 21,
    general_erp: 10,
    generic_informational: -12,
  }[category];

  const ctaWeight = {
    "implementation consultation": 18,
    "support review": 17,
    "manufacturing ERP discussion": 16,
    "finance systems review": 15,
    "audit/readiness check": 14,
  }[brief.recommendedCTA] || 8;

  const estimatedBusinessValue = clampScore(brief.conversionIntentScore * 0.45 + brief.priorityScore * 0.25 + categoryWeight + ctaWeight + (serviceRelevant ? 8 : 0) - (genericInfo ? 14 : 0));
  const estimatedLeadIntent = clampScore(brief.conversionIntentScore * 0.7 + ctaWeight + (serviceRelevant ? 6 : 0) - (genericInfo ? 22 : 0));
  const assistedConversionPotential = clampScore(brief.priorityScore * 0.35 + brief.conversionIntentScore * 0.35 + categoryWeight + (brief.suggestedInternalLinks.length * 3) - (genericInfo ? 10 : 0));
  const strategicImportance = clampScore(brief.priorityScore * 0.3 + categoryWeight + (brief.sourceSignals?.includes("content_gap") ? 14 : 0) + (brief.sourceSignals?.includes("search_demand") ? 10 : 0) + (serviceRelevant ? 8 : 0));
  const confidenceLevel = clampScore(55 + (brief.sourceSignals?.length || 0) * 8 + (brief.conversionIntentLabel === "high" ? 12 : 0) + (brief.recommendationType === "improve_existing" ? 6 : 0) - (genericInfo ? 12 : 0));

  const average = (estimatedBusinessValue + estimatedLeadIntent + assistedConversionPotential + strategicImportance) / 4;
  const outcomeLabel = genericInfo && average < 65
    ? "awareness_only"
    : average >= 72 && confidenceLevel >= 65
      ? "high_value"
      : average >= 48
        ? "medium_value"
        : "awareness_only";

  const whyThisMattersCommercially = outcomeLabel === "high_value"
    ? `${brief.preferredTitle} is likely to support commercially meaningful conversations because it combines ${brief.conversionIntentLabel} conversion intent with ${category.replace("_", "/")} service relevance.`
    : outcomeLabel === "medium_value"
      ? `${brief.preferredTitle} has useful commercial potential, but should be treated as nurture or assisted-conversion content until real lead outcomes are recorded.`
      : `${brief.preferredTitle} is mainly awareness content for now; keep the CTA light and use outcome data before giving it more commercial priority.`;

  return {
    estimatedBusinessValue,
    estimatedLeadIntent,
    assistedConversionPotential,
    strategicImportance,
    confidenceLevel,
    outcomeLabel,
    whyThisMattersCommercially,
    leadsGenerated: null,
    assistedConversions: null,
    rankingMovement: null,
    manualOutcomeNotes: "",
  };
}

function buildActionBriefs(recommendations) {
  return recommendations.map((rec) => {
    const primaryIssue = rec.sourceSignals.includes("blocked_structural_issue")
      ? "Blocked structural QA issue"
      : rec.sourceSignals.includes("poor_qa_score")
        ? "Weak QA score or content quality warning"
        : rec.sourceSignals.includes("content_gap")
          ? "Uncovered search intent"
          : "Search demand needs monitoring";

    const suggestedContentChanges = rec.type === "create_new"
      ? [
        "Draft a focused resource around the exact search intent.",
        "Add a clear intro, practical sections, conclusion, disclaimer, and metadata.",
        "Include examples that connect the topic back to NetSuite decision-making.",
      ]
      : [
        "Strengthen the intro so the target problem is clear within the first 60 words.",
        "Expand thin sections with practical detail, examples, or decision criteria.",
        "Tighten the conclusion and make the next step explicit.",
      ];

    const brief = {
      recommendationType: rec.type,
      targetArticleTitle: rec.title,
      preferredTitle: rec.preferredTitle || rec.title,
      rawQuery: rec.rawQuery || null,
      targetSlug: rec.slug,
      displayRank: rec.displayRank || null,
      sprintCandidate: Boolean(rec.sprintCandidate),
      sprintReason: rec.sprintReason || "",
      articleTypeBucket: rec.articleTypeBucket || "commercial",
      priorityScore: rec.priorityScore,
      conversionIntentScore: rec.conversionIntentScore,
      conversionIntentLabel: rec.conversionIntentLabel,
      whyThisMatters: rec.reason,
      primaryIssue,
      suggestedContentChanges,
      suggestedInternalLinks: suggestedLinksForRecommendation(rec),
      suggestedCtaAngle: ctaAngleForRecommendation(rec),
      recommendedCTA: rec.recommendedCTA || ctaAngleForRecommendation(rec),
      reviewChecklist: [
        "Metadata is complete and matches the search intent.",
        "Intro, section depth, conclusion, and disclaimer pass Resource QA.",
        "Internal links support the commercial next step.",
        "CTA is relevant to the reader's likely problem.",
        "Run npm run qa:resources after changes.",
      ],
      sourceSignals: rec.sourceSignals,
      titleQualityChecks: titleQualityChecks(rec.preferredTitle || rec.title, rec.rawQuery || rec.title),
    };
    const briefWithPlans = {
      ...brief,
      ...buildOutcomeScoring(brief),
      channelOutputs: buildChannelOutputs(brief),
      implementationPlan: buildImplementationPlan(rec, brief),
    };
    return {
      ...briefWithPlans,
      codexPatchPrompt: buildCodexPatchPrompt(briefWithPlans),
    };
  });
}

const qaReport = readJson(QA_REPORT_PATH);
const reports = readJson(REPORTS_DATA_PATH, {});
const statuses = readJson(STATUS_PATH, {});

if (!qaReport) {
  console.error(`Missing QA report at ${QA_REPORT_PATH}. Run npm run qa:resources first.`);
  process.exit(1);
}

const demandSignals = reports?.ga4Period?.seoInsights?.demandSignals || {};
const recommendations = buildRecommendations({
  qaReport,
  allItems: roadmapItemsFromReports(reports, statuses),
  demandGaps: demandSignals.contentGaps || [],
  topicBacklog: demandSignals.topicBacklogV2 || [],
});
const briefs = buildActionBriefs(recommendations);
const topBriefs = briefs.filter((b) => (b.displayRank || 9999) <= DASHBOARD_BRIEF_LIMIT);
const sprintBacklogBriefs = briefs
  .filter((b) => (b.displayRank || 9999) <= SPRINT_BACKLOG_LIMIT && (b.displayRank || 0) > DASHBOARD_BRIEF_LIMIT)
  .slice(0, SPRINT_BACKLOG_LIMIT - DASHBOARD_BRIEF_LIMIT);

const payload = {
  generatedAt: new Date().toISOString(),
  sourceReports: {
    qaReport: path.relative(process.cwd(), QA_REPORT_PATH),
    reportsData: path.relative(process.cwd(), REPORTS_DATA_PATH),
    statuses: path.relative(process.cwd(), STATUS_PATH),
  },
  recommendationCount: recommendations.length,
  dashboardBriefCount: topBriefs.length,
  sprintBacklogCount: sprintBacklogBriefs.length,
  briefs: topBriefs,
  sprintBacklogBriefs,
  allBriefs: briefs,
};

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log("SEO Action Briefs");
console.log(`Generated ${briefs.length} total briefs.`);
console.log(`Dashboard briefs: ${topBriefs.length}; sprint backlog briefs: ${sprintBacklogBriefs.length}`);
console.log(`Report written: ${OUTPUT_PATH}`);
for (const brief of topBriefs.slice(0, 5)) {
  console.log(`  - ${brief.preferredTitle}: ${brief.recommendationType}, priority ${brief.priorityScore}`);
}
