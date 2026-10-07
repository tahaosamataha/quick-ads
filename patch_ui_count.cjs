const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">\{t\("عدد السكريبتات"\)\}<\/label>[\s\S]*?<\/div>\n                        <\/div>/;

const replacement = `
                          {scriptGenMode !== 'custom' && (
                            <>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t("عدد السكريبتات")}</label>
                              <div className="grid grid-cols-4 gap-2">
                                {[3, 5, 7, 10].map((count) => (
                                  <button
                                    key={count}
                                    onClick={() => handleScriptCountChange(count)}
                                    className={\`py-2 rounded-xl border-2 text-center transition-all font-medium \${scriptCount === count ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.15)]' : 'border-zinc-200 dark:border-zinc-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-700 text-zinc-600 dark:text-zinc-400'}\`}
                                  >
                                    {count}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>`;

code = code.replace(regex, replacement.trim());
fs.writeFileSync('src/App.tsx', code);
