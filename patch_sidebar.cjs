const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldArray = `          {[
            { id: 'downloader', icon: Download, label: t('Ad Downloader') },
            { id: 'pricing', icon: Calculator, label: t('تسعير المنتج') },
            { id: 'utmBuilder', icon: LinkIcon, label: t('UTM Builder') },
            { id: 'history', icon: History, label: t('سجل المشاريع') },
          ]`;

const newArray = `          {[
            { id: 'downloader', icon: Download, label: t('Ad Downloader') },
            { id: 'pricing', icon: Calculator, label: t('تسعير المنتج') },
            { id: 'utmBuilder', icon: LinkIcon, label: t('UTM Builder') },
            { id: 'history', icon: History, label: t('سجل المشاريع') },
            { id: 'adsMetrics', icon: BarChart2, label: t('محلل الحملات (Metrics)') },
            { id: 'cpaPlanner', icon: Calculator, label: t('مخطط تقليل CPA') },
          ]`;

code = code.replace(oldArray, newArray);
fs.writeFileSync('src/App.tsx', code);
