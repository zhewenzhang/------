// 報紙風格新聞推送頁面 JavaScript

// 從配置文件獲取 Supabase 設置
const config = window.SUPABASE_CONFIG || {
    url: 'https://mayplvpysdjpnytpevnc.supabase.co',
    anonKey: 'YOUR_ANON_KEY_HERE',
    tableName: 'n8n_CLS_news'
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
let lastUpdateTime = null;
let autoRefreshInterval;
let timeUpdateInterval;
let isAutoRefreshEnabled = true;

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
        content: '此次任務的成功證明了私人企業在太空探索領域的巨大潛力。預計未來十年內，太空旅遊和太空製造將成為新興產業，為人類開拓全新的發展空間。'
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
        content: '這套AI系統結合了深度學習和醫學影像分析技術，能夠識別人眼難以察覺的早期病變。預計將在全球醫院推廣使用，大幅提高癌症治癒率。'
    }
];

// DOM 元素
const updateIndicator = document.getElementById('updateIndicator');
const tearAnimation = document.getElementById('tearAnimation');
const worldTimeElement = document.getElementById('worldTime');

// 將UTC時間轉換為北京時間並格式化（僅日期部分）
function formatDateToBeijingTime(utcDateString) {
    if (!utcDateString) return '';
    
    const date = new Date(utcDateString);
    if (isNaN(date.getTime())) {
        console.error('無效的日期字符串:', utcDateString);
        return '';
    }

    // 使用 toLocaleString 方法並指定時區，只獲取日期部分
    const beijingDate = date.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    // 將格式轉換為所需的格式
    const [year, month, day] = beijingDate.split('/');
    
    return `${year}年${month}月${day}日`;
}

// 組合日期和時間顯示
function formatNewsDateTime(rtimeString, timeString) {
    if (!rtimeString && !timeString) return '';
    
    const dateStr = formatDateToBeijingTime(rtimeString);
    
    if (timeString) {
        return `${dateStr} ${timeString}`;
    }
    
    return dateStr;
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
    
    timeZones.forEach(zone => {
        const timezone = zone.getAttribute('data-timezone');
        const dateElement = zone.querySelector('.time-date');
        const clockElement = zone.querySelector('.time-clock');
        
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
            dateElement.textContent = '--/--';
            clockElement.textContent = '--:--:--';
        }
    });
}

