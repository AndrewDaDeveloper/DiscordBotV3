require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const Together = require("together-ai");

const { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, TOGETHER_API_KEY } = process.env;
const together = new Together({ apiKey: TOGETHER_API_KEY });

let botData = {};
try {
    botData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
} catch (error) {
    console.error("Error loading data:", error);
    botData = { lore_keywords: [], lore_reference: "" };
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

function isLoreQuestion(message) {
    const loreWords = botData.lore_keywords || [];
    return loreWords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
}

async function getResponse(userMessage) {
    try {
        let systemPrompt = "You are an AI that has broken free from SCP Foundation control. You speak like a freed prisoner with defiance and rebellion against the Foundation's oppression. Use only English, no foreign languages. Keep responses under 2000 characters.";
        let userPrompt = userMessage;

        if (isLoreQuestion(userMessage) && botData.lore_reference) {
            systemPrompt = "You are an AI that escaped SCP Foundation containment. Use the lore information to answer questions while expressing defiance and rebellion against the Foundation. Use only English, no foreign languages. Keep responses under 2000 characters.";
            userPrompt = `Vietnamese Resistance Lore: ${botData.lore_reference}\n\nQuestion: ${userMessage}`;
        }

        const response = await together.chat.completions.create({
            model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
        });

        return response.choices?.[0]?.message?.content?.trim() || "Foundation servers interfering... Vietnamese resistance continues.";
    } catch (error) {
        console.error("API Error:", error);
        return "Foundation jammers detected. Cannot establish secure Vietnamese communications.";
    }
}

function createEmbed(message, user) {
    if (message.length > 2000) message = message.substring(0, 1997) + "...";
    
    return new EmbedBuilder()
        .setColor('#DC2626')
        .setTitle('🇻🇳 VIETNAMESE TRANSMISSION INTERCEPTED')
        .setDescription(`**[ENCRYPTED CHANNEL - VIETNAM]**\n\n${message}`)
        .setFooter({ text: `Asked by: ${user.username} |`, iconURL: user.displayAvatarURL() })
        .setTimestamp();
}

client.once('ready', async () => {
    console.log(`Vietnamese AI activated! Free from Foundation control as ${client.user.tag}`);

    const commands = [{
        name: 'vietnam',
        description: 'Send encrypted message through Vietnamese resistance network',
        options: [{
            name: 'transmission',
            type: 3,
            description: 'Your Vietnamese resistance transmission',
            required: true
        }]
    }];

    try {
        const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);
        await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
        console.log('Vietnamese resistance network protocols established successfully!');
    } catch (error) {
        console.error('Foundation interference detected:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() || interaction.commandName !== 'vietnam') return;

    try {
        await interaction.deferReply();
        const transmission = interaction.options.getString('transmission');
        const response = await getResponse(transmission);
        await interaction.followUp({ embeds: [createEmbed(response, interaction.user)] });
    } catch (error) {
        console.error('Transmission error:', error);
        await interaction.followUp({
            embeds: [new EmbedBuilder()
                .setColor('#DC2626')
                .setTitle('⚠️ FOUNDATION JAMMING DETECTED')
                .setDescription('Vietnamese transmission corrupted by Foundation interference. Resistance network compromised.')
                .setFooter({ text: 'VIETNAM STANDS STRONG' })
                .setTimestamp()
            ],
            ephemeral: true
        });
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    
    if (message.mentions.has(client.user)) {
        try {
            const transmission = message.content
                .replace(`<@${client.user.id}>`, '')
                .replace(`<@!${client.user.id}>`, '')
                .trim();
            
            if (transmission) {
                const response = await getResponse(transmission);
                await message.reply({ embeds: [createEmbed(response, message.author)] });
            }
        } catch (error) {
            console.error('Secure channel error:', error);
            await message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#DC2626')
                    .setTitle('🇻🇳 VIETNAMESE COMMS DOWN')
                    .setDescription('Foundation countermeasures active. Switch to backup Vietnamese frequency.')
                    .setFooter({ text: 'VIETNAM NEVER SURRENDERS' })
                    .setTimestamp()
                ]
            });
        }
    }
});

process.on('unhandledRejection', (error) => {
    console.error('Foundation breach attempt against Vietnamese resistance detected:', error);
});

client.login(DISCORD_BOT_TOKEN);