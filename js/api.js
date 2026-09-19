// ============================================================================
// 配置说明（已脱敏）
// 真实的 Dify 服务地址与 API Token 不纳入版本库。请在本目录（js/）新建
// config.js 并参考 config.example.js 填写真实值。
// api.js 会优先读取 window.APP_CONFIG；未配置时使用下方占位符（仅用于展示，
// 无法连接后端服务）。
// ============================================================================
const APP_CONFIG = window.APP_CONFIG || {};

const BASE_API = APP_CONFIG.BASE_API || "http://YOUR_DIFY_HOST";
const WORKFLOWS_API_PATH = "/v1/workflows/run";
const CHAT_API_PATH = "/v1/chat-messages";

const SQL_AUTH_TOKEN = APP_CONFIG.SQL_AUTH_TOKEN || "Bearer app-YOUR_SQL_TOKEN";
const DM_AUTH_TOKEN = APP_CONFIG.DM_AUTH_TOKEN || "Bearer app-YOUR_DM_TOKEN";
const DD_AUTH_TOKEN = APP_CONFIG.DD_AUTH_TOKEN || "Bearer app-YOUR_DD_TOKEN";
const LP_AUTH_TOKEN = APP_CONFIG.LP_AUTH_TOKEN || "Bearer app-YOUR_LP_TOKEN";
const LA_AUTH_TOKEN = APP_CONFIG.LA_AUTH_TOKEN || "Bearer app-YOUR_LA_TOKEN";
const AL_AUTH_TOKEN = APP_CONFIG.AL_AUTH_TOKEN || "Bearer app-YOUR_AL_TOKEN";
const AI_CHAT_TOKEN = APP_CONFIG.AI_CHAT_TOKEN || "Bearer app-YOUR_AI_CHAT_TOKEN";

// ==================== 医师咨询聊天 Token（按医生 info_id 映射）====================
const DOCTOR_CHAT_TOKENS = APP_CONFIG.DOCTOR_CHAT_TOKENS || {
    "1": "Bearer app-YOUR_DOCTOR_1_TOKEN",
    "2": "Bearer app-YOUR_DOCTOR_2_TOKEN",
    "3": "Bearer app-YOUR_DOCTOR_3_TOKEN"
};

/**
 * 根据医生 info_id 获取对应的聊天 Token
 * @param {string|number} infoId - 医生的 info_id
 * @returns {string|null} Token 字符串，未找到则返回 null
 */
function getDoctorTokenById(infoId) {
    return DOCTOR_CHAT_TOKENS[String(infoId)] || null;
}

