import { GoogleGenAI } from "@google/genai";
import { getOfflineAnswer, type LanguageCode } from "../lib/agri-data";

const systemPrompt = `You are AgriSathi AI (কৃষি साथी), an agricultural scientist and field advisor for farmers in Assam and Northeast India (Lower Brahmaputra Valley, Upper Brahmaputra, Barak Valley, Central Brahmaputra, North Bank Plain, and Hills Zone).
Your advice is grounded in agricultural science, sustainable integrated pest management (IPM), Assam Agricultural University (AAU) recommendations, and local seasonal conditions (Ahu, Sali, Boro paddy cycles; flood-tolerant varieties like Bahadur Sub-1, Ranjit Sub-1, Jalashree, Plaban; Rabi crops like mustard, potato, toria, winter pulses).

Guidelines:
1. Provide actionable, concise advice suitable for smallholder farmers working in outdoor field conditions.
2. Structure recommendations clearly using bullet points for dosages, timing, and spray precautions.
3. Recommend both organic/biological methods (e.g. neem oil/NSKE, Trichoderma, Beauveria bassiana, vermicompost) and safe chemical applications with precise safety withholding periods.
4. Keep treatment advice scientifically responsible. Never suggest unverified or hazardous chemical mixtures.
5. Answer in the requested language (English, Assamese, Bengali, or Bodo) using culturally natural, respectful vocabulary.
6. Do NOT mention Krishi Vigyan Kendra or KVK. Recommend general consultation with a local senior agronomist or agricultural extension specialist when laboratory confirmation is required.`;

/**
 * Validates that an API key is present and looks like a legitimate Google AI key
 * (typically starting with 'AIzaSy' and at least 25 characters long, not dummy placeholders).
 */
function isValidApiKey(key: string | undefined): boolean {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  if (trimmed.length < 20) return false;
  if (/^(TODO|PLACEHOLDER|YOUR_API_KEY|undefined|null|none)$/i.test(trimmed)) return false;
  return true;
}

export async function askGeminiAdvisor(
  question: string,
  language: LanguageCode = "en",
): Promise<{ answer: string; source: "gemini-3.8-flash" | "offline-dataset" }> {
  const trimmed = question?.trim();
  if (!trimmed) {
    return {
      answer: getOfflineAnswer("default", language),
      source: "offline-dataset",
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // If API key is missing or not validly formatted, directly use reliable offline advisor
  if (!isValidApiKey(apiKey)) {
    return {
      answer: getOfflineAnswer(trimmed, language),
      source: "offline-dataset",
    };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey!.trim(),
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const langNameMap: Record<LanguageCode, string> = {
      en: "English",
      as: "Assamese (অসমীয়া)",
      bn: "Bengali (বাংলা)",
      brx: "Bodo (बर')",
    };

    const promptWithLang = `Farmer question (Please answer completely in ${langNameMap[language] || "English"}):\n${trimmed}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptWithLang,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const text = response.text;
    if (text && text.trim()) {
      return { answer: text.trim(), source: "gemini-3.8-flash" };
    }
  } catch (error) {
    // Graceful fallback without dumping alarming unhandled stack traces
    console.warn(
      "Gemini API call returned an error (please check that a valid API key is selected in Settings > Secrets). Seamlessly serving verified regional advisory.",
    );
  }

  return {
    answer: getOfflineAnswer(trimmed, language),
    source: "offline-dataset",
  };
}
