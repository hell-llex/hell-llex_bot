export function logger() {
    return async (ctx, next) => {
        const from = ctx.from
            ? `${ctx.from.username || ctx.from.first_name || "unknown"} (${ctx.from.id})`
            : "unknown";

        const chatId = ctx.chat?.id;
        const threadId = ctx.message?.message_thread_id || ctx.update?.message?.message_thread_id || ctx.update?.media_group?.[0]?.message_thread_id;
        const type = ctx.updateType;

        console.log(`[update] type=${type} from=${from} chat=${chatId} thread=${threadId || ""}`);

        await next();
    };
}
