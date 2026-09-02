export type AgentType = "researcher" | "summarizer" | "report-writer";

export type AgentStatus = "pending" | "running" | "completed" | "failed";

export type ResearchMode = "search" | "think" | "canvas";

export interface Source {
  id: string;
  title: string;
  url: string;
  domain: string;
  publishedDate?: string;
  content: string;
  relevanceReason?: string;
  score?: number;
}

export interface SourceSummary {
  title: string;
  url: string;
  domain?: string;
  summary: string;
  keyPoints: string[];
}

export interface ResearchSynthesis {
  keyFindings: string[];
  trends: string[];
  challenges: string[];
  opportunities: string[];
  conflictingInformation: string[];
  importantFacts: string[];
}

export interface ResearchFindings {
  topic: string;
  sourceSummaries: SourceSummary[];
  synthesis: ResearchSynthesis;
}

export interface AgentStep {
  id: string;
  agent: AgentType;
  status: AgentStatus;
  title: string;
  message: string;
  timestamp: number;
  details?: string;
}

export type StreamEventType =
  | "RESEARCH_STARTED"
  | "AGENT_STEP"
  | "SOURCES_FOUND"
  | "FINDINGS_SYNTHESIZED"
  | "REPORT_CHUNK"
  | "REPORT_COMPLETED"
  | "REASONING_CHUNK"
  | "RESEARCH_COMPLETED"
  | "RESEARCH_ERROR";

export interface StreamEvent {
  type: StreamEventType;
  payload: {
    step?: AgentStep;
    sources?: Source[];
    findings?: ResearchFindings;
    chunk?: string;
    report?: string;
    reasoning?: string;
    reasoningChunk?: string;
    error?: string;
    metadata?: {
      activeKeyIndex?: number;
      model?: string;
      sourceCount?: number;
      durationMs?: number;
      mode?: ResearchMode;
    };
  };
}

export interface ResearchRequest {
  topic: string;
  mode?: ResearchMode;
  model?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface ResearchResult {
  topic: string;
  sources: Source[];
  findings: ResearchFindings;
  report: string;
  reasoning?: string;
  steps: AgentStep[];
}

