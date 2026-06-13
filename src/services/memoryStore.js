import fs from "node:fs/promises";
import path from "node:path";
import { saveIncomingNote } from "./noteStore.js";

const INLINE_MEMORY_MAX_CHARS = 1600;
const MEMORY_INDEX_FILE = "_memory.md";

async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}

function hasMedia(note) {
    return Boolean(note.media?.length);
}

function normalizeInlineText(text) {
    return String(text || "")
        .replace(/\r?\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function shouldInlineMemory(note) {
    const text = normalizeInlineText(note.text);
    return text.length > 0 && text.length <= INLINE_MEMORY_MAX_CHARS && !hasMedia(note);
}

function formatSource(note) {
    const username = note.source?.username ? `@${note.source.username}` : "";
    const fromId = note.source?.fromId ? `user:${note.source.fromId}` : "";
    return [username, fromId].filter(Boolean).join(" ");
}

async function ensureIndexFile(indexPath) {
    try {
        await fs.access(indexPath);
    } catch (err) {
        if (err.code !== "ENOENT") throw err;
        await fs.writeFile(indexPath, "# Memory\n\n", "utf8");
    }
}

async function appendMemoryIndex(note, rootDir) {
    await ensureDir(rootDir);

    const indexPath = path.posix.join(rootDir, MEMORY_INDEX_FILE);
    await ensureIndexFile(indexPath);

    const text = normalizeInlineText(note.text);
    const source = formatSource(note);
    const sourcePart = source ? ` | ${source}` : "";
    const line = `- ${note.createdAt.toISOString()} | ${note.id}${sourcePart} | ${text}\n`;

    await fs.appendFile(indexPath, line, "utf8");

    return {
        dir: rootDir,
        notePath: indexPath,
        fileName: MEMORY_INDEX_FILE,
        noteName: MEMORY_INDEX_FILE,
        storage: "index",
    };
}

export async function saveIncomingMemory(note, { baseDir }) {
    if (shouldInlineMemory(note)) {
        return appendMemoryIndex(note, baseDir);
    }

    const result = await saveIncomingNote({ ...note, mode: "memory" }, { baseDir });
    return {
        ...result,
        storage: "file",
    };
}

export function getMemoryStorageDescription() {
    return `short text without media: ${MEMORY_INDEX_FILE}; long text or media: separate Markdown files`;
}
