// Aurora背景效果JavaScript控制

// Aurora配置参数
let auroraConfig = {
    intensity: 1.0,
    speed: 1.0,
    amplitude: 1.0,
    blend: 0.5,
    opacity: 0.8,
    hue: 200,
    saturation: 70,
    lightness: 50,
    colorStops: ['#0a0a0a', '#00d4ff', '#1a1a2e']
};

// 初始化Aurora效果
document.addEventListener('DOMContentLoaded', function() {
    initializeAurora();
    initializeAuroraControls();
    setupThemeAuroraIntegration();
});

// 初始化Aurora背景
function initializeAurora() {
    const auroraBackground = document.getElementById('auroraBackground');
    if (!auroraBackground) return;
    
    // 应用初始配置
    updateAuroraEffect();
    
    // 监听窗口大小变化
    window.addEventListener('resize', debounce(updateAuroraEffect, 250));
}

// 初始化Aurora控制面板
function initializeAuroraControls() {
    const controls = document.getElementById('auroraControls');
    const toggleBtn = document.getElementById('auroraToggleBtn');
    
    if (!controls || !toggleBtn) return;
    
    // 切换控制面板显示/隐藏
    toggleBtn.addEventListener('click', function() {
        controls.classList.toggle('collapsed');
        toggleBtn.textContent = controls.classList.contains('collapsed') ? '展开' : '收起';
    });
    
    // 绑定滑块事件
    bindSliderEvents();
    
    // 初始化控制面板为收起状态（移动端）
    if (window.innerWidth <= 768) {
        controls.classList.add('collapsed');
        toggleBtn.textContent = '展开';
    }
}

// 绑定滑块控制事件
function bindSliderEvents() {
    const sliders = {
        intensity: document.getElementById('intensitySlider'),
        speed: document.getElementById('speedSlider'),
        amplitude: document.getElementById('amplitudeSlider'),
        blend: document.getElementById('blendSlider'),
        opacity: document.getElementById('opacitySlider'),
        hue: document.getElementById('hueSlider'),
        saturation: document.getElementById('saturationSlider'),
        lightness: document.getElementById('lightnessSlider')
    };
    
    const valueDisplays = {
        intensity: document.getElementById('intensityValue'),
        speed: document.getElementById('speedValue'),
        amplitude: document.getElementById('amplitudeValue'),
        blend: document.getElementById('blendValue'),
        opacity: document.getElementById('opacityValue'),
        hue: document.getElementById('hueValue'),
        saturation: document.getElementById('saturationValue'),
        lightness: document.getElementById('lightnessValue')
    };
    
    Object.keys(sliders).forEach(key => {
        const slider = sliders[key];
        const display = valueDisplays[key];
        
        if (slider && display) {
            slider.addEventListener('input', function() {
                const value = parseFloat(this.value);
                auroraConfig[key] = value;
                
                // 更新显示值，为百分比类型添加%符号，为角度添加°符号
                if (key === 'saturation' || key === 'lightness') {
                    display.textContent = value.toFixed(0) + '%';
                } else if (key === 'hue') {
                    display.textContent = value.toFixed(0) + '°';
                } else {
                    display.textContent = value.toFixed(1);
                }
                
                updateAuroraEffect();
            });
            
            // 设置初始值
            slider.value = auroraConfig[key];
            if (key === 'saturation' || key === 'lightness') {
                display.textContent = auroraConfig[key].toFixed(0) + '%';
            } else if (key === 'hue') {
                display.textContent = auroraConfig[key].toFixed(0) + '°';
            } else {
                display.textContent = auroraConfig[key].toFixed(1);
            }
        }
    });
}

// 更新Aurora效果
function updateAuroraEffect() {
    const auroraBackground = document.getElementById('auroraBackground');
    if (!auroraBackground) return;
    
    // 生成动态颜色
    const primaryColor = `hsl(${auroraConfig.hue}, ${auroraConfig.saturation}%, ${auroraConfig.lightness}%)`;
    const secondaryColor = `hsl(${(auroraConfig.hue + 60) % 360}, ${auroraConfig.saturation}%, ${Math.max(auroraConfig.lightness - 20, 10)}%)`;
    const tertiaryColor = `hsl(${(auroraConfig.hue + 120) % 360}, ${auroraConfig.saturation}%, ${Math.min(auroraConfig.lightness + 20, 90)}%)`;
    
    // 更新CSS自定义属性
    const root = document.documentElement;
    root.style.setProperty('--aurora-intensity', auroraConfig.intensity);
    root.style.setProperty('--aurora-speed', auroraConfig.speed);
    root.style.setProperty('--aurora-amplitude', auroraConfig.amplitude);
    root.style.setProperty('--aurora-blend', auroraConfig.blend);
    root.style.setProperty('--aurora-opacity', auroraConfig.opacity);
    root.style.setProperty('--aurora-primary', primaryColor);
    root.style.setProperty('--aurora-secondary', secondaryColor);
    root.style.setProperty('--aurora-tertiary', tertiaryColor);
    
    // 动态更新动画持续时间
    const beforeElement = auroraBackground;
    const baseSpeed = 20; // 基础动画时间（秒）
    const newDuration = baseSpeed / auroraConfig.speed;
    
    beforeElement.style.setProperty('--aurora-duration', `${newDuration}s`);
    beforeElement.style.setProperty('--aurora-duration-reverse', `${newDuration * 1.25}s`);
    
    // 更新透明度
    beforeElement.style.opacity = auroraConfig.opacity;
}

