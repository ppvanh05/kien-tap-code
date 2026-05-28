import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AdminAuthService, AdminUser } from '../../../core/services/admin-auth.service';

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  color: string;
  permission?: string;
}

interface StatCard {
  title: string;
  value: number | string;
  isCurrency?: boolean;
  trend: string;
  trendType: 'up' | 'down';
  icon: string;
  theme: string;
}

interface Booking {
  id: string;
  customer: string;
  route: string;
  seat: string;
  time: string;
  price: number;
  status: string;
}

interface PopularRoute {
  name: string;
  bookings: number;
  trend: string;
  trendType: 'up' | 'down';
}

interface AdminTask {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  permission: string;
}

@Component({
  selector: 'app-trang-chu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trang-chu.component.html',
  styleUrls: ['./trang-chu.component.css']
})
export class TrangChuComponent implements OnInit {
  private readonly apiBaseUrl = 'http://localhost:3000';

  currentUser: AdminUser | null = null;
  greeting = '';
  roleLabel = '';
  todayLabel = '';
  dashboardLoading = false;
  dashboardLoadError = '';

  quickActions: QuickAction[] = [];
  stats: StatCard[] = [];
  adminTasks: AdminTask[] = [];

  bookings: Booking[] = [];

  // Data for dispatch role
  popularRoutes: PopularRoute[] = [
    { name: 'BX Miền Đông → Hà Nội', bookings: 342, trend: '+12%', trendType: 'up' },
    { name: 'BX Miền Đông → Đà Nẵng', bookings: 289, trend: '+8%', trendType: 'up' },
    { name: 'BX Miền Đông → Vinh', bookings: 231, trend: '-5%', trendType: 'down' },
    { name: 'BX Miền Đông → Huế', bookings: 187, trend: '+15%', trendType: 'up' }
  ];

