import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Not, QueryFailedError, Repository } from 'typeorm';
import {
  AVATAR_FOLDER,
  AVATAR_MAX_SIZE,
} from '../attachments/attachments.constants';
import { AttachmentsService } from '../attachments/attachments.service';
import {
  AttachableType,
  Attachment,
  Profile,
  User,
} from '../database/entities';
import { CreateUserData, UpdateProfileData } from './users.types';

const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly i18n: I18nService,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email } });
  }

  existsByPhoneNumber(phoneNumber: string): Promise<boolean> {
    return this.users.existsBy({ phoneNumber });
  }

  async getCurrentUser(id: string): Promise<User> {
    const user = await this.users.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.users.findOne({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    const user = this.users.create(data);
    try {
      return await this.users.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === PG_UNIQUE_VIOLATION
      ) {
        throw new ConflictException(
          this.i18n.t('auth.EMAIL_ALREADY_REGISTERED'),
        );
      }
      this.logger.error(
        'Failed to save user',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        this.i18n.t('common.DATABASE_ERROR'),
      );
    }
  }

  async updateProfile(id: string, data: UpdateProfileData): Promise<User> {
    const user = await this.users.findOne({
      where: { id },
      relations: { profile: true },
    });
    if (!user) {
      throw new NotFoundException(this.i18n.t('user.USER_NOT_FOUND'));
    }

    if (data.phoneNumber && data.phoneNumber !== user.phoneNumber) {
      const phoneTaken = await this.users.existsBy({
        phoneNumber: data.phoneNumber,
        id: Not(id),
      });
      if (phoneTaken) {
        throw new ConflictException(
          this.i18n.t('auth.PHONE_ALREADY_REGISTERED'),
        );
      }
    }

    const { name, phoneNumber, fullName, bio } = data;
    try {
      return await this.users.manager.transaction(async (manager) => {
        if (name !== undefined || phoneNumber !== undefined) {
          await manager.update(User, id, { name, phoneNumber });
        }

        const profile = manager.merge(
          Profile,
          user.profile ?? manager.create(Profile, { user: { id } }),
          { fullName, bio },
        );
        await manager.save(Profile, profile);

        return manager.findOneOrFail(User, {
          where: { id },
          relations: { profile: true },
        });
      });
    } catch (error) {
      this.logger.error(
        'Failed to update user profile',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        this.i18n.t('common.DATABASE_ERROR'),
      );
    }
  }

  /**
   * Stores the uploaded image in the public folder, records it as the
   * profile's attachment and replaces the previous avatar (row and file).
   */
  async updateAvatar(
    id: string,
    file: Express.Multer.File | undefined,
  ): Promise<User> {
    const imageType = this.attachmentsService.validateImage(
      file,
      AVATAR_MAX_SIZE,
    );

    const user = await this.users.findOne({
      where: { id },
      relations: { profile: true },
    });
    if (!user) {
      throw new NotFoundException(this.i18n.t('user.USER_NOT_FOUND'));
    }

    const stored = await this.attachmentsService.storePublicImage(
      file as Express.Multer.File,
      imageType,
      AVATAR_FOLDER,
    );

    let oldAttachments: Attachment[] = [];
    let updated: User;
    try {
      updated = await this.users.manager.transaction(async (manager) => {
        const profile =
          user.profile ??
          (await manager.save(
            Profile,
            manager.create(Profile, { user: { id } }),
          ));

        oldAttachments = await manager.find(Attachment, {
          where: {
            attachableType: AttachableType.PROFILE,
            attachableId: profile.id,
          },
        });
        if (oldAttachments.length) {
          await manager.delete(
            Attachment,
            oldAttachments.map((attachment) => attachment.id),
          );
        }

        await manager.insert(Attachment, {
          ...stored,
          attachableType: AttachableType.PROFILE,
          attachableId: profile.id,
        });
        await manager.update(Profile, profile.id, { avatarUrl: stored.url });

        return manager.findOneOrFail(User, {
          where: { id },
          relations: { profile: true },
        });
      });
    } catch (error) {
      await this.attachmentsService.removePublicFile(stored.url);
      this.logger.error(
        'Failed to update user avatar',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        this.i18n.t('common.DATABASE_ERROR'),
      );
    }

    await Promise.all(
      oldAttachments.map((attachment) =>
        this.attachmentsService.removePublicFile(attachment.url),
      ),
    );
    return updated;
  }
}
