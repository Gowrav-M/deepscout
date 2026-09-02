import { Source, ResearchFindings } from "@/types/research";
import { callNvidiaLLM, streamNvidiaLLM } from "@/lib/llm/nvidia";

export interface ReportWriterOptions {
  streaming?: boolean;
  model?: string;
  enableThinking?: boolean;
  imageBase64?: string;
  imageMimeType?: string;
  onChunk?: (chunk: string) => void;
  onReasoningChunk?: (chunk: string) => void;
  onProgress?: (message: string, details?: string) => void;
}

export async function runReportWriterAgent(
  topic: string,
  sources: Source[],
  findings: ResearchFindings,
  options: ReportWriterOptions = {}
): Promise<string> {
  options.onProgress?.("Composing final research report with verifiable citations...", "Generating structured editorial report");

  // Format source index
  const sourceIndexText = sources
    .map((s, idx) => `[${idx + 1}] "${s.title}" — ${s.url} (${s.domain})`)
    .join("\n");

  const findingsJson = JSON.stringify(findings, null, 2);

  const systemPrompt = `You are the Report Writer Agent in an autonomous research intelligence system.
Your mission is to synthesize the provided research findings and verified sources into a publication-grade research report.

Rules & Tone:
1. Editorial & Authoritative: Write in a polished, objective, analytical style suitable for executive briefings, investors, and policymakers.
2. Grounded Evidence & Strict Citations: Every key factual statement, metric, trend, or claim MUST have explicit inline citation markers referencing the numbered sources (e.g., "[1]", "[2]", or "[1][3]").
3. NEVER invent numbers, dates, or citations. Use ONLY the facts present in the provided sources and findings.
4. **MANDATORY Visual Data Charts**: You MUST include at least 2 interactive chart blocks in every report. Extract or derive quantitative data from the findings and sources — market sizes, adoption rates, growth projections, comparisons, rankings, timelines, etc. Use this EXACT syntax (the frontend renders these as interactive charts):
\`\`\`chart
{
  "type": "bar",
  "title": "Clear Descriptive Title",
  "description": "Contextual metric note",
  "xKey": "category",
  "yKey": "value",
  "unit": "e.g. % or $B or units",
  "data": [
    { "category": "Segment 1", "value": 45 },
    { "category": "Segment 2", "value": 78 }
  ]
}
\`\`\`
Supported chart types: "bar", "area", "line", "pie". Place charts inline within the relevant report sections (e.g., market dynamics, trends, projections). Each chart MUST have at least 3 data points. This is a CRITICAL requirement — reports without charts are incomplete.
5. Comparative Matrices: Use clean markdown tables (| Header 1 | Header 2 |) to compare players, pros/cons, regulations, or technology tiers.
6. Adapt the section headers naturally to the specific research topic while covering the required architectural sections.
7. Include a comprehensive "Sources & References" section at the end matching the numbered list format with active markdown links.

Required Report Outline (in Clean Markdown):
# [Descriptive, Professional Report Title]

> **Executive Summary**: A crisp, 2-3 paragraph synthesis of the most critical takeaways, current dynamics, and future trajectory.

---

## 1. Introduction & Context
- Background of the domain, scope of investigation, and why this topic matters today.

## 2. Current Landscape & Market Dynamics
- State of the industry/topic, regulatory or technological baseline, and key players/initiatives. [Citations]

## 3. Key Research Findings
- Detailed analysis of the primary discoveries and empirical data points from the collected sources. [Citations]

## 4. Major Trends & Trajectory
- Emerging technological, behavioral, economic, or policy trends shaping the landscape. [Citations]

## 5. Critical Challenges & Friction Points
- Bottlenecks, risks, supply-chain/infrastructure limitations, policy hurdles, or ethical concerns. [Citations]

## 6. Strategic Opportunities
- High-growth avenues, innovation potential, and untapped advantages. [Citations]

## 7. Future Outlook & Projections
- Medium-to-long term implications, expected milestones, and scenarios. [Citations]

## 8. Strategic Conclusion
- Final assessment and strategic imperatives for stakeholders.

---

## Sources & References
${sources.map((s, i) => `${i + 1}. [${s.title}](${s.url}) — *${s.domain}*`).join("\n")}
`;

  const userPrompt = `Research Topic: ${topic}

Verified Sources:
${sourceIndexText}

Synthesized Findings:
${findingsJson}

Please generate the complete, comprehensive research report now.`;

  if (options.streaming && options.onChunk) {
    const result = await streamNvidiaLLM(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      options.onChunk,
      {
        temperature: 0.35,
        maxTokens: 5500,
        model: options.model,
        enableThinking: options.enableThinking,
        imageBase64: options.imageBase64,
        imageMimeType: options.imageMimeType,
      },
      options.onReasoningChunk
    );
    options.onProgress?.("Research report generation completed", `Model: ${result.model} | Key #${result.keyUsedIndex}`);
    return result.content;
  } else {
    const result = await callNvidiaLLM(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      {
        temperature: 0.35,
        maxTokens: 5500,
        model: options.model,
        enableThinking: options.enableThinking,
        imageBase64: options.imageBase64,
        imageMimeType: options.imageMimeType,
      }
    );
    options.onProgress?.("Research report generation completed", `Model: ${result.model} | Key #${result.keyUsedIndex}`);
    return result.content;
  }
}
