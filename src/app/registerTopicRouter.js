import { config } from "../config/config.js";
import { getThreadId, resolveTopicRoute } from "../services/topicRouting.js";
import { getService } from "../services/serviceCatalog.js";

function isMessageUpdate(ctx) {
    return Boolean(ctx.message || ctx.update?.media_group?.length);
}

function isCommand(ctx) {
    return Boolean(ctx.message?.text?.startsWith("/"));
}

export function registerTopicRouter(bot) {
    bot.use(async (ctx, next) => {
        if (!config.topics.enabled || !isMessageUpdate(ctx) || isCommand(ctx)) {
            return next();
        }

        const route = await resolveTopicRoute(ctx);
        const service = getService(route);

        if (service?.handleTopicMessage) {
            return service.handleTopicMessage(ctx, next);
        }
        if (route) {
            return ctx.reply(`Topic привязан к сервису "${route}", но обработчик для него пока не добавлен.`);
        }

        return ctx.reply(
            [
                "Topic не привязан к модулю.",
                `threadId: ${getThreadId(ctx) ?? ""}`,
                "Используй /topic bind <service>, например /topic bind notes.",
            ].join("\n")
        );
    });
}
