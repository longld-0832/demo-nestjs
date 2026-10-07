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
import { Profile, User } from '../database/entities';
import { CreateUserData, UpdateProfileData } from './users.types';

const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly i18n: I18nService,
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

    const { name, phoneNumber, fullName, bio, avatarUrl } = data;
    try {
      return await this.users.manager.transaction(async (manager) => {
        if (name !== undefined || phoneNumber !== undefined) {
          await manager.update(User, id, { name, phoneNumber });
        }

        const profile = manager.merge(
          Profile,
          user.profile ?? manager.create(Profile, { user: { id } }),
          { fullName, bio, avatarUrl },
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
}
