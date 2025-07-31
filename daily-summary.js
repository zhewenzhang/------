// 每日新闻总结页面JavaScript

// 全局变量
let currentTheme = localStorage.getItem('theme') || 'dark';

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 防止script.js中的錯誤
    preventScriptErrors();
    
    initializeTheme();
    initializeWorldTime();
    initializeBackToTop();
    initializeDockNavigation();
    initializeAurora();
    initializeSentimentDashboard();
    loadDailySummary();
    
    // 设置定时器更新时间
    setInterval(updateWorldTime, 1000);
    
    // 设置定时器更新情感分析数据
    setInterval(updateSentimentStats, 30000); // 每30秒更新一次
});

// 初始化Dock導航
function initializeDockNavigation() {
    const dockItems = document.querySelectorAll('.dock-item');
    console.log('找到dock項目數量:', dockItems.length);
    
    dockItems.forEach((item, index) => {
        const page = item.getAttribute('data-page');
        console.log(`綁定dock項目 ${index}: ${page}`);
        
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const clickedPage = this.getAttribute('data-page');
            console.log('點擊了dock項目:', clickedPage);
            handleDockNavigation(clickedPage);
        });
    });
}

// 處理Dock導航點擊
function handleDockNavigation(page) {
    console.log('處理導航到頁面:', page);
    
    switch(page) {
        case 'home':
            console.log('跳轉到首頁: index.html');
            window.location.href = 'index.html';
            break;
        case 'summary':
            console.log('當前已在總結頁面，不需要跳轉');
            // 當前頁面，不需要跳轉
            break;
        case 'user':
            console.log('用戶頁面功能待實現');
            // 用戶頁面功能待實現
            break;
        case 'settings':
            console.log('設置頁面功能待實現');
            // 設置頁面功能待實現
            break;
        default:
            console.log('未知的頁面:', page);
            break;
    }
}

// 初始化Aurora背景
function initializeAurora() {
    // 確保Aurora相關函數存在
    if (typeof window.initializeAurora === 'function') {
        window.initializeAurora();
    }
    
    // 設置Aurora主題集成
    if (typeof window.setupThemeAuroraIntegration === 'function') {
        window.setupThemeAuroraIntegration();
    }
}

// 情感分析數據
let sentimentData = {
    positive: 0,
    neutral: 0,
    negative: 0,
    total: 0,
    lastUpdate: null
};

// 模擬新聞數據（包含情感標籤）
const mockNewsWithSentiment = [
    { id: 1, title: 'AI技術革命：新一代語言模型震撼發布', sentiment: 'positive' },
    { id: 2, title: '全球氣候峰會達成歷史性協議', sentiment: 'positive' },
    { id: 3, title: '革命性電池技術問世，電動車續航突破新極限', sentiment: 'positive' },
    { id: 4, title: '數位貨幣監管新政策正式實施', sentiment: 'neutral' },
    { id: 5, title: '私人太空探索創造新里程碑', sentiment: 'positive' },
    { id: 6, title: '醫療AI診斷準確率達到新高度', sentiment: 'positive' },
    { id: 7, title: '全球經濟面臨通脹壓力', sentiment: 'negative' },
    { id: 8, title: '網絡安全威脅持續增加', sentiment: 'negative' },
    { id: 9, title: '新興市場波動加劇', sentiment: 'negative' },
    { id: 10, title: '科技股表現平穩', sentiment: 'neutral' },
    { id: 11, title: '教育改革政策發布', sentiment: 'neutral' },
    { id: 12, title: '城市交通擁堵問題待解決', sentiment: 'negative' }
];

// 初始化情感分析儀表板
function initializeSentimentDashboard() {
    console.log('初始化情感分析儀表板...');
    
    // 初始化數據
    analyzeSentimentData();
    updateSentimentDisplay();
    updateLastUpdateTime();
    
    console.log('情感分析儀表板初始化完成');
}

// 分析情感數據
function analyzeSentimentData() {
    // 模擬從新聞數據中分析情感
    const currentHour = new Date().getHours();
    
    // 根據時間動態調整數據（模擬實時變化）
    const timeVariation = Math.sin(currentHour * Math.PI / 12) * 0.3 + 0.7;
    
    sentimentData.positive = Math.floor((mockNewsWithSentiment.filter(n => n.sentiment === 'positive').length + Math.random() * 3) * timeVariation);
    sentimentData.neutral = Math.floor((mockNewsWithSentiment.filter(n => n.sentiment === 'neutral').length + Math.random() * 2) * timeVariation);
    sentimentData.negative = Math.floor((mockNewsWithSentiment.filter(n => n.sentiment === 'negative').length + Math.random() * 2) * timeVariation);
    
    sentimentData.total = sentimentData.positive + sentimentData.neutral + sentimentData.negative;
    sentimentData.lastUpdate = new Date();
    
    console.log('情感分析數據:', sentimentData);
}

