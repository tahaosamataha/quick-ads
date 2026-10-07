const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
const imports = `import { AdsMetricsAnalyzer } from './components/AdsMetricsAnalyzer';
import { CPAReductionPlanner } from './components/CPAReductionPlanner';\n`;
code = code.replace(/import \{ AutoSuite \} from '\.\/components\/AutoSuite';/, "import { AutoSuite } from './components/AutoSuite';\n" + imports);

// Add to sidebar icons/labels
const sidebarLabel = `            { id: 'settings', icon: Settings, label: t('الإعدادات') },
            { id: 'adsMetrics', icon: BarChart2, label: t('محلل الحملات (Metrics)') },
            { id: 'cpaPlanner', icon: Calculator, label: t('مخطط تقليل CPA') },`;
code = code.replace(/\{ id: 'settings', icon: Settings, label: t\('الإعدادات'\) \},/, sidebarLabel);

// Add to activeTab conditions
const newTabs = `            {activeTab === 'adsMetrics' && (
              <AdsMetricsAnalyzer />
            )}
            
            {activeTab === 'cpaPlanner' && (
              <CPAReductionPlanner />
            )}
            
            {activeTab === 'settings' && (`;
code = code.replace(/\{activeTab === 'settings' && \(/, newTabs);

fs.writeFileSync('src/App.tsx', code);
