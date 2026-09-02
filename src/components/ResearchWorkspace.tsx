"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { LandingHero } from "@/components/landing/LandingHero";
import { AgentVisualizer } from "@/components/landing/AgentVisualizer";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { ResearchChatView } from "@/components/chat/ResearchChatView";
import { Sparkles } from "lucide-react";

export const ResearchWorkspace: React.FC = () => {
  const [viewMode, setViewMode] = useState<"landing" | "research">("landing");
  const [initialTopic, setInitialTopic] = useState<string | undefined>(undefined);

  const handleLaunchResearch = (topic?: string) => {
    setInitialTopic(topic);
    setViewMode("research");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReturnToLanding = () => {
    setInitialTopic(undefined);
    setViewMode("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If in Research Mode, render full-screen Chat View (Bottom-pinned input, inline tool calling & animations)
  if (viewMode === "research") {
    return (
      <ResearchChatView
        onReturnToLanding={handleReturnToLanding}
        initialTopic={initialTopic}
      />
    );
  }

  // Otherwise, render the Video Landing Page
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black overflow-x-hidden">
      {/* Full-Bleed Video Background */}
      <div className="bg-video-container">
        <video
          className="bg-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
        <div className="bg-overlay opacity-45" />
      </div>

      {/* Glass Header */}
      <Header
        onReset={handleReturnToLanding}
        onLaunchResearch={() => handleLaunchResearch()}
      />

      {/* Landing Page Content */}
      <main className="relative z-10 flex-1 w-full flex flex-col justify-center space-y-8">
        {/* 1. Cinematic Hero with ONLY Get Started button */}
        <LandingHero onGetStarted={() => handleLaunchResearch()} />

        {/* 2. 3D Multi-Agent Architecture */}
        <AgentVisualizer />

        {/* 3. Bento Grid Capabilities & Simulator */}
        <BentoGrid />

        {/* 4. Chatbot vs Autonomous Agent Comparison */}
        <ComparisonSection />

        {/* 5. Interactive FAQ */}
        <FAQSection />

        {/* Bottom Call to Action Banner */}
        <section className="py-20 px-4 text-center max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-[#181a24] to-[#0d0f17] border border-white/20 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-3xl pointer-events-none" />
            <h3 className="headline-font text-2xl sm:text-4xl font-normal text-white mb-4">
              Ready to Experience Autonomous Research?
            </h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Launch an autonomous 3-agent investigation into any topic with live web extraction, tool-call tracking, and strict citations.
            </p>
            <button
              type="button"
              onClick={() => handleLaunchResearch()}
              className="px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-black font-semibold text-sm transition-all shadow-[0_0_24px_rgba(255,255,255,0.4)] hover:shadow-[0_0_36px_rgba(255,255,255,0.6)] active:scale-95 inline-flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Launch Research Assistant</span>
            </button>
          </div>
        </section>
      </main>

      {/* Modern Minimal Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 py-8 px-4 text-center text-xs text-zinc-500 font-mono">
        <p>DeepScout • Autonomous 3-Agent Research Engine</p>
      </footer>
    </div>
  );
};
