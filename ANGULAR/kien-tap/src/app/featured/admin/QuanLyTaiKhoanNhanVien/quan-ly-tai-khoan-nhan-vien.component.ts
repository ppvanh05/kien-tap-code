import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface NhanVien {
  id: string; // MaNhanVien
  loaiTaiKhoan: 'BanVe' | 'DieuPhoi' | 'BanQuanLy' | 'QuanTriVien';
  tenTruyCap: string;
  matKhau: string;
  hoVaTenDem: string;
  ten: string;
  tenHienThi: string;
  gioiTinh: 'Nam' | 'Nữ' | 'Khác';
  ngaySinh: string;
  diaChi: string;
  soDienThoai: string;
  dienThoaiCoDinh?: string;
  email: string;
  maVanPhong: string;
  anhDaiDien: string;
  ghiChu: string;
  trangThai: 'HoatDong' | 'VoHieuHoa';
  vaiTro: string;
  permissions: string[]; // dynamic list of permission keys (RBAC)
}

export interface PermissionItem {
  key: string;
  name: string;
  description: string;
}

export interface PermissionModule {
  moduleKey: string;
  moduleName: string;
  moduleIcon: string;
  permissions: PermissionItem[];
  isOpen: boolean; // accordion collapse/expand state
}

export interface RoleTemplate {
  key: string;
  name: string;
  icon: string;
  description: string;
  permissions: string[];
}

@Component({
  selector: 'app-quan-ly-tai-khoan-nhan-vien',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quan-ly-tai-khoan-nhan-vien.component.html',
  styleUrls: ['./quan-ly-tai-khoan-nhan-vien.component.css']
})
export class QuanLyTaiKhoanNhanVienComponent implements OnInit {
  // Tabs: 'all' | 'active' | 'locked'
  activeTab: 'all' | 'active' | 'locked' = 'all';

  // Modal Step-by-Step active tab: 'basic' | 'permission' | 'contact'
  modalTab: 'basic' | 'permission' | 'contact' = 'basic';

  // Search and Filter variables
  searchQuery: string = '';
  filterRole: string = 'Tất cả chức vụ';
  
  // Permission search query getter/setter
  private _permissionSearchQuery: string = '';
  get permissionSearchQuery(): string {
    return this._permissionSearchQuery;
  }
  set permissionSearchQuery(value: string) {
    this._permissionSearchQuery = value;
    if (value.trim()) {
      const query = value.toLowerCase().trim();
      this.permissionModules.forEach(module => {
        const hasMatch = module.permissions.some(p => 
          p.name.toLowerCase().includes(query) ||
          p.key.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        );
        if (hasMatch) {
          module.isOpen = true; // Auto open accordion if search matches
        }
      });
    }
  }
  
