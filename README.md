# Telegram Bot Guide

## Overview
This guide will walk you through setting up and running a Telegram bot that converts URLs to Markdown. The bot will only respond to authorized users.

## Prerequisites
- Node.js installed on your machine
- A Telegram bot token (obtained from [@BotFather](https://t.me/BotFather))
- Your Telegram user ID (you can get this by messaging [@userinfobot](https://t.me/userinfobot))

## Setup Instructions

### 1. Create a new directory for your bot
```bash
mkdir telegram_bot
cd telegram_bot
```

### 2. Initialize a new Node.js project
```bash
npm init -y
```

### 3. Install required dependencies
```bash
npm install telegraf axios dotenv
```

### 4. Create a `.env` file
Create a file named `.env` in your project directory and add the following content:
```env
BOT_TOKEN=your_bot_token
OWNER_ID=your_owner_id
```
Replace `your_bot_token` with your actual bot token and `your_owner_id` with your Telegram user ID.

### 5. Create the bot script
Create a file named `index.js` in your project directory and add the following content:
```javascript
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
```

### 6. Run the bot
```bash
node index.js
```

## Usage
- **/add [user_id]**: Add a user to the whitelist (only available to the owner)
- **/remove [user_id]**: Remove a user from the whitelist (only available to the owner)
- **Send a URL**: The bot will convert the URL to Markdown and send it back to the user

## Notes
- Ensure the URL conversion service is running on `http://localhost:3000`
- The bot will only respond to authorized users in the whitelist
- The owner can add or remove users from the whitelist using the `/add` and `/remove` commands