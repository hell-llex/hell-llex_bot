import { createBot } from "./app/createBot.js";

const bot = await createBot();

await bot.launch();
console.log("🚀 Bot started (long polling)");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
