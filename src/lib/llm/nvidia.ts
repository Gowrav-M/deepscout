import OpenAI from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage } from "@langchain/core/messages";
import { callGemini, streamGemini } from "./gemini";
import {
  isAgentRouterModel,
  callAgentRouter,
  streamAgentRouter,
} from "./agentrouter";

// ─── Available Models Catalog ──────────────────────────────
export interface ModelInfo {
  id: string;
  label: string;
  description: string;
  speed: "fast" | "balanced" | "deep";
  supportsVision: boolean;
  isReasoning: boolean;
  contextWindow: string;
  provider: "nvidia" | "agentrouter" | "google";
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  // ── AgentRouter Unified Flagship Models ──
  {
    id: "deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    description: "AgentRouter Frontier Reasoning (105ms TTFT, Thinking Stream)",
    speed: "fast",
    supportsVision: false,
    isReasoning: true,
    contextWindow: "128K",
    provider: "agentrouter",
  },
  {
    id: "glm-5.3",
    label: "GLM 5.3 Flagship",
    description: "AgentRouter Flagship Software & Strategic Logic",
    speed: "deep",
    supportsVision: false,
    isReasoning: true,
    contextWindow: "1M",
    provider: "agentrouter",
  },
  {
    id: "gpt-5.6-sol",
    label: "GPT-5.6 Sol",
    description: "AgentRouter Next-Gen Frontier Multimodal Flagship",
    speed: "deep",
    supportsVision: true,
    isReasoning: true,
    contextWindow: "1M",
    provider: "agentrouter",
  },
  {
    id: "claude-opus-5",
    label: "Claude Opus 5",
    description: "AgentRouter Anthropic Frontier Thinking",
    speed: "deep",
    supportsVision: false,
    isReasoning: true,
    contextWindow: "1M",
    provider: "agentrouter",
  },
  {
    id: "claude-opus-4-8",
    label: "Claude Opus 4.8",
    description: "AgentRouter Advanced Deep Analysis",
    speed: "balanced",
    supportsVision: false,
    isReasoning: true,
    contextWindow: "1M",
    provider: "agentrouter",
  },

  // ── NVIDIA NIM Models ──
  {
    id: "meta/llama-3.2-11b-vision-instruct",
    label: "Llama 3.2 Vision 11B",
    description: "Verified Fast NVIDIA NIM with Vision — default",
    speed: "fast",
    supportsVision: true,
    isReasoning: false,
    contextWindow: "128K",
    provider: "nvidia",
  },
  {
    id: "nvidia/nemotron-3-super-120b-a12b",
    label: "Nemotron 3 Super 120B",
    description: "NVIDIA High-throughput agent synthesis",
    speed: "fast",
    supportsVision: false,
    isReasoning: false,
    contextWindow: "128K",
    provider: "nvidia",
  },
  {
    id: "nvidia/nemotron-3.5-lightning-30b-a3b",
    label: "Nemotron 3.5 Lightning",
    description: "NVIDIA Agentic Hybrid MoE for tool calling",
    speed: "fast",
    supportsVision: false,
    isReasoning: false,
    contextWindow: "128K",
    provider: "nvidia",
  },
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b",
    label: "Nemotron 3 Ultra 550B",
    description: "NVIDIA 550B Flagship Ultra Agent Model",
    speed: "deep",
    supportsVision: false,
    isReasoning: true,
    contextWindow: "128K",
    provider: "nvidia",
  },
  {
    id: "deepseek-ai/deepseek-v4-pro-0813",
    label: "DeepSeek V4 Pro",
    description: "Frontier reasoning & deep structured synthesis (NVIDIA)",
    speed: "deep",
    supportsVision: false,
    isReasoning: true,
    contextWindow: "128K",
    provider: "nvidia",
  },
  {
    id: "meta/llama-3.2-90b-vision-instruct",
    label: "Llama 3.2 Vision 90B",
    description: "NVIDIA Flagship 90B Multimodal Model",
    speed: "deep",
    supportsVision: true,
    isReasoning: false,
    contextWindow: "128K",
    provider: "nvidia",
  },

  // ── Google Gemini Frontier Multimodal ──
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    description: "Google frontier multimodal (Vision / 1M context)",
    speed: "fast",
    supportsVision: true,
    isReasoning: false,
    contextWindow: "1M",
    provider: "google",
  },
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    description: "Google frontier deep reasoning & multimodal",
    speed: "deep",
    supportsVision: true,
    isReasoning: true,
    contextWindow: "2M",
    provider: "google",
  },
];

export function getModelInfo(modelId: string): ModelInfo | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === modelId);
}

