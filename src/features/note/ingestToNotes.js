import { media_group } from "@dietime/telegraf-media-group";
import { config } from "../../config/config.js";
import { downloadTelegramFile } from "../../services/telegramDownload.js";
import { saveIncomingNote } from "../../services/noteStore.js";
import path from "node:path";

const DOWNLOAD_CONCURRENCY = 4;
const BOT_FILE_LIMIT_BYTES = 20 * 1024 * 1024;
const EXT_BY_MIME = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "audio/mpeg": ".mp3",
    "audio/ogg": ".ogg",
    "audio/opus": ".opus",
    "application/pdf": ".pdf",
};

function isFileTooBig(file) {
    return Boolean(file?.file_size && file.file_size > BOT_FILE_LIMIT_BYTES);
}

function pickExtension(kind, file) {
    const name = file?.file_name || "";
    const extFromName = name ? path.extname(name) : "";
    if (extFromName) return extFromName;

    const extFromMime = EXT_BY_MIME[file?.mime_type || ""];
    if (extFromMime) return extFromMime;

    switch (kind) {
        case "photo":
            return ".jpg";
        case "video":
        case "video_note":
            return ".mp4";
        case "voice":
            return ".ogg";
        case "audio":
            return ".mp3";
        case "animation":
            return ".mp4";
        case "sticker":
            return ".webp";
        default:
            return "";
    }
}

function buildPreferredFileName(kind, file, counters) {
    counters[kind] = (counters[kind] || 0) + 1;
    const index = String(counters[kind]).padStart(3, "0");
    const ext = pickExtension(kind, file);
    return `${kind}_${index}${ext}`;
}


function normalizeUrl(u) {
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    return `https://${u}`;
}

function applyEntitiesToMarkdown(text, entities = []) {
    if (!text || !entities?.length) return text || "";

    const sorted = [...entities].sort((a, b) => {
        const ao = a.offset ?? 0;
        const bo = b.offset ?? 0;
        if (bo !== ao) return bo - ao;
        return (b.length ?? 0) - (a.length ?? 0);
    });

    let out = text;

    for (const e of sorted) {
        const offset = e.offset ?? 0;
        const length = e.length ?? 0;
        if (length <= 0) continue;

        const part = out.slice(offset, offset + length);

        let replaced = part;

        switch (e.type) {
            case "text_link": {
                const url = normalizeUrl(e.url);
                replaced = `[${part}](${url})`;
                break;
            }

            case "url": {
                const url = normalizeUrl(part);
                replaced = `[${part}](${url})`;
                break;
            }

            case "bold":
                replaced = `**${part}**`;
                break;

            case "italic":
                replaced = `_${part}_`;
                break;

            case "strikethrough":
                replaced = `~~${part}~~`;
                break;

            case "code":
                replaced = `\`${part}\``;
                break;

            case "pre": {
                replaced = `\n\`\`\`\n${part}\n\`\`\`\n`;
                break;
            }

            case "spoiler":
                replaced = `||${part}||`;
                break;

            default:
                replaced = part;
        }

        out = out.slice(0, offset) + replaced + out.slice(offset + length);
    }

    return out;
}

function extractMarkdownFromMessage(msg) {
    if (msg.caption) {
        return applyEntitiesToMarkdown(msg.caption, msg.caption_entities || []);
    }
    if (msg.text) {
        return applyEntitiesToMarkdown(msg.text, msg.entities || []);
    }
    return "";
}

function normalizeText(text) {
    const t = (text || "").trim();
    return t ? t : "⛔️ Текста нет";
}


function isForwarded(msg) {
    return Boolean(
        msg.forward_from ||
        msg.forward_from_chat ||
        msg.forward_sender_name ||
        msg.forward_date ||
        msg.forward_origin
    );
}

