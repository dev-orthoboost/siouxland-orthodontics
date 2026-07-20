# Full Site Structure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring Siouxland Orthodontics to the full OrthoBoost house structure (13-section homepage + 4 data-driven location pages with maps/hours + testimonials + FAQ) on the concept-2 Positivus base.

**Architecture:** Static-first. A ~60-line `build.mjs` assembles pages from `src/partials/` + `src/pages/` with `{{token}}` replacement, and generates the 4 location pages, `sitemap.xml`, and per-location JSON-LD from `data/locations.json` (single source of truth). Output lands in the repo root, which GitHub Pages serves as-is.

**Tech Stack:** Plain HTML/CSS/vanilla JS, Node ≥18 (no deps), GitHub Pages.

**Design doc:** `docs/plans/2026-07-20-full-site-structure-design.md` (approved). Compliance hard rules and copy constraints live there; every task inherits them.

---

### Task 1: Location data file

**Files:** Create `data/locations.json`

Fields per office: `slug, name, city, state, cityLabel, address, zip, phone, phoneHref, pin, hours[] ({days, open, close}), hoursNote, blurb, knownFor[], mapQuery, formerName?`. Data comes from the design doc table (drkaler.com, 2026-07-20). Leeds gets `formerName: "Indian Hills"`.

**Verify:** `node -e "const d=require('./data/locations.json'); console.assert(d.length===4 && d.every(l=>l.hours.length>0)); console.log('ok')"` → `ok`

**Commit:** `git commit -m "data: add locations.json (hours verified from old site, pending client confirmation)"`

### Task 2: Build script

**Files:** Create `build.mjs`

- `render(tpl, vars)` replaces `{{key}}` tokens (missing key → throw, so typos fail the build).
- Reads partials (`head, header, footer, scripts`), pages (`home, appointment-request, location`).
- Emits: `index.html`, `appointment-request.html`, `locations/<slug>/index.html` ×4, `sitemap.xml`.
- Location JSON-LD: `Dentist` node with `openingHoursSpecification` built from `hours[]`.
- Root-relative asset paths are computed per depth (`{{root}}` = `""` or `"../../"`).

**Verify:** `node build.mjs` → lists 7 written files; `test -f locations/le-mars/index.html && echo ok` → `ok`

**Commit:** `git commit -m "build: add zero-dep static build script"`

### Task 3: Partials (head/header/footer/scripts)

**Files:** Create `src/partials/head.html`, `header.html`, `footer.html`, `scripts.html`

- Extracted from current `concept-2.html`; head takes `{{title}}, {{description}}, {{ogUrl}}, {{root}}, {{extraHead}}` tokens; nav per standard (About / Services ▾ / Locations / What to Expect / CTA); footer gains a Visit column listing all 4 offices w/ links to location pages.
- `scripts.html`: nav toggle, gated reveal observer (existing), NEW `data-count` animated counters (IntersectionObserver, respects reduced motion → instant final value).

**Verify:** `node build.mjs && grep -c "locations/wayne" index.html` ≥ 1

**Commit:** `git commit -m "build: extract shared partials, add counter script"`

### Task 4: CSS — new sections + card-size fix

**Files:** Modify `css/concept2.css`

1. **Card collision fix (user-reported):** on `.card` drop `min-height: 260px`; change grid to `grid-template-columns: minmax(0,1fr) auto`; `.art` down to 96px, `flex: none`; `.titles { padding-right: 12px; min-width: 0 }`; `h3 { overflow-wrap: break-word }`; hover translate to -3px. Verify no overlap via JS bounding-box check in Task 8.
2. New blocks: `.stats` band (ink bg, gold numbers), `.reviews` wall (3-col masonry-ish grid of bordered quote cards), `.faq` (reuse `.acc` accordion, white variant), `.visit` block (2-col: details table + map iframe wrapper `aspect-ratio: 4/3`, `iframe { border:0; width:100%; height:100% }`), `.loc-hero` (location page hero with per-office accent var `--accent`), hours table styles, and `.eyebrow` for the hero city line.

**Verify:** `node build.mjs` then in browser: no horizontal scroll, cards render without overlap at 1440/1024/375 widths.

**Commit:** `git commit -m "css: fix card collisions; add stats/reviews/faq/visit styles"`

### Task 5: Homepage (13 sections)

**Files:** Create `src/pages/home.html`; archive old concept-1 `index.html` → `concept-1.html` (add `noindex`); delete stale root sections after build replaces `index.html`.

Order: hero (eyebrow "SIOUX CITY · LE MARS · WAYNE · NEW PATIENTS WELCOME", dual CTA consult/tel) → stats band (`data-count`: 30+ years, 4 locations, 1 doctor) → care cards (6, from concept-2) → CTA banner → airway band (dark; qualified copy from concept-1 + disclaimer) → Meet Dr. Williams → What to Expect accordion → testimonial wall (8 quotes from design doc source, initials only, `<!-- PENDING TYLER SIGN-OFF: reuse of Kaler-published testimonials -->`) → FAQ (6 Q&As, compliance-qualified) → locations block (4 cards: address, phone, hours summary, link to page) → footer.

**Verify:** build; `grep -c "PENDING TYLER" index.html` = 1; no `—` in rendered copy (`grep -c "—" index.html` = 0 outside comments); title = `Orthodontist | Siouxland Orthodontics`.

**Commit:** `git commit -m "feat: full-structure homepage on concept-2 base"`

### Task 6: Location page template

**Files:** Create `src/pages/location.html`

Tokens: everything from locations.json. Sections: loc-hero (H1 "Orthodontist in {{cityLabel}}" + blurb + accent) → visit block (address + Get Directions link `https://www.google.com/maps/search/?api=1&query={{mapQuery}}`, tel link, hours table + "Hours can change during the transition; call to confirm." note, lazy map iframe `https://www.google.com/maps?q={{mapQuery}}&output=embed`) → known-for list → 2 testimonials → CTA band → footer. Leeds page includes "formerly our Indian Hills office" line. Per-page JSON-LD with openingHoursSpecification.

**Verify:** build; all 4 pages exist; `grep -c "output=embed" locations/leeds/index.html` = 1; JSON-LD parses (`node -e` JSON.parse on extracted block).

**Commit:** `git commit -m "feat: data-driven location pages with maps and hours"`

### Task 7: Appointment page reskin

**Files:** Create `src/pages/appointment-request.html` (port existing form into concept-2 skin; keep field names + GHL comment + success stub; keep redirect stub `request-appointment.html`).

**Verify:** build; form fields unchanged (`grep -c 'name="patient_for"'` = 4); submit shows success block in browser.

**Commit:** `git commit -m "feat: appointment page on concept-2 base"`

### Task 8: QA gate + cleanup

- Remove now-unused `css/styles.css` references from archived concept-1 only if still valid (concept-1.html keeps styles.css; keep both stylesheets).
- Browser checks at 1440/1024/375: card bounding boxes don't intersect (JS check), nav ok, no h-scroll, links resolve (script: every `href` non-#, non-http resolves to a file), alt text present on all imgs, meta/OG per page unique.
- Update `robots.txt` (allow locations), regenerate `sitemap.xml` (build does).
- Update WORKFLOW.md status + Notion ticket note (stage 2 → 3).

**Verify:** all checks green; `git status` clean after commit.

**Commit:** `git commit -m "chore: QA pass, sitemap/robots, workflow status"` then `git push` (Pages auto-deploys).

### Task 9: Post-deploy verification

`curl` 200s for all 7 URLs; spot-check one location page text (address/hours present); confirm preview URL in Notion ticket properties still correct.
