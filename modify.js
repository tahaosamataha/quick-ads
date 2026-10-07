const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/red-50\b/g, 'fuchsia-50');
content = content.replace(/red-100\b/g, 'fuchsia-100');
content = content.replace(/red-200\b/g, 'fuchsia-200');
content = content.replace(/red-300\b/g, 'fuchsia-300');
content = content.replace(/red-400\b/g, 'fuchsia-400');
content = content.replace(/red-500\b/g, 'fuchsia-500');
content = content.replace(/red-600\b/g, 'fuchsia-600');
content = content.replace(/red-700\b/g, 'fuchsia-700');
content = content.replace(/red-800\b/g, 'fuchsia-800');
content = content.replace(/red-900\b/g, 'fuchsia-900');
content = content.replace(/red-950\b/g, 'fuchsia-950');

fs.writeFileSync('src/App.tsx', content);
