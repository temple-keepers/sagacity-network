# SAGACITY NETWORK — COMPLETE CLAUDE CODE BUILD BRIEF
# Paste this entire document into Claude Code at project start.
# This is the single source of truth for the entire build.

---

## PROJECT OVERVIEW

**Site:** sagacitynetwork.net
**Company:** Sagacity Network Ltd — registered in England & Wales
**Location:** Basildon, England
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Supabase · Resend · Vercel

**What this site is:** A premium global digital product studio website that also serves as a lead generation engine for the Guyanese market. It must look credible to a UK enterprise client, a US nonprofit, and a Georgetown restaurant owner simultaneously. It is the studio's own showcase — proof of what we build.

**Tone:** Premium. Purposeful. Globally credible. Warm but authoritative. Not corporate-cold, not startup-casual.

---

## THE FOUNDERS

**Denise — Founder & Digital Product Director**
- Over 11 years in the engineering division of a global consumer goods company (Fortune 500, name not disclosed for employment reasons)
- Managed capital programmes exceeding £200M across 700+ projects
- Built Power BI and reporting systems from scratch to automate project budget management processes at enterprise scale
- Certifications: Integrative Nutrition Health Coach · Nutritional Therapist · Advanced Fertility Nutritional Advisor · Advanced Clinical Weight Loss Practitioner
- Has designed and deployed 5 live digital platforms serving Christian, Guyanese, and Caribbean communities worldwide
- Based in Basildon, England

**Co-Founder — Cybersecurity Director** (name not used on site, referred to by role only)
- Certified cybersecurity specialist
- Expertise: vulnerability assessment, penetration testing, security architecture, staff awareness training, incident response
- Every Sagacity client benefits from cybersecurity thinking built in from day one

**Mission statement:**
"Sagacity Network is where enterprise discipline meets human scale — building the digital infrastructure that growing businesses and communities deserve."

---

## DESIGN SYSTEM

### Colours (implement as CSS variables in globals.css)
```css
:root {
  --bg-primary: #07050F;
  --bg-secondary: #0D0818;
  --bg-card: rgba(255,255,255,0.02);
  --gold: #D4AF37;
  --gold-light: #F5E070;
  --gold-dim: rgba(212,175,55,0.15);
  --gold-border: rgba(212,175,55,0.2);
  --purple: #9F7AEA;
  --purple-deep: #6D28D9;
  --text-primary: #F5F0E8;
  --text-secondary: rgba(245,240,232,0.55);
  --text-muted: rgba(245,240,232,0.35);
  --border: rgba(245,240,232,0.07);
  --border-hover: rgba(245,240,232,0.15);
  --green: #34D399;
  --blue: #60A5FA;
  --coral: #F87171;
}
```

### Typography
- **Display/Headings:** Cormorant Garamond — weights 300, 400, 600 including italic variants
- **Body/UI:** DM Sans — optical size 9..40, weights 300, 400, 500, 600
- **Base size:** 16px, line-height 1.75
- **Heading sizes:** clamp values for fluid type — h1: clamp(52px,7.8vw,112px), h2: clamp(38px,4.8vw,68px), h3: clamp(22px,2.5vw,32px)
- **Never use:** Inter, Roboto, Arial, system-ui as primary fonts

### Logo
- File: /public/logo.png
- Description: Purple geometric tree with gold network branches and roots on black background
- Use with: filter: drop-shadow(0 0 12px rgba(212,175,55,0.25))
- Never add a background behind the logo — it has its own black background built in
- Nav size: 46x46px. Hero size: 280x280px. Footer: 38x38px

### Visual Language
- Grid background: 64px grid lines at rgba(212,175,55,0.03) on bg-primary
- Cards: bg-card background, 1px solid var(--border), border-radius 2px
- Hover cards: border-color shifts to gold-border, translateY(-6px)
- Active accent lines: 2px gradient line at top of highlighted cards (transparent → gold → transparent)
- Glow orbs: radial-gradient blobs of purple/gold at low opacity in section backgrounds
- No gradients on text except the shimmer hero headline
- Shimmer animation on hero h1 second line: gold shimmer cycling left to right

