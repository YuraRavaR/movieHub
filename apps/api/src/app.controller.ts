import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@moviehub/shared-types';
import { AppService } from './app.service';

@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getHealth(): HealthResponse {
    return this.appService.getHealth();
  }
}
