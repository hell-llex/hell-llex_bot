import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config/config.js";

async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}

async function readTemplate() {
    const tplPath = config.templates.note;
    return fs.readFile(tplPath, "utf8");
}

function renderTemplate(template, vars) {
    return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => {
        const v = vars[key];
        return v === undefined || v === null ? "" : String(v);
    });
}

function safeYamlValue(v) {
    if (v === undefined || v === null) return "";
    const s = String(v);
    if (s === "") return "";
    if (/[\n\r]/.test(s)) return JSON.stringify(s); // многострочное в JSON-строке
    if (/[:#\[\]{},&*!|>'"%@`]/.test(s)) return JSON.stringify(s);
    return s;
}

/**
 * @param {object} note
 * @param {string} note.id
 * @param {Date} note.createdAt
 * @param {object} note.source
 * @param {string} note.text
 * @param {Array<{kind:string, fileName:string}>} note.media
 */
export async function saveIncomingNote(note) {
    const dir = path.posix.join(config.paths.inboxDirForward, note.id);

    await ensureDir(dir);

    const hasMedia = Boolean(note.media?.length);
    let template = await readTemplate();
    if (!hasMedia) {
        template = template.replace(
            /\r?\n## Media\r?\n{{mediaEmbeds}}\r?\n\r?\n## Media files\r?\n{{mediaList}}\r?\n?/,
            "\n"
        );
    }

    const mediaList =
        hasMedia ? note.media.map((m) => `- ${m.fileName}`).join("\n") : "";

    const mediaEmbeds =
        hasMedia
            ? note.media
                .map((m) => {
                    const name = m.fileName;
                    if (m.kind === "document") return `[${name}](${name})`;
                    return `![${name}](${name})`;
                })
                .join("\n")
            : "";


    const vars = {
        noteId: safeYamlValue(note.id),
        createdIso: safeYamlValue(note.createdAt.toISOString()),
        chatId: safeYamlValue(note.source?.chatId),
        fromId: safeYamlValue(note.source?.fromId),
        username: safeYamlValue(note.source?.username),
        forwarded: safeYamlValue(note.source?.forwarded ? "true" : "false"),
        forwardFromChatTitle: safeYamlValue(note.source?.forwardFromChatTitle),
        forwardFromChatUsername: safeYamlValue(note.source?.forwardFromChatUsername),
        forwardFromMessageId: safeYamlValue(note.source?.forwardFromMessageId),
        text: note.text || "",
        mediaList,
        mediaEmbeds,
    };

    const md = renderTemplate(template, vars);

    const notePath = path.posix.join(dir, config.note.fileName);
    await fs.writeFile(notePath, md, "utf8");

    return { dir, notePath };
}
