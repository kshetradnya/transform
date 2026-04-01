import { toolState } from './tools.js';

class EditorEngine {
  constructor() {
    this.canvas = document.getElementById('main-canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.image = new Image();
    this.imageLoaded = false;
    
    // Viewport transform
    this.scale = 1;
    this.offset = { x: 0, y: 0 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    
    // Tools State internally
    this.state = { ...toolState };
    
    this.bindEvents();
  }

  bindEvents() {
    const container = document.getElementById('canvas-container');
    
    // Drag to Pan
    container.addEventListener('mousedown', (e) => {
      if (!this.imageLoaded) return;
      this.isDragging = true;
      this.dragStart = { x: e.clientX - this.offset.x, y: e.clientY - this.offset.y };
      container.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      container.style.cursor = 'default';
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.imageLoaded) {
        this.offset.x = e.clientX - this.dragStart.x;
        this.offset.y = e.clientY - this.dragStart.y;
        this.applyTransform();
      }
    });

    // Zoom
    let zoomLevelElem = document.querySelector('.zoom-level');
    container.addEventListener('wheel', (e) => {
      if (!this.imageLoaded) return;
      e.preventDefault();
      
      const zoomFactor = -e.deltaY * 0.001;
      this.scale += zoomFactor;
      this.scale = Math.max(0.1, Math.min(this.scale, 5)); // min 10% max 500%
      
      this.applyTransform();
      if(zoomLevelElem) {
         zoomLevelElem.innerText = `${Math.round(this.scale * 100)}%`;
      }
    });
  }

  applyTransform() {
    this.canvas.style.transform = `translate(${this.offset.x}px, ${this.offset.y}px) scale(${this.scale})`;
  }

  loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.image.onload = () => {
        this.imageLoaded = true;
        
        // Setup internal canvas size based on image original size
        this.canvas.width = this.image.width;
        this.canvas.height = this.image.height;
        
        // Reset transforms
        this.scale = Math.min(1, 800 / this.image.width, 600 / this.image.height); // Auto-fit roughly
        this.offset = { x: 0, y: 0 };
        this.applyTransform();
        let zoomLevelElem = document.querySelector('.zoom-level');
        if(zoomLevelElem) zoomLevelElem.innerText = `${Math.round(this.scale * 100)}%`;
        
        this.render();
      };
      this.image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  updateState(key, val) {
    if (this.state[key] !== undefined) {
      this.state[key] = val;
      this.render(); // Request animation frame logic usually, direct here
    }
  }

  applyTemplate(templateSettings) {
    // Reset to defaults first for pure overlay
    Object.keys(this.state).forEach(k => {
       this.state[k] = toolState[k]; // default
    });
    
    for (const [key, val] of Object.entries(templateSettings)) {
      if (this.state[key] !== undefined) {
        this.state[key] = val;
      }
    }
    
    this.render();
  }

  buildCSSFilterString() {
    // Map state to standard CSS filters for performance.
    // Advanced math like Curves/HSL is simulated via combination + overlay.
    let f = '';
    
    // Basic standard mappings
    f += `brightness(${this.state.brightness}%) `;
    f += `contrast(${this.state.contrast}%) `;
    f += `saturate(${this.state.saturation}%) `;
    f += `sepia(${this.state.sepia}%) `;
    f += `hue-rotate(${this.state.hueRotate}deg) `;
    f += `invert(${this.state.invert}%) `;
    f += `blur(${this.state.blur}px) `;
    
    // Simulated temperature (warm/cool) via sepia + hue or overlay
    // If temp < 5500, shift blue. If > 5500 shift yellow/orange.
    if(this.state.temperature !== 5500) {
      let diff = this.state.temperature - 5500;
      if (diff > 0) {
         // Warmer - add slight sepia + saturate
         f += `sepia(${Math.min(diff / 50, 40)}%) saturate(${100 + diff / 100}%) `;
      }
    }
    
    return f.trim();
  }

  render() {
    if (!this.imageLoaded) return;
    
    // Clear
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Apply core CSS filters string to context
    this.ctx.filter = this.buildCSSFilterString();
    
    // Global alpha for exposure simple simulation
    if (this.state.exposure < 0) {
      this.ctx.globalAlpha = 1 + (this.state.exposure / 100);
    } // Overexposure handled by brightness basically
    
    // Draw base Image
    this.ctx.drawImage(this.image, 0, 0);
    
    // Apply complex overlays (Vignette, Grain, Tint)
    this.applyOverlays();
  }

  applyOverlays() {
    // Reset filter for overlays
    this.ctx.filter = 'none';
    this.ctx.globalAlpha = 1.0;
    
    // Vignette
    if (this.state.vignette > 0) {
      this.ctx.globalCompositeOperation = 'multiply';
      const grd = this.ctx.createRadialGradient(
        this.canvas.width/2, this.canvas.height/2, Math.max(this.canvas.width, this.canvas.height) * (this.state.vignetteMidpoint/100) * 0.2, // inner
        this.canvas.width/2, this.canvas.height/2, Math.max(this.canvas.width, this.canvas.height) * 0.8  // outer
      );
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(1, `rgba(0,0,0,${this.state.vignette/100})`);
      this.ctx.fillStyle = grd;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Grain simulation (simplified noise pixel overlay)
    // For performance, we would usually use a repeating pattern overlay rather than draw per pixel
    if (this.state.grain > 0) {
       this.ctx.globalCompositeOperation = 'overlay';
       this.ctx.fillStyle = `rgba(128,128,128, ${this.state.grain / 500})`; // very subtle
       this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
    }
    
    // Reset
    this.ctx.globalCompositeOperation = 'source-over';
  }
}

export const engine = new EditorEngine();
