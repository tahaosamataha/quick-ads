const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(/if \(proxy === 'https:\/\/api\.allorigins\.win\/raw\?url=' \|\| proxy === 'https:\/\/api\.codetabs\.com\/v1\/proxy\?quest='\)/, 
`if (proxy === 'https://api.allorigins.win/raw?url=' || proxy === 'https://api.codetabs.com/v1/proxy?quest=' || proxy === '/api/proxy-media?url=')`);
            
fs.writeFileSync('src/App.tsx', appCode);

