require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');

const spawn = require("child_process").spawn;

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {polling: true});

bot.onText(/(https?:\/\/)?(.*)/, (msg, match) => {
    const scheme = match[1] ?? "https://";
    const url = scheme+match[2];

    const chatId = msg.chat.id;

    const filename = chatId.toString()+".html";

    const child = spawn("single-file", [url, filename]);
    child.on("close", exitCode => {
        console.log(exitCode);
        bot.sendDocument(chatId, filename, { contentType: 'text/html' });
    });
});

// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
// 
//     bot.sendMessage(chatId, 'Received your message');
// });
