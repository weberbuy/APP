// ============================================================
// 🤖 AI 戰略夥伴與第一性原理思維教練 (v6.4.0 雙模式 + 本機脫敏 + 勾選式修改提案)
// ============================================================

const AI_PRIVACY_STORAGE_KEY = 'my_ai_privacy_config';
const AI_VALID_SLOTS = ['全天', '上午', '下午', '晚上', '夜間'];
const AI_VALID_RECURRENCES = ['none', 'daily', 'weekdays', 'weekly', 'monthly'];

let currentAiCoachThoughtId = null;
let currentAiMode = 'diagnose'; // 'diagnose' | 'global' | 'socratic'
let aiChatContext = [];
let activeSanitizerSession = null;
let lastOutboundPreviewText = '';
let currentAiProposals = [];
let _lastAiMutationSnapshot = null; // { createdAt, summary, count, thoughtsJson }
let _aiEntityIdSeed = 0;

let aiPrivacyConfig = {
    autoMaskPii: true,
    dictionary: [] // [{ id, real, alias }]
};

function genUniqueAiEntityId() {
    const now = Date.now();
    _aiEntityIdSeed = Math.max(now, _aiEntityIdSeed + 1);
    return _aiEntityIdSeed;
}

// ---------- 1. 本機脫敏設定存取與最高防護保險箱橋接 ----------
function normalizeAiPrivacyConfig(raw) {
    if (!raw || typeof raw !== 'object') {
        return { autoMaskPii: true, dictionary: [] };
    }
    const autoMaskPii = raw.autoMaskPii !== false;
    const dict = Array.isArray(raw.dictionary)
        ? raw.dictionary
            .filter(item => item && typeof item.real === 'string' && item.real.trim().length > 0)
            .map((item, idx) => ({
                id: item.id || (Date.now() + idx),
                real: item.real.trim(),
                alias: normalizeAliasToken(item.alias, idx + 1)
            }))
        : [];
    return { autoMaskPii, dictionary: dict };
}

function normalizeAliasToken(rawAlias, fallbackIndex = 1) {
    let clean = String(rawAlias || '').trim();
    if (!clean) {
        return `[代號_${fallbackIndex}]`;
    }
    // 確保以中括號包裹，讓雙向還原不會誤擊一般日常語句
    clean = clean.replace(/^\[+|\]+$/g, '').trim();
    if (!clean) return `[代號_${fallbackIndex}]`;
    return `[${clean}]`;
}

function initAiPrivacyConfigOnBoot() {
    if (typeof _bootAppLockProtected !== 'undefined' && _bootAppLockProtected) {
        aiPrivacyConfig = { autoMaskPii: true, dictionary: [] };
        return;
    }
    try {
        const raw = localStorage.getItem(AI_PRIVACY_STORAGE_KEY);
        if (raw) {
            aiPrivacyConfig = normalizeAiPrivacyConfig(JSON.parse(raw));
        }
    } catch (e) {
        aiPrivacyConfig = { autoMaskPii: true, dictionary: [] };
    }
}
initAiPrivacyConfigOnBoot();

function saveAiPrivacyConfig() {
    if (typeof isAppLockActiveAndLocked === 'function' && isAppLockActiveAndLocked()) return;
    aiPrivacyConfig = normalizeAiPrivacyConfig(aiPrivacyConfig);
    if (typeof isAppLockEnabled === 'function' && isAppLockEnabled()) {
        try { localStorage.removeItem(AI_PRIVACY_STORAGE_KEY); } catch (e) {}
        if (typeof persistEncryptedLocalVault === 'function') {
            persistEncryptedLocalVault();
        }
    } else {
        try {
            localStorage.setItem(AI_PRIVACY_STORAGE_KEY, JSON.stringify(aiPrivacyConfig));
        } catch (e) {}
    }
    refreshAiPrivacyStatusUI();
}

function getAiPrivacyConfigForVault() {
    return normalizeAiPrivacyConfig(aiPrivacyConfig);
}

function applyAiPrivacyConfigFromVault(cfg) {
    aiPrivacyConfig = normalizeAiPrivacyConfig(cfg);
}

function wipeAiMemoryForLock() {
    aiChatContext = [];
    activeSanitizerSession = null;
    lastOutboundPreviewText = '';
    currentAiProposals = [];
    _lastAiMutationSnapshot = null;
    aiPrivacyConfig = { autoMaskPii: true, dictionary: [] };
    updateAiUndoButtonsUI();
}

// ---------- 2. 卡片私密排除標記 (含母子拆解鏈繼承檢查) ----------
function isThoughtEffectivelyAiPrivate(thought) {
    if (!thought) return false;
    if (thought.isAiPrivate) return true;
    // 若母目標設為私密，拆解出的子/孫目標自動繼承私密保護
    let curr = thought;
    const visited = new Set();
    while (curr && curr.parentStepInfo && curr.parentStepInfo.parentThoughtId && !visited.has(curr.id)) {
        visited.add(curr.id);
        const parent = Array.isArray(thoughts) ? thoughts.find(x => x.id === curr.parentStepInfo.parentThoughtId) : null;
        if (!parent) break;
        if (parent.isAiPrivate) return true;
        curr = parent;
    }
    return false;
}

function toggleThoughtAiPrivate(thoughtId, evt) {
    if (evt) evt.stopPropagation();
    const t = Array.isArray(thoughts) ? thoughts.find(x => x.id === thoughtId) : null;
    if (!t) return;
    t.isAiPrivate = !Boolean(t.isAiPrivate);
    saveData();
    if (typeof showToast === 'function') {
        showToast(
            t.isAiPrivate
                ? '🔒 已設為「AI 私密排除」：全局戰略將自動略過此卡片與其子目標'
                : '🔓 已解除「AI 私密排除」：允許 AI 夥伴脫敏讀取此卡片',
            t.isAiPrivate ? 'info' : 'success'
        );
    }
}

// ---------- 3. 語意保留式雙向脫敏引擎 (Two-Phase Placeholder Engine) ----------
function classifyAmountMagnitude(rawMatch) {
    const str = String(rawMatch || '');
    const numPart = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
    let value = numPart;
    if (str.includes('億')) value = numPart * 100000000;
    else if (str.includes('萬')) value = numPart * 10000;
    else if (str.includes('千')) value = numPart * 1000;

    if (value >= 10000000) return '千萬級以上';
    if (value >= 1000000) return '百萬級';
    if (value >= 100000) return '十萬級';
    if (value >= 10000) return '萬元級';
    if (value >= 1000) return '千元級';
    return '百元級';
}

function createAiSanitizerSession() {
    const cfg = normalizeAiPrivacyConfig(aiPrivacyConfig);
    // 依真實詞長度由長到短排序，避免短詞切碎長詞（例如「台灣積體電路」優先於「台積電」）
    const sortedDict = [...cfg.dictionary].sort((a, b) => b.real.length - a.real.length);
    const reverseMap = new Map(); // alias -> real
    const forwardAutoMap = new Map(); // rawPii -> alias
    const usedAliases = new Set();

    sortedDict.forEach((entry, idx) => {
        let alias = normalizeAliasToken(entry.alias, idx + 1);
        let suffix = 2;
        while (usedAliases.has(alias) && reverseMap.get(alias) !== entry.real) {
            alias = `[${alias.slice(1, -1)}_${suffix++}]`;
        }
        usedAliases.add(alias);
        reverseMap.set(alias, entry.real);
        entry._effectiveAlias = alias;
    });

    let emailSeq = 1;
    let phoneSeq = 1;
    let idAcctSeq = 1;
    let amountSeq = 1;
    let dictHitCount = 0;
    let autoMaskHitCount = 0;

    function registerAutoToken(rawVal, prefix) {
        const key = String(rawVal);
        if (forwardAutoMap.has(key)) return forwardAutoMap.get(key);
        let token = `[${prefix}]`;
        while (usedAliases.has(token)) {
            token = `[${prefix}_x]`;
        }
        usedAliases.add(token);
        forwardAutoMap.set(key, token);
        reverseMap.set(token, key);
        return token;
    }

    function sanitizeText(input) {
        if (input === null || input === undefined) return '';
        let working = String(input);
        if (!working) return '';

        // 使用 Unicode Private Use Area 暫存標記，防止代號本身被後續規則二次誤替換
        const placeholders = [];
        const putPlaceholder = (aliasToken) => {
            const idx = placeholders.length;
            placeholders.push(aliasToken);
            return `\uE000${idx}\uE001`;
        };

        // 第一階段：套用使用者自訂私密詞庫
        for (const entry of sortedDict) {
            if (!entry.real) continue;
            if (working.includes(entry.real)) {
                const parts = working.split(entry.real);
                dictHitCount += (parts.length - 1);
                working = parts.join(putPlaceholder(entry._effectiveAlias));
            }
        }

        // 第二階段：自動規則遮罩 (Email、電話、證號/長帳號、敏感金額)
        if (cfg.autoMaskPii) {
            // 2.1 Email
            working = working.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (m) => {
                autoMaskHitCount++;
                const tok = forwardAutoMap.get(m) || registerAutoToken(m, `信箱_${emailSeq++}`);
                return putPlaceholder(tok);
            });

            // 2.2 台灣手機與市話號碼 (支援緊鄰中文字無空白情境)
            working = working.replace(/(?<![0-9])(?:(?:\+?886[-\s]?|0)9\d{2}[-\s]?\d{3}[-\s]?\d{3}|0\d{1,2}[-\s]\d{3,4}[-\s]\d{4})(?![0-9])/g, (m) => {
                autoMaskHitCount++;
                const tok = forwardAutoMap.get(m) || registerAutoToken(m, `電話_${phoneSeq++}`);
                return putPlaceholder(tok);
            });

            // 2.3 身分證字號或 10~19 碼連續純數字長帳號
            working = working.replace(/(?<![0-9A-Za-z])[A-Z][12]\d{8}(?![0-9A-Za-z])|(?<![0-9])\d{10,19}(?![0-9])/g, (m) => {
                autoMaskHitCount++;
                const tok = forwardAutoMap.get(m) || registerAutoToken(m, `帳號_${idAcctSeq++}`);
                return putPlaceholder(tok);
            });

            // 2.4 貨幣與金額數值 (保留量級語意供 AI 評估規模，排除萬步/萬字等非金額單位，並支援雙向還原)
            working = working.replace(/(?:NT\$|US\$|HK\$|\$|新台幣|台幣)\s*\d[\d,]*(?:\.\d+)?(?:\s*(?:萬元|億元|萬|億|千|百|元))?|(?<![0-9A-Za-z_-])\d[\d,]*(?:\.\d+)?\s*(?:萬元|億元|萬(?![步字人次里米])|億|元台幣|美金|美元)/gi, (m) => {
                autoMaskHitCount++;
                const mag = classifyAmountMagnitude(m);
                const tok = forwardAutoMap.get(m) || registerAutoToken(m, `金額_${mag}_${amountSeq++}`);
                return putPlaceholder(tok);
            });
        }

        // 還原暫存標記為正式代號
        working = working.replace(/\uE000(\d+)\uE001/g, (_, idxStr) => placeholders[Number(idxStr)] || '');
        return working;
    }

    function desanitizeText(output) {
        if (output === null || output === undefined) return '';
        let text = String(output);
        if (!text || reverseMap.size === 0) return text;
        const aliasesDesc = Array.from(reverseMap.keys()).sort((a, b) => b.length - a.length);
        for (const alias of aliasesDesc) {
            if (text.includes(alias)) {
                text = text.split(alias).join(reverseMap.get(alias));
            }
        }
        return text;
    }

    function desanitizeObject(val) {
        if (typeof val === 'string') return desanitizeText(val);
        if (Array.isArray(val)) return val.map(item => desanitizeObject(item));
        if (val && typeof val === 'object') {
            const out = {};
            for (const k of Object.keys(val)) {
                out[k] = desanitizeObject(val[k]);
            }
            return out;
        }
        return val;
    }

    function getStats() {
        return {
            dictSize: sortedDict.length,
            autoMaskPii: cfg.autoMaskPii,
            dictHitCount,
            autoMaskHitCount,
            activeMappingsCount: reverseMap.size
        };
    }

    return { sanitizeText, desanitizeText, desanitizeObject, getStats };
}

