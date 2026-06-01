import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình CORS cho phép localhost (dev) và Vercel production (prod)
  const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:4200',
    'http://localhost:10000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:4200',
    'http://127.0.0.1:10000',
    'https://kien-tap-code-b5ep1lzcu-ppvanh05s-projects.vercel.app',
    'https://kien-tap-code.vercel.app',
    ...configuredOrigins,
  ];

  const allowedOriginPatterns = [
    /^https:\/\/kien-tap-code.*\.vercel\.app$/,
    /^http:\/\/localhost(:\d+)?$/,
    /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (mobile apps, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Kiểm tra xem origin có trong whitelist không
      if (allowedOrigins.includes(origin) || allowedOriginPatterns.some((pattern) => pattern.test(origin))) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Tăng giới hạn payload để lưu trữ ảnh base64 trực tiếp vào database
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend đang chạy tại port ${port}`);
}
bootstrap();
