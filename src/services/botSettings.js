import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config/config.js";

let cachedSettings = null;

function emptySettings() {
    return {
        version: 1,
        updatedAt: null,
        notes: {
            manualDir: null,
            forwardedDir: null,
        },
        memory: {
            dir: null,
        },
        cleanup: {
            deleteAfterSeconds: null,
        },
    };
}

async function ensureParentDir(filePath) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function readSettingsFile() {
    try {
        const raw = await fs.readFile(config.paths.botSettings, "utf8");
        const parsed = JSON.parse(raw);
        return normalizeSettings(parsed);
    } catch (err) {
        if (err.code !== "ENOENT") throw err;
    }

    try {
        const raw = await fs.readFile(config.paths.legacyBotSettings, "utf8");
        const parsed = JSON.parse(raw);
        const settings = normalizeSettings(parsed);
        await writeSettingsFile(settings);
        return settings;
    } catch (err) {
        if (err.code !== "ENOENT") throw err;
    }

    return emptySettings();
}

function normalizeSettings(parsed) {
    return {
        ...emptySettings(),
        ...parsed,
        notes: {
            ...emptySettings().notes,
            ...(parsed.notes || {}),
        },
        memory: {
            ...emptySettings().memory,
            ...(parsed.memory || {}),
        },
        cleanup: {
            ...emptySettings().cleanup,
            ...(parsed.cleanup || {}),
        },
    };
}

async function writeSettingsFile(settings) {
    const next = {
        ...settings,
        version: 1,
        updatedAt: new Date().toISOString(),
    };

    await ensureParentDir(config.paths.botSettings);
    await fs.writeFile(config.paths.botSettings, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    cachedSettings = next;
}

export async function getBotSettings() {
    if (!cachedSettings) cachedSettings = await readSettingsFile();
    return cachedSettings;
}

export function validateInboxDir(value) {
    const dir = String(value || "").trim();

    if (!dir) {
        throw new Error("Inbox dir is required.");
    }

    if (!dir.startsWith("/")) {
        throw new Error("Inbox dir must be an absolute container path, for example /vault/Telegram.");
    }

    if (/[\0\r\n]/.test(dir)) {
        throw new Error("Inbox dir contains unsupported characters.");
    }

    const normalized = path.posix.normalize(dir);
    if (normalized.includes("/../") || normalized.endsWith("/..")) {
        throw new Error("Inbox dir must not contain .. segments.");
    }

    return normalized;
}

export async function getManualNotesDir() {
    const settings = await getBotSettings();
    return settings.notes.manualDir || config.paths.inboxDirNotes;
}

export async function getForwardedNotesDir() {
    const settings = await getBotSettings();
    return settings.notes.forwardedDir || config.paths.inboxDirForward;
}

export async function getMemoryDir() {
    const settings = await getBotSettings();
    return settings.memory.dir || config.paths.inboxDirMemory;
}

export async function getNotesDirs() {
    return {
        manualDir: await getManualNotesDir(),
        forwardedDir: await getForwardedNotesDir(),
    };
}

export async function getMemorySettings() {
    return {
        dir: await getMemoryDir(),
    };
}

export async function getCleanupSettings() {
    const settings = await getBotSettings();
    return {
        deleteAfterSeconds: settings.cleanup.deleteAfterSeconds ?? config.cleanup.autoDeleteAfterSeconds,
    };
}

export async function getInboxDirForNoteKind(kind) {
    return kind === "forwarded" ? await getForwardedNotesDir() : await getManualNotesDir();
}

export function validateCleanupSeconds(value) {
    const n = Number(value);

    if (!Number.isFinite(n) || n < 0) {
        throw new Error("Cleanup seconds must be a non-negative number.");
    }

    return Math.floor(n);
}

async function setNotesDir(key, dir) {
    const normalizedDir = validateInboxDir(dir);
    const settings = await getBotSettings();

    await writeSettingsFile({
        ...settings,
        notes: {
            ...settings.notes,
            [key]: normalizedDir,
        },
    });

    return normalizedDir;
}

async function resetNotesDir(key, fallback) {
    const settings = await getBotSettings();

    await writeSettingsFile({
        ...settings,
        notes: {
            ...settings.notes,
            [key]: null,
        },
    });

    return fallback;
}

export async function setManualNotesDir(dir) {
    return setNotesDir("manualDir", dir);
}

export async function setForwardedNotesDir(dir) {
    return setNotesDir("forwardedDir", dir);
}

export async function resetManualNotesDir() {
    return resetNotesDir("manualDir", config.paths.inboxDirNotes);
}

export async function resetForwardedNotesDir() {
    return resetNotesDir("forwardedDir", config.paths.inboxDirForward);
}

export async function setMemoryDir(dir) {
    const normalizedDir = validateInboxDir(dir);
    const settings = await getBotSettings();

    await writeSettingsFile({
        ...settings,
        memory: {
            ...settings.memory,
            dir: normalizedDir,
        },
    });

    return normalizedDir;
}

export async function resetMemoryDir() {
    const settings = await getBotSettings();

    await writeSettingsFile({
        ...settings,
        memory: {
            ...settings.memory,
            dir: null,
        },
    });

    return config.paths.inboxDirMemory;
}

export async function setCleanupDeleteAfterSeconds(seconds) {
    const normalizedSeconds = validateCleanupSeconds(seconds);
    const settings = await getBotSettings();

    await writeSettingsFile({
        ...settings,
        cleanup: {
            ...settings.cleanup,
            deleteAfterSeconds: normalizedSeconds,
        },
    });

    return normalizedSeconds;
}

export async function resetCleanupDeleteAfterSeconds() {
    const settings = await getBotSettings();

    await writeSettingsFile({
        ...settings,
        cleanup: {
            ...settings.cleanup,
            deleteAfterSeconds: null,
        },
    });

    return config.cleanup.autoDeleteAfterSeconds;
}
