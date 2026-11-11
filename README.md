# Panduan Deploy & Operasional Landing Page Mak Unyil (100% Gratis di Cloudflare)

Landing page statis modern berperforma tinggi untuk **Mak Unyil Kitchen** (Prambanan, Klaten).
Dirancang dengan arsitektur **Zero-CDN**, **Zero-Database Server**, dan **100% Free-Tier Cloudflare** (tanpa biaya langganan, tanpa server berbayar, tanpa credit card lock).

---

## Daftar Isi
1. [Arsitektur & Spesifikasi](#arsitektur--spesifikasi)
2. [Prasyarat Lokal](#prasyarat-lokal)
3. [Alur Pengembangan & Build](#alur-pengembangan--build)
4. [Metode Deploy 1: Cloudflare Pages (Sangat Direkomendasikan)](#metode-deploy-1-cloudflare-pages-sangat-direkomendasikan)
5. [Metode Deploy 2: Cloudflare Workers (Static Assets Modern)](#metode-deploy-2-cloudflare-workers-static-assets-modern)
6. [Konfigurasi Custom Domain & SSL Gratis](#konfigurasi-custom-domain--ssl-gratis)
7. [Manajemen Stok Tanpa Coding (`stock.json`)](#manajemen-stok-tanpa-coding-stockjson)
8. [Setup Web Analytics 100% Gratis (Cookieless)](#setup-web-analytics-100-gratis-cookieless)
9. [Batas Kuota Cloudflare Free Tier & Bukti Bebas Biaya](#batas-kuota-cloudflare-free-tier--bukti-bebas-biaya)
10. [Struktur Berkas Proyek](#struktur-berkas-proyek)

---

## Arsitektur & Spesifikasi

- **Single Origin / Zero External CDN:** Seluruh pustaka CSS (Tailwind v3.4 hasil kompilasi), JavaScript (Leaflet v1.9.4 & logika aplikasi), dan Web Fonts (Plus Jakarta Sans & Playfair Display format WOFF2) di-host secara lokal dari repositori ini. Menjamin loading kilat (<200 KB gzip awal) dan keamanan tinggi.
- **Strict Content Security Policy (CSP):** Terkonfigurasi di `_headers`, memblokir script injection berbahaya dan membatasi koneksi hanya ke endpoint yang dibutuhkan (Esri Maps Tiles, Nominatim Geocoding, Google Maps Embed).
- **Client-Side Cart & Checkout State:** Keranjang belanja otomatis tersimpan di `localStorage` (`makunyil_state_v1`). Menyimpan daftar menu, pilihan pembayaran (COD / QRIS), jadwal, nama, dan koordinat maps.
- **Estimasi Ongkir Haversine:** Perhitungan jarak real-time dari dapur Mak Unyil (`-7.752, 110.4915`):
  - $\le 0.5\text{ km}$: Gratis (Ambil di Dapur)
  - $\le 3\text{ km}$: Rp 8.000
  - $\le 6\text{ km}$: Rp 12.000
  - $\le 10\text{ km}$: Rp 18.000
  - $> 10\text{ km}$: Konfirmasi via WhatsApp
- **Enforcement Aturan Bisnis:** Paket Nasi Box otomatis mengunci minimal kuantitas 15 box baik saat klik "+ Tambah", input angka manual, maupun tombol `-`.

---

## Prasyarat Lokal

1. **Node.js**: Versi LTS 18.x, 20.x, atau 22+
2. **npm**: Versi 9+
3. **Wrangler CLI** (Opsional, jika deploy langsung via terminal):
   ```bash
   npm install -g wrangler
   wrangler login
   ```

---

## Alur Pengembangan & Build

Semua style Tailwind dikompilasi ke `assets/site.css` menggunakan file konfigurasi lokal `tailwind.config.js`.

### 1. Pasang Dependency
```bash
npm install
```

### 2. Kompilasi Style untuk Produksi (Minified)
Jalankan perintah ini setiap kali Anda mengubah markup kelas di `index.html`, `404.html`, atau `assets/app.js`:
```bash
npm run build
```

### 3. Mode Pengawasan (Live Reload CSS saat Edit)
```bash
npm run watch
```

---

## Metode Deploy 1: Cloudflare Pages (Sangat Direkomendasikan)

Cloudflare Pages adalah solusi paling stabil, termudah, dan 100% gratis untuk landing page ini karena file `_headers` langsung diproses secara otomatis di edge network global.

### Opsi A: Otomatis via Git (GitHub / GitLab)
1. Buat repository baru di GitHub/GitLab (bisa Private atau Public), lalu push seluruh kode:
   ```bash
   git init
   git add .
   git commit -m "feat: landing page Mak Unyil production ready"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```
2. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) → Masuk ke menu **Workers & Pages**.
3. Klik **Create** → Pilih tab **Pages** → **Connect to Git**.
4. Pilih repository Anda, lalu masukkan pengaturan build berikut:
   - **Framework preset:** `None`
   - **Build command:** `npm run build`
   - **Build output directory:** `.` *(titik atau biarkan kosong untuk root)*
   - **Root directory:** `/`
5. Klik **Save and Deploy**. Cloudflare akan mengompilasi CSS dan menyajikan situs dalam ~30 detik. Setiap commit ke branch `main` akan ter-deploy otomatis.

### Opsi B: Direct Upload via CLI (Tanpa Git)
Jika tidak ingin menghubungkan Git, deploy langsung dari komputer Anda menggunakan Wrangler:
```bash
# 1. Pastikan CSS terkompilasi
npm run build

# 2. Deploy folder saat ini sebagai project Pages
wrangler pages deploy . --project-name=store-makunyil
```
Pada deploy pertama, Wrangler akan menanyakan nama proyek dan branch produksi (pilih `main`).

---

## Metode Deploy 2: Cloudflare Workers (Static Assets Modern)

Jika Anda ingin menggabungkan landing page ini ke dalam ekosistem Cloudflare Workers (misalnya nanti ingin menambah Worker API, KV, atau cron job):

1. Buat berkas `wrangler.jsonc` di root project:
   ```jsonc
   {
     "name": "store-makunyil",
     "compatibility_date": "2026-11-01",
     "assets": {
       "directory": ".",
       "binding": "ASSETS"
     }
   }
   ```
2. Pastikan file `.gitignore` atau `.wranglerignore` mengecualikan folder non-runtime agar tidak memakan kuota upload:
   ```text
   node_modules/
   images/_source/
   src/
   *.log
   ```
3. Deploy ke Workers:
   ```bash
   npm run build
   wrangler deploy
   ```
*Catatan:* Sejak pembaruan Cloudflare Workers Static Assets, berkas `_headers` dan `_redirects` yang berada di folder aset akan dibaca dan diterapkan secara otomatis tanpa biaya request script.

---

## Konfigurasi Custom Domain & SSL Gratis

Untuk menghubungkan domain custom (misalnya `store.putraunyil.biz.id`):

1. Masuk ke **Cloudflare Dashboard** → **Workers & Pages** → Pilih project `store-makunyil`.
2. Klik tab **Custom Domains**.
3. Klik **Set up a custom domain**.
4. Masukkan nama domain: `store.putraunyil.biz.id`.
5. Jika domain `putraunyil.biz.id` sudah menggunakan nameserver Cloudflare:
   - Cloudflare akan otomatis membuatkan DNS CNAME record.
   - Sertifikat SSL/TLS Universal otomatis aktif (HTTPS) dalam 1–5 menit tanpa biaya perpanjangan.
6. Jika domain berada di DNS provider luar:
   - Buat DNS record `CNAME` di panel domain Anda:
     - **Name / Host:** `store`
     - **Target:** `<nama-project-pages>.pages.dev`

---

## Manajemen Stok Tanpa Coding (`stock.json`)

Status sajian (Tersedia, Pre-Order, atau Habis) dapat diperbarui kapan saja tanpa mengubah file HTML atau baris kode JavaScript.

Buka file `stock.json`:
```json
{
  "updated": "2026-11-11T06:00:00+07:00",
  "note": "Ubah status di sini tanpa menyentuh HTML. Nilai: available | preorder | soldout.",
  "items": {
    "sate-keong": "available",
    "oseng-keong": "available",
    "keong-fresh": "preorder",
    "nasi-uduk": "soldout",
    "nasi-kuning": "available",
    "bakmi-capcay": "available",
    "nasi-box": "preorder",
    "tahu-sarang": "available",
    "tahu-telur": "soldout",
    "getuk-crispy": "available",
    "daun-pisang": "preorder"
  }
}
```

### Cara Memperbarui Stok di Produksi:
- Cukup edit berkas `stock.json` langsung via antarmuka GitHub (klik icon pensil) atau commit git.
- Browser pengunjung akan mem-fetch `stock.json` dengan header `must-revalidate` (tidak ter-cache stale).
- Label status dan tombol pemesanan akan otomatis menyesuaikan secara instan.

---

## Setup Web Analytics 100% Gratis (Cookieless)

Landing page ini mendukung **Cloudflare Web Analytics** gratis tanpa perlu memasang banner cookie GDPR / UU PDP karena tidak melacak data pribadi.

1. Buka Cloudflare Dashboard → Menu **Analytics & Logs** → **Web Analytics**.
2. Klik **Add a site** → Masukkan `store.putraunyil.biz.id`.
3. Jika menggunakan Cloudflare Pages, Anda cukup mengaktifkan toggle **Automatic Setup** di tab Settings Pages project Anda.
4. Atau salin snippet JS yang diberikan dan letakkan di `index.html` sebelum `</body>`:
   ```html
   <!-- Cloudflare Web Analytics -->
   <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "TOKEN_ANDA"}'></script>
   ```
*(Header CSP di `_headers` sudah mengizinkan `https://static.cloudflareinsights.com` dan endpoint beacon `https://cloudflareinsights.com`).*

---

## Batas Kuota Cloudflare Free Tier & Bukti Bebas Biaya

Landing page ini dijamin beroperasi pada **Rp 0 / selamanya** berdasarkan spesifikasi batas paket gratis Cloudflare:

| Fitur Cloudflare | Kuota Free Tier | Penggunaan Landing Page Ini | Status Biaya |
|---|---|---|---|
| **Pages Static Requests** | **UNLIMITED** (Tak Terbatas) | Seluruh HTML, CSS, WebP, Font | **100% GRATIS** |
| **Bandwidth / Egress** | **UNLIMITED** (0 rupiah per GB) | Gambar & Aset WebP | **100% GRATIS** |
| **Pages Builds** | 500 build per bulan | ~10-20 build per bulan | **100% GRATIS** |
| **Sertifikat SSL / TLS** | Gratis otomatis (Edge Certificate) | HTTPS aktif | **100% GRATIS** |
| **DDoS Protection** | Unlimited unmetered mitigation | Standar Cloudflare Edge | **100% GRATIS** |
| **Web Analytics** | Unlimited page views | Cookieless analytics | **100% GRATIS** |
| **Storage Asset Limit** | Hingga 20.000 file (Maks 25 MB/file) | ~40 file total (~4 MB) | **100% GRATIS** |

Tidak ada kartu kredit yang diperlukan untuk mengaktifkan Cloudflare Pages.

---

## Struktur Berkas Proyek

```text
LP_store/
├── _headers                   # Aturan CSP ketat & caching Cloudflare edge
├── 404.html                   # Halaman fallback 404 mandiri tanpa dependensi luar
├── index.html                 # Markup utama semantik, SEO JSON-LD & Open Graph
├── stock.json                 # Konfigurasi stok runtime dinamis
├── package.json               # Skrip npm build tailwind
├── tailwind.config.js         # Konfigurasi token warna, font, dan scanning kelas
├── .gitignore                 # Mencegah upload node_modules & file sumber mentah
├── assets/
│   ├── app.js                 # Logika bisnis: keranjang, haversine ongkir, WhatsApp generator
│   ├── site.css               # CSS terkompilasi Tailwind (~25 KB minified / ~5 KB gzip)
│   └── 404.css                # Style khusus halaman 404
├── fonts/                     # Font lokal WOFF2 (Plus Jakarta Sans & Playfair Display)
│   └── fonts.css
├── vendor/
│   └── leaflet/               # Leaflet 1.9.4 CSS + JS + Icon lokal (tanpa unpkg)
└── images/                    # Asset foto kompresi WebP (600w & 1200w responsive)
    └── _source/               # (Diabaikan oleh git) Arsip foto master kamera
```
