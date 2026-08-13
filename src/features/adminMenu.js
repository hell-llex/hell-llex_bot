import { Markup } from "telegraf";
import { requireAdminTopic } from "../services/adminAccess.js";

const CALLBACK_PREFIX = "admin-menu:";

const actions = [
    {
        id: "infrastructure",
        label: "🏠 Инфраструктура",
        placeholder: "Интеграция с Homarr появится здесь. Пока раздел ещё не настроен.",
    },
    {
        id: "monitoring",
        label: "🩺 Мониторинг",
        placeholder: "Проверки сервисов появятся здесь. Пока раздел ещё не настроен.",
    },
    {
        id: "alerts",
        label: "🚨 Алерты",
        placeholder: "Управление алертами появится здесь. Пока раздел ещё не настроен.",
    },
    {
        id: "settings",
        label: "⚙️ Настройки",
        placeholder: "Настройки бота появятся здесь. Пока раздел ещё не настроен.",
    },
];

function menuKeyboard() {
    const rows = [];

    for (let index = 0; index < actions.length; index += 2) {
        rows.push(
            actions.slice(index, index + 2).map((action) =>
                Markup.button.callback(action.label, `${CALLBACK_PREFIX}${action.id}`)
            )
        );
    }

    return Markup.inlineKeyboard(rows);
}

function menuText() {
    return [
        "🛠 Панель администратора",
        "",
        "Выбери нужный раздел:",
    ].join("\n");
}

export function registerAdminMenu(bot) {
    bot.command("admin", async (ctx) => {
        if (!await requireAdminTopic(ctx)) return;

        await ctx.reply(menuText(), menuKeyboard());
    });

    for (const action of actions) {
        bot.action(`${CALLBACK_PREFIX}${action.id}`, async (ctx) => {
            await ctx.answerCbQuery();
            if (!await requireAdminTopic(ctx)) return;

            await ctx.reply(`${action.label}\n\n${action.placeholder}`);
        });
    }
}
