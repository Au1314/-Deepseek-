tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#304FFF',
                secondary: '#10B981'
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

let userinfo = null
let userId = 0
let conversationId = null;
let messageInput = null;
let sendBtn = null;
let chatHistory = [];

window.onload = async function () {
    messageInput = document.getElementById('messageInput');
    sendBtn = document.getElementById('sendBtn');
    
    // 监听输入框的输入事件
    messageInput.addEventListener('input', function () {
        if (this.value.trim() !== '') {
            sendBtn.disabled = false;
        } else {
            sendBtn.disabled = true;
        }
    });
    
    // 清空聊天记录
    document.getElementById('clearChatBtn').addEventListener('click', function () {
        Swal.fire({
            title: '确定要清空聊天记录吗？',
            text: "此操作无法撤销！",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#304FFF',
            cancelButtonColor: '#d33',
            confirmButtonText: '确定',
            cancelButtonText: '取消'
        }).then((result) => {
            if (result.isConfirmed) {
                // 清空聊天界面
                document.getElementById('messages-container').innerHTML = '';
                
                // 清空本地存储的聊天记录
                const key = `aichat_history_${userId}`;
                localStorage.removeItem(key);
                chatHistory = [];
                conversationId = null;
                
                // 重新添加欢迎语
                addWelcomeMessage();
                
                Swal.fire(
                    '已清空！',
                    '聊天记录已被清空。',
                    'success'
                );
            }
        });
    });
    
    // 发送消息
    sendBtn.addEventListener('click', function () {
        const message = messageInput.value.trim();
        if (message !== '') {
            sendMessage(message);
            messageInput.value = '';
            sendBtn.disabled = true;
        }
    });
    
    // 监听输入框的按键事件
    messageInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && this.value.trim() !== '') {
            const message = this.value.trim();
            sendMessage(message);
            this.value = '';
            sendBtn.disabled = true;
        }
    });
    
    // 获取用户信息
    try {
        userinfo = await getUserRiskInfo();
        // 兼容 userId/user_id 字段名差异
        userId = userinfo ? (userinfo.userId || userinfo.user_id || 0) : 0;
    } catch (error) {
        console.error('获取用户信息失败:', error);
        userId = 0;
    }
    
    // 加载本地聊天记录
    const key = `aichat_history_${userId}`;
    const localHistory = localStorage.getItem(key);
    chatHistory = localHistory ? JSON.parse(localHistory) : [];
    
    if (chatHistory.length > 0) {
        chatHistory.forEach(msg => {
            loadMessageToChat(msg);
        });
    } else {
        addWelcomeMessage();
    }
}

// 保存聊天记录
function saveChatHistory() {
    const key = `aichat_history_${userId}`;
    localStorage.setItem(key, JSON.stringify(chatHistory));
}

