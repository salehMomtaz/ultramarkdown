require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);

const whitelist = new Set([process.env.OWNER_ID]);

bot.command('add', (ctx) => {
    const userId = ctx.message.from.id;
    if (userId === parseInt(process.env.OWNER_ID)) {
        const newUserId = ctx.message.text.split(' ')[1];
        if (newUserId) {
            whitelist.add(newUserId);
            ctx.reply(`User ${newUserId} added to whitelist.`);
        } else {
            ctx.reply('Please provide a user ID to add.');
        }
    } else {
        ctx.reply('You are not authorized to use this command.');
    }
});

bot.command('remove', (ctx) => {
    const userId = ctx.message.from.id;
    if (userId === parseInt(process.env.OWNER_ID)) {
        const removeUserId = ctx.message.text.split(' ')[1];
        if (removeUserId) {
            if (whitelist.delete(removeUserId)) {
                ctx.reply(`User ${removeUserId} removed from whitelist.`);
            } else {
                ctx.reply(`User ${removeUserId} not found in whitelist.`);
            }
        } else {
            ctx.reply('Please provide a user ID to remove.');
        }
    } else {
        ctx.reply('You are not authorized to use this command.');
    }
});

bot.on('text', async (ctx) => {
    const userId = ctx.message.from.id;
    if (whitelist.has(userId.toString())) {
        const url = ctx.message.text;
        try {
            const response = await axios.get(`http://localhost:3000/?url=${encodeURIComponent(url)}`);
            ctx.reply(response.data);
        } catch (error) {
            ctx.reply('Sorry, could not fetch and convert that URL');
        }
    } else {
        ctx.reply('You are not authorized to use this bot.');
    }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));