const fs = require('fs');
let code = fs.readFileSync('src/components/AutoSuite.tsx', 'utf8');

const regex = /<select\s+value=\{selectedScriptTypes\[idx\](?:[\s\S]*?)<\/select>/;

const replacement = `<select 
                      value={selectedScriptTypes[idx] || 'إعلان مبيعات مباشر'} 
                      onChange={(e) => {
                        const newArr = [...selectedScriptTypes];
                        newArr[idx] = e.target.value;
                        setSelectedScriptTypes(newArr);
                      }} 
                      className="flex-1 p-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
                    >
                      <option value="مشكلة وحل (Problem-Solution)">مشكلة وحل (Problem-Solution)</option>
                      <option value="قبل وبعد (Before-After)">قبل وبعد (Before-After)</option>
                      <option value="توصية صانع محتوى (UGC)">توصية صانع محتوى (UGC)</option>
                      <option value="إعلان مبيعات مباشر">إعلان مبيعات مباشر</option>
                      <option value="قصة نجاح (Success Story)">قصة نجاح (Success Story)</option>
                      <option value="إعلان فكاهي / تريند">إعلان فكاهي / تريند</option>
                    </select>
                    <select
                      value={selectedScriptGenders[idx] || 'auto'}
                      onChange={(e) => {
                        const newGenders = [...selectedScriptGenders];
                        newGenders[idx] = e.target.value;
                        setSelectedScriptGenders(newGenders);
                      }}
                      className="w-24 p-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
                    >
                      <option value="auto">تلقائي</option>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/AutoSuite.tsx', code);
