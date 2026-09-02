"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2,
  Brain,
  FileText,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  Code2,
  CheckCircle2,
} from "lucide-react";
import { ThreeDCard } from "./ThreeDCard";

interface AgentDetail {
  id: string;
  name: string;
  badge: string;
  role: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  glowColor: string;
  description: string;
  inputs: string[];
  outputs: string[];
  latency: string;
  promptSnippet: string;
}

const AGENTS: AgentDetail[] = [
  {
    id: "researcher",
    name: "01. Researcher Agent",
    badge: "Live Web Grounding",
    role: "Targeted Search & 5-Source Curation",
    icon: Globe2,
    color: "from-cyan-500/20 to-blue-500/10",
    borderColor: "border-cyan-500/40",
    glowColor: "shadow-cyan-500/20",
    description:
      "Formulates targeted search strategies and queries Tavily API in real time. Filters, ranks, and deduplicates domains to select approximately 5 verified, high-density articles with automatic token truncation.",
    inputs: ["User Research Objective", "Live Search Queries"],
    outputs: ["5 Verified Raw Articles", "Domain Metadata", "Timestamped Excerpts"],
    latency: "< 850ms",
    promptSnippet:
      "Investigate the live web using Tavily. Curate 5 distinct, high-credibility articles. Do not invent sources. Extract and prune text content.",
  },
  {
    id: "summarizer",
    name: "02. Summarizer Agent",
    badge: "Cross-Source Synthesis",
    role: "Fact Extraction & Contradiction Resolution",
    icon: Brain,
    color: "from-amber-500/20 to-orange-500/10",
    borderColor: "border-amber-500/40",
    glowColor: "shadow-amber-500/20",
    description:
      "Extracts key points from each individual source and cross-references them to surface overarching trends, market data points, critical challenges, and conflicting viewpoints.",
    inputs: ["5 Extracted Article Excerpts", "Research Topic Scope"],
    outputs: ["Primary Discoveries", "Emerging Market Trends", "Identified Risks & Conflicts"],
    latency: "< 1,200ms",
    promptSnippet:
      "Synthesize evidence across all 5 sources. Extract empirical metrics, identify market bottlenecks, and highlight any contradictory statistics.",
  },
  {
    id: "writer",
    name: "03. Report Writer Agent",
    badge: "Citation Formulation",
    role: "Editorial Publication & Traceability Engine",
    icon: FileText,
    color: "from-purple-500/20 to-indigo-500/10",
    borderColor: "border-purple-500/40",
    glowColor: "shadow-purple-500/20",
    description:
      "Composes an executive-grade research brief with Executive Summary, Context, Findings, Trajectory, and Strategic Outlook. Strictly links all claims to verified inline citations [1], [2].",
    inputs: ["Synthesized Findings Matrix", "Numbered Source References"],
    outputs: ["Publication Markdown Report", "Inline Citations [1][2]", "Verified Source Index"],
    latency: "< 1,800ms",
    promptSnippet:
      "Generate an executive briefing with numbered inline citation markers [1], [2] referencing verified sources. Produce publication-grade prose.",
  },
];

export const AgentVisualizer: React.FC = () => {
  const [activeAgentId, setActiveAgentId] = useState<string>("researcher");
  const selectedAgent = AGENTS.find((a) => a.id === activeAgentId) || AGENTS[0];

  return (
    <section id="architecture" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-slate-300 mb-4 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>AUTONOMOUS WORKFLOW ARCHITECTURE</span>
        </div>
        <h2 className="headline-font text-3xl sm:text-5xl font-normal text-white tracking-tight mb-4">
          Three Agents. One Cohesive Intelligence.
        </h2>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Unlike monolithic chatbots that guess answers in a single prompt, our architecture decomposes research into three specialized autonomous agents that check, cross-examine, and verify evidence.
        </p>
      </div>

      {/* 3D Agent Cards Interactive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {AGENTS.map((agent, index) => {
          const Icon = agent.icon;
          const isActive = agent.id === activeAgentId;

          return (
            <ThreeDCard
              key={agent.id}
              onClick={() => setActiveAgentId(agent.id)}
              className="cursor-pointer"
            >
              <div
                className={`relative rounded-2xl p-6 backdrop-blur-xl border transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-b ${agent.color} ${agent.borderColor} ring-2 ring-white/20 shadow-2xl ${agent.glowColor}`
                    : "bg-[#111318]/70 border-white/10 hover:border-white/25 hover:bg-[#151820]"
                }`}
              >
                {/* Top Badge & Number */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/10 text-slate-200 border border-white/15">
                    {agent.badge}
                  </span>
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                    }`}
                  />
                </div>

                {/* Icon & Title */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-white">{agent.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{agent.role}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                  {agent.description}
                </p>

                {/* Bottom Interactive Trigger */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-mono text-slate-400">
                  <span>Latency: {agent.latency}</span>
                  <span className="text-blue-400 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </ThreeDCard>
          );
        })}
      </div>

      {/* Deep Dive Telemetry & Prompt Inspector Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedAgent.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35 }}
          className="bg-[#0f1219]/90 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl"
        >
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            {/* Left Column: Responsibilities & Data Contract */}
            <div className="flex-1 space-y-5">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <selectedAgent.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white tracking-tight">
                    {selectedAgent.name} — Technical Specification
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Autonomous Execution Phase & Contract
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedAgent.description}
              </p>

              {/* Inputs & Outputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                    Ingested Inputs
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                    {selectedAgent.inputs.map((inp, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>{inp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                    Produced Outputs
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                    {selectedAgent.outputs.map((out, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Simulated Agent Prompt */}
            <div className="w-full lg:w-[420px] bg-black/70 border border-white/15 rounded-2xl p-5 font-mono text-xs text-slate-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 text-slate-400 text-[11px]">
                  <span className="flex items-center space-x-1.5">
                    <Code2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>SYSTEM_PROMPT_DIRECTIVE</span>
                  </span>
                  <span className="text-emerald-400">ACTIVE</span>
                </div>
                <p className="text-slate-300 text-[12px] leading-relaxed bg-[#141824]/60 p-3.5 rounded-xl border border-white/5">
                  &ldquo;{selectedAgent.promptSnippet}&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>Model: Meta Llama 3.2 Vision (NVIDIA NIM)</span>
                <span className="text-blue-400 font-bold">Temp: 0.3</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
