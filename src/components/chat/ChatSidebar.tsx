"use client";

import React from "react";
import {
  Plus,
  Compass,
  History,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  Search,
  BookMarked,
  Layers,
  MessageSquare,
} from "lucide-react";

export interface ResearchSession {
  id: string;
  topic: string;
  timestamp: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewResearch: () => void;
  onSelectTopic: (topic: string) => void;
  activeTopic?: string;
}

const RECENT_INVESTIGATIONS: ResearchSession[] = [
  { id: "1", topic: "Future of EV in India", timestamp: "Today" },
  { id: "2", topic: "Impact of AI on healthcare", timestamp: "Yesterday" },
  { id: "3", topic: "Future of renewable energy", timestamp: "2 days ago" },
  { id: "4", topic: "India's space economy", timestamp: "3 days ago" },
  { id: "5", topic: "Impact of 5G technology", timestamp: "Last week" },
];

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onToggle,
  onNewResearch,
  onSelectTopic,
  activeTopic,
}) => {
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="fixed top-3.5 left-3.5 z-50 p-2 rounded-xl bg-[#12141c] hover:bg-[#1a1d28] text-zinc-400 hover:text-white border border-white/15 transition-all shadow-xl backdrop-blur-md"
        aria-label="Open sidebar"
      >
        <PanelLeft className="w-4 h-4" />
      </button>
    );
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        onClick={onToggle}
        className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
      />

      {/* Sidebar Container */}
      <aside className="fixed md:static inset-y-0 left-0 z-50 w-[260px] h-full bg-[#090a0f] border-r border-white/10 flex flex-col justify-between select-none flex-shrink-0">
        {/* Top Header & New Research CTA */}
        <div className="p-3.5 space-y-3 flex-1 flex flex-col overflow-hidden">
          {/* Brand header */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg overflow-hidden shadow-md">
                <img src="/deepscout-logo.jpg" alt="DeepScout" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white text-xs tracking-tight leading-none">
                  DeepScout
                </span>
                <span className="text-[10px] text-zinc-500 font-mono leading-tight mt-0.5">
                  Autonomous Multi-Agent
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggle}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Research Button */}
          <button
            type="button"
            onClick={() => {
              onNewResearch();
              if (typeof window !== "undefined" && window.innerWidth < 768) onToggle();
            }}
            className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-white/30 text-xs font-semibold transition-all shadow-sm active:scale-98 group"
          >
            <Plus className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span>New Research Topic</span>
          </button>

          {/* Recent Investigations List */}
          <div className="flex-1 overflow-y-auto space-y-1 pt-3 pr-1">
            <div className="px-2 pb-1.5 flex items-center text-[10.5px] font-mono text-zinc-500 uppercase tracking-wider">
              <History className="w-3 h-3 mr-1.5" />
              <span>Recent Investigations</span>
            </div>

            <div className="space-y-0.5">
              {RECENT_INVESTIGATIONS.map((session) => {
                const isActive = activeTopic === session.topic;
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => {
                      onSelectTopic(session.topic);
                      if (typeof window !== "undefined" && window.innerWidth < 768) onToggle();
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-left transition-all group ${
                      isActive
                        ? "bg-white/10 text-white font-medium border border-white/15"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-500 shrink-0 group-hover:text-zinc-300" />
                    <span className="truncate flex-1">{session.topic}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Demo Account Pill */}
        <div className="p-3 border-t border-white/10 bg-[#06070a]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-md shrink-0">
                D
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-zinc-200 leading-tight">
                  Demo
                </div>
                <div className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Autonomous Workspace</span>
                </div>
              </div>
            </div>

            <div className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-zinc-300 border border-white/10">
              Demo
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
