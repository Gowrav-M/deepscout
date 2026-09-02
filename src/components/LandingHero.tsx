"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Search, Sparkles, Compass } from "lucide-react";

interface LandingHeroProps {
  onStartResearch: (topic: string) => void;
  isLoading: boolean;
}

const EXAMPLE_TOPICS = [
  "Future of EV in India",
  "Impact of AI on healthcare",
  "Future of renewable energy",
  "India's space economy",
  "Impact of 5G technology",
];

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartResearch,
  isLoading,
}) => {
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Stats counting animation
  const [stat1, setStat1] = useState("0");
  const [stat2, setStat2] = useState("0.00");
  const [stat3, setStat3] = useState("0");
  const [stat4, setStat4] = useState("0.0");

  useEffect(() => {
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animateValue = (
      target: number,
      decimals: number,
      duration: number,
      delay: number,
      setter: (v: string) => void
    ) => {
      setTimeout(() => {
        const startTime = performance.now();
        const update = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const current = easeOutCubic(progress) * target;
          setter(current.toFixed(decimals));
          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            setter(target.toFixed(decimals));
          }
        };
        requestAnimationFrame(update);
      }, delay);
    };

    animateValue(120, 0, 1500, 480, setStat1);
    animateValue(99.99, 2, 1580, 570, setStat2);
    animateValue(24, 0, 1660, 660, setStat3);
    animateValue(2.4, 1, 1740, 750, setStat4);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) {
      setError("Please enter a research topic to begin.");
      return;
    }
    if (trimmed.length < 3) {
      setError("Topic must be at least 3 characters.");
      return;
    }
    if (trimmed.length > 300) {
      setError("Topic must be under 300 characters.");
      return;
    }
    setError(null);
    onStartResearch(trimmed);
  };

  const handleSelectChip = (chip: string) => {
    setTopic(chip);
    setError(null);
  };

  return (
    <div className="relative z-10 flex flex-col justify-between items-center w-full min-h-[calc(100vh-80px)] px-4 sm:px-6 py-6 text-center">
      {/* Center Hero */}
      <div className="flex flex-col items-center justify-center max-w-[900px] w-full my-auto">
        {/* Trust Row */}
        <div
          className="anim inline-flex items-center mb-5 sm:mb-6"
          style={{ ["--d" as any]: "0.05s" }}
        >
          {/* Avatar stack */}
          <div className="inline-flex items-center">
            {/* Microsoft */}
            <div className="w-[38px] sm:w-[42px] h-[38px] sm:h-[42px] rounded-full bg-[#28282a] border border-white/40 p-[5px] flex items-center justify-center relative z-[1] transition-transform hover:-translate-y-0.5 duration-300">
              <div className="w-full height-full rounded-full bg-white flex items-center justify-center text-[#111] text-[14px]">
                <i className="fa-brands fa-microsoft"></i>
              </div>
            </div>
            {/* Amazon */}
            <div className="w-[38px] sm:w-[42px] h-[38px] sm:h-[42px] rounded-full bg-[#28282a] border border-white/40 p-[5px] flex items-center justify-center relative z-[2] -ml-[16px] transition-transform hover:-translate-y-1 duration-300">
              <div className="w-full height-full rounded-full bg-white flex items-center justify-center text-[#111] text-[14px]">
                <i className="fa-brands fa-amazon"></i>
              </div>
            </div>
            {/* Google */}
            <div className="w-[38px] sm:w-[42px] h-[38px] sm:h-[42px] rounded-full bg-[#28282a] border border-white/40 p-[5px] flex items-center justify-center relative z-[4] -ml-[16px] transition-transform hover:-translate-y-0.5 duration-300">
              <div className="w-full height-full rounded-full bg-white flex items-center justify-center text-[#111] text-[14px]">
                <i className="fa-brands fa-google"></i>
              </div>
            </div>
          </div>

          {/* Trust Pill */}
          <div className="h-[38px] sm:h-[42px] bg-[#28282a] border border-white/40 rounded-full flex items-center -ml-[16px] pl-[24px] pr-4 z-[3]">
            <span className="font-sans font-medium text-[#c4c2c3] text-[12.5px] sm:text-[13.5px] whitespace-nowrap">
              Trusted by 2000+ Enterprises
            </span>
          </div>
        </div>

        {/* 2-Line Retro Dot-Matrix Headline */}
        <h1 className="headline-font anim text-white text-[32px] sm:text-[56px] md:text-[72px] lg:text-[80px] font-normal leading-[1.08] tracking-[-0.04em] sm:tracking-[-0.04em] whitespace-nowrap select-none">
          <span
            className="block opacity-0 animate-[headlineFade_0.85s_cubic-bezier(0.22,1,0.36,1)_forwards]"
            style={{ animationDelay: "0.12s" }}
          >
            Intelligence
          </span>
          <span
            className="block opacity-0 animate-[headlineFade_0.85s_cubic-bezier(0.22,1,0.36,1)_forwards]"
            style={{ animationDelay: "0.3s" }}
          >
            Designed To Evolve
          </span>
        </h1>

        {/* Subhead */}
        <p
          className="anim text-[#d0d0d0] opacity-80 text-[15px] sm:text-[17px] md:text-[18.5px] max-w-[540px] leading-relaxed mt-3 sm:mt-4 font-normal"
          style={{ ["--d" as any]: "0.28s" }}
        >
          Build applications that reason, adapt and collaborate using a modular
          AI platform designed for production.
        </p>

        {/* Search Input Box */}
        <div
          className="anim w-full max-w-[620px] mt-6 sm:mt-7"
          style={{ ["--d" as any]: "0.36s" }}
        >
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute inset-0 bg-white/10 rounded-full blur-xl transition-all group-hover:bg-white/20 opacity-60 pointer-events-none" />
            <div className="relative flex items-center bg-[#18181b]/90 border border-white/25 hover:border-white/40 focus-within:border-white/70 rounded-full p-1.5 shadow-2xl backdrop-blur-md transition-all">
              <div className="flex items-center flex-1 px-3.5">
                <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isLoading}
                  placeholder="Enter research topic (e.g., Future of EV in India)..."
                  className="w-full bg-transparent text-white placeholder-slate-400 text-[14px] sm:text-[15.5px] focus:outline-none"
                  maxLength={300}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white hover:bg-slate-100 text-black font-semibold text-[13.5px] sm:text-[14.5px] rounded-full transition-all flex items-center space-x-1.5 shrink-0 shadow-[0_0_22px_rgba(255,255,255,0.32)] hover:shadow-[0_0_28px_rgba(255,255,255,0.5)] active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Investigating...</span>
                  </>
                ) : (
                  <>
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-left text-rose-400 text-xs mt-2 px-4 font-medium">
                {error}
              </p>
            )}
          </form>

          {/* Suggested Topic Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {EXAMPLE_TOPICS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSelectChip(chip)}
                className="text-[11.5px] text-slate-300 bg-[#28282a]/70 hover:bg-[#343438] hover:text-white border border-white/20 px-3 py-1 rounded-full transition-all flex items-center space-x-1 backdrop-blur-sm"
              >
                <Compass className="w-3 h-3 text-slate-400" />
                <span>{chip}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Stats Footer */}
      <footer
        className="anim grid grid-cols-2 sm:grid-cols-4 max-w-[920px] w-full gap-4 sm:gap-8 pt-4 mt-8 shrink-0"
        style={{ ["--d" as any]: "0.45s" }}
      >
        {/* Stat 1 */}
        <div className="flex flex-col items-center">
          <div className="headline-font text-[24px] sm:text-[30px] text-white leading-none mb-1">
            &lt;
          </div>
          <div className="font-sans text-[20px] sm:text-[24px] font-semibold text-white tracking-[-0.025em] tabular-nums">
            <span>{stat1}</span>
            <span>ms</span>
          </div>
          <div className="font-sans text-[11.5px] sm:text-[12.5px] text-[#8e8e8e] mt-0.5">
            Inference Time
          </div>
        </div>

        {/* Stat 2 */}
        <div className="flex flex-col items-center">
          <div className="headline-font text-[24px] sm:text-[30px] text-white leading-none mb-1">
            %
          </div>
          <div className="font-sans text-[20px] sm:text-[24px] font-semibold text-white tracking-[-0.025em] tabular-nums">
            <span>{stat2}</span>
            <span>%</span>
          </div>
          <div className="font-sans text-[11.5px] sm:text-[12.5px] text-[#8e8e8e] mt-0.5">
            Platform Uptime
          </div>
        </div>

        {/* Stat 3 */}
        <div className="flex flex-col items-center">
          <div className="headline-font text-[24px] sm:text-[30px] text-white leading-none mb-1">
            *
          </div>
          <div className="font-sans text-[20px] sm:text-[24px] font-semibold text-white tracking-[-0.025em] tabular-nums">
            <span>{stat3}</span>
            <span>/7</span>
          </div>
          <div className="font-sans text-[11.5px] sm:text-[12.5px] text-[#8e8e8e] mt-0.5">
            Autonomous Runtime
          </div>
        </div>

        {/* Stat 4 */}
        <div className="flex flex-col items-center">
          <div className="headline-font text-[24px] sm:text-[30px] text-white leading-none mb-1">
            #
          </div>
          <div className="font-sans text-[20px] sm:text-[24px] font-semibold text-white tracking-[-0.025em] tabular-nums">
            <span>{stat4}</span>
            <span>M</span>
          </div>
          <div className="font-sans text-[11.5px] sm:text-[12.5px] text-[#8e8e8e] mt-0.5">
            Context Windows
          </div>
        </div>
      </footer>
    </div>
  );
};