// 更新情感統計顯示
function updateSentimentDisplay() {
    const positiveCount = document.getElementById('positiveCount');
    const neutralCount = document.getElementById('neutralCount');
    const negativeCount = document.getElementById('negativeCount');
    
    const positivePercentage = document.getElementById('positivePercentage');
    const neutralPercentage = document.getElementById('neutralPercentage');
    const negativePercentage = document.getElementById('negativePercentage');
    
    const trendIndicator = document.getElementById('trendIndicator');
    const trendFill = document.getElementById('trendFill');
    
    if (sentimentData.total > 0) {
        // 更新數字（帶動畫效果）
        animateNumber(positiveCount, sentimentData.positive);
        animateNumber(neutralCount, sentimentData.neutral);
        animateNumber(negativeCount, sentimentData.negative);
        
        // 計算百分比
        const posPercent = Math.round((sentimentData.positive / sentimentData.total) * 100);
        const neuPercent = Math.round((sentimentData.neutral / sentimentData.total) * 100);
        const negPercent = Math.round((sentimentData.negative / sentimentData.total) * 100);
        
        // 更新百分比
        if (positivePercentage) positivePercentage.textContent = `${posPercent}%`;
        if (neutralPercentage) neutralPercentage.textContent = `${neuPercent}%`;
        if (negativePercentage) negativePercentage.textContent = `${negPercent}%`;
        
        // 更新趨勢指示器
        updateTrendIndicator(posPercent, neuPercent, negPercent, trendIndicator, trendFill);
    }
}

// 數字動畫效果
function animateNumber(element, targetNumber) {
    if (!element) return;
    
    const currentNumber = parseInt(element.textContent) || 0;
    const increment = targetNumber > currentNumber ? 1 : -1;
    const duration = 1000; // 1秒
    const steps = Math.abs(targetNumber - currentNumber);
    const stepDuration = steps > 0 ? duration / steps : 0;
    
    let current = currentNumber;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        
        if (current === targetNumber) {
            clearInterval(timer);
        }
    }, stepDuration);
}

// 更新趨勢指示器
function updateTrendIndicator(posPercent, neuPercent, negPercent, trendIndicator, trendFill) {
    let trendText = '';
    let trendWidth = 50; // 默認50%
    
    if (posPercent > negPercent + 20) {
        trendText = '積極樂觀';
        trendWidth = 80 + (posPercent - negPercent) / 2;
    } else if (posPercent > negPercent + 10) {
        trendText = '偏向正面';
        trendWidth = 65 + (posPercent - negPercent) / 3;
    } else if (negPercent > posPercent + 20) {
        trendText = '偏向負面';
        trendWidth = 20 - (negPercent - posPercent) / 2;
    } else if (negPercent > posPercent + 10) {
        trendText = '略顯消極';
        trendWidth = 35 - (negPercent - posPercent) / 3;
    } else {
        trendText = '中性平衡';
        trendWidth = 50;
    }
    
    // 確保寬度在合理範圍內
    trendWidth = Math.max(10, Math.min(90, trendWidth));
    
    if (trendIndicator) trendIndicator.textContent = trendText;
    if (trendFill) trendFill.style.width = `${trendWidth}%`;
}

// 更新最後更新時間
function updateLastUpdateTime() {
    const lastUpdateElement = document.getElementById('lastUpdateTime');
    if (lastUpdateElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-TW', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        lastUpdateElement.textContent = timeString;
    }
}

// 更新情感統計（定時調用）
function updateSentimentStats() {
    console.log('更新情感分析統計...');
    analyzeSentimentData();
    updateSentimentDisplay();
    updateLastUpdateTime();
}