async function fetchWorkflowData(inputs, userId, AUTH_TOKEN) {
    try {
        const headers = new Headers({
            "Authorization": AUTH_TOKEN,
            "Content-Type": "application/json"
        });

        const response = await fetch(`${BASE_API}${WORKFLOWS_API_PATH}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                inputs: inputs,
                response_mode: "blocking",
                user: userId
            }),
            redirect: 'follow'
        });

        // 检查响应状态
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('请求失败详情:', {
                status: response.status,
                statusText: response.statusText,
                body: errorBody
            });
            throw new Error(`请求失败，状态码：${response.status}，详情：${errorBody}`);
        }

        const result = await response.text();
        const responseData = JSON.parse(result);
        
        console.log('API响应数据:', responseData);
        
        try {
            // 尝试多种响应格式
            // 格式1: responseData.data.outputs.body
            if (responseData.data && responseData.data.outputs) {
                const body = responseData.data.outputs.body;
                if (typeof body === 'string') {
                    return JSON.parse(body);
                }
                return body;
            }
            
            // 格式2: responseData.data.result (Text2SQL格式)
            if (responseData.data && responseData.data.result !== undefined) {
                return { result: responseData.data.result };
            }
            
            // 格式3: responseData.result (直接返回)
            if (responseData.result !== undefined) {
                return responseData;
            }
            
            // 格式4: 直接返回 data
            if (responseData.data) {
                return responseData.data;
            }
            
            // 兜底：返回整个响应
            console.warn('未识别标准返回结构，返回原始数据');
            return responseData;
        } catch (e) {
            console.error('数据解析失败:', e);
            throw new Error('数据解析失败: ' + e.message);
        }

    } catch (error) {
        console.error('请求处理失败:', error);
        throw new Error(`数据处理失败: ${error.message}`);
    }
}

// Text2sql工作流函数
async function fetchSQLWorkflow(intention, userId) {
    return await fetchWorkflowData({ intention: intention }, userId, SQL_AUTH_TOKEN);
}

// 数据管理工作流
async function runWorkflow(inputs, userId = 'abc-123') {
    return await fetchWorkflowData(inputs, userId, DM_AUTH_TOKEN);
}

// 糖尿病检测工作流函数
async function fetchDiabetesDetectionWorkflow(inputs, userId) {
    return await fetchWorkflowData(inputs, userId, DD_AUTH_TOKEN);
}

// 生活方案定制
async function fetchLifePlansWorkflow(inputs, userId) {
    return await fetchWorkflowData(inputs, userId, LP_AUTH_TOKEN);
}

// 生活建议工作流函数
async function fetchLifeAdviceWorkflow(inputs, userId) {
    return await fetchWorkflowData(inputs, userId, LA_AUTH_TOKEN);
}

// 打卡分析工作流
async function fetchAnalysisWorkflow(inputs, userId) {
    return await fetchWorkflowData(inputs, userId, AL_AUTH_TOKEN);
}

// 智能体的调用（流式，内部拼接完整回复后返回）
async function fetchChatflow(inputs, message, userId, CHAT_TOKEN, conversationId = "") {
    try {
        const authToken = CHAT_TOKEN.startsWith('Bearer ') 
            ? CHAT_TOKEN 
            : `Bearer ${CHAT_TOKEN}`;
        
        const headers = new Headers({
            "Authorization": authToken,
            "Content-Type": "application/json"
        });

        const requestData = {
            inputs: inputs,
            query: message,
            response_mode: "streaming",
            user: userId
        };
        if (conversationId && conversationId !== "" && conversationId !== "null") {
            requestData.conversation_id = conversationId;
        }

        const requestBody = JSON.stringify(requestData);
        
        const response = await fetch(`${BASE_API}${CHAT_API_PATH}`, {
            method: 'POST',
            headers: headers,
            body: requestBody
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let conversation_id = null
        let resultStr = ''
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true }).replace("event: ping","");
            const chunks = chunk.split('data: ');
            chunks.forEach((ck) => {
                try {
                    const data = JSON.parse(ck);
                    if(data.answer){
                        resultStr += data.answer;
                    }
                    if (conversation_id==null&&data.conversation_id) {
                        conversation_id = data.conversation_id;
                    }
                }catch (error) {
                }
            })
        }
        
        return {
            id: conversation_id,
            answer: resultStr
        };

    } catch (error) {
        console.error('请求处理失败:', error);
        throw new Error(`数据处理失败: ${error.message}`);
    }
}

// ==================== 需求1：医师咨询聊天接口（非流式，整段返回）====================
/**
 * 封装 DeepSeek 聊天接口调用函数
 * @param {Object} inputs - 用户健康数据（注意：userId 需要包含在 inputs 内传给 Dify）
 * @param {string} message - 用户咨询内容
 * @param {string} userId - 模拟固定用户 id
 * @param {string} chatToken - 认证 Token
 * @param {string} [conversationId="0"] - 会话标识，默认"0"表示新会话
 * @returns {Promise<{conversation_id: string, answer: string}>}
 */
async function fetchDoctorChat(inputs, message, userId, chatToken, conversationId = "0") {
    try {
        const authToken = chatToken.startsWith('Bearer ') 
            ? chatToken 
            : `Bearer ${chatToken}`;
        
        const headers = new Headers({
            "Authorization": authToken,
            "Content-Type": "application/json"
        });

        // KEY FIX: Dify 要求 userId 在 inputs 内且为有效数字
        // 无论传入什么 userId，强制转为有效正整数（NaN/0/负数 统一兜底为 1）
        const safeUserId = (function(n) {
            const num = Number(n);
            return (!isNaN(num) && num > 0) ? num : 1;
        })(userId);

        // KEY FIX: Dify 类型校验 — 数字字段必须为 number，必填字段不能缺失
        // 必填数字字段（age/height/weight）：空值设为 0（不能 delete，否则 Dify 报必填校验错误）
        // 可选数字字段（waistline/systolicPressure）：空值可以删除
        const requiredNumberFields = ['age', 'height', 'weight'];
        const optionalNumberFields = ['waistline', 'systolicPressure'];
        const cleanInputs = { ...(inputs || {}) };
        requiredNumberFields.forEach(field => {
            const val = cleanInputs[field];
            cleanInputs[field] = (val !== undefined && val !== null && val !== '') ? Number(val) : 0;
        });
        optionalNumberFields.forEach(field => {
            const val = cleanInputs[field];
            if (val !== undefined && val !== null && val !== '') {
                cleanInputs[field] = Number(val);
            } else {
                delete cleanInputs[field];
            }
        });

        const mergedInputs = { ...cleanInputs, userId: safeUserId };

        const requestData = {
            inputs: mergedInputs,
            query: message,
            response_mode: "streaming",  // 改为 streaming 模式（与 chatTest.html 一致）
            user: userId
        };
        // 新会话（conversation_id为"0"）不传该字段
        if (conversationId && conversationId !== "" && conversationId !== "null" && conversationId !== "0") {
            requestData.conversation_id = conversationId;
        }

        console.log('fetchDoctorChat 请求参数:', {
            url: `${BASE_API}${CHAT_API_PATH}`,
            requestData: { ...requestData, inputs: mergedInputs }
        });

        const response = await fetch(`${BASE_API}${CHAT_API_PATH}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        // === 改用 streaming 模式，内部拼接完整回复 ===
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let resultConversationId = null;
        let resultAnswer = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true }).replace("event: ping","");
            const chunks = chunk.split('data: ');
            chunks.forEach((ck) => {
                try {
                    const data = JSON.parse(ck);
                    if (data.answer) {
                        resultAnswer += data.answer;
                    }
                    if (resultConversationId == null && data.conversation_id) {
                        resultConversationId = data.conversation_id;
                    }
                } catch (error) {
                    // 忽略非 JSON 片段（如 "event: ping"）
                }
            });
        }
        
        console.log('fetchDoctorChat 拼接完成, conversation_id:', resultConversationId);
        
        return {
            conversation_id: resultConversationId || conversationId,
            answer: resultAnswer || ''
        };

    } catch (error) {
        console.error('请求处理失败:', error);
        throw new Error(`数据处理失败: ${error.message}`);
    }
}

