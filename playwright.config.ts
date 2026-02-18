import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  
  // 全局超时设置
  timeout: 30000,
  
  // 期望的测试数量
  expect: {
    timeout: 5000,
  },
  
  // 重试设置
  retries: process.env.CI ? 2 : 0,
  
  // 并行设置
  fullyParallel: true,
  
  // reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
  ],
  
  // 使用baseURL
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // 权限设置
    permissions: ['geolocation'],
    
    // 模拟位置
    geolocation: { latitude: 31.2304, longitude: 121.4737 },
  },
  
  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // API测试项目
    {
      name: 'api',
      use: {
        baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
      },
      testMatch: /.*\.api\.spec\.ts/,
    },
  ],
  
  // Web服务器配置
  webServer: {
    command: process.env.CI 
      ? 'npm run start' 
      : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  // 输出配置
  outputDir: 'test-results/',
  
  // 全局清理
  fullyParallel: true,
});
