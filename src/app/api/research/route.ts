import { NextRequest, NextResponse } from "next/server";
import { executeResearchWorkflow } from "@/lib/workflow/orchestrator";
import { StreamEvent, ResearchMode } from "@/types/research";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Allow sufficient time for multi-step autonomous research

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = body?.topic;
    const mode: ResearchMode = body?.mode || "search";
    const model: string | undefined = body?.model;
    const imageBase64: string | undefined = body?.imageBase64;
    const imageMimeType: string | undefined = body?.imageMimeType;

    // Validate image payload size (10MB base64 limit)
    if (imageBase64 && imageBase64.length > 10_000_000) {
      return NextResponse.json(
        { error: "Image payload too large. Maximum size is ~7.5MB." },
        { status: 413 }
      );
    }

    // Validate image mime type
    if (imageMimeType && !imageMimeType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid image type. Only image files are supported." },
        { status: 400 }
      );
    }

    // Strict input validation
    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Research topic is required." },
        { status: 400 }
      );
    }

    const trimmedTopic = topic.trim();
    if (trimmedTopic.length < 3) {
      return NextResponse.json(
        { error: "Research topic must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (trimmedTopic.length > 300) {
      return NextResponse.json(
        { error: "Research topic must not exceed 300 characters." },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();

    let isClosed = false;

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: StreamEvent) => {
          if (isClosed) return;
          try {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          } catch (e) {
            isClosed = true;
          }
        };

        try {
          await executeResearchWorkflow(trimmedTopic, sendEvent, {
            mode,
            model,
            imageBase64,
            imageMimeType,
          });
        } catch (err: any) {
          if (!isClosed) {
            sendEvent({
              type: "RESEARCH_ERROR",
              payload: {
                error: err?.message || "An error occurred during autonomous research.",
              },
            });
          }
        } finally {
          if (!isClosed) {
            isClosed = true;
            try {
              controller.close();
            } catch (closeErr) {
              // Ignore already closed controller
            }
          }
        }
      },
      cancel() {
        isClosed = true;
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Encoding": "none",
      },
    });
  } catch (error: any) {
    console.error("[API Research Route Error]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process research request." },
      { status: 500 }
    );
  }
}
