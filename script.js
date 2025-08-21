// 報紙風格新聞推送頁面 JavaScript
// 注意：此文件依賴 js/utils.js 中的公共函數

// 從 utils.js 導入公共函數
// 確保在使用前 utils.js 已經載入

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

// 獲取DOM元素 - 使用utils.js中的統一函數
const tearAnimation = safeQuerySelector('#tearAnimation');
const refreshProgress = safeQuerySelector('#refreshProgress');
const refreshProgressBar = safeQuerySelector('#refreshProgressBar');
const refreshProgressText = safeQuerySelector('#refreshProgressText');
const refreshCompleteNotification = safeQuerySelector('#refreshCompleteNotification');
const worldTimeElement = safeQuerySelector('#worldTime');

// 將UTC時間轉換為北京時間並格式化（僅日期部分）
// formatDateToBeijingTime 函數已移至 js/utils.js

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

// updateWorldTime 函數已移至 utils.js，此處不再重複定義

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
// createNewsItemHTML 函數已移至 js/utils.js，使用時需傳入 { includeAIAnalysis: true } 選項

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
    const newsHTML = newsWithIds.map(news => createNewsItemHTML(news, { includeAIAnalysis: true })).join('');
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
    
    const newsHTML = filteredNewsData.map(news => createNewsItemHTML(news, { includeAIAnalysis: true })).join('');
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
// setupAIAnalysisEventDelegation 函數已移至 utils.js，此處不再重複定義

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
// 檢查防抖狀態
function checkDebounceState(id) {
    if (isToggling[id]) {
        console.log('⏳ 正在切换中，忽略重复点击');
        return true;
    }
    return false;
}

// 調試信息輸出
function logDebugInfo() {
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
}

// 獲取DOM元素
function getAnalysisElements(id) {
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
        return null;
    }
    
    return { contentDiv, button };
}

// 展開AI分析區域
function expandAnalysis(contentDiv, button, id) {
    console.log('📈 展开AI分析区域');
    
    // 檢查是否首次展開
    if (!isFirstExpand[id]) {
        console.log('⌨️ 首次展开，启动打字机效果');
        isFirstExpand[id] = true;
        showAIAnalysisWithTypewriter(contentDiv, id);
    } else {
        // 非首次展開，直接顯示內容
        contentDiv.style.display = 'block';
        setTimeout(() => {
            contentDiv.classList.add('expanded');
        }, 10);
    }
    
    updateButtonState(button, true);
}

// 收起AI分析區域
function collapseAnalysis(contentDiv, button) {
    console.log('📉 收起AI分析区域');
    
    contentDiv.classList.remove('expanded');
    setTimeout(() => {
        contentDiv.style.display = 'none';
    }, 600);
    
    updateButtonState(button, false);
}

// 更新按鈕狀態
function updateButtonState(button, isExpanded) {
    const arrow = button.querySelector('.ai-arrow');
    
    if (arrow) {
        arrow.textContent = isExpanded ? '▲' : '▼';
    }
    
    if (isExpanded) {
        button.classList.add('active');
    } else {
        button.classList.remove('active');
    }
}

// 添加視覺反饋
function addVisualFeedback(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
}

// 設置和清除防抖標記
function setDebounceFlag(id, value, delay = 0) {
    if (delay > 0) {
        setTimeout(() => {
            isToggling[id] = value;
        }, delay);
    } else {
        isToggling[id] = value;
    }
}

