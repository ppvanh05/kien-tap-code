import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const orderId = 'DH10000010';
    console.log(`Resetting order: ${orderId} and its tickets to DaHoanThanh...`);
    
    // Tìm các vé của đơn hàng
    const tickets = await prisma.vE_DIEN_TU.findMany({
      where: { MaDonHang: orderId }
    });
    
    const ticketIds = tickets.map(t => t.MaVe);
    
    // 1. Xóa các media đánh giá trước
    await prisma.mEDIA_DANH_GIA.deleteMany({
      where: {
        DANH_GIA: {
          MaVe: { in: ticketIds }
        }
      }
    });

    // 2. Xóa các phản hồi đánh giá
    await prisma.pHAN_HOI_DANH_GIA.deleteMany({
      where: {
        DANH_GIA: {
          MaVe: { in: ticketIds }
        }
      }
    });

    // 3. Xóa đánh giá (DANH_GIA)
    await prisma.dANH_GIA.deleteMany({
      where: { MaVe: { in: ticketIds } }
    });
    
    // 4. Cập nhật trạng thái vé về DaHoanThanh
    await prisma.vE_DIEN_TU.updateMany({
      where: { MaDonHang: orderId },
      data: { TrangThaiVe: 'DaHoanThanh' }
    });
    
    // 5. Cập nhật trạng thái đơn hàng về DaHoanThanh
    await prisma.dON_HANG.update({
      where: { MaDonHang: orderId },
      data: { TrangThaiDonHang: 'DaHoanThanh' }
    });
    
    console.log('Reset complete!');
  } catch (err) {
    console.error('Error resetting order data:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
