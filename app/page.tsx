import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4">
      <h1 className="text-4xl font-bold mb-8">璀璨宝石 Splendor</h1>

      <div className="space-y-4">
        <Link
          href="/game"
          className="block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          开始游戏
        </Link>

        <Link
          href="/rules"
          className="block px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          游戏规则
        </Link>
      </div>
    </main>
  );
}
