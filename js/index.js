window.onload = function () {
    const iframe = document.querySelector('iframe');
    const tabs = document.querySelectorAll('.tab-bar a');
    let isTransitioning = false;  // 防止动画期间重复点击

    // Tab 配置映射：data-target → tab 索引
    const tabConfig = [
        { target: '/main/main.html', id: 'home' },
        { target: '/scheme/scheme.html', id: 'scheme' },
        { target: '/lifeadvice/lifeAdvice.html', id: 'lifeadvice' },
        { target: '/ai/aiStart.html', id: 'ai' },
        { target: '/mine/mine.html', id: 'mine' }
    ];

    /**
     * 更新底部导航栏高亮状态
     * 根据 iframe 当前加载的 URL 匹配对应的 tab
     * 支持精确匹配和目录级前缀匹配
     */
    function updateActiveTab() {
        try {
            const currentSrc = iframe.contentWindow.location.pathname || '';
            if (!currentSrc) return;

            let matched = false;

            tabs.forEach((tab, index) => {
                const target = tabConfig[index].target;
                // 精确匹配：/scheme/scheme.html === /scheme/scheme.html
                // 目录前缀匹配：/scheme/scheme.html 匹配 /scheme/ 开头的子页面
                const dirPrefix = target.substring(0, target.lastIndexOf('/') + 1);
                const isExactMatch = currentSrc === target;
                const isDirMatch = currentSrc.startsWith(dirPrefix) && currentSrc !== '/main/main.html';

                if (isExactMatch || isDirMatch) {
                    tabs.forEach(t => {
                        t.classList.remove('text-primary', 'active');
                        t.classList.add('text-gray-500');
                    });
                    tab.classList.add('text-primary', 'active');
                    tab.classList.remove('text-gray-500');
                    matched = true;
                }
            });

            // 没有匹配到任何 tab（例如进入 checkcard 子页面）→ 保持原状
            if (!matched) {
                // 特殊处理：checkcard 属于方案定制模块
                if (currentSrc.includes('/checkcard/')) {
                    tabs.forEach(t => {
                        t.classList.remove('text-primary', 'active');
                        t.classList.add('text-gray-500');
                    });
                    // 高亮方案定制 tab（索引 1）
                    tabs[1].classList.add('text-primary', 'active');
                    tabs[1].classList.remove('text-gray-500');
                }
            }
        } catch (e) {
            // 跨域或加载异常时忽略
        }
    }

    /**
     * 切换页面（带淡入淡出过渡）
     * @param {string} targetPage - 目标页面路径
     * @param {Function} onBeforeNavigate - 切换前回调（用于更新 tab 样式）
     */
    function navigateToPage(targetPage, onBeforeNavigate) {
        if (isTransitioning) return;
        
        // 检查是否相同页面
        const currentSrc = iframe.src;
        if (currentSrc.endsWith(targetPage) || currentSrc.includes(targetPage)) {
            // 即使相同页面，也执行回调（更新 tab 样式）
            if (onBeforeNavigate) onBeforeNavigate();
            return;
        }

        isTransitioning = true;

        // 执行切换前回调（更新 tab 样式）
        if (onBeforeNavigate) onBeforeNavigate();

        // 淡出 → 切换 src → 等待加载 → 淡入
        iframe.classList.add('fade-out');

        setTimeout(() => {
            iframe.src = targetPage;
        }, 200);  // 等待淡出动画完成
    }

    // 监听 iframe 加载完成事件 → 淡入 + 同步 tab 状态
    iframe.addEventListener('load', function () {
        // 淡入
        iframe.classList.remove('fade-out');
        isTransitioning = false;

        // 延迟执行确保 iframe 内容已完全加载
        setTimeout(updateActiveTab, 100);
    });

    // 首次加载完成时确保可见
    iframe.classList.remove('fade-out');

    // 导航栏点击处理
    tabs.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetPage = tabConfig[index].target;

            navigateToPage(targetPage, function () {
                // 移除所有 active 样式
                tabs.forEach(el => {
                    el.classList.remove('text-primary', 'active');
                    el.classList.add('text-gray-500');
                });

                // 添加当前 active 样式
                link.classList.add('text-primary', 'active');
                link.classList.remove('text-gray-500');
            });
        });
    });

    // 监听来自 iframe 子页面的导航消息
    window.addEventListener('message', function (event) {
        const data = event.data;
        if (data && data.action === 'navigate') {
            const targetPage = data.page;
            const tabId = data.tab;

            // 查找匹配的 tab
            let matchedTab = null;
            tabs.forEach((tab, index) => {
                const target = tabConfig[index].target;
                if (tabId && target.includes(tabId)) {
                    matchedTab = tab;
                } else if (targetPage && target === targetPage) {
                    matchedTab = tab;
                }
            });

            if (targetPage) {
                navigateToPage(targetPage, function () {
                    if (matchedTab) {
                        tabs.forEach(el => {
                            el.classList.remove('text-primary', 'active');
                            el.classList.add('text-gray-500');
                        });
                        matchedTab.classList.add('text-primary', 'active');
                        matchedTab.classList.remove('text-gray-500');
                    }
                });
            } else if (matchedTab) {
                // 仅更新 tab 高亮，不导航
                tabs.forEach(el => {
                    el.classList.remove('text-primary', 'active');
                    el.classList.add('text-gray-500');
                });
                matchedTab.classList.add('text-primary', 'active');
                matchedTab.classList.remove('text-gray-500');
            }
        }
    });

    // 初始化通知系统
    async function initNotifications() {
        const granted = await requestNotificationPermission();
        if (granted) {
            setupCheckinReminder();
        }
    }
    initNotifications();

    // 初始加载时立即更新一次 tab 状态
    setTimeout(updateActiveTab, 500);
};
