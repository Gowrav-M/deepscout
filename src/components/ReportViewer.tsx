"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FileText,
  Copy,
  Check,
  Download,
  FileDown,
  Share2,
  BookOpen,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Source } from "@/types/research";
import { exportResearchToPDF } from "@/lib/export/pdf-exporter";

interface ReportViewerProps {
  topic: string;
  report: string;
  sources: Source[];
  isStreaming?: boolean;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  topic,
  report,
  sources,
  isStreaming,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const filename = `${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-research-report.md`;
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePDFExport = () => {
    exportResearchToPDF({
      topic,
      reportContent: report,
      sources,
    });
  };

  const scrollToSource = (index: number) => {
    const elem = document.getElementById(`source-${index}`);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "center" });
      elem.classList.add("ring-2", "ring-blue-500");
      setTimeout(() => {
        elem.classList.remove("ring-2", "ring-blue-500");
      }, 2000);
    }
  };

  return (
    <div className="w-full bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
      {/* Top Editorial Document Header */}
      <div className="border-b border-white/[0.08] bg-[#111622] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-blue-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Autonomous Research Report</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              {topic}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>{sources.length} sources analyzed</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date().toLocaleDateString(undefined, { dateStyle: "long" })}</span>
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Personal Research Assistant
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
            <button
              onClick={handleCopy}
              disabled={isStreaming || !report}
              className="px-3.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-40"
              title="Copy markdown to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Report</span>
                </>
              )}
            </button>

            <button
              onClick={handlePDFExport}
              disabled={isStreaming || !report}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:via-blue-500/30 hover:to-indigo-500/30 text-sky-300 hover:text-white border border-sky-500/40 hover:border-sky-500/70 text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md shadow-sky-500/10 active:scale-95 disabled:opacity-40"
              title="Export executive visual dossier as PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-sky-400" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isStreaming || !report}
              className="px-3.5 py-2 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-40"
              title="Download as markdown file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .md</span>
            </button>
          </div>
        </div>
      </div>

      {/* Document Body */}
      <div className="p-6 sm:p-10 max-w-none">
        <article className="prose-report">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a({ href, children }) {
                // Check if this is a citation link or normal link
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline font-medium"
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {report}
          </ReactMarkdown>

          {isStreaming && (
            <div className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse align-middle" />
          )}
        </article>
      </div>
    </div>
  );
};
