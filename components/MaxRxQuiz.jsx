import { useState, useEffect } from "react";
// quiz-bundle-v4

// ?? Post Affiliates Pro ---
const PAP_ACCOUNT_ID = "default1";
const PAP_SCRIPT_URL = "https://pap.gomaxrx.com/scripts/3gn939v8j";

function loadPAPScript() {
  if (typeof window === "undefined") return;
  if (document.getElementById("pap_x2s6df8d")) return;
  const s = document.createElement("script");
  s.id = "pap_x2s6df8d";
  s.src = PAP_SCRIPT_URL;
  s.async = true;
  s.onload = () => {
    try { PostAffTracker.setAccountId(PAP_ACCOUNT_ID); PostAffTracker.track(); } catch(e) {}
  };
  document.head.appendChild(s);
}

function getPAPAffiliateId() {
  try {
    if (typeof PostAffTracker !== "undefined" && PostAffTracker.getAffInfo) {
      const info = PostAffTracker.getAffInfo();
      if (info && info.getAffiliateId) return info.getAffiliateId() || "";
    }
  } catch(e) {}
  return "";
}

function firePAPAction(code) {
  try {
    if (typeof PostAffTracker !== "undefined" && PostAffTracker.createAction) {
      PostAffTracker.register(PostAffTracker.createAction(code));
    }
  } catch(e) {}
}

// ?? Affiliate / UTM tracking ---
// ── Attribution & Share Tracking ─────────────────────────────────────
// All PAP/UTM params captured on landing, persisted in localStorage,
// and forwarded into share URLs so attribution is never lost.

const MHA_STORAGE_KEY = "mha_attribution";
const MHA_BASE_URL = "https://meniq.co";

// PAP and UTM params we preserve exactly as received
const INBOUND_PARAMS = [
  "a_aid", "a_bid", "a_cid",          // Post Affiliates Pro
  "affiliate", "ref", "pap_aid", "aid", // legacy affiliate
  "utm_source", "utm_medium",
  "utm_campaign", "utm_content",
  "utm_term", "source",
];

function getTrackingParams() {
  try {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );

    // Load previously stored attribution
    let stored = {};
    try {
      stored = JSON.parse(
        localStorage.getItem(MHA_STORAGE_KEY) ||
        sessionStorage.getItem("mha_track") || "{}"
      );
    } catch(_) {}

    // Build tracking object — URL params take priority over stored
    const tracking = {};
    INBOUND_PARAMS.forEach(key => {
      tracking[key] = params.get(key) || stored[key] || "";
    });

    // Persist to both stores for resilience
    try { localStorage.setItem(MHA_STORAGE_KEY, JSON.stringify(tracking)); } catch(_) {}
    try { sessionStorage.setItem("mha_track", JSON.stringify(tracking)); } catch(_) {}

    return tracking;
  } catch(_) {
    return Object.fromEntries(INBOUND_PARAMS.map(k => [k, ""]));
  }
}

// Build a share URL preserving original attribution + share markers
// channel: "tiktok" | "instagram" | "x" | "telegram" | "whatsapp"
function buildShareUrl(tracking, channel, result) {
  try {
    const url = new URL(MHA_BASE_URL);

    // 1. Preserve original PAP/affiliate params exactly as received
    ["a_aid", "a_bid", "a_cid", "affiliate", "ref", "pap_aid", "aid"].forEach(k => {
      if (tracking[k]) url.searchParams.set(k, tracking[k]);
    });

    // 2. Share-specific UTM markers
    url.searchParams.set("utm_source", "meniq_share");
    url.searchParams.set("utm_medium", "share_button");
    url.searchParams.set("share_channel", channel);
    url.searchParams.set("share", "1");

    // 3. Preserve original campaign if present
    if (tracking.utm_campaign) {
      url.searchParams.set("utm_campaign", tracking.utm_campaign);
    }


    return url.toString();
  } catch(_) {
    return MHA_BASE_URL + "?share=1&share_channel=" + channel;
  }
}

// Analytics: track share button taps
function fireShareEvent(channel, tracking, result) {
  try {
    // Fire PAP action if affiliate is present
    if (tracking.a_aid || tracking.affiliate) {
      firePAPAction("share");
    }
    // Console log for dev visibility
    console.log("[MenIQ Share]", {
      channel,
      hasPAP: !!(tracking.a_aid || tracking.affiliate),
      a_aid: tracking.a_aid || null,
      utm_campaign: tracking.utm_campaign || null,
      result_key: result?.key || null,
      score: result?.confidence || null,
    });
    // Fire gtag if available
    if (typeof gtag !== "undefined") {
      gtag("event", "share_button_clicked", {
        share_channel: channel,
        has_pap: !!(tracking.a_aid || tracking.affiliate),
        result_key: result?.key || null,
      });
    }
  } catch(_) {}
}
// ─────────────────────────────────────────────────────────────────

function buildCTAUrl(base, tracking) {
  const url = new URL(base.startsWith("http") ? base : `https://${base}`);
  Object.entries(tracking).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
  return url.toString();
}

// ?? Google Sheets webhook URL - replace with your Apps Script Web App URL ---
const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycby17BXJ_ZwB0j6akuE7Qdq-jW4fCbRpx-x8b4dEggn9c-BZdOOtyswQfztOz26EsqirDQ/exec";

