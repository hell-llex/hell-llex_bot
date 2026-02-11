export function whitelist(env) {
    const adminId = env.ADMIN_USER_ID;

    return async (ctx, next) => {
        if (!adminId) return next();

        const fromId = ctx.from?.id;

        if (fromId === adminId) return next();

        return;
    };
}
