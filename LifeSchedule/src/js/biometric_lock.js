// ============================================================
// 👆 【v6.1.0 生物辨識快速解鎖與最高防護核心 (WebAuthn PRF + Local Vault + App Lock)】
// 設計原則：
// 1. WebAuthn PRF 優先：透過平台指紋/Face ID 安全晶片產生高熵金鑰包裹主通行碼，絕不寫入明文。
// 2. 自動降級相容：若瀏覽器/iOS 尚未支援 PRF，自動退回標準 WebAuthn (userVerification: 'required')
//    搭配 IndexedDB 儲存不可匯出 (extractable: false) 之 CryptoKey。
// 3. 最高防護 (App Lock + Local Vault)：啟用後開頁即顯示鎖定遮罩，本機敏感資料與 API Key
//    全數以 AES-GCM-256 加密存於 ls_encrypted_local_vault，並清除 localStorage 明文殘留。
// ============================================================

const BIO_CRED_META_KEY = 'ls_bio_cred_meta';
const BIO_WRAPPED_SECRET_KEY = 'ls_bio_wrapped_secret';
const BIO_PRF_FORMAT_ID = 'ls_bio_prf_v1';
const LOCAL_VAULT_KEY = 'ls_encrypted_local_vault';
const LOCAL_VAULT_FORMAT_ID = 'lifeschedule_local_vault_v1';
const APPLOCK_ENABLED_KEY = 'ls_applock_enabled';
const APPLOCK_TIMEOUT_KEY = 'ls_applock_timeout_min';
const LAST_PASSPHRASE_AT_KEY = 'ls_e2ee_last_passphrase_at';
const PASSPHRASE_REMIND_DAYS = 14;

const BIO_IDB_NAME = 'LifeScheduleBioVault';
const BIO_IDB_STORE = 'keys';
const BIO_IDB_RECORD_ID = 'session_key_record';

let _unlockedApiKeys = {
    pi_api_key: '',
    gas_api_key: '',
    gemini_api_key: ''
};
let _lastHiddenAt = 0;
let _localVaultWriteChain = Promise.resolve();

function isWebAuthnSupported() {
    try {
        return Boolean(
            typeof window !== 'undefined' &&
            window.isSecureContext &&
            window.PublicKeyCredential &&
            navigator.credentials &&
            typeof navigator.credentials.create === 'function' &&
            typeof navigator.credentials.get === 'function'
        );
    } catch (e) {
        return false;
    }
}

function bufToB64Url(buf) {
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function b64UrlToBytes(b64u) {
    const padLen = (4 - (b64u.length % 4)) % 4;
    const b64 = b64u.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLen);
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
        out[i] = bin.charCodeAt(i);
    }
    return out;
}

async function getBioPrfFixedInputBytes() {
    const raw = new TextEncoder().encode('LifeSchedule-E2EE-PRF-v1');
    const digest = await window.crypto.subtle.digest('SHA-256', raw);
    return new Uint8Array(digest);
}

function getBioCredentialMeta() {
    try {
        const raw = localStorage.getItem(BIO_CRED_META_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.credIdB64Url === 'string' && parsed.credIdB64Url.length > 0) {
            return parsed;
        }
        return null;
    } catch (e) {
        return null;
    }
}

function hasBioCredentialBound() {
    const meta = getBioCredentialMeta();
    if (!meta) return false;
    if (meta.mode === 'prf') {
        try {
            return Boolean(localStorage.getItem(BIO_WRAPPED_SECRET_KEY));
        } catch (e) {
            return false;
        }
    }
    return true;
}

function isAppLockEnabled() {
    try {
        return localStorage.getItem(APPLOCK_ENABLED_KEY) === 'true' && isE2eeEnabled();
    } catch (e) {
        return false;
    }
}

function getAppLockTimeoutMinutes() {
    try {
        const raw = localStorage.getItem(APPLOCK_TIMEOUT_KEY);
        if (raw === null || raw === '') return 3;
        const n = Number(raw);
        return Number.isFinite(n) ? n : 3;
    } catch (e) {
        return 3;
    }
}

function isAppLockActiveAndLocked() {
    return isAppLockEnabled() && !_e2eeSessionKey;
}

function getVaultedApiKey(keyName) {
    if (isAppLockEnabled()) {
        if (_e2eeSessionKey && Object.prototype.hasOwnProperty.call(_unlockedApiKeys, keyName)) {
            return (_unlockedApiKeys[keyName] || '').trim();
        }
        return '';
    }
    try {
        return (localStorage.getItem(keyName) || '').trim();
    } catch (e) {
        return '';
    }
}

function setVaultedApiKey(keyName, value) {
    const cleanVal = (value || '').trim();
    if (Object.prototype.hasOwnProperty.call(_unlockedApiKeys, keyName)) {
        _unlockedApiKeys[keyName] = cleanVal;
    }
    if (isAppLockEnabled()) {
        try { localStorage.removeItem(keyName); } catch (e) {}
        if (_e2eeSessionKey) {
            persistEncryptedLocalVault();
        }
        return;
    }
    try {
        localStorage.setItem(keyName, cleanVal);
    } catch (e) {}
}

