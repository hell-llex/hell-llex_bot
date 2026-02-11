export function registerHelp(bot) {
    bot.command("help", async (ctx) => {
        const text =
            `🧰 Команды бота\n\n` +
            `/start — стартовое сообщение\n` +
            `/help — показать это меню\n` +
            `/ping — проверка связи\n` +
            `/note <текст> — сохранить заметку (в MVP)\n\n` +
            `Пока что:\n` +
            `• Я отвечаю на текст (echo)\n`;
        await ctx.reply(text);
    });
}
