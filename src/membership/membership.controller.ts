import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { UserRole } from '@prisma/client';
import { Authorization } from 'src/auth/decorators/auth.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';

@Controller('membership')
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Authorization('ADMIN', 'REGULAR')
  @Get()
  findAll() {
    return this.membershipService.getAllMemberships();
  }

  @Authorization('ADMIN')
  @Post('create-or-update')
  createOrUpdate(@Body() body: { userId: string; role?: UserRole }, @Authorized('spaceId') spaceId: string) {
    return this.membershipService.createOrUpdateMembership(body.userId, spaceId, body.role);
  }

  @Authorization('ADMIN')
  @Delete()
  remove(@Authorized('spaceId') spaceId: string) {
    return this.membershipService.deleteMembership(spaceId);
  }
}
