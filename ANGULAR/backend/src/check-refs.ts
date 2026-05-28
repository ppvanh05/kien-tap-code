import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ids = ['QTV001', 'NVDP001'];
  for (const id of ids) {
    console.log(`Checking references for ${id}:`);
    const qtv = await prisma.qUAN_TRI_VIEN.findUnique({ where: { MaQuanTriVien: id } });
    const dp = await prisma.nHAN_VIEN_DIEU_PHOI.findUnique({ where: { MaNVDieuPhoi: id } });
    const bv = await prisma.nHAN_VIEN_BAN_VE.findUnique({ where: { MaNVBanVe: id } });
    const bql = await prisma.bAN_QUAN_LY.findUnique({ where: { MaBanQuanLy: id } });
    const logs = await prisma.nHAT_KY_HE_THONG.findMany({ where: { MaNhanVien: id } });
    
    console.log(`  QUAN_TRI_VIEN: ${qtv ? 'Yes' : 'No'}`);
    console.log(`  NHAN_VIEN_DIEU_PHOI: ${dp ? 'Yes' : 'No'}`);
    console.log(`  NHAN_VIEN_BAN_VE: ${bv ? 'Yes' : 'No'}`);
    console.log(`  BAN_QUAN_LY: ${bql ? 'Yes' : 'No'}`);
    console.log(`  NHAT_KY_HE_THONG logs count: ${logs.length}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
