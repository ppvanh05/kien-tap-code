import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

async function main() {
  const prisma = new PrismaClient();
  try {
    const columns: any[] = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'LICH_TRINH_DIEM_DUNG'
    `;
    console.log('Columns in LICH_TRINH_DIEM_DUNG:', columns);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
