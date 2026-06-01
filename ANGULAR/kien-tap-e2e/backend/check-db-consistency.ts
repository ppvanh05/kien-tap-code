import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('Listing users and their order counts...');
    const customers = await prisma.kHACH_HANG.findMany({
      select: {
        MaKhachHang: true,
        HoTenKhachHang: true,
        SoDienThoai: true,
        _count: {
          select: { DON_HANG: true }
        }
      }
    });

    console.table(customers.map(c => ({
      ID: c.MaKhachHang,
      Name: c.HoTenKhachHang,
      Phone: c.SoDienThoai,
      Orders: c._count.DON_HANG
    })));

    const ordersWithoutCustomer = await prisma.dON_HANG.count({
        where: { MaKhachHang: { equals: '' } }
    });
    console.log('Orders with empty MaKhachHang:', ordersWithoutCustomer);

    const allOrders = await prisma.dON_HANG.findMany({
        take: 5,
        select: {
            MaDonHang: true,
            MaKhachHang: true,
            HoTenNguoiDi: true
        }
    });
    console.log('Sample orders raw data:', JSON.stringify(allOrders, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
