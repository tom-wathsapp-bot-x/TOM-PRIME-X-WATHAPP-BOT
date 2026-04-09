/**
 * Ping Command - Check bot response time
 */

module.exports = {
    name: 'ping',
    aliases: ['p'],
    category: 'general',
    description: 'Check bot response time',
    usage: '.ping',
    
    async execute(sock, msg, args, extra) {
      try {
        const start = Date.now();
        const sent = await extra.reply('🏓 Pinging...');
        const end = Date.now();
        
        const responseTime = end - start;
        
        await sock.sendMessage(extra.from, {
          text: `🏓 *Pong!*\n⚡ Response Time: ${responseTime}ms`,
          edit: sent.key
        });
        
      } catch (error) {
        await extra.reply(`❌ Error: ${error.message}`);
      }
    }
  };
  