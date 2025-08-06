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
    initializeHourlyAnalysis();
    loadDailySummary();
    
    // 设置定时器更新时间
    setInterval(updateWorldTime, 1000);
    
    // 设置定时器更新24小时新闻数据
    setInterval(loadHourlyNewsData, 5 * 60 * 1000); // 每5分钟更新一次
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

// 24小時新聞分析數據
let hourlyNewsData = {
    hours: Array(24).fill(null).map((_, i) => ({
        hour: i,
        positive: 0,
        neutral: 0,
        negative: 0,
        total: 0
    })),
    totalNews: 0,
    peakHour: 0,
    avgPerHour: 0,
    lastUpdate: null
};

// Supabase配置 (使用不同的變量名避免衝突)
const dailySummaryConfig = window.SUPABASE_CONFIG || {
    url: 'https://uwvlduprxppwdkjkvwby.supabase.co',
    anonKey: 'YOUR_ANON_KEY_HERE',
    tableName: 'n8n_cls_news_geminiai'
};

// 初始化Supabase
let dailySummarySupabase;
try {
    if (typeof window.supabase !== 'undefined' && dailySummaryConfig.anonKey && dailySummaryConfig.anonKey !== 'YOUR_ANON_KEY_HERE') {
        dailySummarySupabase = window.supabase.createClient(dailySummaryConfig.url, dailySummaryConfig.anonKey);
        console.log('Daily Summary Supabase 客戶端初始化成功');
    } else {
        console.log('Daily Summary Supabase 未配置，使用模擬數據');
    }
} catch (error) {
    console.log('Daily Summary Supabase 初始化失敗，使用模擬數據:', error);
}

// 模擬24小時新聞數據
function generateMockHourlyData() {
    const mockData = Array(24).fill(null).map((_, hour) => {
        // 模擬新聞發布的時間分布（工作時間更多新聞）
        let baseCount;
        if (hour >= 6 && hour <= 22) {
            baseCount = Math.floor(Math.random() * 15) + 5; // 5-20條
        } else {
            baseCount = Math.floor(Math.random() * 5) + 1; // 1-6條
        }
        
        // 隨機分配情感
        const positive = Math.floor(baseCount * (0.3 + Math.random() * 0.3)); // 30-60%
        const negative = Math.floor(baseCount * (0.1 + Math.random() * 0.2)); // 10-30%
        const neutral = baseCount - positive - negative;
        
        return {
            hour,
            positive: Math.max(0, positive),
            neutral: Math.max(0, neutral),
            negative: Math.max(0, negative),
            total: baseCount
        };
    });
    
    return mockData;
}

// 初始化24小時新聞分析
function initializeHourlyAnalysis() {
    console.log('初始化24小時新聞分析...');
    
    // 獲取並分析數據
    loadHourlyNewsData();
    
    // 初始化Magic Bento效果
    initializeMagicBentoEffects();
    
    console.log('24小時新聞分析初始化完成');
}

