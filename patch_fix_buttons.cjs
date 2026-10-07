const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<button\s+onClick=\{\(\) => setAutoScriptAngles\(false\)\}[\s\S]*?\{t\("أتمتة الزوايا بالذكاء الاصطناعي"\)\}\s*<\/button>/;

const modeButtons = `                            <button
                              onClick={() => setScriptGenMode('manual')}
                              className={\`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all \${scriptGenMode === 'manual' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}\`}
                            >
                              {t("اختيار الزوايا يدوياً")}
                            </button>
                            <button
                              onClick={() => setScriptGenMode('auto')}
                              className={\`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 \${scriptGenMode === 'auto' ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}\`}
                            >
                              <Sparkles className="w-4 h-4" />
                              {t("أتمتة")}
                            </button>
                            <button
                              onClick={() => setScriptGenMode('custom')}
                              className={\`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all \${scriptGenMode === 'custom' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}\`}
                            >
                              ✍️ {t("كتابة مخصص")}
                            </button>`;

code = code.replace(regex, modeButtons);
fs.writeFileSync('src/App.tsx', code);
