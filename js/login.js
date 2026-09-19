tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#2563eb',
                secondary: '#60a5fa'
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
window.onload = function() {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginContent = document.getElementById('loginContent');
    const registerContent = document.getElementById('registerContent');

    if (!loginTab || !registerTab || !loginContent || !registerContent) {
        console.error('One or more elements not found');
        return;
    }

    loginTab.addEventListener('click', () => {
        loginTab.classList.add('text-primary', 'border-primary');
        loginTab.classList.remove('text-gray-400', 'border-gray-200');
        registerTab.classList.add('text-gray-400', 'border-gray-200');
        registerTab.classList.remove('text-primary', 'border-primary');
        loginContent.classList.add('active');
        registerContent.classList.remove('active');
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('text-primary', 'border-primary');
        registerTab.classList.remove('text-gray-400', 'border-gray-200');
        loginTab.classList.add('text-gray-400', 'border-gray-200');
        loginTab.classList.remove('text-primary', 'border-primary');
        registerContent.classList.add('active');
        loginContent.classList.remove('active');
    });

    // 密码显示/隐藏切换
    document.querySelectorAll('.fa-eye').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    this.classList.remove('fa-eye');
                    this.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    this.classList.remove('fa-eye-slash');
                    this.classList.add('fa-eye');
                }
            }
        });
    });

    // 记住密码 - 页面加载时自动填充
    const savedUsername = localStorage.getItem('remembered_username');
    const savedPassword = localStorage.getItem('remembered_password');
    const rememberCheckbox = document.querySelector('#loginContent input[type="checkbox"]');
    if (savedUsername && savedPassword) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('password').value = savedPassword;
        if (rememberCheckbox) {
            rememberCheckbox.checked = true;
            const customCheckbox = rememberCheckbox.nextElementSibling;
            if (customCheckbox) {
                customCheckbox.style.backgroundColor = '#2563eb';
                customCheckbox.style.borderColor = '#2563eb';
            }
        }
    }

    // 自定义复选框点击样式
    if (rememberCheckbox) {
        const customCheckbox = rememberCheckbox.nextElementSibling;
        rememberCheckbox.addEventListener('change', function() {
            if (this.checked) {
                customCheckbox.style.backgroundColor = '#2563eb';
                customCheckbox.style.borderColor = '#2563eb';
            } else {
                customCheckbox.style.backgroundColor = '';
                customCheckbox.style.borderColor = '';
            }
        });
    }
}

// 设置按钮加载状态
function setButtonLoading(btn, loading) {
    if (loading) {
        btn.disabled = true;
        btn.style.opacity = '0.7';
        btn.style.cursor = 'not-allowed';
        btn._originalText = btn.textContent;
    } else {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        if (btn._originalText) {
            btn.textContent = btn._originalText;
        }
    }
}

// 登录
async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!username || !password) {
        showFloatingAlert('请确保表单填写完整', 'warning');
        return;
    }
    const btn = document.querySelector('#loginContent button');
    setButtonLoading(btn, true);
    btn.textContent = '登录中...';
    try {
        const data = await fetchSQLWorkflow(`查询用户名为${username}且密码为${password}的用户信息`, username);
        if (!data.result || data.result.length === 0) {
            setButtonLoading(btn, false);
            showFloatingAlert('用户名或密码错误');
        } else {
            const rememberCheckbox = document.querySelector('#loginContent input[type="checkbox"]');
            if (rememberCheckbox && rememberCheckbox.checked) {
                localStorage.setItem('remembered_username', username);
                localStorage.setItem('remembered_password', password);
            } else {
                localStorage.removeItem('remembered_username');
                localStorage.removeItem('remembered_password');
            }
            localStorage.setItem('user', JSON.stringify(data.result[0]));
            showFloatingAlert('登录成功，欢迎回来', 'success');
            setTimeout(() => {
                location.href = 'index.html';
            }, 2000);
        }
    } catch (error) {
        setButtonLoading(btn, false);
        showFloatingAlert('登录失败，请稍后重试', 'error');
    }
}

// 注册
async function register() {
    const regUsername = document.getElementById('regUsername').value.trim();
    const regPassword = document.getElementById('regPassword').value.trim();
    const secPassword = document.getElementById('secPassword').value.trim();
    if (!regUsername || !regPassword || !secPassword) {
        showFloatingAlert('请确保表单填写完整', 'warning');
        return;
    }
    if (regPassword !== secPassword) {
        showFloatingAlert('两次输入的密码不一致', 'warning');
        return;
    }
    const btn = document.querySelector('#registerContent button');
    setButtonLoading(btn, true);
    btn.textContent = '注册中...';
    try {
        const data = await fetchSQLWorkflow(`创建用户名为'${regUsername}' 密码为'${regPassword}'的用户`, regUsername);
        const result = data.result[0].result;
        if (result == 1) {
            setButtonLoading(btn, false);
            showFloatingAlert('注册成功', 'success');
        } else if (typeof result === 'string' && result.includes('UNIQUE constraint failed')) {
            setButtonLoading(btn, false);
            showFloatingAlert('注册失败，用户名已存在', 'error');
        } else {
            setButtonLoading(btn, false);
            showFloatingAlert('服务器异常', 'error');
        }
    } catch (error) {
        setButtonLoading(btn, false);
        showFloatingAlert('注册失败，请稍后重试', 'error');
    }
}