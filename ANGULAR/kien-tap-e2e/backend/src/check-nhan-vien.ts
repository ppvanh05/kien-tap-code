import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.nHAN_VIEN.findMany();
  console.log('Total employees:', employees.length);
  for (const emp of employees) {
    console.log(`- MaNhanVien: ${emp.MaNhanVien}`);
    console.log(`  TenTruyCap: ${emp.TenTruyCap}`);
    console.log(`  HoVaTenDem: ${emp.HoVaTenDem}`);
    console.log(`  Ten: ${emp.Ten}`);
    console.log(`  SoDienThoai: ${emp.SoDienThoai}`);
    console.log(`  Email: ${emp.Email}`);
    console.log(`  MatKhau: ${emp.MatKhau ? 'Has Password' : 'NULL'}`);
    console.log('--------------------------------------');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
