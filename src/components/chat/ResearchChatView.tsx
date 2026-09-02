"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { ToolCallsSection, ToolCallEntry } from "@/components/ui/tool-calls-section";
import { AgentPipeline } from "@/components/AgentPipeline";
import { FindingsAccordion } from "@/components/FindingsAccordion";
import {
  Source,
  ResearchFindings,
  ResearchMode,
  AgentStep,
  AgentType,
  StreamEvent,
} from "@/types/research";
import { AVAILABLE_MODELS, ModelInfo } from "@/lib/llm/nvidia";
import {
  ArrowLeft,
  Bot,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Plus,
  Compass,
  FileText,
  PanelLeft,
  Zap,
  Globe2,
  BrainCircuit,
  ChevronDown,
  FileDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { ChartRenderer } from "./ChartRenderer";
import { exportResearchToPDF } from "@/lib/export/pdf-exporter";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  status?: "researching" | "completed" | "failed";
  currentAgent?: AgentType | "completed" | "idle";
  steps?: AgentStep[];
  sources?: Source[];
  findings?: ResearchFindings;
  toolCalls?: ToolCallEntry[];
  reasoning?: string;
  error?: string;
}

interface ResearchChatViewProps {
  onReturnToLanding: () => void;
  initialTopic?: string;
}

