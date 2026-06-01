import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const orders = await prisma.dON_HANG.findMany({
      include: {
        KHACH_HANG: true,
        VE_DIEN_TU: true
      }
    });
    console.log('Orders inside DB:');
    orders.forEach(o => {
      console.log(`Code: ${o.MaDonHang}, Phone: ${o.SdtNguoiDi || o.KHACH_HANG?.SoDienThoai}, Status: ${o.TrangThaiDonHang}, TicketCount: ${o.VE_DIEN_TU?.length}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
