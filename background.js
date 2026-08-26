function scheduleAlarm() {
  const now = new Date();

  // Buat target jam 17:00 hari ini
  let nextAlarm = new Date();
  nextAlarm.setHours(17, 0, 0, 0);

  // Jika hari ini sudah lewat jam 17:00, set untuk besok
  if (now.getTime() >= nextAlarm.getTime()) {
    nextAlarm.setDate(nextAlarm.getDate() + 1);
  }

  // Set alarm menggunakan API Chrome
  chrome.alarms.create("absenReminder", {
    when: nextAlarm.getTime(),
    periodInMinutes: 24 * 60 // Ulangi setiap 24 jam (1 hari)
  });

  console.log("MagangHub: Alarm dijadwalkan pada", nextAlarm.toLocaleString());
}

// Saat ekstensi di-install atau di-reload
chrome.runtime.onInstalled.addListener(() => {
  scheduleAlarm();
});

// Listener ketika alarm berbunyi
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "absenReminder") {
    const title = "⏰ Waktunya Absen Magang!";

    // Mendapatkan tanggal hari ini dalam format YYYY-MM-DD
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    const targetUrl = `https://monev.maganghub.kemnaker.go.id/dashboard/riwayat?date=${dateString}&view=edit`;

    // Cari tab yang sedang aktif di window yang aktif
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        const activeTab = tabs[0];
        
        // Suntikkan komponen UI notifikasi ke tab yang sedang aktif
        chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: injectNotification,
          args: [title, targetUrl]
        }).then(() => {
          console.log("MagangHub: Notifikasi berhasil disuntikkan ke tab", activeTab.title);
        }).catch((err) => {
          console.error("MagangHub: Gagal menyuntikkan notifikasi", err);
        });
      }
    });
  }
});

// Fungsi ini akan dieksekusi di DALAM konteks halaman web (DOM)
function injectNotification(title, targetUrl) {
  if (document.getElementById('maganghub-toast')) return; // Jangan double

  const toast = document.createElement('div');
  toast.id = 'maganghub-toast';
  toast.innerHTML = `
    <div style="
      position: fixed; top: 20px; right: 20px; z-index: 2147483647;
      background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      padding: 16px 20px; font-family: system-ui, -apple-system, sans-serif; width: 340px;
      border-left: 5px solid #2563eb; display: flex; flex-direction: column; gap: 10px;
      transform: translateX(120%); transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong style="font-size: 15px; color: #1e1b4b; margin: 0;">${title}</strong>
        <button id="mh-close" style="background:none; border:none; cursor:pointer; font-size:18px; color:#9ca3af; padding:0;">&times;</button>
      </div>
      <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.4;">
        Sudah jam 17:00! Jangan lupa isi laporan MagangHub kamu hari ini ya.
      </p>
      <a href="${targetUrl}" target="_blank" style="
        background: #2563eb; color: white; text-decoration: none; padding: 10px 14px;
        border-radius: 8px; font-size: 13px; font-weight: bold; text-align: center;
        margin-top: 6px; transition: background 0.2s; box-shadow: 0 4px 10px rgba(37,99,235,0.3);
      " onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">
        Isi Laporan Sekarang &rarr;
      </a>
    </div>
  `;
  document.body.appendChild(toast);

  const container = toast.firstElementChild;
  // Animasi masuk
  setTimeout(() => { container.style.transform = 'translateX(0)'; }, 50);

  const closeBtn = toast.querySelector('#mh-close');
  const linkBtn = toast.querySelector('a');

  function closeToast() {
    container.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 500);
  }

  closeBtn.addEventListener('click', closeToast);
  linkBtn.addEventListener('click', closeToast);
}
