"use client"

import { Play, Pause, RotateCcw, SkipForward, Mic, MicOff, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MatchTimerProps {
  ms: number;
  isActive: boolean;
  round: number;
  onToggle: () => void;
  onReset: () => void;
  onNextRound: () => void;
  onAdjustTime: (ms: number) => void;
  timingMode: "full" | "nagashi";
  onTimingModeChange: (mode: "full" | "nagashi") => void;
  isListening: boolean;
  onToggleVoice: () => void;
}

export function MatchTimer({ 
  ms, 
  isActive, 
  round, 
  onToggle, 
  onReset, 
  onNextRound, 
  onAdjustTime,
  timingMode,
  onTimingModeChange,
  isListening,
  onToggleVoice
}: MatchTimerProps) {
  const formatTime = (totalMs: number) => {
    const mins = Math.floor(totalMs / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const centis = Math.floor((totalMs % 1000) / 10);
    return (
      <div className="flex items-baseline justify-center w-full font-black">
        <span>{mins}:{secs.toString().padStart(2, '0')}</span>
        <span className="text-xl opacity-40 ml-1">.{centis.toString().padStart(2, '0')}</span>
      </div>
    );
  };

  const isAtoshiraku = ms <= 15000 && ms > 0;

  return (
    <div className={cn(
      "flex flex-col items-center gap-1 p-2 w-full rounded-2xl border transition-all duration-300 bg-black/40 backdrop-blur-md",
      isActive ? (isAtoshiraku ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "border-green-500/50") : "border-white/10"
    )}>
      <div className="flex justify-between w-full items-center px-1">
        <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/5">
          <Button
            variant={timingMode === "full" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-7 px-2 text-[10px] font-black uppercase rounded-md",
              timingMode === "full" ? "bg-accent text-white" : "text-white/40"
            )}
            onClick={() => onTimingModeChange("full")}
          >
            フルタイム
          </Button>
          <Button
            variant={timingMode === "nagashi" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-7 px-2 text-[10px] font-black uppercase rounded-md",
              timingMode === "nagashi" ? "bg-accent text-white" : "text-white/40"
            )}
            onClick={() => onTimingModeChange("nagashi")}
          >
            ながし
          </Button>
        </div>

        <div className="text-xs font-black text-white uppercase bg-white/10 px-3 py-1 rounded-full border border-white/20">
          R{round}
        </div>

        <Button
          variant={isListening ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-9 w-9 rounded-full p-0 shrink-0",
            isListening ? "animate-pulse bg-accent border-accent text-white" : "bg-white/5 border-white/10"
          )}
          onClick={onToggleVoice}
        >
          {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 opacity-50" />}
        </Button>
      </div>

      <div className="flex items-center justify-center w-full gap-4 py-1">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 text-white/30 hover:text-white"
          onClick={() => onAdjustTime(-10000)}
        >
          <Minus className="w-6 h-6" />
          <span className="sr-only">-10s</span>
        </Button>
        
        <div className={cn(
          "timer-display text-7xl font-black leading-none tracking-tighter tabular-nums",
          isAtoshiraku ? "text-red-500" : isActive ? "text-green-400" : "text-white"
        )}>
          {formatTime(ms)}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 text-white/30 hover:text-white"
          onClick={() => onAdjustTime(10000)}
        >
          <Plus className="w-6 h-6" />
          <span className="sr-only">+10s</span>
        </Button>
      </div>

      <div className="flex gap-4 justify-center w-full mt-1">
        <Button
          size="sm"
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center p-0 transition-all border-2 active:scale-90 shadow-xl",
            !isActive ? "bg-green-600 border-green-400 text-white" : "bg-red-600 border-red-400 text-white"
          )}
          onClick={onToggle}
        >
          {isActive ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
        </Button>
        <Button
          size="sm"
          className="w-14 h-14 rounded-full bg-white/5 border border-white/20 text-muted-foreground active:scale-90"
          onClick={onReset}
        >
          <RotateCcw className="w-6 h-6" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="w-14 h-14 rounded-full flex items-center justify-center p-0 text-muted-foreground/30 active:scale-90"
          onClick={onNextRound}
        >
          <SkipForward className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
