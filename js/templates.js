// ── Transform Presets ──────────────────────────────────────────────────────
// Each preset has a `preview` array of 2-3 CSS color strings used to paint
// a representative gradient swatch on the card thumbnail.

export const templateCategories = ['All', 'Cinematic', 'Anime', 'Vintage', 'Moody', 'Analog', 'Bright & Airy', 'Trends'];

export const templatesList = [

  // ═══════════════════════════════════════════════════════════════
  //  CINEMATIC
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'c1', name: 'Hollywood Teal & Orange', category: 'Cinematic',
    preview: ['#1a4a4a', '#c85a1a'],
    settings: { contrast: 120, saturation: 110, temperature: 5000, tint: 10, vignette: 30 }
  },
  {
    id: 'c2', name: 'Noir Drama', category: 'Cinematic',
    preview: ['#111', '#444'],
    settings: { brightness: 90, contrast: 155, saturation: 0, sepia: 10, vignette: 50 }
  },
  {
    id: 'c3', name: 'Neon Metropolis', category: 'Cinematic',
    preview: ['#0f0c29', '#302b63', '#8e00d4'],
    settings: { contrast: 140, saturation: 150, hueRotate: 280, vignette: 40, temperature: 4500 }
  },
  {
    id: 'c4', name: 'Blade Runner Dusk', category: 'Cinematic',
    preview: ['#1a0533', '#a8291f'],
    settings: { contrast: 130, saturation: 120, temperature: 3800, tint: 20, vignette: 45, shadows: -20 }
  },
  {
    id: 'c5', name: 'Interstellar Cold', category: 'Cinematic',
    preview: ['#0d1b2a', '#1b4f72'],
    settings: { brightness: 92, contrast: 125, saturation: 85, temperature: 4200, vignette: 35 }
  },
  {
    id: 'c6', name: 'Amber Blockbuster', category: 'Cinematic',
    preview: ['#2b1800', '#c87941'],
    settings: { contrast: 115, saturation: 105, temperature: 7500, sepia: 15, vignette: 25 }
  },
  {
    id: 'c7', name: 'Emerald Heist', category: 'Cinematic',
    preview: ['#0b2118', '#1e6641'],
    settings: { contrast: 125, saturation: 90, hueRotate: 150, vignette: 30, temperature: 5200 }
  },
  {
    id: 'c8', name: 'Silver Screen', category: 'Cinematic',
    preview: ['#b0b0b0', '#606060'],
    settings: { brightness: 95, contrast: 110, saturation: 20, sepia: 5, vignette: 20 }
  },

  // ═══════════════════════════════════════════════════════════════
  //  ANIME
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'a1', name: 'Ghibli Meadow', category: 'Anime',
    preview: ['#a8d8a4', '#fffde7'],
    settings: { brightness: 112, contrast: 104, saturation: 130, tint: -5, temperature: 6500 }
  },
  {
    id: 'a2', name: 'Akira Neon Tokyo', category: 'Anime',
    preview: ['#1a0030', '#ff003c'],
    settings: { contrast: 135, saturation: 145, hueRotate: 320, tint: 20, vignette: 30 }
  },
  {
    id: 'a3', name: 'Shinkai Blue Hour', category: 'Anime',
    preview: ['#1a2a6c', '#b21f1f', '#fdbb2d'],
    settings: { brightness: 115, contrast: 110, saturation: 125, hueRotate: 200, temperature: 5000 }
  },
  {
    id: 'a4', name: 'Tokyo Ghoul Crimson', category: 'Anime',
    preview: ['#1a0000', '#8b0000'],
    settings: { brightness: 85, contrast: 150, saturation: 80, hueRotate: 340, vignette: 60, shadows: -30, sepia: 20 }
  },
  {
    id: 'a5', name: 'Naruto Sunset', category: 'Anime',
    preview: ['#ee9921', '#ffcc00'],
    settings: { brightness: 108, contrast: 118, saturation: 160, temperature: 7200, tint: 5, shadows: 10 }
  },
  {
    id: 'a6', name: 'One Piece Grand Line', category: 'Anime',
    preview: ['#006994', '#00b4d8'],
    settings: { brightness: 110, contrast: 115, saturation: 135, temperature: 5800, hueRotate: 195, tint: -8 }
  },
  {
    id: 'a7', name: 'Evangelion Void', category: 'Anime',
    preview: ['#000000', '#1a1a2e'],
    settings: { brightness: 80, contrast: 160, saturation: 60, hueRotate: 260, vignette: 70, sepia: 5 }
  },
  {
    id: 'a8', name: 'Demon Slayer Haori', category: 'Anime',
    preview: ['#c0392b', '#2c3e50'],
    settings: { contrast: 128, saturation: 135, temperature: 5500, tint: 8, vignette: 25 }
  },
  {
    id: 'a9', name: 'JoJo Overdrive', category: 'Anime',
    preview: ['#f39c12', '#8e44ad'],
    settings: { contrast: 145, saturation: 155, hueRotate: 30, tint: 15, vignette: 20 }
  },
  {
    id: 'a10', name: 'Bleach Soul Society', category: 'Anime',
    preview: ['#eceff1', '#90a4ae'],
    settings: { brightness: 105, contrast: 95, saturation: 65, temperature: 5000, tint: -10 }
  },
  {
    id: 'a11', name: 'Chainsaw Man Blood', category: 'Anime',
    preview: ['#7f0000', '#1a0000'],
    settings: { brightness: 88, contrast: 140, saturation: 100, hueRotate: 350, vignette: 55, sepia: 25 }
  },
  {
    id: 'a12', name: 'Attack on Titan Walls', category: 'Anime',
    preview: ['#78716c', '#44403c'],
    settings: { brightness: 90, contrast: 130, saturation: 50, temperature: 5000, vignette: 40, sepia: 10 }
  },
  {
    id: 'a13', name: 'Vinland Saga Norse', category: 'Anime',
    preview: ['#94a3b8', '#475569'],
    settings: { brightness: 95, contrast: 115, saturation: 70, temperature: 4500, tint: -15, sepia: 15 }
  },

  // ═══════════════════════════════════════════════════════════════
  //  VINTAGE
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'v1', name: 'Polaroid Fade', category: 'Vintage',
    preview: ['#f5e6c8', '#d4b896'],
    settings: { brightness: 120, contrast: 80, sepia: 40, saturation: 80 }
  },
  {
    id: 'v2', name: 'Super 8 Flicker', category: 'Vintage',
    preview: ['#c8a96e', '#8b6914'],
    settings: { brightness: 108, contrast: 88, sepia: 55, saturation: 85, grain: 35 }
  },
  {
    id: 'v3', name: 'Lomography Cross', category: 'Vintage',
    preview: ['#e67e22', '#8e44ad'],
    settings: { contrast: 130, saturation: 150, tint: 25, sepia: 10, grain: 20 }
  },
  {
    id: 'v4', name: '70s Sunset Drive', category: 'Vintage',
    preview: ['#e8945a', '#c0392b'],
    settings: { brightness: 105, contrast: 90, saturation: 120, temperature: 7000, sepia: 30 }
  },

  // ═══════════════════════════════════════════════════════════════
  //  MOODY
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'm1', name: 'Midnight Blue', category: 'Moody',
    preview: ['#0f0c29', '#302b63'],
    settings: { brightness: 85, contrast: 130, sepia: 30, hueRotate: 210, vignette: 40 }
  },
  {
    id: 'm2', name: 'Autumn Requiem', category: 'Moody',
    preview: ['#78350f', '#b45309'],
    settings: { contrast: 112, saturation: 115, temperature: 7000, vignette: 35, shadows: -15 }
  },
  {
    id: 'm3', name: 'Dark Academia', category: 'Moody',
    preview: ['#292524', '#78716c'],
    settings: { brightness: 88, contrast: 120, saturation: 60, temperature: 5200, sepia: 20, vignette: 45 }
  },
  {
    id: 'm4', name: 'Rainy Window', category: 'Moody',
    preview: ['#334155', '#64748b'],
    settings: { brightness: 88, contrast: 110, saturation: 70, temperature: 4400, vignette: 30, shadows: -10 }
  },

  // ═══════════════════════════════════════════════════════════════
  //  ANALOG
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'an1', name: 'Kodak Portra 400', category: 'Analog',
    preview: ['#f5deb3', '#d2a679'],
    settings: { contrast: 105, saturation: 110, sepia: 20, temperature: 5800, grain: 15 }
  },
  {
    id: 'an2', name: 'Fuji Pro 400H', category: 'Analog',
    preview: ['#d4edda', '#a8d5b5'],
    settings: { contrast: 90, saturation: 105, tint: -10, temperature: 4800, grain: 10 }
  },
  {
    id: 'an3', name: 'Ilford HP5 B&W', category: 'Analog',
    preview: ['#f5f5f5', '#2d2d2d'],
    settings: { brightness: 95, contrast: 138, saturation: 0, grain: 30, sepia: 3 }
  },
  {
    id: 'an4', name: 'Cinestill 800T', category: 'Analog',
    preview: ['#1a0a2e', '#ff6b6b'],
    settings: { brightness: 90, contrast: 120, saturation: 115, temperature: 3500, grain: 25, vignette: 20 }
  },
  {
    id: 'an5', name: 'Agfa Optima Vista', category: 'Analog',
    preview: ['#f0e68c', '#e8a44a'],
    settings: { contrast: 100, saturation: 120, temperature: 6200, sepia: 12, grain: 8 }
  },

  // ═══════════════════════════════════════════════════════════════
  //  BRIGHT & AIRY
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'b1', name: 'Golden Hour Glow', category: 'Bright & Airy',
    preview: ['#ffecd2', '#fcb69f'],
    settings: { brightness: 108, contrast: 105, saturation: 118, temperature: 6500 }
  },
  {
    id: 'b2', name: 'Cottagecore Dream', category: 'Bright & Airy',
    preview: ['#e8f5e9', '#c8e6c9'],
    settings: { brightness: 112, contrast: 95, saturation: 110, temperature: 6200, shadows: 15 }
  },
  {
    id: 'b3', name: 'Aura Pastel', category: 'Bright & Airy',
    preview: ['#fce4ec', '#e1bee7'],
    settings: { brightness: 115, contrast: 90, saturation: 115, tint: -5, temperature: 6800 }
  },
  {
    id: 'b4', name: 'Wedding Porcelain', category: 'Bright & Airy',
    preview: ['#ffffff', '#f5f0eb'],
    settings: { brightness: 112, contrast: 98, saturation: 90, temperature: 5700 }
  },
  {
    id: 'b5', name: 'Spring Blossom', category: 'Bright & Airy',
    preview: ['#ffd1dc', '#ffb7c5'],
    settings: { brightness: 110, contrast: 100, saturation: 120, temperature: 6500, tint: -8 }
  },

  // ═══════════════════════════════════════════════════════════════
  //  TRENDS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'tr1', name: 'Blurry Face', category: 'Trends',
    preview: ['#1e293b', '#475569'],
    isTrend: true, trendType: 'face-blur',
    settings: { blur: 0 }  // blur applied selectively by trend logic
  },
  {
    id: 'tr2', name: 'Y2K Flash', category: 'Trends',
    preview: ['#00f5ff', '#ff00c8'],
    settings: { brightness: 115, contrast: 130, saturation: 160, temperature: 5000, tint: -10, vignette: -10 }
  },
  {
    id: 'tr3', name: 'Matte Noir', category: 'Trends',
    preview: ['#3d3d3d', '#7a7a7a'],
    settings: { brightness: 95, contrast: 85, saturation: 75, shadows: 25, vignette: 10 }
  },
  {
    id: 'tr4', name: 'Aura Haze', category: 'Trends',
    preview: ['#a78bfa', '#f472b6'],
    settings: { brightness: 108, contrast: 92, saturation: 135, tint: -12, temperature: 6000, vignette: -15 }
  },
  {
    id: 'tr5', name: 'Chromatic Drift', category: 'Trends',
    preview: ['#ef4444', '#3b82f6'],
    settings: { contrast: 120, saturation: 130, hueRotate: 5, vignette: 15 }
  },
  {
    id: 'tr6', name: 'Dehaze Dreamscape', category: 'Trends',
    preview: ['#e0f2fe', '#bae6fd'],
    settings: { brightness: 112, contrast: 90, saturation: 100, temperature: 6500, shadows: 20, tint: -5 }
  },
  {
    id: 'tr7', name: 'Hyperpop Glitch', category: 'Trends',
    preview: ['#ff006e', '#8338ec'],
    settings: { contrast: 145, saturation: 165, hueRotate: 290, vignette: 20, tint: 20 }
  },
  {
    id: 'tr8', name: 'Disposable Cam', category: 'Trends',
    preview: ['#d4b896', '#f5e0c3'],
    settings: { brightness: 110, contrast: 88, saturation: 95, sepia: 25, grain: 40, temperature: 5900 }
  },
  {
    id: 'tr9', name: 'Moody Mist', category: 'Trends',
    preview: ['#94a3b8', '#cbd5e1'],
    settings: { brightness: 100, contrast: 88, saturation: 70, temperature: 4600, shadows: 10, vignette: 20 }
  },
  {
    id: 'tr10', name: 'Dark Academia', category: 'Trends',
    preview: ['#292524', '#57534e'],
    settings: { brightness: 88, contrast: 118, saturation: 55, sepia: 18, temperature: 5000, vignette: 38 }
  },
];
