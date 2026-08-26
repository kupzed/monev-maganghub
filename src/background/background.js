/**
 * MagangHub AI Assistant - Background Service Worker (Manifest V3)
 * Handles daily attendance reminder alarms, native OS notifications, and tab navigation.
 */

const ALARM_NAME = 'maganghub_daily_reminder';

/**
 * Calculate next reminder date timestamp
 */
function getNextAlarmTime(timeStr, skipWeekends) {
  const [hourStr, minStr] = (timeStr || '17:00').split(':');
  const targetHour = parseInt(hourStr, 10) || 17;
  const targetMin = parseInt(minStr, 10) || 0;

  const now = new Date();
  const next = new Date();
  next.setHours(targetHour, targetMin, 0, 0);

  // If time already passed today, move to tomorrow
  if (now.getTime() >= next.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  // If skipping weekends, advance from Saturday/Sunday to Monday
  if (skipWeekends) {
    const day = next.getDay(); // 0 = Sunday, 6 = Saturday
    if (day === 6) {
      next.setDate(next.getDate() + 2); // Saturday -> Monday
    } else if (day === 0) {
      next.setDate(next.getDate() + 1); // Sunday -> Monday
    }
  }

  return next.getTime();
}

/**
 * Schedule or update reminder alarm
 */
async function setupAlarm() {
  await chrome.alarms.clear(ALARM_NAME);

  const data = await chrome.storage.local.get(['reminderEnabled', 'reminderTime', 'reminderSkipWeekends']);
  const enabled = data.reminderEnabled !== undefined ? data.reminderEnabled : true;
  const reminderTime = data.reminderTime || '17:00';
  const skipWeekends = data.reminderSkipWeekends !== undefined ? data.reminderSkipWeekends : true;

  if (!enabled) {
    console.log('[MagangHub Background] Reminder alarm is disabled.');
    return;
  }

  const when = getNextAlarmTime(reminderTime, skipWeekends);
  chrome.alarms.create(ALARM_NAME, {
    when: when,
    periodInMinutes: 24 * 60
  });

  console.log('[MagangHub Background] Alarm scheduled for:', new Date(when).toLocaleString());
}

/**
 * Trigger native OS notification
 */
async function showReminderNotification() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const targetUrl = `https://monev.maganghub.kemnaker.go.id/dashboard/riwayat?date=${dateStr}&view=edit`;

  const notificationOptions = {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
    title: '⏰ Waktunya Isi Laporan MagangHub!',
    message: 'Sudah jam pulang! Luangkan 2 menit untuk mengisi laporan harian dengan bantuan AI agar tidak tertinggal.',
    buttons: [
      { title: '🚀 Buka Monev MagangHub' },
      { title: 'Nanti' }
    ],
    requireInteraction: true
  };

  chrome.notifications.create('maganghub_reminder_' + Date.now(), notificationOptions, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.warn('[MagangHub Background] Failed to create notification:', chrome.runtime.lastError);
    } else {
      console.log('[MagangHub Background] Notification created with ID:', notificationId);
    }
  });

  // Also try to alert any currently active tab gracefully
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs[0] && tabs[0].id && tabs[0].url && tabs[0].url.startsWith('http')) {
      await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: injectInPageToast,
        args: [targetUrl]
      });
    }
  } catch (err) {
    // Non-fatal if tab is restricted (e.g. chrome://)
  }
}

/**
 * Helper injected into active web tab if permissible
 */
