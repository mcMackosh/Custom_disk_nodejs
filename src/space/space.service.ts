import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class SpaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) { }

  async changeSpace(userId: string, spaceId: string) {
    const space = await this.prisma.space.findFirst({
      where: {
        id: spaceId,
        memberships: {
          some: {
            userId: userId,
          },
        },
      }
    });

    if (!space) {
      throw new ForbiddenException('Access denied to this space');
    }

    const newToken = await this.authService.generateToken('ACCESS', userId, spaceId);
    const refreshToken = await this.authService.generateToken('REFRESH', userId, spaceId);
    this.redisService.setRefreshToken(userId, refreshToken);


    return { space, accessToken: newToken, refreshToken };
  }

  async createSpace(name: string, creatorId: string) {
    const space = await this.prisma.space.create({
      data: {
        name,
        memberships: {
          create: {
            userId: creatorId,
            role: 'ADMIN',
          },
        },
      }
    });

    return space;
  }

  async getAllSpaces() {
    return await this.prisma.space.findMany();
  }

  async getSpaceById(id: string) {
    const space = await this.prisma.space.findUnique({ where: { id } });
    if (!space) {
      throw new NotFoundException('Space not found');
    }
    return space;
  }

  async updateSpace(id: string, dto: UpdateSpaceDto) {
    const space = await this.prisma.space.findUnique({
      where: { id }
    });
    if (!space) {
      throw new NotFoundException('Space not found');
    }

    const updatedSpace = await this.prisma.space.update({
      where: { id },
      data: {
        name: dto.name,
      },
    });
    return updatedSpace;
  }

  async deleteSpace(id: string) {
    const space = await this.prisma.space.findUnique({ where: { id } });
    if (!space) {
      throw new NotFoundException('Space not found');
    }
    await this.prisma.space.delete({ where: { id } });
  }
}
