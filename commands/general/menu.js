/**
 * Menu Command - Clean High Styled Version
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');
const axios = require('axios');

module.exports = {
  name: 'menu',
  aliases: ['help', 'commands'],
  category: 'general',
  description: 'Show styled command menu',
  usage: '.menu',
  
  async execute(sock, msg, args, extra) {
    try {
      const commands = loadCommands();
      const categories = {};
      
      commands.forEach((cmd, name) => {
        if (cmd.name === name) { 
          if (!categories[cmd.category]) {
            categories[cmd.category] = [];
          }
          categories[cmd.category].push(cmd);
        }
      });

      const date = new Date().toLocaleDateString('en-GB');
      const time = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // --- [ MENU HEADER ] ---
      let menuText = `✨ *COMMAND MENU* ✨\n`;
      menuText += `┠───────────────\n`;
      menuText += `┃ 💎 *Bot:* ${config.botName || 'TOM POWER BOT'}\n`;
      menuText += `┃ 👑 Owner: *TOM PRIME-X*\n`;
      menuText += `┃ 🌍 Prefix: *${config.prefix}*\n`;
      menuText += `┃ 🧩 Version: 1.1.5\n`;
      menuText += `┃ 🕒 Time: ${time}\n`;
      menuText += `┃ 📅 Date: ${date}\n`;
      menuText += `┃ 🌐 Timezone: Asia/Dhaka\n`;
      menuText += `┃ 📜 Total Commands: ${commands.size}\n`;
      menuText += `┠───────────────\n\n`;

      const categoryList = [
        { id: 'admin', name: '⚙️ System' },
        { id: 'ai', name: '🧠 AI & Chat' },
        { id: 'media', name: '🎞️ Media' },
        { id: 'group', name: '🔵 Group' },
        { id: 'general', name: '🧭 General' },
        { id: 'fun', name: '🎭 Fun' }
      ];

      categoryList.forEach(cat => {
        if (categories[cat.id]) {
          menuText += `│  ${cat.name}\n`;
          categories[cat.id].forEach((cmd, index) => {
            const isLast = index === categories[cat.id].length - 1;
            const branch = isLast ? '└──' : '├──';
            menuText += `│   ${branch} .${cmd.name}\n`;
          });
          menuText += `│\n`;
          menuText += `┕━━━━━━━━━━━━━━━━━━\n\n`;
        }
      });

      menuText += `🌟 Powered by 𝐓𝐎𝐌 𝐏𝐑𝐈𝐌𝐄 𝐗`;

      const imageUrl = 'https://i.postimg.cc/Rh1CMktt/1000086497.png';
      
      try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);
        
        await sock.sendMessage(extra.from, {
          image: imageBuffer,
          caption: menuText,
          mentions: [extra.sender]
        }, { quoted: msg });
      } catch (e) {
        await extra.reply(menuText);
      }
      
    } catch (error) {
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