// ---------- 4. 單卡健檢 / 全局戰略 / 第一性原理 Prompt 組裝器 ----------
function buildSingleCardPromptPayload(thought, mode, sanitizer) {
    const s = sanitizer || createAiSanitizerSession();
    const milestones = (typeof getThoughtMilestones === 'function' ? getThoughtMilestones(thought) : [])
        .map((m, idx) => {
            const state = m.done ? '已達成' : '未達成';
            return `  - 第${idx + 1}棒 [${state}] ${s.sanitizeText(m.title || '')} (目標日: ${m.targetDate || '未指定日期'})`;
        }).join('\n') || '  (尚無設定階段里程碑)';

    const steps = (Array.isArray(thought.steps) ? thought.steps : []).map((st, idx) => {
        const doneTag = st.done ? '✅已完成' : '⬜待執行';
        const dateInfo = st.stepDate ? `${st.stepDate} [${st.stepTimeSlot || '全天'}]` : '未排日期';
        const durInfo = st.stepTime ? `預估:${st.stepTime}` : '未估時';
        const recInfo = (st.recurrence && st.recurrence !== 'none') ? `循環:${st.recurrence}` : '';
        const childInfo = st.linkedThoughtId ? '(已拆解為獨立子目標卡)' : '';
        return `  - [stepId:${st.id}] (${idx + 1}) ${doneTag}｜${s.sanitizeText(st.text || '')}｜${dateInfo}｜${durInfo} ${recInfo} ${childInfo}`.trim();
    }).join('\n') || '  (目前尚無任何步驟！)';

    const cardHeader = [
        `【當前基準日期】：${typeof todayStr !== 'undefined' ? todayStr : new Date().toISOString().slice(0, 10)}`,
        `【目標卡片 ID】：${thought.id}`,
        `【所屬領域】：${s.sanitizeText(thought.category || '💼 事業')}`,
        `【卡片標題】：${s.sanitizeText(thought.text || '')}`,
        `【最終目標】：${s.sanitizeText(thought.goal || thought.text || '')}`,
        `【目標截止日】：${thought.targetDate || '未指定日期'} (${thought.isMainFocus ? '⭐目前列為主推進目標' : '一般目標'})`,
        `【詳細備忘說明】：${s.sanitizeText(thought.detail || '無')}`,
        `【階段接力里程碑鏈】：\n${milestones}`,
        `【現有拆解步驟清單】：\n${steps}`
    ].join('\n');

    if (mode === 'socratic') {
        return `${cardHeader}\n\n你現在是一位精通「第一性原理 (First Principles)」的思維教練。
請嚴格遵守以下規則：
1. 每次只問「一個」銳利的問題。
2. 不斷質疑我的假設，剝除表象，逼出物理或現實層面的「基本事實 (Basic Truth)」。
3. 語氣要像一個沒有情緒、不受既有框架限制的第三方拷問者，直接指出盲點。
4. 若內容出現形如 [代號_1]、[客戶A]、[金額_百萬級_1] 等中括號代號，代表本機隱私脫敏代號，請在回覆中直接沿用相同中括號代號，勿猜測真實身分。
5. 當你認為已經逼出基本事實後，請引導我得出立即可執行的具體小行動。
現在，請先結合上方這張目標卡片與現有步驟，以一句簡短有力的開場白，詢問我目前在這個目標上最大的盲點或「理所當然」的假設是什麼。`;
    }

    // 預設：'diagnose' 單卡深度健檢模式
    return `${cardHeader}\n\n你現在是我的「AI 目標拆解與執行健檢夥伴」。請仔細閱讀上方這張目標卡片的所有資訊（若遇形如 [客戶A]、[代號_1]、[金額_百萬級_1] 等中括號代號，請直接原樣沿用該代號回覆）。
請以條理分明、具體務實的方式為我進行首次健檢（控制在精練易讀的篇幅）：
1. 🎯 **目標本質解讀**：一句話確認你理解的核心成果與關鍵成功條件，若目標定義太模糊請直接點出。
2. 🩺 **現行步驟診斷**：檢視現有步驟是否足以支撐達成目標？若有「顆粒度太大／太籠統、缺少前置關鍵動作、缺乏明確驗收產出、或未估時／未排程」的步驟，請直接點名指出建議怎麼改寫。
3. 🪜 **建議新增步驟或接力里程碑**：給出 2～4 個具體、可立即排入行事曆的行動步驟建議（含建議預估時數，如 0.5小時、1.5小時），若跨度較長也可建議中繼里程碑。
4. 最後請詢問我希望針對哪一點深入調整（確認方向後我可點擊下方按鈕讓你直接產生修改提案）。`;
}

function buildGlobalStrategyPromptPayload(sanitizer) {
    const s = sanitizer || createAiSanitizerSession();
    const allList = Array.isArray(thoughts) ? thoughts : [];
    let excludedPrivateCount = 0;
    let completedCount = 0;
    const activeVisible = [];

    for (const t of allList) {
        if (isThoughtEffectivelyAiPrivate(t)) {
            excludedPrivateCount++;
            continue;
        }
        if (t.goalDone) {
            completedCount++;
            continue;
        }
        activeVisible.push(t);
    }

    // 統計各領域分布
    const catStatsMap = new Map();
    activeVisible.forEach(t => {
        const cat = s.sanitizeText(t.category || '💼 事業');
        if (!catStatsMap.has(cat)) {
            catStatsMap.set(cat, { total: 0, mainFocus: 0, noPendingSteps: 0 });
        }
        const st = catStatsMap.get(cat);
        st.total++;
        if (t.isMainFocus) st.mainFocus++;
        const pendingSteps = (Array.isArray(t.steps) ? t.steps : []).filter(x => !x.done);
        if (pendingSteps.length === 0) st.noPendingSteps++;
    });

    const catSummaryLines = Array.from(catStatsMap.entries()).map(([cat, info]) =>
        `  - ${cat}：進行中 ${info.total} 項 (⭐主推進 ${info.mainFocus} 項，缺待辦步驟 ${info.noPendingSteps} 項)`
    ).join('\n') || '  (目前無進行中目標)';

    const goalSummaryLines = activeVisible.map((t, idx) => {
        const ms = (typeof getThoughtMilestones === 'function' ? getThoughtMilestones(t) : []);
        const msBrief = ms.length > 1
            ? `接力共${ms.length}棒(達成${ms.filter(m => m.done).length}棒, 末棒:${ms[ms.length - 1].targetDate || '未定'})`
            : `目標日:${t.targetDate || '未指定日期'}`;
        const allSteps = Array.isArray(t.steps) ? t.steps : [];
        const pendingSteps = allSteps.filter(x => !x.done);
        const sampleSteps = pendingSteps.slice(0, 4).map(st =>
            `[stepId:${st.id}] ${s.sanitizeText(st.text)}${st.stepDate ? '@' + st.stepDate : '(未排期)'}`
        ).join('；');
        return `  ${idx + 1}. [thoughtId:${t.id}] ${t.isMainFocus ? '⭐主推進 ' : ''}[${s.sanitizeText(t.category || '💼 事業')}] 標題：「${s.sanitizeText(t.text)}」｜目標：「${s.sanitizeText(t.goal || t.text)}」｜${msBrief}｜待辦步驟 ${pendingSteps.length} 項${sampleSteps ? '（' + sampleSteps + (pendingSteps.length > 4 ? '…' : '') + '）' : '（⚠️尚無待辦步驟）'}`;
    }).join('\n') || '  (目前沒有進行中的公開目標卡片)';

    // 僅附加未來不可排程時段的日期與時段（不傳送私人原因文字）
    const curDate = typeof todayStr !== 'undefined' ? todayStr : '';
    const upcomingBlocked = (Array.isArray(blockedSlots) ? blockedSlots : [])
        .filter(b => b && b.date && (!curDate || b.date >= curDate))
        .slice(0, 12)
        .map(b => `${b.date}[${b.timeSlot || b.slot || '全天'}]`)
        .join('、');

    const prompt = [
        `【當前基準日期】：${curDate || new Date().toISOString().slice(0, 10)}`,
        `【工時上限設定】：每日上限 ${typeof maxDailyHours !== 'undefined' ? maxDailyHours : 8} 小時｜每週上限 ${typeof maxWeeklyHours !== 'undefined' ? maxWeeklyHours : 40} 小時`,
        `【全局目標統計】：進行中目標 ${activeVisible.length} 項｜已完成歷史目標 ${completedCount} 項｜本機私密排除 ${excludedPrivateCount} 項（財務帳本已硬隔離未傳送）`,
        upcomingBlocked ? `【近期已鎖定不可排程時段】：${upcomingBlocked}` : '',
        `【各領域負載分布】：\n${catSummaryLines}`,
        `【進行中目標與步驟全景清單】：\n${goalSummaryLines}`,
        '',
        `你現在是我的「AI 人生與專案全局戰略夥伴」。請根據上方我的 LifeSchedule 全景資料（若遇形如 [客戶A]、[代號_1]、[金額_百萬級_1] 等脫敏代號，請原樣沿用該代號回覆），為我進行全局長程戰略盤點：`,
        `1. 🧭 **全局配置與優先級診斷**：檢視我的 ⭐主推進目標焦點是否過散或過載？各人生領域（如事業、健康、學習、家庭等）是否有明顯失衡或長期空白？`,
        `2. 🚧 **執行斷層與懸空目標抓漏**：點出哪些重要目標「有截止日卻缺乏具體步驟」或「現行步驟太薄弱無法支撐目標」，給出具體補強建議。`,
        `3. 🔭 **未來 3～12 個月長程規劃建議**：根據我目前的軌跡，建議還應該布局什麼「下一階段接力里程碑」或「全新長程目標卡片／關鍵步驟」？`,
        `4. 最後請詢問我想先聚焦哪一個領域或哪幾項建議（對齊想法後我可點擊下方按鈕讓你直接產生批次修改提案）。`
    ].filter(Boolean).join('\n');

    return { prompt, excludedPrivateCount, activeCount: activeVisible.length };
}

// ---------- 5. AI 視窗開啟、模式切換與 UI 控制 ----------
function ensureGeminiApiKeyOrPrompt() {
    const geminiKey = (typeof getVaultedApiKey === 'function' ? getVaultedApiKey('gemini_api_key') : localStorage.getItem('gemini_api_key'));
    if (!geminiKey || !geminiKey.trim()) {
        alert('請先在「⚙️ 設定 / 資料管理」中設定 Google Gemini API Key！');
        if (typeof openPiSettingsModal === 'function') openPiSettingsModal();
        return null;
    }
    return geminiKey.trim();
}

