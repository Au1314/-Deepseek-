/**
 * 方案展示与打卡 - JavaScript
 * API 调用部分为占位，后续接入
 */

// 添加饮食项
function addMeal(type, time, foods) {
    const div = document.createElement('div');
    div.className = 'bg-blue-50/70 p-3.5 rounded-xl border border-blue-100/50';
    div.innerHTML = `
        <div class="flex items-center justify-between mb-1.5">
            <span class="text-sm font-medium text-gray-800">${type}</span>
            <span class="text-xs text-gray-400">${time}</span>
        </div>
        <p class="text-xs text-gray-500 leading-relaxed">${foods}</p>`;
    document.getElementById('eat').appendChild(div);
}

// 添加运动项
function addExercise(name, time, desc) {
    const div = document.createElement('div');
    div.className = 'bg-blue-50/70 p-3.5 rounded-xl border border-blue-100/50';
    div.innerHTML = `
        <div class="flex items-center justify-between mb-1.5">
            <span class="text-sm font-medium text-gray-800">${name}</span>
            <span class="text-xs text-gray-400">${time}</span>
        </div>
        <p class="text-xs text-gray-500 leading-relaxed">${desc}</p>`;
    document.getElementById('sport').appendChild(div);
}

function getDate() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function adjustmentScheme() {
    Swal.fire({
        title: '是否要调整方案',
        text: '原先的方案会被删除',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
    }).then(result => {
        if (result.isConfirmed) {
            window.location.href = 'getScheme.html';
        }
    });
}

function loadData(data) {
    if (data.length === 0) {
        window.location.href = 'noscheme.html';
        return;
    }
    const eatList = data.filter(i => i.type === '饮食').sort((a, b) => a.order - b.order);
    const sportList = data.filter(i => i.type !== '饮食').sort((a, b) => a.order - b.order);
    eatList.forEach(i => addMeal(i.title, i.time, i.content));
    sportList.forEach(i => addExercise(i.title, i.time, i.content));
}

function checkIn(type) {
    Swal.fire({
        title: `今天达成了${type}计划了吗`,
        icon: 'question',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: '已达成',
        denyButtonText: '超额完成',
        cancelButtonText: '未达成',
        confirmButtonColor: '#3b82f6',
        denyButtonColor: '#22c55e',
        cancelButtonColor: '#ef4444',
        input: 'textarea',
        inputPlaceholder: '请填写完成情况说明'
    }).then(result => {
        if (result.dismiss) return;

        const value = document.querySelector('.swal2-textarea')?.value || '';
        const status = result.isConfirmed ? '已达成' : result.isDenied ? '超额完成' : '未达成';
        const btn = document.getElementById(type === '饮食' ? 'eatBtn' : 'sportBtn');

        btn.textContent = '已打卡';
        btn.style.background = '#22c55e';
        btn.style.color = 'white';
        btn.onclick = null;

        // 保存打卡记录到数据库
        const user = getUserInfo();
        if (user) {
            fetchSQLWorkflow(
                `为用户id为${user.user_id}的用户添加一条punch_in记录，punch_type为"${type}"，completion_status为"${status}"，message为"${value}"，punch_time为"${getDate()}"`,
                "system"
            );
        }
    });
}

window.onload = function () {
    const user = getUserInfo();
    if (!user) return;

    // 显示加载动画
    const loading = startLoading('正在加载方案数据...');

    // 并行请求方案数据和打卡数据
    Promise.all([
        fetchSQLWorkflow(`查询id为${user.user_id}的用户的生活方案数据`, "tourist"),
        fetchSQLWorkflow(`查询用户id为${user.user_id}，且日期为${getDate()}的打卡数据`, "system")
    ]).then(([plan, check]) => {
        loadData(plan.result);
        // 更新打卡按钮状态
        if (check && check.result && Array.isArray(check.result)) {
            check.result.forEach(i => {
                const btn = document.getElementById(i.punch_type === '饮食' ? 'eatBtn' : 'sportBtn');
                if (btn) {
                    btn.textContent = '已打卡';
                    btn.style.background = '#22c55e';
                    btn.style.color = 'white';
                    btn.onclick = null;
                }
            });
        }
    }).catch(err => {
        console.error('获取数据失败:', err);
    }).finally(() => {
        // 数据加载完成后关闭加载动画
        stopLoading(loading);
    });
};
