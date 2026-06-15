# Nico Portfolio — 林姿余 作品集網站

報紙風格（1930–60 西方報業排版）的個人作品集，含前台展示與後台管理。

## 技術

- **前端**：React + Vite、React Router、Tailwind CSS v4、Framer Motion、Lenis（平滑捲動）、Zustand
- **後端**：Express（本地開發）／ Vercel Serverless Functions（線上）
- **資料庫**：Turso（libSQL）
- **圖片**：本地 `client/public/images`（之後可改 Cloudinary）

## 本地開發

```bash
npm run install:all          # 安裝根/前/後端依賴
# 後端（port 3001）
cd server && PORT=3001 node server.js
# 前端（port 5173）
cd client && npm run dev
```

種子資料：

```bash
npm run seed:admin           # 建立後台管理員
npm run seed:works:local     # 匯入作品（本地圖片路徑）
```

## 部署（Vercel）

1. 於 vercel.com 匯入此 GitHub repo（Root Directory 保持 repo 根目錄）。
2. 設定環境變數：
   - `TURSO_URL`
   - `TURSO_AUTH_TOKEN`
3. 部署。前端為 `client/dist`，API 由 `/api/v1/*` serverless functions 提供。

## 頁面

| 路徑 | 說明 |
|------|------|
| `/` | 首頁（報紙頭版 + 各類預覽） |
| `/about` | 關於我 |
| `/works` | 作品集（電繪・油畫・粉彩・原子筆・IP・海報） |
| `/exhibition` | 畢業展覽（大學・高中） |
| `/packaging` | 包裝設計（沙卡里巴・神福雞蛋盒） |
| `/contact` | 聯絡 |
| `/admin` | 後台管理 |
