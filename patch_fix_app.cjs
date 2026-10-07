const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const strToFind = `                              </select>
                            </div>

                        )}`;

const replacement = `                              </select>
                            </div>
                          </div>
                        )}`;

code = code.replace(strToFind, replacement);
fs.writeFileSync('src/App.tsx', code);
