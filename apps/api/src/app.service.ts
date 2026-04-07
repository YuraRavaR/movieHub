import { Injectable } from '@nestjs/common';
import type { HealthResponse } from './types';

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'moviehub-api',
      timestamp: new Date().toISOString(),
    };
  }
}
