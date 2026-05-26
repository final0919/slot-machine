import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameSymbol, PrizeType } from '../types';
import { SLOT_SYMBOLS } from '../data';
import SlotSymbolDisplay from './SlotSymbolDisplay';
import { 
  X, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Gift, 
  Trophy, 
  Sparkles, 
  Activity, 
  Unlock, 
  Lock,
  ArrowRight,
  Info 
} from 'lucide-react';

interface SlotMachineViewProps {
  targetSymbol: GameSymbol;
  onBackToHome: () => void;
  onPlayAgain: () => void;
}

export default function SlotMachineView({ targetSymbol, onBackToHome, onPlayAgain }: SlotMachineViewProps) {
  // Intro zoom sequence state
  const [zoomPhase, setZoomPhase] = useState<'FAR' | 'ZOOMING' | 'CLOSE'>('FAR');

  useEffect(() => {
    // Stage 1: FAR -> Showing full cabinet
    // Stage 2: ZOOMING -> Moving close dynamically
    const t1 = setTimeout(() => {
      setZoomPhase('ZOOMING');
    }, 100);

    const t2 = setTimeout(() => {
      setZoomPhase('CLOSE');
    }, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Game phases
  const [spinning, setSpinning] = useState(false);
  const [spinResults, setSpinResults] = useState<GameSymbol[] | null>(null);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [prizeEarned, setPrizeEarned] = useState<PrizeType | null>(null);

  // Core modification pools for the three reels
  const [reelPools, setReelPools] = useState<string[][]>([
    SLOT_SYMBOLS.map(s => s.id),
    SLOT_SYMBOLS.map(s => s.id),
    SLOT_SYMBOLS.map(s => s.id),
  ]);

  // Track button activation states
  const [button1Done, setButton1Done] = useState(false);
  const [button2Done, setButton2Done] = useState(false);
  const [button3Used, setButton3Used] = useState(false);
  const [forfeitedGrandPrize, setForfeitedGrandPrize] = useState(false);

  // Cap states (保护盖)
  const [btn2CapOpen, setBtn2CapOpen] = useState(false);
  const [btn3CapOpen, setBtn3CapOpen] = useState(false);

  // Modals state
  const [modalType, setModalType] = useState<'NONE' | 'BTN1' | 'BTN2' | 'BTN3_CONFIRM' | 'BTN3_PLAY' | 'RULES'>('NONE');
  
  // Selection track for Button 1 (Deletes symbols from 2 selected boxes)
  const [btn1SelectedBoxes, setBtn1SelectedBoxes] = useState<number[]>([]); 
  const [btn1Deletions, setBtn1Deletions] = useState<string[]>([]); 

  // Button 2 (Blind selection for remaining box)
  const [remainingBoxIdx, setRemainingBoxIdx] = useState<number>(2); 
  const [blindChosenIndices, setBlindChosenIndices] = useState<number[]>([]); 
  const [blindShuffledMapping, setBlindShuffledMapping] = useState<number[]>([]); 
  
  // Current display symbols on reels
  const [reelDisplays, setReelDisplays] = useState<(GameSymbol | null)[]>([null, null, null]);
  const [individualSpinning, setIndividualSpinning] = useState<boolean[]>([false, false, false]);

  // Triggering the cap open transitions
  useEffect(() => {
    if (button1Done) {
      const timer = setTimeout(() => {
        setBtn2CapOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [button1Done]);

  useEffect(() => {
    if (button2Done) {
      const timer = setTimeout(() => {
        setBtn3CapOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [button2Done]);

  // Shuffle blind mapped cards for Button 2
  useEffect(() => {
    if (modalType === 'BTN2') {
      const arr = Array.from({ length: 10 }, (_, i) => i);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setBlindShuffledMapping(arr);
    }
  }, [modalType]);

  // Mode status text helper
  const getSubTitleText = () => {
    if (!button1Done) return '步骤 1：操作按钮一，重塑任意两框轮盘，剔除冗余干扰，提升中签几率。';
    if (!button2Done) return '步骤 2：警报解除，操作盖板二！在最末那框中做出命运黑盒瞎选。';
    if (!button3Used && !button2Done) return '步骤 3 特权：需在末框黑卡盲选处理完毕后方能翻盖召唤。';
    if (button2Done && !button3Used) return '步骤 3：盖板三已开！可支付不连终极大奖代价开启窥视重选；或坚信意志直接拉下手柄开盘！';
    return '推演重构完毕，拉动右侧纯铜摇杆进行宿命验证！';
  };

  // Button 1 submit handler
  const handleBtn1Submit = () => {
    if (btn1SelectedBoxes.length !== 2) return;
    
    const updatedPools = [...reelPools];
    btn1SelectedBoxes.forEach(boxIdx => {
      updatedPools[boxIdx] = updatedPools[boxIdx].filter(id => !btn1Deletions.includes(id));
    });

    setReelPools(updatedPools);
    setButton1Done(true);
    setModalType('NONE');
  };

  // Find remaining box
  const determineRemainingBox = (chosenBoxes: number[]) => {
    const all = [0, 1, 2];
    const left = all.filter(idx => !chosenBoxes.includes(idx));
    return left.length > 0 ? left[0] : 2;
  };

  // Button 2 submit handler
  const handleBtn2Submit = () => {
    if (blindChosenIndices.length === 0) return;

    const selectedSymbolIds = blindChosenIndices.map(shuffledIdx => {
      const oIdx = blindShuffledMapping[shuffledIdx];
      return SLOT_SYMBOLS[oIdx].id;
    });

    const targetBox = determineRemainingBox(btn1SelectedBoxes);
    setRemainingBoxIdx(targetBox);

    const updatedPools = [...reelPools];
    updatedPools[targetBox] = selectedSymbolIds;
    setReelPools(updatedPools);

    setButton2Done(true);
    setModalType('NONE');
  };

  // Button 3 support
  const handleBtn3Accept = () => {
    setForfeitedGrandPrize(true);
    setButton3Used(true);
    setModalType('BTN3_PLAY');
  };

  const handleBtn3Submit = (selectedVisualIds: string[]) => {
    if (selectedVisualIds.length === 0) return;

    const targetBox = determineRemainingBox(btn1SelectedBoxes);
    const updatedPools = [...reelPools];
    updatedPools[targetBox] = selectedVisualIds;
    setReelPools(updatedPools);

    setModalType('NONE');
  };

  // Spin sequence trigger
  const spinSlotMachine = () => {
    if (spinning) return;
    setSpinning(true);
    setSpinResults(null);
    setWinMessage(null);
    setPrizeEarned(null);

    setIndividualSpinning([true, true, true]);

    const startTimers = [0, 1, 2].map(idx => {
      return setInterval(() => {
        const pool = reelPools[idx];
        const randomSymbolId = pool[Math.floor(Math.random() * pool.length)];
        const matched = SLOT_SYMBOLS.find(s => s.id === randomSymbolId) || SLOT_SYMBOLS[0];
        setReelDisplays(prev => {
          const next = [...prev];
          next[idx] = matched;
          return next;
        });
      }, 70);
    });

    const stopTimes = [1500, 2400, 3300];
    const finalResults: GameSymbol[] = [];

    stopTimes.forEach((time, idx) => {
      setTimeout(() => {
        clearInterval(startTimers[idx]);
        setIndividualSpinning(prev => {
          const next = [...prev];
          next[idx] = false;
          return next;
        });

        const pool = reelPools[idx];
        const selectedId = pool[Math.floor(Math.random() * pool.length)];
        const finalSymbol = SLOT_SYMBOLS.find(s => s.id === selectedId) || SLOT_SYMBOLS[0];
        
        finalResults[idx] = finalSymbol;
        setReelDisplays(prev => {
          const next = [...prev];
          next[idx] = finalSymbol;
          return next;
        });

        if (idx === 2) {
          evaluateGameResult(finalResults);
        }
      }, time);
    });
  };

  // Game payout evaluation rules
  const evaluateGameResult = (results: GameSymbol[]) => {
    const r1 = results[0].id;
    const r2 = results[1].id;
    const r3 = results[2].id;
    const t = targetSymbol.id;

    let prize: PrizeType = 'NONE';
    let msg = '';

    const countTarget = results.filter(r => r.id === t).length;
    const countReelsIdentical = r1 === r2 && r2 === r3;
    const pairExists = r1 === r2 || r1 === r3 || r2 === r3;

    if (countTarget === 3) {
      if (forfeitedGrandPrize) {
        prize = 'SECOND';
        msg = '你原本摇中了三个极厄契约图案！但在抉择中因开启了天眼窥视权，大奖被削撤，获得了二等奖补偿。🥈';
      } else {
        prize = 'GRAND';
        msg = '太惊人了！三个契约完美命中！你通过非凡的心智博弈赢得了终极神秘大奖！🎉';
      }
    } 
    else if (countTarget === 2) {
      prize = 'SECOND';
      msg = '概率狂澜！摇中了两个核心契约标记，斩获尊贵二等奖！🥈';
    }
    else if (countTarget === 1) {
      prize = 'THIRD';
      msg = '契约共鸣！成功命中一个核心契约标记，荣膺智胜三等奖！🥉';
    }
    else if (countReelsIdentical && r1 !== t) {
      if (forfeitedGrandPrize) {
        prize = 'FOURTH';
        msg = '三连一致（非目标）！但因为开启了明牌契约特权，降档结算，获得了四等奖。';
      } else {
        prize = 'SECOND';
        msg = '虽非完美契约目标，但三个高能图腾归一，荣获极品二等奖！🔮';
      }
    }
    else if (pairExists) {
      prize = 'FOURTH';
      msg = '双星闪耀！虽未击中核心目标，但双图案成组，喜提四等奖保底！💡';
    }
    else {
      prize = 'NONE';
      msg = '判定：未达契约。也许需要在概率齿轮中重新编排、推演下一次生机。';
    }

    setPrizeEarned(prize);
    setWinMessage(msg);
    setSpinResults(results);
    setSpinning(false);
  };

  const getPoolCount = (idx: number) => reelPools[idx].length;

  return (
    <div className="relative min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between items-center py-6 px-4 select-none overflow-x-hidden">
      
      {/* Background glow shadow - warmer and easier on the eyes */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.16] bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.15),rgba(220,38,38,0.1),transparent_60%)]" />

      {/* Top action bar: simple, high contrast, non-cluttered */}
      <div className="w-full max-w-4xl flex items-center justify-between z-20 border-b border-stone-800 pb-3 mb-4">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-850 hover:text-red-400 border border-stone-800 rounded-xl text-xs font-sans tracking-wide transition-all cursor-pointer"
        >
          <X size={14} />
          <span>返回智力首页</span>
        </button>

        <div className="flex items-center gap-1.5 font-mono text-[10px] text-stone-500">
          <Activity size={12} className="text-amber-500 animate-pulse" />
          <span>智力老虎机运算模组 · Slot v3.0</span>
        </div>

        <button
          onClick={() => setModalType('RULES')}
          className="flex items-center gap-1 px-3 py-2 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-900/40 text-amber-400 rounded-xl text-xs cursor-pointer transition-all font-sans"
        >
          <Info size={13} />
          <span>推演典律</span>
        </button>
      </div>

      {/* 3D ZOOM IN TRANSITION CONTAINER FOR IMMERSIVE ARCADE FEEL */}
      <div className="w-full max-w-4xl flex-grow flex items-center justify-center py-2 relative">
        <AnimatePresence mode="wait">
          {zoomPhase === 'FAR' && (
            <motion.div
              key="far-cabinet"
              initial={{ scale: 0.15, y: -200, opacity: 0 }}
              animate={{ scale: 0.65, y: -50, opacity: 0.9 }}
              exit={{ scale: 1.1, y: 150, opacity: 0, filter: 'blur(8px)' }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute flex flex-col items-center justify-center border-4 border-amber-500/20 bg-stone-900/90 rounded-[40px] px-12 py-16 shadow-[0_45px_85px_rgba(0,0,0,0.95)] max-w-md text-center pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-red-500/5 opacity-20 rounded-[40px]" />
              {/* Retro top marquee lights flashing */}
              <div className="w-32 h-6 bg-stone-950 border border-amber-500/30 rounded mb-6 flex items-center justify-center">
                <span className="text-[9px] font-mono tracking-widest text-amber-400 font-bold uppercase animate-pulse">JACKPOT</span>
              </div>
              <div className="text-3xl font-extrabold text-stone-100 uppercase tracking-widest font-sans mb-3">
                INTELLIGENT SLOTS
              </div>
              <p className="text-xs text-stone-400 max-w-xs font-serif leading-relaxed mb-6">
                从远端审视这一台改变人类智商契约的轮盘齿轮机器...
              </p>
              {/* Flashing Neon side boards */}
              <div className="grid grid-cols-3 gap-2 w-full text-center">
                <div className="h-2 bg-red-600 rounded animate-pulse" />
                <div className="h-2 bg-amber-500 rounded animate-pulse delay-100" />
                <div className="h-2 bg-purple-600 rounded animate-pulse delay-200" />
              </div>
            </motion.div>
          )}

          {zoomPhase === 'ZOOMING' && (
            <motion.div
              key="zooming-cabinet shadow"
              initial={{ scale: 0.65, opacity: 0, filter: 'blur(5px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-stone-300 font-mono text-sm tracking-widest animate-pulse"
            >
              - 摄录轨道行进，开始锁定操作台... -
            </motion.div>
          )}

          {zoomPhase === 'CLOSE' && (
            <motion.div
              key="close-machine"
              initial={{ scale: 1.25, opacity: 0, y: 100, filter: 'blur(8px)' }}
              animate={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ type: "spring", stiffness: 85, damping: 15 }}
              className="w-full h-full flex flex-col lg:flex-row gap-6 items-stretch justify-center"
            >
              
              {/* LEFT COLUMN: THE CORE SLOT CABINET */}
              <div className="flex-grow flex flex-col justify-between bg-stone-900 border-2 border-stone-800 rounded-[28px] p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.06)] relative overflow-hidden">
                
                {/* Visual cabinet side guard strips */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-stone-400/20 to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-l from-stone-400/20 to-transparent pointer-events-none" />
                
                {/* HEADER RETRO DISPLAY PANEL */}
                <div className="mb-4 bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner relative">
                  <div className="absolute -top-2.5 left-5 px-2.5 py-0.5 bg-stone-900 border border-stone-800 rounded-full text-[8px] font-mono text-stone-500 tracking-wider">
                    TARGET REEL KEY · 主要寻找之契约图案
                  </div>

                  <div className="flex items-center gap-3">
                    <SlotSymbolDisplay id={targetSymbol.id} size={28} />
                    <div className="text-left">
                      <div className="text-[9px] uppercase font-mono tracking-widest text-stone-500">核心命定追求的目标</div>
                      <div className={`font-extrabold tracking-wider text-sm ${targetSymbol.textColor}`}>
                        {targetSymbol.name}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block text-right bg-stone-900/60 px-3 py-1.5 rounded-lg border border-stone-850 font-mono text-[10px] text-stone-400">
                    <div className="flex justify-between gap-4"><span>卷轴1余池:</span> <span className="font-bold text-stone-200">{getPoolCount(0)}/10</span></div>
                    <div className="flex justify-between gap-4"><span>卷轴2余池:</span> <span className="font-bold text-stone-200">{getPoolCount(1)}/10</span></div>
                    <div className="flex justify-between gap-4"><span>卷轴3余池:</span> <span className="font-bold text-stone-200">{getPoolCount(2)}/10</span></div>
                  </div>

                  {forfeitedGrandPrize && (
                    <div className="absolute right-3 -bottom-2 bg-purple-950/60 border border-purple-800/40 rounded px-2 py-0.5 text-[8px] font-mono text-purple-400">
                      ⚠️ 已窥视明牌：稳等大奖已被削去，仅保底赔付
                    </div>
                  )}
                </div>

                {/* THE REEL GRID CABINET */}
                <div className="bg-stone-950 border-2 border-stone-850 rounded-2xl py-6 px-4 md:px-6 grid grid-cols-3 gap-3 md:gap-4 relative shadow-inner">
                  <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-stone-950/80 to-transparent pointer-events-none z-10" />
                  <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-stone-950/80 to-transparent pointer-events-none z-10" />

                  {[0, 1, 2].map((idx) => {
                    const symbol = reelDisplays[idx];
                    const isSpinningThis = individualSpinning[idx];

                    return (
                      <div 
                        key={idx} 
                        className={`relative flex flex-col justify-center items-center bg-stone-900 border rounded-xl h-36 md:h-44 overflow-hidden transition-all duration-300 ${
                          isSpinningThis 
                            ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.12)] bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950' 
                            : symbol
                              ? 'border-stone-800'
                              : 'border-stone-800/60'
                        }`}
                      >
                        <div className="absolute top-2 left-2 text-[8px] font-mono text-stone-600 scale-90">
                          REEL {idx + 1}
                        </div>

                        {symbol ? (
                          <motion.div
                            key={symbol.id}
                            initial={{ y: -30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 140 }}
                            className="flex flex-col items-center"
                          >
                            <SlotSymbolDisplay id={symbol.id} size={36} />
                            <span className="text-[10px] font-sans font-medium text-stone-400 mt-2.5 tracking-wider max-w-[80px] truncate text-center">
                              {symbol.name}
                            </span>
                          </motion.div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <motion.div
                              animate={{ opacity: [0.35, 0.75, 0.35] }}
                              transition={{ repeat: Infinity, duration: 2.2 }}
                              className="text-2xl md:text-3xl font-mono text-stone-750 font-extrabold"
                            >
                              ?
                            </motion.div>
                            <span className="text-[7px] font-mono text-stone-600 mt-1.5 tracking-wider uppercase">
                              静止等待
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-1.5 right-2 text-[8px] font-mono text-stone-600">
                          N={getPoolCount(idx)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* THE BOTTOM SPECIAL INTERACTION OPERATIONS BAR */}
                <div className="mt-5">
                  <div className="text-[10px] font-mono uppercase text-stone-500 tracking-wider mb-2.5 text-center flex items-center justify-center gap-2">
                    <span className="h-px bg-stone-850 flex-grow" />
                    <span>核心概率修正操控系统</span>
                    <span className="h-px bg-stone-850 flex-grow" />
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 md:gap-3">
                    
                    {/* OPTION 1: RE-MAPPING TWO REELS POOL */}
                    <div className="flex flex-col">
                      <button
                        disabled={button1Done || spinning}
                        onClick={() => setModalType('BTN1')}
                        className={`group relative h-16 bg-stone-950 border rounded-xl overflow-hidden flex flex-col items-center justify-center px-1 py-1 px-1.5 text-center transition-all cursor-pointer ${
                          button1Done
                            ? 'border-emerald-900/30 opacity-40 hover:bg-stone-950'
                            : spinning
                              ? 'border-stone-850 opacity-30 cursor-not-allowed'
                              : 'border-red-900/80 hover:border-red-500/80 hover:bg-stone-900 hover:shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                        }`}
                      >
                        <div className="absolute top-1 right-1">
                          {button1Done ? (
                            <ShieldCheck className="text-emerald-500 h-3 w-3" />
                          ) : (
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                          )}
                        </div>
                        <span className={`text-[8px] font-mono uppercase tracking-wider font-bold ${button1Done ? 'text-emerald-500' : 'text-red-400'}`}>
                          修正机制 I
                        </span>
                        <span className="text-[10px] font-semibold mt-0.5 text-stone-200">
                          重塑两框
                        </span>
                        <span className="text-[7.5px] text-stone-500 scale-90 mt-0.5 truncate max-w-[85px]">
                          剔除无用图谱
                        </span>
                      </button>
                    </div>

                    {/* OPTION 2: THE BLIND CARD MATRIX SETTING */}
                    <div className="flex flex-col relative">
                      <AnimatePresence>
                        {!btn2CapOpen && (
                          <motion.div
                            key="cap2"
                            exit={{ y: -25, rotateX: 90, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-red-950/70 border border-red-700/50 rounded-xl z-20 flex flex-col items-center justify-center text-center backdrop-blur-[1px]"
                          >
                            <Lock className="text-red-400 h-3 w-3 mb-0.5 animate-pulse" />
                            <span className="text-[7px] font-mono text-red-400 uppercase tracking-wider leading-none">
                              特权封闭锁
                            </span>
                            <span className="text-[6.5px] text-red-500 font-mono mt-0.5 leading-none">
                              步骤一实施后放行
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        disabled={button2Done || !btn2CapOpen || spinning}
                        onClick={() => setModalType('BTN2')}
                        className={`group relative h-16 bg-stone-950 border rounded-xl overflow-hidden flex flex-col items-center justify-center px-1.5 text-center transition-all cursor-pointer ${
                          button2Done
                            ? 'border-emerald-900/30 opacity-40 hover:bg-stone-950'
                            : !btn2CapOpen || spinning
                              ? 'border-stone-850 opacity-30 cursor-not-allowed'
                              : 'border-yellow-900/80 hover:border-yellow-500/80 hover:bg-stone-900 hover:shadow-[0_0_12px_rgba(234,179,8,0.25)]'
                        }`}
                      >
                        <div className="absolute top-1 right-1">
                          {button2Done ? (
                            <ShieldCheck className="text-emerald-500 h-3 w-3" />
                          ) : btn2CapOpen ? (
                            <Unlock className="text-yellow-500 h-3 w-3 animate-bounce" />
                          ) : null}
                        </div>
                        <span className={`text-[8px] font-mono uppercase tracking-wider font-bold ${button2Done ? 'text-emerald-500' : 'text-yellow-400'}`}>
                          修正机制 II
                        </span>
                        <span className="text-[10px] font-semibold mt-0.5 text-stone-200">
                          黑盒盲格
                        </span>
                        <span className="text-[7.5px] text-stone-500 scale-90 mt-0.5 truncate max-w-[85px]">
                          敲定最末单轮
                        </span>
                      </button>
                    </div>

                    {/* OPTION 3: THE HIGH RISK Peeping PACT OPTION */}
                    <div className="flex flex-col relative">
                      <AnimatePresence>
                        {!btn3CapOpen && (
                          <motion.div
                            key="cap3"
                            exit={{ y: -25, rotateX: 90, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-red-950/70 border border-red-700/50 rounded-xl z-20 flex flex-col items-center justify-center text-center backdrop-blur-[1px]"
                          >
                            <Lock className="text-red-400 h-3 w-3 mb-0.5 animate-pulse" />
                            <span className="text-[7px] font-mono text-red-400 uppercase tracking-wider leading-none">
                              特权封闭锁
                            </span>
                            <span className="text-[6.5px] text-red-500 font-mono mt-0.5 leading-none">
                              步骤二瞎选后移开
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        disabled={button3Used || !btn3CapOpen || spinning}
                        onClick={() => setModalType('BTN3_CONFIRM')}
                        className={`group relative h-16 bg-stone-950 border rounded-xl overflow-hidden flex flex-col items-center justify-center px-1.5 text-center transition-all cursor-pointer ${
                          button3Used
                            ? 'border-purple-900/30 opacity-40 hover:bg-stone-950'
                            : !btn3CapOpen || spinning
                              ? 'border-stone-850 opacity-30 cursor-not-allowed'
                              : 'border-purple-900/80 hover:border-purple-500/80 hover:bg-stone-900 hover:shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                        }`}
                      >
                        <div className="absolute top-1 right-1">
                          {button3Used ? (
                            <ShieldCheck className="text-purple-400 h-3 w-3" />
                          ) : btn3CapOpen ? (
                            <Unlock className="text-purple-500 h-3 w-3 animate-bounce" />
                          ) : null}
                        </div>
                        <span className={`text-[8px] font-mono uppercase tracking-wider font-bold ${button3Used ? 'text-purple-400' : 'text-purple-300'}`}>
                          修正机制 III
                        </span>
                        <span className="text-[10px] font-semibold mt-0.5 text-stone-200">
                          天机明牌
                        </span>
                        <span className="text-[7.5px] text-stone-500 scale-90 mt-0.5 truncate max-w-[85px]">
                          牺牲终极大奖
                        </span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* VISUAL TUTOR TIP */}
                <div className="mt-4 p-3 bg-stone-950 border border-stone-850 rounded-xl text-xs flex items-start gap-2.5 shadow-inner">
                  <span className="text-sm mt-0.5">💡</span>
                  <div className="text-stone-400 text-left leading-relaxed text-[11px]">
                    <span className="text-amber-500 font-bold font-sans">智力判定指南: </span>
                    {getSubTitleText()}
                  </div>
                </div>

              </div>
              
              {/* RIGHT COLUMN: ACTION LEVER & HISTORY */}
              <div className="w-full lg:w-72 flex flex-col justify-between items-stretch gap-4">
                
                {/* MECHANICAL PULL HANDLE CONTAINER */}
                <div className="bg-stone-900 border-2 border-stone-800 rounded-3xl p-5 flex flex-col items-center justify-center relative min-h-60 shadow-lg select-none">
                  <div className="text-[9px] tracking-widest font-mono text-stone-500 uppercase mb-4 text-center">
                    MANUAL LEVER / 命运摇手柄
                  </div>

                  {/* Leverage physical rig */}
                  <div className="relative w-16 h-36 bg-stone-950 rounded-full border border-stone-850 flex justify-center items-center shadow-inner">
                    <div className="absolute top-3 bottom-3 w-1.5 bg-stone-900 rounded" />

                    <motion.div
                      className="absolute origin-bottom bottom-8 w-2.5 bg-gradient-to-r from-stone-300 via-stone-100 to-stone-400 rounded cursor-pointer z-10"
                      style={{ height: '90px' }}
                      animate={spinning ? {
                        rotateX: [0, 50, -10, 0],
                        y: [0, 20, -3, 0]
                      } : {}}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      onClick={() => {
                        if (!spinning) spinSlotMachine();
                      }}
                    >
                      {/* Lever Red Ball Tip */}
                      <div className="absolute -top-6 -left-2 w-6.5 h-6.5 rounded-full bg-red-600 border border-red-400 hover:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)] cursor-pointer" />
                    </motion.div>

                    <div className="absolute bottom-4 w-8 h-8 rounded-full bg-stone-800 border-2 border-stone-700 shadow-lg" />
                  </div>

                  <button
                    disabled={spinning}
                    onClick={spinSlotMachine}
                    className={`w-full py-3.5 mt-5 rounded-xl font-bold tracking-wider text-xs uppercase cursor-pointer transition-all ${
                      spinning 
                        ? 'bg-stone-950 border border-stone-850 text-stone-600 cursor-not-allowed' 
                        : 'bg-red-950 hover:bg-red-900 border border-red-700/50 text-red-200 shadow-[0_4px_12px_rgba(220,38,38,0.25)] hover:shadow-[0_0_20px_rgba(239,68,68,0.45)]'
                    }`}
                  >
                    {spinning ? '绞碎命运轮盘中...' : '启动命运轴心'}
                  </button>
                </div>

                {/* BOTTOM RETROSPECT LOG */}
                <div className="flex-grow bg-stone-900 border-2 border-stone-800 rounded-3xl p-5 text-left flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-stone-850 pb-1.5">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-stone-500">
                        DECISION RETRO / 结果结算
                      </span>
                      {prizeEarned && (
                        <span className="inline-block animate-ping rounded-full h-1.5 w-1.5 bg-red-400" />
                      )}
                    </div>

                    {!spinResults && !winMessage ? (
                      <div className="h-32 flex flex-col items-center justify-center text-center border border-dashed border-stone-800 rounded-xl p-4 bg-stone-950/40">
                        <span className="text-2xl mb-1 opacity-20">⏳</span>
                        <p className="text-[10px] text-stone-500 font-mono">拉动上方红球手柄检验胜率...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5 font-sans">
                        
                        {/* Winner label */}
                        <div className={`p-3.5 rounded-xl text-center border font-extrabold flex flex-col items-center justify-center gap-1 shadow-md ${
                          prizeEarned === 'GRAND'
                            ? 'bg-amber-950/30 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                            : prizeEarned === 'SECOND'
                              ? 'bg-purple-950/30 border-purple-500 text-purple-300'
                              : prizeEarned === 'THIRD'
                                ? 'bg-red-950/30 border-red-500 text-red-300'
                                : prizeEarned === 'FOURTH'
                                  ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300'
                                  : 'bg-stone-950 border-stone-800 text-stone-400 shadow-inner'
                        }`}>
                          {prizeEarned === 'GRAND' && <Trophy className="h-5 w-5 text-amber-500 animate-bounce" />}
                          {prizeEarned === 'SECOND' && <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />}
                          {prizeEarned === 'THIRD' && <Gift className="h-5 w-5 text-red-400" />}
                          {prizeEarned === 'FOURTH' && <CheckCircleIcon className="h-5 w-5 text-emerald-400" />}
                          
                          <span className="text-[10px] font-mono tracking-widest leading-none">
                            {prizeEarned === 'GRAND' && '★ 宿命极恶·大奖 ★'}
                            {prizeEarned === 'SECOND' && '★★ 归元贯星·二等奖 ★★'}
                            {prizeEarned === 'THIRD' && '★★★ 忠诚守护·三等奖 ★★★'}
                            {prizeEarned === 'FOURTH' && '★★★★ 保底求生·四等奖 ★★★★'}
                            {prizeEarned === 'NONE' && '【 命途未接：未中奖 】'}
                          </span>
                        </div>

                        {/* Text explanation */}
                        <div className="p-3 bg-stone-950/70 rounded-xl border border-stone-850 text-[11px] leading-relaxed text-stone-300 font-serif">
                          {winMessage}
                        </div>

                        {/* Badges outputs */}
                        <div className="flex items-center justify-center gap-2 py-2 px-3 bg-stone-950 rounded-lg border border-stone-850">
                          <span className="text-[9px] font-mono text-stone-500">落盘结果:</span>
                          <div className="flex gap-1.5">
                            {spinResults?.map((res, i) => (
                              <SlotSymbolDisplay key={i} id={res.id} size={18} className="transform scale-90" />
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* REPLAY TRIGGER ACCORDING TO USER REQUIREMENT: DRAW AGAIN */}
                  {(spinResults || winMessage) && (
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-stone-850">
                      <button
                        onClick={onPlayAgain}
                        className="py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 hover:border-amber-600 text-[11px] font-bold font-sans tracking-wide rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <RotateCcw size={12} />
                        <span>再度重新抽牌</span>
                      </button>

                      <button
                        onClick={onBackToHome}
                        className="py-2 bg-stone-950 hover:bg-stone-900 border border-stone-850 text-[11px] font-bold text-stone-400 hover:text-stone-200 rounded-lg flex items-center justify-center cursor-pointer"
                      >
                        <span>返回主页</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* THREE INTERACTIVE MODALS FOR BUTTON COOPERATION ACTIONS */}

      {/* MODAL 1: REDUCE SYMBOLS */}
      {modalType === 'BTN1' && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-stone-900 border border-red-900/40 max-w-lg w-full rounded-2xl p-6 relative shadow-2xl text-stone-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-extrabold text-red-500 font-sans tracking-wide">
                  修正机制一：卷轴冗余剪裁
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  重塑任意两个框的离散区间，从它们的抽件库里剔除最多5个非核心图案。
                </p>
              </div>
              <button 
                onClick={() => setModalType('NONE')}
                className="text-stone-500 hover:text-stone-200 bg-stone-950 p-1.5 rounded-lg text-sm cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* SELECTION BOXES */}
            <div className="mb-4 bg-stone-950 p-3 rounded-xl border border-stone-850 shadow-inner">
              <span className="block text-[10px] font-mono text-red-400/80 mb-2 font-bold select-none uppercase">
                第一阶段：挑选两个进行微调限缩的轴框 (当前已选: {btn1SelectedBoxes.length}/2)
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {[0, 1, 2].map(idx => {
                  const isSelected = btn1SelectedBoxes.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (isSelected) {
                          setBtn1SelectedBoxes(prev => prev.filter(v => v !== idx));
                        } else {
                          if (btn1SelectedBoxes.length < 2) {
                            setBtn1SelectedBoxes(prev => [...prev, idx]);
                          } else {
                            setBtn1SelectedBoxes([btn1SelectedBoxes[1], idx]);
                          }
                        }
                      }}
                      className={`py-2.5 px-2.5 border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-red-500 bg-red-950/20 text-red-200 shadow-md' 
                          : 'border-stone-800 bg-stone-950 hover:border-stone-700 text-stone-450'
                      }`}
                    >
                      <span className="text-xs font-bold font-sans">框框 {idx + 1}</span>
                      <span className="text-[8px] font-mono text-stone-500">
                        池余项: {getPoolCount(idx)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SYMBOLS SELECTOR */}
            <div className="mb-4 bg-stone-950 p-3 rounded-xl border border-stone-850 shadow-inner">
              <span className="block text-[10px] font-mono text-red-400/80 mb-1.5 font-bold select-none uppercase">
                第二阶段：选择被挖除抛弃的图案 (最多选5个)
                <span className="text-yellow-600 block text-[8px] font-sans font-light mt-0.5 lowercase">
                  * 契约目标图案不可被删除
                </span>
              </span>

              <div className="grid grid-cols-5 gap-3 max-h-56 overflow-y-auto pr-1">
                {SLOT_SYMBOLS.map(sym => {
                  const isTarget = sym.id === targetSymbol.id;
                  const isSelected = btn1Deletions.includes(sym.id);

                  return (
                    <button
                      key={sym.id}
                      disabled={isTarget}
                      onClick={() => {
                        if (isSelected) {
                          setBtn1Deletions(prev => prev.filter(v => v !== sym.id));
                        } else {
                          if (btn1Deletions.length < 5) {
                            setBtn1Deletions(prev => [...prev, sym.id]);
                          }
                        }
                      }}
                      className={`p-2.5 border rounded-xl flex flex-col items-center justify-center relative transition-all min-h-[80px] ${
                        isTarget
                          ? 'opacity-25 border-stone-800 bg-stone-950 cursor-not-allowed text-stone-600'
                          : isSelected
                            ? 'border-red-500 bg-red-950/30 text-red-100 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                            : 'border-stone-800 bg-stone-900 hover:border-stone-750'
                      }`}
                    >
                      <SlotSymbolDisplay id={sym.id} size={30} className="scale-100" />
                      <span className="text-[9px] mt-2.5 text-center font-medium w-full truncate text-stone-300 font-sans">{sym.name}</span>
                      {isSelected && (
                        <div className="absolute top-0 right-0 bg-red-600 text-[8.5px] w-4 h-4 flex items-center justify-center rounded-tr-xl rounded-bl font-sans font-bold text-white">✕</div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-2.5 px-0.5 text-[9px] text-stone-500 font-mono">
                <span>过滤进展：{btn1Deletions.length} / 5 项已锁定</span>
                <span className="text-yellow-500">分子微缩，中奖率倍增</span>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setModalType('NONE')}
                className="px-4 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-xs rounded-xl cursor-pointer"
              >
                放弃修改
              </button>
              <button
                disabled={btn1SelectedBoxes.length !== 2 || btn1Deletions.length === 0}
                onClick={handleBtn1Submit}
                className="px-5 py-2 bg-red-950 hover:bg-red-900 border border-red-700/60 disabled:opacity-35 disabled:cursor-not-allowed text-xs font-bold rounded-xl text-red-100 cursor-pointer"
              >
                契约剔除削减
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: BLIND CARDS SELECTOR */}
      {modalType === 'BTN2' && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-stone-900 border border-yellow-900/40 max-w-lg w-full rounded-2xl p-6 relative shadow-2xl text-stone-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-extrabold text-yellow-500 font-sans tracking-wide">
                  修正机制二：末置轴框之盲阵暗合
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  由于前两格已被修正优化，余下的那一格（**框 {determineRemainingBox(btn1SelectedBoxes) + 1}**）必须通过盲室挑选限额出货。
                </p>
              </div>
              <button 
                onClick={() => setModalType('NONE')}
                className="text-stone-500 hover:text-stone-200 bg-stone-950 p-1.5 rounded-lg text-sm cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-3 bg-stone-950 border border-stone-850 rounded-xl mb-4 text-[10.5px] font-serif leading-relaxed text-stone-400">
              这里有 10 张被灰色宿命迷雾遮蔽的卡片。你可以随心指定【任意几张】，该框转盘摇奖将【全权只在】你投选的这几张原身卡片内随机产出！
              <div className="mt-1 font-mono text-[9px] text-yellow-500/80">
                (注：盲挑越精准少选，一旦其中暗藏了契约真神，产出几率越高，但暗盒难辨。)
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2.5 my-4">
              {Array.from({ length: 14 }).slice(0, 10).map((_, i) => {
                const isSelected = blindChosenIndices.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (isSelected) {
                        setBlindChosenIndices(prev => prev.filter(v => v !== i));
                      } else {
                        setBlindChosenIndices(prev => [...prev, i]);
                      }
                    }}
                    className={`h-24 rounded-2xl border flex flex-col items-center justify-center relative cursor-pointer overflow-hidden transition-all duration-300 ${
                      isSelected
                        ? 'border-yellow-500 bg-yellow-950/25 shadow-[0_0_15px_rgba(234,179,8,0.35)]'
                        : 'border-stone-800 bg-stone-950 hover:border-stone-700'
                    }`}
                  >
                    {isSelected ? (
                      <div className="flex flex-col items-center animate-pulse">
                        <span className="text-3xl">🔮</span>
                        <span className="text-[8px] font-mono text-yellow-450 uppercase tracking-widest font-extrabold mt-1.5 animate-pulse">已指定</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-2xl text-stone-600">🎴</span>
                        <span className="text-[9px] font-mono text-stone-400 mt-1.5 font-semibold">CARD {i + 1}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mb-4 font-mono text-[9.5px] text-stone-500 px-0.5">
              <span>当前已锁封魔牌数: {blindChosenIndices.length} / 10 个盲块</span>
              <span>盲格决定重叠概率源</span>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setModalType('NONE')}
                className="px-4 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-xs rounded-xl cursor-pointer"
              >
                取消
              </button>
              <button
                disabled={blindChosenIndices.length === 0}
                onClick={handleBtn2Submit}
                className="px-5 py-2 bg-yellow-950 hover:bg-yellow-905 border border-yellow-700/60 disabled:opacity-35 disabled:cursor-not-allowed text-xs font-bold rounded-xl text-yellow-100 transition-all cursor-pointer"
              >
                封印盲格契约 (锁死)
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 3.1: SPECULATOR REVEAL COMPACT CONFIRM */}
      {modalType === 'BTN3_CONFIRM' && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-stone-900 border border-purple-900/50 max-w-sm w-full rounded-2xl p-6 text-center text-stone-100"
          >
            <AlertTriangle className="h-12 w-12 text-purple-400 animate-pulse mx-auto mb-3" />
            
            <h3 className="text-base font-bold text-purple-400 font-sans">
              掀翻明牌：献祭本局终极大奖？
            </h3>
            
            <p className="text-xs text-stone-400 font-serif mt-2 leading-relaxed">
              &ldquo;根据天机禁忌，一旦选择掀开面纱窥视所有黑卡内容进行重选，本局将剔除斩获一、等奖（大奖和二等奖）的权限。最高仅能封顶领取三等奖奖励。&rdquo;
            </p>

            <div className="my-4 p-3 bg-purple-950/25 border border-purple-900/30 rounded-xl text-left">
              <span className="block text-[10.5px] font-bold font-mono text-purple-300">
                但您拥有的天眼回馈是：
              </span>
              <p className="text-[10px] text-stone-300 mt-1 leading-normal">
                你可以看清刚才在盲阵中选择的10张宿命牌真面目！可以直接选中主要图案本身，使得末框中奖率逼近 100% 达成必胜合璧！
              </p>
            </div>

            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => setModalType('NONE')}
                className="flex-1 py-2.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-xs text-stone-400 rounded-xl cursor-pointer"
              >
                不了，坚守大奖可能
              </button>
              <button
                onClick={handleBtn3Accept}
                className="flex-1 py-2.5 bg-purple-900 hover:bg-purple-800 border border-purple-700 text-xs font-bold text-purple-100 rounded-xl cursor-pointer"
              >
                接受，明牌开锁重选
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 3.2: REVEALED PACT RIVAL SELECTION */}
      {modalType === 'BTN3_PLAY' && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-stone-900 border border-purple-900/40 max-w-lg w-full rounded-2xl p-6 relative shadow-2xl text-stone-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-extrabold text-purple-400 font-sans tracking-wide flex items-center gap-2">
                  <Eye className="inline-block h-4 w-4" />
                  <span>天眼已照：解离命运卡面</span>
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  契约法阵退散，请查阅 10 张神牌真正的徽记归属，重排第3轴之出货概率范围。
                </p>
              </div>
              <button 
                onClick={() => setModalType('NONE')}
                className="text-stone-500 hover:text-stone-200 bg-stone-950 p-1.5 rounded-lg text-sm"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-3 bg-purple-950/10 border border-purple-900/20 rounded-xl mb-4 text-xs text-purple-300">
              请为 **框 {determineRemainingBox(btn1SelectedBoxes) + 1}** 配置最终范围。建议你可以直接勾中你的目标契约图案！
            </div>

            <div className="grid grid-cols-5 gap-2.5 my-4">
              {SLOT_SYMBOLS.map((sym, oIdx) => {
                const isSelected = blindChosenIndices.includes(oIdx);
                const isTarget = sym.id === targetSymbol.id;

                return (
                  <button
                    key={sym.id}
                    onClick={() => {
                      if (blindChosenIndices.includes(oIdx)) {
                        setBlindChosenIndices(prev => prev.filter(v => v !== oIdx));
                      } else {
                        setBlindChosenIndices(prev => [...prev, oIdx]);
                      }
                    }}
                    className={`p-2 border rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer min-h-[80px] ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/30 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                        : 'border-stone-800 bg-stone-950 hover:border-purple-900/40'
                    }`}
                  >
                    <SlotSymbolDisplay id={sym.id} size={30} className="scale-100" />
                    <span className={`text-[9px] font-medium mt-2 text-center truncate w-full ${isTarget ? 'text-red-400 font-bold' : 'text-stone-300'}`}>
                      {sym.name}
                    </span>
                    {isTarget && (
                      <span className="absolute -top-1 -right-0.5 bg-red-600 text-[6px] px-1 py-0.5 rounded scale-90 animate-pulse text-white uppercase font-sans font-bold">KEY</span>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 border border-purple-500 rounded-xl pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setModalType('NONE')}
                className="px-4 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-xs rounded-xl"
              >
                放弃窥眼
              </button>
              <button
                disabled={blindChosenIndices.length === 0}
                onClick={() => {
                  const selectedIds = blindChosenIndices.map(idx => SLOT_SYMBOLS[idx].id);
                  handleBtn3Submit(selectedIds);
                }}
                className="px-5 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-700 disabled:opacity-35 disabled:cursor-not-allowed text-xs font-bold rounded-xl text-purple-200 cursor-pointer"
              >
                确认神旨范围并结课
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* DISCUSS RULE MANUALS */}
      {modalType === 'RULES' && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-stone-900 border border-stone-800 max-w-sm w-full rounded-2xl p-6 relative shadow-2xl text-stone-100 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4 border-b border-stone-800 pb-2">
              <h3 className="text-sm font-bold text-red-500 flex items-center gap-1.5 font-sans">
                <span>☠️ 智力老虎机运算概率指南</span>
              </h3>
              <button 
                onClick={() => setModalType('NONE')}
                className="text-stone-500 hover:text-stone-200 bg-stone-950 p-1 cursor-pointer rounded"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-stone-300 font-serif">
              
              <div className="p-3.5 bg-red-950/20 border border-red-900/30 rounded-lg">
                <span className="font-mono text-amber-500 font-bold block mb-1">【 兑付级别明细 】</span>
                <ul className="space-y-1 list-disc list-inside">
                  <li><b className="text-yellow-400">一等大奖：</b>三格完全命中最初抽中的核心目标。</li>
                  <li><b className="text-purple-400">二等奖：</b>摇中任意两个核心目标，或三个相同非核心目标。</li>
                  <li><b className="text-red-400">三等奖：</b>摇中任意一个核心目标。</li>
                  <li><b className="text-emerald-400">四等奖：</b>出现其余其他两两图案成组。</li>
                  <li><b className="text-stone-500">未中奖：</b>皆非以上任何。</li>
                </ul>
              </div>

              <div>
                <span className="font-mono text-amber-500 font-semibold block mb-1">【 脑力修正操作规则 】</span>
                <p className="text-stone-400">
                  你是概率的主宰，而非盲等运气：
                </p>
                <ol className="list-decimal list-inside space-y-1.5 mt-2 pl-1 leading-normal">
                  <li><b>第一步：</b>用<b>机制 I</b> 在两个卷轴槽剔除不必要的副符号（除主目标外可选5类），大幅抬起该两槽必中率。</li>
                  <li><b>第二步：</b>接着用<b>机制 II</b> 指定剩余第三槽，在10张倒扣卡中盲盒勾选入池，只要押中目标原卡即概率高企。</li>
                  <li><b>第三步：</b>最后如果想要万无一失，翻开<b>机制 III</b> 献祭可能的大奖殊荣，强制翻开机制二所以暗卡完全明牌，进行精准配定！</li>
                </ol>
              </div>

            </div>

            <button
              onClick={() => setModalType('NONE')}
              className="w-full mt-6 py-2.5 bg-stone-950 hover:bg-stone-850 border border-stone-800 rounded-xl text-stone-400 text-xs font-bold cursor-pointer"
            >
              已知晓
            </button>
          </motion.div>
        </div>
      )}

      {/* FOOTER */}
      <div className="w-full text-center mt-6 text-[9px] text-stone-600 font-mono tracking-wider">
        THE ABYSS KINETIC PLATFORM · SANITY INTEGRATION
      </div>

    </div>
  );
}

// Custom fallback inline checkbox icon to prevent missing import failures
function CheckCircleIcon({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
