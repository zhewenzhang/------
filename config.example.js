// Supabase 配置文件模板
// 請複製此文件為 config.js 並填入您的實際 Supabase 項目信息

const SUPABASE_CONFIG = {
    // Supabase 項目 URL
    // 從 Supabase 控制台的 Settings > API 頁面獲取
    url: 'YOUR_SUPABASE_URL_HERE',
    
    // Supabase 匿名密鑰 (anon key)
    // 請從 Supabase 控制台的 Settings > API 頁面獲取
    anonKey: 'YOUR_ANON_KEY_HERE',
    
    // 數據表名稱
    tableName: 'your_table_name',
    
    // 數據庫查詢配置
    queryConfig: {
        // 每次載入的數據數量
        limit: 20,
        
        // 排序字段
        orderBy: 'rtime',
        
        // 排序方向 (true: 升序, false: 降序)
        ascending: false
    }
};  

// 導出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
} else {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}