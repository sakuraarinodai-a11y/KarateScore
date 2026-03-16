"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ContestantPanel } from "./ContestantPanel"
import { MatchTimer } from "./MatchTimer"
import { Button } from "@/components/ui/button"
import { RefreshCw, LayoutDashboard, AlertTriangle, Timer, Minus, Plus, Maximize, Minimize, Hash } from "lucide-react"
import { cn } from "@/lib/utils"

export function Scoreboard() {
  // 試合状態
  const [akaScore, setAkaScore] = useState(0)
  const [aoScore, setAoScore] = useState(0)
  const [akaFouls, setAkaFouls] = useState(0)
  const [aoFouls, setAoFouls] = useState(0)
  const [akaSenshu, setAkaSenshu] = useState(false)
  const [aoSenshu, setAoSenshu] = useState(false)
  const [akaName, setAkaName] = useState("AKA")
  const [aoName, setAoName] = useState("AO")
  const [round, setRound] = useState(1)
  const [maxRounds, setMaxRounds] = useState(1)
  const [baseMatchMs, setBaseMatchMs] = useState(90 * 1000)
  const [intervalMs, setIntervalMs] = useState(7 * 1000)
  const [timerMs, setTimerMs] = useState(90 * 1000)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [isInterval, setIsInterval] = useState(false)
  const [timingMode, setTimingMode] = useState<"full" | "nagashi">("full")
  const [isListening, setIsListening] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // 参照管理
  const recognitionRef = useRef<any>(null)
  const isListeningRef = useRef(isListening)
  const isTimerActiveRef = useRef(isTimerActive)
  const prevIsActiveRef = useRef(false)
  const commandCooldownRef = useRef(false)
  const lastTickRef = useRef<number | null>(null)
  const atoshirakuTriggeredRef = useRef(false)
  const timerMsRef = useRef(timerMs)
  const audioCtxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    isListeningRef.current = isListening;
    isTimerActiveRef.current = isTimerActive;
    timerMsRef.current = timerMs;
  }, [isListening, isTimerActive, timerMs]);

  useEffect(() => {
    const handleFS = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFS);
    return () => document.removeEventListener('fullscreenchange', handleFS);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const playSound = useCallback((type: 'start' | 'stop' | 'finish' | 'warning') => {
    if (typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const playB = (d: number, v = 0.3, f = 180) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square'; 
        o.frequency.setValueAtTime(f, ctx.currentTime);
        g.gain.setValueAtTime(v, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + d);
        o.connect(g); 
        g.connect(ctx.destination);
        o.start(); 
        o.stop(ctx.currentTime + d);
      };

      if (type === 'start') playB(0.6, 0.4, 200);
      else if (type === 'finish') playB(1.5, 0.5, 150);
      else if (type === 'stop' || type === 'warning') playB(0.3, 0.2, 800);
    } catch (e) {}
  }, []);

  useEffect(() => {
    let frameId: number;
    const tick = (now: number) => {
      if (!lastTickRef.current) lastTickRef.current = now;
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      setTimerMs((prev) => {
        const next = Math.max(0, prev - delta);
        if (!isInterval && next <= 15000 && next > 0 && !atoshirakuTriggeredRef.current) {
          atoshirakuTriggeredRef.current = true;
          playSound('warning');
        }
        if (next === 0 && prev > 0) {
          setIsTimerActive(false);
          if (!isInterval) playSound('finish');
          return 0;
        }
        return next;
      });
      if (isTimerActiveRef.current) frameId = requestAnimationFrame(tick);
    };
    if (isTimerActive && timerMs > 0) {
      lastTickRef.current = performance.now();
      frameId = requestAnimationFrame(tick);
    } else {
      lastTickRef.current = null;
    }
    return () => { if (frameId) cancelAnimationFrame(frameId); };
  }, [isTimerActive, playSound, isInterval]);

  useEffect(() => {
    if (isTimerActive && !prevIsActiveRef.current) {
      if (timerMs > 0 && !isInterval) playSound('start');
    } else if (!isTimerActive && prevIsActiveRef.current && timerMs > 0) {
      playSound('stop');
    }
    prevIsActiveRef.current = isTimerActive;
  }, [isTimerActive, timerMs, playSound, isInterval]);

  useEffect(() => {
    if (timerMs === 0 && !isTimerActive && timingMode === "nagashi") {
      if (!isInterval && round < maxRounds) {
        setTimeout(() => { 
          setTimerMs(intervalMs); 
          setIsInterval(true); 
          setIsTimerActive(true); 
        }, 1000); 
      } else if (isInterval) {
        // 次のラウンド（試合）開始時に状態をリセット
        setRound((prev) => Math.min(maxRounds, prev + 1));
        setTimerMs(baseMatchMs); 
        setIsInterval(false); 
        setIsTimerActive(true);
        atoshirakuTriggeredRef.current = false;
        
        // 得点・反則・先取をリセット
        setAkaScore(0);
        setAoScore(0);
        setAkaFouls(0);
        setAoFouls(0);
        setAkaSenshu(false);
        setAoSenshu(false);
      }
    }
  }, [timerMs, isTimerActive, timingMode, isInterval, round, maxRounds, intervalMs, baseMatchMs]);

  const handleAddScore = useCallback((side: "aka" | "ao", points: number) => {
    if (side === "aka") setAkaScore(prev => prev + points);
    else setAoScore(prev => prev + points);
  }, []);

  const addFoul = useCallback((side: "aka" | "ao") => {
    const isAtoshiraku = !isInterval && timerMsRef.current <= 15000 && timerMsRef.current > 0;
    const setter = side === "aka" ? setAkaFouls : setAoFouls;
    setter(prev => {
      const next = isAtoshiraku && prev < 4 ? 4 : Math.min(5, prev + 1);
      if (next === 5) setIsTimerActive(false);
      return next;
    });
  }, [isInterval]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const startRec = () => {
      if (!isListeningRef.current) return;
      try { 
        recognitionRef.current.start(); 
      } catch (e) {}
    };

    if (!recognitionRef.current) {
      const rec = new SpeechRecognition();
      rec.lang = 'ja-JP'; 
      rec.continuous = true; 
      rec.interimResults = true;
      
      rec.onresult = (event: any) => {
        if (commandCooldownRef.current) return;
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        const text = transcript.trim().toLowerCase();
        if (!text) return;

        const stopKeywords = ['やめ', 'まて', '止めて', '待って', 'マテ', 'ヤメ', 'stop', 'wait', 'あめ', 'ゆめ'];
        const startKeywords = ['はじめ', '始め', 'ハジメ', 'スタート', 'start', 'あじめ'];

        if (stopKeywords.some(w => text.includes(w)) && isTimerActiveRef.current) {
          setIsTimerActive(false);
          commandCooldownRef.current = true;
          setTimeout(() => { commandCooldownRef.current = false; }, 200);
          return;
        }
        if (startKeywords.some(w => text.includes(w)) && !isTimerActiveRef.current) {
          setIsTimerActive(true);
          commandCooldownRef.current = true;
          setTimeout(() => { commandCooldownRef.current = false; }, 200);
          return;
        }

        const isAka = ['赤', 'あか', 'アカ', 'aka'].some(w => text.includes(w));
        const isAo = ['青', 'あお', 'アオ', 'ao'].some(w => text.includes(w));

        if (isAka) {
          if (['有効', 'ゆうこう'].some(w => text.includes(w))) handleAddScore("aka", 1);
          else if (['技あり', 'わざあり'].some(w => text.includes(w))) handleAddScore("aka", 2);
          else if (['一本', 'いっぽん'].some(w => text.includes(w))) handleAddScore("aka", 3);
          else if (['反則', '注意', 'はんそく'].some(w => text.includes(w))) addFoul("aka");
          commandCooldownRef.current = true;
          setTimeout(() => { commandCooldownRef.current = false; }, 500);
        } else if (isAo) {
          if (['有効', 'ゆうこう'].some(w => text.includes(w))) handleAddScore("ao", 1);
          else if (['技あり', 'わざあり'].some(w => text.includes(w))) handleAddScore("ao", 2);
          else if (['一本', 'いっぽん'].some(w => text.includes(w))) handleAddScore("ao", 3);
          else if (['反則', '注意', 'はんそく'].some(w => text.includes(w))) addFoul("ao");
          commandCooldownRef.current = true;
          setTimeout(() => { commandCooldownRef.current = false; }, 500);
        }
      };

      rec.onend = () => { if (isListeningRef.current) setTimeout(startRec, 50); };
      rec.onerror = (e: any) => { 
        if (isListeningRef.current) {
          if (e.error !== 'no-speech') setTimeout(startRec, 200); 
        }
      };
      recognitionRef.current = rec;
    }

    if (isListening) startRec();
    else try { recognitionRef.current.stop(); } catch (e) {}

    return () => { if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (e) {} };
  }, [isListening, addFoul, handleAddScore]);

  const handleResetMatch = useCallback(() => {
    setAkaScore(0); setAoScore(0); setAkaFouls(0); setAoFouls(0);
    setAkaSenshu(false); setAoSenshu(false);
    setRound(1); setTimerMs(baseMatchMs); setIsTimerActive(false); setIsInterval(false);
    atoshirakuTriggeredRef.current = false;
  }, [baseMatchMs]);

  const akaIsWinner = (akaFouls < 5 && aoFouls >= 5) || (akaFouls < 5 && aoFouls < 5 && timerMs === 0 && !isInterval && (akaScore > aoScore || (akaScore === aoScore && akaSenshu)));
  const aoIsWinner = (aoFouls < 5 && akaFouls >= 5) || (aoFouls < 5 && akaFouls < 5 && timerMs === 0 && !isInterval && (aoScore > akaScore || (aoScore === akaScore && aoSenshu)));

  return (
    <div className={cn(
      "h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden touch-none transition-colors duration-500 p-1",
      isTimerActive ? (isInterval ? "bg-amber-950/95" : "bg-green-950/95") : "bg-red-950/95"
    )}>
      <div className="w-full flex flex-col h-full max-w-[1400px] gap-1">
        {/* ヘッダー (最小限) */}
        <div className="flex justify-between items-center px-1 shrink-0 h-5">
          <div className="flex items-center gap-1.5">
            <LayoutDashboard className="w-3 h-3 text-accent" />
            <h1 className="text-[10px] font-black uppercase italic text-white/70 tracking-widest">Kumite Score</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleToggleFullscreen} className="h-5 w-5 p-0 text-white/50">
              {isFullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleResetMatch} className="h-5 w-5 p-0 text-white/50">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* スコアボード・グリッド */}
        <div className={cn(
          "grid gap-1 flex-1 min-h-0",
          "grid-cols-1 grid-rows-[auto_1fr_1fr]",
          "landscape:grid-cols-[1fr_380px_1fr] landscape:grid-rows-1"
        )}>
          {/* センターカラム: タイマー & 設定 (縦画面では高さを抑える) */}
          <div className="order-1 landscape:order-2 flex flex-col gap-1 justify-center min-h-0 py-1 landscape:py-0">
            <MatchTimer
              ms={timerMs} isActive={isTimerActive} round={round}
              onToggle={() => {
                if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
                setIsTimerActive(!isTimerActive);
              }}
              onReset={() => { 
                setTimerMs(baseMatchMs); 
                setIsInterval(false); 
                atoshirakuTriggeredRef.current = false; 
              }}
              onNextRound={() => { 
                setRound(r => Math.min(maxRounds, r + 1)); 
                setTimerMs(baseMatchMs); 
                atoshirakuTriggeredRef.current = false; 
              }}
              onAdjustTime={(ms) => setTimerMs(p => Math.max(0, p + ms))}
              timingMode={timingMode} onTimingModeChange={setTimingMode}
              isListening={isListening} onToggleVoice={() => setIsListening(!isListening)}
            />
            
            {/* 設定パネル - 縦画面では最小化 */}
            <div className="bg-black/70 p-1 landscape:p-3 rounded-xl border border-white/10 flex flex-col gap-1 shrink-0">
              <div className="grid grid-cols-3 gap-1">
                {[60, 90, 180].map(s => (
                  <Button 
                    key={s} 
                    variant={baseMatchMs === s * 1000 ? "default" : "outline"} 
                    className={cn(
                      "h-8 landscape:h-14 text-[10px] landscape:text-lg font-black rounded-lg",
                      baseMatchMs === s * 1000 ? "bg-accent border-accent text-white" : "bg-white/5 border-white/10 text-white/50"
                    )}
                    onClick={() => { 
                      setBaseMatchMs(s * 1000); 
                      if (!isTimerActive) setTimerMs(s * 1000); 
                    }}
                  >
                    {s}s
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-1">
                <div className="flex items-center justify-between bg-black/50 rounded-lg p-1 border border-white/5 h-8 landscape:h-16">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40" onClick={() => setIntervalMs(Math.max(1000, intervalMs - 1000))}>
                    <Minus className="w-3 h-3" />
                  </Button>
                  <div className="flex flex-col items-center">
                    <Timer className="w-2.5 h-2.5 landscape:w-3 landscape:h-3 text-accent" />
                    <span className="text-[8px] landscape:text-sm font-black text-white">{Math.floor(intervalMs / 1000)}s</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40" onClick={() => setIntervalMs(intervalMs + 1000)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                <div className="flex items-center justify-between bg-black/50 rounded-lg p-1 border border-white/5 h-8 landscape:h-16">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40" onClick={() => setMaxRounds(prev => Math.max(1, prev - 1))}>
                    <Minus className="w-3 h-3" />
                  </Button>
                  <div className="flex flex-col items-center">
                    <Hash className="w-2.5 h-2.5 landscape:w-3 landscape:h-3 text-accent" />
                    <span className="text-[8px] landscape:text-sm font-black text-white">{maxRounds}R</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40" onClick={() => setMaxRounds(prev => Math.min(5, prev + 1))}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* AKA (左/上) */}
          <div className="order-2 landscape:order-1 h-full min-h-0 overflow-hidden">
            <ContestantPanel
              side="aka" name={akaName} onNameChange={setAkaName}
              score={akaScore} fouls={akaFouls} hasSenshu={akaSenshu}
              onAddScore={(p) => handleAddScore("aka", p)}
              onSubtractScore={(p) => setAkaScore(Math.max(0, akaScore - p))}
              onAddFoul={() => addFoul("aka")}
              onRemoveFoul={() => setAkaFouls(Math.max(0, akaFouls - 1))}
              onToggleSenshu={() => { 
                setAkaSenshu(!akaSenshu); 
                if (!akaSenshu) setAoSenshu(false); 
              }}
              isWinner={akaIsWinner} isDisqualified={akaFouls >= 5}
            />
          </div>

          {/* AO (右/下) */}
          <div className="order-3 landscape:order-3 h-full min-h-0 overflow-hidden">
            <ContestantPanel
              side="ao" name={aoName} onNameChange={setAoName}
              score={aoScore} fouls={aoFouls} hasSenshu={aoSenshu}
              onAddScore={(p) => handleAddScore("ao", p)}
              onSubtractScore={(p) => setAoScore(Math.max(0, aoScore - p))}
              onAddFoul={() => addFoul("ao")}
              onRemoveFoul={() => setAoFouls(Math.max(0, aoFouls - 1))}
              onToggleSenshu={() => { 
                setAoSenshu(!aoSenshu); 
                if (!aoSenshu) setAkaSenshu(false); 
              }}
              isWinner={aoIsWinner} isDisqualified={aoFouls >= 5}
            />
          </div>
        </div>

        {/* あとしばらくアラート (極小) */}
        {timerMs <= 15000 && timerMs > 0 && !isInterval && (
          <div className="bg-red-600 animate-pulse text-white text-center h-4 flex items-center justify-center gap-2 rounded text-[8px] landscape:text-[10px] font-black uppercase shrink-0 border border-red-400">
            <AlertTriangle className="w-3 h-3" /> あとしばらく ATOSHIRAKU
          </div>
        )}
      </div>
    </div>
  )
}
