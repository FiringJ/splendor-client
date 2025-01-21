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
      lastRoundStartPlayer: null,
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
          const card = [...currentState.cards.level1, ...currentState.cards.level2, ...currentState.cards.level3,
          ...currentState.players[currentState.currentPlayer].reservedCards]
            .find(c => c.id === action.details.card?.id);
          if (!card) throw new Error('Card not found');
          newState = GameActions.purchaseCard(currentState, card);
          break;
        case 'reserveCard':
          const reserveTargetCard = [...currentState.cards.level1, ...currentState.cards.level2, ...currentState.cards.level3]
            .find(c => c.id === action.details.card?.id);
          if (!reserveTargetCard) throw new Error('Card not found');
          newState = GameActions.reserveCard(currentState, reserveTargetCard);
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

      // 检查是否有玩家达到15分
      const hasPlayerReached15Points = newState.players.some(player => player.points >= 1);
      if (hasPlayerReached15Points && !newState.lastRound) {
        // 标记为最后一轮，并记录触发玩家的位置
        newState.lastRound = true;
        newState.lastRoundStartPlayer = newState.currentPlayer;
      }

      // 如果是最后一轮，检查是否所有玩家都进行了最后一次行动
      if (newState.lastRound) {
        // 计算从开始玩家到当前玩家是否所有人都进行了一轮
        let hasCompletedLastRound = false;
        if (newState.lastRoundStartPlayer === null) {
          hasCompletedLastRound = false;
        } else {
          // 如果当前玩家是最后一轮开始玩家的前一位，说明最后一轮已经完成
          const lastPlayer = (newState.lastRoundStartPlayer - 1 + newState.players.length) % newState.players.length;
          hasCompletedLastRound = newState.currentPlayer === lastPlayer;
        }

        if (hasCompletedLastRound) {
          // 找出分数最高的玩家
          let maxPoints = -1;
          let winnerName: string | null = null;
          for (const player of newState.players) {
            if (player.points > maxPoints) {
              maxPoints = player.points;
              winnerName = player.name;
            } else if (player.points === maxPoints) {
              // 如果分数相同，比较拥有的卡牌数量（平局规则）
              const currentWinnerCards = newState.players.find(p => p.name === winnerName)?.cards.length || 0;
              if (player.cards.length < currentWinnerCards) {
                winnerName = player.name;
              }
            }
          }
          newState.winner = winnerName;
          newState.status = 'finished';
        }
      }

      // 更新游戏状态
      set({ gameState: newState });

      // 如果启用了AI且当前玩家是AI，则执行AI的回合
      if (get().isAIEnabled && newState.players[newState.currentPlayer].name === 'AI' && newState.status === 'playing') {
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