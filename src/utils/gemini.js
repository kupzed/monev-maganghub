/**
 * MagangHub AI Assistant - Gemini API Client
 * Robust AI generation client with model selection, fallback handling, and structured JSON parsing.
 */

const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Sangat Cepat & Cerdas - Rekomendasi)' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Lebih Detail & Mendalam)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Stabil & Ringan)' }
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
   * Test API Key validity
   */
  static async testApiKey(apiKey, model = 'gemini-2.5-flash') {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('API Key tidak boleh kosong.');
    }

    const cleanKey = apiKey.trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Ping test. Balas dengan: OK' }] }],
        generationConfig: { maxOutputTokens: 20 }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let msg = `Error ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        msg = errJson.error?.message || msg;
      } catch (e) {
        msg = errText.slice(0, 200);
      }
      throw new Error(msg);
    }

    return true;
  }

  /**
   * Build generation prompt based on settings
   */
  static buildPrompt(bullets, options = {}) {
    const tone = options.reportTone || 'formal';
    const toneInstruction = TONE_PROMPTS[tone] || TONE_PROMPTS.formal;
    const customInstructions = options.customInstructions ? `\nPetunjuk Khusus Tambahan: ${options.customInstructions}` : '';
    const minChar = options.minCharLimit || 100;

    return `Kamu adalah asisten profesional yang bertugas membantu peserta MagangHub Kemnaker menyusun laporan harian magang berkualitas tinggi.

Catatan kegiatan mentah dari peserta:
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
  static async generateReport(apiKey, bullets, options = {}, onRetry) {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('Gemini API Key belum diatur. Silakan atur di Pengaturan Ekstensi.');
    }
    if (!bullets || !bullets.trim()) {
      throw new Error('Poin catatan kegiatan masih kosong.');
    }

    const model = options.selectedModel || 'gemini-2.5-flash';
    const prompt = this.buildPrompt(bullets, options);
    const cleanKey = apiKey.trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;

    const delays = [1500, 3000, 5000];
    let data = null;

    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.6,
              topK: 40,
              topP: 0.95
            }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          let parsedError = `HTTP ${response.status}`;
          try {
            const errObj = JSON.parse(errText);
            parsedError = errObj.error?.message || parsedError;
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

          throw new Error(`Gemini API [${response.status}]: ${parsedError}`);
        }

        data = await response.json();
        break;
      } catch (err) {
        if (attempt === delays.length) throw err;
        if (!err.message.includes('429') && !err.message.includes('503')) throw err;
        await this.sleep(delays[attempt]);
      }
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    if (!rawText) {
      throw new Error('Tidak ada respons teks yang diterima dari model Gemini.');
    }

    // Clean any markdown formatting backticks if present
    const cleanedText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
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
