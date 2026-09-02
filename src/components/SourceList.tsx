"use client";

import React from "react";
import { Source } from "@/types/research";
import { SourceCard } from "@/components/SourceCard";
import { Globe2 } from "lucide-react";

interface SourceListProps {
  sources: Source[];
  isLoading?: boolean;
}

export const SourceList: React.FC<SourceListProps> = ({ sources, isLoading }) => {
  if (sources.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="w-full bg-[#0d121b] border border-white/10 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3">
        <div className="flex items-center space-x-2">
          <Globe2 className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
            Curated Web Sources ({sources.length})
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          5 Verified Articles
        </span>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {sources.map((source, index) => (
          <SourceCard key={source.id || source.url} source={source} index={index} />
        ))}
      </div>
    </div>
  );
};
