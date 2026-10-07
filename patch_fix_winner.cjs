const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const strToFind = `                          </div>
                        ) : scriptGenMode === 'auto' ? (
                          <div className="bg-fuchsia-50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-800/30 p-5 rounded-xl text-sm leading-relaxed">
                            <p className="text-zinc-800 dark:text-zinc-200 font-medium mb-2">{t("أتمتة كاملة بصلاحيات ماركتير محترف (20 سنة خبرة)")}</p>
                            <p className="text-zinc-600 dark:text-zinc-400">{t("سيقوم الذكاء الاصطناعي بتجاهل القوالب التقليدية المملة واستخراج 5 زوايا إعلانية مبتكرة وقوية جداً بناءً على منتجك لتحقيق أعلى تحويل (Conversion).")}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>`;

const replacement = `                          </div>
                        ) : (
                          <div className="bg-fuchsia-50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-800/30 p-5 rounded-xl text-sm leading-relaxed">
                            <p className="text-zinc-800 dark:text-zinc-200 font-medium mb-2">{t("أتمتة كاملة بصلاحيات ماركتير محترف (20 سنة خبرة)")}</p>
                            <p className="text-zinc-600 dark:text-zinc-400">{t("سيقوم الذكاء الاصطناعي بتجاهل القوالب التقليدية المملة واستخراج 5 زوايا إعلانية مبتكرة وقوية جداً بناءً على منتجك لتحقيق أعلى تحويل (Conversion).")}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>`;

code = code.replace(strToFind, replacement);
fs.writeFileSync('src/App.tsx', code);
