import { Card } from '../../types/game';

export const level3Cards: Card[] = [
  // 黑色卡牌 (4张)
  {
    id: 301,
    level: 3,
    points: 3,
    gem: 'onyx',
    cost: { diamond: 3, sapphire: 3, emerald: 5, ruby: 3 },  // 3w+3u+5g+3r
    spritePosition: { x: 0, y: 1 }
  },
  {
    id: 302,
    level: 3,
    points: 4,
    gem: 'onyx',
    cost: { ruby: 7 },  // 7r
    spritePosition: { x: 1, y: 1 }
  },
  {
    id: 303,
    level: 3,
    points: 4,
    gem: 'onyx',
    cost: { emerald: 3, ruby: 6, onyx: 3 },  // 3g+6r+3k
    spritePosition: { x: 2, y: 1 }
  },
  {
    id: 304,
    level: 3,
    points: 5,
    gem: 'onyx',
    cost: { ruby: 7, onyx: 3 },  // 7r+3k
    spritePosition: { x: 3, y: 1 }
  },

  // 蓝宝石卡牌 (4张)
  {
    id: 305,
    level: 3,
    points: 3,
    gem: 'sapphire',
    cost: { diamond: 3, emerald: 3, ruby: 3, onyx: 5 },  // 3w+3g+3r+5k
    spritePosition: { x: 0, y: 0 }
  },
  {
    id: 306,
    level: 3,
    points: 4,
    gem: 'sapphire',
    cost: { diamond: 7 },  // 7w
    spritePosition: { x: 1, y: 0 }
  },
  {
    id: 307,
    level: 3,
    points: 4,
    gem: 'sapphire',
    cost: { diamond: 6, sapphire: 3, onyx: 3 },  // 6w+3u+3k
    spritePosition: { x: 2, y: 0 }
  },
  {
    id: 308,
    level: 3,
    points: 5,
    gem: 'sapphire',
    cost: { diamond: 7, sapphire: 3 },  // 7w+3u
    spritePosition: { x: 3, y: 0 }
  },

  // 白宝石卡牌 (4张)
  {
    id: 309,
    level: 3,
    points: 3,
    gem: 'diamond',
    cost: { sapphire: 3, emerald: 3, ruby: 5, onyx: 3 },  // 3u+3g+5r+3k
    spritePosition: { x: 0, y: 4 }
  },
  {
    id: 310,
    level: 3,
    points: 4,
    gem: 'diamond',
    cost: { onyx: 7 },  // 7k
    spritePosition: { x: 1, y: 4 }
  },
  {
    id: 311,
    level: 3,
    points: 4,
    gem: 'diamond',
    cost: { diamond: 3, ruby: 3, onyx: 6 },  // 3w+3r+6k
    spritePosition: { x: 2, y: 4 }
  },
  {
    id: 312,
    level: 3,
    points: 5,
    gem: 'diamond',
    cost: { diamond: 3, onyx: 7 },  // 3w+7k
    spritePosition: { x: 3, y: 4 }
  },

  // 绿宝石卡牌 (4张)
  {
    id: 313,
    level: 3,
    points: 3,
    gem: 'emerald',
    cost: { diamond: 5, sapphire: 3, ruby: 3, onyx: 3 },  // 5w+3u+3r+3k
    spritePosition: { x: 0, y: 3 }
  },
  {
    id: 314,
    level: 3,
    points: 4,
    gem: 'emerald',
    cost: { sapphire: 7 },  // 7u
    spritePosition: { x: 1, y: 3 }
  },
  {
    id: 315,
    level: 3,
    points: 4,
    gem: 'emerald',
    cost: { diamond: 3, sapphire: 6, emerald: 3 },  // 3w+6u+3g
    spritePosition: { x: 2, y: 3 }
  },
  {
    id: 316,
    level: 3,
    points: 5,
    gem: 'emerald',
    cost: { sapphire: 7, emerald: 3 },  // 7u+3g
    spritePosition: { x: 3, y: 3 }
  },

  // 红宝石卡牌 (4张)
  {
    id: 317,
    level: 3,
    points: 3,
    gem: 'ruby',
    cost: { diamond: 3, sapphire: 5, emerald: 3, onyx: 3 },  // 3w+5u+3g+3k
    spritePosition: { x: 0, y: 2 }
  },
  {
    id: 318,
    level: 3,
    points: 4,
    gem: 'ruby',
    cost: { emerald: 7 },  // 7g
    spritePosition: { x: 1, y: 2 }
  },
  {
    id: 319,
    level: 3,
    points: 4,
    gem: 'ruby',
    cost: { sapphire: 3, emerald: 6, ruby: 3 },  // 3u+6g+3r
    spritePosition: { x: 2, y: 2 }
  },
  {
    id: 320,
    level: 3,
    points: 5,
    gem: 'ruby',
    cost: { emerald: 7, ruby: 3 },  // 7g+3r
    spritePosition: { x: 3, y: 2 }
  }
]; 