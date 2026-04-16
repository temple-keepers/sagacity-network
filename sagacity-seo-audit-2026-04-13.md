# Sagacity Network — Full SEO Audit

**Domain:** sagacitynetwork.net
**Audit date:** 13 April 2026
**Audit type:** Full site audit (on-page, technical, content gaps, keyword research, competitor comparison)
**Note on data:** Site is live but very new, with no organic ranking history yet. Keyword difficulty and volume estimates below are directional judgments based on SERP inspection and the competitive set — not numeric pulls from Ahrefs/Semrush. For exact volume and KD, connect an SEO tool via MCP and I'll re-run with real numbers.

---

## Executive Summary

The foundation is solid — you shipped clean Next.js App Router metadata on every top-level route, a valid `sitemap.ts`, a sensible `robots.ts`, and an `Organization` JSON-LD block. That puts you ahead of most new agency sites at launch. **Biggest strength:** the dual-market positioning (UK premium studio + Guyana/Caribbean specialist) is genuinely unusual and gives you two keyword universes most competitors can't credibly claim.

The top three priorities, in order of impact:

1. **Launch a blog/insights section** — you currently have zero indexable long-tail content, which is the single largest SEO limit on the site today. Every competitor with meaningful organic traffic has 30+ indexed articles.
2. **Add `Service`, `LocalBusiness`, and `FAQPage` JSON-LD** — the Guyana page especially needs `LocalBusiness` with `areaServed` to win local-intent queries.
3. **Fix the `/assessment` metadata gap** — it's a client component with no metadata export, so it inherits the root title/description and loses a clear lead-magnet landing page.

**Overall assessment:** Strong foundation, needs work. No critical issues. With 4–6 weeks of content and schema work, the site should begin ranking for long-tail Guyana/Caribbean and UK SMB terms.

---

## 1. Keyword Opportunity Table

All keywords are relevance-ranked for Sagacity's positioning. Difficulty is qualitative (Easy/Moderate/Hard) based on SERP inspection.