function recordManualPassphraseUnlock() {
    try {
        localStorage.setItem(LAST_PASSPHRASE_AT_KEY, String(Date.now()));
    } catch (e) {}
}

function isPassphraseReviewDue() {
    if (!hasBioCredentialBound()) return false;
    try {
        const raw = localStorage.getItem(LAST_PASSPHRASE_AT_KEY);
        if (!raw) return false;
        const ts = Number(raw);
        if (!Number.isFinite(ts) || ts <= 0) return false;
        const days = (Date.now() - ts) / (1000 * 60 * 60 * 24);
        return days >= PASSPHRASE_REMIND_DAYS;
    } catch (e) {
        return false;
    }
}

// ---------- IndexedDB Helper (for non-extractable CryptoKey fallback) ----------
function openBioIdb() {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            reject(new Error('此瀏覽器不支援 IndexedDB'));
            return;
        }
        const req = indexedDB.open(BIO_IDB_NAME, 1);
        req.onupgradeneeded = (ev) => {
            const db = ev.target.result;
            if (!db.objectStoreNames.contains(BIO_IDB_STORE)) {
                db.createObjectStore(BIO_IDB_STORE, { keyPath: 'id' });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error || new Error('開啟 IndexedDB 失敗'));
    });
}

async function saveSessionKeyToBioIdb(aesKey, saltB64, iterations, keySlots = null, vaultId = '') {
    const db = await openBioIdb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(BIO_IDB_STORE, 'readwrite');
        const store = tx.objectStore(BIO_IDB_STORE);
        store.put({
            id: BIO_IDB_RECORD_ID,
            aesKey,
            saltB64,
            iterations,
            keySlots: Array.isArray(keySlots) ? keySlots : null,
            vaultId: vaultId || '',
            savedAt: Date.now()
        });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error || new Error('寫入 IndexedDB 失敗')); };
    });
}

async function loadSessionKeyFromBioIdb() {
    const db = await openBioIdb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(BIO_IDB_STORE, 'readonly');
        const store = tx.objectStore(BIO_IDB_STORE);
        const req = store.get(BIO_IDB_RECORD_ID);
        req.onsuccess = () => { db.close(); resolve(req.result || null); };
        req.onerror = () => { db.close(); reject(req.error || new Error('讀取 IndexedDB 失敗')); };
    });
}

async function clearBioIdb() {
    try {
        const db = await openBioIdb();
        await new Promise((resolve) => {
            const tx = db.transaction(BIO_IDB_STORE, 'readwrite');
            tx.objectStore(BIO_IDB_STORE).delete(BIO_IDB_RECORD_ID);
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => { db.close(); resolve(); };
        });
    } catch (e) {}
}

// ---------- HKDF Wrap / Unwrap for WebAuthn PRF ----------
async function derivePrfWrapKey(prfOutputBuf, saltBytes) {
    const baseKey = await window.crypto.subtle.importKey(
        'raw',
        prfOutputBuf,
        { name: 'HKDF' },
        false,
        ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: saltBytes,
            info: new TextEncoder().encode('LifeSchedule-Bio-Wrap-v1')
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function wrapPassphraseWithPrf(passphrase, prfOutputBuf, credIdB64Url) {
    const hkdfSalt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const wrapKey = await derivePrfWrapKey(prfOutputBuf, hkdfSalt);
    const aadObj = { _format: BIO_PRF_FORMAT_ID, credIdB64Url, hkdfSalt: bufToB64Url(hkdfSalt), iv: bufToB64Url(iv) };
    const aadBytes = new TextEncoder().encode(JSON.stringify(aadObj));
    const cipherBuf = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, additionalData: aadBytes },
        wrapKey,
        new TextEncoder().encode(passphrase)
    );
    return {
        ...aadObj,
        ciphertext: bufToB64Url(cipherBuf)
    };
}

async function unwrapPassphraseWithPrf(wrappedObj, prfOutputBuf) {
    if (!wrappedObj || wrappedObj._format !== BIO_PRF_FORMAT_ID) {
        throw new Error('無效的指紋金鑰封套格式');
    }
    const hkdfSalt = b64UrlToBytes(wrappedObj.hkdfSalt);
    const iv = b64UrlToBytes(wrappedObj.iv);
    const cipherBytes = b64UrlToBytes(wrappedObj.ciphertext);
    const wrapKey = await derivePrfWrapKey(prfOutputBuf, hkdfSalt);
    const aadObj = {
        _format: wrappedObj._format,
        credIdB64Url: wrappedObj.credIdB64Url,
        hkdfSalt: wrappedObj.hkdfSalt,
        iv: wrappedObj.iv
    };
    const aadBytes = new TextEncoder().encode(JSON.stringify(aadObj));
    const plainBuf = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv, additionalData: aadBytes },
        wrapKey,
        cipherBytes
    );
    return new TextDecoder().decode(plainBuf);
}

