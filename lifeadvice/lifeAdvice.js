tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#4F46E5',
                secondary: '#304FFF'
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
        let eatTag, sportTag, dailyCard, popularizationCard;
        // 生成标签
        function createTags(container, tags) {
            container.innerHTML = '';
            tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'px-3 py-1 bg-blue-50 text-primary text-sm rounded-full';
                span.textContent = tag;
                span.addEventListener('click', () => {
                    jumpToDetail(tag)
                });
                container.appendChild(span);
            });
        }

        // 生成卡片
        function createCards(container, cards) {
            container.innerHTML = '';
            cards.forEach(card => {
                const div = document.createElement('div');
                div.className = 'bg-blue-50 p-4 rounded-lg';
                div.innerHTML = `
                    <div class="flex items-center mb-2">
                        <span class="text-sm text-gray-600">${card.title}</span>
                    </div>
                    <p class="text-sm text-gray-600">${card.content}</p>
                `;
                div.addEventListener('click', () => {
                    jumpToDetail(card.title)
                })
                container.appendChild(div);
            });
        }
        function loadTags(message) {
            // 使用用户信息作为缓存键的一部分
            const cacheKey = `lifeAdvice_${message}`;
            
            // 检查是否有缓存数据
            const cachedData = sessionStorage.getItem(cacheKey);
            if (cachedData) {
                const data = JSON.parse(cachedData);
                const tags = data.tags;
                if (tags) {
                    createTags(eatTag, tags.eat);
                    createTags(sportTag, tags.sport);
                    createCards(dailyCard, tags.daily);
                    createCards(popularizationCard, tags.popularization);
                }
                return;
            }

            let data = {
                type: "标签",
                userInfo: message
            }
            const loading = startLoading("正在生成个性化健康资讯")
            fetchLifeAdviceWorkflow(data, "system")
                .then(data => {
                    stopLoading(loading)
                    const tags = data.tags
                    if (tags) {
                        // 缓存数据，有效期到会话结束
                        sessionStorage.setItem(cacheKey, JSON.stringify(data));
                        
                        const eat = tags.eat
                        const sport = tags.sport
                        const daily = tags.daily
                        const popularization = tags.popularization
                        createTags(eatTag, eat);
                        createTags(sportTag, sport);
                        createCards(dailyCard, daily);
                        createCards(popularizationCard, popularization);
                    }
                })
        }
        function jumpToDetail(tag) {
            window.location.href = `lifeAdviceInfo.html?tag=${tag}`
        }
        window.onload = async function () {
            eatTag = document.getElementById('eatTag');
            sportTag = document.getElementById('sportTag');
            dailyCard = document.getElementById('dailyCard');
            popularizationCard = document.getElementById('popularizationCard');
            let riskMessage = '无信息'
            // const riskInfo = await getRiskInfo()
            getUserRiskInfo()
                .then(riskInfo => {
                    if (!riskInfo) {
                        Swal.fire({
                            title: '无健康信息',
                            text: '是否需要完善信息，信息未完善则无法提供个性化的健康资讯',
                            icon: 'info',
                            showCancelButton: true,
                            confirmButtonText: '去完善',
                            cancelButtonText: '取消'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                top.location.href = '/scheme/getScheme.html'
                            } else {
                                loadTags("无信息")
                            }
                        });
                    } else {
                        riskMessage = `年龄:${riskInfo.age} 性别:${riskInfo.sex} 身高:${riskInfo.height} 体重:${riskInfo.weight} 是否患糖尿病:${riskInfo.disease} 医生健康资讯：${riskInfo.message}`
                        loadTags(riskMessage)
                    }
                })

        }