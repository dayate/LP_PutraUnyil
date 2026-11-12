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
7. [Panel Admin: Edit Konten Tanpa Coding (`/admin`)](#panel-admin-edit-konten-tanpa-coding-admin)
8. [Manajemen Stok Tanpa Coding (`stock.json`)](#manajemen-stok-tanpa-coding-stockjson)
9. [Setup Web Analytics 100% Gratis (Cookieless)](#setup-web-analytics-100-gratis-cookieless)
10. [Batas Kuota Cloudflare Free Tier & Bukti Bebas Biaya](#batas-kuota-cloudflare-free-tier--bukti-bebas-biaya)
11. [Struktur Berkas Proyek](#struktur-berkas-proyek)

---

## Arsitektur & Spesifikasi

- **Single Origin / Zero External CDN:** Seluruh pustaka CSS (Tailwind v3.4 hasil kompilasi), JavaScript (Leaflet v1.9.4 & logika aplikasi), dan Web Fonts (Plus Jakarta Sans & Playfair Display format WOFF2) di-host secara lokal dari repositori ini. Menjamin loading kilat (<200 KB gzip awal) dan keamanan tinggi.
- **Strict Content Security Policy (CSP):** Dipasang per-path oleh `functions/_middleware.js` (satu header per respons), memblokir script injection berbahaya dan membatasi koneksi hanya ke endpoint yang dibutuhkan (Esri Maps Tiles, Photon Geocoding, Google Maps Embed). Halaman publik dan panel admin punya kebijakan terpisah — lihat catatan penting di `_headers`.
- **Peta dimuat on-demand:** Leaflet (±45 KB gzip CSS + JS) tidak dimuat saat halaman dibuka. `loadLeaflet()` di `assets/app.js` baru menyuntikkan asetnya ketika modal "Tentukan Titik Pengantaran" dibuka, lengkap dengan indikator loading, deteksi tile gagal, dan tautan cadangan ke Google Maps. Pencarian lokasi memakai **Photon** (`photon.komoot.io`) yang mengizinkan search-as-you-type — berbeda dari Nominatim OSM yang melarang autocomplete.
- **Client-Side Cart & Checkout State:** Keranjang belanja otomatis tersimpan di `localStorage` (`makunyil_state_v1`). Menyimpan daftar menu, pilihan pembayaran (COD / QRIS), jadwal, nama, dan koordinat maps.
- **Ongkir Gratis:** Dapur hanya melayani area sekitar, jadi **tidak ada biaya pengantaran**. Jarak garis lurus (haversine) dari dapur Mak Unyil (`-7.752, 110.4915`) tetap dihitung untuk info kurir dan peringatan area:
  - $\le 10\text{ km}$: area layanan, ongkir gratis
  - $> 10\text{ km}$: tetap bisa dipesan, tetapi titik dikonfirmasi lewat WhatsApp
- **Aturan Minimal Kuantitas:** Mekanisme `minQty` per produk tetap didukung (tombol `-`, input manual, dan tambah cepat) untuk menu yang nanti diberi batas minimal.

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

### 2. Build Produksi (satu perintah)
Jalankan perintah ini setiap kali Anda mengubah markup, konten, atau foto:
```bash
npm run build
```
Urutan kerjanya:

| Tahap | Skrip | Yang dilakukan |
|---|---|---|
| 1 | `scripts/build-content.js` | Menyuntik `content/site.json` & `content/products.json` ke `assets/app.js` (`const SITE`, `const PRODUCTS`) dan memperbarui teks hero, nomor WhatsApp, serta jam operasional di `index.html` |
| 2 | `scripts/build-images.js` | Membuat WebP 600w & 1200w (`images/<slug>-600.webp`, `-1200.webp`) dari setiap foto di `images/uploads/` memakai `sharp` |
| 3 | `tailwindcss` | Meminifikasi style ke `assets/site.css` |
| 4 | `scripts/prerender.js` | Mencetak 11 kartu produk & 6 slide galeri langsung ke `index.html` (CLS tetap 0 karena grid sudah terisi sejak HTML pertama) |
| 5 | `scripts/cache-bust.js` | Menempelkan `?v=<hash isi>` pada setiap referensi `/assets/` & `/images/`, **termasuk URL di dalam `srcset`** |

Build **gagal dengan pesan jelas** bila ada konten tidak valid (harga kosong, kategori salah, foto galeri hilang) atau ada URL aset yang lolos tanpa `?v=`. Jadi halaman rusak tidak akan pernah ter-deploy.

**Jangan hapus query `?v=`** — tanpa hash, CDN akan menyajikan CSS/JS/foto lama selama 7 hari (HTML baru + aset lama = tampilan seolah tidak sinkron).

### 3. Foto Produk
- **Cara normal:** unggah satu foto asli lewat `/admin` → tersimpan di `images/uploads/` → build membuat dua ukuran WebP otomatis.
- Nama berkas menentukan nama produk di URL: `Sate Keong.JPG` → `images/sate-keong-600.webp`.
- `images/_source/` hanya arsip foto master kamera (diabaikan git, tidak diproses build).
- Foto kosong **tidak** memakai gambar placeholder: kartu menampilkan tile netral CSS dengan teks "Foto menyusul".

### 4. Mode Pengawasan (Live Reload CSS saat Edit)
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

## Panel Admin: Edit Konten Tanpa Coding (`/admin`)

Semua isi halaman dikelola dari satu panel di `https://store.putraunyil.biz.id/admin`
(Sveltia CMS, di-host sendiri di `admin/vendor/` — bukan CDN, jadi CSP tetap ketat).

| Menu | Berkas | Yang bisa diubah |
|---|---|---|
| **Produk** | `content/products.json` | Nama, kategori, harga, satuan, deskripsi, foto, status bawaan |
| **Galeri** | `content/gallery.json` | Foto, judul, label, keterangan lightbox |
| **Stok Harian** | `stock.json` | Status per menu (langsung aktif tanpa deploy) |
| **Pengaturan Situs** | `content/site.json` | WhatsApp, jam buka, radius antar, koordinat dapur, teks hero |

### Login
1. **OAuth (disarankan).** Deploy `github.com/sveltia/sveltia-cms-auth` ke Cloudflare
   Workers, lalu `base_url` di `admin/config.yml` diarahkan ke Worker Anda.
   Default di repo: `https://sveltia-cms-auth.dayate.workers.dev` — **ganti subdomainnya
   bila Worker Anda berbeda**, dan tambahkan host itu ke `connect-src` pada `ADMIN_CSP`
   di `functions/_middleware.js` (bukan di `_headers`).
2. **Token.** Di halaman login pilih *Sign In Using Access Token*, tempel GitHub Personal
   Access Token (scope `repo`). Berguna sebelum Worker siap; token tidak disimpan di repo.

> **Penting soal CSP:** Cloudflare Pages menerapkan **semua** baris `_headers` yang cocok,
> jadi menaruh CSP di `/*` dan `/admin/*` sekaligus membuat browser menegakkan irisan
> keduanya — `api.github.com` ikut terblokir dan login gagal dengan pesan `Failed to fetch`.
> Karena itu CSP **hanya** dipasang di `functions/_middleware.js`. Jangan menambahkan
> `Content-Security-Policy` ke `_headers` lagi.


Tidak ada password di repo. Hanya akun GitHub dengan akses tulis ke
`dayate/LP_PutraUnyil` yang bisa masuk.

### Setelah menyimpan di admin
Setiap simpan = satu commit ke `main` → Cloudflare Pages build ulang otomatis (±1-2 menit).
Perubahan **stok** dikecualikan: `stock.json` di-fetch runtime, jadi langsung terlihat.

### Keamanan panel
- `/admin` ber-`noindex` + `X-Robots-Tag: noindex` dan diblokir di `robots.txt`.
- CSP `/admin/*` (dari `functions/_middleware.js`) hanya mengizinkan `self`, GitHub API, unpkg/jsdelivr, dan Worker OAuth.
- `images/uploads/` (foto asli) tidak diindeks mesin pencari.

---

## Manajemen Stok Tanpa Coding (`stock.json`)

Status sajian (Tersedia, Pre-Order, atau Habis) dapat diperbarui kapan saja tanpa mengubah file HTML atau baris kode JavaScript — lewat menu **Stok Harian** di `/admin`, atau langsung mengedit berkas:

```json
{
  "updated": "2026-11-11T06:00:00+07:00",
  "note": "Status stok harian. Nilai: available | preorder | soldout.",
  "items": [
    { "id": "sate-keong", "status": "soldout" },
    { "id": "sate-usus", "status": "available" },
    { "id": "oseng-keong", "status": "soldout" },
    { "id": "keong-fresh", "status": "preorder" },
    { "id": "nasi-uduk", "status": "preorder" },
    { "id": "nasi-kuning", "status": "preorder" },
    { "id": "bakmi-capcay", "status": "preorder" },
    { "id": "tahu-sarang", "status": "available" },
    { "id": "tahu-telur", "status": "soldout" },
    { "id": "getuk-crispy", "status": "available" },
    { "id": "daun-pisang", "status": "preorder" }
  ]
}
```

`id` harus sama dengan `id` di menu Produk; salah ketik = status diabaikan (status bawaan
dari `content/products.json` yang dipakai). Format lama berbentuk objek
(`"items": { "sate-keong": "soldout" }`) masih diterima `assets/app.js` agar tidak ada
yang rusak bila file ditulis manual.

### Cara Memperbarui Stok di Produksi:
- Buka `/admin` → **Stok Harian**, atau edit `stock.json` langsung via antarmuka GitHub.
- Browser pengunjung mem-fetch `stock.json` dengan header `must-revalidate` (tidak ter-cache stale).
- Label status dan tombol pemesanan otomatis menyesuaikan secara instan.

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
├── _headers                   # Caching edge + noindex /admin (TANPA CSP — lihat functions/)
├── functions/
│   └── _middleware.js         # Pasang satu header CSP per path (publik vs /admin)
├── 404.html                   # Halaman fallback 404 mandiri tanpa dependensi luar
├── index.html                 # Markup utama; katalog & galeri dicetak build dari content/
├── stock.json                 # Status stok runtime (diedit lewat /admin)
├── package.json               # Skrip npm build
├── tailwind.config.js         # Token warna, font, dan scanning kelas
├── robots.txt                 # Blokir /admin, /images/uploads, /images/_source
├── sitemap.xml
├── content/                   # SUMBER KEBENARAN konten (dikelola Sveltia CMS)
│   ├── products.json          # 11 menu: harga, kategori, status, foto, deskripsi
│   ├── gallery.json           # 6 slide galeri
│   └── site.json              # WhatsApp, jam buka, radius antar, koordinat, teks hero
├── admin/
│   ├── index.html             # Panel Sveltia CMS (noindex)
│   ├── config.yml             # Definisi koleksi + backend GitHub
│   └── vendor/                # Bundle Sveltia CMS lokal (2.9 MB, tanpa CDN)
├── scripts/
│   ├── lib/content.js         # Pembaca + validator content/*.json
│   ├── build-content.js       # Suntik konten ke app.js & index.html
│   ├── build-images.js        # WebP 600w/1200w dari images/uploads (sharp)
│   ├── prerender.js           # Cetak kartu produk & slide galeri ke HTML
│   └── cache-bust.js          # ?v=<hash> untuk assets/ & images/ + penjaga regresi
├── assets/
│   ├── app.js                 # Keranjang, haversine, WhatsApp generator, checkout
│   ├── site.css               # CSS Tailwind terkompilasi
│   └── 404.css                # Style halaman 404
├── fonts/                     # Font lokal WOFF2 (Plus Jakarta Sans & Playfair Display)
├── vendor/
│   └── leaflet/               # Leaflet 1.9.4 CSS + JS + ikon lokal (dimuat saat peta dibuka)
└── images/                    # WebP 600w & 1200w untuk kartu, galeri, lightbox
    ├── uploads/               # Foto asli hasil unggahan /admin (sumber build-images)
    └── _source/               # (git-ignored) arsip foto master kamera
```
