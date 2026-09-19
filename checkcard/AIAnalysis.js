/**
 * AI 打卡分析 - JavaScript
 */

/**
 * HTML 转义函数，防止 XSS 攻击
 */
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// 缓存 DOM 元素引用
let progressCircle, progressText;

function updateProgress(percent) {
    // 如果还没有缓存元素引用，则获取
    if (!progressCircle || !progressText) {
        progressCircle = document.querySelector('.progress-circle');
        progressText = document.querySelector('.progress-percent');
    }
    
    if (!progressCircle || !progressText) {
        console.warn('updateProgress: DOM元素未找到', { circle: !!progressCircle, text: !!progressText });
        return;
    }
    
    const offset = 283 - (283 * percent / 100);
    progressCircle.style.strokeDashoffset = offset;
    progressText.textContent = `${percent}%`;

    // 三段颜色
    if (percent < 40) {
        progressCircle.style.stroke = '#EF4444';
        progressText.className = 'text-xl font-bold text-red-500';
    } else if (percent <= 70) {
        progressCircle.style.stroke = '#3B82F6';
        progressText.className = 'text-xl font-bold text-blue-500';
    } else {
        progressCircle.style.stroke = '#10B981';
        progressText.className = 'text-xl font-bold text-green-500';
    }
}

window.onload = function () {
    const user = getUserInfo();
    if (!user) return;

    // 预先缓存 DOM 元素引用
    progressCircle = document.querySelector('.progress-circle');
    progressText = document.querySelector('.progress-percent');
    
    // 初始显示 0%
    updateProgress(0);

    // 显示加载动画
    const loading = startLoading('正在分析打卡数据...');

    // 调用打卡分析工作流
    fetchAnalysisWorkflow({ userId: user.user_id }, user.user_id)
        .then(res => {
            // 先关闭 loading，再更新 UI
            stopLoading(loading);
            
            if (res) {
                // 使用 textContent 替代 innerHTML 防止 XSS
                document.getElementById('completionStatus').textContent = res.completionStatus || '暂无数据';
                document.getElementById('evaluate').textContent = res.evaluate || '暂无数据';
                document.getElementById('suggestion').textContent = res.suggestion || '暂无数据';

                // 解析进度百分比
                const processStr = res.process || '0%';
                const percent = parseInt(String(processStr).replace('%', ''));
                updateProgress(isNaN(percent) ? 0 : percent);
            }
        })
        .catch(err => {
            console.error('获取打卡分析失败:', err);
            stopLoading(loading);
            document.getElementById('completionStatus').textContent = '加载失败，请稍后重试';
            document.getElementById('evaluate').textContent = '加载失败，请稍后重试';
            document.getElementById('suggestion').textContent = '加载失败，请稍后重试';
        });
};
