export function logger() {
    return async (ctx, next) => {
        const from = ctx.from
            ? `${ctx.from.username || ctx.from.first_name || "unknown"} (${ctx.from.id})`
            : "unknown";

        const chatId = ctx.chat?.id;
        const type = ctx.updateType;

        console.log(`[update] type=${type} from=${from} chat=${chatId}`);

        await next();
    };
}
