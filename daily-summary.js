// 每日新闻总结页面JavaScript

// 全局变量
let currentTheme = localStorage.getItem('theme') || 'dark';

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeWorldTime();
    initializeBackToTop();
    loadDailySummary();
    
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