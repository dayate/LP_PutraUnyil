/* ==========================================================================
   Cloudflare Pages Functions — middleware CSP per-path.

   KENAPA ADA BERKAS INI
   `_headers` menerapkan SEMUA baris yang cocok sekaligus, bukan saling
   menimpa. Saat CSP ditulis di `/*` dan di `/admin/*`, respons /admin
   membawa DUA header Content-Security-Policy, dan browser menegakkan
   IRISAN keduanya — akibatnya `connect-src` tinggal 'self' sehingga
   fetch ke api.github.com diblokir ("Failed to fetch" saat login).

   Solusi: `_headers` tidak lagi mengirim CSP sama sekali. Berkas ini
   memasang tepat satu header CSP sesuai path:
     - /admin/*  -> kebijakan longgar secukupnya untuk Sveltia CMS
     - sisanya   -> kebijakan ketat untuk halaman publik

   Berkas ini hanya menyentuh respons HTML; aset (JS/CSS/WebP) diteruskan
   apa adanya supaya caching & byte-range tetap utuh.
   ========================================================================== */

// Halaman publik: tidak ada CDN eksternal. 'unsafe-inline' pada script-src
// dibutuhkan karena tombol memakai atribut onclick, dan script Cloudflare
// Web Analytics disuntikkan otomatis.
const PUBLIC_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
  "style-src 'self'",
  "font-src 'self'",
  "img-src 'self' data: https://server.arcgisonline.com",
  "connect-src 'self' https://photon.komoot.io https://cloudflareinsights.com",
  "frame-src https://www.google.com https://maps.google.com https://maps.google.co.id",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

// Panel admin: Sveltia CMS memuat chunk, shiki, dan locale dari unpkg,
// serta membaca/menulis repo lewat api.github.com. Detail, worker, dan
// font diambil dari jsdelivr/unpkg.
const ADMIN_CSP = [
  "default-src 'self'",
  "script-src 'self' https://unpkg.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https://avatars.githubusercontent.com https://raw.githubusercontent.com https://*.githubusercontent.com",
  [
    "connect-src 'self'",
    "https://api.github.com",
    "https://github.com",
    "https://raw.githubusercontent.com",
    "https://*.githubusercontent.com",
    "https://unpkg.com",
    "https://cdn.jsdelivr.net",
    // Worker OAuth (sveltia-cms-auth). Sesuaikan bila URL Worker berbeda.
    "https://sveltia-cms-auth.dayate.workers.dev",
  ].join(" "),
  "worker-src 'self' blob:",
  "frame-src 'self' https://github.com",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

export async function onRequest(context) {
  const response = await context.next();

  const path = new URL(context.request.url).pathname;
  const isAdmin = path === "/admin" || path.startsWith("/admin/");

  // Hanya HTML yang perlu CSP; aset statis tidak.
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const headers = new Headers(response.headers);
  headers.set("Content-Security-Policy", isAdmin ? ADMIN_CSP : PUBLIC_CSP);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