function openAiCoachModal(thoughtId, preferredMode = 'diagnose') {
    if (!ensureGeminiApiKeyOrPrompt()) return;
    const t = Array.isArray(thoughts) ? thoughts.find(x => x.id === thoughtId) : null;
    if (!t && preferredMode !== 'global') {
        openGlobalAiPartnerModal();
        return;
    }

    currentAiCoachThoughtId = t ? t.id : (thoughts[0]?.id || null);
    currentAiMode = preferredMode || 'diagnose';
    hideAiProposalPanel();

    const modal = document.getElementById('aiCoachModal');
    if (modal) modal.classList.remove('hidden');

    populateAiTargetSelect();
    refreshAiModeTabsUI();
    refreshAiPrivacyStatusUI();
    renderAiQuickPrompts();
    startAiSessionForCurrentMode(false);
}

function openGlobalAiPartnerModal(openPrivacyDrawer = false) {
    if (!openPrivacyDrawer && !ensureGeminiApiKeyOrPrompt()) return;
    if (!currentAiCoachThoughtId && Array.isArray(thoughts) && thoughts.length > 0) {
        const firstPublic = thoughts.find(x => !x.goalDone && !isThoughtEffectivelyAiPrivate(x)) || thoughts[0];
        currentAiCoachThoughtId = firstPublic ? firstPublic.id : null;
    }
    currentAiMode = 'global';
    hideAiProposalPanel();

    const modal = document.getElementById('aiCoachModal');
    if (modal) modal.classList.remove('hidden');

    populateAiTargetSelect();
    refreshAiModeTabsUI();
    refreshAiPrivacyStatusUI();
    renderAiQuickPrompts();

    if (openPrivacyDrawer) {
        const drawer = document.getElementById('aiPrivacyDrawer');
        if (drawer) drawer.classList.remove('hidden');
        renderAiPrivacyDictionaryList();
        const historyContainer = document.getElementById('aiChatHistory');
        if (historyContainer && !historyContainer.innerHTML.trim()) {
            historyContainer.innerHTML = `<div class="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 leading-relaxed">🛡️ 請於上方「本機脫敏詞庫」設定您想自動替換為代號的人名、公司名或專案關鍵字。設定完成後，點擊任一模式分頁即可開始安全對話。</div>`;
        }
        return;
    }

    startAiSessionForCurrentMode(false);
}

function switchAiPartnerMode(newMode) {
    if (!['diagnose', 'global', 'socratic'].includes(newMode)) return;
    if ((newMode === 'diagnose' || newMode === 'socratic') && !currentAiCoachThoughtId) {
        const candidate = Array.isArray(thoughts) ? (thoughts.find(x => !x.goalDone && !isThoughtEffectivelyAiPrivate(x)) || thoughts[0]) : null;
        if (!candidate) {
            alert('目前尚無目標卡片可供單卡分析，請先新增目標或使用全局戰略模式！');
            return;
        }
        currentAiCoachThoughtId = candidate.id;
    }
    currentAiMode = newMode;
    hideAiProposalPanel();
    populateAiTargetSelect();
    refreshAiModeTabsUI();
    renderAiQuickPrompts();
    startAiSessionForCurrentMode(false);
}

function onAiTargetThoughtChange(val) {
    const id = Number(val);
    if (!id) return;
    currentAiCoachThoughtId = id;
    hideAiProposalPanel();
    refreshAiModeTabsUI();
    if (currentAiMode === 'diagnose' || currentAiMode === 'socratic') {
        startAiSessionForCurrentMode(false);
    }
}

function populateAiTargetSelect() {
    const sel = document.getElementById('aiTargetThoughtSelect');
    const row = document.getElementById('aiTargetSelectRow');
    if (!sel || !row) return;

    if (currentAiMode === 'global') {
        row.classList.add('hidden');
        return;
    }
    row.classList.remove('hidden');

    const list = Array.isArray(thoughts) ? thoughts : [];
    sel.innerHTML = '';
    list.forEach(t => {
        const opt = document.createElement('option');
        opt.value = String(t.id);
        const privTag = isThoughtEffectivelyAiPrivate(t) ? '🔒 ' : '';
        const doneTag = t.goalDone ? '[已達成] ' : '';
        const label = `${privTag}${doneTag}[${t.category || '未分類'}] ${t.goal || t.text || '未命名'}`;
        opt.textContent = label.length > 52 ? label.slice(0, 52) + '…' : label;
        if (t.id === currentAiCoachThoughtId) opt.selected = true;
        sel.appendChild(opt);
    });
}

function refreshAiModeTabsUI() {
    const titleEl = document.getElementById('aiCoachModalMainTitle');
    const subEl = document.getElementById('aiCoachTargetTitle');
    const t = Array.isArray(thoughts) ? thoughts.find(x => x.id === currentAiCoachThoughtId) : null;

    const modeMeta = {
        diagnose: {
            title: 'AI 戰略夥伴 · 單卡步驟健檢',
            sub: t ? `目標：${t.goal || t.text}` : '請選擇要健檢的目標卡片'
        },
        global: {
            title: 'AI 戰略夥伴 · 全局長程戰略',
            sub: '跨領域盤點進行中目標、抓出執行斷層與規劃長程目標'
        },
        socratic: {
            title: '第一性原理 · 思維拷問教練',
            sub: t ? `目標：${t.goal || t.text}` : '剝除表象假設，逼出基本事實'
        }
    };

    const meta = modeMeta[currentAiMode] || modeMeta.diagnose;
    if (titleEl) titleEl.textContent = meta.title;
    if (subEl) subEl.textContent = meta.sub;

    ['diagnose', 'global', 'socratic'].forEach(m => {
        const btn = document.getElementById(`aiModeTab_${m}`);
        if (!btn) return;
        if (m === currentAiMode) {
            btn.className = 'flex-1 py-1.5 px-2 text-xs font-extrabold rounded-xl bg-indigo-600 text-white shadow-xs transition-all cursor-pointer whitespace-nowrap';
        } else {
            btn.className = 'flex-1 py-1.5 px-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-all cursor-pointer whitespace-nowrap';
        }
    });

    updateAiUndoButtonsUI();
}

function renderAiQuickPrompts() {
    const bar = document.getElementById('aiQuickPromptBar');
    if (!bar) return;

    const promptsByMode = {
        diagnose: [
            { label: '🔍 現有步驟哪裡不夠好？', text: '請嚴格檢視我目前的步驟，指出哪些太籠統或順序不對，並直接建議應該改寫成什麼具體行動？' },
            { label: '🪜 補齊達成目標的步驟', text: '請幫我規劃從現在到達成目標之間缺少的關鍵執行步驟（包含預估耗時與先後順序）。' },
            { label: '🏁 拆解階段接力里程碑', text: '這個目標跨度較大，請建議如何拆成 2～3 棒階段接力里程碑與對應時間點？' }
        ],
        global: [
            { label: '🔭 長程新目標與步驟建議', text: '根據我目前的領域與目標分布，未來 6～12 個月你建議我新增什麼長程目標或階段接力計畫？' },
            { label: '🚧 抓出缺步驟的懸空目標', text: '請幫我挑出目前最急迫但「缺乏具體執行步驟」的目標，直接建議每個目標的第一步行動。' },
            { label: '⚖️ 檢視主推進與工時平衡', text: '請評估我目前的主推進目標與各領域比重是否失衡？應該先收斂或調整哪一張卡片？' }
        ],
        socratic: [
            { label: '🎯 刺破我的核心假設', text: '請針對我剛才的想法，指出我最可能誤以為理所當然的假設是什麼？' },
            { label: '⚡ 收斂為最小行動步驟', text: '根據我們目前的討論，請幫我收斂出 1～2 個今天或本週就能立刻執行的具體小步驟。' }
        ]
    };

    const chips = promptsByMode[currentAiMode] || promptsByMode.diagnose;
    bar.innerHTML = chips.map((c, i) => `
        <button type="button" onclick="sendQuickAiPrompt(${i})" class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer whitespace-nowrap shrink-0">
            ${escapeHtml(c.label)}
        </button>
    `).join('');
    bar._currentChips = chips;
}

function sendQuickAiPrompt(chipIndex) {
    const bar = document.getElementById('aiQuickPromptBar');
    const chip = bar && Array.isArray(bar._currentChips) ? bar._currentChips[chipIndex] : null;
    if (!chip) return;
    const inputEl = document.getElementById('aiChatInput');
    if (inputEl) {
        inputEl.value = chip.text;
        sendAiMessage();
    }
}

function startAiSessionForCurrentMode(forceOverridePrivate = false) {
    activeSanitizerSession = createAiSanitizerSession();
    aiChatContext = [];
    currentAiProposals = [];

    const historyContainer = document.getElementById('aiChatHistory');
    if (historyContainer) historyContainer.innerHTML = '';
    const inputEl = document.getElementById('aiChatInput');
    if (inputEl) {
        inputEl.value = '';
        inputEl.placeholder = currentAiMode === 'global'
            ? '詢問全局優先級、長程目標規劃，或補充你的近期限制...'
            : '輸入你的想法、補充條件，或請 AI 調整建議方向...';
    }

    if (currentAiMode === 'global') {
        const { prompt, excludedPrivateCount, activeCount } = buildGlobalStrategyPromptPayload(activeSanitizerSession);
        aiChatContext = [{ role: 'user', parts: [{ text: prompt }] }];
        lastOutboundPreviewText = prompt;
        refreshAiPrivacyStatusUI(excludedPrivateCount);
        updateAiPayloadPreviewUI();
        appendSystemProtectionBanner(`🧭 已載入 ${activeCount} 張進行中目標摘要${excludedPrivateCount > 0 ? `（已自動排除 ${excludedPrivateCount} 張 🔒 私密卡片）` : ''}，財務帳本已 100% 隔離。`);
        invokeGeminiAPI();
        return;
    }

    const t = Array.isArray(thoughts) ? thoughts.find(x => x.id === currentAiCoachThoughtId) : null;
    if (!t) return;

    // 單卡若設為私密排除，必須經過使用者明確二次確認才發送
    if (isThoughtEffectivelyAiPrivate(t) && !forceOverridePrivate) {
        lastOutboundPreviewText = '（此卡片目前標記為 🔒 AI 私密排除，尚未傳送任何資料至 Gemini）';
        refreshAiPrivacyStatusUI(1);
        updateAiPayloadPreviewUI();
        if (historyContainer) {
            historyContainer.innerHTML = `
                <div class="bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 space-y-3 text-xs text-amber-950 dark:text-amber-200">
                    <div class="font-extrabold text-sm flex items-center gap-1.5">
                        <span>🔒</span>
                        <span>此目標卡片已標記為「AI 私密排除」</span>
                    </div>
                    <p class="leading-relaxed">為保護您的隱私，系統已攔截自動傳送。在全局戰略模式中此卡片會被完全略過；若您希望現在針對此卡片進行<strong>本機脫敏後</strong>的單卡健檢，請點擊下方按鈕確認。</p>
                    <div class="flex items-center gap-2 pt-1 flex-wrap">
                        <button type="button" onclick="startAiSessionForCurrentMode(true)" class="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 rounded-xl cursor-pointer transition-colors shadow-2xs">
                            🛡️ 確認以脫敏模式進行本次單卡分析
                        </button>
                        <button type="button" onclick="toggleAiPayloadPreview(true)" class="bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-bold px-3 py-2 rounded-xl cursor-pointer transition-colors">
                            ⚙️ 先設定脫敏詞庫
                        </button>
                    </div>
                </div>
            `;
        }
        return;
    }

    const prompt = buildSingleCardPromptPayload(t, currentAiMode, activeSanitizerSession);
    aiChatContext = [{ role: 'user', parts: [{ text: prompt }] }];
    lastOutboundPreviewText = prompt;
    refreshAiPrivacyStatusUI(0);
    updateAiPayloadPreviewUI();
    const stats = activeSanitizerSession.getStats();
    appendSystemProtectionBanner(`🛡️ 本機脫敏保護已生效（詞庫替換 ${stats.dictHitCount} 處 · 自動個資/金額遮罩 ${stats.autoMaskHitCount} 處 · 點擊上方「🔍 預覽傳送內容」可檢視原文）。`);
    invokeGeminiAPI();
}

