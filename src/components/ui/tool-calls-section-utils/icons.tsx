"use client";

import React from "react";
import { ChevronDown, Wrench } from "lucide-react";

export const ArrowDown01Icon = ChevronDown;
export const ToolsIcon = Wrench;

interface HugeiconsIconProps {
  icon: React.ElementType;
  size?: number;
  className?: string;
}

export const HugeiconsIcon: React.FC<HugeiconsIconProps> = ({
  icon: Icon,
  size = 18,
  className = "",
}) => {
  return <Icon size={size} className={className} />;
};
