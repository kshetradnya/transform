import { templatesList } from './templates.js';

class AIAssistant {
  constructor(engineRef, uiRef) {
    this.engine = engineRef;
    this.ui = uiRef; 
    
    // AI Keyword mapping to settings
    this.intentMap = {
      'moody': { brightness: 80, contrast: 130, saturation: 90, vignette: 40, temperature: 5000 },
      'bright': { brightness: 120, contrast: 110, exposure: 10, highlights: 20 },
      'vibrant': { saturation: 150, vibrance: 60, contrast: 115 },
      'vintage': { sepia: 40, saturation: 80, grain: 30, contrast: 90 },
      'cool': { temperature: 4000, tint: -10 },
      'warm': { temperature: 7000, tint: 10 },
      'cyberpunk': { contrast: 140, saturation: 140, hueRotate: 300, vignette: 20 },
      'cinematic': { contrast: 125, saturation: 105, vignette: 30 }
    };
  }

  processText(input) {
    const text = input.toLowerCase();
    
    // Determine action
    let handled = false;
    let appliedSettings = {};
    let responseText = "I applied those settings for you. Let me know if you want it further adjusted!";
    
    // Check keyword maps
    for (const [keyword, settings] of Object.entries(this.intentMap)) {
      if (text.includes(keyword)) {
        appliedSettings = { ...appliedSettings, ...settings };
        handled = true;
      }
    }
    
    // Handle specific slider requests like "increase contrast" or "more saturation"
    if (text.includes('contrast')) {
      if (text.includes('more') || text.includes('increase')) {
         appliedSettings.contrast = Math.min((this.engine.state.contrast || 100) + 30, 200);
         handled = true;
      } else if (text.includes('less') || text.includes('decrease')) {
         appliedSettings.contrast = Math.max((this.engine.state.contrast || 100) - 30, 0);
         handled = true;
      }
    }
    
    if (text.includes('brightness') || text.includes('exposure')) {
       if (text.includes('more') || text.includes('increase') || text.includes('brighter')) {
          appliedSettings.brightness = Math.min((this.engine.state.brightness || 100) + 30, 200);
          handled = true;
       } else if (text.includes('less') || text.includes('decrease') || text.includes('darker')) {
          appliedSettings.brightness = Math.max((this.engine.state.brightness || 100) - 30, 0);
          handled = true;
       }
    }

    if (!handled) {
      // Pick a random template if totally confused but wants a look
      if (text.includes('make it look') || text.includes('style')) {
         const randomTemplate = templatesList[Math.floor(Math.random() * templatesList.length)];
         appliedSettings = { ...randomTemplate.settings };
         responseText = `I thought the "${randomTemplate.name}" style might fit well! Applied.`;
         handled = true;
      } else {
         responseText = "I'm not exactly sure what you mean. Try terms like 'Make it vintage', 'Increase brightness', or 'Moody cinematic'.";
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
