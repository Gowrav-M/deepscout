"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import {
  HugeiconsIcon,
  ArrowDown01Icon,
  ToolsIcon,
} from "@/components/ui/tool-calls-section-utils/icons";
import { cn } from "@/lib/utils";
import {
  formatToolName,
  getToolCategoryIcon,
} from "@/components/ui/tool-calls-section-utils/tool-icons";
import { CompactMarkdown } from "@/components/ui/tool-calls-section-utils/compact-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Copy, Check, Sparkles, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export interface ToolCallEntry {
  /** Name of the tool that was called */
  tool_name: string;
  /** Category/integration the tool belongs to (e.g., "gmail", "search", "memory") */
  tool_category: string;
  /** Human-readable message describing what the tool did */
  message?: string;
  /** Whether to show the category label (default: true) */
  show_category?: boolean;
  /** Unique ID for this tool call */
  tool_call_id?: string;
  /** Input parameters passed to the tool */
  inputs?: Record<string, unknown>;
  /** Output/result from the tool */
  output?: string;
  /** URL to custom icon for integrations */
  icon_url?: string;
  /** Friendly name for the integration (e.g., "Linear", "Slack") */
  integration_name?: string;
  /** Execution status */
  status?: "pending" | "running" | "completed";
}

export interface IntegrationInfo {
  iconUrl?: string;
  name?: string;
}

export interface ToolCallsSectionProps {
  /** Array of tool call entries to display */
  toolCalls: ToolCallEntry[];
  /** Optional map of integration IDs to their info for icon/name lookup */
  integrations?: Map<string, IntegrationInfo>;
  /** Maximum number of icons to show in the stacked display (default: 10) */
  maxIconsToShow?: number;
  /** Whether to start with the accordion expanded (default: false) */
  defaultExpanded?: boolean;
  /** Custom class name for the container */
  className?: string;
  /** Custom icon size (default: 21) */
  iconSize?: number;
  /** Custom icon renderer override */
  renderIcon?: (call: ToolCallEntry, size: number) => ReactNode;
  /** Custom content renderer override for inputs/outputs */
  renderContent?: (content: unknown) => ReactNode;
}

// ============================================================================
// Helper Components
// ============================================================================

interface ChevronIconProps {
  isExpanded: boolean;
  size?: number;
  className?: string;
}

