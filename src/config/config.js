// src/config/config.js
// Общие настройки приложения (не секреты).
// Меняешь здесь — меняется поведение бота.

export const config = {
    mode: {
        default: "note",
        modes: {
            note: "note",
            admin: "admin",
        },
    },

    // Пути внутри контейнера (./data -> /app/data)
    paths: {
        tmp: "/app/data/tmp",

        // Корень inbox; каждая заметка = отдельная папка по noteId
        // /app/data/inbox/telegram/<noteId>/note.md + media files
        inboxRoot: "/app/data/inbox",
    },

    // Имя markdown-файла внутри папки заметки
    note: {
        fileName: "note.md",
    },

    mediaGroup: {
        timeoutDebounce: 150,
    },

    media: {
        photoDownloadSize: "min",
    },

    templates: {
        note: "/app/src/templates/note.md",
    },
};
