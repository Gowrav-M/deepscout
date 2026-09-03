"use client";

import React from "react";
import { Check, X, ShieldAlert, Sparkles, Layers } from "lucide-react";
import { ThreeDCard } from "./ThreeDCard";

const COMPARISON_ROWS = [
  {
    feature: "Live Web Investigation",
    chatbot: "Static training data (knowledge cutoff limits)",
    assistant: "Live Tavily search across verified web articles",
    chatbotStatus: false,
    assistantStatus: true,
  },
  {
    feature: "Source Diversity & Selection",
    chatbot: "No sources or unverified generic summaries",
    assistant: "Curates ~5 distinct, credible, non-duplicate domains",
    chatbotStatus: false,
    assistantStatus: true,
  },
  {
    feature: "Evidence Grounding & Citations",
    chatbot: "Hallucinates facts and non-existent URLs",
    assistant: "Strict inline citations [1], [2] linked to live URLs",
    chatbotStatus: false,
    assistantStatus: true,
  },
  {
    feature: "Cross-Source Synthesis",
    chatbot: "Single-pass text without contradiction analysis",
    assistant: "Detects conflicting claims, emerging trends & challenges",
    chatbotStatus: false,
    assistantStatus: true,
  },
  {
    feature: "Uptime & Rate Limit Resilience",
    chatbot: "Fails abruptly when single API key is throttled",
    assistant: "NVIDIA multi-key failover with automatic rotation",
    chatbotStatus: false,
    assistantStatus: true,
  },
  {
    feature: "Editorial Document Quality",
    chatbot: "Conversational unstructured chat bubble",
    assistant: "Publication-grade executive Markdown briefing",
    chatbotStatus: false,
    assistantStatus: true,
  },
];

export const ComparisonSection: React.FC = () => {
  return (
    <section id="comparison" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-slate-300 mb-4 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>PARADIGM SHIFT</span>
        </div>
        <h2 className="headline-font text-3xl sm:text-5xl font-normal text-white tracking-tight mb-4">
          Chatbot vs. Autonomous Research Agent
        </h2>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Why conversational chat UIs fail at deep investigation, and how autonomous agent orchestration delivers verifiable truth.
        </p>
      </div>

      {/* Comparison Grid */}
      {/* Mobile Comparison Cards (< md screens) */}
      <div className="md:hidden space-y-4">
        {COMPARISON_ROWS.map((row, idx) => (
          <div
            key={idx}
            className="bg-[#0f1219]/90 border border-white/15 rounded-2xl p-4.5 backdrop-blur-xl shadow-xl space-y-3"
          >
            <div className="text-sm font-semibold text-white tracking-tight border-b border-white/10 pb-2.5">
              {row.feature}
            </div>

            {/* DeepScout - Primary Advantage */}
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-[11px] font-mono font-semibold text-emerald-400 mb-1">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>DEEPSCOUT</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {row.assistant}
              </p>
            </div>

            {/* Traditional Generic Chatbot */}
            <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-[11px] font-mono font-semibold text-rose-400/90 mb-1">
                <X className="w-3.5 h-3.5 shrink-0" />
                <span>GENERIC CHATBOT</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {row.chatbot}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Comparison Table (md+ screens) */}
      <div className="hidden md:block">
        <ThreeDCard>
          <div className="bg-[#0f1219]/90 border border-white/15 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 pb-4">
                  <th className="py-4 px-4 text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Dimension
                  </th>
                  <th className="py-4 px-4 text-xs font-mono text-rose-400/90 uppercase tracking-wider">
                    Traditional Generic Chatbot
                  </th>
                  <th className="py-4 px-4 text-xs font-mono text-emerald-400 uppercase tracking-wider bg-white/5 rounded-t-xl">
                    DeepScout Autonomous Pipeline
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">
                      {row.feature}
                    </td>
                    <td className="py-4 px-4 text-slate-400 flex items-start space-x-2.5">
                      <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{row.chatbot}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-200 bg-white/[0.03] font-medium">
                      <div className="flex items-start space-x-2.5">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{row.assistant}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ThreeDCard>
      </div>
    </section>
  );
};