// ?? Quiz data ---
const QUIZZES = {
  ed: {
    id: "ed",
    title: "Bedroom Confidence Score",
    subtitle: "Discover your personalized ED profile in 60 seconds",
    ctaBase: "https://gomaxrx.com/mens-health-consult",
    ctaLabel: "Start My Free Visit",
    questions: [
      {
        id: "age",
        text: "How old are you?",
        options: [
          { label: "18-29", value: 0 },
          { label: "30-44", value: 1 },
          { label: "45-59", value: 2 },
          { label: "60+", value: 3 },
        ],
      },
      {
        id: "frequency",
        text: "How often do performance issues occur?",
        options: [
          { label: "Rarely - once in a while", value: 0 },
          { label: "Occasionally - a few times a month", value: 1 },
          { label: "Frequently - most of the time", value: 2 },
          { label: "Almost always", value: 3 },
        ],
      },
      {
        id: "progression",
        text: "How has this changed over the past year?",
        options: [
          { label: "Stayed the same", value: 0 },
          { label: "Slightly worse", value: 1 },
          { label: "Noticeably worse", value: 2 },
          { label: "Significantly worse", value: 3 },
        ],
      },
      {
        id: "stress",
        text: "How would you rate your current stress level?",
        options: [
          { label: "Low - pretty relaxed", value: 0 },
          { label: "Moderate - manageable", value: 1 },
          { label: "High - often overwhelmed", value: 2 },
          { label: "Very high - constant pressure", value: 3 },
        ],
      },
      {
        id: "morning",
        text: "Do you experience morning erections?",
        options: [
          { label: "Yes, regularly", value: 0 },
          { label: "Sometimes", value: 1 },
          { label: "Rarely", value: 2 },
          { label: "Never", value: 3 },
        ],
      },
      {
        id: "treatment",
        text: "Are you open to a discreet, FDA-approved treatment?",
        options: [
          { label: "Absolutely - let's do it", value: 0 },
          { label: "Yes, if it's private", value: 0 },
          { label: "Maybe - I want to learn more", value: 1 },
          { label: "Not sure yet", value: 1 },
        ],
      },
    ],
    results: [
      {
        key: "occasional",
        range: [0, 5],
        headline: "Occasional Dip - Easy to Address",
        emoji: "🟢",
        explanation:
          "Your responses suggest stress or lifestyle factors are the likely cause. The good news: occasional ED is extremely common and very treatable.",
        bullets: [
          "Likely tied to stress or sleep quality",
          "Strong baseline - minor intervention may be all you need",
          "Most men in your profile see results in days",
        ],
        confidence: 72,
      },
      {
        key: "stress",
        range: [6, 10],
        headline: "Stress-Linked Pattern Detected",
        emoji: "🟡",
        explanation:
          "Your profile shows a stress-performance link. When your mind is under pressure, it affects your body. A targeted approach can break this cycle fast.",
        bullets: [
          "Performance anxiety amplifies the issue",
          "Psychological and physical factors intertwined",
          "Treatment + habit shifts can restore confidence quickly",
        ],
        confidence: 81,
      },
      {
        key: "progressive",
        range: [11, 14],
        headline: "Progressive Pattern - Act Now",
        emoji: "🟠",
        explanation:
          "Your results suggest a worsening pattern that won't resolve on its own. The earlier you address this, the better - and modern treatment is highly effective.",
        bullets: [
          "Condition has been progressing over time",
          "Morning erection frequency is a key clinical signal",
          "FDA-approved options have 80%+ success rates",
        ],
        confidence: 88,
      },
      {
        key: "treatment",
        range: [15, 100],
        headline: "Treatment Strongly Recommended",
        emoji: "🔴",
        explanation:
          "Based on your responses, professional evaluation and medical treatment is the clear next step. Don't wait - this is highly treatable and very private.",
        bullets: [
          "Multiple clinical signals present",
          "Discreet online consultation available today",
          "No awkward in-person visits required",
        ],
        confidence: 94,
      },
    ],
  },
  hair: {
    id: "hair",
    title: "Hairline Risk Score",
    subtitle: "Find out where you stand in 60 seconds",
    ctaBase: "https://gomaxrx.com/treatments/male-hair-loss",
    ctaLabel: "Start My Free Visit",
    questions: [
      {
        id: "age",
        text: "How old are you?",
        options: [
          { label: "18-24", value: 0 },
          { label: "25-34", value: 1 },
          { label: "35-44", value: 2 },
          { label: "45+", value: 3 },
        ],
      },
      {
        id: "location",
        text: "Where is the thinning most noticeable?",
        options: [
          { label: "Temples only", value: 1 },
          { label: "Crown / top of head", value: 2 },
          { label: "Temples and crown", value: 3 },
          { label: "Overall diffuse thinning", value: 2 },
        ],
      },
      {
        id: "duration",
        text: "How long has this been happening?",
        options: [
          { label: "Less than 6 months", value: 0 },
          { label: "6 months - 1 year", value: 1 },
          { label: "1-3 years", value: 2 },
          { label: "More than 3 years", value: 3 },
        ],
      },
      {
        id: "rate",
        text: "How fast is it progressing?",
        options: [
          { label: "Very slowly - barely noticeable", value: 0 },
          { label: "Gradually - I notice it every few months", value: 1 },
          { label: "Steadily - visible change month to month", value: 2 },
          { label: "Rapidly - changes week to week", value: 3 },
        ],
      },
      {
        id: "family",
        text: "Family history of hair loss?",
        options: [
          { label: "None that I know of", value: 0 },
          { label: "One parent or grandparent", value: 1 },
          { label: "Both sides of the family", value: 2 },
          { label: "Significant family history", value: 3 },
        ],
      },
      {
        id: "treatments",
        text: "What have you tried for hair loss?",
        options: [
          { label: "Nothing yet", value: 0 },
          { label: "Shampoos / supplements", value: 0 },
          { label: "Minoxidil (Rogaine)", value: 1 },
          { label: "Multiple treatments, limited success", value: 2 },
        ],
      },
    ],
    results: [
      {
        key: "early",
        range: [0, 4],
        headline: "Early Stage - Prevention Window Open",
        emoji: "🟢",
        explanation:
          "You're catching this early. That's the best time to act. Prevention is far easier than reversal - and the right treatment now can lock in your current hairline.",
        bullets: [
          "Genetic risk is low to moderate",
          "Early intervention has highest success rate",
          "Daily topical treatments are highly effective at this stage",
        ],
        confidence: 78,
      },
      {
        key: "active",
        range: [5, 9],
        headline: "Active Thinning - Time to Intervene",
        emoji: "🟡",
        explanation:
          "Your hair loss is actively progressing. Without treatment, this will continue. The good news: proven medications can stop loss and - for many - regrow hair.",
        bullets: [
          "DHT-driven follicle miniaturization is likely the cause",
          "Finasteride stops loss in 87% of men",
          "Combination therapy outperforms single-treatment approaches",
        ],
        confidence: 84,
      },
      {
        key: "aggressive",
        range: [10, 14],
        headline: "Aggressive Recession Detected",
        emoji: "🟠",
        explanation:
          "Your profile shows significant, rapid hair loss. This requires a comprehensive approach. Medical treatment is your best path to preserving what you have and potentially regrowing more.",
        bullets: [
          "Multi-factor pattern emerging",
          "Strong genetic component likely",
          "Prescription-strength treatment recommended immediately",
        ],
        confidence: 91,
      },
      {
        key: "opportunity",
        range: [15, 100],
        headline: "Critical Treatment Opportunity",
        emoji: "🔴",
        explanation:
          "Your responses indicate advanced hair loss progression. A personalized medical plan - potentially including multiple therapies - can make a meaningful difference.",
        bullets: [
          "Long-term pattern well established",
          "Combination treatments show best results",
          "Discreet online prescription available today",
        ],
        confidence: 93,
      },
    ],
  },
  testosterone: {
    id: "testosterone",
    title: "Is Your Testosterone Low?",
    subtitle: "Find out your T-level risk profile in 60 seconds",
    ctaBase: "https://gomaxrx.com/products/edge",
    ctaLabel: "Start My Free Visit",
    questions: [
      {
        id: "age",
        text: "How old are you?",
        options: [
          { label: "18-29", value: 0 },
          { label: "30-39", value: 1 },
          { label: "40-49", value: 2 },
          { label: "50+",   value: 3 },
        ],
      },
      {
        id: "energy",
        text: "How would you describe your energy levels throughout the day?",
        options: [
          { label: "Strong - I feel energized most of the day", value: 0 },
          { label: "Moderate - I hit afternoon slumps regularly", value: 1 },
          { label: "Low - I feel tired most of the time", value: 2 },
          { label: "Exhausted - fatigue is constant, even after sleep", value: 3 },
        ],
      },
      {
        id: "libido",
        text: "Compared to a few years ago, how has your sex drive changed?",
        options: [
          { label: "No change - still strong", value: 0 },
          { label: "Slightly lower - I notice a difference", value: 1 },
          { label: "Noticeably lower - significantly less interest", value: 2 },
          { label: "Very low or almost none", value: 3 },
        ],
      },
      {
        id: "mood",
        text: "How often do you experience irritability, low motivation, or 'brain fog'?",
        options: [
          { label: "Rarely - I feel mentally sharp and positive", value: 0 },
          { label: "Occasionally - a few times a month", value: 1 },
          { label: "Often - it affects my daily life", value: 2 },
          { label: "Almost daily - it's my baseline now", value: 3 },
        ],
      },
      {
        id: "body",
        text: "Have you noticed changes in body composition - less muscle, more fat?",
        options: [
          { label: "No - my body feels about the same", value: 0 },
          { label: "Slightly - a bit softer despite similar habits", value: 1 },
          { label: "Yes - noticeable muscle loss or belly fat increase", value: 2 },
          { label: "Significant - difficult to maintain muscle at all", value: 3 },
        ],
      },
      {
        id: "sleep",
        text: "How is your sleep quality?",
        options: [
          { label: "Good - I wake up refreshed", value: 0 },
          { label: "Fair - sometimes restless but manageable", value: 1 },
          { label: "Poor - I rarely sleep well", value: 2 },
          { label: "Very poor - disrupted sleep most nights", value: 3 },
        ],
      },
      {
        id: "tested",
        text: "Have you ever had your testosterone levels tested?",
        options: [
          { label: "Yes - and levels were normal", value: 0 },
          { label: "Yes - and levels were low or borderline", value: 3 },
          { label: "No - but I suspect they may be low", value: 2 },
          { label: "No - this is my first time looking into it", value: 1 },
        ],
      },
    ],
    results: [
      {
        key: "optimal",
        range: [0, 5],
        headline: "Your T-Levels Appear Healthy",
        emoji: "🟢",
        explanation:
          "Your responses suggest your testosterone is likely in a healthy range. That said, levels naturally decline with age - knowing your baseline now gives you a head start.",
        bullets: [
          "Low symptom burden - strong baseline indicators",
          "Proactive monitoring can catch early decline",
          "Lifestyle optimization can sustain healthy T long-term",
        ],
        confidence: 74,
      },
      {
        key: "borderline",
        range: [6, 11],
        headline: "Borderline Signs - Worth Investigating",
        emoji: "🟡",
        explanation:
          "Your profile shows several symptoms associated with declining testosterone. These signals don't confirm low T, but they're worth taking seriously with a proper evaluation.",
        bullets: [
          "Energy, libido, or mood changes are common early indicators",
          "A simple blood test can confirm your actual levels",
          "Early intervention yields the best long-term outcomes",
        ],
        confidence: 82,
      },
      {
        key: "likely_low",
        range: [12, 17],
        headline: "Low Testosterone Is Likely",
        emoji: "🟠",
        explanation:
          "Your responses align closely with clinically recognized low-T symptoms. Multiple markers - energy, libido, mood, and body composition - are all pointing in the same direction.",
        bullets: [
          "Symptom cluster is highly consistent with hypogonadism",
          "TRT (Testosterone Replacement Therapy) has high success rates",
          "A licensed clinician can review your case discreetly online",
        ],
        confidence: 89,
      },
      {
        key: "action_needed",
        range: [18, 100],
        headline: "Strong Indicators of Low Testosterone",
        emoji: "🔴",
        explanation:
          "Your profile strongly suggests clinically low testosterone. The combination of fatigue, libido loss, mood changes, body composition shifts, and sleep disruption is a clear pattern that needs attention.",
        bullets: [
          "Multiple high-risk clinical markers present",
          "TRT can restore energy, drive, and body composition",
          "Online clinician visit - no awkward in-person appointment",
        ],
        confidence: 95,
      },
    ],
  },
  partner: {
    id: "partner",
    title: "What Does Your Lover Really Think?",
    subtitle: "Love & Intimacy Confidence Score",
    ctaLabel: "Start My Free Visit",
    ctaBase: "https://gomaxrx.com/products/edge",
    questions: [
      {
        id: "initiate",
        text: "How often does she initiate intimacy?",
        options: [
          { key: "a", label: "Rarely - it's almost always me", value: 3 },
          { key: "b", label: "She used to more than she does now", value: 2 },
          { key: "c", label: "Sometimes - about even", value: 1 },
          { key: "d", label: "Often - she's enthusiastic", value: 0 },
        ],
      },
      {
        id: "after",
        text: "How does she seem after intimacy?",
        options: [
          { key: "a", label: "Distant or quiet - hard to read", value: 3 },
          { key: "b", label: "Fine but not especially connected", value: 2 },
          { key: "c", label: "Happy and affectionate", value: 1 },
          { key: "d", label: "Very connected - brings us closer", value: 0 },
        ],
      },
      {
        id: "hints",
        text: "Has she ever hinted she wants more from you?",
        options: [
          { key: "a", label: "She's said it directly", value: 3 },
          { key: "b", label: "She's dropped hints", value: 2 },
          { key: "c", label: "Not recently", value: 1 },
          { key: "d", label: "Never - she seems satisfied", value: 0 },
        ],
      },
      {
        id: "energy",
        text: "How's your energy and drive around her lately?",
        options: [
          { key: "a", label: "Low - I'm often tired or distracted", value: 3 },
          { key: "b", label: "Inconsistent - up and down", value: 2 },
          { key: "c", label: "Pretty good most of the time", value: 1 },
          { key: "d", label: "High - I feel motivated and present", value: 0 },
        ],
      },
      {
        id: "confidence",
        text: "How confident do you feel in intimate moments?",
        options: [
          { key: "a", label: "Not confident - I'm in my head", value: 3 },
          { key: "b", label: "Sometimes uncertain", value: 2 },
          { key: "c", label: "Mostly confident", value: 1 },
          { key: "d", label: "Very confident and present", value: 0 },
        ],
      },
      {
        id: "age",
        text: "How old are you?",
        options: [
          { key: "a", label: "18-29", value: 0 },
          { key: "b", label: "30-39", value: 0 },
          { key: "c", label: "40-49", value: 0 },
          { key: "d", label: "50+", value: 0 },
        ],
      },
    ],
    results: [
      {
        key: "strong",
        range: [0, 3],
        headline: "Strong Connection",
        emoji: "💚",
        explanation: "Your relationship scores well across the board. She feels connected, you feel confident, and the dynamic between you is healthy. The key now is maintaining momentum - small consistent efforts keep strong relationships strong.",
        bullets: [
          "Mutual initiation is a strong sign of healthy attraction",
          "Emotional connection after intimacy reflects deep bonding",
          "Staying proactive keeps energy levels and drive high",
        ],
        confidence: 88,
      },
      {
        key: "room_to_grow",
        range: [4, 7],
        headline: "Room To Grow",
        emoji: "💛",
        explanation: "Things are decent but something is quietly getting in the way. She may not have said anything yet - but these small gaps tend to grow over time if left unaddressed. The good news: small changes make a big difference here.",
        bullets: [
          "Minor dips in energy and confidence are often hormonal",
          "She notices effort - even small improvements register",
          "Most men in this range respond well to targeted support",
        ],
        confidence: 79,
      },
      {
        key: "drifting",
        range: [8, 11],
        headline: "Things Have Quietly Shifted",
        emoji: "🧡",
        explanation: "There's a gap forming between you and it's affecting how she sees the relationship. She may not have said everything she's thinking. This pattern is common and very fixable - but it needs attention now before it widens.",
        bullets: [
          "Reduced drive and confidence are often linked to low testosterone",
          "Partners notice changes in energy before men admit them",
          "Early intervention makes a significant difference",
        ],
        confidence: 84,
      },
      {
        key: "red_flag",
        range: [12, 100],
        headline: "She's Noticed - And Hasn't Said Everything",
        emoji: "💔",
        explanation: "Your responses suggest the relationship is under real strain. She's likely noticed the change in your energy, confidence, or presence - even if she hasn't said it directly. This is fixable, but it starts with being honest with yourself.",
        bullets: [
          "Low testosterone is the leading cause of this pattern in men",
          "Performance and confidence issues are medical - not personal failures",
          "A discreet online consultation takes under 10 minutes",
        ],
        confidence: 91,
      },
    ],
  },
};

