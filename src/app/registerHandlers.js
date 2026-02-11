import {registerStart} from "../features/start.js";
import {registerPing} from "../features/ping.js";
import {registerNote} from "../features/note.js";
import {registerHelp} from "../features/help.js";
import {registerModeHandlers} from "./registerModeHandlers.js";

export async function registerHandlers(bot, env) {
    registerStart(bot, env);
    registerPing(bot, env);
    registerHelp(bot, env);
    registerNote(bot, env);
    await registerModeHandlers(bot, env);
}
