/**
 * 工具函数：从字符串中提取 【】 内的标签
 * 例如 "【中等风险】建议您控制饮食..." → { extracted: "中等风险", remainingText: "建议您控制饮食..." }
 */
function extractContent(str) {
    const regex = /【([^】]+)】/;
    const match = str.match(regex);
    return {
        extracted: match ? match[1] : null,           // 【】内的文本
        remainingText: match ? str.replace(regex, '').trim() : str  // 去除【】后的剩余文本
    };
}

/**
 * 页面加载后从 localStorage 读取风险信息并渲染
 */
window.onload = function() {
    // 从 localStorage 读取风险信息（由上一页 informationGathering 提交后存入）
    const riskInfoStr = localStorage.getItem('riskInfo');
    if (!riskInfoStr) {
        document.getElementById('resultSpan').textContent = '无评估数据';
        document.getElementById('resultText').textContent = '请先填写健康信息进行评估';
        document.getElementById('messageDiv').innerHTML = '暂无风险评估数据，请返回填写健康信息。';
        return;
    }

    try {
        const riskInfo = JSON.parse(riskInfoStr);
        // 结果字段可能在 result 或 message 中
        const resultStr = riskInfo.result || riskInfo.message || '';

        if (!resultStr) {
            document.getElementById('resultSpan').textContent = '无风险结果';
            document.getElementById('resultText').textContent = '暂无风险等级数据';
            document.getElementById('messageDiv').innerHTML = '请返回重新评估。';
            return;
        }

        // 例如 resultStr = "【中等风险】建议您控制饮食，加强运动..."
        const obj = extractContent(resultStr);
        document.getElementById('resultSpan').textContent = obj.extracted || '未知';
        document.getElementById('resultText').textContent = `您目前处于${obj.extracted}风险水平`;
        document.getElementById('messageDiv').innerHTML = obj.remainingText || '暂无具体建议';

    } catch (error) {
        console.error('解析风险信息失败:', error);
        document.getElementById('resultSpan').textContent = '数据异常';
        document.getElementById('resultText').textContent = '读取评估数据时发生错误';
        document.getElementById('messageDiv').innerHTML = '请重新填写健康信息进行评估。';
    }
};