'use client';

import { Noble as NobleType, GemType } from '../../types/game';

interface NobleProps {
  noble: NobleType;
}

const gemColors: Record<GemType, string> = {
  diamond: 'text-gray-700 bg-white border border-gray-300',
  sapphire: 'text-white bg-blue-500',
  emerald: 'text-white bg-green-500',
  ruby: 'text-white bg-red-500',
  onyx: 'text-white bg-gray-800',
  gold: 'text-black bg-yellow-400'
};

// 计算贵族精灵图位置
const getNoblePosition = (id: number) => {
  // id从1开始，减1后得到在精灵图中的索引
  const index = id - 1;
  // 每行5个，计算行和列
  const row = Math.floor(index / 5);
  const col = index % 5;
  return { x: col * 25, y: row * 100 };
};

export const Noble = ({ noble }: NobleProps) => {
  const position = getNoblePosition(noble.id);

  return (
    <div className="w-24 h-32 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 
                    shadow-lg hover:shadow-xl transition-all duration-300 
                    border-2 border-purple-300
                    flex flex-col items-center justify-between
                    relative overflow-hidden">
      {/* 贵族头像 - 调整高度和缩放 */}
      <div className="w-full h-24 relative">
        <div
          className="absolute inset-0 bg-[url('/images/nobles.jpg')] bg-no-repeat"
          style={{
            backgroundSize: '500% 200%',
            backgroundPosition: `${position.x}% ${position.y}%`,
            transform: 'scale(1.1)' // 放大图片
          }}
        />
      </div>

      {/* 点数 */}
      <div className="absolute top-1 right-1 w-6 h-6 rounded-full 
                    bg-purple-600 text-white
                    flex items-center justify-center
                    text-sm font-bold shadow-md">
        {noble.points}
      </div>

      {/* 要求 - 修改为单行布局 */}
      <div className="w-full bg-white bg-opacity-50 p-1 mt-auto">
        <div className="flex justify-center gap-1">
          {Object.entries(noble.requirements).map(([gem, count]) => (
            <div key={gem}
              className="flex items-center gap-0.5 bg-white bg-opacity-60 
                        rounded-sm px-1">
              <div className={`w-3 h-3 rounded-full ${gemColors[gem as GemType]} 
                            shadow-sm transform hover:scale-110 transition-transform`} />
              <span className="text-xs font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 