import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const schedules = await prisma.lICH_TRINH.findMany({
      include: {
        TUYEN_XE: true,
      }
    });
    console.log('Schedules count:', schedules.length);
    console.log('Schedules list:', JSON.stringify(schedules, null, 2));
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
