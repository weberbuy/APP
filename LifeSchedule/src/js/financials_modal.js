// ============================================================
// 【v5.4.0 月度財務管理控制器邏輯 (Monthly Finance Controller)】
// ============================================================
let currentEditingFinanceMonthKey = null;
let currentEditingFinanceData = null;


function openMonthlyFinanceModal(mKey, e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    currentEditingFinanceMonthKey = mKey || (todayStr ? todayStr.slice(0, 7).replace('-', '/') : '2026/10');
    
    // 如果當月已有資料，載入深拷貝；若無，以預設範本初始化
    const existing = monthlyFinancials[currentEditingFinanceMonthKey];
    if (existing) {
        currentEditingFinanceData = JSON.parse(JSON.stringify(existing));
    } else {
        currentEditingFinanceData = {
            active: (financialTemplates.active || []).map(name => ({ name, amount: 0 })),
            passive: (financialTemplates.passive || []).map(name => ({ name, amount: 0 })),
            expenses: (financialTemplates.expenses || []).map(name => ({ name, amount: 0 })),
            reminderDay: 5,
            note: ''
        };
    }
    if (!currentEditingFinanceData.reminderDay) currentEditingFinanceData.reminderDay = 5;


    const titleEl = document.getElementById('finModalMonthTitle');
    if (titleEl) titleEl.textContent = currentEditingFinanceMonthKey;


    const dayEl = document.getElementById('finModalReminderDay');
    if (dayEl) dayEl.value = currentEditingFinanceData.reminderDay;


    const noteEl = document.getElementById('finModalNote');
    if (noteEl) noteEl.value = currentEditingFinanceData.note || '';


    renderFinanceModalLists();
    recalcFinanceModalSummary();


    const modal = document.getElementById('monthlyFinanceModal');
    if (modal) modal.classList.remove('hidden');
}


function closeMonthlyFinanceModal() {
    const modal = document.getElementById('monthlyFinanceModal');
    if (modal) modal.classList.add('hidden');
    currentEditingFinanceMonthKey = null;
    currentEditingFinanceData = null;
}


function renderFinanceModalLists() {
    if (!currentEditingFinanceData) return;
    ['passive', 'active', 'expenses'].forEach(type => {
        const container = document.getElementById(`fin${type.charAt(0).toUpperCase() + type.slice(1)}List`);
        if (!container) return;
        const list = currentEditingFinanceData[type] || [];
        if (list.length === 0) {
            container.innerHTML = `<div class="text-[11px] text-slate-400 italic py-1">尚未建立項目</div>`;
            return;
        }
        container.innerHTML = list.map((item, idx) => `
            <div class="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <input type="text" value="${escapeAttr(item.name || '')}" oninput="updateFinanceRow('${type}', ${idx}, 'name', this.value)" placeholder="項目名稱" class="flex-1 px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium">
                <div class="flex items-center gap-1 w-32 shrink-0">
                    <span class="text-xs text-slate-400 font-mono">$</span>
                    <input type="number" step="100" min="0" value="${item.amount || ''}" oninput="updateFinanceRow('${type}', ${idx}, 'amount', this.value)" placeholder="0" class="w-full px-2 py-1 text-xs font-mono font-bold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-right">
                </div>
                <button type="button" onclick="deleteFinanceRow('${type}', ${idx})" class="text-slate-400 hover:text-rose-500 px-1.5 py-0.5 text-xs font-bold cursor-pointer" title="刪除項目">✕</button>
            </div>
        `).join('');
    });
}


function updateFinanceRow(type, idx, field, val) {
    if (!currentEditingFinanceData || !currentEditingFinanceData[type] || !currentEditingFinanceData[type][idx]) return;
    if (field === 'amount') {
        currentEditingFinanceData[type][idx].amount = parseFloat(val) || 0;
    } else {
        currentEditingFinanceData[type][idx].name = val;
    }
    recalcFinanceModalSummary();
}


function addFinanceRow(type) {
    if (!currentEditingFinanceData) return;
    if (!currentEditingFinanceData[type]) currentEditingFinanceData[type] = [];
    currentEditingFinanceData[type].push({ name: '新項目', amount: 0 });
    renderFinanceModalLists();
    recalcFinanceModalSummary();
}


function deleteFinanceRow(type, idx) {
    if (!currentEditingFinanceData || !currentEditingFinanceData[type]) return;
    currentEditingFinanceData[type].splice(idx, 1);
    renderFinanceModalLists();
    recalcFinanceModalSummary();
}


