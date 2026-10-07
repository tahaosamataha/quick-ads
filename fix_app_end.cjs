const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

if (!appCode.includes('</AppContext.Provider>')) {
  appCode = appCode.replace(/    <\/div>\n  \);\n\}/, "    </div>\n    </AppContext.Provider>\n  );\n}");
  fs.writeFileSync('src/App.tsx', appCode);
}
