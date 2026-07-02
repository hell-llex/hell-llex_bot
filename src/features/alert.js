import { requireAdminTopic } from "../services/adminAccess.js";
import { getAlertsRoute, isAlertSeverity, normalizeSeverity, sendAlert } from "../services/alerts.js";

function getArgs(ctx) {
    const raw = ctx.message?.text || "";
    return raw.replace(/^\/alert(@\w+)?\s*/i, "").trim().split(/\s+/).filter(Boolean);
}

function helpText() {
    return [
        "Alert commands:",
        "/alert status — показать привязку alerts topic",
        "/alert test [severity] [text] — отправить тестовый алерт",
        "/alert send <severity> <text> — отправить ручной алерт",
        "",
        "Severity: info, success, warning, critical",
    ].join("\n");
}

function formatRoute(route) {
    if (!route) return "not bound";

    const chat = route.chatId === null ? "missing chatId (use runtime /topic bind alerts)" : `chat ${route.chatId}`;
    return `thread ${route.threadId}, ${chat}, ${route.source}`;
}

function formatError(err) {
    if (err.message?.includes("not bound") || err.message?.includes("no chatId")) {
        return [
            "Alerts topic не готов к отправке.",
            "Создай Telegram topic для алертов и выполни внутри него: /topic bind alerts",
        ].join("\n");
    }

    return "Не получилось отправить alert. Посмотри логи бота.";
}

function parseOptionalSeverity(firstArg, rest) {
    if (isAlertSeverity(firstArg)) {
        return {
            severity: normalizeSeverity(firstArg),
            text: rest.join(" "),
        };
    }

    return {
        severity: "warning",
        text: [firstArg, ...rest].filter(Boolean).join(" "),
    };
}

export function registerAlert(bot) {
    bot.command("alert", async (ctx) => {
        if (!await requireAdminTopic(ctx)) return;

        const [action, severityRaw, ...messageParts] = getArgs(ctx);

        if (!action || action === "help") {
            return ctx.reply(helpText());
        }

        if (action === "status") {
            return ctx.reply(["Alerts topic:", formatRoute(await getAlertsRoute())].join("\n"));
        }

        if (action === "test") {
            const { severity, text } = parseOptionalSeverity(severityRaw, messageParts);

            try {
                await sendAlert(bot, {
                    severity,
                    title: "Test alert",
                    text: text || "Test alert from hell-llex_bot.",
                    source: "telegram-command",
                    tags: ["test"],
                });
                return ctx.reply(`✅ Test alert sent: ${severity}`);
            } catch (err) {
                console.error("Failed to send test alert:", err);
                return ctx.reply(formatError(err));
            }
        }

        if (action === "send") {
            const severity = normalizeSeverity(severityRaw);
            const text = messageParts.join(" ");
            if (!text) return ctx.reply("Usage: /alert send <severity> <text>");

            try {
                await sendAlert(bot, {
                    severity,
                    title: "Manual alert",
                    text,
                    source: `telegram:${ctx.from?.id ?? "unknown"}`,
                    tags: ["manual"],
                });
                return ctx.reply(`✅ Alert sent: ${severity}`);
            } catch (err) {
                console.error("Failed to send manual alert:", err);
                return ctx.reply(formatError(err));
            }
        }

        return ctx.reply(helpText());
    });
}
