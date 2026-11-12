function isFileMatchingAccount(fileName, account) {
    if (!fileName || !fileName.startsWith('BL-') || !fileName.endsWith('.json')) return false;


    const acc = (account || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (acc) return fileName.endsWith('-' + acc + '.json');


    const nameWithoutExt = fileName.slice(0, -5);
    const parts = nameWithoutExt.split('-');
    return parts.length === 3;
}


function generateBackupFileName(account = piAccount) {


    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const accSuffix = account ? `-${account}` : '';
    return `BL-${ts}${accSuffix}.json`;
}


// ============================================================
// 🔐 【v6.0.0 備份端對端加密核心模組 (E2EE Zero-Knowledge Crypto Engine)】
// 採用 Web Cryptography API: PBKDF2-HMAC-SHA256 (600,000 次疊代) + AES-GCM-256 + AAD 標頭認證綁定
// 設計理由 (Why)：
// 1. 金鑰 (_e2eeSessionKey) 為 non-extractable CryptoKey，與對應 Salt 僅駐留於當前分頁記憶體，絕不寫入 localStorage / sessionStorage。
// 2. 分段 Base64 轉換 (0x8000 bytes/chunk) 防止大型財務與思緒備份觸發 Maximum call stack size exceeded。
// 3. 雲端拉回加密封套但尚未解鎖時，嚴格維持 isInitialSyncCompleted = false，阻斷未解鎖新裝置覆蓋雲端。
// ============================================================
const E2EE_FORMAT_ID = 'lifeschedule_encrypted_backup';
const E2EE_VERSION = 1;
const E2EE_DEFAULT_ITERATIONS = 600000;
const E2EE_MIN_ITERATIONS = 100000;
const E2EE_MAX_ITERATIONS = 2000000;

let _e2eeSessionKey = null;
let _e2eeSessionSaltB64 = '';
let _e2eeSessionIterations = E2EE_DEFAULT_ITERATIONS;
let _latestRemoteEnvelope = null;
let _pendingEncryptedRemote = null;
let _hasUnsavedCloudChanges = false;
let _e2eeModalMode = 'unlock';
let _e2eeModalCustomEnvelope = null;
let _e2eeModalOnSuccess = null;

const E2EE_DEFAULT_HINT_HTML = '⚠️ <strong>零知識安全提醒</strong>：通行碼僅用於本機記憶體推導 AES-GCM 金鑰，伺服器與本機硬碟均不留存。一旦遺忘通行碼，任何人都無法還原您的財務與目標備份，請務必妥善保存於密碼管理器！';

function isSecureCryptoAvailable() {
    return Boolean(typeof window !== 'undefined' && window.crypto && window.crypto.subtle);
}

function isE2eeEnabled() {
    return localStorage.getItem('ls_e2ee_enabled') === 'true';
}

function hasE2eeRemoteOrSession() {
    return Boolean(_pendingEncryptedRemote || _latestRemoteEnvelope || _e2eeSessionKey);
}

function isEncryptedEnvelope(obj) {
    return Boolean(
        obj &&
        typeof obj === 'object' &&
        !Array.isArray(obj) &&
        obj._format === E2EE_FORMAT_ID &&
        typeof obj.ciphertext === 'string' &&
        obj.kdf &&
        obj.cipher
    );
}

function bufToB64(buf) {
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
}

function b64ToBytes(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
        out[i] = bin.charCodeAt(i);
    }
    return out;
}

// 將封套標頭欄位納入 AES-GCM additionalData (AAD)，任何對 version 或 kdf 參數的竄改都會在解密時觸發認證失敗
function buildEnvelopeAAD(envHeader) {
    const canonical = JSON.stringify({
        _format: envHeader._format,
        version: envHeader.version,
        kdf: {
            algorithm: envHeader.kdf.algorithm,
            hash: envHeader.kdf.hash,
            iterations: envHeader.kdf.iterations,
            salt: envHeader.kdf.salt
        },
        cipher: {
            algorithm: envHeader.cipher.algorithm,
            iv: envHeader.cipher.iv
        }
    });
    return new TextEncoder().encode(canonical);
}

async function deriveE2eeAesKey(passphrase, saltBytes, iterations = E2EE_DEFAULT_ITERATIONS) {
    if (!isSecureCryptoAvailable()) {
        throw new Error('當前瀏覽環境不支援 Web Crypto API（請使用 HTTPS、localhost 或本機 file:// 開啟）');
    }
    if (typeof passphrase !== 'string' || passphrase.length === 0) {
        throw new Error('通行碼不可為空');
    }
    const iters = Number(iterations);
    if (!Number.isInteger(iters) || iters < E2EE_MIN_ITERATIONS || iters > E2EE_MAX_ITERATIONS) {
        throw new Error(`不安全的 PBKDF2 疊代次數 (${iterations})，允許範圍為 ${E2EE_MIN_ITERATIONS} ~ ${E2EE_MAX_ITERATIONS}`);
    }
    const enc = new TextEncoder();
    const baseKey = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: saltBytes, iterations: iters, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function encryptBackupWithKey(plainObject, aesKey, saltB64, iterations = E2EE_DEFAULT_ITERATIONS) {
    if (!isSecureCryptoAvailable()) {
        throw new Error('當前瀏覽環境不支援 Web Crypto API');
    }
    // 每次加密強制重新產生 12-byte 隨機 IV，嚴禁重複使用
    const ivBytes = window.crypto.getRandomValues(new Uint8Array(12));
    const envelopeHeader = {
        _format: E2EE_FORMAT_ID,
        version: E2EE_VERSION,
        appVersion: window.APP_VERSION,
        kdf: {
            algorithm: 'PBKDF2',
            hash: 'SHA-256',
            iterations: iterations,
            salt: saltB64
        },
        cipher: {
            algorithm: 'AES-GCM',
            iv: bufToB64(ivBytes)
        }
    };
    const aadBytes = buildEnvelopeAAD(envelopeHeader);
    const rawBytes = new TextEncoder().encode(JSON.stringify(plainObject));
    const cipherBuf = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: ivBytes, additionalData: aadBytes },
        aesKey,
        rawBytes
    );
    return {
        ...envelopeHeader,
        ciphertext: bufToB64(cipherBuf)
    };
}

async function decryptBackupWithKey(envelope, aesKey) {
    if (!isEncryptedEnvelope(envelope)) {
        throw new Error('非有效的加密備份封套格式');
    }
    const ivBytes = b64ToBytes(envelope.cipher.iv);
    const cipherBytes = b64ToBytes(envelope.ciphertext);
    const aadBytes = buildEnvelopeAAD(envelope);
    const plainBuf = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBytes, additionalData: aadBytes },
        aesKey,
        cipherBytes
    );
    const jsonStr = new TextDecoder().decode(plainBuf);
    return JSON.parse(jsonStr);
}

async function encryptBackupPayload(plainObject, passphrase) {
    const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
    const saltB64 = bufToB64(saltBytes);
    const aesKey = await deriveE2eeAesKey(passphrase, saltBytes, E2EE_DEFAULT_ITERATIONS);
    _e2eeSessionKey = aesKey;
    _e2eeSessionSaltB64 = saltB64;
    _e2eeSessionIterations = E2EE_DEFAULT_ITERATIONS;
    return encryptBackupWithKey(plainObject, aesKey, saltB64, E2EE_DEFAULT_ITERATIONS);
}

async function decryptBackupPayload(envelope, passphrase) {
    if (!isEncryptedEnvelope(envelope)) {
        throw new Error('非有效的加密備份封套格式');
    }
    const iters = Number(envelope.kdf && envelope.kdf.iterations);
    const saltBytes = b64ToBytes(envelope.kdf.salt);
    const aesKey = await deriveE2eeAesKey(passphrase, saltBytes, iters);
    const plainData = await decryptBackupWithKey(envelope, aesKey);
    // 解密成功後將 { aesKey, salt } 快取於當前分頁記憶體，後續自動備份可直接靜默加密
    _e2eeSessionKey = aesKey;
    _e2eeSessionSaltB64 = envelope.kdf.salt;
    _e2eeSessionIterations = iters;
    return plainData;
}

async function prepareOutboundPayload(plainPayload) {
    if (!isE2eeEnabled()) {
        return plainPayload;
    }
    if (!isSecureCryptoAvailable()) {
        throw new Error('已啟用備份加密，但當前非 HTTPS/localhost 安全環境，已中止上傳以防明文外洩！');
    }
    if (!_e2eeSessionKey || !_e2eeSessionSaltB64) {
        throw new Error('E2EE_KEY_LOCKED');
    }
    const env = await encryptBackupWithKey(plainPayload, _e2eeSessionKey, _e2eeSessionSaltB64, _e2eeSessionIterations);
    _latestRemoteEnvelope = env;
    return env;
}

function updateE2eeSettingsUI() {
    const toggle = document.getElementById('e2eeEnableToggle');
    const badge = document.getElementById('e2eeSettingsStatusBadge');
    const primaryBtnText = document.getElementById('e2eePrimaryActionBtnText');
    const lockRow = document.getElementById('e2eeLockSessionRow');
    const enabled = isE2eeEnabled();
    const unlocked = Boolean(_e2eeSessionKey && _e2eeSessionSaltB64);

    if (toggle) toggle.checked = enabled;
    if (badge) {
        if (enabled && unlocked) {
            badge.textContent = '🟢 已啟用並解鎖 (自動加密中)';
            badge.className = 'text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
        } else if (enabled && !unlocked) {
            badge.textContent = '🔒 已啟用但待解鎖 (請輸入通行碼)';
            badge.className = 'text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse';
        } else {
            badge.textContent = '⚪ 未啟用 (明文備份)';
            badge.className = 'text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-700';
        }
    }
    if (primaryBtnText) {
        if (unlocked) {
            primaryBtnText.textContent = '已解鎖 (重新驗證)';
        } else if (_pendingEncryptedRemote || _latestRemoteEnvelope) {
            primaryBtnText.textContent = '輸入通行碼解鎖';
        } else {
            primaryBtnText.textContent = '設定加密通行碼';
        }
    }
    if (lockRow) {
        if (unlocked) lockRow.classList.remove('hidden');
        else lockRow.classList.add('hidden');
    }
}

