let docList = [];

// Helper functions for SessionStorage
function getCachedData(key) {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    // Cache expires after 1 hour (3600000 ms)
    if (Date.now() - timestamp > 3600000) {
        sessionStorage.removeItem(key);
        return null;
    }
    return data;
}

function setCachedData(key, data) {
    const cache = {
        data,
        timestamp: Date.now()
    };
    sessionStorage.setItem(key, JSON.stringify(cache));
}

// 统一处理图片URL：处理空值、相对路径、补全默认图
function normalizeImageUrl(url, defaultImg) {
    if (!url || typeof url !== 'string' || url.trim() === '' || url === 'null' || url === 'undefined') {
        return defaultImg;
    }
    // 移除字符串两端的中英文引号、反引号和空格
    let cleanUrl = url.trim().replace(/^['"`「」『』‘’“”`]+|['"`「」『』‘’“”`]+$/g, '');
    // 如果已经是完整URL（http/https开头）或绝对路径（/开头），直接返回
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('/')) {
        return cleanUrl;
    }
    // 否则补全为根路径下的绝对路径
    return '/' + cleanUrl.replace(/^\.?\//, '');
}

// Load doctors data
async function loadDoctors() {
    try {
        const cacheKey = 'doctors_data';
        let data = getCachedData(cacheKey);
        
        if (!data) {
            data = await fetchSQLWorkflow('获取医生数据', 'current_user');
            setCachedData(cacheKey, data);
        }
        console.info("Fetched doctors:", data);
        const container = document.getElementById('doctors-container');
        
        if (!data || !data.result || !Array.isArray(data.result)) {
            console.error('医生数据格式错误:', data);
            container.innerHTML = '<div class="text-center py-10 w-full text-red-500">数据加载失败，请稍后重试</div>';
            return;
        }
        
        container.innerHTML = data.result.map(doctor => {
            const imgUrl = normalizeImageUrl(doctor.image_url, '/img/doc1.jpg');
            return `
                    <div class="doctor-card" data-token="${doctor.chat_token}" data-doctor="${doctor.info_id}">
                        <div class="avatar-wrapper">
                            <img src="${imgUrl}" 
                                 alt="${doctor.doctor_name}" 
                                 class="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                                 onerror="this.onerror=null;this.src='/img/doc1.jpg'">
                            <div class="title-tag">
                                ${doctor.title || '专科医师'}
                            </div>
                        </div>
                        <h3 class="doctor-name">${doctor.doctor_name}</h3>
                        <p class="doctor-dept">${doctor.department || '内分泌科'}</p>
                        <button class="consult-btn" data-token="${doctor.chat_token}" data-doctor="${doctor.info_id}">
                            立即咨询
                        </button>
                    </div>
                `;
        }).join('');
        docList = data.result
    } catch (error) {
        console.error('加载医生数据失败:', error);
        document.getElementById('doctors-container').innerHTML =
            '<div class="text-center py-10 w-full text-red-500">加载医生数据失败，请稍后重试</div>';
    }
}

// Load articles data
async function loadArticles() {
    try {
        const cacheKey = 'articles_data';
        let data = getCachedData(cacheKey);

        if (!data) {
            data = await fetchSQLWorkflow('查询3篇文章信息', 'current_user');
            setCachedData(cacheKey, data);
        }
        const container = document.getElementById('articles-container');
        console.log('Fetched articles:', data);
        
        if (!data || !data.result || !Array.isArray(data.result)) {
            console.error('文章数据格式错误:', data);
            container.innerHTML = '<div class="text-center py-10 text-red-500">数据加载失败，请稍后重试</div>';
            return;
        }

        container.innerHTML = data.result.map((article, index) => {
            const localImg = `/img/a${(index % 3) + 1}.jpg`;
            const coverUrl = normalizeImageUrl(article.cover_url, localImg);
            const isDummy = coverUrl.includes('dummyimage');
            const finalUrl = isDummy ? localImg : coverUrl;
            const summary = article.content ? article.content.substring(0, 20) + "..." : '暂无简介';
            console.log('Article:', index, 'title:', article.title, 'summary:', summary);
            return `
                    <div class="article-card" onclick="window.location.href='article.html?id=${article.article_id}'">
                        <div class="inner">
                            <div class="img-wrap">
                                <img src="${finalUrl}" 
                                     alt="${article.title}" 
                                     class="w-full h-full object-cover"
                                     onerror="this.onerror=null;this.src='${localImg}'">
                            </div>
                            <div class="content">
                                <h3>${article.title}</h3>
                                <p class="summary">${summary}</p>
                                <div class="meta">
                                    <span><i class="fas fa-eye mr-1"></i>${article.views || '0'} 浏览</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        }).join('');
    } catch (error) {
        console.error('加载文章数据失败:', error);
        document.getElementById('articles-container').innerHTML =
            '<div class="text-center py-10 text-red-500">加载文章数据失败，请稍后重试</div>';
    }
}

// Load diabetes types data
async function loadTypes() {
    try {
        const cacheKey = 'diabetes_types_data';
        let data = getCachedData(cacheKey);

        if (!data) {
            data = await fetchSQLWorkflow('获取糖尿病类型', 'current_user');
            setCachedData(cacheKey, data);
        }
        const container = document.getElementById('types-container');
        console.info("Fetched diabetes types:", data);
        
        if (!data || !data.result || !Array.isArray(data.result)) {
            console.error('糖尿病类型数据格式错误:', data);
            container.innerHTML = '<div class="text-center py-10 col-span-2 text-red-500">数据加载失败，请稍后重试</div>';
            return;
        }
        
        container.innerHTML = data.result.map(type => {
            const imgUrl = normalizeImageUrl(type.img, '/img/t1.jpg');
            return `
                    <div class="type-card" onclick="window.location.href='diabetes.html?id=${type.type_id}'">
                        <div class="icon-area">
                            <img src="${imgUrl}" 
                                 alt="${type.type_name}" 
                                 class="w-full h-full object-cover"
                                 onerror="this.onerror=null;this.src='/img/t1.jpg'">
                        </div>
                        <div class="name-area">
                            <h3>${type.type_name}</h3>
                            <p class="text-xs text-gray-500 line-clamp-2 mt-1">${type.pathogenesis || '暂无描述'}</p>
                        </div>
                    </div>
                `;
        }).join('');
    } catch (error) {
        console.error('加载糖尿病类型数据失败:', error);
        document.getElementById('types-container').innerHTML =
            '<div class="text-center py-10 col-span-2 text-red-500">加载糖尿病类型数据失败，请稍后重试</div>';
    }
}

// Handle consultation button clicks
function setupConsultButtons() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('consult-btn')) {
            const id = e.target.getAttribute('data-doctor');
            console.log(id)
            docList.forEach((doc)=>{
                if(doc.info_id == id){
                    localStorage.setItem('currentDoctor', JSON.stringify(doc));
                } 
            })
            // 跳转到聊天页面并传递医生信息（使用绝对路径）
            window.location.href = `/chat/chat.html`;
        }
    });
}

// 页面加载
document.addEventListener('DOMContentLoaded', function() {
    // 初始化轮播图
    const swiper = new Swiper('.swiper', {
        loop: true,
        autoplay: {
            delay: 3000,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
    
    // 加载数据
    loadDoctors();
    loadArticles();
    loadTypes();
    
    // 设置按钮事件
    setupConsultButtons();
});