  permissionModules: PermissionModule[] = [
    {
      moduleKey: 'news_policy',
      moduleName: 'Quản lý Tin tức & Chính sách',
      moduleIcon: 'edit_note',
      isOpen: true,
      permissions: [
        { key: 'news.view', name: 'Xem tin tức', description: 'Cho phép xem danh sách và chi tiết các bài đăng tin tức, khuyến mãi.' },
        { key: 'news.create', name: 'Tạo tin tức', description: 'Cho phép soạn thảo và đăng bài viết tin tức mới lên website.' },
        { key: 'news.update', name: 'Sửa tin tức', description: 'Cho phép chỉnh sửa thông tin, ảnh bìa và nội dung bài đăng hiện có.' },
        { key: 'news.delete', name: 'Xóa tin tức', description: 'Cho phép ẩn hoặc xóa mềm các bài đăng khỏi trang tin tức.' },
        { key: 'policy.view', name: 'Xem điều khoản & chính sách', description: 'Xem chi tiết các điều khoản dịch vụ, quy định vận chuyển.' },
        { key: 'policy.update', name: 'Cập nhật chính sách', description: 'Chỉnh sửa nội dung chính sách, quy chế và quy định hủy vé qua Rich Editor.' }
      ]
    },
    {
      moduleKey: 'ticket',
      moduleName: 'Bán vé & Dịch vụ khách hàng',
      moduleIcon: 'confirmation_number',
      isOpen: false,
      permissions: [
        { key: 'ticket.view', name: 'Tra cứu thông tin vé', description: 'Tìm kiếm, kiểm tra trạng thái vé và lịch sử vé của khách hàng.' },
        { key: 'ticket.sell', name: 'Đặt vé & Bán vé tại quầy', description: 'Tạm giữ ghế, nhập thông tin khách và thực hiện bán vé tại quầy hoặc hotline.' },
        { key: 'ticket.cancel', name: 'Hủy vé & Đề xuất hoàn tiền', description: 'Hủy vé chờ khởi hành của khách, giải phóng ghế và gửi lệnh hoàn tiền tự động.' },
        { key: 'ticket.update', name: 'Chỉnh sửa thông tin vé', description: 'Cập nhật họ tên, SĐT, Email, điểm đón/trả của vé (tối đa 2 lần).' }
      ]
    },
    {
      moduleKey: 'dispatch',
      moduleName: 'Điều phối Vận hành & Lộ trình',
      moduleIcon: 'engineering',
      isOpen: false,
      permissions: [
        { key: 'route.view', name: 'Xem tuyến xe & điểm dừng', description: 'Tra cứu danh sách bến bãi, văn phòng và các tuyến đường cố định.' },
        { key: 'route.manage', name: 'Quản lý tuyến & điểm đón/trả', description: 'Thêm mới, sửa thông tin, tọa độ Google Map bến xe, văn phòng và điểm trung chuyển.' },
        { key: 'vehicle.manage', name: 'Quản lý phương tiện & sơ đồ ghế', description: 'Thêm mới xe, cập nhật tiện ích, hạn đăng kiểm bảo hiểm và cấu hình sơ đồ ghế.' },
        { key: 'driver.manage', name: 'Quản lý tài xế & phụ xe', description: 'Theo dõi hồ sơ bằng lái, cảnh báo hết hạn và danh sách tài/phụ xe.' },
        { key: 'trip.create', name: 'Tạo chuyến xe & lịch trình', description: 'Thiết lập ngày chạy, giờ khởi hành, giá vé cơ bản của các chuyến xe.' },
        { key: 'trip.assign', name: 'Phân công xe & tài xế chạy', description: 'Gán phương tiện vật lý, tài xế chính, tài phụ và phụ xe cho từng chuyến đi.' },
        { key: 'trip.update', name: 'Cập nhật chuyến xe & trạng thái', description: 'Thay đổi trạng thái chuyến (Còn chỗ, Hết chỗ, Đang chạy, Hủy) và cập nhật thời gian trạm dừng.' }
      ]
    },
    {
      moduleKey: 'customer_review',
      moduleName: 'Khách hàng & Phản hồi đánh giá',
      moduleIcon: 'people',
      isOpen: false,
      permissions: [
        { key: 'customer.view', name: 'Xem thông tin khách hàng', description: 'Tra cứu thông tin tài khoản thành viên, lịch sử đi chuyến của khách hàng.' },
        { key: 'review.view', name: 'Xem đánh giá & xếp hạng', description: 'Xem danh sách sao, ý kiến phản hồi của khách hàng sau khi hoàn thành chuyến đi.' },
        { key: 'review.reply', name: 'Phản hồi đánh giá', description: 'Viết nội dung phản hồi chính thức của nhà xe đối với đánh giá của khách hàng.' },
        { key: 'review.moderate', name: 'Kiểm duyệt đánh giá & từ khóa cấm', description: 'Ẩn đánh giá vi phạm, xử lý báo cáo đánh giá và quản lý danh sách từ khóa cấm.' }
      ]
    },
    {
      moduleKey: 'accounting',
      moduleName: 'Kế toán & Tài chính',
      moduleIcon: 'payments',
      isOpen: false,
      permissions: [
        { key: 'finance.view', name: 'Xem doanh thu & giao dịch', description: 'Theo dõi log giao dịch thanh toán, hoàn tiền và đối soát doanh thu vé.' },
        { key: 'finance.cost', name: 'Quản lý chi phí chuyến xe', description: 'Cập nhật các khoản chi thực tế phát sinh (xăng dầu, cầu đường, rửa xe, bến bãi) theo chuyến.' },
        { key: 'report.export', name: 'Xuất báo cáo thống kê', description: 'Truy xuất và tải biểu đồ doanh số, lượng khách dưới dạng Excel/PDF.' }
      ]
    },
    {
      moduleKey: 'system_admin',
      moduleName: 'Quản trị Hệ thống & Nhân sự',
      moduleIcon: 'admin_panel_settings',
      isOpen: false,
      permissions: [
        { key: 'employee.view', name: 'Xem tài khoản nhân viên', description: 'Xem danh sách thông tin hồ sơ và phòng làm việc của nhân viên nội bộ.' },
        { key: 'employee.manage', name: 'Quản lý tài khoản nhân sự', description: 'Tạo tài khoản mới, cập nhật hồ sơ, thay đổi trạng thái khóa/mở khóa tài khoản.' },
        { key: 'role.manage', name: 'Thiết lập vai trò & phân quyền', description: 'Chỉnh sửa, cập nhật mẫu phân quyền RBAC và phân quyền trực tiếp cho tài khoản.' },
        { key: 'system.log', name: 'Xem nhật ký hệ thống', description: 'Truy vết toàn bộ thao tác, địa chỉ IP của người dùng và nhân viên trên hệ thống.' }
      ]
    }
  ];