### Animations
```css
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
@keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
@keyframes pulse-ring { 0%{transform:scale(.9);opacity:.7} 100%{transform:scale(1.4);opacity:0} }
@keyframes fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
```
- Scroll reveals: IntersectionObserver at 0.1 threshold, fade up 36px, cubic-bezier(0.16,1,0.3,1) 0.75s
- Hover transitions: 0.25s ease
- Logo float: 7s ease-in-out infinite

---

## SITE ARCHITECTURE

```
src/
├── app/
│   ├── layout.tsx              Root layout with Nav + Footer
│   ├── page.tsx                Homepage (all sections)
│   ├── globals.css             Design system + resets
│   ├── services/
│   │   └── page.tsx            Full services detail page
│   ├── work/
│   │   ├── page.tsx            Portfolio index
│   │   └── [slug]/page.tsx     Individual case studies
│   ├── training/
│   │   ├── page.tsx            Sagacity Academy hub
│   │   └── [slug]/page.tsx     Individual course pages
│   ├── guyana/
│   │   └── page.tsx            Guyanese market landing page
│   ├── about/
│   │   └── page.tsx            Founders + mission + story
│   ├── blog/
│   │   ├── page.tsx            Blog index
│   │   └── [slug]/page.tsx     Individual blog posts
│   ├── contact/
│   │   └── page.tsx            Smart intake form
│   └── api/
│       ├── contact/route.ts    Contact form handler → Supabase + Resend
│       └── enrol/route.ts      Course enrolment capture → Supabase
├── components/
│   ├── layout/
│   │   ├── Nav.tsx
│   │   └── Footer.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   └── RevealWrapper.tsx   Scroll animation wrapper
│   ├── sections/               Homepage sections as components
│   │   ├── Hero.tsx
│   │   ├── Stats.tsx
│   │   ├── Services.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Academy.tsx
│   │   ├── GuyanaStrip.tsx
│   │   ├── Founders.tsx
│   │   └── ContactCTA.tsx
│   └── academy/
│       ├── LiveCourseCard.tsx
│       ├── EvergreenCard.tsx
│       └── CategoryFilter.tsx
├── lib/
│   ├── data/
│   │   ├── services.ts
│   │   ├── portfolio.ts
│   │   ├── courses.ts
│   │   └── blog.ts
│   ├── supabase.ts
│   └── seo.ts                  generateMetadata helper
└── public/
    ├── logo.png
    └── og-image.png            Open Graph image (generate from logo)
```

---

## ALL DATA — IMPLEMENT IN lib/data/

### services.ts
```typescript
export const SERVICES = [
  {
    number: '01',
    slug: 'web-app-development',
    title: 'Web & App Development',
    tagline: "We don't build brochures — we build products.",
    description: 'Full-stack platforms, mobile-ready web apps, and AI-integrated tools built to production standard. From a five-page business site to a full SaaS platform — designed, built, and deployed.',
    detail: 'Every build starts with understanding what success looks like for your business, not just what pages you need. We work in Next.js, React, TypeScript, and Supabase — the same stack we use to run our own live platforms.',
    tags: ['Next.js', 'React', 'TypeScript', 'Supabase', 'AI Integration', 'Vercel'],
    icon: '⬡',
  },
  {
    number: '02',
    slug: 'data-intelligence',
    title: 'Data & Programme Intelligence',
    tagline: 'Built by someone who has managed £200M+ in real programmes.',
    description: 'Enterprise-grade reporting systems, Power BI dashboards, capital programme tooling, and process automation. We bring Fortune 500 discipline to businesses and organisations of any size.',
    detail: 'Our founder spent over 11 years managing capital programmes exceeding £200M across 700+ projects — and built the Power BI systems that made those programmes controllable. That experience is now available to your organisation.',
    tags: ['Power BI', 'Excel Automation', 'KPI Dashboards', 'Process Design', 'Capital Management', 'Reporting'],
    icon: '◈',
  },
  {
    number: '03',
    slug: 'automation-ai',
    title: 'Business Automation & AI',
    tagline: 'Give your team hours back every week.',
    description: 'WhatsApp bots, workflow automation, document generation, and bespoke Claude-powered tools. We identify where your team is doing manually what a system should be doing — and we fix it.',
    detail: 'We use Claude API, n8n, Make, and custom code to build automations that are robust, maintainable, and actually used. Every automation we build starts with mapping your real process — not imposing a template.',
    tags: ['Claude API', 'n8n', 'Make', 'WhatsApp Business API', 'Document Automation', 'CRM Integration'],
    icon: '⟡',
  },
  {
    number: '04',
    slug: 'cybersecurity',
    title: 'Cybersecurity',
    tagline: 'Protection built in, not bolted on.',
    description: 'Security audits, monthly monitoring, penetration testing, staff awareness training, and incident response — delivered by a certified cybersecurity specialist.',
    detail: 'Every Sagacity website and application is security-hardened as standard. For organisations requiring dedicated cybersecurity services, our specialist delivers enterprise-grade protection at accessible prices — from a single audit to an ongoing managed security partnership.',
    tags: ['Security Audits', 'Penetration Testing', 'Staff Training', 'Monthly Monitoring', 'Incident Response', 'Breach Detection'],
    icon: '⬢',
  },
  {
    number: '05',
    slug: 'training',
    title: 'Training & Workshops',
    tagline: 'Taught by practitioners, not presenters.',
    description: 'Live workshops, structured cohort programmes, on-demand courses, and corporate training. We teach from direct experience — using these tools every day to build real platforms for real clients.',
    detail: 'From a £27 entry-level AI workshop to a £2,000 full-day corporate cybersecurity training session, Sagacity Academy makes practitioner knowledge accessible. All training is CPD-eligible.',
    tags: ['AI Workshops', 'Corporate Training', 'Power BI', 'Cybersecurity Awareness', 'Digital Foundations', 'Caribbean Focus'],
    icon: '◎',
  },
]
```

