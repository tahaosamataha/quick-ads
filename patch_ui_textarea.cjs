const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<textarea\s*value=\{customScriptText\}[\s\S]*?<\/div>\s*<\/div>\s*\)\}/;

const replacement = `<textarea
                              value={customScriptText}
                              onChange={(e) => setCustomScriptText(e.target.value)}
                              placeholder={t("اكتب الإسكريبت هنا لتوليد التعليق الصوتي...")}
                              className="w-full h-32 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-fuchsia-500 outline-none mb-4"
                            />
                            
                            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t("تعليمات الأداء الصوتي (Style Instructions)")}</label>
                            <textarea
                              value={customScriptStyle}
                              onChange={(e) => setCustomScriptStyle(e.target.value)}
                              placeholder={t("مثال: تحدث بحماس وسرعة، أو تحدث بهدوء وبطء كأنك تروي قصة...")}
                              className="w-full h-16 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-fuchsia-500 outline-none mb-4"
                            />

                            <div className="mt-2">
                              <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t("الصوت")}</label>
                              <div className="flex gap-2">
                                <select
                                  value={customScriptVoice}
                                  onChange={(e) => setCustomScriptVoice(e.target.value)}
                                  className="flex-1 p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 outline-none transition-colors"
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
                                <button
                                  onClick={() => playVoiceSample(customScriptVoice)}
                                  disabled={isSampleLoading || customScriptVoice === 'auto' || customScriptVoice === 'clone'}
                                  className="px-4 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl font-medium hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/50 disabled:opacity-50 flex items-center justify-center transition-colors"
                                  title={t("استماع لعينة صوتية")}
                                >
                                  {isSampleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
