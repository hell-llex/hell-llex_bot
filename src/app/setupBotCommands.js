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
        console.error("⚠️ Failed to set bot commands:", err);
    }
}
