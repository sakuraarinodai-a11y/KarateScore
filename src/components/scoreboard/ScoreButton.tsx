
"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ScoreButtonProps {
  label: string;
  points: number;
  onClick: () => void;
  colorClass: string;
  disabled?: boolean;
}

export function ScoreButton({ label, points, onClick, colorClass, disabled }: ScoreButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col h-auto transition-all active:scale-95 shadow-md",
        colorClass
      )}
    >
      <span className="text-[7px] md:text-xs font-bold uppercase tracking-tight opacity-80">{label}</span>
      <span className="text-sm md:text-lg font-black leading-none">+{points}</span>
    </Button>
  );
}
