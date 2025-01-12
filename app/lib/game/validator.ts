import { GameState, Player, Card, Noble, GemType } from '../../types/game';

export class GameValidator {
  // 验证拿取宝石是否合法
  static canTakeGems(
    selectedGems: Partial<Record<GemType, number>>,
    gameState: GameState
  ): boolean {
    const totalSelected = Object.values(selectedGems).reduce((a, b) => a + (b || 0), 0);
    const sameColorCount = Math.max(...Object.values(selectedGems).map(v => v || 0));

    // 规则1: 最多拿3个不同颜色的宝石
    if (totalSelected > 3) return false;

    // 规则2: 如果拿2个同色宝石，不能拿其他颜色
    if (sameColorCount === 2 && totalSelected > 2) return false;

    // 规则3: 同色宝石必须有足够数量
    for (const [gem, count] of Object.entries(selectedGems)) {
      if ((gameState.gems[gem as GemType] || 0) < (count || 0)) return false;
    }

    return true;
  }

  // 验证是否可以购买卡牌
  static canPurchaseCard(card: Card, player: Player): boolean {
    const playerResources = this.calculatePlayerResources(player);

    for (const [gem, cost] of Object.entries(card.cost)) {
      const available = (playerResources[gem as GemType] || 0) +
        (player.gems['gold'] || 0);
      if (available < cost) return false;
    }

    return true;
  }

  // 验证是否可以预留卡牌
  static canReserveCard(player: Player): boolean {
    return (player.reservedCards.length < 3);
  }

  // 验证是否可以获得贵族
  static canAcquireNoble(noble: Noble, player: Player): boolean {
    const playerCards = this.calculatePlayerResources(player);

    for (const [gem, required] of Object.entries(noble.requirements)) {
      if ((playerCards[gem as GemType] || 0) < required) return false;
    }

    return true;
  }

  // 计算玩家资源（包括宝石和卡牌）
  private static calculatePlayerResources(player: Player): Record<GemType, number> {
    const resources: Partial<Record<GemType, number>> = { ...player.gems };

    // 添加卡牌提供的宝石
    player.cards.forEach(card => {
      resources[card.gem] = (resources[card.gem] || 0) + 1;
    });

    return resources as Record<GemType, number>;
  }
} 