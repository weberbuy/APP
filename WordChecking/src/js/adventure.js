/**
 * WordChecking Phase 3: 冒險闖關地圖模組 (Adventure Map Mode)
 * 適用於國中會考 1200 單字學習系統
 * 支援 5 大主題世界、120 個冒險關卡、Boss 寶箱、三模式挑戰與雲端同步
 */
(function (root, factory) {
  const instance = factory();
  if (typeof window !== 'undefined') window.WordCheckingAdventure = instance;
  if (typeof globalThis !== 'undefined') globalThis.WordCheckingAdventure = instance;
  if (typeof module === 'object' && module.exports) module.exports = instance;
  root.WordCheckingAdventure = instance;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const ADVENTURE_WORLDS = [
    {
      id: 1,
      name: '萌喵初醒新手村',
      icon: '🍼',
      level: 1,
      wordRange: [1, 150],
      stageRange: [1, 15],
      bossStage: 15,
      themeColor: 'from-amber-400 to-rose-400',
      badgeBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300',
      cardBorder: 'border-amber-200 dark:border-amber-800/60',
      cardBg: 'bg-amber-50/70 dark:bg-amber-950/30',
      accentColor: '#f59e0b',
      desc: '基礎打底：1-150 字（基礎數字、家庭親屬、日常問候）'
    },
    {
      id: 2,
      name: '微風綠意森林',
      icon: '🧶',
      level: 2,
      wordRange: [151, 400],
      stageRange: [16, 40],
      bossStage: 40,
      themeColor: 'from-emerald-400 to-teal-500',
      badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
      cardBorder: 'border-emerald-200 dark:border-emerald-800/60',
      cardBg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
      accentColor: '#10b981',
      desc: '生活拓展：151-400 字（身體部位、時間星期、飲食動物）'
    },
    {
      id: 3,
      name: '智慧水晶書城',
      icon: '🎓',
      level: 3,
      wordRange: [401, 750],
      stageRange: [41, 75],
      bossStage: 75,
      themeColor: 'from-indigo-400 to-purple-500',
      badgeBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300',
      cardBorder: 'border-indigo-200 dark:border-indigo-800/60',
      cardBg: 'bg-indigo-50/70 dark:bg-indigo-950/30',
      accentColor: '#6366f1',
      desc: '核心詞彙：401-750 字（學校課堂、休閒運動、核心動詞）'
    },
    {
      id: 4,
      name: '英勇試煉峽谷',
      icon: '🏹',
      level: 4,
      wordRange: [751, 1050],
      stageRange: [76, 105],
      bossStage: 105,
      themeColor: 'from-orange-500 to-red-500',
      badgeBg: 'bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300',
      cardBorder: 'border-orange-200 dark:border-orange-800/60',
      cardBg: 'bg-orange-50/70 dark:bg-orange-950/30',
      accentColor: '#f97316',
      desc: '語感淬鍊：751-1050 字（情緒感受、天氣自然、進階片語）'
    },
    {
      id: 5,
      name: '傳奇會考神殿',
      icon: '👑',
      level: 5,
      wordRange: [1051, 1200],
      stageRange: [106, 120],
      bossStage: 120,
      themeColor: 'from-amber-500 to-yellow-400',
      badgeBg: 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200',
      cardBorder: 'border-yellow-300 dark:border-yellow-700/60',
      cardBg: 'bg-yellow-50/70 dark:bg-yellow-950/30',
      accentColor: '#eab308',
      desc: '會考登頂：1051-1200 字（抽象思維、會考高頻精通）'
    }
  ];
  const STORAGE_KEY = 'wordchecking_adventure_v1';
  const TOTAL_STAGES = 120;
  const WORDS_PER_STAGE = 10;
  let state = {
    unlockedStage: 1,
    stageStars: {}, // { stageId: stars (1..3) }
    totalStars: 0,
    currentWorldId: 1,
    rawVocabList: []
  };
  let activeChallenge = {
    stageId: 1,
    type: 'quiz', // 'flashcard', 'quiz', 'spelling'
    words: [],
    questions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    userAnswers: []
  };
  let appHooks = {
    getFishCount: () => 0,
    addFish: (n) => {},
    addAffection: (n) => {},
    playAudio: (text) => {},
    playCheerSound: () => {},
    playMeowSound: () => {},
    saySpeech: (text, tag) => {},
    triggerSaveToPi: () => {}
  };
  function getStageInfo(stageId) {
    stageId = parseInt(stageId, 10);
    if (isNaN(stageId) || stageId < 1 || stageId > TOTAL_STAGES) return null;
    const world = ADVENTURE_WORLDS.find(
      w => stageId >= w.stageRange[0] && stageId <= w.stageRange[1]
    );
    const startWord = (stageId - 1) * WORDS_PER_STAGE + 1;
    const endWord = stageId * WORDS_PER_STAGE;
    const isBoss = world ? stageId === world.bossStage : false;
    return {
      stageId,
      world,
      wordRange: [startWord, endWord],
      isBoss
    };
  }
    function getStageWords(stageId, vocabList) {
    stageId = parseInt(stageId || activeChallenge.stageId || 1, 10);
    const info = getStageInfo(stageId);
    if (!info) return [];
    let list = (vocabList && vocabList.length > 0) ? vocabList : state.rawVocabList;
    if ((!list || list.length === 0) && typeof RAW_VOCAB !== 'undefined' && Array.isArray(RAW_VOCAB) && RAW_VOCAB.length > 0) {
      list = RAW_VOCAB;
      state.rawVocabList = RAW_VOCAB;
    }
    const startIndex = (info.stageId - 1) * WORDS_PER_STAGE;
    const endIndex = info.stageId * WORDS_PER_STAGE;
    let words = (list && list.length > 0) ? list.slice(startIndex, endIndex) : [];
    words = words.map((w, idx) => ({
      id: w.num || w.id || (startIndex + idx + 1),
      num: w.num || w.id || (startIndex + idx + 1),
      word: w.word || `word_${startIndex + idx + 1}`,
      pos: w.pos || 'n.',
      chinese: w.chinese || w.zh || '',
      zh: w.chinese || w.zh || '',
      example: w.example || w.eg || '',
      eg: w.example || w.eg || '',
      kk: w.kk || '',
      category: w.category || (info.world ? info.world.name : '核心單字'),
      note: w.note || ''
    }));
var WordCheckingAdventure = (typeof window !== 'undefined' && window.WordCheckingAdventure) ? window.WordCheckingAdventure : (typeof WordCheckingAdventure !== 'undefined' ? WordCheckingAdventure : null);
    return words;
  }
  function calculateStars(score, total) {
    if (!total || total <= 0) return 0;
    const pct = score / total;
    if (pct >= 0.90) return 3; // >= 90%
    if (pct >= 0.70) return 2; // 70% ~ 89%
    if (pct >= 0.60) return 1; // 60% ~ 69%
    return 0; // < 60% Challenge failed
  }
  function loadAdventureProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        state.unlockedStage = Math.max(1, Math.min(TOTAL_STAGES, parseInt(saved.unlockedStage || '1', 10)));
        state.stageStars = saved.stageStars || {};
        state.currentWorldId = saved.currentWorldId || determineWorldByStage(state.unlockedStage);
      } else {
        state.unlockedStage = 1;
        state.stageStars = {};
        state.currentWorldId = 1;
      }
    } catch (e) {
      console.warn('[AdventureMap] Failed to load progress from localStorage:', e);
      state.unlockedStage = 1;
      state.stageStars = {};
      state.currentWorldId = 1;
    }
    recalculateTotalStars();
    return state;
  }
  function saveAdventureProgress() {
    try {
      recalculateTotalStars();
      const payload = {
        unlockedStage: state.unlockedStage,
        stageStars: state.stageStars,
        totalStars: state.totalStars,
        currentWorldId: state.currentWorldId,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      appHooks.triggerSaveToPi();
    } catch (e) {
      console.error('[AdventureMap] Failed to save progress to localStorage:', e);
    }
  }
  function recalculateTotalStars() {
    let total = 0;
    Object.keys(state.stageStars).forEach(s => {
      total += (state.stageStars[s] || 0);
    });
    state.totalStars = total;
  }
  function determineWorldByStage(stageId) {
    const info = getStageInfo(stageId);
    return info ? info.world.id : 1;
  }
  function getAdventureSaveData() {
    recalculateTotalStars();
    return {
      unlockedStage: state.unlockedStage,
      stageStars: state.stageStars,
      totalStars: state.totalStars,
      currentWorldId: state.currentWorldId
    };
  }
  function loadAdventureSaveData(data) {
    if (!data) return;
    state.unlockedStage = (typeof data.unlockedStage === 'number') ? Math.max(1, Math.min(TOTAL_STAGES, data.unlockedStage)) : 1;
    state.stageStars = (data.stageStars && typeof data.stageStars === 'object') ? { ...data.stageStars } : {};
    recalculateTotalStars();
    state.currentWorldId = (typeof data.currentWorldId === 'number') ? data.currentWorldId : determineWorldByStage(state.unlockedStage);
    saveAdventureProgress();
    renderAdventureMap();
  }
  function resetAdventureProgress() {
    state.unlockedStage = 1;
    state.stageStars = {};
    state.totalStars = 0;
    state.currentWorldId = 1;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    recalculateTotalStars();
    renderAdventureMap();
  }
  function getAdventureStyles() {
    return `
      @keyframes pawPulse {
        0%, 100% { transform: scale(1) translateY(0); filter: drop-shadow(0 0 2px rgba(245, 158, 11, 0.4)); }
        50% { transform: scale(1.08) translateY(-4px); filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.8)); }
      }
      .current-node-pulse {
        animation: pawPulse 1.8s ease-in-out infinite;
      }
      @keyframes starPop {
        0% { transform: scale(0) rotate(-45deg); opacity: 0; }
        70% { transform: scale(1.25) rotate(10deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }
      .star-pop-1 { animation: starPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.2s; }
      .star-pop-2 { animation: starPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.45s; }
      .star-pop-3 { animation: starPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.7s; }
      .map-node-shadow {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      }
      .map-path-line {
        stroke-dasharray: 6 6;
      }
    `;
  }
  function renderAdventureMap() {
    const totalStarsEl = document.getElementById('advTotalStarsDisplay');
    const currStageEl = document.getElementById('advCurrentStageDisplay');
    if (totalStarsEl) totalStarsEl.innerText = `${state.totalStars} / 360`;
    if (currStageEl) currStageEl.innerText = `第 ${state.unlockedStage} 關`;
    const tabsContainer = document.getElementById('advWorldTabsContainer');
    if (tabsContainer) {
      tabsContainer.innerHTML = ADVENTURE_WORLDS.map(w => {
        const isActive = w.id === state.currentWorldId;
        const isWorldUnlocked = state.unlockedStage >= w.stageRange[0];
        const activeClass = isActive
          ? 'bg-gradient-to-r ' + w.themeColor + ' text-white font-black shadow-md'
          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700';
        return `
          <button onclick="WordCheckingAdventure.switchAdventureWorld(${w.id})" class="p-2.5 rounded-2xl text-xs flex flex-col items-center text-center transition cursor-pointer ${activeClass}">
            <span class="text-xl mb-0.5">${w.icon}</span>
            <span class="font-bold whitespace-nowrap">${w.name.slice(0, 4)}</span>
            <span class="text-[10px] opacity-80 font-mono">${w.stageRange[0]}-${w.stageRange[1]}關</span>
          </button>
        `;
      }).join('');
    }
    const bannerEl = document.getElementById('advWorldBanner');
    const activeWorld = ADVENTURE_WORLDS.find(w => w.id === state.currentWorldId) || ADVENTURE_WORLDS[0];
    if (bannerEl) {
      let worldCompletedStages = 0;
      let worldStars = 0;
      const totalInWorld = activeWorld.stageRange[1] - activeWorld.stageRange[0] + 1;
      for (let s = activeWorld.stageRange[0]; s <= activeWorld.stageRange[1]; s++) {
        if (state.stageStars[s] > 0) {
          worldCompletedStages++;
          worldStars += state.stageStars[s];
        }
      }
      const worldPct = Math.round((worldCompletedStages / totalInWorld) * 100);
      bannerEl.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${activeWorld.themeColor} flex items-center justify-center text-2xl text-white shadow-sm">
            ${activeWorld.icon}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-black text-slate-900 dark:text-white">${activeWorld.name}</h3>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full ${activeWorld.badgeBg}">Lv.${activeWorld.level}</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${activeWorld.desc}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <div class="text-xs font-black text-slate-800 dark:text-white flex items-center justify-end gap-1">
              <span>⭐</span> <span>${worldStars} / ${totalInWorld * 3}</span>
            </div>
            <div class="text-[10px] text-slate-400">通關進度 ${worldCompletedStages}/${totalInWorld} (${worldPct}%)</div>
          </div>
        </div>
      `;
    }
    const nodesContainer = document.getElementById('advStageNodesContainer');
    if (!nodesContainer) return;
    let nodesHtml = '';
    const startStage = activeWorld.stageRange[0];
    const endStage = activeWorld.stageRange[1];
    for (let s = startStage; s <= endStage; s++) {
      const isUnlocked = s <= state.unlockedStage;
      const isCurrent = s === state.unlockedStage;
      const isBoss = s === activeWorld.bossStage;
      const stars = state.stageStars[s] || 0;
      const stageIndexInWorld = s - startStage;
      const offset = Math.round(Math.sin(stageIndexInWorld * 0.9) * 80);
      let nodeCircleHtml = '';
      if (isCurrent) {
        nodeCircleHtml = `
          <div class="relative group cursor-pointer" onclick="WordCheckingAdventure.openStageModal(${s})">
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10 animate-bounce">
              <span class="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[9px] shadow-sm whitespace-nowrap">
                🐾 當前挑戰
              </span>
              <span class="text-base -mt-1">🐱</span>
            </div>
            <div class="w-16 h-16 rounded-3xl bg-gradient-to-tr ${activeWorld.themeColor} text-white font-black text-xl flex flex-col items-center justify-center shadow-lg shadow-amber-500/30 ring-4 ring-amber-400 ring-offset-2 dark:ring-offset-slate-900 current-node-pulse">
              <span>${s}</span>
              ${isBoss ? '<span class="text-[9px] -mt-1 font-bold">BOSS</span>' : ''}
            </div>
          </div>
        `;
      } else if (isUnlocked) {
        let starIcons = '☆☆☆';
        if (stars === 3) starIcons = '⭐⭐⭐';
        else if (stars === 2) starIcons = '⭐⭐☆';
        else if (stars === 1) starIcons = '⭐☆☆';
        nodeCircleHtml = `
          <div class="relative group cursor-pointer" onclick="WordCheckingAdventure.openStageModal(${s})">
            <div class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-black text-lg flex flex-col items-center justify-center border-2 border-amber-300 dark:border-amber-600 shadow-md hover:scale-105 transition">
              <span>${s}</span>
              <span class="text-[10px] text-amber-400 tracking-tighter -mt-0.5">${starIcons}</span>
            </div>
          </div>
        `;
      } else {
        nodeCircleHtml = `
          <div class="w-14 h-14 rounded-2xl bg-slate-200/80 dark:bg-slate-700/60 text-slate-400 font-bold text-sm flex flex-col items-center justify-center border border-slate-300 dark:border-slate-600/60 opacity-60 cursor-not-allowed" onclick="WordCheckingAdventure.notifyLockedStage(${s})">
            <span>🔒</span>
            <span class="text-[10px] font-mono">${s}</span>
          </div>
        `;
      }
      if (isBoss) {
        nodeCircleHtml = `
          <div class="flex flex-col items-center">
            <div class="text-xs font-black text-amber-600 dark:text-amber-300 flex items-center gap-1 mb-1">
              <span>🎁</span> <span>區域最終寶箱大關</span>
            </div>
            ${nodeCircleHtml}
          </div>
        `;
      }
      nodesHtml += `
        <div class="relative flex justify-center items-center w-full" style="transform: translateX(${offset}px);">
          ${nodeCircleHtml}
        </div>
      `;
    }
    nodesContainer.innerHTML = nodesHtml;
  }
  function switchAdventureWorld(worldId) {
    state.currentWorldId = worldId;
    renderAdventureMap();
  }
  function notifyLockedStage(stageId) {
    appHooks.saySpeech(`尚未解鎖第 ${stageId} 關喵！請先按照順序通過第 ${state.unlockedStage} 關吧🐾`, '關卡未解鎖');
    appHooks.playMeowSound();
  }
  function openStageModal(stageId) {
    stageId = stageId || state.unlockedStage;
    if (stageId > state.unlockedStage) {
      notifyLockedStage(stageId);
      return;
    }
    const info = getStageInfo(stageId);
    if (!info) return;
    activeChallenge.stageId = stageId;
    activeChallenge.words = getStageWords(stageId, state.rawVocabList);
    const modal = document.getElementById('advStageModal');
    if (!modal) return;
    document.getElementById('advStageModalTitle').innerText = `第 ${stageId} 關 ${info.isBoss ? '🎁 BOSS 關' : ''}`;
    document.getElementById('advStageModalWorldBadge').innerText = `${info.world.icon} ${info.world.name}`;
    document.getElementById('advStageModalSubtitle').innerText = `涵蓋教育部 1200 單字第 ${info.wordRange[0]} ～ ${info.wordRange[1]} 號`;
    const stars = state.stageStars[stageId] || 0;
    const recordEl = document.getElementById('advStageModalStarRecord');
    if (recordEl) {
      if (stars === 3) recordEl.innerText = '⭐⭐⭐ 滿星通關！';
      else if (stars === 2) recordEl.innerText = '⭐⭐ 二星紀錄';
      else if (stars === 1) recordEl.innerText = '⭐ 一星紀錄';
      else recordEl.innerText = '尚未挑戰';
    }
    const listEl = document.getElementById('advStageWordList');
    if (listEl) {
      listEl.innerHTML = activeChallenge.words.map((w, idx) => `
        <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 flex items-center justify-between text-xs">
          <div class="flex-1 min-w-0 pr-2">
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-mono text-slate-400">#${escapeHtml(w.id || (idx + 1))}</span>
              <span class="font-bold text-slate-900 dark:text-white truncate">${escapeHtml(w.word)}</span>
              <span class="text-[10px] text-amber-600 dark:text-amber-400 font-mono">${escapeHtml(w.pos || '')}</span>
            </div>
            <div class="text-[11px] text-slate-600 dark:text-slate-300 truncate font-medium">${escapeHtml(w.chinese || w.zh || '')}</div>
          </div>
          <button onclick="event.stopPropagation(); WordCheckingAdventure.playWordAudio('${escapeHtml(w.word.replace(/'/g, "\\'"))}')" class="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="點擊聆聽發音">
            🔊
          </button>
        </div>
      `).join('');
    }
    modal.classList.remove('hidden');
  }
  function closeStageModal() {
    const modal = document.getElementById('advStageModal');
    if (modal) modal.classList.add('hidden');
  }
  function playWordAudio(word) {
    if (!word) return;
    if (appHooks && typeof appHooks.playAudio === 'function') {
      appHooks.playAudio(word);
    }
    if (typeof playVoiceText === 'function') {
      playVoiceText(word);
    }
  }
  function startStageChallenge(stageId, type) {
    if (stageId) {
      activeChallenge.stageId = parseInt(stageId, 10);
    } else if (!activeChallenge.stageId) {
      activeChallenge.stageId = state.unlockedStage || 1;
    }
    activeChallenge.type = type || 'quiz';
    activeChallenge.words = getStageWords(activeChallenge.stageId, state.rawVocabList);
    activeChallenge.currentIndex = 0;
    activeChallenge.score = 0;
    activeChallenge.streak = 0;
    activeChallenge.userAnswers = [];
    closeStageModal();
    if (activeChallenge.type === 'flashcard') {
      renderFlashcardMode();
    } else if (activeChallenge.type === 'quiz') {
      setupQuizQuestions();
      renderQuizQuestion();
    } else if (activeChallenge.type === 'spelling') {
      setupSpellingQuestions();
      renderSpellingQuestion();
    }
    const challengeModal = document.getElementById('advChallengeModal');
    if (challengeModal) challengeModal.classList.remove('hidden');
  }
  function abortChallenge() {
    const challengeModal = document.getElementById('advChallengeModal');
    if (challengeModal) challengeModal.classList.add('hidden');
    appHooks.saySpeech('隨時可以再回來挑戰喔喵～🐾', '暫停冒險');
  }
  function renderFlashcardMode() {
    const bodyEl = document.getElementById('advChallengeBody');
    const titleEl = document.getElementById('advChallengeTitle');
    const iconEl = document.getElementById('advChallengeModeIcon');
    const progressEl = document.getElementById('advChallengeProgressText');
    const pBar = document.getElementById('advChallengeProgressBar');
    iconEl.innerText = '🚀';
    titleEl.innerText = `第 ${activeChallenge.stageId} 關・單字速記過目`;
    progressEl.innerText = `單字 ${activeChallenge.currentIndex + 1} / ${activeChallenge.words.length}`;
    if (pBar) pBar.style.width = `${((activeChallenge.currentIndex + 1) / activeChallenge.words.length) * 100}%`;
    const w = activeChallenge.words[activeChallenge.currentIndex];
    bodyEl.innerHTML = `
      <div class="p-6 rounded-3xl bg-amber-50 dark:bg-slate-700/60 border-2 border-amber-200 dark:border-slate-600 text-center space-y-3 min-h-[220px] flex flex-col justify-center items-center shadow-inner">
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            ${escapeHtml(w.pos || '詞性')}
          </span>
          <span class="text-xs text-slate-400 font-mono">#${escapeHtml(w.id || (activeChallenge.currentIndex + 1))}</span>
        </div>
        <div class="text-3xl font-black text-slate-900 dark:text-white tracking-wide">
          ${escapeHtml(w.word)}
        </div>
        <div class="flex items-center justify-center gap-2">
          <span onclick="WordCheckingAdventure.playWordAudio('${escapeHtml(w.word.replace(/'/g, "\\'"))}')" class="audio-source-badge inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 border border-slate-200 dark:border-slate-600 shadow-2xs cursor-pointer hover:bg-amber-100 transition active:scale-95" title="點擊播放讀音">
            <span>🔊 待播放</span>
          </span>
          <button onclick="WordCheckingAdventure.playWordAudio('${escapeHtml(w.word.replace(/'/g, "\\'"))}')" class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs hover:bg-amber-100 transition flex items-center gap-1.5 cursor-pointer">
            <span>🔊</span> <span>點我聆聽發音</span>
          </button>
        </div>
        <div class="text-lg font-bold text-amber-700 dark:text-amber-400 pt-1">
          ${escapeHtml(w.zh || '')}
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 italic max-w-xs">
          ${escapeHtml(w.eg || '')}
        </p>
      </div>
      <div class="flex items-center justify-between pt-2">
        <button onclick="WordCheckingAdventure.prevFlashcard()" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer" ${activeChallenge.currentIndex === 0 ? 'disabled opacity-50' : ''}>
          ⬅ 上一個
        </button>
        ${activeChallenge.currentIndex < activeChallenge.words.length - 1 ? `
          <button onclick="WordCheckingAdventure.nextFlashcard()" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition cursor-pointer">
            下一個 ➡
          </button>
        ` : `
          <button onclick="WordCheckingAdventure.startStageChallenge(null, 'quiz')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 text-white text-xs font-black transition shadow-xs cursor-pointer">
            熟記了！開始測驗 🎯
          </button>
        `}
      </div>
    `;
    playWordAudio(w.word);
  }
  function prevFlashcard() {
    if (activeChallenge.currentIndex > 0) {
      activeChallenge.currentIndex--;
      renderFlashcardMode();
    }
  }
  function nextFlashcard() {
    if (activeChallenge.currentIndex < activeChallenge.words.length - 1) {
      activeChallenge.currentIndex++;
      renderFlashcardMode();
    }
  }
  function setupQuizQuestions() {
    const words = activeChallenge.words;
    activeChallenge.questions = words.map((w, idx) => {
      const otherWords = words.filter((_, i) => i !== idx);
      const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
      const distractors = shuffledOthers.slice(0, 3).map(o => (o.chinese || o.zh || o.word));
      const correctZh = w.chinese || w.zh || w.word;
      const options = [correctZh, ...distractors].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(correctZh);
      return {
        word: w.word,
        pos: w.pos,
        zh: (w.chinese || w.zh || ''),
        eg: w.eg,
        options,
        correctIndex
      };
    });
  }
  function renderQuizQuestion() {
    const q = activeChallenge.questions[activeChallenge.currentIndex];
    const bodyEl = document.getElementById('advChallengeBody');
    const titleEl = document.getElementById('advChallengeTitle');
    const iconEl = document.getElementById('advChallengeModeIcon');
    const progressEl = document.getElementById('advChallengeProgressText');
    const streakEl = document.getElementById('advChallengeStreakBadge');
    const pBar = document.getElementById('advChallengeProgressBar');
    iconEl.innerText = '🎯';
    titleEl.innerText = `第 ${activeChallenge.stageId} 關・四選一挑戰`;
    progressEl.innerText = `第 ${activeChallenge.currentIndex + 1} / ${activeChallenge.questions.length} 題 ｜ 得分：${activeChallenge.score * 10}`;
    if (pBar) pBar.style.width = `${((activeChallenge.currentIndex + 1) / activeChallenge.questions.length) * 100}%`;
    if (activeChallenge.streak >= 2 && streakEl) {
      streakEl.innerText = `🔥 連擊 x${activeChallenge.streak}`;
      streakEl.classList.remove('hidden');
    } else if (streakEl) {
      streakEl.classList.add('hidden');
    }
    bodyEl.innerHTML = `
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-center space-y-2 shadow-xs">
        <div class="text-xs text-slate-400 font-mono">請選出正確的中文釋義</div>
        <div class="text-3xl font-black text-slate-900 dark:text-white tracking-wide">
          ${escapeHtml(q.word)}
        </div>
        <div class="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
          ${escapeHtml(q.pos || '')}
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1" id="advQuizOptionsContainer">
        ${q.options.map((opt, oIdx) => `
          <button onclick="WordCheckingAdventure.selectQuizAnswer(${oIdx})" id="advQuizOpt_${oIdx}" class="p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50 dark:bg-slate-700/50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-xs text-slate-800 dark:text-slate-100 transition text-left flex items-center gap-2 cursor-pointer shadow-2xs">
            <span class="w-6 h-6 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-mono flex items-center justify-center font-bold border border-slate-200 dark:border-slate-600">
              ${['A', 'B', 'C', 'D'][oIdx]}
            </span>
            <span class="flex-1">${escapeHtml(opt)}</span>
          </button>
        `).join('')}
      </div>
    `;
    playWordAudio(q.word);
  }
  function selectQuizAnswer(selectedIdx) {
    const q = activeChallenge.questions[activeChallenge.currentIndex];
    const isCorrect = (selectedIdx === q.correctIndex);
    for (let i = 0; i < q.options.length; i++) {
      const btn = document.getElementById(`advQuizOpt_${i}`);
      if (!btn) continue;
      btn.onclick = null;
      btn.classList.remove('hover:bg-amber-50', 'dark:hover:bg-slate-700');
      if (i === q.correctIndex) {
        btn.className = 'p-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs transition text-left flex items-center gap-2 shadow-md';
      } else if (i === selectedIdx && !isCorrect) {
        btn.className = 'p-3.5 rounded-2xl bg-rose-500 text-white font-bold text-xs transition text-left flex items-center gap-2 shadow-md';
      }
    }
    if (isCorrect) {
      activeChallenge.score++;
      activeChallenge.streak++;
      appHooks.playMeowSound();
    } else {
      activeChallenge.streak = 0;
    }
    setTimeout(() => {
      activeChallenge.currentIndex++;
      if (activeChallenge.currentIndex < activeChallenge.questions.length) {
        renderQuizQuestion();
      } else {
        finishStageChallenge(activeChallenge.score, activeChallenge.questions.length, activeChallenge.stageId);
      }
    }, 1100);
  }
  function setupSpellingQuestions() {
    activeChallenge.questions = activeChallenge.words.map(w => ({
      word: w.word,
      pos: w.pos,
      zh: (w.chinese || w.zh || ''),
      eg: w.eg
    }));
var WordCheckingAdventure = (typeof window !== 'undefined' && window.WordCheckingAdventure) ? window.WordCheckingAdventure : (typeof WordCheckingAdventure !== 'undefined' ? WordCheckingAdventure : null);
  }
  function renderSpellingQuestion() {
    const q = activeChallenge.questions[activeChallenge.currentIndex];
    const bodyEl = document.getElementById('advChallengeBody');
    const titleEl = document.getElementById('advChallengeTitle');
    const iconEl = document.getElementById('advChallengeModeIcon');
    const progressEl = document.getElementById('advChallengeProgressText');
    const pBar = document.getElementById('advChallengeProgressBar');
    iconEl.innerText = '✍️';
    titleEl.innerText = `第 ${activeChallenge.stageId} 關・拼字考驗`;
    progressEl.innerText = `第 ${activeChallenge.currentIndex + 1} / ${activeChallenge.questions.length} 題 ｜ 得分：${activeChallenge.score * 10}`;
    if (pBar) pBar.style.width = `${((activeChallenge.currentIndex + 1) / activeChallenge.questions.length) * 100}%`;
    const wordLen = q.word.length;
    const hint = q.word[0] + ' _'.repeat(wordLen - 1);
    bodyEl.innerHTML = `
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-center space-y-2 shadow-xs">
        <div class="text-xs text-slate-400 font-mono">請聽音並依中文提示拼出英文單字</div>
        <div class="text-2xl font-black text-slate-900 dark:text-white">
          ${escapeHtml(q.zh)}
        </div>
        <div class="text-xs font-mono text-amber-600 dark:text-amber-400">
          ${escapeHtml(q.pos || '')} ｜ 單字長度：${wordLen} 個字母
        </div>
        <div class="text-sm font-mono tracking-widest text-slate-500 dark:text-slate-300 pt-1">
          ${escapeHtml(hint)}
        </div>
        <div class="flex items-center justify-center gap-2">
          <span onclick="WordCheckingAdventure.playWordAudio('${escapeHtml(q.word.replace(/'/g, "\\'"))}')" class="audio-source-badge inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 border border-slate-200 dark:border-slate-600 shadow-2xs cursor-pointer hover:bg-slate-200 transition active:scale-95" title="點擊播放讀音">
            <span>🔊 待播放</span>
          </span>
          <button onclick="WordCheckingAdventure.playWordAudio('${escapeHtml(q.word.replace(/'/g, "\\'"))}')" class="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition cursor-pointer">
            🔊 重聽單字
          </button>
        </div>
      </div>
      <div class="space-y-3 pt-1">
        <input type="text" id="advSpellingInput" placeholder="請在此輸入英文拼寫..." class="w-full px-4 py-3 rounded-2xl border-2 border-indigo-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center text-lg tracking-wider focus:outline-none focus:border-indigo-500" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" onkeydown="if(event.key==='Enter') WordCheckingAdventure.submitSpellingAnswer()">
        <button onclick="WordCheckingAdventure.submitSpellingAnswer()" class="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition shadow-md cursor-pointer">
          確認送出 🐾
        </button>
      </div>
    `;
    playWordAudio(q.word);
    setTimeout(() => {
      const input = document.getElementById('advSpellingInput');
      if (input && typeof input.focus === "function") input.focus();
    }, 200);
  }
  function submitSpellingAnswer() {
    const input = document.getElementById('advSpellingInput');
    if (!input) return;
    const val = input.value.trim().toLowerCase();
    const q = activeChallenge.questions[activeChallenge.currentIndex];
    const isCorrect = (val === q.word.trim().toLowerCase());
    if (isCorrect) {
      input.className = 'w-full px-4 py-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-black text-center text-lg tracking-wider';
      activeChallenge.score++;
      appHooks.playMeowSound();
    } else {
      input.className = 'w-full px-4 py-3 rounded-2xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 font-black text-center text-lg tracking-wider';
      input.value = `${val} ❌ (正確：${q.word})`;
    }
    setTimeout(() => {
      activeChallenge.currentIndex++;
      if (activeChallenge.currentIndex < activeChallenge.questions.length) {
        renderSpellingQuestion();
      } else {
        finishStageChallenge(activeChallenge.score, activeChallenge.questions.length, activeChallenge.stageId);
      }
    }, 1300);
  }
  function finishStageChallenge(score, total, stageId) {
    stageId = stageId || activeChallenge.stageId;
    const challengeModal = document.getElementById('advChallengeModal');
    if (challengeModal) challengeModal.classList.add('hidden');
    const info = getStageInfo(stageId);
    const stars = calculateStars(score, total);
    const isPassed = stars > 0;
    const pct = Math.round((score / total) * 100);
    const prevStars = state.stageStars[stageId] || 0;
    if (stars > prevStars) {
      state.stageStars[stageId] = stars;
    }
    let isNewUnlock = false;
    if (isPassed && stageId === state.unlockedStage && stageId < TOTAL_STAGES) {
      state.unlockedStage = stageId + 1;
      isNewUnlock = true;
    }
    let fishReward = 0;
    if (stars === 3) fishReward = 5;
    else if (stars === 2) fishReward = 3;
    else if (stars === 1) fishReward = 2;
    let isBossBonus = false;
    if (info && info.isBoss && isPassed) {
      fishReward += 20;
      isBossBonus = true;
    }
    if (fishReward > 0) {
      appHooks.addFish(fishReward);
    }
    if (isPassed) {
      appHooks.addAffection(10);
      appHooks.playCheerSound();
    }
    saveAdventureProgress();
    renderAdventureMap();
    const victoryModal = document.getElementById('advVictoryModal');
    if (!victoryModal) return;
    const vTitle = document.getElementById('advVictoryTitle');
    const vSub = document.getElementById('advVictorySubtitle');
    const vIcon = document.getElementById('advVictoryIcon');
    const starsBox = document.getElementById('advVictoryStarsContainer');
    const scoreText = document.getElementById('advVictoryScoreText');
    const fishText = document.getElementById('advVictoryFishText');
    const bossBonusBox = document.getElementById('advVictoryBossBonusBox');
    const nextBtn = document.getElementById('advVictoryNextBtn');
    if (isPassed) {
      vTitle.innerText = stars === 3 ? '🎉 滿星大捷！完美通關！' : '🎉 恭喜通關！';
      vTitle.className = 'font-black text-xl text-amber-600 dark:text-amber-400 pt-2';
      vSub.innerText = `第 ${stageId} 關挑戰成功！`;
      vIcon.innerText = info.isBoss ? '👑' : '🏆';
      let starIconsHtml = '';
      for (let i = 1; i <= 3; i++) {
        if (i <= stars) {
          starIconsHtml += `<span class="star-pop-${i}">⭐</span>`;
        } else {
          starIconsHtml += `<span class="opacity-30">☆</span>`;
        }
      }
      starsBox.innerHTML = starIconsHtml;
      scoreText.innerText = `${score} / ${total} 題 (${pct}%)`;
      fishText.innerText = `+${fishReward} 條小魚乾 🐟`;
      if (isBossBonus && bossBonusBox) {
        bossBonusBox.classList.remove('hidden');
      } else if (bossBonusBox) {
        bossBonusBox.classList.add('hidden');
      }
      if (nextBtn) {
        if (stageId < TOTAL_STAGES) {
          nextBtn.innerText = '🐾 前進下一關';
          nextBtn.onclick = () => {
            closeVictoryModal();
            openStageModal(stageId + 1);
          };
        } else {
          nextBtn.innerText = '👑 登上傳奇頂峰！';
          nextBtn.onclick = closeVictoryModal;
        }
      }
      appHooks.saySpeech(`太厲害了！第 ${stageId} 關奪得 ${stars} 顆星！獲得 +${fishReward} 條小魚乾獎勵喵！🐾`, '關卡大捷');
    } else {
      vTitle.innerText = '差一點點就過關了喵！';
      vTitle.className = 'font-black text-xl text-slate-700 dark:text-slate-200 pt-2';
      vSub.innerText = '正確率需達 60% 才能通關，多複習一下再來挑戰！';
      vIcon.innerText = '😿';
      starsBox.innerHTML = '<span class="opacity-30">☆☆☆</span>';
      scoreText.innerText = `${score} / ${total} 題 (${pct}%)`;
      fishText.innerText = `+0 條小魚乾`;
      if (bossBonusBox) bossBonusBox.classList.add('hidden');
      if (nextBtn) {
        nextBtn.innerText = '🗺️ 返回地圖';
        nextBtn.onclick = closeVictoryModal;
      }
      appHooks.saySpeech('別灰心喵～先看看單字速記過目，咪咪相信妳一定可以通關的！🐾', '加油打氣');
    }
    victoryModal.classList.remove('hidden');
  }
  function closeVictoryModal() {
    const victoryModal = document.getElementById('advVictoryModal');
    if (victoryModal) victoryModal.classList.add('hidden');
  }
  function playAgain() {
    closeVictoryModal();
    startStageChallenge(activeChallenge.stageId, activeChallenge.type);
  }
  function nextStageOrMap() {
    closeVictoryModal();
  }
  function initAdventureMap(options) {
    options = options || {};
    if (options.rawVocabList) state.rawVocabList = options.rawVocabList;
    if (options.hooks) {
      appHooks = { ...appHooks, ...options.hooks };
    }
    if (typeof document !== 'undefined') {
      let styleTag = document.getElementById('adventureMapStyles');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'adventureMapStyles';
        styleTag.innerHTML = getAdventureStyles();
        document.head.appendChild(styleTag);
      }
    }
    loadAdventureProgress();
    renderAdventureMap();
  }
  return {
    ADVENTURE_WORLDS,
    TOTAL_STAGES,
    WORDS_PER_STAGE,
    getStageInfo,
    getStageWords,
    calculateStars,
    loadAdventureProgress,
    saveAdventureProgress,
    getAdventureSaveData,
    loadAdventureSaveData,
    resetAdventureProgress,
    initAdventureMap,
    renderAdventureMap,
    switchAdventureWorld,
    openStageModal,
    closeStageModal,
    playWordAudio,
    startStageChallenge,
    abortChallenge,
    prevFlashcard,
    nextFlashcard,
    selectQuizAnswer,
    submitSpellingAnswer,
    finishStageChallenge,
    closeVictoryModal,
    playAgain,
    nextStageOrMap,
    notifyLockedStage,
    getAdventureStyles
  };
}));
var WordCheckingAdventure = (typeof window !== 'undefined' && window.WordCheckingAdventure) ? window.WordCheckingAdventure : (typeof WordCheckingAdventure !== 'undefined' ? WordCheckingAdventure : null);