// ?? Scoring ---
// ?? Peer comparison data ---
const PEER_DATA = {
  ed: {
    "18-29": { affected: 26, untreated: 71, label: "men 18-29" },
    "30-44": { affected: 40, untreated: 74, label: "men 30-44" },
    "45-59": { affected: 57, untreated: 78, label: "men 45-59" },
    "60+":   { affected: 70, untreated: 82, label: "men 60+" },
  },
  hair: {
    "18-24": { affected: 16, untreated: 68, label: "men 18-24" },
    "25-34": { affected: 44, untreated: 72, label: "men 25-34" },
    "35-44": { affected: 62, untreated: 79, label: "men 35-44" },
    "45+":   { affected: 75, untreated: 83, label: "men 45+" },
  },
  testosterone: {
    "18-29": { affected: 12, untreated: 65, label: "men 18-29" },
    "30-39": { affected: 24, untreated: 70, label: "men 30-39" },
    "40-49": { affected: 38, untreated: 76, label: "men 40-49" },
    "50+":   { affected: 52, untreated: 81, label: "men 50+" },
  },
  partner: {
    "18-29": { affected: 31, untreated: 67, label: "men 18-29" },
    "30-39": { affected: 44, untreated: 72, label: "men 30-39" },
    "40-49": { affected: 58, untreated: 77, label: "men 40-49" },
    "50+":   { affected: 64, untreated: 80, label: "men 50+" },
  },
};

// Max possible score per quiz (sum of highest option value per question)
const QUIZ_MAX_SCORES = { ed: 16, hair: 17, testosterone: 21, partner: 15 };


function calcResult(quiz, answers) {
  const total = Object.entries(answers)
    .filter(([k]) => k !== "_lastPick")
    .reduce((s, [, v]) => s + v, 0);

  // Match result bucket by raw score range
  const result = (
    quiz.results.find((r) => total >= r.range[0] && total <= r.range[1]) ||
    quiz.results[quiz.results.length - 1]
  );

  // Dynamic score: raw score / max = concern % (higher score = higher concern)
  const maxScore = QUIZ_MAX_SCORES[quiz.id] || 18;
  const dynamicScore = Math.min(99, Math.max(5, Math.round((total / maxScore) * 100)));

  // Age bracket for peer comparison
  const ageAnswer = answers["age"];
  const ageOptions = quiz.questions.find(q => q.id === "age")?.options || [];
  const ageBracket = ageOptions.find(o => o.value === ageAnswer)?.label || null;

  return { ...result, confidence: dynamicScore, ageBracket };
}

const LOADING_MSGS = [
  "Analyzing your responses...",
  "Building your profile...",
  "Personalizing your results...",
];

