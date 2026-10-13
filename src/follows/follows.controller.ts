import {
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../database/entities';
import { FollowResponseDto } from './dto/follow-response.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';
import { FollowsService } from './follows.service';

@ApiTags('follows')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token.' })
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':id/follow')
  @HttpCode(200)
  @ApiOperation({ summary: 'Follow a user' })
  @ApiOkResponse({ description: 'Followed the user.', type: FollowResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid user id or trying to follow yourself.',
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiConflictResponse({ description: 'Already following this user.' })
  follow(
    @CurrentUser() user: User,
    @Param() params: UserIdParamDto,
  ): Promise<FollowResponseDto> {
    return this.followsService.follow(user.id, params.id);
  }

  @Delete(':id/follow')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiOkResponse({
    description: 'Unfollowed the user.',
    type: FollowResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid user id.' })
  @ApiNotFoundResponse({ description: 'Not following this user.' })
  unfollow(
    @CurrentUser() user: User,
    @Param() params: UserIdParamDto,
  ): Promise<FollowResponseDto> {
    return this.followsService.unfollow(user.id, params.id);
  }
}
