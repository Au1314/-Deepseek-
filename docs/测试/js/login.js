// login.js - 登录/注册功能

// 页面加载时检查记住密码
window.addEventListener('DOMContentLoaded', function () {
    const rememberedUsername = localStorage.getItem('remembered_username');
    const rememberedPassword = localStorage.getItem('remembered_password');
    if (rememberedUsername && rememberedPassword) {
        document.getElementById('username').value = rememberedUsername;
        document.getElementById('password').value = rememberedPassword;
    }

    // 选项卡切换
    document.getElementById('loginTab').addEventListener('click', function () {
        switchTab('login');
    });
    document.getElementById('registerTab').addEventListener('click', function () {
        switchTab('register');
    });

    // 密码显隐切换
    document.querySelectorAll('.fa-eye').forEach(function (icon) {
        icon.addEventListener('click', function () {
            const input = this.parentElement.querySelector('input');
            if (input) {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
            }
        });
    });
});

// 切换Tab
function switchTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginContent = document.getElementById('loginContent');
    const registerContent = document.getElementById('registerContent');

    if (tab === 'login') {
        loginTab.className = 'flex-1 py-2 text-center text-primary border-b-2 border-primary';
        registerTab.className = 'flex-1 py-2 text-center text-gray-400 border-b-2 border-gray-200';
        loginContent.style.display = 'block';
        registerContent.style.display = 'none';
        // 清空表单数据
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    } else {
        registerTab.className = 'flex-1 py-2 text-center text-primary border-b-2 border-primary';
        loginTab.className = 'flex-1 py-2 text-center text-gray-400 border-b-2 border-gray-200';
        registerContent.style.display = 'block';
        loginContent.style.display = 'none';
    }
}

// 登录函数
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // 验证非空
    if (!username || !password) {
        showFloatingAlert('请确保表单填写完整', 'error');
        return;
    }

    // 调用API进行登录验证
    fetchSQLWorkflow('查询用户名为' + username + '且密码为' + password + '的用户信息', username)
        .then(function (result) {
            var resultStr = JSON.stringify(result);
            if (resultStr.indexOf('"data"') !== -1 && resultStr.indexOf('"rows"') !== -1) {
                var rowsMatch = resultStr.match(/"rows":\s*\[([\s\S]*?)\]/);
                var rows = rowsMatch ? rowsMatch[1] : '';
                if (rows.length > 0) {
                    localStorage.setItem('user', JSON.stringify({ username: username }));
                    showFloatingAlert('登录成功，欢迎回来', 'success');
                    setTimeout(function () {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    showFloatingAlert('用户名或密码错误', 'error');
                }
            } else {
                showFloatingAlert('用户名或密码错误', 'error');
            }
        })
        .catch(function (error) {
            showFloatingAlert('服务器异常，请稍后重试', 'error');
        });
}

// 注册函数
function register() {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const secPassword = document.getElementById('secPassword').value.trim();

    // 验证非空
    if (!username || !password || !secPassword) {
        showFloatingAlert('请确保表单填写完整', 'error');
        return;
    }

    // 验证两次密码一致
    if (password !== secPassword) {
        showFloatingAlert('两次输入的密码不一致', 'error');
        return;
    }

    // 调用API进行注册
    fetchSQLWorkflow('创建用户名为\'' + username + '\' 密码为\'' + password + '\'的用户', username)
        .then(function (result) {
            var resultStr = JSON.stringify(result);
            if (resultStr.indexOf('成功') !== -1 || resultStr.indexOf('success') !== -1) {
                showFloatingAlert('注册成功', 'success');
                setTimeout(function () {
                    switchTab('login');
                }, 1500);
            } else if (resultStr.indexOf('已存在') !== -1) {
                showFloatingAlert('注册失败，用户名已存在', 'error');
            } else {
                showFloatingAlert('注册失败，请稍后重试', 'error');
            }
        })
        .catch(function (error) {
            showFloatingAlert('服务器异常', 'error');
        });
}