// ?? Inline CSS ---
const CSS = `
  /* Fonts loaded via <Head> in index.js */

  .mrx-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .mrx-root {
    --red: #C0392B;
    --red-bright: #E74C3C;
    --red-dim: #8B2020;
    --bg: #0A0A0A;
    --surface: #141414;
    --surface2: #1E1E1E;
    --border: #2A2A2A;
    --text: #F0EDE8;
    --muted: #888;
    --track: #222;
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  .mrx-app {
    width: 100%;
    max-width: 100%;
    margin: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  @media (min-width: 421px) {
    .mrx-app {
      max-width: 420px;
      margin: 0 auto;
    }
  }
  /* Prevent horizontal overflow on mobile */
  html, body { max-width: 100%; overflow-x: hidden; }

  .mrx-logo {
    padding: 16px 0 0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    text-align: center;
  }
  .mrx-logo svg { display: block; margin: 0 auto; }

  /* Screen transition */
  .mrx-screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 24px 40px;
    animation: mrxSlide .3s ease forwards;
  }
  @keyframes mrxSlide {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Progress */
  .mrx-progress { padding: 20px 24px 0; flex-shrink: 0; }
  .mrx-pmeta {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: .06em;
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 8px;
  }
  .mrx-ptrack {
    height: 5px;
    background: var(--track);
    border-radius: 3px;
    overflow: hidden;
  }
  .mrx-pfill {
    height: 100%;
    background: linear-gradient(90deg, var(--red-dim), var(--red-bright));
    border-radius: 2px;
    transition: width .5s cubic-bezier(.4,0,.2,1);
  }

  /* Welcome */
  .mrx-welcome { padding-top: 48px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
  .mrx-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(192,57,43,.15); border: 1px solid rgba(192,57,43,.3);
    color: var(--red-bright); font-size: 11px; font-weight: 600;
    letter-spacing: .08em; text-transform: uppercase;
    padding: 5px 12px; border-radius: 100px; width: fit-content; margin-bottom: 20px;
  }
  .mrx-badge-dot {
    width: 5px; height: 5px; background: var(--red-bright);
    border-radius: 50%; animation: mrxPulse 2s infinite;
  }
  @keyframes mrxBubblePulse {
    0%   { transform: scale(1);    filter: brightness(1); }
    50%  { transform: scale(1.04); filter: brightness(1.2); }
    100% { transform: scale(1);    filter: brightness(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .mrx-status-bubble { animation: none !important; }
  }
  @keyframes mrxPulse { 0%,100%{opacity:1} 50%{opacity:.35} }
  .mrx-h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(52px, 15vw, 64px);
    line-height: .92;
    letter-spacing: .01em;
    margin-bottom: 18px;
  }
  .mrx-h1 span { color: var(--red-bright); display: block; }
  .mrx-wsub {
    font-size: 15px; color: var(--muted); line-height: 1.65;
    font-weight: 300; margin-bottom: 36px; max-width: 300px;
  }
  .mrx-hook { margin: 16px 0 20px; display: flex; flex-direction: column; gap: 6px; }
  .mrx-hook-line { font-size: 16px; color: var(--muted); margin: 0; line-height: 1.6; }
  .mrx-hook-cta { font-size: 17px; font-weight: 700; color: var(--red-bright); margin: 4px 0 0; line-height: 1.5; }
  .mrx-social-proof { margin: 0 0 20px; }
  .mrx-proof-count { font-size: 15px; color: var(--muted); margin: 0 0 10px; }
  .mrx-checks { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
  .mrx-checks li { font-size: 16px; color: var(--muted); display: flex; align-items: center; gap: 10px; }
  .mrx-check { color: #27ae60; font-size: 16px; font-weight: 700; flex-shrink: 0; }
  .mrx-cards { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
  .mrx-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 18px 20px; cursor: pointer;
    display: flex; align-items: center; gap: 16px;
    transition: all .2s ease; width: 100%; text-align: left;
  }
  .mrx-card:hover { border-color: var(--red-dim); background: var(--surface2); transform: translateY(-1px); }

  .mrx-card-icon {
    width: 48px; height: 48px; background: rgba(192,57,43,.12);
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    font-size: 22px; flex-shrink: 0;
  }
  .mrx-card-info h3 { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
  .mrx-card-info p { font-size: 12px; color: var(--muted); font-weight: 300; }
  .mrx-card-arr { margin-left: auto; color: var(--muted); font-size: 20px; flex-shrink: 0; }

  /* Question */
  .mrx-qhead { padding-top: 28px; margin-bottom: 32px; }
  .mrx-qnum { font-size: 11px; color: var(--muted); letter-spacing: .08em; text-transform: uppercase; font-weight: 500; margin-bottom: 12px; }
  .mrx-qtext { font-family: 'Bebas Neue', sans-serif; font-size: 34px; line-height: 1.05; color: var(--text); }
  .mrx-opts { display: flex; flex-direction: column; gap: 10px; flex: 1; }
  .mrx-opt {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 16px 18px;
    cursor: pointer; color: var(--text); font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 400; line-height: 1.4;
    transition: all .15s ease; position: relative; overflow: hidden;
    display: flex; align-items: center; gap: 12px; text-align: left; width: 100%;
  }
  .mrx-opt:hover { border-color: var(--red-dim); background: var(--surface2); }
  .mrx-opt.sel { border-color: var(--red-bright); background: rgba(192,57,43,.1); }
  .mrx-opt::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 0; background: var(--red-bright); transition: width .2s ease;
  }
  .mrx-opt:hover::before, .mrx-opt.sel::before { width: 3px; }
  .mrx-circle {
    width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--border);
    flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    transition: all .15s ease;
  }
  .mrx-opt.sel .mrx-circle { border-color: var(--red-bright); background: var(--red-bright); }
  .mrx-dot {
    width: 8px; height: 8px; border-radius: 50%; background: white;
    opacity: 0; transform: scale(0); transition: all .15s ease;
  }
  .mrx-opt.sel .mrx-dot { opacity: 1; transform: scale(1); }

  .mrx-nav { display: flex; gap: 10px; margin-top: 16px; }
  .mrx-back {
    background: none; border: none; color: var(--muted); cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 8px 0;
    letter-spacing: .01em; transition: color .15s ease;
  }
  .mrx-back:hover { color: var(--text); }

  /* Loading */
  .mrx-loading {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 28px; padding: 40px 24px;
    animation: mrxSlide .3s ease forwards;
  }
  .mrx-spinner {
    width: 56px; height: 56px; border-radius: 50%;
    border: 2px solid var(--border); border-top-color: var(--red-bright);
    animation: mrxSpin .8s linear infinite;
  }
  @keyframes mrxSpin { to { transform: rotate(360deg); } }
  .mrx-lmsg {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px; letter-spacing: .02em; text-align: center; color: var(--text);
  }
  .mrx-lsub { font-size: 13px; color: var(--muted); text-align: center; }
  .mrx-ldots { display: flex; gap: 6px; justify-content: center; margin-top: 12px; }
  .mrx-ldot { width: 6px; height: 6px; border-radius: 50%; background: var(--border); transition: background .3s ease; }
  .mrx-ldot.on { background: var(--red-bright); }

  /* Result */
  .mrx-result {
    flex: 1; display: flex; flex-direction: column; padding: 20px 24px 40px;
    animation: mrxSlide .4s ease forwards;
  }
  .mrx-rtag {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 600; color: var(--red-bright);
    letter-spacing: .08em; text-transform: uppercase; margin-bottom: 18px;
  }
  .mrx-rtag-dot { width: 5px; height: 5px; background: var(--red-bright); border-radius: 50%; display: inline-block; }
  .mrx-step-indicator { font-size: 12px; color: #6B7280; letter-spacing: .04em; margin: 10px 0 14px; }
  .mrx-friction-line { font-size: 13px; color: var(--muted); text-align: center; line-height: 1.6; margin: 0 0 14px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .mrx-avail-row { display: flex; align-items: center; justify-content: center; gap: 8px; }
  .mrx-avail-dot { width: 7px; height: 7px; border-radius: 50%; background: #34C759; flex-shrink: 0; }
  .mrx-avail-sub { font-size: 13px; color: var(--muted); }

  .mrx-privacy-strip { font-size: 11px; color: #9CA3AF; text-align: center; margin: 8px 0 0; letter-spacing: .02em; }
  .mrx-cta-block {
    margin: 10px 0 0; display: flex; flex-direction: column; gap: 0;
  }
  .mrx-cta-support { margin-bottom: 10px; }
  .mrx-cta-support-line {
    font-size: 14px; color: #888; line-height: 1.6;
    margin: 0; text-align: center; font-weight: 400;
  }
  .mrx-cta-avail {
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .mrx-trust-strip {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; flex-wrap: wrap;
    margin-top: 10px; font-size: 11px; color: #555;
    letter-spacing: .02em; text-align: center;
  }
  .mrx-trust-dot {
    width: 4px; height: 4px; background: #888;
    border-radius: 50%; flex-shrink: 0; display: inline-block;
  }
  .mrx-remoji { font-size: 38px; display: block; margin-bottom: 10px; }
  .mrx-rtitle { font-family: 'Bebas Neue', sans-serif; font-size: 40px; line-height: 1.0; color: var(--text); margin-bottom: 14px; }
  .mrx-rexp { font-size: 14px; line-height: 1.65; color: var(--muted); font-weight: 300; margin-bottom: 22px; }

  .mrx-conf {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 20px 20px 18px; margin-bottom: 18px;
    position: relative; overflow: hidden;
  }
  .mrx-conf::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--red-dim), var(--red-bright));
  }
  .mrx-score-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px;
  }
  .mrx-score-brand {
    font-size: 10px; font-weight: 700; letter-spacing: .12em;
    text-transform: uppercase; color: var(--muted);
  }
  .mrx-score-brand span { color: var(--red-bright); }
  .mrx-score-display {
    display: flex; align-items: baseline; gap: 4px;
  }
  .mrx-score-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 56px; line-height: 1; color: var(--text); letter-spacing: -.01em;
  }
  .mrx-score-denom {
    font-size: 16px; color: #555; font-weight: 400; line-height: 1;
  }
  .mrx-score-category {
    font-size: 12px; font-weight: 600; letter-spacing: .06em;
    text-transform: uppercase; color: var(--red-bright);
    margin-bottom: 12px;
  }
  .mrx-ctrack { height: 5px; background: var(--track); border-radius: 4px; overflow: hidden; }
  .mrx-cfill {
    height: 100%; background: linear-gradient(90deg, var(--red-dim), var(--red-bright));
    border-radius: 4px; transition: width 1.2s cubic-bezier(.4,0,.2,1) .3s;
  }
  .mrx-score-footnote {
    font-size: 10px; color: #444; margin-top: 10px;
    letter-spacing: .02em; text-align: right;
  }

  .mrx-bullets { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
  .mrx-bullet { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--muted); font-weight: 300; line-height: 1.5; }
  .mrx-bicon {
    width: 18px; height: 18px; border-radius: 50%;
    background: rgba(34,197,94,.15); border: 1px solid rgba(34,197,94,.35);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
  }

  .mrx-cta {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 16px; border-radius: 14px; background: var(--red);
    border: none; color: white; font-family: 'DM Sans', sans-serif;
    font-size: 16px; font-weight: 600; cursor: pointer; letter-spacing: .02em;
    transition: all .2s ease; margin-bottom: 10px; text-decoration: none;
  }
  .mrx-cta:hover { background: var(--red-bright); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(192,57,43,.35); }
  .mrx-free-visit {
    display: flex; align-items: flex-start; justify-content: center; gap: 7px;
    font-size: 13px; font-weight: 500; color: var(--red-bright);
    text-align: center; margin-bottom: 10px; line-height: 1.4;
  }

  .mrx-cta2 {
    width: 100%; padding: 13px; border-radius: 14px; background: transparent;
    border: 1px solid var(--border); color: var(--muted); font-family: 'DM Sans', sans-serif;
    font-size: 14px; cursor: pointer; transition: all .15s ease;
  }
  .mrx-cta2:hover { border-color: var(--muted); color: var(--text); }

  /* Share Section */
  .mrx-share-section {
    margin: 20px 0 16px;
    background: #111; border: 1px solid #222;
    border-radius: 18px; padding: 18px 16px;
  }
  .mrx-share-header { text-align: center; margin-bottom: 14px; }
  .mrx-share-label {
    font-size: 10px; color: #555; letter-spacing: .1em;
    text-transform: uppercase; font-weight: 600; margin-bottom: 4px;
  }
  .mrx-share-sub { font-size: 13px; color: #888; line-height: 1.4; }
  .mrx-share-row1 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
  .mrx-share-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .mrx-share-btn {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 5px; padding: 12px 6px; border-radius: 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: .02em;
    cursor: pointer; text-decoration: none;
    transition: all .18s ease; border: 1px solid transparent;
    background: #181818; min-height: 64px;
  }
  .mrx-share-btn svg { flex-shrink: 0; }
  .mrx-share-btn:hover { transform: translateY(-2px); }
  .mrx-share-ig {
    color: #E1306C; border-color: rgba(225,48,108,.2);
    background: linear-gradient(135deg, #1a1118, #110d18);
  }
  .mrx-share-ig:hover { background: rgba(225,48,108,.12); border-color: rgba(225,48,108,.5); }
  .mrx-share-x {
    color: #fff; border-color: rgba(255,255,255,.12);
    background: linear-gradient(135deg, #111, #0d0d0d);
  }
  .mrx-share-x:hover { background: #1a1a1a; border-color: rgba(255,255,255,.3); }
  .mrx-share-tg {
    color: #2AABEE; border-color: rgba(42,171,238,.2);
    background: linear-gradient(135deg, #0e1820, #0a1520);
  }
  .mrx-share-tg:hover { background: rgba(42,171,238,.1); border-color: rgba(42,171,238,.5); }
  .mrx-share-wa {
    color: #25D366; border-color: rgba(37,211,102,.2);
    background: linear-gradient(135deg, #0e1a12, #0a1510);
  }
  .mrx-share-wa:hover { background: rgba(37,211,102,.1); border-color: rgba(37,211,102,.5); }
  .mrx-share-copy { color: var(--muted); border-color: var(--border); background: #1a1a1a; }
  .mrx-share-copy:hover { border-color: var(--muted); color: var(--text); transform: translateY(-1px); }
  /* Peer Comparison */
  .mrx-peer {
    background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
    padding: 18px 16px; margin-bottom: 20px;
  }
  .mrx-peer-title {
    font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 16px;
    display: flex; align-items: center; gap: 7px; letter-spacing: .01em;
  }
  .mrx-peer-icon { font-size: 16px; }
  .mrx-peer-row {
    display: grid; grid-template-columns: 1fr 1fr auto;
    align-items: center; gap: 10px; margin-bottom: 10px;
  }
  .mrx-peer-label { font-size: 12px; color: var(--muted); line-height: 1.4; flex: 1; }
  .mrx-peer-track {
    height: 7px; background: var(--track); border-radius: 99px; overflow: hidden;
  }
  .mrx-peer-fill {
    height: 100%; border-radius: 99px; transition: width 1s cubic-bezier(.22,1,.36,1);
  }
  .mrx-peer-fill-red   { background: var(--red); }
  .mrx-peer-fill-dim   { background: #444; }
  .mrx-peer-pct { font-size: 13px; font-weight: 600; color: var(--text); min-width: 32px; text-align: right; }
  .mrx-peer-note { font-size: 11px; color: var(--muted); margin-top: 12px; line-height: 1.5; text-align: center; }

  /* CTA Transition Overlay */
  .mrx-transition-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: #0d0d0d;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 28px; padding: 40px 24px;
    animation: mrx-fadein .2s ease;
  }
  @keyframes mrx-fadein { from { opacity: 0; } to { opacity: 1; } }
  .mrx-overlay-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid rgba(255,255,255,.08);
    border-top-color: #c0392b;
    animation: mrx-spin .9s linear infinite;
  }
  @keyframes mrx-spin { to { transform: rotate(360deg); } }
  .mrx-transition-msg {
    font-family: "DM Sans", sans-serif;
    font-size: 17px; font-weight: 500;
    color: #e5e5e5; text-align: center; line-height: 1.5;
    max-width: 260px;
  }
  .mrx-transition-secure {
    display: flex; align-items: center; gap: 7px;
    font-family: "DM Sans", sans-serif;
    font-size: 12px; color: #6B7280;
  }
  .mrx-transition-lock { flex-shrink: 0; }

  /* Lead Gate */
  .mrx-leadgate { justify-content: center; gap: 0; padding-top: 32px; }
  .mrx-lg-top { text-align: center; margin-bottom: 24px; }
  .mrx-lg-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(192,57,43,.15); border: 1px solid rgba(192,57,43,.3);
    color: var(--red-bright); font-size: 11px; font-weight: 600;
    letter-spacing: .08em; text-transform: uppercase;
    padding: 5px 12px; border-radius: 100px; width: fit-content;
    margin: 0 auto 14px; 
  }
  .mrx-lg-title { font-family: 'Bebas Neue', sans-serif; font-size: 32px; line-height: 1.05; margin-bottom: 10px; }
  .mrx-lg-sub { font-size: 14px; color: var(--muted); line-height: 1.5; margin-bottom: 0; }
  .mrx-lg-fields { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; width: 100%; }
  .mrx-lg-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 12px 0; width: 100%;
  }
  .mrx-lg-divider::before, .mrx-lg-divider::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }
  .mrx-lg-divider span { font-size: 12px; color: #555; text-transform: uppercase; letter-spacing: .08em; }
  .mrx-lg-skip-btn {
    width: 100%; padding: 16px 20px;
    background: #1a1a1a; border: 1px solid var(--border);
    border-radius: 12px; color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 16px; font-weight: 600;
    cursor: pointer; transition: all .15s ease;
    min-height: 52px;
  }
  .mrx-lg-skip-btn:hover { background: var(--surface2); border-color: var(--muted); }

  /* Lead Capture */
  .mrx-lead {
    background: linear-gradient(135deg, #1a1a1a 0%, #161616 100%);
    border: 1px solid #333; border-radius: 18px;
    padding: 20px 18px; margin-bottom: 16px;
  }
  .mrx-lead-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
  .mrx-lead-lock { font-size: 22px; line-height: 1; flex-shrink: 0; margin-top: 2px; }
  .mrx-lead-title { font-size: 15px; font-weight: 600; color: var(--text); line-height: 1.3; margin-bottom: 3px; }
  .mrx-lead-sub { font-size: 12px; color: var(--muted); line-height: 1.4; }
  .mrx-lead-fields { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
  .mrx-lead-input {
    width: 100%; height: 48px; background: #0d0d0d; border: 1px solid #333;
    border-radius: 12px; color: var(--text); font-family: "DM Sans", sans-serif;
    font-size: 15px; padding: 0 16px; outline: none; transition: border-color .15s;
  }
  .mrx-lead-input::placeholder { color: #555; }
  .mrx-lead-input:focus { border-color: var(--red); }
  .mrx-lead-btn {
    width: 100%; height: 50px; background: var(--red); border: none; border-radius: 12px;
    color: white; font-family: "DM Sans", sans-serif; font-size: 15px; font-weight: 600;
    cursor: pointer; transition: all .15s ease; letter-spacing: .02em; margin-bottom: 10px;
  }
  .mrx-lead-btn:hover:not(.disabled):not(.loading) { background: var(--red-bright); transform: translateY(-1px); }
  .mrx-lead-btn.disabled { opacity: .4; cursor: not-allowed; }
  .mrx-lead-btn.loading { opacity: .7; cursor: wait; }
  .mrx-lead-privacy { font-size: 11px; color: #555; text-align: center; line-height: 1.4; }
  .mrx-cta-locked { opacity: .35 !important; cursor: not-allowed !important; pointer-events: none; transform: none !important; box-shadow: none !important; }

  .mrx-disc { font-size: 11px; color: #555; text-align: center; line-height: 1.5; margin-top: 18px; }
`;

