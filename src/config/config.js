export const config = {
    mode: {
        default: "note",
        modes: {
            note: "note",
            admin: "admin",
        },
    },

    paths: {
        tmp: "/app/data/tmp",
        inboxRoot: "/app/data/inbox",
    },

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
