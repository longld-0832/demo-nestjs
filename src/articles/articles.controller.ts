import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { Article, User } from '../database/entities';
import { ArticlesService } from './articles.service';
import {
  ArticleDetailDto,
  ArticleListResponseDto,
} from './dto/article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { DeleteArticleResponseDto } from './dto/delete-article-response.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('articles')
@Controller('articles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token.' })
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

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
  @ApiOkResponse({
    description: 'Article deleted.',
    type: DeleteArticleResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid article id.' })
  @ApiForbiddenResponse({ description: 'The article belongs to another user.' })
  @ApiNotFoundResponse({ description: 'Article not found.' })
  remove(
    @CurrentUser() user: User,
    @Param() params: IdParamDto,
  ): Promise<DeleteArticleResponseDto> {
    return this.articlesService.remove(user.id, params.id);
  }
}
