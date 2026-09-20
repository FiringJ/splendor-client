# Fly.io 部署说明 / Fly.io deploy notes

客户端托管在 Fly.io（旧 VPS / `splendor.uno` 已弃用）。Socket 地址在 **Next 构建时**写入浏览器包，必须先确认 sibling 服务端 URL，再部署客户端。

The Next.js client is hosted on Fly.io (legacy VPS / `splendor.uno` abandoned). The Socket URL is baked in at **build time** — deploy the client only after the sibling server URL is known.

## 应用名 / App name

| 建议 / Suggestion | 用途 / Use |
| --- | --- |
| `splendor-client` | 默认（与仓库名一致）/ default (`fly.toml`) |
| `firingj-splendor-web` | 备选 / alternate — `fly launch --name firingj-splendor-web` 后改 `fly.toml` 的 `app` |

Sibling server 默认 URL / default server URL：`https://splendor-server.fly.dev`

## 环境变量 / Env (build-time)

| 变量 / Variable | 说明 / Notes |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | 推荐。Socket / API 基址。Recommended Socket/API base. |
| `NEXT_PUBLIC_SOCKET_URL` | 可选覆盖；优先于 `NEXT_PUBLIC_API_URL`。Optional override (wins). |

未设置时：开发 → `http://localhost:3001`；生产 → `https://splendor-server.fly.dev`。

**不要**把密钥放进 `NEXT_PUBLIC_*` 或仓库。运行时改 Fly secrets **不会**改已经构建的前端包；改 URL 后必须重新 `fly deploy`（带新的 build-arg）。

Do **not** put secrets in `NEXT_PUBLIC_*` or the repo. Changing Fly runtime secrets will **not** update the browser bundle — rebuild with a new build-arg.

## 部署步骤 / Steps

1. 先部署 [splendor-server](https://github.com/FiringJ/splendor-server)，记下 URL（例如 `https://splendor-server.fly.dev`）。
2. 在本仓库：

```bash
# 首次
fly launch --name splendor-client --no-deploy   # 或 firingj-splendor-web
# 确认 fly.toml 中 app / primary_region / build.args

fly deploy --build-arg NEXT_PUBLIC_API_URL=https://splendor-server.fly.dev
```

若 `fly.toml` 里 `[build.args]` 已写好 URL，直接 `fly deploy` 即可。

3. 打开 `https://splendor-client.fly.dev`（或你的自定义域名）验证对局 Socket 连通。

## 本地 Docker 构建 / Local image build

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://splendor-server.fly.dev \
  -t splendor-client .
docker run --rm -p 3000:3000 splendor-client
```

`Dockerfile.ci` 仍用于旧 GitHub Actions 产物镜像（预构建 `.next`）；Fly 请用根目录 `Dockerfile`（standalone）。

## CORS / Socket

服务端需允许客户端 Fly 域名的 CORS / Socket.IO origin。若连不上，先查 server 的允许来源列表，而不是改客户端运行时 env。
