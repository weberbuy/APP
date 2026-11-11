function renderFocusMindmapHtml() {
            const mainGoals = thoughts.filter(t => t.isMainFocus && !t.goalDone);
            const completedMainGoals = thoughts.filter(t => t.isMainFocus && t.goalDone);
            const subGoals = thoughts.filter(t => !t.isMainFocus && isDescendantOfMainFocus(t, thoughts) && !t.goalDone);
            const habitGoals = thoughts.filter(t => !t.isMainFocus && getGoalFocusTag(t).key === 'habit' && !t.goalDone);
            const bonusGoals = thoughts.filter(t => !t.isMainFocus && getGoalFocusTag(t).key === 'bonus' && !t.goalDone);
            const frozenGoals = thoughts.filter(t => !t.isMainFocus && getGoalFocusTag(t).key === 'frozen' && !t.goalDone);


            let html = `
                <div class="space-y-6 w-full pb-8">
                    <!-- 頂部概況導覽統計 -->
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
                        <div class="space-y-0.5">
                            <div class="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <span>🧠 戰略心智圖（重點推進與步驟全覽）</span>
                            </div>
                            <p class="text-xs text-slate-500 dark:text-slate-400">樹狀全景剖析：⭐ 主推進 ➔ 🌿 子推進 / 🔄 習慣推進 ➔ 具體執行步驟</p>
                        </div>
                        <div class="flex items-center gap-2 flex-wrap text-xs font-bold">
                            <span class="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                ⭐ 主推進: ${mainGoals.length} / 3
                            </span>
                            <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                🌿 子推進: ${subGoals.length}
                            </span>
                            <span class="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                                🔄 習慣推進: ${habitGoals.length}
                            </span>
                            <span class="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
                                💡 加分推進: ${bonusGoals.length}
                            </span>
                            <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                🧊 冰存休眠: ${frozenGoals.length}
                            </span>
                        </div>
                    </div>


                    <!-- 1. ⭐ 核心主推進戰略樹 -->
                    <div class="space-y-4">
                        <div class="flex items-center justify-between border-b-2 border-amber-300 dark:border-amber-700 pb-2">
                            <div class="flex items-center gap-2">
                                <span class="text-xl">⭐</span>
                                <h3 class="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">核心主推進戰略樹 (${mainGoals.length} 個核心專案)</h3>
                            </div>
                            <span class="text-xs text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-700">
                                專注核心（上限 3 個）
                            </span>
                        </div>
            `;


            if (mainGoals.length === 0) {
                html += `
                    <div class="bg-white dark:bg-slate-800 p-8 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700/80 text-center space-y-2">
                        <div class="text-amber-600 dark:text-amber-400 font-bold text-base">💡 目前尚未指定「⭐ 主推進」目標</div>
                        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                            巴菲特建議人只能專注做好 3 件事。請前往看板模式，在您最重要的 1～3 個目標卡片點擊「☆ 設為主推進」，系統將在此自動繪製深度的拆解樹狀圖！
                        </p>
                    </div>
                `;
            } else {
                html += `<div class="space-y-6">`;
                mainGoals.forEach((mainGoal, mIdx) => {
                    const steps = Array.isArray(mainGoal.steps) ? mainGoal.steps : [];
                    const pendingSteps = steps.filter(s => !s.done);
                    const doneCount = steps.filter(s => s.done).length;
                    const totalCount = steps.length;
                    const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;


                    // 三類步驟分流解析
                    const classifiedDirectSteps = [];
                    const classifiedBreakdownSteps = [];
                    const classifiedHabitSteps = [];


                    pendingSteps.forEach(s => {
                        const linkedGoal = s.linkedThoughtId 
                            ? thoughts.find(x => x.id === s.linkedThoughtId && !x.goalDone) 
                            : thoughts.find(x => x.parentStepInfo && x.parentStepInfo.parentThoughtId === mainGoal.id && x.parentStepInfo.parentStepId === s.id && !x.goalDone);


                        const isDirectRecurring = (s.recurrence && s.recurrence !== 'none');
                        let isLinkedHabit = false;
                        if (linkedGoal) {
                            const cUncompleted = (linkedGoal.steps || []).filter(cs => !cs.done);
                            if (cUncompleted.length > 0 && cUncompleted.every(cs => cs.recurrence && cs.recurrence !== 'none')) {
                                isLinkedHabit = true;
                            }
                        }


                        if (linkedGoal && !isLinkedHabit) {
                            // 類別 2: 拆解步驟 (即有拆解目標/子孫推進)
                            classifiedBreakdownSteps.push({ step: s, linkedGoal });
                        } else if ((linkedGoal && isLinkedHabit) || isDirectRecurring) {
                            // 類別 3: 習慣步驟 (有拆解目標且步驟只剩循環步驟，或直接循環步驟)
                            classifiedHabitSteps.push({ step: s, linkedGoal });
                        } else {
                            // 類別 1: 待執行步驟 (即無拆解目標)
                            classifiedDirectSteps.push(s);
                        }
                    });


                    html += `
                        <div class="bg-white dark:bg-slate-800/95 p-5 rounded-3xl shadow-sm border-2 border-amber-300 dark:border-amber-600/80 space-y-5">
                            <!-- 主目標根節點 -->
                            <div class="flex items-start justify-between gap-3.5 bg-amber-50/80 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/80 flex-wrap sm:flex-nowrap">
                                <div class="space-y-2 flex-1 min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="bg-amber-500 text-white font-black text-xs px-2.5 py-0.5 rounded-md shadow-xs">⭐ 主推進 #${mIdx + 1}</span>
                                        <span class="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-2 py-0.5 rounded-md">${mainGoal.category || '💼 事業'}</span>
                                        <span class="text-xs font-medium text-slate-500 dark:text-slate-400">📅 達成預期：${mainGoal.targetDate || '未指定日期'} [${mainGoal.targetTimeSlot || '全天'}]</span>
                                    </div>
                                    <h4 class="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors" onclick="jumpToGoalCard(${mainGoal.id})" title="點擊跳轉至看板">
                                        ${escapeHtml(mainGoal.text)}
                                    </h4>
                                    <div class="text-xs sm:text-sm text-amber-900 dark:text-amber-300 font-bold flex items-center gap-1.5">
                                        <span>🎯 最終目標：${escapeHtml(mainGoal.goal || '未設定')}</span>
                                    </div>
                                </div>
                                <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-2">
                                    <span class="text-xs font-black text-amber-700 dark:text-amber-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-700 shadow-2xs">
                                        進度 ${doneCount}/${totalCount} (${percent}%)
                                    </span>
                                    <button onclick="jumpToGoalCard(${mainGoal.id})" class="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded-xl transition-colors cursor-pointer shadow-xs">
                                        🔍 定位看板卡片
                                    </button>
                                </div>
                            </div>


                            <!-- 步驟三類分流結構 (1.待執行步驟 2.拆解步驟 3.習慣步驟，子孫目標預設折疊) -->
                            <div class="pl-3 sm:pl-6 border-l-2 border-dashed border-amber-300 dark:border-amber-700/80 space-y-5">
                                ${pendingSteps.length === 0 ? `
                                    <div class="text-xs ${steps.length > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500 italic'} py-2 pl-2">
                                        ${steps.length > 0 ? '🎉 本主推進目標所有步驟已全數完成！' : '尚未規劃步驟'}
                                    </div>
                                ` : `
                                    <!-- 類別 1: 📋 待執行步驟 (即無拆解目標) -->
                                    <div class="space-y-2">
                                        <div class="flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-slate-200">
                                            <span class="flex items-center gap-1.5">
                                                <span class="text-base">📋</span>
                                                <span>1. 待執行步驟 (無拆解目標，共 ${classifiedDirectSteps.length} 個)：</span>
                                            </span>
                                            ${classifiedDirectSteps.length > 0 ? '<span class="text-[10px] text-slate-500 font-normal">直接行動清單</span>' : ''}
                                        </div>
                                        ${classifiedDirectSteps.length === 0 ? `
                                            <div class="text-xs text-slate-400 italic pl-3">無單獨直接執行的待辦步驟</div>
                                        ` : `
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                                ${classifiedDirectSteps.map(s => renderStepLeaf(mainGoal, s)).join('')}
                                            </div>
                                        `}
                                    </div>


                                    <!-- 類別 2: 🌿 拆解步驟 (即有拆解目標/子孫推進，預設折疊) -->
                                    <div class="space-y-2.5 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
                                        <div class="flex items-center justify-between text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                                            <span class="flex items-center gap-1.5">
                                                <span class="text-base">🌿</span>
                                                <span>2. 拆解步驟 (已另闢專案，共 ${classifiedBreakdownSteps.length} 個)：</span>
                                            </span>
                                            <span class="text-[10px] text-emerald-600 font-normal">子孫推進卡片預設折疊，點擊展開</span>
                                        </div>
                                        ${classifiedBreakdownSteps.length === 0 ? `
                                            <div class="text-xs text-slate-400 italic pl-3">無拆解子推進步驟</div>
                                        ` : `
                                            <div class="space-y-3 pl-2">
                                                ${classifiedBreakdownSteps.map(item => renderStepWithSubGoal(mainGoal, item.step, item.linkedGoal, false)).join('')}
                                            </div>
                                        `}
                                    </div>


                                    <!-- 類別 3: 🔄 習慣步驟 (即有拆解目標且只剩循環步驟，或直接循環步驟) -->
                                    <div class="space-y-2.5 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
                                        <div class="flex items-center justify-between text-xs font-extrabold text-teal-800 dark:text-teal-300">
                                            <span class="flex items-center gap-1.5">
                                                <span class="text-base">🔄</span>
                                                <span>3. 習慣步驟 (日常例行循環維護，共 ${classifiedHabitSteps.length} 個)：</span>
                                            </span>
                                            <span class="text-[10px] text-teal-600 font-normal">例行循環維護</span>
                                        </div>
                                        ${classifiedHabitSteps.length === 0 ? `
                                            <div class="text-xs text-slate-400 italic pl-3">無例行習慣步驟</div>
                                        ` : `
                                            <div class="space-y-3 pl-2">
                                                ${classifiedHabitSteps.map(item => renderStepWithSubGoal(mainGoal, item.step, item.linkedGoal, true)).join('')}
                                            </div>
                                        `}
                                    </div>
                                `}
                            </div>
                        </div>
                    `;
                });
                html += `</div>`;
            }
            html += `</div>`;


            // 2. 💡 加分推進目標群 (Bonus Focus)
            html += `
                <div class="space-y-4 pt-6 border-t-2 border-slate-200 dark:border-slate-700">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                        <div class="flex items-center gap-2">
                            <span class="text-xl">💡</span>
                            <h3 class="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">加分推進目標群 (有餘力再推進，共 ${bonusGoals.length} 個)</h3>
                        </div>
                        <span class="text-xs text-sky-700 dark:text-sky-300 font-bold bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-700">
                            儲備點子與輔助目標
                        </span>
                    </div>
            `;
            if (bonusGoals.length === 0) {
                html += `<div class="text-xs text-slate-400 italic py-3 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">目前無進行中的加分推進目標</div>`;
            } else {
                html += `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${bonusGoals.map(bg => renderMiniGoalTreeCard(bg)).join('')}
                    </div>
                `;
            }
            html += `</div>`;


            // 3. 🔄 獨立例行習慣推進 (Standalone Routine Habits)
            html += `
                <div class="space-y-4 pt-6 border-t-2 border-slate-200 dark:border-slate-700">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                        <div class="flex items-center gap-2">
                            <span class="text-xl">🔄</span>
                            <h3 class="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">例行習慣推進 (日常固定循環維護，共 ${habitGoals.length} 個)</h3>
                        </div>
                        <span class="text-xs text-teal-700 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-700">
                            自動化基線習慣
                        </span>
                    </div>
            `;
            if (habitGoals.length === 0) {
                html += `<div class="text-xs text-slate-400 italic py-3 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">目前無例行習慣目標</div>`;
            } else {
                html += `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${habitGoals.map(hg => renderMiniGoalTreeCard(hg)).join('')}
                    </div>
                `;
            }
            html += `</div>`;


            // 4. 📦 冰存休眠庫提示
            if (frozenGoals.length > 0) {
                html += `
                    <div class="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div class="bg-slate-100/90 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
                            <div class="flex items-center gap-2.5">
                                <span class="text-base">📦</span>
                                <span class="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                                    冰存靈感庫休眠中：共有 ${frozenGoals.length} 個目標暫無排程，未進入此心智圖干擾視野。
                                </span>
                            </div>
                            <button onclick="jumpToCardsViewWithBacklog()" class="text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 transition-colors shadow-2xs">
                                前往看板冰存庫檢視 ➔
                            </button>
                        </div>
                    </div>
                `;
            }


            html += `</div>`;
            return html;
        }


