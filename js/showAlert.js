function showFloatingAlert(message, type = 'info', duration = 3000) {
    const colorMap = {
        success: '#67C23A',
        warning: '#E6A23C',
        error: '#F56C6C',
        info: '#909399'
    };
    const backgroundColor = colorMap[type] || colorMap.info;

    // 创建提示框元素
    const alertElement = document.createElement('div');
    alertElement.style.position = 'fixed';
    alertElement.style.top = '20px';
    alertElement.style.left = '50%';
    alertElement.style.transform = 'translateX(-50%)';
    alertElement.style.backgroundColor = backgroundColor;
    alertElement.style.color = 'white';
    alertElement.style.padding = '10px 20px';
    alertElement.style.borderRadius = '5px';
    alertElement.style.zIndex = '9999';
    alertElement.style.opacity = '0';
    alertElement.style.transition = 'opacity 0.3s ease-in-out';
    alertElement.textContent = message;

    // 将提示框添加到文档中
    document.body.appendChild(alertElement);

    // 显示提示框
    setTimeout(() => {
        alertElement.style.opacity = '1';
    }, 100);

    // 在指定时间后隐藏并移除提示框
    setTimeout(() => {
        alertElement.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(alertElement);
        }, 300);
    }, duration);
}