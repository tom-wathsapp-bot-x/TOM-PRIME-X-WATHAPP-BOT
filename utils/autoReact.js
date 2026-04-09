// utils/autoReact.js
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config.js');

function load() {
    try {
        // Clear require cache to get fresh config
        delete require.cache[require.resolve('../config.js')];
        const config = require('../config.js');
        
        return {
            enabled: config.autoReact || false,
            mode: config.autoReactMode || 'bot'
        };
    } catch {
        return {
            enabled: false,
            mode: 'bot'
        };
    }
}

function save(data) {
    try {
        const configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
        
        let updatedContent = configContent;
        
        // Update autoReact value
        updatedContent = updatedContent.replace(
            /autoReact:\s*(true|false)/,
            `autoReact: ${data.enabled}`
        );
        
        // Update or add autoReactMode
        if (configContent.includes('autoReactMode:')) {
            updatedContent = updatedContent.replace(
                /autoReactMode:\s*['"]\w+['"]/,
                `autoReactMode: '${data.mode}'`
            );
        } else {
            // Add autoReactMode after autoReact line
            updatedContent = updatedContent.replace(
                /(autoReact:\s*(?:true|false),?)/,
                `$1\n    autoReactMode: '${data.mode}',`
            );
        }
        
        fs.writeFileSync(CONFIG_PATH, updatedContent, 'utf8');
        
        // Clear cache so next require gets updated values
        delete require.cache[require.resolve('../config.js')];
    } catch (err) {
        console.error('[autoReact] save error:', err);
    }
}

module.exports = { load, save };
