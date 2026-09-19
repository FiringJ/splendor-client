// 宝石类型，一共6种，包含5种宝石和1种金子
export type GemType = 'diamond' | 'sapphire' | 'emerald' | 'ruby' | 'onyx' | 'gold';

// 游戏动作类型
export type GameActionType =
  | 'TAKE_GEMS' // 获取宝石
  | 'PURCHASE_CARD' // 购买卡牌
  | 'RESERVE_CARD' // 保留卡牌
  | 'CLAIM_NOBLE' // 领取贵族
  | 'DISCARD_GEMS' // 丢弃宝石
  | 'RESTART_GAME'; // 重新开始游戏

// 拿取宝石
export interface TakeGemsAction {
  type: 'TAKE_GEMS';
  playerId?: string; // 可选，如果不存在则使用当前回合的玩家
  payload: {
    gems: Partial<Record<GemType, number>>;
  };
}

// 购买卡牌
export interface PurchaseCardAction {
  type: 'PURCHASE_CARD';
  playerId?: string;
  payload: {
    cardId: number;
  };
}

// 保留卡牌
export interface ReserveCardAction {
  type: 'RESERVE_CARD';
  playerId?: string;
  payload: {
    cardId: number;
    level?: number;
  };
}

// 领取贵族
export interface ClaimNobleAction {
  type: 'CLAIM_NOBLE';
  payload: {
    nobleId: number;
  };
}

// 丢弃宝石
export interface DiscardGemsAction {
  type: 'DISCARD_GEMS';
  playerId?: string;
  payload: {
    gems: Partial<Record<GemType, number>>;
  };
}

// 重新开始游戏
export interface RestartGameAction {
  type: 'RESTART_GAME';
  payload: {
    players?: string[];
  };
}

// 游戏动作
export type GameAction =
  | TakeGemsAction
  | PurchaseCardAction
  | ReserveCardAction
  | ClaimNobleAction
  | DiscardGemsAction
  | RestartGameAction;

// 卡牌
export interface Card {
  id: number;
  level: 1 | 2 | 3;
  points: number;
  gem: GemType;
  cost: Partial<Record<GemType, number>>;
  image?: string;
  spritePosition: {
    x: number;  // 精灵图中的x坐标（第几列，从0开始）
    y: number;  // 精灵图中的y坐标（第几行，从0开始）
  };
}

// 贵族
export interface Noble {
  id: number;
  points: number;
  name: string;
  requirements: Partial<Record<GemType, number>>;
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

// 等待丢弃宝石的状态
export interface PendingDiscard {
  playerId: string;
  gemsCount: number;
}

/**
 * AI 决策来源。只由服务端填写，客户端只展示。
 * - jev: OpenRouter / Jev Choice
 * - heuristic: 超时、错误或配置回退到现有启发式
 * - forced: 合法动作不足 2 个，未调用模型
 */
export type DecisionSource = 'jev' | 'heuristic' | 'forced';

/** Jev Choice 的一个候选项及其概率（0 到 1）。 */
export interface DecisionOption {
  id: string;
  label: string;
  probability: number;
}

/**
 * 服务端在 `gameStateUpdate` 上可选附带的 AI 决策元数据。
 * 人类回合、以及尚未合并 Phase A 的服务端都不会带这个字段；
 * 客户端必须在字段缺失时保持原界面，不得为此请求 OpenRouter / TypeSafe。
 */
export interface DecisionMeta {
  source: DecisionSource;
  /** 例如 `typesafe/jev-1.13`。启发式或强制动作可能没有。 */
  modelId?: string;
  /** 决策耗时，毫秒。 */
  latencyMs?: number;
  actionType?: GameActionType;
  chosenOptionId?: string;
  /** 展示用的选中项文案，由服务端生成。 */
  chosenOptionLabel?: string;
  /** 按概率从高到低。界面只展示前 3 项。 */
  options?: DecisionOption[];
  /** source 为 heuristic 时的回退原因，不含密钥。 */
  fallbackReason?: string;
  /** 对应 `gameState.actions` 的下标。缺省时客户端绑到本次更新的最后一条动作。 */
  actionIndex?: number;
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
  pendingDiscard?: PendingDiscard; // 等待丢弃宝石的状态
} 