import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { User } from '../database/entities';
import { CommentsService } from './comments.service';
import {
  CommentListResponseDto,
  CommentResponseDto,
} from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { CommentParamDto } from './dto/comment-param.dto';

@ApiTags('comments')
@Controller('articles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token.' })
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':id/comments')
  @ApiOperation({
    summary: 'Create a comment to an article as the current user',
  })
  @ApiCreatedResponse({
    description: 'The created comment',
    type: CommentResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid comment data or article id.' })
  @ApiNotFoundResponse({
    description: "Article not found or it is another user's draft.",
  })
  create(
    @CurrentUser() user: User,
    @Param() params: IdParamDto,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentsService.create(user.id, params.id, dto);
  }

  @Get(':id/comments')
  @ApiOperation({
    summary: 'List comments of an article (paginated)',
  })
  @ApiOkResponse({
    description: 'A list of comments',
    type: CommentListResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid article id or query params.' })
  @ApiNotFoundResponse({
    description: "Article not found or it is another user's draft.",
  })
  findAll(
    @CurrentUser() user: User,
    @Param() params: IdParamDto,
    @Query() query: PaginationQueryDto,
  ): Promise<CommentListResponseDto> {
    return this.commentsService.findAll(user.id, params.id, query);
  }

  @Delete(':id/comments/:commentId')
  @ApiOperation({ summary: 'Delete a comment of the current user' })
  @ApiOkResponse({ description: 'Comment deleted.', type: MessageResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid article id or comment id.' })
  @ApiForbiddenResponse({ description: 'The comment belongs to another user.' })
  @ApiNotFoundResponse({ description: 'Comment not found on this article.' })
  remove(
    @CurrentUser() user: User,
    @Param() params: CommentParamDto,
  ): Promise<MessageResponseDto> {
    return this.commentsService.remove(user.id, params.id, params.commentId);
  }
}
