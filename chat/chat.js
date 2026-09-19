/* ==============================================================
   医师咨询聊天页面 — 核心逻辑
   整合需求：1~6
   ============================================================== */

// ==================== 全局状态 ====================

/** @type {Object|null} 当前咨询的医生信息 */
let currentDoctor = null;

/** @type {string} 当前会话 ID（默认 "0" 表示新会话）—— 需求2：上下文管理 */
let conversationId = '0';

/** @type {Array} 当前聊天消息历史 [{ message, sender, time, conversation_id }] —— 需求5：消息存储结构 */
let historyMessage = [];

/** @type {Object|null} 用户健康数据（inputs） */
let userInputs = null;

/** @type {string} 用户 ID */
let userId = '';

/** @type {string} localStorage 中聊天记录的 key 前缀 —— 需求5：以医生 id 为 key */
const CHAT_HISTORY_PREFIX = 'chat_history_';

/** @type {string} localStorage 中会话 ID 的 key */
const CONVERSATION_ID_KEY = 'conversationId';

// ==================== DOM 引用 ====================

const $ = (id) => document.getElementById(id);
const messagesContainer = $('messages-container');
const messageInput = $('messageInput');
const sendBtn = $('sendBtn');
const clearBtn = $('clearBtn');
const backBtn = $('backBtn');
const doctorCard = $('doctorCard');
const doctorAvatar = $('doctorAvatar');
const doctorName = $('doctorName');
const doctorDept = $('doctorDept');

// ==================== 工具函数 ====================

/**
 * 格式化当前时间为 HH:mm 字符串
 */
function getTimeString() {
    const now = new Date();
    return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
}

/**
 * 检查用户登录状态
 */
function checkLoginStatus() {
    try {
        const userJson = localStorage.getItem("user");
        if (!userJson) return false;
        const user = JSON.parse(userJson);
        return !!user.user_id;
    } catch (e) {
        return false;
    }
}

/**
 * 标准化图片 URL（处理空值、相对路径等）
 */
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

/**
 * 滚动到底部
 */
function scrollToBottom() {
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 50);
}

// ==================== 医生信息 ====================

/**
 * 从 localStorage 读取医生信息
 */
function getDoctorFromStorage() {
    const stored = localStorage.getItem('currentDoctor');
    if (!stored) {
        console.error('未找到医生信息，请从首页重新进入');
        return null;
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('医生信息解析失败:', e);
        return null;
    }
}

/**
 * 更新页面上的医生信息
 * @param {Object} doctor - 医生对象
 */
function updateDoctorInfo(doctor) {
    if (!doctor) return;

    const imgUrl = normalizeImageUrl(doctor.image_url, '/img/user.jpg');
    doctorAvatar.src = imgUrl;
    doctorAvatar.onerror = function () {
        this.onerror = null;
        this.src = '/img/user.jpg';
    };
    doctorName.textContent = doctor.doctor_name || '医师';
    doctorDept.textContent = (doctor.department || '科室') + ' · ' + (doctor.title || '职称');

    // 显示医师信息卡片
    doctorCard.style.display = 'block';
}

// ==================== 用户健康数据 ====================

/**
 * 获取用户健康数据（用于 inputs）
 * 注意：Dify 要求 age/height/weight 为 number 类型，且 7 个字段为必填
 * 数据库字段同时支持 camelCase 和 snake_case 两种命名
 */
async function loadUserRiskInfo() {
    try {
        const riskInfo = await getUserRiskInfo();
        if (riskInfo) {
            // 兼容两种字段命名：camelCase（数据库直接返回）和 snake_case
            userInputs = {
                userId: userId || '',
                age: riskInfo.age ? Number(riskInfo.age) : '',
                sex: riskInfo.sex || '',
                height: riskInfo.height ? Number(riskInfo.height) : '',
                weight: riskInfo.weight ? Number(riskInfo.weight) : '',
                familyHistory: riskInfo.familyHistory || riskInfo.family_history || '',
                waistline: riskInfo.waistline ? Number(riskInfo.waistline) : '',
                systolicPressure: riskInfo.systolicPressure ? Number(riskInfo.systolicPressure) : '',
                isPregnancy: riskInfo.isPregnancy || riskInfo.is_pregnancy || '',
                disease: riskInfo.disease || ''
            };
            console.log('用户健康数据已加载:', userInputs);
        } else {
            // 用户无健康数据时，设置默认空值（必填字段不能缺失）
            userInputs = {
                userId: userId || '',
                age: '',
                sex: '',
                height: '',
                weight: '',
                familyHistory: '',
                waistline: '',
                systolicPressure: '',
                isPregnancy: '',
                disease: ''
            };
        }
    } catch (e) {
        console.error('获取用户健康数据失败:', e);
        userInputs = {
            userId: userId || '',
            age: '',
            sex: '',
            height: '',
            weight: '',
            familyHistory: '',
            waistline: '',
            systolicPressure: '',
            isPregnancy: '',
            disease: ''
        };
    }
}

