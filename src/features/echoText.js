// src/features/echoText.js
// Обработчик обычного текста.
// Сейчас просто отвечает эхо + логирует.
// Позже здесь может быть логика "создать заметку" или мы сделаем отдельную команду /note.

export function registerEchoText(bot) {
    bot.on("text", async (ctx) => {
        const text = ctx.message.text;

        console.log("text:", ctx.message);

        await ctx.reply(`
            Принял: ${text}
        `);
    });
}

export function registerEchoMessage(bot) {
    bot.on("message", async (ctx) => {
        const msg = ctx.message;

        // Текст может быть либо msg.text (обычное текстовое),
        // либо msg.caption (подпись к фото/видео/документу).
        const text = msg.text ?? msg.caption;

        console.log("msg:", msg);

        const isForward =
            Boolean(msg.forward_from) ||
            Boolean(msg.forward_from_chat) ||
            Boolean(msg.forward_sender_name) ||
            Boolean(msg.forward_date) ||
            Boolean(msg.forward_origin); // на новых типах пересылок


        await ctx.reply(`
            Принял: ${text} 
            Это ${isForward ? 'пересланное' : 'обычное'} сообщение!
        `.trim());
    });
}