// 设置Aurora预设
function setAuroraPreset(preset) {
    const presets = {
        gentle: {
            intensity: 0.6,
            speed: 0.8,
            amplitude: 0.7,
            blend: 0.3,
            opacity: 0.5,
            hue: 220,
            saturation: 40,
            lightness: 60
        },
        dynamic: {
            intensity: 1.2,
            speed: 1.5,
            amplitude: 1.3,
            blend: 0.6,
            opacity: 0.8,
            hue: 200,
            saturation: 70,
            lightness: 50
        },
        intense: {
            intensity: 1.8,
            speed: 2.2,
            amplitude: 1.8,
            blend: 0.8,
            opacity: 0.9,
            hue: 180,
            saturation: 90,
            lightness: 40
        },
        rainbow: {
            intensity: 1.5,
            speed: 1.8,
            amplitude: 1.5,
            blend: 0.7,
            opacity: 0.8,
            hue: 300,
            saturation: 85,
            lightness: 55
        }
    };
    
    const config = presets[preset];
    if (!config) return;
    
    // 更新配置
    Object.assign(auroraConfig, config);
    
    // 更新滑块值
    updateSliderValues();
    
    // 应用效果
    updateAuroraEffect();
    
    // 添加视觉反馈
    showPresetFeedback(preset);
}

// 更新滑块显示值
function updateSliderValues() {
    const sliders = {
        intensity: document.getElementById('intensitySlider'),
        speed: document.getElementById('speedSlider'),
        amplitude: document.getElementById('amplitudeSlider'),
        blend: document.getElementById('blendSlider'),
        opacity: document.getElementById('opacitySlider'),
        hue: document.getElementById('hueSlider'),
        saturation: document.getElementById('saturationSlider'),
        lightness: document.getElementById('lightnessSlider')
    };
    
    const valueDisplays = {
        intensity: document.getElementById('intensityValue'),
        speed: document.getElementById('speedValue'),
        amplitude: document.getElementById('amplitudeValue'),
        blend: document.getElementById('blendValue'),
        opacity: document.getElementById('opacityValue'),
        hue: document.getElementById('hueValue'),
        saturation: document.getElementById('saturationValue'),
        lightness: document.getElementById('lightnessValue')
    };
    
    Object.keys(sliders).forEach(key => {
        const slider = sliders[key];
        const display = valueDisplays[key];
        
        if (slider && display) {
            slider.value = auroraConfig[key];
            
            // 更新显示值，为百分比类型添加%符号，为角度添加°符号
            if (key === 'saturation' || key === 'lightness') {
                display.textContent = auroraConfig[key].toFixed(0) + '%';
            } else if (key === 'hue') {
                display.textContent = auroraConfig[key].toFixed(0) + '°';
            } else {
                display.textContent = auroraConfig[key].toFixed(1);
            }
        }
    });
}

// 显示预设应用反馈
function showPresetFeedback(preset) {
    const presetNames = {
        gentle: '柔和',
        dynamic: '动感',
        intense: '强烈',
        rainbow: '彩虹'
    };
    
    // 创建临时提示
    const feedback = document.createElement('div');
    feedback.className = 'aurora-preset-feedback';
    feedback.textContent = `已应用 ${presetNames[preset]} 预设`;
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
        z-index: 10000;
        animation: fadeInOut 2s ease-in-out;
    `;
    
    document.body.appendChild(feedback);
    
    // 2秒后移除
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 2000);
}

// 主题切换时调整Aurora效果
function setupThemeAuroraIntegration() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    // 监听主题变化
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                adjustAuroraForTheme();
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
    
    // 初始调整
    adjustAuroraForTheme();
}

// 根据主题调整Aurora效果
function adjustAuroraForTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const auroraBackground = document.getElementById('auroraBackground');
    
    if (!auroraBackground) return;
    
    if (currentTheme === 'light') {
        // 明亮模式下降低强度
        auroraBackground.style.opacity = Math.min(auroraConfig.intensity * 0.7, 1);
    } else {
        // 暗黑模式下使用正常强度
        auroraBackground.style.opacity = auroraConfig.intensity;
    }
}

// 性能优化：防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 检测设备性能并调整效果
function detectPerformanceAndAdjust() {
    // 检测是否为低性能设备
    const isLowPerformance = (
        navigator.hardwareConcurrency <= 2 || 
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
    
    if (isLowPerformance) {
        // 在低性能设备上降低效果
        auroraConfig.intensity *= 0.7;
        auroraConfig.speed *= 0.8;
        updateAuroraEffect();
        updateSliderValues();
    }
}

// 添加CSS动画关键帧（如果需要动态调整）
function addDynamicAuroraStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        
        .aurora-background::before {
            animation-duration: var(--aurora-duration, 20s);
        }
        
        .aurora-background::after {
            animation-duration: var(--aurora-duration-reverse, 25s);
        }
    `;
    document.head.appendChild(style);
}

// 页面加载完成后进行性能检测
window.addEventListener('load', function() {
    detectPerformanceAndAdjust();
    addDynamicAuroraStyles();
});

// 导出函数供全局使用
window.setAuroraPreset = setAuroraPreset;