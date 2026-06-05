import { hasAdminTopicBinding, isAdminTopic } from "../services/adminAccess.js";
import { isTopicRoute } from "../services/topicRouting.js";

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

        if (await isTopicRoute(ctx, "notes")) {
            lines.push(
                "",
                "Notes topic:",
                "/note <текст> — сохранить заметку вручную",
                "Обычные сообщения и медиа сохраняются автоматически."
            );
        }

        const showAdminHelp = await isAdminTopic(ctx) || !await hasAdminTopicBinding();

        if (showAdminHelp) {
            lines.push(
                "",
                "Admin topic:",
                "/topic bind admin — первично привязать admin topic",
                "/topic bind <service> <threadId> — привязать topic к сервису",
                "/topic current — показать сервис текущего topic",
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
