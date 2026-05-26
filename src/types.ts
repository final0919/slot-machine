export interface GameSymbol {
  id: string;
  emoji: string;
  name: string;
  color: string; // Tailwind glow / shadow classes
  textColor: string;
  description: string;
}

export type GameState = 'HOME' | 'REEL_REVEAL' | 'PLAYING' | 'FINISHED';

export interface ReelState {
  symbols: string[]; // Active symbol ids in this reel's pool
  currentSymbol: GameSymbol | null;
  spinning: boolean;
}

export type PrizeType = 'NONE' | 'FOURTH' | 'THIRD' | 'SECOND' | 'GRAND';

export interface GameHistory {
  targetSymbolId: string;
  reelsResult: string[];
  prize: PrizeType;
  forfeitedGrandPrize: boolean;
  timestamp: number;
}
