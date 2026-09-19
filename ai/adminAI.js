/**
 * adminAI.js - AI智能管理平台 v2.0
 * 功能：AI指令查询、结果渲染、操作日志、帮助弹窗、Toast通知
 */

// ==================== 配置 ====================
const ADMIN_AUTH_TOKEN = (window.APP_CONFIG && window.APP_CONFIG.ADMIN_AUTH_TOKEN) || "Bearer app-YOUR_ADMIN_TOKEN";

// ==================== Tailwind 配置 ====================
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#007AFF',
                secondary: '#5856D6'
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
};

// ==================== Toast 通知系统 ====================
/**
 * 显示 Toast 通知
 * @param {string} message - 通知内容
 * @param {number} duration - 显示时长（毫秒），默认 2000
 */
function showToast(message, duration = 2000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    container.appendChild(toast);

    // 自动移除
    setTimeout(() => {
        toast.classList.add('leaving');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 280);
    }, duration);
}

// ==================== 帮助弹窗 ====================
function initHelpModal() {
    const overlay = document.getElementById('helpModalOverlay');
    const modal = document.getElementById('helpModal');
    const helpBtn = document.getElementById('helpBtn');
    const closeBtn = document.getElementById('closeHelpBtn');

    if (!overlay || !modal) return;

    function openModal() {
        overlay.style.display = 'flex';
        // 触发重绘后添加动画
        requestAnimationFrame(() => {
            modal.classList.add('modal-show');
        });
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('modal-show');
        document.body.style.overflow = '';
        // 等动画结束再隐藏
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 200);
    }

    // 打开
    if (helpBtn) {
        helpBtn.addEventListener('click', openModal);
    }

    // 关闭按钮
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // 点击遮罩关闭
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            closeModal();
        }
    });

    // ESC 键关闭
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.style.display === 'flex') {
            closeModal();
        }
    });
}

// ==================== 动态表格生成 ====================
/**
 * 渲染对象数组到表格
 * @param {Array|null} data - 对象数组
 */
