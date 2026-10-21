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
import { MessageResponse } from '../common/types/message-response.types';
import {
  isUniqueViolation,
  throwDatabaseError,
} from '../common/utils/database-error.util';
import { Article, ArticleFollow } from '../database/entities';

@Injectable()
export class ArticleFollowsService {
  private readonly logger = new Logger(ArticleFollowsService.name);

  constructor(
    @InjectRepository(ArticleFollow)
    private readonly articleFollows: Repository<ArticleFollow>,
    @InjectRepository(Article)
    private readonly articles: Repository<Article>,
    private readonly i18n: I18nService,
  ) {}

  async follow(userId: string, articleId: string): Promise<MessageResponse> {
    const article = await this.articles.findOne({
      where: { id: articleId },
      select: { id: true, authorId: true, published: true },
    });
    // Same visibility rule as GET /articles/:id: drafts stay hidden.
    if (!article || (!article.published && article.authorId !== userId)) {
      throw new NotFoundException(this.i18n.t('article.ARTICLE_NOT_FOUND'));
    }
    if (article.authorId === userId) {
      throw new BadRequestException(
        this.i18n.t('article.CANNOT_FOLLOW_OWN_ARTICLE'),
      );
    }

    const alreadyFollowing = await this.articleFollows.existsBy({
      userId,
      articleId,
    });
    if (alreadyFollowing) {
      throw new ConflictException(
        this.i18n.t('article.ALREADY_FOLLOWING_ARTICLE'),
      );
    }

    try {
      await this.articleFollows.insert({ userId, articleId });
    } catch (error) {
      // Two concurrent follow requests can both pass the check above.
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          this.i18n.t('article.ALREADY_FOLLOWING_ARTICLE'),
        );
      }
      throwDatabaseError(
        error,
        this.logger,
        this.i18n,
        'Failed to follow article',
      );
    }
    return { message: this.i18n.t('article.FOLLOW_ARTICLE_SUCCESS') };
  }

  /** Works even if the article was unpublished after being followed. */
  async unfollow(userId: string, articleId: string): Promise<MessageResponse> {
    let affected: number | null | undefined;
    try {
      ({ affected } = await this.articleFollows.delete({ userId, articleId }));
    } catch (error) {
      throwDatabaseError(
        error,
        this.logger,
        this.i18n,
        'Failed to unfollow article',
      );
    }

    if (!affected) {
      throw new NotFoundException(this.i18n.t('article.NOT_FOLLOWING_ARTICLE'));
    }
    return { message: this.i18n.t('article.UNFOLLOW_ARTICLE_SUCCESS') };
  }
}
