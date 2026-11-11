/* ==========================================================================
   Mak Unyil — logika halaman (katalog, keranjang, jadwal, peta, galeri)
   Diekstrak dari index.html agar HTML lebih kecil dan bisa di-cache browser.
   Dimuat dengan defer, jadi seluruh DOM sudah tersedia saat skrip berjalan.
   ========================================================================== */

// Config WhatsApp Dapur Mak Unyil
const WHATSAPP_PHONE = "6285156175349";

// Versi aset gambar, dihasilkan npm run build (scripts/cache-bust.js).
// Dipakai supaya CDN tidak menyajikan foto lama selama 7 hari.
const ASSET_VERSIONS = /* @asset-versions */ {
  "images/bakmi-capcay-1200.webp": "47c5ad1925",
  "images/bakmi-capcay-600.webp": "de2c9f99b2",
  "images/daun-pisang-1200.webp": "cfd8df8385",
  "images/daun-pisang-600.webp": "2bd45e979d",
  "images/keong-fresh-1200.webp": "73343a1eb3",
  "images/keong-fresh-600.webp": "fafdf27116",
  "images/nasi-kuning-1200.webp": "90726649a9",
  "images/nasi-kuning-600.webp": "e46787f2a5",
  "images/nasi-uduk-1200.webp": "1ecf5291ec",
  "images/nasi-uduk-600.webp": "dff0378a93",
  "images/placeholder-gethuk-1200.webp": "cc6b3780b2",
  "images/placeholder-gethuk-600.webp": "bfb9d19130",
  "images/placeholder-tahu-telur-1200.webp": "39c910e1eb",
  "images/placeholder-tahu-telur-600.webp": "914031b7ec",
  "images/sate-keong-1200.webp": "34bd0daaf1",
  "images/sate-keong-600.webp": "a1bf0e349c",
  "images/sate-usus-1200.webp": "d90b9f76ad",
  "images/sate-usus-600.webp": "c5b0926de7",
  "images/tahu-sarang-1200.webp": "4af1e181e2",
  "images/tahu-sarang-600.webp": "085377adaf",
  "vendor/leaflet/leaflet.css": "a783710282",
  "vendor/leaflet/leaflet.js": "db49d009c8"
};

// Katalog Produk Mak Unyil dengan Status Stok Realistis
// status: 'available' (Tersedia), 'preorder' (Pre-Order), 'soldout' (Habis)
const PRODUCTS = [
  {
    id: "sate-keong",
    name: "Sate Keong Sawah",
    category: "sate",
    price: 10000,
    unit: "10 Tusuk",
    status: "available",
    image: "images/sate-keong-600.webp",
    imageHi: "images/sate-keong-1200.webp",
    desc: "Daging keong sawah pilihan yang kenyal empuk dengan balutan bumbu rica-rica pedas",
  },
  {
    id: "sate-usus",
    name: "Sate Usus",
    category: "sate",
    price: 10000,
    unit: "5 Tusuk",
    status: "available",
    image: "images/sate-usus-600.webp",
    imageHi: "images/sate-usus-1200.webp",
    desc: "Sate Usus Ayam dengan bumbu bacem khas Mak Unyil yang manis dan gurih",
  },
  {
    id: "oseng-keong",
    name: "Oseng Keong Pedas Cabai Hijau",
    category: "sate",
    price: 5000,
    unit: "1 porsi",
    status: "available",
    image: "images/placeholder-oseng-600.webp",
    imageHi: "images/placeholder-oseng-1200.webp",
    desc: "Dimasak oseng rempah cabai hijau pedas nampol, gurih mantap tanpa bau amis, cocok untuk lauk harian.",
  },
  {
    id: "keong-fresh",
    name: "Daging Keong Fresh Siap Olah",
    category: "khusus",
    price: 35000,
    unit: "kg",
    status: "preorder",
    image: "images/keong-fresh-600.webp",
    imageHi: "images/keong-fresh-1200.webp",
    desc: "Keong sawah diambil langsung dari alam dan telah melewati proses sortir. Daging segar yang sudah dikupas dan dicuci bersih higienis siap dimasak (Sistem Pre-Order).",
  },
  {
    id: "nasi-uduk",
    name: "Nasi Uduk",
    category: "nasi",
    price: 5000,
    unit: "pcs",
    status: "soldout",
    image: "images/nasi-uduk-600.webp",
    imageHi: "images/nasi-uduk-1200.webp",
    desc: "Nasi uduk wangi santan gurih dengan orek tempe, bihun kecap, telur suwir. Sarapan pagi mulai 5000-an",
  },
  {
    id: "nasi-kuning",
    name: "Nasi Kuning",
    category: "nasi",
    price: 10000,
    unit: "pcs",
    status: "available",
    image: "images/nasi-kuning-600.webp",
    imageHi: "images/nasi-kuning-1200.webp",
    desc: "Nasi kuning dengan lauk pendamping dengan wadah thinwall ukuran 450ml",
  },
  {
    id: "bakmi-capcay",
    name: "Bakmi Capcay",
    category: "nasi",
    price: 10000,
    unit: "pcs",
    status: "available",
    image: "images/bakmi-capcay-600.webp",
    imageHi: "images/bakmi-capcay-1200.webp",
    desc: "Bakmi dengan capcay sayur segar pas untuk sarapan atau makan siang.",
  },
  {
    id: "tahu-sarang",
    name: "Tahu Sarang Burung",
    category: "jajanan",
    price: 1000,
    unit: "pcs",
    status: "available",
    image: "images/tahu-sarang-600.webp",
    imageHi: "images/tahu-sarang-1200.webp",
    desc: "Olahan tahu lembut dicetak menyerupai sarang burung.",
  },
  {
    id: "tahu-telur",
    name: "Tahu Telur Setengah",
    category: "jajanan",
    price: 3000,
    unit: "pcs",
    status: "soldout",
    image: "images/placeholder-tahu-telur-600.webp",
    imageHi: "images/placeholder-tahu-telur-1200.webp",
    desc: "Kombinasi tahu yang dicetak ditambah telur ayam setangah pas dinikmati bersama cabai rawit hijau.",
  },
  {
    id: "getuk-crispy",
    name: "Getuk Crispy",
    category: "jajanan",
    price: 1000,
    unit: "pcs",
    status: "available",
    image: "images/placeholder-gethuk-600.webp",
    imageHi: "images/placeholder-gethuk-1200.webp",
    desc: "Singkong pulen manis berbalut lapisan luar renyah crispy dengan rasa manis didalam tanpa pemanis buatan.",
  },
  {
    id: "daun-pisang",
    name: "Daun Pisang",
    category: "khusus",
    price: 5000,
    unit: "lipat",
    status: "preorder",
    desc: "Daun pisang serbaguna untuk berbagai keperluan seperti bungkus lontong, nagasari, atau nasi berkat dan lain-lain.",
    image: "images/daun-pisang-600.webp",
    imageHi: "images/daun-pisang-1200.webp",
  },
];

