'use client';

import type { GameState, GameAction, Card, Noble, GemType, Player } from '../../types/game';

export class GameValidator {
  static canPurchaseCard(gameState: GameState, action: GameAction): boolean {
    if (action.type !== 'PURCHASE_CARD') return false;
    const currentPlayer = gameState.players.find((p: Player) => p.id === gameState.currentTurn);
    if (!currentPlayer) return false;

    // 检查是否是当前玩家的回合
    if (currentPlayer.id !== gameState.currentTurn) return false;

    const { cardId, level } = action.payload;
    const card = this.findCard(gameState, cardId, level);
    if (!card) return false;

    return this.hasEnoughResources(currentPlayer, card);
  }

  static canReserveCard(gameState: GameState, action: GameAction): boolean {
    if (action.type !== 'RESERVE_CARD') return false;
    const currentPlayer = gameState.players.find((p: Player) => p.id === gameState.currentTurn);
    if (!currentPlayer) return false;

    // 检查是否是当前玩家的回合
    if (currentPlayer.id !== gameState.currentTurn) return false;

    // 检查预留卡数量限制
    if (currentPlayer.reservedCards.length >= 3) return false;

    const { cardId, level } = action.payload;
    // 如果是从牌堆预定
    if (cardId.startsWith('deck')) {
      const deckCards = level === 1 ? gameState.cards.deck1 :
        level === 2 ? gameState.cards.deck2 :
          level === 3 ? gameState.cards.deck3 : [];
      return deckCards.length > 0;
    }

    // 如果是预定可见的卡牌
    const card = this.findCard(gameState, cardId, level);
    return !!card;
  }

  static canTakeGems(gameState: GameState, action: GameAction): boolean {
    if (action.type !== 'TAKE_GEMS') return false;
    const currentPlayer = gameState.players.find((p: Player) => p.id === gameState.currentTurn);
    if (!currentPlayer) return false;

    const { gems } = action.payload;
    const selectedCount = Object.values(gems).reduce((sum: number, count: number) => sum + count, 0);
    if (selectedCount === 0) return false;

    // 检查是否有足够的宝石可以拿
    for (const [type, count] of Object.entries(gems) as [GemType, number][]) {
      if (count > 0 && (gameState.gems[type] ?? 0) < count) return false;
    }

    // 获取选择的不同颜色数量
    const selectedColors = Object.entries(gems).filter(([, count]) => count > 0);
    const differentColors = selectedColors.length;

    // 检查是否符合规则
    if (differentColors === 0) return false;
    if (differentColors > 3) return false;

    // 如果只选择了一种颜色
    if (differentColors === 1) {
      const [gemType, count] = selectedColors[0];
      // 选择两个相同颜色的条件：场上必须有4个或以上
      if (count === 2) {
        return (gameState.gems[gemType as GemType] ?? 0) >= 4;
      }
      // 选择一个的情况总是允许的（如果有足够的宝石）
      return count === 1;
    }

    // 如果选择了多种颜色
    // 1. 每种颜色只能选择一个
    if (selectedColors.some(([, count]) => count > 1)) return false;
    // 2. 最多选择三种不同颜色
    return differentColors <= 3;
  }

  static canClaimNoble(gameState: GameState, action: GameAction): boolean {
    if (action.type !== 'CLAIM_NOBLE') return false;
    const currentPlayer = gameState.players.find((p: Player) => p.id === gameState.currentTurn);
    if (!currentPlayer) return false;

    // 检查是否是当前玩家的回合
    if (currentPlayer.id !== gameState.currentTurn) return false;

    const { nobleId } = action.payload;
    const noble = gameState.nobles.find(n => n.id === nobleId);
    if (!noble) return false;

    return this.meetsNobleRequirements(currentPlayer, noble);
  }

