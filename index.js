/**
 * WhatsApp MD Bot - Main Entry Point
 * System: STYLISH UI + AUTO-PAIRING + ANTILINK FIXED
 * Author: Professor Tom (ToxRon)
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const config = require('./config');
const handler = require('./handler');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(`./${config.sessionName}`);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu("Chrome"), 
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    },
    syncFullHistory: false,
    markOnlineOnConnect: true,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000
  });

  // --- AUTO PAIRING LOGIC ---
  if (!sock.authState.creds.registered) {
    const phoneNumber = config.ownerNumber[0].replace(/[^0-9]/g, '');
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`\n\x1b[1m\x1b[36m🔄 Pairing Request for: ${phoneNumber}\x1b[0m`);
        console.log(`\x1b[42m\x1b[30mYour Pairing Code :\x1b[0m \x1b[1m${code}\x1b[0m\n`);
      } catch (err) { console.error('Pairing Error:', err); }
    }, 6000); 
  }

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) startBot();
    } else if (connection === 'open') {
      console.log(`\x1b[32m • 🤖 TOM PRIME X BOT Connected Successfully! ✅\x1b[0m`);
      const myJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      await sock.sendMessage(myJid, { text: `*🤖 TOM PRIME X BOT Online!*` });
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // --- [FIXED] MESSAGE HANDLER (FOR ANTILINK & COMMANDS) ---
  sock.ev.on('messages.upsert', async (chatUpdate) => {
    const { messages, type } = chatUpdate;
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;
      const from = msg.key.remoteJid;
      if (!from || from === 'status@broadcast') continue;

      try {
        // ১. সব কমান্ড হ্যান্ডেল করার জন্য
        await handler.handleMessage(sock, msg);

        // ২. অ্যান্টি-লিঙ্ক চেক (শুধু গ্রুপের জন্য)
        if (from.endsWith('@g.us')) {
          // Antilink এর জন্য Group Metadata মাস্ট লাগবে
          const groupMetadata = await sock.groupMetadata(from).catch(() => null);
          if (groupMetadata) {
            await handler.handleAntilink(sock, msg, groupMetadata);
          }
        }
      } catch (err) {
        console.log("Error in handler:", err.message);
      }
    }
  });

  // গ্রুপে কেউ জয়েন বা লিভ নিলে তার জন্য
  sock.ev.on('group-participants.update', async (update) => {
    await handler.handleGroupUpdate(sock, update);
  });

  return sock;
}

startBot().catch(err => console.log("Critical Error:", err));
