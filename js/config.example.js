// ============================================================================
// 配置示例文件
//
// 使用方法：
//   1. 复制本文件为 config.js：  cp config.example.js config.js
//   2. 将占位符替换为你自己的 Dify 服务地址与 API Token
//   3. config.js 已在 .gitignore 中忽略，不会被提交到版本库
// ============================================================================
window.APP_CONFIG = {
    // Dify 平台服务地址（不含 /v1/ 路径）
    BASE_API: "http://YOUR_DIFY_HOST",

    // 各工作流的 API Token（在 Dify 后台「应用 -> API 访问」中获取）
    SQL_AUTH_TOKEN: "Bearer app-YOUR_SQL_TOKEN",
    DM_AUTH_TOKEN: "Bearer app-YOUR_DM_TOKEN",
    DD_AUTH_TOKEN: "Bearer app-YOUR_DD_TOKEN",
    LP_AUTH_TOKEN: "Bearer app-YOUR_LP_TOKEN",
    LA_AUTH_TOKEN: "Bearer app-YOUR_LA_TOKEN",
    AL_AUTH_TOKEN: "Bearer app-YOUR_AL_TOKEN",
    AI_CHAT_TOKEN: "Bearer app-YOUR_AI_CHAT_TOKEN",
    ADMIN_AUTH_TOKEN: "Bearer app-YOUR_ADMIN_TOKEN",

    // 医师咨询聊天 Token（按医生 info_id 映射）
    DOCTOR_CHAT_TOKENS: {
        "1": "Bearer app-YOUR_DOCTOR_1_TOKEN",
        "2": "Bearer app-YOUR_DOCTOR_2_TOKEN",
        "3": "Bearer app-YOUR_DOCTOR_3_TOKEN"
    }
};
