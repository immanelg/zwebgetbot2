#!/usr/bin/env node
require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');

const spawn = require("child_process").spawn;
const fs = require("fs");

const crypto = require("crypto");

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {polling: true});

const fileExists = 
    async path => !!(await fs.promises.stat(path).catch(e => false));

// bot.onText(/\/(start|help)/, async (msg, match) => {
//     const chatId = msg.chat.id;
//     const botMsg = await bot.sendMessage(chatId, 
//         "Send me a URL and I will use the single-file CLI to bundle the page into index.html for you.\
//         Source code: https://github.com/immanelg/zwebgetbot2");
// });

bot.onText(/(https?:\/\/)?(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;

    const botMsg = await bot.sendMessage(chatId, "Hello...");

    const scheme = match[1] ?? "https://";
    const url = scheme+match[2];

    console.log("request", msg.from.id, url);

    await bot.editMessageText("⏳ Downloading "+url, {chat_id: chatId, message_id: botMsg.message_id});


    const fsFilename = crypto.randomBytes(16).toString("hex")+".html";

    const stderrChunks = [];
    const child = spawn("single-file", [url, fsFilename]);
    child.on("close", async exitCode => {
        console.log("single-file exited:", url, fsFilename, exitCode);
        //if (exitCode !== 0) {
        if (await fileExists(fsFilename))
            await bot.sendDocument(chatId, fsFilename, {}, { contentType: 'text/html', filename: "index.html" })
        else
            await bot.editMessageText(`❌ Error! single-file did not produce an output. stderr: ${""}`, {chat_id: chatId, message_id: botMsg.message_id});
        // fs.unlink(fsFilename, err => console.error(err));
    });
});

