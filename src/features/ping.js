// src/features/ping.js
// Команда /ping — простая проверка, что бот отвечает.

export function registerPing(bot) {
    bot.command("ping", (ctx) => ctx.reply("pong ✅"));
}
