import { engine } from './engine.js';
import { editorTools } from './tools.js';
import { templatesList, templateCategories } from './templates.js';
import { initAI } from './ai.js';
import { driveManager } from './drive.js';

class AppUI {
  constructor() {
    this.originalFileName = 'photo.jpg';
    this.detectedFaces = [];

    this.renderTools();
    this.renderTemplates();
    this.bindEvents();

    this.ai = initAI(engine, this);
    this.bindAIEvents();
    this.initFaceBlurModal();

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

    // Build gradient preview from preset's preview colors
    const buildGradient = (colors) => {
      if (!colors || colors.length === 0) return 'linear-gradient(135deg, #333, #555)';
      if (colors.length === 1) return colors[0];
      return `linear-gradient(135deg, ${colors.join(', ')})`;
    };

    grid.innerHTML = templatesList.map(t => {
      const gradient = buildGradient(t.preview);
      const trendBadge = t.category === 'Trends'
        ? `<span class="trend-badge">${t.trendType === 'face-blur' ? '🔍 Interactive' : '🔥 Trending'}</span>`
        : '';
      return `
      <div class="template-card" data-id="${t.id}" data-cat="${t.category}">
        <div class="preset-preview" style="background: ${gradient};">
          <div class="preset-preview-overlay"></div>
        </div>
        <div class="info">
          <h4>${t.name}</h4>
          ${trendBadge}
        </div>
      </div>
      `;
    }).join('');

    grid.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const template = templatesList.find(t => t.id === id);
        if (!template) return;

        // Special trend: Blurry Face
        if (template.trendType === 'face-blur') {
          this.launchFaceBlur();
          return;
        }

        engine.applyTemplate(template.settings);
        this.syncSlidersToState(engine.state);
        this.showToast(`Applied: ${template.name}`);

        grid.querySelectorAll('.template-card.active').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });
  }

  // ── Blurry Face Trend ─────────────────────────────────────────────────────
  launchFaceBlur() {
    if (!engine.imageLoaded) {
      this.showToast('Load an image first!');
      return;
    }
    // Reset modal state
    document.getElementById('fb-btn-all').style.display = 'none';
    document.getElementById('fb-btn-some').style.display = 'none';
    document.getElementById('fb-btn-fullblur').style.display = 'none';
    document.getElementById('fb-pick-area').style.display = 'none';
    document.getElementById('fb-pick-area').innerHTML = '';
    document.getElementById('fb-status').textContent = 'Loading face detection model…';
    document.getElementById('face-blur-modal').classList.add('open');
    this.detectAndBlurFaces();
  }

  async detectAndBlurFaces() {
    const statusEl = document.getElementById('fb-status');

    try {
      // Load face-api.js models from CDN if not already loaded
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

      if (typeof faceapi === 'undefined') {
        statusEl.textContent = 'Initialising face detection…';
        await this._loadScript('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.js');
      }

      // Load the tiny detector model (fast, ~1 MB)
      if (!faceapi.nets.tinyFaceDetector.isLoaded) {
        statusEl.textContent = 'Loading model (first use takes ~2 s)…';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      }

      statusEl.textContent = 'Scanning for faces…';

      // Detect on the current canvas
      const detections = await faceapi.detectAllFaces(
        engine.canvas,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 })
      );

      this.detectedFaces = detections.map(d => d.box); // {x, y, width, height}

      if (this.detectedFaces.length === 0) {
        statusEl.textContent = 'No faces detected — try the full-image blur instead.';
        document.getElementById('fb-btn-fullblur').style.display = 'flex';
      } else {
        statusEl.textContent = `Found ${this.detectedFaces.length} face${this.detectedFaces.length > 1 ? 's' : ''}. What would you like to blur?`;
        document.getElementById('fb-btn-all').style.display = 'flex';
        if (this.detectedFaces.length > 1) {
          document.getElementById('fb-btn-some').style.display = 'flex';
        }
      }
    } catch (err) {
      console.error('face-api error:', err);
      statusEl.textContent = 'Detection failed. You can still blur the full image.';
      document.getElementById('fb-btn-fullblur').style.display = 'flex';
    }
  }

  // Dynamically load an external script (returns promise)
  _loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  blurFaces(indices) {
    const ctx = engine.ctx;
    const faces = this.detectedFaces || [];
    const targets = indices === 'all' ? faces : indices.map(i => faces[i]).filter(Boolean);

    if (targets.length === 0) return;

    ctx.save();
    targets.forEach(box => {
      // face-api.js returns Box with {x, y, width, height}
      const { x, y, width, height } = box;
      const pad = Math.min(width, height) * 0.18;
      const sx = Math.max(0, x - pad);
      const sy = Math.max(0, y - pad);
      const sw = Math.min(engine.canvas.width  - sx, width  + pad * 2);
      const sh = Math.min(engine.canvas.height - sy, height + pad * 2);

      // Multi-pass blur: stack 3 increasingly blurry redraws for a strong effect
      [10, 18, 28].forEach(blurPx => {
        ctx.filter = `blur(${blurPx}px)`;
        ctx.drawImage(engine.image, sx, sy, sw, sh, sx, sy, sw, sh);
      });
    });

    ctx.filter = 'none';
    ctx.restore();
    this.showToast(`Blurred ${targets.length} face${targets.length !== 1 ? 's' : ''} ✓`);
  }

  initFaceBlurModal() {
    const modal = document.getElementById('face-blur-modal');
    const close = () => modal.classList.remove('open');

    document.getElementById('fb-close').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if(e.target === modal) close(); });

    document.getElementById('fb-btn-all').addEventListener('click', () => {
      this.blurFaces('all');
      close();
    });

    document.getElementById('fb-btn-fullblur').addEventListener('click', () => {
      engine.updateState('blur', 20);
      this.syncSlidersToState(engine.state);
      this.showToast('Full image blur applied');
      close();
    });

    // "Choose some" — show checkboxes dynamically
    document.getElementById('fb-btn-some').addEventListener('click', () => {
      const pickArea = document.getElementById('fb-pick-area');
      const faces = this.detectedFaces || [];
      pickArea.innerHTML = `
        <p class="fb-pick-label">Select which faces to blur:</p>
        ${faces.map((_, i) => `
          <label class="fb-face-option">
            <input type="checkbox" value="${i}" checked>
            Face ${i + 1}
          </label>
        `).join('')}
        <button id="fb-apply-some" class="primary-btn" style="margin-top:12px">Apply Selected</button>
      `;
      pickArea.style.display = 'block';
      document.getElementById('fb-apply-some').addEventListener('click', () => {
        const checked = [...pickArea.querySelectorAll('input:checked')].map(el => parseInt(el.value));
        if (checked.length) this.blurFaces(checked);
        close();
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
  initMobileNav();
});

// ── Mobile bottom nav ──────────────────────────────────────────────────────
function initMobileNav() {
  const sidebarLeft  = document.querySelector('.sidebar-left');
  const sidebarRight = document.querySelector('.sidebar-right');
  const navBtns      = document.querySelectorAll('.mobile-nav-btn');

  // Helper: close all sidebars and deactivate all nav buttons
  function resetAll() {
    sidebarLeft.classList.remove('mobile-open');
    sidebarRight.classList.remove('mobile-open');
    navBtns.forEach(b => b.classList.remove('active'));
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.dataset.panel;
      const alreadyActive = btn.classList.contains('active');

      resetAll();

      // If it was already active -> just close panel (toggle off), otherwise open
      if (!alreadyActive) {
        btn.classList.add('active');

        if (panel === 'adjust') {
          sidebarLeft.classList.add('mobile-open');
        } else if (panel === 'presets') {
          // Make sure templates panel is visible, hide AI
          document.getElementById('templates-panel').style.display = 'block';
          document.getElementById('ai-panel').style.display = 'none';
          // Sync toggle buttons in right sidebar
          document.querySelectorAll('.mode-toggle .toggle-btn').forEach(tb => tb.classList.remove('active'));
          const tplBtn = document.querySelector('.toggle-btn[data-mode="templates"]');
          if (tplBtn) tplBtn.classList.add('active');
          sidebarRight.classList.add('mobile-open');
        } else if (panel === 'ai') {
          // Show AI panel, hide templates
          document.getElementById('templates-panel').style.display = 'none';
          document.getElementById('ai-panel').style.display = 'flex';
          // Sync toggle buttons in right sidebar
          document.querySelectorAll('.mode-toggle .toggle-btn').forEach(tb => tb.classList.remove('active'));
          const aiBtn = document.querySelector('.toggle-btn[data-mode="ai"]');
          if (aiBtn) aiBtn.classList.add('active');
          sidebarRight.classList.add('mobile-open');
        }
        // 'canvas' just closes everything (canvas is the default view)
      }
    });
  });
}
