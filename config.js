/**
 * Global Configuration for TOM-PRIME-X WhatsApp Bot
 */

module.exports = {
    // Bot Owner Configuration
    ownerNumber: ['8801892625209'], // Your number without + or spaces
    ownerName: ['Professor Tom'], 
    
    // Bot Configuration
    botName: 'TOM-PRIME-X',
    prefix: '.',
    sessionName: 'session',
    sessionID: process.env.SESSION_ID || '', 
    newsletterJid: '120363161513685998@newsletter', 
    updateZipUrl: 'https://github.com/tom-wathsapp-bot-x/TOM-PRIME-X-WATHAPP-BOT/archive/refs/heads/main.zip', 
    
    // Sticker Configuration
    packname: 'TOM-PRIME-X-MD',
    author: 'Professor Tom',
    
    // Bot Behavior
    selfMode: false, 
    autoRead: false,
    autoTyping: true, 
    autoBio: true, 
    autoSticker: false,
    autoReact: true, 
    autoReactMode: 'bot', 
    autoDownload: false,
    
    // Group Settings Defaults
    defaultGroupSettings: {
      antilink: true, 
      antilinkAction: 'kick', 
      antitag: false,
      antitagAction: 'delete',
      antiall: false, 
      antiviewonce: true, 
      antibot: true, 
      anticall: true, 
      antigroupmention: false, 
      antigroupmentionAction: 'delete', 
      welcome: true, 
      welcomeMessage: '╭╼━≪•𝚃𝙾𝙼-𝙿𝚁𝙸𝙼𝙴-𝚇•≫━╾╮\n┃𝚆𝙴𝙻𝙲𝙾𝙼𝙴: @user 👋\n┃Member count: #memberCount\n┃𝚃𝙸𝙼𝙴: time⏰\n╰━━━━━━━━━━━━━━━╯\n\n*@user* Welcome to *@group*! 🎉\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ TOM-PRIME-X*',
      goodbye: true,
      goodbyeMessage: 'Goodbye @user 👋 We will never miss you!',
      antiSpam: true,
      antidelete: true, 
      nsfw: false,
      detect: true,
      chatbot: false,
      autosticker: false 
    },
    
    // API Keys
    apiKeys: {
      openai: '',
      deepai: '',
      remove_bg: ''
    },
    
    // Message Configuration
    messages: {
      wait: '⏳ Processing... Please wait!',
      success: '✅ Task Completed!',
      error: '❌ System Error! Check Logs.',
      ownerOnly: '👑 This command is only for Professor Tom!',
      adminOnly: '🛡️ Admin access required!',
      groupOnly: '👥 Use this command in groups!',
      privateOnly: '💬 Use this command in DM!',
      botAdminNeeded: '🤖 Bot needs admin privileges!',
      invalidCommand: '❓ Unknown command! Type .menu'
    },
    
    // Timezone
    timezone: 'Asia/Dhaka', 
    
    // Limits
    maxWarnings: 3,
    
    // Social Links
    social: {
      github: 'https://github.com/tom-wathsapp-bot-x',
      youtube: 'http://youtube.com/@saycotom'
    }
};
