import {
  AgentStep,
  ResearchResult,
  ResearchMode,
  Source,
  StreamEvent,
} from "@/types/research";
import { runResearcherAgent } from "@/lib/agents/researcher";
import { runSummarizerAgent } from "@/lib/agents/summarizer";
import { runReportWriterAgent } from "@/lib/agents/report-writer";
import { nvidiaKeyManager } from "@/lib/llm/nvidia";
import { analyzeImageWithGemini } from "@/lib/llm/gemini";

export type EventCallback = (event: StreamEvent) => void;

export interface WorkflowOptions {
  mode?: ResearchMode;
  model?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export async function executeResearchWorkflow(
  topic: string,
  emit: EventCallback,
  options: WorkflowOptions = {}
): Promise<ResearchResult> {
  const startTime = Date.now();
  const steps: AgentStep[] = [];
  const { mode = "search", model, imageBase64, imageMimeType } = options;

  const addStep = (
    agent: "researcher" | "summarizer" | "report-writer",
    status: "pending" | "running" | "completed" | "failed",
    title: string,
    message: string,
    details?: string
  ): AgentStep => {
    const step: AgentStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agent,
      status,
      title,
      message,
      timestamp: Date.now(),
      details,
    };
    steps.push(step);
    emit({
      type: "AGENT_STEP",
      payload: { step },
    });
    return step;
  };

  try {
    const activeModel = model || nvidiaKeyManager.getModel();

    // 1. Start Event
    emit({
      type: "RESEARCH_STARTED",
      payload: {
        metadata: {
          activeKeyIndex: 1,
          model: activeModel,
          mode,
        },
      },
    });

    // -------------------------------------------------------------
    // AGENT 1: RESEARCHER
    // -------------------------------------------------------------
    addStep("researcher", "running", "Researcher Agent Active", "Searching the live web for verified articles...");

    const researcherResult = await runResearcherAgent(topic, (msg, details) => {
      addStep("researcher", "running", "Web Search & Extraction", msg, details);
    });

    const sources: Source[] = researcherResult.sources;

    // Emit sources immediately so user interface populates source cards
    emit({
      type: "SOURCES_FOUND",
      payload: {
        sources,
        metadata: { sourceCount: sources.length },
      },
    });

    addStep(
      "researcher",
      "completed",
      "Researcher Agent Completed",
      `Successfully curated ${sources.length} distinct sources with extracted full content.`
    );

    // ── GEMINI VISION ANALYSIS (if image attached) ──
    let enrichedTopic = topic;
    if (imageBase64 && imageMimeType) {
      addStep("summarizer", "running", "🔭 Gemini Vision Analysis", "Analyzing attached image with Google Gemini 2.5 Flash frontier multimodal model...");

      try {
        const visionResult = await analyzeImageWithGemini(
          `Analyze this image thoroughly in the context of the research topic: "${topic}". Describe what you see, key details, data points, trends, and any relevant insights that can enrich the research. Be detailed and factual.`,
          imageBase64,
          imageMimeType
        );

        enrichedTopic = `${topic}\n\n[Visual Context from Attached Image — analyzed by Gemini 2.5 Flash]:\n${visionResult.content}`;

        addStep("summarizer", "running", "✅ Vision Analysis Complete", `Gemini extracted visual insights (${visionResult.content.length} chars) — enriching research context.`);
      } catch (visionError: any) {
        console.error("[Gemini Vision Error]", visionError);
        addStep("summarizer", "running", "⚠️ Vision Analysis Skipped", `Image analysis failed: ${visionError.message}. Continuing with text-only research.`);
      }
    }

    // -------------------------------------------------------------
    // AGENT 2: SUMMARIZER
    // -------------------------------------------------------------
    addStep(
      "summarizer",
      "running",
      "Summarizer Agent Active",
      `Analyzing ${sources.length} articles and identifying cross-source trends, conflicts, and facts...`
    );

    const findings = await runSummarizerAgent(enrichedTopic, sources, (msg, details) => {
      addStep("summarizer", "running", "Cross-Source Synthesis", msg, details);
    }, {
      model: activeModel,
    });

    emit({
      type: "FINDINGS_SYNTHESIZED",
      payload: { findings },
    });

    addStep(
      "summarizer",
      "completed",
      "Summarizer Agent Completed",
      `Synthesized ${findings?.synthesis?.keyFindings?.length ?? 0} key findings, ${findings?.synthesis?.trends?.length ?? 0} trends, and ${findings?.synthesis?.challenges?.length ?? 0} critical challenges.`
    );

    // -------------------------------------------------------------
    // AGENT 3: REPORT WRITER
    // -------------------------------------------------------------
    addStep(
      "report-writer",
      "running",
      "Report Writer Agent Active",
      mode === "think"
        ? "Composing report with deep reasoning chain-of-thought analysis..."
        : "Composing structured editorial research report with verified source citations..."
    );

    let fullReport = "";
    let fullReasoning = "";
    const report = await runReportWriterAgent(enrichedTopic, sources, findings, {
      streaming: true,
      model: activeModel,
      enableThinking: mode === "think",
      onChunk: (chunk) => {
        fullReport += chunk;
        emit({
          type: "REPORT_CHUNK",
          payload: { chunk, report: fullReport },
        });
      },
      onReasoningChunk: (chunk) => {
        fullReasoning += chunk;
        emit({
          type: "REASONING_CHUNK",
          payload: { reasoningChunk: chunk, reasoning: fullReasoning },
        });
      },
      onProgress: (msg, details) => {
        addStep("report-writer", "running", "Document Composition", msg, details);
      },
    });

    emit({
      type: "REPORT_COMPLETED",
      payload: { report },
    });

    addStep(
      "report-writer",
      "completed",
      "Report Writer Agent Completed",
      "Publication-grade research report generated successfully with full source citations."
    );

    const durationMs = Date.now() - startTime;

    emit({
      type: "RESEARCH_COMPLETED",
      payload: {
        sources,
        findings,
        report,
        reasoning: fullReasoning || undefined,
        metadata: {
          sourceCount: sources.length,
          durationMs,
          mode,
        },
      },
    });

    return {
      topic,
      sources,
      findings,
      report,
      reasoning: fullReasoning || undefined,
      steps,
    };
  } catch (error: any) {
    console.error("[Workflow Orchestrator Error]", error);
    const errorMessage = error?.message || "An unexpected error occurred during autonomous research.";

    addStep("report-writer", "failed", "Research Workflow Failed", errorMessage);

    emit({
      type: "RESEARCH_ERROR",
      payload: {
        error: errorMessage,
      },
    });

    return {
      topic,
      sources: [],
      findings: {
        topic,
        sourceSummaries: [],
        synthesis: {
          keyFindings: [],
          trends: [],
          challenges: [],
          opportunities: [],
          conflictingInformation: [],
          importantFacts: [],
        },
      },
      report: "",
      steps,
    };
  }
}

