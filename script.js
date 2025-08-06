// 報紙風格新聞推送頁面 JavaScript

// 從配置文件獲取 Supabase 設置
const config = window.SUPABASE_CONFIG || {
    url: 'https://mayplvpysdjpnytpevnc.supabase.co',
    anonKey: 'YOUR_ANON_KEY_HERE',
    tableName: 'n8n_cls_news_geminiai'
};

// 初始化 Supabase 客戶端
let supabase;
try {
    if (config.anonKey && config.anonKey !== 'YOUR_ANON_KEY_HERE') {
        supabase = window.supabase.createClient(config.url, config.anonKey);
        console.log('Supabase 客戶端初始化成功');
    } else {
        console.log('請在 config.js 中設置正確的 Supabase 匿名密鑰');
    }
} catch (error) {
    console.log('Supabase 初始化失敗，使用模擬數據:', error);
}

// 全局變量
let newsData = [];
let filteredNewsData = []; // 篩選後的新聞數據
let activeFilters = new Set(); // 活躍的篩選器
let lastUpdateTime = null;
let autoRefreshInterval;
let timeUpdateInterval;
let isAutoRefreshEnabled = false;

// 性能監控變量
let performanceMetrics = {
    totalLoadTime: 0,
    databaseQueryTime: 0,
    renderTime: 0,
    animationTime: 0,
    loadCount: 0
};

// 緩存機制
let newsCache = {
    data: null,
    timestamp: null,
    ttl: 30000 // 緩存30秒
};

// 檢查緩存是否有效
function isCacheValid() {
    if (!newsCache.data || !newsCache.timestamp) {
        return false;
    }
    return (Date.now() - newsCache.timestamp) < newsCache.ttl;
}

// 更新緩存
function updateCache(data) {
    newsCache.data = data;
    newsCache.timestamp = Date.now();
    console.log('📦 緩存已更新，有效期30秒');
}

// 清除緩存
function clearCache() {
    newsCache.data = null;
    newsCache.timestamp = null;
    console.log('🗑️ 緩存已清除');
}

// 模擬新聞數據
const mockNewsData = [
    {
        id: 1,
        title: 'AI技術革命：新一代語言模型震撼發布',
        summary: '最新的人工智能語言模型在多項基準測試中創下新紀錄，展現出前所未有的理解和生成能力，預計將徹底改變人機交互方式。',
        category: '科技',
        source: 'TechNews Daily',
        created_at: '2024-01-15T10:30:00Z',
        rtime: '2025-07-02T05:46:21.472+00:00',
        time: '13:46:21',
        content: '這項突破性技術的發布標誌著人工智能領域的重大進展。新模型不僅在語言理解方面表現卓越，還能進行複雜的推理和創作。專家預測，這將為教育、醫療、金融等多個行業帶來革命性變化。',
        tag: 'AI##科技##創新'
    },
    {
        id: 2,
        title: '全球氣候峰會達成歷史性協議',
        summary: '各國領導人在氣候峰會上達成新的減碳目標，承諾在2030年前大幅減少溫室氣體排放，這是人類應對氣候變化的重要里程碑。',
        category: '環境',
        source: 'Global Environmental Report',
        created_at: '2024-01-15T09:15:00Z',
        rtime: '2025-07-02T04:30:15.123+00:00',
        time: '12:30:15',
        content: '這項突破性技術的發布標誌著人工智能領域的重大進展。新模型不僅在語言理解方面表現卓越，還能進行複雜的推理和創作。專家預測，這將為教育、醫療、金融等多個行業帶來革命性變化。',
        tag: '環境##氣候變化##政策'
    },
    {
        id: 3,
        title: '革命性電池技術問世，電動車續航突破新極限',
        summary: '固態電池技術的重大突破將使電動車續航里程提升50%，充電時間縮短至10分鐘，為電動車普及掃清最後障礙。',
        category: '科技',
        source: 'AutoTech Weekly',
        created_at: '2024-01-15T08:45:00Z',
        rtime: '2025-07-02T03:15:30.456+00:00',
        time: '11:15:30',
        content: '這項技術不僅提高了電池的能量密度，還大幅改善了安全性能。預計在未來三年內實現商業化量產，將徹底改變電動車市場格局。',
        tag: '電動車#電池技術##科技創新'
    },
    {
        id: 4,
        title: '數位貨幣監管新政策正式實施',
        summary: '金融監管機構發布數位貨幣交易新規範，旨在保護投資者權益並促進市場健康發展，為數位金融時代奠定法律基礎。',
        category: '金融',
        source: 'Financial Times',
        created_at: '2024-01-15T07:20:00Z',
        rtime: '2024-01-15T07:20:00Z',
        time: '15:20:00',
        content: '新政策建立了完善的監管框架，包括交易所許可制度、投資者保護機制和反洗錢措施。這將為數位貨幣市場帶來更多穩定性和可預測性。',
        tag: '金融#數位貨幣#監管政策'
    },
    {
        id: 5,
        title: '私人太空探索創造新里程碑',
        summary: '私人太空公司成功完成首次商業太空站任務，標誌著商業太空時代的正式開始，人類太空探索進入新紀元。',
        category: '科學',
        source: 'Space Exploration News',
        created_at: '2024-01-15T06:00:00Z',
        rtime: '2024-01-15T06:00:00Z',
        time: '14:00:00',
        content: '此次任務的成功證明了私人企業在太空探索領域的巨大潛力。預計未來十年內，太空旅遊和太空製造將成為新興產業，為人類開拓全新的發展空間。',
        tag: '太空探索##科學##商業'
    },
    {
        id: 6,
        title: '醫療AI診斷準確率達到新高度',
        summary: '最新的醫療AI系統在癌症早期診斷中達到98%的準確率，有望革命性改變醫療診斷方式，拯救更多生命。',
        category: '醫療',
        source: 'Medical Innovation Today',
        created_at: '2024-01-15T05:30:00Z',
        rtime: '2024-01-15T05:30:00Z',
        time: '13:30:00',
        content: '這套AI系統結合了深度學習和醫學影像分析技術，能夠識別人眼難以察覺的早期病變。預計將在全球醫院推廣使用，大幅提高癌症治癒率。',
        tag: '醫療AI##診斷##科技'
    }
];

// 安全獲取DOM元素的函數
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`元素 '${id}' 未找到`);
    }
    return element;
}

// 獲取DOM元素
const tearAnimation = safeGetElement('tearAnimation');
const refreshProgress = safeGetElement('refreshProgress');
const refreshProgressBar = safeGetElement('refreshProgressBar');
const refreshProgressText = safeGetElement('refreshProgressText');
const refreshCompleteNotification = safeGetElement('refreshCompleteNotification');
const worldTimeElement = safeGetElement('worldTime');

// 將UTC時間轉換為北京時間並格式化（僅日期部分）
function formatDateToBeijingTime(utcDateString) {
    if (!utcDateString) return '';
    
    const date = new Date(utcDateString);
    if (isNaN(date.getTime())) {
        console.error('無效的日期字符串:', utcDateString);
        return '';
    }

    // 使用 toLocaleString 方法並指定時區，獲取各個日期組件
    const beijingDate = date.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    // 直接使用 getFullYear, getMonth, getDate 方法獲取北京時間的日期組件
    const beijingTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    const year = beijingTime.getFullYear();
    const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
    const day = String(beijingTime.getDate()).padStart(2, '0');
    
    return `${year}年${month}月${day}日`;
}

// 只顯示時間部分
function formatNewsDateTime(createdAtString, timeString) {
    if (!timeString) return '';
    
    // 只返回時間部分，不包含日期
    return timeString;
}



// 格式化日期顯示，例如"2小時前"或"2024年1月15日"
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) {
        return '剛剛發布';
    } else if (diffHours < 24) {
        return `${diffHours}小時前`;
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// 設置當前日期
function updateWorldTime() {
    const now = new Date();
    const timeZones = document.querySelectorAll('.time-zone');
    
    if (timeZones.length === 0) {
        // 如果沒有時區元素，靜默返回，不輸出警告
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
            // 获取指定时区的时间
            const timeInZone = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
            
            // 格式化日期 (MM/DD)
            const month = (timeInZone.getMonth() + 1).toString().padStart(2, '0');
            const day = timeInZone.getDate().toString().padStart(2, '0');
            const dateStr = `${month}/${day}`;
            
            // 格式化时间 (HH:MM:SS)
            const hours = timeInZone.getHours().toString().padStart(2, '0');
            const minutes = timeInZone.getMinutes().toString().padStart(2, '0');
            const seconds = timeInZone.getSeconds().toString().padStart(2, '0');
            const timeStr = `${hours}:${minutes}:${seconds}`;
            
            dateElement.textContent = dateStr;
            clockElement.textContent = timeStr;
        } catch (error) {
            console.error(`Error updating time for ${timezone}:`, error);
            if (dateElement) dateElement.textContent = '--/--';
            if (clockElement) clockElement.textContent = '--:--:--';
        }
    });
}

