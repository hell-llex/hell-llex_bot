import { writeNote } from "../services/noteWriter.js";
import { isTopicRoute } from "../services/topicRouting.js";
import { getManualNotesDir } from "../services/botSettings.js";

export function registerNote(bot) {
    bot.command("note", async (ctx) => {
        if (!await isTopicRoute(ctx, "notes")) {
            return ctx.reply("Этот topic не настроен для заметок. Используй /topic bind notes в нужном topic.");
        }

        const raw = ctx.message?.text || "";
        const text = raw.replace(/^\/note(@\w+)?\s*/i, "").trim();

        if (!text) {
            return ctx.reply("Использование: /note текст заметки");
        }

        const inboxDir = await getManualNotesDir();
        const result = await writeNote({
            baseDir: inboxDir,
            text,
            meta: {
                userId: ctx.from?.id,
                chatId: ctx.chat?.id,
            },
        });

        await ctx.reply(`✅ Сохранил в inbox: ${result.filename}\n${inboxDir}`);
    });
}
