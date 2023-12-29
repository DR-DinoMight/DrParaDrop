require('dotenv').config()

const {Client, GatewayIntentBits, Events, EmbedBuilder} = require('discord.js');


const dropCooldowns = new Map();
const gridWidth = 50;
const gridHeight = 10;
const parachuteSymbol = '🪂';
const targetSymbol = '🌆';
const crashSymbol = '💥';
const successSymbol = '🦖';

const client = new Client({ intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds] });

const PREFIX = '!';

// client.on()
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

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

const runParachuteDrop = async (message, args) => {
    const landingPoint = Math.floor(Math.random() * 100) + 1;
    const landingPad = Math.floor(Math.random() * 100) + 1;
    const maxDifference = 99;
    const percentage = (100 - (Math.abs(landingPoint - landingPad) / maxDifference) * 100).toFixed(2);

    const user = message.author;

    const success = parseFloat(percentage) >= 90;

    // Get the channel where the command was invoked
    const channel = message.channel;

    // Create an initial embed
    const embed = new EmbedBuilder()
        .setTitle('Parachute Drop')
        .setDescription(`The parachute drop is starting for ${user.username}!`);

    // Send the initial embed
    const embedMessage = await channel.send({ content: `Parachute is descending trying to land on ${landingPad}...`,embeds: [embed] });
    embed.setThumbnail(`${message.author.displayAvatarURL({ format: 'png', dynamic: true })}`);
    embed.setColor('FFBF00'); // Update color if needed

    for (let i = 0; i < gridHeight; i++) {

        // Update the embed description based on the simulated animation
        embed.setFields(
            { name: 'Iteration', value: ` ${i + 1}`, inline: true },
            { name: 'Total', value: ` ${gridHeight}`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Game', value: `\`\`\`${getParachuteAnimation(i, success,landingPad, landingPoint)}\`\`\`` }
        )

        // Update the embed message
        await embedMessage.edit({ embeds: [embed] });

        //Calculate the Timeout needed to last 10seconds in total
        const timeout = Math.floor(5 / gridHeight) * 1000;

        await new Promise(resolve => setTimeout(resolve, timeout));
    }

    // Final result in the embed
    embed.setFields(
        { name: 'Target', value: `${landingPad}`, inline: true },
        { name: 'Landed at', value: `${landingPoint}`, inline: true },
        { name: 'Diffrence', value: `${percentage}%`, inline: true },
        { name: '\u200B', value: '\u200B' },
        { name: 'Results', value: `\`\`\`${getParachuteAnimation(9, success,landingPad, landingPoint)}\`\`\`` }
    )
    embed.setColor(success ? '00FF00' : 'FF0000'); // Update color if needed

    // Update the final result in the embed message
    embedMessage.delete();
    await channel.send({
        content: success ? `<@${user.id}> successfully landed! 🎉` : `<@${user.id}> missed the landing point and crashed! 😢 `,
        embeds: [embed]
    });
}

// Function to generate ASCII art grid animation
let lastPosition = 0;
function getParachuteAnimation(iteration, success, landingPad, landingPoint) {

    const translatedLandingPad = Math.floor((landingPad / 100) * gridWidth);
    const translatedLandingPoint = Math.floor((landingPoint / 100) * gridWidth);

    let grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(' '));
    // Calculate the parachute position based on the iteration
    let parachutePosition;
    if (iteration === gridHeight - 1) {
        // Final iteration, ensure the parachute lands on the exact landing point
        parachutePosition = translatedLandingPoint;
    } else {
        // Smooth falling animation, limit movement to a maximum of 1 cell in any direction
        const previousPosition = lastPosition || translatedLandingPoint; // Use the previous position or the landing point
        const newPosition = Math.max(0, Math.min(gridWidth - 1, previousPosition + getRandomMovement()));
        parachutePosition = newPosition;
    }

    // Place the parachute symbol in the calculated position
    grid[iteration][parachutePosition] = parachuteSymbol;

    // Place the target symbol in the last row
    grid[gridHeight - 1][translatedLandingPad] = targetSymbol;

    // If it's the last iteration, ensure the landing point is visible
    if (iteration === gridHeight - 1) {
        grid[iteration][translatedLandingPoint] = success ? successSymbol : crashSymbol;
    }

    lastPosition = parachutePosition;

    return grid.map((row) => row.join('')).join('\n');
}

// Helper function to get a random movement (limited to -1, 0, or 1)
function getRandomMovement() {
    return Math.floor(Math.random() * 3) - 1;
}

client.login(process.env.DISCORD_TOKEN);
