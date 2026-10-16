import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { throwDatabaseError } from '../common/utils/database-error.util';
import { Article } from '../database/entities';
import {
  CreateArticleData,
  DeleteArticleResponse,
  UpdateArticleData,
} from './articles.types';

const SLUG_MAX_BASE_LENGTH = 100;

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectRepository(Article)
    private readonly articles: Repository<Article>,
    private readonly i18n: I18nService,
  ) {}

  async create(authorId: string, data: CreateArticleData): Promise<Article> {
    const article = this.articles.create({
      ...data,
      slug: this.generateSlug(data.title),
      authorId,
    });
    try {
      return await this.articles.save(article);
    } catch (error) {
      throwDatabaseError(
        error,
        this.logger,
        this.i18n,
        'Failed to create article',
      );
    }
  }

  /** The slug is kept on update so existing links to the article stay valid. */
  async update(
    userId: string,
    id: string,
    data: UpdateArticleData,
  ): Promise<Article> {
    await this.assertArticleOwner(userId, id);
    if (Object.keys(data).length) {
      try {
        await this.articles.update(id, data);
      } catch (error) {
        throwDatabaseError(
          error,
          this.logger,
          this.i18n,
          'Failed to update article',
        );
      }
    }
    return this.articles.findOneByOrFail({ id });
  }

  async remove(userId: string, id: string): Promise<DeleteArticleResponse> {
    await this.assertArticleOwner(userId, id);
    try {
      await this.articles.delete(id);
    } catch (error) {
      throwDatabaseError(
        error,
        this.logger,
        this.i18n,
        'Failed to delete article',
      );
    }
    return { message: this.i18n.t('article.DELETE_SUCCESS') };
  }

  /** Loads only the owner column; throws 404/403 when not allowed. */
  private async assertArticleOwner(userId: string, id: string): Promise<void> {
    const article = await this.articles.findOne({
      where: { id },
      select: { id: true, authorId: true },
    });
    if (!article) {
      throw new NotFoundException(this.i18n.t('article.ARTICLE_NOT_FOUND'));
    }
    if (article.authorId !== userId) {
      throw new ForbiddenException(this.i18n.t('article.NOT_ARTICLE_AUTHOR'));
    }
  }

  /** e.g. "Bài viết đầu tiên!" -> "bai-viet-dau-tien-3f9a1c" */
  private generateSlug(title: string): string {
    const base = title
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/gi, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // dashes are never consecutive after this
      .replace(/^-|-$/g, '')
      .slice(0, SLUG_MAX_BASE_LENGTH)
      .replace(/-$/, '');
    const suffix = randomBytes(3).toString('hex');
    return base ? `${base}-${suffix}` : suffix;
  }
}
