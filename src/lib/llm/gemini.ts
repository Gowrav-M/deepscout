import { GoogleGenAI } from "@google/genai";

// ─── Gemini Vision Provider ───────────────────────────────
// Uses Google Gemini for vision/image analysis (frontier multimodal)
// This preserves NVIDIA rate limits for text-only LLM tasks

export interface GeminiVisionConfig {
  model?: string;
  maxTokens?: number;
}

export interface GeminiVisionResponse {
  content: string;
  model: string;
}

const GEMINI_VISION_MODEL = "gemini-2.5-flash";

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error(
      "Gemini API key is missing. Please set GEMINI_API_KEY in your .env.local file."
    );
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

/**
 * Analyze an image using Gemini Vision (frontier multimodal model)
 * Returns a text description/analysis of the image
 */
export async function analyzeImageWithGemini(
  prompt: string,
  imageBase64: string,
  imageMimeType: string,
  config?: GeminiVisionConfig
): Promise<GeminiVisionResponse> {
  const ai = getGeminiClient();
  const model = config?.model || GEMINI_VISION_MODEL;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageBase64,
                mimeType: imageMimeType,
              },
            },
          ],
        },
      ],
    });

    const text = response.text || "";

    return {
      content: text,
      model,
    };
  } catch (error: any) {
    console.error("[Gemini Vision Error]", error);
    throw new Error(
      `Gemini vision analysis failed: ${error?.message || "Unknown error"}`
    );
  }
}

/**
 * Simple text generation using Gemini (for follow-up or general queries)
 */
export async function callGemini(
  prompt: string,
  systemPrompt?: string,
  config?: GeminiVisionConfig
): Promise<GeminiVisionResponse> {
  const ai = getGeminiClient();
  const model = config?.model || GEMINI_VISION_MODEL;

  try {
    const parts: any[] = [];
    if (systemPrompt) {
      parts.push({ text: `System: ${systemPrompt}\n\nUser: ${prompt}` });
    } else {
      parts.push({ text: prompt });
    }

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts }],
    });

    return {
      content: response.text || "",
      model,
    };
  } catch (error: any) {
    console.error("[Gemini Error]", error);
    throw new Error(
      `Gemini call failed: ${error?.message || "Unknown error"}`
    );
  }
}

/**
 * Streaming text generation using Gemini
 */
export async function streamGemini(
  prompt: string,
  onChunk: (chunk: string) => void,
  systemPrompt?: string,
  config?: GeminiVisionConfig
): Promise<GeminiVisionResponse> {
  const ai = getGeminiClient();
  const model = config?.model || GEMINI_VISION_MODEL;

  try {
    const parts: any[] = [];
    if (systemPrompt) {
      parts.push({ text: `System: ${systemPrompt}\n\nUser: ${prompt}` });
    } else {
      parts.push({ text: prompt });
    }

    const responseStream = await ai.models.generateContentStream({
      model,
      contents: [{ role: "user", parts }],
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      const text = chunk.text || "";
      if (text) {
        fullText += text;
        onChunk(text);
      }
    }

    return {
      content: fullText,
      model,
    };
  } catch (error: any) {
    console.error("[Gemini Streaming Error]", error);
    throw new Error(`Gemini stream failed: ${error?.message || "Unknown error"}`);
  }
}

