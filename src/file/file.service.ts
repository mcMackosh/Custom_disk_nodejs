import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FileService {
    constructor(private prisma: PrismaService) { }

    async saveFileMetadata(file: Express.Multer.File, spaceId: string) {
        // Збереження метаданих у БД
        // Тепер пов'язуємо файл із певним простором через spaceId
        const saved = await this.prisma.spaceFile.create({
            data: {
                fileName: file.filename,
                filePath: file.path,
                space: {
                    connect: { id: spaceId },
                },
            },
        });
        return saved;
    }

    async getFilePath(filename: string): Promise<string | null> {
        const file = await this.prisma.spaceFile.findFirst({
            where: { fileName: filename },
        });
        if (!file) return null;
        return join(process.cwd(), file.filePath);
    }

    async deleteFile(filename: string) {
        const file = await this.prisma.spaceFile.findFirst({
            where: { fileName: filename },
        });
        if (!file) throw new NotFoundException('File not found');

        await fs.unlink(file.filePath);
        await this.prisma.spaceFile.delete({
            where: { id: file.id },
        });
        return { deleted: true };
    }
}
