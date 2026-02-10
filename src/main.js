// src/main.js
// Точка входа приложения (как main.ts в Nest).
// Здесь минимум логики: создаём бота, запускаем, корректно останавливаем.

import { createBot } from "./app/createBot.js";

const bot = await createBot();

// Запускаем бота (long polling: бот сам опрашивает Telegram)
await bot.launch();
console.log("🚀 Bot started (long polling)");

// Docker / Ctrl+C посылают сигналы остановки. Это "культурное" завершение.
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
