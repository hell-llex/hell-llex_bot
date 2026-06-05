import { config } from "../config/config.js";
import { formatTopicRoutes, getThreadId, resolveTopicRoute } from "../services/topicRouting.js";

export function registerWhereami(bot) {
    bot.command("whereami", async (ctx) => {
        const threadId = getThreadId(ctx);
        const route = await resolveTopicRoute(ctx);
        const routes = await formatTopicRoutes();

        await ctx.reply(
            [
                "📍 Current Telegram context",
                `chatId: ${ctx.chat?.id ?? ""}`,
                `threadId: ${threadId ?? ""}`,
                `route: ${route || "unknown"}`,
                `topicsEnabled: ${config.topics.enabled ? "true" : "false"}`,
                "",
                "Configured topic routes:",
                routes,
            ].join("\n")
        );
    });
}
