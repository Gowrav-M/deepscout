"use client";

import React, { useState } from "react";
import { ArrowRight, Search, Sparkles, Compass, Lightbulb } from "lucide-react";

interface ResearchInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
  initialTopic?: string;
}

const EXAMPLE_TOPICS = [
  "Future of EV in India",
  "Impact of AI on healthcare",
  "Future of renewable energy",
  "India's space economy",
  "Impact of 5G technology",
];

export const ResearchInput: React.FC<ResearchInputProps> = ({
  onSubmit,
  isLoading,
  initialTopic = "",
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = topic.trim();

    if (!trimmed) {
      setError("Please enter a research topic to begin.");
      return;
    }

    if (trimmed.length < 3) {
      setError("Research topic must be at least 3 characters long.");
      return;
    }

    if (trimmed.length > 300) {
      setError("Research topic is too long (maximum 300 characters).");
      return;
    }

    setError(null);
    onSubmit(trimmed);
  };

  const handleSelectExample = (example: string) => {
    setTopic(example);
    setError(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-center pt-8 pb-12 px-4 sm:px-6">
      {/* Editorial Badge */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-mono mb-6">
        <Sparkles className="w-3.5 h-3.5" />
        <span>AUTONOMOUS 3-AGENT INTELLIGENCE PIPELINE</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
        What do you want to research?
      </h1>

      {/* Supporting Text */}
      <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
        Enter a topic and let the research agents investigate the live web,
        analyze multiple sources, and create a structured editorial report.
      </p>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="w-full mb-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl opacity-75" />

          <div className="relative flex flex-col sm:flex-row items-center bg-[#131924] border border-white/15 rounded-2xl shadow-2xl p-2 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <div className="flex items-center w-full px-3 py-2">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input
                type="text"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isLoading}
                placeholder="e.g., Future of EV in India"
                className="w-full bg-transparent text-white placeholder-slate-400 text-base sm:text-lg focus:outline-none disabled:opacity-50"
                maxLength={300}
              />
              {topic && !isLoading && (
                <button
                  type="button"
                  onClick={() => setTopic("")}
                  className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 mr-2"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium text-sm sm:text-base rounded-xl transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Researching...</span>
                </>
              ) : (
                <>
                  <span>Start Research</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-2.5 text-xs text-rose-400 text-left font-medium px-2">
            {error}
          </p>
        )}
      </form>

      {/* Suggested Topic Chips */}
      <div className="text-left mt-6">
        <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-400 mb-2.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Suggested Research Questions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_TOPICS.map((example) => (
            <button
              key={example}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectExample(example)}
              className="text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/80 px-3 py-1.5 rounded-lg transition-all text-left flex items-center space-x-1.5 hover:border-slate-500"
            >
              <Compass className="w-3 h-3 text-blue-400" />
              <span>{example}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
