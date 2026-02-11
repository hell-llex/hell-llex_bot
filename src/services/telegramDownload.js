import {promises as fs} from "node:fs";
import path from "node:path";

async function exists(p) {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}

async function uniquePath(dir, fileName) {
    const ext = path.extname(fileName);
    const base = ext ? fileName.slice(0, -ext.length) : fileName;

    let candidate = path.join(dir, fileName);
    let i = 1;

    while (await exists(candidate)) {
        candidate = path.join(dir, `${base}_${i}${ext}`);
        i += 1;
    }

    return candidate;
}

export async function downloadTelegramFile({
                                               bot,
                                               fileId,
                                               destDir,
                                               preferredFileName = null,
                                           }) {
    if (!destDir) throw new Error("downloadTelegramFile: destDir is required");

    await fs.mkdir(destDir, {recursive: true});

    let file;
    try {
        file = await bot.telegram.getFile(fileId);
    } catch (err) {
        const description = err?.response?.description || "";
        if (description.includes("file is too big")) {
            console.warn(`Telegram file too big, skipping: ${fileId}`);
            return null;
        }
        throw err;
    }
    const serverName = file.file_path ? path.basename(file.file_path) : `file_${fileId}`;

    const fileName = preferredFileName || serverName;

    const urlObj = await bot.telegram.getFileLink(fileId);
    const url = urlObj.toString();

    const finalPath = await uniquePath(destDir, fileName);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download file: ${res.status} ${res.statusText}`);

    const arrayBuf = await res.arrayBuffer();
    await fs.writeFile(finalPath, Buffer.from(arrayBuf));

    return {filePath: finalPath, fileName: path.basename(finalPath), url};
}
