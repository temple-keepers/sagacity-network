"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

/* ─────────── DATA ─────────── */

interface Question {
  category: string;
  categoryColor: string;
  headline: string;
  scenario: string;
  options: { label: string; sub: string; value: number; insight: string }[];
}

const QUESTIONS: Question[] = [
  {
    category: "Web presence",
    categoryColor: "#A668D0",
    headline: "Someone hears about your business and Googles you right now. What do they find?",
    scenario: "Think about the last time a potential client tried to find you online. What was actually there waiting for them?",
    options: [
      { label: "Nothing — I'm essentially invisible online", sub: "No website, no Google Business profile, maybe a dormant social page", value: 0, insight: "72% of clients research a business online before making contact. If you're not findable, you're invisible to the majority of potential clients." },
      { label: "My social profiles, but no website", sub: "Facebook or Instagram show up, but there's no proper site", value: 2, insight: "Social media builds awareness, but it doesn't convert browsers into clients the way a website does. 30% of visitors won't trust a business enough to make contact without a proper website." },
      { label: "A website — but I'm embarrassed to send clients to it", sub: "It exists, but it doesn't represent what I do now", value: 3, insight: "An outdated site can hurt more than no site. 38% of visitors stop engaging with a website if the layout or content looks old." },
      { label: "A decent website — but it never generates enquiries", sub: "Looks professional, but nothing actually comes in through it", value: 4, insight: "A site that looks good but generates no leads is a brochure, not a business asset. The gap is usually just three things: a clear offer, a strong CTA, and a lead capture mechanism." },
      { label: "A site that consistently brings in enquiries and bookings", sub: "Clients find me, get in touch, and the site does real sales work", value: 6, insight: "You're ahead of most businesses. The next level is optimising what's working — faster load times, better CTA placement, and a lead magnet." },
    ],
  },
  {
    category: "Lead follow-up",
    categoryColor: "#2DD4BF",
    headline: "A potential client fills in your contact form at 11pm on Friday. What actually happens next?",
    scenario: "This is the moment most businesses lose clients without ever knowing it. Be honest about what really happens — not what you intend to happen.",
    options: [
      { label: "Nothing until I happen to check — probably Monday morning", sub: "No notification, no auto-reply, no follow-up of any kind", value: 0, insight: "That lead is almost certainly gone. 78% of clients buy from the first business that responds." },
      { label: "I get a notification and reply when I can — hours or a day later", sub: "They hear from me eventually, but timing is inconsistent", value: 2, insight: "You're ahead of many businesses — but timing still costs you. Companies that respond within 5 minutes are 9x more likely to convert a lead." },
      { label: "They get an auto-reply, then I follow up manually when I remember", sub: "At least they know I got it — but the follow-up depends on me", value: 3, insight: "An auto-reply is good — but if that's where automation ends, you're relying on yourself. Most leads need 5–7 touchpoints before buying." },
      { label: "They enter an automated sequence that keeps them warm", sub: "They get helpful emails over a few days while I prepare to respond", value: 5, insight: "Businesses with automated follow-up see 451% more qualified leads than those relying on manual outreach." },
      { label: "They're tagged in my CRM and get a personalised sequence", sub: "Different follow-ups based on what they enquired about", value: 6, insight: "Fully segmented CRM + personalised sequences is genuinely elite for a small business. Focus now on conversion rate optimisation." },
    ],
  },
  {
    category: "Cybersecurity",
    categoryColor: "#E05252",
    headline: "Your laptop is stolen tomorrow morning. How bad is it?",
    scenario: "Don't imagine the best case. Think about what's actually sitting on your machine right now — client data, contracts, financial records, saved passwords.",
    options: [
      { label: "Catastrophic — client data, contracts, everything is on there", sub: "I'd have no way to revoke access and wouldn't know what was exposed", value: 0, insight: "This is one breach away from catastrophic. 60% of small businesses that suffer a serious data breach close within 6 months." },
      { label: "Bad — I'd lose a lot and it would take weeks to recover", sub: "Most things aren't backed up properly and some data would be gone", value: 2, insight: "The real risk isn't the hardware — it's the data. Without remote access revocation and encryption, stolen credentials can be exploited for weeks." },
      { label: "Manageable — most things are backed up, recovery would take days", sub: "I'd lose the device but could piece things back together", value: 4, insight: "Cloud backups put you ahead of 60% of SMEs. The remaining risk is usually unencrypted local files, reused passwords, and no incident response plan." },
      { label: "Minimal — I can revoke access remotely within minutes", sub: "Everything is cloud-backed, encrypted, and recoverable fast", value: 6, insight: "Remote management + encrypted storage + fast access revocation is the gold standard for SMEs. Your security posture is genuinely strong." },
    ],
  },
  {
    category: "Automation",
    categoryColor: "#E09B3D",
    headline: "Which of these best describes a typical week in your business?",
    scenario: "Think about invoicing, chasing payments, scheduling calls, sending follow-up emails, copying data between apps. How much still happens by hand?",
    options: [
      { label: "Admin runs my week — I spend more time on it than actual client work", sub: "Invoicing, chasing, scheduling, updating — all done by hand", value: 0, insight: "Business owners who automate routine tasks reclaim an average of 6.3 hours per week — that's 27 full working days per year." },
      { label: "Admin takes a significant chunk — it limits how much I can grow", sub: "I've accepted it, but I know it's a ceiling", value: 2, insight: "The tipping point is usually around £100K revenue. Most of what you're doing manually can be automated in a single afternoon." },
      { label: "I've automated the basics but repetitive tasks still add up", sub: "Better than before, but clearly more to do", value: 4, insight: "You've got the mindset right. Automating client onboarding and payment follow-up alone typically saves 3–4 hours per week." },
      { label: "My systems handle the routine work — I focus on the actual business", sub: "Automation runs the admin; I focus on strategy and clients", value: 6, insight: "With your routine work handled by systems, your growth ceiling is set by strategy — not working hours. The next frontier is AI-assisted decision-making." },
    ],
  },
  {
    category: "Business intelligence",
    categoryColor: "#3DBE8F",
    headline: "Without opening any apps — do you know this month's revenue versus last month?",
    scenario: "Not an estimate. The actual number. And bonus: do you know which service or client type is driving it?",
    options: [
      { label: "No idea — I'd have to check my bank account and do the maths", sub: "Revenue tracking isn't something I actively manage", value: 0, insight: "Running a business without revenue visibility is like driving at night without headlights. Businesses that track KPIs in real time grow 12% faster." },
      { label: "I have a rough sense but couldn't give you a real number", sub: "I go by feel and occasionally check the bank", value: 2, insight: "Gut instinct doesn't scale. The difference between a rough sense and a real number is catching a slow month early vs discovering it too late." },
      { label: "I could find it, but it'd take 10–15 minutes of spreadsheet digging", sub: "The data is there — it's just not immediately accessible", value: 4, insight: "Measuring puts you ahead of most. But if it takes 15 minutes, you're probably not checking often enough. The goal is frictionless daily data." },
      { label: "Yes — I have a live dashboard that shows me this in seconds", sub: "Revenue, pipeline, and key metrics are always visible", value: 6, insight: "Real-time visibility is a genuine competitive advantage. The next level is predictive analytics — forecasting next quarter before it happens." },
    ],
  },
  {
    category: "Client experience",
    categoryColor: "#A78BFA",
    headline: "A new client just signed. What happens in the next 24 hours without you lifting a finger?",
    scenario: "From the moment they say yes — how much of what follows is systematic, and how much depends entirely on you remembering to do it?",
    options: [
      { label: "It all depends on me — I figure it out each time", sub: "No system, no template — I cobble it together based on the client", value: 0, insight: "68% of clients who churn do so not because of the service — but because they felt neglected or confused after signing." },
      { label: "I send the contract and invoice manually, then we get on a call", sub: "They're informed, but it's all reactive and driven by me", value: 2, insight: "Covering the basics is good — but if onboarding depends entirely on a call, you're one diary clash away from a client feeling lost." },
      { label: "I have a checklist I follow, but execution is inconsistent", sub: "Good in theory, but it depends on how busy I am", value: 3, insight: "A checklist is a great start — but if it lives in your head, it gets skipped when busy. Systematising onboarding is usually a half-day project." },
      { label: "I have a structured welcome sequence — clients know what to expect", sub: "First few days are mapped out and consistent for everyone", value: 5, insight: "A structured onboarding experience drives referrals. Clients who feel taken care of from day one are 2.4x more likely to refer you." },
      { label: "Fully automated — contract, welcome email, access, kickoff — all triggered on sign", sub: "The system handles the first week; I show up for the work itself", value: 6, insight: "Full onboarding automation means your client experience doesn't degrade as you scale. This is elite territory for a small business." },
    ],
  },
  {
    category: "Online reputation",
    categoryColor: "#F472B6",
    headline: "A prospect who's never met you Googles your name before a meeting tomorrow. What do they find?",
    scenario: "Not what you'd want them to find — what's actually there right now.",
    options: [
      { label: "Very little — I'm not visible outside my own website", sub: "Googling me doesn't build any confidence or context", value: 0, insight: "93% of buyers research a service provider online before making first contact. If you're invisible, you're being disqualified silently." },
      { label: "Some social profiles and a mention or two, but nothing that builds confidence", sub: "They'd know I'm real, but nothing that would impress them", value: 2, insight: "A scattered presence confirms you exist — but it doesn't build trust. Potential clients need evidence that others have trusted you." },
      { label: "A decent LinkedIn profile and a few positive reviews, but not consistent", sub: "Good enough, but not something I'm actively proud of", value: 4, insight: "The gap between 'decent' and 'impressive' is usually just 5 more Google reviews and a LinkedIn headline that shows results, not job titles." },
      { label: "Strong reviews, professional LinkedIn, content that positions me as an expert", sub: "The picture they find would make them more confident, not less", value: 6, insight: "A strong trust presence does sales work before the first meeting — a significant competitive advantage most small businesses underinvest in." },
    ],
  },
  {
    category: "AI readiness",
    categoryColor: "#2DD4BF",
    headline: "You find out your closest competitor just cut their admin time by 40% using AI. What's your honest reaction?",
    scenario: "AI isn't coming — it's already being used by your competitors right now. The question isn't whether it matters. It's how far behind you are.",
    options: [
      { label: "Panic. I have no idea where to start and it all feels overwhelming.", sub: "I know I should be doing something but I don't know what", value: 0, insight: "This is the most common reaction — and the most dangerous position. Businesses 12 months into AI adoption are compounding their advantage every week." },
      { label: "Mild concern. I've tried a few AI tools but it hasn't changed how I work.", sub: "Played with ChatGPT, maybe used it for writing — but nothing stuck", value: 2, insight: "Using ChatGPT occasionally is like having a gym membership and going twice a year. The real ROI comes from systematic integration into your workflows." },
      { label: "Motivated. I use AI regularly for specific tasks — but it's not fully systematic yet.", sub: "It helps, but it's not woven into how my business actually runs", value: 4, insight: "You've got the habit. The next level is proper workflow integration: connecting AI to your existing tools so it amplifies your whole operation." },
      { label: "Unsurprised. AI is embedded across my workflows and I've already seen the savings.", sub: "Multiple processes run with AI assistance — it's just how I work now", value: 6, insight: "AI embedded across multiple workflows is a genuine competitive moat at the SME level. The next frontier is building proprietary AI tools." },
    ],
  },
];