  allPermissionKeys: string[] = [];

  roleTemplates: RoleTemplate[] = [
    {
      key: 'admin',
      name: 'Quản trị viên',
      icon: 'admin_panel_settings',
      description: 'Quản trị tài khoản nhân sự nội bộ, phân quyền, xem nhật ký hệ thống, quản lý và phản hồi đánh giá.',
      permissions: ['employee.view', 'employee.manage', 'role.manage', 'system.log', 'review.moderate', 'review.view', 'review.reply']
    },
    {
      key: 'management',
      name: 'Ban Quản lý',
      icon: 'insights',
      description: 'Theo dõi doanh thu giao dịch và xuất báo cáo thống kê hoạt động của nhà xe.',
      permissions: ['finance.view', 'report.export']
    },
    {
      key: 'dispatch',
      name: 'Nhân viên Điều phối',
      icon: 'engineering',
      description: 'Quản lý tuyến đường, điểm dừng, phương tiện, tài xế và trực tiếp gán lịch trình, phân ca chạy chuyến.',
      permissions: ['route.view', 'route.manage', 'vehicle.manage', 'driver.manage', 'trip.create', 'trip.assign', 'trip.update']
    },
    {
      key: 'cskh',
      name: 'Nhân viên bán vé',
      icon: 'confirmation_number',
      description: 'Tư vấn, đặt giữ ghế hotline, bán vé trực tiếp, hỗ trợ đổi trả vé và tra cứu thông tin khách hàng.',
      permissions: ['ticket.view', 'ticket.sell', 'ticket.cancel', 'ticket.update', 'customer.view']
    }
  ];

