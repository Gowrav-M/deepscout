"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Table as TableIcon, Download, Sparkles } from "lucide-react";

export interface ChartDataPayload {
  type: "bar" | "line" | "area" | "pie";
  title: string;
  description?: string;
  xKey: string;
  yKey: string;
  unit?: string;
  data: Array<Record<string, any>>;
}

interface ChartRendererProps {
  payload: ChartDataPayload;
}

const COLORS = [
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#ec4899", // pink
];

// Custom Dark Glow Tooltip
const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#12141c]/95 border border-white/20 px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-mono text-zinc-400 mb-1">{label}</p>
        <p className="text-sm font-semibold text-cyan-400">
          {payload[0].value?.toLocaleString()} {unit || ""}
        </p>
      </div>
    );
  }
  return null;
};

export const ChartRenderer: React.FC<ChartRendererProps> = React.memo(({ payload }) => {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [chartType, setChartType] = useState<"bar" | "line" | "area" | "pie">(payload.type || "bar");

  if (!payload || !payload.data || payload.data.length === 0) {
    return null;
  }

  const { title, description, xKey, yKey, unit, data } = payload;

  return (
    <div className="my-5 rounded-2xl bg-[#0f121a]/95 border border-white/15 p-3.5 sm:p-5 backdrop-blur-2xl shadow-2xl space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-semibold text-zinc-100 tracking-tight">
              {title}
            </h4>
          </div>
          {description && (
            <p className="text-xs text-zinc-400 mt-1 pl-7">{description}</p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1 sm:space-x-1.5 self-start sm:self-auto bg-zinc-900/90 border border-white/10 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => {
              setViewMode("chart");
              setChartType("bar");
            }}
            className={`px-2 py-1 rounded-lg transition-all flex items-center space-x-1 ${
              viewMode === "chart" && chartType === "bar"
                ? "bg-cyan-500/20 text-cyan-300 font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Bar</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode("chart");
              setChartType("area");
            }}
            className={`px-2 py-1 rounded-lg transition-all flex items-center space-x-1 ${
              viewMode === "chart" && chartType === "area"
                ? "bg-cyan-500/20 text-cyan-300 font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="Area Chart"
          >
            <LineIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Area</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode("chart");
              setChartType("pie");
            }}
            className={`px-2 py-1 rounded-lg transition-all flex items-center space-x-1 ${
              viewMode === "chart" && chartType === "pie"
                ? "bg-cyan-500/20 text-cyan-300 font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="Pie Chart"
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Pie</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`px-2 py-1 rounded-lg transition-all flex items-center space-x-1 ${
              viewMode === "table"
                ? "bg-cyan-500/20 text-cyan-300 font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="Data Table"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Table</span>
          </button>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="w-full h-[260px] sm:h-[300px] pt-2">
        {viewMode === "chart" ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                <XAxis
                  dataKey={xKey}
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#ffffff20" }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#ffffff20" }}
                />
                <Tooltip content={<CustomTooltip unit={unit} />} />
                <Bar
                  dataKey={yKey}
                  fill="url(#cyanBarGrad)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            ) : chartType === "area" ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                <XAxis
                  dataKey={xKey}
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#ffffff20" }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#ffffff20" }}
                />
                <Tooltip content={<CustomTooltip unit={unit} />} />
                <Area
                  type="monotone"
                  dataKey={yKey}
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#areaGrad)"
                />
              </AreaChart>
            ) : chartType === "line" ? (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                <XAxis
                  dataKey={xKey}
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#ffffff20" }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#ffffff20" }}
                />
                <Tooltip content={<CustomTooltip unit={unit} />} />
                <Line
                  type="monotone"
                  dataKey={yKey}
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ fill: "#0284c7", r: 4, strokeWidth: 2, stroke: "#ffffff" }}
                  activeDot={{ r: 6, fill: "#38bdf8" }}
                />
              </LineChart>
            ) : (
              <PieChart>
                <Tooltip content={<CustomTooltip unit={unit} />} />
                <Pie
                  data={data}
                  dataKey={yKey}
                  nameKey={xKey}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#0f121a"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            )}
          </ResponsiveContainer>
        ) : (
          /* High-Fidelity Data Table */
          <div className="h-full overflow-y-auto overflow-x-auto rounded-xl border border-white/10 bg-black/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-zinc-400 font-mono sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3 capitalize">{xKey}</th>
                  <th className="p-3 capitalize text-right">{yKey} {unit ? `(${unit})` : ""}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono text-zinc-500">{i + 1}</td>
                    <td className="p-3 font-medium text-white">{row[xKey]}</td>
                    <td className="p-3 text-right font-mono text-cyan-400">
                      {typeof row[yKey] === "number" ? row[yKey].toLocaleString() : row[yKey]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-white/5">
        <span className="flex items-center space-x-1.5 text-zinc-400">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Interactive Synthesis Canvas</span>
        </span>
        <span>{data.length} data points synthesized</span>
      </div>
    </div>
  );
});

ChartRenderer.displayName = "ChartRenderer";
