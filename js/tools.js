// 30 Core Photo Editing Tools mapped to categories.

export const editorTools = [
  // --- BASIC (8 tools) ---
  { id: 'exposure', name: 'Exposure', min: -100, max: 100, default: 0, category: 'basic', unit: '%' },
  { id: 'brightness', name: 'Brightness', min: 0, max: 200, default: 100, category: 'basic', unit: '%' },
  { id: 'contrast', name: 'Contrast', min: 0, max: 200, default: 100, category: 'basic', unit: '%' },
  { id: 'saturation', name: 'Saturation', min: 0, max: 200, default: 100, category: 'basic', unit: '%' },
  { id: 'vibrance', name: 'Vibrance', min: -100, max: 100, default: 0, category: 'basic', unit: '%' }, /* Simulated via JS filter */
  { id: 'temperature', name: 'Temperature', min: 2000, max: 10000, default: 5500, category: 'basic', unit: 'K' },
  { id: 'tint', name: 'Tint', min: -100, max: 100, default: 0, category: 'basic', unit: '%' },

  // --- HIGHLIGHTS/SHADOWS (4 tools) ---
  { id: 'highlights', name: 'Highlights', min: -100, max: 100, default: 0, category: 'basic', unit: '%' },
  { id: 'shadows', name: 'Shadows', min: -100, max: 100, default: 0, category: 'basic', unit: '%' },
  { id: 'whites', name: 'Whites', min: -100, max: 100, default: 0, category: 'basic', unit: '%' },
  { id: 'blacks', name: 'Blacks', min: -100, max: 100, default: 0, category: 'basic', unit: '%' },

  // --- DETAIL (6 tools) ---
  { id: 'clarity', name: 'Clarity', min: -100, max: 100, default: 0, category: 'detail', unit: '%' },
  { id: 'texture', name: 'Texture', min: -100, max: 100, default: 0, category: 'detail', unit: '%' },
  { id: 'sharpness', name: 'Sharpness', min: 0, max: 100, default: 0, category: 'detail', unit: '%' },
  { id: 'blur', name: 'Gaussian Blur', min: 0, max: 20, default: 0, category: 'detail', unit: 'px' },
  { id: 'noiseReduction', name: 'Noise Reduce', min: 0, max: 100, default: 0, category: 'detail', unit: '%' },

  // --- COLOR ADVANCED HSL (6 tools) ---
  { id: 'hueR', name: 'Red Hue', min: -100, max: 100, default: 0, category: 'color', unit: '' },
  { id: 'satR', name: 'Red Saturation', min: -100, max: 100, default: 0, category: 'color', unit: '' },
  { id: 'lumR', name: 'Red Luminance', min: -100, max: 100, default: 0, category: 'color', unit: '' },
  { id: 'hueB', name: 'Blue Hue', min: -100, max: 100, default: 0, category: 'color', unit: '' },
  { id: 'satB', name: 'Blue Saturation', min: -100, max: 100, default: 0, category: 'color', unit: '' },
  { id: 'lumB', name: 'Blue Luminance', min: -100, max: 100, default: 0, category: 'color', unit: '' },
  
  // --- FX (7 tools) ---
  { id: 'vignette', name: 'Vignette Amt', min: -100, max: 100, default: 0, category: 'fx', unit: '%' },
  { id: 'vignetteMidpoint', name: 'Vignette Mid', min: 0, max: 100, default: 50, category: 'fx', unit: '%' },
  { id: 'grain', name: 'Film Grain', min: 0, max: 100, default: 0, category: 'fx', unit: '%' },
  { id: 'sepia', name: 'Sepia', min: 0, max: 100, default: 0, category: 'fx', unit: '%' },
  { id: 'hueRotate', name: 'Hue Rotation', min: 0, max: 360, default: 0, category: 'fx', unit: '°' },
  { id: 'invert', name: 'Invert', min: 0, max: 100, default: 0, category: 'fx', unit: '%' },
  { id: 'splitToning', name: 'Split Toning', min: 0, max: 100, default: 0, category: 'fx', unit: '%' }

];

// Expose state management block
export const toolState = editorTools.reduce((acc, tool) => {
  acc[tool.id] = tool.default;
  return acc;
}, {});
