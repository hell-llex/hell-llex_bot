import {registerStart} from "../features/start.js";
import {registerPing} from "../features/ping.js";
import {registerNote} from "../features/note.js";
import {registerHelp} from "../features/help.js";
import {registerModeHandlers} from "./registerModeHandlers.js";
import {registerWhereami} from "../features/whereami.js";
import {registerTopicRouter} from "./registerTopicRouter.js";
import {registerTopic} from "../features/topic.js";
import {registerServices} from "../features/services.js";
import {registerNotesSettings} from "../features/notesSettings.js";
import {registerMemorySettings} from "../features/memorySettings.js";
import {registerCleanupSettings} from "../features/cleanupSettings.js";
import {registerAlert} from "../features/alert.js";
import {registerAdminMenu} from "../features/adminMenu.js";

export async function registerHandlers(bot, env) {
    registerStart(bot, env);
    registerPing(bot, env);
    registerHelp(bot, env);
    registerWhereami(bot, env);
    registerServices(bot, env);
    registerTopic(bot, env);
    registerNotesSettings(bot, env);
    registerMemorySettings(bot, env);
    registerCleanupSettings(bot, env);
    registerAlert(bot, env);
    registerAdminMenu(bot, env);
    registerNote(bot, env);
    registerTopicRouter(bot, env);
    await registerModeHandlers(bot, env);
}
