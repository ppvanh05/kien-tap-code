import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  printTicket(data: {
    maDonHang: string;
    maVe: string;
    maQRVe: string;
    qrUrl: string;
    tenTuyen: string;
    thoiGianKhoiHanh: string;
    soGhe: string;
    diemDon: string;
    thoiGianToiDiemLenXe: string;
    diemTra: string;
    bienSoXe: string;
    giaVe: number;
  }): void {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>In vé</title>
          <style>
            @page { margin: 10mm; }
            body { font-family: Arial, sans-serif; margin: 0; color: #111827; background: #fff; }
            .ticket-container { max-width: 480px; margin: 0 auto; border: 1px solid #222; border-radius: 10px; padding: 18px 24px 18px 24px; background: #fff; }
            .company { text-align: center; font-weight: bold; font-size: 18px; margin-bottom: 2px; }
            .company-sub { text-align: center; font-size: 13px; margin-bottom: 2px; }
            .company-mst { text-align: center; font-size: 13px; margin-bottom: 8px; }
            .ticket-title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 2px; }
            .ticket-number { text-align: center; font-size: 13px; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 16px; }
            .qr { width: 110px; height: 110px; border: 1px solid #222; border-radius: 8px; padding: 4px; background: #fff; }
            .info { flex: 1; }
            .label { font-size: 13px; color: #444; margin-bottom: 1px; }
            .value { font-size: 16px; font-weight: bold; margin-bottom: 6px; }
            .field { margin-bottom: 7px; }
            .note { font-size: 12px; color: #222; margin-top: 10px; margin-bottom: 2px; }
            .hotline { font-size: 13px; color: #222; margin-top: 2px; }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="company">CÔNG TY TNHH VẬN TẢI TÂN XUÂN PHÚC</div>
            <div class="company-sub">Tiên Hội - Phường An Nhơn Bắc - Tỉnh Gia Lai</div>
            <div class="company-mst">MST: 4101453652</div>
            <div class="ticket-title">VÉ XE KHÁCH</div>
            <div class="ticket-number">Liên: Giao cho hành khách</div>
            <div class="row">
              <div class="info">
                <div class="field"><span class="label">Mã đơn hàng:</span> <span class="value">${data.maDonHang}</span></div>
                <div class="field"><span class="label">Mã vé:</span> <span class="value">${data.maVe}</span></div>
                <div class="field"><span class="label">Tuyến xe:</span> <span class="value">${data.tenTuyen}</span></div>
                <div class="field"><span class="label">Thời gian khởi hành:</span> <span class="value">${data.thoiGianKhoiHanh}</span></div>
                <div class="field"><span class="label">Số ghế:</span> <span class="value">${data.soGhe}</span></div>
                <div class="field"><span class="label">Điểm đón:</span> <span class="value">${data.diemDon}</span></div>
                <div class="field"><span class="label">Thời gian tới điểm lên xe:</span> <span class="value">${data.thoiGianToiDiemLenXe}</span></div>
                <div class="field"><span class="label">Điểm trả:</span> <span class="value">${data.diemTra}</span></div>
                <div class="field"><span class="label">Biển số xe:</span> <span class="value">${data.bienSoXe}</span></div>
                <div class="field"><span class="label">Giá vé:</span> <span class="value">${data.giaVe.toLocaleString('vi-VN')}đ</span></div>
              </div>
              <div>
                <img src="${data.qrUrl}" alt="QR Code" class="qr" />
              </div>
            </div>
            <div class="note">(Đã bao gồm thuế GTGT và BH hành khách)</div>
            <div class="hotline">Tổng đài bán vé: 1900989867</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}