function appendSystemProtectionBanner(msg) {
    const historyContainer = document.getElementById('aiChatHistory');
    if (!historyContainer) return;
    const banner = document.createElement('div');
    banner.className = 'text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 rounded-xl px-3 py-2 leading-relaxed';
    banner.textContent = msg;
    historyContainer.appendChild(banner);
}

// ---------- 6. 脫敏詞庫設定抽屜與傳送預覽面板 ----------
function toggleAiPrivacyDrawer() {
    const drawer = document.getElementById('aiPrivacyDrawer');
    if (!drawer) return;
    drawer.classList.toggle('hidden');
    if (!drawer.classList.contains('hidden')) {
        renderAiPrivacyDictionaryList();
    }
}

function toggleAiPayloadPreview(openDictInstead = false) {
    if (openDictInstead) {
        const drawer = document.getElementById('aiPrivacyDrawer');
        if (drawer) {
            drawer.classList.remove('hidden');
            renderAiPrivacyDictionaryList();
        }
        return;
    }
    const panel = document.getElementById('aiPayloadPreviewPanel');
    if (!panel) return;
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
        updateAiPayloadPreviewUI();
    }
}

function updateAiPayloadPreviewUI() {
    const box = document.getElementById('aiPayloadPreviewTextarea');
    if (!box) return;
    const inputEl = document.getElementById('aiChatInput');
    const draftRaw = inputEl ? inputEl.value.trim() : '';
    let preview = lastOutboundPreviewText || '（尚無傳送內容）';
    if (draftRaw && activeSanitizerSession) {
        const draftSanitized = activeSanitizerSession.sanitizeText(draftRaw);
        preview += `\n\n--- [目前輸入框草稿脫敏預覽] ---\n${draftSanitized}`;
    }
    box.value = preview;
}

function refreshAiPrivacyStatusUI(excludedPrivateCountOverride = null) {
    const badgeEl = document.getElementById('aiPrivacyStatusSummary');
    const autoCheckEl = document.getElementById('aiAutoMaskPiiCheckbox');
    const cfg = normalizeAiPrivacyConfig(aiPrivacyConfig);
    if (autoCheckEl) autoCheckEl.checked = cfg.autoMaskPii;

    const privCount = excludedPrivateCountOverride !== null
        ? excludedPrivateCountOverride
        : (Array.isArray(thoughts) ? thoughts.filter(t => isThoughtEffectivelyAiPrivate(t)).length : 0);

    if (badgeEl) {
        badgeEl.textContent = `🛡️ 詞庫 ${cfg.dictionary.length} 筆 · 自動遮罩${cfg.autoMaskPii ? '開' : '關'} · 私密排除 ${privCount} 卡`;
    }
}

function onToggleAiAutoMaskPii(checked) {
    aiPrivacyConfig.autoMaskPii = Boolean(checked);
    saveAiPrivacyConfig();
    if (activeSanitizerSession) {
        activeSanitizerSession = createAiSanitizerSession();
        updateAiPayloadPreviewUI();
    }
}

function addAiPrivacyDictEntry() {
    const realInput = document.getElementById('aiDictRealInput');
    const aliasInput = document.getElementById('aiDictAliasInput');
    const realVal = realInput ? realInput.value.trim() : '';
    const aliasVal = aliasInput ? aliasInput.value.trim() : '';

    if (!realVal) {
        alert('請輸入要保護的真實名稱（例如：人名、公司名、客戶或專案代號）！');
        if (realInput) realInput.focus();
        return;
    }

    if (!Array.isArray(aiPrivacyConfig.dictionary)) aiPrivacyConfig.dictionary = [];
    const existing = aiPrivacyConfig.dictionary.find(x => x.real === realVal);
    const nextIdx = aiPrivacyConfig.dictionary.length + 1;
    const normalizedAlias = normalizeAliasToken(aliasVal, nextIdx);

    if (existing) {
        existing.alias = normalizedAlias;
    } else {
        aiPrivacyConfig.dictionary.push({
            id: genUniqueAiEntityId(),
            real: realVal,
            alias: normalizedAlias
        });
    }

    if (realInput) realInput.value = '';
    if (aliasInput) aliasInput.value = '';
    saveAiPrivacyConfig();
    renderAiPrivacyDictionaryList();
    activeSanitizerSession = createAiSanitizerSession();
    updateAiPayloadPreviewUI();
    if (typeof showToast === 'function') {
        showToast(`🛡️ 已加入脫敏詞彙：傳送時將自動替換為 ${normalizedAlias}`, 'success');
    }
}

function removeAiPrivacyDictEntry(entryId) {
    if (!Array.isArray(aiPrivacyConfig.dictionary)) return;
    aiPrivacyConfig.dictionary = aiPrivacyConfig.dictionary.filter(x => x.id !== entryId);
    saveAiPrivacyConfig();
    renderAiPrivacyDictionaryList();
    activeSanitizerSession = createAiSanitizerSession();
    updateAiPayloadPreviewUI();
}

function renderAiPrivacyDictionaryList() {
    const listEl = document.getElementById('aiDictEntriesContainer');
    if (!listEl) return;
    const cfg = normalizeAiPrivacyConfig(aiPrivacyConfig);
    if (cfg.dictionary.length === 0) {
        listEl.innerHTML = `<div class="text-[11px] text-slate-400 py-1.5">尚無自訂詞彙。新增如「台積電 ➔ 客戶A」後，傳給 Gemini 時會自動換成 [客戶A]，AI 回覆時再自動還原回「台積電」。</div>`;
        return;
    }
    listEl.innerHTML = cfg.dictionary.map(item => `
        <div class="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1 text-[11px]">
            <span class="font-bold text-slate-700 dark:text-slate-200">${escapeHtml(item.real)}</span>
            <span class="text-slate-400">⇄</span>
            <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400">${escapeHtml(item.alias)}</span>
            <button type="button" onclick="removeAiPrivacyDictEntry(${Number(item.id)})" class="text-slate-400 hover:text-rose-500 font-bold ml-1 cursor-pointer" title="刪除此詞彙">✕</button>
        </div>
    `).join('');
}

// ---------- 7. 關閉視窗與一般聊天訊息收發 ----------
function closeAiCoachModal() {
    const modal = document.getElementById('aiCoachModal');
    if (modal) modal.classList.add('hidden');
    hideAiProposalPanel();
    aiChatContext = [];
    activeSanitizerSession = null;
    lastOutboundPreviewText = '';
    currentAiProposals = [];
}

function appendChatMessage(role, text) {
    const historyContainer = document.getElementById('aiChatHistory');
    if (!historyContainer) return;
    const wrapper = document.createElement('div');
    wrapper.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
    const bubble = document.createElement('div');
    bubble.className = `max-w-[88%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-tl-sm'}`;
    bubble.textContent = text;
    wrapper.appendChild(bubble);
    historyContainer.appendChild(wrapper);
    historyContainer.scrollTop = historyContainer.scrollHeight;
}

function appendChatLoading(label = 'AI 夥伴思考與推演中...') {
    removeChatLoading();
    const historyContainer = document.getElementById('aiChatHistory');
    if (!historyContainer) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'aiChatLoading';
    wrapper.className = 'flex justify-start';
    wrapper.innerHTML = `<div class="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200 dark:border-slate-600 text-xs font-bold animate-pulse">${escapeHtml(label)}</div>`;
    historyContainer.appendChild(wrapper);
    historyContainer.scrollTop = historyContainer.scrollHeight;
}

function removeChatLoading() {
    const loading = document.getElementById('aiChatLoading');
    if (loading) loading.remove();
}

// ---------- 8. Gemini 模型探測與低階請求核心 ----------
let _geminiWorkingModel = (function() {
    try { return (typeof localStorage !== 'undefined' && localStorage.getItem('gemini_preferred_model')) || null; } catch (e) { return null; }
})();
let _geminiWorkingVersion = (function() {
    try { return (typeof localStorage !== 'undefined' && localStorage.getItem('gemini_preferred_version')) || 'v1beta'; } catch (e) { return 'v1beta'; }
})();
let _geminiCachedUsableModels = [];

function isTextChatGeminiModel(modelName) {
    if (!modelName) return false;
    const m = String(modelName).toLowerCase();
    if (!m.includes('gemini')) return false;
    const excludedKeywords = [
        'embedding', 'aqa', 'imagen', 'veo', 'tts', 'audio', 'image',
        'robotics', 'computer-use', 'deep-research', 'transcribe', 'live', 'vision'
    ];
    return !excludedKeywords.some(k => m.includes(k));
}

function isTransientGeminiError(status, errMsg) {
    if ([429, 500, 502, 503, 504].includes(Number(status))) return true;
    const msg = String(errMsg || '').toLowerCase();
    return msg.includes('high demand') ||
           msg.includes('overloaded') ||
           msg.includes('unavailable') ||
           msg.includes('try again later') ||
           msg.includes('resource exhausted') ||
           msg.includes('rate limit') ||
           msg.includes('quota exceeded');
}

function sleepMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateChatLoadingText(label) {
    const loading = document.getElementById('aiChatLoading');
    if (loading && loading.firstElementChild) {
        loading.firstElementChild.textContent = label;
    } else {
        appendChatLoading(label);
    }
}

function appendChatErrorWithRetry(errText) {
    const historyContainer = document.getElementById('aiChatHistory');
    if (!historyContainer) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'flex justify-start';
    const bubble = document.createElement('div');
    bubble.className = 'max-w-[88%] rounded-2xl rounded-tl-sm px-4 py-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 shadow-sm space-y-2';
    bubble.innerHTML = `
        <div class="whitespace-pre-wrap leading-relaxed font-medium">${escapeHtml(errText)}</div>
        <div class="flex items-center gap-2 pt-0.5 flex-wrap">
            <button type="button" onclick="retryLastGeminiCall(this)" class="text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg shadow-2xs cursor-pointer transition-colors">🔄 立即重試</button>
            <button type="button" onclick="closeAiCoachModal(); if(typeof openPiSettingsModal==='function') openPiSettingsModal();" class="text-[11px] font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-2.5 py-1 rounded-lg cursor-pointer transition-colors">⚙️ 切換預設模型</button>
        </div>
    `;
    wrapper.appendChild(bubble);
    historyContainer.appendChild(wrapper);
    historyContainer.scrollTop = historyContainer.scrollHeight;
}

function retryLastGeminiCall(btnEl) {
    if (btnEl) {
        const bubbleWrap = btnEl.closest ? btnEl.closest('.flex') : null;
        if (bubbleWrap && bubbleWrap.remove) bubbleWrap.remove();
    }
    if (aiChatContext && aiChatContext.length > 0) {
        invokeGeminiAPI();
    }
}

