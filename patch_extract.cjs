const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(/const proxies = \[\s*'!', \/\/ Direct fetch first\s*'https:\/\/corsproxy\.io\/\?',\s*'https:\/\/api\.allorigins\.win\/raw\?url=',\s*'https:\/\/api\.codetabs\.com\/v1\/proxy\?quest=',\s*'https:\/\/cors-proxy\.fringe\.zone\/',\s*'https:\/\/thingproxy\.freeboard\.io\/fetch\/'\s*\];/g, 
`const proxies = [
              '/api/proxy-media?url=',
              '', // Direct fetch
              'https://corsproxy.io/?',
              'https://api.allorigins.win/raw?url=',
              'https://api.codetabs.com/v1/proxy?quest='
            ];`);
            
fs.writeFileSync('src/App.tsx', appCode);

let aiCode = fs.readFileSync('src/services/ai.ts', 'utf8');
aiCode = aiCode.replace(/const proxies = \[\s*\`https:\/\/api\.allorigins\.win\/get\?url=\$\{encodeURIComponent\(url\)\}\`,\s*\`https:\/\/api\.codetabs\.com\/v1\/proxy\?quest=\$\{encodeURIComponent\(url\)\}\`,\s*\`https:\/\/corsproxy\.io\/\?\$\{encodeURIComponent\(url\)\}\`\s*\];/g,
`const proxies = [
        \`/api/proxy-media?url=\${encodeURIComponent(url)}\`,
        \`https://api.allorigins.win/get?url=\${encodeURIComponent(url)}\`,
        \`https://api.codetabs.com/v1/proxy?quest=\${encodeURIComponent(url)}\`,
        \`https://corsproxy.io/?\${encodeURIComponent(url)}\`
      ];`);
fs.writeFileSync('src/services/ai.ts', aiCode);
