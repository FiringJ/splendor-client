import { GameValidator } from '../validator';
import { GameState, Player, Card, Noble } from '../../../types/game';

describe('GameValidator', () => {
  describe('canTakeGems', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = {
        currentPlayer: 0,
        players: [{
          id: '1',
          name: 'Player 1',
          gems: {},
          cards: [],
          reservedCards: [],
          nobles: [],
          points: 0
        }],
        gems: {
          diamond: 4,
          sapphire: 4,
          emerald: 4,
          ruby: 4,
          onyx: 4,
          gold: 5
        },
        cards: {
          level1: [],
          level2: [],
          level3: [],
          deck1: [],
          deck2: [],
          deck3: []
        },
        nobles: [],
        status: 'playing',
        lastRound: false,
        lastRoundStartPlayer: null,
        winner: null,
        actions: []
      };
    });

    test('应该允许拿取两个同色宝石当数量充足时', () => {
      const result = GameValidator.canTakeGems(
        { ruby: 2 },
        gameState
      );
      expect(result).toBe(true);
    });

    test('不应该允许拿取两个同色宝石当数量不足时', () => {
      gameState.gems.ruby = 3;
      const result = GameValidator.canTakeGems(
        { ruby: 2 },
        gameState
      );
      expect(result).toBe(false);
    });

    test('应该允许拿取三个不同颜色的宝石', () => {
      const result = GameValidator.canTakeGems(
        { ruby: 1, sapphire: 1, emerald: 1 },
        gameState
      );
      expect(result).toBe(true);
    });

    test('不应该允许拿取超过三个不同颜色的宝石', () => {
      const result = GameValidator.canTakeGems(
        { ruby: 1, sapphire: 1, emerald: 1, diamond: 1 },
        gameState
      );
      expect(result).toBe(false);
    });
  });

  describe('canPurchaseCard', () => {
    let player: Player;
    let card: Card;

    beforeEach(() => {
      player = {
        id: '1',
        name: 'Player 1',
        gems: {
          ruby: 2,
          sapphire: 2,
          emerald: 2,
          diamond: 2,
          onyx: 2,
          gold: 2
        },
        cards: [],
        reservedCards: [],
        nobles: [],
        points: 0
      };

      card = {
        id: 1,
        level: 1,
        cost: {
          ruby: 2,
          sapphire: 1
        },
        points: 1,
        gem: 'emerald',
        spritePosition: { x: 0, y: 0 }
      };
    });

    test('应该允许购买卡牌当有足够资源时', () => {
      const result = GameValidator.canPurchaseCard(card, player);
      expect(result).toBe(true);
    });

    test('不应该允许购买卡牌当资源不足时', () => {
      // 设置卡牌成本更高
      card.cost = {
        ruby: 3,
        sapphire: 2
      };
      // 玩家资源不足
      player.gems.ruby = 1;
      player.gems.sapphire = 1;
      player.gems.gold = 1; // 只有一个金币，不足以补足缺口
      const result = GameValidator.canPurchaseCard(card, player);
      expect(result).toBe(false);
    });

    test('应该考虑已有卡牌提供的加成', () => {
      player.gems.ruby = 1;
      player.cards.push({
        id: 2,
        level: 1,
        cost: {},
        points: 0,
        gem: 'ruby',
        spritePosition: { x: 0, y: 0 }
      });
      const result = GameValidator.canPurchaseCard(card, player);
      expect(result).toBe(true);
    });
  });

  describe('canReserveCard', () => {
    let player: Player;

    beforeEach(() => {
      player = {
        id: '1',
        name: 'Player 1',
        gems: {
          ruby: 1,
          sapphire: 1,
          emerald: 1,
          diamond: 1,
          onyx: 1,
          gold: 0
        },
        cards: [],
        reservedCards: [],
        nobles: [],
        points: 0
      };
    });

    test('应该允许预留卡牌当预留数量未达到上限时', () => {
      const result = GameValidator.canReserveCard(player);
      expect(result).toBe(true);
    });

    test('不应该允许预留卡牌当已有3张预留卡时', () => {
      player.reservedCards = [
        {
          id: 1,
          level: 1,
          cost: {},
          points: 0,
          gem: 'ruby',
          spritePosition: { x: 0, y: 0 }
        },
        {
          id: 2,
          level: 1,
          cost: {},
          points: 0,
          gem: 'sapphire',
          spritePosition: { x: 0, y: 0 }
        },
        {
          id: 3,
          level: 1,
          cost: {},
          points: 0,
          gem: 'emerald',
          spritePosition: { x: 0, y: 0 }
        }
      ];
      const result = GameValidator.canReserveCard(player);
      expect(result).toBe(false);
    });

    test('不应该允许预留卡牌当宝石数量已达到上限时', () => {
      player.gems = {
        ruby: 4,
        sapphire: 2,
        emerald: 1,
        diamond: 1,
        onyx: 2,
        gold: 0
      }; // 总共10个宝石，已达到上限
      const result = GameValidator.canReserveCard(player);
      expect(result).toBe(false);
    });
  });

  describe('canAcquireNoble', () => {
    let player: Player;
    let noble: Noble;

    beforeEach(() => {
      player = {
        id: '1',
        name: 'Player 1',
        gems: {},
        cards: [],
        reservedCards: [],
        nobles: [],
        points: 0
      };

      noble = {
        id: 1,
        points: 3,
        name: 'Test Noble',
        requirements: {
          ruby: 3,
          sapphire: 2
        }
      };
    });

    test('应该允许获得贵族当满足所有要求时', () => {
      // 添加足够的卡牌以满足贵族要求
      player.cards = [
        { id: 1, level: 1, cost: {}, points: 0, gem: 'ruby', spritePosition: { x: 0, y: 0 } },
        { id: 2, level: 1, cost: {}, points: 0, gem: 'ruby', spritePosition: { x: 0, y: 0 } },
        { id: 3, level: 1, cost: {}, points: 0, gem: 'ruby', spritePosition: { x: 0, y: 0 } },
        { id: 4, level: 1, cost: {}, points: 0, gem: 'sapphire', spritePosition: { x: 0, y: 0 } },
        { id: 5, level: 1, cost: {}, points: 0, gem: 'sapphire', spritePosition: { x: 0, y: 0 } }
      ];
      const result = GameValidator.canAcquireNoble(noble, player);
      expect(result).toBe(true);
    });

    test('不应该允许获得贵族当不满足要求时', () => {
      // 添加不足的卡牌
      player.cards = [
        { id: 1, level: 1, cost: {}, points: 0, gem: 'ruby', spritePosition: { x: 0, y: 0 } },
        { id: 2, level: 1, cost: {}, points: 0, gem: 'ruby', spritePosition: { x: 0, y: 0 } },
        { id: 3, level: 1, cost: {}, points: 0, gem: 'sapphire', spritePosition: { x: 0, y: 0 } }
      ];
      const result = GameValidator.canAcquireNoble(noble, player);
      expect(result).toBe(false);
    });

    test('不应该允许获得贵族当完全没有所需卡牌时', () => {
      // 玩家没有任何卡牌
      const result = GameValidator.canAcquireNoble(noble, player);
      expect(result).toBe(false);
    });

    test('应该正确处理没有要求的宝石类型', () => {
      // 贵族只要求红宝石
      noble.requirements = {
        ruby: 2
      };

      // 玩家有足够的红宝石卡牌，以及其他类型的卡牌
      player.cards = [
        { id: 1, level: 1, cost: {}, points: 0, gem: 'ruby', spritePosition: { x: 0, y: 0 } },
        { id: 2, level: 1, cost: {}, points: 0, gem: 'ruby', spritePosition: { x: 0, y: 0 } },
        { id: 3, level: 1, cost: {}, points: 0, gem: 'emerald', spritePosition: { x: 0, y: 0 } }
      ];
      const result = GameValidator.canAcquireNoble(noble, player);
      expect(result).toBe(true);
    });
  });
}); 