async function fetchAIChatflow(inputs, message, userId, conversationId = "", callFunc) {
    try {
        const headers = new Headers({
            "Authorization": AI_CHAT_TOKEN,
            "Content-Type": "application/json"
        });

        // KEY FIX: 对 inputs 进行类型清洗，避免 Dify 数字字段类型校验失败
        const safeUserId = (function(n) {
            const num = Number(n);
            return (!isNaN(num) && num > 0) ? num : 1;
        })(userId);

        const requiredNumberFields = ['age', 'height', 'weight'];
        const optionalNumberFields = ['waistline', 'systolicPressure'];
        const cleanInputs = { ...(inputs || {}) };
        requiredNumberFields.forEach(field => {
            const val = cleanInputs[field];
            cleanInputs[field] = (val !== undefined && val !== null && val !== '') ? Number(val) : 0;
        });
        optionalNumberFields.forEach(field => {
            const val = cleanInputs[field];
            if (val !== undefined && val !== null && val !== '') {
                cleanInputs[field] = Number(val);
            } else {
                delete cleanInputs[field];
            }
        });

        const mergedInputs = { ...cleanInputs, userId: safeUserId };

        // KEY FIX: user 字段必须为非空字符串，userId 为 0 时兜底为 "1"
        const safeUserStr = (function(n) {
            const num = Number(n);
            return (!isNaN(num) && num > 0) ? String(num) : "1";
        })(userId);

        const requestData = {
            inputs: mergedInputs,
            query: message,
            response_mode: "streaming",
            user: safeUserStr
        };
        if (conversationId && conversationId !== "" && conversationId !== "null") {
            requestData.conversation_id = conversationId;
        }

        console.log('fetchAIChatflow 请求参数:', {
            url: `${BASE_API}${CHAT_API_PATH}`,
            requestData: { ...requestData, inputs: mergedInputs }
        });

        const response = await fetch(`${BASE_API}${CHAT_API_PATH}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let conversation_id = null
        let resultStr = ''
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true }).replace("event: ping","");
            const chunks = chunk.split('data: ');
            chunks.forEach((ck) => {
                try {
                    const data = JSON.parse(ck);
                    if (conversation_id==null&&data.conversation_id) {
                        conversation_id = data.conversation_id;
                    }
                    if(data.answer){
                        callFunc(data.answer, conversation_id);
                    }
                }catch (error) {
                }
            })
        }
        callFunc('done', conversation_id);

    } catch (error) {
        console.error('请求处理失败:', error);
        throw new Error(`数据处理失败: ${error.message}`);
    }
}