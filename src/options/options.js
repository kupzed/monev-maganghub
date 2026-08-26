/**
 * MagangHub AI Assistant - Options Page Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const toastContainer = document.getElementById('toastContainer');

  // AI Tab Elements
  const optApiKey = document.getElementById('optApiKey');
  const btnToggleKeyVisibility = document.getElementById('btnToggleKeyVisibility');
  const btnTestApiKey = document.getElementById('btnTestApiKey');
  const apiKeyStatusText = document.getElementById('apiKeyStatusText');
  const optModel = document.getElementById('optModel');
  const optTone = document.getElementById('optTone');
  const optCustomInstructions = document.getElementById('optCustomInstructions');
  const optEnableMemoryContext = document.getElementById('optEnableMemoryContext');
  const optMemoryContextCount = document.getElementById('optMemoryContextCount');
  const btnSaveAiSettings = document.getElementById('btnSaveAiSettings');

  // Reminder Tab Elements
  const optReminderEnabled = document.getElementById('optReminderEnabled');
  const optReminderTime = document.getElementById('optReminderTime');
  const optSkipWeekends = document.getElementById('optSkipWeekends');
  const btnTestNotification = document.getElementById('btnTestNotification');
  const btnSaveReminderSettings = document.getElementById('btnSaveReminderSettings');

  // Templates Elements
  const tplTitle = document.getElementById('tplTitle');
  const tplBullets = document.getElementById('tplBullets');
  const btnAddTemplate = document.getElementById('btnAddTemplate');
  const customTemplatesList = document.getElementById('customTemplatesList');
  const presetTemplatesList = document.getElementById('presetTemplatesList');

  // History Elements
  const searchHistory = document.getElementById('searchHistory');
  const historyListContainer = document.getElementById('historyListContainer');
  const btnExportMarkdown = document.getElementById('btnExportMarkdown');
  const btnExportJson = document.getElementById('btnExportJson');
  const btnExportCsv = document.getElementById('btnExportCsv');
  const btnClearHistory = document.getElementById('btnClearHistory');

  // Toast Notification Helper
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Tab Navigation Handling
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');

      navItems.forEach((n) => n.classList.remove('active'));
      tabPanes.forEach((p) => p.classList.remove('active'));

      item.classList.add('active');
      const targetPane = document.getElementById(targetTab);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Load Saved Settings
  const settings = await StorageUtil.getSettings();

  optApiKey.value = settings.geminiApiKey || '';
  optModel.value = settings.selectedModel || 'gemini-2.5-flash';
  optTone.value = settings.reportTone || 'formal';
  optCustomInstructions.value = settings.customInstructions || '';
  optEnableMemoryContext.checked = settings.enableMemoryContext !== undefined ? settings.enableMemoryContext : true;
  optMemoryContextCount.value = String(settings.memoryContextCount || 3);

  optReminderEnabled.checked = settings.reminderEnabled !== undefined ? settings.reminderEnabled : true;
  optReminderTime.value = settings.reminderTime || '17:00';
  optSkipWeekends.checked = settings.reminderSkipWeekends !== undefined ? settings.reminderSkipWeekends : true;

  if (settings.geminiApiKey) {
    apiKeyStatusText.textContent = 'Status: API Key tersimpan.';
    apiKeyStatusText.style.color = '#10b981';
  }

  // Toggle API Key Visibility
  btnToggleKeyVisibility.addEventListener('click', () => {
    if (optApiKey.type === 'password') {
      optApiKey.type = 'text';
      btnToggleKeyVisibility.textContent = '🙈 Sembunyikan';
    } else {
      optApiKey.type = 'password';
      btnToggleKeyVisibility.textContent = '👁️ Lihat';
    }
  });

  // Test API Key
  btnTestApiKey.addEventListener('click', async () => {
    const key = optApiKey.value.trim();
    const model = optModel.value;

    if (!key) {
      showToast('Masukkan API Key terlebih dahulu.', 'error');
      optApiKey.focus();
      return;
    }

    btnTestApiKey.disabled = true;
    btnTestApiKey.textContent = '⏳ Menguji...';
    apiKeyStatusText.textContent = 'Status: Menghubungi server Google Gemini...';
    apiKeyStatusText.style.color = '#64748b';

    try {
      await GeminiClient.testApiKey(key, model);
      apiKeyStatusText.textContent = 'Status: Koneksi Berhasil! API Key aktif dan valid.';
      apiKeyStatusText.style.color = '#10b981';
      showToast('Koneksi API Key berhasil!', 'success');
    } catch (err) {
      console.error('[MagangHub Test API]', err);
      apiKeyStatusText.textContent = `Status Gagal: ${err.message}`;
      apiKeyStatusText.style.color = '#ef4444';
      showToast(`Gagal: ${err.message}`, 'error');
    } finally {
      btnTestApiKey.disabled = false;
      btnTestApiKey.textContent = '⚡ Test Koneksi';
    }
  });

  // Save AI Settings
  btnSaveAiSettings.addEventListener('click', async () => {
    const key = optApiKey.value.trim();
    const model = optModel.value;
    const tone = optTone.value;
    const customInstructions = optCustomInstructions.value.trim();
    const enableMemory = optEnableMemoryContext.checked;
    const memoryCount = parseInt(optMemoryContextCount.value, 10) || 3;

    await StorageUtil.saveSettings({
      geminiApiKey: key,
      selectedModel: model,
      reportTone: tone,
      customInstructions: customInstructions,
      enableMemoryContext: enableMemory,
      memoryContextCount: memoryCount
    });

    showToast('Konfigurasi AI & Memori berhasil disimpan!', 'success');
  });

  // Save Reminder Settings
  btnSaveReminderSettings.addEventListener('click', async () => {
    const enabled = optReminderEnabled.checked;
    const time = optReminderTime.value;
    const skipWeekends = optSkipWeekends.checked;

    await StorageUtil.saveSettings({
      reminderEnabled: enabled,
      reminderTime: time,
      reminderSkipWeekends: skipWeekends
    });

    // Notify background worker to reschedule
    chrome.runtime.sendMessage({ type: 'RESCHEDULE_ALARM' });

    showToast('Pengaturan jadwal alarm berhasil disimpan!', 'success');
  });

  // Test Notification Button
  btnTestNotification.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'TEST_NOTIFICATION' }, (res) => {
      showToast('Notifikasi pengingat dikirim!', 'info');
    });
  });

  // Render Preset Templates
  function renderPresetTemplates() {
    presetTemplatesList.innerHTML = '';
    if (typeof PRESET_TEMPLATES === 'undefined') return;

    PRESET_TEMPLATES.forEach((tpl) => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.innerHTML = `
        <div class="template-card-header">
          <span class="template-title">${tpl.title}</span>
          <span style="font-size:11px; color:#64748b;">${tpl.category}</span>
        </div>
        <pre class="template-bullets">${tpl.bullets}</pre>
        <div class="template-actions">
          <button class="btn-outline-sm btn-copy-tpl" data-bullets="${encodeURIComponent(tpl.bullets)}">Salin Poin</button>
        </div>
      `;
      presetTemplatesList.appendChild(card);
    });
  }

  // Render Custom Templates
  async function renderCustomTemplates() {
    customTemplatesList.innerHTML = '';
    const list = await StorageUtil.getCustomTemplates();

    if (!list || list.length === 0) {
      customTemplatesList.innerHTML = '<p style="color:#94a3b8; font-size:13px; grid-column: 1/-1;">Belum ada template kustom. Buat template pertama kamu di atas!</p>';
      return;
    }

    list.forEach((tpl) => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.innerHTML = `
        <div class="template-card-header">
          <span class="template-title">⭐ ${tpl.title}</span>
          <button class="btn-danger-sm btn-del-tpl" data-id="${tpl.id}" style="padding:2px 8px; font-size:11px;">Hapus</button>
        </div>
        <pre class="template-bullets">${tpl.bullets}</pre>
        <div class="template-actions">
          <button class="btn-outline-sm btn-copy-tpl" data-bullets="${encodeURIComponent(tpl.bullets)}">Salin Poin</button>
        </div>
      `;
      customTemplatesList.appendChild(card);
    });

    // Delete Template Handler
    document.querySelectorAll('.btn-del-tpl').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Yakin ingin menghapus template ini?')) {
          await StorageUtil.deleteCustomTemplate(id);
          renderCustomTemplates();
          showToast('Template dihapus.', 'info');
        }
      });
    });
  }

  // Add Template Handler
  btnAddTemplate.addEventListener('click', async () => {
    const title = tplTitle.value.trim();
    const bullets = tplBullets.value.trim();

    if (!title || !bullets) {
      showToast('Nama dan catatan poin template tidak boleh kosong.', 'error');
      return;
    }

    await StorageUtil.saveCustomTemplate(title, bullets);
    tplTitle.value = '';
    tplBullets.value = '';
    renderCustomTemplates();
    showToast('Template kustom berhasil ditambahkan!', 'success');
  });

  // Global Template Copy Handler
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-copy-tpl')) {
      const bullets = decodeURIComponent(e.target.getAttribute('data-bullets'));
      await navigator.clipboard.writeText(bullets);
      showToast('Poin template berhasil disalin ke clipboard!', 'success');
    }
  });

  renderPresetTemplates();
  renderCustomTemplates();

  // History / Logbook Management
  let allHistory = [];

  async function loadHistory() {
    allHistory = await StorageUtil.getHistory();
    renderHistoryList(allHistory);
  }

  function renderHistoryList(items) {
    historyListContainer.innerHTML = '';

    if (!items || items.length === 0) {
      historyListContainer.innerHTML = `
        <div style="text-align:center; padding: 32px 16px; color:#94a3b8;">
          <p style="font-size:28px; margin-bottom:8px;">📝</p>
          <p style="font-size:14px; font-weight:600; color:#64748b;">Belum ada riwayat laporan tersimpan.</p>
          <p style="font-size:12.5px;">Laporan yang kamu buat dengan AI akan otomatis diarsipkan di sini.</p>
        </div>
      `;
      return;
    }

    items.forEach((item) => {
      const dateFormatted = new Date(item.timestamp).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const el = document.createElement('div');
      el.className = 'history-item';
      el.innerHTML = `
        <div class="history-item-header">
          <span class="history-date">📅 ${dateFormatted}</span>
          <span class="history-model">${item.modelUsed || 'Gemini'}</span>
        </div>
        <div style="font-size:12px; color:#64748b; background:#f8fafc; padding:6px 10px; border-radius:6px; border:1px dashed #e2e8f0;">
          <strong>Poin Mentah:</strong> ${item.bullets}
        </div>
        <div class="history-content">
          <div class="history-col">
            <div class="history-col-title">1. Aktivitas (${item.aktivitas.length} char)</div>
            <div class="history-col-text">${item.aktivitas}</div>
          </div>
          <div class="history-col">
            <div class="history-col-title">2. Pembelajaran (${item.pembelajaran.length} char)</div>
            <div class="history-col-text">${item.pembelajaran}</div>
          </div>
          <div class="history-col">
            <div class="history-col-title">3. Kendala (${item.kendala.length} char)</div>
            <div class="history-col-text">${item.kendala}</div>
          </div>
        </div>
        <div class="history-item-actions">
          <button class="btn-secondary-sm btn-copy-history" data-id="${item.id}">📋 Salin Format Lengkap</button>
          <button class="btn-danger-sm btn-del-history" data-id="${item.id}">🗑️ Hapus</button>
        </div>
      `;
      historyListContainer.appendChild(el);
    });

    // History Item Actions
    document.querySelectorAll('.btn-copy-history').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const item = allHistory.find((h) => h.id === id);
        if (item) {
          const text = `LAPORAN MAGANG (${item.dateStr || ''})\n\n1. AKTIVITAS:\n${item.aktivitas}\n\n2. PEMBELAJARAN:\n${item.pembelajaran}\n\n3. KENDALA & SOLUSI:\n${item.kendala}`;
          await navigator.clipboard.writeText(text);
          showToast('Laporan berhasil disalin ke clipboard!', 'success');
        }
      });
    });

    document.querySelectorAll('.btn-del-history').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Hapus entri riwayat ini?')) {
          await StorageUtil.deleteHistoryEntry(id);
          loadHistory();
          showToast('Entri riwayat dihapus.', 'info');
        }
      });
    });
  }

  // Search History
  searchHistory.addEventListener('input', () => {
    const q = searchHistory.value.toLowerCase().trim();
    if (!q) {
      renderHistoryList(allHistory);
      return;
    }
    const filtered = allHistory.filter((item) => {
      return (
        (item.bullets && item.bullets.toLowerCase().includes(q)) ||
        (item.aktivitas && item.aktivitas.toLowerCase().includes(q)) ||
        (item.pembelajaran && item.pembelajaran.toLowerCase().includes(q)) ||
        (item.kendala && item.kendala.toLowerCase().includes(q)) ||
        (item.dateStr && item.dateStr.includes(q))
      );
    });
    renderHistoryList(filtered);
  });

  // Clear All History
  btnClearHistory.addEventListener('click', async () => {
    if (allHistory.length === 0) return;
    if (confirm('Apakah kamu yakin ingin MENGHAPUS SEMUA riwayat logbook? Tindakan ini tidak dapat dibatalkan.')) {
      await StorageUtil.clearHistory();
      loadHistory();
      showToast('Seluruh riwayat berhasil dibersihkan.', 'info');
    }
  });

  // Export File Helper
  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Export Markdown
  btnExportMarkdown.addEventListener('click', () => {
    if (allHistory.length === 0) {
      showToast('Tidak ada data riwayat untuk diekspor.', 'error');
      return;
    }

    let md = `# Riwayat Logbook Harian MagangHub\n\n`;
    md += `Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}\nTotal Laporan: ${allHistory.length}\n\n---\n\n`;

    allHistory.forEach((h, idx) => {
      md += `## Laporan ${idx + 1}: ${h.dateStr || new Date(h.timestamp).toLocaleDateString('id-ID')}\n\n`;
      md += `**Model:** \`${h.modelUsed || 'gemini'}\`  \n`;
      md += `**Catatan Poin:**  \n${h.bullets}\n\n`;
      md += `### 1. Aktivitas\n${h.aktivitas}\n\n`;
      md += `### 2. Pembelajaran\n${h.pembelajaran}\n\n`;
      md += `### 3. Kendala & Solusi\n${h.kendala}\n\n`;
      md += `---\n\n`;
    });

    downloadFile(md, `logbook-maganghub-${new Date().toISOString().split('T')[0]}.md`, 'text/markdown');
    showToast('Berhasil mengekspor format Markdown!', 'success');
  });

  // Export JSON
  btnExportJson.addEventListener('click', () => {
    if (allHistory.length === 0) {
      showToast('Tidak ada data riwayat untuk diekspor.', 'error');
      return;
    }
    const jsonStr = JSON.stringify(allHistory, null, 2);
    downloadFile(jsonStr, `logbook-maganghub-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    showToast('Berhasil mengekspor format JSON!', 'success');
  });

  // Export CSV
  btnExportCsv.addEventListener('click', () => {
    if (allHistory.length === 0) {
      showToast('Tidak ada data riwayat untuk diekspor.', 'error');
      return;
    }

    const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""')}"`;
    let csv = 'ID,Tanggal,Model,Poin Mentah,Aktivitas,Pembelajaran,Kendala\n';

    allHistory.forEach((h) => {
      csv += `${escapeCsv(h.id)},${escapeCsv(h.dateStr || h.timestamp)},${escapeCsv(h.modelUsed)},${escapeCsv(h.bullets)},${escapeCsv(h.aktivitas)},${escapeCsv(h.pembelajaran)},${escapeCsv(h.kendala)}\n`;
    });

    downloadFile(csv, `logbook-maganghub-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    showToast('Berhasil mengekspor format CSV!', 'success');
  });

  loadHistory();
});
