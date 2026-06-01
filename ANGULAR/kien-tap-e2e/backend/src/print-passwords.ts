import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.nHAN_VIEN.findMany({
    select: {
      TenTruyCap: true,
      Email: true,
      MatKhau: true,
      LoaiTaiKhoan: true,
    }
  });
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