// ---------- 綁定 / 移除裝置指紋 ----------
async function registerBiometricCredentialWithPassphrase(passphrase) {
    if (!isWebAuthnSupported()) {
        throw new Error('當前環境不支援 WebAuthn（請使用 HTTPS 網址並透過 Chrome / Safari 開啟）');
    }
    if (!passphrase || !passphrase.trim()) {
        throw new Error('綁定指紋前請先驗證主通行碼');
    }

    // 確認目前記憶體金鑰已就緒且能與通行碼對應（支援 V1 與 V2）
    if (!_e2eeSessionKey || (!_e2eeSessionSaltB64 && !_e2eeSessionKeySlots)) {
        throw new Error('尚未解鎖 E2EE 金鑰');
    }
    const testEnv = _pendingEncryptedRemote?.envelope || _latestRemoteEnvelope;
    if (testEnv) {
        await decryptBackupPayload(testEnv, passphrase);
    } else if (Array.isArray(_e2eeSessionKeySlots)) {
        const masterSlot = _e2eeSessionKeySlots.find(s => s.id === 'master') || _e2eeSessionKeySlots[0];
        await unwrapDekFromSlot(masterSlot, passphrase, false);
    }

    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
    const userId = window.crypto.getRandomValues(new Uint8Array(16));
    const prfInput = await getBioPrfFixedInputBytes();
    const accLabel = (piAccount || 'weber').trim() || 'weber';

    const credential = await navigator.credentials.create({
        publicKey: {
            challenge,
            rp: {
                name: 'LifeSchedule 思緒卡片',
                id: window.location.hostname
            },
            user: {
                id: userId,
                name: `LifeSchedule (${accLabel})`,
                displayName: `LifeSchedule (${accLabel})`
            },
            pubKeyCredParams: [
                { type: 'public-key', alg: -7 },   // ES256
                { type: 'public-key', alg: -257 }  // RS256
            ],
            authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'required',
                residentKey: 'preferred'
            },
            timeout: 60000,
            extensions: {
                prf: {
                    eval: { first: prfInput }
                }
            }
        }
    });

    if (!credential || !credential.rawId) {
        throw new Error('使用者取消或裝置未回傳憑證');
    }

    const credIdB64Url = bufToB64Url(credential.rawId);
    const extResults = typeof credential.getClientExtensionResults === 'function'
        ? credential.getClientExtensionResults()
        : {};

    let prfOutputBuf = extResults?.prf?.results?.first || null;
    if (!prfOutputBuf && extResults?.prf?.enabled === true) {
        // 部分瀏覽器在 create 僅回傳 prf.enabled=true，需補一次 get 取得 PRF 輸出
        const assertChallenge = window.crypto.getRandomValues(new Uint8Array(32));
        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge: assertChallenge,
                allowCredentials: [{ type: 'public-key', id: new Uint8Array(credential.rawId) }],
                userVerification: 'required',
                timeout: 60000,
                extensions: {
                    prf: { eval: { first: prfInput } }
                }
            }
        });
        const assertExt = typeof assertion?.getClientExtensionResults === 'function'
            ? assertion.getClientExtensionResults()
            : {};
        prfOutputBuf = assertExt?.prf?.results?.first || null;
    }

    if (prfOutputBuf) {
        const wrapped = await wrapPassphraseWithPrf(passphrase, prfOutputBuf, credIdB64Url);
        localStorage.setItem(BIO_WRAPPED_SECRET_KEY, JSON.stringify(wrapped));
        localStorage.setItem(BIO_CRED_META_KEY, JSON.stringify({
            credIdB64Url,
            mode: 'prf',
            rpId: window.location.hostname,
            createdAt: Date.now()
        }));
        await clearBioIdb();
        return 'prf';
    }

    // 降級模式：WebAuthn userVerification 閘門 + IndexedDB non-extractable CryptoKey
    await saveSessionKeyToBioIdb(_e2eeSessionKey, _e2eeSessionSaltB64, _e2eeSessionIterations, _e2eeSessionKeySlots, _e2eeSessionVaultId);
    localStorage.removeItem(BIO_WRAPPED_SECRET_KEY);
    localStorage.setItem(BIO_CRED_META_KEY, JSON.stringify({
        credIdB64Url,
        mode: 'gate',
        rpId: window.location.hostname,
        createdAt: Date.now()
    }));
    return 'gate';
}

async function clearBiometricBinding(silent = false) {
    try { localStorage.removeItem(BIO_CRED_META_KEY); } catch (e) {}
    try { localStorage.removeItem(BIO_WRAPPED_SECRET_KEY); } catch (e) {}
    await clearBioIdb();
    updateBiometricSettingsUI();
    if (!silent && typeof showToast === 'function') {
        showToast('🗑️ 已移除此裝置的指紋 / Face ID 綁定。', 'info');
    }
}

