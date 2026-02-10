// src/features/admin/register.js
import { config } from "../../config/config.js";

export function register(bot) {
    console.log("[mode:admin] enabled");

    bot.command("status", async (ctx) => {
        await ctx.reply(
            [
                "🛠 Admin mode",
                `defaultMode: ${config.mode.default}`,
                `modes: ${Object.values(config.mode.modes).join(", ")}`,
                `tmp: ${config.paths.tmp}`,
            ].join("\n")
        );
    });

    bot.command("help", async (ctx) => {
        await ctx.reply(
            [
                "Команды (admin):",
                "/status — показать конфиг",
                "/help — помощь",
            ].join("\n")
        );
    });

    bot.on("message", async (ctx) => {
        await ctx.reply("🔒 Сейчас включён admin-режим. Используй /help");
    });
}
