import { isTopicRoute } from "../services/topicRouting.js";
import { getManualNotesDir } from "../services/botSettings.js";
import { saveIncomingNote } from "../services/noteStore.js";
import { replyWithCleanup } from "../services/messageCleanup.js";

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
        const note = {
            id: `msg_${ctx.message.message_id}`,
            createdAt: new Date((ctx.message.date || Math.floor(Date.now() / 1000)) * 1000),
            text,
            source: {
                chatId: ctx.chat?.id,
                fromId: ctx.from?.id,
                username: ctx.from?.username || "",
                forwarded: false,
            },
            media: [],
        };

        const result = await saveIncomingNote(note, { baseDir: inboxDir });
        await replyWithCleanup(bot, ctx, `✅ Сохранено note: ${result.noteName}`, [ctx.message]);
    });
}