### portfolio.ts
```typescript
export const PORTFOLIO = [
  {
    slug: 'temple-keepers',
    name: 'Temple Keepers',
    category: 'Faith & Wellness Platform',
    tagline: 'A digital sanctuary for Christians over 25.',
    description: 'AI-personalised devotionals, biblical fasting programmes with cohort enrolment, community accountability pods with threaded discussions, health tracking, and a teacher/admin dashboard.',
    problem: 'Christians over 25 had no digital space that integrated genuine spiritual formation with physical wellness — most apps were either superficially devotional or purely fitness-focused.',
    solution: 'A full-stack platform combining AI-generated devotionals (in a "Denise voice" coaching persona using Claude Sonnet), a 14-day fasting cohort system, community pods with weekly challenges, and a biblical recipe generator.',
    url: 'https://templekeepers.app',
    tech: ['Next.js', 'React', 'TypeScript', 'Supabase', 'Claude AI (Anthropic)', 'Vercel'],
    accent: '#9F7AEA',
    bg: '#1A0D33',
    features: ['AI devotionals', 'Fasting programmes', 'Community pods', 'Health tracking', 'Admin dashboard', 'Recipe generator'],
  },
  {
    slug: 'rhythm-roots',
    name: 'Rhythm & Roots',
    category: 'Cultural Discovery Platform',
    tagline: 'The premier digital home for Guyanese culture.',
    description: 'A cultural discovery and community platform connecting the global Guyanese diaspora with events, creators, music, food, articles, and stories from Guyana and the Caribbean.',
    problem: 'The global Guyanese diaspora had no dedicated digital home — culture, events, and creators were scattered across generic social platforms with no Guyanese identity or curation.',
    solution: 'A full platform with event listings, creator profiles, cultural articles, music discovery, and a weekly AI-generated newsletter digest — purpose-built for the Guyanese community worldwide.',
    url: 'https://rhythmnroots.app',
    tech: ['Next.js', 'Supabase', 'Claude AI', 'Vercel', 'Resend'],
    accent: '#34D399',
    bg: '#0A2218',
    features: ['Event listings', 'Creator profiles', 'Cultural articles', 'Weekly digest', 'Community hub', 'Diaspora-first design'],
  },
  {
    slug: 'totenga',
    name: 'Totenga',
    category: 'Diaspora Commerce Platform',
    tagline: 'Shop UK. Ship Home.',
    description: 'A platform enabling diaspora communities to shop from 110+ UK stores and ship purchases to their home countries — making international shopping effortless and genuinely affordable.',
    problem: 'Diaspora communities in the UK wanted to send goods home to family but found international shipping complex, expensive, and unreliable. No single platform connected UK retail with Caribbean and African destinations affordably.',
    solution: 'A streamlined shop-and-ship platform integrating with 110+ UK retailers, providing a UK address for deliveries, consolidation, and onward shipping to home countries.',
    url: 'https://totenga.com',
    tech: ['React', 'Node.js', 'Stripe', 'Logistics API', 'Vercel'],
    accent: '#60A5FA',
    bg: '#0A1A2E',
    features: ['110+ UK stores', 'Address consolidation', 'International shipping', 'Stripe payments', 'Order tracking', 'Multi-country delivery'],
  },
  {
    slug: 'crack-solve',
    name: 'Crack Solve',
    category: 'Caribbean Education Platform',
    tagline: 'Purpose-built for Caribbean students.',
    description: 'A dynamic learning platform delivering CXC curriculum-aligned content, interactive problem-solving exercises, and AI-powered academic support for Caribbean students.',
    problem: 'Caribbean students preparing for CXC examinations had no digital platform specifically aligned to their curriculum — they were making do with US or UK-focused resources that did not match their syllabus.',
    solution: 'A curriculum-specific platform with subject content, practice questions, progress tracking, and an AI tutor — built for the CXC syllabus, Caribbean context, and Caribbean students.',
    url: 'https://cracksolve.com',
    tech: ['React', 'Supabase', 'AI Tutor', 'Vercel'],
    accent: '#F87171',
    bg: '#2A0A0A',
    features: ['CXC curriculum alignment', 'Practice questions', 'AI tutor', 'Progress tracking', 'Subject coverage', 'Caribbean context'],
  },
]
```

