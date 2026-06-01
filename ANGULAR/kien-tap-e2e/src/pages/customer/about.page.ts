import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object Model đại diện cho trang Giới Thiệu (Customer About Us Page)
 */
export class AboutUsPage extends BasePage {
  // Hero Section
  readonly heroTitle: Locator;
  readonly bookTicketBtn: Locator;
  readonly learnMoreBtn: Locator;

  // Các sections chính
  readonly introSection: Locator;
  readonly coreValuesSection: Locator;
  readonly visionSection: Locator;

  // Tiêu đề các sections để verify
  readonly introSectionTitle: Locator;
  readonly coreValuesTitle: Locator;
  readonly visionTitle: Locator;

  constructor(page: Page) {
    super(page);

    // Hero Section
    this.heroTitle = this.page.locator('main h1');
    this.bookTicketBtn = this.page.getByRole('button', { name: 'Đặt vé ngay' });
    this.learnMoreBtn = this.page.getByRole('button', { name: 'Tìm hiểu thêm' });

    // Các sections chính
    // Sử dụng nth để đảm bảo tìm đúng các khối phân tách trên trang
    this.introSection = this.page.locator('main > div').nth(1);
    this.coreValuesSection = this.page.locator('main > div').nth(2);
    this.visionSection = this.page.locator('main > div').nth(3);

    // Tiêu đề các sections
    this.introSectionTitle = this.page.getByRole('heading', { name: 'Khởi nguồn từ tâm, vươn tầm bằng sự tử tế' });
    this.coreValuesTitle = this.page.getByRole('heading', { name: 'Giá Trị Cốt Lõi' });
    this.visionTitle = this.page.getByRole('heading', { name: 'Trở thành biểu tượng của sự tin cậy trên mọi hành trình' });
  }
}