// ==================== 聊天历史（需求5：LocalStorage 缓存）====================

/**
 * 获取聊天记录的 localStorage key —— 以医生 info_id 作为 key
 */
function getChatHistoryKey() {
    if (currentDoctor && currentDoctor.info_id) {
        return CHAT_HISTORY_PREFIX + currentDoctor.info_id;
    }
    return CHAT_HISTORY_PREFIX + 'default';
}

/**
 * 保存聊天记录到 localStorage —— 需求5：每发送/接收一条消息立即保存
 * 消息存储结构：每条消息包含 sender、message、time、conversation_id
 */
function saveChatHistory() {
    const key = getChatHistoryKey();
    try {
        localStorage.setItem(key, JSON.stringify(historyMessage));
    } catch (e) {
        console.error('保存聊天记录失败:', e);
    }
}

/**
 * 从 localStorage 恢复聊天记录
 */
function loadChatHistory() {
    const key = getChatHistoryKey();
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            historyMessage = JSON.parse(stored);
            return historyMessage;
        }
    } catch (e) {
        console.error('加载聊天记录失败:', e);
    }
    historyMessage = [];
    return historyMessage;
}

// ==================== 会话 ID（需求2：上下文管理）====================

/**
 * 保存会话 ID 到 localStorage
 */
function saveConversationId(id) {
    if (id && id !== 'null' && id !== '') {
        conversationId = id;
        localStorage.setItem(CONVERSATION_ID_KEY, id);
    }
}

/**
 * 从 localStorage 恢复会话 ID，若不存在则默认 "0"
 */
function loadConversationId() {
    const stored = localStorage.getItem(CONVERSATION_ID_KEY);
    if (stored && stored !== 'null' && stored !== '') {
        conversationId = stored;
    } else {
        conversationId = '0';
    }
}

// ==================== 消息渲染（需求2：消息 DOM 渲染）====================

/**
 * 添加一条消息到聊天区域
 * @param {string} message - 消息文本
 * @param {'user'|'doctor'} sender - 发送者
 * @param {boolean} [save=true] - 是否保存到历史记录
 */
