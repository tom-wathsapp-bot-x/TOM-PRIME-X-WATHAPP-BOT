/**
 * Compliment - Send a random compliment
 */

module.exports = {
    name: 'compliment',
    aliases: ['praise', 'compliment'],
    category: 'fun',
    desc: 'Get a random compliment',
    usage: 'compliment [@user]',
    execute: async (sock, msg, args) => {
      try {
        const compliments = [
          "You're an awesome friend! 💙",
          "You light up the room! ✨",
          "You're someone's reason to smile! 😊",
          "You're even better than a unicorn! 🦄",
          "You're a gift to those around you! 🎁",
          "You're a smart cookie! 🍪",
          "You're awesome! 🌟",
          "You have the best laugh! 😄",
          "You're gorgeous! 💖",
          "You're more helpful than you realize! 🤝",
          "You have a great sense of humor! 😂",
          "You're really something special! ⭐",
          "You're an incredible friend! 🫂",
          "Your perspective is refreshing! 🌈",
          "You're making a difference! 🌍",
          "You're stronger than you think! 💪",
          "Your smile is contagious! 😁",
          "You're one of a kind! 💎",
          "You bring out the best in people! 👏",
          "You're inspiring! 🌟"
        ];
        
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
        
        if (mentioned.length > 0) {
          await sock.sendMessage(msg.key.remoteJid, {
            text: `${randomCompliment}`,
            mentions: mentioned
          }, { quoted: msg });
        } else {
          await sock.sendMessage(msg.key.remoteJid, {
            text: `${randomCompliment}`
          }, { quoted: msg });
        }
        
      } catch (error) {
        console.error('Compliment Error:', error);
        await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ Error: ${error.message}`
        }, { quoted: msg });
      }
    }
  };
  