const fs = require('fs');
const path = require('path');

const srcPath = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain', '1e23e9fa-7114-4ea0-af3c-cfb64875a5d8', 'app_logo_1777223255704.png');

fs.copyFileSync(srcPath, path.join(__dirname, 'assets', 'images', 'icon.png'));
fs.copyFileSync(srcPath, path.join(__dirname, 'assets', 'images', 'adaptive-icon.png'));
fs.copyFileSync(srcPath, path.join(__dirname, 'assets', 'images', 'favicon.png'));

console.log("Successfully copied logos!");
