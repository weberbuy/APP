# Workspace Development & Deployment Rules

本檔案定義本專案（WordChecking、MathChecking 等）發布前的必備內部測試流程與品質規範。

---

## 🚀 發布前內部測試鐵律（Pre-flight Testing Protocol）

在執行任何 `git commit`、`git push` 或同步至 Google 雲端硬碟之前，**必須依序通過以下內部自動化測試**，確保網頁 100% 可正常載入，絕不發布有問題的版本：

### 1. 語法與字串完整性自動檢測（Pre-flight Syntax Check）
所有前端 SPA 網頁皆包含大量模板字串（Template Literals，如 SVG 與語音資料）。每次修改後必須自動執行：
```powershell
& 'C:\Users\weber\AppData\Roaming\Antigravity\bin\agy-node.cmd' "d:\weber\APP\scripts\preflight_check.js" "d:\weber\APP\WordChecking\WordChecking.html"
```
**驗證項目**：
- 所有 `<script>` 區塊內 JavaScript 語法是否完全正確（無 SyntaxError）。
- 反引號（Backtick `` ` ``）與大括號（`{}`）配對是否成雙，杜絕任何未閉合模板字串。

### 2. 本地預覽載入測試（Local Browser Launch Test）
在推送前，呼叫系統預設瀏覽器（Edge）載入本地檔案進行渲染驗證：
```powershell
Start-Process "msedge.exe" "file:///d:/weber/APP/WordChecking/WordChecking.html"
```
確認控制台無未捕獲之 JavaScript 例外、DOM 初始化與事件綁定順暢。

### 3. 同步原則
- 只有當上述測試 **100% 通過（Exit Code 0）** 時，才允許：
  1. 同步檔案至 Google Drive。
  2. `git add`、`git commit` 並 `git push origin main` 觸發 Cloudflare Pages 自動部署。
- 若測試未通過，**嚴禁發布**，必須在本地修正完成並通過檢測後方可推進。