// ─── Config Types ──────────────────────────────────────────
export interface NvidiaLLMConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  model?: string;
  streaming?: boolean;
  enableThinking?: boolean;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface NvidiaCallResponse {
  content: string;
  reasoning?: string;
  keyUsedIndex: number;
  model: string;
}

class NvidiaKeyManager {
  private keys: string[] = [];
  private currentKeyIndex: number = 0;
  private defaultModel: string = "meta/llama-3.2-11b-vision-instruct";
  private baseURL: string = "https://integrate.api.nvidia.com/v1";

  constructor() {
    this.loadKeys();
  }

  public loadKeys(): string[] {
    const loadedKeys: string[] = [];

    // Check specific indexed keys
    for (let i = 1; i <= 10; i++) {
      const key = process.env[`NVIDIA_API_KEY_${i}`];
      if (key && key.trim().length > 0) {
        loadedKeys.push(key.trim());
      }
    }

    // Check fallback single key
    const singleKey = process.env.NVIDIA_API_KEY;
    if (singleKey && singleKey.trim().length > 0 && !loadedKeys.includes(singleKey.trim())) {
      loadedKeys.push(singleKey.trim());
    }

    this.keys = loadedKeys;
    if (process.env.NVIDIA_MODEL) {
      this.defaultModel = process.env.NVIDIA_MODEL.trim();
    }
    if (process.env.NVIDIA_BASE_URL) {
      this.baseURL = process.env.NVIDIA_BASE_URL.trim();
    }

    return this.keys;
  }

  public getAvailableKeyCount(): number {
    return this.keys.length;
  }

  public getActiveKey(): { key: string; index: number } {
    if (this.keys.length === 0) {
      // Re-try loading in case env variables were loaded dynamically
      this.loadKeys();
      if (this.keys.length === 0) {
        throw new Error(
          "No NVIDIA API keys configured. Please set NVIDIA_API_KEY_1 (or NVIDIA_API_KEY) in .env.local"
        );
      }
    }
    const idx = this.currentKeyIndex % this.keys.length;
    return { key: this.keys[idx], index: idx + 1 };
  }

  public rotateToNextKey(reason?: string): { key: string; index: number } {
    if (this.keys.length <= 1) {
      console.warn(`[NVIDIA Key Manager] Cannot rotate: only ${this.keys.length} key(s) available.`);
      return this.getActiveKey();
    }
    const prevIndex = this.currentKeyIndex;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
    console.warn(
      `[NVIDIA Key Manager] Rotated key from Key #${prevIndex + 1} to Key #${this.currentKeyIndex + 1}. Reason: ${
        reason || "Failover"
      }`
    );
    return this.getActiveKey();
  }

  public getModel(): string {
    return process.env.NVIDIA_MODEL || this.defaultModel;
  }

  public getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Execute an OpenAI-compatible call with automatic key rotation failover
   */
  public async executeWithFailover<T>(
    operation: (client: OpenAI, keyIndex: number, model: string) => Promise<T>
  ): Promise<T> {
    this.loadKeys();
    const totalKeys = Math.max(1, this.keys.length);
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < totalKeys) {
      const { key, index } = this.getActiveKey();
      const model = this.getModel();

      try {
        const client = new OpenAI({
          apiKey: key,
          baseURL: this.baseURL,
          timeout: 65000,
        });

        const result = await operation(client, index, model);
        return result;
      } catch (err: any) {
        attempts++;
        lastError = err;

        const isAuthOrRateLimit =
          err?.status === 401 ||
          err?.status === 403 ||
          err?.status === 429 ||
          err?.message?.includes("401") ||
          err?.message?.includes("429") ||
          err?.message?.includes("quota") ||
          err?.message?.includes("rate limit") ||
          err?.message?.includes("unauthorized") ||
          err?.message?.includes("forbidden");

        console.error(
          `[NVIDIA LLM] Attempt ${attempts}/${totalKeys} failed with Key #${index} (status: ${
            err?.status || "unknown"
          }): ${err?.message}`
        );

        if (attempts < totalKeys) {
          this.rotateToNextKey(
            `Error ${err?.status || err?.message?.slice(0, 50) || "Unknown failure"}`
          );
        }
      }
    }

    throw new Error(
      `All ${totalKeys} NVIDIA API key(s) failed. Last error: ${lastError?.message || "Unknown error"}. Please check your NVIDIA API keys in .env.local.`
    );
  }

  /**
   * Create a LangChain ChatOpenAI instance using the current active key
   */
  public createLangChainChat(config?: NvidiaLLMConfig): ChatOpenAI {
    const { key } = this.getActiveKey();
    const model = config?.model || this.getModel();

    return new ChatOpenAI({
      apiKey: key,
      modelName: model,
      temperature: config?.temperature ?? 0.3,
      maxTokens: config?.maxTokens ?? 4096,
      configuration: {
        baseURL: this.baseURL,
      },
    });
  }
}

