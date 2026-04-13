export interface Platform {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  url: string;
  gradient: string;
  emoji: string;
  stack: string[];
  highlights: string[];
  problem: string;
  approach: string;
  outcome: string;
}

export const PLATFORMS: Platform[] = [
  {
    slug: "temple-keepers",
    name: "Temple Keepers",
    category: "Faith & Wellness",
    tagline: "Faith & wellness, reimagined for the modern believer.",
    description:
      "A full-stack faith platform with AI-powered devotionals, fasting cohorts, community pods, and personalised spiritual growth tracking. Built on Next.js with Supabase, real-time features, and a subscription model.",
    url: "https://templekeepers.app",
    gradient: "linear-gradient(135deg, #5B2D8E 0%, #7B3FA0 100%)",
    emoji: "\u26EA",
    stack: ["Next.js", "Supabase", "Claude API", "Vercel", "Stripe"],
    highlights: [
      "AI devotional engine generating daily personalised content",
      "Community pods with real-time messaging",
      "Fasting cohorts with accountability tracking",
      "Subscription billing via Stripe",
    ],
    problem:
      "Faith communities lacked a modern digital space that combined daily devotional content with genuine community features. Existing apps were either content-only or social-only, with no AI personalisation and no way to track spiritual growth over time.",
    approach:
      "We built a full-stack platform from scratch using Next.js and Supabase. The AI devotional engine uses Claude to generate personalised daily content based on each user's faith journey. Real-time community pods allow believers to connect, and fasting cohorts provide structured accountability. Stripe handles subscription billing with tiered access.",
    outcome:
      "Temple Keepers is live and serving real users daily. The AI devotional engine generates fresh content every morning, community pods are active, and the subscription model is generating recurring revenue. The platform continues to grow with new features added monthly.",
  },
  {
    slug: "rhythm-and-roots",
    name: "Rhythm & Roots",
    category: "Cultural Platform",
    tagline: "Connecting the Guyanese diaspora with culture, events, and creators.",
    description:
      "A cultural discovery platform that brings the Caribbean diaspora together through curated events, creator spotlights, and community stories. Features event listings, artist profiles, and a blog powered by a headless CMS.",
    url: "https://rhythmnroots.app",
    gradient: "linear-gradient(135deg, #C9A84C 0%, #A88B3D 100%)",
    emoji: "\uD83C\uDFB6",
    stack: ["Next.js", "Supabase", "Vercel", "Tailwind CSS"],
    highlights: [
      "Event discovery with location-based search",
      "Creator and artist profile pages",
      "Cultural blog with rich media content",
      "SEO-optimised for diaspora search terms",
    ],
    problem:
      "The Guyanese and Caribbean diaspora had no central platform to discover cultural events, find creators, or share community stories. Information was scattered across Facebook groups and WhatsApp chains with no discoverability for newcomers.",
    approach:
      "We designed a cultural discovery platform with event listings, creator spotlights, and a rich content blog. Built with Next.js for SEO performance and Supabase for the backend. The content architecture makes it easy to add new events, artists, and stories without developer involvement.",
    outcome:
      "Rhythm & Roots is live as the go-to platform for Guyanese cultural discovery. Event listings drive regular traffic, creator profiles give artists a professional online presence, and the blog ranks for diaspora-related search terms across Google.",
  },
  {
    slug: "totenga",
    name: "Totenga",
    category: "Diaspora Commerce",
    tagline: "Shop UK. Ship Home. 110+ retailers, international shipping.",
    description:
      "A diaspora commerce platform enabling Caribbean and African communities in the UK to shop from 110+ UK retailers and ship internationally to family back home. Full logistics integration with real-time tracking and competitive shipping rates.",
    url: "https://totenga.com",
    gradient: "linear-gradient(135deg, #3D8E6E 0%, #2D6E52 100%)",
    emoji: "\uD83C\uDF10",
    stack: ["React", "Node.js", "Stripe", "Logistics API"],
    highlights: [
      "110+ UK retailer integrations",
      "International shipping to Caribbean and Africa",
      "Real-time package tracking",
      "Stripe payment processing",
    ],
    problem:
      "Caribbean and African diaspora communities in the UK had no reliable, affordable way to shop from UK retailers and ship products home to family. Existing shipping services were expensive, fragmented, and lacked transparency on delivery times.",
    approach:
      "We built a full commerce platform with integrations to 110+ UK retailers, a logistics backbone for international shipping, and Stripe-powered payments. The platform handles the entire journey from product browsing to doorstep delivery with real-time tracking at every stage.",
    outcome:
      "Totenga is live and processing shipments to the Caribbean and Africa. The platform has connected thousands of diaspora families with an affordable, transparent way to send goods home. Competitive shipping rates and real-time tracking have made it a trusted service in the community.",
  },
  {
    slug: "crack-solve",
    name: "Crack Solve",
    category: "Education Technology",
    tagline: "Caribbean education, powered by AI.",
    description:
      "An education platform built around the CXC curriculum, giving Caribbean students access to AI-powered tutoring, practice questions, and exam preparation. Designed to make quality education accessible regardless of location.",
    url: "https://cracksolve.com",
    gradient: "linear-gradient(135deg, #4B7BF5 0%, #3A5FC4 100%)",
    emoji: "\uD83C\uDF93",
    stack: ["React", "Supabase", "AI Tutor", "Vercel"],
    highlights: [
      "CXC curriculum-aligned content",
      "AI-powered tutoring and explanations",
      "Practice questions with instant feedback",
      "Progress tracking for students",
    ],
    problem:
      "Caribbean students preparing for CXC exams had limited access to quality tutoring and practice resources. Physical tutoring is expensive and unavailable in many areas. Existing online resources were not aligned with the CXC curriculum.",
    approach:
      "We built an AI-powered education platform specifically aligned to the CXC curriculum. The AI tutor can explain concepts, generate practice questions, and provide instant feedback. Students can track their progress across subjects and focus on weak areas identified by the system.",
    outcome:
      "Crack Solve gives Caribbean students 24/7 access to curriculum-aligned tutoring. The AI tutor handles thousands of questions, progress tracking keeps students accountable, and the platform is accessible from any device with an internet connection.",
  },
  {
    slug: "songshare",
    name: "SongShare",
    category: "Music Community",
    tagline: "A gospel music community for sharing and discovery.",
    description:
      "A community platform for gospel musicians and worship teams to share music, collaborate on arrangements, and discover new songs for their services. Built to serve a niche community with purpose-specific features.",
    url: "",
    gradient: "linear-gradient(135deg, #8E5B2D 0%, #A07040 100%)",
    emoji: "\uD83C\uDFB5",
    stack: ["Next.js", "Supabase", "Vercel"],
    highlights: [
      "Music sharing and discovery",
      "Worship team collaboration tools",
      "Song arrangement management",
      "Community-driven curation",
    ],
    problem:
      "Gospel musicians and worship teams had no dedicated space to share music, find new songs for services, or collaborate on arrangements. General music platforms did not cater to the specific needs of worship communities.",
    approach:
      "We designed a purpose-built community platform for gospel music. Features include song sharing, arrangement collaboration, and discovery tools specifically designed for worship team workflows. The platform prioritises community curation over algorithmic recommendations.",
    outcome:
      "SongShare provides a dedicated home for gospel musicians to connect, share, and grow together. The platform serves a community that was previously underserved by general-purpose music platforms.",
  },
];
