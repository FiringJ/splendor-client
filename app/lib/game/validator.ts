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

    // 检查玩家宝石总数是否会超过10个
    const currentGemCount = Object.values(currentPlayer.gems).reduce((sum: number, count: number) => sum + count, 0);
    if (currentGemCount + selectedCount > 10) return false;

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

    // 检查当前已选择的这个颜色的数量
    const currentColorCount = currentGems[newGemType] || 0;

    // 创建新的宝石选择状态
    const newSelectedGems = { ...currentGems };

    // 如果已经选择了一个这个颜色的宝石
    if (currentColorCount === 1) {
      // 检查是否可以选择第二个相同颜色的宝石
      if (availableGems >= 4 && Object.keys(currentGems).length === 1) {
        newSelectedGems[newGemType] = 2;
      } else {
        return {
          isValid: false,
          error: "你不能选择两个相同颜色的宝石，除非场上有4个或以上且只选择这一种颜色",
          updatedGems: currentGems
        };
      }
    } else {
      // 检查是否已经选择了3种不同颜色
      if (Object.keys(currentGems).length >= 3) {
        return {
          isValid: false,
          error: "你最多只能选择3种不同颜色的宝石",
          updatedGems: currentGems
        };
      }
      // 添加一个新的颜色
      newSelectedGems[newGemType] = 1;
    }

    // 检查玩家当前的宝石总数
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentTurn);
    if (currentPlayer) {
      const currentGemCount = Object.values(currentPlayer.gems).reduce((sum, count) => sum + count, 0);
      const selectedGemCount = Object.values(newSelectedGems).reduce((sum, count) => sum + count, 0);

      // 检查是否超过10个宝石限制
      if (currentGemCount + selectedGemCount > 10) {
        return {
          isValid: false,
          error: "你的宝石总数不能超过10个",
          updatedGems: currentGems
        };
      }
    }

    return {
      isValid: true,
      error: null,
      updatedGems: newSelectedGems
    };
  }
} 