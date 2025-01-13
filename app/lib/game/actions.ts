import { GameState, Card, GemType } from '../../types/game';
import { GameValidator } from './validator';

export class GameActions {
  // 处理拿取宝石动作
  static takeGems(
    gameState: GameState,
    selectedGems: Partial<Record<GemType, number>>
  ): GameState {
    console.log('GameActions.takeGems called with:', { gameState, selectedGems }); // 调试日志

    if (!GameValidator.canTakeGems(selectedGems, gameState)) {
      console.log('Invalid gems selection'); // 调试日志
      throw new Error('Invalid gems selection');
    }

    const newState = { ...gameState };
    const currentPlayer = newState.players[newState.currentPlayer];

    // 更新宝石数量
    Object.entries(selectedGems).forEach(([gem, count]) => {
      const gemType = gem as GemType;
      newState.gems[gemType] -= count || 0;
      currentPlayer.gems[gemType] = (currentPlayer.gems[gemType] || 0) + (count || 0);
    });

    console.log('New state after taking gems:', newState); // 调试日志
    return this.endTurn(newState);
  }

  // 处理购买卡牌动作
  static purchaseCard(gameState: GameState, card: Card): GameState {
    const currentPlayer = gameState.players[gameState.currentPlayer];

    if (!GameValidator.canPurchaseCard(card, currentPlayer)) {
      throw new Error('Cannot purchase this card');
    }

    const newState = { ...gameState };
    const player = newState.players[newState.currentPlayer];

    // 支付费用
    Object.entries(card.cost).forEach(([gem, cost]) => {
      const gemType = gem as GemType;
      const playerGems = player.gems[gemType] || 0;

      if (playerGems >= cost) {
        player.gems[gemType] = playerGems - cost;
        newState.gems[gemType] = (newState.gems[gemType] || 0) + cost;
      } else {
        // 使用黄金补足差额
        const remaining = cost - playerGems;
        const availableGold = player.gems.gold || 0;

        if (availableGold < remaining) {
          throw new Error('Not enough gold tokens');
        }

        player.gems[gemType] = 0;
        player.gems.gold = availableGold - remaining;
        newState.gems.gold = (newState.gems.gold || 0) + remaining;
      }
    });

    // 添加卡牌到玩家手中
    player.cards.push(card);
    player.points += card.points;

    // 从展示区移除卡牌并补充
    this.removeAndReplenishCard(newState, card);

    // 检查是否可以获得贵族
    this.checkNobles(newState);

    return this.endTurn(newState);
  }

  // 处理预留卡牌动作
  static reserveCard(gameState: GameState, card: Card): GameState {
    const currentPlayer = gameState.players[gameState.currentPlayer];

    if (!GameValidator.canReserveCard(currentPlayer)) {
      throw new Error('Cannot reserve more cards');
    }

    const newState = { ...gameState };
    const player = newState.players[newState.currentPlayer];

    // 预留卡牌
    player.reservedCards.push(card);

    // 获得一个金色宝石（如果有）
    if (newState.gems.gold > 0) {
      newState.gems.gold--;
      player.gems.gold = (player.gems.gold || 0) + 1;
    }

    // 从展示区移除卡牌并补充
    this.removeAndReplenishCard(newState, card);

    return this.endTurn(newState);
  }

  // 移除并补充卡牌
  private static removeAndReplenishCard(gameState: GameState, card: Card): void {
    const level = `level${card.level}` as keyof typeof gameState.cards;
    const deck = `deck${card.level}` as keyof typeof gameState.cards;

    // 从展示区移除卡牌
    gameState.cards[level] = gameState.cards[level].filter(c => c.id !== card.id);

    // 如果牌堆还有牌，则补充一张
    if (gameState.cards[deck].length > 0) {
      const newCard = gameState.cards[deck].pop()!;
      gameState.cards[level].push(newCard);
    }
  }

  // 检查是否可以获得贵族
  private static checkNobles(gameState: GameState): void {
    const currentPlayer = gameState.players[gameState.currentPlayer];

    gameState.nobles = gameState.nobles.filter(noble => {
      if (GameValidator.canAcquireNoble(noble, currentPlayer)) {
        currentPlayer.nobles.push(noble);
        currentPlayer.points += noble.points;
        return false;
      }
      return true;
    });
  }

  // 结束回合
  private static endTurn(gameState: GameState): GameState {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    return gameState;
  }
} 