// 開始實時世界時間更新
function startTimeUpdate() {
    // 檢查是否有時區元素，如果沒有則不啟動時間更新
    const timeZones = document.querySelectorAll('.time-zone');
    if (timeZones.length === 0) {
        return;
    }
    
    updateWorldTime(); // 立即更新一次
    timeUpdateInterval = setInterval(updateWorldTime, 1000); // 每秒更新
}

// 停止實時時間更新
function stopTimeUpdate() {
    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
        timeUpdateInterval = null;
    }
}

// 獲取分類顏色
function getCategoryColor(category) {
    const colors = {
        '科技': '#8b4513',
        '環境': '#228b22',
        '金融': '#b8860b',
        '科學': '#4682b4',
        '醫療': '#dc143c',
        '商業': '#9932cc',
        '生活': '#ff8c00'
    };
    return colors[category] || '#8b4513';
}

// 創建標籤HTML
function createTagsHTML(tagString) {
    if (!tagString) return '';
    
    // 先按##分離，然後再按單個#分離，最後過濾空標籤
    let tags = [];
    
    // 移除開頭的#符號
    let cleanString = tagString.replace(/^#+/, '');
    
    // 先按##分離
    let parts = cleanString.split('##');
    
    // 對每個部分再按單個#分離
    parts.forEach(part => {
        if (part.includes('#')) {
            tags.push(...part.split('#').filter(tag => tag.trim()));
        } else {
            if (part.trim()) tags.push(part.trim());
        }
    });
    
    // 預定義標籤顏色
    const tagColors = [
        '#3b82f6', // 藍色
        '#ef4444', // 紅色
        '#10b981', // 綠色
        '#f59e0b', // 橙色
        '#8b5cf6', // 紫色
        '#06b6d4', // 青色
        '#f97316', // 深橙色
        '#84cc16'  // 萊姆綠
    ];
    
    return tags.map((tag, index) => {
        const color = tagColors[index % tagColors.length];
        return `<span class="news-tag" style="background-color: ${color}; color: white;">${tag.trim()}</span>`;
    }).join('');
}

// 創建新聞條目HTML
function createNewsItemHTML(news) {
    console.log('🔍 创建新闻项目:', news);
    
    const dateTime = formatNewsDateTime(news.created_at, news.time);
    const title = news.title || '無標題';
    const source = news.tag || '未知來源';
    const content = news.content || '無內容描述';
    const tagsHTML = createTagsHTML(news.tag);
    
    // 确保news.id存在
    const newsId = news.id || Math.floor(Math.random() * 10000);
    console.log('🔍 使用的newsId:', newsId);
    
    // 获取AI分析字段
    const mood = news.mood || '';
    const relation = news.relation || '';
    const analyze = news.analyze || '';
    
    // 检查是否有AI分析数据
    const hasAIData = mood || relation || analyze;
    
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
}

// 顯示載入狀態
function showLoadingNews() {
    const newsListElement = document.getElementById('newsList');
    if (newsListElement) {
        newsListElement.innerHTML = '<div class="loading">正在載入新聞...</div>';
    }
}

// 顯示新聞列表
function displayNewsList(newsList) {
    const renderStartTime = performance.now();
    console.time('🖼️ 新聞列表渲染總時間');
    
    console.log('🔍 displayNewsList called with:', { 
        newsListLength: newsList?.length || 0, 
        firstNewsId: newsList?.[0]?.id || 'none' 
    });
    
    const newsListElement = document.getElementById('newsList');
    if (!newsListElement) {
        console.error('❌ 找不到新聞列表容器');
        return;
    }
    
    if (!newsList || newsList.length === 0) {
        newsListElement.innerHTML = '<div class="error">暫無新聞數據</div>';
        console.log('⚠️ 無新聞數據，顯示錯誤信息');
        return;
    }
    
    console.log(`📰 準備顯示 ${newsList.length} 條新聞`);
    
    // 确保每个新闻项目都有id
    console.time('🔧 數據預處理');
    const newsWithIds = newsList.map(news => {
        if (!news.id) {
            news.id = Math.floor(Math.random() * 10000);
            console.log('🔍 为缺少id的新闻生成随机id:', news.id);
        }
        return news;
    });
    console.timeEnd('🔧 數據預處理');
    
    // HTML生成階段
    console.time('🏗️ HTML生成');
    const newsHTML = newsWithIds.map(news => createNewsItemHTML(news)).join('');
    console.timeEnd('🏗️ HTML生成');
    
    // DOM更新階段
    console.time('🔄 DOM更新');
    newsListElement.innerHTML = newsHTML;
    console.timeEnd('🔄 DOM更新');
    
    // 打印生成的HTML结构（僅在開發模式）
    if (window.location.hostname === 'localhost') {
        console.log('🔍 生成的HTML結構預覽:', newsListElement.innerHTML.substring(0, 200) + '...');
    }
    
    // 更新最後更新時間
    lastUpdateTime = new Date();
    console.log('✅ 新聞列表顯示完成，最後更新時間:', lastUpdateTime.toLocaleString());
    
    // 更新篩選器
    console.time('🏷️ 篩選器更新');
    updateNewsFilter();
    console.timeEnd('🏷️ 篩選器更新');
    
    const renderEndTime = performance.now();
    const totalRenderTime = renderEndTime - renderStartTime;
    console.timeEnd('🖼️ 新聞列表渲染總時間');
    console.log(`⚡ 渲染性能統計: ${totalRenderTime.toFixed(2)}ms (${newsList.length}條新聞)`);
    console.log(`📊 平均每條新聞渲染時間: ${(totalRenderTime / newsList.length).toFixed(2)}ms`);
    
    // 更新性能指標
    performanceMetrics.renderTime = totalRenderTime;
    performanceMetrics.loadCount++;
}

// 性能分析和優化建議
function analyzePerformance() {
    console.log('\n🔍 === 性能分析報告 ===');
    console.log(`📊 總加載次數: ${performanceMetrics.loadCount}`);
    console.log(`⏱️ 最近渲染時間: ${performanceMetrics.renderTime.toFixed(2)}ms`);
    
    const suggestions = [];
    
    // 渲染性能分析
    if (performanceMetrics.renderTime > 100) {
        suggestions.push('🐌 渲染時間較長，建議減少DOM操作或使用虛擬滾動');
    } else if (performanceMetrics.renderTime < 50) {
        suggestions.push('⚡ 渲染性能良好！');
    }
    
    // 數據庫查詢分析
    if (performanceMetrics.databaseQueryTime > 2000) {
        suggestions.push('🐌 數據庫查詢較慢，建議檢查網絡連接或優化查詢');
    }
    
    // 總體性能評估
    const totalTime = performanceMetrics.totalLoadTime;
    if (totalTime > 3000) {
        suggestions.push('🚨 總加載時間過長，建議啟用緩存或減少數據量');
    } else if (totalTime < 1000) {
        suggestions.push('🚀 加載速度優秀！');
    }
    
    console.log('\n💡 優化建議:');
    suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion}`);
    });
    
    console.log('\n📦 緩存狀態:');
    if (newsCache.data) {
        const cacheAge = (Date.now() - newsCache.timestamp) / 1000;
        console.log(`• 緩存數據: ${newsCache.data.length}條新聞`);
        console.log(`• 緩存年齡: ${cacheAge.toFixed(1)}秒`);
        console.log(`• 緩存狀態: ${isCacheValid() ? '有效' : '已過期'}`);
    } else {
        console.log('• 緩存狀態: 無緩存數據');
    }
    
    console.log('\n🔧 可能的性能瓶頸:');
    console.log('• 網絡延遲: 檢查Supabase連接速度');
    console.log('• DOM渲染: 減少複雜的HTML結構');
    console.log('• 動畫效果: 考慮禁用非必要動畫');
    console.log('• 數據量: 考慮分頁加載或懶加載');
    console.log('• 緩存策略: 30秒緩存可減少重複查詢');
    
    return suggestions;
}

// 提取新聞來源標籤
function extractNewsSources(newsList) {
    const sources = new Map();
    
    newsList.forEach(news => {
        if (news.tag) {
            // 處理多個標籤的情況
            let tags = [];
            
            // 移除開頭的#符號
            let cleanString = news.tag.replace(/^#+/, '');
            
            // 先按##分離
            let parts = cleanString.split('##');
            
            // 對每個部分再按單個#分離
            parts.forEach(part => {
                if (part.includes('#')) {
                    tags.push(...part.split('#').filter(tag => tag.trim()));
                } else {
                    if (part.trim()) tags.push(part.trim());
                }
            });
            
            // 統計每個標籤的出現次數
            tags.forEach(tag => {
                const trimmedTag = tag.trim();
                if (trimmedTag) {
                    sources.set(trimmedTag, (sources.get(trimmedTag) || 0) + 1);
                }
            });
        }
    });
    
    return sources;
}

// 更新新聞篩選器
function updateNewsFilter() {
    const filterTagsElement = document.getElementById('filterTags');
    const filterCountElement = document.getElementById('filterCount');
    
    if (!filterTagsElement || !filterCountElement) {
        console.error('找不到篩選器元素');
        return;
    }
    
    // 提取所有新聞來源
    const sources = extractNewsSources(newsData);
    
    // 生成篩選標籤HTML
    const filterTagsHTML = Array.from(sources.entries())
        .sort((a, b) => b[1] - a[1]) // 按出現次數排序
        .map(([source, count]) => {
            const isActive = activeFilters.has(source);
            return `
                <div class="filter-tag ${isActive ? 'active' : ''}" data-source="${source}">
                    <span>${source}</span>
                    <span class="filter-tag-count">${count}</span>
                </div>
            `;
        })
        .join('');
    
    filterTagsElement.innerHTML = filterTagsHTML;
    
    // 更新篩選計數
    updateFilterCount();
    
    // 綁定篩選標籤點擊事件
    bindFilterTagEvents();
}

// 綁定篩選標籤事件
function bindFilterTagEvents() {
    const filterTags = document.querySelectorAll('.filter-tag');
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const source = tag.dataset.source;
            
            if (activeFilters.has(source)) {
                // 移除篩選
                activeFilters.delete(source);
                tag.classList.remove('active');
            } else {
                // 添加篩選
                activeFilters.add(source);
                tag.classList.add('active');
            }
            
            // 應用篩選
            applyNewsFilter();
            updateFilterCount();
        });
    });
}

// 應用新聞篩選
function applyNewsFilter() {
    if (activeFilters.size === 0) {
        // 沒有篩選條件，顯示所有新聞
        filteredNewsData = [...newsData];
    } else {
        // 根據篩選條件過濾新聞
        filteredNewsData = newsData.filter(news => {
            if (!news.tag) return false;
            
            // 提取新聞的所有標籤
            let tags = [];
            let cleanString = news.tag.replace(/^#+/, '');
            let parts = cleanString.split('##');
            
            parts.forEach(part => {
                if (part.includes('#')) {
                    tags.push(...part.split('#').filter(tag => tag.trim()));
                } else {
                    if (part.trim()) tags.push(part.trim());
                }
            });
            
            // 檢查是否包含任何活躍的篩選標籤
            return tags.some(tag => activeFilters.has(tag.trim()));
        });
    }
    
    // 重新顯示篩選後的新聞
    displayFilteredNews();
}

// 顯示篩選後的新聞
function displayFilteredNews() {
    const newsListElement = document.getElementById('newsList');
    if (!newsListElement) {
        console.error('找不到新聞列表容器');
        return;
    }
    
    if (filteredNewsData.length === 0) {
        if (activeFilters.size > 0) {
            newsListElement.innerHTML = '<div class="error">沒有符合篩選條件的新聞</div>';
        } else {
            newsListElement.innerHTML = '<div class="error">暫無新聞數據</div>';
        }
        return;
    }
    
    const newsHTML = filteredNewsData.map(news => createNewsItemHTML(news)).join('');
    newsListElement.innerHTML = newsHTML;
    
    console.log(`顯示篩選後的新聞: ${filteredNewsData.length} 條`);
}

// 更新篩選計數
function updateFilterCount() {
    const filterCountElement = document.getElementById('filterCount');
    if (!filterCountElement) return;
    
    if (activeFilters.size === 0) {
        filterCountElement.textContent = `顯示全部 (${newsData.length})`;
    } else {
        const activeFiltersArray = Array.from(activeFilters);
        const filteredCount = filteredNewsData.length;
        filterCountElement.textContent = `已篩選: ${activeFiltersArray.join(', ')} (${filteredCount})`;
    }
}

// 清除所有篩選
function clearAllFilters() {
    activeFilters.clear();
    
    // 移除所有活躍狀態
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => tag.classList.remove('active'));
    
    // 重新應用篩選（顯示所有新聞）
    applyNewsFilter();
    updateFilterCount();
    
    console.log('已清除所有篩選條件');
}

// 設置新聞篩選器事件監聽
function setupNewsFilterEvents() {
    // 綁定清除篩選按鈕事件
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
        console.log('清除篩選按鈕事件監聽器已設置');
    } else {
        console.warn('找不到清除篩選按鈕元素');
    }
}

// 撕紙動畫效果
function playRefreshAnimation() {
    return new Promise((resolve) => {
        // 显示进度条和进度文字
        refreshProgress.classList.add('show');
        refreshProgressText.classList.add('show');
        
        // 模拟进度
        let progress = 0;
        const interval = setInterval(() => {
            progress += 15;
            refreshProgressBar.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                
                // 进度完成后隐藏进度相关元素
                setTimeout(() => {
                    refreshProgress.classList.remove('show');
                    refreshProgressText.classList.remove('show');
                    refreshProgressBar.style.width = '0%';
                    
                    // 显示顶部完成提示
                    refreshCompleteNotification.classList.add('show');
                    
                    // 2秒后隐藏提示并完成动画
                    setTimeout(() => {
                        refreshCompleteNotification.classList.remove('show');
                        resolve();
                    }, 2000);
                }, 300);
            }
        }, 80);
    });
}

// 保留原始动画函数作为备用
function playTearAnimation() {
    return new Promise((resolve) => {
        tearAnimation.classList.add('active');
        
        setTimeout(() => {
            tearAnimation.classList.remove('active');
            resolve();
        }, 1500);
    });
}

// 移除單條新聞切換邏輯，改為列表顯示
// async function switchToNextNews() - 已移除

// 從 Supabase 獲取新聞數據
async function fetchNewsFromSupabase() {
    const startTime = performance.now();
    console.time('📊 Supabase數據獲取總時間');
    
    // 檢查緩存
    if (isCacheValid()) {
        console.log('📦 使用緩存數據，跳過數據庫查詢');
        const cacheAge = (Date.now() - newsCache.timestamp) / 1000;
        console.log(`⏰ 緩存年齡: ${cacheAge.toFixed(1)}秒`);
        performanceMetrics.databaseQueryTime = 0; // 使用緩存時查詢時間為0
        console.timeEnd('📊 Supabase數據獲取總時間');
        return newsCache.data;
    }
    
    try {
        console.log('🚀 開始獲取 Supabase 數據...');
        console.log('Supabase 客戶端狀態:', !!supabase);
        console.log('配置信息:', {
            url: config.url,
            tableName: config.tableName,
            hasAnonKey: !!config.anonKey && config.anonKey !== 'YOUR_ANON_KEY_HERE'
        });
        
        if (!supabase) {
            throw new Error('Supabase 未初始化');
        }
        
        // 優化：直接獲取最新的20條新聞數據，移除不必要的預檢查查詢
        console.log('📡 正在獲取最新的20條新聞數據...');
        console.time('🔍 數據庫查詢時間');
        
        const { data, error } = await supabase
            .from(config.tableName)
            .select('id, title, content, link, rtime, tag, time, timestamp, created_at, mood, relation, "analyze"')
            .not('rtime', 'is', null)  // 過濾掉rtime為null的記錄
            .order('rtime', { ascending: false })
            .limit(20);
        
        console.timeEnd('🔍 數據庫查詢時間');
        
        if (error) {
            console.error('❌ Supabase 查詢錯誤:', error);
            throw error;
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        console.log(`✅ 成功獲取數據: ${data?.length || 0} 條新聞`);
        console.log(`⚡ 總耗時: ${totalTime.toFixed(2)}ms`);
        
        // 記錄數據庫查詢性能
        performanceMetrics.databaseQueryTime = totalTime;
        
        if (data && data.length > 0) {
            console.log('📅 最新新聞時間:', data[0].rtime);
            console.log('📰 第一條新聞標題:', data[0].title);
        }
        
        console.timeEnd('📊 Supabase數據獲取總時間');
        
        // 更新緩存
        if (data && data.length > 0) {
            updateCache(data);
        }
        
        return data || [];
    } catch (error) {
        console.timeEnd('📊 Supabase數據獲取總時間');
        console.error('❌ 獲取 Supabase 數據失敗:', error);
        return null;
    }
}

// 檢查數據更新
async function checkForUpdates() {
    const updateStartTime = performance.now();
    console.time('🔄 完整更新流程時間');
    
    console.log('🔄 === 開始檢查更新 ===');
    console.log('📊 觸發原因 - 自動刷新狀態:', isAutoRefreshEnabled);
    console.log('⏰ 觸發時間:', new Date().toLocaleString());
    
    try {
        // 嘗試從 Supabase 獲取數據
        console.time('📡 數據獲取階段');
        const supabaseData = await fetchNewsFromSupabase();
        console.timeEnd('📡 數據獲取階段');
        
        console.log('📊 Supabase 數據獲取結果:', {
            hasData: !!supabaseData,
            dataLength: supabaseData?.length || 0,
            isArray: Array.isArray(supabaseData)
        });
        
        if (supabaseData && supabaseData.length > 0) {
            // 檢查是否有新數據，優先使用rtime字段
            console.time('🔍 數據比較階段');
            const latestNews = supabaseData[0];
            const latestTime = new Date(latestNews.rtime || latestNews.created_at).getTime();
            
            console.log('📊 最新新聞信息:', {
                title: latestNews.title,
                rtime: latestNews.rtime,
                created_at: latestNews.created_at,
                latestTime: latestTime,
                lastUpdateTime: lastUpdateTime
            });
            console.timeEnd('🔍 數據比較階段');
            
            if (!lastUpdateTime || latestTime > lastUpdateTime) {
                console.log('✨ 發現新聞更新，使用 Supabase 數據');
                console.time('🔄 數據更新階段');
                
                newsData = supabaseData;
                filteredNewsData = [...newsData]; // 初始化篩選數據
                lastUpdateTime = latestTime;
                
                console.timeEnd('🔄 數據更新階段');
                
                // 播放撕紙動畫並更新
                console.time('🎬 動畫渲染階段');
                await playRefreshAnimation();
                console.timeEnd('🎬 動畫渲染階段');
                
                console.time('🖼️ 頁面渲染階段');
                displayNewsList(newsData);
                console.timeEnd('🖼️ 頁面渲染階段');
            } else {
                console.log('✅ 沒有新的更新，跳過渲染');
            }
        } else {
            // 使用模擬數據
            if (newsData.length === 0) {
                console.log('⚠️ Supabase 無數據，使用模擬數據');
                console.time('📝 模擬數據載入');
                newsData = mockNewsData;
                filteredNewsData = [...newsData]; // 初始化篩選數據
                displayNewsList(newsData);
                console.timeEnd('📝 模擬數據載入');
            }
        }
    } catch (error) {
        console.error('❌ 檢查更新失敗:', error);
        if (newsData.length === 0) {
            console.log('🔧 錯誤處理：使用模擬數據');
            newsData = mockNewsData;
            filteredNewsData = [...newsData]; // 初始化篩選數據
            displayNewsList(newsData);
        }
    } finally {
        const updateEndTime = performance.now();
        const totalUpdateTime = updateEndTime - updateStartTime;
        console.timeEnd('🔄 完整更新流程時間');
        console.log(`⚡ 總更新耗時: ${totalUpdateTime.toFixed(2)}ms`);
        
        // 更新性能指標
        performanceMetrics.totalLoadTime = totalUpdateTime;
        
        // 如果加載時間過長，提供性能分析
        if (totalUpdateTime > 2000) {
            console.log('\n⚠️ 檢測到加載時間較長，正在分析性能...');
            setTimeout(() => analyzePerformance(), 100);
        }
        
        console.log('🏁 === 檢查更新完成 ===');
    }
}



// 移除新聞輪播功能
// function startNewsRotation() - 已移除

// 自動刷新控制
function startAutoRefresh() {
    console.log('=== 嘗試啟動自動刷新 ===');
    console.log('當前 isAutoRefreshEnabled:', isAutoRefreshEnabled);
    console.log('當前 autoRefreshInterval:', autoRefreshInterval);
    
    if (isAutoRefreshEnabled) {
        // 先清除可能存在的舊定時器
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            console.log('清除了舊的定時器');
        }
        
        autoRefreshInterval = setInterval(checkForUpdates, 60000); // 每60秒檢查一次
        console.log('自動刷新已啟動，定時器ID:', autoRefreshInterval);
    } else {
        console.log('自動刷新未啟用，跳過啟動');
    }
}

function stopAutoRefresh() {
    console.log('=== 嘗試停止自動刷新 ===');
    console.log('當前 autoRefreshInterval:', autoRefreshInterval);
    
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        console.log('自動刷新已停止，定時器已清除');
    } else {
        console.log('沒有活動的自動刷新定時器');
    }
}

function toggleAutoRefresh(enabled) {
    console.log('=== 自動刷新開關切換 ===');
    console.log('toggleAutoRefresh 被調用，參數:', enabled);
    console.log('切換前狀態 - isAutoRefreshEnabled:', isAutoRefreshEnabled);
    console.log('切換前狀態 - autoRefreshInterval:', autoRefreshInterval);
    
    isAutoRefreshEnabled = enabled;
    console.log('切換後狀態 - isAutoRefreshEnabled:', isAutoRefreshEnabled);
    
    if (enabled) {
        console.log('啟動自動刷新...');
        startAutoRefresh();
    } else {
        console.log('停止自動刷新...');
        stopAutoRefresh();
    }
    
    // 更新開關視覺狀態
    const autoRefreshToggle = document.getElementById('autoRefreshToggle');
    if (autoRefreshToggle && autoRefreshToggle.checked !== enabled) {
        autoRefreshToggle.checked = enabled;
        console.log('開關視覺狀態已同步為:', enabled);
    }
    
    // 更新狀態顯示
    const statusElement = document.getElementById('autoRefreshStatus');
    if (statusElement) {
        statusElement.textContent = enabled ? '開啟' : '關閉';
        statusElement.style.color = enabled ? 'var(--accent-color)' : 'var(--text-secondary)';
    }
}

// 導航功能
function setupNavigation() {
    // 鍵盤快捷鍵
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case ' ': // 空格鍵切換自動刷新
                e.preventDefault();
                const toggle = document.getElementById('autoRefreshToggle');
                if (toggle) {
                    toggle.checked = !toggle.checked;
                    toggleAutoRefresh(toggle.checked);
                }
                break;
        }
    });
}

// 鍵盤快捷鍵
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+R 刷新數據
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            console.log('手動刷新數據');
            checkForUpdates();
        }
    });
}

// 主题切换功能
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    // 从本地存储获取主题设置
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    
    // 主题切换事件
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        body.setAttribute('data-theme', newTheme);
        
        // 保存到本地存储
        localStorage.setItem('theme', newTheme);
    });
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('報紙風格新聞頁面初始化');
    
    try {
        // 開始實時時間更新
        console.log('Starting time update...');
        startTimeUpdate();
        
        // 顯示載入狀態
        console.log('Showing loading state...');
        showLoadingNews();
        
        // 設置導航
        console.log('Setting up navigation...');
        setupNavigation();
        
        // 設置鍵盤快捷鍵
        console.log('Setting up keyboard shortcuts...');
        setupKeyboardShortcuts();
        
        // 設置返回顶部按钮功能
        console.log('Setting up back to top...');
        setupBackToTop();
        
        // 設置主题切换功能
        console.log('Setting up theme toggle...');
        setupThemeToggle();
        
        // 設置AI分析按钮事件委托
        console.log('Setting up AI analysis event delegation...');
        setupAIAnalysisEventDelegation();
        
        // 設置篩選器事件監聽
        console.log('Setting up news filter events...');
        setupNewsFilterEvents();
        
        // 設置手動載入按鈕事件監聽
        const manualLoadBtn = document.getElementById('manualLoadBtn');
        if (manualLoadBtn) {
            console.log('手動載入按鈕元素找到，設置事件監聽器');
            manualLoadBtn.addEventListener('click', () => {
                console.log('手動載入新聞被點擊');
                manualLoadBtn.disabled = true;
                manualLoadBtn.textContent = '載入中...';
                
                checkForUpdates().finally(() => {
                    manualLoadBtn.disabled = false;
                    manualLoadBtn.textContent = '載入新聞';
                });
            });
        } else {
            console.error('未找到手動載入按鈕元素 (manualLoadBtn)');
        }
        
        // 設置性能分析按鈕事件監聽
        const performanceAnalysisBtn = document.getElementById('performanceAnalysisBtn');
        if (performanceAnalysisBtn) {
            console.log('性能分析按鈕元素找到，設置事件監聽器');
            performanceAnalysisBtn.addEventListener('click', () => {
                console.log('性能分析按鈕被點擊');
                analyzePerformance();
            });
        } else {
            console.error('未找到性能分析按鈕元素 (performanceAnalysisBtn)');
        }
        
        // 設置清除緩存按鈕事件監聽
        const clearCacheBtn = document.getElementById('clearCacheBtn');
        if (clearCacheBtn) {
            console.log('清除緩存按鈕元素找到，設置事件監聽器');
            clearCacheBtn.addEventListener('click', () => {
                console.log('清除緩存按鈕被點擊');
                clearCache();
                // 清除緩存後立即重新加載數據
                checkForUpdates();
            });
        } else {
            console.error('未找到清除緩存按鈕元素 (clearCacheBtn)');
        }
        
        // 設置Dock導航事件監聽
        setupDockNavigation();
        
        // 設置自動刷新開關事件監聽
        const autoRefreshToggle = document.getElementById('autoRefreshToggle');
        if (autoRefreshToggle) {
            console.log('自動刷新開關元素找到，設置事件監聽器');
            autoRefreshToggle.addEventListener('change', (e) => {
                console.log('自動刷新開關狀態變化:', e.target.checked);
                toggleAutoRefresh(e.target.checked);
            });
            
            // 確保開關初始狀態為關閉
            autoRefreshToggle.checked = false;
            // 確保全局變量也設置為關閉
            isAutoRefreshEnabled = false;
            console.log('自動刷新開關初始狀態設置為關閉，isAutoRefreshEnabled:', isAutoRefreshEnabled);
        } else {
            console.error('未找到自動刷新開關元素 (autoRefreshToggle)');
            // 即使沒有開關元素，也要確保自動刷新被禁用
            isAutoRefreshEnabled = false;
            console.log('沒有自動刷新開關，強制禁用自動刷新');
        }
        
        // 頁面初始化時自動載入新聞
        console.log('頁面初始化完成，開始自動載入新聞');
        console.log('初始化前的自動刷新狀態 - isAutoRefreshEnabled:', isAutoRefreshEnabled);
        console.log('初始化前的定時器狀態 - autoRefreshInterval:', autoRefreshInterval);
        
        checkForUpdates();
        
        // 確保初始化後自動刷新仍然是關閉狀態
        console.log('初始化後的自動刷新狀態 - isAutoRefreshEnabled:', isAutoRefreshEnabled);
        console.log('初始化後的定時器狀態 - autoRefreshInterval:', autoRefreshInterval);
        
        // 注意：自動刷新默認關閉，需要用戶手動啟用
        // 不會自動啟動定時刷新功能
        
        console.log('Page initialization completed successfully');
    } catch (error) {
        console.error('Error during page initialization:', error);
    }
});

// 頁面卸載時清理定時器
window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
    }
});

// 頁面可見性變化處理
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 頁面隱藏時暫停自動刷新
        stopAutoRefresh();
        stopTimeUpdate();
    } else {
        // 頁面顯示時重新啟動定時器
        startTimeUpdate();
        // 恢復自動刷新（如果啟用）
        if (isAutoRefreshEnabled) {
            startAutoRefresh();
            // 移除自動檢查更新，避免意外的自動刷新
            // checkForUpdates();
        }
    }
});

// AI分析事件委托处理
function setupAIAnalysisEventDelegation() {
    // 使用事件委托处理AI分析按钮点击
    document.addEventListener('click', (e) => {
        if (e.target.closest('.ai-analysis-btn')) {
            const button = e.target.closest('.ai-analysis-btn');
            const newsId = button.getAttribute('data-news-id');
            
            console.log('🔍 点击了AI分析按钮:', {
                button: button,
                newsId: newsId,
                buttonAttributes: Array.from(button.attributes).map(attr => `${attr.name}=${attr.value}`).join(', ')
            });
            
            if (newsId && newsId !== 'null' && newsId !== 'undefined') {
                // 不再将newsId转换为整数，保持为字符串
                toggleAIAnalysis(newsId);
            } else {
                console.error('❌ 无效的newsId:', newsId);
            }
        }
    });
    
    // 在页面加载完成后，打印所有AI分析按钮
    setTimeout(() => {
        const allButtons = document.querySelectorAll('.ai-analysis-btn');
        console.log(`🔍 页面上共有 ${allButtons.length} 个AI分析按钮:`);
        allButtons.forEach((btn, index) => {
            console.log(`按钮 ${index + 1}:`, {
                newsId: btn.getAttribute('data-news-id'),
                attributes: Array.from(btn.attributes).map(attr => `${attr.name}=${attr.value}`).join(', ')
            });
        });
    }, 2000);
}

// 返回顶部按钮功能
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    // 监听滚动事件
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    // 点击返回顶部
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Dock導航設置
function setupDockNavigation() {
    const dockContainer = document.getElementById('dockContainer');
    console.log('dock容器:', dockContainer);
    
    const dockItems = document.querySelectorAll('#dockContainer .dock-item');
    console.log('找到的dock項目:', dockItems);
    
    if (dockItems.length === 0) {
        console.warn('未找到dock導航項目');
        // 嘗試直接查找所有dock-item
        const allDockItems = document.querySelectorAll('.dock-item');
        console.log('所有dock項目:', allDockItems);
        return;
    }
    
    console.log('設置Dock導航，找到', dockItems.length, '個導航項目');
    
    // Vue Bits風格的dock交互效果
    const dockPanel = document.querySelector('#dockContainer .dock-panel');
    
    dockItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            const page = item.getAttribute('data-page');
            console.log('Dock導航點擊:', page);
            
            // 移除所有active狀態
            dockItems.forEach(dock => dock.classList.remove('active'));
            
            // 添加active狀態到當前項目
            item.classList.add('active');
            
            // 處理頁面切換
            handlePageNavigation(page);
        });
    });
    
    // 添加鼠標移動監聽器實現Vue Bits風格的放大效果
    if (dockPanel) {
        dockPanel.addEventListener('mousemove', (e) => {
            const rect = dockPanel.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            
            dockItems.forEach((item, index) => {
                const itemRect = item.getBoundingClientRect();
                const itemCenterX = itemRect.left + itemRect.width / 2 - rect.left;
                const distance = Math.abs(mouseX - itemCenterX);
                const maxDistance = 200; // Vue Bits默認距離
                
                if (distance < maxDistance) {
                    const scale = 1 + (1 - distance / maxDistance) * 0; // 禁用放大效果
                    const translateY = -(1 - distance / maxDistance) * 0; // 禁用上移效果
                    item.style.transform = `scale(${scale}) translateY(${translateY}px)`;
                    item.style.zIndex = Math.round(10 - distance / 20);
                } else {
                    item.style.transform = 'scale(1) translateY(0px)';
                    item.style.zIndex = '1';
                }
            });
        });
        
        dockPanel.addEventListener('mouseleave', () => {
            dockItems.forEach(item => {
                item.style.transform = 'scale(1) translateY(0px)';
                item.style.zIndex = '1';
            });
        });
    }
}

// 處理頁面導航
function handlePageNavigation(page) {
    switch(page) {
        case 'home':
            console.log('切換到首頁');
            // 移除自動彈出確認對話框的邏輯，避免意外觸發刷新
            // 用戶可以通過手動載入按鈕或Ctrl+R來刷新新聞
            console.log('已在首頁，如需刷新請使用載入新聞按鈕');
            break;
        case 'summary':
            console.log('切換到總結頁面');
            window.location.href = 'daily-summary.html';
            break;
        case 'user':
            console.log('切換到用戶頁面');
            // 這裡可以添加用戶頁面的邏輯
            alert('用戶頁面功能開發中...');
            break;
        case 'settings':
            console.log('切換到設置頁面');
            // 這裡可以添加設置頁面的邏輯
            showSettingsModal();
            break;
        default:
            console.warn('未知的頁面:', page);
    }
}

// 添加放大效果
function addMagnificationEffect(item) {
    const siblings = item.parentElement.children;
    const itemIndex = Array.from(siblings).indexOf(item);
    
    // 對相鄰項目添加輕微放大效果
    for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        const distance = Math.abs(i - itemIndex);
        
        if (distance === 1) {
            sibling.style.transform = 'scale(1.05) translateY(-2px)';
        } else if (distance === 2) {
            sibling.style.transform = 'scale(1.02) translateY(-1px)';
        }
    }
}

// 移除放大效果
function removeMagnificationEffect(item) {
    const siblings = item.parentElement.children;
    
    // 重置所有非active項目的變換
    for (let sibling of siblings) {
        if (!sibling.classList.contains('active') && sibling !== item) {
            sibling.style.transform = '';
        }
    }
}

// 顯示設置模態框
function showSettingsModal() {
    // 創建設置模態框
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.innerHTML = `
        <div class="settings-content">
            <div class="settings-header">
                <h3>設置</h3>
                <button class="close-btn" onclick="this.closest('.settings-modal').remove()">&times;</button>
            </div>
            <div class="settings-body">
                <div class="setting-item">
                    <label>自動刷新間隔</label>
                    <select id="refreshInterval">
                        <option value="30">30秒</option>
                        <option value="60" selected>60秒</option>
                        <option value="120">2分鐘</option>
                        <option value="300">5分鐘</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label>Aurora效果強度</label>
                    <input type="range" id="auroraIntensity" min="0" max="100" value="50">
                    <span id="auroraIntensityValue">50</span>
                </div>
                <div class="setting-item">
                    <label>通知設置</label>
                    <input type="checkbox" id="enableNotifications" checked>
                    <span>啟用新聞通知</span>
                </div>
            </div>
            <div class="settings-footer">
                <button class="save-btn" onclick="saveSettings(); this.closest('.settings-modal').remove();">保存</button>
                <button class="cancel-btn" onclick="this.closest('.settings-modal').remove()">取消</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 載入保存的設置
    setTimeout(() => {
        loadSavedSettings();
        
        // 設置Aurora強度滑塊的實時更新
        const auroraIntensity = document.getElementById('auroraIntensity');
        const auroraIntensityValue = document.getElementById('auroraIntensityValue');
        
        if (auroraIntensity && auroraIntensityValue) {
            auroraIntensity.addEventListener('input', function() {
                auroraIntensityValue.textContent = this.value;
            });
            
            // 初始化顯示值
            auroraIntensityValue.textContent = auroraIntensity.value;
        }
    }, 100);
}

