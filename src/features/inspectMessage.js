import { config } from "../config/config.js";
import { downloadTelegramFile } from "../services/telegramDownload.js";
import { media_group } from "@dietime/telegraf-media-group";

const DOWNLOAD_CONCURRENCY = 4;

function normalizeText(text) {
    const t = (text || "").trim();
    return t ? t : "⛔️ Текста нет";
}

function pickPhotoSize(photoArray) {
    if (!photoArray?.length) return null;

    const mode = config.media.photoDownloadSize;
    if (mode === "min") return photoArray[0];
    if (mode === "mid") return photoArray[Math.floor(photoArray.length / 2)];
    return photoArray[photoArray.length - 1]; // max
}

function extractText(msg) {
    return msg.text ?? msg.caption ?? "";
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

function makeTmpKeyForAlbum(mediaGroupId) {
    return `mg_${mediaGroupId}`;
}

function makeTmpKeyForSingle(messageId) {
    return `msg_${messageId}`;
}

function buildAlbumCaption({ originalText, infoLines }) {
    const parts = [];
    parts.push(normalizeText(originalText));
    parts.push("");
    parts.push("—");
    parts.push("✅ Всё готово!");
    parts.push(...infoLines);
    return parts.join("\n").trim();
}

function buildMediaGroupInputs({ albumFiles, caption }) {
    return albumFiles.slice(0, 10).map((f, idx) => ({
        type: f.type,
        media: { source: f.filePath },
        ...(idx === 0 && caption ? { caption } : {}),
    }));
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

async function downloadAllMediaFromMessage({ bot, msg, tmpDir, tmpKey }) {
    const tasks = [];

    if (msg.photo?.length) {
        tasks.push(async () => {
            const photo = pickPhotoSize(msg.photo);
            const mode = config.media.photoDownloadSize;

            const { filePath } = await downloadTelegramFile({
                bot,
                fileId: photo.file_id,
                dirAbsolute: tmpDir,
                subDir: tmpKey,
                nameBase: `photo_${msg.message_id}_${mode}`,
            });

            return { type: "photo", filePath };
        });
    }

    if (msg.video) {
        tasks.push(async () => {
            const { filePath } = await downloadTelegramFile({
                bot,
                fileId: msg.video.file_id,
                dirAbsolute: tmpDir,
                subDir: tmpKey,
                nameBase: `video_${msg.message_id}`,
            });

            return { type: "video", filePath };
        });
    }

    if (msg.document) {
        tasks.push(async () => {
            const { filePath } = await downloadTelegramFile({
                bot,
                fileId: msg.document.file_id,
                dirAbsolute: tmpDir,
                subDir: tmpKey,
                preferredFileName: msg.document.file_name || `doc_${msg.message_id}`,
            });

            return { type: "document", filePath };
        });
    }

    if (msg.voice) {
        tasks.push(async () => {
            const { filePath } = await downloadTelegramFile({
                bot,
                fileId: msg.voice.file_id,
                dirAbsolute: tmpDir,
                subDir: tmpKey,
                nameBase: `voice_${msg.message_id}`,
            });

            return { type: "voice", filePath };
        });
    }

    if (msg.audio) {
        tasks.push(async () => {
            const { filePath } = await downloadTelegramFile({
                bot,
                fileId: msg.audio.file_id,
                dirAbsolute: tmpDir,
                subDir: tmpKey,
                nameBase: `audio_${msg.message_id}`,
            });

            return { type: "audio", filePath };
        });
    }

    if (msg.animation) {
        tasks.push(async () => {
            const { filePath } = await downloadTelegramFile({
                bot,
                fileId: msg.animation.file_id,
                dirAbsolute: tmpDir,
                subDir: tmpKey,
                nameBase: `anim_${msg.message_id}`,
            });

            return { type: "animation", filePath };
        });
    }

    if (msg.video_note) {
        tasks.push(async () => {
            const { filePath } = await downloadTelegramFile({
                bot,
                fileId: msg.video_note.file_id,
                dirAbsolute: tmpDir,
                subDir: tmpKey,
                nameBase: `video_note_${msg.message_id}`,
            });

            return { type: "video_note", filePath };
        });
    }

    if (msg.sticker) {
        tasks.push(async () => {
            const { filePath } = await downloadTelegramFile({
                bot,
                fileId: msg.sticker.file_id,
                dirAbsolute: tmpDir,
                subDir: tmpKey,
                nameBase: `sticker_${msg.message_id}`,
            });

            return { type: "sticker", filePath };
        });
    }

    const results = await runWithConcurrency(tasks, DOWNLOAD_CONCURRENCY);
    return results.filter(Boolean);
}

async function sendBackDownloadedMedia({ bot, chatId, files, caption }) {
    const album = files.filter((f) => f.type === "photo" || f.type === "video");
    const others = files.filter((f) => f.type !== "photo" && f.type !== "video");

    if (album.length) {
        const inputs = buildMediaGroupInputs({ albumFiles: album, caption });
        await bot.telegram.sendMediaGroup(chatId, inputs);
    } else {
        if (caption) await bot.telegram.sendMessage(chatId, caption);
    }

    for (const f of others) {
        if (f.type === "document") await bot.telegram.sendDocument(chatId, { source: f.filePath });
        else if (f.type === "voice") await bot.telegram.sendVoice(chatId, { source: f.filePath });
        else if (f.type === "audio") await bot.telegram.sendAudio(chatId, { source: f.filePath });
        else if (f.type === "animation") await bot.telegram.sendAnimation(chatId, { source: f.filePath });
        else if (f.type === "video_note") await bot.telegram.sendVideoNote(chatId, { source: f.filePath });
        else if (f.type === "sticker") await bot.telegram.sendSticker(chatId, { source: f.filePath });
    }
}

async function processSingleMessage(bot, ctx, msg) {
    const chatId = ctx.chat.id;
    const tmpDir = config.paths.tmp;
    const tmpKey = makeTmpKeyForSingle(msg.message_id);

    const forwarded = isForwarded(msg);
    const originalText = extractText(msg);

    const caption = [
        normalizeText(originalText),
        "",
        "—",
        `📦 message: ${msg.message_id}`,
        `📁 saved: ${config.paths.tmp}/${tmpKey}`,
        `↪️ forward: ${forwarded ? "yes" : "no"}`,
    ].join("\n");

    await ctx.sendChatAction("typing");

    const files = await downloadAllMediaFromMessage({ bot, msg, tmpDir, tmpKey });

    if (!files.length) {
        await bot.telegram.sendMessage(chatId, caption);
        return;
    }

    await sendBackDownloadedMedia({ bot, chatId, files, caption });
}

export function registerInspectMessage(bot) {
    bot.on(media_group(), async (ctx) => {
        const chatId = ctx.chat.id;
        const tmpDir = config.paths.tmp;

        const items = ctx.update.media_group;
        if (!items?.length) return;

        await ctx.sendChatAction("typing");

        const mediaGroupId = items[0].media_group_id;
        const tmpKey = makeTmpKeyForAlbum(mediaGroupId);

        const originalText = items.map(extractText).find((t) => (t || "").trim()) || "";
        const forwarded = items.some(isForwarded);

        const infoLines = [
            `📦 album: ${mediaGroupId}`,
            `🧩 items: ${items.length}`,
            `↪️ forward: ${forwarded ? "yes" : "no"}`,
            `📁 saved: ${config.paths.tmp}/${tmpKey}`,
        ];

        const caption = buildAlbumCaption({ originalText, infoLines });

        const perMessageTasks = items.map((msg) => () =>
            downloadAllMediaFromMessage({ bot, msg, tmpDir, tmpKey })
        );
        const perMessageFiles = await runWithConcurrency(perMessageTasks, DOWNLOAD_CONCURRENCY);
        const allFiles = perMessageFiles.flat();

        await sendBackDownloadedMedia({ bot, chatId, files: allFiles, caption });
    });

    bot.on("message", async (ctx) => {
        const msg = ctx.message;
        if (!msg) return;

        if (msg.media_group_id) return;

        await processSingleMessage(bot, ctx, msg);
    });
}