async function promptBindBiometricFlow() {
    if (!isWebAuthnSupported()) {
        alert('❌ 當前瀏覽環境不支援 WebAuthn 生物辨識！\n請確認您是透過 HTTPS 線上網址，並使用手機系統瀏覽器（Chrome / Safari）開啟。');
        return;
    }
    if (!isE2eeEnabled()) {
        alert('請先啟用「端對端加密 (E2EE)」並設定主通行碼，再綁定指紋快速解鎖。');
        return;
    }
    // 要求輸入一次主通行碼以驗證並進行指紋綁定
    openE2eePassphraseModal(
        hasE2eeRemoteOrSession() ? 'unlock' : 'setup',
        async (_plainData, verifiedPassphrase) => {
            if (!verifiedPassphrase) {
                alert('⚠️ 請透過輸入主通行碼完成本次綁定驗證。');
                return;
            }
            try {
                const mode = await registerBiometricCredentialWithPassphrase(verifiedPassphrase);
                updateBiometricSettingsUI();
                const modeLabel = mode === 'prf'
                    ? 'WebAuthn PRF 硬體金鑰保護（最高安全等級）'
                    : '標準 WebAuthn 生物辨識 + IndexedDB 不可匯出金鑰（高相容模式）';
                alert(`🎉 指紋 / Face ID 綁定成功！\n\n安全模式：${modeLabel}\n💡 請務必妥善記憶主通行碼，換手機或清除瀏覽器資料時仍須使用主通行碼還原。`);
            } catch (err) {
                alert(`❌ 指紋綁定失敗：${err.message || '操作已取消'}`);
            }
        },
        null,
        '👆 請輸入一次主通行碼以驗證身分，驗證成功後將立即呼叫系統指紋 / Face ID 完成綁定。'
    );
}

// ---------- 指紋解鎖核心 ----------
async function authenticateWithBiometrics() {
    const meta = getBioCredentialMeta();
    if (!meta || !isWebAuthnSupported()) {
        throw new Error('尚未綁定指紋或當前環境不支援 WebAuthn');
    }
    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
    const credIdBytes = b64UrlToBytes(meta.credIdB64Url);
    const prfInput = await getBioPrfFixedInputBytes();

    const getOpts = {
        publicKey: {
            challenge,
            allowCredentials: [{ type: 'public-key', id: credIdBytes }],
            userVerification: 'required',
            timeout: 60000
        }
    };
    if (meta.mode === 'prf') {
        getOpts.publicKey.extensions = {
            prf: { eval: { first: prfInput } }
        };
    }

    const assertion = await navigator.credentials.get(getOpts);
    if (!assertion) {
        throw new Error('生物辨識驗證未完成');
    }

    if (meta.mode === 'prf') {
        const ext = typeof assertion.getClientExtensionResults === 'function'
            ? assertion.getClientExtensionResults()
            : {};
        const prfOutput = ext?.prf?.results?.first;
        if (!prfOutput) {
            throw new Error('裝置未回傳 PRF 金鑰結果，請改用主通行碼解鎖並重新綁定指紋');
        }
        const wrappedRaw = localStorage.getItem(BIO_WRAPPED_SECRET_KEY);
        if (!wrappedRaw) {
            throw new Error('找不到本機指紋包裹金鑰，請改用主通行碼解鎖');
        }
        const passphrase = await unwrapPassphraseWithPrf(JSON.parse(wrappedRaw), prfOutput);
        return { mode: 'prf', passphrase };
    }

    // gate 模式：從 IndexedDB 取出 non-extractable CryptoKey
    const rec = await loadSessionKeyFromBioIdb();
    if (!rec || !rec.aesKey || !rec.saltB64) {
        throw new Error('本機指紋金鑰快取已遺失，請改用主通行碼解鎖並重新綁定');
    }
    return {
        mode: 'gate',
        aesKey: rec.aesKey,
        saltB64: rec.saltB64,
        iterations: rec.iterations || E2EE_DEFAULT_ITERATIONS,
        keySlots: rec.keySlots || null,
        vaultId: rec.vaultId || ''
    };
}

// ---------- Local Vault (本機靜態資料加密 Encryption at Rest) ----------
function clearPlaintextLocalStorage() {
    const keysToClear = [
        'my_thoughts_local',
        'my_monthly_financials',
        'my_financial_templates',
        'my_blocked_slots',
        'my_category_order',
        'my_ai_privacy_config',
        'pi_api_key',
        'gas_api_key',
        'gemini_api_key'
    ];
    keysToClear.forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) {}
    });
}

function buildLocalVaultPlainObject() {
    return {
        _format: LOCAL_VAULT_FORMAT_ID,
        updatedAt: Date.now(),
        thoughts: Array.isArray(thoughts) ? thoughts : [],
        monthlyFinancials: monthlyFinancials || {},
        financialTemplates: financialTemplates || { active: [], passive: [], expenses: [] },
        blockedSlots: Array.isArray(blockedSlots) ? blockedSlots : [],
        categoryOrder: Array.isArray(categoryOrder) ? categoryOrder : [],
        aiPrivacyConfig: (typeof getAiPrivacyConfigForVault === 'function' ? getAiPrivacyConfigForVault() : undefined),
        apiKeys: {
            pi_api_key: _unlockedApiKeys.pi_api_key || piApiKey || '',
            gas_api_key: _unlockedApiKeys.gas_api_key || '',
            gemini_api_key: _unlockedApiKeys.gemini_api_key || ''
        }
    };
}