function onToggleE2eeSetting(checked) {
    if (checked) {
        if (!isSecureCryptoAvailable()) {
            alert('❌ 當前瀏覽環境不支援 Web Crypto API！\n請透過 HTTPS（如 Cloudflare 線上網址）、http://localhost 或本機 file:// 開啟網頁。');
            updateE2eeSettingsUI();
            return;
        }
        localStorage.setItem('ls_e2ee_enabled', 'true');
        updateE2eeSettingsUI();
        if (!_e2eeSessionKey) {
            openE2eePassphraseModal(hasE2eeRemoteOrSession() ? 'unlock' : 'setup');
        }
    } else {
        if (_pendingEncryptedRemote) {
            alert('⚠️ 雲端目前存有待解鎖的加密備份！請先輸入通行碼解鎖還原雲端資料後，再決定是否關閉加密，以免本機空白資料覆蓋雲端。');
            updateE2eeSettingsUI();
            return;
        }
        if (!confirm('⚠️ 確定要關閉端對端備份加密嗎？\n關閉後，後續匯出與上傳至雲端的備份將恢復為「明文 JSON」。')) {
            updateE2eeSettingsUI();
            return;
        }
        localStorage.setItem('ls_e2ee_enabled', 'false');
        _e2eeSessionKey = null;
        _e2eeSessionSaltB64 = '';
        updateE2eeSettingsUI();
    }
}

function lockE2eeSession() {
    _e2eeSessionKey = null;
    _e2eeSessionSaltB64 = '';
    updateE2eeSettingsUI();
    if (isE2eeEnabled()) {
        updatePiSyncBadge('🔒 金鑰已鎖定 (點擊輸入通行碼)', 'bg-amber-100 text-amber-900 border-amber-300');
    }
}

function toggleE2eeInputVisibility(inputId, btnId) {
    const inputEl = document.getElementById(inputId);
    const btnEl = document.getElementById(btnId);
    if (!inputEl) return;
    const hiddenType = ['pass', 'word'].join('');
    const isCurrentlyHidden = inputEl.getAttribute('type') === hiddenType;
    inputEl.setAttribute('type', isCurrentlyHidden ? 'text' : hiddenType);
    if (btnEl) {
        btnEl.textContent = isCurrentlyHidden ? '🙈 隱藏' : '👁️ 顯示';
    }
}

function openE2eePassphraseModal(mode = 'unlock', onSuccess = null, customEnvelope = null, customPromptHint = '') {
    if (!isSecureCryptoAvailable()) {
        alert('❌ 當前連線環境非 HTTPS / localhost 安全環境，瀏覽器禁用 Web Crypto API，無法執行加解密！');
        return;
    }
    const targetEnvelope = customEnvelope || (_pendingEncryptedRemote && _pendingEncryptedRemote.envelope) || _latestRemoteEnvelope;
    // 若要求 unlock 但完全沒有任何既有加密封套可供驗證，自動轉為 setup 模式
    const effectiveMode = (mode === 'unlock' && !targetEnvelope) ? 'setup' : mode;
    _e2eeModalMode = effectiveMode;
    _e2eeModalCustomEnvelope = customEnvelope || null;
    _e2eeModalOnSuccess = typeof onSuccess === 'function' ? onSuccess : null;

    const modal = document.getElementById('e2eePassphraseModal');
    const titleEl = document.getElementById('e2eeModalTitle');
    const hintBox = document.getElementById('e2eeModalHintBox');
    const input1Label = document.getElementById('e2eeInput1Label');
    const input1 = document.getElementById('e2eePassphraseInput');
    const input2 = document.getElementById('e2eePassphraseConfirmInput');
    const confirmGroup = document.getElementById('e2eeConfirmInputGroup');
    const errEl = document.getElementById('e2eeModalErrorText');
    const submitText = document.getElementById('e2eeModalSubmitText');
    const eyeBtn1 = document.getElementById('e2eeEyeBtn1');
    const eyeBtn2 = document.getElementById('e2eeEyeBtn2');
    const hiddenType = ['pass', 'word'].join('');

    if (input1) { input1.value = ''; input1.setAttribute('type', hiddenType); }
    if (input2) { input2.value = ''; input2.setAttribute('type', hiddenType); }
    if (eyeBtn1) eyeBtn1.textContent = '👁️ 顯示';
    if (eyeBtn2) eyeBtn2.textContent = '👁️ 顯示';
    if (errEl) { errEl.textContent = ''; errEl.classList.add('hidden'); }
    if (hintBox) {
        if (customPromptHint) {
            hintBox.textContent = customPromptHint;
            hintBox.className = 'bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs font-bold text-indigo-900 leading-relaxed';
        } else {
            hintBox.innerHTML = E2EE_DEFAULT_HINT_HTML;
            hintBox.className = 'bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed';
        }
    }

    if (effectiveMode === 'setup') {
        if (titleEl) titleEl.textContent = '設定 / 更換備份加密通行碼';
        if (input1Label) input1Label.textContent = '設定新加密通行碼 (建議 8 碼以上)：';
        if (confirmGroup) confirmGroup.classList.remove('hidden');
        if (submitText) submitText.textContent = '啟用加密並儲存金鑰';
    } else {
        if (titleEl) titleEl.textContent = '輸入通行碼解鎖加密備份';
        if (input1Label) input1Label.textContent = '請輸入備份加密通行碼：';
        if (confirmGroup) confirmGroup.classList.add('hidden');
        if (submitText) submitText.textContent = '驗證並解鎖';
    }

    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => { if (input1) input1.focus(); }, 60);
    }
}

function closeE2eePassphraseModal(fromSuccess = false) {
    const modal = document.getElementById('e2eePassphraseModal');
    const input1 = document.getElementById('e2eePassphraseInput');
    const input2 = document.getElementById('e2eePassphraseConfirmInput');
    if (input1) input1.value = '';
    if (input2) input2.value = '';
    if (modal) modal.classList.add('hidden');
    updateE2eeSettingsUI();
    // 【v6.0.1 第三段防線】：若本機已有未上傳修改但使用者按了取消關閉彈窗，維持紅燈警示並彈出 Toast 提醒
    if (!fromSuccess && _hasUnsavedCloudChanges && isE2eeEnabled() && !_e2eeSessionKey) {
        updatePiSyncBadge('🚨 本機修改尚未上傳雲端 (點擊輸入通行碼)', 'bg-rose-100 text-rose-900 border-rose-400 animate-pulse');
        if (typeof showToast === 'function') {
            showToast('⚠️ 注意：您的修改僅存於本機，尚未加密上傳雲端！離開前請點擊上方紅燈徽章解鎖備份。', 'info');
        }
    }
}

function showE2eeModalError(msg) {
    const errEl = document.getElementById('e2eeModalErrorText');
    if (errEl) {
        errEl.textContent = msg;
        errEl.classList.remove('hidden');
    } else {
        alert(msg);
    }
}