let cart = {};
let selectedSchedule = null;
let selectedLocation = null;

// Map Picker Variables
let pickerMap = null;
let pickerMarker = null;
const DEFAULT_LAT = -7.752;
const DEFAULT_LNG = 110.4915;

// --- Konfigurasi operasional ---
// Satu kunci penyimpanan untuk keranjang + jadwal + titik antar + pembayaran.
const STORAGE_KEY = "makunyil_state_v1";
const MAX_QTY = 9999;

// Koordinat dapur sebagai titik awal hitung ongkir.
const KITCHEN = { lat: -7.752, lng: 110.4915 };

// Tarif ongkir berjenjang berdasarkan jarak garis lurus (haversine) dari dapur.
// Lebih dari 10 km tidak diberi harga otomatis — dikonfirmasi lewat WhatsApp.
const SHIPPING_TIERS = [
  { maxKm: 3, cost: 8000 },
  { maxKm: 6, cost: 12000 },
  { maxKm: 10, cost: 18000 },
];

const PAYMENT_LABEL = {
  cod: "Bayar di Tempat (COD)",
  qris: "QRIS / Transfer di muka",
};

let selectedPayment = "cod";

// SVG Ikon Resmi WhatsApp (Path Tajam & Terstandar)
const WA_ICON_SVG = `<svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;

function formatRupiah(num) {
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

// --- Analitik ringan tanpa pihak ketiga ---
// Event disimpan di window.__makunyilEvents dan diteruskan ke window.dataLayer
// bila ada. Untuk statistik kunjungan, aktifkan Cloudflare Web Analytics
// (lihat README). Tidak ada data pribadi yang dikirim.
function track(event, data) {
  try {
    const payload = Object.assign({ event, ts: Date.now() }, data || {});
    window.__makunyilEvents = window.__makunyilEvents || [];
    window.__makunyilEvents.push(payload);
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
    if (new URLSearchParams(location.search).has("debug")) {
      console.debug("[track]", event, data || {});
    }
  } catch (_) {
    /* pengukuran tidak boleh mengganggu halaman */
  }
}

// Direct WhatsApp: Tanya Stok Umum
function askGeneralStock() {
  const msg = `Halo Mak Unyil, mau tanya stok menu apa saja yang masih tersedia untuk hari ini ya? Terima kasih!`;
  window.open(
    `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`,
    "_blank",
    "noopener",
  );
}

// Direct WhatsApp: Tanya Stok Menu Spesifik
function askItemStock(name) {
  const msg = `Halo Mak Unyil, mau tanya apakah menu *${name}* masih tersedia untuk dipesan hari ini?`;
  window.open(
    `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`,
    "_blank",
    "noopener",
  );
}

// Render Status Badge
// Tambahkan query versi dari manifest build agar CDN tidak menyajikan foto lama.
function assetUrl(path) {
  const v = ASSET_VERSIONS[path];
  return v ? `${path}?v=${v}` : path;
}

// Thumbnail produk: pakai foto asli bila ada, atau tile netral bila foto menyusul
function productThumb(p, sizeClass) {
  if (p.image.includes("placeholder-")) {
    return `<span class="${sizeClass} rounded bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center text-stone-300" aria-hidden="true">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </span>`;
  }
  return `<img src="${assetUrl(p.image)}" alt="" width="600" height="450" class="${sizeClass} rounded object-cover border border-stone-200 shrink-0 bg-stone-100" loading="lazy" decoding="async">`;
}

function getStatusBadge(status) {
  if (status === "available") {
    return `<span class="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Tersedia
          </span>`;
  } else if (status === "preorder") {
    return `<span class="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pre-Order
          </span>`;
  } else {
    return `<span class="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Habis Hari Ini
          </span>`;
  }
}

function renderProducts(filter = "semua") {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  const filtered =
    filter === "semua"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === filter);

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="col-span-full text-center text-xs text-stone-500 py-12">Belum ada menu di kategori ini.</p>`;
    return;
  }

  filtered.forEach((p) => {
    const isSoldOut = p.status === "soldout";
    const isPlaceholder = p.image.includes("placeholder-");
    const card = document.createElement("div");
    card.className = `border border-stone-200 bg-white rounded-lg overflow-hidden flex flex-col transition group shadow-sm ${isSoldOut ? "opacity-75" : "hover:border-stone-300 hover:shadow-md"}`;

    card.innerHTML = `
    <div class="flex flex-col flex-1">
      <div class="h-44 w-full overflow-hidden bg-stone-100 relative">
        ${
          isPlaceholder
            ? `
        <div class="w-full h-full bg-gradient-to-br from-stone-100 via-white to-stone-100 flex flex-col items-center justify-center gap-1.5">
          <svg class="w-9 h-9 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span class="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Foto menyusul</span>
        </div>
        `
            : `
        <img
          src="${assetUrl(p.image)}"
          srcset="${assetUrl(p.image)} 600w, ${assetUrl(p.imageHi)} 1200w"
          sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
          width="1200"
          height="900"
          alt="${p.name}"
          class="w-full h-full object-cover transition-transform duration-500 ${isSoldOut ? "grayscale-[60%]" : "group-hover:scale-105"}"
          loading="lazy"
          decoding="async"
        >
        `
        }

        <!-- Badge Satuan -->
        <span class="absolute top-3 right-3 bg-stone-900/85 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full">
          ${p.unit}
        </span>

        <!-- Badge Status Stok di Atas Foto -->
        <div class="absolute top-3 left-3">
          ${getStatusBadge(p.status)}
        </div>
      </div>

      <div class="p-4 sm:p-5 flex-1 flex flex-col">
        <h3 class="font-serif text-lg font-bold text-stone-900 leading-snug">${p.name}</h3>
        <p class="text-stone-600 text-[13px] leading-relaxed line-clamp-3 mt-1.5">${p.desc}</p>
      </div>
    </div>

    <div class="px-4 sm:px-5 pb-4 sm:pb-5 pt-3.5 flex items-center justify-between border-t border-stone-100 gap-2">
      <div class="min-w-0">
        <span class="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold leading-none mb-1">Harga</span>
        <span class="font-serif font-bold text-stone-900 text-base leading-none">${formatRupiah(p.price)}</span>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Tombol Tanya Stok Per Item: Selaras dengan tema, hover hijau WhatsApp -->
        <button
          onclick="askItemStock('${p.name}')"
          aria-label="Tanya ketersediaan ${p.name} via WhatsApp"
          title="Tanya stok menu ini via WhatsApp"
          class="w-10 h-10 flex items-center justify-center rounded border border-stone-300 hover:border-emerald-600 bg-white hover:bg-emerald-50 text-stone-500 hover:text-emerald-700 transition shrink-0"
        >
          <svg class="w-[18px] h-[18px] fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </button>

        <!-- Tombol Tambah / Habis -->
        ${
          isSoldOut
            ? `
          <button disabled class="h-10 text-xs uppercase font-bold tracking-wider px-4 bg-stone-100 text-stone-400 border border-stone-200 rounded cursor-not-allowed shrink-0">
            Habis
          </button>
        `
            : `
          <button onclick="addToCart('${p.id}')" class="h-10 text-xs uppercase font-bold tracking-wider px-4 bg-stone-900 text-white hover:bg-stone-700 rounded transition active:scale-95 shrink-0">
            + Tambah
          </button>
        `
        }
      </div>
    </div>
  `;
    grid.appendChild(card);
  });
}

