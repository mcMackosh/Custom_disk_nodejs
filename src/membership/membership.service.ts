import { Injectable, NotFoundException } from '@nestjs/common';
import { Membership, UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MembershipService {
    constructor(private prisma: PrismaService) { }

    async createOrUpdateMembership(
        userId: string,
        spaceId: string,
        role: UserRole = UserRole.REGULAR,
    ): Promise<Membership> {
        const existing = await this.prisma.membership.findFirst({
            where: { userId, spaceId },
        });

        if (existing) {
            return this.prisma.membership.update({
                where: { id: existing.id },
                data: { role },
            });
        }

        return this.prisma.membership.create({
            data: { userId, spaceId, role },
        });
    }


    async getAllMemberships(): Promise<Membership[]> {
        return this.prisma.membership.findMany();
    }

    async getMembershipById(id: string): Promise<Membership> {
        const membership = await this.prisma.membership.findUnique({ where: { id } });
        if (!membership) throw new NotFoundException('Membership not found');
        return membership;
    }

    async deleteMembership(id: string): Promise<Membership> {
        await this.getMembershipById(id);
        return this.prisma.membership.delete({ where: { id } });
    }
}
