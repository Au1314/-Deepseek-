// api.js - API 调用功能
// Dify Text2SQL 工作流接口

const SQL_AUTH_TOKEN = 'Bearer app-YOUR_SQL_TOKEN';

async function fetchWorkflowData(inputs, userId, authToken) {
    try {
        const response = await fetch('http://YOUR_DIFY_HOST/v1/workflows/run', {
            method: 'POST',
            headers: {
                'Authorization': authToken || SQL_AUTH_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: inputs,
                user_id: userId
            })
        });

        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

async function fetchSQLWorkflow(intention, userId) {
    try {
        const data = await fetchWorkflowData({ intention: intention }, userId, SQL_AUTH_TOKEN);
        return data;
    } catch (error) {
        console.error('SQL workflow request failed:', error);
        throw error;
    }
}