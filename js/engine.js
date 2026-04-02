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
      this.render();
    }
  }

  applyTemplate(templateSettings) {
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
    let f = '';
    
    let totalBrightness = this.state.brightness + this.state.exposure;
    f += `brightness(${Math.max(0, totalBrightness)}%) `;
    
    let totalContrast = this.state.contrast;
    if (this.state.clarity > 0) totalContrast += (this.state.clarity / 2); // Simulating clarity
    f += `contrast(${Math.max(0, totalContrast)}%) `;
    
    let totalSaturation = this.state.saturation + this.state.vibrance;
    f += `saturate(${Math.max(0, totalSaturation)}%) `;
    
    f += `sepia(${this.state.sepia}%) `;
    f += `hue-rotate(${this.state.hueRotate}deg) `;
    f += `invert(${this.state.invert}%) `;
    f += `blur(${this.state.blur}px) `;
    
    return f.trim();
  }

  render() {
    if (!this.imageLoaded) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.filter = this.buildCSSFilterString();
    
    // Draw base Image
    this.ctx.globalAlpha = 1.0;
    this.ctx.drawImage(this.image, 0, 0);
    
    this.applyOverlays();
  }

  applyOverlays() {
    this.ctx.filter = 'none';
    this.ctx.globalAlpha = 1.0;
    
    // Temperature Overlay
    if (this.state.temperature !== 5500) {
      this.ctx.globalCompositeOperation = 'overlay';
      let diff = this.state.temperature - 5500;
      if (diff > 0) { // Warm
        this.ctx.fillStyle = `rgba(255, 140, 0, ${Math.min(diff / 15000, 0.4)})`;
      } else { // Cool
        this.ctx.fillStyle = `rgba(0, 130, 255, ${Math.min(Math.abs(diff) / 10000, 0.4)})`;
      }
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Tint Overlay
    if (this.state.tint !== 0) {
      this.ctx.globalCompositeOperation = 'overlay';
      if (this.state.tint > 0) { // Magenta
        this.ctx.fillStyle = `rgba(255, 0, 255, ${Math.min(this.state.tint / 300, 0.3)})`;
      } else { // Green
        this.ctx.fillStyle = `rgba(0, 255, 0, ${Math.min(Math.abs(this.state.tint) / 300, 0.3)})`;
      }
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Shadows & Highlights rough simulation via soft-light
    if (this.state.shadows > 0) {
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillStyle = `rgba(255,255,255, ${this.state.shadows/500})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else if (this.state.shadows < 0) {
        this.ctx.globalCompositeOperation = 'multiply';
        this.ctx.fillStyle = `rgba(0,0,0, ${Math.abs(this.state.shadows)/500})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Vignette
    if (this.state.vignette > 0) {
      this.ctx.globalCompositeOperation = 'multiply';
      const grd = this.ctx.createRadialGradient(
        this.canvas.width/2, this.canvas.height/2, Math.max(this.canvas.width, this.canvas.height) * (this.state.vignetteMidpoint/100) * 0.2, // inner
        this.canvas.width/2, this.canvas.height/2, Math.max(this.canvas.width, this.canvas.height) * 1.0  // outer
      );
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(1, `rgba(0,0,0,${Math.min(this.state.vignette/50, 1)})`); // Amplified
      this.ctx.fillStyle = grd;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Reset
    this.ctx.globalCompositeOperation = 'source-over';
  }
}

export const engine = new EditorEngine();
