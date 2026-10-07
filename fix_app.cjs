const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCode = `{activeTab === 'productSpy' && (
              <div className="animate-fade-in pb-16 max-w-7xl mx-auto px-4 mt-8">
                <ProductSpy />
              </div>
            )}`;
            
const newCode = `<div className={\`animate-fade-in pb-16 max-w-7xl mx-auto px-4 mt-8 \${activeTab === 'productSpy' ? 'block' : 'hidden'}\`}>
              <ProductSpy />
            </div>`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/App.tsx', code);
