// ============================================================
// 🤖 第一性原理 AI 思維教練 (Gemini API Integration)
// ============================================================
let currentAiCoachThoughtId = null;
let aiChatContext = [];


function openAiCoachModal(thoughtId) {
    const geminiKey = localStorage.getItem('gemini_api_key');
    if (!geminiKey) {
        alert("請先在「⚙️ 設定 / 資料管理」中設定 Google Gemini API Key！");
        openPiSettingsModal();
        return;
    }
    const t = thoughts.find(x => x.id === thoughtId);
    if (!t) return;
    
    currentAiCoachThoughtId = thoughtId;
    const titleEl = document.getElementById('aiCoachTargetTitle');
    if (titleEl) titleEl.textContent = `目標：${t.goal || t.text}`;
    
    aiChatContext = [
        {
            role: "user",
            parts: [{ text: `你現在是一位精通「第一性原理 (First Principles)」的思維教練。我的目標是「${t.goal || t.text}」，專案描述是「${t.detail || '無'}」。
請嚴格遵守以下規則：
1. 每次只問「一個」銳利的問題。
2. 不斷質疑我的假設，剝除表象，逼出物理或現實層面的「基本事實 (Basic Truth)」。
3. 語氣要像一個沒有情緒、不受既有框架限制的第三方拷問者，直接指出盲點。
4. 當你認為已經逼出基本事實後，請引導我得出一個立即可執行的具體小行動 (Action Item)。
現在，請先以一句簡短有力的開場白，詢問我目前在這個目標上遇到的最大阻礙或「理所當然」的假設是什麼。` }]
        }
    ];


    const historyContainer = document.getElementById('aiChatHistory');
    if (historyContainer) historyContainer.innerHTML = '';
    const inputEl = document.getElementById('aiChatInput');
    if (inputEl) inputEl.value = '';


    const modal = document.getElementById('aiCoachModal');
    if (modal) modal.classList.remove('hidden');


    invokeGeminiAPI();
}


function closeAiCoachModal() {
    const modal = document.getElementById('aiCoachModal');
    if (modal) modal.classList.add('hidden');
    currentAiCoachThoughtId = null;
    aiChatContext = [];
}


function appendChatMessage(role, text) {
    const historyContainer = document.getElementById('aiChatHistory');
    if (!historyContainer) return;
    const wrapper = document.createElement('div');
    wrapper.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
    const bubble = document.createElement('div');
    bubble.className = `max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-tl-sm'}`;
    bubble.textContent = text;
    wrapper.appendChild(bubble);
    historyContainer.appendChild(wrapper);
    historyContainer.scrollTop = historyContainer.scrollHeight;
}


function appendChatLoading() {
    const historyContainer = document.getElementById('aiChatHistory');
    if (!historyContainer) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'aiChatLoading';
    wrapper.className = 'flex justify-start';
    wrapper.innerHTML = `<div class="bg-slate-100 dark:bg-slate-700 text-slate-500 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200 dark:border-slate-600 text-xs font-bold animate-pulse">教練思考中...</div>`;
    historyContainer.appendChild(wrapper);
    historyContainer.scrollTop = historyContainer.scrollHeight;
}


function removeChatLoading() {
    const loading = document.getElementById('aiChatLoading');
    if (loading) loading.remove();
}


let _geminiWorkingModel = (typeof localStorage !== 'undefined' && localStorage.getItem('gemini_preferred_model')) || null;
let _geminiWorkingVersion = (typeof localStorage !== 'undefined' && localStorage.getItem('gemini_preferred_version')) || 'v1beta';
let _geminiCachedUsableModels = [];

// 【v5.4.6 模型優先匹配演算法】：優先選取最新 Gemini 3 系列 (如 3.1-pro, 3-flash)，再到 2.5/2.0
function pickBestGeminiModel(models) {
    if (!models || models.length === 0) return null;
    return models.find(m => m.match(/gemini-3.*flash/i)) ||
           models.find(m => m.match(/gemini-3/i)) ||
           models.find(m => m.match(/gemini-2.*flash/i)) ||
           models.find(m => m.match(/gemini-2/i)) ||
           models.find(m => m.includes('flash')) ||
           models[0];
}

