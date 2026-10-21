import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article, ArticleFollow } from '../database/entities';
import { ArticleFollowsService } from './article-follows.service';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article, ArticleFollow])],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticleFollowsService],
})
export class ArticlesModule {}
