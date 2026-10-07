const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(/const proxies = \[\s*'', \/\/ Direct fetch first\s*'https:\/\/corsproxy\.io\/\?',\s*'https:\/\/api\.allorigins\.win\/raw\?url=',\s*'https:\/\/api\.codetabs\.com\/v1\/proxy\?quest=',\s*'https:\/\/cors-proxy\.fringe\.zone\/',\s*'https:\/\/thingproxy\.freeboard\.io\/fetch\/'\s*\];/, 
`const proxies = [
              '/api/proxy-media?url=',
              '', // Direct fetch
              'https://corsproxy.io/?',
              'https://api.allorigins.win/raw?url=',
              'https://api.codetabs.com/v1/proxy?quest='
            ];`);
            
fs.writeFileSync('src/App.tsx', appCode);