function renderOverview(container) {
            if (thoughts.length === 0) {
                container.innerHTML = `<div class="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200 text-sm">目前尚無記錄！</div>`;
                return;
            }


            const categoriesList = getOrderedCategories();
            const dashboardBox = document.createElement('div');
            dashboardBox.className = "bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 space-y-3";


            let dashboardHtml = `
                <div class="border-b border-slate-100 dark:border-slate-700 pb-2.5">
                    <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>📊 各領域目標與工時精簡儀表板</span>
                        <span class="text-xs font-normal text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">💡 點擊卡片可直接跳轉至該領域看板</span>
                    </h2>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">即時統計各領域之目標達成率與工時完成狀況</p>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    ${categoriesList.map(cat => {


                        const stats = getCategoryStats(cat);
                        const percentGoals = stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0;
                        const strokeDash = Math.round((percentGoals / 100) * 100);
                        return `
                            <div onclick="jumpToCardsCategory('${escapeAttr(cat)}')"
                                class="bg-slate-50/90 dark:bg-slate-900/90 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 text-center flex flex-col items-center justify-between space-y-2 cursor-pointer transition-all group shadow-xs hover:shadow-sm"
                                title="點擊跳轉至「${cat}」看板分頁進行編輯">
                                <div class="relative w-14 h-14 flex items-center justify-center">
                                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <path class="text-slate-200 dark:text-slate-700" stroke-width="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path class="text-indigo-600 stroke-current transition-all duration-500" stroke-width="3.5" stroke-dasharray="${strokeDash}, 100" stroke-linecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    </svg>
                                    <span class="absolute text-xs font-extrabold text-slate-800 dark:text-slate-100">${percentGoals}%</span>
                                </div>
                                <div class="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate w-full flex items-center justify-center gap-1">
                                    <span>${cat}</span>
                                    <span class="text-[10px] text-indigo-500 font-normal">🔗</span>
                                </div>
                                <div class="space-y-0.5 text-[11px] w-full">
                                    <div class="text-slate-600 dark:text-slate-300 font-medium">🎯 目標: <span class="font-bold text-slate-800 dark:text-slate-100">${stats.completedGoals}/${stats.totalGoals}</span></div>
                                    <div class="text-slate-600 dark:text-slate-300 font-medium">⏱️ 工時: <span class="font-bold text-emerald-600 dark:text-emerald-400">${stats.completedHours.toFixed(1)}h</span> / ${stats.totalHours.toFixed(1)}h</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            dashboardBox.innerHTML = dashboardHtml;
            container.appendChild(dashboardBox);


            const viewControlWrapper = document.createElement('div');
            viewControlWrapper.className = "space-y-3";


            let viewControlHtml = `
                <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
                    <h2 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <span>🎯 各領域與目標全覽視圖</span>
                    </h2>
                    <div class="flex items-center gap-1.5 bg-slate-200/80 dark:bg-slate-900/80 p-1 rounded-xl flex-wrap">
                        <button onclick="toggleOverviewSubMode('grid')" class="px-3 py-1 text-xs font-bold rounded-lg transition-all ${overviewSubMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'}">
                            📱 網格全覽
                        </button>
                        <button onclick="toggleOverviewSubMode('matrix')" class="px-3 py-1 text-xs font-bold rounded-lg transition-all ${overviewSubMode === 'matrix' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'}">
                            ↔️ 橫向矩陣
                        </button>
                        <button onclick="toggleOverviewSubMode('mindmap')" class="px-3 py-1 text-xs font-bold rounded-lg transition-all ${overviewSubMode === 'mindmap' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'}">
                            🧠 戰略心智圖
                        </button>
                        <button onclick="toggleOverviewSubMode('forteller')" class="px-3 py-1 text-xs font-bold rounded-lg transition-all ${overviewSubMode === 'forteller' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'}">
                            🔮 戰略推演 (Forteller)
                        </button>
                    </div>
                </div>
            `;
            if (overviewSubMode === 'grid') {
                viewControlHtml += `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                        ${categoriesList.map(cat => {


                            const cardList = thoughts.filter(t => (t.category || '💼 事業') === cat);
                            const stats = getCategoryStats(cat);
                            const percentGoals = stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0;
                            return `
                                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between hover:border-indigo-200 dark:hover:border-indigo-500 transition-all">
                                    <div>
                                        <div onclick="jumpToCardsCategory('${escapeAttr(cat)}')" class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5 cursor-pointer group" title="點擊跳轉至「${cat}」看板分頁">
                                            <h3 class="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1.5">
                                                <span>${cat}</span>
                                                <span class="text-xs text-indigo-500">🔗</span>
                                            </h3>
                                            <div class="flex items-center gap-1.5">
                                                <span class="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold border border-indigo-100 dark:border-indigo-900">${cardList.length} 個目標</span>
                                                <span class="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-100 dark:border-emerald-900">${percentGoals}%</span>
                                            </div>
                                        </div>
                                        <div class="space-y-2.5 mt-3">
                                            ${cardList.length === 0 ? `<div class="text-xs text-slate-400 italic py-3 text-center">尚無目標</div>` : ''}
                                            ${cardList.map((t, i) => {


                                                const steps = Array.isArray(t.steps) ? t.steps : [];
                                                const doneCount = steps.filter(s => s.done).length;
                                                const totalCount = steps.length;
                                                const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
                                                return `
                                                    <div onclick="jumpToGoalCard(${t.id})" class="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-xs transition-all space-y-1.5 cursor-pointer" title="點擊跳轉至看板模式並精確定位至此目標卡片">
                                                        <div class="flex items-start justify-between gap-2">
                                                            <div class="flex items-start gap-1.5 flex-1 min-w-0">
                                                                <span class="inline-flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] w-4 h-4 rounded-full shrink-0 mt-0.5">${i + 1}</span>
                                                                <span class="font-bold text-slate-900 dark:text-slate-100 text-xs truncate leading-snug hover:text-indigo-600 dark:hover:text-indigo-400">${t.text}</span>
                                                            </div>
                                                            <div class="flex items-center gap-1 shrink-0">
                                                                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded border ${getGoalFocusTag(t).badgeClass}">${getGoalFocusTag(t).label}</span>
                                                                <span class="text-[10px] text-indigo-600 dark:text-indigo-300 font-extrabold bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">${doneCount}/${totalCount} (${percent}%)</span>
                                                            </div>
                                                        </div>
                                                        <div class="flex items-center justify-between text-[10px] text-slate-500">
                                                            <span class="text-amber-800 dark:text-amber-400 font-medium truncate">🎯 <span class="${t.goalDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}">${t.goal || '未設定'}</span></span>
                                                            <span class="shrink-0 font-medium">📅 ${t.targetDate || '未指定'}</span>
                                                        </div>
                                                        <div class="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                                                            <div class="bg-indigo-600 h-full transition-all duration-300" style="width: ${percent}%"></div>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } else if (overviewSubMode === 'matrix') {
                viewControlHtml += `
                    <div class="flex items-center justify-end gap-1.5 mb-2">
                        <button onclick="scrollMatrixLeft()" class="text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 font-bold" title="向左捲動">◀ 滾動</button>
                        <button onclick="scrollMatrixRight()" class="text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 font-bold" title="向右捲動">滾動 ▶</button>
                    </div>


                    <div id="matrixScrollContainer" class="overflow-x-auto pb-4 scroll-smooth w-full">
                        <div class="flex gap-3.5 items-start min-w-max">
                            ${categoriesList.map(cat => {


                                const cardList = thoughts.filter(t => (t.category || '💼 事業') === cat);
                                return `
                                    <div class="w-64 sm:w-72 bg-white dark:bg-slate-800 p-3.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-3 shrink-0">
                                        <div onclick="jumpToCardsCategory('${escapeAttr(cat)}')" class="flex items-center justify-between border-b border-slate-100 pb-2.5 cursor-pointer hover:text-indigo-600 group" title="點擊跳轉至「${cat}」看板分頁">
                                            <h3 class="font-bold text-sm text-slate-900 group-hover:text-indigo-600 flex items-center gap-1.5">
                                                <span>${cat}</span>
                                                <span class="text-xs text-indigo-500">🔗</span>
                                            </h3>
                                            <span class="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold border border-indigo-100 dark:border-indigo-900">${cardList.length} 個目標</span>
                                        </div>
                                        <div class="space-y-3">
                                            ${cardList.length === 0 ? `<div class="text-xs text-slate-400 italic py-4 text-center">尚無目標</div>` : ''}
                                            ${cardList.map((t, i) => {


                                                const steps = Array.isArray(t.steps) ? t.steps : [];
                                                const doneCount = steps.filter(s => s.done).length;
                                                const totalCount = steps.length;
                                                const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
                                                return `
                                                    <div onclick="jumpToGoalCard(${t.id})" class="bg-slate-50/90 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm transition-all space-y-2 cursor-pointer" title="點擊跳轉至看板模式並精確定位至此目標卡片">
                                                        <div class="flex items-start gap-2">
                                                            <span class="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold text-xs w-5 h-5 rounded-full shrink-0 mt-0.5">${i + 1}</span>
                                                            <div class="flex-1 min-w-0">
                                                                <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 flex-wrap">
                                                                    <span>${t.text}</span>
                                                                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded border ${getGoalFocusTag(t).badgeClass}">${getGoalFocusTag(t).label}</span>
                                                                </h4>
                                                                <div class="text-xs text-amber-800 dark:text-amber-400 font-medium mt-1">🎯 <span class="${t.goalDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}">${t.goal || '未設定'}</span></div>
                                                            </div>
                                                        </div>
                                                        ${t.detail ? `<p class="text-[11px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 p-2 rounded-lg whitespace-pre-wrap leading-relaxed border border-slate-200/60 dark:border-slate-700">📝 ${t.detail}</p>` : ''}
                                                        <div class="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                                                            <span>📅 ${t.targetDate || '未指定'} (${t.targetTimeSlot || '全天'})</span>
                                                            <span class="text-indigo-600 font-bold">${doneCount}/${totalCount} (${percent}%)</span>
                                                        </div>
                                                        <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                                            <div class="bg-indigo-600 h-full transition-all duration-300" style="width: ${percent}%"></div>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            } else if (overviewSubMode === 'mindmap') {
                viewControlHtml += renderFocusMindmapHtml();
            } else if (overviewSubMode === 'forteller') {
                viewControlHtml += renderFortellerMatrixHtml();
            }
            viewControlWrapper.innerHTML = viewControlHtml;
            container.appendChild(viewControlWrapper);
            if (overviewSubMode === 'forteller') {
                setTimeout(initFortellerScrollInteractions, 50);
            }
        }
