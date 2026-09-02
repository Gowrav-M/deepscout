"use client";

import React from "react";
import { HolographicCircuit } from "./animations/HolographicCircuit";
import { AgentStep, AgentType } from "@/types/research";
import { formatTimestamp } from "@/lib/utils";
import { motion } from "framer-motion";
import { Terminal, Cpu, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface AgentPipelineProps {
  steps: AgentStep[];
  currentAgent: AgentType | "completed" | "idle";
}

export const AgentPipeline: React.FC<AgentPipelineProps> = ({
  steps,
  currentAgent,
}) => {
  return (
    <div className="w-full space-y-3">
      {/* 1. Next-Level Holographic Multi-Agent Circuit */}
      <HolographicCircuit currentAgent={currentAgent} />

      {/* 2. Cybernetic Terminal Live Execution Logs */}
      {steps.length > 0 && (
        <div className="w-full bg-[#080a0f] border border-white/10 rounded-2xl p-4 font-mono shadow-xl relative overflow-hidden">
          {/* Top Terminal Status */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-zinc-400">
            <div className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-zinc-300">LIVE AGENT EXECUTION TRACE</span>
            </div>
            <span className="text-[10px] text-zinc-500">
              {steps.length} steps recorded
            </span>
          </div>

          {/* Steps list */}
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-xs">
            {steps.map((step, idx) => {
              const isLatest = idx === steps.length - 1;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start space-x-2.5 p-2 rounded-lg border transition-all ${
                    isLatest
                      ? "bg-blue-950/30 border-blue-500/30 text-zinc-200"
                      : "bg-black/40 border-white/5 text-zinc-400"
                  }`}
                >
                  <span className="text-zinc-600 shrink-0 text-[10px] mt-0.5">
                    [{formatTimestamp(step.timestamp)}]
                  </span>

                  {/* Agent badge */}
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      step.agent === "researcher"
                        ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                        : step.agent === "summarizer"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                    }`}
                  >
                    {step.agent}
                  </span>

                  <span className="text-[11.5px] leading-relaxed truncate flex-1">
                    {step.message}
                  </span>

                  {isLatest && step.status === "running" && (
                    <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0 mt-0.5" />
                  )}
                  {step.status === "completed" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
