import { create } from 'zustand';
import { GameState, GemType } from '../types/game';
import { GameValidator } from '../lib/game/validator';

interface GameStore {
  gameState: GameState | null;
  isAIEnabled: boolean;
  error: string | null;
  loading: boolean;
  selectedGems: Partial<Record<GemType, number>>;
  gemsToDiscard: {
    isOpen: boolean;
    currentTotal: number;
    playerId: string;
  } | null;
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
  showGemsToDiscard: (currentTotal: number, playerId: string) => void;
  hideGemsToDiscard: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  isAIEnabled: false,
  error: null,
  loading: false,
  selectedGems: {},
  gemsToDiscard: null,
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

      // 验证新的宝石选择是否有效
      const { isValid, error, updatedGems } = GameValidator.validateGemSelection(
        state.gameState,
        state.selectedGems,
        gemType
      );

      if (!isValid) {
        set({ error });
        return state;
      }

      return { selectedGems: updatedGems, error: null };
    });
  },

  clearSelectedGems: () => {
    set({ selectedGems: {} });
  },

  showGemsToDiscard: (currentTotal: number, playerId: string) => {
    set({
      gemsToDiscard: {
        isOpen: true,
        currentTotal,
        playerId
      }
    });
  },

  hideGemsToDiscard: () => {
    set({ gemsToDiscard: null });
  },

  reset: () => {
    set({
      gameState: null,
      error: null,
      loading: false,
      selectedGems: {},
      gemsToDiscard: null,
      confirmDialog: null
    });
  }
})); 