/**
 * MagangHub AI Assistant - Gemini API Client
 * Robust AI generation client with model selection, fallback handling, and structured JSON parsing.
 */

const AVAILABLE_MODELS = [
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite (Super Cepat & Efisien - Rekomendasi)' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Cepat & Cerdas)' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Lebih Detail & Mendalam)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Stabil & Ringan)' },
  { id: 'custom', name: 'Custom Model (Model Kustom Sendiri)' }
];

const TONE_PROMPTS = {
  formal: 'Gunakan Bahasa Indonesia formal baku yang profesional dan terstruktur ala laporan resmi universitas/instansi.',
  detailed: 'Jelaskan secara komprehensif, terperinci, dan elaboratif mengenai konteks kegiatan, metodologi, dan output yang dicapai.',
  concise: 'Tulis secara padat, lugas, dan terarah namun tetap memenuhi standar minimal 100 karakter per bagian.',
  casual_polite: 'Gunakan gaya bahasa profesional yang luwes, natural, dan santun namun tetap bertanggung jawab.'
};

class GeminiClient {
  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if endpoint or config is OpenAI-compatible (NVIDIA NIM, OpenRouter, Groq, Ollama, DeepSeek, etc.)
   */
  static isOpenAiCompatible(baseUrl = '', apiKey = '', model = '') {
    const base = (baseUrl || '').trim().toLowerCase();
    const key = (apiKey || '').trim();
    const mdl = (model || '').trim();

    if (base.includes('/chat/completions') || base.includes('/openai')) {
      return true;
    }

    if (base && !base.includes('generativelanguage.googleapis.com')) {
      return true;
    }

    if (key.startsWith('nvapi-') || key.startsWith('sk-')) {
      return true;
    }

    if (mdl.includes('/') && base && !base.includes('generativelanguage.googleapis.com')) {
      return true;
    }

    return false;
  }

  /**
   * Helper to resolve the correct endpoint URL given a base URL, model name, and API key
   */
  static getEndpointUrl(baseUrl, model, apiKey) {
    const cleanKey = apiKey ? apiKey.trim() : '';
    const safeModel = (model && model.trim() && model !== 'custom') ? model.trim() : 'gemini-3.1-flash-lite';

    if (this.isOpenAiCompatible(baseUrl, cleanKey, safeModel)) {
      let base = (baseUrl && baseUrl.trim()) ? baseUrl.trim() : 'https://integrate.api.nvidia.com/v1';
      base = base.replace(/\/+$/, '');
      if (base.endsWith('/chat/completions')) {
        return base;
      }
      return `${base}/chat/completions`;
    }

    let base = (baseUrl && baseUrl.trim()) ? baseUrl.trim() : 'https://generativelanguage.googleapis.com/v1beta';
    base = base.replace(/\/+$/, '');

    if (base === 'https://generativelanguage.googleapis.com') {
      base = 'https://generativelanguage.googleapis.com/v1beta';
    }

    if (base.includes('/models/')) {
      const sep = base.includes('?') ? '&' : '?';
      return cleanKey ? `${base}:generateContent${sep}key=${encodeURIComponent(cleanKey)}` : `${base}:generateContent`;
    }

    return cleanKey
      ? `${base}/models/${safeModel}:generateContent?key=${encodeURIComponent(cleanKey)}`
      : `${base}/models/${safeModel}:generateContent`;
  }

  /**
   * Helper to create request headers compatible with Gemini API and custom proxies
   */
  static getHeaders(apiKey, baseUrl = '', model = '') {
    const cleanKey = apiKey ? apiKey.trim() : '';
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.isOpenAiCompatible(baseUrl, cleanKey, model)) {
      if (cleanKey) {
        headers['Authorization'] = cleanKey.startsWith('Bearer ') ? cleanKey : `Bearer ${cleanKey}`;
      }
      if (baseUrl && baseUrl.includes('openrouter.ai')) {
        headers['HTTP-Referer'] = 'https://monev.maganghub.kemnaker.go.id';
        headers['X-Title'] = 'MagangHub AI Assistant';
      }
    } else {
      if (cleanKey.startsWith('sk-') || cleanKey.startsWith('Bearer ')) {
        headers['Authorization'] = cleanKey.startsWith('Bearer ') ? cleanKey : `Bearer ${cleanKey}`;
      }
    }

