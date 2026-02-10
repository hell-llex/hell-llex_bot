# Telegraf - краткая справка

Эта подборка — компактная шпаргалка по самым используемым методам `telegraf`.
Примеры рассчитаны на Telegraf v4.

## Методы бота

- `new Telegraf(token, options)` — создание экземпляра бота.
- `bot.launch(options)` — запуск long polling (или webhook, если настроен).
- `bot.stop(reason)` — остановка получения апдейтов.
- `bot.use(middleware)` — подключение middleware.
- `bot.catch(handler)` — глобальный обработчик ошибок.
- `bot.start(handler)` — обработка `/start`.
- `bot.help(handler)` — обработка `/help`.
- `bot.command(name, handler)` — обработка команды `/name`.
- `bot.hears(textOrRegex, handler)` — обработка по совпадению текста.
- `bot.on(updateType, handler)` — обработка по типу апдейта.
- `bot.action(dataOrRegex, handler)` — обработка нажатий inline-кнопок.
- `bot.inlineQuery(handler)` — обработка inline-запросов.
- `bot.telegram` — прямой доступ к Telegram API.
- `bot.telegram.setWebhook(url, extra)` — включить webhook.
- `bot.startWebhook(path, tlsOptions, port)` — запуск webhook listener.

## Методы ctx (context)

- `ctx.reply(text, extra)` — отправить ответ в текущий чат.
- `ctx.replyWithHTML(text, extra)` — отправить с HTML-разметкой.
- `ctx.replyWithMarkdownV2(text, extra)` — отправить с MarkdownV2-разметкой.
- `ctx.sendChatAction(action)` — показать "typing"/"uploading".
- `ctx.answerCbQuery(text?, extra?)` — ответить на callback-кнопку.
- `ctx.answerInlineQuery(results, extra?)` — ответить на inline-запрос.
- `ctx.editMessageText(text, extra)` — изменить текст сообщения (сообщение бота).
- `ctx.editMessageReplyMarkup(markup)` — изменить клавиатуру сообщения.
- `ctx.deleteMessage(messageId?)` — удалить сообщение (текущее по умолчанию).
- `ctx.forwardMessage(chatId, extra?)` — переслать текущее сообщение.
- `ctx.copyMessage(chatId, extra?)` — скопировать текущее сообщение.
- `ctx.pinChatMessage(messageId, extra?)` — закрепить сообщение.
- `ctx.unpinChatMessage(messageId?)` — открепить сообщение.
- `ctx.leaveChat()` — выйти из чата.
- `ctx.setChatMenuButton(button)` — установить кнопку меню для чата.
- `ctx.getChat()` — получить данные чата.
- `ctx.getChatMember(userId)` — получить данные участника.

## Данные ctx

- `ctx.message` — текущее сообщение.
- `ctx.update` — сырой payload апдейта.
- `ctx.chat` — текущий чат.
- `ctx.from` — отправитель.
- `ctx.state` — общее хранилище для middleware во время обработки.

## bot.telegram (Telegram API)

- `sendMessage(chatId, text, extra)` — отправить сообщение.
- `sendPhoto(chatId, photo, extra)` — отправить фото.
- `sendDocument(chatId, document, extra)` — отправить файл.
- `sendVideo(chatId, video, extra)` — отправить видео.
- `sendAudio(chatId, audio, extra)` — отправить аудио.
- `sendSticker(chatId, sticker, extra)` — отправить стикер.
- `sendLocation(chatId, lat, lon, extra)` — отправить локацию.
- `sendPoll(chatId, question, options, extra)` — отправить опрос.
- `editMessageText(chatId, messageId, inlineMessageId, text, extra)` — изменить текст.
- `editMessageReplyMarkup(...)` — изменить клавиатуру.
- `deleteMessage(chatId, messageId)` — удалить сообщение.
- `forwardMessage(chatId, fromChatId, messageId, extra)` — переслать сообщение.
- `copyMessage(chatId, fromChatId, messageId, extra)` — скопировать сообщение.
- `answerCallbackQuery(cbQueryId, extra)` — ответить на callback.
- `answerInlineQuery(inlineQueryId, results, extra)` — ответить на inline query.
- `getChat(chatId)` — получить данные чата.
- `getChatMember(chatId, userId)` — получить данные участника.
- `setWebhook(url, extra)` — задать webhook URL.
- `deleteWebhook(extra)` — удалить webhook.
- `getMe()` — информация о боте.
- `getUpdates(extra)` — получить апдейты вручную (редко нужно).
