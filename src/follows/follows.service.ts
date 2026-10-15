import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import {
  isUniqueViolation,
  throwDatabaseError,
} from '../common/utils/database-error.util';
import { Follow } from '../database/entities';
import { UsersService } from '../users/users.service';
import { FollowResponse } from './follows.types';

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

    const targetExists = await this.usersService.existsActiveById(followingId);
    if (!targetExists) {
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
      if (isUniqueViolation(error)) {
        throw new ConflictException(this.i18n.t('follow.ALREADY_FOLLOWING'));
      }
      throwDatabaseError(
        error,
        this.logger,
        this.i18n,
        'Failed to follow user',
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
      throwDatabaseError(
        error,
        this.logger,
        this.i18n,
        'Failed to unfollow user',
      );
    }

    if (!affected) {
      throw new NotFoundException(this.i18n.t('follow.NOT_FOLLOWING'));
    }
    return { message: this.i18n.t('follow.UNFOLLOW_SUCCESS') };
  }
}
