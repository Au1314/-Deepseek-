tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#4F46E5',
                secondary: '#6366F1',
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
function showArticleDetail(title, content) {
    Swal.fire({
        title: `<div class="text-lg">${title}</div>`,
        html: `<div class="text-left p-4">${content}</div>`,
        showConfirmButton: true,
        confirmButtonText: '关闭',
        width: '90%',
        customClass: {
            popup: 'rounded-lg',
            title: 'text-lg',
            confirmButton: 'bg-primary text-white px-4 py-2 rounded-button hover:bg-blue-600'
        }
    });
}

function loadLA(arr) {
    const contentArea = document.querySelector(".content-area");
    const fragment = document.createDocumentFragment();
    arr.forEach(item => {
        const wrapper = document.createElement('div');
        wrapper.className = 'divide-y divide-gray-100';
        const safeTitle = item.title.replace(/'/g, "\\'").replace(/"/g, '"');
        const safeContent = (item.content || '').replace(/'/g, "\\'").replace(/"/g, '"');
        wrapper.innerHTML = `
            <article class="article-item px-4 py-4">
                <div class="flex gap-4">
                    <div class="flex-1">
                        <h2 class="text-lg font-bold text-gray-900 mb-2">${item.title}</h2>
                        <p class="text-sm text-gray-500 mb-3 line-clamp-2">
                            ${(item.content || '').substring(0, 40) + "......"}
                        </p>
                    </div>
                    <button class="fa-icon text-gray-400">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </article>
        `;
        const article = wrapper.querySelector('.article-item');
        if (article) {
            article.addEventListener('click', function() {
                showArticleDetail(item.title, item.content);
            });
            const deleteBtn = wrapper.querySelector('.fa-trash');
            if (deleteBtn) {
                deleteBtn.parentElement.addEventListener('click', function(e) {
                    e.stopPropagation();
                    removeLA(item.id);
                });
            }
        }
        fragment.appendChild(wrapper);
    });
    contentArea.appendChild(fragment);
}
function loadPage(userId) {
    let loading = startLoading("正在加载")
    fetchSQLWorkflow(`查询用户id为${userId}的所有life_advice数据`, "system")
        .then(data => {
            stopLoading(loading)
            const arr = data.result;

            if (arr.length == 0) {
                showFloatingAlert("暂无数据", "error")
            } else {
                loadLA(arr)
            }
        })
}
function removeLA(id) {
    Swal.fire({
        title: '确认删除',
        text: '您确定要删除这条健康资讯吗？',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        customClass: {
            confirmButton: 'bg-red-500 text-white px-4 py-2 rounded-button hover:bg-red-600',
            cancelButton: 'bg-gray-200 text-gray-700 px-4 py-2 rounded-button hover:bg-gray-300'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            fetchSQLWorkflow(`删除id为${id}的life_advice数据`, "system")
                .then(data => {
                    showFloatingAlert('删除成功', 'success');
                    // Reload the page to reflect changes
                    document.querySelector(".content-area").innerHTML = "";
                    const userinfo = getUserInfo();
                    loadPage(userinfo.user_id);
                })
                .catch(error => {
                    showFloatingAlert('删除失败', 'error');
                    console.error(error);
                });
        }
    });
}
window.onload = function () {
    const userinfo = getUserInfo();
    loadPage(userinfo.user_id);
}
