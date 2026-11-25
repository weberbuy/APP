    const WARDROBE_STORAGE_KEY = 'wordchecking_cat_wardrobe_v1';
    const WARDROBE_MANIFEST_URL = './data/wardrobe/manifest.json';
    const WARDROBE_SLOTS = ['head', 'face', 'neck', 'outfit', 'hand', 'aura'];
    const WARDROBE_NEW_DAYS = 14;
    const WARDROBE_MAX_PRESETS = 4;

    function escapeWardrobeHtml(str) {
      return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // Minimal built-in fallback so offline / file:// usage never breaks before external packs load
    const BUILTIN_WARDROBE_ITEMS = [
      { id: 'head_none', slot: 'head', name: '無飾品', icon: '🚫', desc: '純真自然小貓樣貌', unlockType: 'free', price: 0, reqLevel: 1, releaseDate: '2025-01-01', reaction: '', svg: '' },
      { id: 'head_sakura', slot: 'head', name: '🌸 櫻花小花飾', icon: '🌸', desc: '【Lv.1 免費】粉嫩櫻花初春氣息', unlockType: 'level', price: 0, reqLevel: 1, releaseDate: '2025-01-01', reaction: '喵～耳朵邊夾了小櫻花，有沒有像花仙子一樣漂亮呀？🌸🐾', svg: '<g id="acc_head_sakura" transform="rotate(14 -82.12 355.02)"><g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))"><path fill="#22c55e" stroke="#15803d" stroke-width=".5" d="M4 4q7 4 4 8-5-3-4-8"/><g><path fill="#f472b6" stroke="#fb7185" stroke-width=".5" d="M0-1c-4-3-6-9-2-10 1.5 0 2 2 2 2s.5-2 2-2c4 1 2 7-2 10"/><g transform="rotate(72)"><path fill="#f472b6" stroke="#fb7185" stroke-width=".5" d="M0-1c-4-3-6-9-2-10 1.5 0 2 2 2 2s.5-2 2-2c4 1 2 7-2 10"/></g><g transform="rotate(144)"><path fill="#f472b6" stroke="#fb7185" stroke-width=".5" d="M0-1c-4-3-6-9-2-10 1.5 0 2 2 2 2s.5-2 2-2c4 1 2 7-2 10"/></g><g transform="rotate(216)"><path fill="#f472b6" stroke="#fb7185" stroke-width=".5" d="M0-1c-4-3-6-9-2-10 1.5 0 2 2 2 2s.5-2 2-2c4 1 2 7-2 10"/></g><g transform="rotate(288)"><path fill="#f472b6" stroke="#fb7185" stroke-width=".5" d="M0-1c-4-3-6-9-2-10 1.5 0 2 2 2 2s.5-2 2-2c4 1 2 7-2 10"/></g></g><circle r="2.6" fill="#fef08a" stroke="#eab308" stroke-width=".4"/></g></g>' },
      { id: 'face_none', slot: 'face', name: '無飾品', icon: '🚫', desc: '清秀乾淨的小臉龐', unlockType: 'free', price: 0, reqLevel: 1, releaseDate: '2025-01-01', reaction: '', svg: '' },
      { id: 'face_blush', slot: 'face', name: '✨ 星光微醺腮紅', icon: '✨', desc: '【Lv.1 免費】臉頰閃爍害羞星芒', unlockType: 'level', price: 0, reqLevel: 1, releaseDate: '2025-01-01', reaction: '喵...臉紅紅的被妳發現了！因為妳今天背單字好認真嘛～✨', svg: '<g id="acc_face_blush"><ellipse cx="38" cy="61" fill="#fb7185" opacity=".45" rx="6.5" ry="3.5"/><ellipse cx="82" cy="61" fill="#fb7185" opacity=".45" rx="6.5" ry="3.5"/></g>' },
      { id: 'neck_none', slot: 'neck', name: '無飾品', icon: '🚫', desc: '輕便舒適無束縛', unlockType: 'free', price: 0, reqLevel: 1, releaseDate: '2025-01-01', reaction: '', svg: '' },
      { id: 'neck_bell', slot: 'neck', name: '🔔 招財黃金鈴鐺', icon: '🔔', desc: '【Lv.1 免費】走動叮噹作響帶來好運', unlockType: 'level', price: 0, reqLevel: 1, releaseDate: '2025-01-01', reaction: '叮噹～叮噹～聽到了嗎？這是小魚乾快要來敲門的聲音喵！🔔', svg: '<g id="acc_neck_bell"><path fill="none" stroke="#dc2626" stroke-linecap="round" stroke-width="4.2" d="M41 75q19 9 38 0"/><circle cx="60" cy="83" r="5.5" fill="#facc15" stroke="#ca8a04" stroke-width="1"/><circle cx="60" cy="84" r="1.5" fill="#78350f"/></g>' },
      { id: 'outfit_none', slot: 'outfit', name: '自然毛皮', icon: '🚫', desc: '柔軟三花貓毛皮與白襪肉球', unlockType: 'free', price: 0, reqLevel: 1, releaseDate: '2025-01-01', reaction: '', svg: '' },
      { id: 'hand_none', slot: 'hand', name: '雙手空空', icon: '🚫', desc: '隨時準備擊掌或摸摸肉球', unlockType: 'free', price: 0, reqLevel: 1, releaseDate: '2025-01-01', reaction: '', svg: '' },
      { id: 'aura_none', slot: 'aura', name: '無特效', icon: '🚫', desc: '回歸純粹的貓咪氛圍', unlockType: 'free', price: 0, reqLevel: 1, releaseDate: '2025-01-01', reaction: '', svg: '' },
      { id: 'aura_sparkle', slot: 'aura', name: '✨ 璀璨星光微芒', icon: '✨', desc: '【Lv.1 免費】周圍閃爍璀璨的金色呼吸光芒', unlockType: 'level', price: 0, reqLevel: 1, releaseDate: '2025-01-01', reaction: '哇～閃閃發光的金色星芒！咪咪周圍都在發光耶！✨', svg: '<g id="acc_aura_sparkle" class="animate-pulse"><path fill="#facc15" d="M16 25q6 0 6-6 0 6 6 6-6 0-6 6 0-6-6-6M96 22q6 0 6-6 0 6 6 6-6 0-6 6 0-6-6-6"/><path fill="#fde047" d="M8 82q4 0 4-4 0 4 4 4-4 0-4 4 0-4-4-4M104 85q4 0 4-4 0 4 4 4-4 0-4 4 0-4-4-4"/></g>' }
    ];

    const ACCESSORIES_SVG = { aura: {}, head: {}, face: {}, neck: {}, outfit: {}, hand: {} };
    const WARDROBE_CATALOG = { head: [], face: [], neck: [], outfit: [], hand: [], aura: [] };
    const ACCESSORY_REACTIONS = {};
    const WARDROBE_ITEMS_BY_ID = {};
    let wardrobePacksLoaded = false;

    function getLocalDateStr(dateObj = new Date()) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    function isItemReleased(item) {
      if (!item || !item.releaseDate) return true;
      return String(item.releaseDate) <= getLocalDateStr();
    }

    function isItemNew(item) {
      if (!item || !item.releaseDate || item.id.endsWith('_none')) return false;
      const rel = new Date(item.releaseDate + 'T00:00:00');
      if (isNaN(rel.getTime())) return false;
      const today = new Date(getLocalDateStr() + 'T00:00:00');
      const diffDays = Math.floor((today - rel) / 86400000);
      return diffDays >= 0 && diffDays <= WARDROBE_NEW_DAYS;
    }

    function parseEquippedId(fullId) {
      if (!fullId || typeof fullId !== 'string') return { baseId: '', variantId: 'default' };
      const idx = fullId.indexOf('__');
      if (idx === -1) return { baseId: fullId, variantId: 'default' };
      return { baseId: fullId.slice(0, idx), variantId: fullId.slice(idx + 2) || 'default' };
    }

    function getVariantFullId(baseId, variantId) {
      return (!variantId || variantId === 'default') ? baseId : `${baseId}__${variantId}`;
    }

    function registerWardrobeItems(items) {
      if (!Array.isArray(items)) return;
      items.forEach(item => {
        if (!item || !item.id || !item.slot || !WARDROBE_CATALOG[item.slot]) return;
        WARDROBE_ITEMS_BY_ID[item.id] = item;
        ACCESSORIES_SVG[item.slot][item.id] = item.svg || '';
        if (item.reaction) ACCESSORY_REACTIONS[item.id] = item.reaction;
        const list = WARDROBE_CATALOG[item.slot];
        const existingIdx = list.findIndex(x => x.id === item.id);
        if (existingIdx !== -1) {
          list[existingIdx] = item;
        } else {
          list.push(item);
        }
      });
    }

    // Seed built-in items synchronously so first paint always works
    registerWardrobeItems(BUILTIN_WARDROBE_ITEMS);

    async function loadWardrobePacks() {
      try {
        const res = await fetch(WARDROBE_MANIFEST_URL, { cache: 'no-cache' });
        if (!res.ok) return;
        const manifest = await res.json();
        const packs = Array.isArray(manifest?.packs) ? manifest.packs : [];
        const loadedPacks = await Promise.all(
          packs.map(p =>
            fetch(`./data/wardrobe/${p.file}`, { cache: 'no-cache' })
              .then(r => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        );
        loadedPacks.forEach(pack => {
          if (pack && Array.isArray(pack.items)) {
            registerWardrobeItems(pack.items);
          }
        });
        wardrobePacksLoaded = true;
        checkLevelUnlocks(false);
        checkStreakUnlocks(false);
        renderCatAccessories();
        const wModal = document.getElementById('wardrobeModal');
        if (wModal && !wModal.classList.contains('hidden')) {
          renderWardrobeStreakBanner();
          renderWardrobePresets();
          renderWardrobeItems(currentWardrobeTab);
        }
      } catch (e) {
        console.warn('[Wardrobe] External packs unavailable, using built-in fallback:', e);
      }
    }

    function applyColorPalette(svgStr, replaceMap) {
      if (!svgStr || !replaceMap || typeof replaceMap !== 'object') return svgStr || '';
      const keys = Object.keys(replaceMap);
      if (keys.length === 0) return svgStr;
      const lowerMap = {};
      keys.forEach(k => { lowerMap[k.toLowerCase()] = replaceMap[k]; });
      const escaped = keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const regex = new RegExp(escaped.join('|'), 'gi');
      return svgStr.replace(regex, m => lowerMap[m.toLowerCase()] || m);
    }

    function scopeSvgIds(svgStr, prefix) {
      if (!svgStr || !prefix) return svgStr || '';
      const ids = new Set();
      svgStr.replace(/\bid="([^"]+)"/g, (_, id) => { ids.add(id); return _; });
      if (ids.size === 0) return svgStr;
      let scoped = svgStr;
      ids.forEach(id => {
        const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const nextId = `${prefix}_${id}`;
        scoped = scoped
          .replace(new RegExp(`\\bid="${esc}"`, 'g'), `id="${nextId}"`)
          .replace(new RegExp(`url\\(#${esc}\\)`, 'g'), `url(#${nextId})`)
          .replace(new RegExp(`(xlink:)?href="#${esc}"`, 'g'), `$1href="#${nextId}"`);
      });
      return scoped;
    }

    function resolveAccessorySvg(slot, fullId, catPrefix) {
      if (!fullId || fullId.endsWith('_none')) return '';
      const { baseId, variantId } = parseEquippedId(fullId);
      const item = WARDROBE_ITEMS_BY_ID[baseId];
      let svg = (item && item.svg) || (ACCESSORIES_SVG[slot] && ACCESSORIES_SVG[slot][baseId]) || '';
      if (!svg) return '';
      if (item && Array.isArray(item.variants) && variantId !== 'default') {
        const v = item.variants.find(x => x.id === variantId);
        if (v && v.replace) {
          svg = applyColorPalette(svg, v.replace);
        }
      }
      return scopeSvgIds(svg, catPrefix);
    }

    let currentWardrobeTab = 'head';
    let currentWardrobeFilter = 'all';
    let wardrobePreviewEquipped = null;
    let catWardrobe = {
      equipped: {
        head: 'head_none',
        face: 'face_none',
        neck: 'neck_none',
        outfit: 'outfit_none',
        hand: 'hand_none',
        aura: 'aura_none'
      },
      unlocked: [
        'head_none', 'head_sakura',
        'face_none', 'face_blush',
        'neck_none', 'neck_bell',
        'outfit_none', 'hand_none', 'aura_none', 'aura_sparkle'
      ],
      presets: [],
      streak: { current: 0, best: 0, lastDate: '' }
    };

    function ensureWardrobeDefaults() {
      if (!catWardrobe || typeof catWardrobe !== 'object') catWardrobe = {};
      if (!catWardrobe.equipped || typeof catWardrobe.equipped !== 'object') catWardrobe.equipped = {};
      WARDROBE_SLOTS.forEach(s => {
        if (!catWardrobe.equipped[s]) catWardrobe.equipped[s] = `${s}_none`;
      });
      if (!Array.isArray(catWardrobe.unlocked)) catWardrobe.unlocked = [];
      WARDROBE_SLOTS.forEach(s => {
        const noneId = `${s}_none`;
        if (!catWardrobe.unlocked.includes(noneId)) catWardrobe.unlocked.push(noneId);
      });
      if (!Array.isArray(catWardrobe.presets)) catWardrobe.presets = [];
      if (!catWardrobe.streak || typeof catWardrobe.streak !== 'object') {
        catWardrobe.streak = { current: 0, best: 0, lastDate: '' };
      }
    }

    function loadCatWardrobe() {
      try {
        const saved = JSON.parse(localStorage.getItem(WARDROBE_STORAGE_KEY) || 'null');
        if (saved && saved.equipped && Array.isArray(saved.unlocked)) {
          catWardrobe = saved;
        }
        ensureWardrobeDefaults();
        let hasRecovered = false;
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('wordchecking_account_snapshot_')) {
            try {
              const snap = JSON.parse(localStorage.getItem(k) || '{}');
              const snapUnlocked = snap?.catGamification?.wardrobe?.unlocked;
              if (Array.isArray(snapUnlocked)) {
                snapUnlocked.forEach(id => {
                  if (!catWardrobe.unlocked.includes(id)) {
                    catWardrobe.unlocked.push(id);
                    hasRecovered = true;
                    console.log(`[WardrobeRecovery] 已自快照 ${k} 自動復原裝備:`, id);
                  }
                });
              }
            } catch (err) {}
          }
        }
        if (hasRecovered) {
          localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(catWardrobe));
        }
      } catch (e) {
        console.warn("Wardrobe load error:", e);
        ensureWardrobeDefaults();
      }
      checkLevelUnlocks(false);
      checkStreakUnlocks(false);
    }

    function saveCatWardrobe() {
      ensureWardrobeDefaults();
      try {
        const existingRaw = localStorage.getItem(WARDROBE_STORAGE_KEY);
        if (existingRaw) {
          const existing = JSON.parse(existingRaw);
          if (existing && Array.isArray(existing.unlocked)) {
            existing.unlocked.forEach(id => {
              if (!catWardrobe.unlocked.includes(id)) {
                catWardrobe.unlocked.push(id);
              }
            });
          }
        }
      } catch (e) {}
      localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(catWardrobe));
      if (typeof triggerAutoSaveToPi === 'function') triggerAutoSaveToPi();
    }

    function recordDailyStudyStreak(notify = true) {
      ensureWardrobeDefaults();
      const today = getLocalDateStr();
      const st = catWardrobe.streak;
      if (st.lastDate === today) return st.current;
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = getLocalDateStr(yesterdayDate);
      if (st.lastDate === yesterday) {
        st.current = (parseInt(st.current, 10) || 0) + 1;
      } else {
        st.current = 1;
      }
      st.best = Math.max(parseInt(st.best, 10) || 0, st.current);
      st.lastDate = today;
      saveCatWardrobe();
      checkStreakUnlocks(notify);
      return st.current;
    }
    if (typeof window !== 'undefined') {
      window.recordDailyStudyStreak = recordDailyStudyStreak;
    }

    function checkStreakUnlocks(notify = true) {
      ensureWardrobeDefaults();
      const cur = Math.max(catWardrobe.streak.current || 0, catWardrobe.streak.best || 0);
      const newUnlocks = [];
      WARDROBE_SLOTS.forEach(catKey => {
        (WARDROBE_CATALOG[catKey] || []).forEach(item => {
          if (item.unlockType === 'streak' && isItemReleased(item) && cur >= (item.reqStreak || 1)) {
            if (!catWardrobe.unlocked.includes(item.id)) {
              catWardrobe.unlocked.push(item.id);
              newUnlocks.push(item.name);
            }
          }
        });
      });
      if (newUnlocks.length > 0) {
        saveCatWardrobe();
        renderCatAccessories();
        const wModal = document.getElementById('wardrobeModal');
        if (wModal && !wModal.classList.contains('hidden')) {
          renderWardrobeStreakBanner();
          renderWardrobeItems(currentWardrobeTab);
        }
        if (notify && typeof sayCatSpeech === 'function') {
          sayCatSpeech(`🔥 連續學習達標！衣櫥解鎖限定獎勵：【${newUnlocks.join('、')}】！快去換裝室試穿喵～👗🐾`, "連續學習獎勵");
        }
      }
    }

    function checkLevelUnlocks(notify = true, isDowngrade = false) {
      ensureWardrobeDefaults();
      const totalMastered = typeof calculateTotalMasteredWords === 'function' ? calculateTotalMasteredWords() : 0;
      const catLevel = typeof getCatLevelInfo === 'function' ? getCatLevelInfo(totalMastered).level : 1;
      let newUnlocks = [];
      let relockedItems = [];
      let unequippedItems = [];
      WARDROBE_SLOTS.forEach(catKey => {
        (WARDROBE_CATALOG[catKey] || []).forEach(item => {
          if (item.unlockType === 'level' && isItemReleased(item)) {
            if (catLevel >= item.reqLevel) {
              if (!catWardrobe.unlocked.includes(item.id)) {
                catWardrobe.unlocked.push(item.id);
                newUnlocks.push(item.name);
              }
            } else if (isDowngrade) {
              const uIdx = catWardrobe.unlocked.indexOf(item.id);
              if (uIdx !== -1) {
                catWardrobe.unlocked.splice(uIdx, 1);
                relockedItems.push(item.name);
              }
              const eqBase = parseEquippedId(catWardrobe.equipped[catKey]).baseId;
              if (eqBase === item.id) {
                catWardrobe.equipped[catKey] = catKey + '_none';
                unequippedItems.push(item.name);
              }
            }
          }
        });
      });
      if (newUnlocks.length > 0 || relockedItems.length > 0 || unequippedItems.length > 0) {
        saveCatWardrobe();
        renderCatAccessories();
        const wModal = document.getElementById('wardrobeModal');
        if (wModal && !wModal.classList.contains('hidden')) {
          renderWardrobeItems(currentWardrobeTab);
        }
      }
      if (notify && typeof sayCatSpeech === 'function') {
        if (newUnlocks.length > 0) {
          sayCatSpeech(`恭喜升級！衣櫥解鎖了里程碑專屬獎勵：【${newUnlocks.join('、')}】！快去換裝室試穿吧～👗🐾`, "解鎖里程碑新裝");
        } else if (unequippedItems.length > 0 || relockedItems.length > 0) {
          sayCatSpeech(`等級變更為 Lv.${catLevel}，已自動將未解鎖的進階里程碑裝備卸下並鎖定喵～🐾`, "裝備重整");
        }
      }
    }

    function renderCatAccessories() {
      ensureWardrobeDefaults();
      ['mainCat', 'wardrobeCat', 'roamingCat'].forEach(prefix => {
        const eq = (prefix === 'wardrobeCat' && wardrobePreviewEquipped) ? wardrobePreviewEquipped : catWardrobe.equipped;
        const slotMap = [
          ['aura', 'AccAura'],
          ['face', 'AccFace'],
          ['head', 'AccHead'],
          ['neck', 'AccNeck'],
          ['outfit', 'AccOutfit'],
          ['hand', 'AccHand']
        ];
        slotMap.forEach(([slot, suffix]) => {
          const el = document.getElementById(prefix + suffix);
          if (el) el.innerHTML = resolveAccessorySvg(slot, eq[slot], prefix);
        });
      });
      updateWardrobeTags();
      updatePreviewBanner();
    }

    function updatePreviewBanner() {
      const banner = document.getElementById('wardrobePreviewBanner');
      if (!banner) return;
      if (wardrobePreviewEquipped) {
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    }

    function clearWardrobePreview() {
      wardrobePreviewEquipped = null;
      renderCatAccessories();
      renderWardrobeItems(currentWardrobeTab);
      const speechEl = document.getElementById('wardrobeCatSpeech');
      if (speechEl) speechEl.innerText = '已還原目前實際穿搭囉喵～🐾';
    }

    function previewWardrobeItem(category, fullId) {
      ensureWardrobeDefaults();
      if (!wardrobePreviewEquipped) {
        wardrobePreviewEquipped = { ...catWardrobe.equipped };
      }
      wardrobePreviewEquipped[category] = fullId;
      renderCatAccessories();
      renderWardrobeItems(currentWardrobeTab);
      const { baseId, variantId } = parseEquippedId(fullId);
      const item = WARDROBE_ITEMS_BY_ID[baseId];
      const v = item && Array.isArray(item.variants) ? item.variants.find(x => x.id === variantId) : null;
      const label = item ? `${item.name}${v && v.id !== 'default' ? `（${v.name}）` : ''}` : '';
      const speechEl = document.getElementById('wardrobeCatSpeech');
      if (speechEl && label) {
        speechEl.innerText = `👁️ 試穿預覽：【${label}】！喜歡的話解鎖就能永久收藏喵～✨`;
      }
    }

    function updateWardrobeTags() {
      const tagsContainer = document.getElementById('wardrobeOutfitTags');
      if (!tagsContainer) return;
      tagsContainer.innerHTML = '';
      const eq = wardrobePreviewEquipped || catWardrobe.equipped;
      let count = 0;
      WARDROBE_SLOTS.forEach(slot => {
        const fullId = eq[slot];
        if (fullId && !fullId.endsWith('_none')) {
          const { baseId, variantId } = parseEquippedId(fullId);
          const item = WARDROBE_ITEMS_BY_ID[baseId];
          if (item) {
            count++;
            const v = Array.isArray(item.variants) && variantId !== 'default'
              ? item.variants.find(x => x.id === variantId)
              : null;
            const tag = document.createElement('span');
            tag.className = 'text-[11px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 font-bold border border-pink-200 dark:border-pink-800';
            tag.innerText = v ? `${item.name}·${v.name}` : item.name;
            tagsContainer.appendChild(tag);
          }
        }
      });
      if (count === 0) {
        const tag = document.createElement('span');
        tag.className = 'text-[11px] text-slate-400 dark:text-slate-500';
        tag.innerText = '目前穿搭：自然小貓樣貌 🐾';
        tagsContainer.appendChild(tag);
      }
    }

    function renderWardrobeStreakBanner() {
      const el = document.getElementById('wardrobeStreakBanner');
      if (!el) return;
      ensureWardrobeDefaults();
      const cur = catWardrobe.streak.current || 0;
      const best = Math.max(cur, catWardrobe.streak.best || 0);
      const streakItems = [];
      WARDROBE_SLOTS.forEach(s => {
        (WARDROBE_CATALOG[s] || []).forEach(it => {
          if (it.unlockType === 'streak' && isItemReleased(it)) streakItems.push(it);
        });
      });
      streakItems.sort((a, b) => (a.reqStreak || 0) - (b.reqStreak || 0));
      const nextLocked = streakItems.find(it => !catWardrobe.unlocked.includes(it.id));
      let nextText = '';
      if (nextLocked) {
        const remain = Math.max(0, (nextLocked.reqStreak || 1) - cur);
        nextText = `｜再連續 <b>${remain}</b> 天解鎖「${escapeWardrobeHtml(nextLocked.name)}」`;
      } else if (streakItems.length > 0) {
        nextText = '｜🏆 連續學習限定服飾已全部解鎖！';
      }
      el.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 dark:from-slate-700/80 dark:via-slate-700/60 dark:to-slate-700/80 border border-amber-200/80 dark:border-slate-600 text-xs">
          <div class="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-bold">
            <span>🔥</span>
            <span>連續學習 <span class="text-rose-600 dark:text-rose-400 font-black">${cur}</span> 天</span>
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">(最高 ${best} 天)</span>
          </div>
          <div class="text-[11px] text-amber-800 dark:text-amber-300">${nextText}</div>
        </div>
      `;
    }

    function renderWardrobePresets() {
      const container = document.getElementById('wardrobePresetsBar');
      if (!container) return;
      ensureWardrobeDefaults();
      const presets = catWardrobe.presets || [];
      let html = '';
      presets.forEach((p, idx) => {
        html += `
          <div class="inline-flex items-center rounded-xl bg-white dark:bg-slate-800 border border-pink-200 dark:border-slate-600 shadow-2xs overflow-hidden">
            <button onclick="applyWardrobePreset(${idx})" class="px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-slate-700 transition cursor-pointer" title="一鍵套用此穿搭">
              ✨ ${escapeWardrobeHtml(p.name || ('套裝 ' + (idx + 1)))}
            </button>
            <button onclick="deleteWardrobePreset(${idx})" class="px-1.5 py-1 text-[10px] text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 transition cursor-pointer" title="刪除此套裝">✕</button>
          </div>
        `;
      });
      if (presets.length < WARDROBE_MAX_PRESETS) {
        html += `
          <button onclick="saveCurrentAsPreset()" class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-300 border border-dashed border-pink-300 dark:border-pink-700 hover:bg-pink-100 dark:hover:bg-pink-900/50 transition cursor-pointer">
            💾 存成套裝 (${presets.length}/${WARDROBE_MAX_PRESETS})
          </button>
        `;
      }
      container.innerHTML = html;
    }

    function saveCurrentAsPreset() {
      ensureWardrobeDefaults();
      if (catWardrobe.presets.length >= WARDROBE_MAX_PRESETS) {
        alert(`最多可收藏 ${WARDROBE_MAX_PRESETS} 組套裝，請先刪除舊套裝再儲存喔！`);
        return;
      }
      const defaultName = `套裝 ${catWardrobe.presets.length + 1}`;
      const name = prompt('幫這組穿搭取個名字吧（最多 10 字）：', defaultName);
      if (name === null) return;
      const cleanName = (name.trim() || defaultName).slice(0, 10);
      catWardrobe.presets.push({
        name: cleanName,
        equipped: { ...catWardrobe.equipped }
      });
      saveCatWardrobe();
      renderWardrobePresets();
      const speechEl = document.getElementById('wardrobeCatSpeech');
      if (speechEl) speechEl.innerText = `💾 已收藏穿搭套裝【${cleanName}】，隨時都能一鍵換裝喵！✨`;
    }

    function applyWardrobePreset(idx) {
      ensureWardrobeDefaults();
      const preset = catWardrobe.presets[idx];
      if (!preset || !preset.equipped) return;
      wardrobePreviewEquipped = null;
      WARDROBE_SLOTS.forEach(s => {
        const target = preset.equipped[s] || `${s}_none`;
        const { baseId } = parseEquippedId(target);
        if (target.endsWith('_none') || catWardrobe.unlocked.includes(target) || (target === baseId && catWardrobe.unlocked.includes(baseId))) {
          catWardrobe.equipped[s] = target;
        }
      });
      saveCatWardrobe();
      renderCatAccessories();
      renderWardrobeItems(currentWardrobeTab);
      if (typeof playCatMeowSound === 'function') playCatMeowSound();
      const speechEl = document.getElementById('wardrobeCatSpeech');
      if (speechEl) speechEl.innerText = `✨ 一鍵換上收藏套裝【${preset.name}】！超方便喵～🐾`;
    }

    function deleteWardrobePreset(idx) {
      ensureWardrobeDefaults();
      if (idx < 0 || idx >= catWardrobe.presets.length) return;
      catWardrobe.presets.splice(idx, 1);
      saveCatWardrobe();
      renderWardrobePresets();
    }

    function setWardrobeFilter(filterKey) {
      currentWardrobeFilter = filterKey;
      ['all', 'unlocked', 'locked', 'new'].forEach(k => {
        const btn = document.getElementById('filterBtn_' + k);
        if (btn) {
          if (k === filterKey) {
            btn.className = 'px-2.5 py-1 rounded-full text-[11px] font-black bg-pink-500 text-white shadow-2xs transition cursor-pointer';
          } else {
            btn.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-pink-100 dark:hover:bg-slate-600 transition cursor-pointer';
          }
        }
      });
      renderWardrobeItems(currentWardrobeTab);
    }

    function updateNewFilterBadge() {
      const badge = document.getElementById('wardrobeNewCountBadge');
      if (!badge) return;
      let newCount = 0;
      WARDROBE_SLOTS.forEach(s => {
        (WARDROBE_CATALOG[s] || []).forEach(it => {
          if (isItemReleased(it) && isItemNew(it)) newCount++;
        });
      });
      if (newCount > 0) {
        badge.innerText = String(newCount);
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    function handleMascotClick(event) {}
    function handleHeadClick(event) {
      if (event) event.stopPropagation();
      petTheCat();
    }
    function handleBellyClick(event) {
      if (event) event.stopPropagation();
      const box = document.getElementById('catAvatarBox');
      if (box) {
        box.classList.remove('cat-hop');
        void box.offsetWidth;
        box.classList.add('cat-hop');
      }
      playCatMeowSound();
      spawnFloatingHeart("🐾");
      sayCatSpeech("呼嚕嚕～搔小肚肚好癢好舒服喔！精神百倍喵～🐾", "搔肚肚");
      gainAffection(3);
    }
    function handleTailClick(event) {
      if (event) event.stopPropagation();
      const tail = document.getElementById('mainCatTail');
      if (tail) {
        tail.classList.remove('tail-wag');
        tail.classList.remove('tail-wag-fast');
        void tail.offsetWidth;
        tail.classList.add('tail-wag-fast');
        setTimeout(() => {
          if (tail) {
            tail.classList.remove('tail-wag-fast');
            tail.classList.add('tail-wag');
          }
        }, 1600);
      }
      playCatMeowSound();
      sayCatSpeech("喵嗚～！尾巴很敏感的啦！不要偷拉尾巴喵～🐾", "被拉尾巴");
    }
    function openFeedGourmetModal() {
      document.getElementById('feedGourmetModal').classList.remove('hidden');
    }
    function closeFeedGourmetModal() {
      document.getElementById('feedGourmetModal').classList.add('hidden');
      if (typeof flushPendingSyncToPi === 'function') flushPendingSyncToPi();
    }
    function feedMimiGourmet(type, cost, affectionGain, extraFever = 0) {
      if (fishCount < cost) {
        alert(`小魚乾不足喔！這道點心需要 ${cost} 條小魚乾，多背背單字賺小魚乾吧喵～🐟`);
        return;
      }
      fishCount -= cost;
      localStorage.setItem(FISH_STORAGE_KEY, fishCount);
      document.getElementById('fishCount').innerText = fishCount;
      const wFish = document.getElementById('wardrobeFishCount');
      if (wFish) wFish.innerText = fishCount;
      playCatMunchSound();
      spawnFloatingHeart("🐟");
      spawnFloatingHeart("💖");
      gainAffection(affectionGain);
      if (extraFever > 0) {
        feverRemainingQuestions += extraFever;
        localStorage.setItem('wordchecking_fever_remaining_v1', feverRemainingQuestions);
        updateFeverBadge();
      }
      touchMimiInteraction();
      if (type === 'snack') {
        sayCatSpeech("嚼嚼嚼～脆脆小魚乾真好吃！親密度 +5% 喵～🐟", "吃小魚乾");
      } else if (type === 'sashimi') {
        spawnFloatingHeart("🍣");
        sayCatSpeech("哇！特級鮭魚生魚片好鮮甜多汁喔！咪咪太幸福了～親密度 +30% 💖！", "大啖鮭魚");
      } else if (type === 'banquet') {
        spawnFloatingHeart("👑");
        spawnFloatingHeart("🍱");
        sayCatSpeech("天啊～！是頂級滿漢海鮮全席！親密度直接補滿 100%！加贈 10 題狂熱雙倍小魚乾時段！🔥🐟", "海鮮盛宴");
      }
      closeFeedGourmetModal();
      triggerAutoSaveToPi();
    }
    function closeGachaModal() {
      const modal = document.getElementById('gachaResultModal');
      if (modal) modal.classList.add('hidden');
      if (typeof flushPendingSyncToPi === 'function') flushPendingSyncToPi();
    }
    function openGachaModal(data) {
      const modal = document.getElementById('gachaResultModal');
      if (!modal) return;
      const iconEl = document.getElementById('gachaModalIcon');
      const titleEl = document.getElementById('gachaModalTitle');
      const subEl = document.getElementById('gachaModalSubtitle');
      const bodyEl = document.getElementById('gachaModalBody');
      const actionsEl = document.getElementById('gachaModalActions');
      if (data.status === 'NOT_ENOUGH_FISH') {
        iconEl.innerHTML = '🐟';
        iconEl.className = 'w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-rose-400 to-pink-500 flex items-center justify-center text-3xl shadow-lg shadow-rose-400/20';
        titleEl.innerText = '小魚乾還不夠開盲盒喵！';
        titleEl.className = 'font-black text-lg text-rose-600 dark:text-rose-400 pt-2';
        subEl.innerText = '每次抽取幸運盲盒需要 20 條小魚乾';
        bodyEl.innerHTML = `
          <div class="text-sm text-slate-700 dark:text-slate-200 space-y-2">
            <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-rose-100 dark:border-slate-600">
              <span class="text-xs text-slate-500 dark:text-slate-400">目前擁有小魚乾：</span>
              <span class="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span>🐟</span> <span>${data.currentFish}</span> 條
              </span>
            </div>
            <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-rose-100 dark:border-slate-600">
              <span class="text-xs text-slate-500 dark:text-slate-400">還缺少小魚乾：</span>
              <span class="font-black text-rose-600 dark:text-rose-400">
                ${data.cost - data.currentFish} 條
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 pt-1 leading-relaxed">
              🐾 <b>賺魚乾秘笈</b>：只要背單字或做測驗，每答對一題就能獲得 1 條小魚乾（若觸發狂熱雙倍時段可得 2 條）！累積滿 20 條就能來抽驚喜大獎囉！
            </p>
          </div>
        `;
        actionsEl.innerHTML = `
          <button onclick="closeGachaModal()" class="w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition cursor-pointer">
            我知道了喵！去背單字賺魚乾
          </button>
        `;
      } else if (data.status === 'SUCCESS') {
        iconEl.innerHTML = '🎁';
        iconEl.className = 'w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-400/20 cat-hop';
        titleEl.innerText = '🎉 幸運盲盒大驚喜！';
        titleEl.className = 'font-black text-lg text-amber-600 dark:text-amber-400 pt-2';
        subEl.innerText = `成功消耗 20 條小魚乾（剩餘：${data.remainingFish} 條）`;
        const slotMap = {
          head: '🎀 頭飾帽子',
          face: '👓 面部裝飾',
          neck: '🧣 頸部項鍊',
          outfit: '👗 全身服裝',
          hand: '🐾 手持道具',
          aura: '✨ 特效光環'
        };
        const slotText = slotMap[data.item.slot] || '造型配件';
        bodyEl.innerHTML = `
          <div class="space-y-3">
            <div class="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-amber-200 dark:border-slate-600 shadow-xs">
              <div class="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-3xl">
                ${escapeWardrobeHtml(data.item.icon)}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                    ${slotText}
                  </span>
                </div>
                <h4 class="font-black text-base text-slate-900 dark:text-white truncate pt-0.5">
                  ${escapeWardrobeHtml(data.item.name)}
                </h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                  ${escapeWardrobeHtml(data.item.desc)}
                </p>
              </div>
            </div>
            <div class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold text-center flex items-center justify-center gap-1.5">
              <span>✨</span>
              <span>已自動為咪咪穿戴上新造型！外觀已立即更新！</span>
            </div>
          </div>
        `;
        actionsEl.innerHTML = `
          <button onclick="closeGachaModal(); openWardrobeModal();" class="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm transition shadow-xs cursor-pointer">
            👗 前往換裝室查看
          </button>
          <button onclick="closeGachaModal()" class="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition cursor-pointer">
            太棒了！
          </button>
        `;
      } else if (data.status === 'CURRENT_TIER_MAXED') {
        iconEl.innerHTML = '⭐';
        iconEl.className = 'w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-pink-500 flex items-center justify-center text-3xl shadow-lg shadow-rose-400/20 cat-hop';
        titleEl.innerText = `🎉 Lv.${data.catLevel} 造型全數解鎖！`;
        titleEl.className = 'font-black text-lg text-rose-500 dark:text-rose-400 pt-2';
        subEl.innerText = `成功消耗 20 條小魚乾（剩餘：${data.remainingFish} 條）`;
        bodyEl.innerHTML = `
          <div class="text-sm text-slate-700 dark:text-slate-200 space-y-2.5">
            <div class="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs leading-relaxed text-rose-900 dark:text-rose-200">
              🐾 <b>太厲害了！</b>目前貓咪 Lv.${data.catLevel} 可抽取的造型已經被妳全部收集完畢囉！
              <br>只要多背單字、手寫拼字與測驗，將貓咪升級到 <b>Lv.${data.nextReqLevel}</b>，就能開啟下一階段的華麗盲盒抽獎池喵！✨
            </div>
            <div class="space-y-1.5">
              <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-rose-100 dark:border-slate-600">
                <span class="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span class="text-base">🔥</span> 狂熱雙倍時段加油
                </span>
                <span class="font-black text-amber-600 dark:text-amber-400">+10 題雙倍魚乾</span>
              </div>
              <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-rose-100 dark:border-slate-600">
                <span class="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span class="text-base">💖</span> 咪咪親密度獎勵
                </span>
                <span class="font-black text-rose-500">+30% 親密度</span>
              </div>
            </div>
          </div>
        `;
        actionsEl.innerHTML = `
          <button onclick="closeGachaModal()" class="w-full py-2.5 bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-white font-bold rounded-xl text-sm transition shadow-xs cursor-pointer">
            好棒！繼續背單字升級到 Lv.${data.nextReqLevel} 🐾
          </button>
        `;
      } else if (data.status === 'ALL_UNLOCKED') {
        iconEl.innerHTML = '👑';
        iconEl.className = 'w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/20';
        titleEl.innerText = '🏆 全圖鑑收藏大師！';
        titleEl.className = 'font-black text-lg text-purple-600 dark:text-purple-400 pt-2';
        subEl.innerText = `成功消耗 20 條小魚乾（剩餘：${data.remainingFish} 條）`;
        bodyEl.innerHTML = `
          <div class="text-sm text-slate-700 dark:text-slate-200 space-y-2.5">
            <div class="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-xs leading-relaxed text-purple-900 dark:text-purple-200">
              🌟 <b>太震撼了！</b>衣櫥中可抽取的所有配件與服裝已經被妳全部收集齊全囉！
            </div>
            <div class="space-y-1.5">
              <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-purple-100 dark:border-slate-600">
                <span class="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span class="text-base">🔥</span> 狂熱雙倍時段加碼
                </span>
                <span class="font-black text-amber-600 dark:text-amber-400">+15 題雙倍魚乾</span>
              </div>
              <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-purple-100 dark:border-slate-600">
                <span class="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span class="text-base">💖</span> 咪咪親密度爆棚
                </span>
                <span class="font-black text-rose-500">+50% 親密度</span>
              </div>
            </div>
          </div>
        `;
        actionsEl.innerHTML = `
          <button onclick="closeGachaModal()" class="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-xs cursor-pointer">
            收下傳奇大獎喵！🔥
          </button>
        `;
      }
      modal.classList.remove('hidden');
    }

    function playLuckyGacha() {
      const GACHA_COST = 20;
      if (fishCount < GACHA_COST) {
        openGachaModal({ status: 'NOT_ENOUGH_FISH', currentFish: fishCount, cost: GACHA_COST });
        return;
      }
      const catLevel = (typeof currentCatLevel !== 'undefined') ? currentCatLevel : 1;
      let candidates = [];
      let allLockedItems = [];
      WARDROBE_SLOTS.forEach(catKey => {
        (WARDROBE_CATALOG[catKey] || []).forEach(item => {
          if (!isItemReleased(item) || item.unlockType === 'streak' || item.unlockType === 'free') return;
          if (!catWardrobe.unlocked.includes(item.id)) {
            allLockedItems.push(item);
            if (catLevel >= (item.reqLevel || 1)) {
              candidates.push({ slot: catKey, ...item });
            }
          }
        });
      });
      fishCount -= GACHA_COST;
      localStorage.setItem(FISH_STORAGE_KEY, fishCount);
      document.getElementById('fishCount').innerText = fishCount;
      const wFish = document.getElementById('wardrobeFishCount');
      if (wFish) wFish.innerText = fishCount;
      playCatCheerSound();
      spawnFloatingHeart("🎁");
      spawnFloatingHeart("✨");
      if (candidates.length > 0) {
        const prize = candidates[Math.floor(Math.random() * candidates.length)];
        catWardrobe.unlocked.push(prize.id);
        catWardrobe.equipped[prize.slot] = prize.id;
        saveCatWardrobe();
        renderCatAccessories();
        sayCatSpeech(`🎁 哇！幸運盲盒大驚喜！成功開出【${prize.name}】並已自動換上！太美了喵～✨🐾`, "開箱大獎");
        openGachaModal({ status: 'SUCCESS', item: prize, remainingFish: fishCount });
      } else if (allLockedItems.length > 0) {
        const nextReqLevel = Math.min(...allLockedItems.map(it => it.reqLevel || 1));
        feverRemainingQuestions += 10;
        localStorage.setItem('wordchecking_fever_remaining_v1', feverRemainingQuestions);
        updateFeverBadge();
        gainAffection(30);
        sayCatSpeech(`🎁 太厲害了！Lv.${catLevel} 可抽造型已全數收集！努力背單字升到 Lv.${nextReqLevel} 就能解鎖更高階抽獎池喵！🐾🔥`, "分級集齊");
        openGachaModal({ status: 'CURRENT_TIER_MAXED', catLevel: catLevel, nextReqLevel: nextReqLevel, remainingFish: fishCount });
      } else {
        feverRemainingQuestions += 15;
        localStorage.setItem('wordchecking_fever_remaining_v1', feverRemainingQuestions);
        updateFeverBadge();
        gainAffection(50);
        sayCatSpeech(`🎁 太震撼了！全圖鑑可抽造型全部集齊！盲盒獎勵轉化為「15 題狂熱雙倍時段」與 +50% 親密度喵！🔥✨`, "全造型傳奇");
        openGachaModal({ status: 'ALL_UNLOCKED', remainingFish: fishCount });
      }
      triggerAutoSaveToPi();
    }

    function openWardrobeModal() {
      wardrobePreviewEquipped = null;
      checkLevelUnlocks(false);
      checkStreakUnlocks(false);
      const wFish = document.getElementById('wardrobeFishCount');
      if (wFish) wFish.innerText = fishCount;
      document.getElementById('wardrobeModal').classList.remove('hidden');
      renderWardrobeStreakBanner();
      renderWardrobePresets();
      updateNewFilterBadge();
      renderCatAccessories();
      switchWardrobeTab(currentWardrobeTab);
      playCatMeowSound();
    }

    function closeWardrobeModal() {
      wardrobePreviewEquipped = null;
      renderCatAccessories();
      document.getElementById('wardrobeModal').classList.add('hidden');
      if (typeof flushPendingSyncToPi === 'function') flushPendingSyncToPi();
    }

    function switchWardrobeTab(tabKey) {
      currentWardrobeTab = tabKey;
      WARDROBE_SLOTS.forEach(k => {
        const btn = document.getElementById('tabBtn_' + k);
        if (btn) {
          if (k === tabKey) {
            btn.className = 'wardrobe-tab-btn flex-1 py-1.5 px-2 rounded-xl transition text-center cursor-pointer whitespace-nowrap bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-300 shadow-2xs font-black';
          } else {
            btn.className = 'wardrobe-tab-btn flex-1 py-1.5 px-2 rounded-xl transition text-center cursor-pointer whitespace-nowrap text-slate-600 dark:text-slate-300 hover:text-slate-900 font-medium';
          }
        }
      });
      renderWardrobeItems(tabKey);
    }

    function selectItemVariant(category, baseId, variantId) {
      ensureWardrobeDefaults();
      const item = WARDROBE_ITEMS_BY_ID[baseId];
      if (!item || !Array.isArray(item.variants)) return;
      const v = item.variants.find(x => x.id === variantId);
      if (!v) return;
      const fullId = getVariantFullId(baseId, variantId);
      const isBaseUnlocked = catWardrobe.unlocked.includes(baseId);
      const isVariantUnlocked = (variantId === 'default' && isBaseUnlocked) || catWardrobe.unlocked.includes(fullId);

      if (!isBaseUnlocked) {
        previewWardrobeItem(category, fullId);
        return;
      }
      if (isVariantUnlocked) {
        wardrobePreviewEquipped = null;
        catWardrobe.equipped[category] = fullId;
        saveCatWardrobe();
        renderCatAccessories();
        renderWardrobeItems(currentWardrobeTab);
        playCatMeowSound();
        const speechEl = document.getElementById('wardrobeCatSpeech');
        if (speechEl) speechEl.innerText = `🎨 切換為【${item.name} · ${v.name}】配色！超好看喵～✨`;
        return;
      }
      // Preview locked color swatch or purchase if affordable
      const price = v.price || 10;
      if (fishCount < price) {
        previewWardrobeItem(category, fullId);
        alert(`解鎖「${v.name}」配色需要 ${price} 條小魚乾（目前 ${fishCount} 條），已先幫妳在左側試穿預覽囉喵～🐟`);
        return;
      }
      if (!confirm(`要花費 ${price} 條小魚乾解鎖「${item.name}（${v.name}）」配色嗎？🐟`)) {
        previewWardrobeItem(category, fullId);
        return;
      }
      fishCount -= price;
      localStorage.setItem(FISH_STORAGE_KEY, fishCount);
      document.getElementById('fishCount').innerText = fishCount;
      const wFish = document.getElementById('wardrobeFishCount');
      if (wFish) wFish.innerText = fishCount;
      if (!catWardrobe.unlocked.includes(fullId)) catWardrobe.unlocked.push(fullId);
      wardrobePreviewEquipped = null;
      catWardrobe.equipped[category] = fullId;
      saveCatWardrobe();
      playCatCheerSound();
      spawnFloatingHeart("🎨");
      renderCatAccessories();
      renderWardrobeItems(currentWardrobeTab);
      const speechEl = document.getElementById('wardrobeCatSpeech');
      if (speechEl) speechEl.innerText = `🎉 解鎖新配色【${item.name} · ${v.name}】！馬上穿起來秀一下喵～💖`;
    }

    function renderWardrobeItems(tabKey) {
      const grid = document.getElementById('wardrobeItemsGrid');
      if (!grid) return;
      grid.innerHTML = '';
      updateNewFilterBadge();

      const allItems = (WARDROBE_CATALOG[tabKey] || []).filter(isItemReleased);
      const items = allItems.filter(item => {
        const isUnlocked = catWardrobe.unlocked.includes(item.id);
        if (currentWardrobeFilter === 'unlocked') return isUnlocked;
        if (currentWardrobeFilter === 'locked') return !isUnlocked;
        if (currentWardrobeFilter === 'new') return isItemNew(item);
        return true;
      });

      if (items.length === 0) {
        grid.innerHTML = `
          <div class="col-span-2 py-10 text-center text-xs text-slate-400 dark:text-slate-500">
            此篩選條件下目前沒有服飾喵～換個分類或篩選看看吧！🐾
          </div>`;
        return;
      }

      const eqFullId = catWardrobe.equipped[tabKey] || (tabKey + '_none');
      const eqParsed = parseEquippedId(eqFullId);
      const previewFullId = wardrobePreviewEquipped ? wardrobePreviewEquipped[tabKey] : null;
      const previewParsed = previewFullId ? parseEquippedId(previewFullId) : null;

      items.forEach(item => {
        const isEquipped = eqParsed.baseId === item.id;
        const isPreviewing = !!(previewParsed && previewParsed.baseId === item.id && previewFullId !== eqFullId);
        const isUnlocked = catWardrobe.unlocked.includes(item.id);
        const isNew = isItemNew(item);
        const activeVariantId = isPreviewing
          ? previewParsed.variantId
          : (isEquipped ? eqParsed.variantId : 'default');

        const card = document.createElement('div');
        card.className = `p-3 rounded-2xl border transition relative flex flex-col justify-between ${
          isPreviewing
            ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-400 dark:border-purple-500 shadow-xs'
            : isEquipped
            ? 'bg-pink-50/90 dark:bg-pink-950/40 border-pink-400 dark:border-pink-600 shadow-xs'
            : isUnlocked
            ? 'bg-white dark:bg-slate-700/80 border-slate-200 dark:border-slate-600 hover:border-pink-300'
            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
        }`;

        // Color swatches row (Base + Swatches)
        let swatchesHtml = '';
        if (Array.isArray(item.variants) && item.variants.length > 1) {
          const dots = item.variants.map(v => {
            const vFull = getVariantFullId(item.id, v.id);
            const vUnlocked = (v.id === 'default' && isUnlocked) || catWardrobe.unlocked.includes(vFull);
            const isActive = activeVariantId === v.id;
            const titleText = vUnlocked
              ? `${v.name}（已擁有）`
              : (isUnlocked ? `${v.name}（${v.price}魚解鎖）` : `${v.name}（點此試穿）`);
            return `
              <button type="button" onclick="event.stopPropagation(); selectItemVariant('${tabKey}', '${item.id}', '${v.id}')" title="${escapeWardrobeHtml(titleText)}"
                class="w-4 h-4 rounded-full border-2 transition cursor-pointer relative ${isActive ? 'border-slate-900 dark:border-white scale-115 shadow-xs' : 'border-white dark:border-slate-600 opacity-85 hover:scale-110'}"
                style="background:${escapeWardrobeHtml(v.swatch || '#cbd5e1')}">
                ${(!vUnlocked && isUnlocked) ? '<span class="absolute -top-1 -right-1 text-[7px] leading-none">🔒</span>' : ''}
              </button>`;
          }).join('');
          swatchesHtml = `<div class="flex items-center gap-1.5 mt-2 flex-wrap"><span class="text-[10px] text-slate-400">配色:</span>${dots}</div>`;
        }

        let actionBtnHtml = '';
        if (isEquipped) {
          actionBtnHtml = `
            <button onclick="equipAccessory('${tabKey}', '${item.id}')" class="w-full mt-2 py-1 px-2 text-xs font-black rounded-xl bg-pink-500 text-white shadow-2xs hover:bg-pink-600 transition flex items-center justify-center gap-1 cursor-pointer">
              <span>✔</span> 穿戴中 (卸下)
            </button>`;
        } else if (isUnlocked) {
          actionBtnHtml = `
            <button onclick="equipAccessory('${tabKey}', '${item.id}')" class="w-full mt-2 py-1 px-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-pink-100 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 hover:text-pink-600 transition flex items-center justify-center cursor-pointer">
              穿戴造型
            </button>`;
        } else {
          const tryBtn = `<button onclick="previewWardrobeItem('${tabKey}', '${item.id}')" class="px-2 py-1 text-[11px] font-bold rounded-xl bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200 text-purple-700 dark:text-purple-300 transition cursor-pointer shrink-0" title="先在左側咪咪身上試穿看效果">👁️ 試穿</button>`;
          if (item.unlockType === 'streak') {
            const cur = catWardrobe.streak.current || 0;
            actionBtnHtml = `
              <div class="flex items-center gap-1.5 mt-2">
                ${tryBtn}
                <div class="flex-1 py-1 px-2 text-[10px] font-bold rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 text-center">
                  🔥 連續 ${cur}/${item.reqStreak || 3} 天
                </div>
              </div>`;
          } else if (item.unlockType === 'level') {
            actionBtnHtml = `
              <div class="flex items-center gap-1.5 mt-2">
                ${tryBtn}
                <div class="flex-1 py-1 px-2 text-[10px] font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-center">
                  🔒 Lv.${item.reqLevel} 解鎖
                </div>
              </div>`;
          } else if (item.unlockType === 'fish') {
            const catLvl = (typeof currentCatLevel !== 'undefined') ? currentCatLevel : 1;
            const isLevelLocked = (catLvl < (item.reqLevel || 1));
            const canAfford = fishCount >= item.price;
            if (isLevelLocked) {
              actionBtnHtml = `
                <div class="flex items-center gap-1.5 mt-2">
                  ${tryBtn}
                  <div class="flex-1 py-1 px-2 text-[10px] font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-400 text-center">
                    🔒 Lv.${item.reqLevel} (${item.price}魚)
                  </div>
                </div>`;
            } else {
              actionBtnHtml = `
                <div class="flex items-center gap-1.5 mt-2">
                  ${tryBtn}
                  <button onclick="unlockAccessoryWithFish('${tabKey}', '${item.id}', ${item.price})" class="flex-1 py-1 px-2 text-xs font-bold rounded-xl ${
                    canAfford
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  } transition flex items-center justify-center gap-1" ${canAfford ? '' : 'disabled'}>
                    <span>🐟</span> ${item.price}魚
                  </button>
                </div>`;
            }
          }
        }

        let badgeHtml = '';
        if (isPreviewing) {
          badgeHtml += '<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500 text-white font-black">試穿中</span>';
        } else if (isEquipped) {
          badgeHtml += '<span class="text-[10px] px-2 py-0.2 rounded-full bg-pink-500 text-white font-black">已裝備</span>';
        } else if (!isUnlocked && item.unlockType === 'fish') {
          badgeHtml += `<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold dark:bg-amber-950 dark:text-amber-300">🐟 ${item.price}</span>`;
        } else if (!isUnlocked && item.unlockType === 'level') {
          badgeHtml += `<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold dark:bg-purple-950 dark:text-purple-300">Lv.${item.reqLevel}</span>`;
        } else if (!isUnlocked && item.unlockType === 'streak') {
          badgeHtml += `<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold dark:bg-orange-950 dark:text-orange-300">🔥 ${item.reqStreak}天</span>`;
        }
        if (isNew) {
          badgeHtml = '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-black tracking-wide">NEW</span> ' + badgeHtml;
        }

        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between gap-1">
              <span class="text-2xl">${escapeWardrobeHtml(item.icon)}</span>
              <div class="flex items-center gap-1">${badgeHtml}</div>
            </div>
            <div class="font-bold text-xs text-slate-800 dark:text-white mt-1.5">${escapeWardrobeHtml(item.name)}</div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">${escapeWardrobeHtml(item.desc)}</div>
            ${swatchesHtml}
          </div>
          ${actionBtnHtml}
        `;
        grid.appendChild(card);
      });
    }

    function equipAccessory(category, itemId) {
      wardrobePreviewEquipped = null;
      const eqBase = parseEquippedId(catWardrobe.equipped[category]).baseId;
      const isAlreadyEquipped = eqBase === itemId;
      if (isAlreadyEquipped && itemId !== (category + '_none')) {
        catWardrobe.equipped[category] = category + '_none';
        sayCatSpeech("喵～脫下飾品，回歸純真自然的可愛小貓樣貌！🐾", "輕鬆換裝");
        document.getElementById('wardrobeCatSpeech').innerText = "喵～脫下飾品，清清爽爽好舒服！🐾";
      } else {
        catWardrobe.equipped[category] = itemId;
        playCatMeowSound();
        spawnFloatingHeart("✨");
        const reaction = ACCESSORY_REACTIONS[itemId] || "喵～這套造型好漂亮喔！謝謝主人幫我打扮～💖";
        sayCatSpeech(reaction, "開心換裝");
        document.getElementById('wardrobeCatSpeech').innerText = reaction;
      }
      saveCatWardrobe();
      renderCatAccessories();
      renderWardrobeItems(currentWardrobeTab);
    }

    function unlockAccessoryWithFish(category, itemId, price) {
      const catLvl = (typeof currentCatLevel !== 'undefined') ? currentCatLevel : 1;
      const item = WARDROBE_ITEMS_BY_ID[itemId];
      if (item && catLvl < (item.reqLevel || 1)) {
        alert(`這件造型需要貓咪達到 Lv.${item.reqLevel} 才能購買或於盲盒抽取喔！快去背單字升級吧喵～🐾`);
        return;
      }
      if (fishCount < price) {
        alert(`小魚乾不足喔！需要 ${price} 條小魚乾，多背背單字做測驗就能獲得囉喵～🐟`);
        return;
      }
      fishCount -= price;
      localStorage.setItem(FISH_STORAGE_KEY, fishCount);
      document.getElementById('fishCount').innerText = fishCount;
      document.getElementById('wardrobeFishCount').innerText = fishCount;
      if (!catWardrobe.unlocked.includes(itemId)) {
        catWardrobe.unlocked.push(itemId);
      }
      wardrobePreviewEquipped = null;
      catWardrobe.equipped[category] = itemId;
      saveCatWardrobe();
      playCatCheerSound();
      spawnFloatingHeart("💖");
      spawnFloatingHeart("🐟");
      const reaction = ACCESSORY_REACTIONS[itemId] || "哇！太棒了～新衣服好適合咪咪喔！💖";
      sayCatSpeech(`消耗 ${price} 條魚乾兌換造型！${reaction}`, "開箱新衣服");
      document.getElementById('wardrobeCatSpeech').innerText = reaction;
      renderCatAccessories();
      renderWardrobeItems(currentWardrobeTab);
    }

    function randomizeCatOutfit() {
      wardrobePreviewEquipped = null;
      WARDROBE_SLOTS.forEach(catKey => {
        const items = (WARDROBE_CATALOG[catKey] || []).filter(item => isItemReleased(item) && catWardrobe.unlocked.includes(item.id));
        if (items.length > 0) {
          const picked = items[Math.floor(Math.random() * items.length)];
          let fullId = picked.id;
          if (Array.isArray(picked.variants) && picked.variants.length > 1) {
            const unlockedVars = picked.variants.filter(v => v.id === 'default' || catWardrobe.unlocked.includes(getVariantFullId(picked.id, v.id)));
            if (unlockedVars.length > 0) {
              const pv = unlockedVars[Math.floor(Math.random() * unlockedVars.length)];
              fullId = getVariantFullId(picked.id, pv.id);
            }
          }
          catWardrobe.equipped[catKey] = fullId;
        }
      });
      playCatMeowSound();
      spawnFloatingHeart("🎲");
      const speech = "喵嗚～今天的全身隨機穿搭真特別！妳覺得我有沒有變更漂亮呢？✨🐾";
      sayCatSpeech(speech, "隨機打扮");
      document.getElementById('wardrobeCatSpeech').innerText = speech;
      saveCatWardrobe();
      renderCatAccessories();
      renderWardrobeItems(currentWardrobeTab);
    }

    function resetCatOutfit() {
      wardrobePreviewEquipped = null;
      catWardrobe.equipped = {
        head: 'head_none',
        face: 'face_none',
        neck: 'neck_none',
        outfit: 'outfit_none',
        hand: 'hand_none',
        aura: 'aura_none'
      };
      saveCatWardrobe();
      renderCatAccessories();
      renderWardrobeItems(currentWardrobeTab);
      sayCatSpeech("喵～所有衣服飾品都收進衣櫥囉！素顏小貓最純真可愛了對不對？🐾", "素顏小貓");
      document.getElementById('wardrobeCatSpeech').innerText = "喵～所有衣服飾品都收好囉！素顏小貓也超可愛對不對？🐾";
    }

    loadCatWardrobe();
    renderCatAccessories();
    loadWardrobePacks();