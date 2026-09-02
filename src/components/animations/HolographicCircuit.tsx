"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, Brain, FileText, Sparkles, Zap, Cpu } from "lucide-react";
import { AgentType } from "@/types/research";

interface HolographicCircuitProps {
  currentAgent: AgentType | "completed" | "idle";
}

export const HolographicCircuit: React.FC<HolographicCircuitProps> = ({
  currentAgent,
}) => {
  const nodes = [
    {
      id: "researcher" as AgentType,
      title: "01. Researcher",
      role: "Live Web Grounding",
      icon: Globe,
      color: "from-cyan-500 to-blue-600",
      glowColor: "shadow-cyan-500/30",
      borderColor: "border-cyan-400",
      activeText: "text-cyan-300",
      bgGlow: "bg-cyan-500/10",
    },
    {
      id: "summarizer" as AgentType,
      title: "02. Summarizer",
      role: "Evidence Synthesis",
      icon: Brain,
      color: "from-amber-500 to-orange-600",
      glowColor: "shadow-amber-500/30",
      borderColor: "border-amber-400",
      activeText: "text-amber-300",
      bgGlow: "bg-amber-500/10",
    },
    {
      id: "report-writer" as AgentType,
      title: "03. Report Writer",
      role: "Citation Engine",
      icon: FileText,
      color: "from-purple-500 to-indigo-600",
      glowColor: "shadow-purple-500/30",
      borderColor: "border-purple-400",
      activeText: "text-purple-300",
      bgGlow: "bg-purple-500/10",
    },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#0e111a] via-[#090b10] to-[#050608] border border-white/15 p-3.5 sm:p-5 backdrop-blur-2xl shadow-2xl">
      {/* Background Cybernetic Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Telemetry Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 sm:pb-3.5 sm:mb-4 border-b border-white/10 text-xs font-mono">
        <div className="flex items-center space-x-2 text-zinc-200">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: "6s" }} />
          <span className="font-semibold tracking-wide text-[11px] sm:text-xs">AUTONOMOUS MULTI-AGENT TELEMETRY</span>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          <span className="text-zinc-500">ENGINE:</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>NVIDIA NIM + TAVILY</span>
          </span>
        </div>
      </div>

      {/* 3 Interactive Nodes with Data Stream Beam */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4">
        {nodes.map((node, i) => {
          const isActive = currentAgent === node.id;
          const isCompleted =
            currentAgent === "completed" ||
            (node.id === "researcher" &&
              (currentAgent === "summarizer" || currentAgent === "report-writer")) ||
            (node.id === "summarizer" && currentAgent === "report-writer");

          const Icon = node.icon;

          return (
            <div
              key={node.id}
              className={`relative rounded-xl p-3.5 border transition-all duration-300 flex flex-col justify-between ${
                isActive
                  ? `${node.bgGlow} ${node.borderColor} shadow-xl ${node.glowColor} ring-1 ring-white/30 scale-[1.02]`
                  : isCompleted
                  ? "bg-slate-900/60 border-emerald-500/30 text-zinc-300"
                  : "bg-black/40 border-white/5 opacity-50 text-zinc-500"
              }`}
            >
              {/* Active Scanner Line */}
              {isActive && (
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none rounded-xl"
                />
              )}

              {/* Node Top Row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? `bg-gradient-to-tr ${node.color} text-white shadow-md`
                        : isCompleted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">
                      {node.title}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {node.role}
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="text-[10px] font-mono font-bold">
                  {isActive ? (
                    <span className="text-cyan-400 flex items-center space-x-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>RUNNING</span>
                    </span>
                  ) : isCompleted ? (
                    <span className="text-emerald-400">DONE</span>
                  ) : (
                    <span className="text-zinc-600">STANDBY</span>
                  )}
                </div>
              </div>

              {/* Live Waveform Indicator during Active State */}
              <div className="h-4 flex items-center justify-between gap-1 px-1 bg-black/40 rounded-md border border-white/5 mt-2">
                {[...Array(12)].map((_, barIdx) => (
                  <motion.div
                    key={barIdx}
                    animate={
                      isActive
                        ? {
                            height: ["20%", "90%", "30%"],
                          }
                        : { height: "20%" }
                    }
                    transition={{
                      repeat: Infinity,
                      duration: 0.5 + (barIdx % 3) * 0.2,
                      delay: barIdx * 0.05,
                    }}
                    className={`w-1 rounded-full ${
                      isActive
                        ? "bg-gradient-to-t from-blue-400 to-cyan-300"
                        : isCompleted
                        ? "bg-emerald-500/40"
                        : "bg-zinc-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
