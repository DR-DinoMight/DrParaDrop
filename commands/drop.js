import {EmbedBuilder, ThreadAutoArchiveDuration} from 'discord.js';
import {getParachuteAnimation} from '../lib/parachute_animation.js';
import {gridHeight} from '../lib/config.js';

/**
 * Simulates a parachute drop game for a Discord user.
 * Generates a random target landing pad and landing point.
 * Animates the parachute drop in an embed message.
 * Calculates if landing was successful based on proximity to target.
 * Sends final result message to user.
 *
 * @param {Message} message - Discord message object
 * @param {string[]} args - Command arguments
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

/**
 *  Run a group parachute drop game for a Discord channel.
 *  Generates a random target landing pad.
 *  Adds reactions for other users to indicate they want to play.
 *  Thread should be locked after 90 seconds of inactivity on reactions,
 *  to prevent others from playing this one.
 *  Before locking the users with the best scores is crowend the winner.
 *
 * @param {Message} message - Discord message object
 * @param {string[]} args - Command arguments
 */
export const runGroupParachuteDrop = async (message, args) => {
    try {
        const landingPad = Math.floor(Math.random() * 100) + 1;
        const maxDifference = 99;

        await message.react('🪂');

        const filter = (reaction, user) => reaction.emoji.name === '🪂';
        const collector = message.createReactionCollector({ filter, idle: 9000 });
        let thread  = await message.startThread({
            name: `Parachute Drop`,
            autoArchiveDuration: ThreadAutoArchiveDuration.ONE_HOUR,
        });

        let winner = null;
        collector.on('collect', async (r, user) => {

            const landingPoint = Math.floor(Math.random() * 100) + 1;
            const percentage = (100 - (Math.abs(landingPoint - landingPad) / maxDifference) * 100).toFixed();
            const success = parseFloat(percentage) >= 10;
            const embed = new EmbedBuilder()
                .setTitle('Parachute Drop')
                .setDescription(`The parachute drop is starting for ${user.username}!`);
            const [finalShot] = getParachuteAnimation(9, success, landingPad, landingPoint, 0);
                // Final result in the embed
                embed.setFields(
                    { name: 'Target', value: `${landingPad}`, inline: true },
                    { name: 'Landed at', value: `${landingPoint}`, inline: true },
                    { name: '% Near', value: `${percentage}%`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Results', value: `\`\`\`${finalShot}\`\`\`` }
                )
            embed.setColor(success ? '00FF00' : 'FF0000');
            const sendMessage = await thread.send({ content: `Parachute drop results ${landingPad}...`, embeds: [embed] });

            if (success && (!winner || winner.percentage < percentage)) {
                winner = {
                    user,
                    percentage,
                    embed
                };
                thread.edit({
                    name: `Parachute Drop - ${winner.user.username} is in the lead with ${winner.percentage}%!`,
                })
            }
        });

        collector.on('end', async (t) => {
            await thread.bulkDelete(thread.messageCount);
            console.log({winner});
            thread.send({ content: "The parachute drop has ended! The winner is... " + winner.user.username + " with " + winner.percentage + "%!", embeds: [winner.embed] });
        })

    } catch (e) {
        console.error(e);
        await message.reply(`Something went wrong! Please try again later.`);
    }
}
