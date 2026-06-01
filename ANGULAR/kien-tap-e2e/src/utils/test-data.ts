/**
 * Bộ phát sinh Test Data tự động
 * Đảm bảo các thuộc tính duy nhất (Email, Số điện thoại, Mã vé)
 * tuân thủ quy tắc 7. Test Data của GEMINI.md:
 * format: [Tên test] + [Timestamp] + [Prefix]
 */
export class TestDataGenerator {
  
  /**
   * Tạo số điện thoại ngẫu nhiên hợp lệ (10 chữ số)
   */
  static generatePhoneNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    return `09${timestamp}`;
  }

  /**
   * Tạo email độc nhất dạng traceable
   */
  static generateEmail(prefix: string = 'test'): string {
    const timestamp = Math.floor(Date.now() / 1000);
    return `${prefix}_${timestamp}@auto.test`;
  }

  /**
   * Tạo email traceable theo format auto_[testName]_[timestamp]@test.com
   */
  static generateTraceableEmail(testName: string): string {
    const safeName = testName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return `auto_${safeName}_${Date.now()}@test.com`;
  }

  /**
   * Tạo chuỗi văn bản ngẫu nhiên có prefix
   */
  static generateText(prefix: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    return `${prefix}_${timestamp}`;
  }

  /**
   * Tạo họ tên khách hàng ngẫu nhiên hợp lệ
   */
  static generateFullName(): string {
    const ho = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi'];
    const dem = ['Văn', 'Thị', 'Minh', 'Hoài', 'Gia', 'Anh', 'Khánh', 'Ngọc', 'Tuấn'];
    const ten = ['An', 'Bình', 'Chi', 'Dũng', 'Em', 'Phương', 'Linh', 'Nam', 'Khoa', 'Tú'];
    
    const randomHo = ho[Math.floor(Math.random() * ho.length)];
    const randomDem = dem[Math.floor(Math.random() * dem.length)];
    const randomTen = ten[Math.floor(Math.random() * ten.length)];
    
    return `${randomHo} ${randomDem} ${randomTen}`;
  }

  /**
   * Sinh mã code E2E traceable
   */
  static generateE2ECode(testName: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    return `TC_${testName.toUpperCase()}_${timestamp}`;
  }
}
