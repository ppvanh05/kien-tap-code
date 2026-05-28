import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const badIds = ['QTV001', 'NVDP001'];

  for (const id of badIds) {
    console.log(`\n--- Cleaning up ${id} ---`);

    // For QTV001: need to handle TIN_TUC references to QUAN_TRI_VIEN
    // For NVDP001: need to handle TUYEN_XE references to NHAN_VIEN_DIEU_PHOI

    try {
      // Check if QTV001 exists in QUAN_TRI_VIEN
      const qtv = await (prisma as any).qUAN_TRI_VIEN.findUnique({ where: { MaQuanTriVien: id } });
      if (qtv) {
        // Clear TIN_TUC refs - set to null (MaQuanTriVien is nullable in TIN_TUC)
        const tinTucCount = await (prisma as any).tIN_TUC.updateMany({
          where: { MaQuanTriVien: id },
          data: { MaQuanTriVien: null }
        });
        console.log(`  Nullified ${tinTucCount.count} TIN_TUC refs`);

        // Clear CHINH_SACH refs
        const chinhSach = await (prisma as any).cHINH_SACH.findMany({ where: { MaQuanTriVien: id } });
        console.log(`  CHINH_SACH count: ${chinhSach.length}`);

        // Delete PHAN_HOI_DANH_GIA
        await (prisma as any).pHAN_HOI_DANH_GIA.deleteMany({ where: { MaQuanTriVien: id } });
        console.log(`  Deleted PHAN_HOI_DANH_GIA`);

        // Delete TU_KHOA refs
        await (prisma as any).tU_KHOA_HAN_CHE.deleteMany({ where: { MaQuanTriVien: id } });
        console.log(`  Deleted TU_KHOA_HAN_CHE`);

        await (prisma as any).qUAN_TRI_VIEN.delete({ where: { MaQuanTriVien: id } });
        console.log(`  ✓ Deleted QUAN_TRI_VIEN: ${id}`);
      }

      // Check NHAN_VIEN_DIEU_PHOI
      const dp = await (prisma as any).nHAN_VIEN_DIEU_PHOI.findUnique({ where: { MaNVDieuPhoi: id } });
      if (dp) {
        // Need to handle TUYEN_XE, LICH_TRINH, PHUONG_TIEN, DIEM_DON_TRA_DUNG
        const tuyenXeCount = await (prisma as any).tUYEN_XE.count({ where: { MaNVDieuPhoi: id } });
        console.log(`  TUYEN_XE refs: ${tuyenXeCount}`);

        // Cannot delete if TUYEN_XE/PHUONG_TIEN reference it - reassign to NVDP100001
        if (tuyenXeCount > 0) {
          await (prisma as any).tUYEN_XE.updateMany({
            where: { MaNVDieuPhoi: id },
            data: { MaNVDieuPhoi: 'NVDP100001' }
          });
          console.log(`  Reassigned TUYEN_XE to NVDP100001`);
        }

        const ptCount = await (prisma as any).pHUONG_TIEN.count({ where: { MaNVDieuPhoi: id } });
        if (ptCount > 0) {
          await (prisma as any).pHUONG_TIEN.updateMany({
            where: { MaNVDieuPhoi: id },
            data: { MaNVDieuPhoi: 'NVDP100001' }
          });
          console.log(`  Reassigned PHUONG_TIEN to NVDP100001`);
        }

        const lichTrinhCount = await (prisma as any).lICH_TRINH.count({ where: { MaNVDieuPhoi: id } });
        if (lichTrinhCount > 0) {
          await (prisma as any).lICH_TRINH.updateMany({
            where: { MaNVDieuPhoi: id },
            data: { MaNVDieuPhoi: 'NVDP100001' }
          });
          console.log(`  Reassigned LICH_TRINH to NVDP100001`);
        }

        const diemDonCount = await (prisma as any).dIEM_DON_TRA_DUNG.count({ where: { MaNVDieuPhoi: id } });
        if (diemDonCount > 0) {
          await (prisma as any).dIEM_DON_TRA_DUNG.updateMany({
            where: { MaNVDieuPhoi: id },
            data: { MaNVDieuPhoi: 'NVDP100001' }
          });
          console.log(`  Reassigned DIEM_DON_TRA_DUNG to NVDP100001`);
        }

        await (prisma as any).nHAN_VIEN_DIEU_PHOI.delete({ where: { MaNVDieuPhoi: id } });
        console.log(`  ✓ Deleted NHAN_VIEN_DIEU_PHOI: ${id}`);
      }

      // Delete NHAT_KY
      const logDel = await prisma.nHAT_KY_HE_THONG.deleteMany({ where: { MaNhanVien: id } });
      console.log(`  Deleted ${logDel.count} NHAT_KY_HE_THONG`);

      // Finally delete NHAN_VIEN
      await prisma.nHAN_VIEN.delete({ where: { MaNhanVien: id } });
      console.log(`  ✓ DELETED NHAN_VIEN: ${id}`);
    } catch (e) {
      console.error(`  ✗ Error for ${id}:`, (e as any).message || e);
    }
  }

  console.log('\n=== Remaining employees ===');
  const all = await prisma.nHAN_VIEN.findMany();
  for (const emp of all) {
    console.log(`- ${emp.MaNhanVien}: ${emp.TenTruyCap} | SĐT: ${emp.SoDienThoai} | Email: ${emp.Email} | MatKhau: ${emp.MatKhau ? 'OK' : 'NULL'}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