// Export singleton instance
export const nvidiaKeyManager = new NvidiaKeyManager();

/**
 * Universal helper to call NVIDIA LLM with failover and chat messages
 */
export async function callNvidiaLLM(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  config?: NvidiaLLMConfig
): Promise<NvidiaCallResponse> {
  let model = config?.model || nvidiaKeyManager.getModel();

  if (isAgentRouterModel(model)) {
    try {
      const res = await callAgentRouter(messages, {
        model,
        temperature: config?.temperature,
        maxTokens: config?.maxTokens,
        topP: config?.topP,
        enableThinking: config?.enableThinking,
      });
      return {
        content: res.content,
        reasoning: res.reasoning,
        keyUsedIndex: 1,
        model: res.model,
      };
    } catch (arError: any) {
      console.warn(`[AgentRouter Fallback] ${arError?.message}. Falling back to default model.`);
      model = nvidiaKeyManager.getModel();
      config = { ...config, model };
    }
  }

  if (model.startsWith("gemini")) {
    const systemMsg = messages.find((m) => m.role === "system")?.content;
    const userMsgs = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n\n");
    const res = await callGemini(userMsgs, systemMsg, { model });
    return {
      content: res.content,
      keyUsedIndex: 1,
      model: res.model,
    };
  }

  return nvidiaKeyManager.executeWithFailover(async (client, keyIndex, defaultModel) => {
    const currentModel = config?.model || defaultModel;
    const modelInfo = getModelInfo(currentModel);
    const isReasoning = modelInfo?.isReasoning || config?.enableThinking || false;

    // Build messages with optional image content block
    const apiMessages: any[] = messages.map((msg) => {
      if (msg.role === "user" && config?.imageBase64) {
        return {
          role: "user",
          content: [
            { type: "text", text: msg.content },
            {
              type: "image_url",
              image_url: {
                url: `data:${config.imageMimeType || "image/png"};base64,${config.imageBase64}`,
              },
            },
          ],
        };
      }
      return msg;
    });

    const requestBody: any = {
      model: currentModel,
      messages: apiMessages,
      temperature: config?.temperature ?? 0.3,
      max_tokens: config?.maxTokens ?? 4096,
      top_p: config?.topP ?? 0.9,
    };

    // Reasoning models need thinking enabled
    if (isReasoning) {
      requestBody.temperature = 0.6;
      requestBody.top_p = 0.95;
    }

    let response;
    try {
      response = await client.chat.completions.create(requestBody);
    } catch (err: any) {
      const isRecoverable =
        err?.status === 404 ||
        err?.status === 410 ||
        err?.status === 502 ||
        err?.status === 503 ||
        err?.status === 504 ||
        err?.name === "APIConnectionTimeoutError" ||
        err?.message?.includes("timeout") ||
        err?.message?.includes("timed out") ||
        err?.message?.includes("504");

      if (isRecoverable && requestBody.model !== defaultModel) {
        console.warn(
          `[NVIDIA Model Fallback] Model ${requestBody.model} failed/timed out (${err?.message}). Falling back immediately to ${defaultModel}`
        );
        requestBody.model = defaultModel;
        response = await client.chat.completions.create(requestBody);
      } else {
        throw err;
      }
    }

    const rawContent = response.choices[0]?.message?.content || "";

    // Parse reasoning tokens from <think>...</think> blocks
    let content = rawContent;
    let reasoning: string | undefined;

    const thinkMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/);
    if (thinkMatch) {
      reasoning = thinkMatch[1].trim();
      content = rawContent.replace(/<think>[\s\S]*?<\/think>/, "").trim();
    }

    return {
      content,
      reasoning,
      keyUsedIndex: keyIndex,
      model,
    };
  });
}

/**
 * Universal helper for streaming response with failover
 */
