import * as dotenv from 'dotenv';
import * as path from 'path';

// Load variables sử dụng process.cwd() để đảm bảo tìm đúng file .env ở root thư mục dự án
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const ENV = {
  NODE_ENV: process.env['NODE_ENV'] || 'local',
  CUSTOMER_URL: process.env['CUSTOMER_URL'] || 'http://localhost:4200',
  ADMIN_URL: process.env['ADMIN_URL'] || 'http://localhost:4200/admin-login',
  API_BASE_URL: process.env['API_BASE_URL'] || (
    (process.env['ADMIN_URL'] || '').includes('kien-tap-code.vercel.app')
      ? 'https://kien-tap-code.onrender.com'
      : 'http://localhost:3000'
  ),
  
  ADMIN_USERNAME: process.env['ADMIN_USERNAME'] || 'quantrivien1',
  ADMIN_PASSWORD: process.env['ADMIN_PASSWORD'] || 'SecurePass123',
  
  DEFAULT_TIMEOUT: parseInt(process.env['DEFAULT_TIMEOUT'] || '30000', 10),
  EXPECT_TIMEOUT: parseInt(process.env['EXPECT_TIMEOUT'] || '5000', 10),
};
export default ENV;