async function confirmE2eePassphraseModal() {
    const input1 = document.getElementById('e2eePassphraseInput');
    const input2 = document.getElementById('e2eePassphraseConfirmInput');
    const submitBtn = document.getElementById('e2eeModalSubmitBtn');
    const submitText = document.getElementById('e2eeModalSubmitText');
    const pass1 = input1 ? input1.value : '';
    const pass2 = input2 ? input2.value : '';

    if (!pass1 || pass1.trim().length === 0) {
        showE2eeModalError('❌ 通行碼不可為空白！');
        return;
    }

    if (_e2eeModalMode === 'setup') {
        if (_pendingEncryptedRemote) {
            showE2eeModalError('⚠️ 雲端目前有待解鎖的加密備份！請先解鎖雲端備份後再更換通行碼，避免覆蓋舊資料。');
            return;
        }
        if (pass1.length < 6) {
            showE2eeModalError('⚠️ 為防範暴力破解，請設定至少 6 個字元以上的通行碼（建議 8~16 碼或助記詞）。');
            return;
        }
        if (pass1 !== pass2) {
            showE2eeModalError('❌ 兩次輸入的通行碼不一致，請重新確認！');
            return;
        }
    }

    const origBtnText = submitText ? submitText.textContent : '確認';
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = '⏳ 金鑰運算中 (600,000 次 PBKDF2)...';

    try {
        if (_e2eeModalMode === 'setup') {
            const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
            const saltB64 = bufToB64(saltBytes);
            const aesKey = await deriveE2eeAesKey(pass1, saltBytes, E2EE_DEFAULT_ITERATIONS);
            _e2eeSessionKey = aesKey;
            _e2eeSessionSaltB64 = saltB64;
            _e2eeSessionIterations = E2EE_DEFAULT_ITERATIONS;
            localStorage.setItem('ls_e2ee_enabled', 'true');
            const cb = _e2eeModalOnSuccess;
            _e2eeModalOnSuccess = null;
            isInitialSyncCompleted = true;
            closeE2eePassphraseModal(true);
            updateE2eeSettingsUI();
            if (!localStorage.getItem('ls_e2ee_cleaned_reminded')) {
                localStorage.setItem('ls_e2ee_cleaned_reminded', 'true');
                alert('🔐 已成功設定端對端加密金鑰！\n\n💡 重要安全提醒：\n1. 請務必將此通行碼存入密碼管理器（一旦遺忘將永久無法還原）。\n2. 若樹莓派或 Google Drive 上曾存有早期的「明文 .json 備份檔」，請記得手動刪除舊明文檔（含雲端硬碟垃圾桶），確保隱私徹底清零！');
            }
            if (cb) {
                await cb();
            } else if (_hasUnsavedCloudChanges || (isInitialSyncCompleted && thoughts.length > 0)) {
                triggerAutoSaveToPi();
            }
        } else {
            const targetEnvelope = _e2eeModalCustomEnvelope || (_pendingEncryptedRemote && _pendingEncryptedRemote.envelope) || _latestRemoteEnvelope;
            const plainData = await decryptBackupPayload(targetEnvelope, pass1);
            localStorage.setItem('ls_e2ee_enabled', 'true');
            const cb = _e2eeModalOnSuccess;
            _e2eeModalOnSuccess = null;
            _e2eeModalCustomEnvelope = null;

            // 若有待解鎖的雲端同步封套，檢查是否有本機未上傳修改衝突 (防後解鎖覆蓋)
            if (_pendingEncryptedRemote && targetEnvelope === _pendingEncryptedRemote.envelope) {
                const pending = _pendingEncryptedRemote;
                _pendingEncryptedRemote = null;
                if (pending.shouldApply && !_hasUnsavedCloudChanges) {
                    applyImportedData(plainData, pending.fileName);
                } else if (pending.shouldApply && _hasUnsavedCloudChanges) {
                    const keepLocal = confirm('⚠️ 偵測到雲端有另一份備份，但您剛才已在本機進行了修改！\n\n點擊「確定」：保留您剛才在本機的修改，並立即加密上傳至雲端\n點擊「取消」：放棄剛才的修改，改為載入雲端備份');
                    if (!keepLocal) {
                        applyImportedData(plainData, pending.fileName);
                        _hasUnsavedCloudChanges = false;
                    }
                }
                isInitialSyncCompleted = true;
                updatePiSyncBadge(pending.syncedBadgeText + ' 🔐', pending.syncedBadgeClass);
            } else {
                isInitialSyncCompleted = true;
                updatePiSyncBadge('🟢 金鑰已解鎖 🔐', 'bg-emerald-100 text-emerald-900 border-emerald-300');
            }

            closeE2eePassphraseModal(true);
            updateE2eeSettingsUI();
            if (cb) {
                await cb(plainData);
            } else if (_hasUnsavedCloudChanges) {
                // 【v6.0.1 第二段防線】：解鎖後若本機有未上傳之修改，立即自動觸發加密上傳
                triggerAutoSaveToPi();
            }
        }
    } catch (err) {
        showE2eeModalError('❌ 解密失敗：通行碼錯誤或加密封套已遭篡改！請確認後重試。');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.textContent = origBtnText;
    }
}

async function applyRemoteBackupOrQueueUnlock(rawBackupData, fileName, syncedBadgeText, syncedBadgeClass, shouldApply = true) {
    if (!rawBackupData) {
        isInitialSyncCompleted = true;
        return { unlocked: true, applied: false };
    }
    const isRemoteNewer = Boolean(shouldApply || thoughts.length === 0);
    if (!isEncryptedEnvelope(rawBackupData)) {
        _pendingEncryptedRemote = null;
        let applied = false;
        if (isRemoteNewer && !_hasUnsavedCloudChanges) {
            applied = applyImportedData(rawBackupData, fileName);
        }
        isInitialSyncCompleted = true;
        updatePiSyncBadge(syncedBadgeText, syncedBadgeClass);
        return { unlocked: true, applied };
    }

    // 偵測為雲端加密封套：強制標記啟用 E2EE，杜絕新裝置靜默降級回傳明文
    _latestRemoteEnvelope = rawBackupData;
    localStorage.setItem('ls_e2ee_enabled', 'true');

    if (_e2eeSessionKey && _e2eeSessionSaltB64 === rawBackupData.kdf.salt) {
        try {
            const plainData = await decryptBackupWithKey(rawBackupData, _e2eeSessionKey);
            _pendingEncryptedRemote = null;
            let applied = false;
            if (isRemoteNewer && !_hasUnsavedCloudChanges) {
                applied = applyImportedData(plainData, fileName);
            }
            isInitialSyncCompleted = true;
            updatePiSyncBadge(syncedBadgeText + ' 🔐', syncedBadgeClass);
            updateE2eeSettingsUI();
            return { unlocked: true, applied };
        } catch (e) {
            // 金鑰不符，轉入待解鎖佇列
        }
    }

    // 尚未解鎖：嚴格鎖住 isInitialSyncCompleted = false，保護雲端加密備份不被覆蓋
    isInitialSyncCompleted = false;
    _pendingEncryptedRemote = {
        envelope: rawBackupData,
        fileName: fileName,
        syncedBadgeText: syncedBadgeText,
        syncedBadgeClass: syncedBadgeClass,
        shouldApply: isRemoteNewer
    };
    updateE2eeSettingsUI();

    // 【v6.0.1 第一段防線】：區分「雲端比本機新」與「本機已是最新 (如 F5 重整)」
    if (isRemoteNewer) {
        updatePiSyncBadge('🔒 雲端有新版本待解鎖 (點擊輸入通行碼)', 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse');
        openE2eePassphraseModal(
            'unlock',
            null,
            null,
            '☁️ 偵測到雲端有較新的加密備份（' + fileName + '）！請輸入通行碼解鎖並同步最新進度，避免改到過期舊資料。'
        );
    } else {
        // 本機已經是最新 (fileName === lastSyncedFileName)：開頁不彈窗打擾，僅在動手修改時自動彈出解鎖窗
        updatePiSyncBadge('🔐 已是最新 (修改時將提示輸入通行碼)', 'bg-emerald-50 text-emerald-800 border-emerald-300');
    }
    return { unlocked: false, applied: false };
}

function getExportPayload() {
    return {
        appVersion: window.APP_VERSION,
        account: piAccount || '',
        thoughts,
        categoryOrder,
        blockedSlots,
        maxDailyHours,
        maxWeeklyHours,
        timelineStartDate: getEffectiveTimelineStartDate(),
        timelineStartMode,
        fortellerSpan: (typeof getFortellerSpanSetting === 'function') ? getFortellerSpanSetting() : (localStorage.getItem('my_forteller_span') || 'auto'),
        fortellerStartMonth: (typeof getFortellerStartMonthSetting === 'function') ? getFortellerStartMonthSetting() : (localStorage.getItem('my_forteller_start_month') || 'prev_month'),
        hideCompletedGoalsCards: (typeof hideCompletedGoalsCards !== 'undefined') ? hideCompletedGoalsCards : (localStorage.getItem('hide_completed_goals_cards') !== 'false'),
        routineHubCollapsed: localStorage.getItem('ls_routine_hub_collapsed') === 'true',
        // 【v5.4.0 新增】：月度財務收支與範本全量備份
        monthlyFinancials: monthlyFinancials,
        financialTemplates: financialTemplates,
        fortellerShowFinancials: fortellerShowFinancials
    };
}


function applyImportedData(backupData, fileName) {
    // 【v6.0.0 防禦】：拒絕將未解密之加密封套當作明文匯入
    if (!backupData || isEncryptedEnvelope(backupData)) return false;


    let importedThoughts = Array.isArray(backupData) ? backupData : backupData.thoughts;
    if (!importedThoughts || !Array.isArray(importedThoughts)) return false;
    // 【v5.3.5 防禦性結構校驗】：確保每個目標卡片之 steps 與 milestones 為合法陣列
    importedThoughts.forEach(t => {
        if (!Array.isArray(t.steps)) t.steps = [];
        if (!Array.isArray(t.milestones) || t.milestones.length === 0) {
            t.milestones = getThoughtMilestones(t);
        }
    });
    thoughts = importedThoughts;
    if (backupData.categoryOrder) { categoryOrder = backupData.categoryOrder; localStorage.setItem('my_category_order', JSON.stringify(categoryOrder)); }
    if (backupData.blockedSlots) { blockedSlots = backupData.blockedSlots; localStorage.setItem('my_blocked_slots', JSON.stringify(blockedSlots)); }
    if (backupData.maxDailyHours) { maxDailyHours = backupData.maxDailyHours; localStorage.setItem('my_max_daily_hours', maxDailyHours); }
    if (backupData.maxWeeklyHours) { maxWeeklyHours = backupData.maxWeeklyHours; localStorage.setItem('my_max_weekly_hours', maxWeeklyHours); }
    
    // 【v5.3.16 還原時間軸動態起始模式與日期】
    if (backupData.timelineStartMode !== undefined) {
        timelineStartMode = backupData.timelineStartMode;
        localStorage.setItem('my_timeline_start_mode', timelineStartMode);
    }
    if (backupData.timelineStartDate !== undefined) {
        timelineStartDate = (timelineStartMode === 'today') ? todayStr : backupData.timelineStartDate;
        localStorage.setItem('my_timeline_start_date', timelineStartDate);
    } else {
        timelineStartDate = getEffectiveTimelineStartDate();
    }


    // 【v5.3.16 還原全系統跨裝置偏好設定】
    if (backupData.fortellerSpan !== undefined) {
        localStorage.setItem('my_forteller_span', backupData.fortellerSpan);
    }
    if (backupData.fortellerStartMonth !== undefined) {
        localStorage.setItem('my_forteller_start_month', backupData.fortellerStartMonth);
    }
    if (backupData.hideCompletedGoalsCards !== undefined) {
        hideCompletedGoalsCards = backupData.hideCompletedGoalsCards;
        localStorage.setItem('hide_completed_goals_cards', String(hideCompletedGoalsCards));
    }
    if (backupData.routineHubCollapsed !== undefined) {
        localStorage.setItem('ls_routine_hub_collapsed', String(backupData.routineHubCollapsed));
    }


    // 【v5.4.0 還原月度財務數據與範本】
    if (backupData.monthlyFinancials !== undefined) {
        monthlyFinancials = backupData.monthlyFinancials;
        try { localStorage.setItem('my_monthly_financials', JSON.stringify(monthlyFinancials)); } catch(e) {}
    }
    if (backupData.financialTemplates !== undefined) {
        financialTemplates = backupData.financialTemplates;
        try { localStorage.setItem('my_financial_templates', JSON.stringify(financialTemplates)); } catch(e) {}
    }
    if (backupData.fortellerShowFinancials !== undefined) {
        fortellerShowFinancials = backupData.fortellerShowFinancials;
        try { localStorage.setItem('forteller_show_financials', String(fortellerShowFinancials)); } catch(e) {}
    }


    syncLinkedData();
    localStorage.setItem('my_thoughts_local', JSON.stringify(thoughts));
    if (fileName) {
        lastSyncedFileName = fileName;
        localStorage.setItem('pi_last_synced_file', fileName);
    }
    // 【v5.3.18 記錄最新已知總步驟數】：作為防縮水熔斷基準
    const totalStepsInImported = (thoughts || []).reduce((acc, t) => acc + (Array.isArray(t.steps) ? t.steps.length : 0), 0);
    localStorage.setItem('ls_last_known_steps_count', String(totalStepsInImported));
    render();
    return true;
}


function handlePiBadgeClick() {
    if (_pendingEncryptedRemote || (isE2eeEnabled() && !_e2eeSessionKey && _latestRemoteEnvelope)) {
        openE2eePassphraseModal('unlock');
        return;
    }
    if (isE2eeEnabled() && !_e2eeSessionKey) {
        openE2eePassphraseModal('setup');
        return;
    }
    piServerUrl = (localStorage.getItem('pi_server_url') || '').trim();
    piApiKey = (localStorage.getItem('pi_api_key') || '').trim();
    piAccount = (localStorage.getItem('pi_account') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const gasUrl = (localStorage.getItem('gas_sync_url') || '').trim();
    const gasKey = (localStorage.getItem('gas_api_key') || '').trim();
    if ((!piServerUrl || !piApiKey) && (!gasUrl || !gasKey)) openPiSettingsModal();
    else checkAndAutoSyncFromPi();
}


function updatePiSyncBadge(statusText, badgeClass) {


    const badge = document.getElementById('piSyncStatusBadge');
    if (badge) {


        const accountPrefix = piAccount ? `[${piAccount}] ` : '';
        badge.innerHTML = accountPrefix + statusText;
        badge.className = `text-xs px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 border cursor-pointer hover:opacity-80 transition-all ${badgeClass}`;
    }
}


        // 日間/夜間模式切換功能 (與首頁 weber_theme 完全同步)
        function toggleDarkMode() {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('weber_theme', isDark ? 'dark' : 'light');
            updateThemeUI(isDark);
        }


        function initTheme() {
            const saved = localStorage.getItem('weber_theme');
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = saved === 'dark' || (!saved && prefersDark);
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            updateThemeUI(isDark);
        }


        function updateThemeUI(isDark) {
            const icon = document.getElementById('themeIcon');
            const text = document.getElementById('themeText');
            if (icon) icon.textContent = isDark ? '☀️' : '🌙';
            if (text) text.textContent = isDark ? '日間模式' : '夜間模式';
            const btn = document.getElementById('themeToggleBtn');
            if (btn) {
                btn.title = isDark ? '切換為日間模式' : '切換為夜間模式';
            }
        }


function openSettingsModal() {
    openPiSettingsModal();
}


function closeSettingsModal() {
    closePiSettingsModal();
}


function handleModalBackdropClick(event) {
    if (event.target && event.target.id === 'piSettingsModal') {
        closePiSettingsModal();
    }
}


// 支援鍵盤 ESC 快速關閉彈窗 (優先關閉上層通行碼彈窗)
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const e2eeModal = document.getElementById('e2eePassphraseModal');
        if (e2eeModal && !e2eeModal.classList.contains('hidden')) {
            closeE2eePassphraseModal();
            return;
        }
        const modal = document.getElementById('piSettingsModal');
        if (modal && !modal.classList.contains('hidden')) {
            closePiSettingsModal();
        }
    }
});


