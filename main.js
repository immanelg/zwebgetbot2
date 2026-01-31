#!/usr/bin/env node
require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');

const spawn = require("child_process").spawn;
const fs = require("fs");

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {polling: true});

bot.onText(/(https?:\/\/)?(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;

    const botMsg = await bot.sendMessage(chatId, "Hello...");

    const scheme = match[1] ?? "https://";
    const url = scheme+match[2];

    console.log("request", msg.from.id, url);

    await bot.editMessageText("⏳ Downloading "+url, {chat_id: chatId, message_id: botMsg.message_id});

    const fsFilename = chatId.toString()+".html";

    const stderrChunks = [];
    const child = spawn("single-file", [url, fsFilename]);
    child.on("close", async exitCode => {
        console.log("single-file exited:", url, fsFilename, exitCode);
        if (exitCode !== 0)
            await bot.editMessageText(`❌ Error! Exit code ${exitCode}, stderr: ${""}`, {chat_id: chatId, message_id: botMsg.message_id});
        else
            await bot.sendDocument(chatId, fsFilename, {}, { contentType: 'text/html', filename: "index.html" });
        fs.unlink(fsFilename, err => console.error(err));
    });
});