// ?? Sub-components ---
function ProgressBar({ current, total, title, isTikTok }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="mrx-progress">
      <div className="mrx-pmeta">
        <span>{title}</span>
        <span>{isTikTok ? `${current} of ${total}` : `${current} / ${total}`}</span>
      </div>
      <div className="mrx-ptrack" style={isTikTok ? {height:'7px'} : {}}>
        <div className="mrx-pfill" style={{width:`${pct}%`,...(isTikTok?{background:'linear-gradient(90deg,#c0392b,#ff4d3a)'}:{})}} />
      </div>
    </div>
  );
}

function Welcome({ onSelect }) {
  return (
    <div className="mrx-screen">
      <div className="mrx-welcome">
        <div>
          <div className="mrx-badge"><span className="mrx-badge-dot" /> Men's Health Assessment</div>
          <h1 className="mrx-h1">What's Your<span>Score?</span></h1>
          <div className="mrx-hook">
            <p className="mrx-hook-line">Most men score lower than they think.</p>
            <p className="mrx-hook-line">See how you rank compared to other men your age.</p>
            <p className="mrx-hook-cta">Take the 30-second Men's Health Test.</p>
          </div>
          <div className="mrx-social-proof">
            <p className="mrx-proof-count">50,000+ men have taken this test.</p>
            <ul className="mrx-checks">
              <li><span className="mrx-check">✓</span> Private</li>
              <li><span className="mrx-check">✓</span> Takes 30 seconds</li>
              <li><span className="mrx-check">✓</span> Instant results</li>
            </ul>
          </div>
        </div>
        <div>
          <div className="mrx-cards">
            <button className="mrx-card" onClick={() => onSelect("ed")}>
              <div className="mrx-card-icon">💪</div>
              <div className="mrx-card-info">
                <h3>Bedroom Confidence Score</h3>
                <p>Performance, energy &amp; confidence assessment</p>
              </div>
              <span className="mrx-card-arr">›</span>
            </button>
            <button className="mrx-card" onClick={() => onSelect("hair")}>
              <div className="mrx-card-icon">🌱</div>
              <div className="mrx-card-info">
                <h3>Hairline Risk Score</h3>
                <p>Hair loss stage &amp; treatment opportunity</p>
              </div>
              <span className="mrx-card-arr">›</span>
            </button>
            <button className="mrx-card" onClick={() => onSelect("testosterone")}>
              <div className="mrx-card-icon">⚡</div>
              <div className="mrx-card-info">
                <h3>Is Your Testosterone Low?</h3>
                <p>Energy, drive &amp; hormone level assessment</p>
              </div>
              <span className="mrx-card-arr">›</span>
            </button>
            <button className="mrx-card" onClick={() => onSelect("partner")}>
              <div className="mrx-card-icon">❤️</div>
              <div className="mrx-card-info">
                <h3>What Does Your Lover Really Think?</h3>
                <p>Love &amp; intimacy confidence score</p>
              </div>
              <span className="mrx-card-arr">›</span>
            </button>
          </div>
          <p className="mrx-disc">Results are informational only. Not medical advice. Your data is never sold.</p>
        </div>
      </div>
    </div>
  );
}