// 主函式：切換AI分析
function toggleAIAnalysis(newsId) {
    try {
        console.log('🎯 toggleAIAnalysis called with newsId:', newsId);
        
        const id = String(newsId);
        console.log('🔄 转换后的newsId:', id);
        
        // 防抖檢查
        if (checkDebounceState(id)) return;
        
        // 調試信息
        logDebugInfo();
        
        // 獲取DOM元素
        const elements = getAnalysisElements(id);
        if (!elements) return;
        
        const { contentDiv, button } = elements;
        const isExpanded = contentDiv.classList.contains('expanded');
        
        console.log('📊 当前状态:', { isExpanded, display: contentDiv.style.display });
        
        // 設置防抖標記
        setDebounceFlag(id, true);
        
        // 根據當前狀態執行相應操作
        if (!isExpanded) {
            expandAnalysis(contentDiv, button, id);
        } else {
            collapseAnalysis(contentDiv, button);
        }
        
        // 添加視覺反饋
        addVisualFeedback(button);
        
        // 清除防抖標記
        setDebounceFlag(id, false, 650);
        
    } catch (error) {
        console.error('💥 Error in toggleAIAnalysis:', error);
        // 出錯時也要清除防抖標記
        isToggling[id] = false;
    }
}

// 處理情感傾向的顏色標記
function processSentimentColors(content) {
    let processedContent = content;
    
    // 處理正面情感詞彙
    processedContent = processedContent.replace(/(正面|积极|乐观)/g, '<span class="sentiment-positive">$1</span>');
    // 處理負面情感詞彙
    processedContent = processedContent.replace(/(负面|消极|悲观)/g, '<span class="sentiment-negative">$1</span>');
    // 處理中性情感詞彙
    processedContent = processedContent.replace(/(中性|中立)/g, '<span class="sentiment-neutral">$1</span>');
    
    return processedContent;
}

// 定義股票標籤的正則表達式模式
function getStockPatterns() {
    return {
        // 格式1: "公司名-代码.交易所"
        pattern1: /"([^"]*-[A-Z0-9]+\.[A-Z]+)"/g,
        // 格式2: 公司名-代码.交易所 (无引号)
        pattern2: /([\u4e00-\u9fa5]+[\w\s]*-[A-Z0-9]+\.[A-Z]+)/g,
        // 格式3: "公司名-代码" (纯代码格式)
        pattern3: /"([\u4e00-\u9fa5]+[\w\s]*-[A-Z]+)"/g,
        // 格式4: 公司名-代码 (无引号，无交易所后缀)
        pattern4: /([\u4e00-\u9fa5A-Z]+[\w\s]*-[A-Z]+)(?![A-Z\.])/g,
        // 格式5: "混合文本" (带引号的任意文本)
        pattern5: /"([\u4e00-\u9fa5A-Za-z0-9\s]+)"/g
    };
}

