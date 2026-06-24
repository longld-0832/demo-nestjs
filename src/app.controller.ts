import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Localized hello message' })
  @ApiOkResponse({ description: 'A greeting in the resolved language.' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('greet')
  @ApiOperation({ summary: 'Localized greeting with interpolation' })
  @ApiQuery({ name: 'name', required: false, example: 'Long' })
  @ApiOkResponse({
    description: 'A personalized greeting in the resolved language.',
  })
  greet(@Query('name') name = 'World'): string {
    return this.appService.greet(name);
  }
}
