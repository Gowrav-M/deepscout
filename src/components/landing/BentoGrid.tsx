"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Search,
  BookOpen,
  FileCheck,
  Download,
  Zap,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";
import { ThreeDCard } from "./ThreeDCard";

export const BentoGrid: React.FC = () => {
  const [activeKeyTest, setActiveKeyTest] = useState<number>(1);
  const [simulatedFailover, setSimulatedFailover] = useState<boolean>(false);

  const triggerSimulatedFailover = () => {
    setSimulatedFailover(true);
    setTimeout(() => {
      setActiveKeyTest((prev) => (prev % 3) + 1);
      setSimulatedFailover(false);
    }, 600);
  };

  return (
    <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-slate-300 mb-4 backdrop-blur-md">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>ENGINEERING EXCELLENCE</span>
        </div>
        <h2 className="headline-font text-3xl sm:text-5xl font-normal text-white tracking-tight mb-4">
          Built for Truth. Engineered for Reliability.
        </h2>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Explore the resilient architectural features powering autonomous web investigation, factual grounding, and uninterrupted failover.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Card 1 (Span 8): Multi-Key NVIDIA Failover Engine */}
        <div className="md:col-span-8">
          <ThreeDCard className="h-full">
            <div className="h-full bg-gradient-to-br from-[#121622] via-[#0e111a] to-[#090b0e] border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Fault-Tolerant Engine</span>
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  NVIDIA Multi-Key Dynamic Failover
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-xl mb-6">
                  Supports up to 5 concurrent NVIDIA NIM API keys. When rate limits (429) or transient auth errors occur, the manager automatically rotates keys and retries instantly without interrupting research.
                </p>
              </div>

              {/* Interactive Failover Simulator */}
              <div className="bg-black/50 border border-white/10 rounded-2xl p-4 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-2 text-xs text-slate-300">
                    <span className="text-slate-500">ACTIVE_KEY:</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      NVIDIA_API_KEY_{activeKeyTest}
                    </span>
                    <span className="text-emerald-400 text-[11px] font-bold">200 OK</span>
                  </div>

                  <button
                    type="button"
                    onClick={triggerSimulatedFailover}
                    disabled={simulatedFailover}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center space-x-1.5 transition-all border border-slate-700 active:scale-95 shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${simulatedFailover ? "animate-spin text-amber-400" : ""}`} />
                    <span>Simulate 429 Failover</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  {[1, 2, 3].map((k) => (
                    <div
                      key={k}
                      className={`p-2 rounded-lg border transition-all ${
                        activeKeyTest === k
                          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                          : "bg-black/30 border-white/5 text-slate-500"
                      }`}
                    >
                      <div className="text-[10px] text-slate-400">Slot 0{k}</div>
                      <div className="font-bold">{activeKeyTest === k ? "ONLINE" : "STANDBY"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ThreeDCard>
        </div>

        {/* Card 2 (Span 4): Live Web Grounding */}
        <div className="md:col-span-4">
          <ThreeDCard className="h-full">
            <div className="h-full bg-[#10131b] border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Live Web Grounding
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Queries real-time web articles via Tavily Search API. Eliminates outdated training data cutoffs and grounds all analysis in current evidence.
                </p>
              </div>

              <div className="space-y-2 font-mono text-[11px] text-slate-400 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Deduplication</span>
                  <span className="text-emerald-400">Strict Domain Filter</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Source Curation</span>
                  <span className="text-cyan-400">Top 5 Credible</span>
                </div>
              </div>
            </div>
          </ThreeDCard>
        </div>

        {/* Card 3 (Span 4): Citation Traceability */}
        <div className="md:col-span-4">
          <ThreeDCard className="h-full">
            <div className="h-full bg-[#10131b] border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Strict Citation Linking
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Every factual assertion in the generated brief includes numbered citation markers [1], [2] linked to verified source URLs.
                </p>
              </div>

              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[11.5px] text-slate-300 leading-relaxed">
                &ldquo;India EV market valued at $5.9B in 2024 <span className="text-blue-400 font-mono font-bold">[1]</span> and projected $35.8B by 2032 <span className="text-blue-400 font-mono font-bold">[2]</span>.&rdquo;
              </div>
            </div>
          </ThreeDCard>
        </div>

        {/* Card 4 (Span 4): Cross-Source Synthesis */}
        <div className="md:col-span-4">
          <ThreeDCard className="h-full">
            <div className="h-full bg-[#10131b] border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Cross-Source Fact Synthesis
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Identifies shared findings, resolves contradictory claims between publishers, and surfaces hidden trajectory trends.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs text-amber-400 font-mono bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Contradiction & Consensus Discovery</span>
              </div>
            </div>
          </ThreeDCard>
        </div>

        {/* Card 5 (Span 4): Export & Zero Auth Simplicity */}
        <div className="md:col-span-4">
          <ThreeDCard className="h-full">
            <div className="h-full bg-[#10131b] border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  1-Click Export & Zero Friction
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Instantly export verified briefs as clean Markdown (.md) or copy to clipboard. Zero login walls or databases required.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-white/10">
                <span>Format: Pure Markdown</span>
                <span className="text-emerald-400">Ready to Share</span>
              </div>
            </div>
          </ThreeDCard>
        </div>
      </div>
    </section>
  );
};
