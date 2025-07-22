// Supabase 配置文件
// 請將此文件中的配置信息替換為您的實際 Supabase 項目信息

const SUPABASE_CONFIG = {
    // Supabase 項目 URL
    url: 'https://uwvlduprxppwdkjkvwby.supabase.co',
    
    // Supabase 匿名密鑰 (anon key)
    // 請從 Supabase 控制台的 Settings > API 頁面獲取
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3dmxkdXByeHBwd2Rramt2d2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NDYxMTMsImV4cCI6MjA2NTUyMjExM30.IT_7wL-0Buf1iyGKI1cw2PY0GtlKFljFiNOVYBvA_o0',
    
    // 測試表名稱 (使用實際存在的n8n_cls_news表進行測試)
    tableName: 'n8n_cls_news',
    
    // 數據庫查詢配置
    queryConfig: {
        // 每次載入的數據數量
        limit: 20,
        
        // 排序字段 (n8n_CLS_news表中使用rtime)
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