  constructor(
    private authService: AdminAuthService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.todayLabel = this.formatDateLabel(new Date());
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.setupDashboard(user);
      this.loadDashboardData();
    });

    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Chào buổi sáng';
    else if (hour < 18) this.greeting = 'Chào buổi chiều';
    else this.greeting = 'Chào buổi tối';
  }

  setupDashboard(user: AdminUser | null) {
    if (!user) return;

    const role = this.normalizeRole(user.LoaiTaiKhoan);
    const perms = user.Quyen || [];
    this.quickActions = [];
    this.stats = [];
    this.adminTasks = [];

    switch (role) {
      case 'NhanVienBanVe':
        this.roleLabel = 'Nhân viên bán vé';
        this.setupTicketSalesDashboard(perms);
        break;
      case 'NhanVienDieuPhoi':
        this.roleLabel = 'Nhân viên điều phối';
        this.setupDispatchDashboard(perms);
        break;
      case 'BanQuanLy':
        this.roleLabel = 'Ban quản lý';
        this.setupManagementDashboard(perms);
        break;
      case 'QuanTriVien':
        this.roleLabel = 'Quản trị viên';
        this.setupAdminDashboard(perms);
        break;
      default:
        this.roleLabel = 'Nhân viên';
        this.setupFallbackDashboard(perms);
    }
  }

  setupTicketSalesDashboard(perms: string[]) {
    this.quickActions = this.filterActions([
      { label: 'Đặt vé mới', icon: 'add_circle', route: '/admin/quan-ly-ve/dat-ve-moi', color: 'orange', permission: 'ticket.sell' },
      { label: 'Tra cứu vé', icon: 'search', route: '/admin/quan-ly-ve/danh-sach-ve', color: 'blue', permission: 'ticket.view' },
      { label: 'Khách hàng', icon: 'people', route: '/admin/quan-ly-khach-hang', color: 'purple', permission: 'customer.view' },
    ], perms);
    this.stats = [
      { title: 'Vé đang quản lý', value: '0', trend: 'Đang tải dữ liệu', trendType: 'up', icon: 'local_activity', theme: 'blue' },
      { title: 'Vé chờ thanh toán', value: '0', trend: 'Theo dữ liệu mới nhất', trendType: 'down', icon: 'pending_actions', theme: 'orange' },
      { title: 'Doanh thu đã thanh toán', value: 0, isCurrency: true, trend: 'Theo dữ liệu mới nhất', trendType: 'up', icon: 'payments', theme: 'teal' },
      { title: 'Vé đã hủy', value: '0', trend: 'Theo dữ liệu mới nhất', trendType: 'up', icon: 'cancel', theme: 'purple' },
    ];
  }

  setupDispatchDashboard(perms: string[]) {
    this.quickActions = this.filterActions([
      { label: 'Quản lý lịch trình', icon: 'calendar_month', route: '/admin/quan-ly-dieu-hanh/quan-ly-lich-trinh', color: 'blue', permission: 'trip.view' },
      { label: 'Quản lý tuyến xe', icon: 'route', route: '/admin/quan-ly-dieu-hanh/quan-ly-tuyen-xe', color: 'orange', permission: 'route.view' },
      { label: 'Quản lý phương tiện', icon: 'directions_bus', route: '/admin/quan-ly-dieu-hanh/quan-ly-phuong-tien', color: 'teal', permission: 'vehicle.view' },
      { label: 'Tài xế & phụ xe', icon: 'badge', route: '/admin/quan-ly-dieu-hanh/quan-ly-tai-xe-phu-xe', color: 'purple', permission: 'driver.view' },
    ], perms);
    this.stats = [
      { title: 'Chuyến hôm nay', value: '12', trend: '2 đang chạy', trendType: 'up', icon: 'departure_board', theme: 'blue' },
      { title: 'Phương tiện hoạt động', value: '28/32', trend: 'Tỉ lệ vận hành 87%', trendType: 'up', icon: 'directions_bus', theme: 'teal' },
      { title: 'Chuyến chờ khởi hành', value: '5', trend: '1 chuyến sắp xuất bến', trendType: 'up', icon: 'pending', theme: 'orange' },
      { title: 'Tuyến đang hoạt động', value: '8', trend: 'Đầy đủ tài xế', trendType: 'up', icon: 'route', theme: 'purple' },
    ];
  }

  setupManagementDashboard(perms: string[]) {
    this.quickActions = this.filterActions([
      { label: 'Xem doanh thu', icon: 'payments', route: '/admin/bao-cao/bao-cao-chi-tiet', color: 'orange', permission: 'report.view' },
      { label: 'Xuất báo cáo', icon: 'download', route: '/admin/bao-cao/bao-cao-tong-hop-theo-tuyen', color: 'blue', permission: 'report.export' },
    ], perms);
    this.stats = [
      { title: 'Doanh thu tháng này', value: 145000000, isCurrency: true, trend: '+8.2% so với tháng trước', trendType: 'up', icon: 'payments', theme: 'orange' },
      { title: 'Tổng vé trong tháng', value: '1,234', trend: '+12.5% so với tháng trước', trendType: 'up', icon: 'local_activity', theme: 'blue' },
      { title: 'Khách hàng mới', value: '342', trend: '-3.1% so với tháng trước', trendType: 'down', icon: 'person_add', theme: 'purple' },
      { title: 'Tỉ lệ hoàn/hủy', value: '2.1%', trend: '-0.4% so với tháng trước', trendType: 'up', icon: 'cancel', theme: 'teal' },
    ];
  }

  setupAdminDashboard(perms: string[]) {
    this.quickActions = this.filterActions([
      { label: 'Quản lý nhân viên', icon: 'manage_accounts', route: '/admin/quan-ly-nhan-vien', color: 'blue', permission: 'staff.view' },
      { label: 'Nhật ký hệ thống', icon: 'history_edu', route: '/admin/quan-ly-nhat-ky', color: 'orange', permission: 'log.view' },
      { label: 'Tin tức', icon: 'article', route: '/admin/quan-ly-tin-tuc', color: 'purple', permission: 'news.view' },
      { label: 'Từ khóa cấm', icon: 'block', route: '/admin/quan-ly-tu-khoa-cam', color: 'teal', permission: 'blacklist.view' },
    ], perms);
    this.stats = [
      { title: 'Tổng nhân viên', value: '4', trend: 'Tất cả đang hoạt động', trendType: 'up', icon: 'badge', theme: 'blue' },
      { title: 'Đánh giá chưa phản hồi', value: '12', trend: '+3 hôm nay', trendType: 'down', icon: 'star_outline', theme: 'orange' },
      { title: 'Thao tác hôm nay', value: '38', trend: 'Từ 4 người dùng', trendType: 'up', icon: 'history', theme: 'purple' },
      { title: 'Báo cáo vi phạm', value: '2', trend: 'Chờ xử lý', trendType: 'down', icon: 'report', theme: 'teal' },
    ];
    this.adminTasks = this.filterAdminTasks([
      { title: 'Tài khoản nhân viên', description: 'Tạo, khóa/mở khóa và phân quyền nhân sự nội bộ.', icon: 'manage_accounts', route: '/admin/quan-ly-nhan-vien', color: 'blue', permission: 'staff.view' },
      { title: 'Nhật ký hệ thống', description: 'Theo dõi thao tác đăng nhập, cập nhật dữ liệu và lỗi nghiệp vụ.', icon: 'history_edu', route: '/admin/quan-ly-nhat-ky', color: 'orange', permission: 'log.view' },
      { title: 'Tin tức & chính sách', description: 'Quản lý nội dung hiển thị cho khách hàng và quy định vận hành.', icon: 'article', route: '/admin/quan-ly-tin-tuc', color: 'purple', permission: 'news.view' },
      { title: 'Từ khóa cấm', description: 'Kiểm soát nội dung vi phạm trong đánh giá và phản hồi.', icon: 'block', route: '/admin/quan-ly-tu-khoa-cam', color: 'teal', permission: 'blacklist.view' },
    ], perms);
  }

  setupFallbackDashboard(perms: string[]) {
    this.quickActions = this.filterActions([
      { label: 'Tra cứu vé', icon: 'search', route: '/admin/quan-ly-ve/danh-sach-ve', color: 'blue', permission: 'ticket.view' },
      { label: 'Khách hàng', icon: 'people', route: '/admin/quan-ly-khach-hang', color: 'purple', permission: 'customer.view' },
      { label: 'Quản lý lịch trình', icon: 'calendar_month', route: '/admin/quan-ly-dieu-hanh/quan-ly-lich-trinh', color: 'orange', permission: 'trip.view' },
      { label: 'Báo cáo', icon: 'bar_chart', route: '/admin/bao-cao/bao-cao-chi-tiet', color: 'teal', permission: 'report.view' },
    ], perms);
    this.stats = [
      { title: 'Quyền khả dụng', value: perms.length, trend: 'Theo phân quyền tài khoản', trendType: 'up', icon: 'verified_user', theme: 'blue' },
      { title: 'Chức năng nhanh', value: this.quickActions.length, trend: 'Có thể truy cập ngay', trendType: 'up', icon: 'bolt', theme: 'orange' },
    ];
  }

  private loadDashboardData() {
    if (!isPlatformBrowser(this.platformId) || !this.currentUser) return;
    if (!this.showTicketSection || !this.hasPermission('ticket.view')) return;

    this.dashboardLoading = true;
    this.dashboardLoadError = '';

    // Load statistics card data quickly
    this.http.get<any>(`${this.apiBaseUrl}/quan-ly-ve/stats`).subscribe({
      next: stats => {
        if (stats) {
          this.stats = [
            { title: 'Vé đang quản lý', value: stats.total, trend: 'Tổng số vé trong hệ thống', trendType: 'up', icon: 'local_activity', theme: 'blue' },
            { title: 'Vé chờ thanh toán', value: stats.pendingCount, trend: stats.pendingCount > 0 ? 'Cần xử lý thanh toán' : 'Không có vé đang chờ', trendType: stats.pendingCount > 0 ? 'down' : 'up', icon: 'pending_actions', theme: 'orange' },
            { title: 'Doanh thu đã thanh toán', value: stats.revenue, isCurrency: true, trend: 'Doanh thu thực tế', trendType: 'up', icon: 'payments', theme: 'teal' },
            { title: 'Vé đã hủy', value: stats.canceledCount, trend: stats.canceledCount > 0 ? 'Có vé đã hủy' : 'Chưa có vé hủy', trendType: stats.canceledCount > 0 ? 'down' : 'up', icon: 'cancel', theme: 'purple' },
          ];
        }
      },
      error: error => {
        console.error('Không tải được thống kê dashboard:', error);
      }
    });

    // Load recent 20 tickets for list and route trends
    this.http.get<any[]>(`${this.apiBaseUrl}/quan-ly-ve/ve?limit=20`).subscribe({
      next: data => {
        const tickets = Array.isArray(data) ? data : [];
        this.bookings = tickets.slice(0, 5).map(ticket => this.mapTicketToBooking(ticket));
        this.popularRoutes = this.buildPopularRoutes(tickets);
        this.dashboardLoading = false;
      },
      error: error => {
        console.error('Không tải được dashboard vé:', error);
        this.bookings = [];
        this.dashboardLoadError = 'Không tải được dữ liệu vé từ backend.';
        this.dashboardLoading = false;
      },
    });
  }

  private mapTicketToBooking(ticket: any): Booking {
    const display = ticket.display || {};
    return {
      id: display.id || ticket.maVe || ticket.MaVe || '',
      customer: display.customer || ticket.tenKhachHang || 'Chưa rõ khách',
      route: display.route || ticket.tuyenXe || 'Chưa rõ tuyến',
      seat: display.seat || ticket.soGhe || '',
      time: display.time || ticket.gioDi || '',
      price: this.toNumber(ticket.giaVe ?? ticket.GiaVe),
      status: this.normalizeTicketStatus(display.paymentStatus || ticket.trangThaiThanhToan || display.ticketStatus || ticket.trangThaiVeText),
    };
  }

  private buildPopularRoutes(tickets: any[]): PopularRoute[] {
    const routeCounts = new Map<string, number>();
    tickets.forEach(ticket => {
      const route = ticket.display?.route || ticket.tuyenXe || ticket.TUYEN_XE?.TenTuyenXe || 'Chưa rõ tuyến';
      routeCounts.set(route, (routeCounts.get(route) || 0) + 1);
    });

    const total = Math.max(tickets.length, 1);
    return Array.from(routeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        bookings: count,
        trend: `${Math.round((count / total) * 100)}%`,
        trendType: 'up',
      }));
  }

  private applyTicketStats(tickets: any[]) {
    const pendingCount = tickets.filter(ticket => this.isPendingTicket(ticket)).length;
    const canceledCount = tickets.filter(ticket => this.isCanceledTicket(ticket)).length;
    const paidTickets = tickets.filter(ticket => this.isPaidTicket(ticket));
    const revenue = paidTickets.reduce((sum, ticket) => sum + this.toNumber(ticket.giaVe ?? ticket.GiaVe), 0);

    this.stats = [
      { title: 'Vé đang quản lý', value: tickets.length, trend: 'Tổng số vé trong hệ thống', trendType: 'up', icon: 'local_activity', theme: 'blue' },
      { title: 'Vé chờ thanh toán', value: pendingCount, trend: pendingCount > 0 ? 'Cần xử lý thanh toán' : 'Không có vé đang chờ', trendType: pendingCount > 0 ? 'down' : 'up', icon: 'pending_actions', theme: 'orange' },
      { title: 'Doanh thu đã thanh toán', value: revenue, isCurrency: true, trend: `${paidTickets.length} vé đã thanh toán`, trendType: 'up', icon: 'payments', theme: 'teal' },
      { title: 'Vé đã hủy', value: canceledCount, trend: canceledCount > 0 ? 'Có vé đã hủy' : 'Chưa có vé hủy', trendType: canceledCount > 0 ? 'down' : 'up', icon: 'cancel', theme: 'purple' },
    ];
  }

  private isPendingTicket(ticket: any): boolean {
    const status = `${ticket.display?.paymentStatus || ticket.trangThaiThanhToan || ticket.trangThaiVeText || ticket.TrangThaiVe || ''}`;
    return status.includes('Chờ thanh toán') || status === 'ChoThanhToan';
  }

  private isCanceledTicket(ticket: any): boolean {
    const status = `${ticket.display?.paymentStatus || ticket.trangThaiThanhToan || ticket.trangThaiVeText || ticket.TrangThaiVe || ''}`;
    return status.toLowerCase().includes('hủy') || status === 'DaHuy';
  }

  private isPaidTicket(ticket: any): boolean {
    const status = `${ticket.display?.paymentStatus || ticket.trangThaiThanhToan || ''}`;
    const payments = Array.isArray(ticket.THANH_TOAN) ? ticket.THANH_TOAN : [];
    return status.includes('Đã thanh toán') || payments.some((payment: any) =>
      payment.LoaiGiaoDich === 'ThanhToan' && payment.TrangThaiGiaoDich === 'ThanhCong',
    );
  }

  private normalizeTicketStatus(status?: string): string {
    if (!status) return 'Chưa xác định';
    if (status.includes('Chờ')) return 'Đang chờ';
    if (status.includes('hủy') || status.includes('Hủy')) return 'Đã hủy';
    if (status.includes('thanh toán') || status.includes('hoàn thành') || status.includes('khởi hành')) return 'Hoàn thành';
    return status;
  }

  private toNumber(value: any): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  get showTicketSection(): boolean {
    const role = this.normalizeRole(this.currentUser?.LoaiTaiKhoan);
    return role === 'NhanVienBanVe' || this.hasAnyPermission(['ticket.view', 'ticket.sell', 'ticket.cancel', 'ticket.update']);
  }

  get showRouteSection(): boolean {
    const role = this.normalizeRole(this.currentUser?.LoaiTaiKhoan);
    return role === 'NhanVienDieuPhoi' || this.hasAnyPermission(['route.view', 'trip.view', 'vehicle.view', 'driver.view', 'stop.view']);
  }

  get showFinanceSection(): boolean {
    const role = this.normalizeRole(this.currentUser?.LoaiTaiKhoan);
    return role === 'BanQuanLy' || this.hasAnyPermission(['finance.view', 'report.view']);
  }

  get showAdminSection(): boolean {
    const role = this.normalizeRole(this.currentUser?.LoaiTaiKhoan);
    return role === 'QuanTriVien' || this.hasAnyPermission(['staff.view', 'employee.view', 'role.manage', 'log.view', 'system.log']);
  }

  get showEmptyState(): boolean {
    return !this.showTicketSection && !this.showRouteSection && !this.showFinanceSection && !this.showAdminSection;
  }

  private normalizeRole(role?: string): string {
    if (role === 'BanVe') return 'NhanVienBanVe';
    if (role === 'DieuPhoi') return 'NhanVienDieuPhoi';
    return role || '';
  }

  private hasPermission(permission: string): boolean {
    return !!this.currentUser?.Quyen?.includes(permission);
  }

  private hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  private filterActions(actions: QuickAction[], perms: string[]): QuickAction[] {
    return actions.filter(action => !action.permission || perms.includes(action.permission));
  }

  private filterAdminTasks(tasks: AdminTask[], perms: string[]): AdminTask[] {
    return tasks.filter(task => perms.includes(task.permission));
  }

  private formatDateLabel(date: Date): string {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getSeatsList(seat: string): string[] {
    if (!seat) return [];
    return seat.split(',').map(s => s.trim());
  }

  getSeatColorClass(seat: string): string {
    if (!seat) return '';
    return seat.startsWith('A') ? 'seat-a' : 'seat-b';
  }

  getStatusClass(status: string): string {
    if (status === 'Đang chờ') return 'status-pending';
    if (status === 'Hoàn thành') return 'status-done';
    return '';
  }
}