function openPiSettingsModal() {


    const modal = document.getElementById('piSettingsModal');
    const urlInput = document.getElementById('piServerUrlInput');
    const keyInput = document.getElementById('piApiKeyInput');
    const accInput = document.getElementById('piAccountInput');
    if (urlInput) urlInput.value = localStorage.getItem('pi_server_url') || '';
    if (keyInput) keyInput.value = localStorage.getItem('pi_api_key') || '';
    if (accInput) accInput.value = localStorage.getItem('pi_account') || '';
    const gasUrlInput = document.getElementById('gasSyncUrlInput');
    const gasKeyInput = document.getElementById('gasApiKeyInput');
    if (gasUrlInput) gasUrlInput.value = localStorage.getItem('gas_sync_url') || '';
    if (gasKeyInput) gasKeyInput.value = localStorage.getItem('gas_api_key') || '';
    const geminiKeyInput = document.getElementById('geminiApiKeyInput');
    if (geminiKeyInput) geminiKeyInput.value = localStorage.getItem('gemini_api_key') || '';
    const cachedModelsRaw = localStorage.getItem('gemini_cached_models');
    if (cachedModelsRaw) {
        try {
            const arr = JSON.parse(cachedModelsRaw);
            if (Array.isArray(arr) && arr.length > 0) {
                updateGeminiModelUI(arr, localStorage.getItem('gemini_preferred_model') || arr[0]);
            }
        } catch (e) {}
    }
    const piStatusEl = document.getElementById('piConnectionStatusText');
    if (piStatusEl) { piStatusEl.textContent = ''; piStatusEl.className = 'text-[11px] font-mono mt-1 hidden'; }
    const gasStatusEl = document.getElementById('gasConnectionStatusText');
    if (gasStatusEl) { gasStatusEl.textContent = ''; gasStatusEl.className = 'text-[11px] font-mono mt-1 hidden'; }
    updateE2eeSettingsUI();
    if (modal) modal.classList.remove('hidden');
}


function closePiSettingsModal() {


    const modal = document.getElementById('piSettingsModal');
    if (modal) modal.classList.add('hidden');
}


