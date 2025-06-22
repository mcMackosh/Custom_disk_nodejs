import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceController } from './space.controller';
import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  controllers: [SpaceController],
  providers: [SpaceService],
  imports: [AuthModule, RedisModule]
})
export class SpaceModule {}