// 【v5.4.6 核心探測器】：自動向 Google 探測當前金鑰真實可用之模型清單 (支援 v1beta 與 v1 雙端點)
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
                    const usable = data.models
                        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                        .map(m => m.name.replace('models/', ''));
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

// 【v5.4.6 UI 狀態同步】：更新設定面板中的模型選單與文字框
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
    localStorage.setItem('gemini_preferred_model', val);
    const statusEl = document.getElementById('geminiKeyStatusText');
    if (statusEl) statusEl.textContent = `🎯 已選用模型：${val}`;
    showToast(`🎯 已套用模型：${val}`, 'success');
}

function copyGeminiDetectedModels() {
    const textEl = document.getElementById('geminiDetectedModelsText');
    if (!textEl || !textEl.value) {
        showToast('尚未有可複製的模型清單，請先點擊檢測按鈕！', 'warning');
        return;
    }
    textEl.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textEl.value).then(() => {
            showToast('📋 已成功複製可用模型清單至剪貼簿！', 'success');
        }).catch(() => {
            document.execCommand('copy');
            showToast('📋 已複製可用模型清單！', 'success');
        });
    } else {
        document.execCommand('copy');
        showToast('📋 已複製可用模型清單！', 'success');
    }
}

// 【v5.4.6 一鍵檢測按鈕】：於設定視窗即時檢驗 API Key 並填入自選下拉選單與可複製文字框
async function testGeminiApiKey() {
    const input = document.getElementById('geminiApiKeyInput');
    const key = (input ? input.value : localStorage.getItem('gemini_api_key'))?.trim();
    if (!key) {
        alert("請先輸入 Google Gemini API Key 再執行檢測！");
        if (input) input.focus();
        return;
    }

    const statusEl = document.getElementById('geminiKeyStatusText');
    if (statusEl) statusEl.textContent = "⏳ 正在連線 Google 伺服器探測模型清單...";

    try {
        const detected = await detectAvailableGeminiModel(key);
        if (detected) {
            _geminiWorkingModel = detected.model;
            _geminiWorkingVersion = detected.version;
            _geminiCachedUsableModels = detected.allUsable;
            localStorage.setItem('gemini_preferred_model', detected.model);
            localStorage.setItem('gemini_preferred_version', detected.version);
            localStorage.setItem('gemini_cached_models', JSON.stringify(detected.allUsable));

            updateGeminiModelUI(detected.allUsable, detected.model);

            if (statusEl) statusEl.textContent = `✅ 連線成功！已匹配最佳模型：${detected.model} (${detected.version})`;
            showToast(`🎉 檢測成功！已匹配最新模型：${detected.model}`, 'success');
        } else {
            // 嘗試單獨查詢以取得具體錯誤訊息
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

async function invokeGeminiAPI() {
    const rawKey = localStorage.getItem('gemini_api_key');
    if (!rawKey || !rawKey.trim()) return;
    const apiKey = rawKey.trim();
    appendChatLoading();

    try {
        // 第一步：若尚未探測或快取模型，先向 Google 動態探測
        let candidateList = [];
        if (_geminiWorkingModel) {
            candidateList.push(_geminiWorkingModel);
        }

        // 若有快取的可用模型清單，全數納入備援候選
        const cachedRaw = localStorage.getItem('gemini_cached_models');
        if (cachedRaw) {
            try {
                const arr = JSON.parse(cachedRaw);
                if (Array.isArray(arr)) candidateList.push(...arr);
            } catch (e) {}
        }

        // 若依然沒有模型，動態發起線上探測
        if (candidateList.length === 0) {
            const detected = await detectAvailableGeminiModel(apiKey);
            if (detected) {
                _geminiWorkingModel = detected.model;
                _geminiWorkingVersion = detected.version;
                localStorage.setItem('gemini_preferred_model', detected.model);
                localStorage.setItem('gemini_preferred_version', detected.version);
                localStorage.setItem('gemini_cached_models', JSON.stringify(detected.allUsable));
                candidateList = detected.allUsable;
            }
        }

        // 最後加上常見兜底候選
        candidateList.push('gemini-3.1-pro', 'gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.0-flash');
        const uniqueCandidates = [...new Set(candidateList.filter(Boolean))];
        const versions = [_geminiWorkingVersion, 'v1beta', 'v1'].filter(Boolean);
        const uniqueVersions = [...new Set(versions)];

        let lastErrorMsg = '';
        for (const model of uniqueCandidates) {
            for (const ver of uniqueVersions) {
                try {
                    const u = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
                    const response = await fetch(u, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-goog-api-key': apiKey
                        },
                        body: JSON.stringify({ contents: aiChatContext })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        aiChatContext.push({ role: "model", parts: [{ text: aiText }] });
                        removeChatLoading();
                        appendChatMessage("model", aiText);
                        _geminiWorkingModel = model;
                        _geminiWorkingVersion = ver;
                        localStorage.setItem('gemini_preferred_model', model);
                        localStorage.setItem('gemini_preferred_version', ver);
                        return;
                    } else {
                        const err = await response.json().catch(() => ({}));
                        lastErrorMsg = err.error?.message || `HTTP ${response.status}`;
                        // 若遇 404 (not found)，無縫切換下一組模型/端點重試
                        if (response.status === 404 || lastErrorMsg.includes("not found")) {
                            continue;
                        } else {
                            removeChatLoading();
                            appendChatMessage("model", `[API 錯誤] ${lastErrorMsg}`);
                            return;
                        }
                    }
                } catch (error) {
                    lastErrorMsg = "網路連線異常";
                    break;
                }
            }
        }

        removeChatLoading();
        appendChatMessage("model", `[API 錯誤] 無法存取所選 Gemini 模型（${lastErrorMsg || '404 Not Found'}）。\n\n💡 建議至右上角「⚙️ 設定」點擊「⚡ 檢測金鑰與可用模型」，系統將直接列出你金鑰可用的完整模型清單並提供一鍵複製與選取。`);
    } catch (e) {
        removeChatLoading();
        appendChatMessage("model", `[連線錯誤] ${e.message || '未知的連線異常'}`);
    }
}

function sendAiMessage() {
    const inputEl = document.getElementById('aiChatInput');
    const text = inputEl.value.trim();
    if (!text) return;
    appendChatMessage('user', text);
    aiChatContext.push({ role: "user", parts: [{ text: text }] });
    inputEl.value = '';
    invokeGeminiAPI();
}


function convertAiConclusionToStep() {
    if (!currentAiCoachThoughtId || aiChatContext.length < 3) {
        alert("請先與教練進行討論，得出具體結論後再轉換。");
        return;
    }
    let lastAction = "";
    for (let i = aiChatContext.length - 1; i >= 0; i--) {
        if (aiChatContext[i].role === 'model') {
            lastAction = aiChatContext[i].parts[0].text;
            break;
        }
    }
    const suggestedText = prompt("請微調教練建議的下一步行動，這將直接成為此卡片的新步驟：", lastAction.substring(0, 100));
    if (suggestedText && suggestedText.trim()) {
        const t = thoughts.find(x => x.id === currentAiCoachThoughtId);
        if (t) {
            if (!Array.isArray(t.steps)) t.steps = [];
            t.steps.push({
                id: Date.now(),
                text: suggestedText.trim(),
                stepDate: todayStr,
                stepTime: "0.5小時",
                stepTimeSlot: "全天",
                recurrence: "none",
                milestoneId: null,
                done: false
            });
            saveData();
            closeAiCoachModal();
            render();
            showToast("⚡ 思考突破！新行動步驟已成功加入卡片！", "success");
            setTimeout(() => jumpToGoalCard(currentAiCoachThoughtId), 300);
        }
    }
}


window.openAiCoachModal = openAiCoachModal;
window.closeAiCoachModal = closeAiCoachModal;
window.sendAiMessage = sendAiMessage;
window.convertAiConclusionToStep = convertAiConclusionToStep;
window.testGeminiApiKey = testGeminiApiKey;
window.copyGeminiDetectedModels = copyGeminiDetectedModels;
window.onGeminiModelSelectChange = onGeminiModelSelectChange;
