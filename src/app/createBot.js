// src/app/createBot.js
// "Сборщик" приложения: создаёт экземпляр Telegraf, подключает middleware и features.

import { Telegraf } from "telegraf";
import { MediaGroup } from "@dietime/telegraf-media-group";
import { getEnv } from "../config/env.js";
import { registerHandlers } from "./registerHandlers.js";
import { config } from "../config/config.js";
import { errorHandler } from "../middlewares/errorHandler.js";
import { logger } from "../middlewares/logger.js";
import { whitelist } from "../middlewares/whitelist.js";
import {setupBotCommands} from "./setupBotCommands.js";

export async function createBot() {
    // Читаем конфиг из окружения (из .env внутри контейнера)
    const env = getEnv();

    // Создаём бота с токеном
    const bot = new Telegraf(env.BOT_TOKEN);

    // Middleware выполняются "на каждый апдейт" (сообщение/команда/фото и т.п.)
    // Порядок важен:
    // - errorHandler должен быть первым, чтобы ловить ошибки в любом месте дальше
    // - logger пишет базовую инфу про апдейт
    // - whitelist отсекает чужих (позже сделаем списки, роли и т.д.)
    bot.use(errorHandler());
    bot.use(logger());
    bot.use(whitelist(env));
    bot.use(new MediaGroup({ timeout: config.mediaGroup.timeoutDebounce }).middleware()); // :contentReference[oaicite:3]{index=3}

    // Здесь подключаем "фичи" (команды и обработчики событий)
    await registerHandlers(bot, env);

    // Важно: это "fire-and-forget". Команды обновятся при старте,
    // но даже если Telegram не ответит — бот всё равно будет работать.
    await setupBotCommands(bot);

    return bot;
}
