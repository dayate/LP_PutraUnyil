/* ==========================================================================
   Optimasi foto produk & galeri.

   Alur: pemilik toko mengunggah SATU foto asli lewat /admin (tersimpan di
   images/uploads/), lalu build membuat dua ukuran WebP yang dipakai halaman:
   images/<slug>-600.webp  (kartu katalog, ~35-70 KB)
   images/<slug>-1200.webp (lightbox & layar besar)

   Kenapa sharp, bukan ffmpeg: build berjalan di Cloudflare Pages (Linux) yang
   tidak menyediakan ffmpeg, sedangkan sharp terpasang sebagai dependensi npm.
   Foto di images/_source/ adalah arsip lokal lama dan tidak diproses otomatis.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const { IMAGES_DIR, UPLOADS_DIR, slugify, loadProducts, fail } = require("./lib/content");

const SIZES = [
  { width: 1200, quality: 78 },
  { width: 600, quality: 76 },
];
const EXT = /\.(jpe?g|png|webp|avif)$/i;

let sharp;
try {
  sharp = require("sharp");
} catch {
  fail(
    "modul sharp belum terpasang. Jalankan `npm install` (sharp dibutuhkan untuk " +
      "membuat WebP dari foto unggahan /admin).",
  );
}

function fresh(sourceFile, outFile) {
  if (!fs.existsSync(outFile)) return true;
  return fs.statSync(sourceFile).mtimeMs > fs.statSync(outFile).mtimeMs;
}

async function run() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log("build-images: folder images/uploads belum ada — tidak ada foto baru.");
    return;
  }

  const files = fs.readdirSync(UPLOADS_DIR).filter((name) => EXT.test(name));
  if (files.length === 0) {
    console.log("build-images: tidak ada foto di images/uploads.");
    return;
  }

  let made = 0;
  let skipped = 0;

  for (const name of files) {
    const source = path.join(UPLOADS_DIR, name);
    const slug = slugify(name);
    if (!slug) {
      console.warn(`build-images: nama berkas "${name}" tidak bisa dijadikan nama produk — dilewati.`);
      continue;
    }

    for (const { width, quality } of SIZES) {
      const out = path.join(IMAGES_DIR, `${slug}-${width}.webp`);
      if (!fresh(source, out)) {
        skipped++;
        continue;
      }
      await sharp(source)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 5 })
        .toFile(out);
      const kb = Math.round(fs.statSync(out).size / 1024);
      console.log(`build-images: ${name} -> ${path.basename(out)} (${kb} KB)`);
      made++;
    }
  }

  console.log(`build-images: ${made} berkas dibuat, ${skipped} sudah terbaru.`);
}

// Peringatan bila produk menunjuk foto yang belum punya WebP sama sekali
// (mis. foto dihapus manual dari images/).
function checkOrphans() {
  let products;
  try {
    products = loadProducts();
  } catch {
    return;
  }
  products
    .filter((p) => p.photo)
    .forEach((p) => {
      const missing = SIZES.filter(
        ({ width }) => !fs.existsSync(path.join(IMAGES_DIR, `${p.photo}-${width}.webp`)),
      );
      if (missing.length) {
        console.warn(
          `build-images: produk "${p.id}" memakai foto "${p.photo}" yang belum punya WebP ` +
            `${missing.map((m) => m.width).join("/")}w.`,
        );
      }
    });
}

run()
  .then(() => {
    checkOrphans();
  })
  .catch((err) => {
    fail(`gagal membuat WebP — ${err.message}`);
  });