function filterCategory(cat, btn) {
  document.querySelectorAll(".filter-pill").forEach((pill) => {
    pill.classList.remove("bg-stone-900", "text-white", "border-stone-900");
    pill.classList.add("border-stone-300", "text-stone-600");
    pill.setAttribute("aria-pressed", "false");
  });
  const active = btn || document.querySelector(".filter-pill");
  active.classList.add("bg-stone-900", "text-white", "border-stone-900");
  active.classList.remove("border-stone-300", "text-stone-600");
  active.setAttribute("aria-pressed", "true");
  renderProducts(cat);
}

// --- Minimal order per produk ---
function minQtyOf(product) {
  const min = parseInt(product && product.minQty, 10);
  return Number.isFinite(min) && min > 1 ? min : 1;
}

function minQtyText(product) {
  const min = minQtyOf(product);
  return `${min} ${product.minUnit || displayUnit(product)}`;
}

// Label satuan tanpa embel-embel "(Min. 15)" supaya tidak dobel di baris harga.
function displayUnit(product) {
  return String(product.unit || "")
    .replace(/\s*\(min\.?\s*\d+\)/i, "")
    .trim();
}

function addToCart(id) {
  const item = PRODUCTS.find((p) => p.id === id);
  if (!item) return;
  if (item.status === "soldout") {
    alert("Maaf, menu ini sedang habis untuk hari ini.");
    return;
  }
  const min = minQtyOf(item);
  const current = cart[id] || 0;
  if (current === 0 && min > 1) {
    cart[id] = min;
    showCartNotice(
      `${item.name} minimal ${minQtyText(item)}. Jumlah sudah diisi otomatis.`,
    );
  } else {
    cart[id] = Math.min(current + 1, MAX_QTY);
  }
  updateCartUI();
  openCart();
  track("add_to_cart", { id: id, qty: cart[id] });
}

// Ubah kuantitas dengan tombol +/-
function changeQty(id, delta) {
  const item = PRODUCTS.find((p) => p.id === id);
  if (!item || !cart[id]) return;
  const min = minQtyOf(item);
  const next = cart[id] + delta;
  if (next < min) {
    if (next <= 0) {
      delete cart[id];
    } else {
      cart[id] = min;
      showCartNotice(
        `${item.name} minimal ${minQtyText(item)}. Jumlah dikembalikan ke ${min}.`,
      );
    }
  } else {
    cart[id] = Math.min(next, MAX_QTY);
  }
  updateCartUI();
}

// Input kuantitas manual
function updateQtyManual(id, value) {
  const item = PRODUCTS.find((p) => p.id === id);
  if (!item) return;
  const min = minQtyOf(item);
  const parsed = Math.floor(Number(value));

  if (!Number.isFinite(parsed) || parsed <= 0) {
    if (min > 1) {
      cart[id] = min;
      showCartNotice(
        `${item.name} minimal ${minQtyText(item)}. Jumlah tidak boleh kosong.`,
      );
    } else {
      delete cart[id];
    }
  } else if (parsed < min) {
    cart[id] = min;
    showCartNotice(
      `${item.name} minimal ${minQtyText(item)}. Jumlah disesuaikan ke ${min}.`,
    );
  } else {
    cart[id] = Math.min(parsed, MAX_QTY);
  }
  updateCartUI();
}

// Hapus menu dari keranjang checkout
function removeFromCart(id) {
  if (cart[id]) {
    delete cart[id];
    updateCartUI();
  }
}

// --- Ongkir & total ---
function haversineKm(a, b) {
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function getShipping() {
  if (!selectedLocation) {
    return {
      km: null,
      cost: null,
      label: "Pilih titik lokasi antar untuk melihat estimasi ongkir.",
    };
  }
  const km = haversineKm(KITCHEN, {
    lat: Number(selectedLocation.lat),
    lng: Number(selectedLocation.lng),
  });
  if (km <= 0.5) {
    return {
      km: km,
      cost: 0,
      label: "Titik di dapur — ambil sendiri, tanpa ongkir.",
    };
  }
  const tier = SHIPPING_TIERS.find((t) => km <= t.maxKm);
  if (!tier) {
    return {
      km: km,
      cost: null,
      label: `± ${km.toFixed(1)} km dari dapur — ongkir di luar 10 km dikonfirmasi lewat WhatsApp.`,
    };
  }
  return {
    km: km,
    cost: tier.cost,
    label: `± ${km.toFixed(1)} km dari dapur, tarif datar ${formatRupiah(tier.cost)}.`,
  };
}

function cartTotals() {
  let qty = 0;
  let subtotal = 0;
  Object.keys(cart).forEach((id) => {
    const item = PRODUCTS.find((p) => p.id === id);
    if (!item) return;
    qty += cart[id];
    subtotal += item.price * cart[id];
  });
  const ship = getShipping();
  return {
    qty: qty,
    subtotal: subtotal,
    ship: ship,
    total: subtotal + (ship.cost || 0),
  };
}

function updateTotals() {
  const t = cartTotals();
  const subEl = document.getElementById("cart-subtotal");
  const shipEl = document.getElementById("cart-shipping");
  const noteEl = document.getElementById("cart-shipping-note");
  const totalEl = document.getElementById("cart-total");

  if (subEl) subEl.innerText = formatRupiah(t.subtotal);
  if (shipEl) {
    shipEl.innerText =
      t.ship.cost == null
        ? selectedLocation
          ? "Konfirmasi"
          : "—"
        : formatRupiah(t.ship.cost);
  }
  if (noteEl) noteEl.innerText = t.ship.label;
  if (totalEl) {
    totalEl.innerText =
      t.ship.cost == null
        ? `${formatRupiah(t.subtotal)} + ongkir`
        : formatRupiah(t.total);
  }
}

// --- Pemberitahuan singkat di dalam keranjang ---
let cartNoticeTimer = null;

function showCartNotice(message) {
  const el = document.getElementById("cart-notice");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
  clearTimeout(cartNoticeTimer);
  cartNoticeTimer = setTimeout(() => el.classList.add("hidden"), 6000);
}

// --- Simpan / pulihkan state (localStorage) ---
function saveState() {
  try {
    const nameEl = document.getElementById("cust-name");
    const noteEl = document.getElementById("cust-note");
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        cart: cart,
        schedule: selectedSchedule,
        location: selectedLocation,
        payment: selectedPayment,
        name: nameEl ? nameEl.value.slice(0, 80) : "",
        note: noteEl ? noteEl.value.slice(0, 400) : "",
      }),
    );
  } catch (_) {
    /* mode privat / kuota penuh — keranjang tetap jalan di memori */
  }
}

