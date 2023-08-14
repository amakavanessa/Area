import { Injectable } from '@nestjs/common';
import {
  Cron,
  CronExpression,
} from '@nestjs/schedule';
import { AuthService } from '../services/auth.service'; // Import your AuthService

@Injectable()
export class RefreshScheduleService {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async refreshTokens(): Promise<void> {
    // console.log('hello world');
  }
}