// ============================================================
// 🔌 【v6.0.3 樹莓派與 Google 雲端硬碟 (GAS) 手動連線檢測模組】
// 設計理由 (Why)：
// 1. 提供設定彈窗即時驗證連線狀態與 API 金鑰正確性，無需盲目點擊「儲存」或等待自動備份報錯。
// 2. 樹莓派端探測 /status 路由，確認服務就緒、版本識別與網路 RTT 延遲；若路由為舊版自動相容 fallback 至 /latest。
// 3. GAS 端發送 action: 'latest' 輕量唯讀封包，驗證 Web App 部署權限、金鑰與目標帳號存在性。
// 4. 8~10 秒逾時保護 (AbortController) + 嚴格防呆，阻斷 HTTPS 存取未加密 HTTP 網址的 Mixed Content 陷阱。
// ============================================================
async function testPiConnection() {
    const urlInput = document.getElementById('piServerUrlInput');
    const keyInput = document.getElementById('piApiKeyInput');
    const accInput = document.getElementById('piAccountInput');
    const statusEl = document.getElementById('piConnectionStatusText');
    const btn = document.getElementById('piTestBtn');

    let rawUrl = (urlInput ? urlInput.value : localStorage.getItem('pi_server_url') || '').trim().replace(/\/+$/, '');
    const key = (keyInput ? keyInput.value : localStorage.getItem('pi_api_key') || '').trim();
    const acc = (accInput ? accInput.value : localStorage.getItem('pi_account') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');

    if (!rawUrl) {
        if (statusEl) {
            statusEl.className = 'text-[11px] font-mono mt-1 text-rose-600 dark:text-rose-400 font-bold';
            statusEl.textContent = '⚠️ 請先填寫樹莓派伺服器網址 (URL)！';
            statusEl.classList.remove('hidden');
        }
        if (urlInput) urlInput.focus();
        return;
    }
    if (!key) {
        if (statusEl) {
            statusEl.className = 'text-[11px] font-mono mt-1 text-rose-600 dark:text-rose-400 font-bold';
            statusEl.textContent = '⚠️ 請先填寫 API 金鑰 (x-api-key)！';
            statusEl.classList.remove('hidden');
        }
        if (keyInput) keyInput.focus();
        return;
    }

    if (!/^https?:\/\//i.test(rawUrl)) {
        rawUrl = 'http://' + rawUrl;
    }

    // 檢查 HTTPS 網頁存取未加密 HTTP 之 Mixed Content 限制
    if (typeof location !== 'undefined' && location.protocol === 'https:' && rawUrl.startsWith('http://') && !rawUrl.includes('localhost') && !rawUrl.includes('127.0.0.1')) {
        if (statusEl) {
            statusEl.className = 'text-[11px] font-mono mt-1 text-amber-600 dark:text-amber-400 font-bold leading-relaxed';
            statusEl.textContent = '⚠️ 瀏覽器安全性警告：當前為 HTTPS 頁面，瀏覽器將禁止連線至未加密之 http:// 伺服器 (Mixed Content)！請透過 HTTPS 網址 (如 Cloudflare Tunnel) 或改以本機開啟。';
            statusEl.classList.remove('hidden');
        }
    }

    if (statusEl) {
        statusEl.className = 'text-[11px] font-mono mt-1 text-indigo-600 dark:text-indigo-400 font-bold animate-pulse';
        statusEl.textContent = '⏳ 正在連線樹莓派伺服器探測中...';
        statusEl.classList.remove('hidden');
    }
    const origBtnText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.classList.add('opacity-60', 'cursor-not-allowed');
    }

    const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    let controller = null;
    let timeoutId = null;
    if (typeof AbortController !== 'undefined') {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 8000);
    }

    try {
        let res = await fetch(`${rawUrl}/status`, {
            method: 'GET',
            headers: { 'x-api-key': key },
            signal: controller ? controller.signal : undefined
        }).catch(err => ({ _fetchErr: err }));

        if (timeoutId) clearTimeout(timeoutId);

        const latency = Math.round(((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - startTime);

        if (res && res._fetchErr) {
            throw res._fetchErr;
        }

        if (res.status === 200) {
            const data = await res.json().catch(() => ({}));
            const ver = data.version ? ` (${data.version})` : '';
            if (statusEl) {
                statusEl.className = 'text-[11px] font-mono mt-1 text-emerald-600 dark:text-emerald-400 font-bold';
                statusEl.textContent = `🟢 連線成功！伺服器運作正常${ver}，延遲 ${latency}ms`;
            }
            if (typeof showToast === 'function') showToast(`🎉 樹莓派連線成功！${ver} (${latency}ms)`, 'success');
        } else if (res.status === 403) {
            if (statusEl) {
                statusEl.className = 'text-[11px] font-mono mt-1 text-rose-600 dark:text-rose-400 font-bold';
                statusEl.textContent = `❌ 驗證失敗 (HTTP 403)：API 金鑰錯誤！請確認金鑰是否與樹莓派 .env 相符。`;
            }
            if (typeof showToast === 'function') showToast('❌ 樹莓派金鑰錯誤 (HTTP 403)', 'error');
        } else if (res.status === 429) {
            if (statusEl) {
                statusEl.className = 'text-[11px] font-mono mt-1 text-amber-600 dark:text-amber-400 font-bold';
                statusEl.textContent = `⚠️ 觸發伺服器頻繁請求保護 (HTTP 429 Too Many Requests)，請稍後再試。`;
            }
        } else if (res.status === 404) {
            // 退回測試 /api/liveschedule/latest 路由
            const backupRes = await fetch(`${rawUrl}/api/liveschedule/latest?account=${encodeURIComponent(acc || 'test')}`, {
                method: 'GET',
                headers: { 'x-api-key': key }
            }).catch(() => null);
            if (backupRes && (backupRes.ok || backupRes.status === 404)) {
                if (statusEl) {
                    statusEl.className = 'text-[11px] font-mono mt-1 text-emerald-600 dark:text-emerald-400 font-bold';
                    statusEl.textContent = `🟢 連線成功！API 金鑰認證通過，延遲 ${latency}ms`;
                }
                if (typeof showToast === 'function') showToast(`🎉 樹莓派認證成功！(${latency}ms)`, 'success');
            } else {
                if (statusEl) {
                    statusEl.className = 'text-[11px] font-mono mt-1 text-amber-600 dark:text-amber-400 font-bold';
                    statusEl.textContent = `⚠️ 伺服器已回應但未找到狀態路徑 (HTTP 404)，請檢查 server.js 版本。`;
                }
            }
        } else {
            if (statusEl) {
                statusEl.className = 'text-[11px] font-mono mt-1 text-rose-600 dark:text-rose-400 font-bold';
                statusEl.textContent = `❌ 連線異常 (HTTP ${res.status})：伺服器回應非預期狀態碼。`;
            }
        }
    } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        if (statusEl) {
            statusEl.className = 'text-[11px] font-mono mt-1 text-rose-600 dark:text-rose-400 font-bold leading-relaxed';
            if (err && err.name === 'AbortError') {
                statusEl.textContent = `❌ 連線逾時 (8 秒)：無法連線至樹莓派伺服器，請確認伺服器已啟動且連接埠已開放。`;
            } else {
                statusEl.textContent = `❌ 連線失敗 (${err && err.message ? err.message : '網路異常'})：請檢查伺服器網址、連接埠或網路防火牆。`;
            }
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('opacity-60', 'cursor-not-allowed');
            if (origBtnText) btn.innerHTML = origBtnText;
        }
    }
}

async function testGasConnection() {
    const urlInput = document.getElementById('gasSyncUrlInput');
    const keyInput = document.getElementById('gasApiKeyInput');
    const accInput = document.getElementById('piAccountInput');
    const statusEl = document.getElementById('gasConnectionStatusText');
    const btn = document.getElementById('gasTestBtn');

    const url = (urlInput ? urlInput.value : localStorage.getItem('gas_sync_url') || '').trim();
    const key = (keyInput ? keyInput.value : localStorage.getItem('gas_api_key') || '').trim();
    const acc = (accInput ? accInput.value : localStorage.getItem('pi_account') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'weber';

    if (!url) {
        if (statusEl) {
            statusEl.className = 'text-[11px] font-mono mt-1 text-rose-600 dark:text-rose-400 font-bold';
            statusEl.textContent = '⚠️ 請先填寫 Google Apps Script 網址 (Web App URL)！';
            statusEl.classList.remove('hidden');
        }
        if (urlInput) urlInput.focus();
        return;
    }
    if (!key) {
        if (statusEl) {
            statusEl.className = 'text-[11px] font-mono mt-1 text-rose-600 dark:text-rose-400 font-bold';
            statusEl.textContent = '⚠️ 請先填寫 Google 雲端 API 金鑰 (Secret Key)！';
            statusEl.classList.remove('hidden');
        }
        if (keyInput) keyInput.focus();
        return;
    }

    if (statusEl) {
        statusEl.className = 'text-[11px] font-mono mt-1 text-indigo-600 dark:text-indigo-400 font-bold animate-pulse';
        statusEl.textContent = '⏳ 正在連線 Google Apps Script 探測中...';
        statusEl.classList.remove('hidden');
    }
    const origBtnText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.classList.add('opacity-60', 'cursor-not-allowed');
    }

    const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    let controller = null;
    let timeoutId = null;
    if (typeof AbortController !== 'undefined') {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 10000);
    }

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'latest',
                apiKey: key,
                account: acc
            }),
            signal: controller ? controller.signal : undefined
        });

        if (timeoutId) clearTimeout(timeoutId);
        const latency = Math.round(((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - startTime);

        if (res.ok) {
            const json = await res.json().catch(() => null);
            if (json && json.success) {
                const info = json.fileName ? `最新備份: ${json.fileName}` : '雲端正常 (該帳號尚無備份)';
                if (statusEl) {
                    statusEl.className = 'text-[11px] font-mono mt-1 text-emerald-600 dark:text-emerald-400 font-bold';
                    statusEl.textContent = `🟢 連線成功！Google 雲端硬碟 (GAS) 運作正常 (${info})，延遲 ${latency}ms`;
                }
                if (typeof showToast === 'function') showToast(`🎉 GAS 雲端硬碟連線成功！(${latency}ms)`, 'success');
            } else if (json && (json.error || json.message)) {
                if (statusEl) {
                    statusEl.className = 'text-[11px] font-mono mt-1 text-rose-600 dark:text-rose-400 font-bold';
                    statusEl.textContent = `❌ 驗證失敗：${json.error || json.message} (請檢查 GAS API 金鑰)`;
                }
                if (typeof showToast === 'function') showToast('❌ GAS API 金鑰驗證失敗', 'error');
            } else {
                if (statusEl) {
                    statusEl.className = 'text-[11px] font-mono mt-1 text-amber-600 dark:text-amber-400 font-bold';
                    statusEl.textContent = `⚠️ GAS 回應異常 (未取得 success 標記)，延遲 ${latency}ms`;
                }
            }
        } else {
            if (statusEl) {
                statusEl.className = 'text-[11px] font-mono mt-1 text-rose-600 dark:text-rose-400 font-bold';
                statusEl.textContent = `❌ 連線異常 (HTTP ${res.status})：Google 伺服器回應非 200 狀態。`;
            }
        }
    } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        if (statusEl) {
            statusEl.className = 'text-[11px] font-mono mt-1 text-rose-600 dark:text-rose-400 font-bold leading-relaxed';
            if (err && err.name === 'AbortError') {
                statusEl.textContent = `❌ 連線逾時 (10 秒)：Google Apps Script 未能於時限內回應。`;
            } else {
                statusEl.textContent = `❌ 連線失敗 (${err && err.message ? err.message : '網路異常'})：請確認 Web App 是否已發布為「所有人可存取」。`;
            }
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('opacity-60', 'cursor-not-allowed');
            if (origBtnText) btn.innerHTML = origBtnText;
        }
    }
}

if (typeof window !== 'undefined') {
    window.testPiConnection = testPiConnection;
    window.testGasConnection = testGasConnection;
}


// 【v5.3.5 Google Apps Script 雲端硬碟雙軌同步輔助函式】
async function uploadPayloadToGas(fileName, payload) {
    const gasUrl = (localStorage.getItem('gas_sync_url') || '').trim();
    const gasKey = (localStorage.getItem('gas_api_key') || '').trim();
    const acc = (localStorage.getItem('pi_account') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'weber';
    if (!gasUrl || !gasKey) return null;
    try {
        const res = await fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'backup',
                apiKey: gasKey,
                account: acc,
                fileName: fileName,
                data: payload
            })
        });
        if (res.ok) {
            const json = await res.json();
            if (json && json.success) return json;
        }
    } catch (e) {
        console.warn('GAS backup upload failed:', e);
    }
    return null;
}


// ============================================================
// 🛡️ 【v6.0.2 雲端備份讀取驗證與多版本自動退回防護 (Read-Side Fallback Guard)】
// 設計理由 (Why)：
// 1. 即使伺服器端有 Atomic Write，若遇舊版殘檔、網路截斷或走 /files 備援路徑，不能只盲信第一份檔案 (jsonFiles[0])。
// 2. 明文備份必須具備合法 thoughts 陣列；加密封套必須具備合法 PBKDF2 參數、12-byte IV 與 >16 bytes 密文（含 128-bit GCM Tag）。
// 3. 若當前分頁已解鎖相同 Salt 之金鑰，直接以 AES-GCM 驗證密文完整性；認證失敗立即自動退回嘗試上一份完好備份。
// ============================================================
const MAX_BACKUP_FALLBACK_SCAN = 5;