function Question({ quiz, qIndex, answers, onAnswer, onNext, onBack, isTikTok }) {
  const q = quiz.questions[qIndex];
  if (!q) return null;
  const pickKey = answers._lastPick || "";

  function handlePick(qId, value, key) {
    onAnswer(qId, value, key);
    if (isTikTok) { setTimeout(() => onNext({ ...answers, [qId]: value }), 200); return; }
    // Pass updated answers directly to avoid stale closure on last question
    const updatedAnswers = { ...answers, [qId]: value, _lastPick: key };
    setTimeout(() => onNext(updatedAnswers), 320);
  }

  return (
    <>
      {isTikTok && (
        <div style={{
          width:'100%',
          padding:'14px 0 2px',
          display:'flex',
          flexDirection:'column',
          alignItems:'center',
          textAlign:'center',
        }}>
          <div style={{
            fontSize:'13px',
            color:'#9CA3AF',
            letterSpacing:'.01em',
            marginBottom:'5px',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            gap:'4px',
            lineHeight:1.4,
          }}>
            <span>⚡</span>
            <span>Most men are surprised by their score</span>
          </div>
          <div style={{
            fontSize:'11px',
            color:'#6B7280',
            letterSpacing:'.02em',
            lineHeight:1.4,
            marginLeft:'20px',
          }}>
            Private • Anonymous • Takes 30 seconds
          </div>
        </div>
      )}
      <ProgressBar current={qIndex + 1} total={quiz.questions.length} title={quiz.title} isTikTok={isTikTok} />
      <div className="mrx-screen">
        <div className="mrx-qhead">
          <div className="mrx-qnum">{isTikTok ? `Question ${qIndex + 1} of ${quiz.questions.length}` : `Step ${qIndex + 1} of ${quiz.questions.length}`}</div>
          <div className="mrx-qtext">{q.text}</div>
        </div>
        <div className="mrx-opts">
          {q.options.map((opt, i) => {
            const key = `${q.id}:${i}`;
            return (
              <button
                key={i}
                className={`mrx-opt${pickKey === key ? " sel" : ""}`}
                style={isTikTok && pickKey === key ? {transform:'scale(1.02)',transition:'transform .15s ease',borderColor:'var(--red-bright)'} : {}}
                onClick={() => handlePick(q.id, opt.value, key)}
              >
                <span className="mrx-circle"><span className="mrx-dot" /></span>
                {opt.label}
              </button>
            );
          })}
        </div>
        {qIndex > 0 && (
          <div className="mrx-nav">
            <button className="mrx-back" onClick={onBack}>? Back</button>
          </div>
        )}
      </div>
    </>
  );
}

function Loading() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dot, setDot] = useState(0);
  useEffect(() => {
    const t1 = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MSGS.length), 900);
    const t2 = setInterval(() => setDot(d => (d + 1) % 3), 420);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);
  return (
    <div className="mrx-loading">
      <div className="mrx-spinner" />
      <div>
        <div className="mrx-lmsg">{LOADING_MSGS[msgIdx]}</div>
        <div className="mrx-ldots">
          {[0, 1, 2].map(i => <span key={i} className={`mrx-ldot${i === dot ? " on" : ""}`} />)}
        </div>
      </div>
      <p className="mrx-lsub">Building your personalized profile...</p>
    </div>
  );
}


