/**
 * MagangHub AI Assistant - Content Script
 * Injected into https://monev.maganghub.kemnaker.go.id/*
 */

(function () {
  if (document.getElementById('__maganghub_ai_host')) return;

  const host = document.createElement('div');
  host.id = '__maganghub_ai_host';
  document.documentElement.appendChild(host);
  const root = host.attachShadow({ mode: 'open' });

  // CSS Styles Embedded into Shadow DOM
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    :host { all: initial; z-index: 2147483647; position: relative; }
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
    
    .fab {
      position: fixed;
      right: 24px;
      bottom: 24px;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      z-index: 2147483647;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
      border: 2px solid rgba(255, 255, 255, 0.4);
      user-select: none;
      touch-action: none;
    }
    .fab:active { cursor: grabbing; }
    .fab:hover { transform: scale(1.08); box-shadow: 0 8px 24px rgba(37, 99, 235, 0.55); }
    .fab svg { width: 24px; height: 24px; color: #ffffff; pointer-events: none; }
    
    .panel {
      position: fixed;
      right: 24px;
      bottom: 90px;
      width: 380px;
      max-height: 0;
      opacity: 0;
      pointer-events: none;
      overflow: hidden;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(15, 23, 42, 0.24), 0 4px 12px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
      z-index: 2147483647;
      transition: max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease, transform 0.3s ease;
      transform: translateY(10px) scale(0.98);
    }
    .panel.open {
      max-height: 720px;
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }
    .panel-inner {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 680px;
      overflow-y: auto;
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 8px;
      border-bottom: 1px solid #f1f5f9;
    }
    .panel-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .badge-ai {
      font-size: 9px;
      font-weight: 800;
      background: #eff6ff;
      color: #2563eb;
      padding: 2px 6px;
      border-radius: 6px;
      border: 1px solid #dbeafe;
    }
    .header-actions { display: flex; align-items: center; gap: 4px; }
    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #64748b;
      width: 26px;
      height: 26px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .icon-btn:hover { background: #f1f5f9; color: #0f172a; }
    
    .field-label { font-size: 11.5px; font-weight: 600; color: #334155; }
    .preset-dropdown {
      width: 100%;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      padding: 6px 8px;
      font-size: 12px;
      color: #0f172a;
      background: #f8fafc;
      outline: none;
    }
    .bullets-textarea {
      width: 100%;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px;
      font-size: 12px;
      color: #0f172a;
      background: #f8fafc;
      outline: none;
      height: 76px;
      resize: vertical;
    }
    .bullets-textarea:focus { border-color: #3b82f6; background: #ffffff; }
    
    .btn-generate {
      width: 100%;
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 9px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }
    .btn-generate:hover { filter: brightness(1.06); }
    .btn-generate:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .widget-status { font-size: 11px; min-height: 14px; color: #64748b; }
    .widget-status.error { color: #ef4444; font-weight: 600; }
    .widget-status.success { color: #10b981; font-weight: 600; }
    
    .quick-settings {
      display: none;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 10px;
      flex-direction: column;
      gap: 6px;
    }
    .quick-settings.open { display: flex; }
    .quick-settings input {
      width: 100%;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 11.5px;
      background: white;
    }
    .btn-save-key {
      background: #0f172a;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 6px;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
    }
    
    .preview-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      border-top: 1px solid #f1f5f9;
      padding-top: 8px;
    }
    .preview-field { display: flex; flex-direction: column; gap: 3px; }
    .preview-header { display: flex; justify-content: space-between; align-items: center; }
    .preview-title { font-size: 11px; font-weight: 700; color: #475569; }
    .char-badge {
      font-size: 9.5px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 8px;
      background: #f1f5f9;
      color: #64748b;
    }
    .char-badge.valid { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
    .char-badge.invalid { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    
    .preview-textarea {
      width: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 11.5px;
      color: #0f172a;
      background: #ffffff;
      resize: vertical;
      line-height: 1.35;
      outline: none;
    }
    .preview-textarea:focus { border-color: #3b82f6; }
    .preview-actions { display: flex; justify-content: flex-end; }
    .btn-mini-copy {
      background: none;
      border: none;
      color: #2563eb;
      font-size: 10.5px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-mini-copy:hover { text-decoration: underline; }
    
    .btn-fill-form {
      width: 100%;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 9px;
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
    }
    .btn-fill-form:hover { background: #059669; }
    .hidden { display: none !important; }
  `;
  root.appendChild(styleEl);

  // Widget HTML Structure
  const widgetContainer = document.createElement('div');
  widgetContainer.innerHTML = `
    <button class="fab" id="fab" title="Tarik untuk geser posisi, klik untuk buka asisten AI">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>

    <div class="panel" id="panel">
      <div class="panel-inner">
        <div class="panel-header">
          <div class="panel-title">
            <span>📝 MagangHub AI</span>
            <span class="badge-ai">PRO</span>
          </div>
          <div class="header-actions">
            <button class="icon-btn" id="btnSettingsToggle" title="Pengaturan Cepat API Key">⚙️</button>
            <button class="icon-btn" id="btnClosePanel" title="Tutup">✕</button>
          </div>
        </div>

        <div class="quick-settings" id="quickSettings">
          <span class="field-label">Gemini API Key</span>
          <input type="password" id="inputApiKey" placeholder="AIzaSy..." />
          <span class="field-label" style="margin-top:6px;">API Base URL (Opsional)</span>
          <input type="text" id="inputBaseUrl" placeholder="https://generativelanguage.googleapis.com/v1beta" />
          <button class="btn-save-key" id="btnSaveKey">Simpan Pengaturan</button>
          <span style="font-size:10px; color:#94a3b8;">Dapatkan gratis di <a href="https://aistudio.google.com/apikey" target="_blank" style="color:#3b82f6;">aistudio.google.com/apikey</a></span>
        </div>

        <div>
          <span class="field-label">Pilih Model AI</span>
          <select class="preset-dropdown" id="modelSelect">
          </select>
        </div>

        <div id="customModelGroup" style="display: none;">
          <span class="field-label">Nama Model Kustom</span>
          <input type="text" class="preset-dropdown" id="inputCustomModel" placeholder="Contoh: gemini-exp-1206, model-id" />
        </div>

        <div>
          <span class="field-label">Pilih Template Cepat</span>
          <select class="preset-dropdown" id="presetSelect">
            <option value="">-- Pilih Template Kegiatan --</option>
          </select>
        </div>

        <div>
          <span class="field-label">Catatan Poin Kegiatan (Bebas)</span>
          <textarea class="bullets-textarea" id="bulletsArea" placeholder="Contoh:&#10;- Slicing UI dashboard&#10;- Daily standup dengan mentor&#10;- Debugging respon form"></textarea>
        </div>

        <button class="btn-generate" id="btnGenerate">
          <span>⚡</span>
          <span>Generate Laporan AI</span>
        </button>

        <div class="widget-status" id="widgetStatus"></div>

        <!-- Preview Modal & Direct Apply -->
        <div class="preview-container hidden" id="previewContainer">
          <div class="preview-field">
            <div class="preview-header">
              <span class="preview-title">1. Aktivitas</span>
              <span class="char-badge" id="badgeAktivitas">0 char</span>
            </div>
            <textarea class="preview-textarea" id="prevAktivitas" rows="2"></textarea>
            <div class="preview-actions">
              <button class="btn-mini-copy" data-target="prevAktivitas">Salin</button>
            </div>
          </div>

          <div class="preview-field">
            <div class="preview-header">
              <span class="preview-title">2. Pembelajaran</span>
              <span class="char-badge" id="badgePembelajaran">0 char</span>
            </div>
            <textarea class="preview-textarea" id="prevPembelajaran" rows="2"></textarea>
            <div class="preview-actions">
              <button class="btn-mini-copy" data-target="prevPembelajaran">Salin</button>
            </div>
          </div>

          <div class="preview-field">
            <div class="preview-header">
              <span class="preview-title">3. Kendala & Solusi</span>
              <span class="char-badge" id="badgeKendala">0 char</span>
            </div>
            <textarea class="preview-textarea" id="prevKendala" rows="2"></textarea>
            <div class="preview-actions">
              <button class="btn-mini-copy" data-target="prevKendala">Salin</button>
            </div>
          </div>

          <button class="btn-fill-form" id="btnFillForm">
            <span>🚀</span>
            <span>Isi ke Form Laporan Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  `;
  root.appendChild(widgetContainer);

  // Element Selectors in Shadow DOM
  const fab = root.getElementById('fab');
  const panel = root.getElementById('panel');
  const btnClosePanel = root.getElementById('btnClosePanel');
  const btnSettingsToggle = root.getElementById('btnSettingsToggle');
  const quickSettings = root.getElementById('quickSettings');
  const inputApiKey = root.getElementById('inputApiKey');
  const btnSaveKey = root.getElementById('btnSaveKey');
  const inputBaseUrl = root.getElementById('inputBaseUrl');
  const modelSelect = root.getElementById('modelSelect');
  const customModelGroup = root.getElementById('customModelGroup');
  const inputCustomModel = root.getElementById('inputCustomModel');
  const presetSelect = root.getElementById('presetSelect');
  const bulletsArea = root.getElementById('bulletsArea');
  const btnGenerate = root.getElementById('btnGenerate');
  const widgetStatus = root.getElementById('widgetStatus');

  const previewContainer = root.getElementById('previewContainer');
  const prevAktivitas = root.getElementById('prevAktivitas');
  const prevPembelajaran = root.getElementById('prevPembelajaran');
  const prevKendala = root.getElementById('prevKendala');
  const badgeAktivitas = root.getElementById('badgeAktivitas');
  const badgePembelajaran = root.getElementById('badgePembelajaran');
  const badgeKendala = root.getElementById('badgeKendala');
  const btnFillForm = root.getElementById('btnFillForm');

  // Status helper
  function setStatus(text, type = '') {
    widgetStatus.textContent = text || '';
    widgetStatus.className = 'widget-status' + (type ? ' ' + type : '');
  }

  // Load Settings & Reposition FAB
  let settings = {};
  async function loadInitialData() {
    if (typeof StorageUtil !== 'undefined') {
      settings = await StorageUtil.getSettings();
    } else {
      const res = await chrome.storage.local.get(null);
      settings = res || {};
    }

    if (settings.geminiApiKey) {
      inputApiKey.value = settings.geminiApiKey;
    } else {
      quickSettings.classList.add('open');
    }

    if (settings.apiBaseUrl && inputBaseUrl) {
      inputBaseUrl.value = settings.apiBaseUrl;
    }

    if (settings.lastBullets) {
      bulletsArea.value = settings.lastBullets;
    }

    // Restore FAB position if saved
    if (settings.fabPosition && settings.fabPosition.right !== undefined) {
      fab.style.right = `${settings.fabPosition.right}px`;
      fab.style.bottom = `${settings.fabPosition.bottom}px`;
      panel.style.right = `${settings.fabPosition.right}px`;
      panel.style.bottom = `${settings.fabPosition.bottom + 66}px`;
    }

    // Populate Models
    const modelsList = typeof AVAILABLE_MODELS !== 'undefined' ? AVAILABLE_MODELS : [
      { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite (Super Cepat & Efisien - Rekomendasi)' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Cepat & Cerdas)' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Lebih Detail & Mendalam)' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Stabil & Ringan)' },
      { id: 'custom', name: 'Custom Model (Model Kustom Sendiri)' }
    ];

    if (modelSelect) {
      modelSelect.innerHTML = '';
      modelsList.forEach((m) => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        modelSelect.appendChild(opt);
      });
      modelSelect.value = settings.selectedModel || 'gemini-3.1-flash-lite';
    }

    if (settings.customModelName && inputCustomModel) {
      inputCustomModel.value = settings.customModelName;
    }

    if (customModelGroup && modelSelect) {
      customModelGroup.style.display = modelSelect.value === 'custom' ? 'block' : 'none';
    }

    // Populate Templates
    if (typeof PRESET_TEMPLATES !== 'undefined') {
      PRESET_TEMPLATES.forEach((tpl) => {
        const opt = document.createElement('option');
        opt.value = tpl.id;
        opt.textContent = tpl.title;
        presetSelect.appendChild(opt);
      });
    }

    // Custom Templates
    if (typeof StorageUtil !== 'undefined') {
      const customTemplates = await StorageUtil.getCustomTemplates();
      if (customTemplates && customTemplates.length > 0) {
        const optGroup = document.createElement('optgroup');
        optGroup.label = 'Template Kustom';
        customTemplates.forEach((tpl) => {
          const opt = document.createElement('option');
          opt.value = tpl.id;
          opt.textContent = `⭐ ${tpl.title}`;
          optGroup.appendChild(opt);
        });
        presetSelect.appendChild(optGroup);
      }
    }
  }

  loadInitialData();

  // Draggable FAB Logic
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let hasMoved = false;

  fab.addEventListener('pointerdown', (e) => {
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    fab.setPointerCapture(e.pointerId);
  });

  fab.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMoved = true;
      const right = Math.max(10, Math.min(window.innerWidth - 64, window.innerWidth - e.clientX - 27));
      const bottom = Math.max(10, Math.min(window.innerHeight - 64, window.innerHeight - e.clientY - 27));

      fab.style.right = `${right}px`;
      fab.style.bottom = `${bottom}px`;
      panel.style.right = `${right}px`;
      panel.style.bottom = `${bottom + 66}px`;
    }
  });

  fab.addEventListener('pointerup', async (e) => {
    if (!isDragging) return;
    isDragging = false;
    fab.releasePointerCapture(e.pointerId);

    if (hasMoved) {
      const right = parseInt(fab.style.right, 10) || 24;
      const bottom = parseInt(fab.style.bottom, 10) || 24;
      chrome.storage.local.set({ fabPosition: { right, bottom } });
    } else {
      // It was a click!
      panel.classList.toggle('open');
    }
  });

  btnClosePanel.addEventListener('click', () => panel.classList.remove('open'));
  btnSettingsToggle.addEventListener('click', () => quickSettings.classList.toggle('open'));

  // Save API Key & Base URL
  btnSaveKey.addEventListener('click', async () => {
    const key = inputApiKey.value.trim();
    const baseUrl = inputBaseUrl ? inputBaseUrl.value.trim() : '';
    if (!key) {
      setStatus('API Key tidak boleh kosong.', 'error');
      return;
    }
    const update = { geminiApiKey: key };
    if (baseUrl) update.apiBaseUrl = baseUrl;
    if (typeof StorageUtil !== 'undefined') {
      await StorageUtil.saveSettings(update);
    } else {
      await chrome.storage.local.set(update);
    }
    settings.geminiApiKey = key;
    if (baseUrl) settings.apiBaseUrl = baseUrl;
    setStatus('API Key & Base URL berhasil disimpan!', 'success');
    setTimeout(() => quickSettings.classList.remove('open'), 1200);
  });

  // Model Change Handler
  if (modelSelect) {
    modelSelect.addEventListener('change', async () => {
      const selectedModel = modelSelect.value;
      if (customModelGroup) {
        customModelGroup.style.display = selectedModel === 'custom' ? 'block' : 'none';
      }
      settings.selectedModel = selectedModel;
      if (typeof StorageUtil !== 'undefined') {
        await StorageUtil.saveSettings({ selectedModel });
      } else {
        await chrome.storage.local.set({ selectedModel });
      }
      setStatus(`Model AI diubah ke: ${selectedModel}`, 'success');
      setTimeout(() => {
        if (widgetStatus.textContent.includes('Model AI diubah')) {
          widgetStatus.textContent = '';
        }
      }, 2000);
    });
  }

  // Custom Model Input Handler
  if (inputCustomModel) {
    inputCustomModel.addEventListener('input', async () => {
      const customModelName = inputCustomModel.value.trim();
      settings.customModelName = customModelName;
      if (typeof StorageUtil !== 'undefined') {
        await StorageUtil.saveSettings({ customModelName });
      } else {
        await chrome.storage.local.set({ customModelName });
      }
    });
  }

  // Template Change Handler
  presetSelect.addEventListener('change', async () => {
    const val = presetSelect.value;
    if (!val) return;

    let found = null;
    if (typeof PRESET_TEMPLATES !== 'undefined') {
      found = PRESET_TEMPLATES.find((p) => p.id === val);
    }
    if (!found && typeof StorageUtil !== 'undefined') {
      const customs = await StorageUtil.getCustomTemplates();
      found = customs.find((c) => c.id === val);
    }

    if (found) {
      bulletsArea.value = found.bullets;
      bulletsArea.focus();
    }
  });

  // Character Counter Validator
  function updateCharCount(textarea, badge) {
    const len = textarea.value.length;
    badge.textContent = `${len} / 100 char`;
    if (len >= 100) {
      badge.className = 'char-badge valid';
    } else {
      badge.className = 'char-badge invalid';
    }
  }

  [
    { textarea: prevAktivitas, badge: badgeAktivitas },
    { textarea: prevPembelajaran, badge: badgePembelajaran },
    { textarea: prevKendala, badge: badgeKendala }
  ].forEach(({ textarea, badge }) => {
    textarea.addEventListener('input', () => updateCharCount(textarea, badge));
  });

  // Generate Report
  btnGenerate.addEventListener('click', async () => {
    const bullets = bulletsArea.value.trim();
    if (!bullets) {
      setStatus('Isi catatan kegiatan terlebih dahulu.', 'error');
      bulletsArea.focus();
      return;
    }

    const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');
    if (!geminiApiKey) {
      setStatus('Atur Gemini API Key terlebih dahulu di menu ⚙️.', 'error');
      quickSettings.classList.add('open');
      return;
    }

    await chrome.storage.local.set({ lastBullets: bullets });

    btnGenerate.disabled = true;
    setStatus('Sedang menyusun laporan dengan AI...', '');

    try {
      let result;
      if (typeof GeminiClient !== 'undefined') {
        const fullSettings = typeof StorageUtil !== 'undefined' ? await StorageUtil.getSettings() : await chrome.storage.local.get(null);
        if (modelSelect && modelSelect.value) {
          fullSettings.selectedModel = modelSelect.value;
        }
        if (inputCustomModel && inputCustomModel.value) {
          fullSettings.customModelName = inputCustomModel.value.trim();
        }
        if (inputBaseUrl && inputBaseUrl.value) {
          fullSettings.apiBaseUrl = inputBaseUrl.value.trim();
        }
        const history = typeof StorageUtil !== 'undefined' ? await StorageUtil.getHistory() : [];
        result = await GeminiClient.generateReport(geminiApiKey, bullets, fullSettings, (attempt, max) => {
          setStatus(`Server AI sibuk, mencoba ulang (${attempt}/${max})...`, '');
        }, history);
      } else {
        throw new Error('Modul AI Client belum termuat.');
      }

      prevAktivitas.value = result.aktivitas;
      prevPembelajaran.value = result.pembelajaran;
      prevKendala.value = result.kendala;

      updateCharCount(prevAktivitas, badgeAktivitas);
      updateCharCount(prevPembelajaran, badgePembelajaran);
      updateCharCount(prevKendala, badgeKendala);

      previewContainer.classList.remove('hidden');
      setStatus('Laporan siap! Silakan periksa lalu klik Isi ke Form.', 'success');

      // Save to history
      if (typeof StorageUtil !== 'undefined') {
        await StorageUtil.addHistoryEntry({
          bullets,
          aktivitas: result.aktivitas,
          pembelajaran: result.pembelajaran,
          kendala: result.kendala,
          modelUsed: result.modelUsed
        });
      }
    } catch (err) {
      console.error('[MagangHub In-Page]', err);
      setStatus('Gagal: ' + err.message, 'error');
    } finally {
      btnGenerate.disabled = false;
    }
  });

  // Mini copy buttons in preview
  root.querySelectorAll('.btn-mini-copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const targetId = btn.getAttribute('data-target');
      const el = root.getElementById(targetId);
      if (el) {
        await navigator.clipboard.writeText(el.value);
        const orig = btn.textContent;
        btn.textContent = 'Tersalin! ✅';
        setTimeout(() => { btn.textContent = orig; }, 1500);
      }
    });
  });

  // Native Value Setter for React/Vue reactive forms
  function setNativeValue(element, value) {
    const proto = Object.getPrototypeOf(element);
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(element, value);
    } else {
      element.value = value;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  // Get Visible Form Textareas on MagangHub
  function findReportTextareas() {
    const visibleTextareas = Array.from(document.querySelectorAll('textarea')).filter((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });

    if (visibleTextareas.length >= 3) {
      return {
        aktivitas: visibleTextareas[0],
        pembelajaran: visibleTextareas[1],
        kendala: visibleTextareas[2]
      };
    }

    // Heuristic label / placeholder matching fallback
    let matched = { aktivitas: null, pembelajaran: null, kendala: null };
    document.querySelectorAll('textarea').forEach((ta) => {
      const label = (ta.labels && ta.labels[0]?.innerText) || ta.getAttribute('placeholder') || ta.getAttribute('name') || '';
      const lower = label.toLowerCase();
      if (lower.includes('aktivitas') || lower.includes('kegiatan')) matched.aktivitas = ta;
      else if (lower.includes('pembelajaran') || lower.includes('pelajaran')) matched.pembelajaran = ta;
      else if (lower.includes('kendala') || lower.includes('hambatan')) matched.kendala = ta;
    });

    if (matched.aktivitas && matched.pembelajaran && matched.kendala) {
      return matched;
    }

    return null;
  }

  // Apply Highlight Glow Effect to Page Inputs
  function highlightElement(el) {
    el.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
    el.style.borderColor = '#10b981';
    el.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.35)';
    setTimeout(() => {
      el.style.borderColor = '';
      el.style.boxShadow = '';
    }, 2000);
  }

  // Fill Form Action
  btnFillForm.addEventListener('click', () => {
    const textareas = findReportTextareas();

    if (!textareas) {
      setStatus('Tidak dapat mendeteksi 3 kolom form laporan di halaman ini. Pastikan kamu berada di halaman Tambah/Edit Laporan.', 'error');
      return;
    }

    setNativeValue(textareas.aktivitas, prevAktivitas.value);
    setNativeValue(textareas.pembelajaran, prevPembelajaran.value);
    setNativeValue(textareas.kendala, prevKendala.value);

    highlightElement(textareas.aktivitas);
    highlightElement(textareas.pembelajaran);
    highlightElement(textareas.kendala);

    setStatus('Berhasil mengisi 3 kolom form laporan! ✨', 'success');

    setTimeout(() => {
      panel.classList.remove('open');
    }, 1200);
  });
})();
