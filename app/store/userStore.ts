'use client';

import { create } from 'zustand';

interface UserStore {
  playerId: string | null;
  playerName: string | null;
  setPlayer: (id: string, name: string) => void;
  clearPlayer: () => void;
}

// 从localStorage加载玩家信息
const loadUserFromStorage = (): { playerId: string | null; playerName: string | null } => {
  if (typeof window === 'undefined') {
    return { playerId: null, playerName: null };
  }

  try {
    const storedPlayerId = localStorage.getItem('splendor_playerId');
    const storedPlayerName = localStorage.getItem('splendor_playerName');
    return {
      playerId: storedPlayerId,
      playerName: storedPlayerName
    };
  } catch (error) {
    console.error('Failed to load user data from localStorage:', error);
    return { playerId: null, playerName: null };
  }
};

// 保存玩家信息到localStorage
const saveUserToStorage = (playerId: string, playerName: string) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('splendor_playerId', playerId);
    localStorage.setItem('splendor_playerName', playerName);
  } catch (error) {
    console.error('Failed to save user data to localStorage:', error);
  }
};

// 初始状态，从localStorage加载
const initialState = loadUserFromStorage();

export const useUserStore = create<UserStore>((set) => ({
  playerId: initialState.playerId,
  playerName: initialState.playerName,

  setPlayer: (id: string, name: string) => {
    saveUserToStorage(id, name);
    set({ playerId: id, playerName: name });
  },

  clearPlayer: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('splendor_playerId');
      localStorage.removeItem('splendor_playerName');
    }
    set({ playerId: null, playerName: null });
  },
})); 