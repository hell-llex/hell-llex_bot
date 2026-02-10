// src/app/registerModeHandlers.js
import { config } from "../config/config.js";

export async function registerModeHandlers(bot, env) {
    const mode = config.mode.default;
    const allowed = new Set(Object.values(config.mode.modes));

    const resolved = allowed.has(mode) ? mode : config.mode.modes.note;

    console.log(`[mode] default=${mode} resolved=${resolved}`);

    // динамически грузим файл режима по имени папки
    const mod = await import(`../features/${resolved}/register.js`);
    if (typeof mod.register !== "function") {
        throw new Error(`[mode] Mode "${resolved}" must export function register(bot, env)`);
    }

    mod.register(bot, env);
}
