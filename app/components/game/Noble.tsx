'use client';

import { Noble as NobleType, GemType } from '../../types/game';

interface NobleProps {
  noble: NobleType;
}

const gemColors: Record<GemType, string> = {
  diamond: 'text-gray-700 bg-gradient-to-br from-white to-gray-200 border-gray-300',
  sapphire: 'text-white bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300',
  emerald: 'text-white bg-gradient-to-br from-green-400 to-green-600 border-green-300',
  ruby: 'text-white bg-gradient-to-br from-red-400 to-red-600 border-red-300',
  onyx: 'text-white bg-gradient-to-br from-gray-700 to-gray-900 border-gray-600',
  gold: 'text-gray-800 bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-300'
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
    <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-purple-200 to-purple-400 
                  shadow-md hover:shadow-lg transition-all duration-300 
                  border border-purple-300
                  flex flex-col items-center justify-between
                  relative overflow-hidden
                  group hover:-translate-y-1 hover:[transform:perspective(600px)_rotateY(5deg)]">
      {/* 装饰性边框 */}
      <div className="absolute inset-1 rounded-lg border border-white/30 pointer-events-none"></div>

      {/* 发光效果 */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* 贵族头像 - 调整高度和缩放 */}
      <div className="w-full h-20 relative">
        <div
          className="absolute inset-0 bg-[url('/images/nobles.jpg')] bg-no-repeat"
          style={{
            backgroundSize: '500% 200%',
            backgroundPosition: `${position.x}% ${position.y}%`,
            transform: 'scale(1.1)' // 放大图片
          }}
        />
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/50 to-transparent"></div>
      </div>

      {/* 点数 */}
      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full 
                  bg-gradient-to-br from-yellow-400 to-yellow-600 
                  flex items-center justify-center
                  text-xs font-bold text-white border border-yellow-300 shadow-md
                  transform group-hover:scale-110 transition-transform">
        {noble.points}
      </div>

      {/* 标题装饰 */}
      <div className="absolute top-1 left-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" fillOpacity="0.5" />
        </svg>
      </div>

      {/* 要求 - REQ-004: 方形宝石图标，水平排列 */}
      <div className="w-full bg-white/60 backdrop-blur-sm p-1 mt-auto">
        <div className="flex justify-center flex-wrap gap-1">
          {Object.entries(noble.requirements).map(([gem, count]) => (
            <div key={gem}
              className="flex items-center gap-0.5 bg-white/80 
                      rounded px-1 py-0.5 shadow-sm">
              <div className={`w-3 h-3 rounded-sm ${gemColors[gem as GemType]} 
                          shadow-sm border transform hover:scale-110 transition-transform`} />
              <span className="text-xs font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 