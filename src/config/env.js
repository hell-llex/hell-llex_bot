function toInt(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
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

    const TMP_DIR = process.env.TMP_DIR || `${DATA_ROOT}/tmp`;
    const DATA_DISPLAY_ROOT = process.env.DATA_DISPLAY_ROOT || "data";
    const PHOTO_DOWNLOAD_SIZE = normalizePhotoSizeMode(process.env.PHOTO_DOWNLOAD_SIZE || "min");

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
    };
}
