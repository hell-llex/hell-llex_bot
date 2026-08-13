export async function setupBotCommands(bot) {
    try {
        const scopesToClear = [
            { type: "all_private_chats" },
            { type: "all_group_chats" },
            { type: "all_chat_administrators" },
        ];

        for (const scope of scopesToClear) {
            await bot.telegram.deleteMyCommands({ scope });
        }

        await bot.telegram.setMyCommands([
            { command: "start", description: "старт" },
            { command: "help", description: "список команд" },
            { command: "admin", description: "панель администратора" },
        ]);

        console.log("✅ Bot commands set (Telegram menu updated)");
    } catch (err) {
        console.error("⚠️ Failed to set bot commands:", err);
    }
}
