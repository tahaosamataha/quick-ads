const fs = require('fs');
let code = fs.readFileSync('src/components/AutoSuite.tsx', 'utf8');

// Add useRef
code = code.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useRef } from 'react';");

// Add cancelFlagRef to AutoSuite
code = code.replace(/const \[error, setError\] = useState<string \| null>\(null\);/, 
  "const [error, setError] = useState<string | null>(null);\n  const cancelFlagRef = useRef<boolean>(false);\n\n  const handleStopAutomation = () => {\n    cancelFlagRef.current = true;\n    setIsGenerating(false);\n    setCurrentStepText('تم إيقاف التوليد');\n  };\n");

// Inside handleRunAutomation
code = code.replace(/const handleRunAutomation = async \(\) => \{/, 
  "const handleRunAutomation = async () => {\n    cancelFlagRef.current = false;");

// Find Action Button
const actionBtnRegex = /\{\/\* Action Button \*\/\}\s*<div className="pt-4">\s*<button\s*onClick=\{handleRunAutomation\}[^]*?<\/button>\s*<\/div>/;

const newActionBtn = `{/* Action Button */}
        <div className="pt-4 flex gap-4">
          <button
            onClick={handleRunAutomation}
            disabled={isGenerating}
            className="flex-1 py-4 px-8 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-fuchsia-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>{currentStepText}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>{t("بدء الأتمتة السحرية (Run Automation)")}</span>
              </>
            )}
          </button>
          
          {isGenerating && (
            <button
              onClick={handleStopAutomation}
              className="py-4 px-8 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-red-500/25 transition-all flex items-center justify-center gap-3"
            >
              <AlertCircle className="w-6 h-6" />
              <span>{t("إيقاف التوليد")}</span>
            </button>
          )}
        </div>`;

code = code.replace(actionBtnRegex, newActionBtn);

fs.writeFileSync('src/components/AutoSuite.tsx', code);
