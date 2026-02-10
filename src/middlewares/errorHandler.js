// src/middlewares/errorHandler.js
// Перехватчик ошибок.
// Без него любая ошибка внутри handler'а может "уронить" процесс или сломать обработку.

export function errorHandler() {
    return async (ctx, next) => {
        try {
            // next() запускает следующий middleware/handler в цепочке
            await next();
        } catch (err) {
            console.error("❌ Unhandled error:", err);

            // Пытаемся сообщить пользователю (только если есть чат).
            // Ошибка при reply не должна вызывать новую ошибку -> оборачиваем в try/catch.
            try {
                if (ctx?.chat?.id) {
                    await ctx.reply("Произошла ошибка. Я уже записал лог.");
                }
            } catch (_) {}
        }
    };
}
