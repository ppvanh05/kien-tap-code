import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const routes = await prisma.tUYEN_XE.findMany();
    console.log('Routes inside DB:');
    routes.forEach(r => {
      console.log(`Code: ${r.MaTuyenXe}, Name: ${r.TenTuyenXe}, Status: ${r.TrangThaiTuyenXe}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
