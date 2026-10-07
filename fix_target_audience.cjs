const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const \[dialect, setDialect\] = useState\('saudi'\);/;
const replaceStr = `const [dialect, setDialect] = useState('saudi');\n  const [targetAudience, setTargetAudience] = useState('');`;

code = code.replace(regex, replaceStr);
fs.writeFileSync('src/App.tsx', code);
