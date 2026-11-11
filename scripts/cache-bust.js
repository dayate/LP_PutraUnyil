/* ==========================================================================
   Cache-busting aset untuk Cloudflare Pages.

   Yang dikerjakan, berurutan (supaya tidak ada referensi sirkular):
     1. Hitung peta versi gambar { "images/x.webp": "<hash>" } dari isi gambar.
     2. Suntikkan peta itu ke assets/app.js pada penanda /* @asset-versions *\/.
        app.js merujuk foto lewat data JS, jadi HTML tidak bisa mem-bust-nya.
     3. Baru kemudian tempelkan ?v=<hash isi app.js final> ke referensi
        /assets/*.js, /assets/*.css, dan /images/*.webp di index.html & 404.html.

   Kenapa perlu: file di /assets/* dan /images/* di-cache 7 hari oleh _headers
   (Cloudflare Pages) dengan nama tetap. Tanpa query versi, CDN/browser dapat
   menyajikan berkas lama walau HTML sudah diperbarui — "tampilan tidak sinkron".

   Jalankan SETELAH Tailwind selesai menulis assets/site.css (lihat package.json).
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const APP_JS = "assets/app.js";
const HTML_FILES = ["index.html", "404.html"];
const IMAGES_DIR = path.join(ROOT, "images");

const cache = new Map();

function hashOf(file) {
  if (cache.has(file)) return cache.get(file);
  const abs = path.join(ROOT, file);
  let h = null;
  if (fs.existsSync(abs)) {
    h = crypto
      .createHash("sha256")
      .update(fs.readFileSync(abs))
      .digest("hex")
      .slice(0, 10);
  }
  cache.set(file, h);
  return h;
}

// --- Langkah 1 & 2: suntikkan manifest versi gambar ke app.js --------------
let manifestCount = 0;
const appAbs = path.join(ROOT, APP_JS);
if (fs.existsSync(appAbs)) {
  const src = fs.readFileSync(appAbs, "utf8");
  const refs = new Set();
  for (const m of src.matchAll(/["'](images\/[A-Za-z0-9._-]+\.webp)["']/g)) {
    refs.add(m[1]);
  }
  const manifest = {};
  for (const rel of [...refs].sort()) {
    const h = hashOf(rel);
    if (h) manifest[rel] = h;
  }
  manifestCount = Object.keys(manifest).length;
  const injected = `const ASSET_VERSIONS = /* @asset-versions */ ${JSON.stringify(
    manifest,
    null,
    2,
  )};`;
  const after = src.replace(
    /const ASSET_VERSIONS = \/\* @asset-versions \*\/ \{[^;]*\};/,
    injected,
  );
  if (after !== src) {
    fs.writeFileSync(appAbs, after, "utf8");
    console.log(`cache-bust: ${APP_JS} manifest gambar diperbarui (${manifestCount} entri)`);
  } else {
    console.log(`cache-bust: manifest gambar ${APP_JS} sudah terbaru (${manifestCount} entri)`);
  }
}

// --- Langkah 3: versikan referensi aset di HTML ---------------------------
// Hash app.js diambil dari isi FINAL (setelah manifest disuntikkan) sehingga
// perubahan pada peta versi pun otomatis menghasilkan URL app.js baru.
function bustRefs(text) {
  const re =
    /(["'])\/?(assets|images)\/([A-Za-z0-9._-]+\.(?:webp|js|css))(\?v=[A-Za-z0-9]*)?(["'])/g;
  return text.replace(re, (m, q1, dir, name, _old, q2) => {
    const file = `${dir}/${name}`;
    const hash = hashOf(file);
    if (!hash) return m;
    return `${q1}/${file}?v=${hash}${q2}`;
  });
}

let changed = 0;
for (const name of HTML_FILES) {
  const abs = path.join(ROOT, name);
  if (!fs.existsSync(abs)) continue;
  const before = fs.readFileSync(abs, "utf8");
  const after = bustRefs(before);
  if (after !== before) {
    fs.writeFileSync(abs, after, "utf8");
    changed++;
    console.log(`cache-bust: ${name} diperbarui`);
  }
}

if (!changed) console.log("cache-bust: referensi aset HTML sudah terbaru.");
