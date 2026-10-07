const fs = require('fs');
let code = fs.readFileSync('src/components/CPAReductionPlanner.tsx', 'utf8');

const importOld = `import { Calculator, Download, AlertCircle, Loader2, Target, DownloadCloud } from 'lucide-react';`;
const importNew = `import { Calculator, Download, AlertCircle, Loader2, Target, DownloadCloud, TrendingUp, Star, Filter, Tag, FileBarChart } from 'lucide-react';`;
code = code.replace(importOld, importNew);

const oldResultRender = `          <div ref={resultRef} className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm p-8" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">{t('تقرير خطة تقليل الـ CPA')}</h3>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>`;

const newResultRender = `          <div ref={resultRef} className="bg-[#1C1C28] text-white rounded-3xl border border-[#2D2D44] shadow-2xl overflow-hidden" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2D2D44]">
              <div className="flex items-center gap-3">
                <div className="text-purple-400 font-black text-xl italic tracking-wider flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6 text-fuchsia-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  QUICK ADS
                </div>
              </div>
              <div className="bg-[#5939A7] text-white font-bold text-2xl px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
                <FileBarChart className="w-6 h-6" />
                {t('تقرير خطة تقليل الـ CPA')}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#4E3197]">
                    <th className="py-5 px-4 font-bold border border-[#2D2D44] border-t-0 w-[25%]">{t('الاستراتيجية')}</th>
                    <th className="py-5 px-4 font-bold border border-[#2D2D44] border-t-0 w-[30%]">{t('الإجراء المطلوب')}</th>
                    <th className="py-5 px-4 font-bold border border-[#2D2D44] border-t-0">{t('عدد الطلبات الإضافية المطلوبة')}</th>
                    <th className="py-5 px-4 font-bold border border-[#2D2D44] border-t-0">{t('أقصى تكلفة مسموحة للطلب (Max CPA)')}</th>
                    <th className="py-5 px-4 font-bold border border-[#2D2D44] border-t-0 border-l-0">{t('الأداء المتوقع خلال ')} {inputs.remainingDays} {t('يوماً')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D2D44]">
                  {(() => {
                    try {
                      // Attempt to parse JSON from result. Strip out markdown blocks if AI added them
                      const jsonStr = result.replace(/^\\s*\`\`\`json/m, '').replace(/\\s*\`\`\`$/m, '').trim();
                      const data = JSON.parse(jsonStr);
                      const icons = [TrendingUp, Target, Star, Filter, Tag];
                      
                      return Array.isArray(data) ? data.map((row, idx) => {
                        const Icon = icons[idx % icons.length];
                        return (
                          <tr key={idx} className="hover:bg-white/5 transition-colors group">
                            <td className="py-6 px-4 border border-[#2D2D44] border-l-0 font-bold text-right flex items-center gap-4 justify-end">
                              <span className="text-zinc-200 text-sm">{row.scenario}</span>
                              <div className="w-10 h-10 rounded-xl bg-[#2D2D44] group-hover:bg-[#4E3197] text-[#9373EE] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                                <Icon className="w-5 h-5" />
                              </div>
                            </td>
                            <td className="py-6 px-4 border border-[#2D2D44] text-sm leading-relaxed text-zinc-300">
                              {row.action}
                            </td>
                            <td className="py-6 px-4 border border-[#2D2D44] font-black text-xl text-[#A78BFA]">
                              {row.additionalOrders}
                            </td>
                            <td className="py-6 px-4 border border-[#2D2D44] font-black text-xl text-[#A78BFA]">
                              {row.maxCpa}
                            </td>
                            <td className="py-6 px-4 border border-[#2D2D44] border-r-0">
                              <div className="flex items-center justify-center gap-3">
                                <span className="text-sm font-medium text-zinc-300">{row.expectedPerformance}</span>
                                <TrendingUp className="w-5 h-5 text-green-400" />
                              </div>
                            </td>
                          </tr>
                        );
                      }) : null;
                    } catch(e) {
                      return (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-red-400">
                            Failed to parse JSON response. Ensure AI returns raw JSON format. <br/>
                            <pre className="text-xs text-left overflow-auto mt-4 max-h-40 p-4 bg-black rounded-lg">{result}</pre>
                          </td>
                        </tr>
                      );
                    }
                  })()}
                </tbody>
              </table>
            </div>
            
          </div>`;

code = code.replace(oldResultRender, newResultRender);
fs.writeFileSync('src/components/CPAReductionPlanner.tsx', code);