### courses.ts
```typescript
export const LIVE_COURSES = [
  {
    slug: 'dont-get-left-behind-ai',
    tag: 'Live · Next Session',
    title: "Don't Get Left Behind in the Age of AI",
    description: 'The practical workshop for business owners who know AI is changing everything — and want to use it confidently, not fear it. Hands-on, no jargon, immediately useful.',
    longDescription: 'In this 2-hour live workshop you will understand what AI tools actually do (and do not do), get hands-on with Claude, ChatGPT, and image tools, learn how to use AI to write content, answer customer enquiries, and draft proposals, and leave with a personal AI action plan for your specific business.',
    price: '£27',
    currency: 'GBP',
    date: 'Saturday 9th May 2025',
    time: '10:00am BST',
    format: 'Zoom · 2 hours',
    seats: 14,
    category: 'AI & Automation',
    level: 'Beginner',
    accent: '#D4AF37',
    bookingUrl: 'https://apps.sagacity.network/dont-get-left-behind-ai',
    hot: true,
    outcomes: [
      'Understand what AI tools can and cannot do for your business',
      'Use Claude and ChatGPT confidently for everyday business tasks',
      'Generate professional content, emails, and proposals with AI',
      'Build your personal AI action plan',
    ],
  },
  {
    slug: 'ai-powered-business-4-weeks',
    tag: 'Live · Cohort',
    title: 'AI-Powered Business in 4 Weeks',
    description: 'A structured cohort programme taking you from AI-curious to AI-operational across four guided sessions.',
    longDescription: 'Over four 90-minute Zoom sessions you will cover the AI landscape and choosing the right tools, content creation and customer communication automation, workflow automation and time-saving systems, and building your AI-powered business toolkit.',
    price: '£197',
    currency: 'GBP',
    date: 'June Cohort · Enrolling Now',
    time: 'Thursday evenings · 7pm BST',
    format: 'Zoom · 4 × 90 minutes',
    seats: 20,
    category: 'AI & Automation',
    level: 'Beginner',
    accent: '#D4AF37',
    bookingUrl: '#contact',
    hot: false,
    outcomes: [
      'Full working knowledge of the AI tools landscape',
      'Live automations running in your business',
      'A content creation system that saves 5+ hours per week',
      'A peer cohort of business owners to learn alongside',
    ],
  },
  {
    slug: 'cybersecurity-teams',
    tag: 'Live · Corporate',
    title: 'Cybersecurity Awareness for Teams',
    description: 'Practical staff training on phishing, social engineering, password hygiene, and data protection. Delivered by a certified cybersecurity specialist.',
    longDescription: 'This session covers the most common cyber threats targeting small and medium organisations, how to identify phishing and social engineering attacks, password and account security best practice, what to do if a breach occurs, and how to build a security-aware culture in your team.',
    price: 'From £500',
    currency: 'GBP',
    date: 'Book Your Date',
    time: 'Flexible scheduling',
    format: 'Virtual or In-Person · Half or Full Day',
    seats: null,
    category: 'Cybersecurity',
    level: 'All Levels',
    accent: '#9F7AEA',
    bookingUrl: '#contact',
    hot: false,
    outcomes: [
      'Staff who can identify and report phishing attempts',
      'Organisation-wide password and account security upgrade',
      'Clear incident response process for your team',
      'Certificate of completion for all participants',
    ],
  },
  {
    slug: 'ai-guyanese-business',
    tag: 'Live · Workshop',
    title: 'AI for Guyanese Business Owners',
    description: 'How to use AI tools to get your business online, automate your admin, and compete with larger companies. Built specifically for the Guyanese and Caribbean market.',
    longDescription: 'A workshop designed specifically for Guyanese and Caribbean business owners — using AI to write website copy, respond to customer enquiries on WhatsApp, create marketing content, and manage operations more efficiently.',
    price: '£37',
    currency: 'GBP',
    date: 'July 2025 · Registering',
    time: 'Saturday morning · 10am BST',
    format: 'Zoom · 2.5 hours',
    seats: 30,
    category: 'Caribbean & Guyana',
    level: 'Beginner',
    accent: '#34D399',
    bookingUrl: '#contact',
    hot: false,
    outcomes: [
      'AI tools you can use immediately for your Guyanese business',
      'WhatsApp automation for customer enquiries',
      'AI-written content for your website and social media',
      'Understanding of how AI is changing the Guyanese market',
    ],
  },
]

export const EVERGREEN_COURSES = [
  {
    slug: 'ai-foundations-business',
    tag: 'On-Demand',
    title: 'AI Foundations for Business Owners',
    description: 'Everything you need to understand and use AI tools in your business. Self-paced, practical, no tech background required.',
    price: '£47',
    lessons: 12,
    hours: 3.5,
    category: 'AI & Automation',
    level: 'Beginner',
    accent: '#D4AF37',
    badge: 'Bestseller',
    outcomes: ['Use Claude and ChatGPT for business tasks', 'Generate content at scale', 'Understand AI limitations and risks', 'Build an AI workflow for your business'],
  },
  {
    slug: 'power-bi-managers',
    tag: 'On-Demand',
    title: 'Power BI for Non-Technical Managers',
    description: 'Turn your spreadsheet chaos into live dashboards your whole team can use. Taught by someone who built enterprise reporting systems managing £200M+ capital programmes.',
    price: '£97',
    lessons: 18,
    hours: 6,
    category: 'Data & Reporting',
    level: 'Intermediate',
    accent: '#60A5FA',
    badge: 'New',
    outcomes: ['Build your first Power BI dashboard', 'Connect to live data sources', 'Create KPI tracking systems', 'Share reports across your organisation'],
  },
  {
    slug: 'cybersecurity-small-business',
    tag: 'On-Demand',
    title: 'Cybersecurity Essentials for Small Business',
    description: 'Protect your business, your clients, and your data. Covers the most common attacks targeting small businesses and what to do right now.',
    price: '£57',
    lessons: 10,
    hours: 2.5,
    category: 'Cybersecurity',
    level: 'Beginner',
    accent: '#9F7AEA',
    badge: null,
    outcomes: ['Identify phishing and social engineering', 'Secure your accounts and passwords', 'Protect customer data', 'Create an incident response plan'],
  },
  {
    slug: 'guyanese-business-online',
    tag: 'On-Demand',
    title: 'Getting Your Guyanese Business Online',
    description: 'Step-by-step for Guyanese business owners — domain, Google Business, social media, WhatsApp Business, and your first website. Everything in plain English.',
    price: '£27',
    lessons: 8,
    hours: 2,
    category: 'Caribbean & Guyana',
    level: 'Beginner',
    accent: '#34D399',
    badge: null,
    outcomes: ['Register a domain and set up hosting', 'Optimise your Google Business profile', 'Set up WhatsApp Business properly', 'Plan your first website'],
  },
  {
    slug: 'automate-with-ai-n8n',
    tag: 'On-Demand',
    title: 'Automate Your Business with AI & n8n',
    description: 'Build real automation workflows that save you hours every week. No coding required.',
    price: '£127',
    lessons: 22,
    hours: 8,
    category: 'AI & Automation',
    level: 'Advanced',
    accent: '#D4AF37',
    badge: 'Coming Soon',
    outcomes: ['Build n8n workflows from scratch', 'Automate client onboarding', 'Connect your tools without code', 'Create AI-powered automation systems'],
  },
  {
    slug: 'digital-foundations-caribbean',
    tag: 'On-Demand',
    title: 'Digital Foundations for Caribbean Businesses',
    description: 'Website, automation, security, and social presence — the complete digital infrastructure curriculum designed for Caribbean entrepreneurs.',
    price: '£147',
    lessons: 28,
    hours: 10,
    category: 'Caribbean & Guyana',
    level: 'Intermediate',
    accent: '#34D399',
    badge: 'Bundle',
    outcomes: ['Build and launch a professional website', 'Set up your core business automations', 'Protect your business from cyber threats', 'Create a complete digital presence'],
  },
]
```

