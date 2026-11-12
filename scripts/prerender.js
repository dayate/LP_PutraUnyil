/* ==========================================================================
   Pre-render katalog produk & galeri ke dalam index.html saat build.

   Kenapa: kalau grid produk kosong di HTML dan baru diisi JavaScript, seluruh
   konten di bawahnya bergeser turun ~4.500px -> Cumulative Layout Shift (CLS)
   tinggi dan skor performa mobile anjlok. Dengan mencetak kartu langsung ke
   HTML, tata letak sudah final sejak paint pertama.

   Sumber data: content/products.json & content/gallery.json (satu sumber
   kebenaran, dikelola lewat /admin). Skrip ini berjalan SEBELUM cache-bust,
   jadi semua URL gambar dicetak polos lalu diberi ?v=<hash> oleh
   scripts/cache-bust.js.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const { ROOT, fail, loadProducts, loadGallery } = require("./lib/content");

const INDEX = path.join(ROOT, "index.html");

const PRODUCTS = loadProducts();
const SLIDES = loadGallery();

function formatRupiah(num) {
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Teks yang masuk ke dalam string JS di atribut onclick.
function jsAttr(s) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "\\'");
}

// Tidak ada stok harian: kartu tanpa badge saat bisa dipesan, dan badge hanya
// muncul kalau produk sedang tidak tersedia (mis. keong di luar musim).
function statusBadge(p) {
  if (p.status !== "off") return "";
  const label = p.seasonal ? "Di luar musim" : "Tidak tersedia";
  return `<span class="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-300">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> ${label}
          </span>`;
}

const WA_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

// --- Kartu katalog ---------------------------------------------------------
function card(p) {
  const isOff = p.status === "off";
  return `
    <div class="border border-stone-200 bg-white rounded-lg overflow-hidden flex flex-col transition group shadow-sm ${isOff ? "opacity-75" : "hover:border-stone-300 hover:shadow-md"}">
    <div class="flex flex-col flex-1">
      <div class="h-44 w-full overflow-hidden bg-stone-100 relative">
        ${
          p.photo
            ? `<img
          src="images/${p.photo}-600.webp"
          srcset="images/${p.photo}-600.webp 600w, images/${p.photo}-1200.webp 1200w"
          sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
          width="1200"
          height="900"
          alt="${esc(p.name)}"
          class="w-full h-full object-cover transition-transform duration-500 ${isOff ? "grayscale-[60%]" : "group-hover:scale-105"}"
          loading="lazy"
          decoding="async"
        >`
            : `<div class="w-full h-full bg-gradient-to-br from-stone-100 via-white to-stone-100 flex flex-col items-center justify-center gap-1.5">
          <svg class="w-9 h-9 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span class="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Foto menyusul</span>
        </div>`
        }
        <span class="absolute top-3 right-3 bg-stone-900/85 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full">
          ${esc(p.unit)}
        </span>
        <div class="absolute top-3 left-3">
          ${statusBadge(p)}
        </div>
      </div>
      <div class="p-4 sm:p-5 flex-1 flex flex-col">
        <h3 class="font-serif text-lg font-bold text-stone-900 leading-snug">${esc(p.name)}</h3>
        <p class="text-stone-600 text-[13px] leading-relaxed line-clamp-3 mt-1.5">${esc(p.desc)}</p>
      </div>
    </div>
    <div class="px-4 sm:px-5 pb-4 sm:pb-5 pt-3.5 flex items-center justify-between border-t border-stone-100 gap-2">
      <div class="min-w-0">
        <span class="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold leading-none mb-1">Harga</span>
        <span class="font-serif font-bold text-stone-900 text-base leading-none">${formatRupiah(p.price)}</span>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          onclick="askItemStock('${jsAttr(p.name)}')"
          aria-label="Tanya ketersediaan ${esc(p.name)} via WhatsApp"
          title="Tanya ketersediaan menu ini via WhatsApp"
          class="w-10 h-10 flex items-center justify-center rounded border border-stone-300 hover:border-emerald-600 bg-white hover:bg-emerald-50 text-stone-500 hover:text-emerald-700 transition shrink-0"
        >
          <svg class="w-[18px] h-[18px] fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="${WA_PATH}"/>
          </svg>
        </button>
        ${
          isOff
            ? `<button disabled class="h-10 text-xs uppercase font-bold tracking-wider px-4 bg-stone-100 text-stone-400 border border-stone-200 rounded cursor-not-allowed shrink-0">
            Tutup
          </button>`
            : `<button onclick="addToCart('${p.id}')" class="h-10 text-xs uppercase font-bold tracking-wider px-4 bg-stone-900 text-white hover:bg-stone-700 rounded transition active:scale-95 shrink-0">
            + Tambah
          </button>`
        }
      </div>
    </div>
  </div>`;
}

// --- Slide galeri ---------------------------------------------------------
function slide(s) {
  return `          <div
            tabindex="0"
            role="button"
            aria-label="Perbesar foto: ${esc(s.title)}"
            onkeydown="
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.click();
              }
            "
            onclick="
              openLightbox(
                '/images/${s.photo}-1200.webp',
                '${jsAttr(s.title)}',
                '${jsAttr(s.kicker)}',
                '${jsAttr(s.caption)}',
              )
            "
            class="group cursor-pointer shrink-0 w-64 sm:w-72 snap-start border border-stone-200 rounded-lg overflow-hidden bg-stone-50 hover:border-stone-400 hover:shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
          >
            <div class="h-56 overflow-hidden relative">
              <img
                src="/images/${s.photo}-600.webp"
                srcset="
                  images/${s.photo}-600.webp   600w,
                  images/${s.photo}-1200.webp 1200w
                "
                sizes="(min-width: 640px) 288px, 256px"
                width="1200"
                height="900"
                alt="${esc(s.alt)}"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                decoding="async"
              />
              <div
                class="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <span
                  class="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-bold text-stone-800 shadow"
                  ><span aria-hidden="true">🔍</span> Perbesar</span
                >
              </div>
            </div>
            <div class="p-3.5 bg-white border-t border-stone-100">
              <span
                class="text-[10px] uppercase font-bold tracking-wider text-terracotta"
                >${esc(s.kicker)}</span
              >
              <p class="text-xs font-semibold text-stone-900 mt-0.5">
                ${esc(s.title)}
              </p>
            </div>
          </div>
`;
}

// --- Ganti isi blok penanda -----------------------------------------------
function replaceBlock(html, start, end, body) {
  const from = html.indexOf(start);
  const to = html.indexOf(end);
  if (from === -1 || to === -1 || to < from) {
    fail(`penanda ${start} / ${end} tidak ditemukan di index.html`);
  }
  return (
    html.slice(0, from + start.length) + "\n" + body + html.slice(to)
  );
}

let html = fs.readFileSync(INDEX, "utf8");
const before = html;

html = replaceBlock(
  html,
  "<!-- CATALOG:START -->",
  "<!-- CATALOG:END -->",
  PRODUCTS.map(card).join(""),
);
html = replaceBlock(
  html,
  "<!-- GALLERY:START -->",
  "<!-- GALLERY:END -->",
  SLIDES.map(slide).join("\n"),
);

if (html !== before) {
  fs.writeFileSync(INDEX, html, "utf8");
  console.log(
    `prerender: ${PRODUCTS.length} kartu produk & ${SLIDES.length} slide galeri dicetak ke index.html`,
  );
} else {
  console.log(
    `prerender: index.html sudah terbaru (${PRODUCTS.length} kartu, ${SLIDES.length} slide)`,
  );
}
