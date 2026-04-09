/**
 * TTS - Text to Speech Command
 */

const APIs = require('../../utils/api');

module.exports = {
  name: 'tts',
  aliases: ['speak', 'say'],
  category: 'general',
  description: 'Convert text to speech using TTS-Nova',
  usage: '.tts <text>',
  
  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      const text = args.join(' ');

      if (!text) {
        return extra.reply('Please provide text to convert to speech.\nExample: .tts hi how are you');
      }

      const audioUrl = await APIs.textToSpeech(text);

      // Download audio as buffer
      const axios = require('axios');
      const audioResponse = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      const audioBuffer = Buffer.from(audioResponse.data);

      await sock.sendMessage(chatId, {
        audio: audioBuffer,
        mimetype: 'audio/mp3',
        ptt: true // Play as voice message
      }, { quoted: msg });

    } catch (error) {
      console.error('TTS command error:', error);
      await extra.reply(`❌ Failed to generate speech: ${error.message}`);
    }
  }
};


