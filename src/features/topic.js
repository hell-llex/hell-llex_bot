import { getBuiltInServiceNames } from "../services/serviceCatalog.js";
import { bindTopicRoute, unbindTopicRoute } from "../services/topicRegistry.js";
import { formatTopicRoutes, getThreadId, resolveTopicRoute } from "../services/topicRouting.js";
import { canBootstrapAdminTopic, requireAdminTopic } from "../services/adminAccess.js";

function getArgs(ctx) {
    const raw = ctx.message?.text || "";
    return raw.replace(/^\/topic(@\w+)?\s*/i, "").trim().split(/\s+/).filter(Boolean);
}

function helpText() {
    return [
        "Topic routing commands:",
        "/topic bind admin — bootstrap admin topic",
        "/topic bind <service> <threadId> — bind topic from admin",
        "/topic unbind — unbind current topic",
        "/topic unbind <service> — unbind service",
        "/topic current — show current topic binding",
        "/topic routes — show bindings",
        "",
        `Built-in services: ${getBuiltInServiceNames().join(", ")}`,
    ].join("\n");
}

export function registerTopic(bot) {
    bot.command("topic", async (ctx) => {
        const [action, service, targetThreadIdRaw] = getArgs(ctx);

        if (!action) return ctx.reply(helpText());

        if (action === "routes") {
            return ctx.reply(["Configured topic routes:", await formatTopicRoutes()].join("\n"));
        }

        if (action === "current") {
            const threadId = getThreadId(ctx);
            const route = await resolveTopicRoute(ctx);

            return ctx.reply(
                [
                    "Current topic:",
                    `chatId: ${ctx.chat?.id ?? ""}`,
                    `threadId: ${threadId ?? ""}`,
                    `service: ${route || "not bound"}`,
                ].join("\n")
            );
        }

        if (action === "bind") {
            if (!service) return ctx.reply("Usage: /topic bind <service>");
            const bootstrapAdmin = await canBootstrapAdminTopic(service);
            if (!bootstrapAdmin && !await requireAdminTopic(ctx)) return;

            const targetThreadId = parseTargetThreadId(targetThreadIdRaw);
            if (targetThreadIdRaw && targetThreadId === null) {
                return ctx.reply("threadId должен быть числом. Его можно посмотреть через /whereami или /topic current.");
            }

            if (!bootstrapAdmin && !targetThreadId) {
                return ctx.reply("Из admin topic укажи threadId: /topic bind notes 123456");
            }

            let route;
            try {
                route = await bindTopicRoute({
                    service,
                    chatId: ctx.chat?.id,
                    threadId: targetThreadId || getThreadId(ctx),
                });
            } catch (err) {
                return ctx.reply(formatTopicError(err));
            }

            return ctx.reply(`✅ Bound topic ${route.threadId} to service: ${route.service}`);
        }

        if (action === "unbind") {
            if (!await requireAdminTopic(ctx)) return;

            let result;
            try {
                result = await unbindTopicRoute({
                    service,
                    chatId: ctx.chat?.id,
                    threadId: getThreadId(ctx),
                });
            } catch (err) {
                return ctx.reply(formatTopicError(err));
            }

            const removed = result.removed.length ? result.removed.join(", ") : "nothing";
            return ctx.reply(`✅ Unbound: ${removed}`);
        }

        return ctx.reply(helpText());
    });
}

function formatTopicError(err) {
    if (err.message?.includes("inside a Telegram topic")) {
        return "Эту команду нужно отправить внутри Telegram topic.";
    }

    if (err.message?.includes("Service name")) {
        return "Имя сервиса должно быть 2-32 символа: латиница в нижнем регистре, цифры, _ или -.";
    }

    return "Не получилось обновить привязку topic. Посмотри логи бота.";
}

function parseTargetThreadId(value) {
    if (!value) return null;
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
}
