import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object cho trang Đăng nhập quản trị.
 * Locator semantic đã được verify trên DOM thật của /admin-login.
 */
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.usernameInput = this.page.getByRole('textbox', { name: /Tài khoản hoặc Email/ });
    this.passwordInput = this.page.getByRole('textbox', { name: 'Mật khẩu' });
    this.loginButton = this.page.getByRole('button', { name: 'Đăng nhập' });
    this.errorMessage = this.page.locator('.alert.alert-danger');
  }

  async login(username: string, password: string): Promise<void> {
    await this.typeText(this.usernameInput, username);
    await this.typeText(this.passwordInput, password);
    await this.clickOn(this.loginButton);
  }

  async getErrorMessage(): Promise<string> {
    const clientError = this.page.locator('.invalid-feedback');
    const serverError = this.errorMessage;

    await Promise.race([
      clientError.first().waitFor({ state: 'visible', timeout: 35000 }).catch(() => undefined),
      serverError.first().waitFor({ state: 'visible', timeout: 35000 }).catch(() => undefined),
    ]);

    if (await clientError.first().isVisible()) {
      return (await clientError.allInnerTexts()).join(', ').trim();
    }
    if (await serverError.first().isVisible()) {
      return await this.getTextOf(serverError.first());
    }
    return '';
  }
}
