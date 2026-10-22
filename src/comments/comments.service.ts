import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { CreateCommentData } from './comments.types';
import { throwDatabaseError } from '../common/utils/database-error.util';
import { Article, Comment } from '../database/entities';
import {
  PaginatedResult,
  PaginationParams,
} from '../common/types/pagination.types';
import { toPaginatedResult } from '../common/utils/pagination.util';
import { MessageResponse } from '../common/types/message-response.types';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private readonly comments: Repository<Comment>,
    @InjectRepository(Article)
    private readonly articles: Repository<Article>,
    private readonly i18n: I18nService,
  ) {}

  async create(
    userId: string,
    articleId: string,
    data: CreateCommentData,
  ): Promise<Comment> {
    await this.assertArticleVisible(userId, articleId);

    const comment = this.comments.create({
      body: data.body,
      articleId,
      authorId: userId,
    });
    let saved: Comment;
    try {
      saved = await this.comments.save(comment);
    } catch (error) {
      throwDatabaseError(
        error,
        this.logger,
        this.i18n,
        'Failed to create comment',
      );
    }

    return this.comments.findOneOrFail({
      where: { id: saved.id },
      relations: { author: true },
      select: {
        id: true,
        body: true,
        createdAt: true,
        updatedAt: true,
        author: { id: true, name: true },
      },
    });
  }

  async findAll(
    userId: string,
    articleId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Comment>> {
    await this.assertArticleVisible(userId, articleId);

    const query = this.comments
      .createQueryBuilder('comment')
      .innerJoin('comment.author', 'author')
      .where('comment.articleId = :articleId', { articleId })
      .select([
        'comment.id',
        'comment.body',
        'comment.createdAt',
        'comment.updatedAt',
        'author.id',
        'author.name',
      ])
      .orderBy('comment.createdAt', 'ASC')
      .addOrderBy('comment.id', 'ASC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit);

    const [items, total] = await query.getManyAndCount();
    return toPaginatedResult(items, total, pagination.page, pagination.limit);
  }

  async remove(
    userId: string,
    articleId: string,
    commentId: string,
  ): Promise<MessageResponse> {
    await this.assertCommentOwner(userId, articleId, commentId);
    try {
      await this.comments.delete(commentId);
    } catch (error) {
      throwDatabaseError(
        error,
        this.logger,
        this.i18n,
        'Failed to delete comment',
      );
    }
    return { message: this.i18n.t('comment.DELETE_SUCCESS') };
  }

  /** Same visibility rule as GET /articles/:id: drafts stay hidden. */
  private async assertArticleVisible(
    userId: string,
    articleId: string,
  ): Promise<void> {
    const article = await this.articles.findOne({
      where: { id: articleId },
      select: { id: true, published: true, authorId: true },
    });

    if (!article || (!article.published && article.authorId !== userId)) {
      throw new NotFoundException(this.i18n.t('article.ARTICLE_NOT_FOUND'));
    }
  }

  /** Loads only the owner column; throws 404/403 when not allowed. */
  private async assertCommentOwner(
    userId: string,
    articleId: string,
    commentId: string,
  ): Promise<void> {
    const comment = await this.comments.findOne({
      where: { id: commentId, articleId },
      select: { id: true, authorId: true },
    });
    if (!comment) {
      throw new NotFoundException(this.i18n.t('comment.COMMENT_NOT_FOUND'));
    }
    if (comment.authorId !== userId) {
      throw new ForbiddenException(this.i18n.t('comment.NOT_COMMENT_AUTHOR'));
    }
  }
}
