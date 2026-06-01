import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const customerId = 'KH100001';
    console.log(`Checking orders for customer: ${customerId}`);
    const orders = await prisma.dON_HANG.findMany({
      where: { MaKhachHang: customerId },
      include: {
        VE_DIEN_TU: true
      }
    });
    console.log(`Found ${orders.length} orders.`);
    for (const order of orders) {
      console.log(`Order ${order.MaDonHang}:`);
      console.log(`  SoLuongVeDaDat: ${order.SoLuongVeDaDat}`);
      console.log(`  TrangThaiDonHang: ${order.TrangThaiDonHang}`);
      console.log(`  VE_DIEN_TU count: ${order.VE_DIEN_TU?.length}`);
    }

    console.log('--- Total VE_DIEN_TU in DB ---');
    const totalTickets = await prisma.vE_DIEN_TU.count();
    console.log(`Total tickets in DB: ${totalTickets}`);
    
    const sampleTickets = await prisma.vE_DIEN_TU.findMany({
      take: 5
    });
    console.log('Sample tickets:', sampleTickets);

  } catch (error: any) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
