const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="w-full lg:w-1\/3">\s*<label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">\s*<span className="w-1\.5 h-1\.5 rounded-full bg-fuchsia-500"><\/span>\s*\{t\("مدة الفيديو"\)\}\s*<\/label>\s*<\/div>\s*<div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">/;

const replacement = `
                          <div className="w-full lg:w-1/3">
                            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"></span>
                              {t("مدة الفيديو")}
                            </label>
                          </div>
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
`;

// wait, the problem is we want to hide this whole <div className="py-6 flex flex-col lg:flex-row gap-6"> wrapper if scriptGenMode === 'custom' and activeTab === 'script'.
// let's do an easier regex.

const regex2 = /\{\(activeTab === 'script' \|\| activeTab === 'winnerAngle' \|\| activeTab === 'videoScenes'\) && \(\s*<>\s*<div className="py-6 flex flex-col lg:flex-row gap-6">/g;
const replacement2 = `{(activeTab === 'script' || activeTab === 'winnerAngle' || activeTab === 'videoScenes') && (
                      <>
                        {scriptGenMode !== 'custom' && (
                        <div className="py-6 flex flex-col lg:flex-row gap-6">`;

code = code.replace(regex2, replacement2);

const regex3 = /\{\/\* duration selection ends \*\/\}/g; // this doesn't exist.
const regex4 = /'bg-white dark:bg-zinc-800\/50 hover:bg-zinc-50 dark:hover:bg-zinc-800'\}\`\}\s*>\s*\{duration\.replace\('s', ' ثانية'\)\}\s*<\/button>\s*\)\)\}\s*<\/div>\s*<\/div>/g;

const replacement4 = `'bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800'}\`}
                              >
                                {duration.replace('s', ' ثانية')}
                              </button>
                            ))}
                          </div>
                        </div>
                        )}
`;

code = code.replace(regex4, replacement4);

fs.writeFileSync('src/App.tsx', code);
