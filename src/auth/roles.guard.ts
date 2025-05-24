// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
    context.getHandler(),
    context.getClass(),
  ]);

  if (!requiredRoles) return true;

  const { user } = context.switchToHttp().getRequest();

  if (!user?.role) {
    throw new ForbiddenException('User role not found in request');
  }

  const hasPermission = requiredRoles.includes(user.role);
  if (!hasPermission) {
    throw new ForbiddenException(
      `User with role ${user.role} cannot access this endpoint. Required roles: ${requiredRoles.join(', ')}`,
    );
  }

  return true;
}
}