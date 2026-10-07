const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /{!autoScriptAngles \? \(/g,
  "{scriptGenMode === 'manual' ? ("
);

code = code.replace(
  /\) : \(\s*<div className="bg-fuchsia-50/g,
  ") : scriptGenMode === 'auto' ? (\n                          <div className=\"bg-fuchsia-50"
);

// Add custom mode UI after the auto mode UI div
const customModeUI = `                          </div>
                        ) : (
                          <div className="mt-4 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800">
                            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t("النص المخصص")}</label>
                            <textarea
                              value={customScriptText}
                              onChange={(e) => setCustomScriptText(e.target.value)}
                              placeholder={t("اكتب الإسكريبت هنا لتوليد التعليق الصوتي...")}
                              className="w-full h-32 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-fuchsia-500 outline-none"
                            />
                            <div className="mt-4">
                              <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t("الصوت")}</label>
                              <select
                                value={customScriptVoice}
                                onChange={(e) => setCustomScriptVoice(e.target.value)}
                                className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 outline-none transition-colors"
                              >
                                    <optgroup label="خيارات عامة">
                                      <option value="auto">{t("تلقائي")}</option>
                                      <option value="clone">{t("استنساخ (ملف)")}</option>
                                      <option value="male">{t("ذكر (عشوائي)")}</option>
                                      <option value="female">{t("أنثى (عشوائي)")}</option>
                                    </optgroup>
                                    <optgroup label="أصوات رجالية">
                                      <option value="male_Puck">Puck</option>
                                      <option value="male_Charon">Charon</option>
                                      <option value="male_Fenrir">Fenrir</option>
                                      <option value="male_Orus">Orus</option>
                                      <option value="male_Lapetus">Lapetus</option>
                                      <option value="male_Enceladus">Enceladus</option>
                                      <option value="male_Achird">Achird</option>
                                      <option value="male_Alnilam">Alnilam</option>
                                      <option value="male_Algenib">Algenib</option>
                                      <option value="male_Algieba">Algieba</option>
                                      <option value="male_Umbriel">Umbriel</option>
                                      <option value="male_Zubenelgenubi">Zubenelgenubi</option>
                                      <option value="male_Sadachbia">Sadachbia</option>
                                    </optgroup>
                                    <optgroup label="أصوات نسائية">
                                      <option value="female_Laomedeia">Laomedeia</option>
                                      <option value="female_Achernar">Achernar</option>
                                      <option value="female_Zephyr">Zephyr</option>
                                      <option value="female_Kore">Kore</option>
                                      <option value="female_Leda">Leda</option>
                                      <option value="female_Callirrhoe">Callirrhoe</option>
                                      <option value="female_Despina">Despina</option>
                                      <option value="female_Gacrux">Gacrux</option>
                                    </optgroup>
                              </select>
                            </div>
`;

code = code.replace(
  /تحقيق أعلى تحويل\."\)\}<\/p>\s*<\/div>/,
  `تحقيق أعلى تحويل.")}</p>\n${customModeUI}`
);

fs.writeFileSync('src/App.tsx', code);