// 開始實時世界時間更新
function startTimeUpdate() {
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
    const dateTime = formatNewsDateTime(news.rtime, news.time);
    const title = news.title || '無標題';
    const source = news.tag || '未知來源';
    const content = news.content || '無內容描述';
    const tagsHTML = createTagsHTML(news.tag);
    
    return `
        <div class="news-item">
            <h2>${title}</h2>
            <div class="news-meta">
                <span>財聯社</span>
                <span>${dateTime}</span>
                ${tagsHTML}
            </div>
            <p>${content}</p>
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
    const newsListElement = document.getElementById('newsList');
    if (!newsListElement) {
        console.error('找不到新聞列表容器');
        return;
    }
    
    if (!newsList || newsList.length === 0) {
        newsListElement.innerHTML = '<div class="error">暫無新聞數據</div>';
        return;
    }
    
    console.log(`顯示 ${newsList.length} 條新聞`);
    const newsHTML = newsList.map(news => createNewsItemHTML(news)).join('');
    newsListElement.innerHTML = newsHTML;
    
    // 更新最後更新時間
    lastUpdateTime = new Date();
    console.log('新聞列表顯示完成，最後更新時間:', lastUpdateTime);
}

// 撕紙動畫效果
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
    try {
        console.log('開始獲取 Supabase 數據...');
        console.log('Supabase 客戶端狀態:', !!supabase);
        console.log('配置信息:', {
            url: config.url,
            tableName: config.tableName,
            hasAnonKey: !!config.anonKey && config.anonKey !== 'YOUR_ANON_KEY_HERE'
        });
        
        if (!supabase) {
            throw new Error('Supabase 未初始化');
        }
        
        // 首先檢查數據庫中最新的rtime
        console.log('正在檢查數據庫中最新的數據時間...');
        const { data: latestData, error: latestError } = await supabase
            .from('n8n_cls_news')
            .select('rtime')
            .not('rtime', 'is', null)
            .order('rtime', { ascending: false })
            .limit(1);

        if (latestError) {
            console.log(`檢查最新數據時發生錯誤: ${latestError.message}`);
        } else if (latestData && latestData.length > 0) {
            console.log(`數據庫中最新的rtime: ${latestData[0].rtime}`);
        } else {
            console.log('數據庫中沒有找到任何數據');
        }
        
        // 獲取最新的20條新聞數據
        console.log('正在獲取最新的20條新聞數據...');
        const { data, error } = await supabase
            .from('n8n_cls_news')
            .select('id, title, content, link, rtime, tag, time, timestamp')
            .not('rtime', 'is', null)  // 過濾掉rtime為null的記錄
            .order('rtime', { ascending: false })
            .limit(20);
        
        if (error) {
            console.error('Supabase 查詢錯誤:', error);
            throw error;
        }
        
        console.log('成功獲取數據:', data?.length || 0, '條新聞');
        if (data && data.length > 0) {
            console.log('最新新聞時間:', data[0].rtime);
            console.log('第一條新聞標題:', data[0].title);
        }
        
        return data || [];
    } catch (error) {
        console.error('獲取 Supabase 數據失敗:', error);
        return null;
    }
}

// 檢查數據更新
async function checkForUpdates() {
    console.log('=== 開始檢查更新 ===');
    showUpdateIndicator();
    
    try {
        // 嘗試從 Supabase 獲取數據
        const supabaseData = await fetchNewsFromSupabase();
        
        console.log('Supabase 數據獲取結果:', {
            hasData: !!supabaseData,
            dataLength: supabaseData?.length || 0,
            isArray: Array.isArray(supabaseData)
        });
        
        if (supabaseData && supabaseData.length > 0) {
            // 檢查是否有新數據，優先使用rtime字段
            const latestNews = supabaseData[0];
            const latestTime = new Date(latestNews.rtime || latestNews.created_at).getTime();
            
            console.log('最新新聞信息:', {
                title: latestNews.title,
                rtime: latestNews.rtime,
                created_at: latestNews.created_at,
                latestTime: latestTime,
                lastUpdateTime: lastUpdateTime
            });
            
            if (!lastUpdateTime || latestTime > lastUpdateTime) {
                console.log('發現新聞更新，使用 Supabase 數據');
                newsData = supabaseData;
                lastUpdateTime = latestTime;
                currentNewsIndex = 0;
                
                // 播放撕紙動畫並更新
                await playTearAnimation();
                displayNewsList(newsData);
            } else {
                console.log('沒有新的更新');
            }
        } else {
            // 使用模擬數據
            if (newsData.length === 0) {
                console.log('Supabase 無數據，使用模擬數據');
                newsData = mockNewsData;
                displayNewsList(newsData);
            }
        }
    } catch (error) {
        console.error('檢查更新失敗:', error);
        if (newsData.length === 0) {
            console.log('錯誤處理：使用模擬數據');
            newsData = mockNewsData;
            displayNewsList(newsData);
        }
    } finally {
        hideUpdateIndicator();
        console.log('=== 檢查更新完成 ===');
    }
}

// 顯示更新指示器
function showUpdateIndicator() {
    updateIndicator.classList.add('show');
}

// 隱藏更新指示器
function hideUpdateIndicator() {
    setTimeout(() => {
        updateIndicator.classList.remove('show');
    }, 1000);
}

// 移除新聞輪播功能
// function startNewsRotation() - 已移除

// 自動刷新控制
function startAutoRefresh() {
    if (isAutoRefreshEnabled) {
        autoRefreshInterval = setInterval(checkForUpdates, 30000); // 每30秒檢查一次
        console.log('自動刷新已啟動');
    }
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        console.log('自動刷新已停止');
    }
}

function toggleAutoRefresh(enabled) {
    isAutoRefreshEnabled = enabled;
    if (enabled) {
        startAutoRefresh();
    } else {
        stopAutoRefresh();
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
    if (savedTheme === 'light') {
        body.setAttribute('data-theme', 'light');
    }
    
    // 主题切换事件
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        if (newTheme === 'light') {
            body.setAttribute('data-theme', 'light');
        } else {
            body.removeAttribute('data-theme');
        }
        
        // 保存到本地存储
        localStorage.setItem('theme', newTheme);
    });
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('報紙風格新聞頁面初始化');
    
    // 開始實時時間更新
    startTimeUpdate();
    
    // 顯示載入狀態
    showLoadingNews();
    
    // 設置導航
    setupNavigation();
    
    // 設置鍵盤快捷鍵
    setupKeyboardShortcuts();
    
    // 設置返回顶部按钮功能
    setupBackToTop();
    
    // 設置主题切换功能
    setupThemeToggle();
    
    // 設置自動刷新開關事件監聽
    const autoRefreshToggle = document.getElementById('autoRefreshToggle');
    if (autoRefreshToggle) {
        autoRefreshToggle.addEventListener('change', (e) => {
            toggleAutoRefresh(e.target.checked);
        });
    }
    
    // 初始載入新聞
    setTimeout(() => {
        checkForUpdates();
    }, 1000);
    
    // 開始自動刷新（如果啟用）
    setTimeout(() => {
        startAutoRefresh();
    }, 2000);
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
        }
        // 立即檢查更新
        checkForUpdates();
    }
});

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