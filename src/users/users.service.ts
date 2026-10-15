import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Not, Repository } from 'typeorm';
import {
  AVATAR_FOLDER,
  AVATAR_MAX_SIZE,
} from '../attachments/attachments.constants';
import { AttachmentsService } from '../attachments/attachments.service';
import {
  isUniqueViolation,
  throwDatabaseError,
} from '../common/utils/database-error.util';
import { Attachment, Profile, User } from '../database/entities';
import { AttachableType } from '../database/enums/attachable-type.enum';
import { CreateUserData, UpdateProfileData } from './users.types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly i18n: I18nService,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  /** Loads only the columns needed to authenticate a request. */
  findActiveAuthUser(id: string): Promise<User | null> {
    return this.users.findOne({
      where: { id, isActive: true },
      select: { id: true, email: true, name: true },
    });
  }

  existsByEmail(email: string): Promise<boolean> {
    return this.users.existsBy({ email });
  }

  existsByPhoneNumber(phoneNumber: string): Promise<boolean> {
    return this.users.existsBy({ phoneNumber });
  }

  existsActiveById(id: string): Promise<boolean> {
    return this.users.existsBy({ id, isActive: true });
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
      throw new NotFoundException(this.i18n.t('user.USER_NOT_FOUND'));
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
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          this.i18n.t('auth.EMAIL_ALREADY_REGISTERED'),
        );
      }
      throwDatabaseError(error, this.logger, this.i18n, 'Failed to save user');
    }
  }

  async updateProfile(id: string, data: UpdateProfileData): Promise<User> {
    const user = await this.findByIdWithProfileOrFail(id);

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
      throwDatabaseError(
        error,
        this.logger,
        this.i18n,
        'Failed to update user profile',
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

    const user = await this.findByIdWithProfileOrFail(id);

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
      throwDatabaseError(
        error,
        this.logger,
        this.i18n,
        'Failed to update user avatar',
      );
    }

    await Promise.all(
      oldAttachments.map((attachment) =>
        this.attachmentsService.removePublicFile(attachment.url),
      ),
    );
    return updated;
  }

  private async findByIdWithProfileOrFail(id: string): Promise<User> {
    const user = await this.users.findOne({
      where: { id },
      relations: { profile: true },
    });
    if (!user) {
      throw new NotFoundException(this.i18n.t('user.USER_NOT_FOUND'));
    }
    return user;
  }
}