  // List of accounts (all mapped strictly as bus company employees of TXP BUS)
  employees: NhanVien[] = [
    {
      id: 'CL364',
      loaiTaiKhoan: 'BanQuanLy',
      tenTruyCap: 'dailyminhtam',
      matKhau: 'MinhTam@123',
      hoVaTenDem: 'Nguyễn Minh',
      ten: 'Tâm',
      tenHienThi: 'Minh Tâm BOSS',
      gioiTinh: 'Nam',
      ngaySinh: '1985-05-12',
      diaChi: '32 Cầu Giấy, Hà Nội',
      soDienThoai: '0912345678',
      email: 'minhtam.boss@gmail.com',
      maVanPhong: 'Văn Phòng Bến xe Gia Lâm',
      anhDaiDien: '',
      ghiChu: 'Theo dõi và quản trị kinh doanh chung của văn phòng.',
      trangThai: 'HoatDong',
      vaiTro: 'Ban quản lý',
      permissions: [
        'finance.view', 'report.export'
      ]
    },
    {
      id: 'CL363',
      loaiTaiKhoan: 'BanVe',
      tenTruyCap: 'nhanvienanhhuydatcang1',
      matKhau: 'LinhL1@456',
      hoVaTenDem: 'Lý Long',
      ten: 'Linh',
      tenHienThi: 'Linhll1 NV',
      gioiTinh: 'Nam',
      ngaySinh: '1990-09-20',
      diaChi: '102 Mỹ Đình, Nam Từ Liêm, Hà Nội',
      soDienThoai: '0987654321',
      email: 'lylonglinh.nv@txpbus.vn',
      maVanPhong: 'Văn Phòng 30 Mỹ Đình',
      anhDaiDien: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      ghiChu: 'Nhân viên bán vé chuyên nghiệp, xuất sắc ca chiều.',
      trangThai: 'HoatDong',
      vaiTro: 'Nhân viên bán vé',
      permissions: [
        'ticket.view', 'ticket.sell', 'ticket.cancel', 'ticket.update', 'customer.view'
      ]
    },
    {
      id: 'CL330',
      loaiTaiKhoan: 'QuanTriVien',
      tenTruyCap: 'cuongkaratekit',
      matKhau: 'HuyCuong@789',
      hoVaTenDem: 'Trần Anh',
      ten: 'Huy',
      tenHienThi: 'Anh Huy BOSS',
      gioiTinh: 'Nam',
      ngaySinh: '1982-11-30',
      diaChi: 'Bến xe Gia Lâm, Long Biên, Hà Nội',
      soDienThoai: '0944445555',
      email: 'anhhuy.boss@txpbus.vn',
      maVanPhong: 'Văn Phòng 30 Mỹ Đình',
      anhDaiDien: '',
      ghiChu: 'Quản trị viên hệ thống cấp cao, phụ trách hạ tầng kỹ thuật.',
      trangThai: 'HoatDong',
      vaiTro: 'Quản trị viên',
      permissions: [
        'news.view', 'news.create', 'news.update', 'news.delete', 'policy.view', 'policy.update',
        'ticket.view', 'ticket.sell', 'ticket.cancel', 'ticket.update',
        'route.view', 'route.manage', 'vehicle.manage', 'driver.manage', 'trip.create', 'trip.assign', 'trip.update',
        'customer.view', 'review.view', 'review.reply', 'review.moderate',
        'finance.view', 'finance.cost', 'report.export',
        'employee.view', 'employee.manage', 'role.manage', 'system.log'
      ]
    }
  ];

  filteredEmployees: NhanVien[] = [];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Modal display variables
  showModal: boolean = false;
  isEditMode: boolean = false;

  // Selected Office option lists
  offices: string[] = [
    'Văn Phòng 30 Mỹ Đình',
    'Văn Phòng Bến xe Gia Lâm',
    'Văn Phòng Bến xe Niệm Nghĩa',
    'Văn Phòng Trung tâm Điều hành TXP'
  ];

  // Form model
  formModel: NhanVien = this.createEmptyForm();
  confirmPassword: string = '';

  // Password visibility
  showPasswordText: boolean = false;
  showConfirmPasswordText: boolean = false;

