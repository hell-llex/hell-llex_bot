import { createBot } from "./app/createBot.js";
import { APP_VERSION } from "./config/appInfo.js";
import { config } from "./config/config.js";

console.log(
    [
        "▶️ Starting bot",
        `version=${APP_VERSION}`,
        `mode=${config.mode.default}`,
        `inbox=${config.paths.inboxRoot}`,
    ].join("\n")
);

try {
    const bot = await createBot();

    await bot.launch();
    console.log(
        [
            "🚀 Bot started (long polling)",
            `version=${APP_VERSION}`,
            `mode=${config.mode.default}`,
            `inbox=${config.paths.inboxRoot}`,
        ].join("\n")
    );

    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
} catch (err) {
    console.error(`❌ Bot startup failed | version=${APP_VERSION}`, err);
    process.exit(1);
}
