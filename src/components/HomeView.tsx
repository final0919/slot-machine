import React from 'react';
import { motion } from 'motion/react';

interface HomeViewProps {
  onStartGame: () => void;
}

export default function HomeView({ onStartGame }: HomeViewProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-tr from-stone-900 via-zinc-950 to-neutral-900 text-stone-100 flex flex-col justify-center items-center overflow-hidden font-sans px-4 py-8 select-none">
      {/* Absolute creepy subtle highlight in background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.2),transparent_70%)]" />

      <div className="max-w-xl w-full text-center z-10 flex flex-col items-center">
        {/* Mysterious subtitled decoration */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1.5 }}
          className="text-red-500 font-mono text-xs tracking-[0.35em] uppercase mb-4 text-center"
        >
          - 诡秘之殿 的 智商博弈 -
        </motion.div>

        {/* Main Header with heavy styling & text-shadow flickering */}
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-sans tracking-wide font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-neutral-50 via-stone-200 to-red-600 drop-shadow-[5px_5px_20px_rgba(239,68,68,0.4)] mb-5 text-center leading-tight selection:bg-red-800"
        >
          智力老虎机
        </motion.h1>

        {/* Eerie subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ delay: 0.6, duration: 1.2 }}
          className="text-stone-300 text-sm md:text-base font-serif max-w-lg mb-14 tracking-wide leading-relaxed px-4"
        >
          在这里，运气只是最后的护身符。<br />
          唯有熟稔概率剔除、黑盒盲格博弈、以及牺牲特权的重选舍弃，<br />
          你才能驾驭十色宿命徽记，在崩裂的齿轮中博得至高凯旋。
        </motion.p>

        {/* The Start button with hovering feedback, flicker, and glow */}
        <div className="relative group mb-8">
          {/* Pulsing red back-shadow */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-red-800 via-amber-700 to-red-600 rounded-lg blur-md opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

          {/* Core button with flickering animations */}
          <motion.button
            onClick={onStartGame}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            className="relative px-14 py-5 bg-stone-900 border border-red-500/50 hover:border-red-400 rounded-lg text-lg tracking-[0.25em] font-sans font-bold text-red-500 hover:text-red-400 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_20px_rgba(239,68,68,0.35)] hover:shadow-[0_0_35px_rgba(239,68,68,0.7)] cursor-pointer"
            style={{
              animation: 'flicker-glow 4s infinite alternate'
            }}
          >
            进入深渊
          </motion.button>
        </div>

        {/* CSS for flickering effect custom-written so it doesn't fail */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes flicker-glow {
            0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
              box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 0 20px rgba(239,68,68,0.35);
              border-color: rgba(239, 68, 68, 0.5);
              color: rgba(239, 68, 68, 0.95);
            }
            20%, 24%, 55% {
              box-shadow: inset 0 1px 0 rgba(255,255,255,0.02), 0 0 5px rgba(239,68,68,0.08);
              border-color: rgba(239, 68, 68, 0.15);
              color: rgba(239, 68, 68, 0.35);
            }
          }
        `}} />
      </div>

      {/* Disclaimers / Signatures */}
      <div className="absolute bottom-6 text-[10px] font-mono text-stone-500 tracking-wider">
        CHALLENGE OF RATIONAL FATE &copy; 2026
      </div>
    </div>
  );
}
