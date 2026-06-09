import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config/config.js";
import { getBuiltInServiceNames, getBuiltInServices } from "./serviceCatalog.js";

const SERVICE_NAME_RE = /^[a-z][a-z0-9_-]{1,31}$/;

let cachedRegistry = null;

function emptyRegistry() {
    return {
        version: 1,
        updatedAt: null,
        routes: {},
    };
}

function normalizeServiceName(name) {
    return String(name || "").toLowerCase().trim();
}

export function validateServiceName(name) {
    const service = normalizeServiceName(name);
    if (!SERVICE_NAME_RE.test(service)) {
        throw new Error("Service name must be 2-32 chars: lowercase letters, digits, _ or -.");
    }
    return service;
}

async function ensureParentDir(filePath) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function readRegistryFile() {
    try {
        const raw = await fs.readFile(config.paths.topicRoutes, "utf8");
        const parsed = JSON.parse(raw);
        return normalizeRegistry(parsed);
    } catch (err) {
        if (err.code !== "ENOENT") throw err;
    }

    try {
        const raw = await fs.readFile(config.paths.legacyTopicRoutes, "utf8");
        const parsed = JSON.parse(raw);
        const registry = normalizeRegistry(parsed);
        await writeRegistryFile(registry);
        return registry;
    } catch (err) {
        if (err.code !== "ENOENT") throw err;
    }

    return emptyRegistry();
}

function normalizeRegistry(parsed) {
    return {
        ...emptyRegistry(),
        ...parsed,
        routes: parsed.routes && typeof parsed.routes === "object" ? parsed.routes : {},
    };
}

async function writeRegistryFile(registry) {
    const next = {
        ...registry,
        version: 1,
        updatedAt: new Date().toISOString(),
    };

    await ensureParentDir(config.paths.topicRoutes);
    await fs.writeFile(config.paths.topicRoutes, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    cachedRegistry = next;
}

export async function getTopicRegistry() {
    if (!cachedRegistry) cachedRegistry = await readRegistryFile();
    return cachedRegistry;
}

export async function getTopicRoutes() {
    const registry = await getTopicRegistry();
    const routes = {};

    for (const [service, threadId] of Object.entries(config.topics.routes)) {
        if (threadId !== null && threadId !== undefined) {
            routes[service] = {
                service,
                chatId: null,
                threadId,
                source: "env",
                boundAt: null,
            };
        }
    }

    for (const [service, route] of Object.entries(registry.routes)) {
        if (route?.threadId !== null && route?.threadId !== undefined) {
            routes[service] = {
                service,
                chatId: route.chatId ?? null,
                threadId: route.threadId,
                source: "runtime",
                boundAt: route.boundAt ?? null,
            };
        }
    }

    return routes;
}

export async function bindTopicRoute({ service, chatId, threadId }) {
    const normalizedService = validateServiceName(service);
    if (threadId === null || threadId === undefined) {
        throw new Error("This command must be sent inside a Telegram topic.");
    }

    const registry = await getTopicRegistry();
    const routes = { ...registry.routes };

    for (const [name, route] of Object.entries(routes)) {
        if (name !== normalizedService && route?.chatId === chatId && route?.threadId === threadId) {
            delete routes[name];
        }
    }

    routes[normalizedService] = {
        chatId,
        threadId,
        boundAt: new Date().toISOString(),
    };

    await writeRegistryFile({ ...registry, routes });
    return { service: normalizedService, chatId, threadId };
}

export async function unbindTopicRoute({ service, chatId, threadId }) {
    const registry = await getTopicRegistry();
    const routes = { ...registry.routes };

    if (service) {
        const normalizedService = validateServiceName(service);
        const existed = Boolean(routes[normalizedService]);
        delete routes[normalizedService];
        await writeRegistryFile({ ...registry, routes });
        return { removed: existed ? [normalizedService] : [] };
    }

    const removed = [];
    for (const [name, route] of Object.entries(routes)) {
        if (route?.chatId === chatId && route?.threadId === threadId) {
            delete routes[name];
            removed.push(name);
        }
    }

    await writeRegistryFile({ ...registry, routes });
    return { removed };
}

export { getBuiltInServiceNames, getBuiltInServices };