function persistEncryptedLocalVault() {
    if (!isAppLockEnabled() || !_e2eeSessionKey || !_e2eeSessionSaltB64) {
        return Promise.resolve(false);
    }
    _localVaultWriteChain = _localVaultWriteChain.then(async () => {
        if (!isAppLockEnabled() || !_e2eeSessionKey || !_e2eeSessionSaltB64) return false;
        const payload = buildLocalVaultPlainObject();
        const env = await encryptBackupWithKey(payload, _e2eeSessionKey, _e2eeSessionSaltB64, _e2eeSessionIterations);
        localStorage.setItem(LOCAL_VAULT_KEY, JSON.stringify(env));
        clearPlaintextLocalStorage();
        return true;
    }).catch((err) => {
        console.warn('[LocalVault] 加密寫入失敗:', err);
        return false;
    });
    return _localVaultWriteChain;
}

function applyDecryptedLocalVault(vaultData) {
    if (!vaultData || typeof vaultData !== 'object') return false;
    if (Array.isArray(vaultData.thoughts)) thoughts = vaultData.thoughts;
    if (vaultData.monthlyFinancials && typeof vaultData.monthlyFinancials === 'object') {
        monthlyFinancials = vaultData.monthlyFinancials;
    }
    if (vaultData.financialTemplates && typeof vaultData.financialTemplates === 'object') {
        financialTemplates = vaultData.financialTemplates;
    }
    if (Array.isArray(vaultData.blockedSlots)) blockedSlots = vaultData.blockedSlots;
    if (Array.isArray(vaultData.categoryOrder)) categoryOrder = vaultData.categoryOrder;
    if (vaultData.aiPrivacyConfig && typeof applyAiPrivacyConfigFromVault === 'function') {
        applyAiPrivacyConfigFromVault(vaultData.aiPrivacyConfig);
    }
    if (vaultData.apiKeys && typeof vaultData.apiKeys === 'object') {
        _unlockedApiKeys = {
            pi_api_key: (vaultData.apiKeys.pi_api_key || '').trim(),
            gas_api_key: (vaultData.apiKeys.gas_api_key || '').trim(),
            gemini_api_key: (vaultData.apiKeys.gemini_api_key || '').trim()
        };
        piApiKey = _unlockedApiKeys.pi_api_key;
    }
    return true;
}

async function decryptLocalVaultIfPresent() {
    if (!_e2eeSessionKey) return false;
    let raw = null;
    try { raw = localStorage.getItem(LOCAL_VAULT_KEY); } catch (e) { raw = null; }
    if (!raw) return false;
    const env = JSON.parse(raw);
    if (!isEncryptedEnvelope(env)) return false;
    const plain = await decryptBackupWithKey(env, _e2eeSessionKey);
    return applyDecryptedLocalVault(plain);
}

// ---------- App Lock 畫面控制與上鎖/解鎖流程 ----------
function showAppLockOverlay(msg = '') {
    const overlay = document.getElementById('appLockOverlay');
    if (!overlay) return;
    const bioBtn = document.getElementById('appLockBioBtn');
    const errEl = document.getElementById('appLockErrorText');
    const passInput = document.getElementById('appLockPassphraseInput');
    const remindEl = document.getElementById('appLockPassphraseReminder');
    if (bioBtn) {
        if (hasBioCredentialBound() && isWebAuthnSupported()) bioBtn.classList.remove('hidden');
        else bioBtn.classList.add('hidden');
    }
    if (errEl) {
        if (msg) {
            errEl.textContent = msg;
            errEl.classList.remove('hidden');
        } else {
            errEl.textContent = '';
            errEl.classList.add('hidden');
        }
    }
    if (passInput) passInput.value = '';
    if (remindEl) {
        if (isPassphraseReviewDue()) remindEl.classList.remove('hidden');
        else remindEl.classList.add('hidden');
    }
    overlay.classList.remove('hidden');
    updateHeaderLockButtonUI();
}

function hideAppLockOverlay() {
    const overlay = document.getElementById('appLockOverlay');
    if (overlay) overlay.classList.add('hidden');
    const passInput = document.getElementById('appLockPassphraseInput');
    if (passInput) passInput.value = '';
    updateHeaderLockButtonUI();
}

function wipeInMemorySensitiveDataForLock() {
    thoughts = [];
    monthlyFinancials = {};
    financialTemplates = { active: ['本業薪資'], passive: ['股息現金流'], expenses: ['日常固定開銷'] };
    blockedSlots = [];
    categoryOrder = [];
    _unlockedApiKeys = { pi_api_key: '', gas_api_key: '', gemini_api_key: '' };
    piApiKey = '';
    if (typeof wipeAiMemoryForLock === 'function') {
        wipeAiMemoryForLock();
    }
    render();
}

async function finishSessionUnlock(options = {}) {
    const { fromBiometric = false } = options;
    try {
        await decryptLocalVaultIfPresent();
    } catch (e) {
        // 若本機密文與當前金鑰不符（例如在別台換過密碼），先不中斷雲端解鎖
        console.warn('[LocalVault] 本機加密資料解密略過:', e);
    }
    hideAppLockOverlay();
    updateE2eeSettingsUI();
    updateBiometricSettingsUI();
    updateHeaderLockButtonUI();
    render();
    if (fromBiometric && isPassphraseReviewDue() && typeof showToast === 'function') {
        showToast('💡 已超過 14 天未手動輸入主通行碼，建議偶爾至設定驗證一次以免遺忘！', 'info');
    }
    if (typeof checkAndAutoSyncFromPi === 'function') {
        checkAndAutoSyncFromPi();
    }
}

