import { Card } from '../../types/game';

export const level2Cards: Card[] = [
  // 黑色卡牌 (6张)
  {
    id: 201,
    level: 2,
    points: 1,
    gem: 'onyx',
    cost: { diamond: 3, sapphire: 2, emerald: 2 },  // 3w+2u+2g
    spritePosition: { x: 0, y: 1 }
  },
  {
    id: 202,
    level: 2,
    points: 1,
    gem: 'onyx',
    cost: { diamond: 3, emerald: 3, onyx: 2 },  // 3w+3g+2k
    spritePosition: { x: 1, y: 1 }
  },
  {
    id: 203,
    level: 2,
    points: 2,
    gem: 'onyx',
    cost: { sapphire: 1, emerald: 4, ruby: 2 },  // 1u+4g+2r
    spritePosition: { x: 2, y: 1 }
  },
  {
    id: 204,
    level: 2,
    points: 2,
    gem: 'onyx',
    cost: { emerald: 5, ruby: 3 },  // 5g+3r
    spritePosition: { x: 3, y: 1 }
  },
  {
    id: 205,
    level: 2,
    points: 2,
    gem: 'onyx',
    cost: { diamond: 5 },  // 5w
    spritePosition: { x: 4, y: 1 }
  },
  {
    id: 206,
    level: 2,
    points: 3,
    gem: 'onyx',
    cost: { onyx: 6 },  // 6k
    spritePosition: { x: 0, y: 1 }
  },

  // 蓝宝石卡牌 (6张)
  {
    id: 207,
    level: 2,
    points: 1,
    gem: 'sapphire',
    cost: { sapphire: 2, emerald: 2, ruby: 3 },  // 2u+2g+3r
    spritePosition: { x: 0, y: 0 }
  },
  {
    id: 208,
    level: 2,
    points: 1,
    gem: 'sapphire',
    cost: { sapphire: 2, emerald: 3, onyx: 3 },  // 2u+3g+3k
    spritePosition: { x: 1, y: 0 }
  },
  {
    id: 209,
    level: 2,
    points: 2,
    gem: 'sapphire',
    cost: { diamond: 5, sapphire: 3 },  // 5w+3u
    spritePosition: { x: 2, y: 0 }
  },
  {
    id: 210,
    level: 2,
    points: 2,
    gem: 'sapphire',
    cost: { diamond: 2, ruby: 1, onyx: 4 },  // 2w+1r+4k
    spritePosition: { x: 3, y: 0 }
  },
  {
    id: 211,
    level: 2,
    points: 2,
    gem: 'sapphire',
    cost: { sapphire: 5 },  // 5u
    spritePosition: { x: 4, y: 0 }
  },
  {
    id: 212,
    level: 2,
    points: 3,
    gem: 'sapphire',
    cost: { sapphire: 6 },  // 6u
    spritePosition: { x: 0, y: 0 }
  },

  // 白宝石卡牌 (6张)
  {
    id: 213,
    level: 2,
    points: 1,
    gem: 'diamond',
    cost: { emerald: 3, ruby: 2, onyx: 2 },  // 3g+2r+2k
    spritePosition: { x: 0, y: 4 }
  },
  {
    id: 214,
    level: 2,
    points: 1,
    gem: 'diamond',
    cost: { diamond: 2, sapphire: 3, ruby: 3 },  // 2w+3u+3r
    spritePosition: { x: 1, y: 4 }
  },
  {
    id: 215,
    level: 2,
    points: 2,
    gem: 'diamond',
    cost: { emerald: 1, ruby: 4, onyx: 2 },  // 1g+4r+2k
    spritePosition: { x: 2, y: 4 }
  },
  {
    id: 216,
    level: 2,
    points: 2,
    gem: 'diamond',
    cost: { ruby: 5, onyx: 3 },  // 5r+3k
    spritePosition: { x: 3, y: 4 }
  },
  {
    id: 217,
    level: 2,
    points: 2,
    gem: 'diamond',
    cost: { ruby: 5 },  // 5r
    spritePosition: { x: 4, y: 4 }
  },
  {
    id: 218,
    level: 2,
    points: 3,
    gem: 'diamond',
    cost: { diamond: 6 },  // 6w
    spritePosition: { x: 0, y: 4 }
  },

  // 绿宝石卡牌 (6张)
  {
    id: 219,
    level: 2,
    points: 1,
    gem: 'emerald',
    cost: { diamond: 3, emerald: 2, ruby: 3 },  // 3w+2g+3r
    spritePosition: { x: 0, y: 3 }
  },
  {
    id: 220,
    level: 2,
    points: 1,
    gem: 'emerald',
    cost: { diamond: 2, sapphire: 3, onyx: 2 },  // 2w+3u+2k
    spritePosition: { x: 1, y: 3 }
  },
  {
    id: 221,
    level: 2,
    points: 2,
    gem: 'emerald',
    cost: { diamond: 4, sapphire: 2, onyx: 1 },  // 4w+2u+1k
    spritePosition: { x: 2, y: 3 }
  },
  {
    id: 222,
    level: 2,
    points: 2,
    gem: 'emerald',
    cost: { sapphire: 5, emerald: 3 },  // 5u+3g
    spritePosition: { x: 3, y: 3 }
  },
  {
    id: 223,
    level: 2,
    points: 2,
    gem: 'emerald',
    cost: { emerald: 5 },  // 5g
    spritePosition: { x: 4, y: 3 }
  },
  {
    id: 224,
    level: 2,
    points: 3,
    gem: 'emerald',
    cost: { emerald: 6 },  // 6g
    spritePosition: { x: 0, y: 3 }
  },

  // 红宝石卡牌 (6张)
  {
    id: 225,
    level: 2,
    points: 1,
    gem: 'ruby',
    cost: { diamond: 2, ruby: 2, onyx: 3 },  // 2w+2r+3k
    spritePosition: { x: 0, y: 2 }
  },
  {
    id: 226,
    level: 2,
    points: 1,
    gem: 'ruby',
    cost: { sapphire: 3, ruby: 2, onyx: 3 },  // 3u+2r+3k
    spritePosition: { x: 1, y: 2 }
  },
  {
    id: 227,
    level: 2,
    points: 2,
    gem: 'ruby',
    cost: { diamond: 1, sapphire: 4, emerald: 2 },  // 1w+4u+2g
    spritePosition: { x: 2, y: 2 }
  },
  {
    id: 228,
    level: 2,
    points: 2,
    gem: 'ruby',
    cost: { diamond: 3, onyx: 5 },  // 3w+5k
    spritePosition: { x: 3, y: 2 }
  },
  {
    id: 229,
    level: 2,
    points: 2,
    gem: 'ruby',
    cost: { onyx: 5 },  // 5k
    spritePosition: { x: 4, y: 2 }
  },
  {
    id: 230,
    level: 2,
    points: 3,
    gem: 'ruby',
    cost: { ruby: 6 },  // 6r
    spritePosition: { x: 0, y: 2 }
  }
]; 