import { create } from 'zustand';
import { GameState, Card, GemType } from '../types/game';
import { GameActions } from '../lib/game/actions';
import { generateInitialCards, generateInitialNobles } from '../lib/game/generator';

export interface GameStore {
  gameState: GameState | null;
  initGame: (playerCount: number) => void;
  takeGems: (gems: Partial<Record<GemType, number>>) => boolean;
  purchaseCard: (card: Card) => boolean;
  reserveCard: (card: Card) => boolean;
  endTurn: () => void;
  checkGameEnd: () => boolean;
  checkWinner: (state: GameState) => string;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,

  initGame: (playerCount) => {
    // 初始化游戏状态
    const initialState: GameState = {
      players: Array(playerCount).fill(null).map((_, index) => ({
        id: `player-${index}`,
        name: `玩家 ${index + 1}`,
        gems: {},
        cards: [],
        reservedCards: [],
        nobles: [],
        points: 0
      })),
      currentPlayer: 0,
      gems: {
        diamond: playerCount <= 2 ? 4 : 7,
        sapphire: playerCount <= 2 ? 4 : 7,
        emerald: playerCount <= 2 ? 4 : 7,
        ruby: playerCount <= 2 ? 4 : 7,
        onyx: playerCount <= 2 ? 4 : 7,
        gold: 5
      },
      cards: generateInitialCards(),
      nobles: generateInitialNobles(playerCount + 1),
      status: 'playing',
      lastRound: false,
      winner: null
    };
    set({ gameState: initialState });
  },

  takeGems: (gems: Partial<Record<GemType, number>>) => {
    try {
      const newState = GameActions.takeGems(get().gameState!, gems);
      set({ gameState: newState });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  purchaseCard: (card: Card) => {
    try {
      const newState = GameActions.purchaseCard(get().gameState!, card);
      set({ gameState: newState });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  reserveCard: (card: Card) => {
    try {
      const newState = GameActions.reserveCard(get().gameState!, card);
      set({ gameState: newState });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  endTurn: () => {
    const state = get().gameState!;
    const newState = { ...state };

    // 检查当前玩家是否达到胜利条件（15分）
    const currentPlayer = newState.players[newState.currentPlayer];
    if (currentPlayer.points >= 15) {
      newState.lastRound = true;
    }

    // 更新当前玩家
    newState.currentPlayer = (newState.currentPlayer + 1) % newState.players.length;

    // 如果是最后一轮且回到第一个玩家，游戏结束
    if (newState.lastRound && newState.currentPlayer === 0) {
      newState.status = 'finished';
      newState.winner = get().checkWinner(newState);
    }

    set({ gameState: newState });
  },

  checkGameEnd: () => {
    const state = get().gameState;
    return state?.status === 'finished';
  },

  // 私有方法：检查胜利者
  checkWinner: (state: GameState) => {
    let maxPoints = 0;
    let winners = state.players.filter(player => {
      if (player.points > maxPoints) {
        maxPoints = player.points;
        return true;
      }
      return player.points === maxPoints;
    });

    // 如果有多个玩家同分，比较发展卡数量
    if (winners.length > 1) {
      const minCards = Math.min(...winners.map(p => p.cards.length));
      winners = winners.filter(p => p.cards.length === minCards);
    }

    return winners[0].id; // 返回胜利者ID
  }
})); 