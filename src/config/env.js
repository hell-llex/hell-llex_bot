export function getEnv() {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const ADMIN_USER_ID = Number(process.env.ADMIN_USER_ID || "0");

    if (!BOT_TOKEN) {
        throw new Error("❌ BOT_TOKEN is missing. Put it into .env");
    }

    return { BOT_TOKEN, ADMIN_USER_ID };
}
