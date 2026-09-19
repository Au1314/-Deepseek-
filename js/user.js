function getUserInfo() {
    const userJson = localStorage.getItem("user")
    if (userJson == null) {
         top.location.href = "/login.html"
        return false 
    } 
    // @ts-ignore
    return JSON.parse(userJson)
}
/**
 * Get user risk information with caching
 * @returns {Promise<Object>} Risk information data
 */
async function getUserRiskInfo() {
    const user = getUserInfo();
    if (!user) {
        throw new Error('User not logged in');
    }
    const userId = user.user_id;
    const cacheKey = `risk_info_${userId}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache expires after 1 hour (3600000 ms)
        if (Date.now() - timestamp <= 3600000) {
            return data;
        }
    }

    try {
        const data = await fetchSQLWorkflow(`查询id为${userId}的用户的用户风险信息`, "tourist");
        const res = data && data.result;
        if (res && Array.isArray(res) && res.length > 0) {
            sessionStorage.setItem(cacheKey, JSON.stringify({
                data: res[0],
                timestamp: Date.now()
            }));
            return res[0];
        }
        return null;
    } catch (error) {
        console.error('获取用户风险信息失败:', error);
        return null;
    }
}
