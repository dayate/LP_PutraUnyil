/* ==========================================================================
   Menyalin konten dari content/*.json ke tempat yang dipakai halaman.

   Kenapa perlu langkah ini: situs harus tetap statis (tanpa fetch runtime),
   tetapi pemilik toko mengedit lewat /admin. Jadi saat build, data JSON
   disuntikkan ke:

     1. assets/app.js     -> `const SITE`, `const PRODUCTS`
        (keranjang, checkout WhatsApp, dan peta bekerja tanpa request tambahan)
     2. index.html        -> teks hero, nomor WhatsApp, jam operasional
        (ditandai atribut data-content dan blok JSON-LD)

   Katalog & galeri dicetak oleh scripts/prerender.js, bukan di sini.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const { ROOT, fail, loadSite, loadProducts, loadGallery } = require("./lib/content");

const APP_JS = path.join(ROOT, "assets", "app.js");
const INDEX = path.join(ROOT, "index.html");

const site = loadSite();
const products = loadProducts();
loadGallery(); // divalidasi lebih awal supaya kesalahan ketahuan sebelum ada berkas ditulis

// --- 1. Suntik data ke assets/app.js --------------------------------------
function injectBlock(source, name, marker, value) {
  const re = new RegExp(
    `const ${name} = /\\* @${marker}:start \\*\\/[\\s\\S]*?/\\* @${marker}:end \\*\\/`,
  );
  if (!re.test(source)) {
    fail(`penanda @${marker}:start / @${marker}:end tidak ditemukan di assets/app.js`);
  }
  const literal = JSON.stringify(value, null, 2);
  return source.replace(
    re,
    `const ${name} = /* @${marker}:start */ ${literal} /* @${marker}:end */`,
  );
}

let app = fs.readFileSync(APP_JS, "utf8");
const appBefore = app;
app = injectBlock(app, "SITE", "site", site);
app = injectBlock(app, "PRODUCTS", "products", products);
if (app !== appBefore) {
  fs.writeFileSync(APP_JS, app, "utf8");
  console.log("build-content: SITE & PRODUCTS disuntik ke assets/app.js");
} else {
  console.log("build-content: assets/app.js sudah sinkron");
}

// --- 2. Sinkronkan teks & atribut di index.html ---------------------------
function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function setDataContent(html, key, value) {
  // Tag penutup boleh berjarak (prettier menulis "</span\n  >"), jadi pola
  // penutup memakai \s* sebelum ">".
  const re = new RegExp(
    `(<([a-zA-Z0-9]+)\\b[^>]*\\bdata-content="${key.replace(/\./g, "\\.")}"[^>]*>)[\\s\\S]*?</\\2\\s*>`,
  );
  if (!re.test(html)) fail(`elemen dengan data-content="${key}" tidak ditemukan di index.html`);
  return html.replace(re, (match, open, tag) => `${open}${esc(value)}</${tag}>`);
}

function setTimeRange(html, open, close) {
  const re = /<input\b[^>]*\bid="order-time"[\s\S]*?>/;
  const tag = html.match(re);
  if (!tag) fail('input id="order-time" tidak ditemukan di index.html');
  const next = tag[0]
    .replace(/\bmin="\d{2}:\d{2}"/, `min="${open}"`)
    .replace(/\bmax="\d{2}:\d{2}"/, `max="${close}"`);
  return html.replace(tag[0], next);
}

let html = fs.readFileSync(INDEX, "utf8");
const htmlBefore = html;

Object.keys(site.hero).forEach((key) => {
  html = setDataContent(html, `hero.${key}`, site.hero[key]);
});

// Nomor WhatsApp dipakai di beberapa tautan (wa.me/...) dan di JSON-LD.
html = html.replace(/wa\.me\/\d+/g, `wa.me/${site.whatsapp}`);
html = html.replace(/("telephone":\s*")\+\d+(")/g, `$1+${site.whatsapp}$2`);

// Jam operasional: input time, keterangan di bawahnya, dan JSON-LD.
html = setTimeRange(html, site.hours.open, site.hours.close);
html = html.replace(
  /Jam operasional \d{2}:\d{2}[–-]\d{2}:\d{2} WIB/g,
  `Jam operasional ${site.hours.open}–${site.hours.close} WIB`,
);
html = html.replace(/("opens":\s*")\d{2}:\d{2}(")/g, `$1${site.hours.open}$2`);
html = html.replace(/("closes":\s*")\d{2}:\d{2}(")/g, `$1${site.hours.close}$2`);

if (html !== htmlBefore) {
  fs.writeFileSync(INDEX, html, "utf8");
  console.log("build-content: teks hero, WhatsApp & jam operasional diperbarui di index.html");
} else {
  console.log("build-content: index.html sudah sinkron");
}
