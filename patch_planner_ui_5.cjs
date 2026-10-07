const fs = require('fs');
let code = fs.readFileSync('src/components/CPAReductionPlanner.tsx', 'utf8');

// There's a remaining inputs.targetCpa reference, we should remove it. Let's find it.
const searchStr = `        Number(inputs.targetCpa),`;
code = code.replace(searchStr, `        // targetCpa was here, now replaced by min/max`);

// Replace it in the validation if it exists
code = code.replace(/!inputs\.targetCpa/g, "(!inputs.minCpa || !inputs.maxCpa)");

fs.writeFileSync('src/components/CPAReductionPlanner.tsx', code);
