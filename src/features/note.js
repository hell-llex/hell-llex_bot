// src/features/note.js
// Команда /note <текст> — сохраняет заметку в файл.

import { writeNote } from "../services/noteWriter.js";

export function registerNote(bot) {
    bot.command("note", async (ctx) => {
        // ctx.message.text содержит всю строку: "/note что-то"
        const raw = ctx.message?.text || "";
        const text = raw.replace(/^\/note(@\w+)?\s*/i, "").trim();

        if (!text) {
            return ctx.reply("Использование: /note текст заметки");
        }

        const result = await writeNote({
            baseDir: "/app/data/inbox",
            text,
            meta: {
                userId: ctx.from?.id,
                chatId: ctx.chat?.id,
            },
        });

        await ctx.reply(`✅ Сохранил в inbox: ${result.filename}`);
    });
}
