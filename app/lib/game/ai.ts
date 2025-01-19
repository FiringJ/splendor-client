import { GameState, Card, Noble, GemType, Player, GameAction } from '../../types/game';
import { GameValidator } from './validator';

export class AIPlayer {
  private static evaluateCard(card: Card, player: Player): number {
    let score = card.points * 3; // 基础分数

    // 考虑卡牌提供的宝石类型的价值
    const ownedGemTypes = player.cards.reduce((acc, c) => {
      acc[c.gem] = (acc[c.gem] || 0) + 1;
      return acc;
    }, {} as Partial<Record<GemType, number>>);

    // 如果这种宝石类型较少，增加其价值
    if (!ownedGemTypes[card.gem]) {
      score += 2;
    }

    // 计算购买所需成本
    const totalCost = Object.values(card.cost).reduce((sum, cost) => sum + (cost || 0), 0);
    score -= totalCost * 0.5; // 成本越高，价值越低

    // 如果玩家宝石接近上限，增加可购买卡牌的优先级
    const totalGems = Object.values(player.gems).reduce((sum, count) => sum + (count || 0), 0);
    if (totalGems >= 8) {
      score += 5;
    }

    return score;
  }

  private static evaluateNoble(noble: Noble, player: Player): number {
    let score = noble.points * 4; // 贵族分数价值更高

    // 计算达成贵族要求的进度
    const progress = Object.entries(noble.requirements).reduce((acc, [gem, required]) => {
      const owned = player.cards.filter(card => card.gem === gem).length;
      return acc + (owned / (required || 1));
    }, 0);

    score *= (progress / Object.keys(noble.requirements).length);
    return score;
  }

  private static getCurrentGemCount(player: Player): number {
    return Object.values(player.gems).reduce((sum, count) => sum + (count || 0), 0);
  }

  private static selectGems(gameState: GameState, player: Player): Partial<Record<GemType, number>> {
    const availableGems = Object.entries(gameState.gems)
      .filter(([gem, count]) => gem !== 'gold' && count > 0)
      .map(([gem, count]) => ({ gem: gem as GemType, count }));

    const currentGemCount = this.getCurrentGemCount(player);
    const remainingSpace = 10 - currentGemCount;

    // 如果没有空间拿取宝石，返回空
    if (remainingSpace <= 0) return {};

    // 如果宝石数量接近上限，优先考虑单个宝石
    if (currentGemCount >= 8) {
      const mostNeededGem = availableGems[0]?.gem;
      if (mostNeededGem) {
        return { [mostNeededGem]: 1 };
      }
      return {};
    }

    // 策略1：优先尝试拿取2个同色宝石（如果有数量>=4的宝石）
    if (remainingSpace >= 2) {
      const doubleGemOptions = availableGems.filter(({ count }) => count >= 4);
      if (doubleGemOptions.length > 0) {
        const bestGem = doubleGemOptions[0].gem;
        return { [bestGem]: 2 };
      }
    }

    // 策略2：尝试拿取3个不同颜色的宝石
    if (remainingSpace >= 3 && availableGems.length >= 3) {
      const selectedGems: Partial<Record<GemType, number>> = {};
      for (let i = 0; i < Math.min(3, remainingSpace, availableGems.length); i++) {
        selectedGems[availableGems[i].gem] = 1;
      }
      return selectedGems;
    }

    // 策略3：如果只能拿1-2个宝石，就拿最需要的宝石
    if (remainingSpace > 0 && availableGems.length > 0) {
      return { [availableGems[0].gem]: 1 };
    }

    return {};
  }

  static getNextAction(gameState: GameState): GameAction {
    const player = gameState.players[gameState.currentPlayer];
    const possibleCards = [
      ...gameState.cards.level1,
      ...gameState.cards.level2,
      ...gameState.cards.level3,
      ...player.reservedCards
    ];

    // 1. 检查是否可以购买任何卡牌
    const purchasableCards = possibleCards.filter(card =>
      GameValidator.canPurchaseCard(card, player)
    );

    if (purchasableCards.length > 0) {
      // 选择最有价值的卡牌购买
      const bestCard = purchasableCards.reduce((best, card) => {
        const score = this.evaluateCard(card, player);
        return score > best.score ? { card, score } : best;
      }, { card: purchasableCards[0], score: -Infinity });

      return {
        type: 'purchaseCard',
        playerId: player.id,
        playerName: player.name,
        details: {
          card: {
            gem: bestCard.card.gem,
            points: bestCard.card.points
          }
        },
        timestamp: Date.now()
      };
    }

    // 2. 如果宝石接近上限（8个或更多），考虑预留卡牌
    const currentGemCount = this.getCurrentGemCount(player);
    if (currentGemCount >= 8 && player.reservedCards.length < 3) {
      const availableCards = [
        ...gameState.cards.level3,
        ...gameState.cards.level2,
        ...gameState.cards.level1
      ].filter(card => !player.reservedCards.includes(card));

      if (availableCards.length > 0) {
        const bestCard = availableCards[0]; // 可以添加更复杂的卡牌评估逻辑
        return {
          type: 'reserveCard',
          playerId: player.id,
          playerName: player.name,
          details: {
            card: {
              gem: bestCard.gem,
              points: bestCard.points
            }
          },
          timestamp: Date.now()
        };
      }
    }

    // 3. 考虑拿取宝石
    const selectedGems = this.selectGems(gameState, player);
    if (Object.keys(selectedGems).length > 0) {
      return {
        type: 'takeGems',
        playerId: player.id,
        playerName: player.name,
        details: {
          gems: selectedGems
        },
        timestamp: Date.now()
      };
    }

    // 4. 如果其他操作都不可行，结束回合
    return {
      type: 'endTurn',
      playerId: player.id,
      playerName: player.name,
      details: {},
      timestamp: Date.now()
    };
  }
} 