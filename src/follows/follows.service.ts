import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { QueryFailedError, Repository } from 'typeorm';
import { Follow } from '../database/entities';
import { UsersService } from '../users/users.service';
import { FollowResponse } from './follows.types';

const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class FollowsService {
  private readonly logger = new Logger(FollowsService.name);

  constructor(
    @InjectRepository(Follow)
    private readonly follows: Repository<Follow>,
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  async follow(
    followerId: string,
    followingId: string,
  ): Promise<FollowResponse> {
    if (followerId === followingId) {
      throw new BadRequestException(
        this.i18n.t('follow.CANNOT_FOLLOW_YOURSELF'),
      );
    }

    const target = await this.usersService.findById(followingId);
    if (!target || !target.isActive) {
      throw new NotFoundException(this.i18n.t('user.USER_NOT_FOUND'));
    }

    const alreadyFollowing = await this.follows.existsBy({
      followerId,
      followingId,
    });
    if (alreadyFollowing) {
      throw new ConflictException(this.i18n.t('follow.ALREADY_FOLLOWING'));
    }

    try {
      await this.follows.insert({ followerId, followingId });
    } catch (error) {
      // Two concurrent follow requests can both pass the check above.
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === PG_UNIQUE_VIOLATION
      ) {
        throw new ConflictException(this.i18n.t('follow.ALREADY_FOLLOWING'));
      }
      this.logger.error(
        'Failed to follow user',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        this.i18n.t('common.DATABASE_ERROR'),
      );
    }

    return { message: this.i18n.t('follow.FOLLOW_SUCCESS') };
  }

  async unfollow(
    followerId: string,
    followingId: string,
  ): Promise<FollowResponse> {
    let affected: number | null | undefined;
    try {
      ({ affected } = await this.follows.delete({ followerId, followingId }));
    } catch (error) {
      this.logger.error(
        'Failed to unfollow user',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        this.i18n.t('common.DATABASE_ERROR'),
      );
    }

    if (!affected) {
      throw new NotFoundException(this.i18n.t('follow.NOT_FOLLOWING'));
    }
    return { message: this.i18n.t('follow.UNFOLLOW_SUCCESS') };
  }
}
