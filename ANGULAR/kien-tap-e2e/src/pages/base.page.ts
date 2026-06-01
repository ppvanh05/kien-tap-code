import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page chứa các hàm thao tác chung (Common Actions)
 * Tuân thủ nguyên tắc Smart Waits - Không sử dụng Thread.sleep / hard sleep
 */
export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Điều hướng trình duyệt đến một đường dẫn
   */
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  }

  /**
   * Click thông minh - Đảm bảo element sẵn sàng và visible
   */
  async clickOn(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible({ timeout: 10000 });
    await expect(locator).toBeEnabled({ timeout: 5000 });
    await locator.click();
  }

  async typeText(locator: Locator, text: string): Promise<void> {
    await expect(locator).toBeVisible({ timeout: 5000 });
    const isReadonly = await locator.getAttribute('readonly').catch(() => null);
    if (isReadonly !== null) {
      await locator.evaluate((node: HTMLInputElement, val) => {
        node.value = val;
        node.dispatchEvent(new Event('input', { bubbles: true }));
        node.dispatchEvent(new Event('change', { bubbles: true }));
      }, text);
    } else {
      await locator.fill('');
      await locator.fill(text);
    }
  }

  /**
   * Lấy nội dung text của phần tử
   */
  async getTextOf(locator: Locator): Promise<string> {
    await expect(locator).toBeVisible({ timeout: 5000 });
    return (await locator.innerText()).trim();
  }

  /**
   * Đợi một phần tử hiển thị (Smart wait)
   */
  async waitForVisible(locator: Locator, timeout: number = 10000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Đợi một phần tử biến mất khỏi DOM
   */
  async waitForHidden(locator: Locator, timeout: number = 10000): Promise<void> {
    await expect(locator).toBeHidden({ timeout });
  }

  /**
   * Chụp màn hình báo cáo hoặc lưu minh chứng khi lỗi
   */
  async captureScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({
      path: `screenshots/${name}_${Date.now()}.png`,
      fullPage: true
    });
  }
}
