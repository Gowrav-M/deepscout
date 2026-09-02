"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";

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

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 animate-fade-in"
          />
          <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[400px] bg-white text-black rounded-[28px] p-6 shadow-2xl z-50 animate-slide-up text-center">
            <nav className="flex flex-col gap-3 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onReset?.();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="font-medium text-[16px] text-black py-2"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("architecture")}
                className="font-medium text-[16px] text-[#2e2e2e]/70 hover:text-black py-2"
              >
                Architecture
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("features")}
                className="font-medium text-[16px] text-[#2e2e2e]/70 hover:text-black py-2"
              >
                Capabilities
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("comparison")}
                className="font-medium text-[16px] text-[#2e2e2e]/70 hover:text-black py-2"
              >
                Comparison
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("faq")}
                className="font-medium text-[16px] text-[#2e2e2e]/70 hover:text-black py-2"
              >
                FAQ
              </button>
            </nav>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onLaunchResearch) onLaunchResearch();
                else onReset?.();
              }}
              className="w-full h-12 rounded-full bg-[#28282a] text-white font-medium text-[15px] flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Launch Research Assistant</span>
            </button>
          </div>
        </>
      )}
    </header>
  );
};