function loadState() {
  let data = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) data = JSON.parse(raw);
  } catch (_) {
    data = null;
  }
  if (!data || typeof data !== "object") return;

  // Keranjang: buang id tak dikenal, qty tidak valid, dan menu yang sudah habis.
  const dropped = [];
  if (data.cart && typeof data.cart === "object") {
    Object.keys(data.cart).forEach((id) => {
      const item = PRODUCTS.find((p) => p.id === id);
      const qty = Math.floor(Number(data.cart[id]));
      if (!item || !Number.isFinite(qty) || qty < 1) return;
      if (item.status === "soldout") {
        dropped.push(item.name);
        return;
      }
      cart[id] = Math.min(qty, MAX_QTY);
    });
  }

  // Pastikan minimal order tetap terpenuhi setelah state dipulihkan.
  Object.keys(cart).forEach((id) => {
    const item = PRODUCTS.find((p) => p.id === id);
    if (!item) return;
    const min = minQtyOf(item);
    if (cart[id] < min) cart[id] = min;
  });

  if (typeof data.schedule === "string" && data.schedule) {
    selectedSchedule = data.schedule;
    const el = document.getElementById("schedule-display");
    if (el) {
      el.innerHTML = `<span class="font-semibold text-stone-900">🗓️ ${selectedSchedule}</span>`;
    }
  }

  if (
    data.location &&
    Number.isFinite(Number(data.location.lat)) &&
    Number.isFinite(Number(data.location.lng))
  ) {
    selectedLocation = {
      lat: Number(data.location.lat).toFixed(5),
      lng: Number(data.location.lng).toFixed(5),
    };
    renderLocationDisplay();
  }

  if (data.payment === "qris" || data.payment === "cod") {
    setPaymentMethod(data.payment, false);
  }

  const nameEl = document.getElementById("cust-name");
  const noteEl = document.getElementById("cust-note");
  if (nameEl && typeof data.name === "string") nameEl.value = data.name;
  if (noteEl && typeof data.note === "string") noteEl.value = data.note;

  if (dropped.length) {
    setTimeout(() => {
      showCartNotice(
        `Menu yang sudah habis dihapus dari keranjang: ${dropped.join(", ")}.`,
      );
    }, 600);
  }
}

