"use client";

import React from "react";
import { ExternalLink, Globe, Calendar, CheckCheck } from "lucide-react";
import { Source } from "@/types/research";

interface SourceCardProps {
  source: Source;
  index: number;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, index }) => {
  return (
    <div
      id={`source-${index + 1}`}
      className="group relative bg-[#131822] hover:bg-[#18202d] border border-white/10 hover:border-blue-500/40 rounded-xl p-4 transition-all duration-200 shadow-md flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Index & Domain */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-mono font-bold flex items-center justify-center">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
              <Globe className="w-3 h-3 text-slate-500" />
              <span className="truncate max-w-[140px]">{source.domain}</span>
            </span>
          </div>

          {source.publishedDate && (
            <span className="text-[10px] text-slate-500 flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{source.publishedDate}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-2 mb-2 leading-snug">
          {source.title}
        </h4>

        {/* Snippet */}
        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
          {source.content}
        </p>
      </div>

      {/* Footer Link */}
      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-[11px] text-emerald-400/90 font-mono flex items-center space-x-1">
          <CheckCheck className="w-3 h-3 text-emerald-400" />
          <span>Verified Source</span>
        </span>

        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors group-hover:translate-x-0.5 transform duration-150"
        >
          <span>Open source</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
