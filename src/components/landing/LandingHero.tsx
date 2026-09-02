"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  // Animated Stats
  const [stat1, setStat1] = useState("0");
  const [stat2, setStat2] = useState("0");
  const [stat3, setStat3] = useState("0");
  const [stat4, setStat4] = useState("0");

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

    animateValue(5, 0, 1200, 300, setStat1);
    animateValue(5, 0, 1400, 450, setStat2);
    animateValue(3, 0, 1600, 600, setStat3);
    animateValue(100, 0, 1800, 750, setStat4);
  }, []);

  const handleCtaClick = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 75,
        origin: { y: 0.75 },
        colors: ["#ffffff", "#60a5fa", "#3b82f6", "#38bdf8"],
      });
    } catch (e) {
      // Ignore
    }
    onGetStarted();
  };

  return (
    <section className="relative z-10 flex flex-col justify-between items-center w-full min-h-[calc(100vh-90px)] px-4 sm:px-6 py-10 text-center">
      {/* Center Hero Content */}
      <div className="flex flex-col items-center justify-center max-w-[940px] w-full my-auto">
        {/* Trust Pill */}
        <div
          className="anim inline-flex items-center mb-6 sm:mb-8"
          style={{ ["--d" as any]: "0.05s" }}
        >
          <div className="max-w-[calc(100vw-32px)] h-[38px] sm:h-[42px] bg-[#181a22]/90 border border-white/30 rounded-full flex items-center px-3.5 sm:px-4 z-[3] shadow-lg space-x-2 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-sans font-medium text-[#e2e8f0] text-[11.5px] xs:text-[12.5px] sm:text-[13.5px] truncate">
              Autonomous Multi-Agent Web Research Engine
            </span>
          </div>
        </div>

        {/* 2-Line Retro Dot-Matrix Headline */}
        <h1 className="headline-font anim text-white text-[32px] xs:text-[40px] sm:text-[64px] md:text-[82px] lg:text-[90px] font-normal leading-[1.08] tracking-[-0.03em] sm:tracking-[-0.04em] select-none break-words max-w-full">
          <span
            className="block opacity-0 animate-[headlineFade_0.85s_cubic-bezier(0.22,1,0.36,1)_forwards]"
            style={{ animationDelay: "0.12s" }}
          >
            Autonomous Research
          </span>
          <span
            className="block opacity-0 animate-[headlineFade_0.85s_cubic-bezier(0.22,1,0.36,1)_forwards]"
            style={{ animationDelay: "0.3s" }}
          >
            Engineered For Truth
          </span>
        </h1>

        {/* Tailored Subhead */}
        <p
          className="anim text-[#d0d0d0] opacity-85 text-[15px] sm:text-[18px] md:text-[20px] max-w-[620px] leading-relaxed mt-4 sm:mt-5 font-normal"
          style={{ ["--d" as any]: "0.28s" }}
        >
          Give it any topic. Three autonomous AI agents search the live web, extract 5 verified sources, synthesize cross-domain findings, and compile publication-grade reports with verifiable citations.
        </p>

        {/* ONLY Get Started CTA Button */}
        <div
          className="anim mt-8 sm:mt-10"
          style={{ ["--d" as any]: "0.4s" }}
        >
          <button
            type="button"
            onClick={handleCtaClick}
            className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-4.5 bg-white hover:bg-slate-100 text-black font-semibold text-[15px] sm:text-[16.5px] rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-[0_0_45px_rgba(255,255,255,0.65)] active:scale-95 space-x-2.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* 4 Stats Footer Tailored to Personal Research Assistant */}
      <footer
        className="anim grid grid-cols-2 sm:grid-cols-4 max-w-[920px] w-full gap-4 sm:gap-8 pt-6 mt-10 shrink-0 border-t border-white/10"
        style={{ ["--d" as any]: "0.48s" }}
      >
        {/* Stat 1 */}
        <div className="flex flex-col items-center">
          <div className="headline-font text-[24px] sm:text-[32px] text-white leading-none mb-1">
            &lt;
          </div>
          <div className="font-sans text-[20px] sm:text-[26px] font-semibold text-white tracking-[-0.025em] tabular-nums">
            <span>{stat1}</span>
            <span>s</span>
          </div>
          <div className="font-sans text-[11.5px] sm:text-[12.5px] text-[#8e8e8e] mt-0.5">
            Web Grounding Latency
          </div>
        </div>

        {/* Stat 2 */}
        <div className="flex flex-col items-center">
          <div className="headline-font text-[24px] sm:text-[32px] text-white leading-none mb-1">
            5
          </div>
          <div className="font-sans text-[20px] sm:text-[26px] font-semibold text-white tracking-[-0.025em] tabular-nums">
            <span>{stat2}</span>
            <span> Articles</span>
          </div>
          <div className="font-sans text-[11.5px] sm:text-[12.5px] text-[#8e8e8e] mt-0.5">
            Verified Source Depth
          </div>
        </div>

        {/* Stat 3 */}
        <div className="flex flex-col items-center">
          <div className="headline-font text-[24px] sm:text-[32px] text-white leading-none mb-1">
            3
          </div>
          <div className="font-sans text-[20px] sm:text-[26px] font-semibold text-white tracking-[-0.025em] tabular-nums">
            <span>{stat3}</span>
            <span> Agents</span>
          </div>
          <div className="font-sans text-[11.5px] sm:text-[12.5px] text-[#8e8e8e] mt-0.5">
            Autonomous Pipeline
          </div>
        </div>

        {/* Stat 4 */}
        <div className="flex flex-col items-center">
          <div className="headline-font text-[24px] sm:text-[32px] text-white leading-none mb-1">
            100
          </div>
          <div className="font-sans text-[20px] sm:text-[26px] font-semibold text-white tracking-[-0.025em] tabular-nums">
            <span>{stat4}</span>
            <span>%</span>
          </div>
          <div className="font-sans text-[11.5px] sm:text-[12.5px] text-[#8e8e8e] mt-0.5">
            Citation Traceability
          </div>
        </div>
      </footer>
    </section>
  );
};
