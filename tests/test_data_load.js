// 從配置文件獲取 Supabase 設置
const config = window.SUPABASE_CONFIG;

// 初始化 Supabase 客戶端
let supabase;
if (config && config.url && config.anonKey && config.anonKey !== 'YOUR_ANON_KEY_HERE') {
    supabase = window.supabase.createClient(config.url, config.anonKey);
    console.log('Supabase 客戶端初始化成功');
} else {
    console.error('Supabase 配置不完整或匿名密鑰未設置。請檢查 config.js');
    document.getElementById('newsList').innerHTML = '<p class="error">Supabase 配置錯誤，無法載入數據。</p>';
}

// DOM 元素
const newsListElement = document.getElementById('newsList');
const logDisplayElement = document.getElementById('logDisplay');

// 顯示日誌信息到頁面
function displayLog(message) {
    if (logDisplayElement) {
        const timestamp = new Date().toLocaleTimeString();
        logDisplayElement.innerHTML += `[${timestamp}] ${message}\n`;
        logDisplayElement.scrollTop = logDisplayElement.scrollHeight; // 滾動到底部
    }
    console.log(message); // 同時輸出到控制台
}

// formatDateToBeijingTime 函數已移至 ../js/utils.js

// createNewsItemHTML 函數已移至 ../js/utils.js

// 從 Supabase 獲取新聞數據並顯示
async function fetchAndDisplayNews() {
    if (!supabase) {
        return;
    }

    try {
        const queryTime = new Date();
        const queryTimeString = queryTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
        
        newsListElement.innerHTML = '<p class="loading">正在載入新聞...</p>';
        displayLog(`=== 查詢開始時間: ${queryTimeString} ===`);
        displayLog('開始從 Supabase 獲取最新新聞...');
        displayLog(`配置：表名 - ${config.tableName}, 排序字段 - rtime, 排序方向 - 降序, 限制數量 - 20`);
        
        // 首先檢查數據庫中最新的rtime
        displayLog('正在檢查數據庫中最新的數據時間...');
        const { data: latestData, error: latestError } = await supabase
            .from(config.tableName)
            .select('rtime')
            .not('rtime', 'is', null)
            .order('rtime', { ascending: false })
            .limit(1);

        if (latestError) {
            displayLog(`檢查最新數據時發生錯誤: ${latestError.message}`);
        } else if (latestData && latestData.length > 0) {
            displayLog(`數據庫中最新的rtime: ${latestData[0].rtime}`);
            displayLog(`最新數據時間（北京時間）: ${formatDateToBeijingTime(latestData[0].rtime)}`);
        } else {
            displayLog('數據庫中沒有找到任何數據');
        }

        // 獲取最新的20條新聞數據 - 從 n8n_CLS_news 表獲取新聞數據
        displayLog('正在獲取最新的20條新聞數據...');
        const { data, error } = await supabase
            .from(config.tableName)
            .select('id, title, content, link, rtime, tag')
            .not('rtime', 'is', null)  // 過濾掉rtime為null的記錄
            .order('rtime', { ascending: false })  // 明確指定按rtime降序排列
            .limit(20);

        if (error) {
            displayLog(`Supabase 查詢錯誤: ${error.message}`);
            newsListElement.innerHTML = `<p class="error">載入數據失敗: ${error.message}</p>`;
            return;
        }

        // 輸出完整的原始數據到控制台進行調試
        console.log('=== 完整的原始數據 ===');
        console.log('數據數量:', data ? data.length : 0);
        console.log('完整數據:', data);
        if (data && data.length > 0) {
            console.log('第一條記錄的完整內容:', data[0]);
            console.log('所有字段名稱:', Object.keys(data[0]));
        }
        displayLog('獲取到的原始數據已在控制台輸出。');
        
        if (data && data.length > 0) {
            displayLog(`成功從數據庫加載 ${data.length} 條新聞。`);
            displayLog(`數據已按 'rtime' 字段降序排序。`);
            displayLog(`已抓取最新的 ${data.length} 筆數據。`);
            
            // 顯示表的實際字段結構
            const firstRecord = data[0];
            const availableFields = Object.keys(firstRecord);
            displayLog('表中實際存在的字段: ' + availableFields.join(', '));
            
            displayLog('第一條新聞的rtime值: ' + firstRecord.rtime);
            displayLog('第一條新聞的rtime（北京時間）: ' + formatDateToBeijingTime(firstRecord.rtime));
            
            // 檢查source字段是否存在
            if (firstRecord.hasOwnProperty('source')) {
                displayLog('第一條新聞的source值: ' + firstRecord.source);
            } else {
                displayLog('注意：source字段不存在於此表中');
            }
            
            // 檢查title字段是否存在
            if (firstRecord.hasOwnProperty('title')) {
                displayLog('第一條新聞的標題: ' + firstRecord.title);
            } else {
                displayLog('注意：title字段不存在於此表中');
            }
            
            displayLog('所有執行記錄已完成。');

            newsListElement.innerHTML = ''; // 清空載入提示
            data.forEach(news => {
                newsListElement.innerHTML += createNewsItemHTML(news, { includeAIAnalysis: false });
            });
        } else {
            newsListElement.innerHTML = '<p>沒有找到任何新聞。</p>';
            displayLog('Supabase 沒有返回任何新聞數據。');
            displayLog('所有執行記錄已完成。');
        }
    } catch (error) {
        displayLog(`獲取新聞數據時發生錯誤: ${error.message}`);
        newsListElement.innerHTML = `<p class="error">發生未知錯誤: ${error.message}</p>`;
    }
}

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', () => {
    // 頁面加載完成後立即獲取數據
    logDisplayElement.innerHTML = '';
    displayLog('=== 頁面載入開始 ===');
    displayLog('正在初始化數據載入...');
    fetchAndDisplayNews();
    const refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            // 清空之前的日誌
            logDisplayElement.innerHTML = '';
            displayLog('=== 手動刷新數據開始 ===');
            displayLog('正在重新載入數據...');
            fetchAndDisplayNews();
        });
    }
    
    // 添加定時刷新功能（每5分鐘自動刷新一次）
    setInterval(() => {
        displayLog('=== 自動刷新開始（每5分鐘） ===');
        fetchAndDisplayNews();
    }, 5 * 60 * 1000); // 5分鐘 = 5 * 60 * 1000 毫秒
    
    displayLog('頁面初始化完成，已設置5分鐘自動刷新');
});