// 保存設置
function saveSettings() {
    const refreshInterval = document.getElementById('refreshInterval')?.value;
    const auroraIntensity = document.getElementById('auroraIntensity')?.value;
    const enableNotifications = document.getElementById('enableNotifications')?.checked;
    
    console.log('保存設置:', {
        refreshInterval,
        auroraIntensity,
        enableNotifications
    });
    
    try {
        // 保存設置到localStorage
        const settings = {
            refreshInterval: refreshInterval || '60',
            auroraIntensity: auroraIntensity || '50',
            enableNotifications: enableNotifications || false,
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('newsAppSettings', JSON.stringify(settings));
        console.log('設置已保存到localStorage:', settings);
        
        // 應用Aurora強度設置
        if (typeof window.auroraConfig !== 'undefined' && auroraIntensity) {
            window.auroraConfig.intensity = parseFloat(auroraIntensity) / 100;
            if (typeof updateAuroraEffect === 'function') {
                updateAuroraEffect();
                console.log('Aurora強度已更新為:', window.auroraConfig.intensity);
            }
        }
        
        // 顯示成功提示
        showSettingsSavedFeedback();
        
    } catch (error) {
        console.error('保存設置時發生錯誤:', error);
        alert('保存設置失敗，請重試！');
    }
}

// 顯示設置保存成功的反饋
function showSettingsSavedFeedback() {
    // 創建臨時提示
    const feedback = document.createElement('div');
    feedback.className = 'settings-saved-feedback';
    feedback.textContent = '設置已保存！';
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 212, 255, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10001;
        animation: fadeInOut 2s ease-in-out;
        box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
    `;
    
    document.body.appendChild(feedback);
    
    // 2秒後移除
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 2000);
}

// 載入保存的設置
function loadSavedSettings() {
    try {
        const savedSettings = localStorage.getItem('newsAppSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            console.log('載入保存的設置:', settings);
            
            // 應用設置到表單元素
            const refreshInterval = document.getElementById('refreshInterval');
            const auroraIntensity = document.getElementById('auroraIntensity');
            const enableNotifications = document.getElementById('enableNotifications');
            
            if (refreshInterval && settings.refreshInterval) {
                refreshInterval.value = settings.refreshInterval;
            }
            
            if (auroraIntensity && settings.auroraIntensity) {
                auroraIntensity.value = settings.auroraIntensity;
            }
            
            if (enableNotifications && typeof settings.enableNotifications === 'boolean') {
                enableNotifications.checked = settings.enableNotifications;
            }
            
            return settings;
        }
    } catch (error) {
        console.error('載入設置時發生錯誤:', error);
    }
    return null;
}

// AI 分析功能相关变量
let expandAnimationSpeed = 0.6; // 展开动画速度（秒）
let typewriterSpeed = 50; // 打字机速度（毫秒/字符）- 快速模式
let isFirstExpand = {}; // 记录每个内容区域是否首次展开
let isToggling = {}; // 防抖标记

// AI 分析功能
function toggleAIAnalysis(newsId) {
    try {
        console.log('🎯 toggleAIAnalysis called with newsId:', newsId);
        
        // 确保newsId是字符串
        const id = String(newsId);
        console.log('🔄 转换后的newsId:', id);
        
        // 防抖检查
        if (isToggling[id]) {
            console.log('⏳ 正在切换中，忽略重复点击');
            return;
        }
        
        // 打印所有可用的AI内容元素和按钮，帮助调试
        const allContentDivs = document.querySelectorAll('[id^="ai-content-"]');
        const allButtons = document.querySelectorAll('.ai-analysis-btn');
        
        console.log('🔍 可用的AI内容元素:', allContentDivs.length);
        Array.from(allContentDivs).forEach((div, index) => {
            console.log(`内容区域 ${index + 1}:`, {
                id: div.id,
                display: div.style.display,
                classList: Array.from(div.classList)
            });
        });
        
        console.log('🔍 可用的AI按钮:', allButtons.length);
        Array.from(allButtons).forEach((btn, index) => {
            console.log(`按钮 ${index + 1}:`, {
                newsId: btn.getAttribute('data-news-id'),
                attributes: Array.from(btn.attributes).map(attr => `${attr.name}=${attr.value}`).join(', ')
            });
        });
        
        const contentDiv = document.getElementById(`ai-content-${id}`);
        const button = document.querySelector(`.ai-analysis-btn[data-news-id="${id}"]`);
        
        if (!contentDiv || !button) {
            console.error('❌ 元素未找到:', { 
                id: id,
                contentDivId: `ai-content-${id}`,
                buttonSelector: `.ai-analysis-btn[data-news-id="${id}"]`,
                contentDiv: !!contentDiv, 
                button: !!button 
            });
            return;
        }
        
        const arrow = button.querySelector('.ai-arrow');
        const isExpanded = contentDiv.classList.contains('expanded');
        
        console.log('📊 当前状态:', { isExpanded, display: contentDiv.style.display });
        
        // 设置防抖标记
        isToggling[id] = true;
        
        if (!isExpanded) {
            // 展开 AI 分析
            console.log('📈 展开AI分析区域');
            
            // 检查是否首次展开，如果是则应用打字机效果
            if (!isFirstExpand[id]) {
                console.log('⌨️ 首次展开，启动打字机效果');
                isFirstExpand[id] = true;
                
                // 先启动打字机效果，在打字机效果中控制显示
                showAIAnalysisWithTypewriter(contentDiv, id);
            } else {
                // 非首次展开，直接显示内容
                contentDiv.style.display = 'block';
                setTimeout(() => {
                    contentDiv.classList.add('expanded');
                }, 10);
            }
            
            // 2. 按钮箭头变化
            if (arrow) {
                arrow.textContent = '▲';
            }
            
            // 3. 添加active样式类
            button.classList.add('active');
            
        } else {
            // 收起 AI 分析
            console.log('📉 收起AI分析区域');
            
            // 1. 收起AI分析区域
            contentDiv.classList.remove('expanded');
            setTimeout(() => {
                contentDiv.style.display = 'none';
            }, 600); // 修正为与CSS动画时间一致
            
            // 2. 按钮箭头变化
            if (arrow) {
                arrow.textContent = '▼';
            }
            
            // 3. 移除active样式类
            button.classList.remove('active');
        }
        
        // 添加视觉反馈
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
        
        // 清除防抖标记
        setTimeout(() => {
            isToggling[id] = false;
        }, 650);
        
    } catch (error) {
        console.error('💥 Error in toggleAIAnalysis:', error);
        // 出错时也要清除防抖标记
        isToggling[id] = false;
    }
}

// 处理分析内容，添加情绪颜色和股票标签
function processAnalysisContent(content, itemTitle) {
    let processedContent = content;
    
    // 处理情感倾向的颜色
    if (itemTitle === '情感倾向') {
        // 处理正面情感词汇
        processedContent = processedContent.replace(/(正面|积极|乐观)/g, '<span class="sentiment-positive">$1</span>');
        // 处理负面情感词汇
        processedContent = processedContent.replace(/(负面|消极|悲观)/g, '<span class="sentiment-negative">$1</span>');
        // 处理中性情感词汇
        processedContent = processedContent.replace(/(中性|中立)/g, '<span class="sentiment-neutral">$1</span>');
    }
    
    // 处理关联分析中的股票标签
    if (itemTitle === '关联分析') {
        // 先删除方括号
        processedContent = processedContent.replace(/\[|\]/g, '');
        
        // 匹配多种格式的股票标签
        // 格式1: "公司名-代码.交易所"
        const stockPattern1 = /"([^"]*-[A-Z0-9]+\.[A-Z]+)"/g;
        // 格式2: 公司名-代码.交易所 (无引号)
        const stockPattern2 = /([\u4e00-\u9fa5]+[\w\s]*-[A-Z0-9]+\.[A-Z]+)/g;
        // 格式3: "公司名-代码" (纯代码格式，如"携程-TCOM")
        const stockPattern3 = /"([\u4e00-\u9fa5]+[\w\s]*-[A-Z]+)"/g;
        // 格式4: 公司名-代码 (无引号，无交易所后缀，如"A股-SSE")
        const stockPattern4 = /([\u4e00-\u9fa5A-Z]+[\w\s]*-[A-Z]+)(?![A-Z\.])/g;
        // 格式5: "混合文本" (带引号的任意文本，如"东南亚区域SDR")
        const stockPattern5 = /"([\u4e00-\u9fa5A-Za-z0-9\s]+)"/g;
        
        // 处理带引号的标准股票标签 (格式1)
        const matches1 = content.match(stockPattern1);
        if (matches1) {
            matches1.forEach(match => {
                const stockName = match.replace(/"/g, '');
                const stockTag = `<span class="stock-tag">${stockName}</span>`;
                processedContent = processedContent.replace(match, stockTag);
            });
        }
        
        // 处理带引号的简化股票标签 (格式3)
        const matches3 = processedContent.match(stockPattern3);
        if (matches3) {
            matches3.forEach(match => {
                // 避免重复处理已经被span包裹的内容
                if (!processedContent.includes(`<span class="stock-tag">${match.replace(/"/g, '')}</span>`)) {
                    const stockName = match.replace(/"/g, '');
                    const stockTag = `<span class="stock-tag">${stockName}</span>`;
                    processedContent = processedContent.replace(match, stockTag);
                }
            });
        }
        
        // 处理不带引号的股票标签 (格式2)
        const matches2 = processedContent.match(stockPattern2);
        if (matches2) {
            matches2.forEach(match => {
                // 避免重复处理已经被span包裹的内容
                if (!processedContent.includes(`<span class="stock-tag">${match}</span>`)) {
                    const stockTag = `<span class="stock-tag">${match}</span>`;
                    processedContent = processedContent.replace(new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), stockTag);
                }
            });
        }
        
        // 处理无引号无交易所后缀的股票标签 (格式4)
        const matches4 = processedContent.match(stockPattern4);
        if (matches4) {
            matches4.forEach(match => {
                // 避免重复处理已经被span包裹的内容
                if (!processedContent.includes(`<span class="stock-tag">${match}</span>`)) {
                    const stockTag = `<span class="stock-tag">${match}</span>`;
                    processedContent = processedContent.replace(new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), stockTag);
                }
            });
        }
        
        // 处理带引号的混合文本标签 (格式5)
        const matches5 = processedContent.match(stockPattern5);
        if (matches5) {
            matches5.forEach(match => {
                // 避免重复处理已经被span包裹的内容
                const stockName = match.replace(/"/g, '');
                if (!processedContent.includes(`<span class="stock-tag">${stockName}</span>`)) {
                    const stockTag = `<span class="stock-tag">${stockName}</span>`;
                    processedContent = processedContent.replace(match, stockTag);
                }
            });
        }
    }
    
    // 处理深度分析中的分析点格式
    if (itemTitle === '深度分析') {
        // 格式化分析点和答案
        processedContent = processedContent.replace(/#分析点(\d+)：([^#]*?)答：([^#]*?)(?=#分析点|$)/g, 
            '<div class="analysis-point"><div class="question"><strong>分析点$1：</strong>$2</div><div class="answer"><strong>答：</strong>$3</div></div>');
    }
    
    return processedContent;
}

