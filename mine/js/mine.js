// Tailwind 自定义配置
tailwind.config = {
    theme: {
        extend: {
            colors: { primary: '#4F46E5', secondary: '#E5E7EB' },
            borderRadius: { 'button': '4px' }
        }
    }
}

window.onload = function() {
    // ① 从 localStorage 读取用户信息
    const userJson = localStorage.getItem("user");
    if (userJson) {
        const user = JSON.parse(userJson);
        // 根据 user_id 匹配头像：id=1 用 user1.png，否则默认 user2.png
        if (user.user_id == 1) {
            document.getElementById('userAvatar').src = '/img/user1.png';
        } else {
            document.getElementById('userAvatar').src = user.avatar_url || '/img/user2.png';
        }
        document.getElementById('userName').textContent = user.username || '用户';
        
        // ② 管理员菜单：仅 username === 'admin' 时显示
        const adminMenuItem = document.querySelector('#menuList div:nth-child(7)');
        if (adminMenuItem && user.username !== 'admin') {
            adminMenuItem.style.display = 'none';
        }
    }
    
    // ③ 退出登录：清空所有缓存 → 跳转登录页
    document.getElementById('logoutBtn').addEventListener('click', function() {
        // 清除所有本地存储（用户信息、缓存数据等）
        localStorage.clear();
        // 清除会话存储（风险信息等缓存）
        sessionStorage.clear();
        top.location.href = '/login.html';
    });
};

// ④ 打开通知设置面板
function openNotificationSettings() {
    const settings = getNotificationSettings();
    
    Swal.fire({
        title: '通知设置',
        html: `
            <div class="text-left space-y-4">
                <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span class="text-sm">每日打卡提醒</span>
                    <input type="checkbox" id="checkinReminder" ${settings.checkinReminder ? 'checked' : ''} class="toggle">
                </label>
                <div id="checkinTimeRow" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span class="text-sm">提醒时间</span>
                    <input type="time" id="checkinTime" value="${settings.checkinTime}" class="border rounded p-1 text-sm">
                </div>
                <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span class="text-sm">提示音</span>
                    <input type="checkbox" id="soundEnabled" ${settings.soundEnabled ? 'checked' : ''} class="toggle">
                </label>
                <div class="text-xs text-gray-500 mt-2">
                    通知需要浏览器授权，请确保已允许本网站发送通知
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        confirmButtonColor: '#304FFF',
        preConfirm: () => {
            const newSettings = {
                checkinReminder: document.getElementById('checkinReminder').checked,
                checkinTime: document.getElementById('checkinTime').value,
                soundEnabled: document.getElementById('soundEnabled').checked
            };
            saveNotificationSettings(newSettings);
            // 重新设置定时器
            setupCheckinReminder();
            return true;
        }
    });
}

// 暴露到全局
window.openNotificationSettings = openNotificationSettings;
