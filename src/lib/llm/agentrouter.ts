/**
 * AgentRouter Unified Flagship LLM Provider
 * Connects to https://agentrouter.org/v1 with specialized Claude-compatible wire image headers
 * to support DeepSeek V4 Flash, GLM 5.3, GPT-5.6 Sol, Claude Opus, and other frontier models.
 */

export interface AgentRouterConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  enableThinking?: boolean;
}

export interface AgentRouterCallResponse {
  content: string;
  reasoning?: string;
  model: string;
}

const AGENTROUTER_DEFAULT_MODEL = "deepseek-v4-flash";

export const AGENTROUTER_MODELS = [
  "deepseek-v4-flash",
  "glm-5.3",
  "gpt-5.6-sol",
  "claude-opus-5",
  "claude-opus-4-8",
];

export function isAgentRouterModel(modelId: string): boolean {
  return AGENTROUTER_MODELS.includes(modelId);
}

function getAgentRouterApiKey(): string {
  const envKey = process.env.AGENTROUTER_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }
  throw new Error("AGENTROUTER_API_KEY is not configured. Please set it in .env.local");
}

function getAgentRouterBaseUrl(): string {
  const envUrl = process.env.AGENTROUTER_BASE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }
  return "https://agentrouter.org/v1";
}

/**
 * Builds the required wire image headers to satisfy AgentRouter's WAF
 */
function getAgentRouterHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "anthropic-beta": "claude-code-20250219,interleaved-thinking-2025-05-14",
    "User-Agent": "claude-cli/2.1.158 (external, sdk-cli)",
    "X-Stainless-Package-Version": "0.94.0",
    "X-Stainless-Runtime-Version": "v24.3.0",
    "Content-Type": "application/json",
  };
}

/**
 * Call AgentRouter chat completion non-streaming
 */
export async function callAgentRouter(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  config?: AgentRouterConfig
): Promise<AgentRouterCallResponse> {
  const apiKey = getAgentRouterApiKey();
  const baseUrl = getAgentRouterBaseUrl();
  let model = config?.model || AGENTROUTER_DEFAULT_MODEL;

  const endpoint = `${baseUrl}/chat/completions`;
  const headers = getAgentRouterHeaders(apiKey);

  const requestBody: any = {
    model,
    messages,
    temperature: config?.temperature ?? 0.3,
    max_tokens: config?.maxTokens ?? 2048,
    top_p: config?.topP ?? 0.95,
  };

  try {
    let res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    // If quota exhausted (402) on premium tier, fallback to ultra-fast deepseek-v4-flash
    if (res.status === 402 && model !== AGENTROUTER_DEFAULT_MODEL) {
      console.warn(
        `[AgentRouter Quota] Model ${model} returned 402. Falling back to ${AGENTROUTER_DEFAULT_MODEL}`
      );
      model = AGENTROUTER_DEFAULT_MODEL;
      requestBody.model = model;
      res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AgentRouter API Error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const rawContent = choice?.message?.content || "";
    const reasoning = choice?.message?.reasoning_content || "";

    return {
      content: rawContent,
      reasoning: reasoning || undefined,
      model,
    };
  } catch (error: any) {
    console.error("[AgentRouter Error]", error.message);
    throw error;
  }
}

/**
 * Call AgentRouter chat completion with full Server-Sent Events streaming,
 * including real-time reasoning_content (chain-of-thought) forwarding.
 */
export async function streamAgentRouter(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  onChunk: (chunk: string) => void,
  config?: AgentRouterConfig,
  onReasoningChunk?: (chunk: string) => void
): Promise<AgentRouterCallResponse> {
  const apiKey = getAgentRouterApiKey();
  const baseUrl = getAgentRouterBaseUrl();
  let model = config?.model || AGENTROUTER_DEFAULT_MODEL;

  const endpoint = `${baseUrl}/chat/completions`;
  const headers = getAgentRouterHeaders(apiKey);

  const requestBody: any = {
    model,
    messages,
    temperature: config?.temperature ?? 0.3,
    max_tokens: config?.maxTokens ?? 2048,
    top_p: config?.topP ?? 0.95,
    stream: true,
  };

  let res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  // If quota exhausted (402), fallback to deepseek-v4-flash
  if (res.status === 402 && model !== AGENTROUTER_DEFAULT_MODEL) {
    console.warn(
      `[AgentRouter Quota] Model ${model} returned 402. Falling back to ${AGENTROUTER_DEFAULT_MODEL}`
    );
    model = AGENTROUTER_DEFAULT_MODEL;
    requestBody.model = model;
    res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AgentRouter Streaming Error ${res.status}: ${errText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("AgentRouter: Response body stream is not available.");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";
  let fullReasoning = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const dataStr = trimmed.slice(6);
      if (dataStr === "[DONE]") continue;

      try {
        const json = JSON.parse(dataStr);
        const delta = json.choices?.[0]?.delta;

        // Reasoning/thinking tokens stream
        if (delta?.reasoning_content) {
          fullReasoning += delta.reasoning_content;
          onReasoningChunk?.(delta.reasoning_content);
        }

        // Output content tokens stream
        if (delta?.content) {
          fullContent += delta.content;
          onChunk(delta.content);
        }
      } catch (e) {
        // Skip malformed chunk lines safely
      }
    }
  }

  return {
    content: fullContent,
    reasoning: fullReasoning || undefined,
    model,
  };
}
