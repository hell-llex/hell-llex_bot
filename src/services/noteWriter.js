import { promises as fs } from "node:fs";
import path from "node:path";

function pad2(n) {
    return String(n).padStart(2, "0");
}

function makeTimestamp(d = new Date()) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}_` +
        `${pad2(d.getHours())}-${pad2(d.getMinutes())}-${pad2(d.getSeconds())}`;
}

export async function writeNote({ baseDir, text, meta }) {
    await fs.mkdir(baseDir, { recursive: true });

    const ts = makeTimestamp(new Date());
    const filename = `${ts}.md`;
    const fullPath = path.join(baseDir, filename);

    const fm =
        `---
source: telegram
user_id: ${meta.userId}
chat_id: ${meta.chatId}
date: ${new Date().toISOString()}
---

`;

    const body = `${text}\n`;
    await fs.writeFile(fullPath, fm + body, "utf8");

    return { filename, fullPath };
}