function continueShopping() {
  closeCart();
  const katalog = document.getElementById("katalog");
  if (katalog) {
    katalog.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function updateCartUI() {
  const container = document.getElementById("cart-items");
  const badge = document.getElementById("cart-count");
  const totalEl = document.getElementById("cart-total");

  container.innerHTML = "";
  let totalQty = 0;
  let totalPrice = 0;

  const itemIds = Object.keys(cart);

  if (itemIds.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 px-4">
        <div class="w-12 h-12 rounded-full bg-stone-200 text-stone-600 mx-auto flex items-center justify-center text-xl mb-3" aria-hidden="true">🛒</div>
        <p class="text-sm font-bold text-stone-900">Keranjang masih kosong</p>
        <p class="text-xs text-stone-600 mt-1 mb-5 leading-relaxed max-w-xs mx-auto">Silakan pilih olahan keong sawah, aneka nasi gurih, atau jajanan pasar di katalog.</p>
        <button
          type="button"
          onclick="continueShopping()"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded transition shadow-sm"
        >
          <span>+ Lihat & Pilih Menu</span>
        </button>
      </div>
    `;
  } else {
    itemIds.forEach((id) => {
      const item = PRODUCTS.find((p) => p.id === id);
      if (!item) return;

      const qty = cart[id];
      const subtotal = item.price * qty;
      const minQty = minQtyOf(item);
      totalQty += qty;
      totalPrice += subtotal;

      const row = document.createElement("div");
      row.className = "border-b border-stone-200 pb-3.5";
      row.innerHTML = `
      <div class="flex items-start gap-2.5">
        ${productThumb(item, "w-12 h-12")}
        <div class="min-w-0 flex-1">
          <h4 class="text-sm font-bold text-stone-900 leading-snug">${item.name}</h4>
          <p class="text-xs text-stone-700 font-medium mt-0.5">${formatRupiah(item.price)} / ${displayUnit(item)}</p>
          ${minQty > 1 ? `<span class="inline-block mt-1 text-[11px] font-semibold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300">Minimal ${minQtyText(item)}</span>` : ""}
        </div>

        <!-- Tombol Hapus Menu -->
        <button onclick="removeFromCart('${id}')" aria-label="Hapus ${item.name} dari keranjang" title="Hapus menu dari keranjang" class="w-10 h-10 -mt-1.5 -mr-2 shrink-0 flex items-center justify-center text-stone-400 hover:text-rose-600 rounded transition">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
        </button>
      </div>

      <!-- Controller Kuantitas (Tombol +/- & Input Manual) -->
      <div class="flex items-center justify-between gap-2 mt-2 pl-[3.625rem]">
        <div class="flex items-center border border-stone-300 rounded bg-white shadow-sm">
          <button onclick="changeQty('${id}', -1)" aria-label="Kurangi jumlah ${item.name}" class="w-10 h-10 flex items-center justify-center text-base font-bold text-stone-700 hover:bg-stone-100 rounded-l transition">−</button>
          <input
            type="number"
            min="1"
            inputmode="numeric"
            value="${qty}"
            aria-label="Jumlah ${item.name}"
            onchange="updateQtyManual('${id}', this.value)"
            class="w-10 h-10 text-center text-xs font-bold text-stone-900 focus:outline-none bg-transparent"
          >
          <button onclick="changeQty('${id}', 1)" aria-label="Tambah jumlah ${item.name}" class="w-10 h-10 flex items-center justify-center text-base font-bold text-stone-700 hover:bg-stone-100 rounded-r transition">+</button>
        </div>

        <span class="text-sm font-bold text-stone-900 tabular-nums">${formatRupiah(subtotal)}</span>
      </div>
    `;
      container.appendChild(row);
    });

    // Ajakan satu tombol: tutup keranjang lalu arahkan ke katalog produk
    const addSection = document.createElement("div");
    addSection.className = "mt-5 pt-4 border-t border-stone-200";
    addSection.innerHTML = `
      <button
        type="button"
        onclick="continueShopping()"
        class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded transition shadow-sm active:scale-[0.98]"
      >
        <span aria-hidden="true">+</span>
        <span>Tambah Menu Lain</span>
      </button>
      <p class="text-[11px] text-stone-500 text-center mt-2 leading-relaxed">
        Keranjang ditutup dan Anda diarahkan ke katalog produk.
      </p>
    `;
    container.appendChild(addSection);
  }

  badge.innerText = totalQty;
  badge.setAttribute("aria-label", totalQty + " item di keranjang");
  totalEl.innerText = formatRupiah(totalPrice);
  updateTotals();
  saveState();
}

// --- Bantuan aksesibilitas modal: inert saat tertutup + kembalikan fokus ---
let lastFocusedEl = null;

function showModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  lastFocusedEl =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  el.removeAttribute("inert");
  el.classList.remove("opacity-0", "pointer-events-none");
}

function hideModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("opacity-0", "pointer-events-none");
  el.setAttribute("inert", "");
  if (lastFocusedEl && document.contains(lastFocusedEl)) {
    lastFocusedEl.focus({ preventScroll: true });
  }
  lastFocusedEl = null;
}

function openCart() {
  const panel = document.getElementById("cart-panel");
  showModal("cart-drawer");
  panel.classList.remove("translate-x-full");
  const closeBtn = document.getElementById("close-cart-btn");
  if (closeBtn) closeBtn.focus({ preventScroll: true });
}

function closeCart() {
  const panel = document.getElementById("cart-panel");
  panel.classList.add("translate-x-full");
  hideModal("cart-drawer");
}

document.getElementById("open-cart-btn").addEventListener("click", openCart);
document.getElementById("close-cart-btn").addEventListener("click", closeCart);
document.getElementById("cart-drawer").addEventListener("click", (e) => {
  if (e.target.id === "cart-drawer") closeCart();
});

// Jam operasional dapur, dipakai untuk validasi input type="time".
const KITCHEN_OPEN_MIN = 6 * 60; // 06:00
const KITCHEN_CLOSE_MIN = 18 * 60; // 18:00

function timeToMinutes(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec((value || "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function normalizeOrderTime(value) {
  const total = timeToMinutes(value);
  if (total == null) return null;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

// Input type="time" mengikuti locale perangkat (bisa tampil "11:00 AM" di
// browser berbahasa Inggris). Nilainya selalu 24 jam, jadi di bawah field
// ditampilkan penegasan 24 jam supaya tidak ada salah baca.
function updateOrderTimeEcho() {
  const input = document.getElementById("order-time");
  const echo = document.getElementById("order-time-echo");
  if (!input || !echo) return;
  const time = normalizeOrderTime(input.value);
  echo.textContent = time ? ` · dipilih ${time} WIB` : "";
}

// Schedule Modal Handler
function openScheduleModal() {
  const dateInput = document.getElementById("order-date");
  const timeInput = document.getElementById("order-time");

  // Tanggal hari ini menurut WIB (UTC+7), bukan UTC
  const todayWib = new Date(Date.now() + 7 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  dateInput.min = todayWib;
  if (!dateInput.value) dateInput.value = todayWib;

  // Field jam kembali memakai input type="time" native. Atribut min/max hanya
  // membatasi picker, bukan nilai yang diketik manual, jadi rentang 06:00-18:00
  // tetap divalidasi di saveSchedule().
  if (!timeInput.value) timeInput.value = "11:00";
  updateOrderTimeEcho();

  showModal("schedule-modal");
  dateInput.focus({ preventScroll: true });
}

function closeScheduleModal() {
  hideModal("schedule-modal");
}

function saveSchedule() {
  const dateVal = document.getElementById("order-date").value;
  const timeVal = document.getElementById("order-time").value;

  if (!dateVal) {
    alert("Pilih tanggal pengiriman terlebih dahulu!");
    return;
  }

  const normalizedTime = normalizeOrderTime(timeVal);
  if (!normalizedTime) {
    alert("Pilih jam pengantaran dulu (format 24 jam, contoh 14:30).");
    return;
  }

  const minutes = timeToMinutes(normalizedTime);
  if (minutes < KITCHEN_OPEN_MIN || minutes > KITCHEN_CLOSE_MIN) {
    alert("Jam pengantaran hanya tersedia 06:00–18:00 WIB.");
    return;
  }

  const [yy, mm, dd] = dateVal.split("-").map(Number);
  const formattedDate = new Date(yy, mm - 1, dd).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  selectedSchedule = `${formattedDate}, pukul ${normalizedTime} WIB`;
  document.getElementById("schedule-display").innerHTML =
    `<span class="font-semibold text-stone-900">🗓️ ${selectedSchedule}</span>`;
  saveState();
  track("schedule_set", { schedule: selectedSchedule });
  closeScheduleModal();
}

// ---- Leaflet on-demand -----------------------------------------------------
// Peta hanya dipakai di modal pemilih titik pengantaran, jadi Leaflet (±45 KB
// gzip CSS+JS) tidak dimuat saat halaman dibuka. loadLeaflet() menyuntikkan
// asetnya sekali saja, lalu Promise-nya dipakai ulang untuk buka-tutup modal.
const LEAFLET_CSS = "vendor/leaflet/leaflet.css";
const LEAFLET_JS = "vendor/leaflet/leaflet.js";
let leafletPromise = null;

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet-css="1"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = assetUrl(LEAFLET_CSS);
      link.dataset.leafletCss = "1";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = assetUrl(LEAFLET_JS);
    script.async = true;
    script.onload = () => {
      if (!window.L) {
        reject(new Error("Leaflet gagal diinisialisasi"));
        return;
      }
      // Path ikon marker default (dulu di-set di <head>, tidak bisa lagi karena
      // Leaflet baru ada setelah modal peta dibuka).
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/vendor/leaflet/images/marker-icon-2x.png",
        iconUrl: "/vendor/leaflet/images/marker-icon.png",
        shadowUrl: "/vendor/leaflet/images/marker-shadow.png",
      });
      resolve(window.L);
    };
    script.onerror = () => reject(new Error("Aset Leaflet tidak dapat dimuat"));
    document.body.appendChild(script);
  }).catch((err) => {
    leafletPromise = null; // biar percobaan berikutnya boleh ulang
    throw err;
  });

  return leafletPromise;
}

function showMapLoading(visible) {
  const el = document.getElementById("map-loading");
  if (el) el.classList.toggle("hidden", !visible);
}

function showMapError(visible) {
  const el = document.getElementById("map-error-note");
  if (el) el.classList.toggle("hidden", !visible);
}

function syncGoogleMapsLink(lat, lng) {
  const link = document.getElementById("map-gmaps-link");
  if (link) {
    link.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
}

// Map Picker Handlers
async function openMapPickerModal() {
  showModal("map-picker-modal");

  const targetLat = selectedLocation
    ? parseFloat(selectedLocation.lat)
    : DEFAULT_LAT;
  const targetLng = selectedLocation
    ? parseFloat(selectedLocation.lng)
    : DEFAULT_LNG;

  updateCoordsDisplay(targetLat, targetLng);

  if (pickerMap) {
    showMapLoading(false);
    setTimeout(() => {
      pickerMap.invalidateSize();
      pickerMap.setView([targetLat, targetLng], 15);
      pickerMarker.setLatLng([targetLat, targetLng]);
    }, 200);
    return;
  }

  showMapLoading(true);
  showMapError(false);

  try {
    await loadLeaflet();
  } catch (err) {
    console.error("Gagal memuat peta:", err);
    showMapLoading(false);
    showMapError(true);
    return;
  }

  // Pengguna mungkin sudah menutup modal selagi aset dimuat.
  if (document.getElementById("map-picker-modal").hasAttribute("inert")) {
    showMapLoading(false);
    return;
  }

  if (!pickerMap) {
    pickerMap = L.map("picker-map", {
      center: [targetLat, targetLng],
      zoom: 15,
    });

    const tiles = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        attribution:
          'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      },
    ).addTo(pickerMap);

    // Kalau tile diblokir ISP/jaringan, jangan tampilkan peta abu-abu kosong
    // tanpa penjelasan: beri catatan + tautan Google Maps.
    let tileErrors = 0;
    tiles.on("tileerror", () => {
      tileErrors += 1;
      if (tileErrors >= 3) showMapError(true);
    });
    tiles.on("tileload", () => {
      tileErrors = 0;
      showMapError(false);
    });

    pickerMarker = L.marker([targetLat, targetLng], {
      draggable: true,
    }).addTo(pickerMap);

    pickerMarker.on("dragend", function (e) {
      const pos = e.target.getLatLng();
      updateCoordsDisplay(pos.lat, pos.lng);
    });

    pickerMap.on("click", function (e) {
      pickerMarker.setLatLng(e.latlng);
      updateCoordsDisplay(e.latlng.lat, e.latlng.lng);
    });
  } else {
    pickerMap.setView([targetLat, targetLng], 15);
    pickerMarker.setLatLng([targetLat, targetLng]);
  }

  setTimeout(() => {
    pickerMap.invalidateSize();
    showMapLoading(false);
  }, 150);
}

function closeMapPickerModal() {
  hideModal("map-picker-modal");
}

function updateCoordsDisplay(lat, lng, accuracyMeters) {
  const accuracy =
    accuracyMeters != null
      ? ` · akurasi ± ${
          accuracyMeters >= 1000
            ? `${(accuracyMeters / 1000).toFixed(1)} km`
            : `${Math.round(accuracyMeters)} m`
        }`
      : "";
  document.getElementById("pin-coords-text").innerText =
    `Titik: ${lat.toFixed(5)}, ${lng.toFixed(5)}${accuracy}`;
  syncGoogleMapsLink(lat.toFixed(5), lng.toFixed(5));
}

// Perkiraan lokasi berbasis jaringan/IP (bukan GPS) sering keluar di kota lain
// — di desktop, Chrome/Firefox bisa melaporkan titik Jakarta meski pengguna di
// Klaten. Titik yang jauh dari jangkauan antar atau berakurasi sangat kasar
// dianggap tidak layak dipakai untuk menghitung ongkir.
const MAX_PLAUSIBLE_KM = 40; // jangkauan antar realistis Klaten – Jogja
const MAX_PLAUSIBLE_ACCURACY_M = 5000;

function locateCurrentPosition() {
  if (!navigator.geolocation) {
    alert("Browser Anda belum mendukung fitur GPS lokasi.");
    return;
  }

  const btn = document.getElementById("locate-btn");
  const label = btn ? btn.querySelector("span") : null;
  const originalLabel = label ? label.textContent : "";

  const restoreButton = () => {
    if (btn) btn.disabled = false;
    if (label) label.textContent = originalLabel;
  };

  if (btn) btn.disabled = true;
  if (label) label.textContent = "Mencari…";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      restoreButton();

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;
      const km = haversineKm(KITCHEN, { lat, lng });

      if (km > MAX_PLAUSIBLE_KM || accuracy > MAX_PLAUSIBLE_ACCURACY_M) {
        alert(
          `Perangkat Anda melaporkan titik ± ${km.toFixed(
            0,
          )} km dari dapur dengan akurasi ± ${
            accuracy >= 1000
              ? `${(accuracy / 1000).toFixed(1)} km`
              : `${Math.round(accuracy)} m`
          }.\n\n` +
            "Kemungkinan itu perkiraan dari jaringan internet/WiFi, bukan GPS — biasa terjadi di komputer desktop.\n\n" +
            "Pin tidak dipindahkan. Silakan ketik nama jalan/kelurahan di kotak pencarian, atau geser pin langsung pada peta.",
        );
        return;
      }

      if (pickerMap && pickerMarker) {
        pickerMap.setView([lat, lng], 16);
        pickerMarker.setLatLng([lat, lng]);
        updateCoordsDisplay(lat, lng, accuracy);
      }
    },
    (err) => {
      restoreButton();
      const messages = {
        1: "Izin lokasi ditolak. Aktifkan izin lokasi untuk situs ini di browser, atau geser pin manual pada peta.",
        2: "Lokasi perangkat tidak tersedia. Coba lagi, atau geser pin manual pada peta.",
        3: "Pencarian lokasi melebihi batas waktu. Coba lagi, atau geser pin manual pada peta.",
      };
      alert(
        messages[err.code] ||
          "Tidak dapat mengakses GPS. Silakan gunakan kotak pencarian atau geser pin manual pada peta.",
      );
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
  );
}

// ---- Pencarian lokasi (Photon) --------------------------------------------
// Nominatim OSM melarang pemakaian untuk autocomplete/typeahead (maks 1 req/dtk),
// jadi pencarian dialihkan ke Photon (komoot) yang dirancang untuk
// search-as-you-type. Query dibias ke titik dapur agar nama tempat lokal
// (masjid, perumahan, kelurahan) tidak melompat ke kota lain.
const PHOTON_ENDPOINT = "https://photon.komoot.io/api/";
const locationSearchCache = new Map();
let searchDebounceTimer = null;
let searchAbortController = null;

function photonSearch(query, limit, signal) {
  const cacheKey = `${limit}|${query.toLowerCase()}`;
  if (locationSearchCache.has(cacheKey)) {
    return Promise.resolve(locationSearchCache.get(cacheKey));
  }

  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    // Photon hanya mendukung lang default/de/en/fr — jangan kirim lang=id (HTTP 400).
    // Nama tempat tetap mengikuti data OSM, dan hasil dibias ke titik dapur.
    lat: String(DEFAULT_LAT),
    lon: String(DEFAULT_LNG),
  });

  return fetch(`${PHOTON_ENDPOINT}?${params.toString()}`, {
    signal,
    headers: { Accept: "application/json" },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Photon HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      const items = (data.features || []).map((feature) => {
        const p = feature.properties || {};
        const detail = [p.street, p.district, p.city, p.state]
          .filter(Boolean)
          .filter((part, idx, arr) => arr.indexOf(part) === idx)
          .join(", ");
        return {
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0],
          name: p.name || p.street || p.city || "Lokasi",
          detail,
        };
      });
      locationSearchCache.set(cacheKey, items);
      if (locationSearchCache.size > 80) {
        locationSearchCache.delete(locationSearchCache.keys().next().value);
      }
      return items;
    });
}

function renderSearchResults(items, suggestionsBox) {
  if (!items.length) {
    suggestionsBox.innerHTML = `<div class="p-2.5 text-stone-400 text-center text-[11px]">Tidak ada rekomendasi alamat ditemukan</div>`;
    suggestionsBox.classList.remove("hidden");
    return;
  }

  suggestionsBox.innerHTML = "";
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className =
      "p-2.5 hover:bg-stone-100 cursor-pointer flex items-start gap-2 transition";

    const pin = document.createElement("span");
    pin.className = "text-stone-400 mt-0.5 shrink-0";
    pin.textContent = "📍";

    const wrap = document.createElement("div");
    wrap.className = "min-w-0 flex-1";
    const title = document.createElement("p");
    title.className =
      "font-semibold text-stone-800 text-[11px] truncate leading-tight";
    title.textContent = item.name;
    const sub = document.createElement("p");
    sub.className = "text-[10px] text-stone-500 truncate leading-snug";
    sub.textContent = item.detail;
    wrap.append(title, sub);

    row.append(pin, wrap);
    row.onclick = () => selectSuggestedLocation(item);
    suggestionsBox.appendChild(row);
  });
  suggestionsBox.classList.remove("hidden");
}

function handleSearchInput(query) {
  clearTimeout(searchDebounceTimer);
  const suggestionsBox = document.getElementById("search-suggestions");
  const cleanQuery = query.trim();

  if (cleanQuery.length < 3) {
    suggestionsBox.classList.add("hidden");
    suggestionsBox.innerHTML = "";
    return;
  }

  searchDebounceTimer = setTimeout(async () => {
    if (searchAbortController) searchAbortController.abort();
    searchAbortController = new AbortController();

    // Photon butuh ~1-3 detik dari jaringan Indonesia; beri tanda sedang mencari
    // supaya kotak saran tidak terasa kosong/rusak.
    suggestionsBox.innerHTML = `<div class="p-2.5 text-stone-400 text-center text-[11px]">Mencari lokasi…</div>`;
    suggestionsBox.classList.remove("hidden");

    try {
      const items = await photonSearch(
        cleanQuery,
        5,
        searchAbortController.signal,
      );
      renderSearchResults(items, suggestionsBox);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Gagal memuat rekomendasi lokasi:", err);
      suggestionsBox.innerHTML = `<div class="p-2.5 text-stone-400 text-center text-[11px]">Pencarian lokasi sedang tidak tersedia. Geser pin manual atau pakai tombol Lokasi Saya.</div>`;
      suggestionsBox.classList.remove("hidden");
    }
  }, 400);
}

function selectSuggestedLocation(item) {
  const lat = parseFloat(item.lat);
  const lon = parseFloat(item.lon);

  document.getElementById("map-search-input").value = item.name;
  const suggestionsBox = document.getElementById("search-suggestions");
  suggestionsBox.classList.add("hidden");
  suggestionsBox.innerHTML = "";

  if (pickerMap && pickerMarker) {
    pickerMap.flyTo([lat, lon], 16, { duration: 1.2 });
    pickerMarker.setLatLng([lat, lon]);
    updateCoordsDisplay(lat, lon);
  }
}

async function searchLocationManual() {
  const searchInput = document.getElementById("map-search-input");
  const query = searchInput.value.trim();
  const suggestionsBox = document.getElementById("search-suggestions");
  suggestionsBox.classList.add("hidden");

  if (!query) {
    alert("Masukkan kata kunci nama lokasi atau alamat!");
    return;
  }

  const searchBtn = document.getElementById("search-action-btn");
  const originalText = searchBtn.innerText;
  searchBtn.innerText = "...";
  searchBtn.disabled = true;

  try {
    const items = await photonSearch(query, 1);
    if (items.length) {
      const { lat, lon } = items[0];
      if (pickerMap && pickerMarker) {
        pickerMap.flyTo([lat, lon], 16, { duration: 1.2 });
        pickerMarker.setLatLng([lat, lon]);
        updateCoordsDisplay(lat, lon);
      }
    } else {
      alert(
        "Lokasi tidak ditemukan. Coba masukkan nama tempat yang lebih spesifik.",
      );
    }
  } catch (err) {
    console.error("Pencarian lokasi gagal:", err);
    alert("Gagal melakukan pencarian lokasi. Periksa koneksi internet Anda.");
  } finally {
    searchBtn.innerText = originalText;
    searchBtn.disabled = false;
  }
}

document.addEventListener("click", (e) => {
  const searchBox = document.getElementById("map-search-input");
  const suggestions = document.getElementById("search-suggestions");
  if (
    suggestions &&
    !suggestions.contains(e.target) &&
    e.target !== searchBox
  ) {
    suggestions.classList.add("hidden");
  }
});

function renderLocationDisplay() {
  const el = document.getElementById("map-point-display");
  if (!el) return;
  if (!selectedLocation) {
    el.textContent = "Belum ada titik peta";
    return;
  }
  const ship = getShipping();
  const distance = ship.km != null ? ` · ± ${ship.km.toFixed(1)} km` : "";
  el.innerHTML = `<span class="text-stone-900 font-semibold truncate">📍 ${selectedLocation.lat}, ${selectedLocation.lng}${distance}</span>`;
}

function setPaymentMethod(method, persist) {
  selectedPayment = method === "qris" ? "qris" : "cod";

  document.querySelectorAll('input[name="payment-method"]').forEach((radio) => {
    radio.checked = radio.value === selectedPayment;
  });

  const hint = document.getElementById("payment-hint");
  if (hint) {
    hint.textContent =
      selectedPayment === "qris"
        ? "Kode QRIS dikirim lewat WhatsApp setelah pesanan dikonfirmasi."
        : "Bayar tunai saat pesanan diterima.";
  }

  if (persist !== false) {
    saveState();
    track("payment_select", { method: selectedPayment });
  }
}

function confirmSelectedLocation() {
  if (pickerMarker) {
    const pos = pickerMarker.getLatLng();
    selectedLocation = {
      lat: pos.lat.toFixed(5),
      lng: pos.lng.toFixed(5),
    };
    renderLocationDisplay();
    updateTotals();
    saveState();
    const ship = getShipping();
    track("location_set", {
      km: ship.km != null ? Number(ship.km.toFixed(2)) : null,
      shipping: ship.cost,
    });
  }
  closeMapPickerModal();
}

// Checkout ke WhatsApp Generator
function checkoutWhatsApp() {
  const itemIds = Object.keys(cart);
  if (itemIds.length === 0) {
    alert("Keranjang masih kosong, pilih sajian dulu ya!");
    return;
  }

  // Pastikan minimal order terpenuhi sebelum pesan dikirim.
  const belowMin = itemIds.find((id) => {
    const item = PRODUCTS.find((p) => p.id === id);
    return item && cart[id] < minQtyOf(item);
  });
  if (belowMin) {
    const item = PRODUCTS.find((p) => p.id === belowMin);
    cart[belowMin] = minQtyOf(item);
    updateCartUI();
    showCartNotice(
      `${item.name} minimal ${minQtyText(item)}. Jumlah sudah disesuaikan.`,
    );
    return;
  }

  const name = document.getElementById("cust-name").value.trim() || "Pelanggan";
  const note = document.getElementById("cust-note").value.trim() || "-";
  const schedule = selectedSchedule || "Kirim segera / hari ini";
  const ship = getShipping();
  const totals = cartTotals();

  const lines = [];
  lines.push("Halo Mak Unyil, saya mau pesan makanan:");
  lines.push("");
  lines.push(`*Nama:* ${name}`);
  lines.push(`*Jadwal:* ${schedule}`);

  if (selectedLocation) {
    const mapsUrl = `https://maps.google.com/?q=${selectedLocation.lat},${selectedLocation.lng}`;
    lines.push(`*Titik Google Maps:* ${mapsUrl}`);
    if (ship.km != null) {
      lines.push(`*Jarak dari dapur:* ± ${ship.km.toFixed(1)} km`);
    }
  } else {
    lines.push("*Titik Google Maps:* (belum disematkan)");
  }

  lines.push(`*Patokan / Alamat:* ${note}`);
  lines.push(`*Pembayaran:* ${PAYMENT_LABEL[selectedPayment]}`);
  lines.push("");
  lines.push("*Rincian Pesanan:*");

  itemIds.forEach((id, idx) => {
    const item = PRODUCTS.find((p) => p.id === id);
    const qty = cart[id];
    lines.push(
      `${idx + 1}. ${item.name} — ${qty} ${displayUnit(item)} = ${formatRupiah(item.price * qty)}`,
    );
  });

  lines.push("");
  lines.push(`*Subtotal:* ${formatRupiah(totals.subtotal)}`);
  lines.push(
    `*Ongkir:* ${
      ship.cost == null
        ? selectedLocation
          ? "konfirmasi lewat WhatsApp (di luar 10 km)"
          : "belum dihitung"
        : formatRupiah(ship.cost)
    }`,
  );
  lines.push(
    `*Total Perkiraan:* ${
      ship.cost == null
        ? `${formatRupiah(totals.subtotal)} + ongkir`
        : formatRupiah(totals.total)
    }`,
  );

  if (selectedPayment === "qris") {
    lines.push("");
    lines.push("Mohon dikirim kode QRIS-nya ya Mak.");
  }

  lines.push("");
  lines.push("Mohon konfirmasi ketersediaan menu dan ongkirnya. Terima kasih!");

  track("checkout_click", {
    items: itemIds.length,
    subtotal: totals.subtotal,
    shipping: ship.cost,
    payment: selectedPayment,
  });

  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
  window.open(url, "_blank", "noopener");
}

// Gallery Slider Handler
function scrollGallery(direction) {
  const track = document.getElementById("gallery-track");
  const cardWidth = track.querySelector("div").offsetWidth + 20;
  track.scrollBy({
    left: direction * cardWidth * 1.5,
    behavior: "smooth",
  });
}

// Gallery Lightbox Modal Handler
function openLightbox(imageUrl, title, tag, desc) {
  const imgEl = document.getElementById("lightbox-img");
  const titleEl = document.getElementById("lightbox-title");
  const tagEl = document.getElementById("lightbox-tag");
  const descEl = document.getElementById("lightbox-desc");

  imgEl.src = imageUrl;
  titleEl.innerText = title;
  tagEl.innerText = tag;
  descEl.innerText = desc || "";

  if (tag === "Pesanan") {
    tagEl.className =
      "text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block";
  } else {
    tagEl.className =
      "text-[10px] uppercase font-bold tracking-wider text-terracotta";
  }

  showModal("lightbox-modal");
}

function closeLightbox() {
  hideModal("lightbox-modal");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCart();
    closeLightbox();
    closeMapPickerModal();
    closeScheduleModal();
  }
});

