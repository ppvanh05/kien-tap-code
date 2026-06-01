import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChinhSachService } from '../../../core/services/chinh-sach.service';
import { HttpClientModule } from '@angular/common/http';
import { AdminAuthService } from '../../../core/services/admin-auth.service';

interface PolicyMilestone {
  hoursBeforeDeparture: number;
  refundPercentage: number;
}

interface Policy {
  id: string; // MaChinhSach_ND or MaChinhSach
  title: string; // TieuDe or TenChinhSach
  type: 'insurance' | 'payment' | 'cancellation' | 'other';
  typeLabel: string;
  content: string; // HTML content for editor
  effectiveDate: string; // NgayApDung
  status: 'DangApDung' | 'VoHieuHoa';
  milestones?: PolicyMilestone[]; // Only for 'cancellation'
  adminId?: string; // MaQuanTriVien
}

@Component({
  selector: 'app-quan-ly-chinh-sach',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './quan-ly-chinh-sach.component.html',
  styleUrls: ['./quan-ly-chinh-sach.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class QuanLyChinhSachComponent implements OnInit {
  @ViewChild('editor') editorElement!: ElementRef;
  @ViewChild('imageInput') imageInputElement!: ElementRef;

  isLoading: boolean = false;

  // Tabs: 'all' | 'active' | 'locked'
  activeTab: 'all' | 'active' | 'locked' = 'all';

  // Dropdown list them moi
  showAddDropdown: boolean = false;

  // Search & Filter options
  searchQuery: string = '';
  filterType: string = 'all';

  // List of policies (CHINH_SACH & CHINH_SACH_HUY_VE)
  policies: Policy[] = [];
  filteredPolicies: Policy[] = [];
  displayPolicies: Policy[] = [];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;

  // Modal State
  showModal: boolean = false;
  isEditing: boolean = false;
  selectedPolicy: Policy | null = null;

  // Modal Form Model
  formModel: {
    id: string;
    title: string;
    type: 'insurance' | 'payment' | 'cancellation' | 'other';
    typeLabel: string;
    content: string;
    effectiveDate: string;
    status: 'DangApDung' | 'VoHieuHoa';
    milestones: PolicyMilestone[];
  } = this.getEmptyFormModel();

  // Selected Font & Font Size for Editor toolbar
  selectedFont: string = 'Inter';
  selectedFontSize: string = '3'; // standard browser command font size (1-7)

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

  // Custom Notification State
  notification = {
    show: false,
    type: 'success' as 'success' | 'warning' | 'error',
    title: '',
    message: ''
  };

  // Custom Confirmation Modal State
  confirmModal = {
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  };

  isBrowser: boolean = false;

  constructor(
    private chinhSachService: ChinhSachService,
    private cdr: ChangeDetectorRef,
    private adminAuthService: AdminAuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  hasPermission(permission: string): boolean {
    const user = this.adminAuthService.currentUserValue;
    if (!user) return false;
    const basePermission = permission.split('.')[0];
    return !!user.Quyen?.includes(permission) || !!user.Quyen?.includes(basePermission);
  }

  closeConfirm() {
    this.confirmModal.show = false;
    this.cdr.detectChanges();
  }

  executeConfirm() {
    this.confirmModal.onConfirm();
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.loadPolicies();
    }
  }

  loadPolicies() {
    this.isLoading = true;
    this.policies = [];
    let csLoaded = false;
    let csvLoaded = false;

    const checkAndFilter = () => {
      if (csLoaded && csvLoaded) {
        this.isLoading = false;
        this.filterPolicies();
        this.cdr.detectChanges();
      }
    };

    // Load chính sách chung (bảo hiểm, thanh toán, khác)
    this.chinhSachService.getAllChinhSach().subscribe({
      next: (data) => {
        const mapped: Policy[] = data.map((cs: any) => ({
          id: cs.MaChinhSach_ND,
          title: cs.TieuDe,
          type: this.mapLoaiChinhSach(cs.LoaiChinhSach),
          typeLabel: cs.LoaiChinhSach,
          content: cs.NoiDung,
          effectiveDate: typeof cs.NgayApDung === 'string'
            ? cs.NgayApDung.slice(0, 10)
            : new Date(cs.NgayApDung).toISOString().slice(0, 10),
          status: cs.TrangThai as 'DangApDung' | 'VoHieuHoa',
          adminId: cs.MaQuanTriVien,
        }));
        this.policies = [...this.policies, ...mapped];
        csLoaded = true;
        checkAndFilter();
      },
      error: (err) => {
        console.error('Lỗi load CHINH_SACH:', err);
        this.showNotification('error', 'Không thể tải danh sách chính sách chung!', 'Lỗi kết nối');
        csLoaded = true;
        checkAndFilter();
        this.cdr.detectChanges();
      }
    });

    // Load chính sách hủy vé
    this.chinhSachService.getAllChinhSachHuyVe().subscribe({
      next: (data) => {
        const mapped: Policy[] = data.map((cs: any) => ({
          id: cs.MaChinhSach,
          title: cs.TenChinhSach,
          type: 'cancellation' as const,
          typeLabel: 'Chính sách hủy vé',
          content: cs.MoTa ?? '',
          effectiveDate: typeof cs.NgayApDung === 'string'
            ? cs.NgayApDung.slice(0, 10)
            : new Date(cs.NgayApDung).toISOString().slice(0, 10),
          status: cs.TrangThai as 'DangApDung' | 'VoHieuHoa',
          milestones: [{
            hoursBeforeDeparture: cs.GioiHanGioTruocKhoiHanh,
            refundPercentage: Math.round(cs.TyLePhiHuy * 100),
          }],
        }));
        this.policies = [...this.policies, ...mapped];
        csvLoaded = true;
        checkAndFilter();
      },
      error: (err) => {
        console.error('Lỗi load CHINH_SACH_HUY_VE:', err);
        this.showNotification('error', 'Không thể tải danh sách chính sách hủy vé!', 'Lỗi kết nối');
        csvLoaded = true;
        checkAndFilter();
        this.cdr.detectChanges();
      }
    });
  }

  private mapLoaiChinhSach(loai: string): 'insurance' | 'payment' | 'cancellation' | 'other' {
    const map: Record<string, 'insurance' | 'payment' | 'cancellation' | 'other'> = {
      'Chính sách bảo hiểm': 'insurance',
      'insurance': 'insurance',
      'Chính sách thanh toán': 'payment',
      'payment': 'payment',
      'Chính sách hủy vé': 'cancellation',
      'cancellation': 'cancellation',
    };
    return map[loai] ?? 'other';
  }

  getEmptyFormModel() {
    return {
      id: '',
      title: '',
      type: 'other' as const,
      typeLabel: 'Chính sách khác',
      content: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      status: 'DangApDung' as const,
      milestones: [] as PolicyMilestone[]
    };
  }

  generateMockPolicies(): Policy[] {
    return [
      {
        id: 'CS001',
        title: 'Chính sách bảo mật thông tin khách hàng',
        type: 'other',
        typeLabel: 'Chính sách khác',
        content: `
          <h3>Phương tiện và công cụ để người dùng tiếp cận và chỉnh sửa dữ liệu cá nhân của mình</h3>
          <p>Khách hàng có quyền tự kiểm tra, cập nhật, điều chỉnh hoặc hủy bỏ thông tin cá nhân của mình bằng cách yêu cầu nhà xe Anh Huy Đất Cảng thực hiện việc này.</p>
          <h3>Đối tượng chia sẻ thông tin</h3>
          <p>Anh Huy Đất Cảng có thể tiết lộ thông tin cá nhân của khách hàng theo yêu cầu của luật sư cũng như cơ quan chức năng có thẩm quyền theo Chính sách bảo mật thông tin khách hàng của nhà xe.</p>
          <p>Anh Huy Đất Cảng sẽ cung cấp thông tin của khách hàng khi Anh Huy Đất Cảng tin rằng việc làm đó là cần thiết để bảo vệ quyền lợi của khách hàng, đảm bảo an toàn của khách hàng hoặc người khác, điều tra gian lận hay vi phạm pháp luật.</p>
        `,
        effectiveDate: '2024-05-27',
        status: 'DangApDung'
      },
      {
        id: 'CS002',
        title: 'Chính sách bảo hiểm du lịch nhà xe Anh Huy',
        type: 'insurance',
        typeLabel: 'Chính sách bảo hiểm',
        content: `
          <h3>Chính sách Bảo hiểm hành khách xe khách chất lượng cao</h3>
          <p>Tất cả hành khách mua vé và di chuyển trên xe của Anh Huy Đất Cảng đều được hưởng quyền lợi bảo hiểm hành khách theo quy định pháp luật.</p>
          <p>Mức đền bù tối đa lên tới 50,000,000đ/vụ đối với các trường hợp xảy ra sự cố trong suốt hành trình di chuyển.</p>
        `,
        effectiveDate: '2024-05-24',
        status: 'DangApDung'
      },
      {
        id: 'CS003',
        title: 'Chính sách thanh toán',
        type: 'payment',
        typeLabel: 'Chính sách thanh toán',
        content: `
          <h3>Quy định về Thanh toán trực tuyến</h3>
          <p>Hệ thống hỗ trợ các phương thức thanh toán trực tuyến bao gồm: Thẻ nội địa (ATM), Thẻ quốc tế (Visa/Mastercard), Chuyển khoản QR code, hoặc Ví điện tử (Momo, VNPay).</p>
          <p>Vé chỉ được xác nhận thành công sau khi hệ thống nhận được thanh toán hoàn tất.</p>
        `,
        effectiveDate: '2024-05-24',
        status: 'DangApDung'
      },
      {
        id: 'CSH001',
        title: 'Chính sách hủy vé và hoàn trả mặc định',
        type: 'cancellation',
        typeLabel: 'Chính sách hủy vé',
        content: `
          <h3>Điều khoản Hủy vé và Hoàn trả tiền vé</h3>
          <p>Nhằm tạo điều kiện tốt nhất cho khách hàng chủ động lịch trình, nhà xe Anh Huy Đất Cảng quy định cụ thể mức phí hủy vé và hoàn tiền dựa trên thời gian hủy trước giờ khởi hành.</p>
          <p>Mức phí hủy và hoàn trả được tính toán tự động qua hệ thống và chuyển lại vào tài khoản thanh toán ban đầu của khách hàng.</p>
        `,
        effectiveDate: '2024-05-20',
        status: 'DangApDung',
        milestones: [
          { hoursBeforeDeparture: 24, refundPercentage: 100 },
          { hoursBeforeDeparture: 12, refundPercentage: 70 },
          { hoursBeforeDeparture: 6, refundPercentage: 30 }
        ]
      },
      {
        id: 'CS004',
        title: 'Quy định hành lý mang theo',
        type: 'other',
        typeLabel: 'Chính sách khác',
        content: `
          <h3>Chính sách Hành lý ký gửi & Xách tay</h3>
          <p>Mỗi hành khách được mang theo tối đa 20kg hành lý ký gửi miễn phí và 1 kiện hành lý xách tay gọn nhẹ.</p>
          <p>Hành lý quá khổ hoặc có mùi (hải sản, sầu riêng,...) phải được đóng gói kỹ lưỡng và có thể phát sinh thêm phụ phí vận chuyển.</p>
        `,
        effectiveDate: '2024-04-15',
        status: 'VoHieuHoa'
      }
    ];
  }

  // Toggling Tabs
  setTab(tab: 'all' | 'active' | 'locked') {
    this.activeTab = tab;
    this.filterPolicies();
  }

  // Toggle Dropdown them moi
  toggleAddDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showAddDropdown = !this.showAddDropdown;
  }

  // Close dropdown when clicking outside
  closeDropdowns() {
    this.showAddDropdown = false;
  }

  // Filtering list based on Tab and Search
  onFilterTypeChange() {
    this.filterPolicies();
  }

  search() {
    this.filterPolicies();
  }

  // Filtering list based on Tab, dropdown selection and search keywords
  filterPolicies() {
    let result = [...this.policies];

    // 1. Filter by status (tab)
    if (this.activeTab === 'active') {
      result = result.filter(p => p.status === 'DangApDung');
    } else if (this.activeTab === 'locked') {
      result = result.filter(p => p.status === 'VoHieuHoa');
    }

    // 2. Filter by policy type (dropdown select)
    if (this.filterType !== 'all') {
      result = result.filter(p => p.type === this.filterType);
    }

    // 3. Filter by search query input
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.id.toLowerCase().includes(query)
      );
    }

    // Sắp xếp theo ngày áp dụng mới nhất
    result.sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));

    this.filteredPolicies = result;
    this.currentPage = 1;
    this.updateDisplayList();
  }

  updateDisplayList() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.displayPolicies = this.filteredPolicies.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPolicies.length / this.pageSize);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayList();
    }
  }

  changePageSize(event: any) {
    const size = parseInt(event.target.value, 10);
    if (size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.updateDisplayList();
    }
  }

  getPageNumbers() {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Open Modal to Add
  openAddModal(type: 'insurance' | 'payment' | 'cancellation' | 'other') {
    this.isEditing = false;
    this.selectedPolicy = null;
    this.showAddDropdown = false;

    let typeLabel = 'Chính sách khác';
    if (type === 'insurance') typeLabel = 'Chính sách bảo hiểm';
    if (type === 'payment') typeLabel = 'Chính sách thanh toán';
    if (type === 'cancellation') typeLabel = 'Chính sách hủy vé';

    this.formModel = {
      id: type === 'cancellation' ? `CSH${String(this.policies.length + 1).padStart(3, '0')}` : `CS${String(this.policies.length + 1).padStart(3, '0')}`,
      title: '',
      type: type,
      typeLabel: typeLabel,
      content: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      status: 'DangApDung',
      milestones: type === 'cancellation' ? [
        { hoursBeforeDeparture: 24, refundPercentage: 100 },
        { hoursBeforeDeparture: 12, refundPercentage: 50 }
      ] : []
    };

    this.showModal = true;

    // Set default content for rich text editor after modal loads
    setTimeout(() => {
      if (this.editorElement) {
        this.editorElement.nativeElement.innerHTML = this.formModel.content;
      }
    }, 50);
  }

  // Open Modal to Edit
  openEditModal(policy: Policy) {
    this.isEditing = true;
    this.selectedPolicy = policy;

    this.formModel = {
      id: policy.id,
      title: policy.title,
      type: policy.type,
      typeLabel: policy.typeLabel,
      content: policy.content,
      effectiveDate: policy.effectiveDate,
      status: policy.status,
      milestones: policy.milestones ? JSON.parse(JSON.stringify(policy.milestones)) : []
    };

    this.showModal = true;

    // Set content in Editor editable div
    setTimeout(() => {
      if (this.editorElement) {
        this.editorElement.nativeElement.innerHTML = this.formModel.content;
      }
    }, 50);
  }

  // Close Modal
  closeModal() {
    this.showModal = false;
    this.selectedPolicy = null;
    this.showLinkModal = false;
    this.selectedImage = null;
  }

  // Toggle Policy Status in the form modal with confirmation
  toggleStatus() {
    const isLocking = this.formModel.status === 'DangApDung';
    this.confirmModal = {
      show: true,
      title: isLocking ? 'Xác nhận khóa chính sách' : 'Xác nhận kích hoạt chính sách',
      message: isLocking 
        ? 'Bạn có chắc chắn muốn ngừng hiển thị/áp dụng chính sách này không?' 
        : 'Bạn có chắc chắn muốn kích hoạt hiển thị lại chính sách này không?',
      onConfirm: () => {
        this.formModel.status = isLocking ? 'VoHieuHoa' : 'DangApDung';
        this.confirmModal.show = false;
        this.cdr.detectChanges();
      }
    };
    this.cdr.detectChanges();
  }


  // Add Milestone dynamic row (for cancellation policies)
  addMilestone() {
    this.formModel.milestones.push({
      hoursBeforeDeparture: 0,
      refundPercentage: 0
    });
  }

  // Remove Milestone dynamic row
  removeMilestone(index: number) {
    this.formModel.milestones.splice(index, 1);
  }

  // Rich Text Editor Command Executions
  formatDoc(cmd: string, val: string = '') {
    // Sử dụng document.execCommand để format văn bản trong div contenteditable
    document.execCommand(cmd, false, val);
    if (this.editorElement) {
      this.formModel.content = this.editorElement.nativeElement.innerHTML;
    }
  }

  onEditorChange() {
    if (this.editorElement) {
      this.formModel.content = this.editorElement.nativeElement.innerHTML;
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
      this.showNotification('warning', 'Vui lòng nhập địa chỉ URL liên kết!', 'Cảnh báo');
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
    img.style.outline = '2px solid var(--primary-color)';
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
    if (!this.selectedImage) return;
    const img = this.selectedImage;
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

  // Custom premium notification helper methods
  showNotification(type: 'success' | 'warning' | 'error', message: string, title: string = 'Thông báo') {
    this.notification = {
      show: true,
      type,
      title,
      message
    };
  }

  closeNotification() {
    this.notification.show = false;
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
      preNode.style.borderLeft = '4px solid var(--primary-color)';

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
      this.formatDoc('insertHTML', '<pre style="background:#f5f5f5;padding:10px;border-radius:4px;font-family:Courier New;margin:10px 0;border-left:4px solid var(--primary-color)"><code>Nhập mã nguồn tại đây...</code></pre>');
    }
  }

  // Save changes - gọi API backend
  savePolicy() {
    if (this.editorElement) {
      this.formModel.content = this.editorElement.nativeElement.innerHTML;
    }

    if (!this.formModel.title.trim()) {
      this.showNotification('warning', 'Vui lòng nhập tên chính sách!', 'Cảnh báo');
      return;
    }

    const isDuplicateTitle = this.policies.some(p => 
      p.title.trim().toLowerCase() === this.formModel.title.trim().toLowerCase() && 
      p.id !== this.formModel.id
    );
    if (isDuplicateTitle) {
      this.showNotification('warning', 'Tiêu đề chính sách bị trùng, vui lòng kiểm tra lại nội dung!', 'Cảnh báo');
      return;
    }

    if (!this.formModel.effectiveDate) {
      this.showNotification('warning', 'Ngày áp dụng không hợp lệ!', 'Cảnh báo');
      return;
    }

    if (this.formModel.type === 'cancellation' && this.formModel.milestones.length === 0) {
      this.showNotification('warning', 'Vui lòng thêm ít nhất một mốc thời gian hủy vé!', 'Cảnh báo');
      return;
    }

    if (this.formModel.type === 'cancellation') {
      for (const ms of this.formModel.milestones) {
        if (ms.hoursBeforeDeparture <= 0) {
          this.showNotification('warning', 'Trước giờ khởi hành phải lớn hơn 0 Giờ!', 'Cảnh báo');
          return;
        }
        if (ms.refundPercentage < 0 || ms.refundPercentage > 100) {
          this.showNotification('warning', 'Phí hủy phải nằm trong khoảng 0% - 100%!', 'Cảnh báo');
          return;
        }
      }
    }

    this.isLoading = true;

    if (this.formModel.type === 'cancellation') {
      // Xử lý bảng CHINH_SACH_HUY_VE
      const ms = this.formModel.milestones[0]; // Mỗi bản ghi HuyVe là 1 mốc
      if (this.isEditing && this.selectedPolicy) {
        this.chinhSachService.updateChinhSachHuyVe(this.formModel.id, {
          TenChinhSach: this.formModel.title,
          GioiHanGioTruocKhoiHanh: ms?.hoursBeforeDeparture ?? 0,
          TyLePhiHuy: (ms?.refundPercentage ?? 0) / 100,
          MoTa: this.formModel.content,
          TrangThai: this.formModel.status,
          NgayApDung: this.formModel.effectiveDate,
        }).subscribe({
          next: () => { 
            this.isLoading = false; 
            this.loadPolicies(); 
            this.closeModal(); 
            this.showNotification('success', 'Đã cập nhật chính sách hủy vé thành công!', 'Thành công');
            this.cdr.detectChanges();
          },
          error: (err) => { 
            console.error(err); 
            this.isLoading = false; 
            this.showNotification('error', 'Lỗi cập nhật chính sách hủy vé!', 'Lỗi');
            this.cdr.detectChanges();
          }
        });
      } else {
        this.chinhSachService.createChinhSachHuyVe({
          MaChinhSach: this.formModel.id,
          TenChinhSach: this.formModel.title,
          GioiHanGioTruocKhoiHanh: ms?.hoursBeforeDeparture ?? 0,
          TyLePhiHuy: (ms?.refundPercentage ?? 0) / 100,
          MoTa: this.formModel.content,
          TrangThai: this.formModel.status,
          NgayApDung: this.formModel.effectiveDate,
        }).subscribe({
          next: () => { 
            this.isLoading = false; 
            this.loadPolicies(); 
            this.closeModal(); 
            this.showNotification('success', 'Đã thêm chính sách hủy vé thành công!', 'Thành công');
            this.cdr.detectChanges();
          },
          error: (err) => { 
            console.error(err); 
            this.isLoading = false; 
            this.showNotification('error', 'Lỗi thêm chính sách hủy vé!', 'Lỗi');
            this.cdr.detectChanges();
          }
        });
      }
    } else {
      // Xử lý bảng CHINH_SACH
      const typeLabel =
        this.formModel.type === 'insurance' ? 'Chính sách bảo hiểm' :
        this.formModel.type === 'payment' ? 'Chính sách thanh toán' : 'Chính sách khác';
      if (this.isEditing && this.selectedPolicy) {
        this.chinhSachService.updateChinhSach(this.formModel.id, {
          TieuDe: this.formModel.title,
          LoaiChinhSach: typeLabel,
          NoiDung: this.formModel.content,
          NgayApDung: this.formModel.effectiveDate,
          TrangThai: this.formModel.status,
        }).subscribe({
          next: () => { 
            this.isLoading = false; 
            this.loadPolicies(); 
            this.closeModal(); 
            this.showNotification('success', 'Đã cập nhật chính sách thành công!', 'Thành công');
            this.cdr.detectChanges();
          },
          error: (err) => { 
            console.error(err); 
            this.isLoading = false; 
            this.showNotification('error', 'Lỗi cập nhật chính sách!', 'Lỗi');
            this.cdr.detectChanges();
          }
        });
      } else {
        this.chinhSachService.createChinhSach({
          MaChinhSach_ND: this.formModel.id,
          TieuDe: this.formModel.title,
          LoaiChinhSach: typeLabel,
          NoiDung: this.formModel.content,
          NgayApDung: this.formModel.effectiveDate,
          TrangThai: this.formModel.status,
          MaQuanTriVien: 'QTV001', // TODO: lấy từ auth service
        }).subscribe({
          next: () => { 
            this.isLoading = false; 
            this.loadPolicies(); 
            this.closeModal(); 
            this.showNotification('success', 'Đã thêm chính sách thành công!', 'Thành công');
            this.cdr.detectChanges();
          },
          error: (err) => { 
            console.error(err); 
            this.isLoading = false; 
            this.showNotification('error', 'Lỗi thêm chính sách!', 'Lỗi');
            this.cdr.detectChanges();
          }
        });
      }
    }
  }
}
