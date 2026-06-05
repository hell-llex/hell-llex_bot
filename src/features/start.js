import { APP_VERSION } from "../config/appInfo.js";
import { config } from "../config/config.js";

export function registerStart(bot) {
    bot.start((ctx) => {
        ctx.reply(
            `Привет! Я жив.\n\n` +
            `Версия: ${APP_VERSION}\n` +
            `Режим: ${config.mode.default}\n` +
            `Topics: ${config.topics.enabled ? "enabled" : "disabled"}\n` +
            `Inbox: ${config.paths.inboxDirForward}\n\n` +
            `Набери /help чтобы увидеть команды, /whereami чтобы узнать chat/thread id.\n\n` +
            `Ваш user id: ${ctx.from?.id}\n` +
            `Чат: ${ctx.chat?.id}`
        );
    });
}