// ?? Lead Gate (full slide before results) ---
function isValidEmail(e) {
  return e.indexOf("@") > 0 && e.lastIndexOf(".") > e.indexOf("@") + 1;
}

function sendToSheet(payload) {
  try {
    fetch(WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (_) {}
}

function LeadGate({ quiz, result, tracking, onDone }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done

  const nameFilled = name.trim().length > 0;
  const emailFilled = isValidEmail(email.trim());
  const valid = nameFilled && emailFilled;

  function handleSubmit() {
    if (!valid || status !== "idle") return;
    setStatus("loading");
    const ctaUrl = buildCTAUrl(quiz.ctaBase, tracking);
    firePAPAction("lead");
    sendToSheet({
      timestamp: new Date().toISOString(),
      name: name.trim(),
      email: email.trim(),
      quiz: quiz.title,
      result: result.headline,
      ageBracket: result.ageBracket || "",
      confidence: result.confidence,
      affiliate: tracking.affiliate || "",
      utm_source: tracking.utm_source || "",
      utm_campaign: tracking.utm_campaign || "",
      a_aid: tracking.a_aid || "",
      cta_url: ctaUrl,
    });
    setTimeout(() => onDone(), 400);
  }

  function handleSkip() {
    onDone();
  }

  return (
    <div className="mrx-screen mrx-leadgate">
      <div className="mrx-lg-top">
        <div className="mrx-lg-badge">✅ Assessment Complete</div>
        <h2 className="mrx-lg-title">Your results are ready</h2>
        <p className="mrx-lg-sub">Would you like a copy of your personalized assessment emailed to you?</p>
      </div>
      <div className="mrx-lg-fields">
        <input
          className="mrx-lead-input"
          type="text"
          placeholder="First Name"
          value={name}
          onChange={e => setName(e.target.value)}
          autoComplete="given-name"
        />
        <input
          className="mrx-lead-input"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />
      </div>
      <button
        className={`mrx-lead-btn${!valid ? " disabled" : ""}${status === "loading" ? " loading" : ""}`}
        onClick={handleSubmit}
        disabled={!valid || status === "loading"}
      >
        {status === "loading" ? "Sending..." : "Email My Results \u2192"}
      </button>
      <p className="mrx-lead-privacy">🔒 Private &amp; secure — never sold or shared</p>
      <div className="mrx-lg-divider"><span>or</span></div>
      <button className="mrx-lg-skip-btn" onClick={handleSkip}>
        Show My Results →
      </button>
    </div>
  );
}

// ?? Peer Comparison ---
function PeerComparison({ quizId, ageBracket }) {
  const [animDone, setAnimDone] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimDone(true), 200); return () => clearTimeout(t); }, []);

  const data = PEER_DATA[quizId]?.[ageBracket];
  if (!data) return null;

  const topicLabel = quizId === "ed" ? "ED symptoms" : quizId === "hair" ? "hair loss" : quizId === "partner" ? "relationship confidence issues" : "low testosterone symptoms";
  const pct = animDone ? data.affected : 0;
  const pct2 = animDone ? data.untreated : 0;

  return (
    <div className="mrx-peer">
      <div className="mrx-peer-title">
        <span className="mrx-peer-icon">👤</span>
        How you compare to {data.label}
      </div>
      <div className="mrx-peer-row">
        <div className="mrx-peer-label">{data.affected}% of {data.label} report {topicLabel}</div>
        <div className="mrx-peer-track">
          <div className="mrx-peer-fill mrx-peer-fill-red" style={{ width: `${pct}%` }} />
        </div>
        <div className="mrx-peer-pct">{data.affected}%</div>
      </div>
      <div className="mrx-peer-row">
        <div className="mrx-peer-label">{data.untreated}% never seek treatment</div>
        <div className="mrx-peer-track">
          <div className="mrx-peer-fill mrx-peer-fill-dim" style={{ width: `${pct2}%` }} />
        </div>
        <div className="mrx-peer-pct">{data.untreated}%</div>
      </div>
      <p className="mrx-peer-note">Don't be part of the {data.untreated}%. Treatment is private, fast, and effective.</p>
    </div>
  );
}

// MenIQ Score category labels — clinical, calm, telemedicine tone
// Color for score bar and number — green=low risk, red=high risk
function getScoreColor(score) {
  if (score < 30) return "#22C55E";   // green — low concern
  if (score < 55) return "#F59E0B";   // amber — moderate
  if (score < 75) return "#F97316";   // orange — elevated
  return "#EF4444";                    // red — high concern
}

function getMenIQCategory(quizId, score) {
  if (quizId === "ed") {
    if (score >= 75) return "Treatment Strongly Recommended";
    if (score >= 55) return "Progressive Pattern Detected";
    if (score >= 30) return "Stress-Linked Pattern";
    return "Mild — Monitor & Maintain";
  }
  if (quizId === "hair") {
    if (score >= 75) return "Advanced Hair Loss";
    if (score >= 55) return "Active Thinning Detected";
    if (score >= 30) return "Early Stage Thinning";
    return "Healthy Hair Profile";
  }
  if (quizId === "testosterone") {
    if (score >= 75) return "Low T — Clinical Range";
    if (score >= 55) return "Suboptimal T Levels";
    if (score >= 30) return "Borderline Testosterone";
    return "Healthy T Profile";
  }
  if (quizId === "partner") {
    if (score >= 75) return "Relationship Needs Attention";
    if (score >= 55) return "Friction Detected";
    if (score >= 30) return "Room to Strengthen Bond";
    return "Strong Connection";
  }
  return "Assessment Complete";
}