| Keyword | Est. Difficulty | Opportunity | Current Ranking | Intent | Recommended Content Type |
|---|---|---|---|---|---|
| website design Guyana | Easy | **High** | Not tracked | Commercial | Landing page (exists: `/guyana` — strengthen) |
| web developer Georgetown Guyana | Easy | **High** | Not tracked | Commercial | Guyana sub-page + LocalBusiness schema |
| professional website for Guyanese business | Easy | **High** | Not tracked | Commercial | Dedicated landing page |
| Caribbean web design agency | Easy–Moderate | **High** | Not tracked | Commercial | New landing page (`/caribbean`) |
| diaspora web developer | Easy | **High** | Not tracked | Navigational/Commercial | Positioning page — you're uniquely qualified |
| small business automation UK | Moderate | **High** | Not tracked | Commercial | Service page + blog cluster |
| digital readiness assessment small business | Easy | **High** | Not tracked | Informational → Commercial | You already own the tool — add a /insights article explaining it |
| Power BI consultant UK small business | Moderate | **High** | Not tracked | Commercial | New service page (leverages Denise's background) |
| GDPR compliant website developer UK | Moderate | Medium | Not tracked | Commercial | Service-level page or long-form article |
| cybersecurity for small business UK | Hard | Medium | Not tracked | Commercial | Blog cluster + service page |
| Next.js agency UK | Moderate | Medium | Not tracked | Commercial | About/Services mention; case study |
| Supabase consultant UK | Easy | Medium | Not tracked | Commercial | Blog post + case study |
| how much does a website cost Guyana | Easy | **High** | Not tracked | Informational | Pillar article (answers a real question) |
| how to automate invoicing small business | Moderate | Medium | Not tracked | Informational | Blog post; links to automation service |
| what is a digital product studio | Easy | Low–Medium | Not tracked | Informational | Short explainer on `/about` or blog |
| website for church UK | Easy | Medium | Not tracked | Commercial | Case study (Temple Keepers) |
| Gospel music app developer | Easy | Medium | Not tracked | Commercial | Case study (SongShare) |
| Guyanese cultural app | Easy | Medium | Not tracked | Commercial | Case study (Rhythm & Roots) |
| fractional CTO UK small business | Moderate | Medium | Not tracked | Commercial | New service page (natural fit) |
| corporate training AI workshop UK | Moderate | Medium | Not tracked | Commercial | Strengthen `/training` |
| pen testing for SMB UK | Moderate | Medium | Not tracked | Commercial | Security service page |
| Power BI dashboard for small business | Moderate | Medium | Not tracked | Commercial | Case study + service page |
| digital transformation for SMEs UK | Hard | Low–Medium | Not tracked | Commercial | Pillar article (long play) |
| website speed optimization Guyana | Easy | Medium | Not tracked | Informational | Blog (local internet-speed angle) |
| "built by practitioners" (brand) | Easy | N/A | Owned | Navigational | Defend — ensure you outrank any future copycats |

---

## 2. On-Page Issues Table

| Page | Issue | Severity | Recommended Fix |
|---|---|---|---|
| `/assessment` | No `metadata` export (client component). Inherits root title & description — loses keyword targeting for a flagship lead magnet. | **Critical** | Wrap in `app/assessment/layout.tsx` with a `Metadata` export. Suggested title: "Free Digital Readiness Assessment for SMBs — Sagacity Network"; description focusing on "10-minute assessment, personalised action plan". |
| `/` (home) H1 | H1 is "Your Next Product, Perfected." — brand-only, no keyword signal. | High | Change to something like "UK Digital Product Studio — Web, Data, Automation & Security" OR keep the brand H1 but add an H2 immediately under it that carries keywords. |
| Root metadata | Description doesn't mention "UK", "studio", or any location/service keyword pair. | High | Rewrite: "UK digital product studio. Web apps, data platforms, automation, and cybersecurity — built by practitioners for SMBs and Caribbean-based businesses." |
| `/guyana` layout | Uses deprecated `keywords` meta — ignored by Google and can signal low-effort SEO. | Low | Remove the `keywords` array. |
| `/guyana` | No `LocalBusiness` / `Service` JSON-LD with `areaServed: Guyana/Caribbean`. | High | Add `LocalBusiness` schema with `areaServed` listing Guyana, Trinidad, Barbados, Jamaica, etc. |
| All service pages (`/services/[slug]`) | No `Service` JSON-LD per page. Losing rich-result eligibility on 5 service URLs. | High | Add per-page `Service` schema with `provider`, `areaServed`, `serviceType`. |
| `/work/[slug]` case studies | No `Article` or `CreativeWork` schema; no author info. | Medium | Add `Article` JSON-LD with `author: Denise`, `publisher: Sagacity Network`. |
| Portfolio / platform images | Alt text coverage unverified beyond logo ("Sagacity Network" on every logo instance — fine, but portfolio screenshots are likely missing descriptive alts). | Medium | Audit all `<Image>` in `Portfolio.tsx`, `work/[slug]/page.tsx`. Descriptive alts: "Temple Keepers faith & wellness app homepage" not "logo". |
| `/privacy` | No `openGraph` — will share with no preview image on social. | Low | Add `openGraph` block. |
| `/checkout/success` | Likely indexable (not checked for `noindex`). Shouldn't appear in Google. | Medium | Add `export const metadata = { robots: { index: false } }`. |
| Home, all pages | No Twitter/X card metadata. | Low | Add `twitter: { card: 'summary_large_image', ... }` in root metadata. |
| Root `<html>` | `lang="en"` — correct, but given UK + Guyanese audience, consider `en-GB` for locale signals. | Low | Change to `lang="en-GB"`. |
| Internal linking | Every page links to Services/Work/About from nav, but no contextual in-content linking between case studies and the service that built them. | Medium | In each `/work/[slug]`, link to the relevant `/services/[slug]` and vice versa. |
| Headings | `text-[48px]` etc. used for H1 — font size is fine, but several pages use `<h1>` styling via CSS classes with no programmatic hierarchy check. | Low | Verify no page has `<h2>` before `<h1>` (quick audit pass). |
| Meta descriptions | All meta descriptions are under 160 chars — good. But several are generic ("Built by practitioners, not theorists"). | Medium | Rewrite to include a specific keyword + benefit + implicit CTA per page. |
| OG images | `openGraph` blocks have no `images` field. | Medium | Generate per-page OG images (Next.js `opengraph-image.tsx` in each route folder). |
| Trailing slash / canonical | No explicit `alternates.canonical` on any page — Next.js handles some of this, but for dynamic routes safety, add canonicals. | Medium | Set `alternates: { canonical: 'https://sagacitynetwork.net/<path>' }` per page. |

---

## 3. Content Gap Recommendations

The single biggest gap: **there is no `/blog` or `/insights` route on the site**. Competitors like Zenzero, AIS Tech, Akita, Utilize, Planes Studio, and Studio Graphene all have active insights sections that capture informational traffic and nurture leads.

| Gap / Topic | Why It Matters | Format | Priority | Effort |
|---|---|---|---|---|
| Launch `/insights` (blog) hub | Zero informational traffic today. Every other area on this list requires it. | Route + listing + MDX or Supabase-backed posts | **High** | Moderate (half day) |
| "How much does a professional website cost in Guyana?" | High-volume local informational query with clear commercial intent. GxMedia and FuzeArts don't answer this directly. | Pillar article, 1500–2000 words | **High** | Moderate |
| "Enterprise-grade Power BI for small businesses" | Denise's £200M / Fortune 500 background is a differentiator nobody else in the SMB space can claim. | Pillar article + service page | **High** | Moderate |
| Case study pages: Temple Keepers, Rhythm & Roots, SongShare, Totenga | Listed on `/work` but individual `/work/[slug]` pages exist — verify each has ≥600 words of real narrative, not just screenshots. | Long-form case study with metrics | **High** | Moderate (per case) |
| "Digital readiness assessment for UK SMBs — what your score actually means" | Builds traffic to an owned lead magnet. | Blog pillar that links to `/assessment` | **High** | Quick win |
| "Cybersecurity for Caribbean businesses — what Guyanese SMEs get wrong" | Under-served intersection. Builds trust on both markets simultaneously. | Blog post | Medium | Moderate |
| "5-day website launch for Guyana — what's actually included" | Directly supports the Guyana landing page's $350 offer. | Blog post | Medium | Quick win |
| Service comparison page: "Hiring an agency vs building in-house" | Funnel middle. Missing from most competitors. | Landing page | Medium | Moderate |
| Guides: "Next.js + Supabase for SMBs" | Developer-adjacent traffic; builds authority for `/training`. | Technical blog series (3 posts) | Medium | Substantial |
| Comparison: "Sagacity vs a freelancer vs a typical agency" | Honest positioning content ranks well and disarms objections. | Landing page | Medium | Moderate |
| FAQ page or expanded FAQs per service | Eligible for `FAQPage` schema → People Also Ask SERP features. | FAQ blocks on each service page | **High** | Quick win |
| Diaspora angle: "Why a UK-registered studio builds for Guyana" | Unique narrative; no competitor can copy. | Positioning article | Medium | Quick win |
| Client funnel content: "What to do in your first 30 days of a new website" | Post-purchase content. Builds email list. | Lead-magnet PDF + landing page | Low–Medium | Moderate |

---

## 4. Technical SEO Checklist

| Check | Status | Details |
|---|---|---|
| HTTPS | **Pass** | Site served over HTTPS. |
| Sitemap.xml | **Pass** | `src/app/sitemap.ts` generates dynamic sitemap including static + service + portfolio slugs. |
| Robots.txt | **Pass** | Allows `/`, disallows `/api/`, sitemap declared. |
| Mobile-friendly | **Pass** (assumed) | Tailwind responsive classes used throughout; verify on real devices. |
| Organization JSON-LD | **Pass** | Present on root layout. Add `sameAs` with LinkedIn and any social handles when live. |
| LocalBusiness JSON-LD | **Fail** | Not present. Critical for `/guyana` (LocalBusiness with `areaServed`) and arguably for the UK Basildon location. |
| Service JSON-LD | **Fail** | No per-service schema on `/services/[slug]` pages. |
| FAQPage JSON-LD | **Fail** | No FAQ schema anywhere. High-value missing win. |
| BreadcrumbList JSON-LD | **Fail** | Not present — dynamic routes (`/services/web-dev`, `/work/<slug>`) should have breadcrumbs. |
| Article JSON-LD | **Fail** (no blog yet) | Will be needed once `/insights` launches. |
| Canonical URLs | **Warning** | No explicit `alternates.canonical` set per page. Next.js will usually do the right thing but explicit is safer. |
| Open Graph images | **Warning** | OG text is set per page; no `opengraph-image.tsx` or `images` field. |
| Twitter card | **Fail** | Not set. |
| `lang` attribute | **Warning** | `lang="en"` — consider `en-GB`. |
| Core Web Vitals (observable) | **Warning** | Hero has multiple animated layers (orbs, ring animation, scroll reveals) — LCP risk on slower connections. Dev-tools Lighthouse pass recommended. |
| Image optimization | **Pass** (assumed) | Uses `next/image`. Verify portfolio images have `priority` set only on the LCP image. |
| Font loading | **Pass** | Uses `next/font` with `display: swap`. Note: fonts are Bricolage Grotesque + DM Sans, but the brief specifies Cormorant Garamond + DM Sans — this is a **brand/design discrepancy with the brief**, not an SEO issue. |
| HTTP/2 or HTTP/3 | **Pass** (assumed, Vercel default) | |
| Structured data validation | **Not verified** | Run the existing Organization JSON-LD through Google's Rich Results Test once the above additions land. |
| Indexation of `/checkout/success` | **Warning** | Should be `noindex`. |
| Hreflang | **N/A** | Single-language site for now. If you add a Spanish variant for Caribbean, you'll need it. |
| 404 page | **Not verified** | Ensure a custom `not-found.tsx` exists and returns 404 status. |

---

## 5. Competitor Comparison Summary

Competitors chosen to represent both sides of Sagacity's market:

- **Planes Studio** (planes.studio) — UK digital product studio (premium/London)
- **GxMedia** (gxmediagy.com) — self-described #1 Guyana web design firm
- **FuzeArts** (fuzearts.gy) — Georgetown creative digital agency

| Dimension | Sagacity | Planes Studio | GxMedia | FuzeArts | Winner |
|---|---|---|---|---|---|
| Positioning clarity | UK + Guyana dual-market, practitioner-led | Premium product, startup-speed | Generic "web design #1 in Guyana" | Creative agency, broad | **Sagacity** |
| Indexable pages (est.) | ~14 | ~20+ | ~15 | ~12 | Planes Studio |
| Blog / insights | **None** | Yes | Limited | Limited | Planes Studio |
| Case studies | 4–5 platforms on `/work/[slug]` (needs verification of depth) | Strong, detailed | Brief project grid | Visual gallery | Planes Studio (detail), Sagacity (breadth of owned platforms) |
| Domain authority signals | Brand-new, minimal backlinks | Established, strong DA | Moderate local DA | Moderate | Planes / GxMedia |
| Local SEO (Guyana) | Dedicated `/guyana` page, no LocalBusiness schema yet | N/A | Strong local | Strong local | GxMedia / FuzeArts (for now) |
| Local SEO (UK) | Registered Ltd, no LocalBusiness schema | Strong | N/A | N/A | Planes Studio |
| Unique assets | Digital Readiness Assessment, 20-email sequence, owned live platforms | Client work only | Client work only | Client work only | **Sagacity** |
| Service breadth | Web, data, automation, security, training | Product design + engineering | Web + hosting | Web + creative | **Sagacity** |
| Cybersecurity credibility | Certified co-founder, built-in from day one | Light | Not highlighted | Not highlighted | **Sagacity** |
| Technical SEO (on-page) | Clean metadata, Organization schema, sitemap | Mature | Standard | Basic | Sagacity (per-page metadata) |
| Content freshness | Brand new | Regular | Irregular | Irregular | Sagacity (fresh) / Planes (sustained) |
| SERP feature presence | None yet | Featured snippets on product design terms | Local pack in Guyana | Local pack in Guyana | Mixed |

**Headline takeaway:** Sagacity is competitive on positioning and technical foundation, losing on content volume and backlinks (both fixable over 6–12 months). The **Digital Readiness Assessment and the 20-email welcome sequence are assets no competitor has** — leverage them.

---

## 6. Prioritized Action Plan

### Quick Wins (do this week)

| Action | Where | Impact | Effort |
|---|---|---|---|
| Wrap `/assessment` in a `layout.tsx` with a real `Metadata` export | `src/app/assessment/layout.tsx` (new) | High | 15 min |
| Add `noindex` to `/checkout/success` | `src/app/checkout/success/page.tsx` | Medium | 5 min |
| Remove deprecated `keywords` array from `/guyana` layout | `src/app/guyana/layout.tsx` | Low | 2 min |
| Change `lang="en"` → `lang="en-GB"` | `src/app/layout.tsx` | Low | 2 min |
| Rewrite root meta description with UK + services keywords | `src/app/layout.tsx` | High | 10 min |
| Add `twitter` card block to root metadata | `src/app/layout.tsx` | Low | 10 min |
| Add `alternates.canonical` to every page metadata | All `layout.tsx` files | Medium | 30 min |
| Add `LocalBusiness` JSON-LD to `/guyana` (areaServed: Guyana, Trinidad, Barbados, Jamaica) | `src/app/guyana/page.tsx` or layout | High | 30 min |
| Add `Service` JSON-LD to each `/services/[slug]` | `src/app/services/[slug]/page.tsx` | High | 45 min |
| Audit portfolio images, replace generic alts with descriptive alts | `Portfolio.tsx`, `work/[slug]/page.tsx` | Medium | 30 min |
| Add FAQ blocks with `FAQPage` schema to each service page | `/services/[slug]` pages | High | 2 hours |
| Link case studies bidirectionally to their matching service pages | `/work/[slug]`, `/services/[slug]` | Medium | 1 hour |
| Run current site through Google Rich Results Test + PageSpeed Insights | Live URL | Medium | 20 min |

**Estimated total: under a day of work. Cumulative SEO impact: significant.**

### Strategic Investments (plan for this quarter)

| Initiative | Impact | Effort | Dependencies |
|---|---|---|---|
| Launch `/insights` blog (route, listing, MDX setup or Supabase-backed) | **High** | 1–2 days | None |
| Publish 6–8 cornerstone articles targeting the "High" opportunity keywords above | **High** | 2–3 weeks | Blog live |
| Build pillar + cluster model: (a) UK digital studio, (b) Guyana/Caribbean, (c) Business automation, (d) Data intelligence | High | Ongoing | Blog live, content plan |
| Add an `/fractional-cto` or similar new service page (leverages Denise's engineering lead background) | Medium | 1 day | Copy + positioning decision |
| Generate dynamic OG images per route via `opengraph-image.tsx` | Medium | Half day | None |
| Backlink campaign: guest posts on Guyanese diaspora sites (Stabroek News, Guyanese Online) + UK SMB publications | High | Ongoing | Published articles to pitch |
| Request listings in UK SMB directories (Clutch, DesignRush, Sortlist UK, Goodfirms) | Medium | 1 day | Enough case studies published |
| Request listing as Guyana web agency on Konigle, TopSEOs.gy, CaribbeanWebDesigners directory | Medium | 1 day | None |
| Deepen case studies to ≥800 words each with real metrics (MAU, load time, conversion rate) | High | 2–4 hours per case | Permission / anonymisation as needed |
| Expand `/training` page with course-level pages, each with `Course` JSON-LD | Medium | 1 day | Course content |
| Set up Google Search Console + Bing Webmaster, submit sitemap | High | 30 min | None |
| Set up basic analytics (Plausible/Umami is already GDPR-friendly; avoid GA4 where possible given privacy stance) | Medium | 1 hour | None |
| Lighthouse + Core Web Vitals pass — profile the hero animations, lazy-load below-the-fold imagery | High | Half day | None |
| Translate `/guyana` messaging into a dedicated "diaspora" narrative across the home page | Medium | 1 day | Copy decision |

---

## What I'd Recommend Doing Next

Of the quick wins, the three highest leverage per minute spent are:

1. **Fix `/assessment` metadata** — you're bleeding intent on your best lead magnet.
2. **Ship `LocalBusiness` + `Service` + `FAQPage` JSON-LD** — Google is ready to reward this on day one.
3. **Decide whether `/insights` launches this quarter** — it's the biggest lever but also the biggest commitment.

---

## Follow-Up

Want me to do any of these next?

- Draft content briefs (target keyword, outline, internal links, schema) for the top 5 opportunity keywords
- Write the new `alternates.canonical` + `twitter` + `LocalBusiness` + `Service` + `FAQPage` schema blocks directly into the code
- Build the content calendar for a 90-day `/insights` launch (6–8 pillar posts sequenced for maximum link equity)
- Deepen the competitor comparison by fetching and analysing each competitor's full site
- Re-run this audit with real SEO-tool data once you connect Ahrefs / Semrush / Google Search Console via MCP
