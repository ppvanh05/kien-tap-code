import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { JwtHelper } from './jwt.helper';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[DEBUG BACKEND] Missing or invalid Authorization header');
      throw new UnauthorizedException('Không tìm thấy token xác thực!');
    }

    const token = authHeader.split(' ')[1];
    const payload = JwtHelper.verify(token);
    if (!payload) {
      console.log('[DEBUG BACKEND] Token verification failed for token:', token.substring(0, 20) + '...');
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn!');
    }

    console.log('[DEBUG BACKEND] Token verified for user:', payload.maKhachHang);
    request.user = payload;
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
