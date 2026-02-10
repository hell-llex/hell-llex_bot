// src/config/env.js
// Здесь мы читаем переменные окружения и приводим их к нужным типам.
// Это аналог "config service", только проще.

export function getEnv() {
    const BOT_TOKEN = process.env.BOT_TOKEN;

    // ADMIN_USER_ID нужен для whitelist.
    // Если 0 / пусто — whitelist выключен (удобно в dev).
    const ADMIN_USER_ID = Number(process.env.ADMIN_USER_ID || "0");

    if (!BOT_TOKEN) {
        // Если токена нет — бот не может работать, останавливаемся сразу.
        throw new Error("❌ BOT_TOKEN is missing. Put it into .env");
    }

    return { BOT_TOKEN, ADMIN_USER_ID };
}
