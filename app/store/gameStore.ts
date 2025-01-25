import { create } from 'zustand';
import { GameState } from '../types/game';

interface GameStore {
  gameState: GameState | null;
  isAIEnabled: boolean;
  error: string | null;
  loading: boolean;
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
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  isAIEnabled: false,
  error: null,
  loading: false,
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

  reset: () => {
    set({
      gameState: null,
      error: null,
      loading: false,
      confirmDialog: null
    });
  }
})); 