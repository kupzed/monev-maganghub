/**
 * MagangHub AI Assistant - Storage Utilities
 * Centralized chrome.storage helper with default configurations
 */

const DEFAULT_SETTINGS = {
  geminiApiKey: '',
  selectedModel: 'gemini-2.5-flash',
  reportTone: 'formal', // 'formal', 'detailed', 'concise', 'casual_polite'
  customInstructions: '',
  reminderEnabled: true,
  reminderTime: '17:00',
  reminderSkipWeekends: true,
  minCharLimit: 100,
  enableMemoryContext: true,
  memoryContextCount: 3,
  autoFillDirectly: false,
  fabPosition: { right: 24, bottom: 24 },
  lastBullets: ''
};

const StorageUtil = {
  /**
   * Get all extension settings with defaults applied
   */
  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (items) => {
        const settings = { ...DEFAULT_SETTINGS };
        for (const key in DEFAULT_SETTINGS) {
          if (items[key] !== undefined) {
            settings[key] = items[key];
          }
        }
        resolve(settings);
      });
    });
  },

  /**
   * Update settings in chrome.storage.local
   */
  async saveSettings(partialSettings) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(partialSettings, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(true);
        }
      });
    });
  },

  /**
   * Get history logs
   */
  async getHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['reportHistory'], (res) => {
        resolve(res.reportHistory || []);
      });
    });
  },

  /**
   * Add a report to history (keeps max 100 recent entries)
   */
  async addHistoryEntry(entry) {
    const history = await this.getHistory();
    const newEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      timestamp: new Date().toISOString(),
      dateStr: new Date().toISOString().split('T')[0],
      bullets: entry.bullets || '',
      aktivitas: entry.aktivitas || '',
      pembelajaran: entry.pembelajaran || '',
      kendala: entry.kendala || '',
      modelUsed: entry.modelUsed || 'gemini-2.5-flash'
    };

    history.unshift(newEntry);
    const trimmedHistory = history.slice(0, 100);

    return new Promise((resolve) => {
      chrome.storage.local.set({ reportHistory: trimmedHistory }, () => {
        resolve(newEntry);
      });
    });
  },

  /**
   * Delete single history entry by id
   */
  async deleteHistoryEntry(id) {
    const history = await this.getHistory();
    const filtered = history.filter((item) => item.id !== id);
    return new Promise((resolve) => {
      chrome.storage.local.set({ reportHistory: filtered }, () => {
        resolve(true);
      });
    });
  },

  /**
   * Clear all history logs
   */
  async clearHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.set({ reportHistory: [] }, () => {
        resolve(true);
      });
    });
  },

  /**
   * Get custom templates stored by user
   */
  async getCustomTemplates() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['customTemplates'], (res) => {
        resolve(res.customTemplates || []);
      });
    });
  },

  /**
   * Save a new custom template
   */
  async saveCustomTemplate(title, bullets) {
    const templates = await this.getCustomTemplates();
    const newTemplate = {
      id: 'tpl_' + Date.now(),
      title,
      bullets,
      createdAt: new Date().toISOString()
    };
    templates.unshift(newTemplate);
    return new Promise((resolve) => {
      chrome.storage.local.set({ customTemplates: templates }, () => {
        resolve(newTemplate);
      });
    });
  },

  /**
   * Delete custom template
   */
  async deleteCustomTemplate(id) {
    const templates = await this.getCustomTemplates();
    const filtered = templates.filter((item) => item.id !== id);
    return new Promise((resolve) => {
      chrome.storage.local.set({ customTemplates: filtered }, () => {
        resolve(true);
      });
    });
  }
};

// Export to global / module scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_SETTINGS, StorageUtil };
}
