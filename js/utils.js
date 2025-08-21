/**
 * 公共工具函數庫
 * 包含專案中重複使用的函數，避免代碼重複
 */

/**
 * Supabase 客戶端初始化
 * @param {Object} config - Supabase 配置對象
 * @param {string} config.url - Supabase URL
 * @param {string} config.anonKey - Supabase 匿名密鑰
 * @returns {Object|null} Supabase 客戶端實例或null
 */
function initializeSupabase(config) {
    if (!config || !config.url || !config.anonKey) {
        console.error('❌ Supabase 配置無效');
        return null;
    }
    
    try {
        const client = window.supabase.createClient(config.url, config.anonKey);
        console.log('✅ Supabase 客戶端初始化成功');
        return client;
    } catch (error) {
        console.error('❌ Supabase 客戶端初始化失敗:', error);
        return null;
    }
}

/**
 * 將UTC時間轉換為北京時間並格式化
 * @param {string} utcDateString - UTC時間字符串
 * @param {boolean} includeTime - 是否包含時間部分，默認為false
 * @returns {string} 格式化後的北京時間
 */
function formatDateToBeijingTime(utcDateString, includeTime = false) {
    if (!utcDateString) return '';
    
    const date = new Date(utcDateString);
    if (isNaN(date.getTime())) {
        console.error('無效的日期字符串:', utcDateString);
        return '';
    }

    // 使用 toLocaleString 方法並指定時區
    const beijingTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    const year = beijingTime.getFullYear();
    const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
    const day = String(beijingTime.getDate()).padStart(2, '0');
    
    if (includeTime) {
        const hours = String(beijingTime.getHours()).padStart(2, '0');
        const minutes = String(beijingTime.getMinutes()).padStart(2, '0');
        const seconds = String(beijingTime.getSeconds()).padStart(2, '0');
        return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
    }
    
    return `${year}年${month}月${day}日`;
}

/**
 * 創建新聞條目HTML
 * @param {Object} news - 新聞數據對象
 * @param {Object} options - 配置選項
 * @returns {string} 新聞條目HTML字符串
 */
