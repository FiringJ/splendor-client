'use client';

import { create } from 'zustand';
import { DecisionMeta, GameState, GemType } from '../types/game';
import { applyDecisionUpdate, emptyDecisionLog } from '../lib/game/decisionMeta';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface GemsToDiscardState {
  isOpen: boolean;
  playerId: string;
  gemsToDiscard: number;
}

interface GameStore {
  gameState: GameState | null;
  error: string | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  selectedGems: Partial<Record<GemType, number>>;
  confirmDialog: ConfirmDialogState | null;
  gemsToDiscard: GemsToDiscardState | null;
  /** 按动作下标保存的 AI 决策。没有元数据时为空。 */
  decisionsByActionIndex: Record<number, DecisionMeta>;
  /** 最近一次 AI 决策。人类回合不会清掉，方便对照刚下完的棋。 */
  latestDecision: DecisionMeta | null;
  trackedActionCount: number;

  // 更新游戏状态
  setGameState: (gameState: GameState) => void;
  // 设置错误信息
  setError: (error: string | null) => void;

  // 宝石选择相关
  addSelectedGem: (gemType: GemType) => void;
  removeSelectedGem: (gemType: GemType) => void;
  clearSelectedGems: () => void;

  // 确认弹窗相关
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  hideConfirm: () => void;

  // 丢弃宝石相关
  showGemsToDiscard: (playerId: string, gemsToDiscard: number) => void;
  hideGemsToDiscard: () => void;

  // 合并一次 gameStateUpdate 上的可选 decisionMeta。raw 无法识别时不抛错。
  ingestDecisionUpdate: (actionCount: number, rawMeta: unknown, restarted?: boolean) => void;
  clearDecisions: () => void;

  // REQ-011: 添加重置游戏状态的 action
  resetGameState: () => void;
}

// 初始状态
const initialState = {
  gameState: null,
  error: null,
  loading: false,
  selectedGems: {},
  confirmDialog: null,
  gemsToDiscard: null,
  ...emptyDecisionLog(),
};

// 游戏状态存储
export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setLoading: (loading: boolean) => set({ loading }),

  setGameState: (gameState: GameState) => set((state) => {
    const actionCount = gameState.actions?.length ?? 0;
    if (actionCount < state.trackedActionCount) {
      return { gameState, ...emptyDecisionLog(), trackedActionCount: actionCount };
    }
    return { gameState };
  }),

  setError: (error: string | null) => set({ error }),

  addSelectedGem: (gemType: GemType) =>
    set((state) => {
      const newSelectedGems = { ...state.selectedGems };
      newSelectedGems[gemType] = (newSelectedGems[gemType] || 0) + 1;
      return { selectedGems: newSelectedGems };
    }),

  removeSelectedGem: (gemType: GemType) =>
    set((state) => {
      const newSelectedGems = { ...state.selectedGems };
      if (newSelectedGems[gemType] && newSelectedGems[gemType]! > 0) {
        newSelectedGems[gemType] = newSelectedGems[gemType]! - 1;
        if (newSelectedGems[gemType] === 0) {
          delete newSelectedGems[gemType];
        }
      }
      return { selectedGems: newSelectedGems };
    }),

  clearSelectedGems: () => set({ selectedGems: {} }),

  showConfirm: (title: string, message: string, onConfirm: () => void) =>
    set({
      confirmDialog: {
        isOpen: true,
        title,
        message,
        onConfirm,
      },
    }),

  hideConfirm: () => set({ confirmDialog: null }),

  showGemsToDiscard: (playerId: string, gemsToDiscard: number) =>
    set({
      gemsToDiscard: {
        isOpen: true,
        playerId,
        gemsToDiscard,
      },
    }),

  hideGemsToDiscard: () => set({ gemsToDiscard: null }),

  ingestDecisionUpdate: (actionCount, rawMeta, restarted = false) => set((state) => {
    const next = applyDecisionUpdate(state, actionCount, rawMeta, restarted);
    return next;
  }),

  clearDecisions: () => set({ ...emptyDecisionLog() }),

  // REQ-011: 实现重置游戏状态
  resetGameState: () => set({ ...initialState }),
})); 