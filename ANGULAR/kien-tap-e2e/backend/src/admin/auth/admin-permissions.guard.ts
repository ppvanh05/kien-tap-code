import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminJwtHelper } from './admin-jwt.helper';
import { REQUIRE_PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class AdminPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bạn cần đăng nhập hệ thống admin!');
    }

    const token = authHeader.split(' ')[1];
    const payload = AdminJwtHelper.verify(token);

    if (!payload) {
      throw new UnauthorizedException('Phiên đăng nhập admin không hợp lệ hoặc đã hết hạn!');
    }

    // Attach user payload to request for controllers if needed
    request.admin = payload;

    // If no specific permissions are decorated, allow access to authenticated admins
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    if (payload.quyen?.includes('admin')) {
      return true;
    }

    const hasPermission = requiredPermissions.every(permission => {
      const basePermission = permission.split('.')[0];
      
      // Ánh xạ các quyền chi tiết của backend về các nhóm quyền lớn trên Sidebar/DB
      let mappedPermission = basePermission;
      if (['route', 'vehicle', 'driver', 'stop', 'trip'].includes(basePermission)) {
        mappedPermission = 'dispatch';
      } else if (['staff', 'role'].includes(basePermission)) {
        mappedPermission = 'employee';
      } else if (['finance', 'report'].includes(basePermission)) {
        mappedPermission = 'report';
      } else if (['ticket'].includes(basePermission)) {
        mappedPermission = 'ticket';
      } else if (basePermission === 'blacklist') {
        mappedPermission = 'review';
      }

      return payload.quyen?.includes(permission) || 
             payload.quyen?.includes(basePermission) ||
             payload.quyen?.includes(mappedPermission);
    });

    if (!hasPermission) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này!');
    }

    return true;
  }
}
