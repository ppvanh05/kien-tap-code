import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Đọc cấu hình từ file .env nếu có
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: 2,
  workers: process.env['CI'] ? 1 : undefined,
  
  // Reporter cấu hình đa dạng (Allure + HTML mặc định)
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['allure-playwright', { detail: true, outputFolder: 'allure-results' }],
    ['list']
  ],

  use: {
    // URL môi trường gốc
    baseURL: process.env['CUSTOMER_URL'] || 'http://localhost:4200',
    
    // Chỉ lưu screenshot khi test case thất bại (tắt trace và video)
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',

    // Viewport mặc định 1920x1080 chuẩn Debug UI theo quy tắc Browser Rules
    viewport: { width: 1920, height: 1080 },
    
    // Thời gian chờ mặc định cho mỗi action
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Tổng thời gian tối đa cho 1 test case (30 giây)
  timeout: 30000,

  expect: {
    timeout: 5000,
  },

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
    }
  ],
});
