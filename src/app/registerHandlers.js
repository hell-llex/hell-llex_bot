// src/app/registerHandlers.js
// Единая точка, где видно, какие "фичи" подключены.
// Добавляешь новую фичу -> импортируешь здесь -> вызываешь registerX.

import {registerStart} from "../features/start.js";
import {registerPing} from "../features/ping.js";
import {registerEchoMessage, registerEchoText} from "../features/echoText.js";
import {registerNote} from "../features/note.js";
import {registerHelp} from "../features/help.js";
import {registerModeHandlers} from "./registerModeHandlers.js";

export async function registerHandlers(bot, env) {
    registerStart(bot, env);
    registerPing(bot, env);
    registerHelp(bot, env);
    registerNote(bot, env);
    await registerModeHandlers(bot, env);
    // registerEchoMessage(bot, env);
    // registerEchoText(bot, env);
    // registerInspectMessage(bot, env);
}
