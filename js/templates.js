// 60 Custom Photo Templates (Filters)

const categories = ['Cinematic', 'Anime', 'Vintage', 'Moody', 'Analog', 'Bright & Airy'];

// We'll define specific core hand-crafted ones and then programmatically generate the rest to hit 60 efficiently.
const handCraftedTemplates = [
  { id: 't1', name: 'Hollywood Teal & Orange', category: 'Cinematic', settings: { contrast: 120, saturation: 110, temperature: 5000, tint: 10 } },
  { id: 't2', name: 'Noir Drama', category: 'Cinematic', settings: { brightness: 90, contrast: 150, saturation: 0, sepia: 10 } },
  { id: 't3', name: 'Ghibli Summer', category: 'Anime', settings: { brightness: 110, contrast: 105, saturation: 130, tint: -5, temperature: 6500 } },
  { id: 't4', name: 'Akira Cyberpunk', category: 'Anime', settings: { contrast: 130, saturation: 140, hue: 320, tint: 20 } },
  { id: 't5', name: 'Makoto Shinkai Sky', category: 'Anime', settings: { brightness: 115, contrast: 110, saturation: 125, hue: 200 } },
  { id: 't6', name: 'Kodak Portra 400', category: 'Analog', settings: { contrast: 105, saturation: 110, sepia: 20, temperature: 5800 } },
  { id: 't7', name: 'Fuji Pro 400H', category: 'Analog', settings: { contrast: 90, saturation: 105, tint: -10, temperature: 4800 } },
  { id: 't8', name: 'Midnight Blue', category: 'Moody', settings: { brightness: 85, contrast: 130, sepia: 30, hue: 210 } },
  { id: 't9', name: 'Autumn Leaves', category: 'Moody', settings: { contrast: 110, saturation: 120, temperature: 7000 } },
  { id: 't10', name: 'Polaroid Fade', category: 'Vintage', settings: { brightness: 120, contrast: 80, sepia: 40, saturation: 80 } },
  { id: 't11', name: 'Golden Hour', category: 'Bright & Airy', settings: { brightness: 105, contrast: 105, saturation: 115, temperature: 6500 } },
  { id: 't12', name: 'Wedding Clean', category: 'Bright & Airy', settings: { brightness: 110, contrast: 100, saturation: 95 } }
];

// Generate exactly 60
const generateTemplates = () => {
  const result = [...handCraftedTemplates];
  let idCounter = handCraftedTemplates.length + 1;
  
  const bases = [
    { baseName: 'CineMatrix', cat: 'Cinematic', baseSets: { contrast: 115, saturation: 105 } },
    { baseName: 'Neon City', cat: 'Cinematic', baseSets: { contrast: 140, saturation: 130 } },
    { baseName: 'Mecha Vibe', cat: 'Anime', baseSets: { contrast: 125, saturation: 110, tint: 15 } },
    { baseName: 'Lo-Fi Chill', cat: 'Vintage', baseSets: { brightness: 110, contrast: 85, sepia: 50 } },
    { baseName: 'Dark Alley', cat: 'Moody', baseSets: { brightness: 80, contrast: 120, saturation: 90 } },
    { baseName: 'Ilford B&W', cat: 'Analog', baseSets: { brightness: 95, contrast: 135, saturation: 0 } }
  ];

  while(result.length < 60) {
    const base = bases[idCounter % bases.length];
    const variation = Math.floor(Math.random() * 30) - 15;
    
    // Copy base settings and mutate slightly
    const settings = { ...base.baseSets };
    if (settings.contrast) settings.contrast += variation;
    if (settings.saturation && settings.saturation > 0) settings.saturation += Math.floor(variation / 2);
    
    result.push({
      id: `t${idCounter}`,
      name: `${base.baseName} V${Math.floor(idCounter / bases.length)}`,
      category: base.cat,
      settings: settings
    });
    idCounter++;
  }
  
  return result;
};

export const templatesList = generateTemplates();
export const templateCategories = categories;
