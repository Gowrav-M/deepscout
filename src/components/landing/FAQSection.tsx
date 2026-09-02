"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How does the autonomous 3-agent pipeline function?",
    answer:
      "When you submit a topic, the Researcher Agent queries the live web via Tavily Search and selects ~5 high-density, distinct sources. The Summarizer Agent then analyzes the raw article contents to extract facts, trends, and conflicting statistics. Finally, the Report Writer Agent compiles a publication-grade markdown brief with strict inline citation markers [1], [2] linked to the actual source URLs.",
  },
  {
    question: "How does the NVIDIA multi-key failover engine work?",
    answer:
      "The system can ingest multiple NVIDIA NIM API keys (NVIDIA_API_KEY_1 to NVIDIA_API_KEY_5). If Key 1 encounters a rate limit (429), authentication error (401), or temporary outage, our central key manager catches the error, rotates immediately to Key 2, and seamlessly retries the operation without interrupting your research session.",
  },
  {
    question: "Are API keys or research data exposed to the client?",
    answer:
      "No. All interactions with the Tavily Search API and NVIDIA NIM models execute strictly in server-side Next.js route handlers. No API keys or internal credentials are ever sent to or accessible by client browser code.",
  },
  {
    question: "Can I export the completed research report?",
    answer:
      "Yes. Every completed report includes a 1-click 'Copy Report' button for markdown clipboard copying and an 'Export .md' button to download the formatted report file directly to your device.",
  },
  {
    question: "Why is there no login or database requirement?",
    answer:
      "This application is intentionally engineered as an instantaneous, friction-free demo workspace. All research state is held in-memory for the active session, allowing anyone to conduct autonomous multi-agent investigations immediately without sign-up walls.",
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-slate-300 mb-4 backdrop-blur-md">
          <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
          <span>FREQUENTLY ASKED QUESTIONS</span>
        </div>
        <h2 className="headline-font text-3xl sm:text-5xl font-normal text-white tracking-tight mb-4">
          Everything You Need to Know
        </h2>
        <p className="text-slate-400 text-base sm:text-lg">
          Common architectural and operational questions regarding the Personal Research Assistant.
        </p>
      </div>

      {/* Accordion list */}
      <div className="space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "bg-[#141822]/90 border-white/20 shadow-xl"
                  : "bg-[#0d1017]/60 border-white/10 hover:border-white/20"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-white text-base sm:text-lg"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-1 text-sm text-slate-300 leading-relaxed border-t border-white/5">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};
