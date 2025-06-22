import { Controller, Get, Post, Body, Param, UseGuards, Req, Res, Put, Delete } from '@nestjs/common';
import { SpaceService } from './space.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { Authorization } from 'src/auth/decorators/auth.decorator';
import { Request, Response } from 'express';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Controller('space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) { }

  @Authorization()
  @Get('change-space/:spaceId')
  async changeSpace(
    @Param('spaceId') spaceId: string,
    @Authorized('userId') userId: string,
    @Res({ passthrough: true }) res: Response
  ) {

    if (!spaceId) {
      throw new Error('Space ID is required');
    }
    const {space, accessToken, refreshToken} = await this.spaceService.changeSpace(userId, spaceId);

    res.cookie('refresh_token', refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 7 * 24 * 3600 * 1000
		});
    
    return {
      space, accessToken
    };
  }

  @UseGuards(AuthGuard)
  @Post()
  async createSpace(
    @Authorized('userId') userId: string,
    @Body() dto: CreateSpaceDto
  ) {
    const space = await this.spaceService.createSpace(dto.name, userId);
    return {
      message: 'Space created successfully', space
    };
  }

  @Authorization()
  @Get()
  async getAllSpaces() {
    const spaces = await this.spaceService.getAllSpaces();
    return spaces;
  }

  @Authorization('ADMIN')
  @Put()
  async updateSpace(
    @Authorized('spaceId') spaceId: string,
    @Body() dto: UpdateSpaceDto,
  ) {
    const updatedSpace = await this.spaceService.updateSpace(spaceId, dto);
    return updatedSpace;
  }

  @Authorization('ADMIN')
  @Delete()
  async deleteSpace(@Authorized('spaceId') spaceId: string) {

    if (!spaceId) {
      throw new Error('Space ID is required');
    }
    await this.spaceService.deleteSpace(spaceId);
    return { message: 'Space deleted successfully'};
  }
}
