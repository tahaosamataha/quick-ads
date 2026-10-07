const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /disabled=\{isGeneratingScript \|\| !description\}/,
  "disabled={isGeneratingScript || (scriptGenMode !== 'custom' && !description) || (scriptGenMode === 'custom' && !customScriptText.trim())}"
);

// We need to also hide the duration selector for custom script mode
code = code.replace(
  /\{t\("مدة الفيديو"\)\}<\/label>\s*<div className="flex bg-zinc-100/,
  "{scriptGenMode !== 'custom' && (<>\n                            <label className=\"block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4\">{t(\"مدة الفيديو\")}</label>\n                            <div className=\"flex bg-zinc-100"
);

code = code.replace(
  /\{\/\* duration selection ends \*\/\}\s*<\/div>\s*<\/div>\s*<div>\s*<label className="block text-sm font-semibold text-zinc-900/,
  "</div>\n                          </>)}\n                        </div>\n                        <div>\n                          <label className=\"block text-sm font-semibold text-zinc-900"
);

fs.writeFileSync('src/App.tsx', code);
