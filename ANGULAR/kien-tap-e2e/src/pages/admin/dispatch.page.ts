import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class DispatchPage extends BasePage {
  
  // Custom Alert Popup
  readonly alertOverlay: Locator;
  readonly alertMessage: Locator;
  readonly alertOkButton: Locator;

  // Tabs lọc trạng thái chung
  readonly tabAll: Locator;
  readonly tabActive: Locator;
  readonly tabLocked: Locator;

  // === 1. QUẢN LÝ TUYẾN XE ===
  readonly addRouteButton: Locator;
  readonly routeStartPointInput: Locator;
  readonly routeStartProvinceSelect: Locator;
  readonly routeEndPointInput: Locator;
  readonly routeEndProvinceSelect: Locator;
  readonly routeDistanceInput: Locator;
  readonly routeHoursInput: Locator;
  readonly routeMinutesInput: Locator;
  readonly routeSaveButton: Locator;
  readonly routeTableRows: Locator;
  
  // === 2. QUẢN LÝ PHƯƠNG TIỆN ===
  readonly addVehicleButton: Locator;
  readonly vehicleNameInput: Locator;
  readonly vehiclePlateInput: Locator;
  readonly vehicleRegExpiryInput: Locator;
  readonly vehicleInsExpiryInput: Locator;
  readonly vehicleTypeSelect: Locator;
  readonly vehicleSaveButton: Locator;
  readonly vehicleTableRows: Locator;

  // === 3. QUẢN LÝ TÀI XẾ & PHỤ XE ===
  readonly addDriverButton: Locator;
  readonly driverRoleSelect: Locator;
  readonly driverNameInput: Locator;
  readonly driverDobInput: Locator;
  readonly driverPhoneInput: Locator;
  readonly driverCccdInput: Locator;
  readonly driverLicenseClassInput: Locator;
  readonly driverLicenseExpiryInput: Locator;
  readonly driverSaveButton: Locator;
  readonly driverTableRows: Locator;

  // === 4. QUẢN LÝ LỊCH TRÌNH ===
  readonly addScheduleButton: Locator;
  readonly scheduleRouteSelect: Locator;
  readonly scheduleDriverSelect: Locator;
  readonly scheduleAssistantSelect: Locator;
  readonly scheduleVehicleNameSelect: Locator;
  readonly scheduleVehiclePlateSelect: Locator;
  readonly scheduleStatusSelect: Locator;
  readonly scheduleBasePriceInput: Locator;
  readonly scheduleDepartureDateInput: Locator;
  readonly scheduleDepartureHourInput: Locator;
  readonly scheduleDepartureMinuteInput: Locator;
  readonly scheduleContinueButton: Locator;
  readonly scheduleSaveButton: Locator;
  readonly scheduleTableRows: Locator;

  constructor(page: Page) {
    super(page);

    // Custom Alert
    this.alertOverlay = this.page.locator('.custom-alert-overlay, .alert-dialog-card, .modal-overlay:has(.btn-save:has-text("Đã hiểu"))');
    this.alertMessage = this.page.locator('.custom-alert-message, .alert-dialog-body p, .modal-content p');
    this.alertOkButton = this.page.locator('.btn-alert-ok, .alert-confirm-btn, .modal-content button.btn-save:has-text("Đã hiểu")');

    // Tabs
    this.tabAll = this.page.locator('.tabs button').filter({ hasText: 'Tất cả' });
    this.tabActive = this.page.locator('.tabs button').filter({ hasText: 'Đang hoạt động' });
    this.tabLocked = this.page.locator('.tabs button').filter({ hasText: 'Đã khóa' });

    // Tuyến xe
    this.addRouteButton = this.page.locator('.btn-add');
    this.routeStartPointInput = this.page.locator('.form-group:has-text("Điểm đầu") input');
    this.routeStartProvinceSelect = this.page.locator('.form-group:has-text("Thuộc tỉnh / thành phố")').first().locator('app-custom-select');
    this.routeEndPointInput = this.page.locator('.form-group:has-text("Điểm cuối") input');
    this.routeEndProvinceSelect = this.page.locator('.form-group:has-text("Thuộc tỉnh / thành phố")').nth(1).locator('app-custom-select');
    this.routeDistanceInput = this.page.locator('.form-group:has-text("Khoảng cách") input');
    this.routeHoursInput = this.page.locator('.time-field:has-text("giờ") input');
    this.routeMinutesInput = this.page.locator('.time-field:has-text("phút") input');
    this.routeSaveButton = this.page.locator('.footer-right .btn-save');
    this.routeTableRows = this.page.locator('table tbody tr');

    // Phương tiện
    this.addVehicleButton = this.page.locator('.btn-add-vehicle-admin');
    this.vehicleNameInput = this.page.locator('.form-group:has-text("Tên xe") input');
    this.vehiclePlateInput = this.page.locator('.form-group:has-text("Biển số xe") input');
    this.vehicleRegExpiryInput = this.page.locator('.form-group:has-text("Hạn đăng kiểm") input');
    this.vehicleInsExpiryInput = this.page.locator('.form-group:has-text("Hạn bảo hiểm") input');
    this.vehicleTypeSelect = this.page.locator('.form-group:has-text("Loại xe") app-custom-select');
    this.vehicleSaveButton = this.page.locator('.footer-right .btn-save');
    this.vehicleTableRows = this.page.locator('table tbody tr');

    // Tài xế
    this.addDriverButton = this.page.locator('.btn-add-vehicle-admin');
    this.driverRoleSelect = this.page.locator('.form-group:has-text("Vai trò") app-custom-select');
    this.driverNameInput = this.page.locator('.form-group:has-text("Họ và tên") input');
    this.driverDobInput = this.page.locator('.form-group:has-text("Ngày sinh") input');
    this.driverPhoneInput = this.page.locator('.form-group:has-text("Số điện thoại") input');
    this.driverCccdInput = this.page.locator('.form-group:has-text("Số CCCD") input');
    this.driverLicenseClassInput = this.page.locator('.form-group:has-text("Hạng bằng lái") input');
    this.driverLicenseExpiryInput = this.page.locator('.form-group:has-text("Hạn bằng lái") input');
    this.driverSaveButton = this.page.locator('.footer-right .btn-save');
    this.driverTableRows = this.page.locator('table tbody tr');

    // Lịch trình
    this.addScheduleButton = this.page.locator('.btn-add-schedule-admin');
    this.scheduleRouteSelect = this.page.locator('.form-group:has-text("Tuyến") app-custom-select');
    this.scheduleDriverSelect = this.page.locator('.form-group:has-text("Tài xế") app-custom-select');
    this.scheduleAssistantSelect = this.page.locator('.form-group:has-text("Phụ xe") app-custom-select');
    this.scheduleVehicleNameSelect = this.page.locator('.form-group:has-text("Tên xe") app-custom-select');
    this.scheduleVehiclePlateSelect = this.page.locator('.form-group:has-text("Biển số xe") app-custom-select');
    this.scheduleStatusSelect = this.page.locator('.form-group:has-text("Trạng thái lịch trình") app-custom-select');
    this.scheduleBasePriceInput = this.page.locator('.base-price-header-row input');
    this.scheduleDepartureDateInput = this.page.locator('.form-group:has-text("Ngày khởi hành") input');
    this.scheduleDepartureHourInput = this.page.locator('.time-input-wrapper:has-text("giờ") input').first();
    this.scheduleDepartureMinuteInput = this.page.locator('.time-input-wrapper:has-text("phút") input').first();
    this.scheduleContinueButton = this.page.locator('.footer-right button:has-text("Tiếp tục")');
    this.scheduleSaveButton = this.page.locator('.footer-right button:has-text("Lưu thông tin")');
    this.scheduleTableRows = this.page.locator('table tbody tr');
  }

  /**
   * Đóng Custom Alert Popup
   */
  async dismissAlertIfVisible(): Promise<void> {
    try {
      if (await this.alertOkButton.isVisible({ timeout: 2000 })) {
        await this.alertOkButton.click({ force: true });
        await this.waitForHidden(this.alertOverlay);
      }
    } catch (e) {
      // Ignored
    }
  }
  /**
   * Chọn Option trong app-custom-select
   */
  async selectCustomOption(selectLocator: Locator, optionText: string): Promise<void> {
    const trigger = selectLocator.locator('.select-trigger');
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click({ force: true });
    
    // Tìm option item có nội dung khớp chính xác
    let option = selectLocator.locator('.select-option-item').filter({ hasText: optionText }).first();
    
    try {
      await expect(option).toBeVisible({ timeout: 4000 });
    } catch (e) {
      console.warn(`[WARN] Option "${optionText}" not found. Falling back to the first available option.`);
      option = selectLocator.locator('.select-option-item').first();
      await expect(option).toBeVisible({ timeout: 4000 });
    }
    
    // Dispatch mousedown để tránh event bubbling của click làm mở lại dropdown
    await option.dispatchEvent('mousedown');
    
    // Đợi class 'open' biến mất khỏi trigger
    await expect(trigger).not.toHaveClass(/open/, { timeout: 3000 });
  }  /**
   * Thêm mới Tuyến xe
   */
  async addRoute(data: {
    startPoint: string;
    startProvince: string;
    endPoint: string;
    endProvince: string;
    distance: number;
    hours: number;
    minutes: number;
  }): Promise<void> {
    await this.clickOn(this.addRouteButton);
    await this.typeText(this.routeStartPointInput, data.startPoint);
    await this.selectCustomOption(this.routeStartProvinceSelect, data.startProvince);
    await this.typeText(this.routeEndPointInput, data.endPoint);
    await this.selectCustomOption(this.routeEndProvinceSelect, data.endProvince);
    await this.typeText(this.routeDistanceInput, data.distance.toString());
    await this.typeText(this.routeHoursInput, data.hours.toString());
    await this.typeText(this.routeMinutesInput, data.minutes.toString());
    await this.clickOn(this.routeSaveButton);
  }
}
