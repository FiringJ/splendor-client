# Fly.io / 本地生产镜像：Next.js standalone 多阶段构建。
# NEXT_PUBLIC_* 必须在 build 阶段注入（会写入浏览器包）。
# 示例：
#   docker build --build-arg NEXT_PUBLIC_API_URL=https://splendor-server.fly.dev -t splendor-client .
#   fly deploy --build-arg NEXT_PUBLIC_API_URL=https://splendor-server.fly.dev

FROM node:20-alpine AS base
RUN npm install -g pnpm@9.11.0
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建期公开变量（非密钥）。默认指向 sibling Fly server 应用。
ARG NEXT_PUBLIC_API_URL=https://splendor-server.fly.dev
ARG NEXT_PUBLIC_SOCKET_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
# 无 Sentry 上传 token 时静默跳过，避免本地/Fly 构建噪音
ENV CI=1
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
