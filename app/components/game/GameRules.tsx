'use client';

import { useState } from 'react';

export const GameRules = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
      >
        游戏规则
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-purple-700">璀璨宝石游戏规则</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-gray-700">
              <section>
                <h3 className="text-xl font-bold text-purple-600 mb-2">游戏目标</h3>
                <p>
                  在璀璨宝石中，你扮演一位宝石商人，通过收集宝石，吸引贵族的青睐，并获取声望点数。
                  第一位获得15点声望的玩家将获得游戏胜利。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-purple-600 mb-2">游戏配置</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <span className="font-bold">玩家人数：</span> 2-4人
                  </li>
                  <li>
                    <span className="font-bold">游戏时间：</span> 约30分钟
                  </li>
                  <li>
                    <span className="font-bold">游戏内容：</span> 宝石代币、发展卡、贵族卡
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-purple-600 mb-2">游戏准备</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>宝石代币根据玩家人数摆放：2人游戏时各4个，3人游戏时各5个，4人游戏时各7个，黄金代币始终为5个</li>
                  <li>将发展卡分为三个等级，分别洗牌并摆放成面朝上的三行</li>
                  <li>贵族卡的数量为玩家数量+1</li>
                  <li>每位玩家开始时没有宝石代币、发展卡或贵族卡</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-purple-600 mb-2">游戏流程</h3>
                <p className="mb-2">
                  游戏按顺时针方向进行。在你的回合中，你需要执行以下动作之一：
                </p>
                <ol className="list-decimal list-inside space-y-3">
                  <li>
                    <p className="font-bold">获取宝石</p>
                    <ul className="list-disc list-inside ml-6 space-y-1">
                      <li>拿取3个不同颜色的宝石</li>
                      <li>或拿取2个相同颜色的宝石（但该颜色的宝石必须至少有4个可用）</li>
                      <li>你最多只能持有10个宝石，如果超过需要弃掉一些宝石</li>
                      <li>黄金宝石（金币）是通配符，不能直接拿取</li>
                    </ul>
                  </li>
                  <li>
                    <p className="font-bold">购买发展卡</p>
                    <ul className="list-disc list-inside ml-6 space-y-1">
                      <li>支付卡片所示的宝石代币购买一张发展卡</li>
                      <li>你可以将黄金宝石作为任意一种颜色的宝石使用</li>
                      <li>卡片提供的宝石加成不需要支付，是永久的</li>
                      <li>你可以购买展示区的卡片或之前预留的卡片</li>
                    </ul>
                  </li>
                  <li>
                    <p className="font-bold">预留发展卡</p>
                    <ul className="list-disc list-inside ml-6 space-y-1">
                      <li>从展示区或牌堆顶预留一张卡片</li>
                      <li>预留卡片时，如果有黄金宝石，你会获得一个黄金宝石</li>
                      <li>每位玩家最多可以预留3张卡片</li>
                    </ul>
                  </li>
                </ol>
              </section>

              <section>
                <h3 className="text-xl font-bold text-purple-600 mb-2">贵族拜访</h3>
                <p>
                  当你的回合结束时，如果你拥有的发展卡满足某位贵族卡的要求，
                  该贵族会自动拜访你并为你提供声望点数。每位贵族只能拜访一位玩家。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-purple-600 mb-2">游戏结束</h3>
                <p>
                  当一位玩家达到或超过15点声望时，游戏将在当前回合结束后继续进行，
                  直到所有玩家都进行了相同次数的回合。然后，声望点数最高的玩家获胜。
                  如果出现平局，拥有发展卡最少的玩家获胜。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-purple-600 mb-2">游戏技巧</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>关注贵族卡的要求，有针对性地收集宝石</li>
                  <li>注意其他玩家的策略，适时阻止他们</li>
                  <li>预留对手可能需要的卡片是一种有效的战术</li>
                  <li>平衡短期和长期目标，低级卡可能给你更快的加成，高级卡则提供更多声望点数</li>
                </ul>
              </section>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 