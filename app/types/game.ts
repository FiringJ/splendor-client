export type GemType = 'diamond' | 'sapphire' | 'emerald' | 'ruby' | 'onyx' | 'gold';

export interface Card {
  id: number;
  level: 1 | 2 | 3;
  points: number;
  gem: GemType;
  cost: Partial<Record<GemType, number>>;
  image?: string;
}

export interface Noble {
  id: number;
  points: number;
  name: string;
  requirements: Partial<Record<GemType, number>>;
  image?: string;
}

export interface Player {
  id: string;
  name: string;
  gems: Partial<Record<GemType, number>>;
  cards: Card[];
  reservedCards: Card[];
  nobles: Noble[];
  points: number;
}

export interface GameState {
  players: Player[];
  currentPlayer: number;
  gems: Record<GemType, number>;
  cards: {
    level1: Card[];
    level2: Card[];
    level3: Card[];
  };
  nobles: Noble[];
  status: 'waiting' | 'playing' | 'finished';
  lastRound: boolean;
  winner: string | null;
} 