// 處理單一格式的股票標籤
function processStockPattern(content, processedContent, pattern, formatType) {
    const matches = content.match(pattern);
    if (!matches) return processedContent;
    
    matches.forEach(match => {
        let stockName, stockTag;
        
        if (formatType === 'quoted') {
            // 帶引號的格式
            stockName = match.replace(/"/g, '');
            stockTag = `<span class="stock-tag">${stockName}</span>`;
            
            if (!processedContent.includes(stockTag)) {
                processedContent = processedContent.replace(match, stockTag);
            }
        } else {
            // 不帶引號的格式
            stockTag = `<span class="stock-tag">${match}</span>`;
            
            if (!processedContent.includes(stockTag)) {
                const escapedMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                processedContent = processedContent.replace(new RegExp(escapedMatch, 'g'), stockTag);
            }
        }
    });
    
    return processedContent;
}

// 處理關聯分析中的股票標籤
function processRelationAnalysisStocks(content) {
    // 先刪除方括號
    let processedContent = content.replace(/\[|\]/g, '');
    
    const patterns = getStockPatterns();
    
    // 處理各種格式的股票標籤
    processedContent = processStockPattern(content, processedContent, patterns.pattern1, 'quoted');
    processedContent = processStockPattern(content, processedContent, patterns.pattern3, 'quoted');
    processedContent = processStockPattern(content, processedContent, patterns.pattern5, 'quoted');
    processedContent = processStockPattern(content, processedContent, patterns.pattern2, 'unquoted');
    processedContent = processStockPattern(content, processedContent, patterns.pattern4, 'unquoted');
    
    return processedContent;
}

// 處理深度分析的格式化
function processDeepAnalysisFormat(content) {
    // 格式化分析點和答案
    return content.replace(/#分析点(\d+)：([^#]*?)答：([^#]*?)(?=#分析点|$)/g, 
        '<div class="analysis-point"><div class="question"><strong>分析点$1：</strong>$2</div><div class="answer"><strong>答：</strong>$3</div></div>');
}

// 主函式：處理分析內容，添加情緒顏色和股票標籤
function processAnalysisContent(content, itemTitle) {
    let processedContent = content;
    
    // 根據項目標題進行不同處理
    if (itemTitle === '情感倾向') {
        processedContent = processSentimentColors(processedContent);
    }
    
    if (itemTitle === '关联分析') {
        processedContent = processRelationAnalysisStocks(processedContent);
    }
    
    if (itemTitle === '深度分析') {
        processedContent = processDeepAnalysisFormat(processedContent);
    }
    
    return processedContent;
}

// 显示AI分析结果（带打字机效果）
// 獲取新聞項目的AI分析數據
function getNewsAnalysisData(newsId) {
    const newsItem = newsData.find(item => item.id == newsId);
    if (!newsItem) {
        console.error('❌ News item not found for newsId:', newsId);
        return null;
    }
    
    return {
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
}

// 創建隱藏的HTML結構
function createHiddenAnalysisStructure(analysisData) {
    return `
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
}

// 準備打字機內容數組
function prepareTypewriterContent(contentDiv, analysisData) {
    const contentToType = [
        {
            element: contentDiv.querySelector('.ai-analysis-title'),
            content: analysisData.title,
            delay: 0
        }
    ];
    
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
    
    return contentToType;
}

// 恢復元素樣式
function restoreElementStyles(element) {
    element.style.opacity = '1';
    element.style.height = 'auto';
    element.style.margin = '';
    element.style.padding = '';
}

// 恢復容器樣式
function restoreContainerStyles(element, contentDiv) {
    if (element.classList.contains('item-title')) {
        const itemContainer = element.closest('.analysis-item');
        if (itemContainer) {
            restoreElementStyles(itemContainer);
        }
        
        // 如果是第一個分析項的標題，也要顯示分析項容器
        if (element.closest('.analysis-item[data-index="0"]')) {
            const itemsContainer = contentDiv.querySelector('.ai-analysis-items');
            if (itemsContainer) {
                restoreElementStyles(itemsContainer);
            }
        }
    }
}

// 執行打字機效果
function executeTypewriterEffects(contentToType, contentDiv) {
    contentToType.forEach(({ element, content, delay, isContent, itemTitle }) => {
        if (element) {
            setTimeout(() => {
                restoreElementStyles(element);
                restoreContainerStyles(element, contentDiv);
                
                // 處理內容的特殊格式
                if (isContent && itemTitle) {
                    const processedContent = processAnalysisContent(content, itemTitle);
                    typeWriterEffect(element, processedContent, typewriterSpeed, true);
                } else {
                    typeWriterEffect(element, content, typewriterSpeed);
                }
            }, delay);
        }
    });
}

// 主函式：顯示AI分析打字機效果
function showAIAnalysisWithTypewriter(contentDiv, newsId) {
    try {
        console.log('⌨️ 开始打字机效果显示AI分析内容');
        
        // 獲取分析數據
        const analysisData = getNewsAnalysisData(newsId);
        if (!analysisData) return;
        
        // 清空內容區域並創建結構
        contentDiv.innerHTML = '';
        contentDiv.innerHTML = createHiddenAnalysisStructure(analysisData);
        
        // 顯示容器但保持內容隱藏
        contentDiv.style.display = 'block';
        setTimeout(() => {
            contentDiv.classList.add('expanded');
        }, 10);
        
        // 準備並執行打字機效果
        const contentToType = prepareTypewriterContent(contentDiv, analysisData);
        executeTypewriterEffects(contentToType, contentDiv);
        
        console.log('✅ 打字机效果设置完成');
        
    } catch (error) {
        console.error('💥 打字机效果出错:', error);
        // 出錯時直接顯示內容
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
// typeWriterEffect 函數已移至 utils.js，此處不再重複定義

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