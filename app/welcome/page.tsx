import Link from 'next/link';

export default function WelcomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-50 to-purple-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg space-y-6">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          璀璨宝石 Splendor
        </h1>

        <p className="text-center text-gray-700">
          浏览器里直接玩的经典桌游，不用下载，不用登录。
        </p>

        <section className="space-y-2 text-gray-700 text-sm">
          <h2 className="text-lg font-semibold text-purple-700">怎么玩</h2>
          <p>
            收集宝石、买发展卡、吸引贵族。先拿到 15 点声望的人获胜，一局大约 30 分钟。
          </p>
        </section>

        <section className="space-y-2 text-gray-700 text-sm">
          <h2 className="text-lg font-semibold text-purple-700">和实体版有什么不一样</h2>
          <p>
            AI 对手会给出决策解释，帮你看懂每一步为什么这么下。
          </p>
        </section>

        <Link
          href="/"
          className="block w-full text-center bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transform transition hover:shadow-lg"
        >
          开始游戏
        </Link>
      </div>
    </main>
  );
}
