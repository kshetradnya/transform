import { engine } from './engine.js';
import { editorTools } from './tools.js';
import { templatesList, templateCategories } from './templates.js';
import { initAI } from './ai.js';

class AppUI {
  constructor() {
    this.initCursor();
    this.renderTools();
    this.renderTemplates();
    this.bindEvents();
    
    this.ai = initAI(engine, this); 
    this.bindAIEvents();
  }

  // --- Fluid Cursor ---
  initCursor() {
    const dot = document.getElementById('cursor-dot');
    const glow = document.getElementById('cursor-glow');

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    
    // Slow follow for glow
    let glowX = x;
    let glowY = y;

    window.addEventListener('mousemove', (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
    });

    const renderCursor = () => {
      // Lerp for smooth trailing glow
      glowX += (x - glowX) * 0.15;
      glowY += (y - glowY) * 0.15;
      glow.style.left = `${glowX}px`;
      glow.style.top = `${glowY}px`;
      requestAnimationFrame(renderCursor);
    };
    renderCursor();
    
    // Magnetic Hover Hooks
    document.querySelectorAll('.magnetic, button, .template-card').forEach(el => {
       el.addEventListener('mouseenter', () => document.body.classList.add('hover-interactive'));
       el.addEventListener('mouseleave', () => document.body.classList.remove('hover-interactive'));
    });
  }

  // --- Render 30 Tools in Sidebar ---
  renderTools() {
    const container = document.getElementById('tools-container');
    const categories = { basic: [], color: [], detail: [], fx: [] };
    
    // Group tools
    editorTools.forEach(t => {
      if(categories[t.category]) categories[t.category].push(t);
    });
    
    // Generate tabs content
    let html = '';
    for (const [cat, tools] of Object.entries(categories)) {
      html += `<div class="tool-section ${cat}-section" style="display: ${cat === 'basic' ? 'block' : 'none'}">`;
      tools.forEach(tool => {
         html += `
          <div class="tool-group">
            <div class="tool-header">
              <span>${tool.name}</span>
              <span class="tool-val" id="val-${tool.id}">${tool.default}${tool.unit}</span>
            </div>
            <input type="range" class="tool-slider" data-id="${tool.id}" 
                   min="${tool.min}" max="${tool.max}" value="${tool.default}" step="1">
          </div>
         `;
      });
      html += `</div>`;
    }
    container.innerHTML = html;
    
    // Bind slider events
    container.querySelectorAll('.tool-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const id = e.target.dataset.id;
        const val = parseInt(e.target.value);
        const toolDef = editorTools.find(t => t.id === id);
        
        document.getElementById(`val-${id}`).innerText = `${val}${toolDef.unit}`;
        engine.updateState(id, val);
      });
      