const CATS: Record<number, string> = { 0: "web presence", 1: "lead follow-up", 2: "cybersecurity posture", 3: "business automation", 4: "data & reporting", 5: "client onboarding experience", 6: "online reputation", 7: "AI readiness" };

const REC_DESCS: Record<number, string> = {
  0: "Your online presence is the top of your entire funnel — every other improvement depends on it. A conversion-optimised site with a clear offer can start generating real enquiries within weeks.",
  1: "Speed of response is one of the highest-leverage fixes available. Automated sequences mean every lead gets a professional reply — even on weekends.",
  2: "Cybersecurity isn't about fear — it's about not being the easiest target. A basic audit identifies and closes your highest-risk vulnerabilities, usually in a single session.",
  3: "Time spent on manual admin is time not spent on growth. Most routine tasks can be automated in an afternoon and the savings compound every single week.",
  4: "You can't improve what you can't see. A live dashboard that takes a day to set up can transform the quality of decisions you make every week — permanently.",
  5: "The experience after the sale determines your referrals, retention, and reputation. A structured onboarding sequence is often the single highest-ROI process a small business can build.",
  6: "Your reputation is doing sales work (or not) before every single meeting. Five more reviews and a clear LinkedIn presence could change how prospects feel about you.",
  7: "AI adoption is compounding — the earlier you build it into your workflows, the wider the gap between you and businesses that wait.",
};

