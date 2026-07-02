import { getTopicRoutes } from "./topicRegistry.js";

const SEVERITIES = {
    info: { icon: "ℹ️", label: "INFO" },
    success: { icon: "✅", label: "SUCCESS" },
    warning: { icon: "⚠️", label: "WARNING" },
    critical: { icon: "🚨", label: "CRITICAL" },
};

const MAX_MESSAGE_LENGTH = 3900;

export async function getAlertsRoute() {
    const routes = await getTopicRoutes();
    return routes.alerts || null;
}

export async function sendAlert(bot, alert) {
    const route = await getAlertsRoute();
    if (!route?.threadId) {
        throw new Error("Alerts topic is not bound. Use /topic bind alerts inside the Alerts topic.");
    }
    if (!route.chatId) {
        throw new Error("Alerts topic has no chatId. Bind it at runtime with /topic bind alerts.");
    }

    return bot.telegram.sendMessage(route.chatId, formatAlert(alert), {
        message_thread_id: route.threadId,
        parse_mode: "HTML",
        disable_notification: normalizeSeverity(alert?.severity) === "info",
        link_preview_options: { is_disabled: true },
    });
}

export function formatAlert(alert = {}) {
    const severity = normalizeSeverity(alert.severity);
    const meta = SEVERITIES[severity];
    const title = alert.title || "Alert";
    const body = alert.text || alert.message || "";
    const source = alert.source ? `source: ${escapeHtml(alert.source)}` : null;
    const tags = normalizeTags(alert.tags);
    const occurredAt = alert.occurredAt || new Date();
    const details = formatDetails(alert.details);

    const lines = [
        `${meta.icon} <b>${meta.label}: ${escapeHtml(title)}</b>`,
        body ? escapeHtml(body) : null,
        "",
        source,
        tags.length ? `tags: ${tags.map((tag) => `#${escapeHtml(tag)}`).join(" ")}` : null,
        `time: ${escapeHtml(formatDate(occurredAt))}`,
        details ? "" : null,
        details,
    ].filter((line) => line !== null);

    return truncateMessage(lines.join("\n"));
}

export function normalizeSeverity(value) {
    const severity = String(value || "warning").toLowerCase().trim();
    return SEVERITIES[severity] ? severity : "warning";
}

export function isAlertSeverity(value) {
    return Boolean(SEVERITIES[String(value || "").toLowerCase().trim()]);
}

function normalizeTags(value) {
    if (!value) return [];
    const tags = Array.isArray(value) ? value : String(value).split(/[,\s]+/);

    return tags
        .map((tag) => String(tag).toLowerCase().trim().replace(/^#/, ""))
        .filter(Boolean)
        .map((tag) => tag.replace(/[^a-z0-9_-]/g, "_"))
        .slice(0, 8);
}

function formatDetails(details) {
    if (!details) return null;
    const value = typeof details === "string" ? details : JSON.stringify(details, null, 2);
    return `<pre>${escapeHtml(value)}</pre>`;
}

function formatDate(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return new Date().toISOString();
    return date.toISOString();
}

function truncateMessage(message) {
    if (message.length <= MAX_MESSAGE_LENGTH) return message;
    return `${message.slice(0, MAX_MESSAGE_LENGTH - 16)}\n… truncated`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}
