import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TinTuc {
  maTinTuc: string;
  tieuDe: string;
  anhBia: string;
  moTaNgan: string;
  noiDungChiTiet: string;
  ngayDang: string;
  trangThai: 'BanNhap' | 'DaDang' | 'NgungHienThi' | 'HenGio';
  nguoiDang: string;
  ngayTao: string;
  ngayCapNhat: string;
  henGioDang?: boolean;
  ngayGioHenGio?: string;
}

export interface NhatKyTinTuc {
  maNhatKy: string;
  loaiThaoTac: string;
  thoiGian: string;
  nguoiThaoTac: string;
  diaChiIP: string;
  noiDungChiTiet: string;
}

@Component({
  selector: 'app-quan-ly-tin-tuc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quan-ly-tin-tuc.component.html',
  styleUrls: ['./quan-ly-tin-tuc.component.css']
})
export class QuanLyTinTucComponent implements OnInit {
  @ViewChild('editor') editorElement!: ElementRef;
  @ViewChild('imageInput') imageInputElement!: ElementRef;

  // Expose Math for HTML templates
  protected readonly Math = Math;

  // Tabs: 'all' | 'published' | 'draft' | 'hidden' | 'scheduled'
  activeTab: 'all' | 'published' | 'draft' | 'hidden' | 'scheduled' = 'all';

  // Search & advanced filter query
  searchQuery: string = '';
  sortOrder: 'newest' | 'oldest' | 'alphabetical' = 'newest';

  // Core Arrays
  newsList: TinTuc[] = [];
  filteredNews: TinTuc[] = [];
  displayNews: TinTuc[] = [];
  activityLogs: NhatKyTinTuc[] = [];

  // Modal control & form data
  showModal: boolean = false;
  isEditing: boolean = false;
  selectedNews: TinTuc | null = null;
  formModel: any = {
    maTinTuc: '',
    tieuDe: '',
    anhBia: '',
    moTaNgan: '',
    noiDungChiTiet: '',
    trangThai: 'BanNhap',
    henGioDang: false,
    ngayHenGio: '',
    gioHenGio: ''
  };

