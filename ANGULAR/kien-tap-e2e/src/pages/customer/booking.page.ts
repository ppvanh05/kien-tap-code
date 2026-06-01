import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object Model cho luồng Đặt vé & Thanh toán (Booking & Payment)
 */
export class BookingPage extends BasePage {
  // --- TRANG TÌM KIẾM CHUYẾN XE (/tim-kiem-chuyen) ---
  readonly firstTripCard: Locator;
  readonly firstTripCardHeader: Locator;
  readonly selectSeatTabBtn: Locator;
  readonly seatLayoutContainer: Locator;
  readonly seatButtons: Locator;
  readonly roomGuestSelects: Locator;
  readonly selectedSeatsSummary: Locator;
  readonly totalPriceSummary: Locator;
  readonly confirmSeatBtn: Locator;

  // --- TRANG THÔNG TIN ĐƠN HÀNG (/thong-tin-don-hang) ---
  readonly customerNameInput: Locator;
  readonly customerPhoneInput: Locator;
  readonly customerEmailInput: Locator;
  readonly termsCheckbox: Locator;
  readonly pickupInput: Locator;
  readonly dropoffInput: Locator;
  readonly pickupDropdown: Locator;
  readonly dropoffDropdown: Locator;
  readonly checkoutBtn: Locator;
  readonly cancelBookingBtn: Locator;

  // --- TRANG THANH TOÁN (/thanh-toan) ---
  readonly momoPaymentOption: Locator;
  readonly vnpayPaymentOption: Locator;
  readonly zalopayPaymentOption: Locator;
  readonly vietqrPaymentOption: Locator;
  readonly confirmPaymentBtn: Locator;
  readonly cancelPaymentBtn: Locator;
  readonly timeLeftTimer: Locator;

  // Modals & Popups
  readonly cancelModal: Locator;
  readonly cancelModalConfirmBtn: Locator;
  readonly cancelModalCloseBtn: Locator;

  readonly expirationModal: Locator;
  readonly expirationRedirectBtn: Locator;

  readonly successModal: Locator;
  readonly successModalOrderCode: Locator;
  readonly successModalViewTicketBtn: Locator;
  readonly successModalGoHomeBtn: Locator;

  constructor(page: Page) {
    super(page);

    // --- TRANG TÌM KIẾM CHUYẾN XE ---
    this.firstTripCard = this.page.locator('.lg\\:col-span-8 .bg-surface.rounded-xl').first();
    this.firstTripCardHeader = this.firstTripCard.locator('.p-6.cursor-pointer').first();
    this.selectSeatTabBtn = this.page.getByRole('button', { name: 'Chọn ghế', exact: true }).first();
    this.seatLayoutContainer = this.page.locator('.lg-col-span-8.grid-cols-1');
    this.seatButtons = this.page.locator('button[class*="w-16 h-11"]');
    this.roomGuestSelects = this.page.locator('select.bg-white.border');
    this.selectedSeatsSummary = this.page.locator('.text-primary:has-text("Ghế")');
    this.totalPriceSummary = this.page.locator('p:has-text("Tổng tiền") span.text-secondary').first();
    this.confirmSeatBtn = this.page.locator('button.bg-secondary:has-text("Chọn ghế")');

    // --- TRANG THÔNG TIN ĐƠN HÀNG ---
    this.customerNameInput = this.page.getByPlaceholder('Nhập họ và tên');
    this.customerPhoneInput = this.page.getByPlaceholder('Nhập số điện thoại');
    this.customerEmailInput = this.page.getByPlaceholder('Nhập email');
    this.termsCheckbox = this.page.locator('#terms-chk');
    this.pickupInput = this.page.getByPlaceholder('Nhập tên điểm đón');
    this.dropoffInput = this.page.getByPlaceholder('Nhập tên điểm trả');
    this.pickupDropdown = this.page.locator('.relative:has(input[placeholder="Nhập tên điểm đón"]) .absolute.z-30');
    this.dropoffDropdown = this.page.locator('.relative:has(input[placeholder="Nhập tên điểm trả"]) .absolute.z-30');
    this.checkoutBtn = this.page.locator('button:has-text("Thanh toán")');
    this.cancelBookingBtn = this.page.locator('button:has-text("Hủy")');

    // --- TRANG THANH TOÁN ---
    this.momoPaymentOption = this.page.locator('.flex.items-start:has-text("Ví MoMo")');
    this.vnpayPaymentOption = this.page.locator('.flex.items-start:has-text("Ví VNPay")');
    this.zalopayPaymentOption = this.page.locator('.flex.items-start:has-text("Ví ZaloPay")');
    this.vietqrPaymentOption = this.page.locator('.flex.items-start:has-text("Thanh toán qua VietQR")');
    this.confirmPaymentBtn = this.page.locator('button:has-text("Xác nhận đã chuyển khoản")');
    this.cancelPaymentBtn = this.page.locator('button:has-text("Quay lại")');
    this.timeLeftTimer = this.page.locator('.text-2xl.font-black.text-secondary');

    // Modals
    this.cancelModal = this.page.locator('.fixed.inset-0:has-text("Bạn có chắc chắn muốn hủy vé")');
    this.cancelModalConfirmBtn = this.cancelModal.locator('button:has-text("Xác nhận")');
    this.cancelModalCloseBtn = this.cancelModal.locator('button:has-text("Huỷ")');

    this.expirationModal = this.page.locator('.fixed.inset-0:has-text("Đơn hàng đã hết hạn thanh toán")');
    this.expirationRedirectBtn = this.expirationModal.locator('button:has-text("Chuyển ngay")');

    this.successModal = this.page.locator('.fixed.inset-0:has-text("Thanh toán thành công")');
    this.successModalOrderCode = this.successModal.locator('.text-title-md.font-bold');
    this.successModalViewTicketBtn = this.successModal.locator('button:has-text("Xem chi tiết vé")');
    this.successModalGoHomeBtn = this.successModal.locator('button:has-text("Về trang chủ")');
  }

