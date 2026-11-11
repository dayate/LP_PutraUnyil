/* Optimasi ulang gambar WebP terberat di images/ tanpa mengubah dimensi.
   Menurunkan quality ffmpeg libwebp untuk 1200w agar ukuran turun signifikan
   dengan perbedaan visual yang tidak terlihat pada foto makanan. */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const IMG = path.join(ROOT, "images");

// File 1200w terberat -> turunkan quality. Kartu katalog tampil <=420px,
// jadi 1200w hanya dipakai di layar Retina/zoom — quality 72 masih tajam.
const TARGETS = [
  "hero-dapur-1200.webp",
  "nasi-box-1200.webp",
  "sate-usus-1200.webp",
  "sate-keong-1200.webp",
  "daun-pisang-1200.webp",
  "bakmi-capcay-1200.webp",
];

for (const name of TARGETS) {
  const file = path.join(IMG, name);
  if (!fs.existsSync(file)) {
    console.error(`LEWAT: ${name}`);
    continue;
  }
  const before = fs.statSync(file).size;
  const tmp = path.join(IMG, `.tmp-${name}`);
  execFileSync(
    "ffmpeg",
    [
      "-y", "-loglevel", "error",
      "-i", file,
      "-c:v", "libwebp",
      "-quality", "72",
      "-compression_level", "6",
      "-preset", "photo",
      tmp,
    ],
    { stdio: "inherit" },
  );
  const after = fs.statSync(tmp).size;
  // Hanya ganti bila memang lebih kecil (hindari berkas membengkak).
  if (after < before) {
    fs.renameSync(tmp, file);
    console.log(
      `${name.padEnd(28)} ${(before / 1024).toFixed(1)} -> ${(after / 1024).toFixed(1)} KB  (-${(100 - (after / before) * 100).toFixed(0)}%)`,
    );
  } else {
    fs.unlinkSync(tmp);
    console.log(`${name.padEnd(28)} dilewati (tidak lebih kecil)`);
  }
}
console.log("Selesai.");