function isValidBackupPayload(data) {
    if (!data || typeof data !== 'object') return false;
    if (Array.isArray(data)) return true;
    if (Array.isArray(data.thoughts)) return true;
    if (isEncryptedEnvelope(data)) {
        try {
            const iters = Number(data.kdf && data.kdf.iterations);
            if (!Number.isInteger(iters) || iters < E2EE_MIN_ITERATIONS || iters > E2EE_MAX_ITERATIONS) return false;
            const saltBytes = b64ToBytes(data.kdf.salt);
            const ivBytes = b64ToBytes(data.cipher.iv);
            const cipherBytes = b64ToBytes(data.ciphertext);
            if (saltBytes.length < 8 || ivBytes.length !== 12 || cipherBytes.length <= 16) return false;
            return true;
        } catch (e) {
            return false;
        }
    }
    return false;
}

async function isUsableBackupCandidate(data) {
    if (!isValidBackupPayload(data)) return false;
    if (isEncryptedEnvelope(data) && _e2eeSessionKey && _e2eeSessionSaltB64 === data.kdf.salt) {
        try {
            const plain = await decryptBackupWithKey(data, _e2eeSessionKey);
            return Boolean(plain && (Array.isArray(plain) || Array.isArray(plain.thoughts)));
        } catch (e) {
            console.warn('[Backup Fallback] 已解鎖金鑰無法通過此加密備份之 AES-GCM 認證，視為損壞並退回上一份:', e);
            return false;
        }
    }
    return true;
}


async function fetchLatestBackupFromGas(targetAccount) {
    const gasUrl = (localStorage.getItem('gas_sync_url') || '').trim();
    const gasKey = (localStorage.getItem('gas_api_key') || '').trim();
    const acc = (targetAccount || localStorage.getItem('pi_account') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'weber';
    if (!gasUrl || !gasKey) return null;
    try {
        const res = await fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'latest',
                apiKey: gasKey,
                account: acc
            })
        });
        if (res.ok) {
            const json = await res.json();
            if (json && json.success && json.fileName && json.backupData) {
                if (await isUsableBackupCandidate(json.backupData)) {
                    return { fileName: json.fileName, backupData: json.backupData };
                }
                console.warn('[GAS Sync] 雲端硬碟最新備份格式或加密驗證未通過，已略過:', json.fileName);
            }
        }
    } catch (e) {
        console.warn('GAS fetch latest backup failed:', e);
    }
    return null;
}


