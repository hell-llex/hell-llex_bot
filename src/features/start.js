// src/features/start.js
// Команда /start — стандартная стартовая точка.

export function registerStart(bot) {
    bot.start((ctx) => {
        ctx.reply(
            `Привет! Я жив.\n\n` +
            `Набери /help чтобы увидеть команды.\n\n` +
            `Ваш user id: ${ctx.from?.id}\n` +
            `Чат: ${ctx.chat?.id}`
        );
    });
}
