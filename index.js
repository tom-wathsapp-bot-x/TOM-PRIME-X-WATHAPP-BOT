/**
 * WhatsApp MD Bot - Main Entry Point
 * Customized by Professor Tom
 */
process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_CACHE_DIR = process.env.PUPPETEER_CACHE_DIR || '/tmp/puppeteer_cache_disabled';

const { initializeTempSystem } = require('./utils/tempManager');
const { startCleanup } = require('./utils/cleanup');
initializeTempSystem();
startCleanup();
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const forbiddenPatternsConsole = [
  'closing session', 'closing open session', 'sessionentry', 'prekey bundle', 'pendingprekey',
  '_chains', 'registrationid', 'currentratchet', 'chainkey', 'ratchet', 'signal protocol',
  'ephemeralkeypair', 'indexinfo', 'basekey'
];

console.log = (...args) => {
  const message = args.map(a => typeof a === 'string' ? a : typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ').toLowerCase();
  if (!forbiddenPatternsConsole.some(pattern => message.includes(pattern))) {
    originalConsoleLog.apply(console, args);
  }
};

console.error = (...args) => {
  const message = args.map(a => typeof a === 'string' ? a : typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ').toLowerCase();
  if (!forbiddenPatternsConsole.some(pattern => message.includes(pattern))) {
    originalConsoleError.apply(console, args);
  }
};

const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const handler = require('./handler');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const os = require('os');

function cleanupPuppeteerCache() {
  try {
    const home = os.homedir();
    const cacheDir = path.join(home, '.cache', 'puppeteer');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }
  } catch (err) {}
}

const store = {
  messages: new Map(),
  maxPerChat: 20,
  bind: (ev) => {
    ev.on('messages.upsert', ({ messages }) => {
      for (const msg of messages) {
        if (!msg.key?.id) continue;
        const jid = msg.key.remoteJid;
        if (!store.messages.has(jid)) store.messages.set(jid, new Map());
        const chatMsgs = store.messages.get(jid);
        chatMsgs.set(msg.key.id, msg);
        if (chatMsgs.size > store.maxPerChat) {
          const oldestKey = chatMsgs.keys().next().value;
          chatMsgs.delete(oldestKey);
        }
      }
    });
  },
  loadMessage: async (jid, id) => store.messages.get(jid)?.get(id) || null
};

const processedMessages = new Set();
setInterval(() => processedMessages.clear(), 5 * 60 * 1000);

const createSuppressedLogger = (level = 'silent') => {
  let logger = pino({ level });
  const originalInfo = logger.info.bind(logger);
  logger.info = (...args) => {
    const msg = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ').toLowerCase();
    if (!forbiddenPatternsConsole.some(pattern => msg.includes(pattern))) originalInfo(...args);
  };
  logger.debug = () => {};
  logger.trace = () => {};
  return logger;
};

async function startBot() {
  const sessionFolder = `./${config.sessionName}`;
  if (config.sessionID && config.sessionID.startsWith('KnightBot!')) {
    try {
      const b64data = config.sessionID.split('!')[1].replace('...', '');
      const decompressedData = zlib.gunzipSync(Buffer.from(b64data, 'base64'));
      if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder, { recursive: true });
      fs.writeFileSync(path.join(sessionFolder, 'creds.json'), decompressedData, 'utf8');
    } catch (e) {
      console.error('📡 Session Error:', e.message);
    }
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    logger: createSuppressedLogger('silent'),
    printQRInTerminal: false,
    browser: ['Chrome', 'Windows', '10.0'],
    auth: state,
    syncFullHistory: false,
    downloadHistory: false,
    getMessage: async () => undefined
  });

  store.bind(sock.ev);
  let lastActivity = Date.now();

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) qrcode.generate(qr, { small: true });

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) setTimeout(() => startBot(), 3000);
    } else if (connection === 'open') {
      console.log('\n✅ TOM-PRIME-X connected successfully!');
      
      // 🚀 Your custom connection message after hosting
      const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const successMsg = `╭━━『 *TOM-PRIME-X CONNECTED* 』━━╮\n\n` +
                         `🤖 *Bot Status:* Online & Active\n` +
                         `👑 *Owner:* Professor Tom\n` +
                         `📡 *Server:* Cloud Hosted\n` +
                         `⚡ *Speed:* 100% Optimized\n\n` +
                         `⚠️ *Do not share your session file with anyone!*\n\n` +
                         `🔗 *YouTube:* http://youtube.com/@saycotom\n` +
                         `🐙 *GitHub:* https://github.com/tom-wathsapp-bot-x\n\n` +
                         `╰━━━━━━━━━━━━━━━━━━━━╯\n` +
                         `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ Professor Tom*`;

      await sock.sendMessage(myNumber, { text: successMsg });

      if (config.autoBio) await sock.updateProfileStatus(`${config.botName} | Active 24/7`);
      handler.initializeAntiCall(sock);
    }
  });

  sock.ev.on('creds.update', saveCreds);
  const isSystemJid = (jid) => jid?.includes('@broadcast') || jid?.includes('status.broadcast') || jid?.includes('@newsletter');

  sock.ev.on('messages.upsert', ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message || !msg.key?.id || isSystemJid(msg.key.remoteJid)) continue;
      if (processedMessages.has(msg.key.id)) continue;
      processedMessages.add(msg.key.id);

      handler.handleMessage(sock, msg).catch(err => console.error('Error:', err.message));
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    await handler.handleGroupUpdate(sock, update);
  });

  return sock;
}

cleanupPuppeteerCache();
startBot().catch(err => console.error('Start Error:', err));

process.on('uncaughtException', (err) => {
  if (err.code === 'ENOSPC') {
    require('./utils/cleanup').cleanupOldFiles();
  }
});

module.exports = { store };
