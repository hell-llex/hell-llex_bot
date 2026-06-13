import { getCleanupSettings } from "./botSettings.js";

const MAX_TIMEOUT_MS = 2_147_483_647;

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

export async function scheduleMessagesCleanup(bot, ctx, messages) {
    for (const message of messages.filter(Boolean)) {
        await scheduleMessageCleanup(bot, ctx, message);
    }
}

export async function replyWithCleanup(bot, ctx, text, incomingMessages = [], extra = undefined) {
    const sent = await ctx.reply(text, extra);
    await scheduleMessagesCleanup(bot, ctx, [...incomingMessages, sent]);
    return sent;
}
