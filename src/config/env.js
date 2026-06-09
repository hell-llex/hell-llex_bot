import path from "node:path";

function toInt(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function toOptionalInt(value) {
    if (value === undefined || value === null || String(value).trim() === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

function toBool(value, fallback = false) {
    if (value === undefined || value === null || String(value).trim() === "") return fallback;
    const normalized = String(value).toLowerCase().trim();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function normalizePhotoSizeMode(value) {
    const mode = String(value || "").toLowerCase().trim();
    if (mode === "min" || mode === "mid" || mode === "max") return mode;
    return "min";
}

export function getEnv({ requireBotToken = false } = {}) {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const ADMIN_USER_ID = toInt(process.env.ADMIN_USER_ID || "0", 0);

    const DATA_ROOT = process.env.DATA_ROOT || "/app/data";

    const INBOX_DIR_NOTES = process.env.INBOX_DIR_NOTES || `${DATA_ROOT}/Notes`;
    const INBOX_DIR_FORWARD = process.env.INBOX_DIR_FORWARD || `${DATA_ROOT}/Telegram`;
    const INBOX_DIR_MEMORY = process.env.INBOX_DIR_MEMORY || `${DATA_ROOT}/Memory`;
    const BOT_INTERNAL_DIR = process.env.BOT_INTERNAL_DIR || `${path.posix.dirname(INBOX_DIR_FORWARD)}/.bot`;
    const TOPIC_ROUTES_PATH = process.env.TOPIC_ROUTES_PATH || `${BOT_INTERNAL_DIR}/topic-routes.json`;
    const BOT_SETTINGS_PATH = process.env.BOT_SETTINGS_PATH || `${BOT_INTERNAL_DIR}/settings.json`;
    const LEGACY_TOPIC_ROUTES_PATH = `${INBOX_DIR_FORWARD}/_bot/topic-routes.json`;
    const LEGACY_BOT_SETTINGS_PATH = `${INBOX_DIR_FORWARD}/_bot/settings.json`;

    const TMP_DIR = process.env.TMP_DIR || `${DATA_ROOT}/tmp`;
    const DATA_DISPLAY_ROOT = process.env.DATA_DISPLAY_ROOT || "data";
    const PHOTO_DOWNLOAD_SIZE = normalizePhotoSizeMode(process.env.PHOTO_DOWNLOAD_SIZE || "min");

    const TOPICS_ENABLED = toBool(process.env.TOPICS_ENABLED, false);
    const TOPIC_NOTES_THREAD_ID = toOptionalInt(process.env.TOPIC_NOTES_THREAD_ID);
    const TOPIC_MEMORY_THREAD_ID = toOptionalInt(process.env.TOPIC_MEMORY_THREAD_ID);
    const TOPIC_MONITORING_THREAD_ID = toOptionalInt(process.env.TOPIC_MONITORING_THREAD_ID);
    const TOPIC_ALERTS_THREAD_ID = toOptionalInt(process.env.TOPIC_ALERTS_THREAD_ID);
    const TOPIC_ADMIN_THREAD_ID = toOptionalInt(process.env.TOPIC_ADMIN_THREAD_ID);

    if (requireBotToken && !BOT_TOKEN) {
        throw new Error("❌ BOT_TOKEN is missing. Put it into .env");
    }

    return {
        BOT_TOKEN,
        ADMIN_USER_ID,
        DATA_ROOT,
        TMP_DIR,
        DATA_DISPLAY_ROOT,
        PHOTO_DOWNLOAD_SIZE,
        INBOX_DIR_NOTES,
        INBOX_DIR_FORWARD,
        INBOX_DIR_MEMORY,
        BOT_INTERNAL_DIR,
        TOPIC_ROUTES_PATH,
        BOT_SETTINGS_PATH,
        LEGACY_TOPIC_ROUTES_PATH,
        LEGACY_BOT_SETTINGS_PATH,
        TOPICS_ENABLED,
        TOPIC_NOTES_THREAD_ID,
        TOPIC_MEMORY_THREAD_ID,
        TOPIC_MONITORING_THREAD_ID,
        TOPIC_ALERTS_THREAD_ID,
        TOPIC_ADMIN_THREAD_ID,
    };
}