async function unlockWithBiometricsInAppLock() {
    const bioBtn = document.getElementById('appLockBioBtn');
    const errEl = document.getElementById('appLockErrorText');
    if (errEl) errEl.classList.add('hidden');
    if (bioBtn) bioBtn.disabled = true;
    try {
        const authRes = await authenticateWithBiometrics();
        let vaultEnv = null;
        try {
            const rawVault = localStorage.getItem(LOCAL_VAULT_KEY);
            if (rawVault) vaultEnv = JSON.parse(rawVault);
        } catch (e) {}

        const targetEnv = vaultEnv || (_pendingEncryptedRemote && _pendingEncryptedRemote.envelope) || _latestRemoteEnvelope;

        if (authRes.mode === 'prf') {
            if (targetEnv && isEncryptedEnvelope(targetEnv)) {
                await decryptBackupPayload(targetEnv, authRes.passphrase);
            } else {
                await initializeV2SessionWithPassphrase(authRes.passphrase);
            }
        } else {
            // gate 模式
            if (targetEnv && isEncryptedEnvelope(targetEnv)) {
                await decryptBackupWithKey(targetEnv, authRes.aesKey);
            }
            _e2eeSessionKey = authRes.aesKey;
            _e2eeSessionSaltB64 = authRes.saltB64;
            _e2eeSessionIterations = authRes.iterations;
            _e2eeSessionKeySlots = authRes.keySlots || (targetEnv && targetEnv.version === 2 ? targetEnv.keySlots : null);
            _e2eeSessionVaultId = authRes.vaultId || (targetEnv && targetEnv.vaultId) || '';
        }
        await finishSessionUnlock({ fromBiometric: true });
    } catch (err) {
        if (errEl) {
            errEl.textContent = `❌ 指紋解鎖失敗：${err.message || '請改用主通行碼解鎖'}`;
            errEl.classList.remove('hidden');
        }
    } finally {
        if (bioBtn) bioBtn.disabled = false;
    }
}

