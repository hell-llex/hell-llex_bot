# ---------- deps (ставим зависимости) ----------
FROM node:22-bookworm-slim AS deps
WORKDIR /app

# Для лучшего кэша: сначала только манифесты
COPY package*.json ./
RUN npm ci --omit=dev

# ---------- runner (минимальный рантайм) ----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# (Опционально) безопасность: не-root пользователь
USER node

# копируем только то, что нужно для запуска
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node src ./src
COPY --chown=node:node package.json ./

CMD ["node", "src/main.js"]
