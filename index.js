import 'dotenv/config';

import { Client, GatewayIntentBits } from 'discord.js';
import { runParachuteDrop } from './commands/single_drop.js';


const dropCooldowns = new Map();

// Create a new Discord.js client
const client = new Client({ intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds]
});

// Set the bot's prefix
const PREFIX = '!';


/**
 * Event handler for the 'ready' event emitted by the Discord.js client.
 * Logs a message to the console indicating the bot has successfully
 * logged in and is ready to start receiving events.
 */
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

/**
 * Event handler for Discord.js 'messageCreate' event.
 * Checks for bot author, allowed channels, and !drop command.
 * Implements a per-user cooldown for the !drop command using a Map.
 * Calls runParachuteDrop() to handle the game logic if on cooldown.
*/
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore messages from bots

    // Check if the message is in the allowed channel
    const allowedChannels = ['background-hustle']; // Add your channel IDs here
    if (!allowedChannels.includes(message.channel.name)) return;

    const [command, ...args] = message.content.split(' ');

    if (command.toLowerCase() === PREFIX + 'drop') {
        const cooldownTime = dropCooldowns.get(message.author.id) ?? 0;
        const currentTime = Date.now();
        const remainingTime = cooldownTime - currentTime;

        if (remainingTime > 0) {

            // Send a message indicating the remaining cooldown time for !drop
            return message.reply(`Please wait ${Math.ceil(remainingTime / 1000)} seconds before playing again.`);
        }

        // Set the cooldown for !drop command to 60 seconds
        dropCooldowns.set(message.author.id, Date.now() + 60000);

        await runParachuteDrop(message, args);
    }
});

client.login(process.env.DISCORD_TOKEN);


