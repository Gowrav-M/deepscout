"use client";

import React from "react";

interface CompactMarkdownProps {
  content: unknown;
}

export const CompactMarkdown: React.FC<CompactMarkdownProps> = ({ content }) => {
  if (content === null || content === undefined) {
    return <span className="text-zinc-500 italic">None</span>;
  }

  if (typeof content === "object") {
    return (
      <pre className="text-[11px] font-mono bg-zinc-900/80 text-zinc-300 p-2 rounded-lg overflow-x-auto max-w-full leading-relaxed border border-zinc-800">
        {JSON.stringify(content, null, 2)}
      </pre>
    );
  }

  const strContent = String(content);

  return (
    <div className="text-[11.5px] text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap break-words">
      {strContent}
    </div>
  );
};
