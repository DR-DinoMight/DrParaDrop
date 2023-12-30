import {EmbedBuilder} from 'discord.js';
import {getParachuteAnimation} from '../lib/parachute_animation.js';
import {gridHeight} from '../lib/config.js';

/**
 * Simulates a parachute drop game for a Discord user.
 * Generates a random target landing pad and landing point.
 * Animates the parachute drop in an embed message.
 * Calculates if landing was successful based on proximity to target.
 * Sends final result message to user.
*/
export const runParachuteDrop = async (message, args) => {
    try {
        const landingPoint = Math.floor(Math.random() * 100) + 1;
        const landingPad = Math.floor(Math.random() * 100) + 1;
        const maxDifference = 99;
        const percentage = (100 - (Math.abs(landingPoint - landingPad) / maxDifference) * 100).toFixed(2);

        const user = message.author;

        const success = parseFloat(percentage) >= 90;

        // Create an initial embed
        const embed = new EmbedBuilder()
            .setTitle('Parachute Drop')
            .setDescription(`The parachute drop is starting for ${user.username}!`);

        // Send the initial embed
        const embedMessage = await message.reply({ content: `Parachute is descending trying to land on ${landingPad}...`, embeds: [embed] });
        embed.setThumbnail(`${message.author.displayAvatarURL({ format: 'png', dynamic: true })}`);
        embed.setColor('FFBF00'); // Update color if needed

        // Function to generate ASCII art grid animation
        let lastPosition = 0;
        for (let i = 0; i < gridHeight; i++) {
            const [gameState, position] = getParachuteAnimation(i, success, landingPad, landingPoint, lastPosition);
            // Update the embed description based on the simulated animation
            embed.setFields(
                { name: 'Iteration', value: ` ${i + 1}`, inline: true },
                { name: 'Total', value: ` ${gridHeight}`, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Game', value: `\`\`\`${gameState}\`\`\`` }
            )

            // Update the embed message
            await embedMessage.edit({ embeds: [embed] });

            //Calculate the Timeout needed to last 10seconds in total
            const timeout = Math.floor(5 / gridHeight) * 1000;

            await new Promise(resolve => setTimeout(resolve, timeout));
            lastPosition = position;
        }
        const [finalShot] = getParachuteAnimation(9, success, landingPad, landingPoint, lastPosition);
        // Final result in the embed
        embed.setFields(
            { name: 'Target', value: `${landingPad}`, inline: true },
            { name: 'Landed at', value: `${landingPoint}`, inline: true },
            { name: '% Near', value: `${percentage}%`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Results', value: `\`\`\`${finalShot}\`\`\`` }
        )
        embed.setColor(success ? '00FF00' : 'FF0000'); // Update color if needed

        // Update the final result in the embed message
        embedMessage.delete();
        await message.reply({
            content: success ? `<@${user.id}> successfully landed! 🎉` : `<@${user.id}> missed the landing point and crashed! 😢 `,
            embeds: [embed]
        });
    } catch (error) {
        console.error(error);
        await message.reply(`Something went wrong! Please try again later.`);
    }

}
