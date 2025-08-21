# Dave AI 新聞推送頁面

啟動 python -m http.server 3000 後，在瀏覽器中訪問 http://localhost:3000 即可。

一個簡潔優雅的新聞展示頁面，採用 Apple 設計風格，從 Supabase 數據庫獲取新聞數據。

## 功能特色

- 🍎 **Apple 風格設計** - 簡潔、現代的用戶界面
- 📱 **響應式設計** - 完美適配桌面和移動設備
- 🔄 **實時更新** - 自動從 Supabase 獲取最新新聞
- 🏷️ **分類篩選** - 支持按新聞分類瀏覽
- ⚡ **快速載入** - 優化的載入體驗
- 🎨 **視覺效果** - 流暢的動畫和過渡效果

## 文件結構

```
新聞推送頁面/
├── index.html          # 主頁面
├── styles.css          # 樣式文件
├── script.js           # 主要 JavaScript 邏輯
├── config.js           # Supabase 配置文件
├── README.md           # 說明文件
└── tests/              # 測試文件夾
    ├── test_data_load.html      # 數據加載測試
    ├── test_data_load.js        # 數據加載測試腳本
    ├── test_event_id.html       # 事件ID測試
    ├── test_refresh_animation.html  # 刷新動畫測試
    ├── test_sentiment.html      # 情感標籤測試
    ├── test_timezone.html       # 時區顯示測試
    ├── test_ui_toggle.html      # UI切換測試
    └── typewriter_demo.html     # 打字機效果演示
```

## 測試文件

`tests/` 文件夾包含各種功能的測試頁面：
- **數據加載測試** - 測試 Supabase 數據獲取功能
- **動畫效果測試** - 測試刷新動畫和打字機效果
- **UI組件測試** - 測試情感標籤、時區顯示等組件
- **交互功能測試** - 測試主題切換、事件處理等功能

訪問測試頁面：`http://localhost:3000/tests/文件名.html`

## 快速開始

### 1. 配置 Supabase

1. 複製配置模板文件：
   ```bash
   cp config.example.js config.js
   ```

2. 編輯 `config.js` 文件：
   - 替換 `YOUR_SUPABASE_URL_HERE` 為您的 Supabase 項目 URL
   - 替換 `YOUR_ANON_KEY_HERE` 為您的 Supabase 匿名密鑰
   - 確認表名稱正確

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',
    anonKey: '您的實際匿名密鑰',
    tableName: 'your_table_name'
};
```

⚠️ **安全注意事項**: `config.js` 文件包含敏感信息，已被 `.gitignore` 排除，請勿提交到版本控制系統。

### 2. 獲取 Supabase 匿名密鑰

1. 登入 [Supabase 控制台](https://supabase.com/dashboard)
2. 選擇您的項目
3. 前往 Settings > API
4. 複製 "anon public" 密鑰

### 3. 運行頁面

1. 使用本地服務器打開 `index.html`
2. 或直接在瀏覽器中打開文件

## 數據庫表結構

頁面期望 `n8n_CLS_news` 表包含以下字段：

| 字段名 | 類型 | 說明 |
|--------|------|------|
| id | integer | 主鍵 |
| title | text | 新聞標題 |
| summary | text | 新聞摘要 |
| content | text | 新聞內容 |
| category | text | 新聞分類 |
| source | text | 新聞來源 |
| created_at | timestamp | 創建時間 |

## 自定義配置

### 修改新聞分類

在 `script.js` 中的 `getCategoryColor` 函數中添加或修改分類：

```javascript
const colors = {
    '科技': '#007aff',
    '環境': '#34c759',
    '金融': '#ff9500',
    // 添加新分類
    '體育': '#ff3b30'
};
```

### 調整載入數量

在 `config.js` 中修改 `queryConfig.limit`：

```javascript
queryConfig: {
    limit: 30, // 每次載入 30 條新聞
}
```

### 修改自動刷新間隔

在 `script.js` 底部修改：

```javascript
// 每10分鐘自動刷新一次
setInterval(loadNews, 10 * 60 * 1000);
```

## 故障排除

### 新聞無法載入

1. 檢查 Supabase 配置是否正確
2. 確認匿名密鑰有效
3. 檢查表名稱和字段名稱
4. 查看瀏覽器控制台錯誤信息

### 樣式顯示異常

1. 確認所有 CSS 文件正確載入
2. 檢查網絡連接（Google Fonts）
3. 清除瀏覽器緩存

### 模擬數據模式

如果 Supabase 連接失敗，頁面會自動使用模擬數據。這對於開發和測試很有用。

## 瀏覽器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 技術棧

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **後端**: Supabase (PostgreSQL)
- **樣式**: 自定義 CSS (Apple 風格)
- **字體**: SF Pro Display (Apple 系統字體)

## 許可證

此項目僅供學習和個人使用。

## 更新日誌

### v1.0.0 (2024-01-15)
- 初始版本發布
- Apple 風格設計
- Supabase 集成
- 響應式布局
- 自動刷新功能