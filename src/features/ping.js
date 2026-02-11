export function registerPing(bot) {
    bot.command("ping", (ctx) => ctx.reply("pong ✅"));
}
