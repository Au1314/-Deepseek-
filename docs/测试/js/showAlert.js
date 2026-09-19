// showAlert.js - 错误提示功能
// 动态创建 fixed 定位的提示信息 div

function showFloatingAlert(message, type) {
    // 移除已存在的提示
    const existingAlert = document.querySelector('div[style*="position: fixed"][style*="top: 20px"]');
    if (existingAlert) {
        existingAlert.remove();
    }

    // 创建新的提示元素
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `position: fixed; top: 20px; left: 50%; transform: translateX(-50%); 
        padding: 12px 24px; border-radius: 8px; z-index: 9999; 
        background-color: ${type === 'success' ? '#4CAF50' : '#f44336'}; 
        color: #fff; font-size: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);

    // 自动消失
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}