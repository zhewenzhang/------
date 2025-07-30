// 世界事件页面JavaScript

// 全局变量
let currentTheme = localStorage.getItem('theme') || 'dark';
let moodChart = null;

// Supabase配置
const config = window.SUPABASE_CONFIG || {
    url: 'https://mayplvpysdjpnytpevnc.supabase.co',
    anonKey: 'YOUR_ANON_KEY_HERE',
    tableName: 'n8n_cls_news_geminiai'
};

// 初始化Supabase
let supabase;
try {
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(config.url, config.anonKey);
    } else {
        console.log('Supabase 未加载，使用模拟数据');
    }
} catch (error) {
    console.log('Supabase 初始化失败，使用模拟数据:', error);
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeWorldTime();
    initializeBackToTop();
    loadMoodAnalysis();
    loadWorldEvents();
    
    // 设置定时器更新时间
    setInterval(updateWorldTime, 1000);
});

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
    
    // 更新饼图主题
    if (moodChart) {
        updateChartTheme();
    }
}

// 更新图表主题
function updateChartTheme() {
    if (!moodChart) return;
    
    // 更新边框颜色
    moodChart.data.datasets[0].borderColor = currentTheme === 'dark' ? '#1a1a1a' : '#ffffff';
    
    // 更新提示框主题
    moodChart.options.plugins.tooltip.backgroundColor = currentTheme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    moodChart.options.plugins.tooltip.titleColor = currentTheme === 'dark' ? '#ffffff' : '#000000';
    moodChart.options.plugins.tooltip.bodyColor = currentTheme === 'dark' ? '#ffffff' : '#000000';
    moodChart.options.plugins.tooltip.borderColor = currentTheme === 'dark' ? '#333333' : '#cccccc';
    
    // 重新渲染图表
    moodChart.update('none');
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
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
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

// 加载情感分析数据
async function loadMoodAnalysis() {
    try {
        let moodData;
        
        if (supabase) {
            // 从Supabase获取最新日期的情感分析数据
            const { data, error } = await supabase
                .from(config.tableName)
                .select('mood, created_at')
                .not('mood', 'is', null)
                .order('created_at', { ascending: false })
                .limit(1000); // 获取最近1000条记录
            
            if (error) {
                console.error('获取情感分析数据失败:', error);
                moodData = getMockMoodData();
            } else {
                // 获取最新日期
                const latestDate = data.length > 0 ? new Date(data[0].created_at).toDateString() : null;
                
                // 筛选最新日期的数据
                const latestData = data.filter(item => 
                    new Date(item.created_at).toDateString() === latestDate
                );
                
                // 统计各情感类型数量
                const moodCounts = latestData.reduce((acc, item) => {
                    acc[item.mood] = (acc[item.mood] || 0) + 1;
                    return acc;
                }, {});
                
                moodData = [
                    { type: '正面', value: moodCounts['正面'] || 0, color: '#52c41a' },
                    { type: '中性', value: moodCounts['中性'] || 0, color: '#faad14' },
                    { type: '负面', value: moodCounts['负面'] || 0, color: '#ff4d4f' }
                ];
            }
        } else {
            moodData = getMockMoodData();
        }
        
        renderMoodChart(moodData);
        renderMoodStats(moodData);
        
    } catch (error) {
        console.error('加载情感分析数据时出错:', error);
        const moodData = getMockMoodData();
        renderMoodChart(moodData);
        renderMoodStats(moodData);
    }
}

// 获取模拟情感分析数据
function getMockMoodData() {
    return [
        { type: '正面', value: 176, color: '#52c41a' },
        { type: '中性', value: 153, color: '#faad14' },
        { type: '负面', value: 125, color: '#ff4d4f' }
    ];
}

// 渲染情感分析饼图
function renderMoodChart(data) {
    const ctx = document.getElementById('moodPieChart');
    if (!ctx) return;
    
    // 销毁现有图表
    if (moodChart) {
        moodChart.destroy();
    }
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    moodChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(item => item.type),
            datasets: [{
                data: data.map(item => item.value),
                backgroundColor: data.map(item => item.color),
                borderColor: currentTheme === 'dark' ? '#1a1a1a' : '#ffffff',
                borderWidth: 3,
                hoverBorderWidth: 4,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false // 隐藏默认图例，使用自定义统计
                },
                tooltip: {
                    backgroundColor: currentTheme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    titleColor: currentTheme === 'dark' ? '#ffffff' : '#000000',
                    bodyColor: currentTheme === 'dark' ? '#ffffff' : '#000000',
                    borderColor: currentTheme === 'dark' ? '#333333' : '#cccccc',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed}条 (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// 渲染情感统计信息
function renderMoodStats(data) {
    const statsContainer = document.getElementById('moodStats');
    if (!statsContainer) return;
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    const statsHTML = data.map(item => {
        const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
        return `
            <div class="mood-stat-item">
                <div class="mood-stat-color" style="background-color: ${item.color}"></div>
                <div class="mood-stat-info">
                    <p class="mood-stat-label">${item.type}</p>
                    <p class="mood-stat-value">${item.value}条</p>
                    <p class="mood-stat-percentage">${percentage}%</p>
                </div>
            </div>
        `;
    }).join('');
    
    statsContainer.innerHTML = statsHTML;
}

// 加载世界事件数据
function loadWorldEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    
    // 模拟世界事件数据
    const mockEvents = [
        {
            category: '政治',
            title: '联合国气候峰会达成新协议',
            description: '各国代表就减少碳排放达成重要共识，承诺在2030年前实现更严格的环保目标。',
            time: '2小时前',
            source: 'Reuters'
        },
        {
            category: '经济',
            title: '全球股市创历史新高',
            description: '受科技股强劲表现推动，主要股指均创下历史新高，投资者信心持续增强。',
            time: '4小时前',
            source: 'Bloomberg'
        },
        {
            category: '科技',
            title: 'AI技术在医疗领域取得突破',
            description: '新的人工智能系统能够提前预测疾病风险，准确率达到95%以上。',
            time: '6小时前',
            source: 'Nature'
        },
        {
            category: '社会',
            title: '全球教育数字化转型加速',
            description: '疫情推动下，在线教育平台用户数量激增，教育方式发生根本性变化。',
            time: '8小时前',
            source: 'UNESCO'
        },
        {
            category: '环境',
            title: '南极冰川融化速度加快',
            description: '最新研究显示，南极冰川融化速度比预期快30%，海平面上升风险增加。',
            time: '10小时前',
            source: 'Science'
        },
        {
            category: '体育',
            title: '奥运会筹备工作进展顺利',
            description: '下届奥运会场馆建设已完成80%，各项准备工作按计划推进。',
            time: '12小时前',
            source: 'IOC'
        }
    ];
    
    // 清空加载状态
    eventsGrid.innerHTML = '';
    
    // 渲染事件卡片
    mockEvents.forEach(event => {
        const eventCard = createEventCard(event);
        eventsGrid.appendChild(eventCard);
    });
}

// 创建事件卡片
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    card.innerHTML = `
        <div class="event-category">${event.category}</div>
        <h3 class="event-title">${event.title}</h3>
        <p class="event-description">${event.description}</p>
        <div class="event-meta">
            <div class="event-time">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                ${event.time}
            </div>
            <div class="event-source">${event.source}</div>
        </div>
    `;
    
    return card;
}

// 导航功能
function navigateToHome() {
    window.location.href = 'index.html';
}

function navigateToDailySummary() {
    window.location.href = 'daily-summary.html';
}