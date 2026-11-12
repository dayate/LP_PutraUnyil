/* ==========================================================================
   Pembaca + validator konten (content/*.json).

   Dipakai bersama oleh:
     - scripts/build-content.js  (menyuntik data ke assets/app.js & index.html)
     - scripts/prerender.js      (mencetak katalog & galeri ke index.html)
     - scripts/build-images.js   (menamai berkas WebP dari foto unggahan)

   Semua kesalahan konten ditampilkan sebagai pesan yang bisa dibaca pemilik
   toko, bukan stack trace, dan build digagalkan supaya halaman rusak tidak
   pernah ter-deploy.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const CONTENT_DIR = path.join(ROOT, "content");
const IMAGES_DIR = path.join(ROOT, "images");
const UPLOADS_DIR = path.join(IMAGES_DIR, "uploads");

const CATEGORIES = ["sate", "nasi", "jajanan", "khusus"];
// Toko ini tidak menyimpan stok harian: semua produk dibuat setelah dipesan.
// "open" = bisa dipesan, "off" = sedang tidak tersedia (mis. keong di luar musim).
const STATUSES = ["open", "off"];

function fail(message) {
  console.error("\nbuild konten GAGAL: " + message + "\n");
  process.exit(1);
}

function readJson(file) {
  const abs = path.join(CONTENT_DIR, file);
  if (!fs.existsSync(abs)) fail(`berkas ${file} tidak ditemukan di folder content/`);
  try {
    return JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch (err) {
    fail(`${file} bukan JSON yang valid — ${err.message}`);
  }
}

function text(value) {
  return String(value == null ? "" : value).trim();
}

// "Sate Keong.JPG" -> "sate-keong"
function slugify(name) {
  return text(name)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Foto boleh berupa path unggahan ("/images/uploads/sate keong.jpg"), path WebP
// hasil build ("/images/sate-keong-1200.webp"), atau slug lama ("sate-keong").
// Semuanya dipetakan ke slug dasar yang sama.
function slugOfPhoto(photo) {
  const value = text(photo);
  if (!value) return "";
  const base = value.split(/[\\/]/).pop().replace(/\.[a-z0-9]+$/i, "");
  return slugify(base.replace(/-\d{3,4}$/, ""));
}

function uploadFileFor(slug) {
  if (!slug || !fs.existsSync(UPLOADS_DIR)) return null;
  const hit = fs.readdirSync(UPLOADS_DIR).find((name) => slugify(name) === slug);
  return hit ? path.join(UPLOADS_DIR, hit) : null;
}

function webpFor(slug, width) {
  return path.join(IMAGES_DIR, `${slug}-${width}.webp`);
}

// Foto dianggap ada bila WebP hasil build sudah tersedia ATAU berkas sumber
// siap diproses build-images pada build yang sama.
function photoExists(slug) {
  if (!slug) return false;
  return (
    fs.existsSync(webpFor(slug, 600)) ||
    fs.existsSync(webpFor(slug, 1200)) ||
    Boolean(uploadFileFor(slug))
  );
}

function loadSite() {
  const raw = readJson("site.json");
  const rules = raw.orderRules || {};
  const site = {
    brand: text(raw.brand) || "Dapur Mak Unyil",
    whatsapp: text(raw.whatsapp).replace(/[^0-9]/g, ""),
    hours: {
      open: text(raw.hours && raw.hours.open),
      close: text(raw.hours && raw.hours.close),
    },
    freeDeliveryRadiusKm: Number(raw.freeDeliveryRadiusKm),
    kitchen: {
      lat: Number(raw.kitchen && raw.kitchen.lat),
      lng: Number(raw.kitchen && raw.kitchen.lng),
    },
    orderRules: {
      nasiLeadDays: Number.isFinite(Number(rules.nasiLeadDays))
        ? Number(rules.nasiLeadDays)
        : 3,
      jajananLeadDays: Number.isFinite(Number(rules.jajananLeadDays))
        ? Number(rules.jajananLeadDays)
        : 1,
      maxNasiPcs: Number.isFinite(Number(rules.maxNasiPcs))
        ? Number(rules.maxNasiPcs)
        : 200,
    },
    payment: {
      cod: text(raw.payment && raw.payment.cod) || "Tunai saat pesanan tiba (COD)",
      qris: text(raw.payment && raw.payment.qris) || "QRIS / transfer (bila diminta)",
    },
    hero: {
      kicker: text(raw.hero && raw.hero.kicker),
      title: text(raw.hero && raw.hero.title),
      subtitle: text(raw.hero && raw.hero.subtitle),
      ctaPrimary: text(raw.hero && raw.hero.ctaPrimary) || "Pesan Sekarang",
      ctaSecondary: text(raw.hero && raw.hero.ctaSecondary) || "Konsultasi via WA",
      captionKicker: text(raw.hero && raw.hero.captionKicker),
      captionTitle: text(raw.hero && raw.hero.captionTitle),
    },
  };

  if (!/^62\d{8,14}$/.test(site.whatsapp)) {
    fail(`site.json: "whatsapp" harus nomor format internasional tanpa "+" (contoh 6285156175349), sekarang "${raw.whatsapp}"`);
  }
  ["open", "close"].forEach((key) => {
    if (!/^\d{2}:\d{2}$/.test(site.hours[key])) {
      fail(`site.json: "hours.${key}" harus format 24 jam HH:MM, sekarang "${site.hours[key]}"`);
    }
  });
  if (!Number.isFinite(site.freeDeliveryRadiusKm) || site.freeDeliveryRadiusKm <= 0) {
    fail(`site.json: "freeDeliveryRadiusKm" harus angka lebih dari 0`);
  }
  if (!Number.isFinite(site.kitchen.lat) || !Number.isFinite(site.kitchen.lng)) {
    fail(`site.json: "kitchen.lat" dan "kitchen.lng" harus angka`);
  }
  ["kicker", "title", "subtitle", "captionKicker", "captionTitle"].forEach((key) => {
    if (!site.hero[key]) fail(`site.json: "hero.${key}" tidak boleh kosong`);
  });
  return site;
}

function loadProducts() {
  const raw = readJson("products.json");
  const list = Array.isArray(raw) ? raw : raw.products;
  if (!Array.isArray(list) || list.length === 0) {
    fail('products.json: daftar "products" kosong atau bukan array');
  }

  const seen = new Set();
  return list.map((item, index) => {
    const where = `products[${index}]`;
    const id = text(item.id);
    if (!/^[a-z0-9-]+$/.test(id)) {
      fail(`${where}: "id" hanya boleh huruf kecil, angka, dan tanda minus (sekarang "${item.id}")`);
    }
    if (seen.has(id)) fail(`${where}: "id" ganda "${id}" — setiap produk harus unik`);
    seen.add(id);

    const name = text(item.name);
    if (!name) fail(`${where}: "name" tidak boleh kosong`);

    const category = text(item.category);
    if (!CATEGORIES.includes(category)) {
      fail(`${where}: "category" harus salah satu dari ${CATEGORIES.join(", ")} (sekarang "${item.category}")`);
    }

    const status = text(item.status) || "open";
    if (!STATUSES.includes(status)) {
      fail(`${where}: "status" harus salah satu dari ${STATUSES.join(", ")} (sekarang "${item.status}")`);
    }

    const price = Number(item.price);
    if (!Number.isFinite(price) || price < 0) {
      fail(`${where}: "price" harus angka 0 atau lebih (sekarang "${item.price}")`);
    }

    const unit = text(item.unit);
    if (!unit) fail(`${where}: "unit" tidak boleh kosong (contoh: "pcs", "10 Tusuk")`);

    const desc = text(item.desc);
    if (!desc) fail(`${where}: "desc" tidak boleh kosong`);

    let photo = slugOfPhoto(item.photo);
    if (photo && !photoExists(photo)) {
      console.warn(
        `build konten: foto "${photo}" (produk ${id}) belum ada — kartu memakai tile netral.`,
      );
      photo = "";
    }

    const out = { id, name, category, price, unit, status, photo, desc };
    if (item.seasonal === true) out.seasonal = true;
    const minQty = Number(item.minQty);
    if (Number.isFinite(minQty) && minQty > 1) out.minQty = Math.trunc(minQty);
    return out;
  });
}

function loadGallery() {
  const raw = readJson("gallery.json");
  const list = Array.isArray(raw) ? raw : raw.slides;
  if (!Array.isArray(list) || list.length === 0) {
    fail('gallery.json: daftar "slides" kosong atau bukan array');
  }

  const seen = new Set();
  return list.map((item, index) => {
    const where = `slides[${index}]`;
    const id = text(item.id) || `slide-${index + 1}`;
    if (seen.has(id)) fail(`${where}: "id" ganda "${id}"`);
    seen.add(id);

    const photo = slugOfPhoto(item.photo);
    if (!photo) fail(`${where}: "photo" wajib diisi (nama berkas foto)`);
    if (!photoExists(photo)) {
      fail(
        `${where}: foto "${photo}" tidak ditemukan. Unggah lewat /admin atau letakkan ` +
          `images/uploads/${photo}.jpg lalu jalankan npm run build.`,
      );
    }

    const title = text(item.title);
    if (!title) fail(`${where}: "title" tidak boleh kosong`);

    return {
      id,
      photo,
      kicker: text(item.kicker) || "Produk",
      title,
      caption: text(item.caption),
      alt: text(item.alt) || title,
    };
  });
}

module.exports = {
  ROOT,
  CONTENT_DIR,
  IMAGES_DIR,
  UPLOADS_DIR,
  CATEGORIES,
  STATUSES,
  fail,
  slugify,
  loadSite,
  loadProducts,
  loadGallery,
};