  // Premium popup notification state
  notification = {
    show: false,
    type: 'success' as 'success' | 'warning' | 'error',
    message: '',
    title: ''
  };

  ngOnInit() {
    // Populate allPermissionKeys from static modules
    this.allPermissionKeys = [];
    this.permissionModules.forEach(module => {
      module.permissions.forEach(p => {
        this.allPermissionKeys.push(p.key);
      });
    });

    this.filterEmployees();
  }

  createEmptyForm(): NhanVien {
    return {
      id: '',
      loaiTaiKhoan: 'BanVe',
      tenTruyCap: '',
      matKhau: '',
      hoVaTenDem: '',
      ten: '',
      tenHienThi: '',
      gioiTinh: 'Nam',
      ngaySinh: '',
      diaChi: '',
      soDienThoai: '',
      dienThoaiCoDinh: '',
      email: '',
      maVanPhong: 'Văn Phòng 30 Mỹ Đình',
      anhDaiDien: '',
      ghiChu: '',
      trangThai: 'HoatDong',
      vaiTro: 'Nhân viên bán vé',
      permissions: []
    };
  }

  // Filter & Search Logic
  filterEmployees() {
    let result = [...this.employees];

    // Filter by tab
    if (this.activeTab === 'active') {
      result = result.filter(e => e.trangThai === 'HoatDong');
    } else if (this.activeTab === 'locked') {
      result = result.filter(e => e.trangThai === 'VoHieuHoa');
    }

    // Filter by Role/Chức vụ
    if (this.filterRole !== 'Tất cả chức vụ') {
      result = result.filter(e => e.loaiTaiKhoan === this.filterRole);
    }

    // Filter by Search Query (ID, Tên truy cập, Tên hiển thị)
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(e => 
        e.id.toLowerCase().includes(query) ||
        e.tenTruyCap.toLowerCase().includes(query) ||
        e.tenHienThi.toLowerCase().includes(query) ||
        e.hoVaTenDem.toLowerCase().includes(query) ||
        e.ten.toLowerCase().includes(query)
      );
    }

    this.filteredEmployees = result;
    this.totalPages = Math.ceil(this.filteredEmployees.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  setTab(tab: 'all' | 'active' | 'locked') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.filterEmployees();
  }

  setFilterRole(event: any) {
    this.filterRole = event.target.value;
    this.currentPage = 1;
    this.filterEmployees();
  }

  search() {
    this.currentPage = 1;
    this.filterEmployees();
  }

