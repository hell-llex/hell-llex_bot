const services = [
    {
        name: "notes",
        title: "Notes",
        status: "active",
        description: "сохраняет Telegram-сообщения, альбомы и медиа в Markdown",
        async handleTopicMessage(ctx, next) {
            return next();
        },
    },
    {
        name: "monitoring",
        title: "Monitoring",
        status: "planned",
        description: "заготовка под проверки сервисов, сайтов, контейнеров и серверов",
        async handleTopicMessage(ctx) {
            return ctx.reply("🩺 Monitoring topic пока подключен как сервис, логику мониторинга добавим следующим шагом.");
        },
    },
    {
        name: "alerts",
        title: "Alerts",
        status: "planned",
        description: "заготовка под уведомления и правила алертов",
        async handleTopicMessage(ctx) {
            return ctx.reply("🚨 Alerts topic пока подключен как сервис, правила алертов добавим следующим шагом.");
        },
    },
    {
        name: "admin",
        title: "Admin",
        status: "active",
        description: "topic для настройки бота, маршрутов и параметров сервисов",
        async handleTopicMessage(ctx) {
            return ctx.reply("🛠 Admin topic пока подключен как сервис. Используй /whereami, /services или /help.");
        },
    },
];

const servicesByName = new Map(services.map((service) => [service.name, service]));

export function getBuiltInServices() {
    return services;
}

export function getBuiltInServiceNames() {
    return services.map((service) => service.name);
}

export function getService(name) {
    return servicesByName.get(name) || null;
}
