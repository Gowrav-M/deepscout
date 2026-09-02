"use client";

import React, { useState } from "react";
import { ResearchFindings } from "@/types/research";
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface FindingsAccordionProps {
  findings?: ResearchFindings;
}

export const FindingsAccordion: React.FC<FindingsAccordionProps> = ({
  findings,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!findings || !findings.synthesis) {
    return null;
  }

  const { synthesis } = findings;

  return (
    <div className="w-full bg-[#111622] border border-white/10 rounded-2xl p-5 shadow-xl mb-6">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
              Cross-Source Synthesis & Key Insights
            </h3>
            <p className="text-xs text-slate-400">
              Summarizer agent cross-referenced all {findings.sourceSummaries?.length || 5} sources
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 border border-white/5 transition-colors">
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 pt-4 border-t border-white/[0.08] space-y-5 animate-fade-in">
          {/* Key Findings */}
          {synthesis.keyFindings && synthesis.keyFindings.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Primary Discoveries</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {synthesis.keyFindings.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-blue-500 shrink-0 mt-0.5">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trends & Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trends */}
            {synthesis.trends && synthesis.trends.length > 0 && (
              <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Observed Trends</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {synthesis.trends.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Challenges */}
            {synthesis.challenges && synthesis.challenges.length > 0 && (
              <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Bottlenecks & Risks</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {synthesis.challenges.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-rose-500 shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Opportunities & Important Facts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opportunities */}
            {synthesis.opportunities && synthesis.opportunities.length > 0 && (
              <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Strategic Opportunities</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {synthesis.opportunities.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Facts & Stats */}
            {synthesis.importantFacts && synthesis.importantFacts.length > 0 && (
              <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Key Data Points</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {synthesis.importantFacts.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-cyan-500 shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
