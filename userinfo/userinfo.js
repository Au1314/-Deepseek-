/**
 * 渲染空状态
 */
function showEmptyState() {
    const container = document.getElementById('userInfo');
    container.innerHTML = `
        <div class="p-6 rounded-lg">
            <h2 class="text-xl font-medium mb-4">尚未填写健康信息</h2>
            <p class="mb-6 text-gray-600">请填写您的健康信息以获取糖尿病风险评估</p>
            <div class="flex justify-end">
                <button onclick="window.location.replace('/diabetesinfo.html')"
                    class="bg-black text-white px-6 py-3 rounded hover:bg-blue-700 transition-all border-none cursor-pointer">
                    <i class="fas fa-edit mr-2"></i>
                    立即填写
                </button>
            </div>
        </div>
    `;
}

/**
 * 生成卡片 HTML
 */
function createCard(title, bodyHtml) {
    return `
        <div class="bg-gray-50 p-6 rounded-lg shadow-md mt-6 mx-6 mb-4">
            <h3 class="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-dashed border-gray-300">${title}</h3>
            <div class="space-y-4">
                ${bodyHtml}
            </div>
        </div>
    `;
}

/**
 * 生成数据行
 */
function createRow(label, value) {
    return `
        <div class="flex items-center justify-between">
            <span class="text-gray-500 w-20">${label}:</span>
            <span class="text-gray-900 text-right">${value}</span>
        </div>
    `;
}

/**
 * 获取并渲染用户信息
 */
window.onload = async function() {
    try {
        const overlay = startLoading('正在加载个人信息...');

        // 清除旧的 sessionStorage 缓存，确保获取最新数据
        Object.keys(sessionStorage).forEach(function(key) {
            if (key.startsWith('risk_info_')) {
                sessionStorage.removeItem(key);
            }
        });

        // 从数据库查询用户信息
        const userData = await getUserRiskInfo();

        stopLoading(overlay);

        if (!userData) {
            showEmptyState();
            return;
        }

        const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };

        // 构建三张卡片
        const html = createCard('基本信息', [
            createRow('年龄', userData.age ? `${userData.age} 岁` : '未填写'),
            createRow('性别', userData.sex || '未填写'),
            createRow('家族病史', userData.family_history || userData.familyHistory || '无')
        ].join('')) +
        createCard('身体数据', [
            createRow('身高(cm)', userData.height ? `${userData.height}` : '未测量'),
            createRow('体重(kg)', userData.weight ? `${userData.weight}` : '未测量'),
            createRow('腰围(cm)', userData.waistline ? `${userData.waistline}` : '未测量'),
            createRow('收缩压(mmHg)', userData.systolicPressure ? `${userData.systolicPressure}` : '未测量')
        ].join('')) +
        createCard('糖尿病病情', [
            createRow('患病情况', userData.disease || '未评估'),
            createRow('风险及建议', userData.message || userData.result || '暂无风险评估建议')
        ].join(''));

        document.getElementById('userInfo').innerHTML = html;

    } catch (error) {
        console.error('获取用户信息失败:', error);
        showEmptyState();
    }
};