const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const MALE_VOICES = ['Puck', 'Charon', 'Fenrir', 'Orus', 'Lapetus', 'Enceladus', 'Achird', 'Alnilam', 'Algenib', 'Algieba', 'Umbriel', 'Zubenelgenubi', 'Sadachbia'];
const FEMALE_VOICES = ['Laomedeia', 'Achernar', 'Zephyr', 'Kore', 'Leda', 'Callirrhoe', 'Despina', 'Gacrux'];

const voiceOptions = `
                                    <optgroup label="خيارات عامة">
                                      <option value="auto">{t("تلقائي")}</option>
                                      <option value="clone">{t("استنساخ (ملف)")}</option>
                                      <option value="male">{t("ذكر (عشوائي)")}</option>
                                      <option value="female">{t("أنثى (عشوائي)")}</option>
                                    </optgroup>
                                    <optgroup label="أصوات رجالية">
                                      ${MALE_VOICES.map(v => `<option value="male_${v}">${v}</option>`).join('\n                                      ')}
                                    </optgroup>
                                    <optgroup label="أصوات نسائية">
                                      ${FEMALE_VOICES.map(v => `<option value="female_${v}">${v}</option>`).join('\n                                      ')}
                                    </optgroup>
`;

code = code.replace(
  /<option value="auto">\{t\("تلقائي"\)\}<\/option>[\s\S]*?<option value="clone">\{t\("استنساخ \(ملف\)"\)\}<\/option>/g,
  voiceOptions.trim()
);

// We need to add the third button next to auto/manual
const modeButtons = `
                            <button
                              onClick={() => setScriptGenMode('manual')}
                              className={\`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all \${scriptGenMode === 'manual' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}\`}
                            >
                              {t("اختيار الزوايا")}
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
                            </button>
`;

code = code.replace(
  /<button\s+onClick=\{\(\) => setScriptGenMode\('manual'\)\}[\s\S]*?\{t\("أتمتة الزوايا بالذكاء الاصطناعي"\)\}\s*<\/button>/,
  modeButtons.trim()
);

fs.writeFileSync('src/App.tsx', code);
