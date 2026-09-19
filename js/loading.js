function startLoading(text = '正在加载，请稍候...') {
    // 创建加载遮罩层元素
    const overlay = document.createElement('div');
    overlay.classList.add('loading-overlay');

    // 创建加载动画元素
    const spinner = document.createElement('div');
    spinner.classList.add('spinner');

    // 创建提示文字元素
    const loadingText = document.createElement('div');
    loadingText.classList.add('loading-text');
    loadingText.textContent = text;

    // 将加载动画和提示文字添加到遮罩层
    overlay.appendChild(spinner);
    overlay.appendChild(loadingText);

    // 将遮罩层添加到页面
    document.body.appendChild(overlay);

    // 显示加载遮罩层
    overlay.style.display = 'flex';

    // 返回加载遮罩层元素
    return overlay;
}

function stopLoading(overlay) {
    // 隐藏加载遮罩层
    overlay.style.display = 'none';

    // 从页面移除加载遮罩层
    document.body.removeChild(overlay);
}