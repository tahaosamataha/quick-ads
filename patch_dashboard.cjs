const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Also need to make sure BarChart2 and Calculator are imported if they are not. Oh, they are from lucide-react. Let's just import them.
const addImports = `import { Brain, FileText, BarChart2, Calculator, Play, Radar, Bot, Camera, LayoutTemplate, Quote, Wand2, ImageIcon, Film, UserIcon } from 'lucide-react';`;
code = code.replace(/import \{ Brain, FileText, Play, Radar, Bot, Camera, LayoutTemplate, Quote, Wand2, ImageIcon, Film, UserIcon \} from 'lucide-react';/, addImports); // Just a guess on current imports, let's replace all lucide imports to be safe.

const newTools = `                          { id: 'autoSuite', icon: Bot, title: t('الأتمتة الشاملة بالذكاء الاصطناعي'), desc: t('توليد كل الأقسام بضغطة زر واحدة'), color: 'from-fuchsia-600/30 to-purple-600/10', iconColor: 'text-fuchsia-500' },
                          { id: 'adsMetrics', icon: BarChart2, title: t('محلل الحملات والإعلانات'), desc: t('أدوات تحليل الأداء واتخاذ القرار (Metrics)'), color: 'from-blue-600/30 to-blue-600/10', iconColor: 'text-blue-500' },
                          { id: 'cpaPlanner', icon: Calculator, title: t('مخطط تقليل CPA'), desc: t('إنشاء 3 سيناريوهات لتخفيض التكلفة'), color: 'from-emerald-600/30 to-emerald-600/10', iconColor: 'text-emerald-500' },`;
code = code.replace(/\{ id: 'autoSuite', icon: Bot, title: t\('الأتمتة الشاملة بالذكاء الاصطناعي'\), desc: t\('توليد كل الأقسام بضغطة زر واحدة'\), color: 'from-fuchsia-600\/30 to-purple-600\/10', iconColor: 'text-fuchsia-500' \},/, newTools);

fs.writeFileSync('src/components/Dashboard.tsx', code);
