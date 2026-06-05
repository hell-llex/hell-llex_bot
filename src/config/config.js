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
        topicRoutes: env.TOPIC_ROUTES_PATH, // Runtime-привязки Telegram topics к сервисам (src/services/topicRegistry.js)
        botSettings: env.BOT_SETTINGS_PATH, // Runtime-настройки бота (src/services/botSettings.js)
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

    topics: {
        enabled: env.TOPICS_ENABLED,
        routes: {
            notes: env.TOPIC_NOTES_THREAD_ID,
            monitoring: env.TOPIC_MONITORING_THREAD_ID,
            alerts: env.TOPIC_ALERTS_THREAD_ID,
            admin: env.TOPIC_ADMIN_THREAD_ID,
        },
    },

    templates: {
        note: "/app/src/templates/note.md",
    },
};
