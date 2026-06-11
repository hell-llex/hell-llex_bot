import {
    getCleanupSettings,
    resetCleanupDeleteAfterSeconds,
    setCleanupDeleteAfterSeconds,
} from "../services/botSettings.js";
import { requireAdminTopic } from "../services/adminAccess.js";

function getArgs(ctx) {
    const raw = ctx.message?.text || "";
    return raw.replace(/^\/cleanup(@\w+)?\s*/i, "").trim().split(/\s+/).filter(Boolean);
}

function helpText() {
    return [
        "Cleanup settings:",
        "/cleanup status — показать автоудаление сообщений",
        "/cleanup set <duration> — установить TTL, например 30m, 2h или 1800",
        "/cleanup off — отключить автоудаление",
        "/cleanup reset — вернуть значение из .env",
    ].join("\n");
}

function parseDurationSeconds(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) throw new Error("Duration is required.");
    if (raw === "off" || raw === "disable" || raw === "disabled") return 0;

    const match = raw.match(/^(\d+)(s|m|h|d)?$/);
    if (!match) throw new Error("Unsupported duration.");

    const amount = Number(match[1]);
    const unit = match[2] || "s";
    const multiplier = {
        s: 1,
        m: 60,
        h: 60 * 60,
        d: 24 * 60 * 60,
    }[unit];

    return amount * multiplier;
}

function formatDuration(seconds) {
    if (!seconds) return "off";
    if (seconds % 86400 === 0) return `${seconds / 86400}d`;
    if (seconds % 3600 === 0) return `${seconds / 3600}h`;
    if (seconds % 60 === 0) return `${seconds / 60}m`;
    return `${seconds}s`;
}

function formatSettings({ deleteAfterSeconds }) {
    return [
        "Cleanup settings:",
        `deleteAfter: ${formatDuration(deleteAfterSeconds)} (${deleteAfterSeconds}s)`,
    ].join("\n");
}

function formatError(err) {
    if (err.message?.includes("duration") || err.message?.includes("Duration")) {
        return "Не понял длительность. Примеры: /cleanup set 30m, /cleanup set 2h, /cleanup set 1800, /cleanup off.";
    }

    return "Не получилось обновить cleanup settings. Посмотри логи бота.";
}

export function registerCleanupSettings(bot) {
    bot.command("cleanup", async (ctx) => {
        if (!await requireAdminTopic(ctx)) return;

        const [action, value] = getArgs(ctx);

        if (!action || action === "help") {
            return ctx.reply(helpText());
        }

        if (action === "status") {
            return ctx.reply(formatSettings(await getCleanupSettings()));
        }

        if (action === "set") {
            try {
                const seconds = await setCleanupDeleteAfterSeconds(parseDurationSeconds(value));
                return ctx.reply(`✅ cleanup deleteAfter updated: ${formatDuration(seconds)} (${seconds}s)`);
            } catch (err) {
                return ctx.reply(formatError(err));
            }
        }

        if (action === "off") {
            const seconds = await setCleanupDeleteAfterSeconds(0);
            return ctx.reply(`✅ cleanup deleteAfter updated: ${formatDuration(seconds)} (${seconds}s)`);
        }

        if (action === "reset") {
            const seconds = await resetCleanupDeleteAfterSeconds();
            return ctx.reply(`✅ cleanup deleteAfter reset: ${formatDuration(seconds)} (${seconds}s)`);
        }

        return ctx.reply(helpText());
    });
}
