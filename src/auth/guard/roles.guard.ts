// roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log(user.userId, user);
    
    if (!user || !user.userId || !user.spaceId) {
      throw new ForbiddenException('User or space ID not found');
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: user.userId,
        spaceId : user.spaceId
      },
    });

    if (!membership) {
      throw new ForbiddenException('User is not a member of the space');
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Not enough permissions');
    }

    return true;
  }
}