"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkles, X as CloseIcon } from "lucide-react";

interface HeaderProps {
  onReset?: () => void;
  onLaunchResearch?: () => void;
  isResearching?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onLaunchResearch,
  isResearching,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile drawer is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="w-full sticky top-0 z-50 flex items-center justify-center pt-4 sm:pt-6 px-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-md pb-3">
      <div className="w-full max-w-[840px] flex items-center justify-between gap-[clamp(14px,2.4vw,28px)] animate-[slideDown_0.7s_cubic-bezier(0.22,1,0.36,1)_both]">
        {/* DeepScout Logo */}
        <button
          type="button"
          onClick={() => {
            onReset?.();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="w-[42px] sm:w-[46px] h-[42px] sm:h-[46px] rounded-full bg-black/80 shadow-[0_4px_14px_rgba(0,0,0,0.16),0_0_20px_rgba(56,189,248,0.15)] flex items-center justify-center overflow-hidden transition-transform duration-200 hover:scale-105 shrink-0 border border-cyan-500/20"
          aria-label="DeepScout Home"
        >
          <img
            src="/deepscout-logo.jpg"
            alt="DeepScout"
            className="w-full h-full object-cover rounded-full"
          />
        </button>

        {/* Desktop Nav Pill */}
        <nav
          className="hidden md:flex items-center justify-between flex-1 max-w-[500px] h-[44px] sm:h-[48px] px-6 bg-white rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.16)]"
          aria-label="Main navigation"
        >
          <button
            type="button"
            onClick={() => {
              onReset?.();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="nav-link-active relative font-sans font-medium text-[13.5px] text-[#2e2e2e] opacity-100 py-1"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("architecture")}
            className="relative font-sans font-medium text-[13.5px] text-[#2e2e2e] opacity-60 hover:opacity-100 transition-opacity py-1"
          >
            Architecture
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("features")}
            className="relative font-sans font-medium text-[13.5px] text-[#2e2e2e] opacity-60 hover:opacity-100 transition-opacity py-1"
          >
            Capabilities
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("comparison")}
            className="relative font-sans font-medium text-[13.5px] text-[#2e2e2e] opacity-60 hover:opacity-100 transition-opacity py-1"
          >
            Comparison
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("faq")}
            className="relative font-sans font-medium text-[13.5px] text-[#2e2e2e] opacity-60 hover:opacity-100 transition-opacity py-1"
          >
            FAQ
          </button>
        </nav>

        {/* Desktop Launch Research CTA */}
        <button
          type="button"
          onClick={() => {
            if (onLaunchResearch) {
              onLaunchResearch();
            } else {
              onReset?.();
            }
          }}
          className="hidden md:inline-flex items-center justify-center h-[44px] sm:h-[48px] px-6 bg-[#28282a] hover:bg-[#323234] text-[#c8c8c8] hover:text-white rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.16)] text-[13.5px] font-semibold transition-all hover:-translate-y-0.5 shrink-0 space-x-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Launch Research</span>
        </button>

        {/* Mobile Burger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle menu"
          className={`md:hidden flex flex-col justify-center items-center gap-[5px] w-[46px] h-[46px] rounded-full transition-colors duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.16)] ${
            mobileMenuOpen ? "bg-white" : "bg-[#28282a]"
          }`}
        >
          <span
            className={`w-[18px] h-[1.5px] rounded-sm transition-transform duration-300 ${
              mobileMenuOpen
                ? "bg-black translate-y-[6.5px] rotate-45"
                : "bg-white"
            }`}
          />
          <span
            className={`w-[18px] h-[1.5px] rounded-sm transition-opacity duration-200 ${
              mobileMenuOpen ? "opacity-0" : "bg-white"
            }`}
          />
          <span
            className={`w-[18px] h-[1.5px] rounded-sm transition-transform duration-300 ${
              mobileMenuOpen
                ? "bg-black -translate-y-[6.5px] -rotate-45"
                : "bg-white"
            }`}
          />
        </button>
      </div>

      {/* Mobile Drawer Rendered into document.body to completely escape ancestor transforms */}
      {mounted && mobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col justify-start items-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
          />

          {/* Centered Dark Glass Drawer Card */}
          <div className="relative w-full max-w-sm mt-16 bg-[#0f1219]/95 border border-white/20 text-white rounded-3xl p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl animate-slide-up z-10 space-y-5">
            {/* Header with Title and Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <img src="/deepscout-logo.jpg" alt="DeepScout" className="w-6 h-6 rounded-full object-cover border border-cyan-500/30" />
                <span className="font-semibold text-sm tracking-tight text-white">DeepScout Navigation</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col space-y-1">
              {[
                { label: "Home", action: () => { onReset?.(); window.scrollTo({ top: 0, behavior: "smooth" }); } },
                { label: "Architecture", action: () => scrollToSection("architecture") },
                { label: "Capabilities", action: () => scrollToSection("features") },
                { label: "Comparison", action: () => scrollToSection("comparison") },
                { label: "FAQ", action: () => scrollToSection("faq") },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    item.action();
                  }}
                  className="w-full text-left font-medium text-[15px] text-zinc-300 hover:text-white hover:bg-white/5 py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <span className="text-zinc-600 text-xs">→</span>
                </button>
              ))}
            </nav>

            {/* Bottom Launch Research CTA */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onLaunchResearch) onLaunchResearch();
                else onReset?.();
              }}
              className="w-full h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-[14px] flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Launch Research Assistant</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
