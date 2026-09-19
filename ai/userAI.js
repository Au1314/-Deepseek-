let userinfo = null;
let userId = 0;
let conversationId = null;
let messageInput;
let sendBtn;
let chatHistory = [];
let container;

function getContainer() {
    if (!container) container = document.getElementById('messages-container');
    return container;
}

function formatTime(timestamp) {
    const d = new Date(timestamp);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function loadMessageToChat(message) {
    const c = getContainer();
    const time = formatTime(message.timestamp);
    if (message.sender === 'user') {
        c.insertAdjacentHTML('beforeend', `
            <div class="message-wrapper flex items-start justify-end message-animate">
                <div class="mr-3 text-right max-w-[calc(100%-50px)]">
                    <div class="flex items-center justify-end mb-1">
                        <span class="text-xs text-gray-400">${time}</span>
                        <span class="ml-2 text-xs font-medium text-gray-600">我</span>
                    </div>
                    <div class="user-bubble"><p class="msg-content">${message.text}</p></div>
                </div>
                <img src="/img/user.jpg" class="message-avatar object-cover">
            </div>`);
    } else {
        c.insertAdjacentHTML('beforeend', `
            <div class="message-wrapper flex items-start message-animate">
                <img src="/img/aichat_logo.png" class="message-avatar object-cover">
                <div class="ml-3 max-w-[calc(100%-50px)]">
                    <div class="flex items-center mb-1">
                        <span class="text-xs font-medium text-gray-600">AI健康助手</span>
                        <span class="ml-2 text-xs text-gray-400">${time}</span>
                    </div>
                    <div class="ai-bubble"><div class="msg-content">${message.text}</div></div>
                </div>
            </div>`);
    }
    c.scrollTop = c.scrollHeight;
}

function addUserMessageToUI(message) {
    const c = getContainer();
    const time = formatTime(new Date().toISOString());
    c.insertAdjacentHTML('beforeend', `
        <div class="message-wrapper flex items-start justify-end message-animate">
            <div class="mr-3 text-right max-w-[calc(100%-50px)]">
                <div class="flex items-center justify-end mb-1">
                    <span class="text-xs text-gray-400">${time}</span>
                    <span class="ml-2 text-xs font-medium text-gray-600">我</span>
                </div>
                <div class="user-bubble"><p class="msg-content">${message}</p></div>
            </div>
            <img src="/img/user.jpg" class="message-avatar object-cover">
        </div>`);
    c.scrollTop = c.scrollHeight;
}

function addWelcomeMessage() {
    const c = getContainer();
    const time = formatTime(new Date().toISOString());
    c.insertAdjacentHTML('beforeend', `
        <div class="message-wrapper flex items-start message-animate">
            <img src="/img/aichat_logo.png" class="message-avatar object-cover">
            <div class="ml-3 max-w-[calc(100%-50px)]">
                <div class="flex items-center mb-1">
                    <span class="text-xs font-medium text-gray-600">AI助手</span>
                    <span class="ml-2 text-xs text-gray-400">${time}</span>
                </div>
                <div class="ai-bubble">
                    <p class="msg-content mb-3">您好！我是您专属糖尿病AI健康助手，结合您的个人血糖档案提供个性化控糖服务。</p>
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
        </div>`);
    c.scrollTop = c.scrollHeight;
}

async function sendMessage(message) {
    if (!message || message.trim() === '') return;

    const c = getContainer();

    chatHistory.push({ text: message, sender: 'user', timestamp: new Date().toISOString() });
    localStorage.setItem(`aichat_history_${userId}`, JSON.stringify(chatHistory));

    addUserMessageToUI(message);
    messageInput.value = '';
    sendBtn.disabled = true;

    const randomId = 'msg_' + Date.now();
    const now = formatTime(new Date().toISOString());
    c.insertAdjacentHTML('beforeend', `
        <div class="message-wrapper flex items-start message-animate">
            <img src="/img/aichat_logo.png" class="message-avatar object-cover">
            <div class="ml-3 max-w-[calc(100%-50px)]">
                <div class="flex items-center mb-1">
                    <span class="text-xs font-medium text-gray-600">AI助手</span>
                    <span class="ml-2 text-xs text-gray-400">${now}</span>
                </div>
                <div id="${randomId}" class="ai-bubble">
                    <div class="typing-indicator">
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                    </div>
                </div>
            </div>
        </div>`);

    const aiBubble = document.getElementById(randomId);
    c.scrollTop = c.scrollHeight;

    try {
        await fetchAIChatflow(userinfo, message, userId, conversationId, (ans, conId) => {
            conversationId = conId;
            if (ans && ans !== 'done') {
                if (aiBubble.querySelector('.typing-indicator')) {
                    aiBubble.innerHTML = '<div class="msg-content"></div>';
                }
                aiBubble.querySelector('.msg-content').textContent += ans;
                c.scrollTop = c.scrollHeight;
            } else {
                chatHistory.push({ text: aiBubble.textContent, sender: 'ai', timestamp: new Date().toISOString() });
                localStorage.setItem(`aichat_history_${userId}`, JSON.stringify(chatHistory));
            }
        });
    } catch (error) {
        console.error('AI 对话请求失败:', error);
        aiBubble.innerHTML = '<div class="msg-content">抱歉，AI 响应出现异常，请稍后重试。</div>';
        c.scrollTop = c.scrollHeight;
    }
}

function sendQuickMessage(message) {
    if (messageInput) {
        messageInput.value = message;
        sendBtn.disabled = false;
    }
    sendMessage(message);
}

window.onload = async function() {
    messageInput = document.getElementById('messageInput');
    sendBtn = document.getElementById('sendBtn');

    messageInput.addEventListener('input', function() {
        const hasText = this.value.trim() !== '';
        sendBtn.disabled = !hasText;
        if (hasText) {
            sendBtn.classList.add('send-btn-visible');
        } else {
            sendBtn.classList.remove('send-btn-visible');
        }
    });

    sendBtn.addEventListener('click', function() {
        const msg = messageInput.value.trim();
        if (msg) {
            sendMessage(msg);
            messageInput.value = '';
            sendBtn.disabled = true;
            sendBtn.classList.remove('send-btn-visible');
        }
    });

    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            sendMessage(this.value.trim());
            this.value = '';
            sendBtn.disabled = true;
            sendBtn.classList.remove('send-btn-visible');
        }
    });

    document.getElementById('clearChatBtn').addEventListener('click', function() {
        Swal.fire({
            title: '确定要清空聊天记录吗？',
            text: '此操作无法撤销！',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2B7BED',
            cancelButtonColor: '#d33',
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            background: '#fff',
            backdrop: 'rgba(0,0,0,0.4)'
        }).then(result => {
            if (result.isConfirmed) {
                document.getElementById('messages-container').innerHTML = '';
                localStorage.removeItem(`aichat_history_${userId}`);
                chatHistory = [];
                conversationId = null;
                addWelcomeMessage();
                Swal.fire({
                    title: '已清空！',
                    text: '聊天记录已被清空。',
                    icon: 'success',
                    confirmButtonColor: '#2B7BED',
                    timer: 1500,
                    timerProgressBar: true
                });
            }
        });
    });

    try {
        userinfo = await getUserRiskInfo();
        // 兼容 userId/user_id 字段名差异
        userId = userinfo ? (userinfo.userId || userinfo.user_id || 0) : 0;
        chatHistory = JSON.parse(localStorage.getItem(`aichat_history_${userId}`) || '[]');
        if (chatHistory.length > 0) {
            chatHistory.forEach(msg => loadMessageToChat(msg));
        } else {
            addWelcomeMessage();
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
        userId = 0;
        addWelcomeMessage();
    }
};