async function uploadPayloadToPi(fileName, payload) {


    let response = await fetch(`${piServerUrl}/api/liveschedule/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': piApiKey, 'x-account': encodeURIComponent(piAccount) },
        body: JSON.stringify({ fileName, account: piAccount, data: payload })
    }).catch(() => null);
    if (response && (response.status === 401 || response.status === 403 || response.status === 429)) {
        return response;
    }
    if (!response || !response.ok) {


        const formData = new FormData();
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        formData.append('photo', blob, fileName);
        response = await fetch(`${piServerUrl}/upload`, {
            method: 'POST',
            headers: { 'x-api-key': piApiKey, 'x-original-name': encodeURIComponent(fileName), 'x-target-path': encodeURIComponent('LiveSchedule') },
            body: formData
        });
    }
    if (response && response.ok && typeof response.clone === 'function') {
        try {
            const body = await response.clone().json();
            if (body && (body.fileName || body.filename)) {
                response.savedFileName = body.fileName || body.filename;
            }
        } catch (e) {}
    }
    return response;
}
async function fetchLatestBackupForAccount(targetAccount) {


    const acc = (targetAccount || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const skippedCorrupt = [];
    try {
        let response = await fetch(`${piServerUrl}/api/liveschedule/latest?account=${encodeURIComponent(acc)}`, {
            method: 'GET',
            headers: { 'x-api-key': piApiKey, 'x-account': encodeURIComponent(acc) }
        });
        if (response.status === 401 || response.status === 403 || response.status === 429) {
            return { backupData: null, fileName: '', skippedCorrupt };
        }
        if (response.ok) {


            const result = await response.json();
            if (result && Array.isArray(result.skippedCorrupt)) {
                result.skippedCorrupt.forEach(f => {
                    if (!skippedCorrupt.includes(f)) skippedCorrupt.push(f);
                });
            }
            if (result && result.fileName && isFileMatchingAccount(result.fileName, acc)) {
                if (await isUsableBackupCandidate(result.data)) {
                    return { backupData: result.data, fileName: result.fileName, skippedCorrupt };
                }
                console.warn(`[Backup Fallback] /latest 回傳之備份 (${result.fileName}) 結構或加密驗證未通過，轉入 /files 逐份退回搜尋`);
                if (!skippedCorrupt.includes(result.fileName)) skippedCorrupt.push(result.fileName);
            }
        }
    } catch (e) {}
    try {
        const filesRes = await fetch(`${piServerUrl}/files?path=LiveSchedule`, { headers: { 'x-api-key': piApiKey } });
        if (filesRes.status === 401 || filesRes.status === 403 || filesRes.status === 429) {
            return { backupData: null, fileName: '', skippedCorrupt };
        }
        if (filesRes.ok) {


            const filesData = await filesRes.json();
            const jsonFiles = (filesData.files || [])
                .filter(f => !f.isDirectory && isFileMatchingAccount(f.name, acc) && !skippedCorrupt.includes(f.name))
                .map(f => f.name).sort().reverse()
                .slice(0, MAX_BACKUP_FALLBACK_SCAN);
            for (const fileName of jsonFiles) {
                try {
                    const downRes = await fetch(`${piServerUrl}/download/LiveSchedule%2F${encodeURIComponent(fileName)}`, { headers: { 'x-api-key': piApiKey } });
                    if (downRes.status === 401 || downRes.status === 403 || downRes.status === 429) break;
                    if (!downRes.ok) {
                        skippedCorrupt.push(fileName);
                        continue;
                    }
                    const data = await downRes.json();
                    if (await isUsableBackupCandidate(data)) {
                        if (skippedCorrupt.length > 0) {
                            console.warn(`[Backup Fallback] 已略過 ${skippedCorrupt.length} 份異常備份，成功退回載入完好備份: ${fileName}`);
                        }
                        return { backupData: data, fileName, skippedCorrupt };
                    }
                    console.warn(`[Backup Fallback] 備份檔 ${fileName} 內容驗證未通過，繼續嘗試上一份...`);
                    skippedCorrupt.push(fileName);
                } catch (innerErr) {
                    console.warn(`[Backup Fallback] 備份檔 ${fileName} JSON 解析失敗，繼續嘗試上一份...`);
                    skippedCorrupt.push(fileName);
                }
            }
        }
    } catch (e) {}
    return { backupData: null, fileName: '', skippedCorrupt };
}
async function savePiSettings() {


    const urlInput = document.getElementById('piServerUrlInput');
    const keyInput = document.getElementById('piApiKeyInput');
    const accInput = document.getElementById('piAccountInput');
    let newUrl = urlInput ? urlInput.value.trim().replace(/\/+$/, '') : '';
    if (newUrl && !/^https?:\/\//i.test(newUrl)) {
        newUrl = 'http://' + newUrl;
    }


    const newKey = keyInput ? keyInput.value.trim() : '';
    const newAcc = accInput ? accInput.value.trim().replace(/[^a-zA-Z0-9_-]/g, '') : '';
    const oldAcc = (localStorage.getItem('pi_account') || '').trim();
    piServerUrl = newUrl;
    piApiKey = newKey;
    piAccount = newAcc;
    const gasUrlInput = document.getElementById('gasSyncUrlInput');
    const gasKeyInput = document.getElementById('gasApiKeyInput');
    const newGasUrl = gasUrlInput ? gasUrlInput.value.trim().replace(/\/+$/, '') : '';
    const newGasKey = gasKeyInput ? gasKeyInput.value.trim() : '';


    localStorage.setItem('pi_server_url', piServerUrl);
    localStorage.setItem('pi_api_key', piApiKey);
    localStorage.setItem('pi_account', piAccount);
    localStorage.setItem('gas_sync_url', newGasUrl);
    localStorage.setItem('gas_api_key', newGasKey);
    const geminiKeyInput = document.getElementById('geminiApiKeyInput');
    if (geminiKeyInput) localStorage.setItem('gemini_api_key', geminiKeyInput.value.trim());
    closePiSettingsModal();
    if (oldAcc !== newAcc) {
        lastSyncedFileName = '';
        localStorage.removeItem('pi_last_synced_file');
        _pendingEncryptedRemote = null;
        _latestRemoteEnvelope = null;
        thoughts = [];
        localStorage.removeItem('my_thoughts_local');
        blockedSlots = [];
        localStorage.removeItem('my_blocked_slots');
        categoryOrder = [];
        localStorage.removeItem('my_category_order');
        render();
        if ((!piServerUrl || !piApiKey) && (!newGasUrl || !newGasKey)) {
            isInitialSyncCompleted = true;
            updatePiSyncBadge('⚪ 未設定伺服器 (點擊設定)', 'bg-slate-100 text-slate-600 border-slate-200');
            alert(`已切換至帳號「${newAcc || '未指定'}」！畫面已初始化為全新空白卡片資料。`);
            return;
        }
        updatePiSyncBadge('🔍 檢查新帳號備份...', 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse');


        const { backupData, fileName } = (piServerUrl && piApiKey)
            ? await fetchLatestBackupForAccount(piAccount)
            : await fetchLatestBackupFromGas(piAccount) || { backupData: null, fileName: '' };
        if (backupData && fileName) {
            const syncOutcome = await applyRemoteBackupOrQueueUnlock(
                backupData,
                fileName,
                '🟢 已同步最新',
                'bg-emerald-100 text-emerald-900 border-emerald-300',
                true
            );
            if (syncOutcome.unlocked && syncOutcome.applied) {
                alert(`🎉 已切換至帳號「${newAcc || '未指定'}」並載入該帳號之最新備份！\n檔名：${fileName}`);
            } else if (!syncOutcome.unlocked) {
                openE2eePassphraseModal('unlock', () => {
                    alert(`🎉 已成功解鎖並載入帳號「${newAcc || '未指定'}」之加密備份！\n檔名：${fileName}`);
                });
            }
        } else {
            thoughts = [];
            blockedSlots = [];
            isInitialSyncCompleted = true;
            render();
            updatePiSyncBadge('🟢 尚無雲端檔案', 'bg-slate-100 text-slate-700 border-slate-200');
            alert(`已切換至帳號「${newAcc || '未指定'}」！\n伺服器上尚未找到此帳號之備份，畫面已初始化為全新空白卡片資料。`);
        }
        return;
    }
    alert("已儲存雙軌同步連線設定！");
    checkAndAutoSyncFromPi();
}


function triggerAutoSaveToPi() {
    piServerUrl = (localStorage.getItem('pi_server_url') || '').trim();
    piApiKey = (localStorage.getItem('pi_api_key') || '').trim();
    piAccount = (localStorage.getItem('pi_account') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const gasUrl = (localStorage.getItem('gas_sync_url') || '').trim();
    const gasKey = (localStorage.getItem('gas_api_key') || '').trim();
    const hasPi = Boolean(piServerUrl && piApiKey);
    const hasGas = Boolean(gasUrl && gasKey);

    // 【v5.3.16 解除單軌死鎖】：支援純 Google 雲端硬碟 (GAS) 或純樹莓派或雙軌自動備份
    if (!hasPi && !hasGas) {
        updatePiSyncBadge('⚪ 未設定伺服器 (點擊設定)', 'bg-slate-100 text-slate-600 border-slate-200');
        return;
    }

    // 標記本機已有尚未上傳至雲端的修改 (Dirty Flag)
    _hasUnsavedCloudChanges = true;

    // 【v6.0.1 第二段防線】：若已啟用加密但尚未解鎖金鑰，使用者一動手修改立刻轉為紅燈並自動彈出通行碼解鎖視窗，絕不靜默略過！
    if (isE2eeEnabled() && !_e2eeSessionKey) {
        updatePiSyncBadge('🚨 本機修改尚未上傳雲端 (點擊輸入通行碼)', 'bg-rose-100 text-rose-900 border-rose-400 animate-pulse');
        const e2eeModal = document.getElementById('e2eePassphraseModal');
        if (!e2eeModal || e2eeModal.classList.contains('hidden')) {
            openE2eePassphraseModal(
                hasE2eeRemoteOrSession() ? 'unlock' : 'setup',
                null,
                null,
                '💡 您剛剛修改了內容！請輸入加密通行碼，系統將立即為您加密並同步備份至雲端與樹莓派。'
            );
        }
        return;
    }

    // 【v5.3.18 開頁同步閘門防禦】：若開頁之初尚未完成伺服器最新檔案檢查/拉取，暫緩發送 (待檢查完成後自動補發)
    if (!isInitialSyncCompleted) {
        console.warn('[AutoSave Queued] 開頁雲端同步檢查尚未完成，已排入待同步佇列。');
        return;
    }

    updatePiSyncBadge('⏳ 待發送...', 'bg-amber-50 text-amber-800 border-amber-200');
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(performSilentAutoSave, 1500);
}
async function performSilentAutoSave() {
    // 【v5.3.18 開頁同步閘門防禦】
    if (!isInitialSyncCompleted) return;


    piServerUrl = (localStorage.getItem('pi_server_url') || '').trim();
    piApiKey = (localStorage.getItem('pi_api_key') || '').trim();
    piAccount = (localStorage.getItem('pi_account') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const gasUrl = (localStorage.getItem('gas_sync_url') || '').trim();
    const gasKey = (localStorage.getItem('gas_api_key') || '').trim();
    const hasPi = Boolean(piServerUrl && piApiKey);
    const hasGas = Boolean(gasUrl && gasKey);
    if (!hasPi && !hasGas) return;
    if (thoughts.length === 0) return;

    // 【v6.0.0 零靜默降級防禦】：啟用加密時，若尚未解鎖金鑰，嚴禁退回明文上傳
    if (isE2eeEnabled() && !_e2eeSessionKey) {
        updatePiSyncBadge('🚨 本機修改尚未上傳雲端 (點擊輸入通行碼)', 'bg-rose-100 text-rose-900 border-rose-400 animate-pulse');
        return;
    }


    // 【v5.3.18 資料量防縮水熔斷機制】：防止載入不完整舊快取導致雲端資料庫遭截斷覆蓋
    const currentStepsCount = thoughts.reduce((acc, t) => acc + (Array.isArray(t.steps) ? t.steps.length : 0), 0);
    const lastKnownSteps = parseInt(localStorage.getItem('ls_last_known_steps_count') || '0', 10);
    if (lastKnownSteps > 20 && currentStepsCount < lastKnownSteps * 0.7) {
        console.warn(`[AutoSave Aborted] 偵測到資料異常大幅縮水：目前總步驟數 (${currentStepsCount}) 遠低於上次已知步驟數 (${lastKnownSteps}) 之 70%，已熔斷自動儲存！`);
        updatePiSyncBadge('⚠️ 偵測到資料大幅縮水 (已暫停自動儲存)', 'bg-rose-100 text-rose-800 border-rose-300');
        return;
    }


    updatePiSyncBadge('⏳ 雙軌備份中...', 'bg-indigo-50 text-indigo-800 border-indigo-200 animate-pulse');
    const fileName = generateBackupFileName();
    const plainPayload = getExportPayload();


    try {
        const outboundPayload = await prepareOutboundPayload(plainPayload);
        const e2eeSuffix = isE2eeEnabled() ? ' 🔐' : '';
        const tasks = [
            hasPi ? uploadPayloadToPi(fileName, outboundPayload) : Promise.resolve(null),
            hasGas ? uploadPayloadToGas(fileName, outboundPayload) : Promise.resolve(null)
        ];
        const results = await Promise.allSettled(tasks);
        const piOk = results[0].status === 'fulfilled' && results[0].value && results[0].value.ok;
        const gasOk = results[1].status === 'fulfilled' && results[1].value && results[1].value.success;
        const syncedName = (piOk && results[0].value.savedFileName) ? results[0].value.savedFileName : fileName;


        if (piOk && gasOk) {
            _hasUnsavedCloudChanges = false;
            lastSyncedFileName = syncedName;
            localStorage.setItem('pi_last_synced_file', syncedName);
            localStorage.setItem('ls_last_known_steps_count', String(currentStepsCount));
            updatePiSyncBadge('🟢 雙軌已備份最新' + e2eeSuffix, 'bg-emerald-100 text-emerald-900 border-emerald-300');
        } else if (gasOk && !piOk) {
            _hasUnsavedCloudChanges = false;
            lastSyncedFileName = fileName;
            localStorage.setItem('pi_last_synced_file', fileName);
            localStorage.setItem('ls_last_known_steps_count', String(currentStepsCount));
            updatePiSyncBadge('🟡 雲端已備份 (樹莓派離線待復原)' + e2eeSuffix, 'bg-amber-100 text-amber-900 border-amber-300');
        } else if (piOk && !gasOk) {
            _hasUnsavedCloudChanges = false;
            lastSyncedFileName = syncedName;
            localStorage.setItem('pi_last_synced_file', syncedName);
            localStorage.setItem('ls_last_known_steps_count', String(currentStepsCount));
            updatePiSyncBadge('🟡 樹莓派已備份 (雲端離線)' + e2eeSuffix, 'bg-amber-100 text-amber-900 border-amber-300');
        } else {
            updatePiSyncBadge('⚠️ 雙軌備份失敗', 'bg-rose-100 text-rose-800 border-rose-200');
        }
    } catch (e) {
        if (e && e.message === 'E2EE_KEY_LOCKED') {
            updatePiSyncBadge('🚨 本機修改尚未上傳雲端 (點擊輸入通行碼)', 'bg-rose-100 text-rose-900 border-rose-400 animate-pulse');
        } else {
            updatePiSyncBadge('⚠️ 離線/儲存失敗', 'bg-rose-50 text-rose-700 border-rose-200');
        }
    }
}


// 【v5.3.16 視窗關閉/切換立即強制結算保護】 + 【v6.0.1 第三段防線：未解鎖修改關頁攔截警告】
function flushPendingAutoSave(e) {
    if (_hasUnsavedCloudChanges && isE2eeEnabled() && !_e2eeSessionKey) {
        if (e && e.type === 'beforeunload') {
            e.preventDefault();
            e.returnValue = '您有修改尚未輸入通行碼加密上傳至雲端，確定要離開嗎？';
            return e.returnValue;
        }
        return;
    }
    // 【v5.3.18 開頁同步閘門防禦】：若開頁初期尚未完成雲端同步拉取，視窗關閉/切換時嚴禁執行強制儲存
    if (!isInitialSyncCompleted) return;
    if (isE2eeEnabled() && !_e2eeSessionKey) return;


    if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = null;
        performSilentAutoSave();
    }
}


if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flushPendingAutoSave);
    window.addEventListener('pagehide', flushPendingAutoSave);
}
async function exportToPi() {
    piServerUrl = (localStorage.getItem('pi_server_url') || '').trim();
    piApiKey = (localStorage.getItem('pi_api_key') || '').trim();
    piAccount = (localStorage.getItem('pi_account') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!piServerUrl || !piApiKey) {
        alert("請先點擊「⚙️ 伺服器設定」設定樹莓派伺服器網址與 API 金鑰！");
        openPiSettingsModal();
        return;
    }
    if (thoughts.length === 0) return alert("目前沒有可備份的資料！");
    if (!isInitialSyncCompleted && _pendingEncryptedRemote) {
        openE2eePassphraseModal('unlock', () => exportToPi(), null, '⚠️ 雲端尚有加密備份待驗證！請輸入通行碼完成驗證後自動上傳。');
        return;
    }
    if (isE2eeEnabled() && !_e2eeSessionKey) {
        openE2eePassphraseModal(hasE2eeRemoteOrSession() ? 'unlock' : 'setup', () => exportToPi());
        return;
    }


    const fileName = generateBackupFileName();
    try {
        const outboundPayload = await prepareOutboundPayload(getExportPayload());
        const response = await uploadPayloadToPi(fileName, outboundPayload);
        if (response && response.ok) {
            const savedName = response.savedFileName || fileName;
            _hasUnsavedCloudChanges = false;
            lastSyncedFileName = savedName;
            localStorage.setItem('pi_last_synced_file', savedName);
            const e2eeSuffix = isE2eeEnabled() ? ' 🔐' : '';
            updatePiSyncBadge('🟢 已同步最新' + e2eeSuffix, 'bg-emerald-100 text-emerald-900 border-emerald-300');
            alert(`🎉 成功上傳${isE2eeEnabled() ? '加密' : ''}備份至樹莓派！\n帳號：${piAccount || '未指定'}\n檔名：${savedName}`);
        } else {


            const errData = await response.json().catch(() => ({}));
            alert(`❌ 上傳失敗 (${response ? response.status : '網路異常'})：${errData.error || errData.message || '請檢查金鑰與連線'}`);
        }
    } catch (e) {
        alert(`❌ 連線或加密上傳失敗！\n錯誤：${e.message}`);
    }
}
async function importFromPi() {
    piServerUrl = (localStorage.getItem('pi_server_url') || '').trim();
    piApiKey = (localStorage.getItem('pi_api_key') || '').trim();
    piAccount = (localStorage.getItem('pi_account') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!piServerUrl || !piApiKey) {
        alert("請先點擊「⚙️ 伺服器設定」設定樹莓派伺服器網址與 API 金鑰！");
        openPiSettingsModal();
        return;
    }
    try {
        const { backupData, fileName } = await fetchLatestBackupForAccount(piAccount);
        if (backupData && fileName) {
            const accLabel = piAccount ? ` [帳號: ${piAccount}]` : '';
            if (isEncryptedEnvelope(backupData)) {
                _latestRemoteEnvelope = backupData;
                localStorage.setItem('ls_e2ee_enabled', 'true');
                updateE2eeSettingsUI();
                if (_e2eeSessionKey && _e2eeSessionSaltB64 === backupData.kdf.salt) {
                    try {
                        const plainData = await decryptBackupWithKey(backupData, _e2eeSessionKey);
                        if (confirm(`確定從樹莓派載入最新加密備份？${accLabel}\n備份檔名：${fileName}`)) {
                            if (applyImportedData(plainData, fileName)) {
                                isInitialSyncCompleted = true;
                                _pendingEncryptedRemote = null;
                                updatePiSyncBadge('🟢 已同步最新 🔐', 'bg-emerald-100 text-emerald-900 border-emerald-300');
                                alert(`🎉 成功從樹莓派解密並同步最新備份！${accLabel}`);
                            }
                        }
                        return;
                    } catch (e) {}
                }
                openE2eePassphraseModal('unlock', (plainData) => {
                    if (confirm(`確定載入已解密的樹莓派備份？${accLabel}\n備份檔名：${fileName}`)) {
                        if (applyImportedData(plainData, fileName)) {
                            isInitialSyncCompleted = true;
                            _pendingEncryptedRemote = null;
                            updatePiSyncBadge('🟢 已同步最新 🔐', 'bg-emerald-100 text-emerald-900 border-emerald-300');
                            alert(`🎉 成功從樹莓派解密並同步最新備份！${accLabel}`);
                        }
                    }
                }, backupData);
                return;
            }
            if (confirm(`確定從樹莓派載入最新備份？${accLabel}\n備份檔名：${fileName}`)) {
                if (applyImportedData(backupData, fileName)) {
                    isInitialSyncCompleted = true;
                    updatePiSyncBadge('🟢 已同步最新', 'bg-emerald-100 text-emerald-900 border-emerald-300');
                    alert(`🎉 成功從樹莓派同步最新備份！${accLabel}`);
                }
            }
        } else {
            alert(`❌ 樹莓派上尚未找到帳號「${piAccount || '未指定'}」的任何備份檔案，請先執行「☁️ 上傳樹莓派」！`);
        }
    } catch (e) {
        alert(`❌ 連線樹莓派失敗：${e.message}`);
    }
}
async function checkAndAutoSyncFromPi() {
    piServerUrl = (localStorage.getItem('pi_server_url') || '').trim();
    piApiKey = (localStorage.getItem('pi_api_key') || '').trim();
    piAccount = (localStorage.getItem('pi_account') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const gasUrl = (localStorage.getItem('gas_sync_url') || '').trim();
    const gasKey = (localStorage.getItem('gas_api_key') || '').trim();
    const hasPi = Boolean(piServerUrl && piApiKey);
    const hasGas = Boolean(gasUrl && gasKey);


    if (!hasPi && !hasGas) {
        updatePiSyncBadge('⚪ 未設定伺服器 (點擊設定)', 'bg-slate-100 text-slate-600 border-slate-200');
        isInitialSyncCompleted = true; // 無設定伺服器，解鎖本機自動儲存
        return;
    }
    updatePiSyncBadge('🔍 雙軌檢查同步中...', 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse');


    try {
        const results = await Promise.allSettled([
            hasPi ? fetchLatestBackupForAccount(piAccount) : Promise.resolve({ backupData: null, fileName: null }),
            hasGas ? fetchLatestBackupFromGas(piAccount) : Promise.resolve({ backupData: null, fileName: null })
        ]);


        const piRes = (results[0].status === 'fulfilled' && results[0].value) ? results[0].value : { backupData: null, fileName: null };
        const gasRes = (results[1].status === 'fulfilled' && results[1].value) ? results[1].value : { backupData: null, fileName: null };
        const piFile = piRes.fileName;
        const gasFile = gasRes.fileName;


        // 雙軌自癒回線對齊 (Self-Healing Re-sync)：直接原封轉發原始封套 (無須重加密)
        if (piFile && gasFile) {
            if (gasFile > piFile) {
                if (hasPi) uploadPayloadToPi(gasFile, gasRes.backupData).catch(() => {});
                await applyRemoteBackupOrQueueUnlock(
                    gasRes.backupData,
                    gasFile,
                    '🟢 已自雲端同步最新 (已補齊樹莓派)',
                    'bg-emerald-100 text-emerald-900 border-emerald-300',
                    gasFile > lastSyncedFileName || thoughts.length === 0
                );
                return;
            } else if (piFile > gasFile) {
                if (hasGas) uploadPayloadToGas(piFile, piRes.backupData).catch(() => {});
                await applyRemoteBackupOrQueueUnlock(
                    piRes.backupData,
                    piFile,
                    '🟢 已自樹莓派同步最新 (已補齊雲端)',
                    'bg-emerald-100 text-emerald-900 border-emerald-300',
                    piFile > lastSyncedFileName || thoughts.length === 0
                );
                return;
            } else {
                await applyRemoteBackupOrQueueUnlock(
                    piRes.backupData,
                    piFile,
                    '🟢 雙軌已是最新狀態',
                    'bg-emerald-50 text-emerald-800 border-emerald-200',
                    piFile > lastSyncedFileName || thoughts.length === 0
                );
                return;
            }
        } else if (gasFile && !piFile) {
            if (hasPi) {
                uploadPayloadToPi(gasFile, gasRes.backupData).catch(() => {});
            }
            const label = hasPi ? '🟡 雲端最新 (樹莓派離線待復原)' : '🟢 雲端已同步最新';
            const badgeCls = hasPi ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300';
            await applyRemoteBackupOrQueueUnlock(
                gasRes.backupData,
                gasFile,
                label,
                badgeCls,
                gasFile > lastSyncedFileName || thoughts.length === 0
            );
            return;
        } else if (piFile && !gasFile) {
            if (hasGas) {
                uploadPayloadToGas(piFile, piRes.backupData).catch(() => {});
            }
            const label = hasGas ? '🟡 樹莓派最新 (雲端離線)' : '🟢 樹莓派已同步最新';
            const badgeCls = hasGas ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300';
            await applyRemoteBackupOrQueueUnlock(
                piRes.backupData,
                piFile,
                label,
                badgeCls,
                piFile > lastSyncedFileName || thoughts.length === 0
            );
            return;
        } else {
            if (results[0].status === 'rejected' && results[1].status === 'rejected') {
                updatePiSyncBadge('⚠️ 雙軌連線失敗 (點擊重試)', 'bg-rose-50 text-rose-700 border-rose-200');
                if (!_pendingEncryptedRemote) isInitialSyncCompleted = true;
            } else {
                updatePiSyncBadge('🟢 尚無雲端檔案', 'bg-slate-100 text-slate-700 border-slate-200');
                isInitialSyncCompleted = true;
            }
        }
    } catch (e) {
        updatePiSyncBadge('⚠️ 連線失敗 (點擊重試)', 'bg-rose-50 text-rose-700 border-rose-200');
        if (!_pendingEncryptedRemote) isInitialSyncCompleted = true;
    }
}
