# Siouxland Orthodontics — Full Site Structure (Design)

Date: 2026-07-20 · Approved by: Jules · Base: concept 2 (Positivus system)

## Decisions (from brainstorming)

- **Design base: concept 2** (Positivus system: pill labels, ink borders, hard offset
  shadows, gold accent, Space Grotesk). Concept 1 stays available for the client review;
  Dr. Williams approved his own mockup direction, so the client preview must present
  concept 2 explicitly as our recommended direction and capture feedback in Notion.
- **Scope this pass: homepage (full 13-section structure) + 4 location pages** +
  appointment page restyle. Internal service pages next pass.
- **Testimonials: old Kaler site's published testimonials** (initials-attributed,
  practice-published = consent handled once already), framed "Continuing 30+ years."
  Pending Tyler sign-off before launch.
- **Build: tiny Node build script + data file.** No framework. Partials for
  head/header/footer, `data/locations.json` as the single source of truth for
  addresses/phones/hours/maps; sitemap + JSON-LD generated from the same data.

## Sitemap (this pass)

```
/                          Orthodontist | Siouxland Orthodontics
/appointment-request.html  Request an Appointment (existing form, concept-2 skin)
/locations/morningside/    Orthodontist in Sioux City, IA | Morningside
/locations/leeds/          Orthodontist in Sioux City, IA | Leeds
/locations/le-mars/        Orthodontist in Le Mars, IA
/locations/wayne/          Orthodontist in Wayne, NE
/concept-1.html            (archived concept for client review, noindex)
```

## Homepage sections (Elite-style execution on concept-2 base)

1. Header — standard nav (About / Services ▾ / Locations / What to Expect / CTA)
2. Hero — city eyebrow, H1, dual CTA (consult + tel:), photo placeholder
3. Stats band — animated counters: 30+ years continuing care · 4 locations ·
   1 doctor you get to know (facts only; no invented review counts)
4. Care cards — 6 (Kids & Teen Braces, Clear Aligners/Invisalign, Airway, Early
   Evaluations, Adult Treatment, Free First Consult)
5. CTA banner — "Your first visit is on us"
6. Airway differentiator band — dark, claims qualified, educational disclaimer
7. Meet Dr. Williams — doc card, credential chips (Board-eligible)
8. What to Expect — numbered accordion (existing 01–05)
9. Testimonial wall — 8 curated Kaler-site quotes w/ initials; heading
   "Loved by Siouxland families for 30+ years"; PENDING TYLER SIGN-OFF marker in code
10. FAQ accordion — 6 Qs, compliance-qualified answers
11. Locations block — 4 cards with address + phone + hours summary → location pages
12. Footer — 3 columns (Services / Practice / Visit) + trust line + legal

## Location page template (generated ×4)

Hero ("Orthodontist in {City}" + blurb) → visit block (address + directions link,
phone, hours table, lazy keyless Google Maps iframe) → "what families come here for"
services summary → 2–3 testimonials → CTA band → footer. Office pin color = page accent.

## Data (verified 2026-07-20 from drkaler.com; hours are Kaler-era → CONFIRM BEFORE LAUNCH)

| Office | Address | Phone | Hours |
|---|---|---|---|
| Morningside | 4224 Sergeant Rd, Sioux City, IA 51106 | (712) 276-2766 | Mon–Wed 8–4, Fri 8–12 |
| Leeds (old site: "Indian Hills") | 2801 Outer Dr N, Sioux City, IA 51104 | (712) 239-0420 | Thu 8–4 |
| Le Mars | 405 Plymouth St NW, Le Mars, IA 51031 | (712) 546-5179 | Mon 9–3 |
| Wayne | 617 Pearl St Ste #2, Wayne, NE 68787 | (402) 833-1333 | Wed 9–3 |

## Build architecture

```
src/
  partials/ head.html, header.html, footer.html, scripts.html
  pages/    home.html, appointment-request.html, location.html (template)
data/locations.json
build.mjs           → renders to repo root (Pages serves as-is)
```

`build.mjs`: token replacement (`{{token}}`) + loop over locations; also emits
sitemap.xml and per-location JSON-LD (with openingHoursSpecification).

## Fixes rolled in

- **Card sizing bug:** care-card titles (`.hl` highlight) collide with the icon circle
  at some widths. Fix: drop the fixed 260px min-height, size the icon down and reserve
  its column with minmax, let titles wrap with padding-right, tighten hover translate.

## Compliance (unchanged hard rules)

Board-eligible only · airway claims qualified + educational disclaimer · no price
messaging · real testimonials only (source noted in code) · no invented associations,
review counts, or "Preferred Invisalign Provider" (that status was Kaler's) · hours
marked pending confirmation · no evening/Saturday mentions · no em dashes in copy.

## QA gate (Notion checklist)

Mobile layout · all links work · image alt text · meta/OG per page · Lighthouse 90+ ·
push to Pages · feedback via Notion comments.

## Open flags for Tyler

1. Testimonial reuse sign-off (Kaler-published quotes under Siouxland brand).
2. Hours confirmation from Dr. Williams (Kaler-era hours may change).
3. Leeds vs Indian Hills name before location URLs get indexed.
4. Google review count if we want a "X+ five-star reviews" stat later.
5. Association memberships for a future accreditation bar.
