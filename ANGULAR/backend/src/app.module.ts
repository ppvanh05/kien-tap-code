import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ChinhSachModule } from './admin/chinh-sach/chinh-sach.module';
import { BaoCaoModule } from './admin/bao-cao/bao-cao.module';
import { TinTucModule } from './admin/tin-tuc/tin-tuc.module';
import { KhachHangModule } from './admin/khach-hang/khach-hang.module';
import { NhanVienModule } from './admin/nhan-vien/nhan-vien.module';
import { TuKhoaCamModule } from './admin/tu-khoa-cam/tu-khoa-cam.module';
import { NhatKyHeThongModule } from './admin/nhat-ky-he-thong/nhat-ky-he-thong.module';
import { QuanLyVeModule } from './admin/quan-ly-ve/quan-ly-ve.module';
import { DieuHanhModule } from './admin/dieu-hanh/dieu-hanh.module';

// Customer Modules
import { AuthModule } from './customer/auth/auth.module';
import { HomeModule } from './customer/home/home.module';
import { TimKiemChuyenXeModule } from './customer/tim-kiem-chuyen-xe/tim-kiem-chuyen-xe.module';
import { ThongTinDonHangModule } from './customer/thong-tin-don-hang/thong-tin-don-hang.module';
import { ThanhToanModule } from './customer/thanh-toan/thanh-toan.module';
import { TraCuuVeModule } from './customer/tra-cuu-ve/tra-cuu-ve.module';
import { ProfileModule } from './customer/profile/profile.module';

@Module({
  imports: [
    PrismaModule,
    ChinhSachModule,
    BaoCaoModule,
    TinTucModule,
    KhachHangModule,
    NhanVienModule,
    TuKhoaCamModule,
    NhatKyHeThongModule,
    QuanLyVeModule,
    DieuHanhModule,
    
    // Customer Modules Registration
    AuthModule,
    HomeModule,
    TimKiemChuyenXeModule,
    ThongTinDonHangModule,
    ThanhToanModule,
    TraCuuVeModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }


