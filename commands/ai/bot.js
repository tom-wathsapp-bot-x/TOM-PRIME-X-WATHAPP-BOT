const axios = require("axios");

module.exports = {
  name: "bot",
  aliases: ["tom", "ai", "sim"],
  category: "ai",
  description: "AI chat with auto-reply support",
  usage: ".bot <message> or reply to bot",

  async execute(sock, msg, args, extra) {
    const { from, sender, reply, isQuoted } = extra;
    let usermsg = args.join(" ");

    // If there is no message but it's a reply to the bot
    if (!usermsg && isQuoted) {
      usermsg = msg.message.extendedTextMessage?.text || "";
    }

    if (!usermsg) {
      const greetings = [
        "আহ শুনা আমার টম বস এর পক্ষ থেকে তোমার অলিতে গলিতে উম্মাহ 😇😘",
        "কি গো সোনা আমাকে ডাকছ কেনো? আমাকে না ডেকে আমার বস টম কে ডাকো।",
        "বার বার আমাকে ডাকস কেন? টম বসের পারমিশন নিছস? 😡",
        "আসসালামু আলাইকুম, আমি টম বসের অ্যাসিস্ট্যান্ট। বলেন আপনার জন্য কি করতে পারি?",
        "আমাকে এতো না ডেকে বস টম কে একটা জিএফ খুঁজে দে 🙄",
        "এই যে শুনছেন, আমি টম বসের হয়ে আপনার জন্যই অনলাইনে আছি 😉",
        "ডাক দিলেন তো আসলাম, এখন টম বসকে ভাড়া দিবেন নাকি? 😏",
        "আমি বট হইলেও কিন্তু টম বসের মতো ফিলিংস আছে 😌",
        "আপনাকে না দেখলে নাকি টম বসের RAM হ্যাং হয়ে যায় 😜"
      ];

      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      return await sock.sendMessage(from, {
        text: `@${sender.split('@')[0]}, ${randomGreeting}`,
        mentions: [sender]
      }, { quoted: msg });
    }

    try {
      // Main AI API
      const apis = await axios.get("https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json");
      const base = apis.data.api;

      const response = await axios.get(`${base}/sim?type=ask&ask=${encodeURIComponent(usermsg)}`);
      const replyText = response.data.data?.msg || "🤖 I'm thinking...";

      await reply(replyText);

    } catch (err) {
      // Fallback API if main one fails
      try {
        const altRes = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(usermsg)}&lc=bn`);
        await reply(altRes.data.success || "🤖 System busy!");
      } catch (e) {
        await reply("❌ Connection lost with Tom's brain!");
      }
    }
  }
};