### Guyana packages (for guyana page and homepage strip)
```typescript
export const GUYANA_PACKAGES = [
  {
    name: 'Starter',
    setup: '$297',
    monthly: '$39',
    tagline: 'Get your business online in 5 days',
    features: [
      '5-page professional website',
      'AI-written copy in your voice',
      'Security hardening included as standard',
      'Google Business profile setup',
      'Hosting & monthly maintenance',
    ],
    highlight: false,
  },
  {
    name: 'Starter + Shield',
    setup: '$494',
    monthly: '$79',
    tagline: 'Website plus full security protection',
    features: [
      'Everything in Starter',
      'Full written security audit report',
      'Monthly vulnerability scans',
      'Dark web breach monitoring',
      '30-minute security consultation call',
    ],
    highlight: true,
  },
  {
    name: 'Business',
    setup: '$597',
    monthly: '$149',
    tagline: 'Complete digital infrastructure',
    features: [
      'Everything in Starter + Shield',
      'WhatsApp chatbot — 24/7 enquiry handling',
      'Booking & lead capture automation',
      'CRM setup and integration',
      'Quarterly staff security awareness training',
    ],
    highlight: false,
  },
]
```

---

## PAGE SPECIFICATIONS

### Homepage (app/page.tsx)
Build as a composition of section components. Sections in order:

