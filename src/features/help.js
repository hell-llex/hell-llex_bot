import { isAdminTopic } from "../services/adminAccess.js";
import { getThreadId, isTopicRoute } from "../services/topicRouting.js";

export function registerHelp(bot) {
    bot.command("help", async (ctx) => {
        const lines = [
            "🧰 Команды бота",
            "",
            "/start — стартовое сообщение",
            "/help — показать это меню",
            "/ping — проверка связи",
            "/services — показать доступные сервисы",
            "/whereami — показать chatId/threadId",
        ];

        const threadId = getThreadId(ctx);
        if (threadId !== null) {
            lines.push(
                "/topic current — показать сервис текущего topic",
                "/topic bind <service> — привязать текущий topic к сервису"
            );
        }

        if (await isTopicRoute(ctx, "notes")) {
            lines.push(
                "",
                "Notes topic:",
                "/note <текст> — сохранить заметку вручную",
                "Обычные сообщения и медиа сохраняются автоматически."
            );
        }

        if (await isAdminTopic(ctx)) {
            lines.push(
                "",
                "Admin topic:",
                "/topic bind admin — привязать текущий topic как admin",
                "/topic bind <service> <threadId> — привязать topic по threadId",
                "/topic routes — показать привязки topics",
                "/topic unbind <service> — отвязать сервис",
                "/notes dirs — показать папки сохранения заметок",
                "/notes manual set <path> — папка для своих заметок",
                "/notes forwarded set <path> — папка для пересланного"
            );
        }

        lines.push(
            "",
            "Topics:",
            "notes — сохранение заметок и медиа",
            "monitoring — заготовка под мониторинг",
            "alerts — заготовка под алерты",
            "admin — настройки бота"
        );

        await ctx.reply(lines.join("\n"));
    });
}