function ChevronIcon({
  isExpanded,
  size = 18,
  className = "",
}: ChevronIconProps) {
  return (
    <HugeiconsIcon
      icon={ArrowDown01Icon}
      size={size}
      className={cn(
        "transition-transform duration-200",
        isExpanded && "rotate-180",
        className,
      )}
    />
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ToolCallsSection({
  toolCalls,
  integrations,
  maxIconsToShow = 10,
  defaultExpanded = true,
  className,
  iconSize = 20,
  renderIcon,
  renderContent,
}: ToolCallsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedCalls, setExpandedCalls] = useState<Set<number>>(new Set([0]));
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Lookup map for custom integrations
  const integrationLookup = useMemo(() => {
    if (integrations) return integrations;
    return new Map<string, IntegrationInfo>();
  }, [integrations]);

  const getIconUrl = (call: ToolCallEntry): string | undefined => {
    if (call.icon_url) return call.icon_url;
    const integration = integrationLookup.get(call.tool_category);
    return integration?.iconUrl;
  };

  const getIntegrationName = (call: ToolCallEntry): string | undefined => {
    if (call.integration_name) return call.integration_name;
    const integration = integrationLookup.get(call.tool_category);
    return integration?.name;
  };

  const toggleCallExpansion = (index: number) => {
    setExpandedCalls((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const copyPayload = (index: number, content: any) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!toolCalls || toolCalls.length === 0) return null;

  // Default icon renderer
  const defaultRenderIcon = (call: ToolCallEntry, size: number) => {
    const icon = getToolCategoryIcon(
      call.tool_category || "general",
      { width: size, height: size },
      getIconUrl(call),
    );
    return (
      icon || (
        <div className="p-1 min-w-8 min-h-8 bg-zinc-800 rounded-lg text-zinc-400 backdrop-blur">
          <HugeiconsIcon icon={ToolsIcon} size={size} />
        </div>
      )
    );
  };

  const iconRenderer = renderIcon || defaultRenderIcon;

  const defaultRenderContent = (content: unknown) => (
    <CompactMarkdown content={content} />
  );

  const contentRenderer = renderContent || defaultRenderContent;

  // Render stacked rotated icons
  const renderStackedIcons = () => {
    const seenCategories = new Set<string>();
    const uniqueIcons = toolCalls.filter((call) => {
      const category = call.tool_category || "general";
      if (seenCategories.has(category)) return false;
      seenCategories.add(category);
      return true;
    });
    const displayIcons = uniqueIcons.slice(0, maxIconsToShow);

    return (
      <div className="flex min-h-8 items-center -space-x-2">
        {displayIcons.map((call, index) => (
          <motion.div
            key={`${call.tool_name}-${index}`}
            whileHover={{ scale: 1.25, rotate: 0, zIndex: 50 }}
            className="relative flex min-w-8 items-center justify-center transition-all cursor-pointer"
            style={{
              rotate:
                displayIcons.length > 1
                  ? index % 2 === 0
                    ? "8deg"
                    : "-8deg"
                  : "0deg",
              zIndex: index,
            }}
          >
            {iconRenderer(call, iconSize)}
          </motion.div>
        ))}
        {uniqueIcons.length > maxIconsToShow && (
          <div className="z-0 flex size-7 min-h-7 min-w-7 items-center justify-center rounded-lg bg-zinc-800 text-xs text-zinc-400 font-normal">
            +{uniqueIcons.length - maxIconsToShow}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("w-full bg-gradient-to-b from-[#10131d] to-[#0a0c12] border border-white/15 rounded-2xl p-4 backdrop-blur-2xl shadow-2xl relative overflow-hidden", className)}>
      {/* Laser Scanning Accent Beam */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />

      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full hover:text-white text-zinc-400 cursor-pointer py-1 group"
      >
        <div className="flex items-center gap-3">
          {renderStackedIcons()}
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-all flex items-center space-x-1.5">
              <span>Executed {toolCalls.length} autonomous tool{toolCalls.length > 1 ? "s" : ""}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE
              </span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Deterministic Multi-Agent Execution Conduit
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 group-hover:border-white/15 transition-all">
          <span>{isExpanded ? "Collapse logs" : "Inspect tool calls"}</span>
          <ChevronIcon isExpanded={isExpanded} />
        </div>
      </button>

      {/* Expanded Tools Timeline with Animated Traveling Energy Beam */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mt-3 pt-3 border-t border-white/10"
          >
            <div className="space-y-4">
              {toolCalls.map((call, index) => {
                const hasDetails = call.inputs || call.output;
                const isCallExpanded = expandedCalls.has(index);
                const isLast = index === toolCalls.length - 1;

                return (
                  <motion.div
                    key={`${call.tool_name}-step-${index}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.15,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="flex items-stretch gap-3.5 group/call"
                  >
                    {/* Animated Vertical Icon Column with Traveling Laser Energy Line */}
                    <div className="flex flex-col items-center self-stretch relative min-w-9">
                      {/* Icon Container with Glowing Pulse Badge */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="relative z-10 min-h-9 min-w-9 rounded-xl bg-[#141824] border border-cyan-500/40 shadow-lg shadow-cyan-500/10 flex items-center justify-center shrink-0"
                      >
                        {iconRenderer(call, iconSize)}

                        {/* Completed Checkmark Corner Pill */}
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-black rounded-full flex items-center justify-center shadow-md">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      </motion.div>

                      {/* Animated Connector Line that draws/flows down to the next node */}
                      {!isLast && (
                        <div className="relative w-0.5 flex-1 min-h-8 my-1 overflow-hidden bg-zinc-800 rounded-full">
                          {/* Animated Gradient Line flowing downwards */}
                          <motion.div
                            initial={{ scaleY: 0, originY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{
                              duration: 0.8,
                              delay: index * 0.2 + 0.1,
                              ease: "easeInOut",
                            }}
                            className="w-full h-full bg-gradient-to-b from-cyan-400 via-blue-500 to-emerald-400 origin-top shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                          />

                          {/* Traveling Light Pulse Particle flowing down the line */}
                          <motion.div
                            animate={{ y: ["-100%", "200%"] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.8,
                              delay: index * 0.3,
                              ease: "linear",
                            }}
                            className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_10px_#38bdf8]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Tool Details Card */}
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.15 + 0.05,
                      }}
                      className="flex-1 min-w-0 bg-black/40 border border-white/10 hover:border-cyan-500/30 p-3.5 rounded-2xl transition-all shadow-md group-hover/call:bg-black/60"
                    >
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          className={cn(
                            "flex items-center gap-1.5 text-left",
                            hasDetails ? "cursor-pointer" : "",
                          )}
                          onClick={() => hasDetails && toggleCallExpansion(index)}
                        >
                          <p className="text-xs text-zinc-200 font-semibold group-hover/call:text-white flex items-center space-x-1.5">
                            <span>{call.message || formatToolName(call.tool_name)}</span>
                          </p>
                          {hasDetails && (
                            <ChevronIcon isExpanded={isCallExpanded} size={14} className="text-zinc-400 ml-1" />
                          )}
                        </button>

                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-500/30">
                          {getIntegrationName(call) || call.tool_category}
                        </span>
                      </div>

                      {/* Expandable JSON Inputs & Output Payloads */}
                      {isCallExpanded && hasDetails && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 space-y-2.5 text-[11px] bg-[#07090e] border border-white/10 rounded-xl p-3.5 font-mono shadow-inner"
                        >
                          {call.inputs && Object.keys(call.inputs).length > 0 && (
                            <div>
                              <div className="flex items-center justify-between text-zinc-400 font-bold mb-1">
                                <span className="flex items-center space-x-1 text-zinc-300">
                                  <Terminal className="w-3 h-3 text-cyan-400" />
                                  <span>Parameters Ingested</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyPayload(index, call.inputs)}
                                  className="text-[10px] text-zinc-400 hover:text-white flex items-center space-x-1 px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5"
                                >
                                  {copiedIndex === index ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  <span>{copiedIndex === index ? "Copied" : "Copy JSON"}</span>
                                </button>
                              </div>
                              {contentRenderer(call.inputs)}
                            </div>
                          )}

                          {call.output && (
                            <div className="pt-2 border-t border-white/5">
                              <span className="text-zinc-400 font-bold block mb-1">
                                Returned Execution Result
                              </span>
                              {contentRenderer(call.output)}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ToolCallsSection;
