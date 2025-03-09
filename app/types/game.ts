export type GemType = 'diamond' | 'sapphire' | 'emerald' | 'ruby' | 'onyx' | 'gold';

export type GameActionType =
  | 'TAKE_GEMS'
  | 'PURCHASE_CARD'
  | 'RESERVE_CARD'
  | 'CLAIM_NOBLE'
  | 'RESTART_GAME';

export interface TakeGemsAction {
  type: 'TAKE_GEMS';
  payload: {
    gems: Record<GemType, number>;
  };
}

export interface PurchaseCardAction {
  type: 'PURCHASE_CARD';
  payload: {
    cardId: string;
    level: number;
  };
}

export interface ReserveCardAction {
  type: 'RESERVE_CARD';
  payload: {
    cardId: string;
    level: number;
  };
}

export interface ClaimNobleAction {
  type: 'CLAIM_NOBLE';
  payload: {
    nobleId: string;
  };
}

export interface RestartGameAction {
  type: 'RESTART_GAME';
  payload: Record<string, never>;
}

export type GameAction =
  | TakeGemsAction
  | PurchaseCardAction
  | ReserveCardAction
  | ClaimNobleAction
  | RestartGameAction;

export interface Card {
  id: string;
  level: 1 | 2 | 3;
  points: number;
  gem: GemType;
  cost: Record<GemType, number>;
  image?: string;
  spritePosition: {
    x: number;  // 精灵图中的x坐标（第几列，从0开始）
    y: number;  // 精灵图中的y坐标（第几行，从0开始）
  };
}

export interface Noble {
  id: string;
  points: number;
  name: string;
  requirements: Record<GemType, number>;
  image?: string;
}

export interface Player {
  id: string;
  name: string;
  gems: Record<GemType, number>;
  cards: Card[];
  reservedCards: Card[];
  nobles: Noble[];
  points: number;
}

export interface GameState {
  players: Array<Player>;
  currentTurn: string | null;
  gems: Record<GemType, number>;
  cards: {
    level1: Card[];
    level2: Card[];
    level3: Card[];
    deck1: Card[];
    deck2: Card[];
    deck3: Card[];
  };
  nobles: Noble[];
  status: 'waiting' | 'playing' | 'finished';
  lastRound: boolean;
  lastRoundStartPlayer: string | null;
  winner: Player | null;
  actions: GameAction[];
} 