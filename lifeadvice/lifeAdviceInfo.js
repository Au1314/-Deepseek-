tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#4F46E5',
                secondary: '#6366F1'
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
let lifeAdviceInfo = null;
function collect() {
    let loading = startLoading("收藏ing")
    const bookmarkIcon = document.querySelector('.fa-bookmark')
    const bookmarkText = document.querySelector('.fa-bookmark + span')
    bookmarkIcon.classList.remove('far')
    bookmarkIcon.classList.add('fas')
    bookmarkIcon.classList.remove('text-gray-600')
    bookmarkIcon.classList.add('text-primary')
    if (bookmarkText) {
        bookmarkText.textContent = '已收藏'
        bookmarkText.classList.remove('text-gray-600')
        bookmarkText.classList.add('text-primary')
    }
    const userInfo = getUserInfo()
    const collectMessage = `为用户ID为${userInfo.user_id}的用户在life_advice中添加一条数据，标题为${lifeAdviceInfo.title}，内容为${lifeAdviceInfo.content}，标签为${lifeAdviceInfo.tags}`
    fetchSQLWorkflow(collectMessage, "system").then(data => {
        showFloatingAlert("收藏成功", 'success')
        stopLoading(loading)

    })
}
window.onload = async function () {
    const title = document.getElementById("title")
    const tagList = document.getElementById("tagList")
    const article = document.querySelector("article")
    const urlParams = new URLSearchParams(window.location.search);
    const tag = urlParams.get('tag');
    let message = ""
    const riskInfo = await getUserRiskInfo()
    if (riskInfo) {
        message = `年龄:${riskInfo.age} 性别:${riskInfo.sex} 身高:${riskInfo.height} 体重:${riskInfo.weight} 是否患糖尿病:${riskInfo.disease} 医生建议：${riskInfo.message}`
    }
    const data = {
        type: "详情",
        title: tag,
        userInfo: message
    }
    const loading = startLoading(message == "" ? "正在生成健康资讯" : "正在生成个性化健康资讯")
    fetchLifeAdviceWorkflow(data, "system")
        .then(data => {
            stopLoading(loading)
            const content = data.content
            if (content) {
                lifeAdviceInfo = content
                title.textContent = content.title
                article.innerHTML = content.content
                const tags = content.tags
                tags.forEach(tag => {
                    const span = document.createElement("span")
                    span.className = "px-2 py-1 bg-blue-50 text-primary text-sm rounded-full whitespace-nowrap"
                    span.textContent = tag
                    tagList.appendChild(span)

                })
                document.getElementById("collect").style.display = "block"
            }
        })
}