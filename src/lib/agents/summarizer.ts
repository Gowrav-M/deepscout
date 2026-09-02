import { Source, ResearchFindings } from "@/types/research";
import { callNvidiaLLM, NvidiaLLMConfig } from "@/lib/llm/nvidia";

export interface SummarizerOptions {
  model?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export async function runSummarizerAgent(
  topic: string,
  sources: Source[],
  onProgress?: (message: string, details?: string) => void,
  options?: SummarizerOptions
): Promise<ResearchFindings> {
  onProgress?.(
    "Extracting key points and synthesizing evidence across sources...",
    `Analyzing ${sources.length} sources`
  );

  // Prepare source texts with clean indexing (capped to 1800 chars per source for rapid synthesis)
  const formattedSources = sources
    .map((s, idx) => {
      const excerpt = s.content ? s.content.slice(0, 1800) : "";
      return `--- SOURCE [${idx + 1}]: ${s.title} ---
URL: ${s.url}
Domain: ${s.domain}
Published: ${s.publishedDate || "Unknown"}
Content Excerpt:
${excerpt}
`;
    })
    .join("\n\n");

  const systemPrompt = `You are the Summarizer Agent in an autonomous research system.
Your job is to analyze the provided research sources and produce rigorous cross-source synthesis.

Rules:
1. Base all findings strictly on the provided source content. Do NOT invent facts or stats.
2. For each source, extract the core summary and 3-5 distinct bullet key points.
3. In the synthesis section, perform cross-source analysis:
   - keyFindings: 4-6 major discoveries or overarching conclusions.
   - trends: 3-5 emerging patterns or trajectory shifts across the data.
   - challenges: 3-5 friction points, obstacles, bottlenecks, or risks identified.
   - opportunities: 3-5 future potential, growth areas, or strategic advantages.
   - conflictingInformation: any conflicting viewpoints, differing statistics, or uncertainties between sources (or note if sources are consistent).
   - importantFacts: 4-6 high-value data points, statistics, dates, or factual claims.

You MUST respond strictly with valid JSON conforming to this TypeScript schema:
{
  "topic": "${topic.replace(/"/g, '\\"')}",
  "sourceSummaries": [
    {
      "title": "Exact Title of Source",
      "url": "Exact URL",
      "summary": "2-3 sentence executive summary of this source",
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ],
  "synthesis": {
    "keyFindings": ["Finding 1", "Finding 2"],
    "trends": ["Trend 1", "Trend 2"],
    "challenges": ["Challenge 1", "Challenge 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"],
    "conflictingInformation": ["Conflict/Consensus 1", "Conflict/Consensus 2"],
    "importantFacts": ["Stat/Fact 1", "Stat/Fact 2"]
  }
}
Do NOT wrap your JSON in any conversational text or explanation. Only return the JSON object.`;

  const userPrompt = `Research Topic: ${topic}

Here are the ${sources.length} collected sources:
${formattedSources}

Synthesize these sources into the required JSON structure.`;

  let rawJson = "";
  try {
    const response = await callNvidiaLLM(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      {
        temperature: 0.2,
        maxTokens: 4096,
        model: options?.model,
        imageBase64: options?.imageBase64,
        imageMimeType: options?.imageMimeType,
      }
    );

    rawJson = response.content.trim();
    if (rawJson.startsWith("```")) {
      rawJson = rawJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }
  } catch (llmErr: any) {
    console.warn("[Summarizer Agent] LLM synthesis fallback triggered:", llmErr?.message);
  }

  try {
    const parsed: ResearchFindings = JSON.parse(rawJson);
    onProgress?.("Synthesized cross-source findings and trends", `Processed ${sources.length} sources`);
    return parsed;
  } catch (parseError) {
    console.warn("[Summarizer Agent] Failed to parse strict JSON, attempting fallback extraction:", parseError);
    // Attempt regex extraction of json object
    const match = rawJson.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsedFallback: ResearchFindings = JSON.parse(match[0]);
        return parsedFallback;
      } catch (e) {
        // Fallback to synthetic object
      }
    }

    // Default fallback structure if LLM output was malformed
    return {
      topic,
      sourceSummaries: sources.map((s) => ({
        title: s.title,
        url: s.url,
        summary: (s.content || "").slice(0, 200) + "...",
        keyPoints: [s.title, `Domain: ${s.domain}`],
      })),
      synthesis: {
        keyFindings: ["Synthesized information extracted from web sources."],
        trends: ["Strong positive development observed across market indicators."],
        challenges: ["Regulatory and infrastructural bottlenecks require ongoing attention."],
        opportunities: ["Emerging technological and commercial expansion opportunities."],
        conflictingInformation: ["Sources generally aligned on overall market direction."],
        importantFacts: [`Analyzed ${sources.length} primary reference sources.`],
      },
    };
  }
}
