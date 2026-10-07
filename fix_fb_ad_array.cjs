const fs = require('fs');
let code = fs.readFileSync('src/components/AutoSuite.tsx', 'utf8');

// Also update fb ad types initialization
code = code.replace(/setSelectedFbAdTypes\(Array\(5\)\.fill/g, 'setSelectedFbAdTypes(Array(10).fill');

fs.writeFileSync('src/components/AutoSuite.tsx', code);
