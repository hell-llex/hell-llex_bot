import { config } from "../config/config.js";
import { getBuiltInServiceNames } from "./serviceCatalog.js";
import { getTopicRoutes } from "./topicRegistry.js";

export function getThreadIdFromMessage(msg) {
    return msg?.message_thread_id ?? null;
}

export function getThreadId(ctx) {
    const albumItem = ctx.update?.media_group?.[0];
    return getThreadIdFromMessage(ctx.message) ??
        getThreadIdFromMessage(ctx.update?.message) ??
        getThreadIdFromMessage(ctx.update?.channel_post) ??
        getThreadIdFromMessage(albumItem);
}

export async function resolveTopicRoute(ctx) {
    if (!config.topics.enabled) return "notes";

    const threadId = getThreadId(ctx);
    if (threadId === null) return null;

    const routes = await getTopicRoutes();
    return Object.entries(routes).find(([, route]) => {
        const sameThread = route.threadId === threadId;
        const sameChat = route.chatId === null || route.chatId === ctx.chat?.id;
        return sameThread && sameChat;
    })?.[0] || null;
}

export async function isTopicRoute(ctx, routeName) {
    return await resolveTopicRoute(ctx) === routeName;
}

export async function formatTopicRoutes() {
    const routes = await getTopicRoutes();
    const names = Array.from(new Set([...getBuiltInServiceNames(), ...Object.keys(routes)]));

    return names
        .map((name) => {
            const route = routes[name];
            if (!route) return `${name}: not configured`;

            const chatPart = route.chatId === null ? "any chat" : `chat ${route.chatId}`;
            return `${name}: thread ${route.threadId} (${chatPart}, ${route.source})`;
        })
        .join("\n");
}