/* ─────────── HELPERS ─────────── */

function getBand(score: number) {
  if (score <= 25) return { label: "Digitally At Risk", color: "#E05252", bg: "rgba(224,82,82,0.12)" };
  if (score <= 50) return { label: "Early Stage", color: "#E09B3D", bg: "rgba(224,155,61,0.12)" };
  if (score <= 74) return { label: "Developing", color: "#A668D0", bg: "rgba(166,104,208,0.12)" };
  return { label: "Advanced", color: "#3DBE8F", bg: "rgba(61,190,143,0.12)" };
}

function getHeadline(s: number) {
  if (s <= 25) return "Your business has significant digital gaps — and they're costing you clients right now.";
  if (s <= 50) return "You've made a start — but real revenue is slipping through the cracks.";
  if (s <= 74) return "Solid foundations. The right upgrades could significantly accelerate your growth.";
  return "You're ahead of the curve. Time to build advantages that are hard to replicate.";
}

function getBody(s: number) {
  if (s <= 25) return "The scenarios above reveal that your business is losing potential clients at multiple points — before they find you, in the follow-up, and through operational drag. None of this is unusual. The question is how quickly you address it.";
  if (s <= 50) return "You're doing some things well, but there are clear gaps between where you are and where your strongest competitors operate. The good news: those gaps are more fixable than they might feel right now.";
  if (s <= 74) return "You've built real digital infrastructure. You're ahead of most businesses in your sector — but there are still meaningful gaps that, once closed, will compound your advantage significantly.";
  return "You're operating at a high level across the board. Your focus now should be on depth and differentiation — building systems that competitors would need significant time to replicate.";
}

