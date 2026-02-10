// src/middlewares/logger.js
// Очень простой логгер: показывает, какой апдейт пришёл и от кого.
// Позже можно заменить на pino/winston и логировать в файл/JSON.

export function logger() {
    return async (ctx, next) => {
        const from = ctx.from
            ? `${ctx.from.username || ctx.from.first_name || "unknown"} (${ctx.from.id})`
            : "unknown";

        const chatId = ctx.chat?.id;
        const type = ctx.updateType; // message, edited_message, callback_query, ...

        console.log(`[update] type=${type} from=${from} chat=${chatId}`);

        await next();
    };
}