1. **Hero** — Full viewport height
   - Left column: eyebrow badge ("UK Registered Digital Product Studio" with pulse dot), H1 three lines (white / gold shimmer / muted), paragraph, two CTA buttons (gold filled + gold outline), stats bar (4 stats separated by gold dividers)
   - Right column: Logo at 280px with float animation, radial glow behind it, pulse ring circle
   - Background: 64px gold grid at 3% opacity, purple glow orb top-right, gold glow orb bottom-left
   - Scroll indicator at bottom centre

2. **Services** — Dark background
   - Section label + H2 + descriptive paragraph
   - Five service rows as interactive cards — on hover: translateX(8px), background tints gold, number turns gold, border glows
   - Number (Cormorant large) / Title + description / Tags (right-aligned)

3. **Portfolio** — Gradient background (bg-primary to bg-secondary and back)
   - Section label + H2
   - 2×2 grid of platform cards
   - Each card: category tag, platform name (Cormorant 38px), description, tech stack pills, external link button
   - On hover: translateY(-8px), background shifts to platform colour, top accent line appears

4. **Sagacity Academy** — Dark background with purple tint
   - Academy badge + H2 + descriptive paragraph + four mini stats (6+ Courses, Live Workshops, £27 Entry, CPD Eligible)
   - "Live & Upcoming" subsection header with pulse dot + "Request Corporate Training →" link
   - 4-column grid of live course cards
   - "On-Demand Courses" subsection header with diamond icon + "Lifetime access · Certificate" note
   - Category filter buttons (All, AI & Automation, Cybersecurity, Data & Reporting, Caribbean & Guyana, Digital Business)
   - 3×2 grid of evergreen course cards
   - Academy CTA strip — "Not sure where to start?" with two buttons

5. **Guyana Digital** — Dark with purple glow
   - Flag badge + H2 + descriptive paragraph + differentiator callout
   - Left: text content. Right: 4 feature tiles (⚡ Live in 5 Days, 🔒 Secured from Day One, 🌍 Diaspora-Ready, 💬 WhatsApp-First)
   - Three pricing package cards with features and CTAs
   - "No agency in Guyana combines website + cybersecurity + automation at this price" callout

