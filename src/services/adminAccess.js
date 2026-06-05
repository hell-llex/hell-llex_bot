import { config } from "../config/config.js";
import { getTopicRoutes } from "./topicRegistry.js";
import { isTopicRoute } from "./topicRouting.js";

export async function hasAdminTopicBinding() {
    const routes = await getTopicRoutes();
    return Boolean(routes.admin);
}

export async function isAdminTopic(ctx) {
    if (!config.topics.enabled) return true;
    return await isTopicRoute(ctx, "admin");
}

export async function canBootstrapAdminTopic(service) {
    return String(service || "").toLowerCase() === "admin" && !await hasAdminTopicBinding();
}

export async function requireAdminTopic(ctx) {
    if (await isAdminTopic(ctx)) return true;

    await ctx.reply("Эта команда доступна только в admin topic. Сначала привяжи его: /topic bind admin");
    return false;
}
