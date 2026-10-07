const fs = require('fs');
let code = fs.readFileSync('src/components/CPAReductionPlanner.tsx', 'utf8');

const tableSearchStr = `                </tbody>
              </table>
            </div>
            
          </div>\`;`;

const newTableStr = `                </tbody>
              </table>
            </div>

            {/* Second Table for Daily Targets */}
            <div className="mt-12 mb-4">
              <div className="bg-[#4E3197]/20 border border-[#4E3197]/40 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#4E3197] text-white flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="text-xl font-bold text-white">{t('الأهداف اليومية المطلوبة (بناءً على')} {inputs.remainingDays} {t('يوماً متبقياً)')}</h4>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-[#2D2D44]">
                  <table className="w-full text-center border-collapse min-w-[600px] bg-[#1C1C28]">
                    <thead>
                      <tr className="bg-[#2D2D44]">
                        <th className="py-4 px-4 font-bold border-b border-[#3D3D54]">{t('الاستراتيجية')}</th>
                        <th className="py-4 px-4 font-bold border-b border-[#3D3D54] text-emerald-400">{t('الطلبات اليومية')}</th>
                        <th className="py-4 px-4 font-bold border-b border-[#3D3D54] text-red-400">{t('التكلفة اليومية (CPA)')}</th>
                        <th className="py-4 px-4 font-bold border-b border-[#3D3D54] text-blue-400">{t('الإنفاق اليومي (Spend)')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D2D44]">
                      {(() => {
                        try {
                          const jsonStr = result.replace(/^\\s*\`\`\`json/m, '').replace(/\\s*\`\`\`$/m, '').trim();
                          const data = JSON.parse(jsonStr);
                          
                          return Array.isArray(data) ? data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                              <td className="py-4 px-4 border-r border-[#2D2D44] font-bold text-zinc-300 text-right">
                                {row.scenario}
                              </td>
                              <td className="py-4 px-4 border-r border-[#2D2D44] font-black text-lg text-emerald-400 bg-emerald-400/5">
                                {row.dailyOrders}
                              </td>
                              <td className="py-4 px-4 border-r border-[#2D2D44] font-black text-lg text-red-400 bg-red-400/5">
                                {row.dailyCpa}
                              </td>
                              <td className="py-4 px-4 font-black text-lg text-blue-400 bg-blue-400/5">
                                {row.dailySpend}
                              </td>
                            </tr>
                          )) : null;
                        } catch(e) {
                          return null;
                        }
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
          </div>\`;`;

code = code.replace(tableSearchStr, newTableStr);
fs.writeFileSync('src/components/CPAReductionPlanner.tsx', code);
