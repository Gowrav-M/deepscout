import { NextRequest, NextResponse } from "next/server";
import { streamNvidiaLLM, nvidiaKeyManager } from "@/lib/llm/nvidia";
import { Source, ResearchFindings } from "@/types/research";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic,
      question,
      sources = [],
      findings,
      report,
      history = [],
      model,
    } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Follow-up question is required." },
        { status: 400 }
      );
    }

    const activeModel = model || nvidiaKeyManager.getModel();

    // Prepare context from existing investigation
    const sourcesSummary = (sources as Source[])
      .map(
        (s, i) =>
          `[${i + 1}] "${s.title}" (${s.domain}): ${s.content.slice(0, 800)}...`
      )
      .join("\n\n");

    const systemPrompt = `You are an elite Interactive Research Intelligence Analyst.
You are following up on a completed investigation on the topic: "${topic || "General Research"}".

GROUNDING CONTEXT:
1. Executive Research Report:
${report ? report.slice(0, 4000) : "No previous report."}

2. Key Sources Verified (${sources.length} sources):
${sourcesSummary || "No sources provided."}

INSTRUCTIONS:
1. Answer the user's follow-up question authoritatively, accurately, and concisely based on the research context.
2. If the answer is found in the sources or report, cite the source number (e.g. [1], [2]).
3. If the user asks for a comparison, create clean, high-fidelity markdown tables.
4. If the user asks for trends, projections, market share, or quantitative data, you MUST provide an interactive chart by outputting a \`\`\`chart ... \`\`\` block in this exact JSON format:
\`\`\`chart
{
  "type": "bar",
  "title": "Title of Visualization",
  "description": "Short explanation",
  "xKey": "label",
  "yKey": "value",
  "unit": "optional unit string",
  "data": [
    { "label": "Item A", "value": 100 },
    { "label": "Item B", "value": 250 }
  ]
}
\`\`\`
Supported chart types are "bar", "area", "line", and "pie".
5. Keep your tone professional, analytical, and highly structured.`;

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    // Add recent history if provided
    if (Array.isArray(history)) {
      for (const h of history.slice(-4)) {
        if (h.role && h.content) {
          messages.push({ role: h.role, content: h.content });
        }
      }
    }

    messages.push({ role: "user", content: question });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false;

        const sendChunk = (text: string) => {
          if (isClosed) return;
          try {
            const data = `data: ${JSON.stringify({ chunk: text })}\n\n`;
            controller.enqueue(encoder.encode(data));
          } catch (e) {
            isClosed = true;
          }
        };

        try {
          await streamNvidiaLLM(
            messages,
            (chunk) => {
              sendChunk(chunk);
            },
            {
              model: activeModel,
              temperature: 0.3,
              maxTokens: 3000,
            }
          );

          if (!isClosed) {
            isClosed = true;
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
              controller.close();
            } catch (e) {}
          }
        } catch (err: any) {
          if (!isClosed) {
            isClosed = true;
            try {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ error: err?.message || "Failed to process follow-up." })}\n\n`
                )
              );
              controller.close();
            } catch (e) {}
          }
        }
      },
      cancel() {
        isClosed = true;
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("[Follow-up Handler Error]", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