  private static findCard(gameState: GameState, cardId: string, level: number): Card | undefined {
    const cards = level === 1 ? gameState.cards.level1 :
      level === 2 ? gameState.cards.level2 :
        level === 3 ? gameState.cards.level3 : [];

    return cards.find(card => card.id === cardId);
  }

  private static hasEnoughResources(player: Player, card: Card): boolean {
    const cardCounts = player.cards.reduce((counts: Record<GemType, number>, card: Card) => {
      counts[card.gem] = (counts[card.gem] || 0) + 1;
      return counts;
    }, {} as Record<GemType, number>);

    let remainingGold = player.gems.gold || 0;

    for (const [gemType, required] of Object.entries(card.cost) as [GemType, number][]) {
      const available = (cardCounts[gemType] || 0) + (player.gems[gemType] || 0);
      const goldNeeded = Math.max(0, required - available);
      if (goldNeeded > remainingGold) return false;
      remainingGold -= goldNeeded;
    }

    return true;
  }

  private static meetsNobleRequirements(player: Player, noble: Noble): boolean {
    const cardCounts = player.cards.reduce((counts: Record<GemType, number>, card: Card) => {
      counts[card.gem] = (counts[card.gem] || 0) + 1;
      return counts;
    }, {} as Record<GemType, number>);

    for (const [gemType, required] of Object.entries(noble.requirements) as [GemType, number][]) {
      if ((cardCounts[gemType] || 0) < required) return false;
    }

    return true;
  }

  /**
   * 检查新增一个宝石选择是否有效
   * @param gameState 当前游戏状态
   * @param currentGems 当前已选择的宝石
   * @param newGemType 新要选择的宝石类型
   * @returns 包含验证结果和错误信息的对象
   */
  static validateGemSelection(
    gameState: GameState,
    currentGems: Partial<Record<GemType, number>>,
    newGemType: GemType
  ): { isValid: boolean; error: string | null; updatedGems: Partial<Record<GemType, number>> } {
    // 检查当前场上该类型宝石的数量
    const availableGems = gameState.gems[newGemType] ?? 0;
    if (availableGems === 0) {
      return {
        isValid: false,
        error: "该颜色的宝石已经没有了",
        updatedGems: currentGems
      };
    }

    // 检查当前已选择的这个颜色的数量
    const currentColorCount = currentGems[newGemType] || 0;
    const selectedColorsCount = Object.keys(currentGems).length;

    // 创建新的宝石选择状态
    const newSelectedGems = { ...currentGems };

    // 如果已经选择了一个这个颜色的宝石
    if (currentColorCount === 1) {
      // 检查是否可以选择第二个相同颜色的宝石
      if (availableGems >= 4 && selectedColorsCount === 1) {
        newSelectedGems[newGemType] = 2;
        return {
          isValid: true,
          error: null,
          updatedGems: newSelectedGems
        };
      } else {
        return {
          isValid: false,
          error: "只有当场上有4个或以上相同颜色的宝石时，才能选择2个相同颜色的宝石",
          updatedGems: currentGems
        };
      }
    }

    // 如果是新的颜色
    if (currentColorCount === 0) {
      // 检查是否已经选择了3种不同颜色
      if (selectedColorsCount >= 3) {
        return {
          isValid: false,
          error: "你已经选择了3种不同颜色的宝石",
          updatedGems: currentGems
        };
      }

      // 如果已经有选择了2个相同颜色的宝石，不能再选择其他颜色
      const hasTwoSameColor = Object.values(currentGems).some(count => count === 2);
      if (hasTwoSameColor) {
        return {
          isValid: false,
          error: "已经选择了2个相同颜色的宝石，不能再选择其他颜色",
          updatedGems: currentGems
        };
      }

      newSelectedGems[newGemType] = 1;
      return {
        isValid: true,
        error: null,
        updatedGems: newSelectedGems
      };
    }

    return {
      isValid: false,
      error: "无效的选择",
      updatedGems: currentGems
    };
  }
} 