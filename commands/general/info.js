const os = require('os');
const config = require('../../config');

module.exports = {
  name: 'info',
  aliases: ['about', 'admininfo', 'serverinfo'],
  category: 'utility',
  description: 'Show admin and server information',
  usage: '.info',

  async execute(sock, msg, args, extra) {
    try {
      const uptimeSeconds = process.uptime();
      const uptime = new Date(uptimeSeconds * 1000).toISOString().substr(11, 8);

      const infoMessage = `--------------------------------------------
➥ 𝐇𝐞𝐲 𝐌𝐫/𝐦𝐢𝐬𝐬 
╭────《  𝐌𝐘 𝐒𝐄𝐋𝐅 》────⊷
│ ╭────────✧❁✧────────◆
│ │ 🌸 𝐍𝐀𝐌𝐄 :- 𝐓𝐎𝐌 𝐏𝐑𝐈𝐌𝐄-𝐗
│ │ 🏡 𝐅𝐑𝐎𝐌 :- 𝐃𝐇𝐀𝐊𝐀 
│ │ 📘 𝐂𝐋𝐀SS𝐒 :- 𝐒𝐒𝐂 𝟐𝟎𝟐𝟔
│ │ 💖 𝐑𝐋𝐒 :- 𝐒𝐈𝐍𝐆𝐋𝐄 𝐔𝐋𝐓𝐀 𝐏𝐑𝐎 𝐌𝐀𝐗
│ │ 🎯 𝐇𝐎𝐁𝐁𝐘 :- 𝐑𝐈𝐃𝐄 & 𝐂𝐎𝐃𝐈𝐍𝐆
│ │ ☎️ 𝐍𝐔𝐌𝐁𝐄𝐑 :- 8801892625209
│ │ ..𝐘𝐎𝐔 𝐂𝐀𝐍 𝐒𝐄𝐄 𝐌𝐘 𝐒𝐓𝐀𝐓𝐔𝐒..
│ ╰────────✧❁✧────────◆
╰══════════════════⊷
--------------------------------------------

🖥️ *Server Info:*
• Platform       : ${os.platform()}
• CPU            : ${os.cpus()[0].model}
• Node.js Version: ${process.version}
• Uptime         : ${uptime}
• Total Memory   : ${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB
• Free Memory    : ${(os.freemem() / (1024 ** 3)).toFixed(2)} GB`;

      await sock.sendMessage(extra.from, {
        image: { url: "https://i.postimg.cc/pVF8rw2m/IMG-20260329-WA0128.jpg" }, 
        caption: infoMessage,
        mentions: [extra.sender]
      }, { quoted: msg });

    } catch (error) {
      console.error(error);
      await extra.reply('❌ An error occurred while fetching info.');
    }
  },
};
