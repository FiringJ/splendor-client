import { GameState, Player, Card, Noble, GemType } from '../../types/game';

export class GameValidator {
  private static MAX_GEMS = 10;

  private static getCurrentGemCount(player: Player): number {
    return Object.values(player.gems).reduce((sum, count) => sum + (count || 0), 0);
  }

  // 验证拿取宝石是否合法
  static canTakeGems(
    selectedGems: Partial<Record<GemType, number>>,
    gameState: GameState
  ): boolean {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const currentGemCount = this.getCurrentGemCount(currentPlayer);
    const selectedGemCount = Object.values(selectedGems).reduce((a, b) => a + (b || 0), 0);

    // 检查是否会超过宝石上限
    if (currentGemCount + selectedGemCount > this.MAX_GEMS) {
      return false;
    }

    // 禁止选择黄金
    if (selectedGems.gold) return false;

    const differentColors = Object.keys(selectedGems).length;
    const sameColorCount = Math.max(...Object.values(selectedGems).map(v => v || 0));

    // 规则1: 如果选择2个同色宝石
    if (sameColorCount === 2) {
      // 必须只选择一种颜色，且该颜色必须有至少4个
      if (differentColors !== 1) return false;
      const gemType = Object.entries(selectedGems).find(([, count]) => count === 2)?.[0];
      if (!gemType) return false;
      return gameState.gems[gemType as GemType] >= 4;
    }

    // 规则2: 如果选择不同颜色
    if (sameColorCount === 1) {
      // 检查每种选择的宝石是否有足够数量
      for (const [gemType, count] of Object.entries(selectedGems)) {
        if ((gameState.gems[gemType as GemType] || 0) < (count || 0)) {
          return false;
        }
      }

      // 如果空间足够，必须选择3个不同颜色
      if (currentGemCount + 3 <= this.MAX_GEMS) {
        return differentColors === 3;
      }

      // 如果空间不足3个，允许选择1-2个不同颜色
      return differentColors > 0 && differentColors <= Math.min(3, this.MAX_GEMS - currentGemCount);
    }

    return false;
  }

  // 验证是否可以购买卡牌
  static canPurchaseCard(card: Card, player: Player): boolean {
    // 计算玩家拥有的资源（包括卡牌提供的永久宝石）
    const cardBonuses = player.cards.reduce((acc, c) => {
      acc[c.gem] = (acc[c.gem] || 0) + 1;
      return acc;
    }, {} as Partial<Record<GemType, number>>);

    // 检查每种宝石的需求
    for (const [gemType, required] of Object.entries(card.cost)) {
      if (!required) continue; // 跳过不需要的宝石类型

      const gemAvailable = player.gems[gemType as GemType] || 0;
      const cardBonus = cardBonuses[gemType as GemType] || 0;
      const totalAvailable = gemAvailable + cardBonus;

      // 如果总可用资源不足以支付成本
      if (totalAvailable < required) {
        // 计算还需要多少资源
        const shortfall = required - totalAvailable;
        // 检查是否有足够的黄金补足
        if ((player.gems.gold || 0) < shortfall) {
          console.log(`Need ${shortfall} gold for ${gemType}, but only have ${player.gems.gold || 0}`);
          return false;
        }
      }
    }

    return true;
  }

  // 验证是否可以预留卡牌
  static canReserveCard(player: Player): boolean {
    // 检查预留卡数量限制
    if (player.reservedCards.length >= 3) {
      return false;
    }

    // 如果要获得黄金，检查宝石总数是否会超过限制
    const currentGemCount = this.getCurrentGemCount(player);
    if (currentGemCount >= this.MAX_GEMS) {
      return false;
    }

    return true;
  }

  // 验证是否可以获得贵族
  static canAcquireNoble(noble: Noble, player: Player): boolean {
    // 计算玩家拥有的永久宝石（卡牌）
    const cardBonuses = player.cards.reduce((acc, card) => {
      acc[card.gem] = (acc[card.gem] || 0) + 1;
      return acc;
    }, {} as Partial<Record<GemType, number>>);

    // 检查是否满足贵族要求
    for (const [gemType, required] of Object.entries(noble.requirements)) {
      const owned = cardBonuses[gemType as GemType] || 0;
      if (owned < (required || 0)) {
        return false;
      }
    }

    return true;
  }

  // 计算玩家资源（包括宝石和卡牌）
  private static calculatePlayerResources(player: Player): Record<GemType, number> {
    const resources: Partial<Record<GemType, number>> = { ...player.gems };
    delete resources.gold; // 不计入黄金，因为黄金需要单独处理

    // 添加卡牌提供的宝石
    player.cards.forEach(card => {
      resources[card.gem] = (resources[card.gem] || 0) + 1;
    });

    return resources as Record<GemType, number>;
  }
} 