export async function streamNvidiaLLM(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  onChunk: (chunk: string) => void,
  config?: NvidiaLLMConfig,
  onReasoningChunk?: (chunk: string) => void
): Promise<NvidiaCallResponse> {
  let model = config?.model || nvidiaKeyManager.getModel();

  if (isAgentRouterModel(model)) {
    try {
      const res = await streamAgentRouter(
        messages,
        onChunk,
        {
          model,
          temperature: config?.temperature,
          maxTokens: config?.maxTokens,
          topP: config?.topP,
          enableThinking: config?.enableThinking,
        },
        onReasoningChunk
      );
      return {
        content: res.content,
        reasoning: res.reasoning,
        keyUsedIndex: 1,
        model: res.model,
      };
    } catch (arError: any) {
      console.warn(`[AgentRouter Stream Fallback] ${arError?.message}. Falling back to default model.`);
      model = nvidiaKeyManager.getModel();
      config = { ...config, model };
    }
  }

  if (model.startsWith("gemini")) {
    const systemMsg = messages.find((m) => m.role === "system")?.content;
    const userMsgs = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n\n");
    const res = await streamGemini(userMsgs, onChunk, systemMsg, { model });
    return {
      content: res.content,
      keyUsedIndex: 1,
      model: res.model,
    };
  }

  return nvidiaKeyManager.executeWithFailover(async (client, keyIndex, defaultModel) => {
    const currentModel = config?.model || defaultModel;
    const modelInfo = getModelInfo(currentModel);
    const isReasoning = modelInfo?.isReasoning || config?.enableThinking || false;

    // Build messages with optional image content block
    const apiMessages: any[] = messages.map((msg) => {
      if (msg.role === "user" && config?.imageBase64) {
        return {
          role: "user",
          content: [
            { type: "text", text: msg.content },
            {
              type: "image_url",
              image_url: {
                url: `data:${config.imageMimeType || "image/png"};base64,${config.imageBase64}`,
              },
            },
          ],
        };
      }
      return msg;
    });

    const requestBody: any = {
      model: currentModel,
      messages: apiMessages,
      temperature: config?.temperature ?? 0.3,
      max_tokens: config?.maxTokens ?? 4096,
      top_p: config?.topP ?? 0.9,
      stream: true,
    };

    if (isReasoning) {
      requestBody.temperature = 0.6;
      requestBody.top_p = 0.95;
    }

    let stream;
    try {
      stream = await client.chat.completions.create(requestBody);
    } catch (err: any) {
      const isRecoverable =
        err?.status === 404 ||
        err?.status === 410 ||
        err?.status === 502 ||
        err?.status === 503 ||
        err?.status === 504 ||
        err?.name === "APIConnectionTimeoutError" ||
        err?.message?.includes("timeout") ||
        err?.message?.includes("timed out") ||
        err?.message?.includes("504");

      if (isRecoverable && requestBody.model !== defaultModel) {
        console.warn(
          `[NVIDIA Stream Fallback] Model ${requestBody.model} failed/timed out (${err?.message}). Falling back immediately to ${defaultModel}`
        );
        requestBody.model = defaultModel;
        stream = await client.chat.completions.create(requestBody);
      } else {
        throw err;
      }
    }

    let fullContent = "";
    let fullReasoning = "";
    let insideThink = false;
    let tagBuffer = ""; // Accumulates partial tag fragments across chunks

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (!delta) continue;

      // Feed characters through a state machine that handles tags split across chunks
      let text = tagBuffer + delta;
      tagBuffer = "";

      while (text.length > 0) {
        if (insideThink) {
          // Look for closing </think> tag
          const closeIdx = text.indexOf("</think>");
          if (closeIdx !== -1) {
            // Everything before the tag is reasoning
            const before = text.slice(0, closeIdx);
            if (before) {
              fullReasoning += before;
              onReasoningChunk?.(before);
            }
            insideThink = false;
            text = text.slice(closeIdx + 8); // skip "</think>"
          } else if (text.includes("<") && text.length < 8) {
            // Might be a partial "</think>" tag — buffer it
            tagBuffer = text;
            text = "";
          } else {
            // All reasoning content
            fullReasoning += text;
            onReasoningChunk?.(text);
            text = "";
          }
        } else {
          // Look for opening <think> tag
          const openIdx = text.indexOf("<think>");
          if (openIdx !== -1) {
            // Everything before the tag is regular content
            const before = text.slice(0, openIdx);
            if (before) {
              fullContent += before;
              onChunk(before);
            }
            insideThink = true;
            text = text.slice(openIdx + 7); // skip "<think>"
          } else if (text.includes("<") && !text.includes("<think>") && text.length < 7 && text.endsWith("<")) {
            // Might be a partial "<think>" — buffer the trailing "<"
            const safe = text.slice(0, -1);
            if (safe) {
              fullContent += safe;
              onChunk(safe);
            }
            tagBuffer = "<";
            text = "";
          } else {
            // All regular content
            fullContent += text;
            onChunk(text);
            text = "";
          }
        }
      }
    }

    return {
      content: fullContent,
      reasoning: fullReasoning || undefined,
      keyUsedIndex: keyIndex,
      model,
    };
  });
}
