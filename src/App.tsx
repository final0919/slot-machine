/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameState, GameSymbol } from './types';
import HomeView from './components/HomeView';
import ReelTransition from './components/ReelTransition';
import SlotMachineView from './components/SlotMachineView';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('HOME');
  const [targetSymbol, setTargetSymbol] = useState<GameSymbol | null>(null);

  // Home to Spin Transition
  const handleStartGame = () => {
    setGameState('REEL_REVEAL');
  };

  // Target Selected -> Go to actual Slot Machine Playroom
  const handleTargetDrawn = (symbol: GameSymbol) => {
    setTargetSymbol(symbol);
    setGameState('PLAYING');
  };

  // Back to Main Home Screen
  const handleBackToHome = () => {
    setTargetSymbol(null);
    setGameState('HOME');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 select-none">
      {gameState === 'HOME' && (
        <HomeView onStartGame={handleStartGame} />
      )}

      {gameState === 'REEL_REVEAL' && (
        <ReelTransition onSelected={handleTargetDrawn} />
      )}

      {gameState === 'PLAYING' && targetSymbol && (
        <SlotMachineView 
          targetSymbol={targetSymbol} 
          onBackToHome={handleBackToHome} 
          onPlayAgain={() => {
            setTargetSymbol(null);
            setGameState('REEL_REVEAL');
          }}
        />
      )}
    </div>
  );
}
