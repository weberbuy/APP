(function (global) {
  'use strict';
  const safeCancelAnim = (id) => {
    if (!id) return;
    try {
      if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id);
      else if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') window.cancelAnimationFrame(id);
      else clearTimeout(id);
    } catch(e) {}
  };
  const safeRequestAnim = (fn) => {
    try {
      if (typeof requestAnimationFrame === 'function') return requestAnimationFrame(fn);
      if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') return window.requestAnimationFrame(fn);
    } catch(e) {}
    return setTimeout(fn, 16);
  };
  const MAX_STACK_LAYERS = 5;
  const BASE_FALL_SECONDS = 18.0; // 悠閒放鬆的初始下落時間（給予充足時間看題與英打）
  const MAX_FALL_SECONDS = 25.0;  // 手速慢或長單字最慢可放緩至 25 秒
  const MIN_FALL_SECONDS = 8.0;   // 連擊高手最快仍保底 8 秒，絕不手忙腳亂
  let rainState = {
    isRunning: false,
    isPaused: false,
    hasPendingSync: false,
    score: 0,
    combo: 0,
    maxCombo: 0,
    clearedCount: 0,
    mimiEnergy: 0, // 0 - 100
    recentSpeeds: [], // recent word completion durations in ms
    activeBlock: null,
    stackedBlocks: [],
    lastFrameTime: 0,
    animFrameId: null
  };
  function sanitizeRainWord(rawWord) {
    if (!rawWord) return '';
    let s = String(rawWord).trim().toLowerCase();
    s = s.replace(/\(s\)/gi, 's');
    s = s.replace(/\([^)]*\)/g, '').trim();
    if (s.includes('/')) {
      s = s.split('/')[0].trim();
    }
    s = s.replace(/[?.!…,:;"~]/g, '').trim();
    s = s.replace(/\s+/g, ' ').trim();
    return s;
  }
  let bgmTimer = null;
  let bgmStep = 0;
  let isBgmEnabled = (localStorage.getItem('wordchecking_rain_bgm') !== 'false');
  const BGM_MELODY = [
    { freq: 659.25, dur: 0.22 }, // E5
    { freq: 493.88, dur: 0.11 }, // B4
    { freq: 523.25, dur: 0.11 }, // C5
    { freq: 587.33, dur: 0.22 }, // D5
    { freq: 523.25, dur: 0.11 }, // C5
    { freq: 493.88, dur: 0.11 }, // B4
    { freq: 440.00, dur: 0.22 }, // A4
    { freq: 440.00, dur: 0.11 }, // A4
    { freq: 523.25, dur: 0.11 }, // C5
    { freq: 659.25, dur: 0.22 }, // E5
    { freq: 587.33, dur: 0.11 }, // D5
    { freq: 523.25, dur: 0.11 }, // C5
    { freq: 493.88, dur: 0.33 }, // B4
    { freq: 523.25, dur: 0.11 }, // C5
    { freq: 587.33, dur: 0.22 }, // D5
    { freq: 659.25, dur: 0.22 }, // E5
    { freq: 523.25, dur: 0.22 }, // C5
    { freq: 440.00, dur: 0.22 }, // A4
    { freq: 440.00, dur: 0.22 }, // A4
    { freq: 0, dur: 0.11 },      // Rest
    { freq: 587.33, dur: 0.22 }, // D5
    { freq: 698.46, dur: 0.11 }, // F5
    { freq: 880.00, dur: 0.22 }, // A5
    { freq: 783.99, dur: 0.11 }, // G5
    { freq: 698.46, dur: 0.11 }, // F5
    { freq: 659.25, dur: 0.33 }, // E5
    { freq: 523.25, dur: 0.11 }, // C5
    { freq: 659.25, dur: 0.22 }, // E5
    { freq: 587.33, dur: 0.11 }, // D5
    { freq: 523.25, dur: 0.11 }, // C5
    { freq: 493.88, dur: 0.22 }, // B4
    { freq: 493.88, dur: 0.11 }, // B4
    { freq: 523.25, dur: 0.11 }, // C5
    { freq: 587.33, dur: 0.22 }, // D5
    { freq: 659.25, dur: 0.22 }, // E5
    { freq: 523.25, dur: 0.22 }, // C5
    { freq: 440.00, dur: 0.22 }, // A4
    { freq: 440.00, dur: 0.22 }  // A4
  ];
  function getAudioContext() {
    if (typeof getSharedAudioContext === 'function') {
      return getSharedAudioContext();
    }
    if (typeof window !== 'undefined') {
      if (!window.__wcAudioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) window.__wcAudioCtx = new Ctx();
      }
      if (window.__wcAudioCtx && window.__wcAudioCtx.state === 'suspended') {
        window.__wcAudioCtx.resume().catch(() => {});
      }
      return window.__wcAudioCtx;
    }
    return null;
  }
  function playBgmNote(freq, duration) {
    if (!freq || freq <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      const peakVol = 0.14;
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(peakVol, now + 0.01);
      gain.gain.setValueAtTime(peakVol * 0.85, now + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch(e) {}
  }
  function tickBgm() {
    if (!rainState.isRunning || rainState.isPaused || !isBgmEnabled) return;
    const item = BGM_MELODY[bgmStep];
    bgmStep = (bgmStep + 1) % BGM_MELODY.length;
    playBgmNote(item.freq, item.dur);
    bgmTimer = setTimeout(tickBgm, item.dur * 1000);
  }
  function startBgm() {
    stopBgm();
    if (!isBgmEnabled) return;
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    bgmStep = 0;
    tickBgm();
    updateBgmUI();
  }
  function stopBgm() {
    if (bgmTimer) {
      clearTimeout(bgmTimer);
      bgmTimer = null;
    }
  }
  function toggleBgm() {
    getAudioContext();
    isBgmEnabled = !isBgmEnabled;
    localStorage.setItem('wordchecking_rain_bgm', isBgmEnabled);
    updateBgmUI();
    if (isBgmEnabled && rainState.isRunning && !rainState.isPaused) {
      startBgm();
    } else {
      stopBgm();
    }
  }
  function updateBgmUI() {
    const textEl = document.getElementById('rainBgmText');
    if (textEl) {
      textEl.innerText = isBgmEnabled ? '音樂: 開' : '音樂: 關';
    }
  }
  function flushRainSyncToPi() {
    if (rainState.hasPendingSync) {
      rainState.hasPendingSync = false;
      if (typeof triggerAutoSaveToPi === 'function') {
        console.log("[WordChecking Rain] 觸發方塊雨關鍵節點進度同步上傳至樹莓派...");
        triggerAutoSaveToPi();
      }
    }
  }
  function markPendingSync() {
    rainState.hasPendingSync = true;
  }
  function isRainRunning() {
    return !!(rainState && rainState.isRunning && !rainState.isPaused);
  }
  function togglePause() {
    if (!rainState.isRunning) return;
    if (rainState.isPaused) {
      rainState.isPaused = false;
      rainState.lastFrameTime = 0; // 重置時間戳，避免恢復後時間差跳躍導致方塊瞬移下墜
      const pauseOverlay = document.getElementById('rainPauseOverlay');
      if (pauseOverlay) pauseOverlay.classList.add('hidden');
      const pauseIcon = document.getElementById('rainPauseIcon');
      const pauseText = document.getElementById('rainPauseText');
      if (pauseIcon) pauseIcon.innerText = '⏸️';
      if (pauseText) pauseText.innerText = '暫停';
      safeCancelAnim(rainState.animFrameId);
      rainState.animFrameId = safeRequestAnim(rainLoop);
      if (isBgmEnabled) startBgm();
      if (typeof sayCatSpeech === 'function') {
        sayCatSpeech("▶️ 遊戲繼續！單字方塊雨恢復下落囉，加油喵！🐾", "戰力恢復");
      }
    } else {
      rainState.isPaused = true;
      safeCancelAnim(rainState.animFrameId);
      stopBgm();
      const pauseOverlay = document.getElementById('rainPauseOverlay');
      if (pauseOverlay) pauseOverlay.classList.remove('hidden');
      const pauseIcon = document.getElementById('rainPauseIcon');
      const pauseText = document.getElementById('rainPauseText');
      if (pauseIcon) pauseIcon.innerText = '▶️';
      if (pauseText) pauseText.innerText = '繼續';
      if (typeof sayCatSpeech === 'function') {
        sayCatSpeech("⏸️ 單字方塊已暫停！喝口水休息一下，準備好按繼續隨時開打喵～🐾", "休息一下");
      }
      flushRainSyncToPi(); // 暫停時自動將累積成果同步備份至樹莓派
    }
  }
  function playSound(type) {
    if (typeof playCatMeowSound === 'function' && (type === 'meow' || type === 'clear')) {
      playCatMeowSound();
    }
  }
  function getDynamicDuration(targetWord) {
    let dur = BASE_FALL_SECONDS;
    const wordLen = (targetWord || '').length;
    if (wordLen > 4) {
      dur += (wordLen - 4) * 0.8;
    }
    if (rainState.recentSpeeds && rainState.recentSpeeds.length > 0) {
      const avgMs = rainState.recentSpeeds.reduce((a, b) => a + b, 0) / rainState.recentSpeeds.length;
      if (avgMs < 2500) {
        dur -= 2.0;
      } else if (avgMs > 6000) {
        dur += 3.0;
      }
    }
    const streakBonus = Math.min(3.0, (rainState.combo || 0) * 0.3);
    dur -= streakBonus;
    return Math.max(MIN_FALL_SECONDS, Math.min(MAX_FALL_SECONDS, dur));
  }
  function spawnNextRainBlock() {
    if (!rainState.isRunning || rainState.isPaused) return;
    let list = [];
    if (typeof filteredList !== 'undefined' && Array.isArray(filteredList) && filteredList.length > 0) {
      list = filteredList;
    } else if (typeof window !== 'undefined' && Array.isArray(window.filteredList) && window.filteredList.length > 0) {
      list = window.filteredList;
    } else if (typeof window !== 'undefined' && typeof window.getStudyList === 'function' && window.getStudyList() && window.getStudyList().length > 0) {
      list = window.getStudyList();
    } else if (typeof RAW_VOCAB !== 'undefined' && Array.isArray(RAW_VOCAB) && RAW_VOCAB.length > 0) {
      list = RAW_VOCAB;
    } else if (typeof globalThis !== 'undefined' && Array.isArray(globalThis.RAW_VOCAB) && globalThis.RAW_VOCAB.length > 0) {
      list = globalThis.RAW_VOCAB;
    } else if (typeof window !== 'undefined' && Array.isArray(window.RAW_VOCAB) && window.RAW_VOCAB.length > 0) {
      list = window.RAW_VOCAB;
    }
    if (!list || list.length === 0) return;
    const target = list[Math.floor(Math.random() * list.length)];
    const wordClean = sanitizeRainWord(target.word);
    let options = [target];
    const pool = list.filter(x => x !== target && sanitizeRainWord(x.word) !== wordClean);
    const learnedDistractors = pool.filter(x => {
      const st = (typeof userProgress !== 'undefined' && userProgress) ? userProgress[x.word || x.num] : null;
      return st === 'mastered' || st === 'familiar';
    }).sort(() => Math.random() - 0.5);
    for (let d of learnedDistractors) {
      if (options.length >= 4) break;
      if (!options.some(o => o.word === d.word)) options.push(d);
    }
    if (options.length < 4) {
      const rem = pool.filter(x => !options.some(o => o.word === x.word)).sort(() => Math.random() - 0.5);
      for (let d of rem) {
        if (options.length >= 4) break;
        options.push(d);
      }
    }
    options.sort(() => Math.random() - 0.5);
    const fallDuration = getDynamicDuration(wordClean);
    rainState.activeBlock = {
      target,
      word: wordClean,
      wordClean,
      options,
      typed: '',
      topPx: 0,
      fallDuration,
      spawnTime: Date.now()
    };
    renderActiveRainBlock();
    updateRainDashboardUI();
    if (typeof playVoiceText === 'function') {
      playVoiceText(target.word);
    }
  }
  function renderActiveRainBlock() {
    const activeEl = document.getElementById('rainActiveBlock');
    if (!activeEl) return;
    if (!rainState.activeBlock) {
      activeEl.classList.add('hidden');
      return;
    }
    const b = rainState.activeBlock;
    activeEl.classList.remove('hidden');
    activeEl.style.top = Math.round(b.topPx || 0) + 'px';
    const target = b.wordClean;
    const typed = b.typed;
    let lettersHtml = '';
    for (let i = 0; i < target.length; i++) {
      const targetChar = target[i];
      const isSpace = (targetChar === ' ');
      if (i < typed.length) {
        if (isSpace) {
          lettersHtml += `<span class="inline-block w-3 sm:w-4 border-b-2 border-emerald-400 mx-0.5 text-center text-xs text-emerald-300">␣</span>`;
        } else {
          lettersHtml += `<span class="px-1 font-black text-emerald-400 border-b-2 border-emerald-400">${targetChar}</span>`;
        }
      } else {
        if (isSpace) {
          lettersHtml += `<span class="inline-block w-3 sm:w-4 border-b-2 border-dashed border-slate-600 mx-0.5 text-center text-xs text-slate-500">␣</span>`;
        } else if (targetChar === '.' || targetChar === "'") {
          lettersHtml += `<span class="px-0.5 text-slate-400 border-b-2 border-slate-600 font-bold font-mono">${targetChar}</span>`;
        } else {
          lettersHtml += `<span class="px-1 text-slate-500 border-b-2 border-slate-600">_</span>`;
        }
      }
    }
    const optionsHtml = b.options.map((opt, idx) => {
      const optClean = sanitizeRainWord(opt.word);
      const isTarget = (opt === b.target) || (optClean === b.wordClean);
      const isMatchingPrefix = optClean.startsWith(b.typed) && b.typed.length > 0;
      let badgeStyle = "bg-slate-800/90 text-slate-300 border-slate-700";
      if (isMatchingPrefix && isTarget) {
        badgeStyle = "bg-emerald-950/90 text-emerald-300 border-emerald-500 animate-pulse";
      }
      return `<button onclick="WordCheckingRain.handleOptionClick(${idx})" class="px-2.5 py-1 rounded-xl border text-xs font-mono font-bold transition ${badgeStyle}">
        <span class="text-amber-400 font-sans mr-1">${['A', 'B', 'C', 'D'][idx]}</span>${opt.word}
      </button>`;
    }).join('');
    activeEl.innerHTML = `
      <div class="bg-gradient-to-r from-slate-900/95 via-indigo-950/95 to-slate-900/95 border-2 border-indigo-400/80 rounded-2xl p-3 shadow-xl backdrop-blur max-w-sm mx-auto text-center transform transition-transform">
        <div class="flex items-center justify-between text-[11px] text-indigo-300 mb-1">
          <div class="flex items-center gap-1.5">
            <span class="font-bold">🐾 ${b.target.pos ? '(' + b.target.pos + ')' : '核心單字'}</span>
            <button onclick="WordCheckingRain.replayCurrentAudio(event)" class="px-2 py-0.5 rounded-lg bg-indigo-900/90 hover:bg-indigo-800 text-amber-300 text-[10px] font-bold transition flex items-center gap-1 border border-indigo-700/60 cursor-pointer shadow-2xs" title="重聽單字發音 (快速鍵: Tab)">
              <span>🔊</span><span>重聽</span>
            </button>
          </div>
          <span class="font-mono text-[10px] text-amber-400">⚡ ${b.fallDuration.toFixed(1)}s</span>
        </div>
        <div class="text-lg sm:text-xl font-black text-amber-300 tracking-wide py-0.5">${b.target.chinese || b.target.zh || ''}</div>
        <div class="text-base sm:text-lg font-mono tracking-widest my-1 py-1 px-3 bg-slate-950/60 rounded-xl inline-block border border-slate-800">${lettersHtml}</div>
        <div class="grid grid-cols-2 gap-1.5 pt-1">${optionsHtml}</div>
      </div>
    `;
  }
  function renderStackedBlocks() {
    const stackContainer = document.getElementById('rainStackedContainer');
    if (!stackContainer) return;
    stackContainer.innerHTML = rainState.stackedBlocks.map((blk, idx) => `
      <div class="h-8 bg-slate-800/90 border border-slate-700 rounded-xl px-3 flex items-center justify-between text-xs text-slate-400 animate-fade-in shadow">
        <span class="font-bold text-slate-300">${blk.chinese || blk.word}</span>
        <span class="font-mono font-semibold text-rose-400">${blk.word}</span>
        <span class="text-[10px] text-slate-500">🧱 第 ${idx + 1} 層</span>
      </div>
    `).join('');
  }
  function updateRainDashboardUI() {
    const scoreEl = document.getElementById('rainScore');
    const comboEl = document.getElementById('rainCombo');
    const stackEl = document.getElementById('rainStackCount');
    const mimiBar = document.getElementById('rainMimiEnergyBar');
    const mimiBtn = document.getElementById('rainMimiSkillBtn');
    if (scoreEl) scoreEl.innerText = rainState.score;
    if (comboEl) {
      if (rainState.combo >= 2) {
        comboEl.innerText = `🔥 連擊 x${rainState.combo}`;
        comboEl.classList.remove('hidden');
      } else {
        comboEl.classList.add('hidden');
      }
    }
    if (stackEl) stackEl.innerText = `${rainState.stackedBlocks.length} / ${MAX_STACK_LAYERS}`;
    if (mimiBar) mimiBar.style.width = `${rainState.mimiEnergy}%`;
    if (mimiBtn) {
      if (rainState.mimiEnergy >= 100) {
        mimiBtn.disabled = false;
        mimiBtn.className = "px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 text-white font-black text-[10px] shadow-md animate-bounce cursor-pointer";
        mimiBtn.innerText = "🐾 貓爪清行 (按 Enter / 空白鍵)";
      } else {
        mimiBtn.disabled = true;
        mimiBtn.className = "px-3 py-1 rounded-xl bg-slate-800 text-slate-500 font-bold text-[10px] transition cursor-not-allowed";
        mimiBtn.innerText = `🐾 咪咪大招 (${rainState.mimiEnergy}%)`;
      }
    }
  }
  function handleWordEliminated() {
    const b = rainState.activeBlock;
    if (!b) return;
    const duration = Date.now() - b.spawnTime;
    rainState.recentSpeeds.push(duration);
    if (rainState.recentSpeeds.length > 3) rainState.recentSpeeds.shift();
    rainState.combo++;
    if (rainState.combo > rainState.maxCombo) rainState.maxCombo = rainState.combo;
    const points = 10 * rainState.combo;
    rainState.score += points;
    rainState.clearedCount++;
    rainState.mimiEnergy = Math.min(100, rainState.mimiEnergy + 25);
    if (window.WordCheckingCruise && window.WordCheckingCruise.isActive() && b && b.target) {
      window.WordCheckingCruise.reportItemSuccess(b.target.word);
    }
    if (typeof addFish === 'function') addFish(1, true); // 遊戲進行中暫緩即時上傳樹莓派
    rainState.hasPendingSync = true;
    playSound('clear');
    const activeEl = document.getElementById('rainActiveBlock');
    if (activeEl) {
      activeEl.classList.add('scale-110', 'opacity-0');
    }
    if (typeof userProgress !== 'undefined' && typeof THEME_REGISTRY !== 'undefined' && typeof currentThemeKey !== 'undefined') {
      const key = b.target.word || b.target.num;
      const theme = THEME_REGISTRY[currentThemeKey];
      if (userProgress[key] !== 'mastered') userProgress[key] = 'familiar';
      localStorage.setItem(theme.storageKey, JSON.stringify(userProgress));
      if (typeof renderStats === 'function') renderStats();
    }
    setTimeout(() => {
      rainState.activeBlock = null;
      if (activeEl) activeEl.classList.remove('scale-110', 'opacity-0');
      spawnNextRainBlock();
    }, 180);
  }
  function handleBlockLanded() {
    const b = rainState.activeBlock;
    if (!b) return;
    rainState.combo = 0;
    rainState.stackedBlocks.unshift({
      word: b.target.word || b.wordClean,
      chinese: b.target.chinese || b.target.zh || ''
    });
    if (typeof userProgress !== 'undefined' && typeof THEME_REGISTRY !== 'undefined' && typeof currentThemeKey !== 'undefined') {
      const key = b.target.word || b.target.num;
      const theme = THEME_REGISTRY[currentThemeKey];
      userProgress[key] = 'weak';
      localStorage.setItem(theme.storageKey, JSON.stringify(userProgress));
      if (typeof renderStats === 'function') renderStats();
      rainState.hasPendingSync = true; // 標記待同步
    }
    if (window.WordCheckingCruise && window.WordCheckingCruise.isActive() && b && b.target) {
      window.WordCheckingCruise.reportItemFailure(b.target.word);
    }
    renderStackedBlocks();
    updateRainDashboardUI();
    if (rainState.stackedBlocks.length >= MAX_STACK_LAYERS) {
      triggerGameOver();
      return;
    }
    rainState.activeBlock = null;
    spawnNextRainBlock();
  }
  function triggerGameOver() {
    rainState.isRunning = false;
    rainState.isPaused = false;
    safeCancelAnim(rainState.animFrameId);
    stopBgm();
    const pauseOverlay = document.getElementById('rainPauseOverlay');
    if (pauseOverlay) pauseOverlay.classList.add('hidden');
    const modal = document.getElementById('rainGameOverModal');
    if (modal) {
      document.getElementById('rainFinalScore').innerText = rainState.score;
      document.getElementById('rainFinalCleared').innerText = rainState.clearedCount;
      document.getElementById('rainFinalMaxCombo').innerText = rainState.maxCombo;
      const cruiseBtn = document.getElementById('rainCruiseResumeBtn');
      if (cruiseBtn) {
        if (window.WordCheckingCruise && window.WordCheckingCruise.isActive()) {
          cruiseBtn.classList.remove('hidden');
        } else {
          cruiseBtn.classList.add('hidden');
        }
      }
      modal.classList.remove('hidden');
    }
    if (typeof sayCatSpeech === 'function') {
      sayCatSpeech(`方塊雨堆滿囉！本次得分 ${rainState.score} 分，擊破 ${rainState.clearedCount} 個單字，咪咪幫妳把未完成的單字記在加強本了喵～🐾`, "測驗結算");
    }
    flushRainSyncToPi(); // 遊戲結束結算時自動將戰果同步備份至樹莓派
  }
  function useMimiClawSkill() {
    if (rainState.isPaused || rainState.mimiEnergy < 100 || rainState.stackedBlocks.length === 0) return;
    rainState.stackedBlocks.pop();
    rainState.mimiEnergy = 0;
    renderStackedBlocks();
    updateRainDashboardUI();
    playSound('meow');
    if (typeof sayCatSpeech === 'function') {
      sayCatSpeech("🐾 咪咪大招！貓爪橫掃震碎底部石化磚塊！喘口氣繼續加油喵！🔥", "施展絕技");
    }
  }
  function handleRainKeydown(e) {
    if (!rainState.isRunning) return;
    if (e.code === 'Escape' || e.key === 'Escape') {
      e.preventDefault();
      togglePause();
      return;
    }
    if (rainState.isPaused) return;
    const b = rainState.activeBlock;
    if (!b) return;
    if (e.code === 'Tab') {
      e.preventDefault();
      if (typeof playVoiceText === 'function') {
        playVoiceText(b.target.word);
      }
      return;
    }
    if (e.code === 'Enter') {
      e.preventDefault();
      if (rainState.mimiEnergy >= 100) {
        useMimiClawSkill();
      }
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (b.typed && b.typed.length > 0) {
        b.typed = b.typed.slice(0, -1);
        renderActiveRainBlock();
      }
      return;
    }
    const expectedChar = b.wordClean[b.typed.length];
    if (e.code === 'Space') {
      e.preventDefault();
      if (expectedChar === ' ') {
        b.typed += ' ';
        renderActiveRainBlock();
        if (b.typed.length === b.wordClean.length) {
          handleWordEliminated();
        }
      } else if (expectedChar === 's' && b.wordClean[b.typed.length + 1] === ' ') {
        b.typed += 's ';
        renderActiveRainBlock();
        if (b.typed.length === b.wordClean.length) {
          handleWordEliminated();
        }
      } else if (rainState.mimiEnergy >= 100) {
        useMimiClawSkill();
      }
      return;
    }
    if (['1', '2', '3', '4'].includes(e.key) && expectedChar !== e.key) {
      e.preventDefault();
      handleOptionClick(parseInt(e.key, 10) - 1);
      return;
    }
    if (e.key && /[?.!…,:;"~()]/.test(e.key) && expectedChar !== e.key) {
      return;
    }
    if (e.key && e.key.length === 1 && /[a-zA-Z0-9\.\'\-]/.test(e.key)) {
      const keyLower = e.key.toLowerCase();
      if (expectedChar === ' ' && b.wordClean[b.typed.length + 1] === keyLower) {
        b.typed += ' ' + keyLower;
        renderActiveRainBlock();
        if (b.typed.length === b.wordClean.length) {
          handleWordEliminated();
        }
        return;
      }
      if (expectedChar === '-' && keyLower !== '-' && b.wordClean[b.typed.length + 1] === keyLower) {
        b.typed += '-' + keyLower;
        renderActiveRainBlock();
        if (b.typed.length === b.wordClean.length) {
          handleWordEliminated();
        }
        return;
      }
      if (expectedChar === '.' && keyLower !== '.' && b.wordClean[b.typed.length + 1] === keyLower) {
        b.typed += '.' + keyLower;
        renderActiveRainBlock();
        if (b.typed.length === b.wordClean.length) {
          handleWordEliminated();
        }
        return;
      }
      if (expectedChar === "'" && keyLower !== "'" && b.wordClean[b.typed.length + 1] === keyLower) {
        b.typed += "'" + keyLower;
        renderActiveRainBlock();
        if (b.typed.length === b.wordClean.length) {
          handleWordEliminated();
        }
        return;
      }
      if (keyLower === expectedChar) {
        b.typed += keyLower;
        renderActiveRainBlock();
        if (b.typed.length === b.wordClean.length) {
          handleWordEliminated();
        }
      } else {
        const activeEl = document.getElementById('rainActiveBlock');
        if (activeEl) {
          activeEl.classList.add('animate-shake');
          setTimeout(() => activeEl.classList.remove('animate-shake'), 200);
        }
      }
    }
  }
  function handleOptionClick(optParam) {
    if (!rainState.isRunning || rainState.isPaused || !rainState.activeBlock) return;
    const b = rainState.activeBlock;
    let chosen = null;
    if (typeof optParam === 'number') {
      chosen = b.options[optParam];
    } else if (typeof optParam === 'string') {
      const s = sanitizeRainWord(optParam);
      chosen = b.options.find(o => sanitizeRainWord(o.word) === s || (o.word || '').trim().toLowerCase() === optParam.trim().toLowerCase());
    }
    if (!chosen) return;
    const isMatch = (chosen === b.target) ||
      (sanitizeRainWord(chosen.word) === b.wordClean) ||
      ((chosen.word || '').trim().toLowerCase() === (b.target.word || '').trim().toLowerCase());
    if (isMatch) {
      b.typed = b.wordClean;
      renderActiveRainBlock();
      handleWordEliminated();
    } else {
      const activeEl = document.getElementById('rainActiveBlock');
      if (activeEl) {
        activeEl.classList.add('animate-shake');
        setTimeout(() => activeEl.classList.remove('animate-shake'), 200);
      }
    }
  }
  function rainLoop(timestamp) {
    if (!rainState.isRunning || rainState.isPaused) return;
    if (!rainState.lastFrameTime) rainState.lastFrameTime = timestamp;
    const deltaMs = timestamp - rainState.lastFrameTime;
    rainState.lastFrameTime = timestamp;
    if (rainState.activeBlock) {
      const playfield = document.getElementById('rainPlayfield');
      const activeEl = document.getElementById('rainActiveBlock');
      const stackContainer = document.getElementById('rainStackedContainer');
      const playfieldH = playfield ? playfield.clientHeight : 520;
      const activeH = (activeEl && activeEl.offsetHeight > 0) ? activeEl.offsetHeight : 140;
      const stackH = (stackContainer && stackContainer.offsetHeight > 0) ? stackContainer.offsetHeight : (rainState.stackedBlocks.length * 38);
      const maxTopPx = Math.max(0, playfieldH - 12 - stackH - activeH - 6);
      const fallSpeedPxPerMs = maxTopPx / (rainState.activeBlock.fallDuration * 1000);
      rainState.activeBlock.topPx = (rainState.activeBlock.topPx || 0) + (fallSpeedPxPerMs * deltaMs);
      if (rainState.activeBlock.topPx >= maxTopPx) {
        rainState.activeBlock.topPx = maxTopPx;
        if (activeEl) activeEl.style.top = maxTopPx + 'px';
        handleBlockLanded();
      } else {
        if (activeEl) {
          activeEl.style.top = Math.round(rainState.activeBlock.topPx) + 'px';
        }
      }
    }
    rainState.animFrameId = safeRequestAnim(rainLoop);
  }
  function startWordRain() {
    getAudioContext();
    rainState.isRunning = true;
    rainState.isPaused = false;
    rainState.score = 0;
    rainState.combo = 0;
    rainState.maxCombo = 0;
    rainState.clearedCount = 0;
    rainState.mimiEnergy = 0;
    rainState.recentSpeeds = [];
    rainState.activeBlock = null;
    rainState.stackedBlocks = [];
    rainState.lastFrameTime = 0;
    const startScreen = document.getElementById('rainStartScreen');
    if (startScreen) startScreen.classList.add('hidden');
    const pauseOverlay = document.getElementById('rainPauseOverlay');
    if (pauseOverlay) pauseOverlay.classList.add('hidden');
    const pauseIcon = document.getElementById('rainPauseIcon');
    const pauseText = document.getElementById('rainPauseText');
    if (pauseIcon) pauseIcon.innerText = '⏸️';
    if (pauseText) pauseText.innerText = '暫停';
    const modal = document.getElementById('rainGameOverModal');
    if (modal) modal.classList.add('hidden');
    renderStackedBlocks();
    updateRainDashboardUI();
    spawnNextRainBlock();
    safeCancelAnim(rainState.animFrameId);
    rainState.animFrameId = safeRequestAnim(rainLoop);
    startBgm();
    if (typeof sayCatSpeech === 'function') {
      sayCatSpeech("🧱 俄羅斯單字雨啟動！看中文敲鍵盤拼出英文，隨時可按暫停喘口氣喵！🐾", "熱血闖關");
    }
  }
  function stopWordRain() {
    rainState.isRunning = false;
    rainState.isPaused = false;
    safeCancelAnim(rainState.animFrameId);
    stopBgm();
    const activeEl = document.getElementById('rainActiveBlock');
    if (activeEl) activeEl.classList.add('hidden');
    const pauseOverlay = document.getElementById('rainPauseOverlay');
    if (pauseOverlay) pauseOverlay.classList.add('hidden');
    flushRainSyncToPi(); // 離開方塊雨或切換模式時自動同步
  }
  function initWordRain() {
    rainState.isRunning = false;
    rainState.isPaused = false;
    safeCancelAnim(rainState.animFrameId);
    stopBgm();
    updateBgmUI();
    const startScreen = document.getElementById('rainStartScreen');
    if (startScreen) startScreen.classList.remove('hidden');
    const pauseOverlay = document.getElementById('rainPauseOverlay');
    if (pauseOverlay) pauseOverlay.classList.add('hidden');
    const pauseIcon = document.getElementById('rainPauseIcon');
    const pauseText = document.getElementById('rainPauseText');
    if (pauseIcon) pauseIcon.innerText = '⏸️';
    if (pauseText) pauseText.innerText = '暫停';
    const modal = document.getElementById('rainGameOverModal');
    if (modal) modal.classList.add('hidden');
    const activeEl = document.getElementById('rainActiveBlock');
    if (activeEl) activeEl.classList.add('hidden');
    renderStackedBlocks();
    updateRainDashboardUI();
    if (typeof sayCatSpeech === 'function') {
      sayCatSpeech("🧱 單字方塊雨擂台！準備好後點擊【開始遊戲】迎接挑戰喵～🐾", "準備闖關");
    }
  }
  const RainAPI = {
    initWordRain,
    startWordRain,
    stopWordRain,
    togglePause,
    flushRainSyncToPi,
    markPendingSync,
    isRainRunning,
    toggleBgm,
    useMimiClawSkill,
    replayCurrentAudio: (e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      if (rainState.activeBlock && typeof playVoiceText === 'function') {
        playVoiceText(rainState.activeBlock.target.word);
      }
    },
    handleOptionClick,
    handleRainKeydown,
    sanitizeRainWord,
    get isRunning() { return rainState.isRunning; },
    get isPaused() { return rainState.isPaused; },
    get activeBlock() { return rainState.activeBlock; },
    get score() { return rainState.score; },
    get mimiSkillEnergy() { return rainState.mimiEnergy; },
    set mimiSkillEnergy(v) { rainState.mimiEnergy = v; },
    get mimiEnergy() { return rainState.mimiEnergy; },
    set mimiEnergy(v) { rainState.mimiEnergy = v; },
    get stackedBlocks() { return rainState.stackedBlocks; },
    set stackedBlocks(v) { rainState.stackedBlocks = v; },
    handleKeyPress: (e) => handleRainKeydown(e)
  };
  if (typeof window !== 'undefined') window.WordCheckingRain = RainAPI;
  if (typeof globalThis !== 'undefined') globalThis.WordCheckingRain = RainAPI;
  if (typeof global !== 'undefined') global.WordCheckingRain = RainAPI;
  document.addEventListener('keydown', (e) => {
    if (typeof getActiveMode === 'function' && getActiveMode() === 'rain') {
      handleRainKeydown(e);
    }
  });
})(typeof window !== 'undefined' ? window : this);