// 显示AI分析结果（带打字机效果）
function showAIAnalysisWithTypewriter(contentDiv, newsId) {
    try {
        console.log('⌨️ 开始打字机效果显示AI分析内容');
        
        // 从新闻数据中获取真实的AI分析数据
        const newsItem = newsData.find(item => item.id == newsId);
        if (!newsItem) {
            console.error('❌ News item not found for newsId:', newsId);
            return;
        }
        
        const analysisData = {
            title: "",
            analysisItems: [
                {
                    title: "情感倾向",
                    content: newsItem.mood || "暂无情感分析数据",
                    score: "--"
                },
                {
                    title: "关联分析",
                    content: newsItem.relation || "暂无关联分析数据",
                    score: "--"
                },
                {
                    title: "深度分析",
                    content: newsItem.analyze || "暂无深度分析数据",
                    score: "--"
                }
            ]
        };
        
        // 先清空内容区域
        contentDiv.innerHTML = '';
        
        // 创建完全隐藏的HTML结构
        const htmlContent = `
            <div class="ai-analysis-title" style="opacity: 0; height: 0; margin: 0; padding: 0;"></div>
            <div class="ai-analysis-items" style="opacity: 0; height: 0; margin: 0; padding: 0;">
                ${analysisData.analysisItems.map((_, index) => `
                    <div class="analysis-item" data-index="${index}" style="opacity: 0; height: 0; margin: 0; padding: 0;">
                        <div class="item-header">
                            <h4 class="item-title"></h4>
                            <span class="item-score"></span>
                        </div>
                        <p class="item-content"></p>
                    </div>
                `).join('')}
            </div>
        `;
        
        contentDiv.innerHTML = htmlContent;
        
        // 先显示容器但保持内容隐藏
        contentDiv.style.display = 'block';
        setTimeout(() => {
            contentDiv.classList.add('expanded');
        }, 10);
        
        // 定义要打字的内容和对应的元素
        const contentToType = [
            {
                element: contentDiv.querySelector('.ai-analysis-title'),
                content: analysisData.title,
                delay: 0
            }
        ];
        
        // 添加分析项
        analysisData.analysisItems.forEach((item, index) => {
            const itemElement = contentDiv.querySelector(`.analysis-item[data-index="${index}"]`);
            if (itemElement) {
                contentToType.push({
                    element: itemElement.querySelector('.item-title'),
                    content: item.title,
                    delay: 1000 + (index * 800)
                });
                contentToType.push({
                    element: itemElement.querySelector('.item-score'),
                    content: item.score,
                    delay: 1200 + (index * 800)
                });
                contentToType.push({
                    element: itemElement.querySelector('.item-content'),
                    content: item.content,
                    delay: 1400 + (index * 800),
                    isContent: true,
                    itemTitle: item.title
                });
            }
        });
        
        // 依次对每个元素应用打字机效果
        contentToType.forEach(({ element, content, delay, isContent, itemTitle }) => {
            if (element) {
                setTimeout(() => {
                    // 在开始打字前恢复元素的正常样式
                    element.style.opacity = '1';
                    element.style.height = 'auto';
                    element.style.margin = '';
                    element.style.padding = '';
                    
                    // 如果是分析项容器，也要恢复其父容器的样式
                    if (element.classList.contains('item-title')) {
                        const itemContainer = element.closest('.analysis-item');
                        if (itemContainer) {
                            itemContainer.style.opacity = '1';
                            itemContainer.style.height = 'auto';
                            itemContainer.style.margin = '';
                            itemContainer.style.padding = '';
                        }
                    }
                    
                    // 如果是第一个分析项的标题，也要显示分析项容器
                    if (element.classList.contains('item-title') && element.closest('.analysis-item[data-index="0"]')) {
                        const itemsContainer = contentDiv.querySelector('.ai-analysis-items');
                        if (itemsContainer) {
                            itemsContainer.style.opacity = '1';
                            itemsContainer.style.height = 'auto';
                            itemsContainer.style.margin = '';
                            itemsContainer.style.padding = '';
                        }
                    }
                    
                    // 处理内容的特殊格式
                    if (isContent && itemTitle) {
                        const processedContent = processAnalysisContent(content, itemTitle);
                        typeWriterEffect(element, processedContent, typewriterSpeed, true);
                    } else {
                        typeWriterEffect(element, content, typewriterSpeed);
                    }
                }, delay);
            }
        });
        
        console.log('✅ 打字机效果设置完成');
        
    } catch (error) {
        console.error('💥 打字机效果出错:', error);
        // 出错时直接显示内容
        showAIAnalysisResults(newsId);
    }
}

