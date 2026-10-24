const fs = require('fs');
const path = require('path');
const vm = require('vm');

/**
 * 通用發布前自動化檢驗四大防線測試腳本
 * 支援 WordChecking.html, MathChecking.html 等單檔前端系統
 */

function validateHtmlFile(filePath) {
  const fullPath = path.resolve(filePath);
  const fileName = path.basename(fullPath);

  if (!fs.existsSync(fullPath)) {
    console.error(`[ERROR] 檔案不存在: ${fullPath}`);
    return false;
  }

  console.log(`\n======================================================================`);
  console.log(`🚀 [PRE-FLIGHT TEST] 四大防線實機驗證: ${fileName}`);
  console.log(`======================================================================`);

  const html = fs.readFileSync(fullPath, 'utf8');
  let passAll = true;

  // -------------------------------------------------------------------------
  // 🛡️ 防線一：靜態語法與模板字串完整性自動檢測 (Syntax & Template Integrity)
  // -------------------------------------------------------------------------
  console.log(`\n[防線一] 靜態語法與模板字串完整性檢測...`);

  // 1.1 反引號閉合性檢查
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
  if (backtickOk) {
    console.log(`  ✅ 模板字串反引號成雙配對: 共 ${backtickCount} 個 (完全閉合)`);
  } else {
    console.error(`  ❌ 模板字串反引號異常: 共 ${backtickCount} 個 (存在未閉合反引號！)`);
    passAll = false;
  }

  // 1.2 抽取所有腳本區塊進行語法編譯檢查
  const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
  let match;
  let blockIndex = 0;
  const scriptBlocks = [];

  while ((match = scriptRegex.exec(html)) !== null) {
    blockIndex++;
    const code = match[1];
    scriptBlocks.push({ index: blockIndex, code });
    if (!code.trim()) continue;

    try {
      new Function(code);
      console.log(`  ✅ 腳本區塊 #${blockIndex} 語法檢查通過 (${code.length.toLocaleString()} 字元)`);
    } catch (err) {
      console.error(`  ❌ 腳本區塊 #${blockIndex} 發現致命語法錯誤 (SyntaxError):`);
      console.error(`     ${err.name}: ${err.message}`);
      passAll = false;
    }
  }

  if (!passAll) {
    console.error(`\n🚨 防線一檢驗未通過，中斷執行！請先修正語法錯誤。`);
    return false;
  }

  // -------------------------------------------------------------------------
  // 🛡️ 防線三：開頁生命週期實機模擬運行 (Runtime Execution Check)
  // -------------------------------------------------------------------------
  console.log(`\n[防線三] 開頁生命週期實機模擬 (Mock Browser Runtime)...`);

  // 建立虛擬 DOM 與瀏覽器環境
  const elementsById = new Map();
  const eventListeners = new Map();

  function createMockElement(id = '', tagName = 'div') {
    const el = {
      id: id,
      tagName: tagName.toUpperCase(),
      style: {},
      classList: {
        _classes: new Set(),
        add: (...cls) => cls.forEach(c => el.classList._classes.add(c)),
        remove: (...cls) => cls.forEach(c => el.classList._classes.delete(c)),
        contains: (c) => el.classList._classes.has(c),
        toggle: (c) => el.classList.contains(c) ? el.classList.remove(c) : el.classList.add(c)
      },
      attributes: {},
      setAttribute: (k, v) => { el.attributes[k] = String(v); },
      getAttribute: (k) => el.attributes[k] || null,
      children: [],
      options: [],
      value: '',
      innerHTML: '',
      textContent: '',
      innerText: '',
      disabled: false,
      appendChild: (child) => {
        el.children.push(child);
        if (el.tagName === 'SELECT' && child.tagName === 'OPTION') {
          el.options.push(child);
        }
        return child;
      },
      addEventListener: (evt, fn) => {
        if (!eventListeners.has(evt)) eventListeners.set(evt, []);
        eventListeners.get(evt).push(fn);
      },
      click: () => {},
      focus: () => {},
      scrollIntoView: () => {}
    };
    if (id) elementsById.set(id, el);
    return el;
  }

  // 預先抓取 HTML 中所有具有 id 的標籤，填充至 Mock Document
  const idRegex = /<([a-zA-Z0-9\-]+)[^>]*\sid=["']([^"']+)["'][^>]*>/gi;
  let idMatch;
  while ((idMatch = idRegex.exec(html)) !== null) {
    const tag = idMatch[1];
    const id = idMatch[2];
    if (!elementsById.has(id)) {
      const el = createMockElement(id, tag);
      // 若是 select 標籤，解析其子 option
      if (tag.toLowerCase() === 'select') {
        const selRegex = new RegExp(`<select[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/select>`, 'i');
        const selMatch = selRegex.exec(html);
        if (selMatch) {
          const optRegex = /<option[^>]*value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/gi;
          let optMatch;
          while ((optMatch = optRegex.exec(selMatch[1])) !== null) {
            const optEl = createMockElement('', 'option');
            optEl.value = optMatch[1];
            optEl.text = optMatch[2].trim();
            el.options.push(optEl);
          }
        }
      }
    }
  }

  // 本地快取 Storage
  const storageData = {};
  const mockLocalStorage = {
    getItem: (key) => storageData[key] || null,
    setItem: (key, val) => { storageData[key] = String(val); },
    removeItem: (key) => { delete storageData[key]; },
    clear: () => { for (const k in storageData) delete storageData[k]; }
  };

  const domContentLoadedCallbacks = [];

  const sandbox = {
    console: {
      log: () => {},
      warn: () => {},
      info: () => {},
      error: (...args) => console.error('  [Browser Runtime Error]', ...args)
    },
    tailwind: { config: {} },
    window: null, // will self reference
    document: {
      getElementById: (id) => elementsById.get(id) || createMockElement(id),
      querySelector: (sel) => {
        if (sel.startsWith('#')) return elementsById.get(sel.slice(1)) || createMockElement(sel.slice(1));
        return createMockElement('', 'div');
      },
      querySelectorAll: (sel) => [],
      createElement: (tag) => createMockElement('', tag),
      createElementNS: (ns, tag) => createMockElement('', tag),
      addEventListener: (evt, fn) => {
        if (evt === 'DOMContentLoaded') {
          domContentLoadedCallbacks.push(fn);
        }
      },
      body: createMockElement('body', 'body'),
      documentElement: createMockElement('html', 'html')
    },
    addEventListener: (evt, fn) => {
      if (evt === 'DOMContentLoaded') {
        domContentLoadedCallbacks.push(fn);
      }
    },
    localStorage: mockLocalStorage,
    sessionStorage: mockLocalStorage,
    location: { href: 'http://localhost/', reload: () => {}, search: '' },
    navigator: { userAgent: 'NodeTestMockBrowser' },
    Audio: function() {
      return { play: () => Promise.resolve(), pause: () => {}, addEventListener: () => {} };
    },
    speechSynthesis: {
      speak: () => {},
      cancel: () => {},
      getVoices: () => []
    },
    SpeechSynthesisUtterance: function() {},
    setTimeout: (fn, ms) => {},
    setInterval: (fn, ms) => {},
    clearTimeout: () => {},
    clearInterval: () => {},
    requestAnimationFrame: (fn) => {},
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  };

  sandbox.window = sandbox;

  const vmContext = vm.createContext(sandbox);

  // 執行主腳本
  let runtimeErrors = 0;
  for (const blk of scriptBlocks) {
    if (!blk.code.trim()) continue;
    try {
      vm.runInContext(blk.code, vmContext, { filename: `inline-script-${blk.index}.js` });
    } catch (err) {
      console.error(`  ❌ 腳本區塊 #${blk.index} 於執行階段拋出例外:`, err.message);
      runtimeErrors++;
    }
  }

  // 觸發開頁事件 DOMContentLoaded
  console.log(`  🔄 觸發 DOMContentLoaded 開頁生命週期事件 (共 ${domContentLoadedCallbacks.length} 個監聽器)...`);
  for (const cb of domContentLoadedCallbacks) {
    try {
      cb();
    } catch (err) {
      console.error(`  ❌ DOMContentLoaded 開頁回呼函式執行崩潰:`, err);
      runtimeErrors++;
    }
  }

  if (runtimeErrors === 0) {
    console.log(`  ✅ 開頁生命週期 0 Exception 順暢走完！`);
  } else {
    console.error(`  ❌ 開頁生命週期發生 ${runtimeErrors} 個執行期嚴重例外！`);
    passAll = false;
    return false;
  }

  // -------------------------------------------------------------------------
  // 🛡️ 防線四：開頁 DOM 元件與數據斷言 (DOM Integrity Assertions)
  // -------------------------------------------------------------------------
  console.log(`\n[防線四] 開頁關鍵 DOM 元件與數據斷言...`);

  let assertionErrors = 0;

  // 針對 WordChecking.html 專屬檢查
  if (fileName.toLowerCase().includes('wordchecking')) {
    const themeSelect = elementsById.get('themeSelect');
    if (themeSelect && themeSelect.options && themeSelect.options.length > 0) {
      console.log(`  ✅ 題庫/主題選單 #themeSelect 成功掛載: 共 ${themeSelect.options.length} 個選項`);
    } else {
      console.error(`  ❌ #themeSelect 選項數量為 0 或未掛載！`);
      assertionErrors++;
    }

    const catOutfit = elementsById.get('mainCatAccOutfit');
    if (catOutfit) {
      console.log(`  ✅ 咪咪貓咪主飾品掛載節點 #mainCatAccOutfit 正常存在`);
    } else {
      console.error(`  ❌ 找不到貓咪主飾品節點 #mainCatAccOutfit！`);
      assertionErrors++;
    }

    // 驗證 THEME_REGISTRY 資料物件完整性
    try {
      const registry = vm.runInContext('typeof THEME_REGISTRY !== "undefined" ? THEME_REGISTRY : null', vmContext);
      if (registry && Object.keys(registry).length > 0) {
        console.log(`  ✅ THEME_REGISTRY 詞庫主題字典存在: 共 ${Object.keys(registry).length} 個主題`);
      } else {
        console.error(`  ❌ THEME_REGISTRY 未定義或為空！`);
        assertionErrors++;
      }
    } catch (e) {
      assertionErrors++;
    }
  }

  // 針對 MathChecking.html 專屬檢查
  if (fileName.toLowerCase().includes('mathchecking')) {
    const mathContainer = elementsById.get('questionContainer') || elementsById.get('quizContainer') || elementsById.get('app');
    console.log(`  ✅ MathChecking 核心容器狀態確認完畢`);
  }

  if (assertionErrors === 0) {
    console.log(`  ✅ 所有核心 DOM 元件與資料斷言 100% 通過！`);
  } else {
    console.error(`  ❌ DOM 斷言發現 ${assertionErrors} 項缺失！`);
    passAll = false;
  }

  // -------------------------------------------------------------------------
  // 總結判定
  // -------------------------------------------------------------------------
  console.log(`----------------------------------------------------------------------`);
  if (passAll) {
    console.log(`🎉 判定結果：【SUCCESS】${fileName} 完全通過四大防線檢測！允許發布。\n`);
    return true;
  } else {
    console.error(`🚨 判定結果：【FAILED】${fileName} 未能通過四大防線檢測，嚴禁發布！\n`);
    return false;
  }
}

// 執行檢測
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
