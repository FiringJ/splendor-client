# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# 与 CI 一致：生产构建把 Socket 地址写进浏览器包。
ENV NEXT_PUBLIC_API_URL=https://www.splendor.uno
RUN npm run build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=https://www.splendor.uno

EXPOSE 3000

CMD ["npm", "start"]
