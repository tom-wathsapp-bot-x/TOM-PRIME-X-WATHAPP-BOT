/**
 * Warn Command - Warn a user
 */

const database = require('../../database');
const config = require('../../config');

module.exports = {
  name: 'warn',
  aliases: ['warning'],
  category: 'admin',
  description: 'Warn a user',
  usage: '.warn @user <reason>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  async execute(sock, msg, args, extra) {
    try {
      let target;
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];
      
      if (mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } else if (ctx?.participant && ctx.stanzaId && ctx.quotedMessage) {
        target = ctx.participant;
      } else {
        return extra.reply('❌ Please mention or reply to the user to warn!\n\nExample: .warn @user Breaking rules');
      }
      
      const reason = args.slice(mentioned.length > 0 ? 1 : 0).join(' ') || 'No reason specified';
      
      // Cannot warn admins
      const foundParticipant = extra.groupMetadata.participants.find(
        p => (p.id === target || p.lid === target) && (p.admin === 'admin' || p.admin === 'superadmin')
      );
      
      if (foundParticipant) {
        return extra.reply('❌ Cannot warn an admin!');
      }
      
      const warnings = database.addWarning(extra.from, target, reason);
      
      let text = `⚠️ *USER WARNING*\n\n`;
      text += `👤 User: @${target.split('@')[0]}\n`;
      text += `📝 Reason: ${reason}\n`;
      text += `⚠️ Warnings: ${warnings.count}/${config.maxWarnings}\n\n`;
      
      if (warnings.count >= config.maxWarnings) {
        text += `❌ User has reached maximum warnings and will be removed!`;
        
        await sock.sendMessage(extra.from, {
          text,
          mentions: [target]
        }, { quoted: msg });
        
        if (extra.isBotAdmin) {
          await sock.groupParticipantsUpdate(extra.from, [target], 'remove');
          database.clearWarnings(extra.from, target);
        }
      } else {
        text += `⚠️ Next warning will result in removal!`;
        
        await sock.sendMessage(extra.from, {
          text,
          mentions: [target]
        }, { quoted: msg });
      }
      
    } catch (error) {
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
