const CONTENT_FIELDS = [
    "text",
    "caption",
    "photo",
    "video",
    "document",
    "voice",
    "audio",
    "animation",
    "video_note",
    "sticker",
];

export function isCommandMessage(msg) {
    return Boolean(msg?.text?.startsWith("/"));
}

export function hasSupportedMessageContent(msg) {
    if (!msg) return false;
    return CONTENT_FIELDS.some((field) => {
        const value = msg[field];
        return Array.isArray(value) ? value.length > 0 : Boolean(value);
    });
}

export function hasSupportedUpdateContent(ctx) {
    const album = ctx.update?.media_group;
    if (album?.length) {
        return album.some(hasSupportedMessageContent);
    }

    return hasSupportedMessageContent(ctx.message);
}