function injectInPageToast(targetUrl) {
  if (document.getElementById('__maganghub_alarm_toast')) return;

  const toast = document.createElement('div');
  toast.id = '__maganghub_alarm_toast';
  toast.innerHTML = `
    <div style="
      position: fixed; top: 24px; right: 24px; z-index: 2147483647;
      background: #0f172a; color: #f8fafc; border-radius: 14px; box-shadow: 0 20px 45px rgba(0,0,0,0.35);
      padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      width: 340px; border-left: 5px solid #3b82f6; display: flex; flex-direction: column; gap: 10px;
      transform: translateX(120%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    ">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 14px; font-weight: 700; color: #60a5fa; display: flex; align-items: center; gap: 6px;">
          ⏰ Waktunya Absen Magang!
        </span>
        <button id="__mh_toast_close" style="background:none; border:none; cursor:pointer; font-size:18px; color:#94a3b8; line-height:1;">&times;</button>
      </div>
      <p style="margin: 0; font-size: 12.5px; color: #cbd5e1; line-height: 1.45;">
        Sudah saatnya melengkapi laporan harian MagangHub kamu hari ini.
      </p>
      <div style="display: flex; gap: 8px; margin-top: 4px;">
        <a href="${targetUrl}" target="_blank" id="__mh_toast_link" style="
          flex: 1; background: #2563eb; color: #ffffff; text-decoration: none; padding: 8px 12px;
          border-radius: 8px; font-size: 12.5px; font-weight: 600; text-align: center;
          transition: background 0.2s;
        ">
          Isi Laporan &rarr;
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(toast);

  const container = toast.firstElementChild;
  setTimeout(() => {
    if (container) container.style.transform = 'translateX(0)';
  }, 50);

  const closeToast = () => {
    if (container) container.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 450);
  };

  const closeBtn = toast.querySelector('#__mh_toast_close');
  const linkBtn = toast.querySelector('#__mh_toast_link');
  if (closeBtn) closeBtn.addEventListener('click', closeToast);
  if (linkBtn) linkBtn.addEventListener('click', closeToast);

  // Auto-dismiss after 15s
  setTimeout(closeToast, 15000);
}

/**
 * Open or focus MagangHub tab
 */
async function openMagangHubPage() {
  const today = new Date().toISOString().split('T')[0];
  const targetUrl = `https://monev.maganghub.kemnaker.go.id/dashboard/riwayat?date=${today}&view=edit`;

  const tabs = await chrome.tabs.query({ url: '*://monev.maganghub.kemnaker.go.id/*' });
  if (tabs && tabs.length > 0) {
    await chrome.tabs.update(tabs[0].id, { active: true, url: targetUrl });
    if (tabs[0].windowId) {
      await chrome.windows.update(tabs[0].windowId, { focused: true });
    }
  } else {
    await chrome.tabs.create({ url: targetUrl });
  }
}

// Lifecycle listeners
chrome.runtime.onInstalled.addListener(() => {
  setupAlarm();
});

chrome.runtime.onStartup.addListener(() => {
  setupAlarm();
});

// Alarm event listener
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    const data = await chrome.storage.local.get(['reminderSkipWeekends']);
    const skipWeekends = data.reminderSkipWeekends !== undefined ? data.reminderSkipWeekends : true;

    if (skipWeekends) {
      const day = new Date().getDay();
      if (day === 0 || day === 6) {
        console.log('[MagangHub Background] Skipping weekend alarm.');
        return;
      }
    }

    await showReminderNotification();
  }
});

// Notification click handlers
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (notificationId.startsWith('maganghub_reminder_')) {
    if (buttonIndex === 0) {
      await openMagangHubPage();
    }
    chrome.notifications.clear(notificationId);
  }
});

chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (notificationId.startsWith('maganghub_reminder_')) {
    await openMagangHubPage();
    chrome.notifications.clear(notificationId);
  }
});

// Message listener for popup / options commands
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'RESCHEDULE_ALARM') {
    setupAlarm().then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === 'TEST_NOTIFICATION') {
    showReminderNotification().then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === 'OPEN_MAGANGHUB') {
    openMagangHubPage().then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === 'GET_STATUS') {
    (async () => {
      const data = await chrome.storage.local.get(['geminiApiKey', 'reminderEnabled', 'reminderTime']);
      const alarm = await chrome.alarms.get(ALARM_NAME);
      sendResponse({
        hasApiKey: Boolean(data.geminiApiKey && data.geminiApiKey.trim()),
        reminderEnabled: data.reminderEnabled !== undefined ? data.reminderEnabled : true,
        reminderTime: data.reminderTime || '17:00',
        nextAlarm: alarm ? new Date(alarm.scheduledTime).toLocaleString() : null
      });
    })();
    return true;
  }
});
