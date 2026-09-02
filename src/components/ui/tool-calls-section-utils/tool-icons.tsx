"use client";

import React from "react";
import {
  Globe,
  Search,
  Mail,
  Calendar,
  Code2,
  Terminal,
  Bot,
  Brain,
  FileText,
  Cpu,
  Database,
  Wrench,
  Sparkles,
  ArrowRightLeft,
  CheckCircle2,
} from "lucide-react";

export function formatToolName(name: string): string {
  if (!name) return "Unknown Tool";
  return name
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function getToolCategoryIcon(
  category: string,
  size: { width: number; height: number } = { width: 18, height: 18 },
  iconUrl?: string,
): React.ReactNode {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={category}
        style={{ width: size.width, height: size.height }}
        className="rounded object-contain"
      />
    );
  }

  const cat = (category || "").toLowerCase();

  const iconClasses = "rounded-lg p-1.5 flex items-center justify-center transition-transform hover:scale-105";

  if (cat.includes("search") || cat.includes("tavily") || cat.includes("web")) {
    return (
      <div className={`${iconClasses} bg-cyan-500/15 text-cyan-400 border border-cyan-500/30`}>
        <Search size={size.width - 4} />
      </div>
    );
  }

  if (cat.includes("gmail") || cat.includes("mail") || cat.includes("email")) {
    return (
      <div className={`${iconClasses} bg-rose-500/15 text-rose-400 border border-rose-500/30`}>
        <Mail size={size.width - 4} />
      </div>
    );
  }

  if (cat.includes("calendar") || cat.includes("event") || cat.includes("schedule")) {
    return (
      <div className={`${iconClasses} bg-blue-500/15 text-blue-400 border border-blue-500/30`}>
        <Calendar size={size.width - 4} />
      </div>
    );
  }

  if (cat.includes("executor") || cat.includes("code") || cat.includes("terminal")) {
    return (
      <div className={`${iconClasses} bg-emerald-500/15 text-emerald-400 border border-emerald-500/30`}>
        <Terminal size={size.width - 4} />
      </div>
    );
  }

  if (cat.includes("handoff") || cat.includes("delegate")) {
    return (
      <div className={`${iconClasses} bg-violet-500/15 text-violet-400 border border-violet-500/30`}>
        <ArrowRightLeft size={size.width - 4} />
      </div>
    );
  }

  if (cat.includes("researcher")) {
    return (
      <div className={`${iconClasses} bg-cyan-500/15 text-cyan-400 border border-cyan-500/30`}>
        <Globe size={size.width - 4} />
      </div>
    );
  }

  if (cat.includes("summarizer") || cat.includes("brain") || cat.includes("think")) {
    return (
      <div className={`${iconClasses} bg-amber-500/15 text-amber-400 border border-amber-500/30`}>
        <Brain size={size.width - 4} />
      </div>
    );
  }

  if (cat.includes("writer") || cat.includes("report") || cat.includes("document")) {
    return (
      <div className={`${iconClasses} bg-purple-500/15 text-purple-400 border border-purple-500/30`}>
        <FileText size={size.width - 4} />
      </div>
    );
  }

  if (cat.includes("nvidia") || cat.includes("llm") || cat.includes("ai")) {
    return (
      <div className={`${iconClasses} bg-green-500/15 text-green-400 border border-green-500/30`}>
        <Cpu size={size.width - 4} />
      </div>
    );
  }

  if (cat.includes("memory") || cat.includes("database") || cat.includes("storage")) {
    return (
      <div className={`${iconClasses} bg-sky-500/15 text-sky-400 border border-sky-500/30`}>
        <Database size={size.width - 4} />
      </div>
    );
  }

  return (
    <div className={`${iconClasses} bg-zinc-800 text-zinc-400 border border-zinc-700`}>
      <Wrench size={size.width - 4} />
    </div>
  );
}
