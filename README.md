# Panduan Deploy & Operasional Landing Page Mak Unyil (100% Gratis di Cloudflare)

Landing page statis modern berperforma tinggi untuk **Dapur Mak Unyil** (Prambanan, Klaten).
Dirancang dengan arsitektur **Zero-CDN**, **Zero-Database Server**, dan **100% Free-Tier Cloudflare** (tanpa biaya langganan, tanpa server berbayar, tanpa credit card lock).

---

## Daftar Isi
1. [Arsitektur & Spesifikasi](#arsitektur--spesifikasi)
2. [Prasyarat Lokal](#prasyarat-lokal)
3. [Alur Pengembangan & Build](#alur-pengembangan--build)
4. [Metode Deploy 1: Cloudflare Pages (Sangat Direkomendasikan)](#metode-deploy-1-cloudflare-pages-sangat-direkomendasikan)
5. [Metode Deploy 2: Cloudflare Workers (Static Assets Modern)](#metode-deploy-2-cloudflare-workers-static-assets-modern)
6. [Konfigurasi Custom Domain & SSL Gratis](#konfigurasi-custom-domain--ssl-gratis)
7. [Mengedit Konten (Tanpa Panel Admin)](#mengedit-konten-tanpa-panel-admin)
8. [Mengatur Ketersediaan Menu (`stock.json`)](#mengatur-ketersediaan-menu-stockjson)
9. [Setup Web Analytics 100% Gratis (Cookieless)](#setup-web-analytics-100-gratis-cookieless)
10. [Batas Kuota Cloudflare Free Tier & Bukti Bebas Biaya](#batas-kuota-cloudflare-free-tier--bukti-bebas-biaya)
11. [Struktur Berkas Proyek](#struktur-berkas-proyek)

---

## Arsitektur & Spesifikasi

- **Single Origin / Zero External CDN:** Seluruh pustaka CSS (Tailwind v3.4 hasil kompilasi), JavaScript (Leaflet v1.9.4 & logika aplikasi), dan Web Fonts (Plus Jakarta Sans & Playfair Display format WOFF2) di-host secara lokal dari repositori ini. Menjamin loading kilat (<200 KB gzip awal) dan keamanan tinggi.
- **Strict Content Security Policy (CSP):** Dipasang statis di `_headers` (bukan Functions), memblokir script injection dan membatasi koneksi hanya ke endpoint yang dibutuhkan (Esri Maps Tiles, Photon Geocoding, Google Maps Embed, Cloudflare Web Analytics).
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
- **Cara normal:** taruh satu foto asli di `images/uploads/` (nama berkas = nama berkas jadi), lalu `npm run build` membuat dua ukuran WebP otomatis.
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

## Mengedit Konten (Tanpa Panel Admin)

Situs ini statis murni: tidak ada panel admin, tidak ada login, tidak ada API, dan tidak
ada Cloudflare Functions. Seluruh isi halaman dibaca build dari berkas JSON di `content/`,
lalu diedit langsung di repo (GitHub web editor, GitHub Desktop, atau editor lokal).

| Berkas | Yang bisa diubah |
|---|---|
| `content/products.json` | Nama, kategori, harga, satuan, deskripsi, foto, status bawaan |
| `content/gallery.json` | Foto, judul, label, keterangan lightbox |
| `content/site.json` | WhatsApp, jam buka, jangkauan antar, koordinat dapur, aturan pre-order, teks hero |
| `stock.json` | Ketersediaan menu (`open` / `off`) |

Alur kerja:

1. Edit berkas JSON yang bersangkutan.
2. Jalankan `npm run build` di lokal untuk memvalidasi isi sekaligus mencetak ulang HTML.
3. Commit + push ke `main`.
4. Cloudflare Pages build ulang otomatis (sekitar 1-2 menit).

Build gagal dengan pesan jelas bila JSON tidak valid (harga kosong, kategori salah, foto
galeri hilang), jadi konten rusak tidak akan pernah ter-deploy.

> **CSP:** seluruh header keamanan, termasuk `Content-Security-Policy`, dipasang statis di
> `_headers`. Tidak ada Functions/middleware yang menyisipkan header, jadi jangan menambah
> `Content-Security-Policy` di berkas lain.

---

## Mengatur Ketersediaan Menu (`stock.json`)

Dapur Mak Unyil **tidak menyimpan stok harian** — semua menu dibuat setelah dipesan.
Karena itu hanya ada dua status: `open` (bisa dipesan) dan `off` (tidak tersedia / di luar
musim). Status diubah langsung di berkas:

```json
{
  "updated": "2026-11-12T06:00:00+07:00",
  "note": "Ketersediaan, bukan stok harian. Nilai: open | off.",
  "items": [
    { "id": "sate-keong", "status": "open" },
    { "id": "sate-usus", "status": "open" },
    { "id": "oseng-keong", "status": "open" },
    { "id": "keong-fresh", "status": "open" },
    { "id": "nasi-uduk", "status": "open" },
    { "id": "nasi-kuning", "status": "open" },
    { "id": "bakmi-capcay", "status": "open" },
    { "id": "tahu-sarang", "status": "open" },
    { "id": "tahu-telur", "status": "open" },
    { "id": "getuk-crispy", "status": "open" },
    { "id": "daun-pisang", "status": "open" }
  ]
}
```

`id` harus sama dengan `id` di menu Produk; salah ketik = status diabaikan (status bawaan
dari `content/products.json` yang dipakai). Produk dengan `"seasonal": true` (keong) memakai
label **Di luar musim** saat `off`; produk lain memakai **Tidak tersedia**.

### Cara Memperbarui Ketersediaan di Produksi
- Edit `stock.json` di repo (langsung atau lewat antarmuka GitHub), lalu commit.
- Simpan = commit → build ±1-2 menit. Halaman mem-fetch `stock.json` dengan
  `must-revalidate`, jadi tidak ada versi basi yang tersangkut cache.
- Tombol pesan otomatis berubah jadi nonaktif untuk menu berstatus `off`.

### Aturan pre-order (`content/site.json` → `orderRules`)
- `nasiLeadDays` (default 3): tanggal paling cepat untuk pesanan nasi, H-3.
- `jajananLeadDays` (default 1): jajanan pasar H-1.
- `maxNasiPcs` (default 200): batas nasi per pesanan; keranjang memberi peringatan bila lewat.
- Pengaturan ini juga menjadi `min` pada pemilih tanggal dan dasar validasi saat checkout.
- DP 50% dihitung otomatis di keranjang dan disertakan pada pesan WhatsApp.

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
|-- _headers                   # CSP + caching edge (statis murni, tanpa Functions)
|-- 404.html                   # Halaman fallback 404 mandiri tanpa dependensi luar
|-- index.html                 # Markup utama; katalog & galeri dicetak build dari content/
|-- stock.json                 # Ketersediaan menu (edit manual, di-fetch must-revalidate)
|-- package.json               # Skrip npm build
|-- tailwind.config.js         # Token warna, font, dan scanning kelas
|-- robots.txt                 # Tidak mengindeks /images/uploads & /images/_source
|-- sitemap.xml
|-- content/                   # SUMBER KEBENARAN konten (diedit manual di repo)
|   |-- products.json          # 11 menu: harga, kategori, status, foto, deskripsi
|   |-- gallery.json           # 6 slide galeri
|   `-- site.json              # WhatsApp, jam buka, radius antar, koordinat, teks hero
|-- scripts/
|   |-- lib/content.js         # Pembaca + validator content/*.json
|   |-- build-content.js       # Suntik konten ke app.js & index.html
|   |-- build-images.js        # WebP 600w/1200w dari images/uploads (sharp)
|   |-- prerender.js           # Cetak kartu produk & slide galeri ke HTML
|   `-- cache-bust.js          # ?v=<hash> untuk assets/ & images/ + penjaga regresi
|-- assets/
|   |-- app.js                 # Keranjang, haversine, WhatsApp generator, checkout
|   |-- site.css               # CSS Tailwind terkompilasi
|   `-- 404.css                # Style halaman 404
|-- fonts/                     # Font lokal WOFF2 (Plus Jakarta Sans & Playfair Display)
|-- vendor/
|   `-- leaflet/               # Leaflet 1.9.4 CSS + JS + ikon lokal (dimuat saat peta dibuka)
`-- images/                    # WebP 600w & 1200w untuk kartu, galeri, lightbox
    |-- uploads/               # Foto asli (sumber build-images)
    `-- _source/               # (git-ignored) arsip foto master kamera
```