function addMessageToChat(message, sender, save = true) {
    const timeStr = getTimeString();
    const imgUrl = normalizeImageUrl(
        sender === 'doctor' ? (currentDoctor ? currentDoctor.image_url : null) : null,
        '/img/user.jpg'
    );

    let html = '';

    if (sender === 'doctor') {
        // ===== 医生消息（左侧：头像 + 姓名时间 + 白色气泡） =====
        html = `
            <div class="flex items-start doctor-message">
                <img src="${imgUrl}"
                     class="message-avatar object-cover"
                     alt="${currentDoctor ? currentDoctor.doctor_name : '医师'} 头像"
                     onerror="this.onerror=null;this.src='/img/user.jpg'">
                <div class="ml-2" style="max-width:calc(100% - 52px);">
                    <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-900">${currentDoctor ? currentDoctor.doctor_name : '医师'} 医师</span>
                        <span class="ml-2 text-xs text-gray-400">${timeStr}</span>
                    </div>
                    <div class="mt-1 doctor-bubble">
                        <p class="text-sm text-gray-800 leading-relaxed" style="white-space:pre-line;">${escapeHtml(message)}</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        // ===== 用户消息（右侧：蓝色气泡 + 头像 + "我"） =====
        html = `
            <div class="flex items-start justify-end user-message">
                <div class="mr-2 text-right" style="max-width:calc(100% - 52px);">
                    <div class="flex items-center justify-end">
                        <span class="text-xs text-gray-400">${timeStr}</span>
                        <span class="ml-2 text-sm font-medium text-gray-900">我</span>
                    </div>
                    <div class="mt-1 user-bubble">
                        <p class="text-sm text-white leading-relaxed" style="white-space:pre-line;">${escapeHtml(message)}</p>
                    </div>
                </div>
                <img src="/img/user.jpg"
                     class="message-avatar object-cover"
                     alt="用户头像"
                     onerror="this.onerror=null;this.src='/img/user.jpg'">
            </div>
        `;
    }

    messagesContainer.insertAdjacentHTML('beforeend', html);
    scrollToBottom();

    // 保存到历史记录 —— 需求5：消息结构包含 sender、message、time、conversation_id
    if (save) {
        historyMessage.push({
            sender: sender,
            message: message,
            time: timeStr,
            conversation_id: conversationId
        });
        saveChatHistory();
    }
}

/**
 * 简单的 HTML 转义（防止 XSS）
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== 加载提示（需求3：对方正在输入中）====================

/**
 * 显示"医生正在输入..."的加载提示
 * 需求3：触发时机——用户发送消息、开始请求 API 时
 */
function showLoading() {
    // 先移除已有的加载提示
    hideLoading();

    const loadingHtml = `
        <div id="loadingIndicator" class="flex items-start">
            <img src="${normalizeImageUrl(currentDoctor ? currentDoctor.image_url : null, '/img/user.jpg')}"
                 class="message-avatar object-cover"
                 alt="医师 头像"
                 onerror="this.onerror=null;this.src='/img/user.jpg'">
            <div class="ml-2" style="max-width:calc(100% - 52px);">
                <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900">${currentDoctor ? currentDoctor.doctor_name : '医师'} 医师</span>
                </div>
                <div class="mt-1 doctor-bubble">
                    <div class="flex items-center space-x-1">
                        <span class="text-sm text-gray-500">医生正在输入</span>
                        <span class="loading-dots">
                            <span class="dot">.</span>
                            <span class="dot">.</span>
                            <span class="dot">.</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;

    messagesContainer.insertAdjacentHTML('beforeend', loadingHtml);
    scrollToBottom();
}

/**
 * 隐藏加载提示
 * 需求3：销毁时机——接口请求完成、拿到医生完整回复并渲染后
 */
function hideLoading() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// ==================== 发送消息（需求2、需求1）====================

/**
 * 发送消息
 * @param {string} text - 用户输入的消息文本
 */
async function sendMessage(text) {
    if (!text || !text.trim()) return;

    const messageText = text.trim();

    // 1. 显示用户消息
    addMessageToChat(messageText, 'user');

    // 2. 清空输入框
    messageInput.value = '';
    sendBtn.style.display = 'none';

    // 3. 显示加载中（需求3：触发时机）
    showLoading();

    try {
        // 4. 调用 API（需求1：使用 fetchDoctorChat 非流式接口）
        // Token 选取优先级：按医生 info_id 匹配 DOCTOR_CHAT_TOKENS > 医生对象上的 chat_token
        let chatToken = '';
        // 优先按 info_id 匹配
        if (currentDoctor && currentDoctor.info_id) {
            const mappedToken = typeof getDoctorTokenById !== 'undefined'
                ? getDoctorTokenById(currentDoctor.info_id)
                : null;
            if (mappedToken) {
                chatToken = mappedToken;
            }
        }
        // 其次使用医生对象上的 chat_token
        if (!chatToken) {
            const docToken = currentDoctor && currentDoctor.chat_token;
            if (docToken && docToken !== 'null' && docToken !== 'undefined') {
                chatToken = docToken;
            }
        }
        // 未找到 Token — 不能使用 AI 助手 Token 兜底（AI 助手与医师咨询是不同的 Dify 应用）
        if (!chatToken) {
            hideLoading();
            addMessageToChat('该医生暂未开通在线咨询服务，请联系管理员配置后重试。', 'doctor');
            return;
        }

        const response = await fetchDoctorChat(
            userInputs || {},          // 用户健康数据
            messageText,               // 用户咨询内容
            userId,                    // 用户 ID
            chatToken,                 // 认证 Token
            conversationId             // 会话 ID（默认 "0" 表示新会话）
        );

        // 5. 隐藏加载（需求3：销毁时机）
        hideLoading();

        // 6. 更新会话 ID（需求2：接口返回新 id 自动更新）
        if (response && response.conversation_id) {
            saveConversationId(response.conversation_id);
        }

        // 7. 显示医生回复（需求2：整段渲染）
        const answer = (response && response.answer) ? response.answer : '抱歉，我现在无法回复，请稍后再试。';
        addMessageToChat(answer, 'doctor');

    } catch (error) {
        console.error('发送消息失败:', error);
        hideLoading();

        // 显示错误提示
        addMessageToChat('网络连接异常，请检查网络后重试。', 'doctor');
    }
}

// ==================== 清空聊天（需求6：SweetAlert2 确认弹窗）====================

/**
 * 清空所有聊天记录
 * 需求6：右上角清空按钮 + SweetAlert2 确认弹窗
 */
function clearChat() {
    Swal.fire({
        title: '确定要清空聊天记录吗？',
        text: '此操作无法撤销！',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#304FFF',
        cancelButtonColor: '#d33',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
    }).then((result) => {
        if (result.isConfirmed) {
            // ① 清空页面所有聊天消息 DOM
            messagesContainer.innerHTML = '';

            // ② 清空内存中的历史记录
            historyMessage = [];

            // ③ 根据当前医生 id，删除 localStorage 内对应的聊天缓存 key
            const key = getChatHistoryKey();
            localStorage.removeItem(key);
            // 同时删除会话 ID
            localStorage.removeItem(CONVERSATION_ID_KEY);
            // ④ 重置全局 conversation_id 为初始值 "0"
            conversationId = '0';

            // ⑤ 弹窗提示清空成功
            Swal.fire({
                title: '已清空',
                text: '聊天记录已清空',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            // 清空后显示开场白（需求4）
            showDoctorIntroduction();
        }
    });
}

// ==================== 开场白（需求4：无历史记录时自动推送）====================

/**
 * 显示医生自我介绍开场白
 * 需求4：页面初始化时读取聊天缓存，若为空则渲染医生介绍消息
 */
function showDoctorIntroduction() {
    // 直接作为医生消息渲染
    const doctorNameStr = currentDoctor ? currentDoctor.doctor_name : '赵晓峰';
    const intro = currentDoctor && currentDoctor.introduction
        ? currentDoctor.introduction
        : '你好，我是' + doctorNameStr + '，拥有超过 25 年的内分泌科临床经验，尤其在糖尿病的综合治疗方面颇有建树。擅长对糖尿病患者进行全面评估，制定个性化的治疗方案，有效控制患者的血糖水平，减少并发症的发生。';

    // 以医生消息形式添加，并保存到历史
    addMessageToChat(intro, 'doctor', true);
}

// ==================== 恢复历史消息（需求5：页面刷新记录不丢失）====================

/**
 * 恢复历史消息到 DOM
 * 需求5：页面 onload 根据医生 id 读取 localStorage 内历史消息，逐条渲染
 */
function restoreChatHistory() {
    const history = loadChatHistory();
    if (history && history.length > 0) {
        // 有历史记录：逐条渲染（不重复保存）
        history.forEach(item => {
            // 手动构造 HTML 渲染，但不保存（避免重复）
            const timeStr = item.time || '';

            let html = '';
            if (item.sender === 'doctor') {
                html = `
                    <div class="flex items-start doctor-message">
                        <img src="${normalizeImageUrl(currentDoctor ? currentDoctor.image_url : null, '/img/user.jpg')}"
                             class="message-avatar object-cover"
                             alt="${currentDoctor ? currentDoctor.doctor_name : '医师'} 头像"
                             onerror="this.onerror=null;this.src='/img/user.jpg'">
                        <div class="ml-2" style="max-width:calc(100% - 52px);">
                            <div class="flex items-center">
                                <span class="text-sm font-medium text-gray-900">${currentDoctor ? currentDoctor.doctor_name : '医师'} 医师</span>
                                <span class="ml-2 text-xs text-gray-400">${timeStr}</span>
                            </div>
                            <div class="mt-1 doctor-bubble">
                                <p class="text-sm text-gray-800 leading-relaxed" style="white-space:pre-line;">${escapeHtml(item.message)}</p>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                html = `
                    <div class="flex items-start justify-end user-message">
                        <div class="mr-2 text-right" style="max-width:calc(100% - 52px);">
                            <div class="flex items-center justify-end">
                                <span class="text-xs text-gray-400">${timeStr}</span>
                                <span class="ml-2 text-sm font-medium text-gray-900">我</span>
                            </div>
                            <div class="mt-1 user-bubble">
                                <p class="text-sm text-white leading-relaxed" style="white-space:pre-line;">${escapeHtml(item.message)}</p>
                            </div>
                        </div>
                        <img src="/img/user.jpg"
                             class="message-avatar object-cover"
                             alt="用户头像"
                             onerror="this.onerror=null;this.src='/img/user.jpg'">
                    </div>
                `;
            }
            messagesContainer.insertAdjacentHTML('beforeend', html);
        });
        scrollToBottom();

        // 恢复会话 ID
        loadConversationId();
    } else {
        // 没有历史记录，显示医生开场白（需求4）
        showDoctorIntroduction();
    }
}

// ==================== 事件绑定 ====================

/**
 * 绑定所有事件
 */
function bindEvents() {
    // 1. 输入框事件：控制发送按钮显隐
    messageInput.addEventListener('input', function () {
        if (this.value.trim() !== '') {
            sendBtn.style.display = 'flex';
        } else {
            sendBtn.style.display = 'none';
        }
    });

    // 2. Enter 键发送
    messageInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const text = this.value.trim();
            if (text) {
                sendMessage(text);
            }
        }
    });

    // 3. 发送按钮点击
    sendBtn.addEventListener('click', function () {
        const text = messageInput.value.trim();
        if (text) {
            sendMessage(text);
        }
    });

    // 4. 清空按钮（需求6）
    clearBtn.addEventListener('click', clearChat);

    // 5. 返回按钮
    backBtn.addEventListener('click', function () {
        history.back();
    });
}

// ==================== 初始化 ====================

/**
 * 页面初始化
 */
async function initChat() {
    try {
        // 1. 读取医生信息
        currentDoctor = getDoctorFromStorage();
        if (!currentDoctor) {
            messagesContainer.innerHTML = `
                <div class="flex items-center justify-center h-full">
                    <div class="text-center text-gray-400">
                        <i class="fas fa-exclamation-circle text-4xl mb-3"></i>
                        <p class="text-sm">未找到医生信息</p>
                        <p class="text-xs mt-1">请从首页选择医生后进入</p>
                    </div>
                </div>
            `;
            return;
        }

        // 2. 更新医生信息到 DOM
        updateDoctorInfo(currentDoctor);

        // 3. 获取用户 ID — 使用 getUserInfo() 获取真实用户信息
        try {
            const user = getUserInfo();
            if (user && user.user_id) {
                const numId = parseInt(user.user_id, 10);
                userId = (!isNaN(numId) && numId > 0) ? String(numId) : '1';
            } else {
                // 用户未登录，跳转登录页（getUserInfo 内部已处理跳转）
                return;
            }
        } catch (e) {
            console.error('获取用户ID失败:', e);
            // getUserInfo 已处理未登录跳转，此处不再重复处理
            return;
        }

        // 4. 加载用户健康数据（inputs）—— 加载用户风险信息供医师参考
        try {
            await loadUserRiskInfo();
            console.log('用户风险数据已加载，医师可参考用户健康信息进行咨询');
        } catch (e) {
            console.warn('加载用户健康数据失败，使用空 inputs:', e);
            userInputs = {};
        }

        // 5. 用户已登录，启用聊天功能
        sendBtn.disabled = false;
        sendBtn.style.opacity = '1';
        messageInput.placeholder = '输入消息...';
        messageInput.disabled = false;

        // 6. 恢复聊天历史（需求5：页面刷新记录不丢失）/ 显示开场白（需求4）
        restoreChatHistory();

        // 7. 绑定事件
        bindEvents();

        console.log('医师咨询页面初始化完成');
        console.log('医生:', currentDoctor.doctor_name);
        console.log('用户ID:', userId);
        console.log('会话ID:', conversationId || '新建会话');
        console.log('历史消息数:', historyMessage.length);
        console.log('登录状态: 已登录');

    } catch (e) {
        console.error('初始化失败:', e);
        messagesContainer.innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="text-center text-red-400">
                    <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
                    <p class="text-sm">页面加载失败</p>
                    <p class="text-xs mt-1">请刷新页面重试</p>
                </div>
            </div>
        `;
    }
}

// ==================== 页面加载 ====================

window.onload = initChat;

// ==================== 加载动画样式注入 ====================

(function injectLoadingStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .loading-dots .dot {
            display: inline-block;
            animation: loadingDot 1.4s infinite;
            font-size: 18px;
            line-height: 1;
            color: #9CA3AF;
        }
        .loading-dots .dot:nth-child(2) {
            animation-delay: 0.2s;
        }
        .loading-dots .dot:nth-child(3) {
            animation-delay: 0.4s;
        }
        @keyframes loadingDot {
            0%, 80%, 100% { opacity: 0; }
            40% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
})();