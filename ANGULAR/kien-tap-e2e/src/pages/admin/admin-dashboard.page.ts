import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object Model đại diện cho Admin Dashboard / Sidebar Layout
 */
export class AdminDashboardPage extends BasePage {
  // Elements trên Sidebar
  readonly sidebarNav: Locator;
  readonly menuItems: Locator;
  readonly submenuItems: Locator;
  
  // Footer Sidebar - Profile & Logout
  readonly sidebarFooter: Locator;
  readonly userInfoAvatar: Locator;
  readonly userNameLabel: Locator;
  readonly userRoleLabel: Locator;
  readonly logoutButton: Locator;

  // Header Elements
  readonly menuToggleButton: Locator;

  constructor(page: Page) {
    super(page);

    this.sidebarNav = this.page.locator('.sidebar-nav');
    this.menuItems = this.page.locator('.sidebar-nav .menu-item');
    this.submenuItems = this.page.locator('.submenu .submenu-item');
    
    this.sidebarFooter = this.page.locator('.sidebar-footer');
    this.userInfoAvatar = this.page.locator('.user-info');
    this.userNameLabel = this.page.locator('.sidebar-footer .details .name');
    this.userRoleLabel = this.page.locator('.sidebar-footer .details .role');
    this.logoutButton = this.page.locator('.avatar-menu .menu-item').filter({ hasText: 'Đăng xuất' });
    
    this.menuToggleButton = this.page.locator('.menu-toggle');
  }

  /**
   * Lấy locator của một Menu cụ thể trên Sidebar theo nhãn hiển thị
   */
  getMenuItem(label: string): Locator {
    return this.menuItems.filter({ hasText: label });
  }

  /**
   * Lấy locator của một Submenu cụ thể
   */
  getSubmenuItem(label: string): Locator {
    return this.submenuItems.filter({ hasText: label });
  }

  /**
   * Mở rộng/Click vào một menu trên sidebar (Ví dụ: Click vào 'Quản lý vé' để mở rộng)
   */
  async expandMenu(label: string): Promise<void> {
    const item = this.getMenuItem(label);
    await this.clickOn(item);
  }

  /**
   * Thực hiện Đăng xuất
   */
  async logout(): Promise<void> {
    await this.clickOn(this.userInfoAvatar);
    await this.clickOn(this.logoutButton);
    await this.page.waitForLoadState('load');
  }

  /**
   * Kiểm tra xem một Menu cụ thể có hiển thị trên Sidebar không
   */
  async isMenuItemVisible(label: string): Promise<boolean> {
    return await this.getMenuItem(label).first().isVisible();
  }
}
