/* ==========================================================================
   Cache-busting aset: menempelkan ?v=<hash isi file> pada referensi
   /assets/*.css dan /assets/*.js di index.html & 404.html.

   Kenapa perlu: file di /assets/* di-cache 7 hari oleh _headers (Cloudflare
   Pages), tetapi namanya tetap (site.css, app.js). Tanpa query versi,
   CDN/browser terus menyajikan berkas lama walau HTML-nya sudah diperbarui
   (gejala: "HTML baru + JS/CSS lama" -> tampilan seolah tidak sinkron).

   Jalankan SETELAH Tailwind selesai menulis assets/site.css.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const HTML_FILES = ["index.html", "404.html"];

// Hash isi file aset supaya setiap perubahan pasti menghasilkan URL baru.
function hashOf(file) {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) return null;
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(abs))
    .digest("hex")
    .slice(0, 10);
}

// Buang ?v= lama agar tidak menumpuk, lalu pasang hash terbaru.
function bust(html, file) {
  const hash = hashOf(file);
  if (!hash) return html;
  const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(["'])/${escaped}(\\?v=[^"']*)?(["'])`, "g");
  return html.replace(re, `$1/${file}?v=${hash}$3`);
}

let changed = 0;
for (const name of HTML_FILES) {
  const abs = path.join(ROOT, name);
  if (!fs.existsSync(abs)) continue;
  const before = fs.readFileSync(abs, "utf8");
  const after = bust(bust(before, "assets/site.css"), "assets/app.js").replace(
    /(["'])\/assets\/404\.css(\?v=[^"']*)?(["'])/g,
    (m, a, _v, b) => {
      const h = hashOf("assets/404.css");
      return h ? `${a}/assets/404.css?v=${h}${b}` : m;
    },
  );
  if (after !== before) {
    fs.writeFileSync(abs, after, "utf8");
    changed++;
    console.log(`cache-bust: ${name} diperbarui`);
  }
}

if (!changed) console.log("cache-bust: tidak ada perubahan referensi aset.");
