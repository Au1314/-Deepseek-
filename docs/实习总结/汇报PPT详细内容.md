# 糖尿病预治智能助手 - 答辩PPT详细内容

---

## 第1页：封面

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [项目Logo/图标]                       │
│                                                         │
│              糖尿病预治智能助手                           │
│           Diabetes Management Assistant                 │
│                                                         │
│              ─────────────────────                      │
│                                                         │
│               小组成员：魏家欣组                          │
│                                                         │
│                  2026年7月                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 第2页：项目背景与目标

### 项目背景
- 我国糖尿病患者超1.4亿，居全球首位
- 糖尿病管理需要长期、持续的健康监测
- 传统管理模式效率低，用户依从性差

### 项目目标
- 打造一站式糖尿病健康管理Web应用
- 实现AI智能问答与个性化方案定制
- 提供便捷的血糖监测与数据分析

### 技术栈
| 类别 | 技术 |
|------|------|
| 前端框架 | HTML5 + CSS3 + JavaScript ES6+ |
| UI框架 | Tailwind CSS |
| 图标库 | Font Awesome 6.4.0 |
| 弹窗组件 | SweetAlert2 |
| AI平台 | Dify + DeepSeek大模型 |

---

## 第3页：项目架构

### 整体架构
```
┌──────────────────────────────────────┐
│           index.html (外壳)          │
├──────────────────────────────────────┤
│         iframe 内容容器              │
│  ┌────────────────────────────────┐  │
│  │     各功能模块页面              │  │
│  │  (main/scheme/lifeadvice/ai/mine)│  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│         底部Tab导航栏 (5个)          │
│  首页 | 方案定制 | 健康资讯 | AI助手 | 个人中心 │
└──────────────────────────────────────┘
```

### 5大核心模块
1. **首页** - 轮播图、医师团队、健康科普、糖尿病类型
2. **方案定制** - 糖尿病检测、生活方案生成
3. **健康资讯** - 饮食指导、运动指南、科普文章
4. **AI助手** - 智能问答、风险预测
5. **个人中心** - 用户信息、健康档案

---

## 第4页：首页模块

### 功能展示
- 顶部轮播图（Swiper.js实现）
- 专业医师团队（横向滚动卡片）
- 健康科普文章列表
- 糖尿病类型网格展示

### 技术实现
```javascript
// 动态数据加载
loadDoctors()    // 医师团队
loadArticles()   // 健康科普
loadTypes()      // 糖尿病类型

// 缓存机制（1小时有效期）
sessionStorage.setItem(key, JSON.stringify({
    data: result,
    timestamp: Date.now()
}));
```

### 页面截图
[在此插入首页截图]

---

## 第5页：医师咨询模块

### 功能展示
- 医师列表（头像、姓名、科室、职称）
- 在线咨询聊天界面
- 历史聊天记录持久化
- 开场白与清空确认

### 技术实现
- **SSE流式传输**：ReadableStream + TextDecoder逐块解析
- **会话管理**：conversation_id维持上下文
- **数据过滤**：过滤"event: ping"等非数据控制信息

```javascript
// 流式响应处理
const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    // 解析并拼接回复文本
}
```

### 页面截图
[在此插入医师咨询截图]

---

## 第6页：方案定制模块

### 功能展示
- 糖尿病风险检测表单
- 个性化生活方案生成
- 饮食管理与打卡
- 运动管理与打卡

### 技术实现
- **表单校验**：数字字段强制类型转换
- **Workflow调用**：阻塞模式等待完整响应

```javascript
// 数据类型清洗
const requiredNumberFields = ['age', 'height', 'weight'];
requiredNumberFields.forEach(field => {
    cleanInputs[field] = (val !== undefined && val !== '') ? Number(val) : 0;
});
```

### 页面截图
[在此插入方案定制截图]

---

## 第7页：健康资讯模块

### 功能展示
- 4类内容：饮食指导、运动指南、日常习惯、糖尿病科普
- 资讯详情页（AI生成HTML内容）
- 收藏管理功能

### 技术实现
- **标签分类**：胶囊形标签渲染
- **XSS防护**：escapeHtml()转义动态内容
- **缓存优化**：sessionStorage减少API调用

```javascript
// XSS防护
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

### 页面截图
[在此插入健康资讯截图]

---

## 第8页：AI智能助手模块

### 功能展示
- 糖尿病信息问答（DeepSeek大模型）
- 糖尿病风险预测
- 个性化生活方案生成
- 个人健康指标管理

### 技术实现
- **Chatflow流式调用**：实时显示AI回复
- **流式回调**：callFunc逐字渲染
- **会话延续**：conversation_id跨轮次保持

### 核心优势
| 特性 | 说明 |
|------|------|
| 专业性 | 基于DeepSeek大模型的医学知识 |
| 个性化 | 结合用户健康数据定制方案 |
| 实时性 | 流式输出，即时响应 |
| 安全性 | XSS防护 + 数据校验 |

### 页面截图
[在此插入AI助手截图]

---

## 第9页：个人中心模块

### 功能展示
- 用户登录/注册
- 个人信息展示
- 健康档案管理
- 我的收藏列表

### 技术实现
- **登录鉴权**：localStorage存储用户信息
- **状态管理**：getUserInfo()全局获取用户
- **安全退出**：清除本地存储数据

### 页面截图
[在此插入个人中心截图]

---

## 第10页：打卡记录与分析

### 功能展示
- 饮食打卡记录
- 运动打卡记录
- AI数据分析报告

### 技术实现
- **数据存储**：通过SQL工作流持久化
- **分析报告**：调用分析工作流生成
- **可视化**：图表展示趋势数据

### 页面截图
[在此插入打卡记录截图]

---

## 第11页：系统界面总览

### 整体UI设计
- 移动端优先设计（max-w-md）
- 响应式布局适配
- 统一的视觉风格（蓝色主题）

### 页面跳转流程
```
登录页 → 首页
         ├── 方案定制 → 打卡记录 → AI分析
         ├── 健康资讯 → 资讯详情 → 收藏列表
         ├── AI助手 → 对话界面
         └── 个人中心 → 健康档案
