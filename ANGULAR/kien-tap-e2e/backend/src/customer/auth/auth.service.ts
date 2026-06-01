import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NhatKyHeThongService } from '../../admin/nhat-ky-he-thong/nhat-ky-he-thong.service';
import { JwtHelper } from './jwt.helper';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService,
  ) {}

  // Helper: Hashing function for OTP
  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  // Helper: Generate next sequential Customer ID (KHxxx)
  private async generateNextCustomerId(): Promise<string> {
    const list = await this.prisma.kHACH_HANG.findMany({
      select: { MaKhachHang: true },
    });

    let maxNum = 0;
    list.forEach(kh => {
      const match = kh.MaKhachHang.match(/KH(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    });

    return `KH${String(maxNum + 1).padStart(3, '0')}`;
  }

  // ===== SEND OTP =====
  async sendOtp(dto: { SoDienThoai: string; MucDich: string }) {
    const phone = dto.SoDienThoai.trim();
    
    // Validate target existence depending on purpose
    const existingUser = await this.prisma.kHACH_HANG.findFirst({
      where: { SoDienThoai: phone },
    });

    if (dto.MucDich === 'DangKy' && existingUser) {
      throw new BadRequestException('Số điện thoại này đã được sử dụng đăng ký trước đó!');
    }

    if (dto.MucDich === 'QuenMatKhau' && !existingUser) {
      throw new BadRequestException('Số điện thoại này chưa được đăng ký trong hệ thống!');
    }

    // Generate random 6 digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const hashed = this.hashOtp(code);
    const maOtp = await this.prisma.generateNextId('oTP_XAC_THUC', 'MaOTP', 'OTP', 6, 100001);

    // Store OTP in database
    await this.prisma.oTP_XAC_THUC.create({
      data: {
        MaOTP: maOtp,
        PhuongThucNhanOTP: 'SMS',
        SoDienThoai_Email: phone,
        MaOTPMaHoa: hashed,
        MucDich: dto.MucDich,
        ThoiGianTao: new Date(),
        ThoiGianHetHan: new Date(Date.now() + 180 * 1000), // 3 minutes expiration
        DaSuDung: false,
      },
    });

    // Output to server logs for developer testing
    console.log(`[OTP DEBUG] Phone: ${phone} | Purpose: ${dto.MucDich} | Code: ${code}`);

    return {
      success: true,
      message: 'Mã OTP đã được gửi thành công!',
      otp: code, // Return in response for simple testing in student environments
    };
  }

  // ===== VERIFY OTP =====
  async verifyOtp(dto: { SoDienThoai: string; otp: string; MucDich: string; markUsed?: boolean }) {
    const phone = dto.SoDienThoai.trim();
    const code = dto.otp.trim();
    const markUsed = dto.markUsed !== false;

    // Allow backdoor code '123456' for easier developer testing
    if (code === '123456') {
      return { success: true, message: 'Xác thực OTP thành công (Backdoor)' };
    }

    const hashed = this.hashOtp(code);
    const otpRecord = await this.prisma.oTP_XAC_THUC.findFirst({
      where: {
        SoDienThoai_Email: phone,
        MucDich: dto.MucDich,
        DaSuDung: false,
        ThoiGianHetHan: { gte: new Date() },
      },
      orderBy: { ThoiGianTao: 'desc' },
    });

    if (!otpRecord || otpRecord.MaOTPMaHoa !== hashed) {
      throw new BadRequestException('Mã OTP không chính xác hoặc đã hết hạn!');
    }

    if (markUsed) {
      // Mark as used
      await this.prisma.oTP_XAC_THUC.update({
        where: { MaOTP: otpRecord.MaOTP },
        data: { DaSuDung: true },
      });
    }

    return {
      success: true,
      message: 'Xác thực OTP thành công!',
    };
  }

  async checkPhoneExists(phone: string): Promise<boolean> {
    const existing = await this.prisma.kHACH_HANG.findFirst({
      where: { SoDienThoai: phone.trim() },
    });
    return !!existing;
  }

  // ===== REGISTER =====
  async register(dto: {
    HoTenKhachHang: string;
    SoDienThoai: string;
    Email?: string;
    MatKhau: string;
    GioiTinh?: string;
    NgaySinh?: string;
    otp?: string;
  }) {
    const phone = dto.SoDienThoai.trim();

    // Check unique phone
    const existingPhone = await this.prisma.kHACH_HANG.findFirst({
      where: { SoDienThoai: phone },
    });
    if (existingPhone) {
      throw new BadRequestException('Số điện thoại này đã được đăng ký trước đó!');
    }

    // Check unique email if provided
    if (dto.Email && dto.Email.trim() !== '') {
      const existingEmail = await this.prisma.kHACH_HANG.findFirst({
        where: { Email: dto.Email.trim() },
      });
      if (existingEmail) {
        throw new BadRequestException('Email này đã được đăng ký trước đó!');
      }
    }

    // Verify OTP if provided in register payload
    if (dto.otp) {
      await this.verifyOtp({ SoDienThoai: phone, otp: dto.otp, MucDich: 'DangKy' });
    }

    const maKhachHang = await this.generateNextCustomerId();
    const gioiTinhVal = dto.GioiTinh === 'Nữ' || dto.GioiTinh === 'Nu' ? 'Nu' : 'Nam';
    const hashedPassword = await bcrypt.hash(dto.MatKhau, 10);

    const customer = await this.prisma.kHACH_HANG.create({
      data: {
        MaKhachHang: maKhachHang,
        HoTenKhachHang: dto.HoTenKhachHang,
        SoDienThoai: phone,
        Email: dto.Email ? dto.Email.trim() : null,
        MatKhau: hashedPassword, // Store hashed password
        AnhDaiDien: null,
        GioiTinh: gioiTinhVal,
        NgaySinh: dto.NgaySinh ? new Date(dto.NgaySinh) : null,
        TrangThaiTaiKhoan: 'HoatDong',
        NgayDangKy: new Date(),
      },
    });

    // Record system log
    await this.nhatKyService.ghiLog({
      MaKhachHang: customer.MaKhachHang,
      LoaiThaoTac: 'Đăng ký',
      NoiDungChiTiet: `Đăng ký tài khoản khách hàng mới thành công: ${customer.HoTenKhachHang} (${customer.SoDienThoai})`,
      TrangThai: 'Thành công',
    });

    const { MatKhau, ...result } = customer;
    return result;
  }

  // ===== LOGIN =====
  async login(dto: { phoneOrEmail: string; MatKhau: string }) {
    const target = dto.phoneOrEmail.trim();

    const customer = await this.prisma.kHACH_HANG.findFirst({
      where: {
        OR: [
          { SoDienThoai: target },
          { Email: target },
        ],
      },
    });

    if (!customer) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác!');
    }

    if (customer.TrangThaiTaiKhoan === 'DaKhoa') {
      throw new UnauthorizedException(`Tài khoản của bạn đã bị khóa! Lý do: ${customer.LyDoKhoa || 'Chưa cập nhật'}`);
    }

    // Compare plain passwords matching admin design
    // For existing plain text passwords, compare directly.
    // For new hashed passwords, use bcrypt.
    const isPasswordValid = await bcrypt.compare(dto.MatKhau, customer.MatKhau);
    if (!isPasswordValid && customer.MatKhau !== dto.MatKhau) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác!');
    }

    // Generate custom JWT token
    const token = JwtHelper.sign({
      maKhachHang: customer.MaKhachHang,
      soDienThoai: customer.SoDienThoai,
      hoTenKhachHang: customer.HoTenKhachHang,
    });

    // Record system log
    await this.nhatKyService.ghiLog({
      MaKhachHang: customer.MaKhachHang,
      LoaiThaoTac: 'Đăng nhập',
      NoiDungChiTiet: `Khách hàng đăng nhập thành công vào hệ thống.`,
      TrangThai: 'Thành công',
    });

    const { MatKhau, ...customerData } = customer;
    return {
      token,
      customer: {
        ...customerData,
        GioiTinh: customerData.GioiTinh === 'Nu' ? 'Nữ' : customerData.GioiTinh,
      },
    };
  }

  // ===== FORGOT PASSWORD =====
  async forgotPassword(dto: { SoDienThoai: string }) {
    return this.sendOtp({ SoDienThoai: dto.SoDienThoai, MucDich: 'QuenMatKhau' });
  }

  // ===== RESET PASSWORD =====
  async resetPassword(dto: { SoDienThoai: string; otp: string; MatKhauMoi: string }) {
    const phone = dto.SoDienThoai.trim();
    
    // Verify OTP first
    await this.verifyOtp({ SoDienThoai: phone, otp: dto.otp, MucDich: 'QuenMatKhau' });

    const customer = await this.prisma.kHACH_HANG.findFirst({
      where: { SoDienThoai: phone },
    });

    if (!customer) {
      throw new NotFoundException('Không tìm thấy tài khoản với số điện thoại này!');
    }

    // Reset password
    const hashedPassword = await bcrypt.hash(dto.MatKhauMoi, 10);
    await this.prisma.kHACH_HANG.update({
      where: { MaKhachHang: customer.MaKhachHang },
      data: { MatKhau: hashedPassword },
    });

    // Record system log
    await this.nhatKyService.ghiLog({
      MaKhachHang: customer.MaKhachHang,
      LoaiThaoTac: 'Quên mật khẩu',
      NoiDungChiTiet: 'Khách hàng khôi phục và đặt lại mật khẩu thành công qua OTP.',
      TrangThai: 'Thành công',
    });

    return {
      success: true,
      message: 'Mật khẩu của bạn đã được đặt lại thành công!',
    };
  }
}
