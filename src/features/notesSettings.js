import {
    getNotesDirs,
    resetForwardedNotesDir,
    resetManualNotesDir,
    setForwardedNotesDir,
    setManualNotesDir,
} from "../services/botSettings.js";
import { requireAdminTopic } from "../services/adminAccess.js";

function getArgs(ctx) {
    const raw = ctx.message?.text || "";
    return raw.replace(/^\/notes(@\w+)?\s*/i, "").trim().split(/\s+/).filter(Boolean);
}

function helpText() {
    return [
        "Notes settings:",
        "/notes dirs — показать папки заметок",
        "/notes manual set <absolute-path> — папка для своих заметок",
        "/notes manual reset — вернуть manual-папку из .env",
        "/notes forwarded set <absolute-path> — папка для пересланного",
        "/notes forwarded reset — вернуть forwarded-папку из .env",
        "",
        "Пример:",
        "/notes manual set /vault/Notes",
        "/notes forwarded set /vault/Telegram",
    ].join("\n");
}

function formatSettings({ manualDir, forwardedDir }) {
    return [
        "Notes settings:",
        `manualDir: ${manualDir}`,
        `forwardedDir: ${forwardedDir}`,
    ].join("\n");
}

function formatSettingsError(err) {
    if (err.message?.includes("absolute container path")) {
        return "Путь должен быть абсолютным путём внутри контейнера, например /vault/Telegram или /vault/Notes/Inbox.";
    }

    if (err.message?.includes("..")) {
        return "Путь не должен содержать .. сегменты.";
    }

    return "Не получилось обновить настройки заметок. Посмотри логи бота.";
}

export function registerNotesSettings(bot) {
    bot.command("notes", async (ctx) => {
        if (!await requireAdminTopic(ctx)) return;

        const [section, action, ...rest] = getArgs(ctx);

        if (!section) {
            return ctx.reply(helpText());
        }

        if (section === "dirs" || section === "dir") {
            return ctx.reply(formatSettings(await getNotesDirs()));
        }

        if (section === "manual" && action === "set") {
            const dir = rest.join(" ");
            try {
                const manualDir = await setManualNotesDir(dir);
                return ctx.reply(`✅ manualDir updated:\n${manualDir}`);
            } catch (err) {
                return ctx.reply(formatSettingsError(err));
            }
        }

        if (section === "manual" && action === "reset") {
            const manualDir = await resetManualNotesDir();
            return ctx.reply(`✅ manualDir reset:\n${manualDir}`);
        }

        if (section === "forwarded" && action === "set") {
            const dir = rest.join(" ");
            try {
                const forwardedDir = await setForwardedNotesDir(dir);
                return ctx.reply(`✅ forwardedDir updated:\n${forwardedDir}`);
            } catch (err) {
                return ctx.reply(formatSettingsError(err));
            }
        }

        if (section === "forwarded" && action === "reset") {
            const forwardedDir = await resetForwardedNotesDir();
            return ctx.reply(`✅ forwardedDir reset:\n${forwardedDir}`);
        }

        return ctx.reply(helpText());
    });
}
