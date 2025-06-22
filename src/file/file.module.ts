import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [FileController],
  providers: [FileService, PrismaService],
  imports: [AuthModule],
})
export class FileModule {}