// 開始 AI 分析
function startAIAnalysis(newsId) {
    console.log('🚀 Starting AI analysis for newsId:', newsId);
    
    const loadingDiv = document.getElementById(`ai-loading-${newsId}`);
    const resultDiv = document.getElementById(`ai-result-${newsId}`);
    
    console.log('📋 Analysis elements:', {
        loadingDiv: !!loadingDiv,
        resultDiv: !!resultDiv
    });
    
    if (loadingDiv) {
        loadingDiv.style.display = 'flex';
        console.log('⏳ Loading animation started');
    }
    
    if (resultDiv) {
        resultDiv.style.display = 'none';
        // 清空之前的內容
        resultDiv.innerHTML = '';
    }
    
    // 模擬 AI 分析過程（1.5秒後顯示結果）
    setTimeout(() => {
        console.log('✅ AI analysis completed, showing results');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
        if (resultDiv) {
            resultDiv.style.display = 'block';
        }
        
        // 逐步顯示分析結果
        showAIAnalysisResults(newsId);
    }, 1500);
}

// 顯示 AI 分析結果（打字機效果）
function showAIAnalysisResults(newsId) {
    console.log('🎬 開始顯示AI分析結果，新聞ID:', newsId);
    
    const resultDiv = document.getElementById(`ai-result-${newsId}`);
    if (!resultDiv) {
        console.error('❌ Result div not found for newsId:', newsId);
        return;
    }
    
    // 確保結果區域可見並清空內容
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '';
    
    // 从新闻数据中获取真实的AI分析数据
    const newsItem = newsData.find(item => item.id == newsId);
    if (!newsItem) {
        console.error('❌ News item not found for newsId:', newsId);
        return;
    }
    
    const realAnalysis = {
        emotion: newsItem.mood || "暫無情緒分析數據",
        relation: newsItem.relation || "暫無關聯分析數據", 
        impact: newsItem.analyze || "暫無深度分析數據",
        investment: "基於以上分析，建議投資者謹慎評估風險，做好資產配置。"
    };
    
    // 分段顯示內容，實現動態窗口擴展
    const sections = [
        { id: `emotion-${newsId}`, title: '📊 情緒分析', content: realAnalysis.emotion, delay: 500 },
        { id: `relation-${newsId}`, title: '🔗 關聯分析', content: realAnalysis.relation, delay: 3000 },
        { id: `impact-${newsId}`, title: '📈 影響分析', content: realAnalysis.impact, delay: 6000 },
        { id: `investment-${newsId}`, title: '💡 投資建議', content: realAnalysis.investment, delay: 9000 }
    ];
    
    // 逐段創建和顯示分析結果
    sections.forEach((section, index) => {
        setTimeout(() => {
            console.log(`🎯 顯示${section.title}`);
            
            // 創建section容器
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'ai-section';
            sectionDiv.style.opacity = '0';
            sectionDiv.style.transform = 'translateY(20px)';
            sectionDiv.style.transition = 'all 0.5s ease';
            
            // 創建標題
            const titleElement = document.createElement('h4');
            titleElement.textContent = section.title;
            sectionDiv.appendChild(titleElement);
            
            // 創建內容容器
            const contentElement = document.createElement('div');
            contentElement.className = 'ai-content-text';
            contentElement.id = section.id;
            sectionDiv.appendChild(contentElement);
            
            // 添加到結果區域
            resultDiv.appendChild(sectionDiv);
            
            // 觸發進入動畫
            setTimeout(() => {
                sectionDiv.style.opacity = '1';
                sectionDiv.style.transform = 'translateY(0)';
            }, 100);
            
            // 開始打字機效果
            setTimeout(() => {
                typeWriterEffect(section.id, section.content);
            }, 600);
            
        }, section.delay);
    });
}

