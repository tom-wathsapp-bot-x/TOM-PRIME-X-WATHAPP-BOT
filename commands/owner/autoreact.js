/**
 * Auto-React Command - Configure automatic reactions
 */

const { load, save } = require('../../utils/autoReact');

module.exports = {
  name: 'autoreact',
  aliases: ['ar'],
  category: 'owner',
  description: 'Configure automatic reactions to messages',
  usage: '.autoreact <on/off/set bot/set all>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      if (!args[0]) {
        return extra.reply('📋 *Auto-React Options:*\n\n• on - Enable auto-react\n• off - Disable auto-react\n• set bot - React only to bot commands\n• set all - React to all messages');
      }

      const db = load();
      const opt = args.join(' ').toLowerCase();

      if (opt === 'on') {
        db.enabled = true;
        save(db);
        return extra.reply('✅ Auto-react enabled.');
      }

      if (opt === 'off') {
        db.enabled = false;
        save(db);
        return extra.reply('❌ Auto-react disabled.');
      }

      if (opt === 'set bot') {
        db.mode = 'bot';
        save(db);
        return extra.reply('🤖 Auto-react mode: Bot commands only (⏳ reaction)');
      }

      if (opt === 'set all') {
        db.mode = 'all';
        save(db);
        return extra.reply('🌟 Auto-react mode: All messages (random emojis)');
      }

      extra.reply('❌ Invalid option. Use: on | off | set bot | set all');
    } catch (err) {
      console.error('[autoreact cmd] error:', err);
      extra.reply('❌ Error configuring auto-react.');
    }
  }
};
