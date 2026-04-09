/**
 * Magic Studio AI Art Generation Command
 * Generate AI-powered art from text prompts
 */

const axios = require('axios');

const BASE = 'https://api.siputzx.my.id/api/ai/magicstudio';

module.exports = {
  name: 'imagine',
  aliases: ['magic', 'magicai', 'aiimage', 'generate'],
  category: 'ai',
  desc: 'Generate AI art from text prompt',
  usage: 'magicstudio <prompt>',
  execute: async (sock, msg, args, extra) => {
    try {
      const prompt = args.join(' ').trim();
      
      if (!prompt) {
        return await extra.reply(
          'Usage: .magicstudio <prompt>\n\nExample: .magicstudio a cyberpunk city'
        );
      }
      
      // Fetch image from API
      const url = `${BASE}?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': '*/*'
        },
        timeout: 120000 // 2 minutes timeout for AI generation
      });
      
      const imageBuffer = Buffer.from(response.data);
      
      // Verify buffer is valid
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('Empty response from API');
      }
      
      // Check file size (WhatsApp image limit is 5MB)
      const maxImageSize = 5 * 1024 * 1024; // 5MB
      if (imageBuffer.length > maxImageSize) {
        throw new Error(`Image too large: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB (max 5MB)`);
      }
      
      // Send the generated image
      await sock.sendMessage(extra.from, {
        image: imageBuffer
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Error in magicstudio command:', error);
      
      // Handle specific error cases
      if (error.response?.status === 429) {
        await extra.reply('❌ Rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 400) {
        await extra.reply('❌ Invalid prompt. Please try a different prompt.');
      } else if (error.response?.status === 500) {
        await extra.reply('❌ Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        await extra.reply('❌ Request timed out. The image generation is taking too long. Please try again.');
      } else {
        await extra.reply(`❌ Failed to generate image: ${error.message}`);
      }
    }
  }
};

