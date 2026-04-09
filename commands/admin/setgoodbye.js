/**
 * Set Goodbye - Customize goodbye message
 */

const db = require('../../database');

module.exports = {
  name: 'setgoodbye',
  aliases: ['goodbyetext'],
  category: 'admin',
  desc: 'Set custom goodbye message',
  usage: 'setgoodbye <message> (use @user for member mention)',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  execute: async (sock, msg, args) => {
    try {
      const groupId = msg.key.remoteJid;
      
      if (!args.length) {
        const groupSettings = db.getGroupSettings(groupId);
        return await sock.sendMessage(groupId, {
          text: `📝 *Current Goodbye Message*\n\n${groupSettings.goodbyeMessage}\n\n*Usage:* .setgoodbye <message>\n\n*Tip:* Use @user to mention the member who left`
        }, { quoted: msg });
      }
      
      const goodbyeMessage = args.join(' ');
      
      if (goodbyeMessage.length > 500) {
        return await sock.sendMessage(groupId, {
          text: '❌ Goodbye message is too long! Maximum 500 characters.'
        }, { quoted: msg });
      }
      
      db.updateGroupSettings(groupId, { goodbyeMessage });
      
      await sock.sendMessage(groupId, {
        text: `✅ Goodbye message updated!\n\n*Preview:*\n${goodbyeMessage.replace('@user', '@' + msg.key.participant.split('@')[0])}`,
        mentions: [msg.key.participant]
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Set Goodbye Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Error: ${error.message}`
      }, { quoted: msg });
    }
  }
};
