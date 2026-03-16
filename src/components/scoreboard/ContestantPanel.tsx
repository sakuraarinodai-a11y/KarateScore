"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { ScoreButton } from "./ScoreButton"
import { cn } from "@/lib/utils"
import { AlertCircle, Circle, Zap, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContestantPanelProps {
  side: "aka" | "ao";
  score: number;
  fouls: number;
  hasSenshu: boolean;
  onAddScore: (points: number) => void;
  onSubtractScore: (points: number) => void;
  onAddFoul: () => void;
  onRemoveFoul: () => void;
  onToggleSenshu: () => void;
  name: string;
  onNameChange: (name: string) => void;
  isWinner?: boolean;
  isDisqualified?: boolean;
}

export function ContestantPanel({ 
  side, 
  score, 
  fouls,
  hasSenshu,
  onAddScore, 
  onSubtractScore,
  onAddFoul,
  onRemoveFoul,
  onToggleSenshu,
  name, 
  onNameChange, 
  isWinner,
  isDisqualified 
}: ContestantPanelProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (score > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 200);
      return () => clearTimeout(timer);
    }
  }, [score]);

  const bgColor = side === "aka" ? "bg-red-700/20" : "bg-blue-700/20";
  const borderColor = side === "aka" ? "border-red-500/40" : "border-blue-500/40";
  const textColor = side === "aka" ? "text-red-500" : "text-blue-400";
  const btnColor = side === "aka" ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500";
  
  return (
    <div className={cn(
      "flex flex-col p-2 rounded-xl border-2 transition-all duration-300 relative overflow-hidden h-full",
      bgColor,
      borderColor,
      isWinner && "ring-4 ring-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)] z-10",
      isDisqualified && "grayscale opacity-80"
    )}>
      {isDisqualified && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 gap-3 backdrop-blur-md">
          <span className="text-xl landscape:text-2xl font-black uppercase tracking-tighter border-2 border-red-500 p-2 bg-black/60 text-red-500 text-center shadow-xl">
            反則負け<br/>HANSOKU
          </span>
          <Button variant="outline" onClick={onRemoveFoul} size="sm" className="bg-white/10">判定取消</Button>
        </div>
      )}

      <div className="flex flex-col h-full gap-2">
        {/* 上段: 名前 & 先取 (高さ固定) */}
        <div className="grid grid-cols-2 landscape:grid-cols-1 gap-1 shrink-0">
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="bg-black/40 border-white/10 text-[10px] landscape:text-xs font-black h-7 landscape:h-8 text-center uppercase rounded-lg"
            placeholder={side.toUpperCase()}
          />
          <Button
            variant="ghost"
            onClick={onToggleSenshu}
            className={cn(
              "h-7 landscape:h-12 rounded-lg transition-all flex items-center justify-center gap-2 border",
              hasSenshu 
                ? "bg-yellow-500 text-black border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.6)]" 
                : "bg-white/5 text-muted-foreground/20 border-white/5"
            )}
          >
            <Zap className={cn("w-3 h-3 landscape:w-5 landscape:h-5", hasSenshu && "fill-current")} />
            <span className="text-[8px] landscape:text-xs font-black uppercase tracking-widest">先取 SENSHU</span>
          </Button>
        </div>

        {/* 中段: スコア表示 (可変、中央寄せ) */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="flex items-center gap-2 landscape:gap-4">
            <span className={cn(
              "score-number text-6xl landscape:text-9xl font-black leading-none tabular-nums transition-transform duration-200",
              pulse ? "scale-110 text-white" : textColor
            )}>
              {score}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSubtractScore(1)}
              disabled={score === 0}
              className="w-8 h-8 landscape:w-10 landscape:h-10 rounded-full bg-white/5 border-white/10 shrink-0"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 下段: 反則表示 & ボタン (高さ固定/下寄せ) */}
        <div className="flex flex-col gap-2 shrink-0">
          {/* 反則表示ユニット */}
          <div className="flex items-center justify-between w-full gap-1 bg-black/40 px-2 py-1.5 rounded-lg border border-white/5">
            <span className="text-[10px] landscape:text-xs font-black text-red-500 shrink-0">反則</span>
            <div className="flex gap-1 flex-1 justify-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <Circle 
                  key={i} 
                  className={cn(
                    "w-3 h-3 landscape:w-5 landscape:h-5",
                    fouls >= i ? "fill-red-500 text-red-500" : "text-white/5"
                  )} 
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveFoul}
              disabled={fouls === 0}
              className="h-6 px-2 text-[8px] landscape:text-[10px] text-white/40 hover:text-white bg-white/5 shrink-0"
            >
              取消
            </Button>
          </div>

          {/* スコア追加ボタン */}
          <div className="grid grid-cols-3 gap-1">
            <ScoreButton label="有効" points={1} onClick={() => onAddScore(1)} colorClass={cn(btnColor, "h-10 landscape:h-16 rounded-lg")} disabled={isDisqualified} />
            <ScoreButton label="技あり" points={2} onClick={() => onAddScore(2)} colorClass={cn(btnColor, "h-10 landscape:h-16 rounded-lg")} disabled={isDisqualified} />
            <ScoreButton label="一本" points={3} onClick={() => onAddScore(3)} colorClass={cn(btnColor, "h-10 landscape:h-16 rounded-lg")} disabled={isDisqualified} />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddFoul}
            disabled={isDisqualified || fouls >= 5}
            className="w-full bg-red-600/30 border-red-500/50 text-red-400 font-black h-8 landscape:h-14 rounded-lg"
          >
            <AlertCircle className="w-3 h-3 landscape:w-5 landscape:h-5 mr-1" /> 反則追加
          </Button>
        </div>
      </div>
    </div>
  );
}
