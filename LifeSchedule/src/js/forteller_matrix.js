// ==========================================
        // 【v5.1.0 Forteller 動態跨年月份推演核心函式】
        // ==========================================


        // 動態計算 Forteller 戰略推演盤月份欄位清單 (自動延伸至遠期目標月份，支援 2027/1 及跨年度)
        function getFortellerMonthCols() {
            const currentMonthKey = '2026/10';
            const prevMonthKey = getRelativeMonthKey(currentMonthKey, -1);
            const startSetting = getFortellerStartMonthSetting();


            // 【v5.3.4 Forteller 全部歷史月份動態探測修復】：自動搜尋實際最早歷史資料月份，動態計算連續時間軸並自然交由空白壓縮處理
            let earliestDataMonthKey = prevMonthKey;
            let [curY0, curM0] = currentMonthKey.split('/').map(Number);
            let minDataVal = curY0 * 12 + curM0;


            thoughts.forEach(t => {
                [t.targetDate, t.lastCompletedDate].forEach(d => {
                    if (d && d.length >= 7 && d !== '未指定日期') {
                        const p = d.replace(/\//g, '-').split('-');
                        const y = parseInt(p[0]), mo = parseInt(p[1]);
                        if (!isNaN(y) && !isNaN(mo) && y >= 2000 && y <= 2100) {
                            const v = y * 12 + mo;
                            if (v < minDataVal) {
                                minDataVal = v;
                                earliestDataMonthKey = `${y}/${mo}`;
                            }
                        }
                    }
                });
                const ms = getThoughtMilestones(t);
                ms.forEach(m => {
                    [m.targetDate, m.completedDate].forEach(d => {
                        if (d && d.length >= 7 && d !== '未指定日期') {
                            const p = d.replace(/\//g, '-').split('-');
                            const y = parseInt(p[0]), mo = parseInt(p[1]);
                            if (!isNaN(y) && !isNaN(mo) && y >= 2000 && y <= 2100) {
                                const v = y * 12 + mo;
                                if (v < minDataVal) {
                                    minDataVal = v;
                                    earliestDataMonthKey = `${y}/${mo}`;
                                }
                            }
                        }
                    });
                });
                (t.steps || []).forEach(s => {
                    [s.stepDate, s.completedDate].forEach(d => {
                        if (d && d.length >= 7 && d !== '未指定日期') {
                            const p = d.replace(/\//g, '-').split('-');
                            const y = parseInt(p[0]), mo = parseInt(p[1]);
                            if (!isNaN(y) && !isNaN(mo) && y >= 2000 && y <= 2100) {
                                const v = y * 12 + mo;
                                if (v < minDataVal) {
                                    minDataVal = v;
                                    earliestDataMonthKey = `${y}/${mo}`;
                                }
                            }
                        }
                    });
                });
            });


            let cutoffMonthKey = prevMonthKey;
            if (startSetting === 'current_month') {
                cutoffMonthKey = currentMonthKey;
            } else if (startSetting === 'year_start') {
                const [y] = currentMonthKey.split('/');
                cutoffMonthKey = `${y}/1`;
            } else if (startSetting === 'all') {
                cutoffMonthKey = earliestDataMonthKey; // 依實際最早資料動態決定起始歷史月份
            } else if (startSetting.includes('/')) {
                cutoffMonthKey = startSetting;
            }


            const [cutY, cutM] = cutoffMonthKey.split('/').map(Number);
            const cutoffVal = cutY * 12 + cutM;


            let startYear = cutY, startMonth = cutM;
            let endYear = 2027, endMonth = 2; // 預設至少涵蓋至 2027/2


            const activeMonthsSet = new Set([cutoffMonthKey, currentMonthKey]); // 起始基準月與當月恆保留


            thoughts.forEach(t => {
                const ms = getThoughtMilestones(t);
                ms.forEach(m => {
                    if (m.targetDate && m.targetDate.length >= 7 && m.targetDate !== '未指定日期') {
                        const p = m.targetDate.replace(/\//g, '-').split('-');
                        const y = parseInt(p[0]);
                        const mo = parseInt(p[1]);
                        if (!isNaN(y) && !isNaN(mo)) {
                            const val = y * 12 + mo;
                            if (val >= cutoffVal) {
                                activeMonthsSet.add(`${y}/${mo}`);
                                if (y > endYear || (y === endYear && mo > endMonth)) {
                                    endYear = y;
                                    endMonth = mo;
                                }
                            }
                        }
                    }
                });
                (t.steps || []).forEach(s => {
                    if (s.stepDate && s.stepDate.length >= 7 && s.stepDate !== '未指定日期') {
                        const p = s.stepDate.replace(/\//g, '-').split('-');
                        const y = parseInt(p[0]);
                        const mo = parseInt(p[1]);
                        if (!isNaN(y) && !isNaN(mo)) {
                            const val = y * 12 + mo;
                            if (val >= cutoffVal) {
                                activeMonthsSet.add(`${y}/${mo}`);
                                if (y > endYear || (y === endYear && mo > endMonth)) {
                                    endYear = y;
                                    endMonth = mo;
                                }
                            }
                        }
                    }
                });
            });


            // 建立從 cutoff 到 endYear/endMonth 的連續全量時間軸
            const fullCalendar = [];
            let curY = startYear, curM = startMonth;
            const maxSpan = (endYear - startYear + 1) * 12 + 24; // 動態計算安全上限，確保完整生成至 endYear/endMonth
            let count = 0;
            while ((curY < endYear || (curY === endYear && curM <= endMonth)) && count < maxSpan) {
                fullCalendar.push(`${curY}/${curM}`);
                curM++;
                if (curM > 12) {
                    curM = 1;
                    curY++;
                }
                count++;
            }


            // 【空白月份智能壓縮】：連續空白月份在相鄰有數據的月份之間最多僅保留 1 個空白緩衝月
            const compressedCols = [];
            let prevWasEmpty = false;
            fullCalendar.forEach(mKey => {
                const hasData = activeMonthsSet.has(mKey);
                if (hasData) {
                    compressedCols.push(mKey);
                    prevWasEmpty = false;
                } else {
                    if (!prevWasEmpty) {
                        compressedCols.push(mKey); // 保留這 1 個空白緩衝月份
                        prevWasEmpty = true;
                    }
                }
            });


            let finalCols = compressedCols.length > 0 ? compressedCols : [cutoffMonthKey, currentMonthKey];


            // 【v5.3.10 依螢幕寬度動態自適應顯示月份資料量】：寬螢幕展現更多，窄螢幕聚焦當前
            const spanSetting = getFortellerSpanSetting();
            let maxMonthCount = 999;
            if (spanSetting === 'auto') {
                const w = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 1440;
                if (w >= 2200) maxMonthCount = 16;
                else if (w >= 1800) maxMonthCount = 12;
                else if (w >= 1400) maxMonthCount = 9;
                else if (w >= 1024) maxMonthCount = 6;
                else if (w >= 768) maxMonthCount = 4;
                else maxMonthCount = 3;
            } else if (spanSetting === '3') maxMonthCount = 3;
            else if (spanSetting === '6') maxMonthCount = 6;
            else if (spanSetting === '12') maxMonthCount = 12;
            else if (spanSetting === '18') maxMonthCount = 18;
            else if (spanSetting === 'all') maxMonthCount = 999;


            if (finalCols.length > maxMonthCount) {
                finalCols = finalCols.slice(0, maxMonthCount);
            }


            return finalCols;
        }


        // 輔助函式：將日期字串精準轉為所屬月份 Key (支援動態月份清單，保證 2027/1 落點在 2027/1)
        function getFortellerMonthKey(dateStr, fallbackMonthKey, availableCols = null) {
            if (!dateStr || dateStr === '未指定日期' || dateStr.length < 7) return fallbackMonthKey || '2026/10';
            let key = fallbackMonthKey || '2026/10';
            try {
                const p = dateStr.replace(/\//g, '-').split('-');
                const y = parseInt(p[0]);
                const m = parseInt(p[1]);
                if (!isNaN(y) && !isNaN(m)) {
                    key = `${y}/${m}`;
                }
            } catch(e) {}


            // 【v5.4.1 解除強制收攏至最後一欄】：回傳精準月份 key (不強塞入 lastCol，杜絕 2027/12 被擠入 2026/11 造成多棒擠壓之 Bug)
            return key;
        }


        // 渲染步驟與目標單元格內部內容 (落實 Forteller 試算表之色彩管理：卡片目標橘黃、拆解目標藍青、已完成綠色、步驟乾淨文字)
        
        // 【v5.3.1 橫向捲動快捷輔助函式】：免拉橫軸快速平移與對齊
        function scrollFortellerTable(offset) {
            const el = document.getElementById('fortellerTableContainer');
            if (el) el.scrollBy({ left: offset, behavior: 'smooth' });
        }


        function scrollFortellerToCurrentMonth() {
            const el = document.getElementById('fortellerTableContainer');
            const target = document.getElementById('forteller-th-2026-10') || (el ? el.querySelector('[data-month-col="2026/10"]') : null);
            if (el && target) {
                const offsetLeft = target.offsetLeft - el.offsetLeft - 120;
                el.scrollTo({ left: Math.max(0, offsetLeft), behavior: 'smooth' });
            }
        }


        function initFortellerScrollInteractions() {
            const el = document.getElementById('fortellerTableContainer');
            if (!el || !el.dataset || el.dataset.scrollInited) return;
            el.dataset.scrollInited = 'true';


            // 1. 滑鼠滾輪自然滾動 (支援垂直滾動與 Shift+水平滾動)
            el.addEventListener('wheel', (e) => {
                if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                    el.scrollLeft += (e.deltaX || e.deltaY);
                } else {
                    el.scrollTop += e.deltaY;
                }
            }, { passive: true });


            // 2. 滑鼠按住左鍵 2D 全方位拖曳平移 (支援上下左右自由滑動，附帶拖曳防誤觸卡片保護)
            let isDown = false;
            let startX = 0, startY = 0;
            let scrollLeft = 0, scrollTop = 0;
            let hasDragged = false;


            el.addEventListener('mousedown', (e) => {
                if (e.target.closest('button, a, input, select')) return;
                if (e.button !== 0) return; // 僅限左鍵拖曳


                isDown = true;
                hasDragged = false;
                startX = e.pageX - el.offsetLeft;
                startY = e.pageY - el.offsetTop;
                scrollLeft = el.scrollLeft;
                scrollTop = el.scrollTop;
                el.classList.add('cursor-grabbing');
                el.classList.remove('cursor-grab');
            });


            window.addEventListener('mouseup', () => {
                if (isDown) {
                    isDown = false;
                    el.classList.remove('cursor-grabbing');
                    el.classList.add('cursor-grab');
                }
            });


            window.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                const x = e.pageX - el.offsetLeft;
                const y = e.pageY - el.offsetTop;
                const walkX = (x - startX);
                const walkY = (y - startY);


                if (Math.abs(walkX) > 4 || Math.abs(walkY) > 4) {
                    hasDragged = true;
                }
                el.scrollLeft = scrollLeft - walkX;
                el.scrollTop = scrollTop - walkY;
            });


            // 拖曳防誤觸保護：若使用者是在拖曳滑動表格，放開滑鼠時阻止觸發單元格內部的點擊跳轉
            el.addEventListener('click', (e) => {
                if (hasDragged) {
                    e.stopPropagation();
                    e.preventDefault();
                    hasDragged = false;
                }
            }, true);
        }


        function renderFortellerCellContent(items) {
            if (!items || items.length === 0) return '';
            return `
                <div class="space-y-1.5 leading-snug">
                    ${items.map(item => {
                        if (item.type === 'milestone') {
                            // 【v5.3.1 多棒次專屬色彩目標塊】：第 1, 2, 3, 4, 5... 棒各自擁有鮮明對應色系，完成則呈現翠綠底色
                            const stageStyle = item.stageStyle || getMilestoneStageStyle(item.milestoneStageIndex, item.done);
                            return `
                                <div class="p-1 px-1.5 rounded-md ${stageStyle.className} border font-bold text-[11px] shadow-2xs cursor-pointer hover:underline flex items-start gap-1 leading-tight" onclick="jumpToGoalCard(${item.thoughtId})" title="點擊前往卡片目標：${escapeHtml(item.text)}">
                                    <span class="shrink-0 select-none">${stageStyle.icon}</span>
                                    <span class="break-words ${item.done ? 'line-through opacity-85' : 'font-extrabold'}">${escapeHtml(item.text)}${item.dateBadge ? ` <span class="text-[9px] opacity-75 font-mono font-normal">(${item.dateBadge})</span>` : ''}</span>
                                </div>
                            `;
                        } else if (item.type === 'card_goal') {
                            const stageStyle = item.stageStyle || getMilestoneStageStyle(item.milestoneStageIndex || 0, false);
                            return `
                                <div class="p-1 px-1.5 rounded-md ${stageStyle.className} border font-extrabold text-[11px] shadow-2xs cursor-pointer hover:underline flex items-start gap-1 leading-tight" onclick="jumpToGoalCard(${item.thoughtId})" title="點擊前往卡片目標">
                                    <span class="shrink-0 select-none">${stageStyle.icon}</span>
                                    <span class="break-words font-black">${escapeHtml(item.text)}${item.dateBadge ? ` <span class="text-[9px] opacity-75 font-mono font-normal">(${item.dateBadge})</span>` : ''}</span>
                                </div>
                            `;
                        } else if (item.type === 'future_goal') {
                            const stageStyle = item.stageStyle || getMilestoneStageStyle(item.milestoneStageIndex || 1, false);
                            return `
                                <div class="p-1 px-1.5 rounded-md ${stageStyle.className} border font-bold text-[11px] shadow-2xs cursor-pointer hover:underline flex items-start gap-1 leading-tight" onclick="jumpToGoalCard(${item.thoughtId})" title="點擊前往接力目標卡片">
                                    <span class="shrink-0 select-none">${stageStyle.icon}</span>
                                    <span class="break-words font-black">${escapeHtml(item.text)}${item.dateBadge ? ` <span class="text-[9px] opacity-75 font-mono font-normal">(${item.dateBadge})</span>` : ''}</span>
                                </div>
                            `;
                        } else if (item.type === 'subgoal') {
                            return `
                                <div class="p-1 px-1.5 rounded-md bg-sky-100 dark:bg-sky-950/70 border border-sky-300 dark:border-sky-700 text-sky-950 dark:text-sky-200 font-bold text-[11px] shadow-2xs cursor-pointer hover:underline flex items-start gap-1 leading-tight" onclick="jumpToGoalCard(${item.thoughtId})" title="點擊前往拆解目標卡片">
                                    <span class="shrink-0 select-none">🔷</span>
                                    <span class="break-words font-black">${escapeHtml(item.text)}${item.dateBadge ? ` <span class="text-[9px] opacity-75 font-mono font-normal">(${item.dateBadge})</span>` : ''}</span>
                                </div>
                            `;
                        } else if (item.type === 'subgoal_link') {
                            return `
                                <div class="p-1 px-1.5 rounded-md bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-[11px] cursor-pointer hover:underline flex items-start gap-1 leading-tight" onclick="jumpToGoalCard(${item.thoughtId})" title="點擊跳轉至已拆解之獨立子目標卡片">
                                    <span class="shrink-0 select-none">🔷</span>
                                    <span class="break-words font-semibold">${escapeHtml(item.text)}${item.dateBadge ? ` <span class="text-[9px] opacity-75 font-mono font-normal">(${item.dateBadge})</span>` : ''}</span>
                                </div>
                            `;
                        } else if (item.type === 'goal_done') {
                            const stageStyle = item.stageStyle || getMilestoneStageStyle(item.milestoneStageIndex || 0, true);
                            return `
                                <div class="p-1 px-1.5 rounded-md ${stageStyle.className} border font-bold text-[11px] shadow-2xs cursor-pointer hover:underline flex items-start gap-1 leading-tight" onclick="jumpToGoalCard(${item.thoughtId})" title="點擊查看已完成目標">
                                    <span class="shrink-0 select-none">${stageStyle.icon}</span>
                                    <span class="line-through opacity-85 break-words">${escapeHtml(item.text)}${item.dateBadge ? ` <span class="text-[9px] opacity-75 font-mono font-normal">(${item.dateBadge})</span>` : ''}</span>
                                </div>
                            `;
                        } else {
                            // 未完成步驟 (> 單步, o> 循環) -> 結構化流式排版，前綴左側錨定，文字自然換行不破碎
                            const prefixColor = item.prefix === 'o>' ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400';
                            const stepStageStyle = item.stageStyle || getMilestoneStageStyle(item.milestoneStageIndex || 0, item.milestoneDone);
                            return `
                                <div class="text-[11px] text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer flex items-start gap-1.5 leading-snug ${item.depth > 0 ? 'pl-1.5' : ''}" onclick="jumpToGoalCard(${item.thoughtId})" title="${escapeAttr(item.milestoneTitle ? `專屬【${item.milestoneTitle}】的步驟` : '點擊跳轉至卡片進行編輯')}">
                                    <span class="font-mono font-bold ${prefixColor} shrink-0 select-none mt-0.5">${item.prefix}</span>
                                    <div class="min-w-0 flex-1 break-words">
                                        ${item.milestoneBadge ? `
                                            <span class="inline-block text-[9px] font-mono font-bold px-1 py-0.2 rounded ${stepStageStyle.className} border shrink-0 select-none mr-1 align-baseline" title="此步驟屬於：第${(item.milestoneStageIndex || 0) + 1}棒【${escapeHtml(item.milestoneTitle || '')}】">
                                                ${stepStageStyle.icon} ${escapeHtml(item.milestoneBadge)}
                                            </span>
                                        ` : ''}
                                        ${item.goalTitle ? `
                                            <span class="inline-block text-[9px] font-bold px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 select-none mr-1 align-baseline" title="所屬目標：${escapeHtml(item.goalTitle)}">
                                                📌 ${escapeHtml(item.goalTitle)}
                                            </span>
                                        ` : ''}
                                        <span class="font-medium">${escapeHtml(item.text)}</span>
                                        ${item.dateBadge ? ` <span class="text-[9px] opacity-70 font-mono font-normal whitespace-nowrap">(${item.dateBadge})</span>` : ''}
                                    </div>
                                </div>
                            `;
                        }
                    }).join('')}
                </div>
            `;
        }


// 渲染 Forteller 戰略推演矩陣 (整合領域模式與目標模式)
        function renderFortellerMatrixHtml() {
            const monthCols = getFortellerMonthCols();
            const currentMonthKey = '2026/10';


            // 取得看板分頁中的領域清單 (【v5.3.0】：完全依據看板模式下的領域分頁，不擅自混入未使用的預設領域)
            const rawCategories = typeof getOrderedCategories === 'function' ? getOrderedCategories() : [];
            const domains = (Array.isArray(rawCategories) ? rawCategories : []).filter(c => c !== '全部');


            // 判斷目標卡片篩選狀態
            const isAllGoalsSelected = (fortellerSelectedGoalIds.length === 0);
            const selectedGoalCount = isAllGoalsSelected ? thoughts.length : fortellerSelectedGoalIds.filter(id => thoughts.some(t => t.id === id)).length;


            // 篩選有效的頂層目標卡片 (排除作為子目標嵌入在其他卡片內的拆解目標)
            const rootThoughts = thoughts.filter(t => {
                const isDirectChild = t.parentStepInfo && thoughts.some(p => p.id === t.parentStepInfo.parentThoughtId);
                if (isDirectChild) return false;
                if (!isAllGoalsSelected && !fortellerSelectedGoalIds.includes(t.id)) return false;
                return true;
            });


            // ==========================================
            // 模式 A：領域模式 (Domain Mode)
            // 【v5.3.1 領域模式重構】：拆解目標 (子/孫目標) 依各自設定之 category 歸入對應領域
            // ==========================================
            let domainRows = [];
            let domainAutoNo = 1;


            if (fortellerMode === 'domain') {
                domains.forEach(domain => {
                    if (fortellerFilterDomain !== 'all' && fortellerFilterDomain !== domain) return;


                    // 找出 category 屬於該領域的所有目標卡片 (包含母目標卡片與拆解之子/孫目標卡片)
                    const domainThoughts = thoughts.filter(t => {
                        if (!isAllGoalsSelected) {
                            const root = getRootThought(t);
                            const isMatch = fortellerSelectedGoalIds.includes(t.id) || (root && fortellerSelectedGoalIds.includes(root.id));
                            if (!isMatch) return false;
                        }
                        return (t.category || '💼 事業') === domain;
                    });


                    if (domainThoughts.length === 0) {
                        if (fortellerShowAllDomains) {
                            domainRows.push({
                                no: domainAutoNo++,
                                domain: domain,
                                thought: null,
                                isSubGoal: false
                            });
                        }
                    } else {
                        domainThoughts.forEach(t => {
                            domainRows.push({
                                no: domainAutoNo++,
                                domain: domain,
                                thought: t,
                                isSubGoal: Boolean(t.parentStepInfo && t.parentStepInfo.parentThoughtId)
                            });
                        });
                    }
                });
            }


            // ==========================================
            // 模式 B：目標模式 (Goal Mode)
            // 規則：步驟有拆解目標改顯示拆解目標的最終目標（有藍青底色標籤），無拆解目標顯示步驟；各分枝專屬 NO.，終局目標依日期落點並跨軌道合併
            // ==========================================
            let goalModeRows = [];
            let goalAutoNo = 1;


            if (fortellerMode === 'goal') {
                rootThoughts.forEach(root => {
                    const rootTracks = [];
                    const visitedThoughts = new Set();


                    // 遞迴生成該目標及其所有子、孫拆解目標的專屬軌道
                    function buildTracks(t, depth, parentStep) {
                        if (!t || visitedThoughts.has(t.id)) return;
                        visitedThoughts.add(t.id);


                        const stepsWithSubgoals = [];
                        const directSteps = [];


                        (t.steps || []).forEach(s => {
                            if (s.done) return; // 排除已完成步驟
                            let child = null;
                            if (s.linkedThoughtId) child = thoughts.find(x => x.id === s.linkedThoughtId);
                            if (!child) child = thoughts.find(x => x.parentStepInfo && x.parentStepInfo.parentThoughtId === t.id && x.parentStepInfo.parentStepId === s.id);


                            if (child) {
                                stepsWithSubgoals.push({ step: s, child: child });
                            } else {
                                directSteps.push(s);
                            }
                        });


                        // 建立當前 t 的軌道 (記錄 parentStep 以供精準追溯來源)
                        rootTracks.push({
                            thought: t,
                            domain: t.category || root.category || '💼 事業',
                            depth: depth,
                            isRootTrack: (depth === 0),
                            subGoalCard: (depth > 0 ? t : null),
                            directSteps: directSteps,
                            subGoalSteps: stepsWithSubgoals,
                            parentStep: parentStep
                        });


                        // 依序遞迴深入每一個有拆解目標的子卡片（子目標、孫目標、曾孫目標...）
                        stepsWithSubgoals.forEach(item => {
                            buildTracks(item.child, depth + 1, item.step);
                        });
                    }


                    buildTracks(root, 0, null);


                    // 領域篩選過濾
                    let filteredTracks = rootTracks;
                    if (fortellerFilterDomain !== 'all') {
                        filteredTracks = filteredTracks.filter(tr => tr.domain === fortellerFilterDomain);
                    }


                    if (filteredTracks.length > 0) {
                        const totalCount = filteredTracks.length;
                        filteredTracks.forEach((tr, trIdx) => {
                            goalModeRows.push({
                                no: goalAutoNo++,
                                domain: tr.domain,
                                track: tr,
                                rootGoal: root,
                                isFirstInRoot: (trIdx === 0),
                                rootRowspan: totalCount
                            });
                        });
                    }
                });
            }


            return `
                <div class="space-y-3.5 text-slate-800 dark:text-slate-100">
                    <!-- 頂部精簡控制列：模式切換、目標篩選與符號說明 -->
                    <div class="flex items-center justify-between gap-3 flex-wrap bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                        <!-- 左側：視圖模式切換 (領域模式 vs 目標模式) -->
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="text-sm font-extrabold flex items-center gap-1.5 text-indigo-950 dark:text-indigo-200">
                                <span>🔮 Forteller 戰略推演盤</span>
                            </span>
                            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                                <button type="button" onclick="setFortellerMode('domain')" class="px-3 py-1 rounded-lg transition-all cursor-pointer ${fortellerMode === 'domain' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'}">
                                    📂 領域模式
                                </button>
                                <button type="button" onclick="setFortellerMode('goal')" class="px-3 py-1 rounded-lg transition-all cursor-pointer ${fortellerMode === 'goal' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'}">
                                    🎯 目標模式
                                </button>
                            </div>
                            <!-- 【v5.3.1 橫向快速捲動快捷列】：免拉橫軸快速平移與對齊 -->
                            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                                <button type="button" onclick="scrollFortellerTable(-280)" class="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1" title="向左平移 (亦可滑鼠滾輪上下滾動直接左右平移)">
                                    <span>◀</span> <span class="hidden sm:inline">往左</span>
                                </button>
                                <button type="button" onclick="scrollFortellerToCurrentMonth()" class="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-all cursor-pointer flex items-center gap-1" title="一鍵對齊當前月份 (2026/10)">
                                    <span>📍</span> <span>當月</span>
                                </button>
                                <button type="button" onclick="scrollFortellerTable(280)" class="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1" title="向右平移 (亦可滑鼠滾輪上下滾動直接左右平移)">
                                    <span class="hidden sm:inline">往右</span> <span>▶</span>
                                </button>
                            </div>


                            <!-- 【v5.3.2 自訂起始月份】：預設從當月前1個月開始，歷史過多亦可隨時切換 -->
                            <div class="flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                <span class="text-slate-600 dark:text-slate-300 whitespace-nowrap pl-1">📅 起始:</span>
                                <select onchange="setFortellerStartMonth(this.value)" class="text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer focus:outline-none" title="設定戰略推演盤的最早起始月份">
                                    <option value="prev_month" ${getFortellerStartMonthSetting() === 'prev_month' ? 'selected' : ''}>前1個月 (${getRelativeMonthKey(currentMonthKey, -1)}) · 預設</option>
                                    <option value="current_month" ${getFortellerStartMonthSetting() === 'current_month' ? 'selected' : ''}>當月 (${currentMonthKey})</option>
                                    <option value="year_start" ${getFortellerStartMonthSetting() === 'year_start' ? 'selected' : ''}>今年初 (${currentMonthKey.split('/')[0]}/1)</option>
                                    <option value="all" ${getFortellerStartMonthSetting() === 'all' ? 'selected' : ''}>全部歷史月份</option>
                                </select>
                            </div>


                            <!-- 【v5.3.10 自適應螢幕跨度 / 顯示月份資料量切換】：寬螢幕自動展現更多，免滾輪滑來滑去 -->
                            <div class="flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                <span class="text-slate-600 dark:text-slate-300 whitespace-nowrap pl-1">🔭 跨度:</span>
                                <select onchange="setFortellerSpan(this.value)" class="text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer focus:outline-none" title="設定顯示月份跨度：依螢幕寬度自動適配，或自訂月份數量">
                                    <option value="auto" ${getFortellerSpanSetting() === 'auto' ? 'selected' : ''}>🌐 依螢幕自適應 · 預設</option>
                                    <option value="3" ${getFortellerSpanSetting() === '3' ? 'selected' : ''}>3 個月 (聚焦近期)</option>
                                    <option value="6" ${getFortellerSpanSetting() === '6' ? 'selected' : ''}>半年 (6 個月)</option>
                                    <option value="12" ${getFortellerSpanSetting() === '12' ? 'selected' : ''}>1 年 (12 個月)</option>
                                    <option value="18" ${getFortellerSpanSetting() === '18' ? 'selected' : ''}>1.5 年 (18 個月)</option>
                                    <option value="all" ${getFortellerSpanSetting() === 'all' ? 'selected' : ''}>全部時程</option>
                                </select>
                            </div>


                            <!-- 【v5.2.0 全人生領域檢視切換按鈕】 -->
                            <button type="button" onclick="toggleFortellerShowAllDomains()" class="px-2.5 py-1 rounded-xl transition-all cursor-pointer border text-xs font-bold flex items-center gap-1 shadow-2xs ${fortellerShowAllDomains ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-700' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-800'}" title="在推演盤最下方顯示所有人生領域，即便尚未規劃目標亦完整展現，助您省思並激發其他領域的 Action">
                                <span>🌐</span>
                                <span>${fortellerShowAllDomains ? '全領域已展開' : '僅顯示有目標領域'}</span>
                            </button>


                            <!-- 【v5.4.0 月度財務收支顯示切換按鈕】 -->
                            <button type="button" onclick="toggleFortellerFinancials()" class="px-2.5 py-1 rounded-xl transition-all cursor-pointer border text-xs font-bold flex items-center gap-1 shadow-2xs ${fortellerShowFinancials ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-800'}" title="在各月份表頭下方切換顯示主動收入、被動收入、支出與結餘微型條">
                                <span>💰</span>
                                <span>${fortellerShowFinancials ? '財務概況已展開' : '財務概況已收折'}</span>
                            </button>
                        </div>


                        <!-- 中間與右側：目標卡片篩選、領域篩選與色彩符號圖例 -->
                        <div class="flex items-center gap-2 flex-wrap text-xs">
                            <!-- 目標卡片多選下拉容器 (relative) -->
                            <div class="relative">
                                <button type="button" onclick="toggleFortellerGoalDropdown(event)" class="px-2.5 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold flex items-center gap-1 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/60">
                                    <span>🎯 目標卡片：</span>
                                    <span class="underline">${isAllGoalsSelected ? '全部目標' : `已選 ${selectedGoalCount} 個`}</span>
                                    <span class="text-[10px]">▼</span>
                                </button>


                                ${isFortellerGoalDropdownOpen ? `
                                    <!-- 【v5.3.6 手機自適應遮罩與彈窗】：手機端置中彈窗，桌機端為按鈕下方下拉選單 -->
                                    <div class="fixed inset-0 z-40 bg-slate-900/40 sm:bg-transparent cursor-default" onclick="closeFortellerGoalDropdown(event)"></div>


                                    <div class="fixed sm:absolute left-4 right-4 sm:left-0 sm:right-auto top-28 sm:top-full mt-1.5 w-auto sm:w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-2xl sm:rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xl sm:shadow-xl p-3 sm:p-2.5 z-50 space-y-2 text-xs max-h-[75vh] flex flex-col" onclick="event.stopPropagation()">
                                        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                                            <span class="font-extrabold text-slate-800 dark:text-slate-200 text-sm sm:text-xs">🎯 目標卡片篩選</span>
                                            <div class="flex items-center gap-2">
                                                <button type="button" onclick="setFortellerAllGoals(true, event)" class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer">全選</button>
                                                <span class="text-slate-300">|</span>
                                                <button type="button" onclick="setFortellerAllGoals(false, event)" class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold cursor-pointer">清空</button>
                                            </div>
                                        </div>
                                        <div class="overflow-y-auto space-y-1 pr-1 grow max-h-64 sm:max-h-52">
                                            ${thoughts.map(t => {
                                                const checked = isAllGoalsSelected || fortellerSelectedGoalIds.includes(t.id);
                                                return `
                                                    <label class="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer select-none">
                                                        <input type="checkbox" onchange="toggleFortellerGoalSelection(${t.id}, event)" ${checked ? 'checked' : ''} class="w-3.5 h-3.5 text-indigo-600 rounded">
                                                        <span class="truncate ${t.goalDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}">
                                                            ${t.isMainFocus ? '⭐ ' : ''}${escapeHtml(t.text)}
                                                        </span>
                                                    </label>
                                                `;
                                            }).join('')}
                                        </div>
                                        <div class="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                            <button type="button" onclick="closeFortellerGoalDropdown(event)" class="w-full sm:w-auto px-4 py-1.5 sm:px-3 sm:py-0.5 text-xs sm:text-[11px] font-bold bg-indigo-600 text-white rounded-lg sm:rounded-md cursor-pointer hover:bg-indigo-700 transition-colors shadow-2xs">完成</button>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>


                            <!-- 領域下拉篩選 -->
                            <select onchange="setFortellerDomain(this.value)" class="text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none">
                                <option value="all" ${fortellerFilterDomain === 'all' ? 'selected' : ''}>📁 全部領域</option>
                                ${domains.map(d => `<option value="${d}" ${fortellerFilterDomain === d ? 'selected' : ''}>${d}</option>`).join('')}
                            </select>


                            <!-- 色彩與符號對照 (完全對齊 Forteller 試算表) -->
                            <div class="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-medium flex-wrap">
                                <span class="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold">🎯 卡片目標</span>
                                <span class="px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950/70 text-sky-950 dark:text-sky-200 border border-sky-300 dark:border-sky-700 font-bold">🔷 拆解目標</span>
                                <span class="px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/70 text-purple-950 dark:text-purple-200 border border-purple-300 dark:border-purple-700 font-bold">🔮 遠期接力</span>
                                <span class="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-bold">✅ 已完成</span>
                                <span class="text-amber-600 dark:text-amber-400 font-mono font-bold">&gt; 單步</span>
                                <span class="text-teal-600 dark:text-teal-400 font-mono font-bold">o&gt; 循環</span>
                            </div>
                        </div>
                    </div>


                    <!-- 模式說明提示條 -->
                    <div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
                        <span>
                            ${fortellerMode === 'domain' 
                                ? '📂 目前為「領域模式」：依看板領域動態展開目標與未完成步驟。' 
                                : '🎯 目前為「目標模式」：步驟有拆解目標改顯示拆解最終目標（帶顏色管理），各階段「段落目標」依時間月份穿插標示，步驟與拆解目標座落於各段落目標之間月份。'}
                        </span>
                        <span class="text-[10px] text-slate-400 font-mono">點擊文字直接前往卡片</span>
                    </div>


                    <!-- 【v5.3.8 Forteller 目標模式動態欄位計算】：以母卡片里程碑為基準，於對應預期達成月份後緊鄰插入「段落目標」欄位 -->
                    ${(() => {
                        // 收集目前目標模式可見之所有母卡片中，落在可視月份內之接力里程碑落點月份
                        const milestoneMonthsSet = new Set();
                        let hasFarFutureMilestones = false;


                        const lastVisibleMonth = monthCols[monthCols.length - 1];
                        const [lvY, lvM] = lastVisibleMonth.split('/').map(Number);
                        const lastVisibleVal = lvY * 12 + lvM;


                        if (fortellerMode === 'goal') {
                            rootThoughts.forEach(root => {
                                const rootMilestones = getThoughtMilestones(root);
                                rootMilestones.forEach(m => {
                                    if (m.targetDate && m.targetDate !== '未指定日期' && m.targetDate.length >= 7) {
                                        const p = m.targetDate.replace(/\//g, '-').split('-');
                                        const mVal = parseInt(p[0]) * 12 + parseInt(p[1]);
                                        const mKey = `${parseInt(p[0])}/${parseInt(p[1])}`;
                                        if (monthCols.includes(mKey)) {
                                            milestoneMonthsSet.add(mKey);
                                        } else if (mVal > lastVisibleVal) {
                                            hasFarFutureMilestones = true;
                                        }
                                    }
                                });
                            });
                        }


                        // 建構目標模式專屬交錯欄位清單 (月份 + 緊接之段落目標)
                        window._fortellerGoalTableCols = [];
                        monthCols.forEach(mKey => {
                            window._fortellerGoalTableCols.push({ type: 'month', monthKey: mKey, label: mKey });
                            if (milestoneMonthsSet.has(mKey)) {
                                window._fortellerGoalTableCols.push({ type: 'milestone', afterMonth: mKey, label: '段落目標' });
                            }
                        });


                        // 【v5.4.1 遠期接力目標分離】：若有超出當前可視跨度的遠期接力目標，在最右側獨立呈現「🔮 遠期接力目標」欄位
                        if (fortellerMode === 'goal') {
                            if (hasFarFutureMilestones) {
                                window._fortellerGoalTableCols.push({ type: 'future_milestone', label: '🔮 遠期接力目標' });
                            } else if (!window._fortellerGoalTableCols.some(c => c.type === 'milestone')) {
                                const lastM = monthCols[monthCols.length - 1];
                                window._fortellerGoalTableCols.push({ type: 'milestone', afterMonth: lastM, label: '段落目標' });
                            }
                        }
                        return '';
                    })()}


                    <!-- Forteller 核心表格 (【v5.3.10】：支援 2D 全方位滑鼠拖曳平移、手機雙向觸控手勢、凍結表頭與凍結左側欄) -->
                    <div id="fortellerTableContainer" class="max-h-[75vh] overflow-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs select-none cursor-grab active:cursor-grabbing touch-pan-x touch-pan-y" style="-webkit-overflow-scrolling: touch;">
                        <table class="w-full border-collapse text-left text-xs table-auto relative">
                            <thead>
                                <tr class="sticky top-0 z-30 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 select-none shadow-xs">
                                    <th class="sticky left-0 top-0 z-40 bg-slate-100 dark:bg-slate-900 py-2.5 px-2 text-center font-extrabold w-12 min-w-[48px] border-r border-slate-300 dark:border-slate-700 whitespace-nowrap shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">NO.</th>
                                    <th class="sticky left-[48px] top-0 z-40 bg-slate-100 dark:bg-slate-900 py-2.5 px-2.5 font-extrabold w-32 min-w-[120px] border-r border-slate-300 dark:border-slate-700 whitespace-nowrap shadow-[4px_0_6px_-2px_rgba(0,0,0,0.06)]">領域</th>
                                    ${fortellerMode === 'goal' ? `
                                        ${(window._fortellerGoalTableCols || []).map(col => {
                                            if (col.type === 'month') {
                                                const isCurrent = (col.monthKey === currentMonthKey);
                                                return `
                                                    <th class="py-2 px-2.5 font-extrabold border-r ${isCurrent ? 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200' : 'border-slate-300 dark:border-slate-700'} whitespace-nowrap text-center w-44 min-w-[160px] align-top">
                                                        <div>${col.monthKey}${isCurrent ? ' (當月)' : ''}</div>
                                                        ${fortellerShowFinancials ? renderFortellerHeaderFinanceBadge(col.monthKey) : ''}
                                                    </th>
                                                `;
                                            } else if (col.type === 'future_milestone') {
                                                return `
                                                    <th class="py-2 px-3 font-extrabold bg-purple-50/80 dark:bg-purple-950/50 text-purple-950 dark:text-purple-200 border-r border-slate-300 dark:border-slate-700 whitespace-nowrap text-center w-52 min-w-[180px]">
                                                        🔮 遠期接力目標
                                                    </th>
                                                `;
                                            } else {
                                                return `
                                                    <th class="py-2 px-3 font-extrabold bg-amber-50/80 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 border-r border-slate-300 dark:border-slate-700 whitespace-nowrap text-center w-52 min-w-[180px]">
                                                        🎯 段落目標
                                                    </th>
                                                `;
                                            }
                                        }).join('')}
                                    ` : `
                                        ${monthCols.map(mKey => {
                                            const isCurrent = (mKey === currentMonthKey);
                                            return `
                                                <th class="py-2 px-2.5 font-extrabold border-r ${isCurrent ? 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200' : 'border-slate-300 dark:border-slate-700'} whitespace-nowrap text-center w-44 min-w-[160px] align-top">
                                                    <div>${mKey}${isCurrent ? ' (當月)' : ''}</div>
                                                    ${fortellerShowFinancials ? renderFortellerHeaderFinanceBadge(mKey) : ''}
                                                </th>
                                            `;
                                        }).join('')}
                                        <th class="py-2 px-3 font-extrabold bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 whitespace-nowrap text-center w-52 min-w-[180px]">🎯 終局目標 / 結案時間</th>
                                    `}
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                                ${fortellerMode === 'domain' ? `
                                    <!-- =================== 領域模式列表 =================== -->
                                    ${domainRows.map(row => {
                                        const t = row.thought;
                                        const itemsByMonth = {};
                                        function addDomainItem(mKey, item) {
                                            if (!itemsByMonth[mKey]) itemsByMonth[mKey] = [];
                                            itemsByMonth[mKey].push(item);
                                        }


                                        // 【v5.3.1 領域模式重構】：目標落點其所屬領域，卡片自身各棒次接力目標與專屬步驟
                                        if (t) {
                                            const tMilestones = getThoughtMilestones(t);
                                            tMilestones.forEach((m, mIdx) => {
                                                const mTargetM = getFortellerMonthKey(m.targetDate, currentMonthKey, monthCols);
                                                const mDateBadge = (m.targetDate && m.targetDate !== '未指定日期') ? m.targetDate.slice(5) : '';
                                                const stageStyle = getMilestoneStageStyle(mIdx, m.done);


                                                addDomainItem(mTargetM, {
                                                    type: 'milestone',
                                                    text: m.title,
                                                    thoughtId: t.id,
                                                    dateBadge: mDateBadge,
                                                    done: m.done,
                                                    milestoneStageIndex: mIdx,
                                                    stageStyle: stageStyle
                                                });
                                            });


                                            // 步驟落點：直接待辦步驟呈現所屬棒次色彩；若步驟已拆解為子目標，則標記導向獨立子目標卡片
                                            (t.steps || []).filter(s => !s.done).forEach(s => {
                                                const mKey = getFortellerMonthKey(s.stepDate, currentMonthKey, monthCols);
                                                const isRec = (s.recurrence && s.recurrence !== 'none');
                                                const sDateBadge = (s.stepDate && s.stepDate !== '未指定日期') ? s.stepDate.slice(5) : '';


                                                let childThought = null;
                                                if (s.linkedThoughtId) childThought = thoughts.find(x => x.id === s.linkedThoughtId);
                                                if (!childThought) childThought = thoughts.find(x => x.parentStepInfo && x.parentStepInfo.parentThoughtId === t.id && x.parentStepInfo.parentStepId === s.id);


                                                if (childThought) {
                                                    addDomainItem(mKey, {
                                                        type: 'subgoal_link',
                                                        text: `${s.text} ➔ [${childThought.category || '領域'}] ${childThought.goal || childThought.text}`,
                                                        thoughtId: childThought.id,
                                                        dateBadge: sDateBadge,
                                                        prefix: '🔷'
                                                    });
                                                } else {
                                                    let mIdx = -1;
                                                    if (s.milestoneId !== undefined && s.milestoneId !== null) {
                                                        mIdx = tMilestones.findIndex(m => String(m.id) === String(s.milestoneId));
                                                    }
                                                    if (mIdx === -1) {
                                                        mIdx = tMilestones.findIndex(m => !m.done);
                                                        if (mIdx === -1) mIdx = 0;
                                                    }
                                                    const currentM = tMilestones[mIdx];
                                                    const isDone = currentM ? currentM.done : false;
                                                    const stageStyle = getMilestoneStageStyle(mIdx, isDone);


                                                    addDomainItem(mKey, {
                                                        type: 'step',
                                                        prefix: isRec ? 'o>' : '>',
                                                        text: s.text,
                                                        stepDate: s.stepDate,
                                                        dateBadge: sDateBadge,
                                                        thoughtId: t.id,
                                                        stepId: s.id,
                                                        depth: 0,
                                                        milestoneBadge: `第${mIdx + 1}棒`,
                                                        milestoneTitle: currentM ? currentM.title : '',
                                                        milestoneStageIndex: mIdx,
                                                        milestoneDone: isDone,
                                                        stageStyle: stageStyle
                                                    });
                                                }
                                            });
                                        }


                                        return `
                                            <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors">
                                                <td class="sticky left-0 z-20 bg-white dark:bg-slate-800 py-2 px-1 text-center font-mono font-black text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 align-top text-[11px] whitespace-nowrap w-12 min-w-[48px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                                                    ${row.no}
                                                </td>
                                                <td class="sticky left-[48px] z-20 bg-white dark:bg-slate-800 py-2 px-2.5 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 align-top text-xs whitespace-nowrap w-32 min-w-[120px] shadow-[4px_0_6px_-2px_rgba(0,0,0,0.06)]">
                                                    ${row.domain}
                                                </td>
                                                ${monthCols.map(mKey => {
                                                    const items = itemsByMonth[mKey] || [];
                                                    const isCurrent = (mKey === currentMonthKey);
                                                    if (items.length === 0) {
                                                        return `<td class="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 align-top w-44 min-w-[160px] ${isCurrent ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}"></td>`;
                                                    }
                                                    return `
                                                        <td class="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 align-top w-44 min-w-[160px] ${isCurrent ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : ''}">
                                                            ${renderFortellerCellContent(items)}
                                                        </td>
                                                    `;
                                                }).join('')}
                                                <td class="py-2.5 px-3 bg-amber-50/30 dark:bg-amber-950/20 text-slate-800 dark:text-slate-200 align-middle text-xs border-b border-slate-200 dark:border-slate-700">
                                                    ${t ? (() => {
                                                        const tAllM = getThoughtMilestones(t);
                                                        const tDates = tAllM.map(x => x.targetDate).filter(d => d && d !== '未指定日期').sort();
                                                        const minTargetDate = tDates.length > 0 ? tDates[0] : '';
                                                        const maxTargetDate = tDates.length > 0 ? tDates[tDates.length - 1] : '';
                                                        const tDoneCount = tAllM.filter(x => x.done).length;
                                                        const tActiveIdx = tAllM.findIndex(x => !x.done);
                                                        const activeMilestone = (tActiveIdx >= 0) ? tAllM[tActiveIdx] : tAllM[tAllM.length - 1];


                                                        const parentThought = (t && t.parentStepInfo) ? thoughts.find(x => x.id === t.parentStepInfo.parentThoughtId) : null;
                                                        return `
                                                            <div class="space-y-1.5">
                                                                ${parentThought ? `
                                                                    <div class="text-[10px] font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1 cursor-pointer hover:underline" onclick="jumpToGoalCard(${parentThought.id})" title="點擊前往母卡片：${escapeAttr(parentThought.text)}">
                                                                        <span>🔷 拆解自母目標：${escapeHtml(parentThought.text)}</span>
                                                                    </div>
                                                                ` : ''}
                                                                <div class="font-extrabold ${row.isSubGoal ? 'text-sky-950 dark:text-sky-200' : 'text-amber-900 dark:text-amber-200'} leading-snug cursor-pointer hover:underline text-xs" onclick="jumpToGoalCard(${t.id})" title="點擊前往目標卡片">
                                                                    ${row.isSubGoal ? '🔷' : '🎯'} ${escapeHtml(t.text)}
                                                                </div>
                                                                <div class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                                    ${escapeHtml(activeMilestone ? activeMilestone.title : (t.goal || '未設定'))}
                                                                </div>
                                                                <div class="flex items-center gap-1.5 flex-wrap">
                                                                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 font-mono">
                                                                        📅 ${minTargetDate && maxTargetDate && minTargetDate !== maxTargetDate ? `${minTargetDate.slice(0, 7)} ➔ ${maxTargetDate.slice(0, 7)}` : (maxTargetDate || '2026/12/31')}
                                                                    </span>
                                                                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-mono">
                                                                        🏁 接力 ${tDoneCount}/${tAllM.length}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        `;
                                                    })() : `
                                                        <div class="text-[11px] text-slate-400 dark:text-slate-500 italic py-1 flex items-center justify-between gap-1.5">
                                                            <span>尚無規劃中的目標</span>
                                                            <button type="button" onclick="quickAddGoalForDomain('${escapeAttr(row.domain)}')" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer" title="為此領域快速建立新目標">
                                                                <span>➕ 思考新行動</span>
                                                            </button>
                                                        </div>
                                                    `}
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                ` : `
                                    <!-- =================== 目標模式列表 (v5.3.8 月份目標回歸 + 段落目標母卡片合併儲存格) =================== -->
                                    ${goalModeRows.map(row => {
                                        const tr = row.track;
                                        const root = row.rootGoal;
                                        const branchItemsByMonth = {};
                                        function addBranchItem(mKey, item) {
                                            if (!branchItemsByMonth[mKey]) branchItemsByMonth[mKey] = [];
                                            branchItemsByMonth[mKey].push(item);
                                        }


                                        // A. 【母/子/孫目標落點月度】：將本軌道對應卡片之接力里程碑目標按 targetDate 顯示在數字月份欄位內
                                        const tMilestones = getThoughtMilestones(tr.thought);
                                        tMilestones.forEach((m, mIdx) => {
                                            const mTargetM = getFortellerMonthKey(m.targetDate, currentMonthKey, monthCols);
                                            const mDateBadge = (m.targetDate && m.targetDate !== '未指定日期') ? m.targetDate.slice(5) : '';
                                            const stageStyle = getMilestoneStageStyle(mIdx, m.done);


                                            addBranchItem(mTargetM, {
                                                type: 'milestone',
                                                text: m.title,
                                                thoughtId: tr.thought.id,
                                                dateBadge: mDateBadge,
                                                done: m.done,
                                                milestoneStageIndex: mIdx,
                                                stageStyle: stageStyle
                                            });
                                        });


                                        // B. 放置未拆解的待辦步驟 (乾淨文字，> 單步，o> 循環，並關聯所屬接力棒次專屬色彩)
                                        (tr.directSteps || []).forEach(s => {
                                            const mKey = getFortellerMonthKey(s.stepDate, currentMonthKey, monthCols);
                                            const isRec = (s.recurrence && s.recurrence !== 'none');
                                            const sDateBadge = (s.stepDate && s.stepDate !== '未指定日期') ? s.stepDate.slice(5) : '';


                                            let milestoneBadge = '';
                                            let milestoneTitle = '';
                                            let mIdx = -1;
                                            if (tMilestones.length > 0) {
                                                if (s.milestoneId !== undefined && s.milestoneId !== null) {
                                                    mIdx = tMilestones.findIndex(m => String(m.id) === String(s.milestoneId));
                                                }
                                                if (mIdx === -1) {
                                                    mIdx = tMilestones.findIndex(m => !m.done);
                                                }
                                                if (mIdx === -1) {
                                                    mIdx = 0;
                                                }
                                                if (mIdx >= 0 && mIdx < tMilestones.length) {
                                                    milestoneBadge = `第${mIdx + 1}棒`;
                                                    milestoneTitle = tMilestones[mIdx].title;
                                                }
                                            }
                                            const currentM = (mIdx >= 0 && mIdx < tMilestones.length) ? tMilestones[mIdx] : null;
                                            const isDone = currentM ? currentM.done : false;
                                            const stageStyle = getMilestoneStageStyle(mIdx >= 0 ? mIdx : 0, isDone);


                                            addBranchItem(mKey, {
                                                type: 'step',
                                                prefix: isRec ? 'o>' : '>',
                                                text: s.text,
                                                stepDate: s.stepDate,
                                                dateBadge: sDateBadge,
                                                thoughtId: tr.thought.id,
                                                stepId: s.id,
                                                depth: 0,
                                                milestoneBadge: milestoneBadge,
                                                milestoneTitle: milestoneTitle,
                                                milestoneStageIndex: mIdx >= 0 ? mIdx : 0,
                                                milestoneDone: isDone,
                                                stageStyle: stageStyle
                                            });
                                        });


                                        // 【v5.3.9 拆解目標去重優化】：若母卡片步驟已有拆解目標，則本軌道僅顯示該拆解子/孫卡片自身的目標與步驟，不重複顯示母卡片原步驟
                                        const goalTableCols = window._fortellerGoalTableCols || [];


                                        return `
                                            <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors">
                                                <td class="sticky left-0 z-20 bg-white dark:bg-slate-800 py-2 px-1 text-center font-mono font-black text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 align-top text-[11px] whitespace-nowrap w-12 min-w-[48px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                                                    ${row.no}
                                                </td>
                                                <td class="sticky left-[48px] z-20 bg-white dark:bg-slate-800 py-2 px-2.5 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 align-top text-xs whitespace-nowrap w-32 min-w-[120px] shadow-[4px_0_6px_-2px_rgba(0,0,0,0.06)]">
                                                    ${row.domain}
                                                </td>
                                                ${goalTableCols.map((col, cIdx) => {
                                                    if (col.type === 'month') {
                                                        const items = branchItemsByMonth[col.monthKey] || [];
                                                        const isCurrent = (col.monthKey === currentMonthKey);
                                                        if (items.length === 0) {
                                                            return `<td class="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 align-top w-44 min-w-[160px] ${isCurrent ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}"></td>`;
                                                        }
                                                        return `
                                                            <td class="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 align-top w-44 min-w-[160px] ${isCurrent ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : ''}">
                                                                ${renderFortellerCellContent(items)}
                                                            </td>
                                                        `;
                                                    } else if (col.type === 'future_milestone') {
                                                        // 【v5.4.1 遠期接力目標單元格】：展示落在可視月份之後的接力棒次 (真實年份，不再與近期棒次擠在同一個月)
                                                        if (!row.isFirstInRoot) {
                                                            return '';
                                                        }
                                                        const lastVisibleMonth = monthCols[monthCols.length - 1];
                                                        const [lvY, lvM] = lastVisibleMonth.split('/').map(Number);
                                                        const lastVisibleVal = lvY * 12 + lvM;


                                                        const rootMilestones = getThoughtMilestones(root);
                                                        const futureMilestones = [];
                                                        rootMilestones.forEach((m, mIdx) => {
                                                            if (m.targetDate && m.targetDate !== '未指定日期' && m.targetDate.length >= 7) {
                                                                const p = m.targetDate.replace(/\//g, '-').split('-');
                                                                const mVal = parseInt(p[0]) * 12 + parseInt(p[1]);
                                                                if (mVal > lastVisibleVal) {
                                                                    futureMilestones.push({ milestone: m, stageIndex: mIdx });
                                                                }
                                                            }
                                                        });


                                                        if (futureMilestones.length === 0) {
                                                            return `<td rowspan="${row.rootRowspan}" class="py-2 px-2 border-r border-slate-200 dark:border-slate-700 align-middle bg-slate-50/20 dark:bg-slate-850/10 text-center text-slate-300 dark:text-slate-600 font-mono text-xs select-none">·</td>`;
                                                        }


                                                        return `
                                                            <td rowspan="${row.rootRowspan}" class="py-2.5 px-3 border-r border-slate-300 dark:border-slate-600 align-middle bg-purple-50/30 dark:bg-purple-950/20 text-slate-800 dark:text-slate-200 min-w-[150px] max-w-[220px] shadow-2xs">
                                                                <div class="space-y-2">
                                                                    <div class="font-extrabold text-purple-950 dark:text-purple-200 leading-snug cursor-pointer hover:underline text-xs flex items-center gap-1" onclick="jumpToGoalCard(${root.id})" title="點擊前往母目標卡片：${escapeAttr(root.text)}">
                                                                        <span class="select-none text-sm">🔮</span>
                                                                        <span class="break-words font-black">${escapeHtml(root.text)}</span>
                                                                    </div>
                                                                    ${futureMilestones.map(({ milestone: m, stageIndex: mIdx }) => {
                                                                        const stageStyle = getMilestoneStageStyle(mIdx, m.done);
                                                                        const badgeClass = stageStyle.paletteClass || stageStyle.className;
                                                                        const isDone = m.done;
                                                                        return `
                                                                            <div class="p-2 rounded-xl border font-bold ${badgeClass} shadow-2xs cursor-pointer hover:opacity-95 transition-all text-xs leading-snug flex flex-col gap-1" onclick="jumpToGoalCard(${root.id})" title="點擊跳轉至母目標卡片：${escapeAttr(m.title)}">
                                                                                <div class="flex items-center justify-between gap-1 text-[10px] font-mono">
                                                                                    <span class="font-black">${stageStyle.icon} 第 ${mIdx + 1} 棒</span>
                                                                                    <span class="text-[9px] opacity-90 font-bold bg-white/60 dark:bg-black/30 px-1 py-0.2 rounded">${m.targetDate && m.targetDate !== '未指定日期' ? m.targetDate.slice(0, 7).replace('-', '/') : '未指定'}</span>
                                                                                </div>
                                                                                <div class="${isDone ? 'line-through opacity-70 font-normal' : 'font-black text-[12px]'} break-words">
                                                                                    ${escapeHtml(m.title)}
                                                                                </div>
                                                                                ${m.done ? `
                                                                                    <div class="text-[9px] text-emerald-700 dark:text-emerald-300 font-mono">
                                                                                        ✓ 已達成 ${m.completedDate ? `(${m.completedDate.slice(5)})` : ''}
                                                                                    </div>
                                                                                ` : ''}
                                                                            </div>
                                                                        `;
                                                                    }).join('')}
                                                                </div>
                                                            </td>
                                                        `;
                                                    } else {
                                                        // 【v5.3.8 段落目標單元格】：只放母卡片的目標資訊，且跨 NO. 合併儲存格 (含所有同一母卡片下的子孫步驟)
                                                        if (!row.isFirstInRoot) {
                                                            // 非母卡片第一軌道，由首軌道之 rowspan 涵蓋，此處不渲染 td
                                                            return '';
                                                        }


                                                        const matchedMilestones = [];
                                                        const rootMilestones = getThoughtMilestones(root);
                                                        rootMilestones.forEach((m, mIdx) => {
                                                            if (m.targetDate && m.targetDate !== '未指定日期') {
                                                                const p = m.targetDate.replace(/\//g, '-').split('-');
                                                                const mKey = `${parseInt(p[0])}/${parseInt(p[1])}`;
                                                                if (mKey === col.afterMonth) {
                                                                    matchedMilestones.push({ milestone: m, stageIndex: mIdx });
                                                                }
                                                            }
                                                        });


                                                        if (matchedMilestones.length === 0) {
                                                            return `<td rowspan="${row.rootRowspan}" class="py-2 px-2 border-r border-slate-200 dark:border-slate-700 align-middle bg-slate-50/20 dark:bg-slate-850/10 text-center text-slate-300 dark:text-slate-600 font-mono text-xs select-none">·</td>`;
                                                        }


                                                        return `
                                                            <td rowspan="${row.rootRowspan}" class="py-2.5 px-3 border-r border-slate-300 dark:border-slate-600 align-middle bg-amber-50/40 dark:bg-amber-950/25 text-slate-800 dark:text-slate-200 min-w-[150px] max-w-[220px] shadow-2xs">
                                                                <div class="space-y-2">
                                                                    <div class="font-extrabold text-amber-950 dark:text-amber-200 leading-snug cursor-pointer hover:underline text-xs flex items-center gap-1" onclick="jumpToGoalCard(${root.id})" title="點擊前往母目標卡片：${escapeAttr(root.text)}">
                                                                        <span class="select-none text-sm">🎯</span>
                                                                        <span class="break-words font-black">${escapeHtml(root.text)}</span>
                                                                    </div>
                                                                    ${matchedMilestones.map(({ milestone: m, stageIndex: mIdx }) => {
                                                                        const stageStyle = getMilestoneStageStyle(mIdx, m.done);
                                                                        const badgeClass = stageStyle.paletteClass || stageStyle.className;
                                                                        const isDone = m.done;
                                                                        return `
                                                                            <div class="p-2 rounded-xl border font-bold ${badgeClass} shadow-2xs cursor-pointer hover:opacity-95 transition-all text-xs leading-snug flex flex-col gap-1" onclick="jumpToGoalCard(${root.id})" title="點擊跳轉至母目標卡片：${escapeAttr(m.title)}">
                                                                                <div class="flex items-center justify-between gap-1 text-[10px] font-mono">
                                                                                    <span class="font-black">${stageStyle.icon} 第 ${mIdx + 1} 棒</span>
                                                                                    <span class="text-[9px] opacity-80">${m.targetDate && m.targetDate !== '未指定日期' ? m.targetDate.slice(5) : ''}</span>
                                                                                </div>
                                                                                <div class="${isDone ? 'line-through opacity-70 font-normal' : 'font-black text-[12px]'} break-words">
                                                                                    ${escapeHtml(m.title)}
                                                                                </div>
                                                                                ${m.done ? `
                                                                                    <div class="text-[9px] text-emerald-700 dark:text-emerald-300 font-mono">
                                                                                        ✓ 已達成 ${m.completedDate ? `(${m.completedDate.slice(5)})` : ''}
                                                                                    </div>
                                                                                ` : ''}
                                                                            </div>
                                                                        `;
                                                                    }).join('')}
                                                                </div>
                                                            </td>
                                                        `;
                                                    }
                                                }).join('')}
                                            </tr>
                                        `;
                                    }).join('')}


                                    <!-- 【v5.2.0 全人生領域展示】：列出尚未規劃目標的領域，激發全面思考與行動 -->
                                    ${(() => {
                                        if (!fortellerShowAllDomains) return '';
                                        const usedDomains = new Set(goalModeRows.map(r => r.domain));
                                        const emptyDomains = domains.filter(d => !usedDomains.has(d));
                                        if (emptyDomains.length === 0) return '';
                                        const goalTableCols = window._fortellerGoalTableCols || monthCols;


                                        return emptyDomains.map(dom => {
                                            return `
                                                <tr class="bg-slate-50/40 dark:bg-slate-800/25 border-b border-slate-200/70 dark:border-slate-700/70 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td class="sticky left-0 z-20 bg-slate-50/90 dark:bg-slate-800/90 py-2.5 px-1 text-center font-mono text-slate-400 dark:text-slate-500 border-r border-slate-200 dark:border-slate-700 align-middle text-[11px] whitespace-nowrap select-none w-12 min-w-[48px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                                                        -
                                                    </td>
                                                    <td class="sticky left-[48px] z-20 bg-slate-50/90 dark:bg-slate-800/90 py-2.5 px-2.5 font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 align-middle text-xs whitespace-nowrap w-32 min-w-[120px] shadow-[4px_0_6px_-2px_rgba(0,0,0,0.06)]">
                                                        <div class="flex items-center justify-between gap-1.5">
                                                            <span>${dom}</span>
                                                            <button type="button" onclick="quickAddGoalForDomain('${escapeAttr(dom)}')" class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer" title="為此領域快速建立新目標">
                                                                <span>➕</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                    ${goalTableCols.map(col => {
                                                        const mKey = col.monthKey || col.afterMonth || '';
                                                        const isCurrent = (mKey === currentMonthKey);
                                                        const isMilestone = (col.type === 'milestone');
                                                        return `
                                                            <td class="py-2 px-2 border-r border-slate-200/60 dark:border-slate-700/60 align-middle text-center text-slate-300 dark:text-slate-600 text-xs ${isCurrent ? 'bg-indigo-50/15 dark:bg-indigo-950/10' : ''} ${isMilestone ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''}">
                                                                ·
                                                            </td>
                                                        `;
                                                    }).join('')}
                                                </tr>
                                            `;
                                        }).join('');
                                    })()}
                                `}
</tbody>
                        </table>
                    </div>
                </div>
            `;
        }


        function renderStepLeaf(parentGoal, s) {
            const isDone = s.done;
            const isRecurring = s.recurrence && s.recurrence !== 'none';
            const hasLinked = s.linkedThoughtId && thoughts.find(x => x.id === s.linkedThoughtId);
            const stepFailStats = isRecurring ? calculateStepFailRate(parentGoal, s) : null;


            return `
                <div class="flex items-center justify-between p-2 rounded-xl text-xs border transition-all ${
                    isDone 
                        ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs hover:border-indigo-300'
                }">
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                        <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleStep(${parentGoal.id}, ${s.id})" class="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer shrink-0">
                        <span class="${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'font-medium'} truncate" title="${escapeAttr(s.text)}">
                            ${escapeHtml(s.text)}
                        </span>
                    </div>
                    <div class="flex items-center gap-1.5 text-[10px] shrink-0 ml-2 flex-wrap">
                        ${s.stepDate ? `<span class="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-medium">📅 ${s.stepDate}</span>` : ''}
                        ${isRecurring ? `<span class="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded font-medium">🔄 ${getRecurrenceLabel(s.recurrence)}</span>` : ''}
                        ${stepFailStats && stepFailStats.isHighFail && !isDone ? `<button type="button" onclick="openHabitDiagnosticModal(${parentGoal.id}, ${s.id})" class="text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-1.5 py-0.5 rounded hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-0.5" title="近14天失敗率 ${stepFailStats.percent}%，點擊開啟診斷調整"><span>⚠️ 失敗率 ${stepFailStats.percent}%</span><span>💡</span></button>` : ''}
                        ${s.stepTime ? `<span class="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium">⏱️ ${s.stepTime}</span>` : ''}
                        ${hasLinked ? `<span onclick="jumpToGoalCard(${s.linkedThoughtId})" class="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded font-bold cursor-pointer" title="點擊跳轉至拆解目標卡片">🌱 拆解目標 🔗</span>` : ''}
                    </div>
                </div>
            `;
        }


        
        // 渲染帶有子目標展開按鈕之步驟項目
        function renderStepWithSubGoal(parentGoal, s, linkedGoal, isHabitType, visited = new Set()) {
            const isExpanded = linkedGoal ? !!mindmapExpandedSubGoalsMap[linkedGoal.id] : false;


            return `
                <div class="space-y-2">
                    ${renderStepLeaf(parentGoal, s)}
                    ${linkedGoal ? `
                        <div class="pl-3 sm:pl-6 border-l-2 border-dashed ${
                            isHabitType ? 'border-teal-300 dark:border-teal-700' : 'border-emerald-300 dark:border-emerald-700'
                        } space-y-2">
                            <button type="button" onclick="toggleMindmapSubGoal(${linkedGoal.id})" class="text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                                isExpanded 
                                    ? (isHabitType ? 'bg-teal-600 text-white border-teal-600 shadow-2xs' : 'bg-emerald-600 text-white border-emerald-600 shadow-2xs')
                                    : (isHabitType ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 hover:bg-teal-100' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 hover:bg-emerald-100')
                            }">
                                <span>${isHabitType ? '🔄' : '🌿'}</span>
                                <span>${isHabitType ? '習慣目標' : '拆解子目標'}：${escapeHtml(linkedGoal.goal || linkedGoal.text)}</span>
                                <span class="text-[10px] opacity-80 font-mono">${isExpanded ? '▲ 收合' : '▼ 展開卡片'}</span>
                            </button>
                            ${isExpanded ? `
                                <div class="pt-1">
                                    ${renderChildGoalBranch(linkedGoal, visited)}
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }


        function renderChildGoalBranch(childGoal, visited = new Set()) {
            if (!childGoal || visited.has(childGoal.id)) return '';
            visited.add(childGoal.id);
            const cSteps = Array.isArray(childGoal.steps) ? childGoal.steps : [];
            const cPendingSteps = cSteps.filter(s => !s.done);
            const cDone = cSteps.filter(s => s.done).length;
            const cTotal = cSteps.length;
            const cPercent = cTotal > 0 ? Math.round((cDone / cTotal) * 100) : 0;
            const tag = getGoalFocusTag(childGoal);


            // 檢查此子目標底下是否還有再往下一層的拆解目標 (孫目標)
            const grandChildGoals = thoughts.filter(t => t.parentStepInfo && t.parentStepInfo.parentThoughtId === childGoal.id && !t.goalDone);


            return `
                <div class="bg-slate-50/90 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-300/80 dark:border-emerald-800/80 space-y-3 shadow-2xs">
                    <div class="flex items-start justify-between gap-2.5 flex-wrap sm:flex-nowrap">
                        <div class="space-y-1.5 flex-1 min-w-0">
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="font-bold text-[11px] px-2.5 py-0.5 rounded-md border shadow-2xs ${tag.badgeClass}">${tag.label}</span>
                                <span class="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded font-medium">${childGoal.category || '💼 事業'}</span>
                                <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">📅 預期：${childGoal.targetDate || '未指定'}</span>
                            </div>
                            <h5 class="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors" onclick="jumpToGoalCard(${childGoal.id})" title="點擊跳轉至看板">
                                🌿 ${escapeHtml(childGoal.text)}
                            </h5>
                            <div class="text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1">
                                <span>🎯 最終目標：${escapeHtml(childGoal.goal || '未設定')}</span>
                            </div>
                        </div>
                        <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-1.5 pt-0.5">
                            <span class="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-700 shadow-2xs">
                                進度 ${cDone}/${cTotal} (${cPercent}%)
                            </span>
                            <button onclick="jumpToGoalCard(${childGoal.id})" class="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs">
                                🔍 看板卡片
                            </button>
                        </div>
                    </div>


                    <!-- 子目標底下的步驟清單 (排除已完成步驟，帶孫目標者支援折疊) -->
                    <div class="space-y-2 pt-1 border-t border-emerald-100 dark:border-emerald-900/60">
                        <div class="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                            <span>📋 待辦步驟 (${cPendingSteps.length} 個)：</span>
                            ${cPercent === 100 && cTotal > 0 ? '<span class="text-[10px] text-emerald-600 font-bold">🎉 全數完成</span>' : ''}
                        </div>
                        ${cPendingSteps.length === 0 ? `
                            <div class="text-xs ${cTotal > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 italic'} pl-2">
                                ${cTotal > 0 ? '🎉 所有步驟已全數完成！' : '尚未規劃拆解步驟'}
                            </div>
                        ` : `
                            <div class="space-y-2 pl-1">
                                ${cPendingSteps.map(s => {
                                    const linkedGrandChild = s.linkedThoughtId 
                                        ? thoughts.find(x => x.id === s.linkedThoughtId && !x.goalDone) 
                                        : thoughts.find(x => x.parentStepInfo && x.parentStepInfo.parentThoughtId === childGoal.id && x.parentStepInfo.parentStepId === s.id && !x.goalDone);
                                    if (linkedGrandChild) {
                                        return renderStepWithSubGoal(childGoal, s, linkedGrandChild, false, visited);
                                    } else {
                                        return renderStepLeaf(childGoal, s);
                                    }
                                }).join('')}
                            </div>
                        `}
                    </div>
                </div>
            `;
        }


        function renderMiniGoalTreeCard(goal) {
            const steps = Array.isArray(goal.steps) ? goal.steps : [];
            const pendingSteps = steps.filter(s => !s.done);
            const doneCount = steps.filter(s => s.done).length;
            const totalCount = steps.length;
            const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
            const tag = getGoalFocusTag(goal);


            return `
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-500 transition-all flex flex-col justify-between">
                    <div class="space-y-2">
                        <div class="flex items-center justify-between gap-1.5 flex-wrap">
                            <span class="text-[11px] font-bold px-2 py-0.5 rounded-md border shadow-2xs ${tag.badgeClass}">${tag.label}</span>
                            <span class="text-[10px] text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">${goal.category || '💼 事業'}</span>
                        </div>
                        <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-2 leading-snug" onclick="jumpToGoalCard(${goal.id})" title="點擊跳轉至看板">
                            ${escapeHtml(goal.text)}
                        </h4>
                        <div class="text-[11px] text-amber-800 dark:text-amber-400 font-medium truncate">🎯 ${escapeHtml(goal.goal || '未設定')}</div>


                        <!-- 步驟列表預覽 (排除已完成步驟) -->
                        <div class="pt-2 border-t border-slate-100 dark:border-slate-700/80 space-y-1.5">
                            <div class="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                                <span>📋 待辦步驟 (${pendingSteps.length})：</span>
                                <span class="text-xs text-indigo-600 dark:text-indigo-400 font-bold">${doneCount}/${totalCount} (${percent}%)</span>
                            </div>
                            ${pendingSteps.length === 0 ? `
                                <div class="text-[11px] ${totalCount > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 italic'} py-1">
                                    ${totalCount > 0 ? '🎉 所有步驟已全數完成！' : '尚無排定步驟'}
                                </div>
                            ` : `
                                <div class="space-y-1 max-h-40 overflow-y-auto pr-1">
                                    ${pendingSteps.slice(0, 5).map(s => `
                                        <div class="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 p-1.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg">
                                            <span class="truncate font-medium">▫️ ${escapeHtml(s.text)}</span>
                                            ${s.stepDate ? `<span class="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-1.5 font-mono">📅${s.stepDate}</span>` : ''}
                                        </div>
                                    `).join('')}
                                    ${pendingSteps.length > 5 ? `<div class="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold text-center pt-0.5">還有 ${pendingSteps.length - 5} 個待辦步驟...</div>` : ''}
                                </div>
                            `}
                        </div>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                        <span class="text-slate-400 text-[11px]">📅 預期：${goal.targetDate || '未指定'}</span>
                        <button onclick="jumpToGoalCard(${goal.id})" class="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">🔍 前往看板 ➔</button>
                    </div>
                </div>
            `;
        }


        
        // 快速回到頁面頂部功能
        function scrollToPageTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }


        window.addEventListener('scroll', () => {
            const btn = document.getElementById('btnScrollToTop');
            if (!btn) return;
            if (window.scrollY > 250) {
                btn.classList.remove('translate-y-16', 'opacity-0', 'pointer-events-none');
                btn.classList.add('translate-y-0', 'opacity-100');
            } else {
                btn.classList.add('translate-y-16', 'opacity-0', 'pointer-events-none');
                btn.classList.remove('translate-y-0', 'opacity-100');
            }
        });


        function jumpToCardsViewWithBacklog() {
            activeCategory = '全部'; // 自動切換至「全部」領域分頁，確保所有冰存目標立即可見
            recordNavigationReturnPoint();
            showBacklogCards = true;
            setViewMode('cards'); // 呼叫 setViewMode 正確切換最上方分頁高亮選取樣式
            setTimeout(() => {
                const el = document.getElementById('frozenCardsContainer') || document.getElementById('card-container');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 120);
        }
