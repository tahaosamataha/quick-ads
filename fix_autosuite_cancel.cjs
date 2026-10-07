const fs = require('fs');
let code = fs.readFileSync('src/components/AutoSuite.tsx', 'utf8');

// Insert cancel checks
code = code.replace(/if \(selectedSections\.productSpy\) \{/g, "if (cancelFlagRef.current) return;\n      if (selectedSections.productSpy) {");
code = code.replace(/if \(selectedSections\.scriptAndVoice\) \{/g, "if (cancelFlagRef.current) return;\n      if (selectedSections.scriptAndVoice) {");
code = code.replace(/if \(selectedSections\.fbAds\) \{/g, "if (cancelFlagRef.current) return;\n      if (selectedSections.fbAds) {");
code = code.replace(/if \(selectedSections\.winnerAngles\) \{/g, "if (cancelFlagRef.current) return;\n      if (selectedSections.winnerAngles) {");
code = code.replace(/if \(selectedSections\.productBrain\) \{/g, "if (cancelFlagRef.current) return;\n      if (selectedSections.productBrain) {");
code = code.replace(/if \(selectedSections\.visualPrompts\) \{/g, "if (cancelFlagRef.current) return;\n      if (selectedSections.visualPrompts) {");
code = code.replace(/if \(selectedSections\.funnelCopy\) \{/g, "if (cancelFlagRef.current) return;\n      if (selectedSections.funnelCopy) {");
code = code.replace(/if \(selectedSections\.videoScenes\) \{/g, "if (cancelFlagRef.current) return;\n      if (selectedSections.videoScenes) {");
code = code.replace(/if \(selectedSections\.flowCharacter\) \{/g, "if (cancelFlagRef.current) return;\n      if (selectedSections.flowCharacter) {");
code = code.replace(/if \(selectedSections\.textVisual\) \{/g, "if (cancelFlagRef.current) return;\n      if (selectedSections.textVisual) {");
code = code.replace(/if \(selectedSections\.photoshoot\) \{/g, "if (cancelFlagRef.current) return;\n      if (selectedSections.photoshoot) {");
code = code.replace(/if \(selectedSections\.landingPage\) \{/g, "if (cancelFlagRef.current) return;\n      if (selectedSections.landingPage) {");

fs.writeFileSync('src/components/AutoSuite.tsx', code);
