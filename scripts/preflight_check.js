const fs = require('fs');
const path = require('path');

function validateHtmlFile(filePath) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`[ERROR] File not found: ${fullPath}`);
    return false;
  }

  console.log(`\n==================================================`);
  console.log(`[PRE-FLIGHT TEST] Checking: ${path.basename(fullPath)}`);
  console.log(`==================================================`);

  const html = fs.readFileSync(fullPath, 'utf8');

  // 1. Script syntax check
  const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
  let match;
  let blockIndex = 0;
  let scriptErrors = 0;

  while ((match = scriptRegex.exec(html)) !== null) {
    blockIndex++;
    const code = match[1];
    if (!code.trim()) continue;

    try {
      new Function(code);
      console.log(`  [PASS] Script block #${blockIndex}: JS Syntax OK (${code.length.toLocaleString()} chars)`);
    } catch (err) {
      console.error(`  [FAIL] Script block #${blockIndex}: SYNTAX ERROR!`);
      console.error(`         ${err.name}: ${err.message}`);
      scriptErrors++;
    }
  }

  // 2. Template literal backtick unclosed check
  let backtickCount = 0;
  let escaped = false;
  for (let i = 0; i < html.length; i++) {
    const ch = html[i];
    if (ch === '\\') {
      escaped = !escaped;
      continue;
    }
    if (ch === '`' && !escaped) {
      backtickCount++;
    }
    escaped = false;
  }
  const backtickOk = backtickCount % 2 === 0;
  console.log(`  [${backtickOk ? 'PASS' : 'FAIL'}] Template backtick pairs: ${backtickCount} (${backtickOk ? 'Balanced' : 'UNBALANCED!'})`);

  // 3. Overall Verdict
  const passed = scriptErrors === 0 && backtickOk;
  if (passed) {
    console.log(`\n>>> SUCCESS: ${path.basename(fullPath)} passed all pre-flight syntax and loading checks!\n`);
  } else {
    console.error(`\n>>> FAILED: ${path.basename(fullPath)} has fatal syntax errors! DO NOT PUBLISH.\n`);
  }
  return passed;
}

// Run against target files
const filesToCheck = process.argv.slice(2);
if (filesToCheck.length === 0) {
  filesToCheck.push('d:/weber/APP/WordChecking/WordChecking.html');
}

let allPassed = true;
for (const file of filesToCheck) {
  const ok = validateHtmlFile(file);
  if (!ok) allPassed = false;
}

process.exit(allPassed ? 0 : 1);
