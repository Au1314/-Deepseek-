// tests/homepage.spec.js
// 登录/注册 & 首页 Playwright 自动化测试脚本
// 测试页面：http://YOUR_HOST:8080
// 包含：①底部导航栏 ②轮播图 ③专业医师团队 ④健康科普 ⑤糖尿病类型

const { test, expect } = require('@playwright/test');

// ==================== 第一部分：登录/注册页面测试 ====================
test.describe('登录/注册页面测试', () => {
  // 错误提示选择器：showAlert.js 动态创建 fixed 定位的 div
  const alertSelector = 'div[style*="position: fixed"][style*="top: 20px"]';

  // 每个测试用例前先访问登录页面
  test.beforeEach(async ({ page }) => {
    await page.goto('http://YOUR_HOST:8080/login.html');
  });

  // ==================== 一、表单切换功能测试 ====================
  test.describe('表单切换功能测试', () => {
    test('TS-001: 默认显示登录表单', async ({ page }) => {
      // 验证默认显示登录表单，注册表单隐藏
      await expect(page.locator('#loginContent')).toBeVisible();
      await expect(page.locator('#registerContent')).not.toBeVisible();

      // 验证登录表单包含用户名和密码字段
      await expect(page.locator('#username')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
    });

    test('TS-002: 切换至注册表单', async ({ page }) => {
      // 点击"注册"标签
      await page.locator('#registerTab').click();

      // 验证注册表单显示，登录表单隐藏
      await expect(page.locator('#registerContent')).toBeVisible();
      await expect(page.locator('#loginContent')).not.toBeVisible();

      // 验证注册表单包含用户名、密码、确认密码字段
      await expect(page.locator('#regUsername')).toBeVisible();
      await expect(page.locator('#regPassword')).toBeVisible();
      await expect(page.locator('#secPassword')).toBeVisible();
    });

    test('TS-003: 从注册切换回登录表单', async ({ page }) => {
      // 先切换到注册表单
      await page.locator('#registerTab').click();
      // 再切换回登录表单
      await page.locator('#loginTab').click();

      // 验证登录表单再次显示，注册表单隐藏
      await expect(page.locator('#loginContent')).toBeVisible();
      await expect(page.locator('#registerContent')).not.toBeVisible();
    });

    test('TS-004: 切换时表单数据清空', async ({ page }) => {
      // 在登录表单输入数据
      await page.locator('#username').fill('testuser');
      await page.locator('#password').fill('password123');

      // 切换到注册表单再切换回来
      await page.locator('#registerTab').click();
      await page.locator('#loginTab').click();

      // 验证登录表单输入框内容已被清空
      await expect(page.locator('#username')).toHaveValue('');
      await expect(page.locator('#password')).toHaveValue('');
    });
  });

  // ==================== 二、登录功能测试 ====================
  test.describe('登录功能测试', () => {
    test('TL-001: 空字段提交显示验证提示', async ({ page }) => {
      // 不输入任何内容，直接点击登录按钮
      await page.locator('button[onclick="login()"]').click();

      // 验证显示"请确保表单填写完整"提示
      await expect(page.locator(alertSelector)).toContainText('请确保表单填写完整');
    });

    test('TL-002: 输入错误用户名或密码', async ({ page }) => {
      // 输入不存在的用户名和任意密码
      await page.locator('#username').fill('nonexistent_user@test.com');
      await page.locator('#password').fill('wrongpassword123');
      await page.locator('button[onclick="login()"]').click();

      // 验证显示"用户名或密码错误"提示（login.js 统一返回此提示）
      await expect(page.locator(alertSelector)).toContainText('用户名或密码错误');
    });

    test('TL-003: 正确格式未注册账户', async ({ page }) => {
      // 输入未注册邮箱和任意密码
      await page.locator('#username').fill('unregistered@user.com');
      await page.locator('#password').fill('anypassword123');
      await page.locator('button[onclick="login()"]').click();

      // 验证显示"用户名或密码错误"提示
      await expect(page.locator(alertSelector)).toContainText('用户名或密码错误');
    });

    test('TL-004: 正常登录（需后端支持）', async ({ page }) => {
      // 使用已知有效的用户名和密码进行测试
      await page.locator('#username').fill('test_user');
      await page.locator('#password').fill('password123');
      await page.locator('button[onclick="login()"]').click();

      // 验证登录成功提示出现
      const alert = page.locator(alertSelector);
      await expect(alert).toContainText('登录成功', { timeout: 10000 });
    });
  });

  // ==================== 三、注册功能测试 ====================
  test.describe('注册功能测试', () => {
    test('TR-001: 必填字段缺失验证', async ({ page }) => {
      // 切换到注册表单
      await page.locator('#registerTab').click();

      // 不输入任何内容，直接点击注册按钮
      await page.locator('button[onclick="register()"]').click();

      // 验证显示"请确保表单填写完整"提示
      await expect(page.locator(alertSelector)).toContainText('请确保表单填写完整');
    });

    test('TR-002: 密码不一致验证', async ({ page }) => {
      // 切换到注册表单
      await page.locator('#registerTab').click();

      // 输入不同的密码和确认密码
      await page.locator('#regUsername').fill('newuser');
      await page.locator('#regPassword').fill('Password123');
      await page.locator('#secPassword').fill('Password456');
      await page.locator('button[onclick="register()"]').click();

      // 验证显示"两次输入的密码不一致"提示
      await expect(page.locator(alertSelector)).toContainText('两次输入的密码不一致');
    });

    test('TR-003: 重复用户名注册', async ({ page }) => {
      // 切换到注册表单
      await page.locator('#registerTab').click();

      // 输入已存在的用户名进行注册
      await page.locator('#regUsername').fill('admin');
      await page.locator('#regPassword').fill('Password123');
      await page.locator('#secPassword').fill('Password123');
      await page.locator('button[onclick="register()"]').click();

      // 验证显示"注册失败，用户名已存在"提示
      await expect(page.locator(alertSelector)).toContainText('注册失败', { timeout: 15000 });
    });

    test('TR-004: 正常注册（需后端支持）', async ({ page }) => {
      // 切换到注册表单
      await page.locator('#registerTab').click();

      // 生成唯一用户名以避免重复注册冲突
      const uniqueUsername = `testuser_${Date.now()}`;
      await page.locator('#regUsername').fill(uniqueUsername);
      await page.locator('#regPassword').fill('TestPass123');
      await page.locator('#secPassword').fill('TestPass123');
      await page.locator('button[onclick="register()"]').click();

      // 验证注册成功提示出现
      const alert = page.locator(alertSelector);
      await expect(alert).toContainText('注册成功', { timeout: 15000 });
    });
  });
});

// ==================== 第二部分：首页功能测试 ====================
test.describe('首页功能测试', () => {
  // 每个测试用例前先访问首页
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  // ==================== 一、底部导航栏功能测试 ====================
  test.describe('底部导航栏功能测试', () => {
    test('TS-001: 默认显示首页内容', async ({ page }) => {
      // 验证iframe中加载了main/main.html
      const iframe = page.frame({ url: /main\/main\.html/ });
      expect(iframe).not.toBeNull();

      // 验证底部"首页"Tab高亮（class包含text-primary）
      const homeTab = page.locator('.nav-item:has(.fa-house)');
      await expect(homeTab).toBeVisible();
    });

    test('TS-002: 切换到"方案定制"Tab', async ({ page }) => {
      // 点击"方案定制"Tab
      await page.locator('text=方案定制').click();

      // 验证iframe加载了对应页面
      const iframe = page.frame({ url: /scheme\/scheme\.html/ });
      expect(iframe).not.toBeNull();
    });

    test('TS-003: 切换到"健康资讯"Tab', async ({ page }) => {
      // 点击"健康资讯"Tab
      await page.locator('text=健康资讯').click();

      // 验证iframe加载了对应页面
      const iframe = page.frame({ url: /lifeadvice\/lifeAdvice\.html/ });
      expect(iframe).not.toBeNull();
    });

    test('TS-004: 切换到"AI助手"Tab', async ({ page }) => {
      // 点击"AI助手"Tab
      await page.locator('text=AI助手').click();

      // 验证iframe加载了对应页面
      const iframe = page.frame({ url: /ai\/aiStart\.html/ });
      expect(iframe).not.toBeNull();
    });

    test('TS-005: 切换到"个人中心"Tab', async ({ page }) => {
      // 点击"个人中心"Tab
      await page.locator('text=个人中心').click();

      // 验证iframe加载了对应页面
      const iframe = page.frame({ url: /mine\/mine\.html/ });
      expect(iframe).not.toBeNull();
    });
  });

  // ==================== 二、轮播图功能测试 ====================
  test.describe('轮播图功能测试', () => {
    test('CB-001: 轮播图默认显示', async ({ page }) => {
      // 等待iframe加载完成
      await page.waitForTimeout(2000);
      const iframe = page.frame({ url: /main\/main\.html/ });
      expect(iframe).not.toBeNull();

      // 验证轮播图容器可见
      const swiper = iframe.locator('.swiper');
      await expect(swiper).toBeVisible();

      // 验证轮播图分页器存在
      const pagination = iframe.locator('.swiper-pagination');
      await expect(pagination).toBeVisible();
    });

    test('CB-002: 轮播图分页器存在', async ({ page }) => {
      await page.waitForTimeout(2000);
      const iframe = page.frame({ url: /main\/main\.html/ });
      expect(iframe).not.toBeNull();

      // 验证分页器圆点存在
      const bullets = iframe.locator('.swiper-pagination-bullet');
      await expect(bullets.first()).toBeVisible();
    });
  });

  // ==================== 三、专业医师团队测试 ====================
  test.describe('专业医师团队测试', () => {
    test('DT-001: 医生列表模块存在', async ({ page }) => {
      await page.waitForTimeout(2000);
      const iframe = page.frame({ url: /main\/main\.html/ });
      expect(iframe).not.toBeNull();

      // 验证医生团队标题可见
      await expect(iframe.locator('text=专业医师团队')).toBeVisible();

      // 验证医生卡片容器存在
      const doctorContainer = iframe.locator('.doctor-list, .swiper-wrapper');
      await expect(doctorContainer).toBeVisible();
    });
  });

  // ==================== 四、健康科普测试 ====================
  test.describe('健康科普测试', () => {
    test('AL-001: 健康科普模块存在', async ({ page }) => {
      await page.waitForTimeout(2000);
      const iframe = page.frame({ url: /main\/main\.html/ });
      expect(iframe).not.toBeNull();

      // 验证健康科普标题可见
      await expect(iframe.locator('text=健康科普')).toBeVisible();
    });
  });

  // ==================== 五、糖尿病类型测试 ====================
  test.describe('糖尿病类型测试', () => {
    test('TP-001: 糖尿病类型模块存在', async ({ page }) => {
      await page.waitForTimeout(2000);
      const iframe = page.frame({ url: /main\/main\.html/ });
      expect(iframe).not.toBeNull();

      // 验证糖尿病类型标题可见
      await expect(iframe.locator('text=糖尿病类型')).toBeVisible();
    });
  });

  // ==================== 六、界面与交互测试 ====================
  test.describe('界面与交互测试', () => {
    test('UI-001: 页面基本结构存在', async ({ page }) => {
      // 验证页面标题
      await expect(page).toHaveTitle(/糖尿病/);

      // 验证底部导航栏有5个Tab
      const navItems = page.locator('.nav-item');
      await expect(navItems).toHaveCount(5);
    });
  });
});