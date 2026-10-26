(function(window) {
  'use strict';
  const CRUISE_STAGES = [
    { id: 'preview', step: 1, name: '清單預覽', icon: '📋', mode: null, desc: '特訓單字預覽確認' },
    { id: 'card', step: 2, name: '翻轉卡片', icon: '🐾', mode: 'card', desc: '英文先出翻轉速記' },
    { id: 'quiz', step: 3, name: '四選一', icon: '❓', mode: 'quiz', desc: '認音辨義，全對通關' },
    { id: 'speaking', step: 4, name: '口語跟讀', icon: '🎙️', mode: 'speaking', desc: '標準發音朗讀檢測' },
    { id: 'rain', step: 5, name: '方塊雨', icon: '🧱', mode: 'rain', desc: '特訓方塊快打消除' },
    { id: 'spelling', step: 6, name: '拼字練習', icon: '⌨️', mode: 'spelling', desc: '鍵盤拼寫，完全掌握' },
    { id: 'exam', step: 7, name: '聽寫模考', icon: '👑', mode: 'exam', desc: '聽音盲拼，黃金掌握' }
  ];
  let isCruiseActive = false;
  let currentStageIndex = 0;
  let cruiseBatch = []; // [{ word, chinese, pos, kk, example, note, num, isReview }]
  let selectedWordsSet = new Set();
  let stagePassedItems = new Set();
  let stageItemStats = {}; // { [word]: { correct: 0, attempts: 0 } }
  let isStageTransitioning = false;
  let autoAdvanceTimer = null;
  function onWordCheckChange() {
    selectedWordsSet.clear();
    const boxes = document.querySelectorAll('.word-select-checkbox:checked');
    boxes.forEach(b => {
      const w = b.dataset.word;
      if (w) selectedWordsSet.add(w);
    });
    updateSelectedBadge();
  }
  function updateSelectedBadge() {
    const badge = document.getElementById('cruiseSelectedCountBadge');
    if (badge) badge.innerText = selectedWordsSet.size;
  }
  function selectQuickWords(count = 10, type = 'new') {
    selectedWordsSet.clear();
    const pool = (typeof filteredList !== 'undefined' && filteredList && filteredList.length > 0)
      ? filteredList
      : (typeof RAW_VOCAB !== 'undefined' ? RAW_VOCAB : []);
    let candidates = [];
    if (type === 'new') {
      candidates = pool.filter(x => !userProgress[x.word || x.num]);
    } else if (type === 'weak') {
      candidates = pool.filter(x => userProgress[x.word || x.num] === 'weak');
    }
    if (candidates.length === 0) candidates = pool;
    candidates.slice(0, count).forEach(item => {
      if (item && item.word) selectedWordsSet.add(item.word);
    });
    const boxes = document.querySelectorAll('.word-select-checkbox');
    boxes.forEach(b => {
      b.checked = selectedWordsSet.has(b.dataset.word);
    });
    updateSelectedBadge();
    if (typeof sayCatSpeech === 'function') {
      sayCatSpeech(`已為妳勾選 ${selectedWordsSet.size} 個${type === 'new' ? '新' : '待加強'}單字！隨時點擊【啟動自動導航特訓】開始喵！🐾`);
    }
  }
  function clearSelected() {
    selectedWordsSet.clear();
    const boxes = document.querySelectorAll('.word-select-checkbox');
    boxes.forEach(b => { b.checked = false; });
    const selectAll = document.getElementById('selectAllWordsCheckbox');
    if (selectAll) selectAll.checked = false;
    updateSelectedBadge();
  }
  function toggleSelectAll(checked) {
    const boxes = document.querySelectorAll('.word-select-checkbox');
    boxes.forEach(b => {
      b.checked = checked;
      if (checked && b.dataset.word) selectedWordsSet.add(b.dataset.word);
      else if (!checked && b.dataset.word) selectedWordsSet.delete(b.dataset.word);
    });
    updateSelectedBadge();
  }
  function assembleCruiseBatch() {
    const pool = (typeof RAW_VOCAB !== 'undefined' && RAW_VOCAB && RAW_VOCAB.length > 0) ? RAW_VOCAB : [];
    if (pool.length === 0) return [];
    let targets = [];
    if (selectedWordsSet.size > 0) {
      targets = pool.filter(x => selectedWordsSet.has(x.word));
    } else {
      const currentList = (typeof filteredList !== 'undefined' && filteredList && filteredList.length > 0) ? filteredList : pool;
      const newOrWeak = currentList.filter(x => {
        const st = userProgress[x.word || x.num];
        return !st || st === 'weak';
      });
      targets = (newOrWeak.length > 0 ? newOrWeak : currentList).slice(0, 10);
    }
    const selectedSet = new Set(targets.map(x => x.word));
    let reviewItems = [];
    const minBatchSize = 5;
    const familiarOrMastered = pool.filter(x => {
      if (selectedSet.has(x.word)) return false;
      const st = userProgress[x.word || x.num];
      return st === 'mastered' || st === 'familiar';
    }).sort(() => Math.random() - 0.5);
    const weakPool = pool.filter(x => {
      if (selectedSet.has(x.word)) return false;
      const st = userProgress[x.word || x.num];
      return st === 'weak';
    }).sort(() => Math.random() - 0.5);
    const currentList = (typeof filteredList !== 'undefined' && filteredList && filteredList.length > 0) ? filteredList : pool;
    const remainingPool = currentList.filter(x => !selectedSet.has(x.word)).sort(() => Math.random() - 0.5);
    let neededCount = 0;
    if (targets.length < minBatchSize) {
      neededCount = minBatchSize - targets.length;
    } else {
      neededCount = Math.max(1, Math.min(3, Math.round(targets.length * 0.2)));
    }
    for (const item of familiarOrMastered) {
      if (reviewItems.length >= neededCount) break;
      if (!selectedSet.has(item.word)) {
        reviewItems.push({ ...item, isReview: true, reviewReason: '🌱 溫故知新' });
        selectedSet.add(item.word);
      }
    }
    for (const item of weakPool) {
      if (reviewItems.length >= neededCount) break;
      if (!selectedSet.has(item.word)) {
        reviewItems.push({ ...item, isReview: true, reviewReason: '🐾 待加強複習' });
        selectedSet.add(item.word);
      }
    }
    for (const item of remainingPool) {
      if (reviewItems.length >= neededCount) break;
      if (!selectedSet.has(item.word)) {
        reviewItems.push({ ...item, isReview: true, reviewReason: '✨ 系統推薦補足' });
        selectedSet.add(item.word);
      }
    }
    cruiseBatch = [
      ...targets.map(x => ({ ...x, isReview: false, reviewReason: '🎯 主攻目標' })),
      ...reviewItems
    ];
    return cruiseBatch;
  }
  function launchCruiseFromTable() {
    const batch = assembleCruiseBatch();
    if (!batch || batch.length === 0) {
      if (typeof sayCatSpeech === 'function') sayCatSpeech("目前沒有可特訓的單字喵～請先勾選單字！🐾");
      return;
    }
    isCruiseActive = true;
    currentStageIndex = 0;
    stagePassedItems.clear();
    renderCruiseTopBar();
    showCruisePreviewModal();
    if (typeof sayCatSpeech === 'function') {
      sayCatSpeech(`🚀 全自動導航特訓啟動！本輪包含 ${batch.filter(x => !x.isReview).length} 個主攻單字 ＋ ${batch.filter(x => x.isReview).length} 個溫故複習單字，出發囉喵！🐾`, "自動導航");
    }
  }
  function renderCruiseTopBar() {
    let bar = document.getElementById('cruiseTopBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'cruiseTopBar';
      bar.className = "sticky top-16 z-30 max-w-5xl mx-auto px-4 py-2.5 mb-3 transition-all";
      const main = document.querySelector('main');
      if (main && main.parentNode) {
        main.parentNode.insertBefore(bar, main);
      }
    }
    if (!isCruiseActive) {
      bar.classList.add('hidden');
      return;
    }
    bar.classList.remove('hidden');
    const stage = CRUISE_STAGES[currentStageIndex];
    bar.innerHTML = `
      <div class="bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 rounded-2xl p-3 text-white shadow-lg border border-white/20 flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl animate-bounce">🚀</span>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-black text-sm sm:text-base">全自動導航特訓中</span>
              <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">第 ${stage.step} / 7 關：${stage.name}</span>
            </div>
            <p class="text-[11px] text-white/80">${stage.desc}（特訓陣容：${cruiseBatch.length} 字 ｜ 通關進度：${stagePassedItems.size}/${cruiseBatch.length} 字${stage.mode !== "card" ? "，每字 2~3 次精熟複習" : ""}）</p>
          </div>
        </div>
        <div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          ${CRUISE_STAGES.map((s, idx) => {
            const isCurrent = idx === currentStageIndex;
            const isDone = idx < currentStageIndex;
            return `
              <div class="flex items-center">
                <div class="px-2 py-1 rounded-xl text-[10px] sm:text-xs font-bold transition flex items-center gap-1 ${
                  isCurrent ? 'bg-amber-400 text-amber-950 ring-2 ring-white shadow-xs' :
                  (isDone ? 'bg-white/30 text-white line-through opacity-80' : 'bg-black/20 text-white/60')
                }">
                  <span>${isDone ? '✔' : s.icon}</span>
                  <span class="hidden sm:inline">${s.name}</span>
                </div>
                ${idx < CRUISE_STAGES.length - 1 ? '<span class="text-white/40 text-[10px] mx-0.5">➔</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
        <div class="flex items-center gap-2">
          ${currentStageIndex < CRUISE_STAGES.length - 1 ? `
            <button onclick="WordCheckingCruise.startNextStage(${currentStageIndex + 1})" class="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black transition cursor-pointer shadow-sm flex items-center gap-1">
              <span>前進第 ${CRUISE_STAGES[currentStageIndex + 1].step} 關</span>
              <span>➔</span>
            </button>
          ` : `
            <button onclick="WordCheckingCruise.startNextStage(7)" class="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black transition cursor-pointer shadow-sm flex items-center gap-1">
              <span>👑 完成黃金掌握</span>
            </button>
          `}
          <button onclick="WordCheckingCruise.stopCruise()" class="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition cursor-pointer whitespace-nowrap">
            ✕ 暫停
          </button>
        </div>
      </div>
    `;
  }
  function showCruisePreviewModal() {
    let modal = document.getElementById('cruisePreviewModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cruisePreviewModal';
      modal.className = "fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-opacity duration-200";
      document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-rose-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in duration-200" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between border-b border-rose-100 dark:border-slate-700 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-3xl">📋</span>
            <div>
              <h3 class="font-black text-base sm:text-lg text-slate-900 dark:text-white">第 1 站：特訓單字清單預覽</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">本輪將依序通關 7 大關卡，徹底晉級至黃金掌握！</p>
            </div>
          </div>
          <button onclick="WordCheckingCruise.stopCruise()" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold">✕</button>
        </div>
        <div class="max-h-64 overflow-y-auto space-y-1.5 p-1 pr-2">
          ${cruiseBatch.map((w, idx) => `
            <div class="p-2.5 rounded-2xl border ${w.isReview ? 'bg-blue-50/60 dark:bg-slate-700/40 border-blue-200/60' : 'bg-rose-50/60 dark:bg-slate-700/40 border-rose-200/60'} flex items-center justify-between gap-2">
              <div class="flex items-baseline gap-2">
                <span class="text-xs font-mono font-bold text-slate-400">#${idx + 1}</span>
                <span class="font-black text-sm text-slate-900 dark:text-white font-mono">${escapeHtml(w.word)}</span>
                <span class="text-[11px] text-slate-500 font-serif">${escapeHtml(w.kk || '')}</span>
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300">${escapeHtml(w.chinese)}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${w.isReview ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}">
                  ${w.isReview ? '🌱 溫故複習' : '✨ 主攻目標'}
                </span>
                <button onclick="playVoiceText('${(w.word || '').replace(/'/g, "\\'")}')" class="p-1 rounded-lg text-rose-500 hover:bg-white transition">
                  <i class="fa-solid fa-volume-high text-xs"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <div class="text-xs text-slate-400">
            共 ${cruiseBatch.length} 個單字${cruiseBatch.length >= 5 && selectedWordsSet.size > 0 && selectedWordsSet.size < 5 ? '（已自動補足至 5 字特訓陣容）' : ''} ｜ 全對自動推進
          </div>
          <button onclick="WordCheckingCruise.startNextStage(1)" class="px-5 py-2.5 bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white rounded-xl font-black text-sm shadow-md shadow-rose-500/25 transition transform hover:scale-105 active:scale-95 cursor-pointer">
            開始第 2 站：翻轉卡片速記 🐾
          </button>
        </div>
      </div>
    `;
  }
  function startNextStage(targetStageIndex) {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
    isStageTransitioning = false;
    const previewModal = document.getElementById('cruisePreviewModal');
    if (previewModal) previewModal.classList.add('hidden');
    const vicModal = document.getElementById('cruiseVictoryModal');
    if (vicModal) vicModal.classList.add('hidden');
    currentStageIndex = targetStageIndex;
    stagePassedItems.clear();
    stageItemStats = {};
    if (cruiseBatch && cruiseBatch.length > 0) {
      cruiseBatch.forEach(w => {
        stageItemStats[w.word] = { correct: 0, attempts: 0 };
      });
    }
    renderCruiseTopBar();
    const stage = CRUISE_STAGES[currentStageIndex];
    if (!stage) {
      completeCruiseGoldenMastery();
      return;
    }
    if (stage.mode && typeof switchMode === 'function') {
      if (typeof window.setStudyList === 'function') {
        window.setStudyList(cruiseBatch);
      }
      if (typeof window.filteredList !== 'undefined') {
        window.filteredList = [...cruiseBatch];
      }
      window.currentIndex = 0;
      switchMode(stage.mode);
      if (stage.mode === 'card') {
        if (typeof renderCurrentCard === 'function') renderCurrentCard();
      } else if (stage.mode === 'quiz') {
        if (typeof startNewQuiz === 'function') startNewQuiz();
      } else if (stage.mode === 'speaking') {
        if (typeof startNewSpeaking === 'function') startNewSpeaking();
      } else if (stage.mode === 'rain') {
        if (window.WordCheckingRain) {
          window.WordCheckingRain.initWordRain();
        }
      } else if (stage.mode === 'spelling') {
        if (typeof startNewSpelling === 'function') startNewSpelling();
      } else if (stage.mode === 'exam') {
        if (typeof startExamSession === 'function') {
          startExamSession(cruiseBatch);
        }
      }
    }
  }
  function reportStageItemSuccess(word, isForcedPass = false) {
    if (!isCruiseActive || !word) return;
    if (!stageItemStats[word]) {
      stageItemStats[word] = { correct: 0, attempts: 0 };
    }
    if (!isForcedPass) {
      stageItemStats[word].correct++;
    }
    const stage = CRUISE_STAGES[currentStageIndex];
    const targetCorrect = (stage && stage.mode === 'card') ? 1 : 2;
    const maxAttempts = 3;
    if (isForcedPass || stageItemStats[word].correct >= targetCorrect || stageItemStats[word].attempts >= maxAttempts) {
      stagePassedItems.add(word);
    }
    renderCruiseTopBar();
    if (stagePassedItems.size >= cruiseBatch.length && !isStageTransitioning) {
      showStageVictoryModal();
    }
  }
  function reportStageItemFailure(word) {
    if (!isCruiseActive || !word) return;
    if (!stageItemStats[word]) {
      stageItemStats[word] = { correct: 0, attempts: 0 };
    }
    const maxAttempts = 3;
    if (stageItemStats[word].attempts >= maxAttempts) {
      stagePassedItems.add(word);
    } else {
      stagePassedItems.delete(word);
    }
    renderCruiseTopBar();
    if (stagePassedItems.size >= cruiseBatch.length && !isStageTransitioning) {
      showStageVictoryModal();
    }
  }
  function recordItemAttempt(word) {
    if (!isCruiseActive || !word) return;
    if (!stageItemStats[word]) {
      stageItemStats[word] = { correct: 0, attempts: 0 };
    }
    stageItemStats[word].attempts++;
  }
  function getItemStats(word) {
    return stageItemStats[word] || { correct: 0, attempts: 0 };
  }
  function getNextCruiseItem() {
    if (!isCruiseActive || !cruiseBatch || cruiseBatch.length === 0) return null;
    const unpassed = cruiseBatch.filter(w => !stagePassedItems.has(w.word));
    if (unpassed.length === 0) return cruiseBatch[0];
    unpassed.sort((a, b) => {
      const statA = stageItemStats[a.word] || { attempts: 0, correct: 0 };
      const statB = stageItemStats[b.word] || { attempts: 0, correct: 0 };
      if (statA.attempts !== statB.attempts) {
        return statA.attempts - statB.attempts;
      }
      return cruiseBatch.indexOf(a) - cruiseBatch.indexOf(b);
    });
    return unpassed[0];
  }
  function showStageVictoryModal() {
    if (isStageTransitioning) return;
    isStageTransitioning = true;
    const stage = CRUISE_STAGES[currentStageIndex];
    const isLastStage = currentStageIndex >= CRUISE_STAGES.length - 1;
    if (isLastStage) {
      completeCruiseGoldenMastery();
      return;
    }
    const nextStage = CRUISE_STAGES[currentStageIndex + 1];
    let modal = document.getElementById('cruiseVictoryModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cruiseVictoryModal';
      modal.className = "fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-opacity duration-200";
      document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');
    if (typeof playCatCheerSound === 'function') playCatCheerSound();
    if (typeof addFish === 'function') addFish(3);
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
    modal.innerHTML = `
      <div class="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-emerald-300 dark:border-emerald-700 text-center space-y-4 animate-in fade-in zoom-in duration-200" onclick="event.stopPropagation()">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-3xl shadow-lg shadow-emerald-400/20 animate-bounce">
          🎉
        </div>
        <div>
          <h3 class="font-black text-lg text-slate-900 dark:text-white">第 ${stage.step} 關：${stage.name} 通關！</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">太厲害了！本關單字全數過關，獲贈 3 條小魚乾 🐟</p>
        </div>
        <div class="space-y-2">
          <button id="cruiseNextStageBtn" onclick="WordCheckingCruise.startNextStage(${currentStageIndex + 1});" class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-black text-sm shadow-md shadow-emerald-500/25 transition transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5">
            <span>前進第 ${nextStage.step} 關：${nextStage.name}</span>
            <span class="text-xs bg-white/20 px-2 py-0.5 rounded-full">(自動前往...)</span>
            <span>➔</span>
          </button>
          <p class="text-[11px] text-slate-400 dark:text-slate-500">🚀 全自動導航模式將自動進入下一關，亦可點擊立即前往</p>
        </div>
      </div>
    `;
    if (typeof sayCatSpeech === 'function') {
      sayCatSpeech(`太棒了！第 ${stage.step} 關【${stage.name}】全對通關！送妳 3 條小魚乾，自動為妳前進【${nextStage.name}】喵！🐾`, "通關大捷");
    }
    autoAdvanceTimer = setTimeout(() => {
      startNextStage(currentStageIndex + 1);
    }, 1800);
  }
  function completeCruiseGoldenMastery() {
    isCruiseActive = false;
    renderCruiseTopBar();
    const theme = (typeof THEME_REGISTRY !== 'undefined' && currentThemeKey) ? THEME_REGISTRY[currentThemeKey] : null;
    cruiseBatch.forEach(w => {
      const k = w.word || w.num;
      if (typeof userProgress !== 'undefined') {
        userProgress[k] = 'mastered';
        userProgress[k + '_golden'] = true;
      }
    });
    if (theme) {
      localStorage.setItem(theme.storageKey, JSON.stringify(userProgress));
    }
    if (typeof addFish === 'function') addFish(20);
    if (typeof playCatCheerSound === 'function') playCatCheerSound();
    if (typeof triggerAutoSaveToPi === 'function') triggerAutoSaveToPi(true);
    let modal = document.getElementById('cruiseVictoryModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cruiseVictoryModal';
      modal.className = "fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-opacity duration-200";
      document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="bg-gradient-to-b from-amber-50 via-white to-amber-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-4 border-amber-400 text-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center text-4xl shadow-xl shadow-amber-400/40 animate-pulse">
          👑
        </div>
        <div>
          <span class="text-[11px] font-black uppercase tracking-wider text-amber-600 bg-amber-200/70 px-3 py-1 rounded-full">Golden Mastery Ceremony</span>
          <h2 class="font-black text-2xl text-amber-950 dark:text-amber-300 mt-2">🏆 黃金大滿貫通關！</h2>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
            恭喜妳完成 7 大關卡極致特訓！本輪單字已全數晉級為<b class="text-amber-600 dark:text-amber-400">【👑 黃金掌握】</b>！
          </p>
        </div>
        <div class="p-3 bg-amber-100/60 dark:bg-slate-700/60 rounded-2xl border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center justify-center gap-2">
          <span>🎁 通關獎勵：</span>
          <span class="text-base text-rose-600 font-black">+20 條小魚乾 🐟</span>
          <span>＋ 黃金冠冕徽章 👑</span>
        </div>
        <button onclick="WordCheckingCruise.closeCruiseAndReturn(); const m = document.getElementById('cruiseVictoryModal'); if (m) m.classList.add('hidden');" class="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-black text-sm shadow-md shadow-amber-500/30 transition transform hover:scale-105 active:scale-95 cursor-pointer">
          返回單字總表 🐾
        </button>
      </div>
    `;
    if (typeof sayCatSpeech === 'function') {
      sayCatSpeech("太厲害了！完成 7 階自動導航極致特訓，本輪單字全部達成【黃金掌握】！咪咪送妳 20 條小魚乾喵～👑🐟✨", "黃金大滿貫");
    }
  }
  function closeCruiseAndReturn() {
    const modal = document.getElementById('cruiseVictoryModal');
    if (modal) modal.classList.add('hidden');
    stopCruise();
    if (typeof switchMode === 'function') switchMode('list');
  }
  function stopCruise() {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
    isStageTransitioning = false;
    isCruiseActive = false;
    currentStageIndex = 0;
    stagePassedItems.clear();
    stageItemStats = {};
    renderCruiseTopBar();
    const previewModal = document.getElementById('cruisePreviewModal');
    if (previewModal) previewModal.classList.add('hidden');
    const vicModal = document.getElementById('cruiseVictoryModal');
    if (vicModal) vicModal.classList.add('hidden');
    if (typeof updateFilteredList === 'function') updateFilteredList();
  }
  window.WordCheckingCruise = {
    onWordCheckChange: onWordCheckChange,
    selectQuickWords: selectQuickWords,
    clearSelected: clearSelected,
    toggleSelectAll: toggleSelectAll,
    launchCruiseFromTable: launchCruiseFromTable,
    startNextStage: startNextStage,
    reportItemSuccess: reportStageItemSuccess,
    reportItemFailure: reportStageItemFailure,
    isItemPassed: (word) => stagePassedItems.has(word),
    getPassedCount: () => stagePassedItems.size,
    getNextItem: getNextCruiseItem,
    recordAttempt: recordItemAttempt,
    getItemStats: getItemStats,
    completeCruise: completeCruiseGoldenMastery,
    stopCruise: stopCruise,
    closeCruiseAndReturn: closeCruiseAndReturn,
    isActive: () => isCruiseActive,
    getBatch: () => cruiseBatch
  };
})(window);