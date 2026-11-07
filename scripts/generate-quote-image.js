const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="45%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.08)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.02)"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1080" fill="url(#bgGrad)"/>

  <!-- Ambient Glow Circles -->
  <circle cx="200" cy="200" r="350" fill="#4f46e5" opacity="0.2"/>
  <circle cx="880" cy="880" r="300" fill="#06b6d4" opacity="0.2"/>

  <!-- Center Card -->
  <rect x="90" y="90" width="900" height="900" rx="48" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>

  <!-- Header Brand -->
  <rect x="150" y="160" width="72" height="72" rx="20" fill="url(#accentGrad)"/>
  <text x="186" y="210" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="bold" fill="#ffffff" text-anchor="middle">&#9889;</text>

  <text x="245" y="195" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="bold" fill="#ffffff">KompresKilat</text>
  <text x="245" y="225" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#94a3b8">kompreskilat.site // Official AI Feed</text>

  <!-- Pill Badge -->
  <rect x="740" y="172" width="180" height="42" rx="21" fill="rgba(99,102,241,0.2)" stroke="#6366f1" stroke-width="1.5"/>
  <text x="830" y="199" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="bold" fill="#a5b4fc" text-anchor="middle">AI PRODUCTIVITY</text>

  <!-- Main Headline Quote -->
  <text x="540" y="440" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="900" fill="#ffffff" text-anchor="middle">KOMPRES KILAT</text>
  <text x="540" y="505" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="bold" fill="#818cf8" text-anchor="middle">Solusi Cepat Berkas Digital &amp; Cek Resi</text>

  <!-- Bullet Feature Box -->
  <rect x="170" y="580" width="740" height="200" rx="24" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
  <text x="210" y="635" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#38bdf8">&#10003; Kompres Foto KTP &amp; Syarat CPNS 200KB</text>
  <text x="210" y="690" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#34d399">&#10003; Perkecil PDF, Word &amp; Cetak Nota Thermal</text>
  <text x="210" y="745" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#a78bfa">&#10003; Cek Resi Shopee, JNE, J&amp;T &amp; SiCepat Real-Time</text>

  <!-- Footer -->
  <line x1="150" y1="860" x2="930" y2="860" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <text x="150" y="915" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#94a3b8">https://kompreskilat.site</text>
  <text x="930" y="915" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="bold" fill="#818cf8" text-anchor="end">Instagram: @kompreskilat</text>
</svg>
`;

const outputPath = path.join(__dirname, '..', 'public', 'images', 'kompreskilat-quote.jpg');
sharp(Buffer.from(svg))
  .jpeg({ quality: 95 })
  .toFile(outputPath)
  .then(() => {
    console.log('Generated branded kompreskilat-quote.jpg successfully at', outputPath);
  })
  .catch((err) => {
    console.error('Error generating image:', err);
    process.exit(1);
  });
