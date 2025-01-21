import { GameValidator } from '../validator';
import { GameState, Player, Card } from '../../../types/game';

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
}); 