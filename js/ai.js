import { templatesList } from './templates.js';

class AIAssistant {
  constructor(engineRef, uiRef) {
    this.engine = engineRef;
    this.ui = uiRef; 

    // NLP Dictionaries for intent matching
    this.dictionary = {
      increase_brightness: ['bright', 'light', 'sun', 'shine', 'white', 'pop', 'expose', 'brighter'],
      decrease_brightness: ['dark', 'shadow', 'black', 'dim', 'moody', 'darker'],
      increase_temperature: ['warm', 'orange', 'yellow', 'hot', 'summer', 'sunny', 'warmer', 'golden'],
      decrease_temperature: ['cool', 'blue', 'cold', 'winter', 'chill', 'freeze', 'cooler', 'icy'],
      increase_contrast: ['punch', 'vivid', 'hard', 'cinematic', 'sharp', 'intense', 'contrast'],
      decrease_contrast: ['flat', 'fade', 'washed', 'dull'],
      increase_saturation: ['color', 'colorful', 'rich', 'vibrant', 'saturate', 'saturation'],
      decrease_saturation: ['pale', 'gray', 'grey', 'monochrome', 'desaturate'],
      increase_blur: ['soft', 'blur', 'dream', 'dreamy', 'smooth', 'out of focus'],
      vintage: ['vintage', 'old', 'retro', 'film', 'analog', 'grain', 'sepia', 'classic']
    };

    // Words that scale the degree of the effect
    this.multipliers = {
      'very': 2, 'really': 2, 'way': 3, 'extremely': 3, 'much': 2, 'lots': 2, 'too': 2,
      'bit': 0.5, 'little': 0.5, 'slightly': 0.5, 'touch': 0.5, 'somewhat': 0.5
    };
  }

  processText(input) {
    const text = input.toLowerCase();
    const words = text.replace(/[^\w\s]/gi, '').split(/\s+/);
    
    let appliedSettings = {};
    let handled = false;
    let currentMultiplier = 1;

    // Scan through words sequentially to detect context
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // Update multiplier if we find an intensity word
        if (this.multipliers[word]) {
            currentMultiplier = this.multipliers[word];
            continue;
        }

        // Check against dictionaries
        if (this.dictionary.increase_brightness.includes(word)) {
            appliedSettings.brightness = (this.engine.state.brightness || 100) + (30 * currentMultiplier);
            appliedSettings.exposure = (this.engine.state.exposure || 0) + (20 * currentMultiplier);
            handled = true;
        }
        if (this.dictionary.decrease_brightness.includes(word)) {
            appliedSettings.brightness = Math.max(0, (this.engine.state.brightness || 100) - (30 * currentMultiplier));
            handled = true;
        }
        if (this.dictionary.increase_temperature.includes(word)) {
            appliedSettings.temperature = (this.engine.state.temperature || 5500) + (1500 * currentMultiplier);
            handled = true;
        }
        if (this.dictionary.decrease_temperature.includes(word)) {
            appliedSettings.temperature = Math.max(1000, (this.engine.state.temperature || 5500) - (1500 * currentMultiplier));
            handled = true;
        }
        if (this.dictionary.increase_contrast.includes(word)) {
            appliedSettings.contrast = (this.engine.state.contrast || 100) + (40 * currentMultiplier);
            handled = true;
        }
        if (this.dictionary.decrease_contrast.includes(word)) {
            appliedSettings.contrast = Math.max(0, (this.engine.state.contrast || 100) - (40 * currentMultiplier));
            handled = true;
        }
        if (this.dictionary.increase_saturation.includes(word)) {
            appliedSettings.saturation = (this.engine.state.saturation || 100) + (50 * currentMultiplier);
            appliedSettings.vibrance = (this.engine.state.vibrance || 0) + (20 * currentMultiplier);
            handled = true;
        }
        if (this.dictionary.decrease_saturation.includes(word)) {
            appliedSettings.saturation = Math.max(0, (this.engine.state.saturation || 100) - (50 * currentMultiplier));
            handled = true;
        }
        if (this.dictionary.increase_blur.includes(word)) {
            appliedSettings.blur = (this.engine.state.blur || 0) + (5 * currentMultiplier);
            handled = true;
        }
        if (this.dictionary.vintage.includes(word)) {
            // Apply a vintage style package directly
            appliedSettings.sepia = (this.engine.state.sepia || 0) + (30 * currentMultiplier);
            appliedSettings.grain = (this.engine.state.grain || 0) + (40 * currentMultiplier);
            appliedSettings.contrast = (this.engine.state.contrast || 100) - (15 * currentMultiplier);
            handled = true;
        }

        // Reset multiplier after matching a semantic token
        if (handled) currentMultiplier = 1;
    }

    let responseText = "Done! I've adjusted the settings for you.";

    if (!handled) {
      if (text.includes('make it look') || text.includes('style')) {
         const randomTemplate = templatesList[Math.floor(Math.random() * templatesList.length)];
         appliedSettings = { ...randomTemplate.settings };
         responseText = `I interpreted that as a "${randomTemplate.name}" aesthetic. Applied!`;
         handled = true;
      } else {
         responseText = "Hmm, I didn't quite catch the specific adjustments you wanted. Try describing the lighting, colors, or mood (e.g. 'make it extremely warm and slightly moody').";
      }
    }
    
    // Apply state updates physically through engine
    if (handled && Object.keys(appliedSettings).length > 0) {
      this.engine.applyTemplate(appliedSettings);
      // Sync UI sliders
      this.ui.syncSlidersToState(this.engine.state);
    }
    
    return responseText;
  }

  addMessage(container, text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${type}`;
    msgDiv.innerHTML = `<p>${text}</p>`;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  }
}

export const initAI = (engineRef, uiRef) => {
  return new AIAssistant(engineRef, uiRef);
};
