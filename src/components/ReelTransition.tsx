import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SLOT_SYMBOLS } from '../data';
import { GameSymbol } from '../types';
import SlotSymbolDisplay from './SlotSymbolDisplay';

interface ReelTransitionProps {
  onSelected: (symbol: GameSymbol) => void;
}

export default function ReelTransition({ onSelected }: ReelTransitionProps) {
  const [spinning, setSpinning] = useState(true);
  const [symbolIndex, setSymbolIndex] = useState(0);
  const [speed, setSpeed] = useState(30); // in ms
  const [targetSymbol, setTargetSymbol] = useState<GameSymbol | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Pick target symbol on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SLOT_SYMBOLS.length);
    setTargetSymbol(SLOT_SYMBOLS[randomIndex]);
  }, []);

  // Spinning loop
  useEffect(() => {
    if (!spinning) return;

    const interval = setTimeout(() => {
      setSymbolIndex((prev) => (prev + 1) % SLOT_SYMBOLS.length);
    }, speed);

    return () => clearTimeout(interval);
  }, [spinning, symbolIndex, speed]);

  // Slow down algorithm to land on the chosen target Symbol
  useEffect(() => {
    if (!targetSymbol) return;

    const timer = setTimeout(() => {
      // Begin deceleration phase
      let currentSpeed = speed;
      const decelInterval = setInterval(() => {
        currentSpeed = Math.floor(currentSpeed * 1.35);
        setSpeed(currentSpeed);

        if (currentSpeed > 350) {
          clearInterval(decelInterval);
          // Set to the exact target
          const targetIdx = SLOT_SYMBOLS.findIndex(s => s.id === targetSymbol.id);
          setSymbolIndex(targetIdx);
          setSpinning(false);
          
          // delay before grand reveal
          setTimeout(() => {
            setIsRevealed(true);
          }, 850);
        }
      }, 180);

      return () => clearInterval(decelInterval);
    }, 2000); // Spin fast for 2 seconds

    return () => clearTimeout(timer);
  }, [targetSymbol]);

  return (
    <div className="relative min-h-screen bg-black text-neutral-100 flex flex-col justify-center items-center overflow-hidden py-12 px-4 select-none">
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15),transparent_70%)]" />

      <div className="max-w-md w-full text-center z-10 flex flex-col items-center">
        {!isRevealed ? (
          <div className="flex flex-col items-center">
            {/* Spinning Indicator Header */}
            <h2 className="text-red-600 font-mono text-xs tracking-[0.5em] uppercase mb-8 animate-pulse">
              正在判定你所承受的智力命格...
            </h2>

            {/* Vertically Scrolling Frame */}
            <div className="relative w-48 h-64 bg-stone-950 border-2 border-stone-800 rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(239,68,68,0.1)] flex items-center justify-center">
              
              {/* Central Glowing Window */}
              <div className="absolute inset-y-8 inset-x-6 bg-gradient-to-b from-stone-950 via-zinc-950 to-stone-950 flex items-center justify-center">
                <motion.div
                  key={symbolIndex}
                  initial={{ y: -65, opacity: 0.15 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 65, opacity: 0.15 }}
                  transition={{ duration: speed / 1000, ease: spinning ? "linear" : "easeOut" }}
                  className="text-center select-none"
                  style={{
                    filter: spinning ? `blur(${Math.min(4, 40 / speed)}px)` : 'none'
                  }}
                >
                  <SlotSymbolDisplay id={SLOT_SYMBOLS[symbolIndex].id} size={48} />
                </motion.div>
              </div>

              {/* Overlay shading lines for realistic glass look */}
              <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-stone-950 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-stone-950 to-transparent pointer-events-none" />
            </div>

            {/* Clicking hum audio indicator */}
            <div className="mt-8 text-[11px] font-mono text-stone-500 tracking-widest animate-pulse h-4">
              {spinning ? '· 齿轮正在高度啮合中 ·' : '· 锚定轮盘 ·'}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {targetSymbol && (
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center"
              >
                {/* Red warning bar */}
                <span className="text-red-500 font-mono text-xs tracking-widest mb-3 uppercase">
                  † 已确认智力契约标识 †
                </span>

                {/* Big Revealed Symbol */}
                <motion.div
                  initial={{ y: -10 }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="my-6 p-1.5 bg-stone-900/40 border border-stone-800 rounded-full shadow-[0_0_25px_rgba(239,68,68,0.2)] flex items-center justify-center select-none"
                >
                  <SlotSymbolDisplay id={targetSymbol.id} size={72} />
                </motion.div>

                {/* Symbol Title */}
                <h3 className={`text-2xl font-bold tracking-widest ${targetSymbol.textColor} mb-3`}>
                  {targetSymbol.name}
                </h3>

                {/* Description Box */}
                <p className="text-stone-300 text-sm italic font-serif leading-relaxed text-center px-6 max-w-sm mb-8">
                  &ldquo;{targetSymbol.description}&rdquo;
                </p>

                {/* Subtitle rule hint */}
                <div className="text-xs text-stone-400 max-w-xs mb-8 border border-neutral-850 p-4 bg-stone-950/80 rounded-xl leading-relaxed text-left shadow-inner">
                  <span className="text-red-500 font-semibold font-sans">游戏规则：</span>
                  此契约为你本次的核心目标。摇动老虎机手柄，组合出 **3个该图案** 即可摘得神秘大奖！
                </div>

                {/* Button to confirm fate */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelected(targetSymbol)}
                  className="px-12 py-4 bg-red-950 hover:bg-red-900 border border-red-700/60 text-red-100 rounded-xl text-sm font-sans tracking-widest font-bold shadow-[0_5px_20px_rgba(185,28,28,0.3)] hover:shadow-[0_0_35px_rgba(239,68,68,0.6)] transition-all cursor-pointer"
                >
                  手持契约，步入游戏
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