function createNewsItemHTML(news, options = {}) {
    console.log('🔍 创建新闻项目:', news);
    
    // 處理時間格式
    const dateTime = options.useRtime ? 
        formatDateToBeijingTime(news.rtime, true) : 
        formatNewsDateTime(news.created_at, news.time);
    
    const title = news.title || '無標題';
    const source = news.tag || '未知來源';
    const content = news.content || '無內容描述';
    
    // 確保news.id存在
    const newsId = news.id || Math.floor(Math.random() * 10000);
    console.log('🔍 使用的newsId:', newsId);
    
    // 根據選項決定是否包含AI分析功能
    if (options.includeAIAnalysis) {
        const mood = news.mood || '';
        const relation = news.relation || '';
        const analyze = news.analyze || '';
        const hasAIData = mood || relation || analyze;
        
        const tagsHTML = createTagsHTML ? createTagsHTML(news.tag) : `<span class="tag">#${source}</span>`;
        
        return `
            <div class="news-item" data-news-id="${newsId}">
                <h2>${title}</h2>
                <div class="news-meta">
                    <span>${dateTime}</span>
                    ${tagsHTML}
                </div>
                <p>${content}</p>
                ${hasAIData ? `
                <div class="ai-analysis-section">
                    <button class="ai-analysis-btn" data-news-id="${newsId}">
                        <span class="ai-icon">✨</span>
                        <span class="ai-text">AI 智能分析</span>
                        <span class="ai-arrow">▼</span>
                    </button>
                    <div class="ai-analysis-content" id="ai-content-${newsId}" style="display: none;">
                        <!-- AI分析内容将通过showAIAnalysisWithTypewriter函数动态生成 -->
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    } else {
        // 簡化版本，用於測試頁面
        return `
            <div class="news-item">
                <h2>${title}</h2>
                <div class="news-meta">
                    <span>來源: ${source}</span> |
                    <span>發布時間: ${dateTime}</span>
                    ${news.category ? `| <span>分類: ${news.category}</span>` : ''}
                    ${news.tag ? `| <span>標籤: #${news.tag}</span>` : ''}
                </div>
                <p>${content}</p>
            </div>
        `;
    }
}

/**
 * 顯示日誌信息到頁面（如果存在日誌顯示元素）
 * @param {string} message - 日誌消息
 */
function displayLog(message) {
    const logDisplayElement = document.getElementById('logDisplay');
    if (logDisplayElement) {
        const timestamp = new Date().toLocaleTimeString();
        logDisplayElement.innerHTML += `[${timestamp}] ${message}\n`;
        logDisplayElement.scrollTop = logDisplayElement.scrollHeight; // 滾動到底部
    }
    console.log(message); // 同時輸出到控制台
}

/**
 * 安全的元素查找函數
 * @param {string} selector - CSS選擇器
 * @returns {Element|null} DOM元素或null
 */
function safeQuerySelector(selector) {
    try {
        return document.querySelector(selector);
    } catch (error) {
        console.error(`查找元素失敗: ${selector}`, error);
        return null;
    }
}

/**
 * 安全的元素查找函數（多個元素）
 * @param {string} selector - CSS選擇器
 * @returns {NodeList} DOM元素列表
 */
function safeQuerySelectorAll(selector) {
    try {
        return document.querySelectorAll(selector);
    } catch (error) {
        console.error(`查找元素失敗: ${selector}`, error);
        return [];
    }
}

/**
 * 主題切換函數
 * 在深色和淺色主題之間切換
 * @param {Object} options - 配置選項
 * @param {boolean} options.updateChart - 是否更新圖表主題
 */
function toggleTheme(options = {}) {
    // 獲取當前主題，如果沒有則默認為light
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    // 切換主題
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    
    // 如果需要更新圖表主題（用於world-events頁面）
    if (options.updateChart && typeof updateChartTheme === 'function') {
        updateChartTheme();
    }
    
    console.log(`🎨 主題已切換至: ${currentTheme}`);
}

/**
 * 更新世界時間顯示
 * 支持多個時區的時間顯示更新
 */
function updateWorldTime() {
    const now = new Date();
    const timeZones = document.querySelectorAll('.time-zone');
    
    if (timeZones.length === 0) {
        // 如果沒有時區元素，靜默返回
        return;
    }
    
    timeZones.forEach(zone => {
        const timezone = zone.getAttribute('data-timezone');
        const dateElement = zone.querySelector('.time-date');
        const clockElement = zone.querySelector('.time-clock');
        
        if (!dateElement || !clockElement) {
            console.warn(`時區 ${timezone} 缺少日期或時間元素`);
            return;
        }
        
        try {
            // 獲取指定時區的時間
            const timeInZone = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
            
            // 格式化日期 (MM/DD)
            const month = (timeInZone.getMonth() + 1).toString().padStart(2, '0');
            const day = timeInZone.getDate().toString().padStart(2, '0');
            const dateStr = `${month}/${day}`;
            
            // 格式化時間 (HH:MM:SS)
            const hours = timeInZone.getHours().toString().padStart(2, '0');
            const minutes = timeInZone.getMinutes().toString().padStart(2, '0');
            const seconds = timeInZone.getSeconds().toString().padStart(2, '0');
            const timeStr = `${hours}:${minutes}:${seconds}`;
            
            // 更新顯示
            dateElement.textContent = dateStr;
            clockElement.textContent = timeStr;
        } catch (error) {
            console.error(`更新時區 ${timezone} 時間失敗:`, error);
        }
    });
}

/**
 * 打字機效果函數
 * 模擬打字機逐字顯示文本的效果
 * @param {string|Element} elementId - 目標元素ID或元素對象
 * @param {string} text - 要顯示的文本
 * @param {number} speed - 打字速度（毫秒）
 * @param {boolean} isHTML - 是否為HTML內容
 */
function typeWriterEffect(elementId, text, speed = 80, isHTML = false) {
    try {
        console.log(`⌨️ 開始打字機效果: ${elementId}`);
        
        const element = typeof elementId === 'string' ? 
            document.getElementById(elementId) : elementId;
        
        if (!element) {
            console.error('❌ 找不到元素:', elementId);
            return;
        }
        
        // 清空元素內容
        element.innerHTML = '';
        element.style.minHeight = '20px'; // 確保有最小高度
        
        let i = 0;
        const textLength = text.length;
        
        // 添加光標動畫樣式（如果還沒有）
        if (!document.querySelector('#typewriter-styles')) {
            const style = document.createElement('style');
            style.id = 'typewriter-styles';
            style.textContent = `
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
                .typewriter-cursor {
                    animation: blink 1s infinite;
                    color: #007bff;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(style);
        }
        
        function typeChar() {
            if (i < textLength) {
                if (isHTML) {
                    element.innerHTML = text.substring(0, i + 1) + '<span class="typewriter-cursor">|</span>';
                } else {
                    element.textContent = text.substring(0, i + 1);
                    element.innerHTML += '<span class="typewriter-cursor">|</span>';
                }
                i++;
                setTimeout(typeChar, speed);
            } else {
                // 移除光標
                const cursor = element.querySelector('.typewriter-cursor');
                if (cursor) {
                    cursor.remove();
                }
                console.log('✅ 打字機效果完成');
            }
        }
        
        typeChar();
    } catch (error) {
        console.error('❌ 打字機效果錯誤:', error);
    }
}

/**
 * 設置AI分析事件委托
 * 使用事件委托處理動態生成的AI分析按鈕點擊事件
 */
function setupAIAnalysisEventDelegation() {
    // 使用事件委托處理AI分析按鈕點擊
    document.addEventListener('click', (e) => {
        if (e.target.closest('.ai-analysis-btn')) {
            const button = e.target.closest('.ai-analysis-btn');
            const newsId = button.getAttribute('data-news-id');
            
            console.log('🔍 點擊了AI分析按鈕:', {
                button: button,
                newsId: newsId,
                buttonAttributes: Array.from(button.attributes).map(attr => `${attr.name}=${attr.value}`).join(', ')
            });
            
            if (newsId && newsId !== 'null' && newsId !== 'undefined') {
                // 調用toggleAIAnalysis函數（需要在使用此函數的頁面中定義）
                if (typeof toggleAIAnalysis === 'function') {
                    toggleAIAnalysis(newsId);
                } else {
                    console.error('❌ toggleAIAnalysis函數未定義');
                }
            } else {
                console.error('❌ 無效的newsId:', newsId);
            }
        }
    });
    
    // 在頁面加載完成後，打印所有AI分析按鈕
    setTimeout(() => {
        const allButtons = document.querySelectorAll('.ai-analysis-btn');
        console.log(`🔍 頁面上共有 ${allButtons.length} 個AI分析按鈕:`);
        allButtons.forEach((btn, index) => {
            console.log(`按鈕 ${index + 1}:`, {
                newsId: btn.getAttribute('data-news-id'),
                attributes: Array.from(btn.attributes).map(attr => `${attr.name}=${attr.value}`).join(', ')
            });
        });
    }, 2000);
}

// 導出函數（如果使用模組系統）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeSupabase,
        formatDateToBeijingTime,
        createNewsItemHTML,
        displayLog,
        safeQuerySelector,
        safeQuerySelectorAll,
        toggleTheme,
        updateWorldTime,
        typeWriterEffect,
        setupAIAnalysisEventDelegation
    };
}