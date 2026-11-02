'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Download,
  Upload,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Image as ImageIcon,
  Palette,
  RefreshCw,
  ShieldCheck,
  LayoutTemplate,
  Wand2,
  Maximize2,
  Trash2,
  Sun,
  SlidersHorizontal,
} from 'lucide-react';
import { downloadBlobSafely, validateUploadedFile } from '@/lib/file-security';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type CreativeStudioTab = 'cards' | 'editor' | 'templates';

export type CardCategoryKey = 'birthday' | 'teacher' | 'eid' | 'national';

export interface CardGradientTheme {
  id: string;
  name: string;
  colors: [string, string, string?];
  textColor: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

export interface CardState {
  category: CardCategoryKey;
  themeId: string;
  badgeText: string;
  title: string;
  message: string;
  recipient: string;
  sender: string;
  footnote: string;
  fontFamily: 'serif' | 'sans' | 'display';
  userPhoto: string | null; // dataURL
  photoBlendMode: 'background' | 'frame-circle' | 'frame-square' | 'overlay';
  photoOpacity: number; // 0.1 to 1.0
  borderStyle: 'ornate' | 'minimal' | 'modern' | 'none';
}

export interface EditorFilterState {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
}

export interface ReadyTemplate {
  id: string;
  title: string;
  categoryName: string;
  categoryType: 'card' | 'poster' | 'certificate';
  thumbnailColors: string[];
  description: string;
  defaultData: {
    category: CardCategoryKey;
    themeId: string;
    badgeText: string;
    title: string;
    message: string;
    recipient: string;
    sender: string;
    footnote: string;
    borderStyle: 'ornate' | 'minimal' | 'modern';
  };
}

// ============================================================================
// THEMES & PRESETS FOR GREETING CARDS
// ============================================================================

const CARD_THEMES: Record<CardCategoryKey, CardGradientTheme[]> = {
  birthday: [
    {
      id: 'bday-sunset',
      name: 'Sunset Celebration',
      colors: ['#FF512F', '#DD2476'],
      textColor: '#FFFFFF',
      accentColor: '#FFE600',
      badgeBg: 'rgba(255, 255, 255, 0.25)',
      badgeText: '#FFFFFF',
    },
    {
      id: 'bday-neon',
      name: 'Cyber Party',
      colors: ['#4A00E0', '#8E2DE2'],
      textColor: '#FFFFFF',
      accentColor: '#00F2FE',
      badgeBg: 'rgba(255, 255, 255, 0.2)',
      badgeText: '#00F2FE',
    },
    {
      id: 'bday-gold',
      name: 'Luxury Midnight Gold',
      colors: ['#0F2027', '#203A43', '#2C5364'],
      textColor: '#F8FAFC',
      accentColor: '#F59E0B',
      badgeBg: 'rgba(245, 158, 11, 0.2)',
      badgeText: '#FBBF24',
    },
    {
      id: 'bday-pastel',
      name: 'Sweet Peach',
      colors: ['#FF9A8B', '#FF6A88', '#FF99AC'],
      textColor: '#FFFFFF',
      accentColor: '#FFF3B0',
      badgeBg: 'rgba(255, 255, 255, 0.3)',
      badgeText: '#FFFFFF',
    },
  ],
  teacher: [
    {
      id: 'teacher-navy',
      name: 'Royal Academic Blue',
      colors: ['#1E3A8A', '#3B82F6'],
      textColor: '#FFFFFF',
      accentColor: '#FBBF24',
      badgeBg: 'rgba(251, 191, 36, 0.25)',
      badgeText: '#FDE68A',
    },
    {
      id: 'teacher-emerald',
      name: 'Emerald Wisdom',
      colors: ['#064E3B', '#047857', '#10B981'],
      textColor: '#FFFFFF',
      accentColor: '#FDE047',
      badgeBg: 'rgba(255, 255, 255, 0.2)',
      badgeText: '#FFFFFF',
    },
    {
      id: 'teacher-classic',
      name: 'Vintage Scholar',
      colors: ['#78350F', '#B45309'],
      textColor: '#FFFBEB',
      accentColor: '#FDE68A',
      badgeBg: 'rgba(254, 243, 199, 0.25)',
      badgeText: '#FEF3C7',
    },
    {
      id: 'teacher-slate',
      name: 'Executive Slate',
      colors: ['#0F172A', '#334155'],
      textColor: '#F8FAFC',
      accentColor: '#38BDF8',
      badgeBg: 'rgba(56, 189, 248, 0.2)',
      badgeText: '#7DD3FC',
    },
  ],
  eid: [
    {
      id: 'eid-emerald',
      name: 'Islamic Emerald & Gold',
      colors: ['#065F46', '#047857', '#059669'],
      textColor: '#FFFFFF',
      accentColor: '#FBBF24',
      badgeBg: 'rgba(251, 191, 36, 0.25)',
      badgeText: '#FDE68A',
    },
    {
      id: 'eid-night',
      name: 'Twilight Ramadhan',
      colors: ['#0F172A', '#1E1B4B', '#312E81'],
      textColor: '#F8FAFC',
      accentColor: '#FDE047',
      badgeBg: 'rgba(253, 224, 71, 0.2)',
      badgeText: '#FEF08A',
    },
    {
      id: 'eid-sand',
      name: 'Desert Oasis Warmth',
      colors: ['#134E4A', '#0D9488'],
      textColor: '#F0FDFA',
      accentColor: '#F59E0B',
      badgeBg: 'rgba(245, 158, 11, 0.2)',
      badgeText: '#FDE68A',
    },
    {
      id: 'eid-sage',
      name: 'Peaceful Sage',
      colors: ['#14532D', '#15803D'],
      textColor: '#F0FDF4',
      accentColor: '#FACC15',
      badgeBg: 'rgba(250, 204, 21, 0.2)',
      badgeText: '#FEF08A',
    },
  ],
  national: [
    {
      id: 'national-merahputih',
      name: 'Merah Putih Heroik',
      colors: ['#DC2626', '#991B1B'],
      textColor: '#FFFFFF',
      accentColor: '#FEF08A',
      badgeBg: 'rgba(255, 255, 255, 0.25)',
      badgeText: '#FFFFFF',
    },
    {
      id: 'national-garuda',
      name: 'Garuda Nusantara Gold',
      colors: ['#7F1D1D', '#991B1B', '#B91C1C'],
      textColor: '#FFF1F2',
      accentColor: '#F59E0B',
      badgeBg: 'rgba(245, 158, 11, 0.25)',
      badgeText: '#FDE68A',
    },
    {
      id: 'national-darkred',
      name: 'Semangat Juang 1945',
      colors: ['#450A0A', '#7F1D1D'],
      textColor: '#FFFFFF',
      accentColor: '#FBBF24',
      badgeBg: 'rgba(255, 255, 255, 0.2)',
      badgeText: '#FEF3C7',
    },
    {
      id: 'national-tricolor',
      name: 'Patriotik Modern',
      colors: ['#1E1B4B', '#991B1B'],
      textColor: '#FFFFFF',
      accentColor: '#38BDF8',
      badgeBg: 'rgba(255, 255, 255, 0.2)',
      badgeText: '#FFFFFF',
    },
  ],
};

const DEFAULT_CATEGORY_CONTENT: Record<CardCategoryKey, Omit<CardState, 'category' | 'themeId' | 'userPhoto' | 'photoBlendMode' | 'photoOpacity' | 'fontFamily' | 'borderStyle'>> = {
  birthday: {
    badgeText: '🎂 SPECIAL BIRTHDAY CELEBRATION',
    title: 'Selamat Ulang Tahun!',
    message: 'Semoga hari spesialmu dipenuhi dengan tawa, kebahagiaan berlimpah, kesehatan yang prima, dan tercapainya setiap impian terbaikmu.',
    recipient: 'Untuk: Sahabat Terbaikku',
    sender: 'Dari: Teman-teman Seperjuangan',
    footnote: 'Hari yang Istimewa • Penuh Berkah',
  },
  teacher: {
    badgeText: '👩‍🏫 HARI GURU NASIONAL 2026',
    title: 'Terima Kasih Guru Tercinta',
    message: 'Atas setiap tetes ilmu, kesabaran tak berbatas, dan dedikasi mulia membimbing langkah kami menggapai cita-cita setinggi angkasa.',
    recipient: 'Kepada: Bpk / Ibu Guru Terhormat',
    sender: 'Dari: Siswa-Siswi Penuh Bakti',
    footnote: 'Pahlawan Tanpa Tanda Jasa • 25 November',
  },
  eid: {
    badgeText: '🌙 SELAMAT HARI RAYA IDUL FITRI',
    title: 'Taqabbalallahu Minna Wa Minkum',
    message: 'Di hari yang suci nan fitri, kami memohon maaf lahir dan batin atas segala khilaf kata dan perbuatan. Semoga kedamaian selalu menyertai.',
    recipient: 'Kepada: Keluarga Besar & Sahabat',
    sender: 'Dari: Keluarga Kami',
    footnote: '1 Syawal • Minal Aidin Wal Faizin',
  },
  national: {
    badgeText: '🇮🇩 DIRGAHAYU REPUBLIK INDONESIA',
    title: 'Bangkit & Maju Bersama',
    message: 'Dengan semangat persatuan dan integritas bangsa, mari terus berkarya, berinovasi, dan menjaga kebhinekaan untuk Indonesia yang lebih gemilang.',
    recipient: 'Untuk: Seluruh Rakyat Indonesia',
    sender: 'Dari: Generasi Muda Bangsa',
    footnote: '17 Agustus • Merdeka & Berdaulat',
  },
};

// ============================================================================
// READY TO USE DESIGN TEMPLATES
// ============================================================================

const READY_TEMPLATES: ReadyTemplate[] = [
  {
    id: 'tmpl-bday-luxury',
    title: 'Kartu Ulang Tahun Midnight Gold',
    categoryName: 'Ulang Tahun',
    categoryType: 'card',
    thumbnailColors: ['#0F2027', '#203A43', '#F59E0B'],
    description: 'Desain elegan gelap dengan ornamen garis emas, cocok untuk kolega, atasan, atau keluarga tercinta.',
    defaultData: {
      category: 'birthday',
      themeId: 'bday-gold',
      badgeText: '✨ EXCLUSIVE BIRTHDAY GREETING',
      title: 'Selamat Ulang Tahun!',
      message: 'Semoga di usia yang baru ini Allah limpahkan berkah kesehatan, kesuksesan karir, serta kebahagiaan yang tak pernah surut.',
      recipient: 'Kepada: Sahabat Tercinta',
      sender: 'Dari: Rekan & Keluarga',
      footnote: 'Spesial Milestone • Semoga Berkah',
      borderStyle: 'ornate',
    },
  },
  {
    id: 'tmpl-teacher-academic',
    title: 'Kartu Ucapan Hari Guru Nasional',
    categoryName: 'Hari Guru',
    categoryType: 'card',
    thumbnailColors: ['#1E3A8A', '#3B82F6', '#FBBF24'],
    description: 'Sentuhan warna biru akademisi dan emas mencerminkan rasa hormat dan terima kasih mendalam bagi pendidik.',
    defaultData: {
      category: 'teacher',
      themeId: 'teacher-navy',
      badgeText: '👩‍🏫 HARI GURU NASIONAL',
      title: 'Guruku, Lentera Hidupku',
      message: 'Terima kasih telah membimbing dengan sabar, menanamkan budi pekerti, dan membuka jendela dunia bagi masa depan kami.',
      recipient: 'Untuk: Bapak/Ibu Guru Tersayang',
      sender: 'Dari: Seluruh Murid Kelasmu',
      footnote: 'Pahlawan Bangsa • Tetap Menginspirasi',
      borderStyle: 'ornate',
    },
  },
  {
    id: 'tmpl-eid-mubarak',
    title: 'Kartu Ucapan Idul Fitri Mubarak',
    categoryName: 'Hari Raya',
    categoryType: 'card',
    thumbnailColors: ['#065F46', '#047857', '#FBBF24'],
    description: 'Nuansa hijau zamrud islami dengan kaligrafi estetik dan ornamen bulan bintang nan menyejukkan hati.',
    defaultData: {
      category: 'eid',
      themeId: 'eid-emerald',
      badgeText: '🌙 EID AL-FITR MUBARAK',
      title: 'Minal Aidin Wal Faizin',
      message: 'Sucikan hati, eratkan silaturahmi. Selamat Hari Raya Idul Fitri, mohon maaf lahir dan batin atas segala khilaf.',
      recipient: 'Kepada: Bapak/Ibu & Kerabat',
      sender: 'Dari: Budi & Sekeluarga',
      footnote: 'Kemenangan Hati • Penuh Kedamaian',
      borderStyle: 'ornate',
    },
  },
  {
    id: 'tmpl-independence-hero',
    title: 'Poster Dirgahayu Kemerdekaan RI',
    categoryName: 'Hari Nasional',
    categoryType: 'poster',
    thumbnailColors: ['#DC2626', '#991B1B', '#FEF08A'],
    description: 'Semangat merah putih berkobar dengan tipografi tegas, ideal untuk ucapan perayaan kemerdekaan 17 Agustus.',
    defaultData: {
      category: 'national',
      themeId: 'national-merahputih',
      badgeText: '🇮🇩 DIRGAHAYU REPUBLIK INDONESIA',
      title: 'Indonesia Maju & Berdaulat',
      message: 'Kobarkan semangat gotong royong, junjung tinggi toleransi, dan mari satukan langkah untuk masa depan nusantara yang gemilang.',
      recipient: 'Untuk: Seluruh Anak Bangsa',
      sender: 'Dari: Komunitas Pemuda Kreatif',
      footnote: '17 Agustus • Merdeka Selamanya',
      borderStyle: 'modern',
    },
  },
  {
    id: 'tmpl-certificate-gold',
    title: 'Sertifikat Apresiasi & Penghargaan',
    categoryName: 'Sertifikat',
    categoryType: 'certificate',
    thumbnailColors: ['#1E1B4B', '#312E81', '#FBBF24'],
    description: 'Sertifikat formal dengan border bingkai ganda emas berornamen royal untuk apresiasi prestasi atau seminar.',
    defaultData: {
      category: 'teacher',
      themeId: 'teacher-navy',
      badgeText: '🏆 SERTIFIKAT PENGHARGAAN RESMI',
      title: 'Certificate of Excellence',
      message: 'Diberikan sebagai bentuk apresiasi tertinggi atas dedikasi luar biasa, pencapaian istimewa, dan kontribusi nyata yang membanggakan.',
      recipient: 'Diberikan Kepada: Peserta Terbaik',
      sender: 'Ketua Pelaksana & Dewan Juri',
      footnote: 'Diterbitkan Resmi • KompresKilat Studio',
      borderStyle: 'ornate',
    },
  },
  {
    id: 'tmpl-promo-flyer',
    title: 'Flyer Promo Diskon Flash Sale UMKM',
    categoryName: 'Poster & Promo',
    categoryType: 'poster',
    thumbnailColors: ['#FF512F', '#DD2476', '#FFE600'],
    description: 'Desain cerah kontras tinggi untuk menarik perhatian calon pelanggan saat event promosi atau diskon toko.',
    defaultData: {
      category: 'birthday',
      themeId: 'bday-sunset',
      badgeText: '🔥 MEGA PROMO CUCI GUDANG 50%',
      title: 'Spesial Diskon Terbatas!',
      message: 'Dapatkan penawaran harga terbaik untuk seluruh produk pilihan kami. Jangan lewatkan kesempatan emas ini, belanja sekarang juga!',
      recipient: 'Khusus Pelanggan Setia',
      sender: 'Official Store & Distributor',
      footnote: 'Syarat & Ketentuan Berlaku • Buruan!',
      borderStyle: 'minimal',
    },
  },
];

// ============================================================================
// MAIN CREATIVE STUDIO COMPONENT
// ============================================================================

export default function CreativeStudio() {
  // Main Tab State: Cards, Quick Editor, or Templates
  const [activeMainTab, setActiveMainTab] = useState<CreativeStudioTab>('cards');

  // ==========================================================================
  // STATE 1: GREETING CARD MAKER
  // ==========================================================================
  const [cardState, setCardState] = useState<CardState>({
    category: 'birthday',
    themeId: 'bday-sunset',
    badgeText: DEFAULT_CATEGORY_CONTENT.birthday.badgeText,
    title: DEFAULT_CATEGORY_CONTENT.birthday.title,
    message: DEFAULT_CATEGORY_CONTENT.birthday.message,
    recipient: DEFAULT_CATEGORY_CONTENT.birthday.recipient,
    sender: DEFAULT_CATEGORY_CONTENT.birthday.sender,
    footnote: DEFAULT_CATEGORY_CONTENT.birthday.footnote,
    fontFamily: 'serif',
    userPhoto: null,
    photoBlendMode: 'frame-circle',
    photoOpacity: 0.85,
    borderStyle: 'ornate',
  });

  const [isExportingCard, setIsExportingCard] = useState(false);
  const cardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const userPhotoImgRef = useRef<HTMLImageElement | null>(null);

  // Switch category tabs and set sensible defaults
  const handleCategoryChange = (cat: CardCategoryKey) => {
    const defaults = DEFAULT_CATEGORY_CONTENT[cat];
    const availableThemes = CARD_THEMES[cat];
    setCardState((prev) => ({
      ...prev,
      category: cat,
      themeId: availableThemes[0]?.id || 'bday-sunset',
      badgeText: defaults.badgeText,
      title: defaults.title,
      message: defaults.message,
      recipient: defaults.recipient,
      sender: defaults.sender,
      footnote: defaults.footnote,
    }));
  };

  // Upload Photo for Card
  const handleCardPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = await validateUploadedFile(file, {
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
      maxSizeBytes: 10 * 1024 * 1024,
    });

    if (!validation.valid) {
      alert(validation.error || 'Berkas foto tidak valid.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        userPhotoImgRef.current = img;
        setCardState((prev) => ({ ...prev, userPhoto: dataUrl }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCardPhoto = () => {
    userPhotoImgRef.current = null;
    setCardState((prev) => ({ ...prev, userPhoto: null }));
  };

  // Canvas Drawing for Greeting Card
  const drawGreetingCard = useCallback(() => {
    const canvas = cardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1200;
    const H = 1200;
    canvas.width = W;
    canvas.height = H;

    // 1. Dapatkan tema warna aktif
    const themes = CARD_THEMES[cardState.category] || CARD_THEMES.birthday;
    const currentTheme = themes.find((t) => t.id === cardState.themeId) || themes[0];

    // 2. Gambar Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, currentTheme.colors[0]);
    if (currentTheme.colors[2]) {
      gradient.addColorStop(0.5, currentTheme.colors[1]);
      gradient.addColorStop(1, currentTheme.colors[2]);
    } else {
      gradient.addColorStop(1, currentTheme.colors[1]);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // 3. Efek Partikel / Subtle Pattern
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 40; i++) {
      const rx = (i * 123) % W;
      const ry = (i * 287) % H;
      const r = 4 + (i % 8);
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Gambar User Photo jika tersedia
    if (userPhotoImgRef.current && cardState.userPhoto) {
      const img = userPhotoImgRef.current;
      ctx.save();

      if (cardState.photoBlendMode === 'background') {
        // Blended full background
        ctx.globalAlpha = cardState.photoOpacity;
        const scale = Math.max(W / img.width, H / img.height);
        const nw = img.width * scale;
        const nh = img.height * scale;
        const nx = (W - nw) / 2;
        const ny = (H - nh) / 2;
        ctx.drawImage(img, nx, ny, nw, nh);

        // Darken overlay agar teks tetap mudah dibaca
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);
      } else if (cardState.photoBlendMode === 'frame-circle') {
        // Lingkaran Avatar Elegan di Bagian Tengah Atas
        const centerX = W / 2;
        const centerY = 330;
        const radius = 130;

        // Outer Glow / Ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = currentTheme.accentColor;
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 20;
        ctx.fill();

        // Inner Circle Clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();

        const s = Math.max((radius * 2) / img.width, (radius * 2) / img.height);
        const pw = img.width * s;
        const ph = img.height * s;
        ctx.drawImage(img, centerX - pw / 2, centerY - ph / 2, pw, ph);
        ctx.restore();
      } else if (cardState.photoBlendMode === 'frame-square') {
        // Frame Persegi dengan Sudut Membulat
        const fw = 320;
        const fh = 320;
        const fx = (W - fw) / 2;
        const fy = 200;

        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 25;
        ctx.fillStyle = currentTheme.accentColor;
        ctx.beginPath();
        ctx.roundRect(fx - 6, fy - 6, fw + 12, fh + 12, 28);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(fx, fy, fw, fh, 24);
        ctx.clip();
        const s = Math.max(fw / img.width, fh / img.height);
        const pw = img.width * s;
        const ph = img.height * s;
        ctx.drawImage(img, fx + (fw - pw) / 2, fy + (fh - ph) / 2, pw, ph);
        ctx.restore();
      }
      ctx.restore();
    }

    // 5. Gambar Bingkai Ornamen (Border)
    if (cardState.borderStyle === 'ornate') {
      ctx.save();
      ctx.strokeStyle = currentTheme.accentColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(60, 60, W - 120, H - 120);

      // Garis Tipis Bagian Dalam
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.strokeRect(74, 74, W - 148, H - 148);

      // Ornamen Sudut (Corner Flourish)
      const corners = [
        [60, 60],
        [W - 60, 60],
        [60, H - 60],
        [W - 60, H - 60],
      ];
      ctx.fillStyle = currentTheme.accentColor;
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    } else if (cardState.borderStyle === 'modern') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(50, 50, W - 100, H - 100, 36);
      ctx.stroke();
      ctx.restore();
    }

    // 6. Gambar Teks Tipografi
    const hasPhotoTop =
      userPhotoImgRef.current &&
      (cardState.photoBlendMode === 'frame-circle' || cardState.photoBlendMode === 'frame-square');

    // Font Family Selection
    let titleFontName = 'serif';
    let bodyFontName = 'sans-serif';
    if (cardState.fontFamily === 'serif') {
      titleFontName = 'Georgia, "Times New Roman", serif';
      bodyFontName = 'Georgia, serif';
    } else if (cardState.fontFamily === 'display') {
      titleFontName = 'Impact, "Arial Black", sans-serif';
      bodyFontName = 'system-ui, sans-serif';
    } else {
      titleFontName = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      bodyFontName = 'system-ui, sans-serif';
    }

    // A. Badge Atas
    const badgeY = hasPhotoTop ? 100 : 180;
    if (cardState.badgeText) {
      ctx.save();
      ctx.font = 'bold 20px system-ui, sans-serif';
      const badgeMetrics = ctx.measureText(cardState.badgeText);
      const bPaddingX = 28;
      const bHeight = 44;
      const bWidth = badgeMetrics.width + bPaddingX * 2;
      const bX = (W - bWidth) / 2;
      const bY = badgeY - 26;

      ctx.fillStyle = currentTheme.badgeBg;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bWidth, bHeight, 22);
      ctx.fill();

      ctx.fillStyle = currentTheme.badgeText;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cardState.badgeText, W / 2, badgeY - 4);
      ctx.restore();
    }

    // B. Judul Utama (Headline)
    const titleY = hasPhotoTop ? 540 : 330;
    ctx.save();
    ctx.font = `bold 64px ${titleFontName}`;
    ctx.fillStyle = currentTheme.accentColor;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 12;
    ctx.fillText(cardState.title, W / 2, titleY);
    ctx.restore();

    // Garis Aksen Dekoratif di bawah Judul
    ctx.save();
    ctx.strokeStyle = currentTheme.accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 120, titleY + 25);
    ctx.lineTo(W / 2 + 120, titleY + 25);
    ctx.stroke();

    ctx.fillStyle = currentTheme.accentColor;
    ctx.beginPath();
    ctx.arc(W / 2, titleY + 25, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // C. Penerima (Recipient)
    const recipientY = titleY + 90;
    if (cardState.recipient) {
      ctx.save();
      ctx.font = `italic 600 28px ${bodyFontName}`;
      ctx.fillStyle = currentTheme.textColor;
      ctx.textAlign = 'center';
      ctx.fillText(cardState.recipient, W / 2, recipientY);
      ctx.restore();
    }

    // D. Pesan / Ucapan Utama (Multi-line Wrap)
    const messageY = recipientY + 60;
    ctx.save();
    ctx.font = `30px ${bodyFontName}`;
    ctx.fillStyle = currentTheme.textColor;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;

    // Helper wrap text
    const words = cardState.message.split(' ');
    let line = '';
    let currentY = messageY;
    const maxWidth = 880;
    const lineHeight = 46;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), W / 2, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), W / 2, currentY);
    ctx.restore();

    // E. Pengirim (Sender)
    const senderY = Math.max(currentY + 80, 960);
    if (cardState.sender) {
      ctx.save();
      ctx.font = `bold 26px ${bodyFontName}`;
      ctx.fillStyle = currentTheme.accentColor;
      ctx.textAlign = 'center';
      ctx.fillText(cardState.sender, W / 2, senderY);
      ctx.restore();
    }

    // F. Catatan Kaki / Footnote
    if (cardState.footnote) {
      ctx.save();
      ctx.font = '500 20px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.textAlign = 'center';
      ctx.fillText(cardState.footnote, W / 2, senderY + 50);
      ctx.restore();
    }
  }, [cardState]);

  // Re-render greeting card canvas whenever cardState updates
  useEffect(() => {
    if (activeMainTab === 'cards') {
      drawGreetingCard();
    }
  }, [activeMainTab, cardState, drawGreetingCard]);

  // Download Greeting Card as PNG or JPG
  const handleDownloadCard = (format: 'png' | 'jpeg') => {
    const canvas = cardCanvasRef.current;
    if (!canvas) return;

    setIsExportingCard(true);
    canvas.toBlob(
      (blob) => {
        setIsExportingCard(false);
        if (!blob) {
          alert('Gagal menghasilkan berkas gambar kartu.');
          return;
        }
        const ext = format === 'jpeg' ? 'jpg' : 'png';
        const fileName = `Kartu-Ucapan-${cardState.category}-${Date.now()}.${ext}`;
        downloadBlobSafely(blob, fileName);
      },
      format === 'jpeg' ? 'image/jpeg' : 'image/png',
      format === 'jpeg' ? 0.95 : undefined
    );
  };

  // ==========================================================================
  // STATE 2: QUICK IMAGE EDITOR
  // ==========================================================================
  const [editorFile, setEditorFile] = useState<File | null>(null);
  const [editorImgElement, setEditorImgElement] = useState<HTMLImageElement | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [cropRatio, setCropRatio] = useState<'free' | '1:1' | '4:5' | '16:9' | '3:4'>('free');

  // Resize dimension inputs
  const [customWidth, setCustomWidth] = useState<number>(800);
  const [customHeight, setCustomHeight] = useState<number>(800);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);

  // Filters
  const [filters, setFilters] = useState<EditorFilterState>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    grayscale: false,
    sepia: false,
    invert: false,
  });

  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [exportQuality, setExportQuality] = useState<number>(90);
  const [isExportingEditor, setIsExportingEditor] = useState<boolean>(false);

  const editorCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle Quick Editor Image Upload
  const handleEditorFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = await validateUploadedFile(file, {
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp'],
      maxSizeBytes: 20 * 1024 * 1024,
    });

    if (!validation.valid) {
      alert(validation.error || 'Berkas gambar tidak valid.');
      return;
    }

    setEditorFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setEditorImgElement(img);
        setCustomWidth(img.naturalWidth);
        setCustomHeight(img.naturalHeight);
        setRotationAngle(0);
        setFlipH(false);
        setFlipV(false);
        setFilters({
          brightness: 0,
          contrast: 0,
          saturation: 0,
          grayscale: false,
          sepia: false,
          invert: false,
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Re-draw Quick Editor Canvas
  const drawEditorCanvas = useCallback(() => {
    const canvas = editorCanvasRef.current;
    if (!canvas || !editorImgElement) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Hitung crop dimensi jika dipilih
    let srcX = 0;
    let srcY = 0;
    let srcW = editorImgElement.naturalWidth;
    let srcH = editorImgElement.naturalHeight;

    if (cropRatio !== 'free') {
      let targetRatio = 1;
      if (cropRatio === '1:1') targetRatio = 1;
      else if (cropRatio === '4:5') targetRatio = 4 / 5;
      else if (cropRatio === '16:9') targetRatio = 16 / 9;
      else if (cropRatio === '3:4') targetRatio = 3 / 4;

      const currentRatio = srcW / srcH;
      if (currentRatio > targetRatio) {
        // Terlalu lebar, crop sisi kiri & kanan
        const newW = srcH * targetRatio;
        srcX = (srcW - newW) / 2;
        srcW = newW;
      } else {
        // Terlalu tinggi, crop sisi atas & bawah
        const newH = srcW / targetRatio;
        srcY = (srcH - newH) / 2;
        srcH = newH;
      }
    }

    // Tentukan resolusi canvas target
    const isRotated90or270 = rotationAngle % 180 !== 0;
    const destW = isRotated90or270 ? customHeight : customWidth;
    const destH = isRotated90or270 ? customWidth : customHeight;

    canvas.width = destW;
    canvas.height = destH;

    ctx.save();

    // 1. Filter Efek CSS Canvas
    const filterParts: string[] = [];
    if (filters.brightness !== 0) filterParts.push(`brightness(${100 + filters.brightness}%)`);
    if (filters.contrast !== 0) filterParts.push(`contrast(${100 + filters.contrast}%)`);
    if (filters.saturation !== 0) filterParts.push(`saturate(${100 + filters.saturation}%)`);
    if (filters.grayscale) filterParts.push('grayscale(100%)');
    if (filters.sepia) filterParts.push('sepia(80%)');
    if (filters.invert) filterParts.push('invert(100%)');

    ctx.filter = filterParts.length > 0 ? filterParts.join(' ') : 'none';

    // 2. Transformasi: Rotasi & Flip
    ctx.translate(destW / 2, destH / 2);
    ctx.rotate((rotationAngle * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // 3. Render Gambar ke Canvas
    const drawW = isRotated90or270 ? destH : destW;
    const drawH = isRotated90or270 ? destW : destH;
    ctx.drawImage(editorImgElement, srcX, srcY, srcW, srcH, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();
  }, [editorImgElement, rotationAngle, flipH, flipV, cropRatio, customWidth, customHeight, filters]);

  useEffect(() => {
    if (activeMainTab === 'editor' && editorImgElement) {
      drawEditorCanvas();
    }
  }, [activeMainTab, editorImgElement, drawEditorCanvas]);

  // Rotasi Cepat
  const handleRotateCW = () => setRotationAngle((prev) => (prev + 90) % 360);
  const handleRotateCCW = () => setRotationAngle((prev) => (prev - 90 + 360) % 360);
  const handleToggleFlipH = () => setFlipH((prev) => !prev);
  const handleToggleFlipV = () => setFlipV((prev) => !prev);

  // Resize Presets (25%, 50%, 75%, 100%)
  const handleApplyResizePercent = (percentage: number) => {
    if (!editorImgElement) return;
    const origW = editorImgElement.naturalWidth;
    const origH = editorImgElement.naturalHeight;
    const newW = Math.round((origW * percentage) / 100);
    const newH = Math.round((origH * percentage) / 100);
    setCustomWidth(newW);
    setCustomHeight(newH);
  };

  // Download Quick Editor Result
  const handleDownloadEditorResult = () => {
    const canvas = editorCanvasRef.current;
    if (!canvas) return;

    setIsExportingEditor(true);
    const mime = exportFormat === 'png' ? 'image/png' : exportFormat === 'webp' ? 'image/webp' : 'image/jpeg';
    const quality = exportQuality / 100;

    canvas.toBlob(
      (blob) => {
        setIsExportingEditor(false);
        if (!blob) {
          alert('Gagal mengekspor gambar.');
          return;
        }
        const fileName = `Editor-${Date.now()}.${exportFormat === 'jpeg' ? 'jpg' : exportFormat}`;
        downloadBlobSafely(blob, fileName);
      },
      mime,
      exportFormat === 'png' ? undefined : quality
    );
  };

  // Reset Editor to Default
  const handleResetEditor = () => {
    if (!editorImgElement) return;
    setRotationAngle(0);
    setFlipH(false);
    setFlipV(false);
    setCropRatio('free');
    setCustomWidth(editorImgElement.naturalWidth);
    setCustomHeight(editorImgElement.naturalHeight);
    setFilters({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      grayscale: false,
      sepia: false,
      invert: false,
    });
  };

  // ==========================================================================
  // STATE 3: READY TEMPLATES INTEGRATION
  // ==========================================================================
  const [templateFilter, setTemplateFilter] = useState<'all' | 'card' | 'poster' | 'certificate'>('all');

  const filteredTemplates = READY_TEMPLATES.filter((tmpl) => {
    if (templateFilter === 'all') return true;
    return tmpl.categoryType === templateFilter;
  });

  // Buka template di Greeting Card Maker untuk dikustomisasi
  const handleLoadTemplateIntoEditor = (tmpl: ReadyTemplate) => {
    setCardState((prev) => ({
      ...prev,
      category: tmpl.defaultData.category,
      themeId: tmpl.defaultData.themeId,
      badgeText: tmpl.defaultData.badgeText,
      title: tmpl.defaultData.title,
      message: tmpl.defaultData.message,
      recipient: tmpl.defaultData.recipient,
      sender: tmpl.defaultData.sender,
      footnote: tmpl.defaultData.footnote,
      borderStyle: tmpl.defaultData.borderStyle,
    }));
    setActiveMainTab('cards');
  };

  // Unduh Template Langsung (Instant High-Res Generation)
  const handleInstantDownloadTemplate = (tmpl: ReadyTemplate) => {
    const offCanvas = document.createElement('canvas');
    const W = 1200;
    const H = 1200;
    offCanvas.width = W;
    offCanvas.height = H;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) return;

    const themes = CARD_THEMES[tmpl.defaultData.category];
    const theme = themes.find((t) => t.id === tmpl.defaultData.themeId) || themes[0];

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, theme.colors[0]);
    if (theme.colors[2]) {
      gradient.addColorStop(0.5, theme.colors[1]);
      gradient.addColorStop(1, theme.colors[2]);
    } else {
      gradient.addColorStop(1, theme.colors[1]);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.save();
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, W - 120, H - 120);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.strokeRect(74, 74, W - 148, H - 148);
    ctx.restore();

    // Badge
    ctx.save();
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillStyle = theme.badgeBg;
    ctx.beginPath();
    ctx.roundRect(W / 2 - 200, 150, 400, 46, 23);
    ctx.fill();
    ctx.fillStyle = theme.badgeText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tmpl.defaultData.badgeText, W / 2, 173);
    ctx.restore();

    // Judul
    ctx.save();
    ctx.font = 'bold 64px Georgia, serif';
    ctx.fillStyle = theme.accentColor;
    ctx.textAlign = 'center';
    ctx.fillText(tmpl.defaultData.title, W / 2, 330);

    // Accent line
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 120, 360);
    ctx.lineTo(W / 2 + 120, 360);
    ctx.stroke();
    ctx.restore();

    // Recipient
    ctx.save();
    ctx.font = 'italic 600 28px Georgia, serif';
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = 'center';
    ctx.fillText(tmpl.defaultData.recipient, W / 2, 450);
    ctx.restore();

    // Message
    ctx.save();
    ctx.font = '30px Georgia, serif';
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = 'center';
    const words = tmpl.defaultData.message.split(' ');
    let line = '';
    let curY = 530;
    for (let n = 0; n < words.length; n++) {
      const test = line + words[n] + ' ';
      if (ctx.measureText(test).width > 860 && n > 0) {
        ctx.fillText(line.trim(), W / 2, curY);
        line = words[n] + ' ';
        curY += 46;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), W / 2, curY);
    ctx.restore();

    // Sender
    ctx.save();
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillStyle = theme.accentColor;
    ctx.textAlign = 'center';
    ctx.fillText(tmpl.defaultData.sender, W / 2, 940);

    ctx.font = '500 20px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillText(tmpl.defaultData.footnote, W / 2, 990);
    ctx.restore();

    offCanvas.toBlob((blob) => {
      if (!blob) return;
      downloadBlobSafely(blob, `${tmpl.id}-HD.png`);
    }, 'image/png');
  };

  return (
    <div className="w-full space-y-8">
      {/* ================================================================ */}
      {/* NAVIGATION TABS UTAMA: Studio Mode Switcher                      */}
      {/* ================================================================ */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl max-w-2xl mx-auto border border-slate-200 dark:border-slate-700/80">
        <button
          type="button"
          onClick={() => setActiveMainTab('cards')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeMainTab === 'cards'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Pembuat Kartu Ucapan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('editor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeMainTab === 'editor'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-purple-500" />
          <span>Editor Gambar Cepat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeMainTab === 'templates'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutTemplate className="w-4 h-4 text-emerald-500" />
          <span>Template Siap Pakai</span>
        </button>
      </div>

      {/* ================================================================ */}
      {/* MODE 1: GREETING CARD MAKER WITH CATEGORIES & PHOTO UPLOAD       */}
      {/* ================================================================ */}
      {activeMainTab === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SISI KIRI: Controls & Form Settings (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-500" />
                <span>Pengaturan Kartu Ucapan</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pilih kategori acara, sesuaikan teks, dan unggah foto personal Anda.
              </p>
            </div>

            {/* 1. Category Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Kategori Ucapan:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'birthday' as CardCategoryKey, label: '🎂 Ulang Tahun' },
                  { key: 'teacher' as CardCategoryKey, label: '👩‍🏫 Hari Guru Nasional' },
                  { key: 'eid' as CardCategoryKey, label: '🌙 Hari Raya' },
                  { key: 'national' as CardCategoryKey, label: '🇮🇩 Hari Nasional' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleCategoryChange(item.key)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer border ${
                      cardState.category === item.key
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Theme / Gradient Palette Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tema Warna &amp; Gradasi:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CARD_THEMES[cardState.category].map((thm) => (
                  <button
                    key={thm.id}
                    type="button"
                    onClick={() => setCardState((prev) => ({ ...prev, themeId: thm.id }))}
                    className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition text-left ${
                      cardState.themeId === thm.id
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/40'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${thm.colors[0]}, ${thm.colors[1]})`,
                      }}
                    />
                    <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {thm.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Personal Photo Upload & Blending */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-purple-500" />
                  <span>Foto Personal (Opsional)</span>
                </label>
                {cardState.userPhoto && (
                  <button
                    type="button"
                    onClick={handleRemoveCardPhoto}
                    className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>

              {!cardState.userPhoto ? (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-indigo-500 transition cursor-pointer text-center bg-white dark:bg-slate-900">
                  <Upload className="w-5 h-5 text-indigo-500 mb-1" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Klik untuk Unggah Foto Anda
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, atau WebP (Maks 10 MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCardPhotoUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Gaya Penyematan Foto:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      {[
                        { id: 'frame-circle', label: 'Avatar Bulat' },
                        { id: 'frame-square', label: 'Bingkai Kotak' },
                        { id: 'background', label: 'Background Blend' },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() =>
                            setCardState((prev) => ({
                              ...prev,
                              photoBlendMode: mode.id as CardState['photoBlendMode'],
                            }))
                          }
                          className={`py-1.5 px-2 rounded-lg font-medium text-[11px] border cursor-pointer ${
                            cardState.photoBlendMode === mode.id
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {cardState.photoBlendMode === 'background' && (
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Transparansi Latar Foto:</span>
                        <span>{Math.round(cardState.photoOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={cardState.photoOpacity}
                        onChange={(e) =>
                          setCardState((prev) => ({
                            ...prev,
                            photoOpacity: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Text Customization Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Label / Badge Atas:
                </label>
                <input
                  type="text"
                  value={cardState.badgeText}
                  onChange={(e) => setCardState((prev) => ({ ...prev, badgeText: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Contoh: HAPPY BIRTHDAY"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Judul Utama (Headline):
                </label>
                <input
                  type="text"
                  value={cardState.title}
                  onChange={(e) => setCardState((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  placeholder="Contoh: Selamat Ulang Tahun!"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Penerima:
                </label>
                <input
                  type="text"
                  value={cardState.recipient}
                  onChange={(e) => setCardState((prev) => ({ ...prev, recipient: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Contoh: Untuk: Sahabat Terbaikku"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Pesan &amp; Doa Harapan:
                </label>
                <textarea
                  rows={3}
                  value={cardState.message}
                  onChange={(e) => setCardState((prev) => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                  placeholder="Tuliskan ucapan atau doa harapan Anda di sini..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama Pengirim:
                  </label>
                  <input
                    type="text"
                    value={cardState.sender}
                    onChange={(e) => setCardState((prev) => ({ ...prev, sender: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Contoh: Dari: Budi & Rekan"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Catatan Kaki (Footnote):
                  </label>
                  <input
                    type="text"
                    value={cardState.footnote}
                    onChange={(e) => setCardState((prev) => ({ ...prev, footnote: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Contoh: Penuh Berkah"
                  />
                </div>
              </div>
            </div>

            {/* 5. Font & Border Style */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Gaya Huruf:
                </label>
                <select
                  value={cardState.fontFamily}
                  onChange={(e) =>
                    setCardState((prev) => ({
                      ...prev,
                      fontFamily: e.target.value as CardState['fontFamily'],
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="serif">Elegan Klasik (Serif)</option>
                  <option value="sans">Modern Bersih (Sans)</option>
                  <option value="display">Tegas &amp; Berani (Display)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Bingkai Ornamen:
                </label>
                <select
                  value={cardState.borderStyle}
                  onChange={(e) =>
                    setCardState((prev) => ({
                      ...prev,
                      borderStyle: e.target.value as CardState['borderStyle'],
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="ornate">Emas Klasik (Ornate)</option>
                  <option value="modern">Modern Minimalis</option>
                  <option value="none">Tanpa Bingkai</option>
                </select>
              </div>
            </div>
          </div>

          {/* SISI KANAN: Live Canvas Preview & Download Action (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
              {/* Canvas Preview Container (Aspect Square) */}
              <div className="relative w-full max-w-[500px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-slate-200/60 dark:border-slate-800 bg-white">
                <canvas
                  ref={cardCanvasRef}
                  className="w-full h-full object-contain block"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              {/* Download Buttons Bar */}
              <div className="w-full max-w-[500px] mt-4 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadCard('png')}
                  disabled={isExportingCard}
                  className="w-full sm:flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExportingCard ? 'Menyiapkan...' : 'Unduh Kartu HD (.PNG)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadCard('jpeg')}
                  disabled={isExportingCard}
                  className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <span>Format JPG</span>
                </button>
              </div>

              {/* Privacy badge under preview */}
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% diproses di browser Anda — foto &amp; data ucapan tidak diunggah ke server.</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODE 2: QUICK IMAGE EDITOR (CROP, ROTATE, RESIZE, FILTERS)       */}
      {/* ================================================================ */}
      {activeMainTab === 'editor' && (
        <div className="space-y-6">
          {!editorImgElement ? (
            /* Upload State */
            <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Pilih Gambar untuk Diedit Cepat
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Crop rasio populer, putar 90°, ubah ukuran (resize), dan terapkan filter warna instan tanpa aplikasi berat.
                </p>
              </div>

              <label className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20 transition">
                <Upload className="w-4 h-4" />
                <span>Unggah Berkas Gambar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditorFileUpload}
                  className="hidden"
                />
              </label>

              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Aman &amp; Pribadi: Gambar diproses 100% di browser lokal.</span>
              </div>
            </div>
          ) : (
            /* Active Editor Interface */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* SISI KIRI: Controls Bar (5 Cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Alat Penyuntingan
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      {editorFile?.name ? `${editorFile.name} • ` : ''}{editorImgElement.naturalWidth} × {editorImgElement.naturalHeight} px
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetEditor}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* 1. Rotasi & Flip */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Rotasi &amp; Balik Cermin:</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleRotateCCW}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex flex-col items-center gap-1 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-[10px]">-90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRotateCW}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex flex-col items-center gap-1 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <RotateCw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-[10px]">+90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleFlipH}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer ${
                        flipH
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <FlipHorizontal className="w-4 h-4" />
                      <span className="text-[10px]">Flip H</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleFlipV}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer ${
                        flipV
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <FlipVertical className="w-4 h-4" />
                      <span className="text-[10px]">Flip V</span>
                    </button>
                  </div>
                </div>

                {/* 2. Crop Aspect Ratio */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Crop className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Rasio Potong (Crop Aspect Ratio):</span>
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 text-xs">
                    {[
                      { id: 'free', label: 'Bebas' },
                      { id: '1:1', label: '1:1 Persegi' },
                      { id: '4:5', label: '4:5 IG' },
                      { id: '16:9', label: '16:9' },
                      { id: '3:4', label: '3:4' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCropRatio(item.id as typeof cropRatio)}
                        className={`py-1.5 px-1 rounded-lg border text-center text-[10px] font-semibold cursor-pointer truncate ${
                          cropRatio === item.id
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Resize Controls */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Ubah Dimensi (Resize):</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Lebar (px)</span>
                      <input
                        type="number"
                        value={customWidth}
                        onChange={(e) => {
                          const val = Math.max(10, parseInt(e.target.value) || 10);
                          setCustomWidth(val);
                          if (keepAspectRatio && editorImgElement) {
                            const ratio = editorImgElement.naturalHeight / editorImgElement.naturalWidth;
                            setCustomHeight(Math.round(val * ratio));
                          }
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <span className="text-slate-400 pt-3">×</span>
                    <div className="flex-1">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Tinggi (px)</span>
                      <input
                        type="number"
                        value={customHeight}
                        onChange={(e) => {
                          const val = Math.max(10, parseInt(e.target.value) || 10);
                          setCustomHeight(val);
                          if (keepAspectRatio && editorImgElement) {
                            const ratio = editorImgElement.naturalWidth / editorImgElement.naturalHeight;
                            setCustomWidth(Math.round(val * ratio));
                          }
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Skala Cepat & Kunci Rasio */}
                  <div className="flex items-center justify-between gap-1.5 pt-1 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Skala:</span>
                      {[25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleApplyResizePercent(pct)}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center gap-1 text-slate-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={keepAspectRatio}
                        onChange={(e) => setKeepAspectRatio(e.target.checked)}
                        className="rounded accent-indigo-600"
                      />
                      <span>Kunci Rasio</span>
                    </label>
                  </div>
                </div>

                {/* 4. Filter Penyesuaian Warna (Brightness, Contrast, Saturation) */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Filter &amp; Efek Warna:</span>
                  </label>

                  {/* Kecerahan (Brightness) */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                      <span>Kecerahan:</span>
                      <span>{filters.brightness > 0 ? `+${filters.brightness}` : filters.brightness}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={filters.brightness}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, brightness: parseInt(e.target.value) }))
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  {/* Kontras (Contrast) */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                      <span>Kontras:</span>
                      <span>{filters.contrast > 0 ? `+${filters.contrast}` : filters.contrast}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={filters.contrast}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, contrast: parseInt(e.target.value) }))
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  {/* Saturasi (Saturation) */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                      <span>Saturasi:</span>
                      <span>{filters.saturation > 0 ? `+${filters.saturation}` : filters.saturation}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={filters.saturation}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, saturation: parseInt(e.target.value) }))
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  {/* Tombol Toggle Filter Cepat */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, grayscale: !prev.grayscale }))}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer ${
                        filters.grayscale
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      B&amp;W Hitam Putih
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, sepia: !prev.sepia }))}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer ${
                        filters.sepia
                          ? 'bg-amber-800 text-white border-amber-800'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Sepia Vintage
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, invert: !prev.invert }))}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer ${
                        filters.invert
                          ? 'bg-indigo-800 text-white border-indigo-800'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Invert Warna
                    </button>
                  </div>
                </div>

                {/* Pilih File Lain */}
                <div className="pt-2">
                  <label className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Ganti dengan gambar lain...</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditorFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* SISI KANAN: Canvas Live View & Instant Download (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
                  <div className="relative w-full max-h-[500px] flex items-center justify-center overflow-auto rounded-2xl bg-white/50 dark:bg-slate-900/50 p-2">
                    <canvas
                      ref={editorCanvasRef}
                      className="max-w-full max-h-[480px] object-contain rounded-xl shadow-lg block"
                    />
                  </div>

                  {/* Opsi Ekspor & Tombol Unduh */}
                  <div className="w-full mt-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">Format:</span>
                        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                          {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                            <button
                              key={fmt}
                              type="button"
                              onClick={() => setExportFormat(fmt)}
                              className={`px-2.5 py-1 text-[11px] font-bold uppercase cursor-pointer ${
                                exportFormat === fmt
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              {fmt === 'jpeg' ? 'JPG' : fmt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {exportFormat !== 'png' && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">Kualitas:</span>
                          <span className="text-[11px] font-bold">{exportQuality}%</span>
                          <input
                            type="range"
                            min="50"
                            max="100"
                            value={exportQuality}
                            onChange={(e) => setExportQuality(parseInt(e.target.value))}
                            className="w-20 accent-indigo-600"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadEditorResult}
                      disabled={isExportingEditor}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isExportingEditor ? 'Sedang Menyimpan...' : 'Unduh Hasil Edit Instan ⚡'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* MODE 3: READY-TO-USE TEMPLATES INTEGRATION                       */}
      {/* ================================================================ */}
      {activeMainTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-emerald-500" />
                <span>Katalog Template Desain Siap Unduh</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih template beresolusi tinggi (1200×1200 px). Unduh langsung atau buka di editor untuk mengedit nama &amp; pesan.
              </p>
            </div>

            {/* Filter Kategori Template */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'card', label: 'Kartu Ucapan' },
                { id: 'poster', label: 'Poster Promo' },
                { id: 'certificate', label: 'Sertifikat' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTemplateFilter(tab.id as typeof templateFilter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    templateFilter === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Mini Gallery Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Visual Thumbnail Art Box */}
                <div
                  className="h-48 w-full p-6 flex flex-col justify-between relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${tmpl.thumbnailColors[0]}, ${tmpl.thumbnailColors[1]})`,
                  }}
                >
                  {/* Decorative corner ring */}
                  <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full border-4 border-white/20 pointer-events-none" />
                  <div className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full border-4 border-white/20 pointer-events-none" />

                  <span className="inline-block self-start text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
                    {tmpl.categoryName}
                  </span>

                  <div className="relative z-10 text-center">
                    <p className="text-white text-xs font-semibold tracking-wide drop-shadow-sm">
                      {tmpl.defaultData.badgeText}
                    </p>
                    <h4
                      className="text-lg font-black tracking-tight drop-shadow-md mt-0.5"
                      style={{ color: tmpl.thumbnailColors[2] || '#FFFFFF' }}
                    >
                      {tmpl.defaultData.title}
                    </h4>
                  </div>

                  <p className="text-[10px] text-white/80 text-center truncate italic">
                    {tmpl.defaultData.recipient}
                  </p>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {tmpl.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleInstantDownloadTemplate(tmpl)}
                      className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh HD</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLoadTemplateIntoEditor(tmpl)}
                      className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Edit Teks</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
