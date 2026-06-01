import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const drivers = await prisma.tAI_XE_PHU_XE.findMany();
    console.log('Drivers & Assistants inside DB:');
    drivers.forEach(d => {
      console.log(`Code: ${d.MaTaiXePhuXe}, Name: ${d.HoTen}, Phone: ${d.SoDienThoai}, Role: ${d.LoaiNhanVien}, Status: ${d.TrangThaiLamViec}, LicenseExpiry: ${d.ThoiHanBangLai}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
