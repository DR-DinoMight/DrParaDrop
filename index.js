require('dotenv').config()

const {Client, GatewayIntentBits, Events, EmbedBuilder} = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gifencoder');
const fs = require('fs');

const client = new Client({ intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds] });

const PREFIX = '!';

// client.on()
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Connected to the following guilds:');

    client.guilds.cache.forEach((guild) => {
      console.log(`- ${guild.name} (${guild.id})`);
      console.log('Channels:');
      guild.channels.cache.forEach((channel) => {
        console.log(`  - ${channel.name} (${channel.id})`);
      });
    });
  });


client.on('messageCreate', async (message) => {
    console.log(`Received message: ${message.content}`);
    if (message.author.bot) return; // Ignore messages from bots

    if (message.content.startsWith(PREFIX)) {
        const landingPoint = Math.floor(Math.random() * 100) + 1;
        const landingPad = Math.floor(Math.random() * 100) + 1;
        const user = message.author;
        //is success if lands within .5 of landing pad
        const success = Math.abs(landingPad - landingPoint) <= 5;

        console.log(`User: ${user.tag}, Landing Point: ${landingPoint}, Success: ${success}`);

        // Get the channel where the command was invoked
        const channel = message.channel;

        // Create an initial embed
        const embed = new EmbedBuilder()
            .setTitle('Parachute Drop')
            .setDescription(`The parachute drop is starting for ${user.username}!`)

        // Send the initial embed
        const embedMessage = await channel.send({ content: `Parachute is descending trying to land on ${landingPad}...`,embeds: [embed] });
        embed.setThumbnail(`${message.author.displayAvatarURL({ format: 'png', dynamic: true })}`);
        embed.setColor('FFBF00'); // Update color if needed
        // Update the embed for 60 seconds
        for (let i = 0; i < 10; i++) {

            // Update the embed description based on the simulated animation
            embed.setFields(
                { name: 'Iteration', value: `${i + 1}`, inline: true },
                { name: 'Total', value: `10`, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Results', value: `\`\`\`${getParachuteAnimation(i, success,landingPad, landingPoint)}\`\`\`` },)

            // Update the embed message
            await embedMessage.edit({ embeds: [embed] });

            // Simulate a delay for each frame (adjust as needed)
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Final result in the embed
        embed.setFields(
            { name: 'Target', value: `${landingPad}`, inline: true },
            { name: 'Landed at', value: `${landingPoint}`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Results', value: `\`\`\`${getParachuteAnimation(9, success,landingPad, landingPoint)}\`\`\`` },
        )
        embed.setColor(success ? '00FF00' : 'FF0000'); // Update color if needed

        // Update the final result in the embed message
        embedMessage.delete();
        await channel.send({
            content: success ? `<@${user.id}> successfully landed! 🎉` : `<@${user.id}> missed the landing point and crashed! 😢 `,
            embeds: [embed]
        });
    }
});


// Function to generate ASCII art grid animation
let lastPosition = 0;
function getParachuteAnimation(iteration, success, landingPad, landingPoint) {
    const gridWidth = 40;
    const gridHeight = 10;
    const parachuteSymbol = '🪂';
    const targetSymbol = '🌆';
    const crashSymbol = '💥';
    const successSymbol = '🦖';
    const translatedLandingPad = Math.floor((landingPad / 100) * gridWidth);
    const translatedLandingPoint = Math.floor((landingPoint / 100) * gridWidth);
    console.log ({
        iteration,
        success,
        landingPad,
        landingPoint,
        translatedLandingPad,
        translatedLandingPoint
    })
    let grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(' '));
    grid[gridHeight - 1][translatedLandingPad] = targetSymbol; // Place the target symbol in the last row

    // Place the parachute symbol in a random column in the current iteration row
    const randomColumn = Math.floor(Math.random() * gridWidth);
    if (iteration === gridHeight - 1) {
      // Ensure the landing point is visible in the last row
      // If success, show the success symbol; otherwise, show the crash symbol
      grid[iteration][translatedLandingPoint] = success ? successSymbol : crashSymbol;
    }
    else if (iteration === gridHeight - 2) {
        grid[iteration][lastPosition] = parachuteSymbol
    }
    else {
        grid[iteration][randomColumn] = parachuteSymbol;
    }
    lastPosition = randomColumn;
    return grid.map((row) => row.join('')).join('\n');
  }


client.login(process.env.DISCORD_TOKEN);
