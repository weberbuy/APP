# Workspace Development & Deployment Rules

本檔案定義本專案（WordChecking、MathChecking 等）發布前的全方位自動化安全防禦體系與品質規範。

---

## 🚀 發布前內部測試四大防線鐵律（Pre-flight Four-Defense Protocol）

在執行任何 `git commit`、`git push` 或同步至 Google 雲端硬碟之前，**必須依序 100% 通過以下四大防線自動化實機檢測**，杜絕任何有問題或開頁卡死的版本發布：

---

### 🛡️ 防線一：靜態語法與模板字串完整性自動檢測（Syntax & Template Integrity）
- **核心目標**：檢測所有 `<script>` 區塊內 JavaScript 語法是否完全正確（0 SyntaxError）。
- **關鍵檢驗**：
  1. 所有模板字串反引號（Backtick `` ` ``）與大括號（`{}`）配對必須成雙成對，杜絕未閉合或漏引號。
  2. 杜絕非法識別碼、未閉合標籤或引號外溢。

---

### 🛡️ 防線二：全量程式碼整檔安全寫入（Full-Payload Direct Sync，杜絕局部替換錯位）
- **核心原則**：對於千行以上之龐大 HTML 單檔系統（如 WordChecking.html、MathChecking.html），**嚴格禁止使用 AI 模糊語意搜尋在線上進行局部區段替換**（極易因相似字串比對錯誤而將 JS 邏輯誤插進 HTML 標籤區塊內，破壞 DOM 結構）。
- **安全流程**：
  1. 一律在環境中完成模組構建與全域檢驗後，使用完整全量寫入方式更新檔案，確保結構 100% 乾淨完整。
  2. 嚴禁產生無效殘留的臨時腳本或半成品。

---

### 🛡️ 防線三：開頁生命週期實機模擬運行（Runtime Execution Check，杜絕載入卡死）
- **核心原則**：**嚴格禁止僅依賴靜態檢查（如 `node --check`）**，因其只解析語法樹，無法捕捉執行階段錯誤（Runtime Exception）與開頁卡死問題。
- **實機模擬流程**：
  1. 建立虛擬環境（Mock `window`、`document`、`localStorage`、`fetch`、`SpeechSynthesis`、`Audio` 等）。
  2. 實機觸發 `DOMContentLoaded` 事件，完整運行核心開頁函式（例如 WordChecking 的 `initTheme()`、`loadThemeData()`、`updateCatGrowthUI()`、`renderStats()` 等；MathChecking 的題庫初始化函式）。
  3. 確保開頁生命週期 **0 Runtime Exception** 順暢走完。

---

### 🛡️ 防線四：開頁 DOM 元件與數據斷言（DOM Integrity Assertions）
- **核心指標**：開頁模擬執行完成後，自動化斷言檢查關鍵 UI 元素與數據節點，拒絕白屏或空數據：
  1. 題庫 / 詞庫下拉選單（`themeSelect`）必須成功掛載選項且長度 > 0。
  2. 核心統計與狀態節點（如總數、進度等）必須正確渲染數值，而非空白或 `NaN`。
  3. 主導航與模式切換邏輯健全無阻。

---

## ⚡ 實機檢驗執行命令

每次代碼修改完成後，發布前必須在命令列執行通用測試腳本：

```powershell
& 'C:\Users\weber\AppData\Roaming\Antigravity\bin\agy-node.cmd' "d:\weber\APP\scripts\preflight_check.js" "d:\weber\APP\WordChecking\WordChecking.html"
```

若涉及 `MathChecking` 亦同：
```powershell
& 'C:\Users\weber\AppData\Roaming\Antigravity\bin\agy-node.cmd' "d:\weber\APP\scripts\preflight_check.js" "d:\weber\APP\MathChecking\MathChecking.html"
```

---

## 🛑 檢討與違規防範（最高交付紀律）

1. **嚴禁空口承諾**：嚴格禁止「只用肉眼推演邏輯、未真正調用命令列工具執行實機檢驗」即向使用者回報成功。
2. **零容忍中斷機制**：檢驗若發現任何語法錯誤、開頁例外或 DOM 斷言失敗，**一律嚴禁發布**。必須在本地背景立即修正，並重新執行四大防線檢驗，直至命令列驗證 **100% 通過（Exit Code 0）**，方可：
   - 同步至 Google Drive
   - `git commit` 並 `git push origin main`
   - 向使用者回報交付完成
