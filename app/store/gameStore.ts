import { create } from 'zustand';
import { GameState, GemType } from '../types/game';
import { GameValidator } from '../lib/game/validator';

interface GameStore {
  gameState: GameState | null;
  isAIEnabled: boolean;
  error: string | null;
  loading: boolean;
  selectedGems: Partial<Record<GemType, number>>;
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null;
  setGameState: (gameState: GameState) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  enableAI: (enable: boolean) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  hideConfirm: () => void;
  selectGem: (gemType: GemType) => void;
  clearSelectedGems: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  isAIEnabled: false,
  error: null,
  loading: false,
  selectedGems: {},
  confirmDialog: null,

  setGameState: (gameState) => {
    set({ gameState, error: null });
  },

  setError: (error) => {
    set({ error });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  enableAI: (enable) => {
    set({ isAIEnabled: enable });
  },

  showConfirm: (title, message, onConfirm) => {
    set({
      confirmDialog: {
        isOpen: true,
        title,
        message,
        onConfirm
      }
    });
  },

  hideConfirm: () => {
    set({ confirmDialog: null });
  },

  selectGem: (gemType) => {
    set((state) => {
      if (!state.gameState) return state;

      const currentPlayer = state.gameState!.players.find(p => p.id === state.gameState!.currentTurn);
      if (!currentPlayer) return state;

      const currentCount = state.selectedGems[gemType] || 0;

      // 如果是取消选择（已经选择了这个宝石）
      if (currentCount > 0) {
        const newGems = { ...state.selectedGems };
        delete newGems[gemType];
        return { selectedGems: newGems };
      }

      // 验证新的宝石选择是否有效
      const { isValid, error } = GameValidator.validateGemSelection(
        state.gameState,
        state.selectedGems,
        gemType
      );

      if (!isValid) {
        set({ error });
        return state;
      }

      // 添加新的宝石选择
      const newSelectedGems = { ...state.selectedGems };
      const currentColorCount = newSelectedGems[gemType] || 0;

      // 根据当前状态决定添加一个还是两个宝石
      if (currentColorCount === 1 && state.gameState.gems[gemType] >= 4 && Object.keys(newSelectedGems).length === 1) {
        newSelectedGems[gemType] = 2;
      } else {
        newSelectedGems[gemType] = 1;
      }

      // 计算选择后的总宝石数
      const currentGemCount = Object.values(currentPlayer.gems).reduce((sum, count) => sum + count, 0);
      const selectedGemCount = Object.values(newSelectedGems).reduce((sum, count) => sum + count, 0);

      // 检查是否超过10个宝石限制
      if (currentGemCount + selectedGemCount > 10) {
        set({ error: "你的宝石总数不能超过10个" });
        return state;
      }

      return { selectedGems: newSelectedGems, error: null };
    });
  },

  clearSelectedGems: () => {
    set({ selectedGems: {} });
  },

  reset: () => {
    set({
      gameState: null,
      error: null,
      loading: false,
      selectedGems: {},
      confirmDialog: null
    });
  }
})); 