// Reasoning Trace Panel for Think Mode
const ReasoningTracePanel: React.FC<{ reasoning: string; isStreaming: boolean }> = ({ reasoning, isStreaming }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-purple-950/30 border border-purple-500/30 rounded-2xl overflow-hidden backdrop-blur-xl"
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="flex items-center space-x-2 text-xs font-semibold text-purple-300">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          <span>Agent Reasoning Trace</span>
          {isStreaming && (
            <span className="flex items-center space-x-1.5 text-purple-400">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[10px] font-mono">streaming</span>
            </span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-purple-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 max-h-[300px] overflow-y-auto">
              <div className="text-xs text-purple-200/80 font-mono leading-relaxed whitespace-pre-wrap">
                {reasoning}
                {isStreaming && <span className="inline-block w-1.5 h-3.5 bg-purple-400 ml-0.5 animate-pulse" />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FEATURED_SUGGESTIONS = [
  {
    title: "Future of EV in India",
    subtitle: "Market adoption, battery manufacturing & charging roadmap",
  },
  {
    title: "Impact of AI on Healthcare",
    subtitle: "Clinical diagnostics, FDA clearances & drug discovery",
  },
  {
    title: "Future of Renewable Energy",
    subtitle: "Solar microgrids, battery storage & grid stability",
  },
  {
    title: "India's Space Economy",
    subtitle: "Commercial launch vehicles, IN-SPACe & satellite startups",
  },
];

export const ResearchChatView: React.FC<ResearchChatViewProps> = ({
  onReturnToLanding,
  initialTopic,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") return window.innerWidth >= 768;
    return false;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isResearching, setIsResearching] = useState<boolean>(false);
  const [activeTopic, setActiveTopic] = useState<string | undefined>(initialTopic);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Multi-mode & multi-model state
  const [activeMode, setActiveMode] = useState<ResearchMode>("search");
  const [selectedModel, setSelectedModel] = useState<string>("meta/llama-3.2-11b-vision-instruct");
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [attachedImageMime, setAttachedImageMime] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const scrollToBottom = () => {
    if (isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 150;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isResearching]);

  // Restore session from localStorage on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem("research_assistant_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.messages && parsed.messages.length > 0) {
          setMessages(parsed.messages);
          if (parsed.activeTopic) setActiveTopic(parsed.activeTopic);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to restore session from localStorage", e);
    }

    if (initialTopic && messages.length === 0) {
      handleSend(initialTopic);
    }
  }, [initialTopic]);

  // Auto-save session to localStorage
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(
          "research_assistant_session",
          JSON.stringify({ messages, activeTopic })
        );
      }
    } catch (e) {}
  }, [messages, activeTopic]);

  const handleNewTopic = () => {
    setMessages([]);
    setActiveTopic(undefined);
    try {
      localStorage.removeItem("research_assistant_session");
    } catch (e) {}
  };

  const handleSend = async (userInput: string) => {
    const cleanQuery = userInput.trim();
    if (!cleanQuery) return;

    // Check if this is a follow-up to an existing completed investigation
    const existingAssistant = messages.find(
      (m) =>
        m.role === "assistant" &&
        m.status === "completed" &&
        m.sources &&
        m.sources.length > 0
    );

    const isFollowUp =
      !!existingAssistant &&
      !cleanQuery.toLowerCase().startsWith("research:") &&
      !cleanQuery.toLowerCase().startsWith("new:");

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: cleanQuery,
      timestamp: Date.now(),
    };

    if (isFollowUp) {
      const followUpAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        status: "researching",
        currentAgent: "report-writer",
        sources: existingAssistant.sources,
        findings: existingAssistant.findings,
        steps: [
          {
            id: `step-${Date.now()}`,
            agent: "report-writer",
            status: "running",
            title: "Interactive Intelligence Follow-Up",
            message: `Analyzing query over ${existingAssistant.sources?.length || 0} gathered sources...`,
            timestamp: Date.now(),
          },
        ],
        toolCalls: [],
        reasoning: "",
      };

      setMessages((prev) => [...prev, newUserMessage, followUpAssistantMessage]);
      setIsResearching(true);

      try {
        const response = await fetch("/api/research/follow-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: activeTopic || cleanQuery,
            question: cleanQuery,
            sources: existingAssistant.sources,
            findings: existingAssistant.findings,
            report: existingAssistant.content,
            model: selectedModel,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Error status ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        if (reader) {
          let rafScheduled = false;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;

              try {
                const payload = JSON.parse(trimmed.replace(/^data:\s*/, ""));
                if (payload.chunk) {
                  accumulated += payload.chunk;
                }
              } catch (e) {}
            }

            // Debounce: flush accumulated content at ~60fps
            if (!rafScheduled) {
              rafScheduled = true;
              requestAnimationFrame(() => {
                rafScheduled = false;
                const snapshot = accumulated;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: snapshot, status: "researching" }
                      : msg
                  )
                );
              });
            }
          }
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: accumulated,
                  status: "completed",
                  currentAgent: "completed",
                  steps: [
                    {
                      id: `step-${Date.now()}`,
                      agent: "report-writer",
                      status: "completed",
                      title: "Follow-Up Analysis Completed",
                      message: "Response grounded on previous research context.",
                      timestamp: Date.now(),
                    },
                  ],
                }
              : msg
          )
        );
        setIsResearching(false);
        return;
      } catch (err: any) {
        console.error("Follow-up stream error:", err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: `Error generating follow-up response: ${err.message}`,
                  status: "failed",
                }
              : msg
          )
        );
        setIsResearching(false);
        return;
      }
    }

    // Standard 3-Agent Pipeline for Fresh Research
    setActiveTopic(cleanQuery);

    const initialToolCalls: ToolCallEntry[] = [
      {
        tool_name: "tavily_web_search",
        tool_category: "search",
        integration_name: "Tavily Search API",
        message: `Querying live web index for "${cleanQuery}"`,
        inputs: {
          query: cleanQuery,
          search_depth: "advanced",
          max_results: 10,
        },
        output: "Searching and ranking credible publisher domains...",
      },
    ];

    const newAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      status: "researching",
      currentAgent: "researcher",
      steps: [],
      sources: [],
      findings: undefined,
      toolCalls: initialToolCalls,
      reasoning: "",
    };

    setMessages((prev) => [...prev, newUserMessage, newAssistantMessage]);
    setIsResearching(true);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: cleanQuery,
          mode: activeMode,
          model: selectedModel,
          imageBase64: attachedImageBase64 || undefined,
          imageMimeType: attachedImageMime || undefined,
        }),
      });

      // Clear attached image after sending
      setAttachedImageBase64(null);
      setAttachedImageMime(null);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Error status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Streaming not supported");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Accumulate state outside React for debounced flushing
      let pendingReport = "";
      let pendingReasoning = "";
      let pendingSteps: AgentStep[] = [];
      let pendingSources: Source[] = [];
      let pendingFindings: ResearchFindings | undefined;
      let pendingAgent: AgentType | "completed" | "idle" | undefined = "researcher";
      let pendingStatus: "researching" | "completed" | "failed" | undefined = "researching";
      let pendingError: string | undefined;
      let rafScheduled = false;
      let needsFlush = false;

      const flushToState = () => {
        rafScheduled = false;
        if (!needsFlush) return;
        needsFlush = false;

        const snapshotReport = pendingReport;
        const snapshotReasoning = pendingReasoning;
        const snapshotSteps = [...pendingSteps];
        const snapshotSources = [...pendingSources];
        const snapshotFindings = pendingFindings;
        const snapshotAgent = pendingAgent;
        const snapshotStatus = pendingStatus;
        const snapshotError = pendingError;

        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id !== assistantMessageId) return msg;

            // Build dynamic tool calls
            const updatedToolCalls: ToolCallEntry[] = [
              {
                tool_name: "tavily_web_search",
                tool_category: "search",
                integration_name: "Tavily Search API",
                message: `Searched web for "${cleanQuery}"`,
                inputs: { query: cleanQuery, search_depth: "advanced", max_results: 10 },
                output: snapshotSources.length > 0
                  ? `Discovered ${snapshotSources.length} verified web sources.`
                  : "Querying live web index...",
              },
            ];

            if (snapshotSources.length > 0) {
              updatedToolCalls.push({
                tool_name: "article_content_extractor",
                tool_category: "executor",
                integration_name: "DOM Extractor",
                message: `Extracted full text from ${snapshotSources.length} articles`,
                inputs: { urls: snapshotSources.map((s) => s.url) },
                output: `Extracted ${snapshotSources.reduce((acc, s) => acc + (s.content?.length || 500), 0)} characters of dense domain text.`,
              });
            }

            if (snapshotFindings || snapshotAgent === "summarizer" || snapshotAgent === "report-writer" || snapshotStatus === "completed") {
              updatedToolCalls.push({
                tool_name: "cross_source_synthesizer",
                tool_category: "summarizer",
                integration_name: "Evidence Engine",
                message: "Synthesized cross-source findings & resolved conflicting claims",
                inputs: { sources_count: snapshotSources.length || 5, detect_contradictions: true },
                output: snapshotFindings
                  ? `Extracted ${snapshotFindings.synthesis?.keyFindings?.length ?? 0} key points, ${snapshotFindings.synthesis?.trends?.length ?? 0} trends, and ${snapshotFindings.synthesis?.challenges?.length ?? 0} strategic bottlenecks.`
                  : "Cross-referencing evidence matrix...",
              });
            }

            if (snapshotReport || snapshotAgent === "report-writer" || snapshotStatus === "completed") {
              updatedToolCalls.push({
                tool_name: "nvidia_nim_inference",
                tool_category: "nvidia",
                integration_name: "NVIDIA NIM",
                message: "Synthesized publication markdown report with inline citations [1], [2]",
                inputs: {
                  model: "meta/llama-3.2-11b-vision-instruct",
                  temperature: 0.3,
                  citation_mode: "strict_numeric_bracket",
                },
                output: snapshotReport
                  ? `Generated executive report (${snapshotReport.split(" ").length} words) with numbered reference citations.`
                  : "Streaming real-time markdown tokens...",
              });
            }

            return {
              ...msg,
              content: snapshotReport,
              currentAgent: snapshotAgent,
              status: snapshotStatus,
              steps: snapshotSteps,
              sources: snapshotSources,
              findings: snapshotFindings,
              toolCalls: updatedToolCalls,
              reasoning: snapshotReasoning || msg.reasoning,
              error: snapshotError,
            };
          });
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          try {
            const rawJson = trimmed.replace(/^data:\s*/, "");
            const event: StreamEvent = JSON.parse(rawJson);

            switch (event.type) {
              case "RESEARCH_STARTED":
                pendingAgent = "researcher";
                pendingStatus = "researching";
                break;
              case "AGENT_STEP":
                if (event.payload.step) {
                  pendingSteps.push(event.payload.step);
                  pendingAgent = event.payload.step.agent;
                }
                break;
              case "SOURCES_FOUND":
                if (event.payload.sources) {
                  pendingSources = event.payload.sources;
                  pendingAgent = "summarizer";
                }
                break;
              case "FINDINGS_SYNTHESIZED":
                if (event.payload.findings) {
                  pendingFindings = event.payload.findings;
                  pendingAgent = "report-writer";
                }
                break;
              case "REPORT_CHUNK":
              case "REPORT_COMPLETED":
                if (event.payload.report) {
                  pendingReport = event.payload.report;
                }
                break;
              case "REASONING_CHUNK":
                if (event.payload.reasoning) {
                  pendingReasoning = event.payload.reasoning;
                }
                break;
              case "RESEARCH_COMPLETED":
                pendingStatus = "completed";
                pendingAgent = "completed";
                break;
              case "RESEARCH_ERROR":
                pendingStatus = "failed";
                pendingError = event.payload.error || "Autonomous research failed";
                break;
            }

            needsFlush = true;
          } catch (e) {
            console.error("Failed to parse SSE JSON:", trimmed, e);
          }
        }

        // Debounce: schedule state flush at ~60fps
        if (needsFlush && !rafScheduled) {
          rafScheduled = true;
          requestAnimationFrame(flushToState);
        }
      }

      // Final flush to ensure last state is captured
      flushToState();
    } catch (err: any) {
      console.error("Research failed:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                status: "failed",
                error: err.message || "Failed to complete research investigation",
              }
            : msg
        )
      );
    } finally {
      setIsResearching(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadMarkdown = (topic: string, text: string) => {
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `research-report-${slug}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = (message: ChatMessage) => {
    exportResearchToPDF({
      topic: activeTopic || "DeepScout Research Report",
      reportContent: message.content,
      sources: message.sources,
      findings: message.findings,
      timestamp: message.timestamp,
      modelName: selectedModel,
    });
  };

  return (
    <div className="flex h-screen w-full bg-[#000000] text-white overflow-hidden selection:bg-white selection:text-black">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewResearch={handleNewTopic}
        onSelectTopic={(topic) => handleSend(topic)}
        activeTopic={activeTopic}
      />

      {/* Main Investigation Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#000000]">
        {/* Clean Top Bar */}
        <header className="sticky top-0 z-30 w-full bg-black/85 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                aria-label="Open sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onReturnToLanding}
              className="flex items-center space-x-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900/90 border border-white/10 hover:border-white/20 px-2.5 sm:px-3 py-1.5 rounded-full transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Landing Page</span>
              <span className="xs:hidden">Home</span>
            </button>
          </div>

          {/* Center — Active Model Status */}
          {(() => {
            const activeModel = AVAILABLE_MODELS.find(m => m.id === selectedModel);
            const isAgentRouter = activeModel?.provider === "agentrouter";
            const isGoogle = activeModel?.provider === "google";
            return (
              <div className={cn(
                "hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-mono transition-all",
                isAgentRouter
                  ? "bg-purple-950/40 border-purple-500/30 text-purple-300"
                  : isGoogle
                  ? "bg-sky-950/40 border-sky-500/30 text-sky-300"
                  : "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              )}>
                <span className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isAgentRouter ? "bg-purple-400" : isGoogle ? "bg-sky-400" : "bg-emerald-400"
                )} />
                <span className="font-semibold text-zinc-100">
                  {isAgentRouter ? "⚡ " : isGoogle ? "✦ " : "🟢 "}
                  {activeModel?.label || "Llama 3.2 Vision"}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-cyan-400">Tavily Grounded</span>
                {activeMode === "think" && (
                  <>
                    <span className="text-zinc-500">•</span>
                    <span className="text-purple-400">Think</span>
                  </>
                )}
              </div>
            );
          })()}

          {/* Right Action */}
          <button
            type="button"
            onClick={handleNewTopic}
            className="text-xs font-medium text-zinc-300 hover:text-white flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 px-2.5 sm:px-3.5 py-1.5 rounded-full transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xs:inline">New Topic</span>
            <span className="xs:hidden">New</span>
          </button>
        </header>

        {/* Message Stream */}
        <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 w-full overflow-y-auto px-3 sm:px-6">
          <div className="max-w-[760px] mx-auto py-5 sm:py-8 space-y-5 sm:space-y-8 min-h-full flex flex-col justify-start">
            {/* Empty State / Centered Welcome Screen */}
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-10 space-y-6">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-zinc-300">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>AUTONOMOUS 3-AGENT RESEARCH ENGINE</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight">
                    What research topic should we investigate today?
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto">
                    Enter any domain, technological trend, or market inquiry. The autonomous pipeline will search the live web, cross-synthesize evidence, and generate an executive report.
                  </p>
                </div>

                {/* 4 Balanced Featured Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[680px] w-full text-left pt-2">
                  {FEATURED_SUGGESTIONS.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSend(item.title)}
                      className="p-4 bg-[#12141c]/80 hover:bg-[#181b26] border border-white/10 hover:border-white/20 rounded-2xl transition-all group flex flex-col justify-between"
                    >
                      <span className="text-xs font-semibold text-zinc-200 group-hover:text-white flex items-center justify-between">
                        <span>{item.title}</span>
                        <Sparkles className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                      <span className="text-[11px] text-zinc-500 mt-1.5 leading-snug line-clamp-2">
                        {item.subtitle}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Thread */}
            {messages.map((message) => {
              if (message.role === "user") {
                return (
                  <div key={message.id} className="flex justify-end">
                    <div className="bg-[#1c1f28] border border-white/10 text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl max-w-[90%] sm:max-w-[80%] text-[13.5px] sm:text-[14.5px] leading-relaxed shadow-lg font-normal">
                      {message.content}
                    </div>
                  </div>
                );
              }

              // Assistant Turn
              return (
                <div key={message.id} className="flex flex-col space-y-5">
                  {/* Next-Level 3-Agent Holographic Visualizer & Pipeline */}
                  <AgentPipeline
                    steps={message.steps || []}
                    currentAgent={message.currentAgent || "idle"}
                  />

                  {/* 1. Animated Tool Calls Section */}
                  {message.toolCalls && message.toolCalls.length > 0 && (
                    <ToolCallsSection
                      toolCalls={message.toolCalls}
                      defaultExpanded={message.status === "researching"}
                      className="w-full max-w-none"
                    />
                  )}

                  {/* 2. Verified 5-Sources Carousel / Grid */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="space-y-3 bg-[#10131b]/90 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
                      <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                        <span className="flex items-center space-x-1.5">
                          <Compass className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{message.sources.length} Verified Sources Curated</span>
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">Tavily Search API</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {message.sources.map((source) => (
                          <a
                            key={source.id}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between group text-left"
                          >
                            <div>
                              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-1">
                                <span>{source.domain}</span>
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-white" />
                              </div>
                              <h5 className="text-xs font-semibold text-zinc-200 line-clamp-1 group-hover:text-white">
                                {source.title}
                              </h5>
                              <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-normal">
                                {source.content}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Cross-Source Findings Accordion */}
                  {message.findings && (
                    <FindingsAccordion findings={message.findings} />
                  )}

                  {/* 3.5 Reasoning Trace Panel (Think Mode) */}
                  {message.reasoning && message.reasoning.length > 0 && (
                    <ReasoningTracePanel reasoning={message.reasoning} isStreaming={message.status === "researching"} />
                  )}

                  {/* 4. Editorial Markdown Report with Streaming Animation */}
                  {(message.content || message.status === "researching") && (
                    <div className="bg-[#0f121a]/95 border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-zinc-400">
                        <span className="flex items-center space-x-1.5 text-zinc-200 font-semibold">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span>Autonomous Research Brief</span>
                        </span>
                        <span className="text-emerald-400 font-mono flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>NVIDIA NIM Grounded</span>
                        </span>
                      </div>

                      <div className="prose-report text-zinc-200 text-sm sm:text-base leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-mono text-xs underline decoration-cyan-500/40 hover:decoration-cyan-400"
                              >
                                <span>{children}</span>
                                <ExternalLink className="w-3 h-3 inline-block ml-0.5 opacity-70" />
                              </a>
                            ),
                            code: ({ node, inline, className, children, ...props }: any) => {
                              const match = /language-(\w+)/.exec(className || "");
                              const codeStr = String(children).replace(/\n$/, "");
                              if (!inline && match && (match[1] === "chart" || match[1] === "json:chart")) {
                                try {
                                  const payload = JSON.parse(codeStr);
                                  return <ChartRenderer payload={payload} />;
                                } catch (e) {
                                  console.error("Failed to parse chart payload:", e);
                                }
                              }
                              return (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-4 rounded-xl border border-white/10 bg-black/40 shadow-xl">
                                <table className="w-full text-left text-xs border-collapse">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead className="bg-white/5 border-b border-white/10 text-zinc-300 font-mono">
                                {children}
                              </thead>
                            ),
                            th: ({ children }) => (
                              <th className="p-3 font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="p-3 border-b border-white/5 text-zinc-300">
                                {children}
                              </td>
                            ),
                            tr: ({ children }) => (
                              <tr className="hover:bg-white/5 transition-colors">
                                {children}
                              </tr>
                            ),
                          }}
                        >
                          {message.content || "*Investigating live evidence and synthesizing report...*"}
                        </ReactMarkdown>
                        {message.status === "researching" && (
                          <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
                        )}
                      </div>

                      {/* Action Toolbar */}
                      {message.status === "completed" && (
                        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/10 text-xs text-zinc-400">
                          <button
                            type="button"
                            onClick={() => handleCopy(message.id, message.content)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-all"
                          >
                            {copiedId === message.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Brief</span>
                              </>
                            )}
                          </button>

                          {/* Next-Level Visual PDF Export */}
                          <button
                            type="button"
                            onClick={() => handleExportPDF(message)}
                            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:via-blue-500/30 hover:to-indigo-500/30 text-sky-300 hover:text-white border border-sky-500/40 hover:border-sky-500/70 transition-all font-medium shadow-sm active:scale-95"
                            title="Export executive-grade visual dossier as PDF"
                          >
                            <FileDown className="w-3.5 h-3.5 text-sky-400" />
                            <span>Export PDF</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadMarkdown(activeTopic || "research-report", message.content)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-all active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export .md</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {message.error && (
                    <div className="bg-rose-950/60 border border-rose-500/50 rounded-2xl p-4 text-xs text-rose-200 flex items-center space-x-2.5">
                      <RotateCcw className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{message.error}</span>
                    </div>
                  )}
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Pinned Input Bar */}
        <div className="sticky bottom-0 z-30 w-full bg-gradient-to-t from-black via-black/95 to-transparent pt-2 sm:pt-3 pb-3 sm:pb-4 px-2 sm:px-6">
          <div className="max-w-[760px] mx-auto space-y-2">
            {/* Integrated AI Prompt Box */}
            <PromptInputBox
              onSend={handleSend}
              isLoading={isResearching}
              placeholder="Search the web autonomously or ask anything..."
              className="w-full bg-[#161820] border-[#30333d] shadow-2xl rounded-3xl"
              onModeChange={(mode) => setActiveMode(mode)}
              onImageAttach={(base64, mime) => {
                setAttachedImageBase64(base64);
                setAttachedImageMime(mime);
              }}
              selectedModel={selectedModel}
              onModelChange={(model) => setSelectedModel(model)}
            />

            {/* Disclaimer text */}
            <p className="text-center text-[11px] text-zinc-500 font-sans">
              DeepScout synthesizes live web sources. Always verify critical facts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