function timestampToDate(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function loadMessageToChat(message) {
    const text = message.text;
    const sender = message.sender;
    const messagesContainer = document.getElementById('messages-container');
    const timeString = timestampToDate(message.timestamp);

    if (sender === 'user') {
        // 用户消息
        const messageHTML = `
            <div class="flex items-start justify-end message-animate">
                <div class="mr-2 text-right">
                    <div class="flex items-center justify-end">
                        <span class="text-xs text-gray-400">${timeString}</span>
                        <span class="ml-2 text-sm font-medium text-gray-900">我</span>
                    </div>
                    <div class="mt-1 user-bubble chat-bubble">
                        <p class="text-sm text-white text-left">${text}</p>
                    </div>
                </div>
                <img src="/img/user.jpg" class="message-avatar object-cover" alt="我的头像">
            </div>`;
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    } else {
        // AI消息
        const messageHTML = `
            <div class="flex items-start message-animate">
                <img src="/img/aichat_logo.png" class="message-avatar object-cover" alt="AI头像">
                <div class="ml-2" style="width:82%">
                    <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-900">AI助手</span>
                        <span class="ml-2 text-xs text-gray-400">${timeString}</span>
                    </div>
                    <div class="mt-1 ai-bubble msg">${text}</div>
                </div>
            </div>`;
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    }

    // 滚动到底部
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 添加消息到聊天界面并保存
function addMessageToChat(message, sender) {
    const messagesContainer = document.getElementById('messages-container');
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (sender === 'user') {
        // 用户消息
        const messageHTML = `
            <div class="flex items-start justify-end message-animate">
                <div class="mr-2 text-right">
                    <div class="flex items-center justify-end">
                        <span class="text-xs text-gray-400">${timeString}</span>
                        <span class="ml-2 text-sm font-medium text-gray-900">我</span>
                    </div>
                    <div class="mt-1 user-bubble chat-bubble">
                        <p class="text-sm text-white text-left">${message}</p>
                    </div>
                </div>
                <img src="/img/user.jpg" class="message-avatar object-cover" alt="我的头像">
            </div>`;
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    }
    
    // 保存到历史记录
    chatHistory.push({
        text: message,
        sender: sender,
        timestamp: now.toISOString()
    });
    saveChatHistory();
    
    // 滚动到底部
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 发送消息函数
async function sendMessage(message) {
    if (!message.trim()) return;

    // 添加用户消息到聊天界面
    addMessageToChat(message, 'user');
    
    const messagesContainer = document.getElementById('messages-container');
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // 添加AI加载动画
    const loadingId = 'loading_' + Date.now();
    const loadingHTML = `
        <div class="flex items-start message-animate" id="${loadingId}">
            <img src="/img/aichat_logo.png" class="message-avatar object-cover" alt="AI头像">
            <div class="ml-2" style="width:82%">
                <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900">AI助手</span>
                    <span class="ml-2 text-xs text-gray-400">${timeString}</span>
                </div>
                <div class="mt-1 ai-bubble">
                    <div class="typing-indicator">
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                    </div>
                </div>
            </div>
        </div>`;
    messagesContainer.insertAdjacentHTML('beforeend', loadingHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        await fetchAIChatflow(userinfo, message, userId, conversationId, (ans, conId) => {
            conversationId = conId;
            const loadingElement = document.getElementById(loadingId);
            
            if (ans && ans !== 'done') {
                // 首次收到内容时移除加载动画
                if (loadingElement && loadingElement.querySelector('.typing-indicator')) {
                    const aiBubble = loadingElement.querySelector('.ai-bubble');
                    aiBubble.innerHTML = '<div class="msg"></div>';
                }
                
                // 追加内容
                if (loadingElement) {
                    const msgContent = loadingElement.querySelector('.msg');
                    if (msgContent) {
                        msgContent.textContent += ans;
                    }
                }
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            } else {
                // 完成，保存到历史记录
                if (loadingElement) {
                    const msgContent = loadingElement.querySelector('.msg');
                    if (msgContent && msgContent.textContent) {
                        chatHistory.push({
                            text: msgContent.textContent,
                            sender: 'ai',
                            timestamp: new Date().toISOString()
                        });
                        saveChatHistory();
                    }
                }
            }
        });
    } catch (error) {
        console.error('AI 对话请求失败:', error);
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            const aiBubble = loadingElement.querySelector('.ai-bubble');
            if (aiBubble) {
                aiBubble.innerHTML = '<div class="msg">抱歉，AI 响应出现异常，请稍后重试。</div>';
            }
        }
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// 快捷功能栏收缩/展开状态
let isTagsCollapsed = false;

// 切换快捷功能栏的收缩与展开
function toggleQuickTags() {
    const container = document.getElementById('quickTagsContainer');
    const icon = document.getElementById('toggleIcon');
    const btn = document.getElementById('toggleQuickTagsBtn');
    const wrapper = document.getElementById('quickTagsWrapper');
    
    isTagsCollapsed = !isTagsCollapsed;
    
    if (isTagsCollapsed) {
        // 收缩
        container.classList.add('collapsed');
        icon.className = 'fas fa-chevron-up';
        btn.title = '展开快捷功能';
        
        // 添加展开提示按钮（如果不存在）
        if (!document.getElementById('expandTagsHint')) {
            const hint = document.createElement('div');
            hint.id = 'expandTagsHint';
            hint.className = 'expand-tags-hint';
            hint.innerHTML = '<i class="fas fa-chevron-up"></i><span>展开快捷功能</span>';
            hint.onclick = toggleQuickTags;
            wrapper.after(hint);
        }
        
        // 缩小消息容器底部间距（去除快捷标签占位高度）
        updateMessagesPadding(false);
        
        // 滚动到底部，让用户看到最新消息
        setTimeout(() => {
            const messagesContainer = document.getElementById('messages-container');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 50);
    } else {
        // 展开
        container.classList.remove('collapsed');
        icon.className = 'fas fa-chevron-down';
        btn.title = '收起快捷功能';
        
        // 移除展开提示按钮
        const hint = document.getElementById('expandTagsHint');
        if (hint) {
            hint.remove();
        }
        
        // 恢复消息容器底部间距
        updateMessagesPadding(true);
    }
}

// 根据快捷栏状态更新消息容器底部padding
function updateMessagesPadding(isExpanded) {
    const messagesContainer = document.getElementById('messages-container');
    if (isExpanded) {
        // 展开状态：保留足够的底部间距，避免被固定底部区域遮挡
        messagesContainer.style.paddingBottom = '180px';
    } else {
        // 收缩状态：减小底部间距，让更多聊天内容可见
        messagesContainer.style.paddingBottom = '80px';
    }
}

// 添加快捷消息发送
function sendQuickMessage(message) {
    if (messageInput) {
        messageInput.value = message;
        sendBtn.disabled = false;
    }
    sendMessage(message);
}

// 添加欢迎语
function addWelcomeMessage() {
    const messagesContainer = document.getElementById('messages-container');
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const welcomeHTML = `
        <div class="flex items-start message-animate">
            <img src="/img/aichat_logo.png" class="message-avatar object-cover" alt="AI头像">
            <div class="ml-2" style="width:82%">
                <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900">AI助手</span>
                    <span class="ml-2 text-xs text-gray-400">${timeString}</span>
                </div>
                <div class="mt-1 ai-bubble">
                    <p class="msg mb-3">您好！我是您专属糖尿病AI健康助手，结合您的个人血糖档案提供个性化控糖服务。</p>
                    <p class="text-gray-500 text-xs mb-3">你可以直接提问，也可点击下方快捷按钮快速咨询：</p>
                    <div class="welcome-tags">
                        <span onclick="sendQuickMessage('糖尿病的早期症状有哪些？')" class="welcome-tag"><i class="fas fa-heart-pulse"></i>早期症状</span>
                        <span onclick="sendQuickMessage('糖尿病患者应该如何饮食？')" class="welcome-tag"><i class="fas fa-utensils"></i>饮食建议</span>
                        <span onclick="sendQuickMessage('适合糖尿病患者的运动有哪些？')" class="welcome-tag"><i class="fas fa-running"></i>运动指导</span>
                        <span onclick="sendQuickMessage('血糖测量的注意事项')" class="welcome-tag"><i class="fas fa-stethoscope"></i>血糖测量注意</span>
                        <span onclick="sendQuickMessage('请帮我评估糖尿病患病风险')" class="welcome-tag"><i class="fas fa-chart-line"></i>患病风险评估</span>
                        <span onclick="sendQuickMessage('如何记录健康数据')" class="welcome-tag"><i class="fas fa-clipboard-list"></i>健康数据记录</span>
                    </div>
                </div>
            </div>
        </div>`;
    messagesContainer.insertAdjacentHTML('beforeend', welcomeHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}