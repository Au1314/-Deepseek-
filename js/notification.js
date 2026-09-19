// ===== 智能提醒系统 =====
// 使用 Browser Notification API，纯前端实现

const NOTIFICATION_KEY = 'notification_settings';

// 默认设置
const DEFAULT_SETTINGS = {
    checkinReminder: true,        // 打卡提醒
    checkinTime: '19:00',         // 每晚7点提醒
    soundEnabled: true            // 是否播放提示音
};

// 获取通知设置
function getNotificationSettings() {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '{}') };
}

// 保存通知设置
function saveNotificationSettings(settings) {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(settings));
}

// 请求通知权限（首次调用时触发浏览器弹窗）
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('此浏览器不支持Notification API');
        return false;
    }
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

// 发送通知
function sendNotification(title, options = {}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    
    const defaultOptions = {
        icon: '/img/aichat_logo.png',       // 使用项目已有的图标
        badge: '/img/aichat_logo.png',
        vibrate: [200, 100, 200],            // 震动模式（移动端）
        requireInteraction: true,             // 通知不自动消失
        ...options
    };
    
    try {
        const notification = new Notification(title, defaultOptions);
        
        // 点击通知跳转到对应页面
        notification.onclick = function() {
            window.focus();
            if (options.url) {
                top.location.href = options.url;
            }
            this.close();
        };
        
        // 播放提示音（可选）
        const settings = getNotificationSettings();
        if (settings.soundEnabled) {
            playNotificationSound();
        }
    } catch (e) {
        console.error('发送通知失败:', e);
    }
}

// 播放提示音（使用 Web Audio API 生成简单提示音，无需音频文件）
let audioContext = null;
function playNotificationSound() {
    try {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;      // 800Hz 提示音
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        // 静默失败，音频不是关键功能
    }
}

// ===== 打卡提醒：定时检查是否已打卡，未打卡则提醒 =====
function setupCheckinReminder() {
    const settings = getNotificationSettings();
    if (!settings.checkinReminder) return;
    
    const [hour, minute] = settings.checkinTime.split(':').map(Number);
    
    // 计算下次提醒时间
    const now = new Date();
    let target = new Date();
    target.setHours(hour, minute, 0, 0);
    
    // 如果今天的目标时间已过，设置为明天
    if (now > target) {
        target.setDate(target.getDate() + 1);
    }
    
    const delay = target.getTime() - now.getTime();
    
    setTimeout(async () => {
        // 检查今天是否已打卡（通过 Text2SQL）
        try {
            const userinfo = JSON.parse(localStorage.getItem('user') || '{}');
            if (userinfo.user_id) {
                const today = new Date().toISOString().split('T')[0];
                const res = await fetchSQLWorkflow(
                    `查询用户id为${userinfo.user_id}且日期为${today}的打卡数据`,
                    userinfo.user_id
                );
                
                // 如果没有任何打卡记录，发送提醒
                if (!res || !res.result || res.result.length === 0) {
                    sendNotification('⏰ 该打卡啦！', {
                        body: '今天还没有打卡记录，快来打卡吧',
                        url: '/scheme/scheme.html',
                        tag: 'checkin-reminder'  // 同 tag 替换旧通知
                    });
                }
            }
        } catch (e) {
            // 查询失败也提醒，安全起见
            sendNotification('⏰ 该打卡啦！', {
                body: '记得完成今日的饮食和运动打卡哦',
                url: '/scheme/scheme.html',
                tag: 'checkin-reminder'
            });
        }
        
        // 设置明天的提醒
        setupCheckinReminder();
    }, delay);
}

// 导出供其他页面使用
window.requestNotificationPermission = requestNotificationPermission;
window.sendNotification = sendNotification;
window.getNotificationSettings = getNotificationSettings;
window.saveNotificationSettings = saveNotificationSettings;
window.setupCheckinReminder = setupCheckinReminder;
window.playNotificationSound = playNotificationSound;