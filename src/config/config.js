import { getEnv } from "./env.js";

const env = getEnv();

export const config = {
    mode: {
        default: "note",
        modes: {
            note: "note",
            admin: "admin",
        },
    },

    paths: {
        dataRoot: env.DATA_ROOT, // Базовый корень данных (используется для относительного отображения путей в ответах бота)
        tmp: env.TMP_DIR, // Временная папка для inspect/download сценариев (src/features/inspectMessage.js)
        inboxDirNotes: env.INBOX_DIR_NOTES, // Куда сохраняются заметки и медиа (src/features/note/*, src/services/noteStore.js)
        inboxDirForward: env.INBOX_DIR_FORWARD, // Куда сохраняются заметки и медиа (src/features/note/*, src/services/noteStore.js)
        dataDisplayRoot: env.DATA_DISPLAY_ROOT, // Какой префикс показывать пользователю вместо абсолютного пути (например "data")
    },

    note: {
        fileName: "note.md",
    },

    mediaGroup: {
        timeoutDebounce: 150,
    },

    media: {
        photoDownloadSize: env.PHOTO_DOWNLOAD_SIZE, // Качество фото при скачивании из Telegram: min | mid | max
    },

    templates: {
        note: "/app/src/templates/note.md",
    },
};