async function unlockWithPassphraseInAppLock() {
    const passInput = document.getElementById('appLockPassphraseInput');
    const submitBtn = document.getElementById('appLockPassSubmitBtn');
    const errEl = document.getElementById('appLockErrorText');
    const pass = passInput ? passInput.value : '';
    if (!pass || !pass.trim()) {
        if (errEl) {
            errEl.textContent = '❌ 請輸入主通行碼或緊急回復碼！';
            errEl.classList.remove('hidden');
        }
        return;
    }
    if (errEl) errEl.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = true;

    try {
        let vaultEnv = null;
        try {
            const rawVault = localStorage.getItem(LOCAL_VAULT_KEY);
            if (rawVault) vaultEnv = JSON.parse(rawVault);
        } catch (e) {}

        const targetEnv = vaultEnv || (_pendingEncryptedRemote && _pendingEncryptedRemote.envelope) || _latestRemoteEnvelope;
        if (targetEnv && isEncryptedEnvelope(targetEnv)) {
            const decrypted = await decryptBackupPayload(targetEnv, pass);
            if (vaultEnv && targetEnv === vaultEnv) {
                applyDecryptedLocalVault(decrypted);
            }
        } else {
            await initializeV2SessionWithPassphrase(pass);
        }
        recordManualPassphraseUnlock();
        await finishSessionUnlock({ fromBiometric: false });
    } catch (err) {
        if (errEl) {
            errEl.textContent = '❌ 通行碼 / 回復碼錯誤或本機加密資料無法解開，請確認後重試！';
            errEl.classList.remove('hidden');
        }
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

async function unlockE2eeModalWithBiometrics() {
    const errEl = document.getElementById('e2eeModalErrorText');
    const bioBtn = document.getElementById('e2eeModalBioBtn');
    if (errEl) errEl.classList.add('hidden');
    if (bioBtn) bioBtn.disabled = true;
    try {
        const authRes = await authenticateWithBiometrics();
        const targetEnvelope = _e2eeModalCustomEnvelope || (_pendingEncryptedRemote && _pendingEncryptedRemote.envelope) || _latestRemoteEnvelope;

        if (!targetEnvelope) {
            throw new Error('找不到待解鎖的加密備份封套');
        }

        if (authRes.mode === 'prf') {
            const plainData = await decryptBackupPayload(targetEnvelope, authRes.passphrase);
            await completeE2eeModalUnlockSuccess(plainData, targetEnvelope, null);
        } else {
            const envSalt = typeof getEnvelopeSaltB64 === 'function' ? getEnvelopeSaltB64(targetEnvelope) : (targetEnvelope.kdf && targetEnvelope.kdf.salt);
            const sameVault = Boolean(authRes.vaultId && targetEnvelope.vaultId && authRes.vaultId === targetEnvelope.vaultId);
            if (!sameVault && envSalt && envSalt !== authRes.saltB64) {
                throw new Error('偵測到雲端備份使用了新的鹽值（可能已在其他裝置更換通行碼），請改用主通行碼解鎖並重新綁定指紋');
            }
            const plainData = await decryptBackupWithKey(targetEnvelope, authRes.aesKey);
            _e2eeSessionKey = authRes.aesKey;
            _e2eeSessionSaltB64 = authRes.saltB64;
            _e2eeSessionIterations = authRes.iterations;
            _e2eeSessionKeySlots = authRes.keySlots || (targetEnvelope.version === 2 ? targetEnvelope.keySlots : null);
            _e2eeSessionVaultId = authRes.vaultId || targetEnvelope.vaultId || '';
            await completeE2eeModalUnlockSuccess(plainData, targetEnvelope, null);
        }
        if (isPassphraseReviewDue() && typeof showToast === 'function') {
            showToast('💡 已超過 14 天未手動輸入主通行碼，建議偶爾驗證一次以免遺忘！', 'info');
        }
    } catch (err) {
        showE2eeModalError(`❌ 指紋解鎖失敗：${err.message || '請改輸入主通行碼'}`);
    } finally {
        if (bioBtn) bioBtn.disabled = false;
    }
}

// ---------- 最高防護切換與設定 UI ----------
async function onToggleAppLockSetting(checked) {
    if (checked) {
        if (!isE2eeEnabled()) {
            alert('⚠️ 請先啟用上方的「端對端加密 (E2EE)」並設定主通行碼，才能開啟最高防護（開頁鎖定 + 本機加密）！');
            updateBiometricSettingsUI();
            return;
        }
        if (!_e2eeSessionKey || !_e2eeSessionSaltB64) {
            alert('請先解鎖 E2EE 金鑰後再開啟最高防護。');
            updateBiometricSettingsUI();
            openE2eePassphraseModal(hasE2eeRemoteOrSession() ? 'unlock' : 'setup');
            return;
        }
        // 將當前記憶體中的敏感資料立即加密存入 ls_encrypted_local_vault 並清除明文
        _unlockedApiKeys = {
            pi_api_key: (localStorage.getItem('pi_api_key') || piApiKey || '').trim(),
            gas_api_key: (localStorage.getItem('gas_api_key') || '').trim(),
            gemini_api_key: (localStorage.getItem('gemini_api_key') || '').trim()
        };
        localStorage.setItem(APPLOCK_ENABLED_KEY, 'true');
        await persistEncryptedLocalVault();
        updateBiometricSettingsUI();
        updateHeaderLockButtonUI();
        alert('🛡️ 已開啟最高防護！\n\n1. 本機目標、財務收支與 API 金鑰已加密存於 ls_encrypted_local_vault，localStorage 明文已清除。\n2. 下次開啟頁面將先顯示鎖定畫面，需通過指紋或主通行碼才會載入內容。');
    } else {
        if (!confirm('⚠️ 確定要關閉「最高防護（開頁鎖定 + 本機加密）」嗎？\n關閉後本機資料將恢復以明文存於 localStorage（雲端備份仍維持 E2EE 加密）。')) {
            updateBiometricSettingsUI();
            return;
        }
        // 驗證主通行碼後再將本機資料寫回明文 localStorage
        openE2eePassphraseModal(
            'unlock',
            () => {
                localStorage.setItem(APPLOCK_ENABLED_KEY, 'false');
                try {
                    localStorage.setItem('my_thoughts_local', JSON.stringify(thoughts || []));
                    localStorage.setItem('my_monthly_financials', JSON.stringify(monthlyFinancials || {}));
                    localStorage.setItem('my_financial_templates', JSON.stringify(financialTemplates || {}));
                    localStorage.setItem('my_blocked_slots', JSON.stringify(blockedSlots || []));
                    localStorage.setItem('my_category_order', JSON.stringify(categoryOrder || []));
                    if (typeof getAiPrivacyConfigForVault === 'function') {
                        localStorage.setItem('my_ai_privacy_config', JSON.stringify(getAiPrivacyConfigForVault()));
                    }
                    localStorage.setItem('pi_api_key', _unlockedApiKeys.pi_api_key || piApiKey || '');
                    localStorage.setItem('gas_api_key', _unlockedApiKeys.gas_api_key || '');
                    localStorage.setItem('gemini_api_key', _unlockedApiKeys.gemini_api_key || '');
                    localStorage.removeItem(LOCAL_VAULT_KEY);
                } catch (e) {}
                updateBiometricSettingsUI();
                updateHeaderLockButtonUI();
                if (typeof showToast === 'function') {
                    showToast('已關閉最高防護並還原本機儲存。', 'info');
                }
            },
            null,
            '🔑 關閉最高防護屬於高風險變更，請輸入主通行碼完成二次驗證。'
        );
    }
}

function onChangeAppLockTimeout(val) {
    try {
        localStorage.setItem(APPLOCK_TIMEOUT_KEY, String(val));
    } catch (e) {}
}

function updateBiometricSettingsUI() {
    const bioBadge = document.getElementById('bioStatusBadge');
    const bindBtn = document.getElementById('bioBindBtn');
    const removeBtn = document.getElementById('bioRemoveBtn');
    const appLockToggle = document.getElementById('appLockEnableToggle');
    const timeoutSelect = document.getElementById('appLockTimeoutSelect');
    const remindBadge = document.getElementById('bioPassphraseRemindBadge');

    const meta = getBioCredentialMeta();
    const bound = hasBioCredentialBound();
    const supported = isWebAuthnSupported();

    if (bioBadge) {
        if (!supported) {
            bioBadge.textContent = '⛔ 不支援 WebAuthn (需 HTTPS 瀏覽器)';
            bioBadge.className = 'text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-600';
        } else if (bound && meta?.mode === 'prf') {
            bioBadge.textContent = '🟢 已綁定指紋 (PRF 硬體金鑰)';
            bioBadge.className = 'text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
        } else if (bound) {
            bioBadge.textContent = '🟡 已綁定指紋 (WebAuthn 閘門)';
            bioBadge.className = 'text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300';
        } else {
            bioBadge.textContent = '⚪ 尚未綁定此裝置指紋';
            bioBadge.className = 'text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-700';
        }
    }
    if (bindBtn) {
        bindBtn.disabled = !supported;
        bindBtn.textContent = bound ? '🔄 重新綁定此裝置指紋' : '👆 綁定此裝置指紋 / Face ID';
    }
    if (removeBtn) {
        if (bound) removeBtn.classList.remove('hidden');
        else removeBtn.classList.add('hidden');
    }
    if (appLockToggle) {
        appLockToggle.checked = isAppLockEnabled();
    }
    if (timeoutSelect) {
        timeoutSelect.value = String(getAppLockTimeoutMinutes());
    }
    if (remindBadge) {
        if (isPassphraseReviewDue()) remindBadge.classList.remove('hidden');
        else remindBadge.classList.add('hidden');
    }
}

function updateHeaderLockButtonUI() {
    const btn = document.getElementById('headerQuickLockBtn');
    if (!btn) return;
    if (isE2eeEnabled() && (_e2eeSessionKey || isAppLockEnabled())) {
        btn.classList.remove('hidden');
    } else {
        btn.classList.add('hidden');
    }
}

function handleVisibilityChangeForAutoLock() {
    if (document.visibilityState === 'hidden') {
        _lastHiddenAt = Date.now();
        return;
    }
    if (document.visibilityState === 'visible') {
        const timeoutMin = getAppLockTimeoutMinutes();
        if (isAppLockEnabled() && _e2eeSessionKey && timeoutMin >= 0 && _lastHiddenAt > 0) {
            const elapsedMs = Date.now() - _lastHiddenAt;
            if (timeoutMin === 0 || elapsedMs >= timeoutMin * 60 * 1000) {
                lockE2eeSession();
                return;
            }
        }
        if (!isAppLockActiveAndLocked() && typeof checkAndAutoSyncFromPi === 'function') {
            checkAndAutoSyncFromPi();
        }
    }
}

// ---------- 🙈 公共場所財務金額一鍵模糊遮罩 (Privacy Blur) ----------
const PRIVACY_BLUR_KEY = 'ls_privacy_blur';

function isPrivacyBlurEnabled() {
    try {
        return localStorage.getItem(PRIVACY_BLUR_KEY) === 'true';
    } catch (e) {
        return false;
    }
}

function applyPrivacyBlurState() {
    const enabled = isPrivacyBlurEnabled();
    if (document.body) {
        document.body.classList.toggle('ls-privacy-blur', enabled);
    }
    const btn = document.getElementById('headerPrivacyBlurBtn');
    const iconEl = document.getElementById('headerPrivacyBlurIcon');
    const textEl = document.getElementById('headerPrivacyBlurText');
    if (btn) {
        if (enabled) {
            btn.className = 'text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer';
            if (iconEl) iconEl.textContent = '🙈';
            if (textEl) textEl.textContent = '金額已遮罩';
        } else {
            btn.className = 'text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-300 font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer';
            if (iconEl) iconEl.textContent = '👁️';
            if (textEl) textEl.textContent = '遮罩金額';
        }
    }
}

function togglePrivacyBlur() {
    const next = !isPrivacyBlurEnabled();
    try {
        localStorage.setItem(PRIVACY_BLUR_KEY, String(next));
    } catch (e) {}
    applyPrivacyBlurState();
    if (typeof showToast === 'function') {
        showToast(next ? '🙈 已開啟財務金額模糊遮罩（公共場所防窺）' : '👁️ 已恢復顯示財務金額', 'info');
    }
}

// ---------- 📱 手機單手快速記一筆浮動按鈕 (Mobile FAB) ----------
function openMobileQuickAddThought() {
    if (typeof isAppLockActiveAndLocked === 'function' && isAppLockActiveAndLocked()) return;
    if (typeof isFormOpen !== 'undefined' && !isFormOpen && typeof toggleForm === 'function') {
        toggleForm();
    }
    const input = document.getElementById('thoughtInput');
    if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => input.focus(), 180);
    } else if (typeof scrollToPageTop === 'function') {
        scrollToPageTop();
    }
}