function pickBestGeminiModel(models) {
    if (!models || models.length === 0) return null;
    const chatModels = models.filter(isTextChatGeminiModel);
    const pool = chatModels.length > 0 ? chatModels : models;
    // 優先挑選非 preview/exp 的穩定版 Flash，降低尖峰時段 503 high demand 機率
    const stablePool = pool.filter(m => !/preview|exp/i.test(m));
    return stablePool.find(m => m.match(/gemini-2\.5-flash$/i)) ||
           stablePool.find(m => m.match(/gemini-3.*flash/i)) ||
           stablePool.find(m => m.match(/gemini-2.*flash/i)) ||
           pool.find(m => m.match(/gemini-2\.5-flash/i)) ||
           pool.find(m => m.match(/gemini-3.*flash/i)) ||
           pool.find(m => m.match(/gemini-2.*flash/i)) ||
           pool.find(m => m.includes('flash')) ||
           pool[0];
}

function buildOrderedFallbackModels(primaryModel, cachedModels) {
    const rawList = [];
    if (primaryModel) rawList.push(primaryModel);
    // 內建高穩定度備援梯隊（避免首選預覽版 503 時無備援可切）
    const stableBackups = [
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-2.5-pro',
        'gemini-3-flash',
        'gemini-3.1-pro'
    ];
    if (Array.isArray(cachedModels)) {
        const validCached = cachedModels.filter(isTextChatGeminiModel);
        // 優先將穩定版排在預覽版之前作為備援
        const stableCached = validCached.filter(m => !/preview|exp/i.test(m));
        const previewCached = validCached.filter(m => /preview|exp/i.test(m));
        rawList.push(...stableCached, ...stableBackups, ...previewCached);
    } else {
        rawList.push(...stableBackups);
    }
    return [...new Set(rawList.filter(Boolean))];
}

async function detectAvailableGeminiModel(apiKey) {
    if (!apiKey) return null;
    const key = apiKey.trim();
    const versions = ['v1beta', 'v1'];
    for (const ver of versions) {
        try {
            const url = `https://generativelanguage.googleapis.com/${ver}/models?key=${encodeURIComponent(key)}`;
            const res = await fetch(url, {
                headers: { 'x-goog-api-key': key }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.models && Array.isArray(data.models)) {
                    const allGen = data.models
                        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                        .map(m => m.name.replace('models/', ''));
                    const chatOnly = allGen.filter(isTextChatGeminiModel);
                    const usable = chatOnly.length > 0 ? chatOnly : allGen;
                    if (usable.length > 0) {
                        const preferred = pickBestGeminiModel(usable);
                        return { model: preferred, version: ver, allUsable: usable };
                    }
                }
            }
        } catch (e) {
            console.warn(`[探測 ${ver} 端點異常]`, e);
        }
    }
    return null;
}

function updateGeminiModelUI(models, selectedModel) {
    const configBlock = document.getElementById('geminiModelConfigBlock');
    const selectEl = document.getElementById('geminiModelSelect');
    const textEl = document.getElementById('geminiDetectedModelsText');

    if (configBlock) configBlock.classList.remove('hidden');
    if (textEl && Array.isArray(models)) {
        textEl.value = models.join('\n');
    }

    if (selectEl && Array.isArray(models) && models.length > 0) {
        selectEl.innerHTML = '';
        models.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m + (m === selectedModel ? ' (推薦/預設)' : '');
            if (m === selectedModel) opt.selected = true;
            selectEl.appendChild(opt);
        });
    }
}

function onGeminiModelSelectChange(val) {
    if (!val) return;
    _geminiWorkingModel = val;
    try { localStorage.setItem('gemini_preferred_model', val); } catch (e) {}
    const statusEl = document.getElementById('geminiKeyStatusText');
    if (statusEl) statusEl.textContent = `🎯 已選用模型：${val}`;
    if (typeof showToast === 'function') showToast(`🎯 已套用模型：${val}`, 'success');
}

function copyGeminiDetectedModels() {
    const textEl = document.getElementById('geminiDetectedModelsText');
    if (!textEl || !textEl.value) {
        if (typeof showToast === 'function') showToast('尚未有可複製的模型清單，請先點擊檢測按鈕！', 'warning');
        return;
    }
    textEl.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textEl.value).then(() => {
            if (typeof showToast === 'function') showToast('📋 已成功複製可用模型清單至剪貼簿！', 'success');
        }).catch(() => {
            document.execCommand('copy');
            if (typeof showToast === 'function') showToast('📋 已複製可用模型清單！', 'success');
        });
    } else {
        document.execCommand('copy');
        if (typeof showToast === 'function') showToast('📋 已複製可用模型清單！', 'success');
    }
}

