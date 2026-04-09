/**
 * Facebook Downloader - Download Facebook videos
 */

const { facebookdl } = require('@bochilteam/scraper-facebook');
const axios = require('axios');
const config = require('../../config');

// Store processed message IDs to prevent duplicates
const processedMessages = new Set();

module.exports = {
  name: 'facebook',
  aliases: ['fb', 'fbdl', 'facebookdl'],
  category: 'media',
  description: 'Download Facebook videos',
  usage: '.facebook <Facebook URL>',
  
  async execute(sock, msg, args, extra) {
    try {
      // Check if message has already been processed
      if (processedMessages.has(msg.key.id)) {
        return;
      }
      
      // Add message ID to processed set
      processedMessages.add(msg.key.id);
      
      // Clean up old message IDs after 5 minutes
      setTimeout(() => {
        processedMessages.delete(msg.key.id);
      }, 5 * 60 * 1000);
      
      const text = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text ||
                   args.join(' ');
      
      if (!text) {
        return await extra.reply('Please provide a Facebook link for the video.');
      }
      
      // Extract URL from command
      const url = text.split(' ').slice(1).join(' ').trim();
      
      if (!url) {
        return await extra.reply('Please provide a Facebook link for the video.');
      }
      
      // Check for various Facebook URL formats
      const facebookPatterns = [
        /https?:\/\/(?:www\.|m\.)?facebook\.com\//,
        /https?:\/\/(?:www\.|m\.)?fb\.com\//,
        /https?:\/\/fb\.watch\//,
        /https?:\/\/(?:www\.)?facebook\.com\/watch/,
        /https?:\/\/(?:www\.)?facebook\.com\/.*\/videos\//
      ];
      
      const isValidUrl = facebookPatterns.some(pattern => pattern.test(url));
      
      if (!isValidUrl) {
        return await extra.reply('That is not a valid Facebook link. Please provide a valid Facebook video link.');
      }
      
      await sock.sendMessage(extra.from, {
        react: { text: '🔄', key: msg.key }
      });
      
      try {
        // Use @bochilteam/scraper-facebook
        const data = await facebookdl(url);
        
        if (!data || !data.video || !Array.isArray(data.video) || data.video.length === 0) {
          throw new Error('No video data found');
        }
        
        // Get the highest quality video (first in array is usually highest)
        const videoOption = data.video[0];
        if (!videoOption || !videoOption.download) {
          throw new Error('No video download function found');
        }
        
        // Call the download function to get the video URL or buffer
        const videoData = await videoOption.download();
        
        let videoUrl = null;
        let videoBuffer = null;
        
        // Check if it's a URL or buffer
        if (typeof videoData === 'string') {
          videoUrl = videoData;
        } else if (Buffer.isBuffer(videoData)) {
          videoBuffer = videoData;
        } else if (videoData && videoData.url) {
          videoUrl = videoData.url;
        } else if (videoData && videoData.data) {
          videoBuffer = Buffer.from(videoData.data);
        } else {
          throw new Error('Invalid video data format');
        }
        
        // Build caption with video info
        const botName = config.botName.toUpperCase();
        let caption = `*DOWNLOADED BY ${botName}*`;
        
        const parts = [];
        
        if (data.duration) {
          parts.push(`⏱️ Duration: ${data.duration}`);
        }
        
        if (videoOption.quality) {
          parts.push(`📹 Quality: ${videoOption.quality}`);
        }
        
        if (parts.length > 0) {
          caption += '\n\n' + parts.join('\n');
        }
        
        // Send video
        if (videoBuffer) {
          // Send as buffer
          await sock.sendMessage(extra.from, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: caption
          }, { quoted: msg });
        } else if (videoUrl) {
          // Try URL first
          try {
            await sock.sendMessage(extra.from, {
              video: { url: videoUrl },
              mimetype: 'video/mp4',
              caption: caption
            }, { quoted: msg });
          } catch (urlError) {
            // If URL fails, download and send as buffer
            console.error('URL send failed, trying buffer method:', urlError.message);
            try {
              const videoResponse = await axios.get(videoUrl, {
                responseType: 'arraybuffer',
                timeout: 60000,
                maxContentLength: 100 * 1024 * 1024,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                  'Referer': 'https://www.facebook.com/'
                }
              });
              
              const buffer = Buffer.from(videoResponse.data);
              await sock.sendMessage(extra.from, {
                video: buffer,
                mimetype: 'video/mp4',
                caption: caption
              }, { quoted: msg });
            } catch (bufferError) {
              console.error('Buffer method also failed:', bufferError.message);
              throw new Error('Failed to send video');
            }
          }
        } else {
          throw new Error('No video URL or buffer found');
        }
        
      } catch (error) {
        console.error('Error in Facebook download:', error);
        await extra.reply(`❌ Failed to download Facebook video.\n\nError: ${error.message}\n\nPlease try again with a different link.`);
      }
    } catch (error) {
      console.error('Error in Facebook command:', error);
      await extra.reply('An error occurred while processing the request. Please try again later.');
    }
  }
};

