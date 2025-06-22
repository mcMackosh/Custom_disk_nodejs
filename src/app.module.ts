import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IS_DEV_ENV } from './libs/common/utils/is-dev.util';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SpaceModule } from './space/space.module';
import { RedisModule } from './redis/redis.module';
import { MembershipModule } from './membership/membership.module';
import { FileService } from './file/file.service';
import { FileController } from './file/file.controller';
import { FileModule } from './file/file.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: !IS_DEV_ENV,
  }), PrismaModule, AuthModule, UserModule, SpaceModule, RedisModule, MembershipModule, FileModule],
  providers: [FileService],
  controllers: [FileController],
})
export class AppModule {}