6. **Founders** — bg-secondary
   - Section label + H2
   - Two founder cards side by side
   - Each card: coloured top accent line, role, name (Cormorant 42px), two bio paragraphs, credential badge
   - Mission statement blockquote below both cards

7. **Contact CTA** — Dark with centred purple glow
   - Section label + H2 + paragraph
   - Contact form: name + organisation (grid), email, service selector dropdown, message textarea
   - Submit button full width gold
   - "We respond within 24 hours" promise

### Individual page notes:

**app/training/page.tsx** — Full Sagacity Academy page
- Hero section for Academy with stats and instructor credentials
- Live courses section (same cards as homepage but full page)
- All evergreen courses with working category filter
- Course detail modal or link to /training/[slug]
- Corporate training enquiry section
- Testimonials section (placeholder, ready for real ones)

**app/training/[slug]/page.tsx** — Course detail page
- Course title, category, level badge, price
- "What you'll learn" outcomes list
- Full description / syllabus accordion
- Instructor section (Denise bio + credential for AI/data courses, co-founder bio for security courses)
- Pricing card with enrol/book CTA
- Related courses

**app/guyana/page.tsx** — Full Guyanese market landing
- Hero specifically for Guyanese audience: "Bringing Guyanese Businesses to the World Stage"
- The competitive context (no pricing comparison, just positioning)
- How it works: 3-step process (Fill intake form → Site generated in 5 days → Live and protected)
- All three packages with full feature lists
- Diaspora section: "Help a Guyanese business you love get online"
- R&R partnership mention
- FAQ accordion (common Guyanese business questions)
- WhatsApp CTA button: direct link to WhatsApp

**app/work/[slug]/page.tsx** — Case study template
- Full-width hero with platform name and category
- Problem / Solution / Outcome in three columns
- Tech stack
- Key features
- Live link button
- Back to portfolio link

**app/blog/page.tsx** — Blog index
First five articles to create as MDX files in /content/blog/:
1. `why-guyanese-businesses-invisible-online.mdx`
2. `cybersecurity-risks-caribbean-businesses.mdx`
3. `how-we-built-faith-wellness-app.mdx`
4. `guyana-oil-boom-digital-opportunity.mdx`
5. `ai-generated-websites-5-days.mdx`

---

## SEO CONFIGURATION

### Per-page metadata (implement in lib/seo.ts)
```typescript
export const defaultMeta = {
  siteName: 'Sagacity Network Ltd',
  siteUrl: 'https://sagacitynetwork.net',
  defaultTitle: 'Sagacity Network Ltd — Digital Product Studio',
  defaultDescription: 'UK-registered digital product studio. Web & app development, data intelligence, business automation, cybersecurity, and training — built by practitioners for businesses that deserve to operate at a higher level.',
  ogImage: '/og-image.png',
  twitterHandle: '@sagacitynetwork',
}

export const pageMeta = {
  home: {
    title: 'Sagacity Network Ltd — Digital Product Studio | UK',
    description: 'Enterprise-grade digital products for growing businesses. Web apps, Power BI dashboards, AI automation, cybersecurity, and training. Founded by a capital programme manager and cybersecurity specialist.',
    keywords: ['digital product studio UK', 'web development agency', 'Power BI consultant', 'cybersecurity small business', 'AI automation', 'Caribbean web design'],
  },
  guyana: {
    title: 'Professional Websites for Guyanese Businesses | Sagacity Network',
    description: 'Affordable professional websites for Guyanese businesses — live in 5 days, secured from day one, maintained monthly. From $297 setup. Website + cybersecurity + automation bundle. No agency in Guyana offers this combination.',
    keywords: ['website design Guyana', 'Guyanese business website', 'web design Georgetown', 'cybersecurity Guyana', 'Guyana digital services', 'Caribbean web agency'],
  },
  training: {
    title: 'Sagacity Academy — AI, Cybersecurity & Data Training | Sagacity Network',
    description: 'Live workshops, cohort programmes, and on-demand courses taught by practitioners. AI for business owners, Power BI, cybersecurity awareness, and digital foundations for Caribbean businesses. From £27.',
    keywords: ['AI workshop UK', 'Power BI training', 'cybersecurity training small business', 'Caribbean business training', 'AI course business owners', 'digital training Guyana'],
  },
  about: {
    title: 'About Sagacity Network — Founded by Enterprise Practitioners',
    description: 'Founded by a capital programme manager with 11+ years managing £200M+ at enterprise scale, and a certified cybersecurity specialist. Five live platforms. UK registered.',
    keywords: ['about Sagacity Network', 'digital studio founder', 'Denise Sagacity', 'UK digital agency founders'],
  },
}
```

