import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const vehicles = await prisma.pHUONG_TIEN.findMany();
    console.log('Vehicles inside DB:');
    vehicles.forEach(v => {
      console.log(`Code: ${v.MaXe}, Name: ${v.TenXe}, Plate: ${v.BienSoXe}, Type: ${v.LoaiXe}, Expiry: ${v.HanDangKiem}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