  // Preset images for cover photo suggestions
  presetImages = [
    { url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800', label: 'Xe khách hiện đại' },
    { url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800', label: 'Hành trình xe buýt' },
    { url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800', label: 'Vô lăng & Buồng lái' },
    { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', label: 'Thắng cảnh thiên nhiên' },
    { url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800', label: 'Hoàng hôn rực rỡ' },
    { url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800', label: 'Voucher & Khuyến mại' }
  ];

  // Selected news preview modal instead of sliding drawer
  previewNews: TinTuc | null = null;
  showPreviewModal: boolean = false;
  previewTabActive: 'preview' | 'logs' = 'preview';

  // Status confirm overlay controls (Removed Delete from confirmations)
  showConfirmModal: boolean = false;
  showLivePreview: boolean = true; // Toggle live Web preview column (2-columns vs 1-column)
  confirmType: 'hide' | 'publish' | 'clear' = 'hide';
  targetNews: TinTuc | null = null;

  // Pagination fields
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  // Cover image local upload mockup state
  isUploadingCover: boolean = false;
  uploadCoverProgress: number = 0;
  uploadedCoverFile: string = '';

  // Inline editor image upload dialog
  showInsertImageModal: boolean = false;
  isUploadingInline: boolean = false;
  uploadInlineProgress: number = 0;
  inlineImageUrl: string = '';
  uploadedInlineFile: string = '';

  // Dropdown options
  selectedFont: string = 'Inter';
  selectedFontSize: string = '3'; // standard browser command font size (1-7)
  selectedParagraph: string = 'Normal';

  fonts: string[] = ['Inter', 'Roboto', 'Arial', 'Times New Roman', 'Georgia', 'Courier New', 'Tahoma', 'Verdana'];
  fontSizes = [
    { label: 'Rất nhỏ', value: '1' },
    { label: 'Nhỏ', value: '2' },
    { label: 'Bình thường', value: '3' },
    { label: 'Lớn', value: '4' },
    { label: 'Rất lớn', value: '5' },
    { label: 'Cực đại', value: '6' }
  ];

  // Link Sub-Modal States
  showLinkModal: boolean = false;
  linkForm = { text: '', url: '' };
  savedSelectionRange: Range | null = null;

  // Selected Image States for Word-like alignments and resizing
  selectedImage: HTMLImageElement | null = null;
  resizeBox = { top: 0, left: 0, width: 0, height: 0 };
  resizingData = {
    handle: '',
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    aspectRatio: 1
  };

  // Custom premium notifications
  notification = {
    show: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'warning' | 'error'
  };

  // Form field-specific validation errors
  formErrors: { [key: string]: string } = {};

  ngOnInit() {
    this.loadMockNews();
    this.loadMockLogs();
    this.filterNews();
  }

  loadMockNews() {
    this.newsList = [
      {
        maTinTuc: 'TT001',
        tieuDe: 'Nhà xe Tân Xuân Phúc mở thêm tuyến mới Hà Nội - SaPa giảm giá 20%',
        anhBia: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
        moTaNgan: 'TXP BUS chính thức khai trương chặng đường mới Hà Nội - SaPa với đội ngũ xe Limousine giường nằm VIP thế hệ mới nhất, phục vụ đầy đủ nước uống, wifi tốc độ cao miễn phí và chăn ấm.',
        noiDungChiTiet: '<p>TXP BUS hân hạnh thông báo đến quý hành khách về việc chính thức khai trương và đưa vào vận hành <strong>tuyến xe chất lượng cao Hà Nội - SaPa</strong> từ ngày 01/06/2026.</p><p>Nhân dịp khai trương chặng mới, nhà xe triển khai chương trình tri ân đặc biệt cực sốc: <strong>Giảm ngay 20% giá vé khứ hồi</strong> cho toàn bộ hành khách đặt trực tuyến thông qua ứng dụng hoặc website chính thức của nhà xe từ nay cho đến hết ngày 15/06/2026.</p><p>Đội ngũ xe vận hành trên tuyến là xe giường nằm cao cấp 34 phòng VIP riêng tư, trang bị đầy đủ cổng sạc USB tiện lợi, màn hình giải trí cá nhân chất lượng cao và wifi băng thông lớn hoạt động liên tục.</p>',
        ngayDang: '2026-05-15',
        trangThai: 'DaDang',
        nguoiDang: 'Nguyễn Hoài Nam (Admin)',
        ngayTao: '2026-05-12',
        ngayCapNhat: '2026-05-15'
      },
      {
        maTinTuc: 'TT002',
        tieuDe: 'Thông báo lịch vận hành và tăng cường chuyến phục vụ Tết Đoan Ngọ 2026',
        anhBia: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800',
        moTaNgan: 'Nhằm đáp ứng tối đa nhu cầu đi lại thăm quê, du lịch của quý khách hàng trong kỳ nghỉ lễ Tết Đoan Ngọ (Mùng 5 tháng 5 âm lịch), TXP BUS xin gửi tới quý khách hàng lịch vận hành chi tiết.',
        noiDungChiTiet: '<p>Để đảm bảo hành trình của quý khách diễn ra suôn sẻ, an toàn và đúng kế hoạch, Ban điều phối nhà xe Tân Xuân Phúc xin trân trọng thông báo:</p><ol><li><strong>Tăng tần suất chuyến:</strong> Các chặng Hải Phòng - Hà Nội và Hà Nội - Quảng Ninh tăng thêm 15 chuyến/ngày.</li><li><strong>Giờ xuất phát:</strong> Chuyến xe sớm nhất khởi hành lúc 04h30 sáng, chuyến muộn nhất lúc 22h30 đêm tại các bến trung chuyển chính.</li><li><strong>Cam kết giá vé:</strong> Cam kết duy trì bình ổn giá vé niêm yết theo quy định của sở giao thông vận tải, tuyệt đối không tự ý tăng giá vé, không phụ thu bất hợp pháp ngày lễ.</li></ol>',
        ngayDang: '2026-05-17',
        trangThai: 'DaDang',
        nguoiDang: 'Nguyễn Hoài Nam (Admin)',
        ngayTao: '2026-05-16',
        ngayCapNhat: '2026-05-17'
      },
      {
        maTinTuc: 'TT003',
        tieuDe: 'Hướng dẫn cài đặt ứng dụng TXP BUS và nhận mã ưu đãi đón hè rực rỡ',
        anhBia: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
        moTaNgan: 'Chỉ với 3 bước cài đặt app đơn giản trên App Store hoặc Google Play, khách hàng sẽ nhận ngay voucher trị giá 50.000đ trừ trực tiếp vào lượt đặt vé đầu tiên trên toàn hệ thống.',
        noiDungChiTiet: '<p>TXP BUS chính thức giới thiệu ứng dụng đặt vé xe khách tiện lợi thông minh trên hai hệ điều hành phổ biến nhất hiện nay.</p><p><strong>Hướng dẫn các bước tải app nhận thưởng:</strong></p><ul><li>Bước 1: Tìm kiếm từ khóa "TXP BUS" trên cửa hàng ứng dụng và tải app về điện thoại.</li><li>Bước 2: Đăng ký tài khoản khách hàng mới bằng số điện thoại chính chủ và xác thực mã OTP.</li><li>Bước 3: Nhập mã khuyến mãi <strong>"HELLOHE"</strong> tại bước thanh toán để được giảm trừ trực tiếp 50.000đ vào tổng giá trị đơn hàng.</li></ul>',
        ngayDang: '',
        trangThai: 'BanNhap',
        nguoiDang: 'Lê Minh Anh (Content Editor)',
        ngayTao: '2026-05-14',
        ngayCapNhat: '2026-05-14'
      },
      {
        maTinTuc: 'TT004',
        tieuDe: 'Khuyến cáo hành khách về việc mang theo hành lý quá khổ và vật nuôi trên xe',
        anhBia: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
        moTaNgan: 'Để đảm bảo an toàn phòng chống cháy nổ và tạo không gian di chuyển thoải mái, thơm tho sạch sẽ cho toàn bộ hành khách, TXP ban hành quy định hành lý kèm theo.',
        noiDungChiTiet: '<p>Ban quản lý chất lượng dịch vụ vận tải Tân Xuân Phúc trân trọng nhắc nhở quý khách hàng một số quy định quan trọng về hành lý ký gửi và xách tay mang theo chuyến đi:</p><ul><li><strong>Vật nuôi, thú cưng:</strong> Chỉ cho phép vận chuyển nếu vật nuôi được nhốt trong lồng vận chuyển chuyên dụng chắc chắn và để dưới hầm hàng của xe khách. Tuyệt đối không mang thú cưng lên khoang hành khách chung.</li><li><strong>Chất cấm:</strong> Nghiêm cấm vận chuyển hàng quốc cấm, vũ khí, chất dễ cháy nổ (như bình gas mini, xăng dầu, pháo hoa) hoặc các loại thực phẩm có mùi nặng như sầu riêng, hải sản tươi sống mà không được đóng thùng xốp dán kín.</li></ul>',
        ngayDang: '2026-04-20',
        trangThai: 'NgungHienThi',
        nguoiDang: 'Nguyễn Hoài Nam (Admin)',
        ngayTao: '2026-04-18',
        ngayCapNhat: '2026-04-30'
      },
      {
        maTinTuc: 'TT005',
        tieuDe: 'Nhà xe bàn giao tài sản thất lạc trị giá hơn 30 triệu đồng cho hành khách',
        anhBia: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
        moTaNgan: 'Sự việc diễn ra trên chuyến xe Hải Phòng đi Hà Nội mang biển số 15B-098.22, tài xế Nguyễn Hữu Thành đã nhặt được ví chứa tiền mặt và trang sức của khách hàng để quên.',
        noiDungChiTiet: '<p>Tân Xuân Phúc luôn đặt sự uy tín, trung thực và tận tâm phục vụ khách hàng lên vị trí hàng đầu của hoạt động kinh doanh.</p><p>Ngày 10/05/2026 vừa qua, sau khi trả khách tại bến xe Gia Lâm, tài xế Nguyễn Hữu Thành cùng phụ xe trong quá trình dọn dẹp vệ sinh khoang hành khách giường nằm đã phát hiện một chiếc ví cầm tay màu đen để quên tại vị trí giường số A12.</p><p>Ngay sau đó, tổ lái đã báo cáo nhanh về phòng điều hành tổng đài. Bằng các biện pháp nghiệp vụ rà soát vé xe, nhà xe đã nhanh chóng liên hệ với vị khách may mắn là chị Trần Thị Hoa và tiến hành thủ tục xác minh, trao trả nguyên vẹn toàn bộ tài sản tại văn phòng số 25 Nguyễn Văn Linh.</p>',
        ngayDang: '2026-05-11',
        trangThai: 'DaDang',
        nguoiDang: 'Nguyễn Hoài Nam (Admin)',
        ngayTao: '2026-05-10',
        ngayCapNhat: '2026-05-11'
      },
      {
        maTinTuc: 'TT006',
        tieuDe: 'Chương trình tuyển dụng tài xế lái xe giường nằm cabin chất lượng cao hè 2026',
        anhBia: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
        moTaNgan: 'TXP BUS thông báo tuyển dụng 15 tài xế lái xe cabin hạng E VIP, làm việc tại khu vực miền Bắc, lương cứng 18 triệu kèm trợ cấp ăn uống nghỉ đêm đầy đủ.',
        noiDungChiTiet: '<p>Để mở rộng quy mô phục vụ khách du lịch đón hè 2026, TXP BUS thông báo tuyển dụng rộng rãi:</p><ul><li><strong>Số lượng:</strong> 15 tài xế chính thức.</li><li><strong>Yêu cầu bằng cấp:</strong> Giấy phép lái xe hạng E, tối thiểu 3 năm kinh nghiệm lái xe giường nằm trên 30 chỗ hoặc xe cabin VIP.</li><li><strong>Quyền lợi:</strong> Đóng bảo hiểm đầy đủ, thưởng an toàn theo tháng, cấp phát đồng phục cao cấp miễn phí.</li></ul>',
        ngayDang: '',
        trangThai: 'HenGio',
        nguoiDang: 'Nguyễn Hoài Nam (Admin)',
        ngayTao: '2026-05-17',
        ngayCapNhat: '2026-05-17',
        henGioDang: true,
        ngayGioHenGio: '2026-05-25 09:00'
      }
    ];
  }

  loadMockLogs() {
    this.activityLogs = [
      { maNhatKy: 'NK01', loaiThaoTac: 'Đăng tin tức', thoiGian: '2026-05-17 10:15:22', nguoiThaoTac: 'Nguyễn Hoài Nam (Admin)', diaChiIP: '192.168.1.12', noiDungChiTiet: 'Phát hành chính thức bài viết: "Thông báo lịch vận hành và tăng cường chuyến phục vụ Tết Đoan Ngọ 2026" (TT002)' },
      { maNhatKy: 'NK02', loaiThaoTac: 'Cập nhật trạng thái', thoiGian: '2026-04-30 15:45:00', nguoiThaoTac: 'Nguyễn Hoài Nam (Admin)', diaChiIP: '192.168.1.12', noiDungChiTiet: 'Thay đổi trạng thái bài viết TT004 từ "Đang hiển thị" thành "Ngừng hiển thị" theo yêu cầu của phòng nghiệp vụ.' },
      { maNhatKy: 'NK03', loaiThaoTac: 'Tạo bản nháp', thoiGian: '2026-05-14 09:20:10', nguoiThaoTac: 'Lê Minh Anh (Content Editor)', diaChiIP: '192.168.1.25', noiDungChiTiet: 'Khởi tạo bài viết nháp: "Hướng dẫn cài đặt ứng dụng TXP BUS và nhận mã ưu đãi đón hè rực rỡ" (TT003)' },
      { maNhatKy: 'NK04', loaiThaoTac: 'Đăng tin tức', thoiGian: '2026-05-15 08:00:00', nguoiThaoTac: 'Nguyễn Hoài Nam (Admin)', diaChiIP: '115.79.44.18', noiDungChiTiet: 'Xác duyệt và phát hành bài viết giới thiệu chặng xe mới đi SaPa (TT001).' },
      { maNhatKy: 'NK05', loaiThaoTac: 'Hẹn giờ đăng bài', thoiGian: '2026-05-17 14:02:11', nguoiThaoTac: 'Nguyễn Hoài Nam (Admin)', diaChiIP: '192.168.1.12', noiDungChiTiet: 'Thiết lập hẹn giờ xuất bản tự động bài viết TT006 vào lúc 2026-05-25 09:00' }
    ];
  }

  // Set active filters tab
  setTab(tab: 'all' | 'published' | 'draft' | 'hidden' | 'scheduled') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.filterNews();
  }

  // Advanced Filtering
  filterNews() {
    let result = [...this.newsList];

    // 1. Filter by tabs status
    if (this.activeTab === 'published') {
      result = result.filter(n => n.trangThai === 'DaDang');
    } else if (this.activeTab === 'draft') {
      result = result.filter(n => n.trangThai === 'BanNhap');
    } else if (this.activeTab === 'hidden') {
      result = result.filter(n => n.trangThai === 'NgungHienThi');
    } else if (this.activeTab === 'scheduled') {
      result = result.filter(n => n.trangThai === 'HenGio');
    }

    // 2. Filter by search query (Title or Description)
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(n =>
        n.maTinTuc.toLowerCase().includes(q) ||
        n.tieuDe.toLowerCase().includes(q) ||
        n.moTaNgan.toLowerCase().includes(q)
      );
    }

    // 3. Sort Order
    if (this.sortOrder === 'newest') {
      result.sort((a, b) => b.ngayTao.localeCompare(a.ngayTao));
    } else if (this.sortOrder === 'oldest') {
      result.sort((a, b) => a.ngayTao.localeCompare(b.ngayTao));
    } else if (this.sortOrder === 'alphabetical') {
      result.sort((a, b) => a.tieuDe.localeCompare(b.tieuDe));
    }

    this.filteredNews = result;
    this.calculatePagination();
  }

  search() {
    this.currentPage = 1;
    this.filterNews();
  }

  onSortOrderChange() {
    this.currentPage = 1;
    this.filterNews();
  }

  // Pagination Logic
  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredNews.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.updateDisplayList();
  }

  updateDisplayList() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayNews = this.filteredNews.slice(startIndex, endIndex);
  }

  changePageSize(event: any) {
    this.pageSize = parseInt(event.target.value, 10);
    this.currentPage = 1;
    this.calculatePagination();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayList();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayList();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayList();
    }
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Quick cover selection helper
  selectPresetImage(url: string) {
    this.formModel.anhBia = url;
    if (this.formErrors['anhBia']) {
      this.formErrors['anhBia'] = '';
    }
  }

  // MOCK Local File Uploading simulation with real file reader!
  triggerLocalCoverUpload() {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = 'image/*';
    inputElement.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadedCoverFile = file.name;
        this.isUploadingCover = true;
        this.uploadCoverProgress = 0;

        const interval = setInterval(() => {
          this.uploadCoverProgress += 20;
          if (this.uploadCoverProgress >= 100) {
            clearInterval(interval);
            this.isUploadingCover = false;
            
            // Read actual file as base64 to show user's uploaded picture!
            const reader = new FileReader();
            reader.onload = (e: any) => {
              this.formModel.anhBia = e.target.result;
              this.showNotification(
                'Tải ảnh thành công',
                `Đã tải lên tệp tin <strong>${file.name}</strong> và tối ưu hóa ảnh đại diện thành công.`,
                'success'
              );
            };
            reader.readAsDataURL(file);
          }
        }, 100);
      }
    };
    inputElement.click();
  }

