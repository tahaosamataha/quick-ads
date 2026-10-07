const fs = require('fs');
let code = fs.readFileSync('src/components/AutoSuite.tsx', 'utf8');

const anchor = `        {/* Dynamic Fields for Landing Page HTML */}`;

const scriptAndFbUi = `        {/* Dynamic Fields for Script & Voice */}
        {selectedSections.scriptAndVoice && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6 pt-6 border-t border-dashed border-purple-200 dark:border-purple-900/50 bg-purple-50/30 dark:bg-purple-950/10 p-6 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold mb-4">
              <Mic className="w-5 h-5" />
              {t("متطلبات الإسكريبتات والتعليق الصوتي")}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("مدة الإسكريبت")}</label>
                <select value={scriptDuration} onChange={(e) => setScriptDuration(e.target.value)} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="15_seconds">15 ثانية (سريع / Reels)</option>
                  <option value="30_seconds">30 ثانية (قياسي)</option>
                  <option value="60_seconds">60 ثانية (شرح مفصل)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("نوع المعلق الصوتي")}</label>
                <select value={scriptVoiceGender} onChange={(e) => setScriptVoiceGender(e.target.value)} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="auto">{t("تلقائي (حسب المنتج)")}</option>
                  <option value="male">{t("صوت رجالي")}</option>
                  <option value="female">{t("صوت نسائي")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("عدد الإسكريبتات")}</label>
                <select value={scriptCount} onChange={(e) => {
                  const count = Number(e.target.value);
                  setScriptCount(count);
                  setSelectedScriptTypes(Array(count).fill('إعلان مبيعات مباشر'));
                  setSelectedScriptGenders(Array(count).fill('auto'));
                }} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {t("إسكريبتات")}</option>)}
                </select>
              </div>
              <div className="space-y-2 flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={autoScriptAngles} onChange={(e) => setAutoScriptAngles(e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("توليد زوايا تسويقية تلقائية للإسكريبتات")}</span>
                </label>
              </div>
            </div>
            
            {!autoScriptAngles && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("تخصيص كل إسكريبت")}</label>
                {Array.from({ length: scriptCount }).map((_, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select 
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
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Dynamic Fields for FB Ads */}
        {selectedSections.fbAds && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6 pt-6 border-t border-dashed border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/10 p-6 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold mb-4">
              <FileText className="w-5 h-5" />
              {t("متطلبات إعلانات فيسبوك وتيك توك")}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("الهدف الإعلاني (Campaign Objective)")}</label>
                <select value={fbCampaignObjective} onChange={(e) => setFbCampaignObjective(e.target.value)} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="زيادة المبيعات (Sales)">زيادة المبيعات (Sales)</option>
                  <option value="جلب عملاء محتملين (Leads)">جلب عملاء محتملين (Leads)</option>
                  <option value="تفاعل (Engagement)">تفاعل (Engagement)</option>
                  <option value="زيارات للموقع (Traffic)">زيارات للموقع (Traffic)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("عدد نسخ الإعلانات")}</label>
                <select value={fbAdCount} onChange={(e) => {
                  const count = Number(e.target.value);
                  setFbAdCount(count);
                  setSelectedFbAdTypes(Array(count).fill('إعلان مبيعات مباشر'));
                }} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  {[1, 2, 3, 4, 5, 10].map(n => <option key={n} value={n}>{n} {t("إعلانات")}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2 flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={autoFbAngles} onChange={(e) => setAutoFbAngles(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("توليد زوايا تسويقية مختلفة لكل إعلان تلقائياً")}</span>
                </label>
              </div>
            </div>

            {!autoFbAngles && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("تخصيص أنواع الإعلانات")}</label>
                {Array.from({ length: fbAdCount }).map((_, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select 
                      value={selectedFbAdTypes[idx] || 'إعلان مبيعات مباشر'} 
                      onChange={(e) => {
                        const newArr = [...selectedFbAdTypes];
                        newArr[idx] = e.target.value;
                        setSelectedFbAdTypes(newArr);
                      }} 
                      className="flex-1 p-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
                    >
                      <option value="إعلان مبيعات مباشر">إعلان مبيعات مباشر</option>
                      <option value="إعلان مميزات وفوائد">إعلان مميزات وفوائد</option>
                      <option value="إعلان إعادة استهداف (Retargeting)">إعلان إعادة استهداف (Retargeting)</option>
                      <option value="إعلان سرد قصصي (Storytelling)">إعلان سرد قصصي (Storytelling)</option>
                      <option value="إعلان مقارنة مع المنافسين">إعلان مقارنة مع المنافسين</option>
                      <option value="إعلان مبني على سؤال وجواب">إعلان مبني على سؤال وجواب</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

`;

code = code.replace(anchor, scriptAndFbUi + anchor);
fs.writeFileSync('src/components/AutoSuite.tsx', code);