function Result({ quiz, result, tracking, onRestart }) {
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const cta = document.querySelector('.mrx-cta');
        if (cta) cta.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } catch(_) {}
    }, 400);
    return () => clearTimeout(t);
  }, []);
  const [filled, setFilled] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [checkStep, setCheckStep] = useState(0);
  const [copiedTT, setCopiedTT] = useState(false);
  useEffect(() => { setTimeout(() => setFilled(true), 80); }, []);
  const ctaUrl = buildCTAUrl(quiz.ctaBase, tracking);

  function handleCTA(e) {
    e.preventDefault();
    // GA4 event
    try {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'click_to_maxrx', {
          event_category: 'quiz',
          event_label: 'results_cta_click',
        });
      }
    } catch(_) {}
    firePAPAction("click");
    const papAid = getPAPAffiliateId();
    const finalUrl = papAid && !ctaUrl.includes("a_aid=")
      ? ctaUrl + (ctaUrl.includes("?") ? "&" : "?") + "a_aid=" + papAid
      : ctaUrl;
    // Show transition overlay, then redirect after 2.5s
    setShowTransition(true);
    setCheckStep(0);
    setTimeout(() => setCheckStep(1), 600);
    setTimeout(() => setCheckStep(2), 1200);
    setTimeout(() => setCheckStep(3), 1800);
    setTimeout(() => {
      const inIframe = (() => { try { return window.self !== window.top; } catch(_) { return true; } })();
      if (inIframe) {
        window.open(finalUrl, "_blank", "noopener,noreferrer");
        setShowTransition(false);
      } else {
        window.location.href = finalUrl;
      }
    }, 2600);
  }

  return (
    <>
    <div className="mrx-result">
      <div className="mrx-rtag"><span className="mrx-rtag-dot" /> MenIQ Assessment</div>
      <div className="mrx-status-bubble" style={{
        width: '52px', height: '52px', borderRadius: '50%',
        background: getScoreColor(result.confidence),
        margin: '0 0 0',
        boxShadow: `0 0 18px ${getScoreColor(result.confidence)}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', flexShrink: 0,
        animation: 'mrxBubblePulse 2.8s ease-in-out infinite',
      }}>
        {''}
      </div>
      <div className="mrx-step-indicator">Your Personalized Results</div>
      <h2 className="mrx-rtitle">{result.headline}</h2>
      <p className="mrx-rexp">{result.explanation}</p>
      <div className="mrx-conf">
        <div className="mrx-score-header">
          <div className="mrx-score-brand">Men<span>IQ</span> Score</div>
          <div className="mrx-score-display">
            <span className="mrx-score-num" style={{ color: getScoreColor(result.confidence) }}>
              {result.confidence}
            </span>
            <span className="mrx-score-denom">/ 100</span>
          </div>
        </div>
        <div className="mrx-score-category">{getMenIQCategory(quiz.id, result.confidence)}</div>
        <div className="mrx-ctrack">
          <div className="mrx-cfill" style={{
            width: filled ? `${result.confidence}%` : "0%",
            background: getScoreColor(result.confidence)
          }} />
        </div>
        <div className="mrx-score-footnote">Based on your responses · Not a medical diagnosis</div>
      </div>
      <div className="mrx-bullets">
        {result.bullets.map((b, i) => (
          <div key={i} className="mrx-bullet">
            <span className="mrx-bicon">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {b}
          </div>
        ))}
      </div>

      {/* PRIMARY CTA — placed directly after bullets, above fold on mobile */}
      <div className="mrx-cta-block">
        <div className="mrx-cta-support">
          <p className="mrx-cta-support-line mrx-cta-avail">
            <span className="mrx-avail-dot" />
            A licensed provider can review your answers online.
          </p>
          <p className="mrx-cta-support-line">Most visits take only a few minutes.</p>
        </div>
        <a className="mrx-cta" href={ctaUrl} onClick={handleCTA} rel="noopener noreferrer">
          {quiz.ctaLabel} →
        </a>
        <div className="mrx-trust-strip">
          <span>Private online visit</span>
          <span className="mrx-trust-dot" />
          <span>Licensed U.S. providers</span>
          <span className="mrx-trust-dot" />
          <span>Discreet treatment options</span>
        </div>
      </div>

      <PeerComparison quizId={quiz.id} ageBracket={result.ageBracket} />
      <button className="mrx-cta2" onClick={onRestart}>Take a different quiz</button>
      <div className="mrx-share-section">
        <div className="mrx-share-header">
          <p className="mrx-share-label">Share MenIQ.co with your friends</p>
        </div>
        {/* Row 1: TikTok, Instagram, X */}
        <div className="mrx-share-row1">
          <a className="mrx-share-btn mrx-share-ig"
            href={`https://www.instagram.com/`}
            target="_blank" rel="noopener noreferrer"
            onClick={() => { try { navigator.clipboard.writeText(buildShareUrl(tracking, 'instagram', result) + ' — I just took the MenIQ Health Test. Try to beat my score.'); } catch(e){ fireShareEvent('instagram', tracking, result); } }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            Instagram
          </a>
          <a className="mrx-share-btn mrx-share-x"
            href={`https://x.com/intent/tweet?text=${encodeURIComponent('I just took the MenIQ Health Test 🔴 See how you score vs other men your age 👇')}&url=${encodeURIComponent(buildShareUrl(tracking, 'x', result))}`}
            target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X
          </a>
        </div>
        {/* Row 2: Telegram, WhatsApp */}
        <div className="mrx-share-row2">
          <a className="mrx-share-btn mrx-share-tg"
            href={`https://t.me/share/url?url=${encodeURIComponent(buildShareUrl(tracking, 'telegram', result))}&text=${encodeURIComponent('I just took the MenIQ Health Test. Find out where you rank vs other men your age 👇')}`}
            target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.947l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.978.612z"/>
            </svg>
            Telegram
          </a>
          <a className="mrx-share-btn mrx-share-wa"
            href={`https://wa.me/?text=${encodeURIComponent('I just took the MenIQ Health Test. Find out where you rank vs other men your age 👇 ' + buildShareUrl(tracking, 'whatsapp', result))}`}
            target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
      <p className="mrx-disc">
        This assessment is for informational purposes only. All treatments require consultation with a licensed provider.
        {tracking.affiliate ? ` - Ref: ${tracking.affiliate}` : ""}
      </p>
    </div>
    {showTransition && (
      <div className="mrx-transition-overlay">
        <div className="mrx-overlay-spinner" />
        <p className="mrx-transition-msg">Connecting you with a licensed provider…</p>
        <p style={{fontSize:'13px',color:'#9CA3AF',textAlign:'center',maxWidth:'260px',lineHeight:'1.5',margin:'-8px 0 0'}}>
          Reviewing your answers and preparing personalized treatment options.
        </p>
        <div style={{display:'flex',flexDirection:'column',gap:'10px',marginTop:'8px',alignItems:'flex-start'}}>
          <span style={{fontSize:'13px',color:checkStep>=1?'#22C55E':'#555',transition:'color .3s',display:'flex',alignItems:'center',gap:'8px'}}>
            {checkStep>=1?'✓':'○'} Reviewing assessment answers
          </span>
          <span style={{fontSize:'13px',color:checkStep>=2?'#22C55E':'#555',transition:'color .3s',display:'flex',alignItems:'center',gap:'8px'}}>
            {checkStep>=2?'✓':'○'} Checking treatment eligibility
          </span>
          <span style={{fontSize:'13px',color:checkStep>=3?'#22C55E':'#555',transition:'color .3s',display:'flex',alignItems:'center',gap:'8px'}}>
            {checkStep>=3?'✓':'○'} Preparing provider recommendations
          </span>
        </div>
        <div className="mrx-transition-secure">
          <svg className="mrx-transition-lock" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Private & secure connection
        </div>
      </div>
    )}
    </>
  );
}

// ?? Main App ---
export default function MaxRxQuiz() {
  const [phase, setPhase] = useState("welcome");
  const [quizId, setQuizId] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [tracking] = useState(() => {
    try { return getTrackingParams(); } catch { return {}; }
  });
  useEffect(() => { loadPAPScript(); }, []);

  const quiz = quizId ? QUIZZES[quizId] : null;

  function startQuiz(id) {
    try { if (typeof window !== 'undefined' && typeof window.gtag === 'function') { window.gtag('event', 'quiz_started', { event_category: 'quiz', event_label: 'start' }); } } catch(_) {}
    setQuizId(id); setQIndex(0); setAnswers({}); setPhase("question");
  }
  function handleAnswer(qId, value, key) {
    setAnswers(prev => ({ ...prev, [qId]: value, _lastPick: key }));
  }
  function handleNext(latestAnswers) {
    const currentAnswers = latestAnswers || answers;
    if (qIndex < quiz.questions.length - 1) {
      setQIndex(i => i + 1);
      setAnswers(prev => ({ ...prev, _lastPick: "" }));
    } else {
      setPhase("loading");
      const computed = calcResult(quiz, currentAnswers);
      setTimeout(() => { setResult(computed); setPhase("lead"); }, 2200);
    }
  }
  function handleBack() {
    if (qIndex > 0) { setQIndex(i => i - 1); setAnswers(prev => ({ ...prev, _lastPick: "" })); }
    else setPhase("welcome");
  }
  function handleRestart() {
    setPhase("welcome"); setQuizId(null); setQIndex(0); setAnswers({}); setResult(null);
  }

  // Auto-start quiz from URL param — ?quiz=ed drops user into Q1 immediately
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const autoQ = p.get('quiz');
      if (autoQ && QUIZZES[autoQ]) startQuiz(autoQ);
    } catch(_) {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  function handleLeadDone() {
    try { if (typeof window !== 'undefined' && typeof window.gtag === 'function') { window.gtag('event', 'quiz_completed', { event_category: 'quiz', event_label: 'results_page' }); } } catch(_) {}
    setPhase("result");
  }

  return (
    <div className="mrx-root">
      <style>{CSS}</style>
      <div className="mrx-app">
        <div className="mrx-logo">
          <svg width="100%" height="30" viewBox="0 0 440 76" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',maxWidth:'180px',display:'block',margin: typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('utm_source')==='tiktok' ? '0 auto 0 calc(50% - 70px)' : '0 auto'}}>
            <polyline points="4,56 20,56 29,38 38,68 47,18 56,56 72,56"
              fill="none" stroke="#c0392b" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <text x="82" y="58" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="54" letterSpacing="-1">
              <tspan fill="#ffffff">MEN</tspan><tspan fill="#c0392b">IQ</tspan><tspan fill="#666666">.CO</tspan>
            </text>
          </svg>
        </div>
        {phase === "welcome" && <Welcome onSelect={startQuiz} />}
        {phase === "question" && quiz && (
          <Question
            quiz={quiz} qIndex={qIndex} answers={answers}
            onAnswer={handleAnswer} onNext={handleNext} onBack={handleBack}
            isTikTok={typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('utm_source') === 'tiktok'}
          />
        )}
        {phase === "loading" && <Loading />}
        {phase === "lead" && quiz && result && (
          <LeadGate quiz={quiz} result={result} tracking={tracking} onDone={handleLeadDone} />
        )}
        {phase === "result" && quiz && result && (
          <Result quiz={quiz} result={result} tracking={tracking} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}