    return headers;
  }

  /**
   * Test API Key and Base URL validity
   */
  static async testApiKey(apiKey, model = 'gemini-3.1-flash-lite', baseUrl = '') {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('API Key tidak boleh kosong.');
    }

    const resolvedModel = (model === 'custom' || !model) ? 'gemini-3.1-flash-lite' : model;
    const isOAI = this.isOpenAiCompatible(baseUrl, apiKey, resolvedModel);
    const url = this.getEndpointUrl(baseUrl, resolvedModel, apiKey);
    const headers = this.getHeaders(apiKey, baseUrl, resolvedModel);

    const body = isOAI
      ? JSON.stringify({
          model: resolvedModel,
          messages: [{ role: 'user', content: 'Ping test. Balas dengan: OK' }],
          max_tokens: 20,
          temperature: 0.2
        })
      : JSON.stringify({
          contents: [{ parts: [{ text: 'Ping test. Balas dengan: OK' }] }],
          generationConfig: { maxOutputTokens: 20 }
        });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    });

    if (!response.ok) {
      const errText = await response.text();
      let msg = `Error ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        msg = errJson.error?.message || errJson.message || errJson.detail || msg;
      } catch (e) {
        msg = errText.slice(0, 200);
      }
      throw new Error(msg);
    }

    return true;
  }

  /**
   * Build generation prompt based on settings & previous report history (contextual memory)
   */
  static buildPrompt(bullets, options = {}, recentHistory = []) {
    const tone = options.reportTone || 'formal';
    const toneInstruction = TONE_PROMPTS[tone] || TONE_PROMPTS.formal;
    const customInstructions = options.customInstructions ? `\nPetunjuk Khusus Tambahan: ${options.customInstructions}` : '';
    const minChar = options.minCharLimit || 100;

    let memoryContextPrompt = '';
    const enableMemory = options.enableMemoryContext !== false;
    const historyToUse = recentHistory && recentHistory.length > 0 ? recentHistory : (options.recentHistory || []);

    if (enableMemory && historyToUse.length > 0) {
      const maxCount = options.memoryContextCount || 3;
      const sliced = historyToUse.slice(0, maxCount);

      const historyBlocks = sliced.map((item, idx) => {
        const date = item.dateStr || (item.timestamp ? item.timestamp.split('T')[0] : `Hari -${idx + 1}`);
        return `[Laporan Riwayat #${idx + 1} (${date})]:
- Catatan Poin Mentah: ${item.bullets || '-'}
- Aktivitas: ${item.aktivitas || '-'}
- Pembelajaran: ${item.pembelajaran || '-'}
- Kendala: ${item.kendala || '-'}`;
      }).join('\n\n');

      memoryContextPrompt = `
MEMORI & KONTEKS LAPORAN SEBELUMNYA (Contextual Memory):
Berikut adalah ${sliced.length} laporan harian terakhir yang pernah dibuat oleh peserta:
"""
${historyBlocks}
"""
Petunjuk Pemanfaatan Memori:
1. Jika catatan kegiatan hari ini merujuk ke tugas/kelanjutan kemarin (misal: "lanjutkan task kemarin", "fixing kendala database", "follow up meeting"), gunakan informasi di atas untuk memahami konteks dan buat narasi perkembangan yang berkesinambungan secara logis.
2. Hindari pengulangan frasa/kalimat yang monoton dari hari sebelumnya agar laporan terasa memiliki progres nyata.
3. Fokus utama laporan tetap pada catatan baru hari ini.
`;
    }

    return `Kamu adalah asisten profesional yang bertugas membantu peserta MagangHub Kemnaker menyusun laporan harian magang berkualitas tinggi.
${memoryContextPrompt}
Catatan kegiatan mentah dari peserta untuk HARI INI:
"""
${bullets}
"""

Instruksi Penulisan:
1. ${toneInstruction}
2. Buat laporan yang logis, tidak mengada-ada, dan mengembangkan poin kegiatan di atas secara terstruktur.
3. Wajib mengisi 3 bagian berikut dengan panjang karakter masing-masing MINIMAL ${minChar} KARAKTER:
   - "aktivitas": Deskripsi kegiatan teknis/operasional yang dikerjakan hari ini beserta perannya.
   - "pembelajaran": Keterampilan, wawasan teknis, soft skill, atau regulasi yang dipelajari/diperdalam hari ini.
   - "kendala": Kendala teknis/komunikasi yang dihadapi dan solusinya (jika tidak ada kendala, jelaskan bahwa seluruh alur kerja hari ini berjalan lancar dengan koordinasi tim yang baik, tetap minimal ${minChar} karakter).
${customInstructions}

Output WAJIB berupa JSON valid murni tanpa format markdown (jangan gunakan blok \`\`\`json):
{
  "aktivitas": "isi teks aktivitas minimal ${minChar} karakter",
  "pembelajaran": "isi teks pembelajaran minimal ${minChar} karakter",
  "kendala": "isi teks kendala minimal ${minChar} karakter"
}`;
  }

  /**
   * Generate 3-part report from bullets
   */
  static async generateReport(apiKey, bullets, options = {}, onRetry, recentHistory = []) {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('Gemini API Key belum diatur. Silakan atur di Pengaturan Ekstensi.');
    }
    if (!bullets || !bullets.trim()) {
      throw new Error('Poin catatan kegiatan masih kosong.');
    }

    let model = options.selectedModel || 'gemini-3.1-flash-lite';
    if (model === 'custom') {
      model = (options.customModelName && options.customModelName.trim()) ? options.customModelName.trim() : 'gemini-3.1-flash-lite';
    }
    const baseUrl = options.apiBaseUrl || '';
    const historyList = recentHistory && recentHistory.length > 0 ? recentHistory : (options.recentHistory || []);
    const prompt = this.buildPrompt(bullets, options, historyList);

    const isOAI = this.isOpenAiCompatible(baseUrl, apiKey, model);
    const url = this.getEndpointUrl(baseUrl, model, apiKey);
    const headers = this.getHeaders(apiKey, baseUrl, model);

    const reqBody = isOAI
      ? JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.6,
          top_p: 0.95,
          max_tokens: 2048
        })
      : JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            topK: 40,
            topP: 0.95
          }
        });

    const delays = [1500, 3000, 5000];
    let data = null;

    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: reqBody
        });

        if (!response.ok) {
          const errText = await response.text();
          let parsedError = `HTTP ${response.status}`;
          try {
            const errObj = JSON.parse(errText);
            parsedError = errObj.error?.message || errObj.message || errObj.detail || parsedError;
          } catch (e) {
            parsedError = errText.slice(0, 200);
          }

          const isOverloaded = response.status === 429 || response.status === 503;
          if (isOverloaded && attempt < delays.length) {
            if (typeof onRetry === 'function') {
              onRetry(attempt + 1, delays.length);
            }
            await this.sleep(delays[attempt]);
            continue;
          }

          const providerLabel = isOAI ? 'AI Server' : 'Gemini API';
          throw new Error(`${providerLabel} [${response.status}]: ${parsedError}`);
        }

        data = await response.json();
        break;
      } catch (err) {
        if (attempt === delays.length) throw err;
        if (!err.message.includes('429') && !err.message.includes('503')) throw err;
        await this.sleep(delays[attempt]);
      }
    }

    let rawText = '';
    if (data?.choices?.[0]?.message?.content) {
      rawText = data.choices[0].message.content;
    } else if (data?.candidates?.[0]?.content?.parts) {
      rawText = data.candidates[0].content.parts.map((p) => p.text).join('');
    } else if (typeof data === 'string') {
      rawText = data;
    }

    if (!rawText || !rawText.trim()) {
      throw new Error('Tidak ada respons teks yang diterima dari model AI.');
    }

    // Strip <think>...</think> if reasoning model outputted thoughts
    let cleanCandidate = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // Clean any markdown formatting backticks if present
    const jsonBlockMatch = cleanCandidate.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (jsonBlockMatch) {
      cleanCandidate = jsonBlockMatch[1].trim();
    } else {
      cleanCandidate = cleanCandidate
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
    }

    // Extract JSON object from enclosing text if needed
    const firstBrace = cleanCandidate.indexOf('{');
    const lastBrace = cleanCandidate.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanCandidate = cleanCandidate.substring(firstBrace, lastBrace + 1).trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanCandidate);
    } catch (e) {
      // Fallback regex extractor if JSON parse fails
      const aktivitasMatch = rawText.match(/"aktivitas"\s*:\s*"([\s\S]*?)"(?=,\s*"pembelajaran")/i);
      const pembelajaranMatch = rawText.match(/"pembelajaran"\s*:\s*"([\s\S]*?)"(?=,\s*"kendala")/i);
      const kendalaMatch = rawText.match(/"kendala"\s*:\s*"([\s\S]*?)"(?=\s*\}|$)/i);

      if (aktivitasMatch && pembelajaranMatch && kendalaMatch) {
        parsed = {
          aktivitas: aktivitasMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
          pembelajaran: pembelajaranMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
          kendala: kendalaMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
        };
      } else {
        throw new Error('Format output model tidak valid sebagai JSON. Silakan coba generate ulang.');
      }
    }

    if (!parsed.aktivitas || !parsed.pembelajaran || !parsed.kendala) {
      throw new Error('Bagian laporan tidak lengkap (aktivitas, pembelajaran, kendala).');
    }

    return {
      aktivitas: parsed.aktivitas.trim(),
      pembelajaran: parsed.pembelajaran.trim(),
      kendala: parsed.kendala.trim(),
      modelUsed: model
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AVAILABLE_MODELS, TONE_PROMPTS, GeminiClient };
}
