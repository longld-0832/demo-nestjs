import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../database/entities';
import { UpdateProfileDto } from './dto/update-profile.dto';
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
}
