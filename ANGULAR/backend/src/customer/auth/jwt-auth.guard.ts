import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { JwtHelper } from './jwt.helper';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Không tìm thấy token xác thực!');
    }

    const token = authHeader.split(' ')[1];
    const payload = JwtHelper.verify(token);
    if (!payload) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn!');
    }

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
