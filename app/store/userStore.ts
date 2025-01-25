import { create } from 'zustand';

interface UserStore {
  playerId: string | null;
  playerName: string | null;
  setPlayer: (id: string, name: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  playerId: null,
  playerName: null,
  setPlayer: (id: string, name: string) => set({ playerId: id, playerName: name }),
  reset: () => set({ playerId: null, playerName: null })
})); 