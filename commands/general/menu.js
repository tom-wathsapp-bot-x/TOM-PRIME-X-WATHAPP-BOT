/**
 * Menu Command - Display all available commands
 * English Version with Direct Image Link
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');
const axios = require('axios'); 

module.exports = {
  name: 'menu',
  aliases: ['help', 'commands'],
  category: 'general',
  description: 'Show all available commands',
  usage: '.menu',
  
  async execute(sock, msg, args, extra) {
    try {
      const commands = loadCommands();
      const categories = {};
      
      // Group commands by category
      commands.forEach((cmd, name) => {
        if (cmd.name === name) { 
          if (!categories[cmd.category]) {
            categories[cmd.category] = [];
          }
          categories[cmd.category].push(cmd);
        }
      });
      
      const ownerNames = Array.isArray(config.ownerName) ? config.ownerName : [config.ownerName];
      const displayOwner = ownerNames[0] || config.ownerName || 'Bot Owner';
      
      let menuText = `╭━━『 *${config.botName}* 』━━╮\n\n`;
      menuText += `👋 Hello @${extra.sender.split('@')[0]}!\n\n`;
      menuText += `⚡ Prefix: ${config.prefix}\n`;
      menuText += `📦 Total Commands: ${commands.size}\n`;
      menuText += `👑 Owner: ${displayOwner}\n\n`;
      
      // Category List
      const categoryList = [
        { id: 'general', name: '🧭 GENERAL COMMANDS' },
        { id: 'ai', name: '🤖 AI COMMANDS' },
        { id: 'group', name: '🔵 GROUP COMMANDS' },
        { id: 'admin', name: '🛡️ ADMIN COMMANDS' },
        { id: 'owner', name: '👑 OWNER COMMANDS' },
        { id: 'media', name: '🎞️ MEDIA COMMANDS' },
        { id: 'fun', name: '🎭 FUN COMMANDS' },
        { id: 'utility', name: '🔧 UTILITY COMMANDS' },
        { id: 'anime', name: '👾 ANIME COMMANDS' },
        { id: 'textmaker', name: '🖋️ TEXTMAKER COMMANDS' }
      ];

      categoryList.forEach(cat => {
        if (categories[cat.id]) {
          menuText += `┏━━━━━━━━━━━━━━━━━\n`;
          menuText += `┃ ${cat.name}\n`;
          menuText += `┗━━━━━━━━━━━━━━━━━\n`;
          categories[cat.id].forEach(cmd => {
            menuText += `│ ➜ ${config.prefix}${cmd.name}\n`;
          });
          menuText += `\n`;
        }
      });
      
      menuText += `╰━━━━━━━━━━━━━━━━━\n\n`;
      menuText += `💡 Type ${config.prefix}help <command> for more info\n`;
      menuText += `🌟 Powered by Tom-Bot\n`;
      
      // Direct image link provided by user
      const imageUrl = 'https://i.postimg.cc/Rh1CMktt/1000086497.png';
      
      try {
        // Downloading image from link
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);
        
        await sock.sendMessage(extra.from, {
          image: imageBuffer,
          caption: menuText,
          mentions: [extra.sender],
          contextInfo: {
            forwardingScore: 0,
            isForwarded: false
          }
        }, { quoted: msg });
      } catch (e) {
        // Fallback to text menu if image fails
        await sock.sendMessage(extra.from, {
          text: menuText,
          mentions: [extra.sender]
        }, { quoted: msg });
      }
      
    } catch (error) {
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
