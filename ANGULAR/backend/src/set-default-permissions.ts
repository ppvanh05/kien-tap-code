import { PrismaClient } from '@prisma/client';
import { DEFAULT_ROLE_PERMISSIONS } from './admin/auth/default-permissions';

const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.nHAN_VIEN.findMany();
  console.log(`Updating ${employees.length} employees...\n`);

  for (const emp of employees) {
    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[emp.LoaiTaiKhoan] ?? [];
    await prisma.nHAN_VIEN.update({
      where: { MaNhanVien: emp.MaNhanVien },
      data: { Quyen: defaultPerms },
    });
    console.log(`OK ${emp.MaNhanVien} (${emp.TenTruyCap}) [${emp.LoaiTaiKhoan}]`);
    console.log(`  Quyen: [${defaultPerms.join(', ')}]`);
    console.log('');
  }

  console.log('Cap nhat quyen mac dinh hoan tat!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