      // Hook up magnetic cursor
      slider.addEventListener('mouseenter', () => document.body.classList.add('hover-interactive'));
      slider.addEventListener('mouseleave', () => document.body.classList.remove('hover-interactive'));
    });
  }

  syncSlidersToState(state) {
    for(const key in state) {
       const slider = document.querySelector(`.tool-slider[data-id="${key}"]`);
       if(slider) {
          slider.value = state[key];
          const toolDef = editorTools.find(t => t.id === key);
          document.getElementById(`val-${key}`).innerText = `${state[key]}${toolDef.unit}`;
       }
    }
  }

  // --- Render 60 Templates ---
  renderTemplates() {
    const grid = document.getElementById('templates-grid');
    const catsContainer = document.getElementById('template-categories');
    
    // Cats
    catsContainer.innerHTML = templateCategories.map((c, i) => 
      `<button class="category-chip ${i===0?'active':''}" data-cat="${c}">${c}</button>`
    ).join('');
    
    catsContainer.querySelectorAll('.category-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        catsContainer.querySelector('.active').classList.remove('active');
        e.target.classList.add('active');
        const cat = e.target.dataset.cat;
        this.filterTemplates(cat);
      });
    });

    // Grid items
    grid.innerHTML = templatesList.map(t => {
      // Mock thumbnail generating logic via placeholder for cinematic feel
      const hue = typeof t.settings.hueRotate === 'number' ? t.settings.hueRotate : (Math.random() * 360);
      return `
      <div class="template-card" data-id="${t.id}" data-cat="${t.category}">
        <div style="width:100%; height:120px; background: hsl(${hue}, 40%, 20%); filter: ${this.cssFilterPreview(t.settings)}"></div>
        <div class="info">
          <h4>${t.name}</h4>
        </div>
      </div>
      `;
    }).join('');
    
    grid.querySelectorAll('.template-card').forEach(card => {
       card.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          const template = templatesList.find(t => t.id === id);
          if (template) {
             engine.applyTemplate(template.settings);
             this.syncSlidersToState(engine.state);
             this.showToast(`Applied ${template.name}`);
             
             // Visual highlight
             grid.querySelectorAll('.active').forEach(c => c.classList.remove('active'));
             e.currentTarget.classList.add('active');
          }
       });
       
       card.addEventListener('mouseenter', () => document.body.classList.add('hover-interactive'));
       card.addEventListener('mouseleave', () => document.body.classList.remove('hover-interactive'));
    });
  }
  
  cssFilterPreview(settings) {
     return `brightness(${settings.brightness||100}%) contrast(${settings.contrast||100}%) saturate(${settings.saturation||100}%) sepia(${settings.sepia||0}%)`;
  }

  filterTemplates(cat) {
    const grid = document.getElementById('templates-grid');
    grid.querySelectorAll('.template-card').forEach(card => {
       if(cat === 'All' || card.dataset.cat === cat) card.style.display = 'block';
       else card.style.display = 'none';
    });
  }

  // --- Primary App Event Binding ---
  bindEvents() {
    // Left Tool Tabs
    document.querySelectorAll('.sidebar-left .tab').forEach(tab => {
       tab.addEventListener('click', (e) => {
         document.querySelector('.sidebar-left .tab.active').classList.remove('active');
         e.target.classList.add('active');
         
         document.querySelectorAll('.tool-section').forEach(s => s.style.display = 'none');
         document.querySelector(`.${e.target.dataset.target}-section`).style.display = 'block';
       });
    });
    
    // Right Mode Toggles
    document.querySelectorAll('.mode-toggle .toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
         document.querySelector('.mode-toggle .active').classList.remove('active');
         e.currentTarget.classList.add('active');
         
         const mode = e.currentTarget.dataset.mode;
         if (mode === 'templates') {
            document.getElementById('templates-panel').style.display = 'block';
            document.getElementById('ai-panel').style.display = 'none';
            document.body.classList.remove('hover-ai');
         } else {
            document.getElementById('templates-panel').style.display = 'none';
            document.getElementById('ai-panel').style.display = 'flex';
            document.body.classList.add('hover-ai');
         }
      });
    });

    // File Upload
    const fileUpload = document.getElementById('file-upload');
    const uploadOverlay = document.getElementById('upload-overlay');
    
    fileUpload.addEventListener('change', (e) => {
       if(e.target.files && e.target.files[0]) {
          engine.loadImage(e.target.files[0]);
          uploadOverlay.classList.add('hidden');
          document.getElementById('canvas-container').style.display = 'flex';
          document.getElementById('bottom-toolbar').style.display = 'flex';
       }
    });
    
    // Compare Button (Hold to see original)
    const btnCompare = document.getElementById('btn-compare');
    btnCompare.addEventListener('mousedown', () => { 
       engine.ctx.filter = 'none'; 
       engine.ctx.clearRect(0,0,engine.canvas.width, engine.canvas.height);
       engine.ctx.drawImage(engine.image, 0, 0); 
    });
    btnCompare.addEventListener('mouseup', () => engine.render());
    btnCompare.addEventListener('mouseleave', () => engine.render());
  }

  // --- AI Chat Logic ---
  bindAIEvents() {
    const aiInput = document.getElementById('ai-input');
    const aiSend = document.getElementById('ai-send');
    const chatContainer = document.getElementById('chat-history');
    
    const submit = () => {
      const text = aiInput.value.trim();
      if (!text) return;
      
      // User message
      this.ai.addMessage(chatContainer, text, 'user');
      aiInput.value = '';
      
      // AI Processing
      setTimeout(() => {
        const response = this.ai.processText(text);
        this.ai.addMessage(chatContainer, response, 'ai');
      }, 600);
    };

    aiSend.addEventListener('click', submit);
    aiInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') submit(); });
    
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
       chip.addEventListener('click', (e) => {
          aiInput.value = e.target.innerText.replace(/"/g, '');
          submit();
       });
    });
  }

  // --- Toast ---
  showToast(msg) {
    const tc = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.style.cssText = `
      position: fixed; bottom: 84px; left: 50%; transform: translateX(-50%);
      background: var(--bg-elevated); padding: 10px 20px; border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.1); font-size: 13px; z-index: 9999;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3); animation: fadeUp 0.3s ease;
    `;
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0'; t.style.transition = 'opacity 0.3s';
      setTimeout(() => t.remove(), 300);
    }, 2000);
  }
}

// Add keyframes for toast
const style = document.createElement('style');
style.innerHTML = `@keyframes fadeUp { from {opacity:0; transform:translate(-50%,10px);} to {opacity:1; transform:translate(-50%,0);} }`;
document.head.appendChild(style);

// Init
window.addEventListener('DOMContentLoaded', () => {
  new AppUI();
});
