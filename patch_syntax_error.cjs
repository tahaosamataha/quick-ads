const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const strToFind = `                          </div>
                        </div>

                        {activeTab === 'script' && (`;

const strToReplace = `                          </div>
                        </div>
                        )}
                        {activeTab === 'script' && (`;

code = code.replace(strToFind, strToReplace);
fs.writeFileSync('src/App.tsx', code);