### Structured data (JSON-LD)
Add to root layout:
- Organization schema
- WebSite schema with SearchAction
- BreadcrumbList on inner pages

---

## API ROUTES

### app/api/contact/route.ts
```typescript
// POST handler
// Body: { name, organisation, email, service, message }
// 1. Insert into Supabase table 'enquiries' (id, created_at, name, organisation, email, service, message, status='new')
// 2. Send notification email via Resend to hello@sagacitynetwork.net
// 3. Send confirmation email to submitter
// 4. Return { success: true } or { error: string }
```

### app/api/enrol/route.ts
```typescript
// POST handler
// Body: { name, email, course_slug, course_title, notifyOnly: boolean }
// 1. Insert into Supabase table 'course_enrolments' (id, created_at, name, email, course_slug, notify_only, status)
// 2. If notifyOnly: send "we'll notify you" email via Resend
// 3. If not notifyOnly: send welcome/payment instructions email
// 4. Return { success: true }
```

---

## SUPABASE SCHEMA

```sql
-- Enquiries from contact form
create table enquiries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  organisation text,
  email text not null,
  service text,
  message text,
  status text default 'new'
);

-- Course enrolments and interest
create table course_enrolments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  email text not null,
  course_slug text not null,
  course_title text,
  notify_only boolean default false,
  status text default 'pending'
);

-- RLS: disable for server-side only, or enable with service role key
```

---

## ENVIRONMENT VARIABLES (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_SITE_URL=https://sagacitynetwork.net
NOTIFICATION_EMAIL=hello@sagacitynetwork.net
```

---

## DEPENDENCIES TO INSTALL
```bash
npm install framer-motion @supabase/supabase-js resend next-mdx-remote gray-matter
```

---

## COMPONENT PATTERNS

### RevealWrapper (scroll animation)
```typescript
// Uses IntersectionObserver at 0.1 threshold
// Fades up 36px on enter
// Accepts delay prop (milliseconds)
// Used to wrap any section content that should animate in
```

### Button variants
- Primary: gold background, dark text, 2px radius, uppercase small caps
- Outline: transparent background, gold border, light text
- Both: hover translateY(-2px), 0.25s transition

### Card base
- Background: var(--bg-card)
- Border: 1px solid var(--border)
- Border-radius: 2px
- Hover: border-color var(--border-gold), translateY(-6px), 0.4s transition
- Top accent line on featured/highlighted cards

---

## LAUNCH CHECKLIST (implement before going live)
- [ ] All images have alt text
- [ ] All pages have unique meta titles and descriptions
- [ ] sitemap.xml generated and submitted
- [ ] robots.txt configured
- [ ] Google Search Console verified
- [ ] Open Graph image renders correctly on social share
- [ ] Contact form submits to Supabase and sends emails
- [ ] All external links open in new tab with rel="noopener noreferrer"
- [ ] Mobile navigation works on all breakpoints
- [ ] Lighthouse score: Performance 90+, Accessibility 95+, SEO 100
- [ ] Logo file present at /public/logo.png
- [ ] Domain connected on Vercel
- [ ] Environment variables set in Vercel dashboard

---

## HOW TO WORK WITH THIS BRIEF

This is your single source of truth. Build the site methodically:

**Session 1:** globals.css + layout.tsx + Nav + Footer + Homepage Hero
**Session 2:** Services section + Portfolio section
**Session 3:** Sagacity Academy section (full — live courses + evergreen + filter)
**Session 4:** Guyana Digital section + Founders section + Contact CTA
**Session 5:** /services page + /work/[slug] case study template
**Session 6:** /training page + /training/[slug] course detail
**Session 7:** /guyana page + /about page + /contact page
**Session 8:** Blog setup + first 5 articles + full SEO implementation
**Session 9:** API routes (contact form + enrolment) + Supabase + Resend
**Session 10:** Mobile responsive pass + performance + Lighthouse + launch

After each session, run `npm run build` to catch TypeScript errors before moving on.

When asking Claude Code to build a section, always reference this document: "Following the Sagacity brief, build the [X] section using the data from lib/data/[file].ts and the design system in globals.css."