  // Pagination helpers
  getPagedEmployees(): NhanVien[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredEmployees.slice(startIndex, startIndex + this.pageSize);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Handle changing page size from the dropdown selector
  changePageSize(event: any) {
    if (event && event.target) {
      this.pageSize = Number(event.target.value);
      this.currentPage = 1;
      this.filterEmployees();
    }
  }

  // CRUD Actions
  openAddModal() {
    this.isEditMode = false;
    this.formModel = this.createEmptyForm();
    // Auto-generate ID CLxxx
    const maxIdNumber = Math.max(...this.employees.map(e => parseInt(e.id.replace(/[^\d]/g, '')) || 300));
    this.formModel.id = 'CL' + (maxIdNumber + 1);
    this.confirmPassword = '';
    this.modalTab = 'basic';
    this.showPasswordText = false;
    this.showConfirmPasswordText = false;
    this.showModal = true;
  }

  openEditModal(employee: NhanVien) {
    this.isEditMode = true;
    this.formModel = { 
      ...employee,
      permissions: [...employee.permissions]
    };
    this.confirmPassword = employee.matKhau;
    this.modalTab = 'basic';
    this.showPasswordText = false;
    this.showConfirmPasswordText = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  // ALLOW NAVIGATION FREELY - NO BLOCKS IN setModalTab!
  setModalTab(tab: 'basic' | 'permission' | 'contact') {
    this.modalTab = tab;
  }

  // Stable visibility check helper for permissions (highly optimized to prevent DOM churn)
  isPermissionVisible(perm: PermissionItem): boolean {
    if (!this.permissionSearchQuery.trim()) return true;
    const query = this.permissionSearchQuery.toLowerCase().trim();
    return perm.name.toLowerCase().includes(query) ||
           perm.key.toLowerCase().includes(query) ||
           perm.description.toLowerCase().includes(query);
  }

  // Stable visibility check helper for module cards (highly optimized to prevent DOM churn)
  isModuleVisible(module: PermissionModule): boolean {
    if (!this.permissionSearchQuery.trim()) return true;
    return module.permissions.some(p => this.isPermissionVisible(p));
  }

  // Check if all permissions in a module are selected
  isModuleAllSelected(module: PermissionModule): boolean {
    if (module.permissions.length === 0) return false;
    return module.permissions.every(p => this.formModel.permissions.includes(p.key));
  }

  // Toggle select-all for a specific module
  toggleModuleAll(module: PermissionModule, event: any) {
    const checked = event.target.checked;
    const currentKeys = [...this.formModel.permissions];
    const moduleKeys = module.permissions.map(p => p.key);

    if (checked) {
      moduleKeys.forEach(k => {
        if (!currentKeys.includes(k)) {
          currentKeys.push(k);
        }
      });
      this.formModel.permissions = currentKeys;
    } else {
      this.formModel.permissions = currentKeys.filter(k => !moduleKeys.includes(k));
    }
  }

  // Check if all permissions in the system are selected
  isAllPermissionsSelected(): boolean {
    if (this.allPermissionKeys.length === 0) return false;
    return this.allPermissionKeys.every(k => this.formModel.permissions.includes(k));
  }

  // Toggle select-all for the entire system
  toggleAllPermissions(event: any) {
    const checked = event.target.checked;
    if (checked) {
      this.formModel.permissions = [...this.allPermissionKeys];
    } else {
      this.formModel.permissions = [];
    }
  }

  // Helper check for specific permission checked state
  isPermissionChecked(key: string): boolean {
    return this.formModel.permissions.includes(key);
  }

  // Count active selected permissions in a specific module
  getModuleCheckedCount(module: PermissionModule): number {
    if (!module || !module.permissions) return 0;
    return module.permissions.filter(p => this.formModel.permissions.includes(p.key)).length;
  }

  // Toggle individual permission state
  togglePermission(key: string, event: any) {
    const checked = event.target.checked;
    const current = [...this.formModel.permissions];
    if (checked) {
      if (!current.includes(key)) {
        current.push(key);
      }
      this.formModel.permissions = current;
    } else {
      this.formModel.permissions = current.filter(k => k !== key);
    }
  }

  // Preset quick templates for permissions (Aligned with the 4 actual system roles)
  applyPermissionPreset(presetKey: string) {
    const template = this.roleTemplates.find(r => r.key === presetKey);
    if (template) {
      this.formModel.permissions = [...template.permissions];
      
      // Auto assign standard department and role name based on the key
      if (presetKey === 'admin') {
        this.formModel.loaiTaiKhoan = 'QuanTriVien';
        this.formModel.vaiTro = 'Quản trị viên';
      } else if (presetKey === 'management') {
        this.formModel.loaiTaiKhoan = 'BanQuanLy';
        this.formModel.vaiTro = 'Ban quản lý';
      } else if (presetKey === 'dispatch') {
        this.formModel.loaiTaiKhoan = 'DieuPhoi';
        this.formModel.vaiTro = 'Nhân viên điều phối';
      } else if (presetKey === 'cskh') {
        this.formModel.loaiTaiKhoan = 'BanVe';
        this.formModel.vaiTro = 'Nhân viên bán vé';
      }
      
      this.showNotification('success', `Đã áp dụng mẫu phân quyền cho <strong>${this.formModel.vaiTro}</strong>! Bạn có thể tùy chỉnh thêm các hộp kiểm bên dưới.`, 'Áp dụng thành công');
    }
  }

  // Auto-sync permissions when changing the default role dropdown in basic tab
  onLoaiTaiKhoanChange() {
    let presetKey = '';
    if (this.formModel.loaiTaiKhoan === 'QuanTriVien') {
      presetKey = 'admin';
    } else if (this.formModel.loaiTaiKhoan === 'BanQuanLy') {
      presetKey = 'management';
    } else if (this.formModel.loaiTaiKhoan === 'DieuPhoi') {
      presetKey = 'dispatch';
    } else if (this.formModel.loaiTaiKhoan === 'BanVe') {
      presetKey = 'cskh';
    }
    
    if (presetKey) {
      const template = this.roleTemplates.find(r => r.key === presetKey);
      if (template) {
        this.formModel.permissions = [...template.permissions];
        this.formModel.vaiTro = template.name;
        this.showNotification('success', `Đã đồng bộ nhóm quyền mặc định cho chức vụ <strong>${template.name}</strong>!`, 'Đồng bộ thành công');
      }
    }
  }

  // Handle image upload via standard FileReader
  triggerImageUpload(input: HTMLInputElement) {
    input.click();
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.showNotification('error', 'Ảnh đại diện không được vượt quá <strong>2MB</strong>!', 'Dung lượng ảnh quá lớn');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.formModel.anhDaiDien = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Soft delete / Status toggle
  toggleStatus() {
    if (this.formModel.trangThai === 'HoatDong') {
      this.formModel.trangThai = 'VoHieuHoa';
      this.showNotification('warning', 'Trạng thái tài khoản đã chuyển sang <strong>Vô hiệu hóa</strong>. Bấm lưu để áp dụng thay đổi.', 'Cảnh báo trạng thái');
    } else {
      this.formModel.trangThai = 'HoatDong';
      this.showNotification('success', 'Trạng thái tài khoản đã chuyển sang <strong>Đang hoạt động</strong>. Bấm lưu để áp dụng thay đổi.', 'Cập nhật trạng thái');
    }
  }

  // Role labeling helper (Cleaned up prefix as per request)
  getRoleLabel(emp: NhanVien): string {
    if (emp.loaiTaiKhoan === 'QuanTriVien') {
      return 'Quản trị viên';
    } else if (emp.loaiTaiKhoan === 'BanQuanLy') {
      return 'Ban quản lý';
    } else if (emp.loaiTaiKhoan === 'DieuPhoi') {
      return 'Nhân viên điều phối';
    } else {
      return 'Nhân viên bán vé';
    }
  }

  // Dynamic dynamic tag string (Simplified to remove Super Admin & English text)
  getDynamicRolesString(emp: NhanVien): string {
    if (!emp.permissions || emp.permissions.length === 0) {
      return 'Không phân quyền';
    }
    const count = emp.permissions.length;
    
    // Check if matches Toàn quyền
    if (count === this.allPermissionKeys.length) {
      return `Toàn quyền (${count} quyền)`;
    }

    // Identify matching preset templates
    const matches: string[] = [];
    this.roleTemplates.forEach(t => {
      const hasAll = t.permissions.every(p => emp.permissions.includes(p));
      if (hasAll && t.permissions.length > 0) {
        matches.push(t.name);
      }
    });

    if (matches.length > 0) {
      return `${matches.join(' + ')} (${count} quyền)`;
    }

    return `Tùy chỉnh (${count} quyền)`;
  }

  // Helper to look up Vietnamese friendly name of a permission key
  getPermissionName(key: string): string {
    for (const module of this.permissionModules) {
      const found = module.permissions.find(p => p.key === key);
      if (found) {
        return found.name;
      }
    }
    return key;
  }

  // Revoke a permission instantly from the active summary badges
  removePermissionKey(key: string) {
    this.formModel.permissions = this.formModel.permissions.filter(k => k !== key);
  }

  // Save Account
  saveAccount() {
    // Run all validations at click save
    if (!this.formModel.tenTruyCap.trim()) {
      this.setModalTab('basic');
      this.showNotification('error', 'Vui lòng nhập <strong>Tên truy cập</strong> bắt buộc!', 'Thiếu thông tin');
      return;
    }
    if (!this.isEditMode && !this.formModel.matKhau.trim()) {
      this.setModalTab('basic');
      this.showNotification('error', 'Vui lòng nhập <strong>Mật khẩu</strong> cho tài khoản mới!', 'Thiếu thông tin');
      return;
    }
    if (!this.isEditMode && this.formModel.matKhau !== this.confirmPassword) {
      this.setModalTab('basic');
      this.showNotification('error', '<strong>Mật khẩu xác nhận</strong> không khớp!', 'Thiếu thông tin');
      return;
    }
    if (!this.formModel.hoVaTenDem.trim() || !this.formModel.ten.trim()) {
      this.setModalTab('basic');
      this.showNotification('error', 'Vui lòng nhập đầy đủ <strong>Họ và tên</strong>!', 'Thiếu thông tin');
      return;
    }
    if (!this.formModel.soDienThoai.trim()) {
      this.setModalTab('contact');
      this.showNotification('error', 'Vui lòng nhập <strong>Số điện thoại</strong> liên hệ chính!', 'Thiếu thông tin');
      return;
    }
    if (!this.formModel.email.trim()) {
      this.setModalTab('contact');
      this.showNotification('error', 'Vui lòng nhập <strong>Địa chỉ Email</strong> liên hệ chính!', 'Thiếu thông tin');
      return;
    }

    // Set friendly vaiTro label based on current loaiTaiKhoan & custom permission status
    let baseRole = '';
    if (this.formModel.loaiTaiKhoan === 'QuanTriVien') {
      baseRole = 'Quản trị viên';
    } else if (this.formModel.loaiTaiKhoan === 'BanQuanLy') {
      baseRole = 'Ban quản lý';
    } else if (this.formModel.loaiTaiKhoan === 'DieuPhoi') {
      baseRole = 'Nhân viên điều phối';
    } else {
      baseRole = 'Nhân viên bán vé';
    }
    
    // Check if the current permissions list is custom or matches a template
    const matchedTemplate = this.roleTemplates.find(r => r.permissions.length > 0 && 
      r.permissions.length === this.formModel.permissions.length && 
      r.permissions.every(p => this.formModel.permissions.includes(p))
    );
    
    if (matchedTemplate) {
      this.formModel.vaiTro = matchedTemplate.name.split(' (')[0];
    } else {
      this.formModel.vaiTro = `${baseRole} (Tùy chỉnh)`;
    }

    if (this.isEditMode) {
      // Update existing account
      const index = this.employees.findIndex(e => e.id === this.formModel.id);
      if (index !== -1) {
        this.employees[index] = { 
          ...this.formModel,
          permissions: [...this.formModel.permissions]
        };
        this.showNotification('success', `Đã cập nhật tài khoản <strong>${this.formModel.tenHienThi}</strong> thành công!`, 'Cập nhật thành công');
      }
    } else {
      // Create new account
      this.employees.unshift({ 
        ...this.formModel,
        permissions: [...this.formModel.permissions]
      });
      this.showNotification('success', `Đã khởi tạo tài khoản <strong>${this.formModel.tenHienThi}</strong> thành công!`, 'Khởi tạo thành công');
    }

    this.filterEmployees();
    this.closeModal();
  }

  // Premium popup notification logic
  showNotification(type: 'success' | 'warning' | 'error', message: string, title: string) {
    this.notification.type = type;
    this.notification.message = message;
    this.notification.title = title;
    this.notification.show = true;
  }

  closeNotification() {
    this.notification.show = false;
  }
}
