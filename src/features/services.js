import { getBuiltInServices } from "../services/serviceCatalog.js";
import { getTopicRoutes } from "../services/topicRegistry.js";

function formatRoute(route) {
    if (!route) return "not bound";

    const chat = route.chatId === null ? "any chat" : `chat ${route.chatId}`;
    return `thread ${route.threadId}, ${chat}, ${route.source}`;
}

function formatService(service, routes) {
    return [
        `${service.name} — ${service.description}`,
        `status: ${service.status}`,
        `topic: ${formatRoute(routes[service.name])}`,
    ].join("\n");
}

export function registerServices(bot) {
    bot.command("services", async (ctx) => {
        const routes = await getTopicRoutes();
        const builtInServices = getBuiltInServices();
        const builtInNames = new Set(builtInServices.map((service) => service.name));
        const customNames = Object.keys(routes).filter((name) => !builtInNames.has(name));

        const sections = [
            "Available services:",
            "",
            builtInServices.map((service) => formatService(service, routes)).join("\n\n"),
        ];

        if (customNames.length) {
            sections.push(
                "",
                "Custom bound services:",
                customNames.map((name) => `${name}\ntopic: ${formatRoute(routes[name])}`).join("\n\n")
            );
        }

        await ctx.reply(sections.join("\n"));
    });
}