// 初始化Magic Bento效果
function initializeMagicBentoEffects() {
    const cards = document.querySelectorAll('.summary-card');
    
    cards.forEach(card => {
        // 添加粒子元素
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            card.appendChild(particle);
        }
        
        // 磁性效果
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            const tiltX = deltaY * 10;
            const tiltY = deltaX * -10;
            
            card.style.transform = `translateY(-8px) rotateX(${5 + tiltX}deg) rotateY(${5 + tiltY}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
        
        // 點擊漣漪效果
        card.addEventListener('click', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.width = '0';
            ripple.style.height = '0';
            ripple.style.background = 'rgba(77, 254, 6, 0.3)';
            ripple.style.borderRadius = '50%';
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.style.animation = 'ripple 0.6s ease-out';
            ripple.style.pointerEvents = 'none';
            
            card.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // 添加漣漪動畫CSS
    if (!document.querySelector('#ripple-animation')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation';
        style.textContent = `
            @keyframes ripple {
                to {
                    width: 200px;
                    height: 200px;
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// 從Supabase獲取今日新聞數據
async function loadHourlyNewsData() {
    try {
        if (dailySummarySupabase) {
            console.log('從Daily Summary Supabase獲取今日新聞數據...');
            
            // 獲取今日數據（北京時間）
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            
            const { data, error } = await dailySummarySupabase
                .from(dailySummaryConfig.tableName)
                .select('rtime, mood, created_at')
                .gte('rtime', startOfDay.toISOString())
                .lt('rtime', endOfDay.toISOString())
                .not('rtime', 'is', null);
            
            if (error) {
                console.error('獲取數據失敗:', error);
                useSimulatedData();
            } else {
                console.log(`成功獲取 ${data.length} 條今日新聞數據`);
                processHourlyData(data);
            }
        } else {
            console.log('Daily Summary Supabase未初始化，使用模擬數據');
            useSimulatedData();
        }
    } catch (error) {
        console.error('數據獲取異常:', error);
        useSimulatedData();
    }
}

// 使用模擬數據
function useSimulatedData() {
    console.log('使用模擬數據生成24小時分析...');
    const mockData = generateMockHourlyData();
    hourlyNewsData.hours = mockData;
    calculateSummaryStats();
    updateHourlyDisplay();
    updateLastUpdateTime();
}

// 處理按小時分組的數據
function processHourlyData(newsData) {
    // 重置小時數據
    hourlyNewsData.hours = Array(24).fill(null).map((_, i) => ({
        hour: i,
        positive: 0,
        neutral: 0,
        negative: 0,
        total: 0
    }));
    
    // 按小時分組統計
    newsData.forEach(news => {
        const newsTime = new Date(news.rtime);
        const hour = newsTime.getHours();
        
        if (hour >= 0 && hour < 24) {
            hourlyNewsData.hours[hour].total++;
            
            // 根據mood字段分類情感
            const mood = news.mood || 'neutral';
            if (mood.includes('正面') || mood.includes('积极') || mood.includes('positive')) {
                hourlyNewsData.hours[hour].positive++;
            } else if (mood.includes('负面') || mood.includes('消极') || mood.includes('negative')) {
                hourlyNewsData.hours[hour].negative++;
            } else {
                hourlyNewsData.hours[hour].neutral++;
            }
        }
    });
    
    calculateSummaryStats();
    updateHourlyDisplay();
    updateLastUpdateTime();
}

// 計算總體統計數據
function calculateSummaryStats() {
    hourlyNewsData.totalNews = hourlyNewsData.hours.reduce((sum, hour) => sum + hour.total, 0);
    
    // 計算正面和負面新聞總數
    const totalPositive = hourlyNewsData.hours.reduce((sum, hour) => sum + hour.positive, 0);
    const totalNegative = hourlyNewsData.hours.reduce((sum, hour) => sum + hour.negative, 0);
    
    // 計算正面/負面比例
    let sentimentRatio = '--';
    if (totalNegative > 0) {
        const ratio = (totalPositive / totalNegative).toFixed(1);
        sentimentRatio = `${ratio}:1`;
    } else if (totalPositive > 0) {
        sentimentRatio = `${totalPositive}:0`;
    }
    
    hourlyNewsData.sentimentRatio = sentimentRatio;
    hourlyNewsData.totalPositive = totalPositive;
    hourlyNewsData.totalNegative = totalNegative;
    hourlyNewsData.avgPerHour = Math.round(hourlyNewsData.totalNews / 24 * 10) / 10;
    hourlyNewsData.lastUpdate = new Date();
}

// 更新24小時分析顯示
function updateHourlyDisplay() {
    updateSummaryCards();
    generateTimelineChart();
    generateHourlyDetails();
}

// 更新總結卡片
function updateSummaryCards() {
    const totalNewsCount = document.getElementById('totalNewsCount');
    const sentimentRatio = document.getElementById('sentimentRatio');
    const avgPerHour = document.getElementById('avgPerHour');
    
    if (totalNewsCount) {
        animateNumber(totalNewsCount, hourlyNewsData.totalNews);
    }
    
    if (sentimentRatio) {
        sentimentRatio.textContent = hourlyNewsData.sentimentRatio;
        
        // 根據比例添加顏色樣式
        sentimentRatio.className = 'summary-number';
        if (hourlyNewsData.sentimentRatio !== '--') {
            const ratio = parseFloat(hourlyNewsData.sentimentRatio.split(':')[0]);
            if (ratio > 2) {
                sentimentRatio.style.color = '#22c55e'; // 綠色 - 正面較多
            } else if (ratio < 0.5) {
                sentimentRatio.style.color = '#ef4444'; // 紅色 - 負面較多
            } else {
                sentimentRatio.style.color = '#f59e0b'; // 橙色 - 相對平衡
            }
        }
    }
    
    if (avgPerHour) {
        animateNumber(avgPerHour, hourlyNewsData.avgPerHour);
    }
}

// 生成時間軸圖表
function generateTimelineChart() {
    const timelineChart = document.getElementById('timelineChart');
    if (!timelineChart) return;
    
    // 找出最大值用於標準化高度
    const maxCount = Math.max(...hourlyNewsData.hours.map(h => h.total));
    
    const chartHTML = `
        <div class="hour-bar-container">
            ${hourlyNewsData.hours.map(hour => {
                const heightPercent = maxCount > 0 ? (hour.total / maxCount) * 100 : 0;
                const positiveHeight = hour.total > 0 ? (hour.positive / hour.total) * heightPercent : 0;
                const neutralHeight = hour.total > 0 ? (hour.neutral / hour.total) * heightPercent : 0;
                const negativeHeight = hour.total > 0 ? (hour.negative / hour.total) * heightPercent : 0;
                
                return `
                    <div class="hour-bar" data-hour="${hour.hour}" title="${hour.hour}:00 - ${hour.total}條新聞">
                        <div class="bar-stack" style="height: ${Math.max(heightPercent, 4)}px;">
                            ${hour.positive > 0 ? `<div class="bar-segment positive" style="height: ${positiveHeight}px;"></div>` : ''}
                            ${hour.neutral > 0 ? `<div class="bar-segment neutral" style="height: ${neutralHeight}px;"></div>` : ''}
                            ${hour.negative > 0 ? `<div class="bar-segment negative" style="height: ${negativeHeight}px;"></div>` : ''}
                        </div>
                        <div class="hour-label">${hour.hour.toString().padStart(2, '0')}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    timelineChart.innerHTML = chartHTML;
}

// 生成小時詳情
function generateHourlyDetails() {
    const hourlyDetails = document.getElementById('hourlyDetails');
    if (!hourlyDetails) return;
    
    // 只顯示有新聞的時段，按新聞數量排序
    const activeHours = hourlyNewsData.hours
        .filter(hour => hour.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 12); // 最多顯示12個時段
    
    const detailsHTML = activeHours.map(hour => {
        return `
            <div class="hour-detail-card">
                <div class="hour-detail-header">
                    <div class="hour-time">${hour.hour.toString().padStart(2, '0')}:00 - ${(hour.hour + 1).toString().padStart(2, '0')}:00</div>
                    <div class="hour-total">${hour.total}條</div>
                </div>
                <div class="hour-breakdown">
                    ${hour.positive > 0 ? `<div class="breakdown-item positive"><div class="breakdown-dot"></div>${hour.positive}正面</div>` : ''}
                    ${hour.neutral > 0 ? `<div class="breakdown-item neutral"><div class="breakdown-dot"></div>${hour.neutral}中性</div>` : ''}
                    ${hour.negative > 0 ? `<div class="breakdown-item negative"><div class="breakdown-dot"></div>${hour.negative}負面</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    hourlyDetails.innerHTML = detailsHTML || '<div class="hour-detail-card"><div class="hour-time">暂无数据</div></div>';
    
    // 為新生成的卡片添加Magic Bento效果
    addMagicBentoToDetailCards();
}

// 為詳情卡片添加Magic Bento效果
function addMagicBentoToDetailCards() {
    const detailCards = document.querySelectorAll('.hour-detail-card');
    
    detailCards.forEach(card => {
        // 添加粒子元素
        for (let i = 0; i < 3; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            card.appendChild(particle);
        }
        
        // 磁性效果
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            const tiltX = deltaY * 5;
            const tiltY = deltaX * -5;
            
            card.style.transform = `translateY(-6px) rotateX(${3 + tiltX}deg) rotateY(${tiltY}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
        
        // 點擊漣漪效果
        card.addEventListener('click', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.width = '0';
            ripple.style.height = '0';
            ripple.style.background = 'rgba(77, 254, 6, 0.2)';
            ripple.style.borderRadius = '50%';
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.style.animation = 'ripple 0.6s ease-out';
            ripple.style.pointerEvents = 'none';
            
            card.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}
// 數字動畫效果
function animateNumber(element, targetNumber) {
    if (!element) return;
    
    const currentNumber = parseFloat(element.textContent) || 0;
    const increment = (targetNumber - currentNumber) / 20; // 20步完成動畫
    let current = currentNumber;
    let step = 0;
    
    const timer = setInterval(() => {
        step++;
        current += increment;
        
        if (step >= 20) {
            element.textContent = targetNumber;
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current * 10) / 10; // 保留一位小數
        }
    }, 50); // 每50ms一步，總共1秒
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
function updateHourlyStats() {
    console.log('更新24小時新聞統計數據...');
    loadHourlyNewsData();
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