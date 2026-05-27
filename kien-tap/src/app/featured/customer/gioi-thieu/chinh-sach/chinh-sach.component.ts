import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { FormsModule } from '@angular/forms';

interface PolicySection {
  id: string;
  title: string;
  category: string;
  icon: string;
  content: string[];
}

@Component({
  selector: 'app-chinh-sach',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule],
  templateUrl: './chinh-sach.component.html',
  styleUrl: './chinh-sach.component.css'
})
export class ChinhSachComponent {
  searchText: string = '';
  activeTab: string = 'payment';

  policies: PolicySection[] = [
    {
      id: 'payment',
      title: 'CHÍNH SÁCH THANH TOÁN VÀ ĐẶT GIỮ CHỖ TRỰC TUYẾN',
      category: 'Quy định đặt vé & Thanh toán',
      icon: 'payments',
      content: [
        'Quy trình Đặt giữ chỗ: Khi hành khách thực hiện đặt vé trên hệ thống (hoặc thông qua nhân viên bán vé/tổng đài), ghế lựa chọn sẽ được tạm giữ trạng thái "Đang giữ" trong thời gian tối đa là 15 phút. Đơn hàng lúc này mang trạng thái "Chờ thanh toán".',
        'Xác nhận đặt giữ chỗ: Đơn hàng chỉ được xác nhận thành công và chuyển sang trạng thái "Chờ khởi hành" sau khi hệ thống nhận được thông báo giao dịch thành công từ cổng thanh toán (Mã QR hoặc thẻ nội địa NAPAS). Quá 15 phút quy định, hệ thống tự động hủy đơn và giải phóng ghế về trạng thái "Trống".',
        'Thông tin hành khách: Họ tên và số điện thoại là thông tin bắt buộc, phải cung cấp chính xác để hệ thống phát hành vé điện tử và gửi thông báo xác nhận qua SMS/Zalo. Nhà xe có quyền từ chối phục vụ nếu hành khách cung cấp sai thông tin hoặc không thể liên lạc được.',
        'Nguyên tắc xếp chỗ: Hệ thống hỗ trợ khách hàng chọn vị trí ghế mong muốn theo sơ đồ thời gian thực. Tuy nhiên, nhà xe bảo lưu quyền điều phối, sắp xếp lại vị trí ghế trong các trường hợp bất khả kháng liên quan đến an toàn giao thông, quy định của cơ quan quản lý hoặc sự cố vận hành của phương tiện.'
      ]
    },
    {
      id: 'edit',
      title: 'CHÍNH SÁCH CHỈNH SỬA THÔNG TIN VÉ ĐÃ ĐẶT',
      category: 'Chính sách chỉnh sửa vé',
      icon: 'edit_note',
      content: [
        'Điều kiện áp dụng: Chỉ áp dụng cho các vé điện tử đang ở trạng thái "Chờ khởi hành" và đã thanh toán thành công. Không áp dụng cho vé đã hủy hoặc chuyến đi đã hoàn thành.',
        'Giới hạn thời gian: Hành khách (hoặc nhân viên bán vé thao tác hộ) chỉ được phép chỉnh sửa thông tin vé khi thời gian còn lại đến giờ khởi hành của chuyến xe còn ít nhất 2 tiếng.',
        'Giới hạn số lần: Mỗi cặp vé/đơn hàng chỉ được phép chỉnh sửa thông tin tối đa 02 lần trong suốt vòng đời của vé.',
        'Phạm vi thông tin được sửa: Hành khách được phép thay đổi: Họ tên hành khách, Số điện thoại liên hệ, Ghi chú, và thay đổi Điểm đón/Điểm trả (chọn lại trong danh sách cố định do nhà xe định nghĩa). Mọi thay đổi liên quan đến dịch vụ trung chuyển sẽ được đồng bộ ngay lập tức đến bộ phận điều phối.',
        'Biểu phí chỉnh sửa: Nhà xe không áp dụng phụ phí cho hoạt động chỉnh sửa thông tin vé nếu thỏa mãn đầy đủ các điều kiện nêu trên.'
      ]
    },
    {
      id: 'refund',
      title: 'CHÍNH SÁCH HỦY VÉ VÀ HOÀN TIỀN',
      category: 'Chính sách hủy vé & Hoàn tiền',
      icon: 'account_balance_wallet',
      content: [
        'Điều kiện hủy vé: Vé phải ở trạng thái "Chờ khởi hành" và đã được thanh toán thành công. Thời điểm yêu cầu hủy vé phải nằm trong khoảng thời gian cho phép trước giờ khởi hành theo quy định của từng tuyến đường.',
        'Tính toán số tiền hoàn: Số tiền hoàn lại = Số tiền thực tế khách hàng đã thanh toán – Phí hủy vé (nếu có). Các khoản giảm giá, mã khuyến mãi đã áp dụng cho đơn hàng gốc sẽ không được hoàn lại bằng tiền mặt.',
        'Cơ chế hoàn tiền: Tiền hoàn trả được hệ thống gửi yêu cầu tự động sang cổng thanh toán và chuyển về đúng tài khoản ngân hàng, thẻ NAPAS hoặc ví điện tử mà hành khách đã sử dụng để đặt vé. Trạng thái trên hệ thống sẽ hiển thị "Đang xử lý" và cập nhật "Hoàn tiền thành công" sau khi đối soát xong với ngân hàng.',
        'Trường hợp lỗi giao dịch: Nếu xảy ra lỗi kết nối hoặc cổng thanh toán báo "Hoàn tiền thất bại", hệ thống sẽ chuyển yêu cầu sang trạng thái lỗi để nhân viên hỗ trợ/kế toán xử lý thủ công cho khách hàng.',
        'Trường hợp không hoàn tiền: Nhà xe không hoàn tiền đối với các trường hợp: Hành khách không có mặt tại điểm đón đúng giờ (trễ giờ khởi hành), hành khách đặt nhầm thông tin nhưng quá hạn chỉnh sửa, hoặc hành khách bị từ chối phục vụ do mang theo hành lý quá tải trọng/hàng cấm/vật nuôi mà không thông báo trước.'
      ]
    },
    {
      id: 'commitment',
      title: 'CHÍNH SÁCH CAM KẾT DỊCH VỤ VÀ BỒI THƯỜNG TRƯỜNG HỢP SỰ CỐ',
      category: 'Cam kết dịch vụ & Bồi thường',
      icon: 'verified_user',
      content: [
        'Cam kết giữ chỗ: Nhà xe cam kết cung cấp đúng dịch vụ vận chuyển cho hành khách đã có vé trạng thái "Chờ khởi hành" và có mã đơn hàng hợp lệ trên hệ thống.',
        'Xử lý khi không có chỗ: Trong trường hợp xảy ra sự cố vận hành (hủy chuyến do lỗi kỹ thuật phương tiện, lỗi đồng bộ hệ thống dẫn đến hết chỗ), nhà xe sẽ giải quyết theo các phương án sau:',
        'Điều phối, sắp xếp hành khách sang chuyến xe gần nhất còn chỗ (trong vòng 18 tiếng so với giờ khởi hành cũ) mà không thu thêm bất kỳ chi phí nào.',
        'Nếu không có chuyến xe thay thế phù hợp hoặc nằm ngoài khung 18 tiếng, nhà xe xác nhận "Không cung cấp được dịch vụ". Hệ thống sẽ thực hiện hủy vé, hoàn lại 100% số tiền thực tế khách đã thanh toán, đồng thời tặng kèm 01 voucher giảm giá áp dụng cho lần đặt vé tiếp theo để đền bù bất tiện.',
        'Miễn trừ trách nhiệm: Nhà xe được miễn trừ trách nhiệm bồi thường và hoàn tiền cọc/tiền vé trong các trường hợp chuyến xe bị hủy hoặc chậm trễ do Điều kiện bất khả kháng (thiên tai, dịch bệnh, bão lũ, sạt lở đường, hoặc do mệnh lệnh ngăn cấm từ cơ quan nhà nước có thẩm quyền).'
      ]
    },
    {
      id: 'privacy',
      title: 'CHÍNH SÁCH BẢO MẬT DỮ LIỆU CÁ NHÂN',
      category: 'Chính sách bảo mật dữ liệu',
      icon: 'security',
      content: [
        'Thu thập và Phân loại: Hệ thống thu thập họ tên, số điện thoại, email, lịch sử đặt vé và vị trí địa lý (khi được phép) để phục vụ vận hành và tối ưu trải nghiệm.',
        'Mục đích sử dụng: Vận hành nghiệp vụ đặt vé, hỗ trợ tương tác khách hàng, tối ưu hóa trải nghiệm và thực hiện các hoạt động tiếp thị hợp pháp.',
        'Chia sẻ thông tin: Nhà xe cam kết bảo mật tuyệt đối, chỉ chia sẻ thông tin cần thiết cho tài xế/phụ xe để đón khách hoặc cung cấp cho cơ quan chức năng khi có yêu cầu pháp lý.',
        'Biện pháp an toàn: Dữ liệu được mã hóa và bảo vệ nghiêm ngặt, chỉ nhân viên có thẩm quyền mới được tiếp cận để xử lý nghiệp vụ.',
        'Quyền của khách hàng: Khách hàng có quyền cập nhật, chỉnh sửa hoặc yêu cầu xóa dữ liệu cá nhân thông qua các kênh liên hệ chính thức của nhà xe.'
      ]
    }
  ];

  get filteredPolicies() {
    return this.policies.filter(p => 
      p.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
      p.content.some(c => c.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }

  get activePolicy() {
    return this.policies.find(p => p.id === this.activeTab) || this.policies[0];
  }

  setActiveTab(id: string) {
    this.activeTab = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
