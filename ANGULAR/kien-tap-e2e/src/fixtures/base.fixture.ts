import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/admin/login.page';
import { AccountsPage } from '../pages/admin/accounts.page';
import { AdminDashboardPage } from '../pages/admin/admin-dashboard.page';
import { BlacklistPage } from '../pages/admin/blacklist.page';
import { DispatchPage } from '../pages/admin/dispatch.page';
import { LogsPage } from '../pages/admin/logs.page';
import { LogsAdminPage } from '../pages/admin/logs-admin.page';
import { TicketsPage } from '../pages/admin/tickets.page';
import { NewsAdminPage } from '../pages/admin/news-admin.page';
import { PolicyAdminPage } from '../pages/admin/policy-admin.page';
import { RegisterPage } from '../pages/customer/register.page';
import { ProfilePage } from '../pages/customer/profile.page';
import { ForgotPasswordPage } from '../pages/customer/forgot-password.page';
import { NewsPage } from '../pages/customer/news.page';
import { ReviewPage } from '../pages/customer/review.page';
import { TicketLookupPage } from '../pages/customer/ticket-lookup.page';
import { PolicyPage } from '../pages/customer/policy.page';
import { AboutUsPage } from '../pages/customer/about.page';
import { HomePage } from '../pages/customer/home.page';
import { BookingPage } from '../pages/customer/booking.page';
import { SearchTripPage } from '../pages/customer/search-trip.page';

// Kiểu dữ liệu mở rộng cho fixtures
type MyFixtures = {
  loginPage: LoginPage;
  accountsPage: AccountsPage;
  adminDashboardPage: AdminDashboardPage;
  blacklistPage: BlacklistPage;
  dispatchPage: DispatchPage;
  logsPage: LogsPage;
  logsAdminPage: LogsAdminPage;
  ticketsPage: TicketsPage;
  newsAdminPage: NewsAdminPage;
  policyAdminPage: PolicyAdminPage;
  registerPage: RegisterPage;
  profilePage: ProfilePage;
  forgotPasswordPage: ForgotPasswordPage;
  newsPage: NewsPage;
  reviewPage: ReviewPage;
  ticketLookupPage: TicketLookupPage;
  policyPage: PolicyPage;
  aboutUsPage: AboutUsPage;
  homePage: HomePage;
  bookingPage: BookingPage;
  searchTripPage: SearchTripPage;
};

// Mở rộng bộ chạy test mặc định của Playwright bằng custom Fixture cô lập
export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  accountsPage: async ({ page }, use) => {
    const accountsPage = new AccountsPage(page);
    await use(accountsPage);
  },
  adminDashboardPage: async ({ page }, use) => {
    const adminDashboardPage = new AdminDashboardPage(page);
    await use(adminDashboardPage);
  },
  blacklistPage: async ({ page }, use) => {
    const blacklistPage = new BlacklistPage(page);
    await use(blacklistPage);
  },
  dispatchPage: async ({ page }, use) => {
    const dispatchPage = new DispatchPage(page);
    await use(dispatchPage);
  },
  logsPage: async ({ page }, use) => {
    const logsPage = new LogsPage(page);
    await use(logsPage);
  },
  logsAdminPage: async ({ page }, use) => {
    const logsAdminPage = new LogsAdminPage(page);
    await use(logsAdminPage);
  },
  ticketsPage: async ({ page }, use) => {
    const ticketsPage = new TicketsPage(page);
    await use(ticketsPage);
  },
  newsAdminPage: async ({ page }, use) => {
    const newsAdminPage = new NewsAdminPage(page);
    await use(newsAdminPage);
  },
  policyAdminPage: async ({ page }, use) => {
    const policyAdminPage = new PolicyAdminPage(page);
    await use(policyAdminPage);
  },
  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await use(registerPage);
  },
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);
    await use(profilePage);
  },
  forgotPasswordPage: async ({ page }, use) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await use(forgotPasswordPage);
  },
  newsPage: async ({ page }, use) => {
    const newsPage = new NewsPage(page);
    await use(newsPage);
  },
  reviewPage: async ({ page }, use) => {
    const reviewPage = new ReviewPage(page);
    await use(reviewPage);
  },
  ticketLookupPage: async ({ page }, use) => {
    const ticketLookupPage = new TicketLookupPage(page);
    await use(ticketLookupPage);
  },
  policyPage: async ({ page }, use) => {
    const policyPage = new PolicyPage(page);
    await use(policyPage);
  },
  aboutUsPage: async ({ page }, use) => {
    const aboutUsPage = new AboutUsPage(page);
    await use(aboutUsPage);
  },
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
  bookingPage: async ({ page }, use) => {
    const bookingPage = new BookingPage(page);
    await use(bookingPage);
  },
  searchTripPage: async ({ page }, use) => {
    const searchTripPage = new SearchTripPage(page);
    await use(searchTripPage);
  },
});

export { expect } from '@playwright/test';
export { Page } from '@playwright/test';
export { Locator } from '@playwright/test';
export { BasePage } from '../pages/base.page';
export { TestDataGenerator } from '../utils/test-data';
export { ENV } from '../utils/env.config';

