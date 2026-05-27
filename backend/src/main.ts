import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cho phép Angular frontend gọi API tới backend (hỗ trợ mọi port trên localhost)
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Tăng giới hạn payload để lưu trữ ảnh base64 trực tiếp vào database
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Backend đang chạy tại: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
