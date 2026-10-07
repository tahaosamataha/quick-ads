const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /if \(urls && urls\.length > 0\) \{\s*const audio = new Audio\(urls\[0\]\);\s*audio\.play\(\);\s*\}/;
const replacement = `if (urls && urls.mp3) {
        const audio = new Audio(urls.mp3);
        audio.play();
      } else if (urls && urls.wav) {
        const audio = new Audio(urls.wav);
        audio.play();
      }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