function getBenchmarkText(s: number) {
  if (s <= 25) return "You're in the bottom 20% of businesses digitally. Every gap has a fix — and most can be addressed within 30 days.";
  if (s <= 50) return `You're ahead of ${s}% of small businesses in your sector. Closing your top 3 gaps could double inbound enquiries within 90 days.`;
  if (s <= 74) return "You're in the top 40% digitally. Targeted upgrades to your weakest categories could put you in the top 10% within six months.";
  return "You're in the top 15% of businesses digitally. The next stage is building compounding advantages that competitors can't easily replicate.";
}

function getCatColor(v: number) {
  if (v === 0) return "#E05252";
  if (v <= 2) return "#E09B3D";
  if (v <= 4) return "#A668D0";
  return "#3DBE8F";
}

/* ─────────── COMPONENT ─────────── */

type Phase = "welcome" | "quiz" | "capture" | "results";

export default function AssessmentPage() {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [biz, setBiz] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [leadId, setLeadId] = useState<string | null>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const catFillRefs = useRef<(HTMLDivElement | null)[]>([]);

  const TOTAL = QUESTIONS.length;

  const progress = phase === "welcome" ? 0
    : phase === "quiz" ? Math.round(((qIndex + 1) / TOTAL) * 85)
    : phase === "capture" ? 90
    : 100;

  const progressLabel = phase === "welcome" ? "Assessment"
    : phase === "quiz" ? `Scenario ${qIndex + 1}`
    : phase === "capture" ? "Almost done"
    : "Your results";

  const calcScore = useCallback(() => {
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    return Math.round((total / (TOTAL * 6)) * 100);
  }, [answers, TOTAL]);

  const selectOption = useCallback((qIdx: number, value: number, insight: string) => {
    setAnswers(prev => ({ ...prev, [qIdx]: value }));
    setSelectedInsight(insight);

    setTimeout(() => {
      setSelectedInsight(null);
      if (qIdx < TOTAL - 1) {
        setQIndex(qIdx + 1);
      } else {
        setPhase("capture");
      }
    }, 600);
  }, [TOTAL]);

  const goBack = useCallback(() => {
    setSelectedInsight(null);
    if (qIndex > 0) {
      setQIndex(qIndex - 1);
    } else {
      setPhase("welcome");
    }
  }, [qIndex]);

  const submitForm = useCallback(async () => {
    if (!name.trim() || !email.trim() || !consent) {
      setError(true);
      return;
    }
    setError(false);
    setLoading(true);

    const finalScore = calcScore();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const webhookUrl = process.env.NEXT_PUBLIC_ASSESSMENT_WEBHOOK;

    const payload = {
      name: name.trim(),
      email: email.trim(),
      business: biz.trim() || null,
      score: finalScore,
      band: getBand(finalScore).label,
      ...Object.fromEntries(QUESTIONS.map((_, i) => [`q${i + 1}`, answers[i] || 0])),
      created_at: new Date().toISOString(),
    };

    try {
      if (supabaseUrl && supabaseKey) {
        const res = await fetch(`${supabaseUrl}/rest/v1/leads`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Prefer: "return=representation" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const rows = (await res.json()) as Array<{ id?: string }>;
          const insertedId = rows?.[0]?.id;
          if (insertedId) setLeadId(insertedId);
        }
      }
    } catch (e) { console.warn("Supabase error:", e); }

    try {
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), score: finalScore, band: getBand(finalScore).label, business: biz.trim() }),
        });
      }
    } catch { /* silent */ }

    await new Promise(r => setTimeout(r, 1200));

    setScore(finalScore);
    setLoading(false);
    setPhase("results");

    const start = performance.now();
    const animate = (now: number) => {
      const p = Math.min((now - start) / 1500, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedScore(Math.round(eased * finalScore));
      if (circleRef.current) {
        const C = 364.4;
        circleRef.current.style.strokeDashoffset = String(C - (C * (eased * finalScore / 100)));
      }
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    setTimeout(() => {
      catFillRefs.current.forEach((el, i) => {
        if (el) {
          const v = answers[i] || 0;
          el.style.width = `${Math.round((v / 6) * 100)}%`;
          el.style.background = getCatColor(v);
        }
      });
    }, 300);
  }, [name, email, biz, consent, answers, calcScore]);

  const getRecs = useCallback(() => {
    const sorted = Array.from({ length: TOTAL }, (_, i) => i)
      .sort((a, b) => (answers[a] || 0) - (answers[b] || 0));
    const recs = sorted.filter(q => (answers[q] || 0) < 4).slice(0, 3)
      .map(q => ({ title: `Improve your ${CATS[q]}`, desc: REC_DESCS[q] }));
    if (recs.length === 0) recs.push({ title: "Optimise and scale what's working", desc: "You're already in the top tier. The next level is AI-assisted decision making and compounding advantages." });
    return recs;
  }, [answers, TOTAL]);

  const band = getBand(score);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [phase, qIndex]);

  return (
    <div className="min-h-screen flex flex-col items-center pb-20" style={{ background: "#08060F", color: "#F0ECF4", fontFamily: "var(--font-body)" }}>
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4" style={{ background: "rgba(8,6,15,0.9)" }}>
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--color-accent)" }} />
          <span className="text-[14px]" style={{ color: "rgba(240,236,244,0.5)" }}>Calculating your score...</span>
        </div>
      )}

      {/* Minimal nav */}
      <nav className="w-full max-w-[700px] flex items-center justify-between px-4 pt-6 pb-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-tree.png" alt="Sagacity Network" width={28} height={28} />
          <span className="text-[13px] font-[700] tracking-[0.06em] uppercase" style={{ fontFamily: "var(--font-display)" }}>Sagacity Network</span>
        </Link>
        <Link href="/" className="text-[13px]" style={{ color: "rgba(240,236,244,0.5)" }}>Back to site &rarr;</Link>
      </nav>

      {/* Progress bar */}
      <div className="w-full max-w-[700px] px-4 mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-[12px] tracking-[0.04em]" style={{ color: "rgba(240,236,244,0.5)" }}>{progressLabel}</span>
          <span className="text-[12px]" style={{ color: "rgba(240,236,244,0.5)" }}>{phase === "quiz" ? `${qIndex + 1} of ${TOTAL}` : ""}</span>
        </div>
        <div className="h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "var(--gradient-purple)", transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-[700px] mx-4" style={{ background: "#111520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "clamp(24px, 5vw, 40px)" }}>

        {/* WELCOME */}
        {phase === "welcome" && (
          <div>
            <div className="text-[11px] font-[500] tracking-[0.12em] uppercase mb-3" style={{ color: "var(--color-accent)" }}>8 scenarios &middot; 8 minutes &middot; Instant results</div>
            <h1 className="text-[clamp(22px,4vw,32px)] font-[800] leading-[1.15] mb-3" style={{ fontFamily: "var(--font-display)" }}>How digitally ready is your business — really?</h1>
            <p className="text-[15px] font-[300] leading-[1.65] mb-7" style={{ color: "rgba(240,236,244,0.5)" }}>Not a generic quiz. Eight real-world scenarios that expose exactly where your business is losing clients, time, and money — with a stat or insight after every question.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
              {[
                { icon: "🎯", title: "Scenario-based", desc: "Real situations, not abstract ratings." },
                { icon: "💡", title: "Learn as you go", desc: "Every answer reveals an industry insight." },
                { icon: "📊", title: "8-category breakdown", desc: "See which areas are costing you." },
                { icon: "⚡", title: "Instant action plan", desc: "Personalised fix list, ranked by impact." },
              ].map((c) => (
                <div key={c.title} className="p-4 rounded-xl" style={{ background: "#1A1F2E", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-[18px] mb-2">{c.icon}</div>
                  <div className="text-[13px] font-[500] mb-1">{c.title}</div>
                  <div className="text-[12px] font-[300] leading-[1.5]" style={{ color: "rgba(240,236,244,0.5)" }}>{c.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={() => { setPhase("quiz"); setQIndex(0); }} className="shimmer-btn px-7 py-3 text-[14px] font-[500] rounded-xl border-0 cursor-pointer" style={{ background: "var(--gradient-purple)", color: "#fff" }}>Start the assessment &rarr;</button>
            <div className="flex items-center gap-3 mt-5">
              <div className="flex">
                {["JM", "RB", "KA", "TP"].map((init, i) => (
                  <div key={init} className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9px] font-[600]" style={{ background: "#1A1F2E", border: "2px solid #111520", color: "rgba(240,236,244,0.5)", marginLeft: i > 0 ? "-7px" : "0" }}>{init}</div>
                ))}
              </div>
              <span className="text-[12px]" style={{ color: "rgba(240,236,244,0.26)" }}>Joined by 200+ business owners</span>
            </div>
          </div>
        )}

        {/* QUIZ */}
        {phase === "quiz" && (
          <div key={qIndex}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] font-[500] tracking-[0.1em] uppercase" style={{ color: "var(--color-accent)" }}>Scenario {qIndex + 1} of {TOTAL}</span>
              <span className="text-[11px] font-[500] px-3 py-0.5 rounded-full" style={{ color: QUESTIONS[qIndex].categoryColor, border: `1px solid ${QUESTIONS[qIndex].categoryColor}33` }}>{QUESTIONS[qIndex].category}</span>
            </div>
            <h2 className="text-[clamp(19px,3.5vw,26px)] font-[800] leading-[1.2] mb-2" style={{ fontFamily: "var(--font-display)" }}>{QUESTIONS[qIndex].headline}</h2>
            <div className="text-[14px] font-[300] italic leading-[1.65] p-3 pl-4 mb-6 rounded-r-lg" style={{ color: "rgba(240,236,244,0.5)", background: "#1A1F2E", borderLeft: "2px solid var(--color-accent)" }}>{QUESTIONS[qIndex].scenario}</div>
            <div className="flex flex-col gap-2.5 mb-4">
              {QUESTIONS[qIndex].options.map((opt, optIdx) => {
                const isSelected = answers[qIndex] === opt.value;
                return (
                  <button key={optIdx} onClick={() => selectOption(qIndex, opt.value, opt.insight)} className="flex items-start gap-3.5 p-4 rounded-xl text-left cursor-pointer transition-all duration-150" style={{ background: isSelected ? "rgba(123,63,160,0.07)" : "#1A1F2E", border: isSelected ? "1px solid var(--color-accent)" : "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 relative" style={{ border: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.18)", background: isSelected ? "var(--color-accent)" : "transparent" }}>
                      {isSelected && <div className="absolute inset-0 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>}
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] leading-[1.45]" style={{ color: "#F0ECF4" }}>{opt.label}</div>
                      <div className="text-[12px] font-[300] mt-1" style={{ color: "rgba(240,236,244,0.5)" }}>{opt.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedInsight && (
              <div className="flex items-start gap-3 p-4 mb-4 rounded-xl" style={{ background: "rgba(123,63,160,0.08)", border: "1px solid rgba(123,63,160,0.18)" }}>
                <span className="text-[16px] flex-shrink-0 mt-0.5">💡</span>
                <span className="text-[13px] font-[300] leading-[1.6]" style={{ color: "rgba(240,236,244,0.6)" }}>{selectedInsight}</span>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={goBack} className="px-5 py-3 text-[14px] font-[500] rounded-xl cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(240,236,244,0.5)" }}>&larr; Back</button>
            </div>
          </div>
        )}

        {/* EMAIL CAPTURE */}
        {phase === "capture" && (
          <div>
            <div className="text-[11px] font-[500] tracking-[0.12em] uppercase mb-3" style={{ color: "var(--color-accent)" }}>Almost there</div>
            <h2 className="text-[clamp(20px,3.5vw,28px)] font-[800] leading-[1.15] mb-2" style={{ fontFamily: "var(--font-display)" }}>Your score is ready.</h2>
            <p className="text-[15px] font-[300] leading-[1.65] mb-7" style={{ color: "rgba(240,236,244,0.5)" }}>Enter your details to receive your Digital Readiness Score, an 8-category breakdown, and a personalised action plan.</p>
            <div className="flex flex-col gap-3 mb-5">
              <input className="w-full p-3.5 text-[14px] rounded-xl outline-none" style={{ background: "#1A1F2E", border: "1px solid rgba(255,255,255,0.08)", color: "#F0ECF4" }} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              <input className="w-full p-3.5 text-[14px] rounded-xl outline-none" style={{ background: "#1A1F2E", border: "1px solid rgba(255,255,255,0.08)", color: "#F0ECF4" }} type="email" placeholder="Business email address" value={email} onChange={e => setEmail(e.target.value)} />
              <input className="w-full p-3.5 text-[14px] rounded-xl outline-none" style={{ background: "#1A1F2E", border: "1px solid rgba(255,255,255,0.08)", color: "#F0ECF4" }} placeholder="Business name (optional)" value={biz} onChange={e => setBiz(e.target.value)} />
            </div>
            <label className="flex items-start gap-3 mb-5 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="w-4 h-4 mt-1 flex-shrink-0" style={{ accentColor: "var(--color-accent)" }} />
              <span className="text-[12px] font-[300] leading-[1.55]" style={{ color: "rgba(240,236,244,0.26)" }}>I agree to receive my score and follow-up emails from Sagacity Network Ltd. No spam. Unsubscribe anytime.</span>
            </label>
            <button onClick={submitForm} className="shimmer-btn w-full px-7 py-3.5 text-[14px] font-[500] rounded-xl border-0 cursor-pointer" style={{ background: "var(--gradient-purple)", color: "#fff" }}>Show my Digital Readiness Score &rarr;</button>
            {error && <p className="text-[13px] mt-3" style={{ color: "#E05252" }}>Please fill in your name and email, and agree to the terms above.</p>}
            <div className="flex items-center gap-2 mt-4">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="6" width="10" height="6" rx="1" stroke="rgba(240,237,230,0.26)" strokeWidth="1.2" /><path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="rgba(240,237,230,0.26)" strokeWidth="1.2" /></svg>
              <span className="text-[12px]" style={{ color: "rgba(240,236,244,0.26)" }}>Encrypted and never shared with third parties.</span>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {phase === "results" && (
          <div>
            <div className="text-[11px] font-[500] tracking-[0.12em] uppercase mb-5" style={{ color: "var(--color-accent)" }}>Your digital readiness score</div>
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-[136px] h-[136px]">
                <svg width="136" height="136" viewBox="0 0 136 136" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="68" cy="68" r="58" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle ref={circleRef} cx="68" cy="68" r="58" fill="none" stroke={band.color} strokeWidth="8" strokeDasharray="364.4" strokeDashoffset="364.4" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[38px] font-[800]" style={{ fontFamily: "var(--font-display)", lineHeight: 1 }}>{animatedScore}</span>
                  <span className="text-[12px] mt-1" style={{ color: "rgba(240,236,244,0.5)" }}>out of 100</span>
                </div>
              </div>
              <span className="mt-3 text-[11px] font-[600] tracking-[0.1em] uppercase px-4 py-1 rounded-full" style={{ color: band.color, border: `1px solid ${band.color}`, background: band.bg }}>{band.label}</span>
            </div>

            <h2 className="text-[clamp(17px,3vw,22px)] font-[800] leading-[1.2] mb-2" style={{ fontFamily: "var(--font-display)" }}>{getHeadline(score)}</h2>
            <p className="text-[14px] font-[300] leading-[1.7] mb-5" style={{ color: "rgba(240,236,244,0.5)" }}>{getBody(score)}</p>

            <div className="flex items-start gap-3 p-4 rounded-xl mb-5" style={{ background: "#1A1F2E", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="text-[18px] flex-shrink-0">📊</span>
              <span className="text-[13px] font-[300] leading-[1.55]" style={{ color: "rgba(240,236,244,0.5)" }}>{getBenchmarkText(score)}</span>
            </div>

            <hr className="border-0 mb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
            <div className="text-[11px] font-[500] tracking-[0.1em] uppercase mb-4" style={{ color: "rgba(240,236,244,0.5)" }}>Your score by category</div>
            <div className="mb-5">
              {QUESTIONS.map((q, i) => {
                const v = answers[i] || 0;
                return (
                  <div key={i} className="flex items-center gap-3 mb-3">
                    <span className="text-[13px] font-[300] w-[120px] flex-shrink-0" style={{ color: "rgba(240,236,244,0.5)" }}>{q.category}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div ref={el => { catFillRefs.current[i] = el; }} className="h-full rounded-full" style={{ width: "0%", transition: "width 1.1s cubic-bezier(0.4, 0, 0.2, 1)" }} />
                    </div>
                    <span className="text-[12px] font-[500] w-[26px] text-right" style={{ color: getCatColor(v) }}>{v}/6</span>
                  </div>
                );
              })}
            </div>

            <hr className="border-0 mb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
            <div className="text-[11px] font-[500] tracking-[0.1em] uppercase mb-4" style={{ color: "rgba(240,236,244,0.5)" }}>Your top priorities</div>
            <div className="flex flex-col gap-3 mb-5">
              {getRecs().map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "#1A1F2E", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-[600] text-white" style={{ background: "var(--color-accent)" }}>{i + 1}</div>
                  <div>
                    <div className="text-[14px] font-[500] mb-1">{rec.title}</div>
                    <div className="text-[13px] font-[300] leading-[1.55]" style={{ color: "rgba(240,236,244,0.5)" }}>{rec.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl mb-5" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(135deg, rgba(123,63,160,0.06), transparent)" }}>
              <h3 className="text-[18px] font-[700] mb-2" style={{ fontFamily: "var(--font-display)" }}>Ready to close the gaps?</h3>
              <p className="text-[13px] font-[300] leading-[1.6] mb-5" style={{ color: "rgba(240,236,244,0.5)" }}>Book a free 30-minute Digital Clarity Call. We&apos;ll walk through your score category by category — no hard sell.</p>
              <div className="flex gap-3 flex-wrap">
                <Link href={leadId ? `/book?leadId=${leadId}` : "/book"} className="shimmer-btn px-6 py-3 text-[14px] font-[500] rounded-xl no-underline" style={{ background: "var(--gradient-purple)", color: "#fff" }}>Book a free call &rarr;</Link>
                <Link href="/services" className="px-6 py-3 text-[14px] font-[500] rounded-xl no-underline" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(240,236,244,0.5)" }}>See our services</Link>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px]" style={{ color: "rgba(240,236,244,0.26)" }}>Share your score:</span>
              <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`I scored ${score}/100 on the Sagacity Digital Readiness Assessment: ${window.location.origin}/assessment`)}`, "_blank")} className="px-4 py-1.5 text-[12px] font-[500] rounded-lg cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(240,236,244,0.5)" }}>WhatsApp</button>
              <button onClick={() => navigator.clipboard.writeText(window.location.origin + "/assessment")} className="px-4 py-1.5 text-[12px] font-[500] rounded-lg cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(240,236,244,0.5)" }}>Copy link</button>
            </div>

            <div className="text-center mt-6 text-[12px]" style={{ color: "rgba(240,236,244,0.26)" }}>sagacitynetwork.net &middot; UK Registered</div>
          </div>
        )}
      </div>
    </div>
  );
}
