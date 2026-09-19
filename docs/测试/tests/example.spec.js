// tests/example.spec.js
const { test, expect } = require('@playwright/test');

test('basic test', async ({ page }) => {
    // 导航到目标页面
    await page.goto('https://example.com');
    // 获取页面标题
    const title = await page.title();
    // 断言页面标题是否符合预期
    expect(title).toBe('Example Domain');
});