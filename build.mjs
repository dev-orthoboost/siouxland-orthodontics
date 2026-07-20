// Zero-dependency static build for Siouxland Orthodontics.
// Assembles pages from src/partials + src/pages, generates the four
// location pages, sitemap.xml, and per-location JSON-LD from data/locations.json.
// Usage: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SITE = "https://dev-orthoboost.github.io/siouxland-orthodontics"; // TODO at launch: real domain
const read = (p) => readFileSync(p, "utf8");
const partial = (n) => read(`src/partials/${n}.html`);
const page = (n) => read(`src/pages/${n}.html`);

function render(tpl, vars) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in vars)) throw new Error(`Missing template var: ${k}`);
    return vars[k];
  });
}

function shell(bodyTpl, vars) {
  const base = {
    head: partial("head"),
    header: partial("header"),
    footer: partial("footer"),
    scripts: partial("scripts"),
    year: "2026",
    extraHead: "",
    ...vars,
  };
  // two passes so partial tokens inside partials resolve
  let out = render(bodyTpl, base);
  out = render(out, base);
  return out;
}

const locations = JSON.parse(read("data/locations.json"));
const written = [];
const emit = (path, html) => { writeFileSync(path, html); written.push(path); };

// ---- homepage ----
const locCards = locations.map((l) => `
      <div class="loc2">
        <h3><span class="pin" style="background:${l.pin}"></span>${l.name}</h3>
        <p>${l.blurb}</p>
        <span class="meta">${l.address}, ${l.cityLabel} &middot; <a class="tel" href="tel:${l.phoneHref}">${l.phone}</a></span>
        <span class="meta">Hours: ${l.hoursSummary}</span>
        <a class="loc-link" href="locations/${l.slug}/">Visit the ${l.name} office &rarr;</a>
      </div>`).join("\n");

emit("index.html", shell(page("home"), {
  root: "",
  title: "Orthodontist | Siouxland Orthodontics",
  description: "Braces, clear aligners, and airway-focused orthodontics for kids, teens, and adults at four Siouxland locations. Free consultations with Dr. Aaron Williams.",
  ogUrl: `${SITE}/`,
  locCards,
}));

// ---- appointment page ----
emit("appointment-request.html", shell(page("appointment-request"), {
  root: "",
  title: "Request an Appointment | Siouxland Orthodontics",
  description: "Request your free orthodontic consultation with Dr. Aaron Williams at Siouxland Orthodontics. Four locations in Sioux City, Le Mars, and Wayne. No referral needed.",
  ogUrl: `${SITE}/appointment-request.html`,
}));

// ---- location pages ----
for (const l of locations) {
  const hoursRows = l.hours.map((h) => `<tr><th scope="row">${h.days}</th><td>${h.open} to ${h.close}</td></tr>`).join("\n            ");
  const knownFor = l.knownFor.map((k) => `<li><span class="ck" aria-hidden="true">&#10003;</span>${k}</li>`).join("\n          ");
  const former = l.formerName
    ? `<p class="former-note">Longtime patients may know this office as our ${l.formerName} location. Same office, same friendly team.</p>`
    : "";
  const schema = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: `Siouxland Orthodontics - ${l.name}`,
    url: `${SITE}/locations/${l.slug}/`,
    telephone: l.phoneHref,
    medicalSpecialty: "Orthodontic",
    address: { "@type": "PostalAddress", streetAddress: l.address, addressLocality: l.city, addressRegion: l.state, postalCode: l.zip, addressCountry: "US" },
    openingHoursSpecification: l.schemaHours.map((s) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: s.dayOfWeek, opens: s.opens, closes: s.closes })),
  };
  mkdirSync(`locations/${l.slug}`, { recursive: true });
  emit(`locations/${l.slug}/index.html`, shell(page("location"), {
    root: "../../",
    title: `Orthodontist in ${l.cityLabel} | Siouxland Orthodontics ${l.name}`,
    description: `Braces, Invisalign, and airway-focused orthodontics at our ${l.name} office. ${l.address}, ${l.cityLabel}. Free consultations, no referral needed.`,
    ogUrl: `${SITE}/locations/${l.slug}/`,
    extraHead: `<script type="application/ld+json">${JSON.stringify(schema)}</script>`,
    locName: l.name,
    cityLabel: l.cityLabel,
    address: l.address,
    zip: l.zip,
    phone: l.phone,
    phoneHref: l.phoneHref,
    pin: l.pin,
    blurb: l.blurb,
    hoursRows,
    knownFor,
    former,
    mapQuery: encodeURIComponent(l.mapQuery),
  }));
}

// ---- sitemap ----
const urls = [
  `${SITE}/`,
  `${SITE}/appointment-request.html`,
  ...locations.map((l) => `${SITE}/locations/${l.slug}/`),
];
emit("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>2026-07-20</lastmod></url>`).join("\n")}
</urlset>
`);

console.log(`Wrote ${written.length} files:\n` + written.join("\n"));
