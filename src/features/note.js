import { writeNote } from "../services/noteWriter.js";
import { config } from "../config/config.js";

export function registerNote(bot) {
    bot.command("note", async (ctx) => {
        const raw = ctx.message?.text || "";
        const text = raw.replace(/^\/note(@\w+)?\s*/i, "").trim();

        if (!text) {
            return ctx.reply("Использование: /note текст заметки");
        }

        const result = await writeNote({
            baseDir: config.paths.inboxRoot,
            text,
            meta: {
                userId: ctx.from?.id,
                chatId: ctx.chat?.id,
            },
        });

        await ctx.reply(`✅ Сохранил в inbox: ${result.filename}`);
    });
}
