const fs = require('fs');
let code = fs.readFileSync('src/components/CPAReductionPlanner.tsx', 'utf8');

code = code.replace(
  /const report = await generateCPAScenarios\([\s\S]*?Number\(inputs\.currentOrders\),[\s\S]*?Number\(inputs\.currentCpa\),[\s\S]*?Number\(inputs\.minCpa\),[\s\S]*?Number\(inputs\.maxCpa\),[\s\S]*?Number\(inputs\.remainingDays\),[\s\S]*?Number\(inputs\.dailySpend \|\| 0\),[\s\S]*?language,[\s\S]*?aiModel[\s\S]*?\);/,
  `const report = await generateCPAScenarios(
        Number(inputs.currentOrders),
        Number(inputs.currentCpa),
        Number(inputs.targetCpa),
        Number(inputs.minCpa),
        Number(inputs.maxCpa),
        Number(inputs.remainingDays),
        Number(inputs.dailySpend || 0),
        language,
        aiModel
      );`
);

fs.writeFileSync('src/components/CPAReductionPlanner.tsx', code);