function renderObjectTable(data) {
    const container = document.getElementById('dataTableContainer');
    if (!container) return;

    // 空数据或非数组 → 显示空状态
    if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-10 text-gray-300 empty-state">
                <i class="fas fa-database text-4xl mb-3"></i>
                <p class="text-sm">暂无数据</p>
            </div>
        `;
        // 隐藏统计
        const stats = document.getElementById('statsContainer');
        if (stats) stats.classList.add('hidden');
        return;
    }

    // 创建表格
    const table = document.createElement('table');

    // 表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.className = 'border-b border-gray-200';

    const keys = Object.keys(data[0]);
    keys.forEach(key => {
        const th = document.createElement('th');
        th.className = 'py-2 px-3 text-left text-sm font-medium text-gray-600';
        th.textContent = key;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 表体
    const tbody = document.createElement('tbody');
    data.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100';

        keys.forEach(key => {
            const td = document.createElement('td');
            td.className = 'py-2 px-3 text-sm text-gray-600';
            const value = item[key];
            td.textContent = (typeof value === 'object' && value !== null) ? JSON.stringify(value) : String(value ?? '');
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // 替换内容
    container.innerHTML = '';
    container.appendChild(table);

    // 更新统计
    const stats = document.getElementById('statsContainer');
    const totalCount = document.getElementById('totalCount');
    const fieldCount = document.getElementById('fieldCount');
    if (stats && totalCount && fieldCount) {
        totalCount.textContent = data.length;
        fieldCount.textContent = keys.length;
        stats.classList.remove('hidden');
    }
}

// ==================== 日志管理 ====================
function getOperationLogs() {
    try {
        return JSON.parse(localStorage.getItem('operationLogs') || '[]');
    } catch (e) {
        return [];
    }
}

function saveOperationLog(requirement, result) {
    const logs = getOperationLogs();
    logs.push({
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        requirement: requirement,
        result: JSON.stringify(result),
        time: new Date().toLocaleString()
    });
    localStorage.setItem('operationLogs', JSON.stringify(logs));
    displayOperationLogs();
    updateLogCount();
}

function displayOperationLogs() {
    const logs = getOperationLogs();
    const container = document.getElementById('logContainer');
    if (!container) return;

    container.innerHTML = '';

    if (logs.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-8 text-gray-300 empty-state">
                <i class="fas fa-history text-3xl mb-2"></i>
                <p class="text-sm">暂无操作记录</p>
            </div>
        `;
        return;
    }

    // 倒序渲染
    logs.slice().reverse().forEach(log => {
        let resultMessage = '';
        try {
            const parsed = JSON.parse(log.result);
            resultMessage = parsed.message || '';
        } catch (e) {
            resultMessage = log.result;
        }

        const div = document.createElement('div');
        div.className = 'flex flex-col space-y-1 p-2.5 bg-gray-50 rounded log-item';
        div.setAttribute('data-log-id', log.id);
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-700 line-clamp-1">${escapeHtml(log.requirement)}</span>
                <span class="text-xs text-gray-500 shrink-0 ml-2">${escapeHtml(log.time)}</span>
            </div>
            <div class="text-sm text-gray-600">${escapeHtml(resultMessage)}</div>
        `;
        div.addEventListener('click', () => loadLog(log.id));
        container.appendChild(div);
    });
}

/** 更新日志计数 */
function updateLogCount() {
    const logs = getOperationLogs();
    const countEl = document.getElementById('logCount');
    const clearBtn = document.getElementById('clearLogsBtn');
    if (countEl) countEl.textContent = logs.length + ' 条';
    if (clearBtn) {
        if (logs.length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    }
}

/** 清空所有日志 */
function clearAllLogs() {
    const logs = getOperationLogs();
    if (logs.length === 0) return;

    Swal.fire({
        title: '确认清空？',
        text: '操作日志清空后将无法恢复',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#9CA3AF',
        confirmButtonText: '确认清空',
        cancelButtonText: '取消',
        borderRadius: '12px'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.setItem('operationLogs', '[]');
            displayOperationLogs();
            updateLogCount();
            showToast('已清空所有操作日志');
        }
    });
}

// ==================== 工具函数 ====================
function escapeHtml(text) {
    if (typeof text !== 'string') return String(text || '');
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function json2Object(str) {
    if (typeof str !== 'string') return str;

    // 1. 尝试直接解析（处理纯 JSON 字符串）
    try {
        return JSON.parse(str.trim());
    } catch (e) {
        // 继续尝试其他格式
    }

    // 2. 尝试提取 markdown 代码块中的 JSON（```json ... ``` 或 ``` ... ```）
    const codeBlockMatch = str.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
        try {
            return JSON.parse(codeBlockMatch[1].trim());
        } catch (e) {
            // 继续尝试其他格式
        }
    }

    // 3. 尝试从文本中提取第一个完整的 JSON 对象 { ... }
    const objectMatch = str.match(/\{[\s\S]*\}/);
    if (objectMatch) {
        try {
            return JSON.parse(objectMatch[0]);
        } catch (e) {
            // 继续尝试其他格式
        }
    }

    // 4. 尝试从文本中提取第一个完整的 JSON 数组 [ ... ]
    const arrayMatch = str.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
        try {
            const parsed = JSON.parse(arrayMatch[0]);
            return { status: '查询成功', message: '查询成功', data: parsed };
        } catch (e) {
            // 所有解析方式都失败
        }
    }

    // 5. 所有解析方式都失败，返回错误信息（附带原始文本前200字符便于调试）
    const preview = str.length > 200 ? str.substring(0, 200) + '...' : str;
    console.error('AI 返回格式解析失败，原始内容:', preview);
    return { status: '解析失败', message: 'AI 返回格式异常', data: null };
}

// ==================== 结果渲染 ====================
function loadResult(result) {
    if (!result) return;

    // 如果 result 本身就是数组（AI 直接返回了数组而非对象）
    if (Array.isArray(result)) {
        renderObjectTable(result);
        const statusEl = document.getElementById('status');
        const msgEl = document.getElementById('message');
        if (statusEl) statusEl.textContent = '查询成功';
        if (msgEl) msgEl.textContent = '已查询到 ' + result.length + ' 条数据';
        const timeEl = document.getElementById('resultTime');
        if (timeEl) {
            timeEl.textContent = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        return;
    }

    if (result.data) {
        renderObjectTable(result.data);
    } else {
        renderObjectTable(null);
    }

    const statusEl = document.getElementById('status');
    const msgEl = document.getElementById('message');
    const timeEl = document.getElementById('resultTime');

    if (result.status && statusEl) {
        statusEl.textContent = result.status;
    }
    if (result.message && msgEl) {
        msgEl.textContent = result.message;
    }
    // 更新时间
    if (timeEl) {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
}

// ==================== 回放日志 ====================
function loadLog(id) {
    const logs = getOperationLogs();
    const log = logs.find(l => l.id === id);
    if (!log) return;

    try {
        const result = JSON.parse(log.result);
        loadResult(result);
        const input = document.getElementById('searchInput');
        if (input) input.value = log.requirement;
        showToast('已回放该操作记录');
    } catch (e) {
        console.error('日志回放解析失败:', e);
        showToast('日志回放失败');
    }
}

// ==================== 加载弹窗 ====================
function startLoading(text) {
    return Swal.fire({
        title: text || 'AI智能分析中...',
        text: '正在处理您的指令，请稍候',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

function stopLoading(loading) {
    if (loading) loading.close();
}

// ==================== 页面初始化 ====================
window.onload = function () {
    // 初始化日志
    displayOperationLogs();
    updateLogCount();

    // 初始化帮助弹窗
    initHelpModal();

    // 清空日志按钮
    const clearBtn = document.getElementById('clearLogsBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllLogs);
    }

    // DOM 元素
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('btn');

    if (!input || !btn) return;

    // 回车键提交
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            btn.click();
        }
    });

    // 搜索按钮点击
    btn.addEventListener('click', async function () {
        const inputValue = input.value.trim();
        if (!inputValue) {
            showToast('请输入操作指令');
            input.focus();
            return;
        }

        // 按钮加载状态
        btn.classList.add('loading');

        const loading = startLoading('AI智能分析中...');

        try {
            const res = await fetchChatflow({}, inputValue, "admin", ADMIN_AUTH_TOKEN);
            stopLoading(loading);
            btn.classList.remove('loading');

            let result;
            try {
                result = json2Object(res.answer);
            } catch (e) {
                result = { status: '解析失败', message: 'AI 返回格式异常', data: null };
            }

            // 保存日志
            saveOperationLog(inputValue, result);
            // 加载结果
            loadResult(result);
            showToast('执行成功');
        } catch (error) {
            stopLoading(loading);
            btn.classList.remove('loading');
            console.error('AI 管理请求失败:', error);
            Swal.fire({
                icon: 'error',
                title: '请求失败',
                text: 'AI 管理平台请求异常，请稍后重试。',
                confirmButtonColor: '#007AFF',
                borderRadius: '12px'
            });
        }
    });
};