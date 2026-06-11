import { getCleanupSettings } from "./botSettings.js";

const MAX_TIMEOUT_MS = 2_147_483_647;

function getUpdateMessages(ctx) {
    if (ctx.update?.media_group?.length) return ctx.update.media_group;
    if (ctx.message) return [ctx.message];
    return [];
}

function scheduleDelete(bot, chatId, messageId, seconds) {
    if (!chatId || !messageId || !seconds) return;

    const delayMs = Math.min(seconds * 1000, MAX_TIMEOUT_MS);
    const timer = setTimeout(async () => {
        try {
            await bot.telegram.deleteMessage(chatId, messageId);
        } catch (err) {
            const description = err?.response?.description || err?.message || "";
            console.warn(`Message cleanup skipped chat=${chatId} message=${messageId}: ${description}`);
        }
    }, delayMs);

    timer.unref?.();
}

export async function scheduleMessageCleanup(bot, ctx, message) {
    const { deleteAfterSeconds } = await getCleanupSettings();
    if (!deleteAfterSeconds) return;

    scheduleDelete(bot, ctx.chat?.id || message?.chat?.id, message.message_id, deleteAfterSeconds);
}

export function messageCleanup(bot) {
    return async (ctx, next) => {
        const originalReply = ctx.reply.bind(ctx);

        ctx.reply = async (...args) => {
            const sent = await originalReply(...args);
            if (sent?.message_id) await scheduleMessageCleanup(bot, ctx, sent);
            return sent;
        };

        try {
            await next();
        } finally {
            const messages = getUpdateMessages(ctx);
            for (const message of messages) {
                await scheduleMessageCleanup(bot, ctx, message);
            }
        }
    };
}
