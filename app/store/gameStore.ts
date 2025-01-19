import { create } from 'zustand';
import { GameState, GameAction, Player } from '../types/game';
import { GameActions } from '../lib/game/actions';
import { generateInitialCards, generateInitialNobles } from '../lib/game/generator';
import { AIPlayer } from '../lib/game/ai';

interface GameStore {
  gameState: GameState | null;
  isAIEnabled: boolean;
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null;
  initializeGame: (players: Player[]) => void;
  performAction: (action: GameAction) => void;
  enableAI: (enable: boolean) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  hideConfirm: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  isAIEnabled: false,
  confirmDialog: null,

  initializeGame: (players) => {
    const initialState: GameState = {
      players: players,
      currentPlayer: 0,
      gems: {
        diamond: players.length <= 2 ? 4 : 7,
        sapphire: players.length <= 2 ? 4 : 7,
        emerald: players.length <= 2 ? 4 : 7,
        ruby: players.length <= 2 ? 4 : 7,
        onyx: players.length <= 2 ? 4 : 7,
        gold: 5
      },
      cards: generateInitialCards(),
      nobles: generateInitialNobles(players.length + 1),
      status: 'playing',
      lastRound: false,
      winner: null,
      actions: []
    };

    set({ gameState: initialState });
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

  performAction: (action) => {
    const currentState = get().gameState;
    if (!currentState) return;

    let newState: GameState = currentState;

    try {
      switch (action.type) {
        case 'takeGems':
          newState = GameActions.takeGems(currentState, action.details.gems || {});
          break;
        case 'purchaseCard':
          const card = [...currentState.cards.level1, ...currentState.cards.level2, ...currentState.cards.level3]
            .find(c => c.gem === action.details.card?.gem && c.points === action.details.card?.points);
          if (!card) throw new Error('Card not found');
          newState = GameActions.purchaseCard(currentState, card);
          break;
        case 'reserveCard':
          // ... existing reserve card code ...
          break;
        case 'endTurn':
          newState = { ...currentState };
          newState.currentPlayer = (newState.currentPlayer + 1) % newState.players.length;
          break;
        default:
          throw new Error('Invalid action type');
      }

      // 记录动作
      newState.actions = [...newState.actions, action];

      // 更新游戏状态
      set({ gameState: newState });

      // 如果启用了AI且当前玩家是AI，则执行AI的回合
      if (get().isAIEnabled && newState.players[newState.currentPlayer].name === 'AI') {
        setTimeout(() => {
          const aiAction = AIPlayer.getNextAction(newState);
          get().performAction(aiAction);
        }, 1000); // 添加1秒延迟使AI的行动更容易观察
      }

    } catch (error) {
      console.error('Error performing action:', error);
    }
  },
})); 