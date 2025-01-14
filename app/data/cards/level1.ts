import { Card } from '../../types/game';

export const level1Cards: Card[] = [
  // 黑色卡牌 (8张)
  {
    id: 101,
    level: 1,
    points: 0,
    gem: 'onyx',
    cost: { diamond: 1, sapphire: 1, emerald: 1, ruby: 1 },
    spritePosition: { x: 0, y: 1 }
  },
  {
    id: 102,
    level: 1,
    points: 0,
    gem: 'onyx',
    cost: { diamond: 1, sapphire: 2, emerald: 1, ruby: 1 },
    spritePosition: { x: 1, y: 1 }
  },
  {
    id: 103,
    level: 1,
    points: 0,
    gem: 'onyx',
    cost: { diamond: 2, sapphire: 2, ruby: 1 },
    spritePosition: { x: 2, y: 1 }
  },
  {
    id: 104,
    level: 1,
    points: 0,
    gem: 'onyx',
    cost: { emerald: 1, ruby: 3, onyx: 1 },
    spritePosition: { x: 3, y: 1 }
  },
  {
    id: 105,
    level: 1,
    points: 0,
    gem: 'onyx',
    cost: { emerald: 2, ruby: 1 },
    spritePosition: { x: 4, y: 1 }
  },
  {
    id: 106,
    level: 1,
    points: 0,
    gem: 'onyx',
    cost: { diamond: 2, emerald: 2 },
    spritePosition: { x: 0, y: 1 }
  },
  {
    id: 107,
    level: 1,
    points: 0,
    gem: 'onyx',
    cost: { emerald: 3 },
    spritePosition: { x: 1, y: 1 }
  },
  {
    id: 108,
    level: 1,
    points: 1,
    gem: 'onyx',
    cost: { sapphire: 4 },
    spritePosition: { x: 2, y: 1 }
  },

  // 蓝宝石卡牌 (8张)
  {
    id: 109,
    level: 1,
    points: 0,
    gem: 'sapphire',
    cost: { diamond: 1, emerald: 1, ruby: 1, onyx: 1 },
    spritePosition: { x: 0, y: 0 }
  },
  {
    id: 110,
    level: 1,
    points: 0,
    gem: 'sapphire',
    cost: { diamond: 1, emerald: 1, ruby: 2, onyx: 1 },
    spritePosition: { x: 1, y: 0 }
  },
  {
    id: 111,
    level: 1,
    points: 0,
    gem: 'sapphire',
    cost: { diamond: 1, emerald: 2, ruby: 2 },
    spritePosition: { x: 2, y: 0 }
  },
  {
    id: 112,
    level: 1,
    points: 0,
    gem: 'sapphire',
    cost: { sapphire: 1, emerald: 3, ruby: 1 },
    spritePosition: { x: 3, y: 0 }
  },
  {
    id: 113,
    level: 1,
    points: 0,
    gem: 'sapphire',
    cost: { diamond: 1, onyx: 2 },
    spritePosition: { x: 4, y: 0 }
  },
  {
    id: 114,
    level: 1,
    points: 0,
    gem: 'sapphire',
    cost: { emerald: 2, onyx: 2 },
    spritePosition: { x: 0, y: 0 }
  },
  {
    id: 115,
    level: 1,
    points: 1,
    gem: 'sapphire',
    cost: { ruby: 4 },
    spritePosition: { x: 1, y: 0 }
  },
  {
    id: 116,
    level: 1,
    points: 0,
    gem: 'sapphire',
    cost: { sapphire: 3 },
    spritePosition: { x: 2, y: 0 }
  },

  // 白宝石卡牌 (8张)
  {
    id: 117,
    level: 1,
    points: 0,
    gem: 'diamond',
    cost: { sapphire: 1, emerald: 1, ruby: 1, onyx: 1 },
    spritePosition: { x: 0, y: 4 }
  },
  {
    id: 118,
    level: 1,
    points: 0,
    gem: 'diamond',
    cost: { sapphire: 1, emerald: 2, ruby: 1, onyx: 1 },
    spritePosition: { x: 1, y: 4 }
  },
  {
    id: 119,
    level: 1,
    points: 0,
    gem: 'diamond',
    cost: { sapphire: 2, emerald: 2, onyx: 1 },
    spritePosition: { x: 2, y: 4 }
  },
  {
    id: 120,
    level: 1,
    points: 0,
    gem: 'diamond',
    cost: { diamond: 3, sapphire: 1, onyx: 1 },
    spritePosition: { x: 3, y: 4 }
  },
  {
    id: 121,
    level: 1,
    points: 0,
    gem: 'diamond',
    cost: { ruby: 2, onyx: 1 },
    spritePosition: { x: 4, y: 4 }
  },
  {
    id: 122,
    level: 1,
    points: 0,
    gem: 'diamond',
    cost: { sapphire: 2, onyx: 2 },
    spritePosition: { x: 0, y: 4 }
  },
  {
    id: 123,
    level: 1,
    points: 1,
    gem: 'diamond',
    cost: { emerald: 4 },
    spritePosition: { x: 1, y: 4 }
  },
  {
    id: 124,
    level: 1,
    points: 0,
    gem: 'diamond',
    cost: { diamond: 3 },
    spritePosition: { x: 2, y: 4 }
  },

  // 绿宝石卡牌 (8张)
  {
    id: 125,
    level: 1,
    points: 0,
    gem: 'emerald',
    cost: { diamond: 1, sapphire: 1, ruby: 1, onyx: 1 },
    spritePosition: { x: 0, y: 3 }
  },
  {
    id: 126,
    level: 1,
    points: 0,
    gem: 'emerald',
    cost: { diamond: 1, sapphire: 1, ruby: 1, onyx: 2 },
    spritePosition: { x: 1, y: 3 }
  },
  {
    id: 127,
    level: 1,
    points: 0,
    gem: 'emerald',
    cost: { sapphire: 1, ruby: 2, onyx: 2 },
    spritePosition: { x: 2, y: 3 }
  },
  {
    id: 128,
    level: 1,
    points: 0,
    gem: 'emerald',
    cost: { diamond: 1, sapphire: 3, emerald: 1 },
    spritePosition: { x: 3, y: 3 }
  },
  {
    id: 129,
    level: 1,
    points: 0,
    gem: 'emerald',
    cost: { diamond: 2, sapphire: 1 },
    spritePosition: { x: 4, y: 3 }
  },
  {
    id: 130,
    level: 1,
    points: 0,
    gem: 'emerald',
    cost: { sapphire: 2, ruby: 2 },
    spritePosition: { x: 0, y: 3 }
  },
  {
    id: 131,
    level: 1,
    points: 1,
    gem: 'emerald',
    cost: { onyx: 4 },
    spritePosition: { x: 1, y: 3 }
  },
  {
    id: 132,
    level: 1,
    points: 0,
    gem: 'emerald',
    cost: { ruby: 3 },
    spritePosition: { x: 2, y: 3 }
  },

  // 红宝石卡牌 (8张)
  {
    id: 133,
    level: 1,
    points: 0,
    gem: 'ruby',
    cost: { diamond: 1, sapphire: 1, emerald: 1, onyx: 1 },
    spritePosition: { x: 0, y: 2 }
  },
  {
    id: 134,
    level: 1,
    points: 0,
    gem: 'ruby',
    cost: { diamond: 2, sapphire: 1, emerald: 1, onyx: 1 },
    spritePosition: { x: 1, y: 2 }
  },
  {
    id: 135,
    level: 1,
    points: 0,
    gem: 'ruby',
    cost: { diamond: 2, emerald: 1, onyx: 2 },
    spritePosition: { x: 2, y: 2 }
  },
  {
    id: 136,
    level: 1,
    points: 0,
    gem: 'ruby',
    cost: { diamond: 1, ruby: 1, onyx: 3 },
    spritePosition: { x: 3, y: 2 }
  },
  {
    id: 137,
    level: 1,
    points: 0,
    gem: 'ruby',
    cost: { sapphire: 2, emerald: 1 },
    spritePosition: { x: 4, y: 2 }
  },
  {
    id: 138,
    level: 1,
    points: 0,
    gem: 'ruby',
    cost: { diamond: 2, ruby: 2 },
    spritePosition: { x: 0, y: 2 }
  },
  {
    id: 139,
    level: 1,
    points: 0,
    gem: 'ruby',
    cost: { diamond: 3 },
    spritePosition: { x: 1, y: 2 }
  },
  {
    id: 140,
    level: 1,
    points: 1,
    gem: 'ruby',
    cost: { diamond: 4 },
    spritePosition: { x: 2, y: 2 }
  }
]; 