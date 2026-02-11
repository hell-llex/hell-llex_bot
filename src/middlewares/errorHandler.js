export function errorHandler() {
    return async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            console.error("❌ Unhandled error:", err);

            try {
                if (ctx?.chat?.id) {
                    await ctx.reply("Произошла ошибка. Я уже записал лог.");
                }
            } catch (_) {}
        }
    };
}
