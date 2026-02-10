// src/app/setupBotCommands.js
// Устанавливает список команд бота в Telegram (то самое меню "/" в чате).
// Это делается через Telegram API методом setMyCommands.
// Обычно достаточно делать это при старте приложения.

export async function setupBotCommands(bot) {
    try {
        await bot.telegram.setMyCommands([
            { command: "start", description: "старт" },
            { command: "help", description: "список команд" },
            { command: "ping", description: "проверка связи" },
            { command: "note", description: "сохранить заметку: /note текст" },
        ]);

        console.log("✅ Bot commands set (Telegram menu updated)");
    } catch (err) {
        // Если, например, нет сети/Telegram недоступен — не валим весь бот.
        console.error("⚠️ Failed to set bot commands:", err);
    }
}
