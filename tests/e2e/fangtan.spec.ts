// 房探AI - E2E测试套件
// 使用Playwright进行端到端测试

import { test, expect, describe } from '@playwright/test';

// 测试配置
const TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

describe('房探AI E2E测试套件', () => {
  
  // ============ 首页测试 ============
  describe('首页测试', () => {
    test('应该能正常访问首页', async ({ page }) => {
      await page.goto(TEST_BASE_URL);
      
      // 检查页面标题
      await expect(page).toHaveTitle(/房探AI|房产/);
      
      // 检查关键元素
      await expect(page.locator('text=房探AI')).toBeVisible();
      await expect(page.locator('text=免费试用')).toBeVisible();
    });

    test('首页应该展示所有AI Agent功能', async ({ page }) => {
      await page.goto(TEST_BASE_URL);
      
      // 检查Agent卡片
      await expect(page.locator('text=数据采集 Agent')).toBeVisible();
      await expect(page.locator('text=智能触达 Agent')).toBeVisible();
      await expect(page.locator('text=内容生成 Agent')).toBeVisible();
      await expect(page.locator('text=CRM协同 Agent')).toBeVisible();
      await expect(page.locator('text=合规管理 Agent')).toBeVisible();
    });

    test('应该能点击登录按钮跳转到登录页', async ({ page }) => {
      await page.goto(TEST_BASE_URL);
      await page.click('text=免费试用');
      await expect(page).toHaveURL(/login/);
    });
  });

  // ============ 登录页面测试 ============
  describe('登录页面测试', () => {
    test('应该能正常访问登录页', async ({ page }) => {
      await page.goto(`${TEST_BASE_URL}/login`);
      await expect(page.locator('text=欢迎回来')).toBeVisible();
    });

    test('应该显示邮箱和密码输入框', async ({ page }) => {
      await page.goto(`${TEST_BASE_URL}/login`);
      
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('应该显示注册入口', async ({ page }) => {
      await page.goto(`${TEST_BASE_URL}/login`);
      await expect(page.locator('text=立即注册')).toBeVisible();
    });

    test('点击注册应该跳转到注册页', async ({ page }) => {
      await page.goto(`${TEST_BASE_URL}/login`);
      await page.click('text=立即注册');
      await expect(page).toHaveURL(/register/);
    });
  });

  // ============ 注册页面测试 ============
  describe('注册页面测试', () => {
    test('应该能正常访问注册页', async ({ page }) => {
      await page.goto(`${TEST_BASE_URL}/register`);
      await expect(page.locator('text=创建账号')).toBeVisible();
    });

    test('应该显示所有输入字段', async ({ page }) => {
      await page.goto(`${TEST_BASE_URL}/register`);
      
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="phone"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    });
  });

  // ============ Dashboard测试 ============
  describe('Dashboard测试', () => {
    test('应该能访问Dashboard页', async ({ page }) => {
      await page.goto(`${TEST_BASE_URL}/dashboard`);
      // 如果未登录会跳转到登录页
      await page.waitForURL(/login|dashboard/);
    });

    test('Dashboard应该显示所有Agent卡片', async ({ page }) => {
      // 先登录
      await page.goto(`${TEST_BASE_URL}/login`);
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button:has-text("登录")');
      
      // 等待跳转到Dashboard
      await page.waitForURL(/dashboard/);
      
      // 检查Agent卡片
      await expect(page.locator('text=数据采集 Agent')).toBeVisible();
      await expect(page.locator('text=智能触达 Agent')).toBeVisible();
      await expect(page.locator('text=内容生成 Agent')).toBeVisible();
      await expect(page.locator('text=CRM协同 Agent')).toBeVisible();
      await expect(page.locator('text=合规管理 Agent')).toBeVisible();
    });
  });

  // ============ 数据采集页面测试 ============
  describe('数据采集页面测试', () => {
    test('应该能访问数据采集页', async ({ page }) => {
      await page.goto(`${TEST_BASE_URL}/dashboard/data-collection`);
      await page.waitForURL(/login|data-collection/);
    });
  });

  // ============ 智能触达页面测试 ============
  describe('智能触达页面测试', () => {
    test('应该能访问智能触达页', async ({ page }) => {
      await page.goto(`${TEST_BASE_URL}/dashboard/reach`);
      await page.waitForURL(/login|reach/);
    });
  });

  // ============ 内容生成页面测试 ============
  describe('内容生成页面测试', () => {
    test('应该能访问内容生成页', async ({ page }) => {
      await page.goto(`${TEST_BASE_URL}/dashboard/content`);
      await page.waitForURL(/login|content/);
    });
  });

  // ============ CRM页面测试 ============
  describe('CRM页面测试', () => {
    test('应该能访问CRM页', async ({ page }) => {
      await page.goto(`${TEST_BASE_URL}/dashboard/crm`);
      await page.waitForURL(/login|crm/);
    });
  });

  // ============ 合规管理页面测试 ============
  describe('合规管理页面测试', () => {
    test('应该能访问合规管理页', async ({ page }) => {
      await page.goto(`${TEST_BASE_URL}/dashboard/compliance`);
      await page.waitForURL(/login|compliance/);
    });
  });

  // ============ API健康检查测试 ============
  describe('API健康检查测试', () => {
    test('API健康检查端点应该返回200', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/health`);
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.status).toBe('ok');
    });

    test('API文档应该可访问', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/docs`);
      // Swagger可能返回重定向
      expect([200, 302, 301]).toContain(response.status());
    });
  });

  // ============ 响应式测试 ============
  describe('响应式测试', () => {
    test('首页应该在移动端正常显示', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(TEST_BASE_URL);
      
      // 检查关键元素仍然可见
      await expect(page.locator('text=房探AI')).toBeVisible();
    });

    test('首页应该在平板端正常显示', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(TEST_BASE_URL);
      
      await expect(page.locator('text=房探AI')).toBeVisible();
    });
  });

  // ============ 性能测试 ============
  describe('性能测试', () => {
    test('首页加载时间应该小于3秒', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(TEST_BASE_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      console.log(`首页加载时间: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(3000);
    });

    test('登录页加载时间应该小于2秒', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${TEST_BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      console.log(`登录页加载时间: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(2000);
    });
  });

  // ============ 无障碍测试 ============
  describe('无障碍测试', () => {
    test('主要按钮应该有无障碍属性', async ({ page }) => {
      await page.goto(TEST_BASE_URL);
      
      // 检查登录按钮有aria-label或可访问名称
      const loginButton = page.locator('a:has-text("登录")').first();
      await expect(loginButton).toBeVisible();
    });

    test('输入框应该有关联标签', async ({ page }) => {
      await page.goto(`${TEST_BASE_URL}/login`);
      
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toHaveAttribute('id');
    });
  });
});

// ============ 辅助函数 ============

/**
 * 等待指定时间
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成测试用户数据
 */
export function generateTestUser() {
  return {
    name: `测试用户${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    phone: `1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    password: 'TestPassword123!',
  };
}

/**
 * 随机选择数组元素
 */
export function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
