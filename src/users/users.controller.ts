import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UPLOAD_HARD_LIMIT } from '../attachments/attachments.constants';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../database/entities';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the current logged in user' })
  @ApiOkResponse({ description: 'Current user information.', type: User })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token.' })
  async getCurrentUser(@Req() req: { user: User }): Promise<User> {
    return await this.usersService.getCurrentUser(req.user.id);
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the profile of the current logged in user' })
  @ApiOkResponse({
    description: 'Updated user information with profile.',
    type: User,
  })
  @ApiConflictResponse({ description: 'Phone number is already registered.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token.' })
  updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ): Promise<User> {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('avatar', { limits: { fileSize: UPLOAD_HARD_LIMIT } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadAvatarDto })
  @ApiOperation({
    summary: 'Upload a new avatar for the current logged in user',
  })
  @ApiOkResponse({
    description: 'Updated user information with the new avatar URL.',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Missing file, unsupported image type or file too large.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token.' })
  updateAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<User> {
    return this.usersService.updateAvatar(user.id, file);
  }
}