function recalcFinanceModalSummary() {
    if (!currentEditingFinanceData) return;
    const actSub = (currentEditingFinanceData.active || []).reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
    const pasSub = (currentEditingFinanceData.passive || []).reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
    const expSub = (currentEditingFinanceData.expenses || []).reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
    const totalInc = actSub + pasSub;
    const net = totalInc - expSub;
    const cov = expSub > 0 ? Math.round((pasSub / expSub) * 100) : 0;


    const elAct = document.getElementById('finActiveSubtotal');
    if (elAct) elAct.textContent = `$${actSub.toLocaleString()}`;


    const elPas = document.getElementById('finPassiveSubtotal');
    if (elPas) elPas.textContent = `$${pasSub.toLocaleString()}`;


    const elExp = document.getElementById('finExpensesSubtotal');
    if (elExp) elExp.textContent = `$${expSub.toLocaleString()}`;


    const elTotInc = document.getElementById('finModalTotalIncome');
    if (elTotInc) elTotInc.textContent = `$${totalInc.toLocaleString()}`;


    const elTotExp = document.getElementById('finModalTotalExpense');
    if (elTotExp) elTotExp.textContent = `$${expSub.toLocaleString()}`;


    const elNet = document.getElementById('finModalNetSavings');
    if (elNet) {
        elNet.textContent = `${net >= 0 ? '+' : ''}$${net.toLocaleString()}`;
        elNet.className = `font-black text-sm ${net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`;
    }


    const elCov = document.getElementById('finModalCoverage');
    if (elCov) elCov.textContent = `${cov}%`;
}


function copyPreviousMonthFinanceData() {
    if (!currentEditingFinanceMonthKey) return;
    const prevKey = getRelativeMonthKey(currentEditingFinanceMonthKey, -1);
    const prevData = monthlyFinancials[prevKey];
    if (!prevData) {
        showToast(`找不到上個月 (${prevKey}) 的財務記錄！`, 'info');
        return;
    }
    if (typeof confirm !== 'undefined' && !confirm(`確定要將上月 (${prevKey}) 的各項金額與項目完整複製至本月 (${currentEditingFinanceMonthKey}) 嗎？`)) {
        return;
    }
    currentEditingFinanceData.active = JSON.parse(JSON.stringify(prevData.active || []));
    currentEditingFinanceData.passive = JSON.parse(JSON.stringify(prevData.passive || []));
    currentEditingFinanceData.expenses = JSON.parse(JSON.stringify(prevData.expenses || []));
    if (prevData.reminderDay) currentEditingFinanceData.reminderDay = prevData.reminderDay;
    const rEl = document.getElementById('finModalReminderDay');
    if (rEl) rEl.value = currentEditingFinanceData.reminderDay;


    renderFinanceModalLists();
    recalcFinanceModalSummary();
    showToast(`⚡ 已成功帶入上月 (${prevKey}) 的財務收支數據！`, 'success');
}


function clearCurrentMonthFinance() {
    if (!currentEditingFinanceMonthKey) return;
    if (typeof confirm !== 'undefined' && !confirm(`確定要清空 ${currentEditingFinanceMonthKey} 本月的所有收支數據嗎？`)) {
        return;
    }
    delete monthlyFinancials[currentEditingFinanceMonthKey];
    saveMonthlyFinancials();
    closeMonthlyFinanceModal();
    render();
    showToast(`已清空 ${currentEditingFinanceMonthKey} 的收支數據。`, 'info');
}


function saveMonthlyFinanceModal() {
    if (!currentEditingFinanceMonthKey || !currentEditingFinanceData) return;
    const rInput = document.getElementById('finModalReminderDay');
    currentEditingFinanceData.reminderDay = rInput ? (parseInt(rInput.value, 10) || 5) : 5;
    
    const nInput = document.getElementById('finModalNote');
    currentEditingFinanceData.note = nInput ? (nInput.value || '').trim() : '';


    // 標記是否有實際填寫資料
    const actSub = (currentEditingFinanceData.active || []).reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
    const pasSub = (currentEditingFinanceData.passive || []).reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
    const expSub = (currentEditingFinanceData.expenses || []).reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
    currentEditingFinanceData.hasData = (actSub > 0 || pasSub > 0 || expSub > 0);


    monthlyFinancials[currentEditingFinanceMonthKey] = currentEditingFinanceData;


    // 將新加入的項目名稱同步回全域範本，便於後續月份自動帶入
    ['active', 'passive', 'expenses'].forEach(type => {
        const itemNames = (currentEditingFinanceData[type] || []).map(x => (x.name || '').trim()).filter(Boolean);
        itemNames.forEach(n => {
            if (!financialTemplates[type].includes(n)) financialTemplates[type].push(n);
        });
    });


    saveMonthlyFinancials();
    closeMonthlyFinanceModal();
    render();
    showToast(`✅ ${currentEditingFinanceMonthKey} 財務收支數據已成功儲存！`, 'success');
}


// 【v5.3.10 視窗縮放自動重繪】：若處於自動適配模式，螢幕寬度改變自動更新可視月份量
let _fortellerResizeTimer = null;
window.addEventListener('resize', () => {
    if (_fortellerResizeTimer) clearTimeout(_fortellerResizeTimer);
    _fortellerResizeTimer = setTimeout(() => {
        if (typeof viewMode !== 'undefined' && viewMode === 'overview' && typeof overviewSubMode !== 'undefined' && overviewSubMode === 'forteller' && typeof getFortellerSpanSetting === 'function' && getFortellerSpanSetting() === 'auto') {
            render();
        }
    }, 300);
});