  triggerLocalInlineUpload() {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = 'image/*';
    inputElement.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadedInlineFile = file.name;
        this.isUploadingInline = true;
        this.uploadInlineProgress = 0;

        const interval = setInterval(() => {
          this.uploadInlineProgress += 25;
          if (this.uploadInlineProgress >= 100) {
            clearInterval(interval);
            this.isUploadingInline = false;
            
            // Read actual file as base64 to insert/preview inline image!
            const reader = new FileReader();
            reader.onload = (e: any) => {
              this.inlineImageUrl = e.target.result;
              this.showNotification(
                'Tải lên hoàn tất',
                `Ảnh chèn nội dung <strong>${file.name}</strong> đã tải lên thành công!`,
                'success'
              );
            };
            reader.readAsDataURL(file);
          }
        }, 100);
      }
    };
    inputElement.click();
  }

  openInsertImageModal() {
    this.inlineImageUrl = '';
    this.uploadedInlineFile = '';
    this.uploadInlineProgress = 0;
    this.isUploadingInline = false;
    this.showInsertImageModal = true;
  }

  closeInsertImageModal() {
    this.showInsertImageModal = false;
  }

  insertImageToContent() {
    if (!this.inlineImageUrl || !this.inlineImageUrl.trim()) {
      this.showNotification('Thiếu thông tin', 'Vui lòng dán liên kết hoặc tải ảnh lên trước!', 'error');
      return;
    }
    
    // Insert structured HTML image element to contenteditable
    const imgHtml = `<img src="${this.inlineImageUrl}" style="max-width: 100%; border-radius: 12px; margin: 16px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Hình ảnh bài viết" />`;
    if (this.editorElement) {
      this.editorElement.nativeElement.innerHTML += imgHtml;
      this.onEditorChange();
    }
    this.closeInsertImageModal();
  }

  // Open Form Modal (Add / Edit)
  openAddModal() {
    this.isEditing = false;
    this.selectedNews = null;
    this.formErrors = {};
    
    // Auto-generate code
    const nextNum = Math.max(...this.newsList.map(n => parseInt(n.maTinTuc.replace('TT', ''), 10)), 0) + 1;
    const newCode = 'TT' + String(nextNum).padStart(3, '0');

    this.formModel = {
      maTinTuc: newCode,
      tieuDe: '',
      anhBia: '',
      moTaNgan: '',
      noiDungChiTiet: '', // Start completely clean without technical tag templates
      trangThai: 'BanNhap',
      henGioDang: false,
      ngayHenGio: '',
      gioHenGio: ''
    };
    this.showModal = true;

    // Clear editable canvas
    setTimeout(() => {
      if (this.editorElement) {
        this.editorElement.nativeElement.innerHTML = '';
      }
    }, 50);
  }

  openEditModal(news: TinTuc) {
    this.isEditing = true;
    this.selectedNews = news;
    this.formErrors = {};

    let ngayHenGio = '';
    let gioHenGio = '';
    if (news.henGioDang && news.ngayGioHenGio) {
      const parts = news.ngayGioHenGio.split(' ');
      ngayHenGio = parts[0];
      gioHenGio = parts[1];
    }

    this.formModel = { 
      ...news,
      henGioDang: news.henGioDang || false,
      ngayHenGio,
      gioHenGio
    };
    this.showModal = true;

    // Load content to editable canvas
    setTimeout(() => {
      if (this.editorElement) {
        this.editorElement.nativeElement.innerHTML = this.formModel.noiDungChiTiet;
      }
    }, 50);
  }

  closeModal() {
    this.showModal = false;
    this.selectedNews = null;
  }

  // Pure document.execCommand editor logic exactly like Policy screen
  execEditorCommand(command: string, value: string = '') {
    if (command === 'clear') {
      this.confirmType = 'clear' as any;
      this.showConfirmModal = true;
    }
  }

  // Rich Text Editor Command Executions exactly from Policy component
  formatDoc(cmd: string, val: string = '') {
    document.execCommand(cmd, false, val);
    if (this.editorElement) {
      this.formModel.noiDungChiTiet = this.editorElement.nativeElement.innerHTML;
    }
  }

  onEditorChange() {
    if (this.editorElement) {
      this.formModel.noiDungChiTiet = this.editorElement.nativeElement.innerHTML;
    }
  }

  changeFont(event: Event) {
    const font = (event.target as HTMLSelectElement).value;
    this.formatDoc('fontName', font);
  }

  changeFontSize(event: Event) {
    const size = (event.target as HTMLSelectElement).value;
    this.formatDoc('fontSize', size);
  }

  // Chèn liên kết tùy chỉnh (Mở Sub-Modal đẹp giống Word)
  insertLink() {
    try {
      const selection = window.getSelection();
      let selectedText = '';
      if (selection && selection.rangeCount > 0) {
        try {
          this.savedSelectionRange = selection.getRangeAt(0).cloneRange();
          selectedText = selection.toString();
        } catch (err) {
          console.warn('Could not clone range:', err);
          this.savedSelectionRange = null;
        }
      } else {
        this.savedSelectionRange = null;
      }
      this.linkForm = {
        text: selectedText || 'Liên kết',
        url: 'https://'
      };
    } catch (e) {
      console.error('Error in insertLink range clone:', e);
      this.savedSelectionRange = null;
      this.linkForm = {
        text: 'Liên kết',
        url: 'https://'
      };
    }
    this.showLinkModal = true;
  }

  closeLinkModal() {
    this.showLinkModal = false;
  }

  confirmInsertLink() {
    if (!this.linkForm.url.trim() || this.linkForm.url === 'https://') {
      this.showNotification('Cảnh báo', 'Vui lòng nhập địa chỉ URL liên kết!', 'warning');
      return;
    }

    // Khôi phục Selection để chèn link vào đúng vị trí con trỏ
    const selection = window.getSelection();
    if (selection && this.savedSelectionRange) {
      selection.removeAllRanges();
      selection.addRange(this.savedSelectionRange);
    }

    // Tạo mã HTML cho liên kết đẹp
    const linkHTML = `<a href="${this.linkForm.url}" target="_blank" style="color: #009ba1; font-weight: 600; text-decoration: underline; cursor: pointer;" title="${this.linkForm.url}">${this.linkForm.text}</a>`;

    this.formatDoc('insertHTML', linkHTML);
    this.closeLinkModal();
  }

  // Quản lý và xử lý nhấp chuột vào phần tử trong Editor
  onEditorClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'a') {
      event.preventDefault();
      const href = target.getAttribute('href');
      if (href) {
        window.open(href, '_blank');
      }
    } else if (target.tagName.toLowerCase() === 'img') {
      this.selectImage(target as HTMLImageElement);
      event.stopPropagation();
    } else {
      this.clearImageSelection();
    }
  }

  selectImage(img: HTMLImageElement) {
    this.selectedImage = img;
    this.clearImageOutlines();
    img.style.outline = '2px solid #009ba1';
    img.style.outlineOffset = '2px';
    this.updateResizeOverlay();
  }

  clearImageOutlines() {
    if (this.editorElement) {
      const imgs = this.editorElement.nativeElement.querySelectorAll('img');
      imgs.forEach((im: HTMLImageElement) => {
        im.style.outline = 'none';
      });
    }
  }

  clearImageSelection() {
    this.clearImageOutlines();
    this.selectedImage = null;
    this.updateResizeOverlay();
  }

  // Cập nhật vị trí khung resize đè lên ảnh
  updateResizeOverlay() {
    if (!this.selectedImage || !this.editorElement) {
      this.resizeBox = { top: 0, left: 0, width: 0, height: 0 };
      return;
    }
    const img = this.selectedImage;
    const canvas = this.editorElement.nativeElement;
    const wrapper = canvas.closest('.editor-wrapper');
    if (!wrapper) return;

    const imgRect = img.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    this.resizeBox = {
      top: imgRect.top - wrapperRect.top,
      left: imgRect.left - wrapperRect.left,
      width: imgRect.width,
      height: imgRect.height
    };
  }

  // Bắt đầu kéo thả thay đổi kích thước ảnh từ 4 góc
  startResize(event: MouseEvent, handle: string) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.selectedImage) return;

    this.resizingData = {
      handle: handle,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: this.selectedImage.clientWidth,
      startHeight: this.selectedImage.clientHeight,
      aspectRatio: this.selectedImage.clientWidth / this.selectedImage.clientHeight
    };

    const mouseMoveListener = (moveEvent: MouseEvent) => {
      this.handleResize(moveEvent);
    };

    const mouseUpListener = () => {
      window.removeEventListener('mousemove', mouseMoveListener);
      window.removeEventListener('mouseup', mouseUpListener);
      this.onEditorChange();
    };

    window.addEventListener('mousemove', mouseMoveListener);
    window.addEventListener('mouseup', mouseUpListener);
  }

  handleResize(event: MouseEvent) {
    if (!this.selectedImage || !this.editorElement) return;

    const dx = event.clientX - this.resizingData.startX;
    let newWidth = this.resizingData.startWidth;

    if (this.resizingData.handle === 'br' || this.resizingData.handle === 'tr') {
      newWidth = this.resizingData.startWidth + dx;
    } else if (this.resizingData.handle === 'bl' || this.resizingData.handle === 'tl') {
      newWidth = this.resizingData.startWidth - dx;
    }

    // Giới hạn chiều rộng nhỏ nhất là 40px
    if (newWidth < 40) newWidth = 40;

    // Tính phần trăm so với chiều rộng khung soạn thảo để duy trì hiển thị responsive
    const canvasWidth = this.editorElement.nativeElement.clientWidth;
    const padding = 32; // padding của canvas
    const usableWidth = canvasWidth - padding;
    const widthPercent = Math.min(100, Math.round((newWidth / usableWidth) * 100));

    this.selectedImage.style.width = `${widthPercent}%`;
    this.selectedImage.style.height = 'auto'; // Auto height to preserve aspect ratio

    this.updateResizeOverlay();
  }

  // Căn lề hình ảnh (float / margins)
  isImgAlign(align: 'left' | 'center' | 'right'): boolean {
    if (!this.selectedImage) return false;
    const style = this.selectedImage.style;
    if (align === 'left') {
      return style.float === 'left';
    }
    if (align === 'right') {
      return style.float === 'right';
    }
    if (align === 'center') {
      return style.display === 'block' && style.margin.includes('auto');
    }
    return false;
  }

  alignImage(align: 'left' | 'center' | 'right') {
    const img = this.selectedImage;
    if (!img) return;
    if (align === 'left') {
      img.style.display = 'inline';
      img.style.float = 'left';
      img.style.margin = '10px 15px 10px 0';
    } else if (align === 'right') {
      img.style.display = 'inline';
      img.style.float = 'right';
      img.style.margin = '10px 0 10px 15px';
    } else if (align === 'center') {
      img.style.display = 'block';
      img.style.float = 'none';
      img.style.margin = '15px auto';
    }
    this.onEditorChange();
    setTimeout(() => this.updateResizeOverlay(), 20);
  }

  // Lấy % độ rộng hiện tại của hình ảnh
  getImageWidth(): number {
    if (!this.selectedImage) return 100;
    const widthStr = this.selectedImage.style.width;
    if (widthStr && widthStr.endsWith('%')) {
      return parseInt(widthStr, 10);
    }
    return 100;
  }

  // Thay đổi độ rộng qua thanh trượt Slider
  changeImageWidth(event: Event) {
    if (!this.selectedImage) return;
    const width = (event.target as HTMLInputElement).value;
    this.selectedImage.style.width = `${width}%`;
    this.selectedImage.style.height = 'auto'; // Giữ nguyên tỉ lệ ảnh
    this.onEditorChange();
    setTimeout(() => this.updateResizeOverlay(), 10);
  }

  // Xóa ảnh đang chọn
  deleteSelectedImage() {
    if (!this.selectedImage) return;
    this.selectedImage.remove();
    this.selectedImage = null;
    this.updateResizeOverlay();
    this.onEditorChange();
  }

  // Kích hoạt hộp thoại chọn file ảnh từ máy tính
  triggerImageUpload() {
    if (this.imageInputElement) {
      this.imageInputElement.nativeElement.click();
    }
  }

  // Đọc file ảnh cục bộ chuyển đổi sang Base64 chèn vào Editor
  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Url = e.target.result;
        this.formatDoc('insertImage', base64Url);
        // Reset file input value
        (event.target as HTMLInputElement).value = '';
      };
      reader.readAsDataURL(file);
    }
  }

  // Chèn khối mã nguồn (pre/code block)
  insertCodeBlock() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString() || 'Nhập mã nguồn tại đây...';

      const preNode = document.createElement('pre');
      preNode.style.backgroundColor = '#f5f5f5';
      preNode.style.padding = '10px';
      preNode.style.borderRadius = '4px';
      preNode.style.fontFamily = 'Courier New, Courier, monospace';
      preNode.style.margin = '10px 0';
      preNode.style.borderLeft = '4px solid #009ba1';

      const codeNode = document.createElement('code');
      codeNode.innerText = selectedText;
      preNode.appendChild(codeNode);

      range.deleteContents();
      range.insertNode(preNode);

      // Di chuyển con trỏ sau khối mã nguồn vừa chèn
      range.setStartAfter(preNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);

      this.onEditorChange();
    } else {
      this.formatDoc('insertHTML', '<pre style="background:#f5f5f5;padding:10px;border-radius:4px;font-family:Courier New;margin:10px 0;border-left:4px solid #009ba1"><code>Nhập mã nguồn tại đây...</code></pre>');
    }
  }

  // Real-time inline field validation
  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.formModel.tieuDe || !this.formModel.tieuDe.trim()) {
      this.formErrors['tieuDe'] = 'Tiêu đề bài viết không được để trống!';
      isValid = false;
    } else {
      // Check unique title exception
      const duplicate = this.newsList.find(n => 
        n.tieuDe.toLowerCase().trim() === this.formModel.tieuDe.toLowerCase().trim() && 
        n.maTinTuc !== this.formModel.maTinTuc
      );
      if (duplicate) {
        this.formErrors['tieuDe'] = 'Tiêu đề bài viết này đã bị trùng lặp trên hệ thống!';
        isValid = false;
      }
    }

    if (!this.formModel.anhBia || !this.formModel.anhBia.trim()) {
      this.formErrors['anhBia'] = 'Vui lòng chọn ảnh bìa hoặc dán liên kết ảnh hợp lệ!';
      isValid = false;
    }

    if (!this.formModel.moTaNgan || !this.formModel.moTaNgan.trim()) {
      this.formErrors['moTaNgan'] = 'Mô tả ngắn không được để trống!';
      isValid = false;
    } else if (this.formModel.moTaNgan.length > 200) {
      this.formErrors['moTaNgan'] = `Mô tả ngắn tối đa 200 ký tự (Hiện tại: ${this.formModel.moTaNgan.length} ký tự)!`;
      isValid = false;
    }

    // Professional check for empty or browser placeholder tags in editable div
    const emptyValue = this.formModel.noiDungChiTiet || '';
    const cleanText = emptyValue.replace(/<[^>]*>/g, '').trim();
    if (!emptyValue || emptyValue === '<br>' || emptyValue === '<div><br></div>' || !cleanText) {
      this.formErrors['noiDungChiTiet'] = 'Vui lòng soạn thảo nội dung chi tiết cho bài viết!';
      isValid = false;
    }

    // Facebook scheduled date validate
    if (this.formModel.henGioDang) {
      if (!this.formModel.ngayHenGio || !this.formModel.gioHenGio) {
        this.formErrors['ngayHenGio'] = 'Vui lòng chọn đầy đủ cả Ngày và Giờ để lên lịch hẹn giờ đăng!';
        isValid = false;
      } else {
        const scheduledTime = new Date(`${this.formModel.ngayHenGio}T${this.formModel.gioHenGio}:00`);
        const now = new Date();
        if (scheduledTime <= now) {
          this.formErrors['ngayHenGio'] = 'Thời gian hẹn giờ đăng phải nằm ở tương lai (Muộn hơn thời điểm hiện tại)!';
          isValid = false;
        }
      }
    }

    return isValid;
  }

  // Save News (Add or Update)
  saveNews() {
    // Force synchronize the absolute latest content before validating
    this.onEditorChange();

    if (!this.validateForm()) {
      this.showNotification('Lỗi biểu mẫu', 'Vui lòng rà soát lại thông tin và sửa các lỗi màu đỏ trước khi lưu.', 'error');
      return;
    }

    const today = this.formatCurrentDate();
    let computedStatus = this.formModel.trangThai;
    let scheduledDateTimeStr = '';

    // If FB Scheduled Publish is checked
    if (this.formModel.henGioDang) {
      computedStatus = 'HenGio';
      scheduledDateTimeStr = `${this.formModel.ngayHenGio} ${this.formModel.gioHenGio}`;
    }

    if (this.isEditing && this.selectedNews) {
      // 1. UPDATE news
      const idx = this.newsList.findIndex(n => n.maTinTuc === this.formModel.maTinTuc);
      if (idx !== -1) {
        const original = this.newsList[idx];
        
        // Push activity log
        this.pushActivityLog(
          this.formModel.henGioDang ? 'Lên lịch hẹn giờ' : 'Cập nhật tin tức',
          this.formModel.henGioDang 
            ? `Thiết lập lại lịch hẹn đăng bài viết ${this.formModel.maTinTuc} vào lúc ${scheduledDateTimeStr}.`
            : `Cập nhật thành công thông tin chi tiết bài viết ${this.formModel.maTinTuc}.`
        );

        this.newsList[idx] = {
          ...this.formModel,
          trangThai: computedStatus,
          henGioDang: this.formModel.henGioDang,
          ngayGioHenGio: scheduledDateTimeStr,
          ngayDang: computedStatus === 'DaDang' ? (original.ngayDang || today) : '',
          ngayCapNhat: today
        };

        this.showNotification(
          'Cập nhật thành công',
          `Bài viết <strong>${this.formModel.tieuDe}</strong> đã được lưu trữ thành công ở trạng thái: <strong>${this.getTrangThaiLabel(computedStatus)}</strong>.`,
          'success'
        );
      }
    } else {
      // 2. CREATE news
      const newNews: TinTuc = {
        ...this.formModel,
        trangThai: computedStatus,
        henGioDang: this.formModel.henGioDang,
        ngayGioHenGio: scheduledDateTimeStr,
        ngayDang: computedStatus === 'DaDang' ? today : '',
        nguoiDang: 'Nguyễn Hoài Nam (Admin)',
        ngayTao: today,
        ngayCapNhat: today
      };

      this.newsList.unshift(newNews);

      // Push activity log
      this.pushActivityLog(
        this.formModel.henGioDang ? 'Lên lịch bài viết' : 'Thêm mới tin tức',
        this.formModel.henGioDang 
          ? `Lên lịch hẹn giờ đăng cho bài viết mới "${newNews.tieuDe}" lúc ${scheduledDateTimeStr}.`
          : `Tạo mới thành công tin tức: "${newNews.tieuDe}" (${newNews.maTinTuc}).`
      );

      this.showNotification(
        this.formModel.henGioDang ? 'Lên lịch hẹn giờ thành công' : 'Đăng tin tức thành công',
        `Bài viết đã được thiết lập thành công ở trạng thái: <strong>${this.getTrangThaiLabel(computedStatus)}</strong>.`,
        'success'
      );
    }

    this.filterNews();
    this.closeModal();
  }

  // Confirmation Overlays (Hide, Publish, Clear)
  openConfirm(type: 'hide' | 'publish' | 'clear', news: TinTuc | null) {
    this.confirmType = type;
    this.targetNews = news;
    this.showConfirmModal = true;
  }

  closeConfirm() {
    this.showConfirmModal = false;
    this.targetNews = null;
  }

  executeConfirm() {
    if (this.confirmType === 'clear' as any) {
      if (this.editorElement) {
        this.editorElement.nativeElement.innerHTML = '';
        this.formModel.noiDungChiTiet = '';
      }
      this.closeConfirm();
      return;
    }

    if (!this.targetNews) return;

    const idx = this.newsList.findIndex(n => n.maTinTuc === this.targetNews?.maTinTuc);
    if (idx !== -1) {
      const news = this.newsList[idx];

      if (this.confirmType === 'hide') {
        // HIDE news
        news.trangThai = 'NgungHienThi';
        news.henGioDang = false;
        news.ngayGioHenGio = '';
        news.ngayCapNhat = this.formatCurrentDate();
        
        this.pushActivityLog(
          'Ẩn tin tức',
          `Ẩn bài viết khỏi cổng thông tin chính thức. Bài viết: "${news.tieuDe}" (${news.maTinTuc}).`
        );

        this.showNotification(
          'Đã ẩn tin tức',
          `Bài viết <strong>${news.tieuDe}</strong> đã bị chuyển sang trạng thái <strong>Ngừng hiển thị</strong>. Khách hàng sẽ không thể thấy tin tức này trên ứng dụng.`,
          'success'
        );
      } else if (this.confirmType === 'publish') {
        // PUBLISH news
        news.trangThai = 'DaDang';
        news.henGioDang = false;
        news.ngayGioHenGio = '';
        news.ngayDang = this.formatCurrentDate();
        news.ngayCapNhat = this.formatCurrentDate();

        this.pushActivityLog(
          'Đăng tin tức',
          `Kích hoạt hiển thị công khai bài viết: "${news.tieuDe}" (${news.maTinTuc}).`
        );

        this.showNotification(
          'Đã đăng tin tức',
          `Bài viết <strong>${news.tieuDe}</strong> đã được xuất bản công khai thành công lên trang chủ hệ thống.`,
          'success'
        );
      }
    }

    this.filterNews();
    this.closeConfirm();

    // Close preview modal if currently viewing hidden news
    if (this.previewNews?.maTinTuc === this.targetNews?.maTinTuc) {
      this.closePreviewModal();
    }
  }

  // News Details Popup Modal instead of sliding drawer
  openPreviewModal(news: TinTuc) {
    this.previewNews = news;
    this.previewTabActive = 'preview';
    this.showPreviewModal = true;
  }

  closePreviewModal() {
    this.showPreviewModal = false;
    this.previewNews = null;
  }

  editFromPreview(news: TinTuc) {
    this.closePreviewModal();
    // Allow the preview DOM modal to safely tear down before rendering the edit workspace
    setTimeout(() => {
      this.openEditModal(news);
    }, 150);
  }

  // Get active logs filtering just for the currently previewed news code
  getLogsForNews(newsCode: string): NhatKyTinTuc[] {
    return this.activityLogs.filter(log => log.noiDungChiTiet.includes(newsCode));
  }

  // Helpers & Utility formatters
  pushActivityLog(operation: string, details: string) {
    this.activityLogs.unshift({
      maNhatKy: 'NK' + String(this.activityLogs.length + 1).padStart(2, '0'),
      loaiThaoTac: operation,
      thoiGian: this.formatCurrentDateTime(),
      nguoiThaoTac: 'Nguyễn Hoài Nam (Admin)',
      diaChiIP: '192.168.1.12',
      noiDungChiTiet: details
    });
  }

  getTrangThaiLabel(status: string): string {
    if (status === 'DaDang') return 'Đang hiển thị';
    if (status === 'BanNhap') return 'Bản nháp';
    if (status === 'NgungHienThi') return 'Ngừng hiển thị';
    if (status === 'HenGio') return 'Lịch hẹn đăng';
    return status;
  }

  showNotification(title: string, message: string, type: 'success' | 'warning' | 'error' = 'success') {
    this.notification = {
      show: true,
      title,
      message,
      type
    };
  }

  closeNotification() {
    this.notification.show = false;
  }

  formatCurrentDate(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  formatCurrentDateTime(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const sec = String(d.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
  }
}
