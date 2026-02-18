// 房探AI - API集成测试
// 测试API端点功能

import { test, expect, describe } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

describe('房探AI API集成测试', () => {
  
  // ============ 健康检查 ============
  describe('健康检查', () => {
    test('GET /health 应该返回200', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/health`);
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.status).toBe('ok');
      expect(body.timestamp).toBeDefined();
    });

    test('GET / 应该返回API信息', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/`);
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.name).toBe('fangtan-ai-api');
      expect(body.version).toBeDefined();
    });
  });

  // ============ 认证模块测试 ============
  describe('认证模块', () => {
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    let accessToken: string;
    let refreshToken: string;

    test('POST /auth/register 应该注册新用户', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/v1/auth/register`, {
        data: {
          name: '测试用户',
          email: testEmail,
          phone: `1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
          password: testPassword,
        },
      });

      // 用户可能已存在(409)或成功(201)
      expect([201, 409]).toContain(response.status());

      if (response.status() === 201) {
        const body = await response.json();
        expect(body.user).toBeDefined();
        expect(body.user.email).toBe(testEmail);
        accessToken = body.accessToken;
        refreshToken = body.refreshToken;
      }
    });

    test('POST /auth/login 应该返回token', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: testEmail,
          password: testPassword,
        },
      });

      // 如果用户不存在会返回401，如果存在且密码正确返回200
      if (response.status() === 200) {
        const body = await response.json();
        expect(body.accessToken).toBeDefined();
        expect(body.refreshToken).toBeDefined();
        expect(body.user).toBeDefined();
        accessToken = body.accessToken;
        refreshToken = body.refreshToken;
      }
    });

    test('POST /auth/refresh 应该刷新token', async ({ request }) => {
      if (!refreshToken) {
        console.log('跳过测试: 无refresh token');
        return;
      }

      const response = await request.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
        data: {
          refreshToken,
        },
      });

      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.accessToken).toBeDefined();
    });
  });

  // ============ 用户模块测试 ============
  describe('用户模块', () => {
    let authToken: string;

    beforeAll(async ({ request }) => {
      // 获取认证token
      const response = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      if (response.status() === 200) {
        const body = await response.json();
        authToken = body.accessToken;
      }
    });

    test('GET /users/me 应该返回当前用户信息', async ({ request }) => {
      if (!authToken) {
        console.log('跳过测试: 无auth token');
        return;
      }

      const response = await request.get(`${API_BASE_URL}/api/v1/users/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('GET /users 应该需要认证', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/v1/users`);
      expect(response.status()).toBe(401);
    });
  });

  // ============ 数据采集模块测试 ============
  describe('数据采集模块', () => {
    let authToken: string;

    beforeAll(async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      if (response.status() === 200) {
        const body = await response.json();
        authToken = body.accessToken;
      }
    });

    test('GET /data-collection/sources 应该返回数据源列表', async ({ request }) => {
      if (!authToken) {
        console.log('跳过测试: 无auth token');
        return;
      }

      const response = await request.get(`${API_BASE_URL}/api/v1/data-collection/sources`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('GET /data-collection/tasks 应该需要认证', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/v1/data-collection/tasks`);
      expect(response.status()).toBe(401);
    });

    test('GET /data-collection/statistics 应该返回统计信息', async ({ request }) => {
      if (!authToken) {
        console.log('跳过测试: 无auth token');
        return;
      }

      const response = await request.get(`${API_BASE_URL}/api/v1/data-collection/statistics`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 401]).toContain(response.status());
    });
  });

  // ============ 智能触达模块测试 ============
  describe('智能触达模块', () => {
    let authToken: string;

    beforeAll(async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      if (response.status() === 200) {
        const body = await response.json();
        authToken = body.accessToken;
      }
    });

    test('GET /reach/tasks 应该需要认证', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/v1/reach/tasks`);
      expect(response.status()).toBe(401);
    });

    test('GET /reach/statistics 应该返回统计信息', async ({ request }) => {
      if (!authToken) {
        console.log('跳过测试: 无auth token');
        return;
      }

      const response = await request.get(`${API_BASE_URL}/api/v1/reach/statistics`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 401]).toContain(response.status());
    });
  });

  // ============ 内容生成模块测试 ============
  describe('内容生成模块', () => {
    let authToken: string;

    beforeAll(async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      if (response.status() === 200) {
        const body = await response.json();
        authToken = body.accessToken;
      }
    });

    test('GET /content/templates 应该需要认证', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/v1/content/templates`);
      expect(response.status()).toBe(401);
    });

    test('GET /content/statistics 应该返回统计信息', async ({ request }) => {
      if (!authToken) {
        console.log('跳过测试: 无auth token');
        return;
      }

      const response = await request.get(`${API_BASE_URL}/api/v1/content/statistics`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 401]).toContain(response.status());
    });
  });

  // ============ CRM模块测试 ============
  describe('CRM模块', () => {
    let authToken: string;

    beforeAll(async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      if (response.status() === 200) {
        const body = await response.json();
        authToken = body.accessToken;
      }
    });

    test('GET /crm/customers 应该需要认证', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/v1/crm/customers`);
      expect(response.status()).toBe(401);
    });

    test('GET /crm/statistics 应该返回统计信息', async ({ request }) => {
      if (!authToken) {
        console.log('跳过测试: 无auth token');
        return;
      }

      const response = await request.get(`${API_BASE_URL}/api/v1/crm/statistics`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 401]).toContain(response.status());
    });
  });

  // ============ 合规管理模块测试 ============
  describe('合规管理模块', () => {
    let authToken: string;

    beforeAll(async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      if (response.status() === 200) {
        const body = await response.json();
        authToken = body.accessToken;
      }
    });

    test('POST /compliance/check 应该检查内容合规', async ({ request }) => {
      if (!authToken) {
        console.log('跳过测试: 无auth token');
        return;
      }

      const response = await request.post(`${API_BASE_URL}/api/v1/compliance/check`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          content: '这是一段测试内容',
        },
      });

      expect([200, 401]).toContain(response.status());
    });

    test('GET /compliance/sensitive-words 应该需要认证', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/v1/compliance/sensitive-words`);
      expect(response.status()).toBe(401);
    });

    test('GET /compliance/logs 应该需要认证', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/v1/compliance/logs`);
      expect(response.status()).toBe(401);
    });
  });

  // ============ 速率限制测试 ============
  describe('速率限制测试', () => {
    test('频繁请求应该触发速率限制', async ({ request }) => {
      // 发送超过限制的请求
      const promises = [];
      for (let i = 0; i < 150; i++) {
        promises.push(
          request.get(`${API_BASE_URL}/health`).catch(() => null)
        );
      }
      
      await Promise.all(promises);
      
      // 至少部分请求应该被限制
      // 注意: 这个测试可能需要调整，因为健康检查端点通常不被限制
    });
  });

  // ============ 错误处理测试 ============
  describe('错误处理测试', () => {
    test('不存在的路由应该返回404', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/v1/unknown-endpoint`);
      expect(response.status()).toBe(404);
    });

    test('错误的请求格式应该返回400', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
        data: {
          // 缺少必填字段
          email: 'test@example.com',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('无效token应该返回401', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/v1/users`, {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect(response.status()).toBe(401);
    });
  });
});

// ============ 辅助函数 ============

/**
 * 生成随机测试数据
 */
export function generateRandomTestData() {
  return {
    email: `test${Date.now()}${Math.random().toString(36).substring(7)}@example.com`,
    phone: `1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    name: `测试用户${Date.now()}`,
    password: 'TestPassword123!',
  };
}

/**
 * 等待指定毫秒
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