async function testGeminiApiKey() {
    const input = document.getElementById('geminiApiKeyInput');
    const key = (input ? input.value : (typeof getVaultedApiKey === 'function' ? getVaultedApiKey('gemini_api_key') : localStorage.getItem('gemini_api_key')))?.trim();
    if (!key) {
        alert('請先輸入 Google Gemini API Key 再執行檢測！');
        if (input) input.focus();
        return;
    }

    const statusEl = document.getElementById('geminiKeyStatusText');
    if (statusEl) statusEl.textContent = '⏳ 正在連線 Google 伺服器探測模型清單...';

    try {
        const detected = await detectAvailableGeminiModel(key);
        if (detected) {
            _geminiWorkingModel = detected.model;
            _geminiWorkingVersion = detected.version;
            _geminiCachedUsableModels = detected.allUsable;
            try {
                localStorage.setItem('gemini_preferred_model', detected.model);
                localStorage.setItem('gemini_preferred_version', detected.version);
                localStorage.setItem('gemini_cached_models', JSON.stringify(detected.allUsable));
            } catch (e) {}

            updateGeminiModelUI(detected.allUsable, detected.model);

            if (statusEl) statusEl.textContent = `✅ 連線成功！已匹配最佳模型：${detected.model} (${detected.version})`;
            if (typeof showToast === 'function') showToast(`🎉 檢測成功！已匹配最新模型：${detected.model}`, 'success');
        } else {
            const errRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
            const errData = await errRes.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${errRes.status}`;
            if (statusEl) statusEl.textContent = `❌ 連線失敗：${errMsg}`;
            alert(`❌ 連線檢測失敗：\n${errMsg}\n\n💡 排除指引：\n1. 請確認金鑰是自 Google AI Studio (aistudio.google.com) 取得。\n2. 若使用 Google Cloud 專案金鑰，請確認專案中已「啟用 Generative Language API」。`);
        }
    } catch (e) {
        if (statusEl) statusEl.textContent = `❌ 網路連線錯誤：${e.message}`;
        alert(`❌ 網路連線異常：${e.message}`);
    }
}

async function requestGeminiGenerateContent(contentsPayload, requestJsonMime = false, onStatusUpdate = null) {
    const rawKey = (typeof getVaultedApiKey === 'function' ? getVaultedApiKey('gemini_api_key') : localStorage.getItem('gemini_api_key'));
    if (!rawKey || !rawKey.trim()) {
        throw new Error('尚未設定 Google Gemini API Key');
    }
    const apiKey = rawKey.trim();

    let cachedModels = [];
    try {
        const cachedRaw = localStorage.getItem('gemini_cached_models');
        if (cachedRaw) {
            const arr = JSON.parse(cachedRaw);
            if (Array.isArray(arr)) cachedModels = arr;
        }
    } catch (e) {}

    if (!_geminiWorkingModel && cachedModels.length === 0) {
        const detected = await detectAvailableGeminiModel(apiKey);
        if (detected) {
            _geminiWorkingModel = detected.model;
            _geminiWorkingVersion = detected.version;
            cachedModels = detected.allUsable;
            try {
                localStorage.setItem('gemini_preferred_model', detected.model);
                localStorage.setItem('gemini_preferred_version', detected.version);
                localStorage.setItem('gemini_cached_models', JSON.stringify(detected.allUsable));
            } catch (e) {}
        }
    }

    const primaryModel = _geminiWorkingModel || cachedModels[0] || 'gemini-2.5-flash';
    // 最多嘗試 6 個不同候選模型（首選 + 5 個高穩定度備援），避免尖峰壅塞卡死
    const uniqueCandidates = buildOrderedFallbackModels(primaryModel, cachedModels).slice(0, 6);
    const versions = [_geminiWorkingVersion, 'v1beta', 'v1'].filter(Boolean);
    const uniqueVersions = [...new Set(versions)];

    let lastErrorMsg = '';
    let hadTransientSpike = false;

    for (let mIdx = 0; mIdx < uniqueCandidates.length; mIdx++) {
        const model = uniqueCandidates[mIdx];
        const isPrimary = (mIdx === 0);
        if (!isPrimary && typeof onStatusUpdate === 'function') {
            onStatusUpdate(`⚡ 主模型壅塞，自動切換備援模型 (${model}) 推演中...`);
        }

        for (const ver of uniqueVersions) {
            // 首選模型若遇 503/429 尖峰壅塞，短暫退避 1.2 秒重試一次；仍壅塞則立即切往備援模型
            const maxAttempts = isPrimary ? 2 : 1;
            let shouldSwitchModel = false;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    const u = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
                    const bodyObj = { contents: contentsPayload };
                    if (requestJsonMime && ver === 'v1beta') {
                        bodyObj.generationConfig = { responseMimeType: 'application/json' };
                    }
                    const response = await fetch(u, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-goog-api-key': apiKey
                        },
                        body: JSON.stringify(bodyObj)
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        // 僅在首選模型成功或原本未指定模型時更新預設記憶；備援成功不覆寫使用者偏好的主模型
                        if (isPrimary || !_geminiWorkingModel) {
                            _geminiWorkingModel = model;
                            _geminiWorkingVersion = ver;
                            try {
                                localStorage.setItem('gemini_preferred_model', model);
                                localStorage.setItem('gemini_preferred_version', ver);
                            } catch (e) {}
                        }
                        return {
                            ok: true,
                            text: aiText,
                            usedModel: model,
                            usedFallback: !isPrimary,
                            primaryModel
                        };
                    } else {
                        const err = await response.json().catch(() => ({}));
                        lastErrorMsg = err.error?.message || `HTTP ${response.status}`;

                        // 若部分模型在 v1beta 不支援 responseMimeType，自動降級為純文字重試一次
                        if (requestJsonMime && response.status === 400) {
                            const fallbackRes = await fetch(u, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
                                body: JSON.stringify({ contents: contentsPayload })
                            });
                            if (fallbackRes.ok) {
                                const fbData = await fallbackRes.json();
                                return {
                                    ok: true,
                                    text: fbData.candidates?.[0]?.content?.parts?.[0]?.text || '',
                                    usedModel: model,
                                    usedFallback: !isPrimary,
                                    primaryModel
                                };
                            }
                        }

                        // 404 Not Found：嘗試下一個 API 版本或下一個模型
                        if (response.status === 404 || lastErrorMsg.toLowerCase().includes('not found')) {
                            break;
                        }

                        // 503 High Demand / 429 Quota / 500 暫時壅塞：退避重試後自動切換備援模型
                        if (isTransientGeminiError(response.status, lastErrorMsg)) {
                            hadTransientSpike = true;
                            if (attempt < maxAttempts) {
                                if (typeof onStatusUpdate === 'function') {
                                    onStatusUpdate(`⏳ ${model} 尖峰壅塞，1 秒後自動重試...`);
                                }
                                await sleepMs(1200);
                                continue;
                            }
                            shouldSwitchModel = true;
                            break;
                        }

                        // 401/403 API Key 無效等非暫時性錯誤，立即回報
                        return { ok: false, error: lastErrorMsg };
                    }
                } catch (error) {
                    lastErrorMsg = '網路連線異常';
                    shouldSwitchModel = true;
                    break;
                }
            }

            if (shouldSwitchModel) break;
        }
    }

    if (hadTransientSpike) {
        return {
            ok: false,
            error: `Google 伺服器目前多組模型皆處於尖峰高負載狀態（已自動重試並嘗試 ${uniqueCandidates.length} 組備援模型仍壅塞）。\n最後回應：${lastErrorMsg}\n\n💡 建議：點擊下方「🔄 立即重試」，或至「⚙️ 設定」改選較穩定的模型（如 gemini-2.5-flash）。`
        };
    }

    return {
        ok: false,
        error: `無法存取所選 Gemini 模型（${lastErrorMsg || '404 Not Found'}）。建議至右上角「⚙️ 設定」點擊「⚡ 檢測金鑰與可用模型」。`
    };
}

async function invokeGeminiAPI() {
    appendChatLoading();
    try {
        const res = await requestGeminiGenerateContent(aiChatContext, false, updateChatLoadingText);
        removeChatLoading();
        if (res.ok) {
            // 模型原始回覆保留代號存入 aiChatContext，顯示給使用者時在本機記憶體自動還原真實名稱
            aiChatContext.push({ role: 'model', parts: [{ text: res.text }] });
            if (res.usedFallback && res.usedModel) {
                appendSystemProtectionBanner(`⚡ 主模型 (${res.primaryModel}) 目前尖峰壅塞，已自動無縫切換備援模型 (${res.usedModel}) 完成本次回覆。`);
            }
            const displayReply = activeSanitizerSession ? activeSanitizerSession.desanitizeText(res.text) : res.text;
            appendChatMessage('model', displayReply);
        } else {
            appendChatErrorWithRetry(`[API 錯誤] ${res.error}`);
        }
    } catch (e) {
        removeChatLoading();
        appendChatErrorWithRetry(`[連線錯誤] ${e.message || '未知的連線異常'}`);
    }
}

function sendAiMessage() {
    const inputEl = document.getElementById('aiChatInput');
    if (!inputEl) return;
    const rawUserText = inputEl.value.trim();
    if (!rawUserText) return;

    // 若因卡片原為私密尚未初始化對話，先自動以脫敏模式啟動上下文
    if (aiChatContext.length === 0) {
        if (!activeSanitizerSession) activeSanitizerSession = createAiSanitizerSession();
        if (currentAiMode === 'global') {
            const { prompt } = buildGlobalStrategyPromptPayload(activeSanitizerSession);
            aiChatContext.push({ role: 'user', parts: [{ text: prompt }] });
        } else {
            const t = Array.isArray(thoughts) ? thoughts.find(x => x.id === currentAiCoachThoughtId) : null;
            if (t) {
                const prompt = buildSingleCardPromptPayload(t, currentAiMode, activeSanitizerSession);
                aiChatContext.push({ role: 'user', parts: [{ text: prompt }] });
            }
        }
    }

    const sanitizedUserText = activeSanitizerSession ? activeSanitizerSession.sanitizeText(rawUserText) : rawUserText;
    appendChatMessage('user', rawUserText);
    aiChatContext.push({ role: 'user', parts: [{ text: sanitizedUserText }] });
    lastOutboundPreviewText += `\n\n--- [使用者追問 (脫敏後)] ---\n${sanitizedUserText}`;
    inputEl.value = '';
    refreshAiPrivacyStatusUI();
    updateAiPayloadPreviewUI();
    invokeGeminiAPI();
}

// ---------- 9. 結構化修改提案產生器、勾選微調面板與一鍵復原 ----------
function extractJsonFromAiResponse(rawText) {
    if (!rawText) return null;
    const trimmed = String(rawText).trim();
    try {
        return JSON.parse(trimmed);
    } catch (_) {}

    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch && fenceMatch[1]) {
        try {
            return JSON.parse(fenceMatch[1].trim());
        } catch (_) {}
    }

    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
            return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
        } catch (_) {}
    }
    return null;
}

function sanitizeDateField(val, allowUnspecified = false) {
    const s = String(val || '').trim().replace(/\//g, '-');
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    return allowUnspecified ? '未指定日期' : '';
}

function normalizeRawProposals(parsedObj) {
    const ops = Array.isArray(parsedObj)
        ? parsedObj
        : (parsedObj && Array.isArray(parsedObj.operations) ? parsedObj.operations : []);
    const validOps = [];

    ops.forEach((rawOp, idx) => {
        if (!rawOp || typeof rawOp !== 'object') return;
        const opType = String(rawOp.op || '').trim();
        if (!['add_step', 'update_step', 'add_milestone', 'add_thought', 'update_thought'].includes(opType)) return;

        let targetThoughtId = rawOp.thoughtId ? Number(rawOp.thoughtId) : null;
        if (!targetThoughtId && currentAiMode !== 'global' && currentAiCoachThoughtId) {
            targetThoughtId = currentAiCoachThoughtId;
        }
        const targetThought = targetThoughtId && Array.isArray(thoughts)
            ? thoughts.find(x => x.id === targetThoughtId)
            : null;

        if (opType !== 'add_thought' && !targetThought) return;

        if (opType === 'update_step') {
            const stepId = Number(rawOp.stepId);
            const existingStep = (targetThought.steps || []).find(st => st.id === stepId);
            if (!existingStep) {
                // 若模型給錯 stepId，安全降級為新增步驟，絕不誤改其他步驟
                validOps.push({
                    uid: `prop_${idx}_${Date.now()}`,
                    checked: true,
                    op: 'add_step',
                    thoughtId: targetThought.id,
                    thoughtLabel: targetThought.goal || targetThought.text,
                    text: String(rawOp.text || '').trim(),
                    stepDate: sanitizeDateField(rawOp.stepDate, false),
                    stepTime: String(rawOp.stepTime || '1小時').trim(),
                    stepTimeSlot: AI_VALID_SLOTS.includes(rawOp.stepTimeSlot) ? rawOp.stepTimeSlot : '全天',
                    recurrence: AI_VALID_RECURRENCES.includes(rawOp.recurrence) ? rawOp.recurrence : 'none',
                    reason: String(rawOp.reason || '補充具體行動步驟').trim()
                });
                return;
            }
            validOps.push({
                uid: `prop_${idx}_${Date.now()}`,
                checked: true,
                op: 'update_step',
                thoughtId: targetThought.id,
                thoughtLabel: targetThought.goal || targetThought.text,
                stepId: existingStep.id,
                oldText: existingStep.text || '',
                oldDate: existingStep.stepDate || '',
                oldTime: existingStep.stepTime || '',
                text: String(rawOp.text || existingStep.text || '').trim(),
                stepDate: rawOp.stepDate !== undefined ? sanitizeDateField(rawOp.stepDate, false) : (existingStep.stepDate || ''),
                stepTime: String(rawOp.stepTime || existingStep.stepTime || '1小時').trim(),
                stepTimeSlot: AI_VALID_SLOTS.includes(rawOp.stepTimeSlot) ? rawOp.stepTimeSlot : (existingStep.stepTimeSlot || '全天'),
                reason: String(rawOp.reason || '具體化並優化執行步驟').trim()
            });
            return;
        }

        if (opType === 'add_step') {
            const txt = String(rawOp.text || '').trim();
            if (!txt) return;
            validOps.push({
                uid: `prop_${idx}_${Date.now()}`,
                checked: true,
                op: 'add_step',
                thoughtId: targetThought.id,
                thoughtLabel: targetThought.goal || targetThought.text,
                text: txt,
                stepDate: sanitizeDateField(rawOp.stepDate, false),
                stepTime: String(rawOp.stepTime || '1小時').trim(),
                stepTimeSlot: AI_VALID_SLOTS.includes(rawOp.stepTimeSlot) ? rawOp.stepTimeSlot : '全天',
                recurrence: AI_VALID_RECURRENCES.includes(rawOp.recurrence) ? rawOp.recurrence : 'none',
                reason: String(rawOp.reason || '新增達成目標之關鍵步驟').trim()
            });
            return;
        }

        if (opType === 'add_milestone') {
            const title = String(rawOp.title || rawOp.goal || rawOp.text || '').trim();
            if (!title) return;
            validOps.push({
                uid: `prop_${idx}_${Date.now()}`,
                checked: true,
                op: 'add_milestone',
                thoughtId: targetThought.id,
                thoughtLabel: targetThought.goal || targetThought.text,
                title,
                targetDate: sanitizeDateField(rawOp.targetDate, true),
                targetTimeSlot: AI_VALID_SLOTS.includes(rawOp.targetTimeSlot) ? rawOp.targetTimeSlot : '全天',
                reason: String(rawOp.reason || '新增階段接力里程碑').trim()
            });
            return;
        }

        if (opType === 'update_thought') {
            validOps.push({
                uid: `prop_${idx}_${Date.now()}`,
                checked: true,
                op: 'update_thought',
                thoughtId: targetThought.id,
                thoughtLabel: targetThought.goal || targetThought.text,
                oldGoal: targetThought.goal || targetThought.text,
                oldDate: targetThought.targetDate || '未指定日期',
                goal: String(rawOp.goal || rawOp.text || targetThought.goal || '').trim(),
                detail: rawOp.detail !== undefined ? String(rawOp.detail).trim() : (targetThought.detail || ''),
                targetDate: rawOp.targetDate ? sanitizeDateField(rawOp.targetDate, true) : (targetThought.targetDate || '未指定日期'),
                reason: String(rawOp.reason || '明確化目標定義與時程').trim()
            });
            return;
        }

        if (opType === 'add_thought') {
            const title = String(rawOp.text || rawOp.goal || '').trim();
            if (!title) return;
            const subSteps = Array.isArray(rawOp.steps)
                ? rawOp.steps
                    .filter(st => st && String(st.text || '').trim())
                    .slice(0, 6)
                    .map(st => ({
                        text: String(st.text).trim(),
                        stepDate: sanitizeDateField(st.stepDate, false),
                        stepTime: String(st.stepTime || '1小時').trim(),
                        stepTimeSlot: AI_VALID_SLOTS.includes(st.stepTimeSlot) ? st.stepTimeSlot : '全天'
                    }))
                : [];
            validOps.push({
                uid: `prop_${idx}_${Date.now()}`,
                checked: true,
                op: 'add_thought',
                category: String(rawOp.category || '💼 事業').trim(),
                text: title,
                goal: String(rawOp.goal || title).trim(),
                detail: String(rawOp.detail || '').trim(),
                targetDate: sanitizeDateField(rawOp.targetDate, true),
                steps: subSteps,
                reason: String(rawOp.reason || '長程戰略布局新目標卡片').trim()
            });
        }
    });

    return {
        summary: String((parsedObj && parsedObj.summary) || '根據對話共識整理之行動與目標修改建議').trim(),
        operations: validOps
    };
}

async function generateAiActionProposal() {
    if (!aiChatContext || aiChatContext.length < 2) {
        alert('請先等待 AI 夥伴完成初步分析或進行討論後，再點擊產生修改提案！');
        return;
    }

    const genBtn = document.getElementById('aiGenerateProposalBtn');
    if (genBtn) genBtn.disabled = true;
    appendChatLoading('✨ 正在將對話共識整理為可勾選的結構化修改提案...');

    const curDate = typeof todayStr !== 'undefined' ? todayStr : new Date().toISOString().slice(0, 10);
    const schemaInstruction = `請根據我們截至目前的對話內容與最新共識，將具體可執行的修改建議整理為嚴格合法的 JSON 物件（不要加上任何 Markdown 說明文字，只輸出 JSON）。
基準日期：${curDate}。若對話中有形如 [客戶A]、[代號_1] 等中括號代號，請原樣保留在字串中。
JSON 格式規範如下：
{
  "summary": "一句話總結本次建議變更重點",
  "operations": [
    {
      "op": "add_step | update_step | add_milestone | add_thought | update_thought",
      "thoughtId": 數字ID(對應上方出現過的目標卡片ID；若為 add_thought 則省略),
      "stepId": 數字ID(僅 update_step 必填，對應上方出現過的 [stepId:XXX]),
      "category": "領域名稱(如 💼 事業、❤️ 健康，僅 add_thought 需要)",
      "text": "步驟內容 (add_step/update_step) 或 新卡片標題 (add_thought)",
      "goal": "最終目標名稱 (add_thought / update_thought 使用)",
      "detail": "補充備忘說明 (選填)",
      "title": "接力里程碑名稱 (僅 add_milestone 使用)",
      "targetDate": "YYYY-MM-DD 或 未指定日期",
      "stepDate": "YYYY-MM-DD 或空字串",
      "stepTime": "預估工時如 0.5小時、1小時、2小時",
      "stepTimeSlot": "全天 | 上午 | 下午 | 晚上 | 夜間",
      "recurrence": "none | daily | weekdays | weekly",
      "steps": [ { "text": "初始步驟", "stepDate": "YYYY-MM-DD或空字串", "stepTime": "1小時", "stepTimeSlot": "全天" } ],
      "reason": "簡短說明為什麼建議此項新增或改寫"
    }
  ]
}
請給出最精準、立即可落地執行的 1～8 項操作建議。`;

    try {
        const tempContents = [
            ...aiChatContext,
            { role: 'user', parts: [{ text: schemaInstruction }] }
        ];
        const res = await requestGeminiGenerateContent(tempContents, true, updateChatLoadingText);
        removeChatLoading();
        if (genBtn) genBtn.disabled = false;

        if (!res.ok) {
            appendChatMessage('model', `[提案產生失敗] ${res.error}`);
            return;
        }

        const rawParsed = extractJsonFromAiResponse(res.text);
        if (!rawParsed) {
            appendChatMessage('model', '⚠️ 無法解析結構化提案格式，請再補充一句具體想修改的方向後重試。');
            return;
        }

        const desanitized = activeSanitizerSession ? activeSanitizerSession.desanitizeObject(rawParsed) : rawParsed;
        const normalized = normalizeRawProposals(desanitized);
        if (normalized.operations.length === 0) {
            appendChatMessage('model', '💡 目前對話尚未收斂出可對應卡片的具體變更項目，請告訴我你想新增或調整哪個方向，再點擊產生提案！');
            return;
        }

        currentAiProposals = normalized.operations;
        renderAiProposalPanel(normalized.summary);
    } catch (e) {
        removeChatLoading();
        if (genBtn) genBtn.disabled = false;
        appendChatMessage('model', `[提案產生異常] ${e.message || '未知錯誤'}`);
    }
}

function renderAiProposalPanel(summaryText = '') {
    const panel = document.getElementById('aiProposalPanel');
    const chatWrap = document.getElementById('aiChatMainBodyWrap');
    const summaryEl = document.getElementById('aiProposalSummaryText');
    const listEl = document.getElementById('aiProposalItemsList');
    if (!panel || !listEl) return;

    if (chatWrap) chatWrap.classList.add('hidden');
    panel.classList.remove('hidden');
    if (summaryEl) summaryEl.textContent = summaryText || `共整理出 ${currentAiProposals.length} 項變更提案，請勾選並可現場微調文字與日期：`;

    const badgeMap = {
        add_step: { label: '➕ 新增步驟', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
        update_step: { label: '✏️ 改寫既有步驟', cls: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
        add_milestone: { label: '🏁 新增接力里程碑', cls: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800' },
        add_thought: { label: '🌟 新增長程目標卡', cls: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800' },
        update_thought: { label: '📝 調整目標卡定義', cls: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' }
    };

    listEl.innerHTML = currentAiProposals.map((item, idx) => {
        const b = badgeMap[item.op] || badgeMap.add_step;
        const slotConflict = (item.stepDate && typeof getBlockedSlot === 'function')
            ? getBlockedSlot(item.stepDate, item.stepTimeSlot || '全天')
            : null;
        const conflictHtml = slotConflict
            ? `<div class="text-[11px] font-bold text-rose-600 dark:text-rose-400">⚠️ 注意：${escapeHtml(item.stepDate)} [${escapeHtml(item.stepTimeSlot)}] 為已鎖定不可排程時段，建議改期或留空日期。</div>`
            : '';

        if (item.op === 'add_step' || item.op === 'update_step') {
            return `
                <div class="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
                    <div class="flex items-start justify-between gap-2">
                        <label class="flex items-center gap-2 cursor-pointer select-none flex-wrap">
                            <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="onToggleProposalCheck(${idx}, this.checked)" class="w-4 h-4 accent-indigo-600 rounded cursor-pointer">
                            <span class="text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${b.cls}">${b.label}</span>
                            <span class="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[220px]">🎯 ${escapeHtml(item.thoughtLabel || '')}</span>
                        </label>
                    </div>
                    ${item.op === 'update_step' ? `<div class="text-[11px] text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-700 line-through">原步驟：${escapeHtml(item.oldText)} ${item.oldDate ? '(' + escapeHtml(item.oldDate) + ')' : ''}</div>` : ''}
                    ${item.reason ? `<div class="text-[11px] text-indigo-700 dark:text-indigo-300">💡 理由：${escapeHtml(item.reason)}</div>` : ''}
                    <input type="text" value="${escapeAttr(item.text)}" oninput="onEditProposalField(${idx}, 'text', this.value)" class="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                    <div class="grid grid-cols-3 gap-2">
                        <input type="date" value="${escapeAttr(item.stepDate || '')}" onchange="onEditProposalField(${idx}, 'stepDate', this.value)" class="px-2 py-1 text-[11px] border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        <input type="text" value="${escapeAttr(item.stepTime || '')}" placeholder="如 1小時" oninput="onEditProposalField(${idx}, 'stepTime', this.value)" class="px-2 py-1 text-[11px] border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        <select onchange="onEditProposalField(${idx}, 'stepTimeSlot', this.value)" class="px-2 py-1 text-[11px] border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                            ${AI_VALID_SLOTS.map(sl => `<option value="${sl}" ${item.stepTimeSlot === sl ? 'selected' : ''}>${sl}</option>`).join('')}
                        </select>
                    </div>
                    ${conflictHtml}
                </div>
            `;
        }

        if (item.op === 'add_milestone') {
            return `
                <div class="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
                    <label class="flex items-center gap-2 cursor-pointer select-none flex-wrap">
                        <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="onToggleProposalCheck(${idx}, this.checked)" class="w-4 h-4 accent-indigo-600 rounded cursor-pointer">
                        <span class="text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${b.cls}">${b.label}</span>
                        <span class="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[220px]">🎯 ${escapeHtml(item.thoughtLabel || '')}</span>
                    </label>
                    ${item.reason ? `<div class="text-[11px] text-indigo-700 dark:text-indigo-300">💡 理由：${escapeHtml(item.reason)}</div>` : ''}
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input type="text" value="${escapeAttr(item.title)}" oninput="onEditProposalField(${idx}, 'title', this.value)" class="sm:col-span-2 px-2.5 py-1.5 text-xs font-bold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                        <input type="date" value="${escapeAttr(item.targetDate !== '未指定日期' ? item.targetDate : '')}" onchange="onEditProposalField(${idx}, 'targetDate', this.value || '未指定日期')" class="px-2 py-1 text-[11px] border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                    </div>
                </div>
            `;
        }

        if (item.op === 'update_thought') {
            return `
                <div class="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
                    <label class="flex items-center gap-2 cursor-pointer select-none flex-wrap">
                        <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="onToggleProposalCheck(${idx}, this.checked)" class="w-4 h-4 accent-indigo-600 rounded cursor-pointer">
                        <span class="text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${b.cls}">${b.label}</span>
                        <span class="text-xs font-bold text-slate-700 dark:text-slate-200">原目標：${escapeHtml(item.oldGoal)}</span>
                    </label>
                    ${item.reason ? `<div class="text-[11px] text-indigo-700 dark:text-indigo-300">💡 理由：${escapeHtml(item.reason)}</div>` : ''}
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input type="text" value="${escapeAttr(item.goal)}" oninput="onEditProposalField(${idx}, 'goal', this.value)" class="sm:col-span-2 px-2.5 py-1.5 text-xs font-bold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                        <input type="date" value="${escapeAttr(item.targetDate !== '未指定日期' ? item.targetDate : '')}" onchange="onEditProposalField(${idx}, 'targetDate', this.value || '未指定日期')" class="px-2 py-1 text-[11px] border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                    </div>
                    <textarea rows="2" oninput="onEditProposalField(${idx}, 'detail', this.value)" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">${escapeHtml(item.detail || '')}</textarea>
                </div>
            `;
        }

        // add_thought
        const subStepPreview = (item.steps || []).map(st => `• ${escapeHtml(st.text)} (${escapeHtml(st.stepTime || '1小時')})`).join('<br>');
        return `
            <div class="p-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-2">
                <label class="flex items-center gap-2 cursor-pointer select-none flex-wrap">
                    <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="onToggleProposalCheck(${idx}, this.checked)" class="w-4 h-4 accent-indigo-600 rounded cursor-pointer">
                    <span class="text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${b.cls}">${b.label}</span>
                </label>
                ${item.reason ? `<div class="text-[11px] text-indigo-700 dark:text-indigo-300">💡 理由：${escapeHtml(item.reason)}</div>` : ''}
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input type="text" value="${escapeAttr(item.category)}" placeholder="領域" oninput="onEditProposalField(${idx}, 'category', this.value)" class="px-2.5 py-1.5 text-xs font-bold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                    <input type="text" value="${escapeAttr(item.text)}" placeholder="卡片標題" oninput="onEditProposalField(${idx}, 'text', this.value)" class="sm:col-span-2 px-2.5 py-1.5 text-xs font-bold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input type="text" value="${escapeAttr(item.goal)}" placeholder="最終目標" oninput="onEditProposalField(${idx}, 'goal', this.value)" class="sm:col-span-2 px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                    <input type="date" value="${escapeAttr(item.targetDate !== '未指定日期' ? item.targetDate : '')}" onchange="onEditProposalField(${idx}, 'targetDate', this.value || '未指定日期')" class="px-2 py-1 text-[11px] border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                </div>
                ${subStepPreview ? `<div class="text-[11px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700"><strong>隨附初始步驟 (${item.steps.length} 項)：</strong><br>${subStepPreview}</div>` : ''}
            </div>
        `;
    }).join('');

    updateProposalApplyButtonCount();
}

function hideAiProposalPanel() {
    const panel = document.getElementById('aiProposalPanel');
    const chatWrap = document.getElementById('aiChatMainBodyWrap');
    if (panel) panel.classList.add('hidden');
    if (chatWrap) chatWrap.classList.remove('hidden');
}

function onToggleProposalCheck(index, checked) {
    if (currentAiProposals[index]) {
        currentAiProposals[index].checked = Boolean(checked);
        updateProposalApplyButtonCount();
    }
}

function setAllAiProposalsChecked(checked) {
    currentAiProposals.forEach(p => { p.checked = Boolean(checked); });
    renderAiProposalPanel(document.getElementById('aiProposalSummaryText')?.textContent || '');
}

function onEditProposalField(index, field, value) {
    if (currentAiProposals[index]) {
        currentAiProposals[index][field] = value;
    }
}

function updateProposalApplyButtonCount() {
    const btn = document.getElementById('aiApplyProposalsConfirmBtn');
    if (!btn) return;
    const count = currentAiProposals.filter(x => x.checked).length;
    btn.textContent = `✅ 確認套用勾選修改 (${count} 項)`;
    btn.disabled = (count === 0);
}

function applySelectedAiProposals() {
    const selected = currentAiProposals.filter(x => x.checked);
    if (selected.length === 0) {
        alert('請至少勾選一項要套用的修改提案！');
        return;
    }

    // 建立記憶體還原點快照，支援一鍵 Undo
    _lastAiMutationSnapshot = {
        createdAt: Date.now(),
        count: selected.length,
        thoughtsJson: JSON.stringify(thoughts || [])
    };

    let appliedCount = 0;
    let focusJumpThoughtId = currentAiCoachThoughtId;

    selected.forEach(item => {
        if (item.op === 'add_step') {
            const t = thoughts.find(x => x.id === item.thoughtId);
            if (!t || !String(item.text || '').trim()) return;
            if (!Array.isArray(t.steps)) t.steps = [];
            let safeDate = sanitizeDateField(item.stepDate, false);
            let safeSlot = AI_VALID_SLOTS.includes(item.stepTimeSlot) ? item.stepTimeSlot : '全天';
            if (safeDate && typeof getBlockedSlot === 'function' && getBlockedSlot(safeDate, safeSlot)) {
                safeDate = ''; // 撞到不可排程時段時安全退回待排日期，避免破壞排程規則
            }
            const msList = typeof ensureThoughtMilestones === 'function' ? ensureThoughtMilestones(t) : [];
            const activeMilestone = msList.find(m => !m.done) || msList[msList.length - 1];
            t.steps.push({
                id: genUniqueAiEntityId(),
                text: String(item.text).trim(),
                stepDate: safeDate,
                stepTime: String(item.stepTime || '').trim(),
                stepTimeSlot: safeSlot,
                recurrence: AI_VALID_RECURRENCES.includes(item.recurrence) ? item.recurrence : 'none',
                milestoneId: activeMilestone ? activeMilestone.id : null,
                done: false
            });
            focusJumpThoughtId = t.id;
            appliedCount++;
            return;
        }

        if (item.op === 'update_step') {
            const t = thoughts.find(x => x.id === item.thoughtId);
            if (!t || !Array.isArray(t.steps)) return;
            const st = t.steps.find(x => x.id === item.stepId);
            if (!st || !String(item.text || '').trim()) return;
            let safeDate = sanitizeDateField(item.stepDate, false);
            let safeSlot = AI_VALID_SLOTS.includes(item.stepTimeSlot) ? item.stepTimeSlot : (st.stepTimeSlot || '全天');
            if (safeDate && typeof getBlockedSlot === 'function' && getBlockedSlot(safeDate, safeSlot)) {
                safeDate = st.stepDate || '';
            }
            st.text = String(item.text).trim();
            st.stepDate = safeDate;
            st.stepTime = String(item.stepTime || '').trim();
            st.stepTimeSlot = safeSlot;
            focusJumpThoughtId = t.id;
            appliedCount++;
            return;
        }

        if (item.op === 'add_milestone') {
            const t = thoughts.find(x => x.id === item.thoughtId);
            if (!t || !String(item.title || '').trim()) return;
            if (typeof ensureThoughtMilestones === 'function') ensureThoughtMilestones(t);
            const nowId = genUniqueAiEntityId();
            t.milestones.push({
                id: nowId,
                title: String(item.title).trim(),
                targetDate: sanitizeDateField(item.targetDate, true),
                targetTimeSlot: AI_VALID_SLOTS.includes(item.targetTimeSlot) ? item.targetTimeSlot : '全天',
                done: false,
                completedDate: '',
                createdAt: Date.now()
            });
            if (typeof syncMilestonesToLegacy === 'function') syncMilestonesToLegacy(t);
            focusJumpThoughtId = t.id;
            appliedCount++;
            return;
        }

        if (item.op === 'update_thought') {
            const t = thoughts.find(x => x.id === item.thoughtId);
            if (!t) return;
            const newGoal = String(item.goal || '').trim();
            const newDate = sanitizeDateField(item.targetDate, true);
            if (newGoal) t.goal = newGoal;
            if (item.detail !== undefined) t.detail = String(item.detail).trim();
            t.targetDate = newDate;
            if (typeof ensureThoughtMilestones === 'function') {
                ensureThoughtMilestones(t);
                const activeM = t.milestones.find(m => !m.done) || t.milestones[t.milestones.length - 1];
                if (activeM) {
                    if (newGoal) activeM.title = newGoal;
                    activeM.targetDate = newDate;
                }
                if (typeof syncMilestonesToLegacy === 'function') syncMilestonesToLegacy(t);
            }
            focusJumpThoughtId = t.id;
            appliedCount++;
            return;
        }

        if (item.op === 'add_thought') {
            const title = String(item.text || item.goal || '').trim();
            if (!title) return;
            const newTid = genUniqueAiEntityId();
            const targetDate = sanitizeDateField(item.targetDate, true);
            const goalTitle = String(item.goal || title).trim();
            const initMilestoneId = genUniqueAiEntityId();
            const builtSteps = (Array.isArray(item.steps) ? item.steps : []).map(st => {
                let sDate = sanitizeDateField(st.stepDate, false);
                let sSlot = AI_VALID_SLOTS.includes(st.stepTimeSlot) ? st.stepTimeSlot : '全天';
                if (sDate && typeof getBlockedSlot === 'function' && getBlockedSlot(sDate, sSlot)) sDate = '';
                return {
                    id: genUniqueAiEntityId(),
                    text: String(st.text).trim(),
                    stepDate: sDate,
                    stepTime: String(st.stepTime || '1小時').trim(),
                    stepTimeSlot: sSlot,
                    recurrence: 'none',
                    milestoneId: initMilestoneId,
                    done: false
                };
            });

            thoughts.push({
                id: newTid,
                category: String(item.category || '💼 事業').trim() || '💼 事業',
                text: title,
                detail: String(item.detail || '').trim(),
                goal: goalTitle,
                goalDone: false,
                targetDate,
                targetTimeSlot: '全天',
                isMainFocus: false,
                isAiPrivate: false,
                createdAt: Date.now(),
                milestones: [{
                    id: initMilestoneId,
                    title: goalTitle,
                    targetDate,
                    targetTimeSlot: '全天',
                    done: false,
                    completedDate: '',
                    createdAt: Date.now()
                }],
                steps: builtSteps
            });
            focusJumpThoughtId = newTid;
            appliedCount++;
        }
    });

    if (appliedCount === 0) {
        _lastAiMutationSnapshot = null;
        alert('未套用任何變更，請確認欄位內容是否完整。');
        return;
    }

    saveData();
    updateAiUndoButtonsUI();
    closeAiCoachModal();
    render();
    if (typeof showToast === 'function') {
        showToast(`⚡ 已成功套用 ${appliedCount} 項 AI 戰略修改！（如需退回可點擊頂部「↩️ 復原 AI 修改」）`, 'success');
    }
    if (focusJumpThoughtId && currentAiMode !== 'global' && typeof jumpToGoalCard === 'function') {
        setTimeout(() => jumpToGoalCard(focusJumpThoughtId), 280);
    }
}

function undoLastAiMutation() {
    if (!_lastAiMutationSnapshot || !_lastAiMutationSnapshot.thoughtsJson) {
        if (typeof showToast === 'function') showToast('目前沒有可復原的 AI 修改紀錄。', 'info');
        return;
    }
    if (!confirm(`確定要復原剛才套用的 ${_lastAiMutationSnapshot.count} 項 AI 修改，退回套用前的完整狀態嗎？`)) {
        return;
    }
    try {
        const restored = JSON.parse(_lastAiMutationSnapshot.thoughtsJson);
        if (Array.isArray(restored)) {
            thoughts = restored;
            _lastAiMutationSnapshot = null;
            saveData();
            updateAiUndoButtonsUI();
            render();
            if (typeof showToast === 'function') {
                showToast('↩️ 已完整復原剛才的 AI 修改！', 'success');
            }
        }
    } catch (e) {
        alert('復原快照解析失敗：' + e.message);
    }
}

function updateAiUndoButtonsUI() {
    const hasUndo = Boolean(_lastAiMutationSnapshot && _lastAiMutationSnapshot.thoughtsJson);
    const headerBtn = document.getElementById('headerAiUndoBtn');
    const modalBtn = document.getElementById('modalAiUndoBtn');
    if (headerBtn) {
        if (hasUndo) headerBtn.classList.remove('hidden');
        else headerBtn.classList.add('hidden');
    }
    if (modalBtn) {
        if (hasUndo) modalBtn.classList.remove('hidden');
        else modalBtn.classList.add('hidden');
    }
}

// 向下相容舊函式名稱
const convertAiConclusionToStep = generateAiActionProposal;

window.openAiCoachModal = openAiCoachModal;
window.openGlobalAiPartnerModal = openGlobalAiPartnerModal;
window.switchAiPartnerMode = switchAiPartnerMode;
window.onAiTargetThoughtChange = onAiTargetThoughtChange;
window.closeAiCoachModal = closeAiCoachModal;
window.sendAiMessage = sendAiMessage;
window.sendQuickAiPrompt = sendQuickAiPrompt;
window.toggleThoughtAiPrivate = toggleThoughtAiPrivate;
window.toggleAiPrivacyDrawer = toggleAiPrivacyDrawer;
window.toggleAiPayloadPreview = toggleAiPayloadPreview;
window.updateAiPayloadPreviewUI = updateAiPayloadPreviewUI;
window.onToggleAiAutoMaskPii = onToggleAiAutoMaskPii;
window.addAiPrivacyDictEntry = addAiPrivacyDictEntry;
window.removeAiPrivacyDictEntry = removeAiPrivacyDictEntry;
window.startAiSessionForCurrentMode = startAiSessionForCurrentMode;
window.generateAiActionProposal = generateAiActionProposal;
window.convertAiConclusionToStep = convertAiConclusionToStep;
window.hideAiProposalPanel = hideAiProposalPanel;
window.onToggleProposalCheck = onToggleProposalCheck;
window.setAllAiProposalsChecked = setAllAiProposalsChecked;
window.onEditProposalField = onEditProposalField;
window.applySelectedAiProposals = applySelectedAiProposals;
window.undoLastAiMutation = undoLastAiMutation;
window.getAiPrivacyConfigForVault = getAiPrivacyConfigForVault;
window.applyAiPrivacyConfigFromVault = applyAiPrivacyConfigFromVault;
window.wipeAiMemoryForLock = wipeAiMemoryForLock;
window.createAiSanitizerSession = createAiSanitizerSession;
window.isThoughtEffectivelyAiPrivate = isThoughtEffectivelyAiPrivate;
window.retryLastGeminiCall = retryLastGeminiCall;
window.testGeminiApiKey = testGeminiApiKey;
window.copyGeminiDetectedModels = copyGeminiDetectedModels;
window.onGeminiModelSelectChange = onGeminiModelSelectChange;
