import { Telegraf } from "telegraf";
import { MediaGroup } from "@dietime/telegraf-media-group";
import { getEnv } from "../config/env.js";
import { registerHandlers } from "./registerHandlers.js";
import { config } from "../config/config.js";
import { errorHandler } from "../middlewares/errorHandler.js";
import { logger } from "../middlewares/logger.js";
import { whitelist } from "../middlewares/whitelist.js";
import {setupBotCommands} from "./setupBotCommands.js";
import { messageCleanup } from "../services/messageCleanup.js";

export async function createBot() {
    const env = getEnv({ requireBotToken: true });

    const bot = new Telegraf(env.BOT_TOKEN);

    bot.use(errorHandler());
    bot.use(logger());
    bot.use(whitelist(env));
    bot.use(messageCleanup(bot));
    bot.use(new MediaGroup({ timeout: config.mediaGroup.timeoutDebounce }).middleware());

    await registerHandlers(bot, env);

    await setupBotCommands(bot);

    return bot;
}
