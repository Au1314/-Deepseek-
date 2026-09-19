/**
 * 打卡记录列表 - JavaScript
 */

async function loadCheckInData(date) {
    const user = getUserInfo();
    if (!user) return;

    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const list = document.getElementById('cardList');
    list.innerHTML = `
        <div class="flex justify-center py-16">
            <div class="loading-spinner"></div>
        </div>`;

    try {
        const res = await fetchSQLWorkflow(`查询用户id为${user.user_id}，且日期为${dateStr}的打卡数据`, user.user_id);
        const data = res && res.result ? res.result : [];

        if (data.length === 0) {
            list.innerHTML = `
                <div class="text-center py-16">
                    <p class="text-gray-400 text-lg">暂无打卡记录</p>
                    <p class="text-gray-300 text-sm mt-2">去方案页完成今日打卡吧</p>
                </div>`;
            return;
        }

        data.forEach(item => {
            const icon = item.punch_type === '饮食' ? '/img/card_eat.png' : '/img/card_sport.png';
            list.innerHTML += `
                <div class="bg-white rounded-xl shadow-md p-6 mx-1 card">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-medium text-gray-800">${escapeHTML(item.punch_type)}打卡</h2>
                    </div>
                    <div class="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                        <div class="flex items-center">
                            <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                                <img src="${icon}" width="42" height="31"/>
                            </div>
                            <div>
                                <h3 class="text-sm font-medium text-gray-800">今日${escapeHTML(item.punch_type)}</h3>
                                <p class="text-xs text-gray-500">健康${escapeHTML(item.punch_type)}打卡</p>
                            </div>
                        </div>
                        <span class="btn">${escapeHTML(item.completion_status)}</span>
                    </div>
                    <div class="show-text">${escapeHTML(item.message || '无备注说明')}</div>
                </div>`;
        });
    } catch (err) {
        console.error('获取打卡数据失败:', err);
        list.innerHTML = `<div class="text-center py-16 text-gray-400">加载失败，请稍后重试</div>`;
    }
}

/**
 * HTML 转义函数，防止 XSS 攻击
 */
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

window.onload = function () {
    const container = document.getElementById('date-container');
    const today = new Date();
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const daysToShow = window.innerWidth < 640 ? 7 : 14;

    // 加载今天数据
    loadCheckInData(today);

    for (let i = 0; i < daysToShow; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const item = document.createElement('div');
        item.className = `date-item flex flex-col items-center justify-center px-3 py-2 rounded-lg shadow-sm cursor-pointer transition-colors ${i === 0 ? 'active bg-[#304FFF] text-white' : 'bg-white'}`;
        
        // 判断是否跨年，如果跨年则显示年份
        const isDifferentYear = date.getFullYear() !== today.getFullYear();
        const dateDisplay = isDifferentYear 
            ? `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
            : `${date.getMonth() + 1}/${date.getDate()}`;
        
        item.innerHTML = `
            <span class="text-xs ${i === 0 ? 'text-white/80' : 'text-gray-500'}">${dayNames[date.getDay()]}</span>
            <span class="text-sm font-semibold whitespace-nowrap">${dateDisplay}</span>`;

        item.addEventListener('click', function () {
            document.querySelectorAll('.date-item').forEach(el => {
                el.className = 'date-item flex flex-col items-center px-4 py-2 rounded-lg shadow-sm cursor-pointer bg-white';
                el.querySelector('span:first-child').classList.add('text-gray-500');
            });
            this.className = 'date-item flex flex-col items-center px-4 py-2 rounded-lg shadow-sm cursor-pointer active bg-[#304FFF] text-white';
            this.querySelector('span:first-child').classList.remove('text-gray-500');
            loadCheckInData(date);
        });

        container.appendChild(item);
    }
};