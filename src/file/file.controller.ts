import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res, Delete, HttpStatus, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileService } from './file.service';
import { Response } from 'express';
import { extname } from 'path';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { Authorization } from 'src/auth/decorators/auth.decorator';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  
  
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
  }))

  @Authorization('REGULAR', 'ADMIN')
  @Post('upload')
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Authorized('spaceId') spaceId: string) {
    return this.fileService.saveFileMetadata(file, spaceId);
  }


  @Authorization('REGULAR', 'ADMIN')
  @Get(':filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = await this.fileService.getFilePath(filename);

    console.log(filepath)
    if (!filepath) {
      throw new NotFoundException('File not found');
    }
    return res.sendFile(filepath);
  }

  @Authorization('REGULAR', 'ADMIN')
  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string) {
    return this.fileService.deleteFile(filename);
  }
}
