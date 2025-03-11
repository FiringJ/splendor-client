// 宝石类型，一共6种，包含5种宝石和1种金子
export type GemType = 'diamond' | 'sapphire' | 'emerald' | 'ruby' | 'onyx' | 'gold';

// 游戏动作类型
export type GameActionType =
  | 'TAKE_GEMS' // 获取宝石
  | 'PURCHASE_CARD' // 购买卡牌
  | 'RESERVE_CARD' // 保留卡牌
  | 'CLAIM_NOBLE' // 领取贵族
  | 'RESTART_GAME'; // 重新开始游戏

// 拿取宝石
export interface TakeGemsAction {
  type: 'TAKE_GEMS';
  payload: {
    gems: Record<GemType, number>;
  };
}

// 购买卡牌
export interface PurchaseCardAction {
  type: 'PURCHASE_CARD';
  payload: {
    cardId: string;
    level: number;
  };
}

// 保留卡牌
export interface ReserveCardAction {
  type: 'RESERVE_CARD';
  payload: {
    cardId: string;
    level: number;
  };
}

// 领取贵族
export interface ClaimNobleAction {
  type: 'CLAIM_NOBLE';
  payload: {
    nobleId: string;
  };
}

// 重新开始游戏
export interface RestartGameAction {
  type: 'RESTART_GAME';
  payload: Record<string, never>;
}

// 游戏动作
export type GameAction =
  | TakeGemsAction
  | PurchaseCardAction
  | ReserveCardAction
  | ClaimNobleAction
  | RestartGameAction;

// 卡牌
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

// 贵族
export interface Noble {
  id: string;
  points: number;
  name: string;
  requirements: Record<GemType, number>;
  image?: string;
}

// 玩家
export interface Player {
  id: string;
  clientId?: string;  // Socket.IO的客户端ID
  name: string;
  gems: Record<GemType, number>;
  cards: Card[];
  reservedCards: Card[];
  nobles: Noble[];
  points: number;
  isAI?: boolean;
}

// 游戏状态
export interface GameState {
  players: Array<Player>;
  currentTurn: string | null; // 当前回合玩家ID
  gems: Record<GemType, number>; // 宝石数量
  cards: {
    level1: Card[]; // 1级卡牌
    level2: Card[]; // 2级卡牌
    level3: Card[]; // 3级卡牌
    deck1: Card[]; // 1级卡牌堆
    deck2: Card[]; // 2级卡牌堆
    deck3: Card[]; // 3级卡牌堆
  };
  nobles: Noble[];
  status: 'waiting' | 'playing' | 'finished';
  lastRound: boolean;
  lastRoundStartPlayer: string | null;
  winner: Player | null;
  actions: GameAction[];
} 