// 防止script.js中的錯誤
function preventScriptErrors() {
    // 禁用自動刷新相關功能，因為daily-summary頁面不需要
    window.isAutoRefreshEnabled = false;
    window.autoRefreshInterval = null;
    
    // 創建虛擬元素防止錯誤
    if (!document.getElementById('manualLoadBtn')) {
        const dummyBtn = document.createElement('div');
        dummyBtn.id = 'manualLoadBtn';
        dummyBtn.style.display = 'none';
        document.body.appendChild(dummyBtn);
    }
    
    if (!document.getElementById('autoRefreshToggle')) {
        const dummyToggle = document.createElement('input');
        dummyToggle.type = 'checkbox';
        dummyToggle.id = 'autoRefreshToggle';
        dummyToggle.style.display = 'none';
        document.body.appendChild(dummyToggle);
    }
    
    if (!document.getElementById('newsList')) {
        const dummyList = document.createElement('div');
        dummyList.id = 'newsList';
        dummyList.style.display = 'none';
        document.body.appendChild(dummyList);
    }
    
    // 覆蓋script.js中的handlePageNavigation函數，確保dock導航正常工作
    window.handlePageNavigation = function(page) {
        console.log('daily-summary頁面處理導航到頁面:', page);
        handleDockNavigation(page);
    };
}

// 主题初始化
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// 主题切换
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
}

// 世界时间初始化
function initializeWorldTime() {
    updateWorldTime();
}

// 更新世界时间
function updateWorldTime() {
    const timeZones = document.querySelectorAll('.time-zone');
    
    timeZones.forEach(zone => {
        const timezone = zone.getAttribute('data-timezone');
        const now = new Date();
        
        // 格式化日期 (MM/DD)
        const dateOptions = {
            timeZone: timezone,
            month: '2-digit',
            day: '2-digit'
        };
        const dateString = now.toLocaleDateString('en-US', dateOptions);
        
        // 格式化时间 (HH:MM:SS)
        const timeOptions = {
            timeZone: timezone,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        const timeString = now.toLocaleTimeString('en-US', timeOptions);
        
        // 更新显示
        const dateElement = zone.querySelector('.time-date');
        const clockElement = zone.querySelector('.time-clock');
        
        if (dateElement) dateElement.textContent = dateString;
        if (clockElement) clockElement.textContent = timeString;
    });
}

// 返回顶部功能
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        // 监听滚动事件
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.opacity = '1';
                backToTopBtn.style.visibility = 'visible';
            } else {
                backToTopBtn.style.opacity = '0';
                backToTopBtn.style.visibility = 'hidden';
            }
        });
        
        // 点击返回顶部
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// 加载每日新闻总结
function loadDailySummary() {
    const summarySections = document.getElementById('summarySections');
    
    // 模拟每日新闻总结数据
    const mockSummary = [
        {
            icon: '🌍',
            title: '国际要闻',
            content: '今日国际新闻聚焦于联合国气候峰会的重要进展，各国代表就减少碳排放达成新的共识。同时，全球经济复苏态势良好，主要股指创下历史新高。科技领域也传来好消息，人工智能在医疗诊断方面取得重大突破，准确率显著提升。',
            count: 15,
            time: '30分钟前更新'
        },
        {
            icon: '💼',
            title: '财经动态',
            content: '今日财经市场表现活跃，科技股领涨大盘，投资者信心持续增强。央行政策保持稳健，为市场提供充足流动性。新兴产业板块表现突出，特别是新能源和人工智能相关企业获得资本青睐。数字货币市场也出现回暖迹象。',
            count: 12,
            time: '45分钟前更新'
        },
        {
            icon: '🔬',
            title: '科技创新',
            content: '科技领域今日亮点频现，AI技术在多个领域取得突破性进展。量子计算研究获得新的里程碑，有望在未来几年实现商业化应用。同时，5G网络建设加速推进，为物联网和智慧城市发展奠定基础。生物技术领域也传来好消息，基因治疗技术日趋成熟。',
            count: 8,
            time: '1小时前更新'
        },
        {
            icon: '🏥',
            title: '社会民生',
            content: '民生领域关注度较高的话题包括教育改革的最新进展，在线教育平台用户数量持续增长。医疗健康方面，远程医疗服务覆盖面进一步扩大，为偏远地区居民提供便利。环保政策实施效果显著，空气质量持续改善。',
            count: 10,
            time: '1小时15分钟前更新'
        }
    ];
    
    // 清空加载状态
    summarySections.innerHTML = '';
    
    // 渲染总结部分
    mockSummary.forEach(section => {
        const summarySection = createSummarySection(section);
        summarySections.appendChild(summarySection);
    });
}

// 创建总结部分
function createSummarySection(section) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'summary-section';
    
    sectionDiv.innerHTML = `
        <div class="summary-header">
            <div class="summary-icon">${section.icon}</div>
            <h3 class="summary-title">${section.title}</h3>
        </div>
        <div class="summary-content">${section.content}</div>
        <div class="summary-stats">
            <div class="summary-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
                ${section.count} 条新闻
            </div>
            <div class="summary-time">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                ${section.time}
            </div>
        </div>
    `;
    
    return sectionDiv;
}