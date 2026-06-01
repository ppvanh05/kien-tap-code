import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class TicketsPage extends BasePage {
  // === 1. ĐẶT VÉ MỚI ===
  readonly routeStartSelect: Locator;
  readonly routeEndSelect: Locator;
  readonly departureDateInput: Locator;
  readonly ticketCountSelect: Locator;
  readonly searchTripBtn: Locator;
  
  // Chi tiết chuyến xe hiển thị
  readonly selectSeatBtn: (seatName: string) => Locator;
  readonly paymentMethodSelect: Locator;
  readonly customerNameInput: Locator;
  readonly customerPhoneInput: Locator;
  readonly customerEmailInput: Locator;
  readonly confirmBookingBtn: Locator;

  // === 2. DANH SÁCH VÉ (TRA CỨU VÉ) ===
  readonly searchKeywordInput: Locator;
  readonly routeFilterSelect: Locator;
  readonly paymentStatusSelect: Locator;
  readonly ticketStatusSelect: Locator;
  readonly searchBtn: Locator;
  readonly refreshBtn: Locator;
  
  // Table results
  readonly tableRows: Locator;
  readonly confirmPaymentBtn: (ticketId: string) => Locator;
  readonly cancelTicketBtn: (ticketId: string) => Locator;
  
  // Hủy vé Modal
  readonly cancelModal: Locator;
  readonly cancelReasonSelect: Locator;
  readonly cancelConfirmBtn: Locator;
  readonly cancelCloseBtn: Locator;

  constructor(page: Page) {
    super(page);

    // Màn hình Đặt vé mới
    this.routeStartSelect = this.page.locator('combobox').first(); // Hoặc theo label/placeholder tương ứng
    this.routeEndSelect = this.page.locator('combobox').nth(1);
    this.departureDateInput = this.page.locator('input[type="text"]').first();
    this.ticketCountSelect = this.page.locator('combobox').nth(2);
    this.searchTripBtn = this.page.getByRole('button', { name: 'TÌM KIẾM' });

    // Đặt ghế & thanh toán tại quầy
    this.selectSeatBtn = (seatName: string) => this.page.locator(`button:has-text("${seatName}")`);
    this.paymentMethodSelect = this.page.locator('select[name="paymentMethod"], app-custom-select:has-text("Phương thức")');
    this.customerNameInput = this.page.locator('input[placeholder*="Họ tên"]');
    this.customerPhoneInput = this.page.locator('input[placeholder*="Số điện thoại"]');
    this.customerEmailInput = this.page.locator('input[placeholder*="Email"]');
    this.confirmBookingBtn = this.page.getByRole('button', { name: 'Xác nhận đặt vé' });

    // Màn hình Danh sách vé
    this.searchKeywordInput = this.page.getByPlaceholder('Mã vé, tên khách hàng, SĐT...');
    this.routeFilterSelect = this.page.locator('combobox').first();
    this.paymentStatusSelect = this.page.locator('combobox').nth(1);
    this.ticketStatusSelect = this.page.locator('combobox').nth(2);
    this.searchBtn = this.page.getByRole('button', { name: 'Tìm kiếm' });
    this.refreshBtn = this.page.getByRole('button', { name: 'Làm mới' });

    // Bảng dữ liệu
    this.tableRows = this.page.locator('table tbody tr');
    this.confirmPaymentBtn = (ticketId: string) => this.page.locator(`tr:has-text("${ticketId}")`).getByRole('button', { name: 'Xác nhận thu tiền' });
    this.cancelTicketBtn = (ticketId: string) => this.page.locator(`tr:has-text("${ticketId}")`).getByRole('button', { name: 'Hủy vé' });

    // Modal hủy vé
    this.cancelModal = this.page.locator('.modal-cancel-ticket, .modal-content:has-text("Hủy vé")');
    this.cancelReasonSelect = this.page.locator('select[name="cancelReason"], select');
    this.cancelConfirmBtn = this.page.getByRole('button', { name: 'Xác nhận hủy' });
    this.cancelCloseBtn = this.page.getByRole('button', { name: 'Đóng' });
  }

  async searchTickets(keyword: string) {
    await this.searchKeywordInput.fill(keyword);
    await this.searchBtn.click();
  }
}