  /**
   * Mở rộng card chuyến xe đầu tiên và click tab Chọn ghế
   */
  async openSeatSelection(): Promise<void> {
    await this.clickOn(this.firstTripCardHeader);
  }

  /**
   * Chọn ghế theo tên (ví dụ: '1A', '2B')
   */
  async selectSeat(seatName: string): Promise<void> {
    const seatBtn = this.page.locator(`button:has-text("${seatName}")`).first();
    await this.clickOn(seatBtn);
  }

  /**
   * Cấu hình số lượng khách (phòng đơn / phòng đôi) cho một ghế
   */
  async configureSeatGuests(seatName: string, count: 1 | 2): Promise<void> {
    const row = this.page.locator(`.flex.items-center:has-text("Ghế ${seatName}")`);
    const select = row.locator('select');
    await select.selectOption(count.toString());
  }

  /**
   * Xác nhận chọn ghế (chuyển sang trang điền thông tin)
   */
  async confirmSeats(): Promise<void> {
    await this.clickOn(this.confirmSeatBtn);
  }

  /**
   * Nhập thông tin người đi
   */
  async fillCustomerInfo(name: string, phone: string, email: string = ''): Promise<void> {
    await this.typeText(this.customerNameInput, name);
    await this.typeText(this.customerPhoneInput, phone);
    if (email) {
      await this.typeText(this.customerEmailInput, email);
    }
  }

  /**
   * Tick đồng ý điều khoản
   */
  async acceptTerms(): Promise<void> {
    await this.termsCheckbox.check();
  }

  /**
   * Chọn điểm đón từ dropdown
   */
  async selectPickupPoint(name: string): Promise<void> {
    await this.pickupInput.focus();
    await this.pickupInput.fill(name);
    // Chọn option tương ứng từ gợi ý
    const option = this.page.locator('.p-3.hover\\:bg-primary-light').filter({ hasText: name }).first();
    await this.clickOn(option);
  }

  /**
   * Chọn điểm trả từ dropdown
   */
  async selectDropoffPoint(name: string): Promise<void> {
    await this.dropoffInput.focus();
    await this.dropoffInput.fill(name);
    // Chọn option tương ứng từ gợi ý
    const option = this.page.locator('.p-3.hover\\:bg-primary-light').filter({ hasText: name }).first();
    await this.clickOn(option);
  }

  /**
   * Bấm nút Thanh toán để chuyển sang trang cổng thanh toán
   */
  async clickCheckout(): Promise<void> {
    await this.clickOn(this.checkoutBtn);
  }

  /**
   * Chọn phương thức thanh toán
   */
  async selectPaymentMethod(method: 'momo' | 'vnpay' | 'zalopay' | 'vietqr'): Promise<void> {
    switch (method) {
      case 'momo':
        await this.clickOn(this.momoPaymentOption);
        break;
      case 'vnpay':
        await this.clickOn(this.vnpayPaymentOption);
        break;
      case 'zalopay':
        await this.clickOn(this.zalopayPaymentOption);
        break;
      case 'vietqr':
        await this.clickOn(this.vietqrPaymentOption);
        break;
    }
  }

  /**
   * Xác nhận thanh toán thành công (Simulate success)
   */
  async confirmPayment(): Promise<void> {
    await this.clickOn(this.confirmPaymentBtn);
  }

  /**
   * Xác nhận thanh toán và lấy nội dung alert lỗi từ frontend.
   * Trang thanh toán hiện hiển thị lỗi bằng native alert(), không phải modal DOM.
   */
  async confirmPaymentAndCaptureError(): Promise<string> {
    const dialogPromise = this.page.waitForEvent('dialog', { timeout: 10000 });

    await this.confirmPaymentBtn.click({ noWaitAfter: true });

    const dialog = await dialogPromise;
    const message = dialog.message();
    await dialog.accept();

    return message;
  }

  /**
   * Xác nhận thanh toán và verify nội dung lỗi hiển thị.
   */
  async expectPaymentError(expectedMessage: string | RegExp): Promise<string> {
    const message = await this.confirmPaymentAndCaptureError();

    if (typeof expectedMessage === 'string') {
      expect(message).toContain(expectedMessage);
    } else {
      expect(message).toMatch(expectedMessage);
    }

    return message;
  }

  /**
   * Gọi POST API từ browser context để các test backend-only vẫn đi qua POM.
   */
  async postJson<TResponse = any>(path: string, payload: Record<string, unknown>): Promise<{ status: number; body: TResponse }> {
    return await this.page.evaluate(async ({ path, payload }) => {
      const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let body: unknown = text;

      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text;
      }

      return {
        status: response.status,
        body,
      };
    }, { path, payload }) as { status: number; body: TResponse };
  }
}
