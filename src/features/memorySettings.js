import {
    getMemorySettings,
    resetMemoryDir,
    setMemoryDir,
} from "../services/botSettings.js";
import { getMemoryStorageDescription } from "../services/memoryStore.js";
import { requireAdminTopic } from "../services/adminAccess.js";

function getArgs(ctx) {
    const raw = ctx.message?.text || "";
    return raw.replace(/^\/memory(@\w+)?\s*/i, "").trim().split(/\s+/).filter(Boolean);
}

function helpText() {
    return [
        "Memory settings:",
        "/memory dir — показать папку memory",
        "/memory dir set <absolute-path> — папка для знаний",
        "/memory dir reset — вернуть memory-папку из .env",
        "/memory storage — показать стратегию хранения",
        "",
        "Пример:",
        "/memory dir set /vault/Memory",
    ].join("\n");
}

function formatSettings({ dir }) {
    return [
        "Memory settings:",
        `dir: ${dir}`,
    ].join("\n");
}

function formatSettingsError(err) {
    if (err.message?.includes("absolute container path")) {
        return "Путь должен быть абсолютным путём внутри контейнера, например /vault/Memory.";
    }

    if (err.message?.includes("..")) {
        return "Путь не должен содержать .. сегменты.";
    }

    return "Не получилось обновить настройки memory. Посмотри логи бота.";
}

export function registerMemorySettings(bot) {
    bot.command("memory", async (ctx) => {
        if (!await requireAdminTopic(ctx)) return;

        const [section, action, ...rest] = getArgs(ctx);

        if (!section) {
            return ctx.reply(helpText());
        }

        if (section === "dir") {
            if (!action) {
                return ctx.reply(formatSettings(await getMemorySettings()));
            }

            if (action === "set") {
                const dir = rest.join(" ");
                try {
                    const memoryDir = await setMemoryDir(dir);
                    return ctx.reply(`✅ memory dir updated:\n${memoryDir}`);
                } catch (err) {
                    return ctx.reply(formatSettingsError(err));
                }
            }

            if (action === "reset") {
                const memoryDir = await resetMemoryDir();
                return ctx.reply(`✅ memory dir reset:\n${memoryDir}`);
            }
        }

        if (section === "storage") {
            return ctx.reply(`Memory storage: ${getMemoryStorageDescription()}`);
        }

        return ctx.reply(helpText());
    });
}
