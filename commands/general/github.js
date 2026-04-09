/**
 * GitHub Command - Show bot GitHub repository and stats
 */

const axios = require('axios');
const config = require('../../config');

module.exports = {
    name: 'github',
    aliases: ['repo', 'git', 'source', 'sc', 'script'],
    category: 'general',
    description: 'Show bot GitHub repository and statistics',
    usage: '.github',
    ownerOnly: false,

    async execute(sock, msg, args, extra) {
        try {
            const chatId = extra.from;
            
            // ✅ তোর নিজের গিটহাব রিপোজিটরি লিঙ্ক
            const repoUrl = 'https://github.com/tom-wathsapp-bot-x/TOM-PRIME-X-WATHAPP-BOT';
            const apiUrl = 'https://api.github.com/repos/tom-wathsapp-bot-x/TOM-PRIME-X-WATHAPP-BOT';
            
            // Send loading message
            const loadingMsg = await extra.reply('🔍 Fetching GitHub repository information...');
            
            try {
                // Fetch repository data from GitHub API
                const response = await axios.get(apiUrl, {
                    headers: {
                        'User-Agent': 'TOM-PRIME-X-WATHAPP-BOT'
                    }
                });
                
                const repo = response.data;
                
                // Format the response with proper styling
                let message = `╭━━『 *GitHub Repository* 』━━╮\n\n`;
                message += `🤖 *Bot Name:* TOM-PRIME-X\n`; // তোর বটের নাম
                message += `🔗 *Repository:* ${repo.name}\n`;
                message += `👨‍💻 *Owner:* Professor Tom\n`; // তোর নাম
                message += `📄 *Description:* ${repo.description || 'Pure Power. Your Bot, Your Rules.'}\n`;
                message += `🌐 *URL:* ${repo.html_url}\n\n`;
                
                message += `📊 *Repository Statistics*\n`;
                message += `⭐ *Stars:* ${repo.stargazers_count.toLocaleString()}\n`;
                message += `🍴 *Forks:* ${repo.forks_count.toLocaleString()}\n`;
                message += `👁️ *Watchers:* ${repo.watchers_count.toLocaleString()}\n`;
                message += `📦 *Size:* ${(repo.size / 1024).toFixed(2)} MB\n\n`;
                
                message += `🔗 *Quick Links*\n`;
                message += `⭐ Star: ${repo.html_url}/stargazers\n`;
                message += `🍴 Fork: ${repo.html_url}/fork\n`;
                message += `📥 Clone: git clone ${repo.clone_url}\n\n`;
                
                message += `╰━━━━━━━━━━━━━━━╯\n\n`;
                message += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ TOM-PRIME-X-MD*`;
                
                // Edit the loading message with the actual data
                await sock.sendMessage(chatId, {
                    text: message,
                    edit: loadingMsg.key
                });
                
            } catch (apiError) {
                // Fallback message if API fails
                console.error('GitHub API Error:', apiError.message);
                
                let fallbackMessage = `╭━━『 *GitHub Repository* 』━━╮\n\n`;
                fallbackMessage += `🤖 *Bot Name:* TOM-PRIME-X\n`;
                fallbackMessage += `🔗 *Repository:* TOM-PRIME-X-WATHAPP-BOT\n`;
                fallbackMessage += `👨‍💻 *Owner:* Professor Tom\n`;
                fallbackMessage += `🌐 *URL:* ${repoUrl}\n\n`;
                fallbackMessage += `⚠️ *Note:* Unable to fetch real-time statistics.\n`;
                fallbackMessage += `Please visit the repository directly for latest stats.\n\n`;
                fallbackMessage += `╰━━━━━━━━━━━━━━━╯\n\n`;
                fallbackMessage += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ TOM-PRIME-X-MD*`;
                
                await sock.sendMessage(chatId, {
                    text: fallbackMessage,
                    edit: loadingMsg.key
                });
            }
            
        } catch (error) {
            console.error('GitHub command error:', error);
            await extra.reply(`❌ Error: ${error.message}`);
        }
    }
};
