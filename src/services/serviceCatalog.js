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
        name: "memory",
        title: "Memory",
        status: "active",
        description: "сохраняет знания: короткие записи в индекс, большие записи и медиа отдельными Markdown-файлами",
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
        status: "active",
        description: "принимает уведомления от внутренних модулей и отправляет их в отдельный Telegram topic",
        async handleTopicMessage(ctx) {
            return ctx.reply("🚨 Alerts topic подключен. Для теста используй /alert test из admin topic.");
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
