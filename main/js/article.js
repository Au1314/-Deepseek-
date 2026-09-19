tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#4A90E2',
                secondary: '#81B3F3'
            },
            borderRadius: {
                'none': '0px',
                'sm': '2px',
                DEFAULT: '4px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
                '2xl': '20px',
                '3xl': '24px',
                'full': '9999px',
                'button': '4px'
            }
        }
    }
}

function normalizeImageUrl(url, defaultImg) {
    if (!url || typeof url !== 'string' || url.trim() === '' || url === 'null' || url === 'undefined') {
        return defaultImg;
    }
    let cleanUrl = url.trim().replace(/^['"`「」『』‘’“”`]+|['"`「」『』‘’“”`]+$/g, '');
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('/')) {
        return cleanUrl;
    }
    return '/' + cleanUrl.replace(/^\.?\//, '');
}

window.onload = function () {
    let loading = startLoading();
    try {
        // 获取url上的article_id
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        fetchSQLWorkflow(`查询id为${articleId}的文章信息`, "system")
            .then(res => {
                console.log('API返回数据:', res);
                // 兼容多种返回格式
                let data = res.result || res.data || res;
                let article = Array.isArray(data) ? data[0] : data;
                console.log('文章数据:', article);
                // Update dynamic content
                const articleId = parseInt(urlParams.get('id')) || 1;
                const localImg = `/img/a${(articleId % 3) + 1}.jpg`;
                const coverUrl = normalizeImageUrl(article.cover_url, localImg);
                const isDummy = coverUrl.includes('dummyimage');
                const finalUrl = isDummy ? localImg : coverUrl;
                document.querySelector('img').src = finalUrl;
                document.querySelector('img').alt = article.title;
                document.querySelector('h1.text-xl').textContent = article.title;
                document.querySelector('span.ml-2').textContent = article.author;
                document.querySelector('span.time').textContent = article.publish_time;
                document.querySelector('.article-content').innerHTML = article.content;
                // 数据加载完成后关闭加载动画
                stopLoading(loading);
            })
            .catch(error => {
                console.error('Error loading article:', error);
                showFloatingAlert("加载文章失败，请稍后重试。", "error");
                stopLoading(loading);
            });
    } catch (error) {
        console.error('Error loading article:', error);
        showFloatingAlert("加载文章失败，请稍后重试。", "error");
        stopLoading(loading);
    }
}
