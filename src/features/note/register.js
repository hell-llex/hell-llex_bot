// src/features/note/register.js
import { registerIngestToNotes } from "./ingestToNotes.js";

export function register(bot, env) {
    console.log("[mode:note] enabled");
    registerIngestToNotes(bot, env);
}
