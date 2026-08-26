/**
 * MagangHub AI Assistant - Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const statusBanner = document.getElementById('statusBanner');
  const statusText = document.getElementById('statusText');
  const statusActionBtn = document.getElementById('statusActionBtn');
  const btnOpenOptions = document.getElementById('btnOpenOptions');
  const btnOpenMonev = document.getElementById('btnOpenMonev');
  const currentDateStr = document.getElementById('currentDateStr');
  const selectPreset = document.getElementById('selectPreset');
  const bulletsInput = document.getElementById('bulletsInput');
  const btnGenerate = document.getElementById('btnGenerate');
  const resultCard = document.getElementById('resultCard');
  const btnCopyAll = document.getElementById('btnCopyAll');

  const resAktivitas = document.getElementById('resAktivitas');
  const resPembelajaran = document.getElementById('resPembelajaran');
  const resKendala = document.getElementById('resKendala');

  const countAktivitas = document.getElementById('countAktivitas');
  const countPembelajaran = document.getElementById('countPembelajaran');
  const countKendala = document.getElementById('countKendala');

  // Format today's date in Indonesian
  const today = new Date();
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  const formattedDate = today.toLocaleDateString('id-ID', options);
  const dateIso = today.toISOString().split('T')[0];
  currentDateStr.textContent = `Laporan Harian (${formattedDate})`;

  // Load Settings & Check Status
  let settings = await StorageUtil.getSettings();

  function updateStatusUI() {
    if (!settings.geminiApiKey || !settings.geminiApiKey.trim()) {
      statusBanner.className = 'status-banner warning';
      statusText.textContent = 'API Key Gemini belum diatur.';
      statusActionBtn.textContent = 'Atur Sekarang';
      statusActionBtn.classList.remove('hidden');
    } else {
      statusBanner.className = 'status-banner ready';
      statusText.textContent = `Siap (${settings.selectedModel || 'gemini-2.5-flash'})`;
      statusActionBtn.classList.add('hidden');
    }
  }

  updateStatusUI();

  // Restore last bullets if available
  if (settings.lastBullets) {
    bulletsInput.value = settings.lastBullets;
  }

  // Populate Presets
  if (typeof PRESET_TEMPLATES !== 'undefined') {
    PRESET_TEMPLATES.forEach((tpl) => {
      const opt = document.createElement('option');
      opt.value = tpl.id;
      opt.textContent = tpl.title;
      selectPreset.appendChild(opt);
    });
  }

  // Load Custom Templates
  const customTemplates = await StorageUtil.getCustomTemplates();
  if (customTemplates && customTemplates.length > 0) {
    const optGroup = document.createElement('optgroup');
    optGroup.label = 'Template Kustom Kamu';
    customTemplates.forEach((tpl) => {
      const opt = document.createElement('option');
      opt.value = tpl.id;
      opt.textContent = `⭐ ${tpl.title}`;
      optGroup.appendChild(opt);
    });
    selectPreset.appendChild(optGroup);
  }

  // Preset Selection Event
  selectPreset.addEventListener('change', () => {
    const selectedId = selectPreset.value;
    if (!selectedId) return;

    // Check built-in presets
    const builtIn = PRESET_TEMPLATES.find((p) => p.id === selectedId);
    if (builtIn) {
      bulletsInput.value = builtIn.bullets;
      bulletsInput.focus();
      return;
    }

    // Check custom templates
    const custom = customTemplates.find((c) => c.id === selectedId);
    if (custom) {
      bulletsInput.value = custom.bullets;
      bulletsInput.focus();
    }
  });

  // Open Options Page
  const openOptions = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('src/options/options.html'));
    }
  };

  btnOpenOptions.addEventListener('click', openOptions);
  statusActionBtn.addEventListener('click', openOptions);

  // Open Monev Portal
  btnOpenMonev.addEventListener('click', () => {
    const targetUrl = `https://monev.maganghub.kemnaker.go.id/dashboard/riwayat?date=${dateIso}&view=edit`;
    chrome.tabs.create({ url: targetUrl });
  });

  // Character Counter Helper
  function updateCharCount(textarea, countEl) {
    const len = textarea.value.length;
    countEl.textContent = `${len} char`;
    if (len >= 100) {
      countEl.className = 'char-count valid';
    } else {
      countEl.className = 'char-count invalid';
    }
  }

  [
    { textarea: resAktivitas, countEl: countAktivitas },
    { textarea: resPembelajaran, countEl: countPembelajaran },
    { textarea: resKendala, countEl: countKendala }
  ].forEach(({ textarea, countEl }) => {
    textarea.addEventListener('input', () => updateCharCount(textarea, countEl));
  });

  // Generate Report
  btnGenerate.addEventListener('click', async () => {
    const bullets = bulletsInput.value.trim();
    if (!bullets) {
      alert('Silakan tulis catatan poin kegiatan hari ini terlebih dahulu.');
      bulletsInput.focus();
      return;
    }

    // Reload settings in case updated
    settings = await StorageUtil.getSettings();
    if (!settings.geminiApiKey) {
      alert('Gemini API Key belum diatur. Silakan atur di menu Pengaturan.');
      openOptions();
      return;
    }

    // Save last bullets
    await StorageUtil.saveSettings({ lastBullets: bullets });

    btnGenerate.disabled = true;
    btnGenerate.innerHTML = `<span class="btn-icon">⏳</span><span class="btn-label">Sedang Menulis Laporan...</span>`;

    try {
      const history = await StorageUtil.getHistory();
      const result = await GeminiClient.generateReport(settings.geminiApiKey, bullets, settings, null, history);

      resAktivitas.value = result.aktivitas;
      resPembelajaran.value = result.pembelajaran;
      resKendala.value = result.kendala;

      updateCharCount(resAktivitas, countAktivitas);
      updateCharCount(resPembelajaran, countPembelajaran);
      updateCharCount(resKendala, countKendala);

      resultCard.classList.remove('hidden');
      resultCard.scrollIntoView({ behavior: 'smooth' });

      // Save to history logbook
      await StorageUtil.addHistoryEntry({
        bullets,
        aktivitas: result.aktivitas,
        pembelajaran: result.pembelajaran,
        kendala: result.kendala,
        modelUsed: result.modelUsed
      });
    } catch (err) {
      console.error('[MagangHub Popup]', err);
      alert('Gagal menghasilkan laporan:\n' + err.message);
    } finally {
      btnGenerate.disabled = false;
      btnGenerate.innerHTML = `<span class="btn-icon">⚡</span><span class="btn-label">Generate Ulang Laporan</span>`;
    }
  });

  // Copy All
  btnCopyAll.addEventListener('click', async () => {
    const text = `1. AKTIVITAS:\n${resAktivitas.value}\n\n2. PEMBELAJARAN:\n${resPembelajaran.value}\n\n3. KENDALA & SOLUSI:\n${resKendala.value}`;
    await navigator.clipboard.writeText(text);

    const origText = btnCopyAll.textContent;
    btnCopyAll.textContent = 'Tersalin! ✅';
    setTimeout(() => {
      btnCopyAll.textContent = origText;
    }, 2000);
  });

  // Copy Individual Sections
  document.querySelectorAll('.btn-copy-mini').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        await navigator.clipboard.writeText(targetEl.value);
        const orig = btn.textContent;
        btn.textContent = 'Tersalin! ✅';
        setTimeout(() => {
          btn.textContent = orig;
        }, 1500);
      }
    });
  });
});
