'use client';

import { create } from 'zustand';
import { GameState, GemType } from '../types/game';

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
}

// 游戏状态存储
export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  error: null,
  loading: false,
  selectedGems: {},
  confirmDialog: null,
  gemsToDiscard: null,

  setLoading: (loading: boolean) => set({ loading }),

  setGameState: (gameState: GameState) => set({ gameState }),

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
})); 