```

---

## 第12页：核心技术点

### 1. Dify平台集成
- **Workflow（阻塞模式）**：用于数据查询、方案生成
- **Chatflow（流式模式）**：用于AI对话、医师咨询

### 2. SSE流式响应处理
```javascript
// 服务端推送事件处理
const reader = response.body.getReader();
const decoder = new TextDecoder();
let resultStr = '';

while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true })
        .replace("event: ping", "");
    const chunks = chunk.split('data: ');
    
    chunks.forEach((ck) => {
        try {
            const data = JSON.parse(ck);
            if (data.answer) resultStr += data.answer;
        } catch (e) {}
    });
}
```

### 3. 多种API响应格式兼容
- `data.outputs.body` (JSON字符串/对象)
- `data.result` (Text2SQL格式)
- `result` (直接返回)

---

## 第13页：数据与安全

### 缓存策略
| 缓存Key | 数据 | 有效期 |
|---------|------|--------|
| doctors_data | 医师团队 | 1小时 |
| articles_data | 健康科普 | 1小时 |
| diabetes_types_data | 糖尿病类型 | 1小时 |
| risk_info_{userId} | 风险信息 | 1小时 |

### 安全特性
1. **XSS防护**：escapeHtml()转义动态内容
2. **SQL注入防护**：使用参数化查询（工作流API）
3. **数据校验**：数字字段强制类型转换
4. **空值处理**：必填字段兜底为0，可选字段删除

---

## 第14页：跨页面状态管理

### iframe架构挑战
- 不同子页面间的状态共享
- 用户登录态维护
- 聊天记录持久化

### 解决方案
```
localStorage (核心数据枢纽)
├── user: 用户登录信息
├── currentDoctor: 当前咨询医师
└── 其他业务数据

sessionStorage (临时缓存)
├── doctors_data: 医师列表缓存
├── articles_data: 文章缓存
├── risk_info_{id}: 风险信息缓存
└── lifeAdvice_{msg}: 健康建议缓存
```

---

## 第15页：开发工具与协作

### 开发环境
| 工具 | 用途 |
|------|------|
| VS Code | 前端代码编辑 |
| Dify平台 | AI工作流配置 |
| Git | 版本控制 |
| Chrome DevTools | 调试工具 |

### 协作分工
- 首页模块开发
- 方案定制模块开发
- 健康资讯模块开发
- AI助手模块开发
- 个人中心模块开发

---

## 第16页：项目成果

### 完成的功能模块
- [x] 用户登录/注册系统
- [x] 首页动态数据展示
- [x] 医师在线咨询
- [x] 糖尿病风险检测
- [x] 个性化生活方案生成
- [x] 健康资讯浏览与收藏
- [x] AI智能问答助手
- [x] 打卡记录与分析

### 技术收获
- 掌握了前端异步编程（async/await）
- 学会了SSE流式响应处理
- 理解了跨页面状态管理方案
- 实践了XSS防护等安全措施

### 遇到的挑战
- Dify API响应格式不统一 → 设计通用解析函数
- 流式数据拼接 → ReadableStream循环读取
- 数据类型校验 → 前端数据清洗逻辑

---

## 第17页：未来展望

### 功能优化
- 添加更多健康指标监测
- 完善数据分析可视化
- 优化AI问答准确率

### 技术升级
- 迁移到Vue/React框架
- 引入TypeScript提升类型安全
- 部署到云服务器

### 项目扩展
- 开发移动端App
- 接入更多医疗设备数据
- 支持多语言

---

## 第18页：致谢

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                      感谢聆听                            │
│                                                         │
│              ─────────────────────                      │
│                                                         │
│            感谢指导老师的悉心指导                         │
│            感谢小组成员的协作配合                         │
│                                                         │
│                      Q&A                                │
│                                                         │
│                  欢迎提问交流                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 附录：关键代码片段

### API调用封装 (api.js)
```javascript
// 通用工作流调用
async function fetchWorkflowData(inputs, userId, AUTH_TOKEN) {
    const response = await fetch(`${BASE_API}${WORKFLOWS_API_PATH}`, {
        method: 'POST',
        headers: { "Authorization": AUTH_TOKEN },
        body: JSON.stringify({
            inputs: inputs,
            response_mode: "blocking",
            user: userId
        })
    });
    // ... 响应处理
}

// 流式聊天调用
async function fetchChatflow(inputs, message, userId, CHAT_TOKEN) {
    const response = await fetch(`${BASE_API}${CHAT_API_PATH}`, {
        method: 'POST',
        body: JSON.stringify({
            inputs: inputs,
            query: message,
            response_mode: "streaming",
            user: userId
        })
    });
    // ... SSE流式处理
}
```

### 缓存机制 (main.js)
```javascript
function getCachedData(key) {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > 3600000) {
        sessionStorage.removeItem(key);
        return null;
    }
    return data;
}
```
