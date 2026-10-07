const fs = require('fs');
let code = fs.readFileSync('src/components/ProductBrainPage.tsx', 'utf8');

code = code.replace(/'free',/, "'flash',");
fs.writeFileSync('src/components/ProductBrainPage.tsx', code);