function extractForwardMeta(msg) {
    const chat = msg.forward_from_chat || msg.forward_origin?.chat;

    return {
        forwardFromChatTitle: chat?.title || "",
        forwardFromChatUsername: chat?.username || "",
        forwardFromMessageId: msg.forward_from_message_id || msg.forward_origin?.message_id || "",
    };
}

function pickPhotoSize(photoArray) {
    if (!photoArray?.length) return null;

    const mode = config.media.photoDownloadSize;
    if (mode === "min") return photoArray[0];
    if (mode === "mid") return photoArray[Math.floor(photoArray.length / 2)];
    return photoArray[photoArray.length - 1];
}

async function runWithConcurrency(tasks, limit) {
    const results = new Array(tasks.length);
    let nextIndex = 0;

    async function worker() {
        while (true) {
            const i = nextIndex++;
            if (i >= tasks.length) return;
            results[i] = await tasks[i]();
        }
    }

    const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
    await Promise.all(workers);
    return results;
}

async function downloadAllMediaToNoteDir({ bot, msg, noteDir, nameCounters = {} }) {
    const tasks = [];
    const skipped = [];
    const download = async (kind, params) => {
        const result = await downloadTelegramFile(params);
        if (!result) return null;
        return { kind, fileName: result.fileName };
    };

    if (msg.photo?.length) {
        tasks.push(async () => {
            const photo = pickPhotoSize(msg.photo);
            if (isFileTooBig(photo)) {
                skipped.push({ kind: "photo" });
                return null;
            }
            return download("photo", {
                bot,
                fileId: photo.file_id,
                destDir: noteDir,
                preferredFileName: buildPreferredFileName("photo", photo, nameCounters),
            });
        });
    }

    if (msg.video) {
        tasks.push(async () => {
            if (isFileTooBig(msg.video)) {
                skipped.push({ kind: "video", fileName: msg.video.file_name || "" });
                return null;
            }
            return download("video", {
                bot,
                fileId: msg.video.file_id,
                destDir: noteDir,
                preferredFileName: buildPreferredFileName("video", msg.video, nameCounters),
            });
        });
    }

    if (msg.document) {
        tasks.push(async () => {
            if (isFileTooBig(msg.document)) {
                skipped.push({ kind: "document", fileName: msg.document.file_name || "" });
                return null;
            }
            return download("document", {
                bot,
                fileId: msg.document.file_id,
                destDir: noteDir,
                preferredFileName: buildPreferredFileName("document", msg.document, nameCounters),
            });
        });
    }

    if (msg.voice) {
        tasks.push(async () => {
            if (isFileTooBig(msg.voice)) {
                skipped.push({ kind: "voice" });
                return null;
            }
            return download("voice", {
                bot,
                fileId: msg.voice.file_id,
                destDir: noteDir,
                preferredFileName: buildPreferredFileName("voice", msg.voice, nameCounters),
            });
        });
    }

    if (msg.audio) {
        tasks.push(async () => {
            if (isFileTooBig(msg.audio)) {
                skipped.push({ kind: "audio", fileName: msg.audio.file_name || "" });
                return null;
            }
            return download("audio", {
                bot,
                fileId: msg.audio.file_id,
                destDir: noteDir,
                preferredFileName: buildPreferredFileName("audio", msg.audio, nameCounters),
            });
        });
    }

    if (msg.animation) {
        tasks.push(async () => {
            if (isFileTooBig(msg.animation)) {
                skipped.push({ kind: "animation" });
                return null;
            }
            return download("animation", {
                bot,
                fileId: msg.animation.file_id,
                destDir: noteDir,
                preferredFileName: buildPreferredFileName("animation", msg.animation, nameCounters),
            });
        });
    }

    if (msg.video_note) {
        tasks.push(async () => {
            if (isFileTooBig(msg.video_note)) {
                skipped.push({ kind: "video_note" });
                return null;
            }
            return download("video_note", {
                bot,
                fileId: msg.video_note.file_id,
                destDir: noteDir,
                preferredFileName: buildPreferredFileName("video_note", msg.video_note, nameCounters),
            });
        });
    }

    if (msg.sticker) {
        tasks.push(async () => {
            if (isFileTooBig(msg.sticker)) {
                skipped.push({ kind: "sticker" });
                return null;
            }
            return download("sticker", {
                bot,
                fileId: msg.sticker.file_id,
                destDir: noteDir,
                preferredFileName: buildPreferredFileName("sticker", msg.sticker, nameCounters),
            });
        });
    }

    const results = await runWithConcurrency(tasks, DOWNLOAD_CONCURRENCY);
    return { media: results.filter(Boolean), skipped };
}

