import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IdParamDto } from '../common/dto/id-param.dto';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Article, User } from '../database/entities';
import { ArticleFollowsService } from './article-follows.service';
import { ArticlesService } from './articles.service';
import {
  ArticleDetailDto,
  ArticleListResponseDto,
} from './dto/article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('articles')
@Controller('articles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token.' })
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly articleFollowsService: ArticleFollowsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List published articles (paginated)' })
  @ApiOkResponse({
    description: 'A page of articles, newest first.',
    type: ArticleListResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
  findAll(
    @CurrentUser() user: User,
    @Query() query: ListArticlesQueryDto,
  ): Promise<ArticleListResponseDto> {
    return this.articlesService.findAll(user.id, query);
  }

  // Declared before ':id' so "feed" is not parsed as an article id.
  @Get('feed')
  @ApiOperation({
    summary:
      'Feed: articles by followed users and followed articles (paginated)',
  })
  @ApiOkResponse({
    description: 'A page of feed articles, most recently updated first.',
    type: ArticleListResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
  findFeed(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<ArticleListResponseDto> {
    return this.articlesService.findFeed(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an article by id' })
  @ApiOkResponse({ description: 'The article.', type: ArticleDetailDto })
  @ApiBadRequestResponse({ description: 'Invalid article id.' })
  @ApiNotFoundResponse({
    description: "Article not found, or it is another user's draft.",
  })
  findOne(
    @CurrentUser() user: User,
    @Param() params: IdParamDto,
  ): Promise<ArticleDetailDto> {
    return this.articlesService.findOne(user.id, params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an article as the current user' })
  @ApiCreatedResponse({ description: 'The created article.', type: Article })
  @ApiBadRequestResponse({ description: 'Invalid article data.' })
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateArticleDto,
  ): Promise<Article> {
    return this.articlesService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an article of the current user' })
  @ApiOkResponse({ description: 'The updated article.', type: Article })
  @ApiBadRequestResponse({ description: 'Invalid article id or data.' })
  @ApiForbiddenResponse({ description: 'The article belongs to another user.' })
  @ApiNotFoundResponse({ description: 'Article not found.' })
  update(
    @CurrentUser() user: User,
    @Param() params: IdParamDto,
    @Body() dto: UpdateArticleDto,
  ): Promise<Article> {
    return this.articlesService.update(user.id, params.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an article of the current user' })
  @ApiOkResponse({ description: 'Article deleted.', type: MessageResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid article id.' })
  @ApiForbiddenResponse({ description: 'The article belongs to another user.' })
  @ApiNotFoundResponse({ description: 'Article not found.' })
  remove(
    @CurrentUser() user: User,
    @Param() params: IdParamDto,
  ): Promise<MessageResponseDto> {
    return this.articlesService.remove(user.id, params.id);
  }

  @Post(':id/follow')
  @HttpCode(200)
  @ApiOperation({ summary: 'Follow an article to get its updates in the feed' })
  @ApiOkResponse({ description: 'Article followed.', type: MessageResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid article id, or the article is your own.',
  })
  @ApiNotFoundResponse({
    description: "Article not found, or it is another user's draft.",
  })
  @ApiConflictResponse({ description: 'Already following this article.' })
  follow(
    @CurrentUser() user: User,
    @Param() params: IdParamDto,
  ): Promise<MessageResponseDto> {
    return this.articleFollowsService.follow(user.id, params.id);
  }

  @Delete(':id/follow')
  @ApiOperation({ summary: 'Unfollow an article' })
  @ApiOkResponse({
    description: 'Article unfollowed.',
    type: MessageResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid article id.' })
  @ApiNotFoundResponse({ description: 'Not following this article.' })
  unfollow(
    @CurrentUser() user: User,
    @Param() params: IdParamDto,
  ): Promise<MessageResponseDto> {
    return this.articleFollowsService.unfollow(user.id, params.id);
  }
}
