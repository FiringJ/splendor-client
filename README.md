This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## AI 决策展示（Jev）

对局里的 AI 若由服务端 Jev 引擎落子，操作历史上方会多一块 **AI 决策** 面板。客户端只展示服务端已经算好的结果，**不会**在浏览器里调用 Jev、OpenRouter 或 TypeSafe。

需要已接入 Jev 的 [splendor-server](https://github.com/FiringJ/splendor-server)（`AI_ENGINE=jev`，密钥只放在服务端环境变量）。不要把 `OPENROUTER_API_KEY` / `TYPESAFE_API_KEY` 写进 `NEXT_PUBLIC_*` 或任何客户端代码。服务端还没带上元数据时，面板不出现，对局界面与原来一致。

看哪里：桌面端在棋盘右侧「操作历史」卡片内、操作记录列表上方；窄屏在页面下方同一张卡片里。面板会显示动作类型、选中项、概率最高的 3 个选项、模型 ID、耗时，以及来源标记 `jev` / `heuristic` / `forced`。对应的历史条目上也会标上同一来源。人类自己的回合不会清掉上一手 AI 决策，方便对照。

服务端在 Socket.IO 事件 `gameStateUpdate` 上附加可选字段 `decisionMeta`（也可以放在 `action.decisionMeta`）。示例：

```json
{
  "gameState": {},
  "action": { "type": "TAKE_GEMS", "playerId": "ai-1", "payload": { "gems": { "diamond": 1, "sapphire": 1, "emerald": 1 } } },
  "decisionMeta": {
    "source": "jev",
    "modelId": "typesafe/jev-1.13",
    "latencyMs": 420,
    "actionType": "TAKE_GEMS",
    "chosenOptionId": "take-dse",
    "chosenOptionLabel": "拿取钻、蓝、绿",
    "options": [
      { "id": "take-dse", "label": "拿取钻、蓝、绿", "probability": 0.62 },
      { "id": "buy-12", "label": "购买中级红宝石卡", "probability": 0.25 },
      { "id": "reserve-7", "label": "预留高级黑卡", "probability": 0.08 }
    ]
  }
}
```

回退到启发式时 `source` 为 `heuristic`，可带 `fallbackReason`。唯一合法动作时 `source` 为 `forced`。概率也可以是百分数（合计约 100）或 `{ "选项id": 0.62 }` 这种映射，客户端会归一化；无法识别则忽略，不报错。

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
