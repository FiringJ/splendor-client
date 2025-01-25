'use client';

import type { GameState, GameAction, Card, Noble, GemType, Player } from '../../types/game';

export class GameValidator {
  static canPurchaseCard(gameState: GameState, action: GameAction): boolean {
    if (action.type !== 'PURCHASE_CARD') return false;
    const currentPlayer = gameState.players.get(gameState.currentTurn || '');
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
    const currentPlayer = gameState.players.get(gameState.currentTurn || '');
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
    const currentPlayer = gameState.players.get(gameState.currentTurn || '');
    if (!currentPlayer) return false;

    // 检查是否是当前玩家的回合
    if (currentPlayer.id !== gameState.currentTurn) return false;

    const { gems } = action.payload;
    const selectedCount = Object.values(gems).reduce((sum, count) => sum + count, 0);
    if (selectedCount === 0) return false;

    // 检查玩家宝石总数是否会超过10个
    const currentGemCount = Object.values(currentPlayer.gems).reduce((sum, count) => sum + count, 0);
    if (currentGemCount + selectedCount > 10) return false;

    // 检查是否有足够的宝石可以拿
    for (const [type, count] of Object.entries(gems) as [GemType, number][]) {
      if (count > 0 && (gameState.gems[type] ?? 0) < count) return false;
    }

    // 检查选择的宝石是否符合规则
    const differentColors = Object.entries(gems).filter(([, count]) => count > 0).length;
    const maxCount = Math.max(...Object.values(gems));

    // 规则1：可以拿3个不同颜色的宝石
    if (differentColors === 3 && maxCount === 1) return true;

    // 规则2：可以拿2个相同颜色的宝石（当该颜色宝石数量大于等于4个时）
    if (differentColors === 1 && maxCount === 2) {
      const [gemType] = Object.entries(gems).find(([, count]) => count === 2) || [];
      if (gemType && (gameState.gems[gemType as GemType] ?? 0) >= 4) return true;
    }

    return false;
  }

  static canClaimNoble(gameState: GameState, action: GameAction): boolean {
    if (action.type !== 'CLAIM_NOBLE') return false;
    const currentPlayer = gameState.players.get(gameState.currentTurn || '');
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
} 