// 打字機效果函數（增強版）
function typeWriterEffect(elementId, text, speed = 80, isHTML = false) {
    try {
        console.log(`⌨️ Starting typewriter effect for ${elementId}`);
        
        const element = typeof elementId === 'string' ? 
            document.getElementById(elementId) : elementId;
        
        if (!element) {
            console.error('❌ Element not found:', elementId);
            return;
        }
        
        // 清空元素內容
        element.innerHTML = '';
        element.style.minHeight = '20px'; // 確保有最小高度
        
        let i = 0;
        const textLength = text.length;
        
        // 添加光标动画样式（如果还没有）
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
        
        // 添加光标
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        cursor.textContent = '|';
        element.appendChild(cursor);
        
        function typeChar() {
            if (i < textLength) {
                const char = text.charAt(i);
                
                // 在光标前插入字符
                if (isHTML) {
                    // 如果是HTML内容，需要特殊处理
                    const currentText = text.substring(0, i + 1);
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = currentText;
                    
                    // 清除光标前的内容并重新插入
                    const cursorParent = cursor.parentNode;
                    while (cursorParent.firstChild !== cursor) {
                        cursorParent.removeChild(cursorParent.firstChild);
                    }
                    
                    // 插入新的HTML内容
                    while (tempDiv.firstChild) {
                        cursorParent.insertBefore(tempDiv.firstChild, cursor);
                    }
                } else {
                    const textNode = document.createTextNode(char);
                    element.insertBefore(textNode, cursor);
                }
                
                // 動態調整容器高度
                const container = element.closest('.ai-analysis-content');
                if (container) {
                    container.style.height = 'auto';
                }
                
                // 滾動到可見區域
                if (i % 15 === 0) { // 每15個字符檢查一次
                    element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest' 
                    });
                }
                
                i++;
                
                // 根據字符類型調整速度
                let currentSpeed = speed;
                if (char === '。' || char === '！' || char === '？') {
                    currentSpeed = speed * 4; // 句號後停頓更久
                } else if (char === '，' || char === '、') {
                    currentSpeed = speed * 2.5; // 逗號後稍作停頓
                } else if (char === ' ') {
                    currentSpeed = speed * 0.5; // 空格稍快一些
                }
                
                setTimeout(typeChar, currentSpeed);
            } else {
                // 打字完成，移除光标
                setTimeout(() => {
                    if (cursor.parentNode) {
                        cursor.parentNode.removeChild(cursor);
                    }
                }, 500);
                console.log(`✅ Typewriter effect completed for ${elementId}`);
            }
        }
        
        // 開始打字
        setTimeout(typeChar, 300);
        
    } catch (error) {
        console.error('💥 Error in typeWriterEffect:', error);
        // 如果出錯，直接顯示完整文本
        const element = typeof elementId === 'string' ? 
            document.getElementById(elementId) : elementId;
        if (element) {
            element.innerHTML = text;
        }
    }
}

