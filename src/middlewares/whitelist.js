// src/middlewares/whitelist.js
// Whitelist — простой "доступ только для меня".
// Сейчас: пропускаем только ADMIN_USER_ID.
// Позже: добавим хранение списка (json/SQLite) и команды /allow /deny.

export function whitelist(env) {
    const adminId = env.ADMIN_USER_ID;

    return async (ctx, next) => {
        // Если adminId не задан, считаем что whitelist выключен (dev-режим)
        if (!adminId) return next();

        // ctx.from может быть undefined для некоторых апдейтов, но для сообщений обычно есть
        const fromId = ctx.from?.id;

        // Пропускаем только админа
        if (fromId === adminId) return next();

        // Остальных молча игнорируем (чтобы бот не светился)
        return;
    };
}
