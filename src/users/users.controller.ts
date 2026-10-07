import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../database/entities';
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
}