// --- Stok dari stock.json (opsional, tanpa infrastructure tambahan) ---
// Format: { "updated": "2026-11-11T06:00:00+07:00",
//           "items": { "sate-keong": "available", ... } }
// Jika berkas tidak ada / gagal diambil, status bawaan di PRODUCTS dipakai.
async function applyStockOverrides() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("stock.json", {
      cache: "no-cache",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return;

    const data = await res.json();
    const items = data && data.items ? data.items : data;
    if (!items || typeof items !== "object") return;

    const valid = ["available", "preorder", "soldout"];
    let changed = 0;

    PRODUCTS.forEach((product) => {
      const status = items[product.id];
      if (typeof status === "string" && valid.includes(status)) {
        if (product.status !== status) changed += 1;
        product.status = status;
      }
    });

    const note = document.getElementById("stock-updated");
    if (note && data && data.updated) {
      const when = new Date(data.updated);
      if (!Number.isNaN(when.getTime())) {
        note.textContent =
          "Stok diperbarui " +
          when.toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta",
          }) +
          " WIB";
        note.classList.remove("hidden");
      }
    }

    if (changed) track("stock_synced", { changed: changed });
  } catch (_) {
    /* offline atau stock.json belum tersedia — pakai status bawaan */
  }
}

// Simpan nama & catatan saat pengguna mengetik (debounce ringan).
function bindPersistedFields() {
  let timer = null;
  const persist = () => {
    clearTimeout(timer);
    timer = setTimeout(saveState, 400);
  };
  const nameEl = document.getElementById("cust-name");
  const noteEl = document.getElementById("cust-note");
  if (nameEl) nameEl.addEventListener("input", persist);
  if (noteEl) noteEl.addEventListener("input", persist);
}

// Tombol WA melayang: muncul setelah pengunjung melewati hero,
// supaya tidak menutupi tombol "Tanya Stok" di layar pertama.
function initWaFab() {
  const fab = document.getElementById("wa-fab");
  if (!fab) return;
  const update = () => {
    const show = window.scrollY > 420;
    fab.classList.toggle("opacity-0", !show);
    fab.classList.toggle("pointer-events-none", !show);
    fab.classList.toggle("translate-y-3", !show);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
}

// Inisialisasi awal
async function init() {
  await applyStockOverrides();
  loadState();
  renderProducts();
  updateCartUI();
  bindPersistedFields();
  initWaFab();
  track("page_view", { path: location.pathname });
}

init();
