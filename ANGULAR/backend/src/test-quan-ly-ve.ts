import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { QuanLyVeService } from './admin/quan-ly-ve/quan-ly-ve.service';

async function main() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const service = app.get(QuanLyVeService);
    console.log('Fetching all tickets...');
    const result = await service.getAllVe();
    console.log('Success! Tickets fetched:', result.length);
    if (result.length > 0) {
      console.log('First ticket:', JSON.stringify(result[0], null, 2));
    }
    await app.close();
  } catch (err) {
    console.error('Error running service:', err);
  }
}

main();
