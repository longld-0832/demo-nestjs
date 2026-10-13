import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { I18nService } from 'nestjs-i18n';
import { isAbsolute, join, relative, resolve } from 'path';
import { PUBLIC_DIR, PUBLIC_URL_PREFIX } from './attachments.constants';
import { ImageType, StoredFile } from './attachments.types';

const IMAGE_EXTENSIONS: Record<ImageType, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(private readonly i18n: I18nService) {}

  /**
   * Ensures the upload is a JPEG/PNG/WEBP image within the size limit.
   * The type is detected from the file content, not the client-sent mimetype.
   */
  validateImage(
    file: Express.Multer.File | undefined,
    maxSize: number,
  ): ImageType {
    if (!file) {
      throw new BadRequestException(this.i18n.t('attachment.FILE_REQUIRED'));
    }
    if (file.size > maxSize) {
      throw new BadRequestException(
        this.i18n.t('attachment.FILE_TOO_LARGE', {
          args: { maxSize: maxSize / (1024 * 1024) },
        }),
      );
    }

    const imageType = this.detectImageType(file.buffer);
    if (!imageType) {
      throw new BadRequestException(
        this.i18n.t('attachment.INVALID_IMAGE_TYPE'),
      );
    }
    return imageType;
  }

  /** Writes the image under PUBLIC_DIR/<folder> with a random UUID name. */
  async storePublicImage(
    file: Express.Multer.File,
    imageType: ImageType,
    folder: string,
  ): Promise<StoredFile> {
    const storedName = `${randomUUID()}${IMAGE_EXTENSIONS[imageType]}`;
    try {
      await mkdir(join(PUBLIC_DIR, folder), { recursive: true });
      await writeFile(join(PUBLIC_DIR, folder, storedName), file.buffer);
    } catch (error) {
      this.logger.error(
        'Failed to store file',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        this.i18n.t('common.FILE_STORAGE_ERROR'),
      );
    }

    return {
      url: `${PUBLIC_URL_PREFIX}/${folder}/${storedName}`,
      fileName: file.originalname,
      fileType: imageType,
      fileSize: file.size,
    };
  }

  /** Best-effort removal of a public file by its URL; never throws. */
  async removePublicFile(url: string): Promise<void> {
    if (!url.startsWith(`${PUBLIC_URL_PREFIX}/`)) {
      return;
    }

    const filePath = resolve(
      PUBLIC_DIR,
      url.slice(PUBLIC_URL_PREFIX.length + 1),
    );
    const relativePath = relative(PUBLIC_DIR, filePath);
    if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
      this.logger.warn(`Refusing to remove file outside public dir: ${url}`);
      return;
    }

    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.error(
          `Failed to remove file ${url}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }

  private detectImageType(buffer: Buffer | undefined): ImageType | null {
    if (!buffer || buffer.length < 12) {
      return null;
    }
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }
    if (
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    ) {
      return 'image/png';
    }
    if (
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    ) {
      return 'image/webp';
    }
    return null;
  }
}
