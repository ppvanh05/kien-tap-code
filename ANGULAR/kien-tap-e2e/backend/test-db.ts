import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Altering TrangThaiVe type to add DaDanhGia...');
    await prisma.$executeRawUnsafe(`ALTER TYPE "TrangThaiVe" ADD VALUE IF NOT EXISTS 'DaDanhGia';`);
    console.log('Enum altered successfully.');

    const enumValuesTrangThaiVe = await prisma.$queryRawUnsafe(`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'TrangThaiVe';
    `);
    console.log('Updated TrangThaiVe enum values in DB:', enumValuesTrangThaiVe);
  } catch (error) {
    console.error('Error altering DB enum:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
