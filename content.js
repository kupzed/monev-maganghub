(function () {
  if (document.getElementById('__maganghub_ai_host')) return; // jangan inject dobel

  const host = document.createElement('div');
  host.id = '__maganghub_ai_host';
  document.documentElement.appendChild(host);
  const root = host.attachShadow({ mode: 'open' });

  root.innerHTML = `
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }

      .fab {
        position: fixed;
        right: 22px;
        bottom: 22px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #2563eb;
        box-shadow: 0 4px 12px rgba(37,99,235,.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 2147483647;
        transition: transform .15s ease, box-shadow .15s ease;
        border: none;
      }
      .fab:hover { transform: scale(1.05); box-shadow: 0 6px 16px rgba(37,99,235,.5); }
      .fab svg { width: 24px; height: 24px; color: white; }

      .panel {
        position: fixed;
        right: 22px;
        bottom: 90px;
        width: 336px;
        max-height: 0;
        opacity: 0;
        pointer-events: none;
        overflow: hidden;
        background: #ffffff;
        border-radius: 18px;
        box-shadow: 0 20px 50px rgba(15,23,42,.22), 0 2px 8px rgba(15,23,42,.08);
        z-index: 2147483647;
        transition: max-height .22s ease, opacity .18s ease;
      }
      .panel.open {
        max-height: 640px;
        opacity: 1;
        pointer-events: auto;
      }
      .panel-inner { padding: 16px; }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .header .title {
        font-size: 14px;
        font-weight: 700;
        color: #1e1b4b;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .header .icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: #6b7280;
        padding: 4px;
        border-radius: 8px;
        display: flex;
      }
      .header .icon-btn:hover { background: #f3f4f6; color: #374151; }

      label {
        font-size: 11.5px;
        font-weight: 600;
        color: #4b5563;
        display: block;
        margin: 10px 0 5px;
      }
      textarea, input {
        width: 100%;
        border: 1.5px solid #e5e7eb;
        border-radius: 10px;
        padding: 9px 10px;
        font-size: 13px;
        color: #111827;
        outline: none;
        transition: border-color .15s ease;
      }
      textarea:focus, input:focus { border-color: #818cf8; }
      textarea#bullets { height: 92px; resize: vertical; }

      .primary-btn {
        width: 100%;
        margin-top: 12px;
        padding: 10px;
        border: none;
        border-radius: 8px;
        background: #2563eb;
        color: white;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        transition: background .15s ease;
      }
      .primary-btn:hover { background: #1d4ed8; }
      .primary-btn:disabled { opacity: .6; cursor: not-allowed; }

      .settings {
        display: none;
        border-top: 1px dashed #e5e7eb;
        margin-top: 12px;
        padding-top: 12px;
      }
      .settings.open { display: block; }
      .settings .save-btn {
        margin-top: 8px;
        width: 100%;
        padding: 8px;
        border: none;
        border-radius: 9px;
        background: #111827;
        color: white;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
      }
      .hint { font-size: 10.5px; color: #9ca3af; margin-top: 6px; line-height: 1.4; }
      .hint a { color: #6366f1; }

      .status {
        font-size: 12px;
        margin-top: 10px;
        min-height: 16px;
        color: #6b7280;
      }
      .status.error { color: #dc2626; }
      .status.success { color: #16a34a; }
    </style>

    <button class="fab" id="fab" title="Isi laporan otomatis">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>

    <div class="panel" id="panel">
      <div class="panel-inner">
        <div class="header">
          <span class="title">📝 Isi Laporan Otomatis</span>
          <div>
            <button class="icon-btn" id="settingsToggle" title="Pengaturan API Key">⚙</button>
            <button class="icon-btn" id="closeBtn" title="Tutup">✕</button>
          </div>
        </div>

        <label>Ketik poin kegiatan (bebas, per baris)</label>
        <textarea id="bullets" placeholder="contoh:&#10;- input data absensi&#10;- ikut briefing tim&#10;- belajar query SQL"></textarea>

        <button class="primary-btn" id="generateBtn">Generate & Isi Form</button>
        <div class="status" id="status"></div>

        <div class="settings" id="settings">
          <label>Gemini API Key</label>
          <input id="apiKey" type="password" placeholder="AIza..." />
          <button class="save-btn" id="saveKeyBtn">Simpan Key</button>
          <div class="hint">Dapatkan gratis di <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com/apikey</a>. Key disimpan lokal di browser kamu saja.</div>
        </div>
      </div>
    </div>
  `;

  const fab = root.getElementById('fab');
  const panel = root.getElementById('panel');
  const closeBtn = root.getElementById('closeBtn');
  const settingsToggle = root.getElementById('settingsToggle');
  const settingsEl = root.getElementById('settings');
  const apiKeyEl = root.getElementById('apiKey');
  const saveKeyBtn = root.getElementById('saveKeyBtn');
  const bulletsEl = root.getElementById('bullets');
  const generateBtn = root.getElementById('generateBtn');
  const statusEl = root.getElementById('status');

  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className = 'status' + (type ? ' ' + type : '');
  }

  chrome.storage.local.get(['geminiApiKey', 'lastBullets'], (res) => {
    if (res.geminiApiKey) apiKeyEl.value = res.geminiApiKey;
    else settingsEl.classList.add('open');
    if (res.lastBullets) bulletsEl.value = res.lastBullets;
  });

  fab.addEventListener('click', () => panel.classList.toggle('open'));
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));
  settingsToggle.addEventListener('click', () => settingsEl.classList.toggle('open'));

  saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyEl.value.trim();
    chrome.storage.local.set({ geminiApiKey: key }, () => setStatus('API key tersimpan.', 'success'));
  });

  function setNativeValue(element, value) {
    const proto = Object.getPrototypeOf(element);
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
    if (descriptor && descriptor.set) descriptor.set.call(element, value);
    else element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function getVisibleTextareas() {
    return Array.from(document.querySelectorAll('textarea')).filter((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
  }

  async function callGeminiOnce(apiKey, prompt) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6 }
        })
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      const err = new Error(`API error ${res.status}: ${errBody.slice(0, 200)}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function generateReport(apiKey, bullets) {
    const prompt = `Kamu membantu menulis laporan harian magang berdasarkan catatan singkat mahasiswa.
Catatan mentah dari mahasiswa:
"""
${bullets}
"""

Tulis ulang menjadi 3 bagian laporan harian magang dalam Bahasa Indonesia formal, masing-masing MINIMAL 100 karakter, natural dan tidak mengada-ada di luar catatan yang diberikan:
1. "aktivitas": uraian aktivitas yang dikerjakan hari ini
2. "pembelajaran": pembelajaran atau wawasan baru yang diperoleh
3. "kendala": kendala yang dialami (jika catatan tidak menyebutkan kendala, tulis singkat bahwa tidak ada kendala berarti hari ini, tetap sopan dan wajar, minimal 100 karakter)

Balas HANYA dengan JSON valid, tanpa markdown, tanpa penjelasan tambahan, persis format ini:
{"aktivitas": "...", "pembelajaran": "...", "kendala": "..."}`;

    const delays = [1500, 3000, 5000]; // 3x retry kalau server lagi sibuk (503)
    let data;
    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        data = await callGeminiOnce(apiKey, prompt);
        break;
      } catch (err) {
        const isOverloaded = err.status === 503 || err.status === 429;
        const isLastAttempt = attempt === delays.length;
        if (!isOverloaded || isLastAttempt) throw err;
        setStatus(`Server AI lagi sibuk, coba ulang... (${attempt + 1}/${delays.length})`, '');
        await sleep(delays[attempt]);
      }
    }

    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      throw new Error('Respons AI tidak dalam format JSON yang diharapkan.');
    }
    if (!parsed.aktivitas || !parsed.pembelajaran || !parsed.kendala) {
      throw new Error('Respons AI tidak lengkap.');
    }
    return parsed;
  }

  generateBtn.addEventListener('click', async () => {
    const bullets = bulletsEl.value.trim();
    if (!bullets) {
      setStatus('Isi dulu poin kegiatannya.', 'error');
      return;
    }
    chrome.storage.local.set({ lastBullets: bullets });

    const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');
    if (!geminiApiKey) {
      setStatus('Masukkan Gemini API key di Pengaturan dulu.', 'error');
      settingsEl.classList.add('open');
      return;
    }

    generateBtn.disabled = true;
    setStatus('Menghasilkan teks laporan...', '');

    try {
      const result = await generateReport(geminiApiKey, bullets);
      const textareas = getVisibleTextareas();

      if (textareas.length < 3) {
        setStatus(`Cuma ketemu ${textareas.length} kolom teks (butuh 3). Pastikan kamu di halaman "Tambah Laporan".`, 'error');
        generateBtn.disabled = false;
        return;
      }

      setNativeValue(textareas[0], result.aktivitas);
      setNativeValue(textareas[1], result.pembelajaran);
      setNativeValue(textareas[2], result.kendala);

      setStatus('Berhasil diisi ke form!', 'success');
    } catch (err) {
      console.error('[MagangHub AI]', err);
      setStatus('Gagal generate: ' + err.message, 'error');
    } finally {
      generateBtn.disabled = false;
    }
  });
})();