async function handleSingle(bot, ctx, msg) {
    await ctx.sendChatAction("typing");

    const noteId = `msg_${msg.message_id}`;
    const noteDir = `${config.paths.inboxDirForward}/${noteId}`;
    const noteTextMd = normalizeText(extractMarkdownFromMessage(msg));

    const forwarded = isForwarded(msg);
    const forwardMeta = extractForwardMeta(msg);

    const nameCounters = {};
    const { media, skipped } = await downloadAllMediaToNoteDir({
        bot,
        msg,
        noteDir,
        nameCounters,
    });

    const note = {
        id: noteId,
        createdAt: new Date((msg.date || Math.floor(Date.now() / 1000)) * 1000),
        text: noteTextMd,
        source: {
            chatId: ctx.chat?.id,
            fromId: ctx.from?.id,
            username: ctx.from?.username || "",
            forwarded,
            ...forwardMeta,
        },
        media,
    };

    await saveIncomingNote(note);

    let replyText = `✅ Saved: ${noteId}`;
    if (skipped.length) {
        replyText +=
            "\n⚠️ Файл слишком большой для скачивания. Прикрепите в заметку ссылку для на файл.";
    }
    await ctx.reply(replyText);
}

async function handleAlbum(bot, ctx, items) {
    await ctx.sendChatAction("typing");

    const mediaGroupId = items[0].media_group_id;
    const noteId = `mg_${mediaGroupId}`;
    const noteDir = `${config.paths.inboxDirForward}/${noteId}`;

    const forwarded = items.some(isForwarded);
    const forwardMeta = extractForwardMeta(items.find(isForwarded) || items[0]);

    const text =
        items.map(extractMarkdownFromMessage).find((t) => (t || "").trim()) || "";

    // качаем все медиа всех элементов альбома
    const nameCounters = {};
    const perMsgTasks = items.map((m) => () =>
        downloadAllMediaToNoteDir({ bot, msg: m, noteDir, nameCounters })
    );
    const perMsgMedia = await runWithConcurrency(perMsgTasks, DOWNLOAD_CONCURRENCY);
    const media = perMsgMedia.flatMap((r) => r.media);
    const skipped = perMsgMedia.flatMap((r) => r.skipped);

    const note = {
        id: noteId,
        createdAt: new Date((items[0].date || Math.floor(Date.now() / 1000)) * 1000),
        text: normalizeText(text),
        source: {
            chatId: ctx.chat?.id,
            fromId: ctx.from?.id,
            username: ctx.from?.username || "",
            forwarded,
            ...forwardMeta,
        },
        media,
    };

    
    
    console.log('note:', note);

    await saveIncomingNote(note);

    let replyText = `✅ Saved: ${noteId}`;
    if (skipped.length) {
        replyText +=
            "\n⚠️ Файл слишком большой для скачивания. Прикрепите в заметку ссылку для на файл.";
    }
    await ctx.reply(replyText);
}

export function registerIngestToNotes(bot) {
    bot.on(media_group(), async (ctx) => {
        const items = ctx.update.media_group;
        if (!items?.length) return;
        await handleAlbum(bot, ctx, items);
    });

    bot.on("message", async (ctx) => {
        const msg = ctx.message;
        if (!msg) return;
        if (msg.media_group_id) return;
        await handleSingle(bot, ctx, msg);
    });
}
