import { engine } from './engine.js';
import { editorTools } from './tools.js';
import { templatesList, templateCategories } from './templates.js';
import { initAI } from './ai.js';
import { driveManager } from './drive.js';

class AppUI {
  constructor() {
    this.originalFileName = 'photo.jpg';
    
    this.renderTools();
    this.renderTemplates();
    this.bindEvents();
    
    this.ai = initAI(engine, this); 
    this.bindAIEvents();

    // Init Drive Auth
    setTimeout(() => {
        driveManager.init((user) => this.updateAuthUI(user));
    }, 1000); // Give google script time to load
  }

  // --- Theme Toggle ---
  toggleTheme() {
      const body = document.body;
      const current = body.getAttribute('data-theme');
      const next = current === 'dracula' ? 'synthwave' : 'dracula';
      body.setAttribute('data-theme', next);
      
      const icon = document.querySelector('#btn-theme i');
      icon.className = next === 'dracula' ? 'ri-contrast-drop-line' : 'ri-palette-line';
  }

  // --- Auth UI ---
  updateAuthUI(user) {
      const btnLogin = document.getElementById('btn-login');
      const profile = document.getElementById('user-profile');
      
      if (user) {
          btnLogin.style.display = 'none';
          profile.style.display = 'flex';
          document.getElementById('user-avatar').src = user.picture;
          document.getElementById('user-name').innerText = user.name;
          this.showToast("Signed in to Google Drive");
      } else {
          btnLogin.style.display = 'flex';
          profile.style.display = 'none';
      }
  }

  // --- Render Tools in Sidebar ---
  renderTools() {
    const container = document.getElementById('tools-container');
    const categories = { basic: [], color: [], detail: [], fx: [] };
    
    editorTools.forEach(t => { if(categories[t.category]) categories[t.category].push(t); });
    
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
    
    container.querySelectorAll('.tool-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const id = e.target.dataset.id;
        const val = parseInt(e.target.value);
        const toolDef = editorTools.find(t => t.id === id);
        
        document.getElementById(`val-${id}`).innerText = `${val}${toolDef.unit}`;
        engine.updateState(id, val);
      });
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

  // --- Render Templates ---
  renderTemplates() {
    const grid = document.getElementById('templates-grid');
    const catsContainer = document.getElementById('template-categories');
    
    catsContainer.innerHTML = templateCategories.map((c, i) => 
      `<button class="category-chip ${i===0?'active':''}" data-cat="${c}">${c}</button>`
    ).join('');
    
    catsContainer.querySelectorAll('.category-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        catsContainer.querySelector('.active').classList.remove('active');
        e.target.classList.add('active');
        this.filterTemplates(e.target.dataset.cat);
      });
    });

    grid.innerHTML = templatesList.map(t => {
      return `
      <div class="template-card" data-id="${t.id}" data-cat="${t.category}">
        <div style="width:100%; height:100px; background: #333;"></div>
        <div class="info"><h4>${t.name}</h4></div>
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
             
             grid.querySelectorAll('.active').forEach(c => c.classList.remove('active'));
             e.currentTarget.classList.add('active');
          }
       });
    });
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
    document.getElementById('btn-theme').addEventListener('click', () => this.toggleTheme());
    
    document.getElementById('btn-login').addEventListener('click', () => driveManager.login());
    document.getElementById('btn-logout').addEventListener('click', () => driveManager.logout());

    document.querySelectorAll('.sidebar-left .tab').forEach(tab => {
       tab.addEventListener('click', (e) => {
         document.querySelector('.sidebar-left .tab.active').classList.remove('active');
         e.target.classList.add('active');
         document.querySelectorAll('.tool-section').forEach(s => s.style.display = 'none');
         document.querySelector(`.${e.target.dataset.target}-section`).style.display = 'block';
       });
    });
    
    document.querySelectorAll('.mode-toggle .toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
         document.querySelector('.mode-toggle .active').classList.remove('active');
         e.currentTarget.classList.add('active');
         
         const mode = e.currentTarget.dataset.mode;
         if (mode === 'templates') {
            document.getElementById('templates-panel').style.display = 'block';
            document.getElementById('ai-panel').style.display = 'none';
         } else {
            document.getElementById('templates-panel').style.display = 'none';
            document.getElementById('ai-panel').style.display = 'flex';
         }
      });
    });

    const fileUpload = document.getElementById('file-upload');
    const uploadOverlay = document.getElementById('upload-overlay');
    
    fileUpload.addEventListener('change', async (e) => {
       if(e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          this.originalFileName = file.name;
          engine.loadImage(file);
          
          uploadOverlay.classList.add('hidden');
          document.getElementById('canvas-container').style.display = 'flex';
          document.getElementById('bottom-toolbar').style.display = 'flex';

          // Automatically backup to Google Drive if logged in
          if(driveManager.accessToken) {
              this.showToast("Backing up original to Drive...");
              try {
                  await driveManager.saveToDrive(file, 'original', this.originalFileName);
                  this.showToast("Original saved to Drive folder!");
              } catch(err) {
                  this.showToast("Failed to save original to Drive");
              }
          }
       }
    });

    document.getElementById('btn-export').addEventListener('click', async () => {
        if(!engine.imageLoaded) return;
        this.showToast("Exporting...");
        
        engine.canvas.toBlob(async (blob) => {
            // Local download fallback or supplementary
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Transform_${Date.now()}.jpg`;
            a.click();

            if (driveManager.accessToken) {
                this.showToast("Uploading final version to Drive...");
                try {
                    await driveManager.saveToDrive(blob, 'edited', this.originalFileName);
                    this.showToast("Final saved to Drive folder!");
                } catch(err) {
                    this.showToast("Failed to upload to Drive");
                }
            }
        }, 'image/jpeg', 0.95);
    });

    const btnCompare = document.getElementById('btn-compare');
    btnCompare.addEventListener('mousedown', () => { 
       engine.ctx.filter = 'none'; 
       engine.ctx.globalCompositeOperation = 'source-over';
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
      
      this.ai.addMessage(chatContainer, text, 'user');
      aiInput.value = '';
      
      setTimeout(() => {
        const response = this.ai.processText(text);
        this.ai.addMessage(chatContainer, response, 'ai');
      }, 400);
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

  showToast(msg) {
    const tc = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.style.cssText = `
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: var(--text-primary); color: var(--bg-base); 
      padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 500;
      z-index: 9999; box-shadow: var(--shadow-soft); transition: opacity 0.3s;
    `;
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 300);
    }, 2500);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new AppUI();
});