// 旋轉文字動畫功能
class RotatingText {
    constructor(elementId, texts, interval = 2000) {
        this.element = document.getElementById(elementId);
        this.texts = texts;
        this.interval = interval;
        this.currentIndex = 0;
        this.isAnimating = false;
        
        if (this.element) {
            this.start();
        }
    }
    
    start() {
        // 設置初始文字
        this.element.textContent = this.texts[0];
        this.element.classList.add('active');
        
        // 開始循環
        this.intervalId = setInterval(() => {
            this.rotateText();
        }, this.interval);
    }
    
    rotateText() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // 退出動畫
        this.element.classList.remove('active');
        this.element.classList.add('exit');
        
        setTimeout(() => {
            // 更新文字
            this.currentIndex = (this.currentIndex + 1) % this.texts.length;
            this.element.textContent = this.texts[this.currentIndex];
            
            // 進入動畫
            this.element.classList.remove('exit');
            this.element.classList.add('enter');
            
            setTimeout(() => {
                // 激活狀態
                this.element.classList.remove('enter');
                this.element.classList.add('active');
                this.isAnimating = false;
            }, 50);
        }, 300);
    }
}

// 初始化旋轉文字 - 添加到現有的DOMContentLoaded事件中
if (typeof window.rotatingTextInitialized === 'undefined') {
    window.rotatingTextInitialized = true;
    
    function initRotatingText() {
        const element = document.getElementById('rotatingText');
        if (element) {
            const rotatingTexts = ['新闻', 'News', '分析', '情報', '观点'];
            new RotatingText('rotatingText', rotatingTexts, 2000);
        }
    }
    
    // 等待DOM加載完成後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initRotatingText, 500);
        });
    } else {
        // DOM已經加載完成
        setTimeout(initRotatingText, 500);
    }
}